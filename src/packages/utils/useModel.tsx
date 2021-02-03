import { defineComponent, ref, watch } from 'vue';

interface Ref<T> {
  value: T;
}

//相当于自定义的一个hooks
export function useModel<T>(
    getter: () => T,
    emitter: (val: T) => void,
    ) {
    const state = ref(getter()) as Ref<T>
    //侦听值可以是返回值的getter函数也可以是ref（const count = ref(0)）,下面是侦听getter函数
    watch(getter, val  => {
      if(val !== state.value) {
        state.value = val
      }
    })

    return {
      get value() { return state.value },
      set value(val: T) {
        if(state.value !== val) {
          state.value = val;
          emitter(val);
        }
      }
    }
}

// export const TestUserModal = defineComponent({
//   props: {
//     modelValue: {type: String}
//   },
//   emit: {
//     'update: modelValue': (val?: string) => true
//   },
//   setup(props, ctx) {
//     const model = useModel(() => props.modelValue, val => ctx.emit('update:modelValue', val))
//     return () => (
//       <div>
//         自定义的输入框
//         <input type="text" v-model={model.value}/>
//       </div>
//     )
//   }
// })