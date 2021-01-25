<!--
 * @Author: your name
 * @Date: 2021-01-24 17:40:15
 * @LastEditTime: 2021-01-25 23:25:16
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /cowdr-vue-design/src/App.vue
-->
<template>
  <div>
    <h1>这里是主页</h1>
    <visual-editor/>
    <!-- <TestUserModal v-model="val"/> -->
    <!-- val:{{val}} -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {VisualEditor} from './packages/visual-editor'
// import {TestUserModal} from './packages/utils/useModel'


export default defineComponent({
  name: 'App',
  components: {
    VisualEditor,
    // TestUserModal,
  },
  data() {
    return {
      val: '',
    }
  }
});
</script>

<style lang="scss">
  body, html {
    margin: 0px;
    padding: 0px;
  }
</style>
