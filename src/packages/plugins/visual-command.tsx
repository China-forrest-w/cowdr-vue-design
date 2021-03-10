import { useCommander } from './command.plugin'
import { VisualEditorBlock, VisualEditorModelValue } from '../interface'
import deepcopy from 'deepcopy';
export function useVisualCommand({
  focusData,
  updateBlocks,
  dataModel,
  dragStart,
  dragEnd
}: {
  focusData: {
    value: {
      focus: VisualEditorBlock[];
      unFocus: VisualEditorBlock[];
    };
  };
  updateBlocks: (blocks: VisualEditorBlock[]) => void;
  dataModel: { value: VisualEditorModelValue };
  dragStart: { on: (cb: () => void) => void, off: (cb: () => void) => void } | any,
  dragEnd: { on: (cb: () => void) => void, off: (cb: () => void) => void } | any
}) {
  const commander = useCommander();

  commander.registry({
    name: 'delete',
    keyboard: [
      'backspace',
      'delete',
      'ctrl + d',
    ],
    execute: () => {
      console.log('执行删除命令');
      const data = {
        before: dataModel.value.blocks || [],
        after: focusData.value.unFocus,
      }
      return {
        redo: () => {
          console.log('重做删除命令');
          updateBlocks(data.after);
        },
        undo: () => {
          console.log('撤回删除命令');
          updateBlocks(data.before);
        },
      }
    }
  })

  commander.registry({
    name: 'drag',
    init() {
      this.data = {
        // before: dataModel.value.blocks || [],
        // after: focusData.value.unFocus,
        before: null as null | VisualEditorBlock[],
        after: null as null | VisualEditorBlock[]
      }
      const handler = {
        dragStart: () => {
          this.data.before = deepcopy(dataModel.value.blocks || [])
        },
        dragEnd: () => {
          // this.data.after = deepcopy(dataModel.value.blocks || [])
          commander.state.commands.drag();
        }
      }
      dragStart.on(handler.dragStart);
      dragEnd.on(handler.dragEnd);
      return () => {
        dragStart.off(handler.dragStart);
        dragEnd.off(handler.dragEnd);
      }
    },
    execute() {
      let before = this.data.before;
      let after = deepcopy(dataModel.value.blocks || []);
      this.data.after = deepcopy(dataModel.value.blocks || [])
      return {
        undo: () => {
          updateBlocks(deepcopy(before));
        },
        redo: () => {
          updateBlocks(deepcopy(after));
        }
      }
    }
  })
commander.init()

  return {
    undo: () => commander.state.commands.undo(),
    redo: () => commander.state.commands.redo(),
    delete: () => commander.state.commands.delete(),
    drag: () => commander.state.commands.drag()
  }
}