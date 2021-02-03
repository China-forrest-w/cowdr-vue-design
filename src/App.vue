<template>
  <div>
    <h1>这里是主页</h1>
    <visual-editor v-model="jsonData"/>
    <!-- <TestUserModal v-model="val"/>
    val:{{val}} -->
    <!-- <VisualEditorBlockRender/> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {VisualEditor} from './packages/visual-editor'
// import {VisualEditorBlockRender} from './packages/visual-editor-block'
// import {TestUserModal} from './packages/utils/useModel'
export default defineComponent({
  name: 'App',
  components: {
    VisualEditor,
    // TestUserModal,
    // VisualEditorBlockRender
  },
  data() {
    return {
      // val: '',
      jsonData:{
        container:{
          height: 500,
          width: 800,
        },
        blocks:[
          {
            top: 100,
            left: 500,
          },
          {
            top: 0,
            left: 0
          },
        ]
      }
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
