<template>
  <div class="gsap-container">
    <div class="one-layer">
      <div class="banner" :class="bannerClass" :style="bannerStyle">
        <div class="bg-red"></div>
        <div class="outside-extra-content">
          <!-- 跟搜索框并列，不需要撑开 banner 高度，white theme 时候使用 -->
          <div class="filter-bank-list" v-if="contentWrapperContent && isWhiteTheme">
            <p v-for="item in 6" :key="item" @click="bankItemClick(item)">
              {{ contentWrapperContent }} {{ item }}
            </p>
          </div>
        </div>
        <div class="content-wrapper">
          <div class="bg-white"></div>
          <div class="search">
            <input
              v-model="keyword"
              type="text"
              class="input"
              @focus="searchInputFocus"
              @blur="searchInputBlur"
              @input="searchInputInput"
            />
          </div>
          <div class="extra-content">
            <!-- 跟搜索框放同一个节点，可以撑开 banner 高度 -->
            <div class="filter-bank-list" v-if="contentWrapperContent && !isWhiteTheme">
              <p v-for="item in 6" :key="item" @click="bankItemClick(item)">
                {{ contentWrapperContent }} {{ item }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="two-layer" @scroll="twoLayerScroll" ref="twoLayerRef">
      <div class="slot"></div>
      <div class="bank-list" :style="bankListStyle">
        <p v-for="item in 30" :key="item" @click="bankItemClick(item)">工商银行{{ item }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, CSSProperties, nextTick, ref, watch } from 'vue'

const isFocus = ref(false)
const isWhiteTheme = ref(false)
const keyword = ref('')
const contentWrapperContent = ref('')
const bannerStyle = ref<CSSProperties>({})
const bannerClass = computed(() => {
  return {
    // 红色主题 && (聚焦时候 || 有额外内容时候)
    spread: !isWhiteTheme.value && (isFocus.value || contentWrapperContent.value),
    'white-theme': isWhiteTheme.value,
  }
})
const twoLayerRef = ref<HTMLDivElement>()
// bankList 是否显示
const bankListStatus = computed(() => {
  return !(isFocus.value || contentWrapperContent.value)
})
const bankListStyle = ref<CSSProperties>({})

watch(bankListStatus, async (n, o) => {
  if (n) {
    // 显示
    // 要求切换到红色主题，可能觉得好看吧
    setTheme('red')
    bankListStyle.value = {
      display: 'block',
      opacity: 0,
    }
    await nextTick()
    if (twoLayerRef.value) {
      twoLayerRef.value.scrollTop = 0
    }
    bankListStyle.value = {}
  } else {
    // 隐藏
    bankListStyle.value = {
      display: 'none',
    }
  }
})

function searchInputFocus() {
  isFocus.value = true
}
function searchInputBlur() {
  isFocus.value = false
}
function searchInputInput() {
  const l = keyword.value.length
  if (l < 6) {
    contentWrapperContent.value = ''
  } else if (l >= 6) {
    contentWrapperContent.value = '无法识别'
  }
}
function twoLayerScroll(e: Event) {
  // 如果 focus ，列表隐藏，这时候不响应滚动事件
  if (isFocus.value) {
    return
  }
  const target = e.currentTarget as HTMLDivElement
  const st = target?.scrollTop ?? 0
  if (st < 46) {
    setTheme('red')
  } else if (st >= 46 && st < 146) {
    setTheme('white', 46 - st)
  } else {
    setTheme('white')
  }
}
function bankItemClick(idx: number) {
  console.log(idx)
}

function setTheme(val: 'red' | 'white', offset?: number) {
  if (val === 'white') {
    isWhiteTheme.value = true
    if (offset) {
      bannerStyle.value = {
        top: `${offset}px`,
      }
    }
  } else {
    // 红色主题需要重置 offset
    isWhiteTheme.value = false
    bannerStyle.value = {}
  }
}
</script>
<style lang="less">
.gsap-container {
  position: relative;
  height: 100%;
  background-color: rgb(250, 249, 247);
  .one-layer {
    position: absolute;
    top: 0;
    width: 100%;
    .banner {
      transition: top 0.1s;
      position: absolute;
      top: 0;
      width: 100%;
      /* 红色主题 && (聚焦时候 || 有额外内容时候) */
      &.spread {
        .content-wrapper {
          width: 359px;
          box-shadow: 3px 3px 10px gray;
        }
      }
      /* 白色主题 */
      &.white-theme {
        .content-wrapper {
          width: 100%;
          margin-top: 120px;
          box-shadow: 3px 3px 10px gray;
          .bg-white {
            height: 160px;
          }
        }
      }
      /* 红色背景 */
      .bg-red {
        position: absolute;
        top: 0;
        width: 100%;
        height: 166px;
        border-radius: 0px 0px 50% 50%/0px 0px 10px 10px;
        background-color: #f23030;
      }
      /* 输入框区域 */
      .content-wrapper {
        transition: all 0.3s;
        position: relative;
        margin: 140px auto 0;
        width: 327px;
        background: #fff;
        border-radius: 10px;
        .bg-white {
          transition: all 0.3s;
          border-radius: 10px;
          position: absolute;
          top: 16px;
          width: 100%;
          height: 0;
          background: #fff;
          transform: translateY(-100%);
        }
        .search {
          position: relative;
          padding: 10px 20px;
          .input {
            display: block;
            width: 100%;
            height: 54px;
            margin: 0;
            padding: 0;
            border: 0 none;
            background: rgb(184, 181, 181);
            outline: 0 none;
          }
        }
        /* 额外的一些内容 */
        .extra-content {
          transition: all 0.3s;
          background: yellow;
        }
      }
      .outside-extra-content {
        position: absolute;
        top: 184px;
        width: 100%;
        background: #fff;
      }
    }
  }
  .two-layer {
    height: 100%;
    overflow-y: auto;
    .slot {
      height: 244px;
    }
    .bank-list {
      width: 327px;
      margin: 0 auto;
      background-color: #7f7c7c;
      padding-top: 1px;
      p {
        background-color: rgb(179, 229, 229);
        margin: 10px;
      }
    }
  }
  // 根据 theme 会在不同节点展示
  .filter-bank-list {
    max-height: 200px;
    overflow-y: auto;
  }
}
</style>
