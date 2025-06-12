<template>
  <div class="container">
    <GSAP />
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { gsap } from 'gsap'
import GSAP from './components/GSAP.vue'
</script>
<style lang="less" scoped>
.container {
  overflow: hidden;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
<style lang="less">
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
