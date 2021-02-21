# cowdr-vue-design

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

<!----------------------------------------------------##随笔记---------------------------------------------------------------->

# 笔记
segmentfault 和掘金   有原理
看文档自己开发

# vue3学习

<!-- defineComponent时，可以有props, data, methods, attrs, slots, emit...... -->
## 有defineComponent 和 Setup
const MyComponent = defineComponent({
  name: 'tom',
  props: {
     age: 19,
  },
  Setup(props, { attrs, slots, emit}) {   Setup的时候组件实例尚未创建

  }
  data() {
    return { count: 1 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
})

<!-- 但是在Setup中 即 不在defineComponent中，Setup中只能有 props, attrs, slots, emit, 不能有data, methods等  因为执行 setup 时，组件实例尚未被创建。 -->
## 有Setup无defineComponent
export default {
  setup(props, context) {
    // Attribute (非响应式对象)
    console.log(context.attrs)

    // 插槽 (非响应式对象)
    console.log(context.slots)

    // 触发事件 (方法)
    console.log(context.emit)
  }
}
## Setup可结合模板使用

<!-- MyBook.vue -->
<template>
  <div>{{ readersNumber }} {{ book.title }}</div>
</template>

<script>
  import { ref, reactive } from 'vue'

  export default {
    setup() {
      const readersNumber = ref(0)
      const book = reactive({ title: 'Vue 3 Guide' })

      // expose to template
      return {
        readersNumber,
        book
      }
    }
  }
</script>


# Vue3 & React
vue3会自动将监听的事件代理到根节点上，如果react的话要：需要自己监听组件的事件 然后派发出来