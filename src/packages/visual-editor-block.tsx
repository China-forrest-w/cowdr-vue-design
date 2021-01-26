
import { computed, defineComponent, PropType } from 'vue';
import './visual-editor.scss'

import {VisualEditorBlock} from './interface';

export const VisualEditorBlockRender = defineComponent({
  props: {
      block: {type: Object as PropType<VisualEditorBlock>, require: true}
  },
  setup(props, context) {
    const styles = computed(() => ({
      top: `${props?.block?.top}px`,
      left: `${props?.block?.left}px`
    }))
    return () => (
      <div class="visual-editor-block" style={styles.value}>
        这是一条block
      </div>
    )
  }
})