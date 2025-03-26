<template>
  <div
    ref="recordItemRef"
    class="record-item"
    :class="{ 'cannot-click': cannotClick }"
    :style="recordItemStyle"
    @touchstart="touchstart"
    @touchmove="touchmove"
    @touchend="touchend"
    @touchcancel="touchcancel"
  >
    <!-- 补充间距 -->
    <div class="record-wrapper">
      <!-- 主要容器 -->
      <div class="record-container">
        <!-- 分为主要内容区和右侧删除区 -->
        <div class="record-main" :style="style">
          <div class="record-center">
            <!-- 判断公告是否存在 -->
            <span class="record-title">
              {{ props.detail }}
            </span>
          </div>
          <div class="record-right" @click="handleDelete">删除</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, reactive, ref } from 'vue'

const props = withDefaults(
  defineProps<{ detail: string; extra?: any; delete: (extra?: any) => Promise<boolean> }>(),
  {}
)
const data = reactive<{
  isTouching: boolean
  startX: number
  legacyDurationX: number
  durationX: number
}>({
  isTouching: false,
  startX: 0,
  // 可能本来已经有偏移，所以要算上这个
  legacyDurationX: 0,
  durationX: 0,
})
const cannotClick = ref(false)
const style = computed(() => {
  return {
    transition: data.isTouching ? 'unset' : 'transform 0.1s ease-in-out',
    transform: `translateX(${data.durationX}px)`,
  }
})
const recordItemRef = ref<HTMLDivElement>()
const recordItemStyle = ref({})

function touchstart(e: TouchEvent) {
  if (e.touches.length === 1) {
    data.isTouching = true
    data.startX = e.touches[0].clientX
    data.legacyDurationX = data.durationX
  }
}
function touchmove(e: TouchEvent) {
  if (data.isTouching && e.touches.length) {
    data.durationX = e.touches[0].clientX - data.startX + data.legacyDurationX
  }
}
function touchend(e: TouchEvent) {
  data.isTouching = false
  if (data.durationX < -30) {
    data.durationX = -40
  } else {
    data.durationX = 0
  }
}
function touchcancel(e: TouchEvent) {
  data.isTouching = false
  if (data.durationX < -30) {
    data.durationX = -40
  } else {
    data.durationX = 0
  }
}

async function handleDelete() {
  cannotClick.value = true
  const res = await props.delete(props.extra)
  if (res) {
    const h = recordItemRef.value?.clientHeight ?? 0
    recordItemStyle.value = {
      height: `${h}px`,
    }
    requestAnimationFrame(() => {
      recordItemStyle.value = {
        transition: 'all 0.1s ease-in-out',
        height: '0px',
      }
    })
    return
  }
  cannotClick.value = false
}
</script>
<style lang="less" scoped>
@main-color: red;
.flexCenter(@justify: center) {
  display: flex;
  flex-flow: row nowrap;
  justify-content: @justify;
  align-items: center;
}

.list {
  background-color: gray;
  padding: 10px;
}
.cannot-click {
  opacity: 0.5;
  pointer-events: none;
}
.record-item {
  overflow: hidden;
  .record-wrapper {
    padding-top: 12px;
    // 外部容器，固定宽度
    .record-container {
      width: 340px;
      margin: 0 auto;
      overflow: hidden;
      // 这个是滑动部分
      .record-main {
        transform: translateX(0px);
        position: relative;
        // 内容
        .record-center {
          background: #fff;
          border-radius: 4px;
          padding: 14px 18px;
          .record-title {
            font-weight: bold;
            font-size: 17px;
            color: #444444;
            &.expired {
              color: #a9a4a4;
            }
          }
          // 热度
          .record-tag {
            line-height: 1;
            color: #777777;
            font-size: 13px;
            padding: 0 6px;
            .icon {
              color: @main-color;
              margin-right: 4px;
              vertical-align: -5px;
            }
          }
        }
        // 右侧区域
        .record-right {
          .flexCenter(flex-end);
          position: absolute;
          right: -40px;
          top: 0;
          bottom: 0;
          width: 40px;
          .icon {
            font-weight: bold;
            color: @main-color;
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>
