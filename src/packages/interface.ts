export interface VisualEditorModalData {
    top: number;
    left: number;
}

export interface VisualEditorModalValue {
    container: {
        width: number;
        height: number;
    },
    blocks: VisualEditorModalData[]
}