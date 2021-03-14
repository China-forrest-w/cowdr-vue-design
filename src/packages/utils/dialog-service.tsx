import { createApp, defineComponent, reactive, PropType, getCurrentInstance } from 'vue'
import { ElButton, ElDialog, ElInput } from "element-plus";
import { defer } from "@/packages/utils/defer";

export enum DialogServiceEdit {
  input = 'input',
  textarea = 'textarea',
}

interface DialogServiceOption {
  title?: string;
  message?: string | (() => any);
  confirmButton?: boolean;
  cancelButton?: boolean;
  onConfirm?: (editValue?: string) => void;
  onCancel?: () => void;
  editType?: DialogServiceEdit;
  editValue?: string;
  editReadonly?: boolean;
  width?: string;
}

const Component = defineComponent({
  props: {
    option: { type: Object as PropType<DialogServiceOption>, required: true },
  },
  setup(props) {

    const ctx = getCurrentInstance()!
    const state = reactive({
      option: props.option,
      showFlag: false,
    })

    const methods = {
      service: (option: DialogServiceOption) => {
        state.option = option
        state.showFlag = true
      },
    }

    const handler = {
      onConfirm: () => {
        state.option.onConfirm && state.option.onConfirm(state.option.editType ? state.option.editValue : undefined)
        state.showFlag = false
      },
      onCancel: () => {
        state.option.onCancel && state.option.onCancel()
        state.showFlag = false
      },
    }

    Object.assign(ctx.proxy, methods)

    return () => (
      // @ts-ignore
      <ElDialog v-model={state.showFlag}
        title={state.option.title || '提示'}
        width={state.option.width || '600px'}
        {...{ onClose: handler.onCancel } as any}>
        {{
          default: () => <>
            {typeof state.option.message === "function" ? state.option.message() : state.option.message}
            {state.option.editType === DialogServiceEdit.input && (
              <ElInput v-model={state.option.editValue} readonly={state.option.editReadonly} />
            )}
            {state.option.editType === DialogServiceEdit.textarea && (
              <ElInput type="textarea" v-model={state.option.editValue} readonly={state.option.editReadonly} {...{ rows: 20 }} />
            )}
          </>,
          footer: !(state.option.confirmButton || state.option.cancelButton) ? null : () => <>
            {!!state.option.confirmButton && <ElButton {...{ onClick: handler.onConfirm, type: 'primary' } as any}>确认</ElButton>}
            {!!state.option.cancelButton && <ElButton {...{ onClick: handler.onCancel } as any}>取消</ElButton>}
          </>
        }}
      </ElDialog>
    )
  },
})

const DialogService = (() => {
  let ins: any;
  return (option: DialogServiceOption) => {
    if (!ins) {
      const app = createApp(Component, { option })
      const el = document.createElement('div')
      document.body.appendChild(el)
      ins = app.mount(el)
    }
    ins.service(option)
  }
})();

export const $dialog = Object.assign(DialogService, {
  input: (val?: string, option?: DialogServiceOption) => {
    const dfd = defer<string | undefined>()
    option = option || {}
    option.editType = DialogServiceEdit.input
    option.editValue = val
    if (option.editReadonly !== true) {
      option.confirmButton = true;
      option.cancelButton = true;
      option.onConfirm = dfd.resolve;
    }
    DialogService(option);
    return dfd.promise;
  },
  textarea: (val?: string, option?: DialogServiceOption) => {
    const dfd = defer<string | undefined>()
    option = option || {}
    option.editType = DialogServiceEdit.textarea
    option.editValue = val
    if (option.editReadonly !== true) {
      option.confirmButton = true
      option.cancelButton = true
      option.onConfirm = dfd.resolve
    }
    DialogService(option)
    return dfd.promise
  },
})