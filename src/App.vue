<template>
  <div class="list">
    <record-item
      v-for="(item, idx) in data.list"
      :key="idx"
      :detail="item"
      :delete="handleRecordItemDelete"
    >
    </record-item>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import RecordItem from './components/RecordItem.vue'

const data = reactive<{ list: string[] }>({
  list: Array.from({ length: 50 })
    .fill('')
    .map((item, idx) => `嘻嘻嘻嘻嘻嘻 ${idx}`),
})

async function handleRecordItemDelete(idx: number): Promise<boolean> {
  return new Promise(resolve => setTimeout(() => resolve(true)))
}
</script>
<style lang="less" scoped>
.list {
  background-color: gray;
  padding: 10px;
}
</style>
<style lang="less">
html,
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
