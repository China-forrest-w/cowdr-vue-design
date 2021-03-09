/* 工具栏命令操作的定义：撤回(+)、重做(-)、预览、导入、导出、置顶、置底、删除、清空、关闭等。 */
import { reactive } from 'vue';
/* 功能方法 */
export interface CommandExecute {
  undo?: () => void;                   //撤回操作 +
  redo: () => void;                   //执行操作 -
}

/* 命令对象：定义工具栏基本命令的结构 */
export interface Command {
  name: string;                       //命令名称
  keyboard?: string | string[];       //快捷键
  execute: (...args: any[]) => CommandExecute;
  followQueue?: boolean;
}

/* 管理对象： 管理命令 */
// export interface CommandManager {
//     queue: CommandExecute[];
//     current: number;
// }
export function useCommander() {
  const state = reactive({
    current: -1,
    queue: [] as CommandExecute[],
    commands: {} as Record<string, (...args: any[]) => void>
  })

  const registry = (command: Command) => {
    state.commands[command.name] = (...args) => {
      const { undo, redo } = command.execute(...args);
      if (command.followQueue) {
        state.queue.push({ undo, redo })
        state.current += 1
      }
      redo()
    }
  };

  registry({
    name: 'undo',
    keyboard: 'ctrl + z',
    followQueue: false,
    execute: () => {
      return {
        redo: () => {
          const { current } = state;
          if(current === -1) return;
          const { undo } = state.queue[current];
          !!undo && undo();
          state.current -= 1;
        }
      }
    }
  });
  registry({
    name: 'redo',
    keyboard: 'ctrl + shift + z',
    followQueue: false,
    execute: () => {
      return {
        redo: () => {
          const { current } = state;
          if(!state.queue[current]) return;
          const { redo } = state.queue[current];
          redo();
          state.current += 1;
        }
      }
    }
  });
  return {
    state,
    registry,
  }
}