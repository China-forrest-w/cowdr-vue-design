export interface VisualEditorBlock {
    top: number,
    left: number,
}

interface BlockData extends Array<VisualEditorBlock> {
    [index: number]: VisualEditorBlock
}

export interface VisualEditorModelValue {
    container: {
        width: number,
        height: number,
    },
    blocks?: BlockData,
}