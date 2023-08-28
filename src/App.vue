<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <hello-world msg="Welcome to Your Vue.js App" />
</template>

<script lang="ts">
import HelloWorld from './components/HelloWorld.vue'

import { defineComponent } from 'vue'
export default defineComponent({
  components: {
    HelloWorld,
  },
  setup() {
    return {}
  },
})
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
