export interface VisualEditorBlock {
  componentKey: string;                     //组件的类型
  top: number;                              //组件相对画布上方的位置
  left: number;                             //组件相对画布左侧的位置
  adjustPosition: boolean;                  //组件相对鼠标是否居中
  focus: boolean;                           //组件是否为选中状态
}

interface BlockData extends Array<VisualEditorBlock> {
  [index: number]: VisualEditorBlock;
}

export interface VisualEditorModelValue {
  container: {
    width: number;
    height: number;
  };
  blocks?: BlockData;
}

export interface VisualEditorComponent {
  componentKey: string;
  key: string;
  label: string;
  preview: () => JSX.Element;
  render: () => JSX.Element;
}

export function createNewBlock({
  component,
  left,
  top
}: {
  component: VisualEditorComponent;
  left: number;
  top: number;
}): VisualEditorBlock {
  return {
    top,
    left,
    componentKey: component.componentKey,
    adjustPosition: true,
    focus: true
  }
}

export function createVisualEditorConfig() {
  const componentList: VisualEditorComponent[] = [];
  const componentMap: Record<string, VisualEditorComponent> = {}
  return {
    componentList,
    componentMap,
    registry: (key: string, component: Omit<VisualEditorComponent, 'key'>) => {
      const comp = { ...component, key };
      componentList.push(comp);
      componentMap[key] = comp;
    }
  }
}

export type VisualEditorConfig = ReturnType<typeof createVisualEditorConfig>
