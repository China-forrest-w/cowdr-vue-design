
import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import './visual-editor.scss'

import { VisualEditorBlock, VisualEditorConfig } from './interface';

export const VisualEditorBlockRender = defineComponent({
  props: {
    block: { type: Object as PropType<VisualEditorBlock>, require: true },
    config: { type: Object as PropType<VisualEditorConfig>, require: true }
  },
  setup(props, context) {
    const el = ref({} as HTMLDivElement)

    const classes = computed(() => [
      "visual-editor-block",
      {  
        'visual-editor-block-focus': props.block?.focus
      }
    ])
    console.log('classes.value', classes.value);
    const styles = computed(() => ({
      top: `${props?.block?.top}px`,
      left: `${props?.block?.left}px`,
    }))

    /* 拖拽组件至画布后，时鼠标位于组件中间位置 */
    onMounted(() => {
      if (props.block?.adjustPosition) {
        const block = props.block;
        block.left = block.left - el.value.offsetWidth / 2;
        block.top = block.top - el.value.offsetHeight / 2;
        block.adjustPosition = false;
      }
    })
    return () => (
      <div class={classes.value} style={styles.value} ref={el}>
        {props.config?.componentMap[props.block!.componentKey].render()}
      </div>
    )
  }
})