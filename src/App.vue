<template>
  <div>
    <h1>这里是主页</h1>
    <visual-editor v-model="jsonData" :config="VisualConfig" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { VisualEditor } from "./packages/visual-editor";
import { VisualConfig } from "./packages/visual.config";
export default defineComponent({
  name: "App",
  components: {
    VisualEditor,
  },
  data() {
    return {
      VisualConfig,
      jsonData: {
        container: {
          height: 500,
          width: 800,
        },
        blocks: [
          {
            componentKey: "input",
            top: 100,
            left: 500,
            adjustPosition: false,
            focus: true
          },
          {
            componentKey: "button",
            top: 0,
            left: 0,
            adjustPosition: false,
            focus: true,
          },
        ],
      },
    };
  },
});
</script>

<style lang="scss">
body,
html {
  margin: 0px;
  padding: 0px;
}
</style>
