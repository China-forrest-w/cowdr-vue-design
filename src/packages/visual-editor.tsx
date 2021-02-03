
import { computed, defineComponent, PropType } from "vue";
import { VisualEditorModelValue } from "./interface";
import { useModel } from "./utils/useModel";
import { VisualEditorBlockRender } from './visual-editor-block';
import "./visual-editor.scss";

export const VisualEditor = defineComponent({
  props: {
    modelValue: { type: Object as PropType<VisualEditorModelValue>, require: true },
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

    const containerStyles = computed(() => ({
      width: `${dataModel.value.container.width}px`,
      height: `${dataModel.value.container.height}px`
    }))

    return () => (
      <div class="visual-editor">
        <div class="visual-editor-menu">visual-editor-menu</div>
        <div class="visual-editor-head">visual-editor-head</div>
        <div class="visual-editor-operator">visual-editor-operator</div>
        <div class="visual-editor-work">
          <div class="visual-editor-content">
            <div class="visual-editor-container" style={containerStyles.value}>
            {
                !!dataModel.value.blocks && (
                dataModel.value.blocks.map((block,index) => {
                  console.log('index', index)
                 return <VisualEditorBlockRender block={block} key={index}/>
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
