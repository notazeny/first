<template>
  <div v-if="ready" class="app">
    <header class="topbar">
      <div class="brand">
        <span class="logo">📒</span>
        <div class="brand-text">
          <h1>{{ t('appTitle') }}</h1>
          <p class="slogan">{{ t('slogan') }}</p>
        </div>
      </div>
      <nav class="tabs">
        <button class="tab" :class="{ active: view === 'record' }" @click="view = 'record'">
          {{ t('tabRecord') }}
        </button>
        <button class="tab" :class="{ active: view === 'stats' }" @click="view = 'stats'">
          {{ t('tabStats') }}
        </button>
        <button class="tab" :class="{ active: view === 'settings' }" @click="view = 'settings'">
          {{ t('tabSettings') }}
        </button>
      </nav>
    </header>
    <main class="content">
      <RecordView v-if="view === 'record'" />
      <StatsView v-else-if="view === 'stats'" />
      <SettingsView v-else />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RecordView from './views/RecordView.vue'
import StatsView from './views/StatsView.vue'
import SettingsView from './views/SettingsView.vue'
import { i18n, t } from './i18n'

const ready = ref(false)
const view = ref('record')

// 启动时读取上次选择的界面语言（未设置过则默认中文）
onMounted(async () => {
  const saved = await window.heima.getSetting('locale')
  if (saved === 'zh' || saved === 'en') i18n.locale = saved
  ready.value = true
})
</script>

<style>
/* 全局基础样式与共用样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #4a6cf7;
  --primary-light: #eef2ff;
  --expense: #e5484d;
  --income: #2f9e63;
  --text: #2d3436;
  --text-light: #636e72;
  --bg: #f5f6fa;
  --card: #ffffff;
  --border: #e4e7ee;
  --danger: #e5484d;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

.app {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 16px 40px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 4px 16px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  font-size: 34px;
}

.brand-text h1 {
  font-size: 22px;
  font-weight: 600;
}

.slogan {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 2px;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tab {
  border: none;
  background: transparent;
  padding: 8px 18px;
  font-size: 15px;
  border-radius: 999px;
  color: var(--text-light);
  cursor: pointer;
  font-family: inherit;
}

.tab:hover {
  color: var(--text);
}

.tab.active {
  background: var(--primary);
  color: #fff;
  font-weight: 500;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: var(--card);
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(20, 30, 60, 0.06);
}

/* 表单 */
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.field label {
  font-size: 13px;
  color: var(--text-light);
}

.field input[type='text'],
.field input[type='date'],
.field input[type='month'] {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text);
  background: #fff;
  outline: none;
}

.field input:focus {
  border-color: var(--primary);
}

/* 按钮 */
.primary {
  border: none;
  background: var(--primary);
  color: #fff;
  font-size: 15px;
  padding: 10px 28px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}

.primary:hover {
  opacity: 0.9;
}

.ghost {
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}

.ghost:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.ghost.small {
  font-size: 13px;
  padding: 4px 10px;
}

.danger {
  border: 1px solid transparent;
  background: transparent;
  color: var(--danger);
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-family: inherit;
}

.danger:hover {
  background: #fdecec;
}
</style>
