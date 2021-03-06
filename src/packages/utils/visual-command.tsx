import { useCommander } from '../plugins/command.plugin'
import { VisualEditorBlock, VisualEditorModelValue } from '@/packages/interface'
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
  dragStart: { on: (cb: () => void) => void; off: (cb: () => void) => void };
  dragEnd: { on: (cb: () => void) => void; off: (cb: () => void) => void };
}) {
  const commander = useCommander();

  commander.registry({
    name: 'delete',
    keyboard: [
      'backspace',
      'delete',
      'ctrl+d',
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

  /*更新 modelValue*/
  commander.registry({
    name: 'updateModelValue',
    execute: (newModelValue: VisualEditorModelValue) => {
      let before: undefined | VisualEditorModelValue = undefined
      let after: undefined | VisualEditorModelValue = undefined
      return {
        redo: () => {
          if (!before && !after) {
            before = deepcopy(dataModel.value)
            dataModel.value = deepcopy(newModelValue)
            after = deepcopy(newModelValue)
          } else {
            dataModel.value = deepcopy(after!)
          }
        },
        undo: () => dataModel.value = deepcopy(before!),
      }
    },
  });
  /*拖拽*/
  commander.registry({
    name: 'drag',
    init() {
      this.data = {
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
      const before = this.data.before;
      const after = deepcopy(dataModel.value.blocks || []);
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

  commander.registry({
    name: 'clear',
    execute() {
      const data = {
        before: deepcopy(dataModel.value.blocks || []),
        after: deepcopy([])
      }
      return {
        undo: () => {
          updateBlocks(deepcopy(data.before))
        },
        redo: () => {
          updateBlocks(deepcopy(data.after) || [])
        }
      }
    }
  })
  /* 上面注册完命令之后，下面对命令的快捷键进行监听    /* 执行键盘监听函数，即监听快捷键 */
  commander.keyboardInit()
  return {
    undo: () => commander.state.commands.undo(),
    redo: () => commander.state.commands.redo(),
    delete: () => commander.state.commands.delete(),
    drag: () => commander.state.commands.drag(),
    clear: () => commander.state.commands.clear(),
    updateModelValue: (newModelValue: VisualEditorModelValue) => commander.state.commands.updateModelValue(newModelValue),
  }
}