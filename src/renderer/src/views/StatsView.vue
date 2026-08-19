<template>
  <section class="stats-view">
    <div v-if="!allRecords.length" class="card empty-card">{{ t('statsNoData') }}</div>

    <template v-else>
      <!-- 月度汇总：近 12 个月柱状图 -->
      <div class="card">
        <div class="chart-head">
          <h2>{{ t('statsTrend') }}</h2>
          <div class="chart-toggles">
            <button
              class="toggle"
              :class="{ active: trendType === 'expense' }"
              @click="trendType = 'expense'"
            >
              {{ t('typeExpense') }}
            </button>
            <button
              class="toggle"
              :class="{ active: trendType === 'income' }"
              @click="trendType = 'income'"
            >
              {{ t('typeIncome') }}
            </button>
          </div>
        </div>
        <div ref="trendEl" class="chart trend-chart"></div>
        <div class="table-toggle">
          <button class="link-btn" @click="showTrendTable = !showTrendTable">
            {{ showTrendTable ? t('btnHideData') : t('btnViewData') }}
          </button>
        </div>
        <table v-if="showTrendTable" class="data-table">
          <thead>
            <tr>
              <th>{{ t('tableMonth') }}</th>
              <th class="num">{{ t('tableAmount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in trendTable" :key="row.month">
              <td>{{ row.month }}</td>
              <td class="num">{{ row.amount.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分类占比：选定月份的环形图 -->
      <div class="card">
        <div class="chart-head">
          <h2>{{ t('statsShare') }}</h2>
          <div class="chart-controls">
            <input type="month" v-model="shareMonth" class="month-input" />
            <button
              class="toggle"
              :class="{ active: shareType === 'expense' }"
              @click="shareType = 'expense'"
            >
              {{ t('typeExpense') }}
            </button>
            <button
              class="toggle"
              :class="{ active: shareType === 'income' }"
              @click="shareType = 'income'"
            >
              {{ t('typeIncome') }}
            </button>
          </div>
        </div>
        <div class="chart-wrap">
          <div ref="shareEl" class="chart share-chart"></div>
          <div v-if="!shareRows.length" class="chart-empty">{{ t('statsNoData') }}</div>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ t('tableCat') }}</th>
              <th class="num">{{ t('tableAmount') }}</th>
              <th class="num">{{ t('tablePercent') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in shareRows" :key="row.id">
              <td>
                <span class="dot" :style="{ background: row.color }"></span>
                {{ row.emoji }} {{ row.name }}
              </td>
              <td class="num">{{ row.amount.toFixed(2) }}</td>
              <td class="num">{{ row.percent }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/categories'
import { t, i18n, labelOf } from '../i18n'

// —— 配色（dataviz 规范调色板）：分类按固定顺序分配颜色，不随筛选/排序变化 ——
const CATEGORY_COLORS = {
  expense: {
    food: '#2a78d6',
    transport: '#eb6834',
    shopping: '#1baf7a',
    housing: '#eda100',
    communication: '#e87ba4',
    health: '#008300',
    education: '#4a3aa7',
    entertainment: '#e34948'
  },
  income: {
    salary: '#2a78d6',
    side_job: '#eb6834',
    investment: '#1baf7a',
    gift: '#eda100',
    other: '#e87ba4'
  }
}
const OTHER_COLOR = '#9a9a96' // 环形图归并"其他"的灰色
const EXPENSE_COLOR = '#e5484d' // 与记账页支出红一致
const INCOME_COLOR = '#2f9e63' // 与记账页收入绿一致

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// —— 状态 ——
const allRecords = ref([])
const trendType = ref('expense')
const shareType = ref('expense')
const shareMonth = ref(currentMonth())

const trendEl = ref(null)
const shareEl = ref(null)
const showTrendTable = ref(false) // 月度汇总数据表默认收起，需要时点开
let trendChart = null
let shareChart = null

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
// 横轴月份短标签：中文显示 8月，英文显示 Aug
function monthLabel(month) {
  const m = Number(month.slice(5))
  return i18n.locale === 'zh' ? `${m}月` : EN_MONTHS[m - 1]
}

// —— 月度汇总：近 12 个月每月总额（元） ——
const trendTable = computed(() => {
  const months = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const byMonth = {}
  for (const r of allRecords.value) {
    if (r.type !== trendType.value) continue
    const m = r.date.slice(0, 7)
    byMonth[m] = (byMonth[m] || 0) + r.amount
  }
  return months.map((m) => ({ month: m, amount: (byMonth[m] || 0) / 100 }))
})

// —— 分类占比：选定月份的一级分类明细（元 + 占比） ——
const shareRows = computed(() => {
  const list = shareType.value === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const byCat = {}
  for (const r of allRecords.value) {
    if (r.type !== shareType.value || r.date.slice(0, 7) !== shareMonth.value) continue
    byCat[r.category1] = (byCat[r.category1] || 0) + r.amount
  }
  const total = Object.values(byCat).reduce((a, b) => a + b, 0)
  const rows = list
    .map((c) => {
      const amount = (byCat[c.id] || 0) / 100
      return {
        id: c.id,
        emoji: c.emoji,
        name: labelOf(c),
        color: (CATEGORY_COLORS[shareType.value] || {})[c.id] || OTHER_COLOR,
        amount,
        percent: total ? Math.round(((byCat[c.id] || 0) / total) * 1000) / 10 : 0
      }
    })
    .filter((row) => row.amount > 0)
  rows.sort((a, b) => b.amount - a.amount) // 仅影响展示顺序，颜色不随排序变化
  return rows
})

// —— 环形图数据：前 7 大分类 + "其他"归并（控制分类色不超过 8 个，颜色含义不变） ——
const MAX_SLICES = 7
const shareChartData = computed(() => {
  const rows = shareRows.value
  if (!rows.length) return []
  const data = rows.slice(0, MAX_SLICES).map((r) => ({
    name: r.name,
    value: r.amount,
    itemStyle: { color: r.color }
  }))
  const rest = rows.slice(MAX_SLICES).reduce((s, r) => s + r.amount, 0)
  if (rest > 0) {
    data.push({
      name: t('statsOther'),
      value: Math.round(rest * 100) / 100,
      itemStyle: { color: OTHER_COLOR }
    })
  }
  return data
})

// —— 图表渲染 ——
function renderTrend() {
  if (!trendChart) return
  const data = trendTable.value
  trendChart.setOption({
    grid: { left: 8, right: 8, top: 20, bottom: 0, containLabel: true },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0b0b0b',
      borderWidth: 0,
      textStyle: { color: '#ffffff' },
      valueFormatter: (v) => `¥${v.toFixed(2)}`
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.month),
      axisLine: { lineStyle: { color: '#c3c2b7' } },
      axisTick: { show: false },
      axisLabel: { color: '#898781', formatter: monthLabel }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#e1e0d9' } },
      axisLabel: { color: '#898781' }
    },
    series: [
      {
        type: 'bar',
        data: data.map((d) => d.amount),
        barMaxWidth: 28,
        itemStyle: {
          color: trendType.value === 'expense' ? EXPENSE_COLOR : INCOME_COLOR,
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  })
}

function renderShare() {
  if (!shareChart) return
  const data = shareChartData.value
  shareChart.setOption(
    {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0b0b0b',
        borderWidth: 0,
        textStyle: { color: '#ffffff' },
        formatter: (p) => `${p.name}：¥${Number(p.value).toFixed(2)}（${p.percent}%）`
      },
      legend:
        data.length > 1
          ? {
              orient: 'vertical',
              right: 4,
              top: 'middle',
              textStyle: { color: '#52514e' },
              itemWidth: 10,
              itemHeight: 10
            }
          : undefined,
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['36%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 600, color: '#0b0b0b' } },
          data
        }
      ]
    },
    true // 数据变化时整体替换，避免残留
  )
}

function onResize() {
  trendChart?.resize()
  shareChart?.resize()
}

// 数据/筛选/语言变化时重绘
watch(trendTable, renderTrend)
watch(shareChartData, renderShare)
watch(
  () => i18n.locale,
  () => {
    renderTrend()
    renderShare()
  }
)

onMounted(async () => {
  allRecords.value = await window.heima.listRecords(null)
  if (!allRecords.value.length) return
  await nextTick() // 等待界面把图表容器渲染出来，再初始化图表（否则容器还不存在）
  trendChart = echarts.init(trendEl.value)
  shareChart = echarts.init(shareEl.value)
  renderTrend()
  renderShare()
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  trendChart?.dispose()
  shareChart?.dispose()
})
</script>

<style scoped>
.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.chart-head h2 {
  font-size: 16px;
  font-weight: 600;
}

.chart-toggles,
.chart-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 999px;
  padding: 5px 14px;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  color: var(--text);
}

.toggle.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.month-input {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 5px 10px;
  font-family: inherit;
  font-size: 13px;
  color: var(--text);
  outline: none;
}

.chart {
  width: 100%;
}

.trend-chart {
  height: 280px;
}

.chart-wrap {
  position: relative;
}

.share-chart {
  height: 320px;
}

.chart-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-light);
  font-size: 14px;
}

.table-toggle {
  margin-top: 10px;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-size: 13px;
  color: var(--text-light);
  cursor: pointer;
  font-family: inherit;
}

.link-btn:hover {
  color: var(--primary);
  text-decoration: underline;
}

.empty-card {
  text-align: center;
  color: var(--text-light);
  padding: 60px 0;
  font-size: 14px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.data-table th,
.data-table td {
  text-align: left;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
}

.data-table th {
  color: var(--text-light);
  font-weight: 500;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table .num {
  text-align: right;
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: baseline;
}
</style>
