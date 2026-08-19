<template>
  <section class="settings-view">
    <div class="card">
      <h2 class="settings-title">{{ t('langLabel') }}</h2>
      <div class="lang-options">
        <label class="lang-option" :class="{ active: i18n.locale === 'zh' }">
          <input type="radio" name="locale" value="zh" :checked="i18n.locale === 'zh'" @change="choose('zh')" />
          <span>中文</span>
        </label>
        <label class="lang-option" :class="{ active: i18n.locale === 'en' }">
          <input type="radio" name="locale" value="en" :checked="i18n.locale === 'en'" @change="choose('en')" />
          <span>English</span>
        </label>
      </div>
    </div>
  </section>
</template>

<script setup>
import { i18n, t } from '../i18n'

// 切换界面语言：立即生效，并存入数据库，下次启动自动沿用
async function choose(locale) {
  i18n.locale = locale
  await window.heima.setSetting('locale', locale)
}
</script>

<style scoped>
.settings-title {
  font-size: 16px;
  margin-bottom: 14px;
}

.lang-options {
  display: flex;
  gap: 12px;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 14px;
}

.lang-option.active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary);
}

.lang-option input {
  accent-color: var(--primary);
}
</style>
