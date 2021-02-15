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

interface VisualEditorComponent {
  key: string;
  label: string;
  preview: () => JSX.Element;
  render: () => JSX.Element;
}

export function createVisualEditorConfig() {
  const componentList: VisualEditorComponent[] = [];
  const componentMap: Record<string, VisualEditorComponent> = {}
  return {
      registry: (key: string, component: Omit<VisualEditorComponent, 'key'>) => {
        let comp = {...component, key};
        componentList.push(comp);
        componentMap[key] = comp;
      }
    }
  }

export type VisualEditorConfig = ReturnType<typeof createVisualEditorConfig>
