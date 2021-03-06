/* 工具栏命令操作的定义：撤回(+)、重做(-)、预览、导入、导出、置顶、置底、删除、清空、关闭等。 */
import { onUnmounted, reactive } from 'vue';
import { KEYBOARDCODE } from './keyboard-code';
/* 功能方法 */
export interface CommandExecute {
  undo?: () => void;                                                                    //撤回操作 +
  redo: () => void;                                                                     //执行操作 -
}

/* 命令对象：定义工具栏基本命令的结构 */
export interface Command {
  name: string;                                                                         //命令名称：唯一标识
  keyboard?: string | string[];                                                         //命令监听的快捷键
  execute: (...args: any[]) => CommandExecute;                                          //执行命令的函数
  followQueue?: boolean;                                                                //命令执行后是否需要将命令执行得到的undo,redo存入命令队列
  init?: () => (() => void | undefined);                                                //命令初始化函数
  data?: any; //命令缓存所需要的数据
}

/* 管理对象： 管理命令 */
export function useCommander() {
  const state = reactive({
    current: -1,
    queue: [] as CommandExecute[],
    commandArray: [] as Command[],
    commands: {} as Record<string, (...args: any[]) => void>,
    destroyList: [] as (() => void | undefined)[],
  })

  const registry = (command: Command) => {
    state.commandArray.push(command);
    state.commands[command.name] = (...args) => {
      const { undo, redo } = command.execute(...args);
      /* 触发事件即执行redo(重做) */
      redo();
      if (command.followQueue === false) {
        return;
      }
      let { queue } = state;
      const { current } = state;
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }
      queue.push({ undo, redo });
      state.current = current + 1;
    }
    command.init && command.init();
  };

  /* 键盘实现的快捷键使用工具栏命令： 通过闭包实现 */
  const keyboardEvent = (() => {
    const onKeydown = (e: KeyboardEvent) => {
      /* 当获得焦点的元素是body时，按下键盘快捷键时要做的一些事情 */
      if (document.activeElement !== document.body) {
        return;
      }
      const { keyCode, ctrlKey, shiftKey, altKey, metaKey } = e;
      // console.log('e', e);
      const keyStringContainer: string[] = [];
      (ctrlKey || metaKey) && keyStringContainer.push('ctrl');
      shiftKey && keyStringContainer.push('shift');
      altKey && keyStringContainer.push('alt');
      keyStringContainer.push(KEYBOARDCODE[keyCode]);
      const keyName = keyStringContainer.join('+');
      console.log("keyName",keyName);
      state.commandArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return;
        const keys = Array.isArray(keyboard) ? keyboard : [keyboard]
        if (keys.indexOf(keyName) > -1) {
          state.commands[name]();
          e.stopPropagation();
          e.preventDefault();
        }
      })
    }
    /* 进行keydown监听并且返回remove监听方法 */
    const monitorAndRemoveKeyboard = () => {
      window.addEventListener("keydown", onKeydown);
      return () => window.removeEventListener('keydown', onKeydown);
    }
    return monitorAndRemoveKeyboard;
  })();

  const keyboardInit = () => {
    const onKeydown = (e: KeyboardEvent) => {
      /* 按下键盘快捷键时要做的一些事情 */
      console.log("监听到键盘事件");
    }
    window.addEventListener('keydown', onKeydown)
    state.commandArray.forEach(command => !!command.init && state.destroyList.push(command.init()));
    state.destroyList.push(keyboardEvent());
    state.destroyList.push(() => { console.log('window.removeEventListener( onKeydown)'), window.removeEventListener('keydown', onKeydown) });
  }

  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    followQueue: false,
    execute: () => {
      return {
        redo: () => {
          const { current } = state;
          if (current === -1) return;
          const { undo } = state.queue[current];
          !!undo && undo();
          state.current -= 1;
        }
      }
    }
  });
  registry({
    name: 'redo',
    keyboard: 'ctrl+shift+z',
    followQueue: false,
    execute: () => {
      return {
        redo: () => {
          const queueItem = state.queue[state.current + 1];
          if (queueItem) {
            queueItem.redo();
            state.current++;
          }
        }
      }
    }
  });
  onUnmounted(() => state.destroyList.forEach(fn => !!fn && fn()));
  return {
    state,
    registry,
    keyboardInit
  }
}