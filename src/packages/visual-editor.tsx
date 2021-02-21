
import { computed, defineComponent, PropType, ref } from "vue";
import { VisualEditorModelValue, VisualEditorConfig, VisualEditorComponent, createNewBlock, VisualEditorBlock } from "./interface";
import { useModel } from "./utils/useModel";
import { VisualEditorBlockRender } from './visual-editor-block';
import "./visual-editor.scss";

export const VisualEditor = defineComponent({
  props: {
    modelValue: { type: Object as PropType<VisualEditorModelValue>, require: true },
    config: { type: Object as PropType<VisualEditorConfig>, require: true }
  },
  emit: {
    "update-modelValue": (val?: VisualEditorModelValue) => true,
  },
  components: {
    VisualEditorBlockRender
  },
  setup(props, ctx) {
    const dataModel = useModel(
      () => props.modelValue as VisualEditorModelValue,
      (val: VisualEditorModelValue) => ctx.emit("update-modelValue", val)
    );

    const containerRef = ref({} as HTMLDivElement)

    const containerStyles = computed(() => ({
      width: `${dataModel.value.container.width}px`,
      height: `${dataModel.value.container.height}px`
    }))

    const menuDraggier = {
      dragComponent: null as (null | VisualEditorComponent),
      containerHandler: {
        /* 拖拽菜单组件： 进入、悬空、离开、完毕动作 */
        dragenter: (e: DragEvent) => { e.dataTransfer!.dropEffect = 'move' },
        /* 拖拽组件时鼠标在画布中移动，阻止默认时间 */
        dragover: (e: DragEvent) => { e.preventDefault() },
        /* 这里注意：离开画布时的鼠标状态不变的问题  */
        dragleave: (e: DragEvent) => { e.dataTransfer!.dropEffect = 'none' },
        drop: (e: DragEvent) => {
          const blocks = dataModel.value.blocks || [];
          blocks.push(createNewBlock({
            component: menuDraggier.dragComponent!,
            top: e.offsetY,
            left: e.offsetX,
          }))
          dataModel.value = { ...dataModel.value, blocks: blocks }
        }
      },
      blockHandler: {
        /* 拖拽菜单组件时动作开始 */
        dragstart: (currentComponent: VisualEditorComponent) => {
          menuDraggier.dragComponent = currentComponent;
          containerRef.value.addEventListener("dragenter", menuDraggier.containerHandler.dragenter);
          containerRef.value.addEventListener('dragover', menuDraggier.containerHandler.dragover);
          containerRef.value.addEventListener('dragleave', menuDraggier.containerHandler.dragleave);
          containerRef.value.addEventListener('drop', menuDraggier.containerHandler.drop);
        },
        /* 拖拽菜单组件结束 */
        dragend: (e: DragEvent) => {
          containerRef.value.removeEventListener('dragenter', menuDraggier.containerHandler.dragenter);
          containerRef.value, removeEventListener('dragover', menuDraggier.containerHandler.dragover);
          containerRef.value.removeEventListener('dragleave', menuDraggier.containerHandler.dragleave);
          containerRef.value.removeEventListener('drop', menuDraggier.containerHandler.drop);
          menuDraggier.dragComponent = null;
        }
      }
    }

    const focusHandler = () => {
      return {
        container: {
          onMousedown: (e: MouseEvent) => {
            (dataModel.value.blocks || []).forEach(block => block.focus = false);
          },
        },
        block: {
          onMousedown: (e: MouseEvent, block: VisualEditorBlock) => {
            e.stopPropagation();
            block.focus = !block.focus;
          }
        }
      }
    }
    return () => (
      <div class="visual-editor">
        <div class="visual-editor-menu">{
          props?.config?.componentList.map(component =>
            <div class="visual-editor-menu-item"
              draggable
              onDragend={menuDraggier.blockHandler.dragend}
              onDragstart={() => menuDraggier.blockHandler.dragstart(component)}
            >
              <span class="visual-editor-menu-item-label">{component.label}</span>
              <div class="visual-editor-item-content">
                {component.preview()}
              </div>
            </div>)
        }</div>
        <div class="visual-editor-head">visual-editor-head</div>
        <div class="visual-editor-operator">visual-editor-operator</div>
        <div class="visual-editor-work">
          <div class="visual-editor-content">
            <div class="visual-editor-container"
              style={containerStyles.value}
              ref={containerRef}
              {...focusHandler().container}
            >
              {
                !!dataModel.value.blocks && (
                  dataModel.value.blocks.map((block, index) => {
                    return <VisualEditorBlockRender
                      block={block}
                      key={index}
                      config={props.config}
                      {...{
                        onMousedown: (e: MouseEvent) => focusHandler().block.onMousedown(e, block)
                      }}
                    />
                  }
                  )
                )
              }
            </div>
          </div>
        </div>
      </div>
    );
  },
});
