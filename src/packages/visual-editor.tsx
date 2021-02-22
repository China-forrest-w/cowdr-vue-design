
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

    /* 通过自定义hooks实现双向绑定功能，获得画布以及画布中组件的数据 */
    const dataModel = useModel(() => props.modelValue as VisualEditorModelValue, (val: VisualEditorModelValue) => ctx.emit("update-modelValue", val));

    /* 画布container节点 dom对象的引用（以此用来监控拖拽的诸多事件） */
    const containerRef = ref({} as HTMLDivElement)

    /* 控制画布样式（大小） */
    const containerStyles = computed(() => ({
      width: `${dataModel.value.container.width}px`,
      height: `${dataModel.value.container.height}px`
    }))

    /* 计算选中与未选中组件(block)的数据 */
    const focusData = computed(() => {
      const focus: VisualEditorBlock[] = [];
      const unFocus: VisualEditorBlock[] = [];
      (dataModel.value.blocks || []).forEach(block => (block.focus ? focus : unFocus).push(block))
      return {
        focus,               //选中组件的数据
        unFocus              //未选中组件的数据
      }
    })

    /* 定义对外暴露的方法 */
    const method = {
      // 清除没有被点中组件的选中样式状态
      clearFocus: (clickBlock?: VisualEditorBlock) => {
        (dataModel.value.blocks || []).forEach(block => {
          if (block === clickBlock && clickBlock.focus === true) {
            clickBlock.focus = true;
          }
          if (clickBlock !== undefined && clickBlock.focus === false) {
            clickBlock.focus = true;
          }
        });
      }
    }

    /* 拖拽的一些方法 */
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

    /* 处理组件在画布中拖拽的相关动作 */
    const blockDraggier = (() => {
      let dragState = {
        startX: 0,
        startY: 0,
        startPos: [] as { left: number; top: number }[]
      };

      const mousemove = (e: MouseEvent) => {
        const durX = e.clientX - dragState.startX;        //偏移量X
        const durY = e.clientY - dragState.startY;        //偏移量Y
        focusData.value.focus.forEach((block, index) => {
          block.top = dragState.startPos[index].top + durY;
          block.left = dragState.startPos[index].left + durX;
        })
      }

      const mouseup = () => {
        document.removeEventListener('mousemove', mousemove);
        document.removeEventListener('mouseup', mouseup);
      }

      const mousedown = (e: MouseEvent) => {
        dragState = {
          startX: e.clientX,
          startY: e.clientY,
          startPos: focusData.value.focus.map(({ top, left }) => ({ top, left }))
        }
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
      }
      return { mousedown };
    })();

    /* 点击当前组件时，控制当前组件和其他组件的选中状态 */
    const focusHandler = () => {
      return {
        container: {
          onMousedown: (e: MouseEvent) => {
            // method.clearFocus();
            (dataModel.value.blocks || []).forEach(block => {
              block.focus = false;
            })
          },
        },
        block: {
          onMousedown: (e: MouseEvent, block: VisualEditorBlock) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.shiftKey) {
              block.focus = !block.focus;
            } else {
              method.clearFocus(block);
            }
            blockDraggier.mousedown(e)
          }
        }
      }
    }

    return () => (
      <div class="visual-editor">
        <div class="visual-editor-menu">
          {props?.config?.componentList.map(component =>
            <span class="visual-editor-menu-item"
              draggable
              onDragend={menuDraggier.blockHandler.dragend}
              onDragstart={() => menuDraggier.blockHandler.dragstart(component)}
            >
              <span class="visual-editor-menu-item-label">{component.label}</span>
              <span class="visual-editor-item-content">
                {component.preview()}
              </span>
            </span>)
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
