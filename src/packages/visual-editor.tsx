import { defineComponent, PropType } from 'vue';
import { VisualEditorModalValue } from './interface';
import './visual-editor.scss';


export  const VisualEditor = defineComponent({
    props: {
        modelValue: {type: Object as PropType<VisualEditorModalValue>},
    },
    emit: {
        'update-modelValue': (val?: VisualEditorModalValue) => true
    },
    setup(props: any) {
        return () =>
        <div class="visual-editor">
            <div class="visual-editor-menu">
            visual-editor-menu
            </div>
            <div class="visual-editor-head">
            visual-editor-head
            </div>
            <div class="visual-editor-operator">
            visual-editor-operator
            </div>
            <div class="visual-editor-work">
            <div class="visual-editor-content">
                visual-editor-body
            </div>
            </div>
        </div>

    }
})