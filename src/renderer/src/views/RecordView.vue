<template>
  <section class="record-view">
    <!-- 记一笔表单 -->
    <form class="card form" @submit.prevent="save">
      <div class="type-tabs">
        <button
          type="button"
          class="type-tab"
          :class="{ active: type === 'expense' }"
          @click="switchType('expense')"
        >
          − {{ t('typeExpense') }}
        </button>
        <button
          type="button"
          class="type-tab"
          :class="{ active: type === 'income' }"
          @click="switchType('income')"
        >
          + {{ t('typeIncome') }}
        </button>
      </div>

      <div class="amount-row">
        <span class="currency">¥</span>
        <input v-model="amount" type="text" inputmode="decimal" :placeholder="t('amountPlaceholder')" />
      </div>

      <div class="field">
        <label>{{ t('categoryLabel') }}</label>
        <div class="chips">
          <button
            type="button"
            class="chip"
            :class="{ active: category1 === c.id }"
            v-for="c in categories"
            :key="c.id"
            @click="selectCategory1(c.id)"
          >
            {{ c.emoji }} {{ labelOf(c) }}
          </button>
        </div>
        <div v-if="selectedCategory1" class="chips sub">
          <button
            type="button"
            class="chip"
            :class="{ active: category2 === s.id }"
            v-for="s in selectedCategory1.children"
            :key="s.id"
            @click="category2 = s.id"
          >
            {{ labelOf(s) }}
          </button>
        </div>
        <p v-else class="hint">{{ t('categoryHint') }}</p>
      </div>

      <div class="form-row">
        <div class="field date-field">
          <label>{{ t('dateLabel') }}</label>
          <input type="date" v-model="date" />
        </div>
        <div class="field note-field">
          <label>{{ t('noteLabel') }}</label>
          <input type="text" v-model="note" :placeholder="t('notePlaceholder')" />
        </div>
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <div class="actions">
        <button type="submit" class="primary">
          {{ editingId ? t('btnUpdate') : t('btnSave') }}
        </button>
        <button v-if="editingId" type="button" class="ghost" @click="cancelEdit">
          {{ t('btnCancel') }}
        </button>
        <span v-if="savedTip" class="saved-tip">✓ {{ t('recordSaved') }}</span>
      </div>
    </form>

    <!-- 明细列表 -->
    <section class="card list">
      <div class="list-head">
        <div class="filters">
          <input type="month" v-model="month" @change="load" />
          <button class="ghost small" @click="showAllMonths">{{ t('btnAllMonths') }}</button>
        </div>
      </div>

      <!-- 收支合计：固定在列表上方，随筛选联动 -->
      <div class="totals">
        <div class="total-item">
          <span class="total-label">{{ t('totalExpense') }}</span>
          <span class="total-value total-expense">¥{{ money(totalExpense) }}</span>
        </div>
        <div class="total-item">
          <span class="total-label">{{ t('totalIncome') }}</span>
          <span class="total-value total-income">¥{{ money(totalIncome) }}</span>
        </div>
      </div>

      <ul class="items">
        <li v-for="rec in records" :key="rec.id" class="item">
          <span class="item-emoji">{{ emojiOf(rec) }}</span>
          <div class="item-main">
            <div class="item-title">
              {{ labelOf(findCategory1(rec)) }} · {{ labelOf(findCategory2(rec)) }}
            </div>
            <div class="item-sub">
              {{ rec.date }}<span v-if="rec.note"> · {{ rec.note }}</span>
            </div>
          </div>
          <div class="item-amount" :class="rec.type">
            {{ rec.type === 'income' ? '+' : '−' }}¥{{ money(rec.amount) }}
          </div>
          <div class="item-actions">
            <button class="ghost small" @click="editRecord(rec)">{{ t('btnEdit') }}</button>
            <button class="danger" @click="removeRecord(rec)">
              {{ confirmId === rec.id ? t('btnConfirmDelete') : t('btnDelete') }}
            </button>
          </div>
        </li>
        <li v-if="!records.length" class="empty">{{ t('emptyList') }}</li>
      </ul>

    </section>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, findCategory } from '../data/categories'
import { t, labelOf } from '../i18n'

// —— 表单状态 ——
const type = ref('expense')
const amount = ref('')
const category1 = ref(null)
const category2 = ref(null)
const date = ref(todayStr())
const note = ref('')
const error = ref('')
const savedTip = ref(false)
const editingId = ref(null) // 非空表示正在编辑该记录
const confirmId = ref(null) // 删除二次确认：记录待确认删除的记录

// —— 列表状态 ——
const records = ref([])
const month = ref(currentMonth()) // 月份筛选，空字符串表示全部

const categories = computed(() => (type.value === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES))
const selectedCategory1 = computed(() => categories.value.find((c) => c.id === category1.value) || null)

// —— 工具函数 ——
function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function currentMonth() {
  return todayStr().slice(0, 7)
}
// 金额展示：分 → 元（两位小数）
function money(cents) {
  return (cents / 100).toFixed(2)
}

