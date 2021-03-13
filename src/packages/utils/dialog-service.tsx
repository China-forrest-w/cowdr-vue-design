import { defer } from '@/packages/utils/defer';
import { createApp, defineComponent, getCurrentInstance, PropType, reactive } from 'vue';
import { ElButton, ElDialog, ElInput } from "element-plus";

enum DialogServiceEditType {
  textarea = "textarea",
  input = "input",
}

interface DialogServiceOption {
  editType: DialogServiceEditType;
  editReadonly?: boolean;
  editValue?: string | null;
  onConfirm: (val?: string | null) => void;
}
const ServiceComponent = defineComponent({
  props: {
    option: { type: Object as PropType<DialogServiceOption>, require: true }
  },
  setup(props) {
    const ctx = getCurrentInstance();

    const state = reactive({
      option: props.option,
      editValue: null as undefined | null | string,
      showFlag: false,
    })

    const methods = {
      service: (option: DialogServiceOption) => {
        state.option = option;
        state.editValue = option.editValue
      },
      show: () => {
        state.showFlag = true;
      },
      hide: () => {
        state.showFlag = false;
      }
    }

    const handler = {
      onConfirm: () => {
        state?.option?.onConfirm(state.editValue)
        methods.show();
      },
      onCancel: () => {
        methods.hide();
      }
    }

    Object.assign(ctx?.proxy, methods);

    return () => {
      // @ts-ignore
      <ElDialog v-model={state.showFlag}>
        {{
          default: () => (<div>
            {
              state?.option?.editType === DialogServiceEditType.textarea ?
                (
                  <ElInput type="textarea" {...{ rows: 20 }} v-model={state.editValue} />
                ) : (
                  <ElInput v-model={state.editValue} />
                )
            }
          </div>),
          footer: () => <div>
            <ElButton {...{ onClick: handler.onCancel } as any}>取消</ElButton>
            <ElButton {...{ onClick: handler.onConfirm } as any}>确定</ElButton>
          </div>
        }}
      </ElDialog>
    }
  },
})

const DialogService = (() => {
  let ins: any;
  return (option: DialogServiceOption) => {
      if (!ins) {
          const app = createApp(ServiceComponent, {option})
          const el = document.createElement('div')
          document.body.appendChild(el)
          ins = app.mount(el)
      }
      ins.service(option)
  }
})();

export const $$dialog = Object.assign(DialogService, {
  input: (initValue?: string, option?: DialogServiceOption) => {
    const dfd = defer<string | null | undefined>();
    const opt: DialogServiceOption = option || { editType: DialogServiceEditType.input, onConfirm: dfd.resolve }
    console.log('input1')
    DialogService(opt);
    console.log('input2')

    return dfd.promise;
  },
  textarea: (initValue?: string, option?: DialogServiceOption) => {
    const dfd = defer<string | null | undefined>();
    const opt: DialogServiceOption = option || { editType: DialogServiceEditType.textarea, onConfirm: dfd.resolve }
    DialogService(opt);
    return dfd.promise;
  }
})