function switchType(next) {
  type.value = next
  category1.value = null
  category2.value = null
}
function selectCategory1(id) {
  category1.value = id
  category2.value = null
}
function findCategory1(rec) {
  return findCategory(rec.type, rec.category1)
}
function findCategory2(rec) {
  const c1 = findCategory1(rec)
  return c1 ? c1.children.find((c) => c.id === rec.category2) : null
}
function emojiOf(rec) {
  const c1 = findCategory1(rec)
  return c1 ? c1.emoji : '📦'
}

// —— 列表加载与月份筛选 ——
async function load() {
  records.value = await window.heima.listRecords(month.value || null)
}
function showAllMonths() {
  month.value = ''
  load()
}

// —— 保存（新增 / 修改）——
async function save() {
  error.value = ''
  savedTip.value = false

  const text = amount.value.trim()
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    error.value = t('errAmount')
    return
  }
  const cents = Math.round(parseFloat(text) * 100)
  if (cents <= 0 || cents > 999999999) {
    error.value = t('errAmount')
    return
  }
  if (!category1.value || !category2.value) {
    error.value = t('errCategory')
    return
  }

  const payload = {
    type: type.value,
    amount: cents,
    category1: category1.value,
    category2: category2.value,
    date: date.value,
    note: note.value.trim()
  }
  if (editingId.value) {
    await window.heima.updateRecord(editingId.value, payload)
  } else {
    await window.heima.addRecord(payload)
  }

  savedTip.value = true
  setTimeout(() => (savedTip.value = false), 1500)
  resetForm()
  load()
}

function resetForm() {
  amount.value = ''
  category1.value = null
  category2.value = null
  date.value = todayStr()
  note.value = ''
  editingId.value = null
  confirmId.value = null
}
function cancelEdit() {
  resetForm()
  error.value = ''
}
function editRecord(rec) {
  editingId.value = rec.id
  type.value = rec.type
  amount.value = money(rec.amount)
  category1.value = rec.category1
  category2.value = rec.category2
  date.value = rec.date
  note.value = rec.note
  error.value = ''
  confirmId.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
// 删除采用"点两次"确认，避免误删
async function removeRecord(rec) {
  if (confirmId.value !== rec.id) {
    confirmId.value = rec.id
    return
  }
  confirmId.value = null
  await window.heima.removeRecord(rec.id)
  load()
}

const totalExpense = computed(() =>
  records.value.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0)
)
const totalIncome = computed(() =>
  records.value.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0)
)

onMounted(load)
</script>

<style scoped>
.type-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.type-tab {
  flex: 1;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  font-size: 15px;
  cursor: pointer;
  font-family: inherit;
  color: var(--text-light);
}

.type-tab.active {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
  font-weight: 500;
}

.amount-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 14px;
}

.amount-row:focus-within {
  border-color: var(--primary);
}

.currency {
  font-size: 22px;
  color: var(--text-light);
}

.amount-row input {
  border: none;
  outline: none;
  font-size: 28px;
  font-weight: 600;
  width: 100%;
  font-family: inherit;
  color: var(--text);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chips.sub {
  margin-top: 10px;
  padding: 10px;
  background: var(--bg);
  border-radius: 10px;
}

.chip {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  color: var(--text);
}

.chip:hover {
  border-color: var(--primary);
}

.chip.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.hint {
  font-size: 12px;
  color: var(--text-light);
}

.form-row {
  display: flex;
  gap: 14px;
}

.date-field {
  flex: 1;
}

.note-field {
  flex: 2;
}

.error {
  color: var(--danger);
  font-size: 13px;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.saved-tip {
  color: var(--income);
  font-size: 14px;
}

.list-head {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.filters {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filters input[type='month'] {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  font-family: inherit;
  font-size: 14px;
  color: var(--text);
  outline: none;
}

.items {
  list-style: none;
}

.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 4px;
  border-bottom: 1px solid var(--border);
}

.item:last-child {
  border-bottom: none;
}

.item-emoji {
  font-size: 26px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  border-radius: 10px;
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
}

.item-sub {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-amount {
  font-size: 15px;
  font-weight: 600;
  min-width: 100px;
  text-align: right;
}

.item-amount.expense {
  color: var(--expense);
}

.item-amount.income {
  color: var(--income);
}

.item-actions {
  display: flex;
  gap: 6px;
}

.empty {
  text-align: center;
  color: var(--text-light);
  padding: 40px 0;
  font-size: 14px;
}

/* 收支合计：醒目的汇总条，位于列表上方 */
.totals {
  display: flex;
  gap: 32px;
  background: var(--bg);
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 8px;
}

.total-item {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.total-label {
  font-size: 13px;
  color: var(--text-light);
}

.total-value {
  font-size: 18px;
  font-weight: 700;
}

.total-expense {
  color: var(--expense);
}

.total-income {
  color: var(--income);
}
</style>
