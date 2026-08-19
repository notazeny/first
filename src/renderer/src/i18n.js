import { reactive } from 'vue'

// 界面语言：使用项目内置词表（不依赖第三方库），默认中文，可在"设置"页切换
// 切换后立即生效，并存入数据库，下次启动自动沿用

export const messages = {
  zh: {
    appTitle: '黑马记账',
    slogan: '记好每一笔，心里有本账',
    tabRecord: '记账',
    tabSettings: '设置',
    typeExpense: '支出',
    typeIncome: '收入',
    amountLabel: '金额（元）',
    amountPlaceholder: '0.00',
    categoryLabel: '分类',
    categoryHint: '请先选择一级分类，再选择二级小类',
    dateLabel: '日期',
    noteLabel: '备注',
    notePlaceholder: '备注（可选）',
    btnSave: '保存',
    btnUpdate: '保存修改',
    btnCancel: '取消编辑',
    btnEdit: '编辑',
    btnDelete: '删除',
    btnConfirmDelete: '再点一次确认删除',
    monthLabel: '月份筛选',
    btnAllMonths: '全部月份',
    emptyList: '本月暂无记录，先记一笔吧',
    totalExpense: '支出合计',
    totalIncome: '收入合计',
    tabStats: '统计',
    statsTrend: '月度汇总（近 12 个月）',
    statsShare: '分类占比',
    statsMonth: '月份',
    statsNoData: '暂无数据，先去记几笔吧',
    statsOther: '其他',
    tableCat: '分类',
    tableMonth: '月份',
    tableAmount: '金额（元）',
    tablePercent: '占比',
    btnViewData: '查看数据',
    btnHideData: '收起数据',
    langLabel: '界面语言',
    errAmount: '请输入正确的金额（大于 0，最多两位小数）',
    errCategory: '请选择二级分类',
    recordSaved: '已保存'
  },
  en: {
    appTitle: 'Heima Bookkeeping',
    slogan: 'Track every cent, know your money',
    tabRecord: 'Ledger',
    tabSettings: 'Settings',
    typeExpense: 'Expense',
    typeIncome: 'Income',
    amountLabel: 'Amount (CNY)',
    amountPlaceholder: '0.00',
    categoryLabel: 'Category',
    categoryHint: 'Pick a main category, then a subcategory',
    dateLabel: 'Date',
    noteLabel: 'Note',
    notePlaceholder: 'Note (optional)',
    btnSave: 'Save',
    btnUpdate: 'Save changes',
    btnCancel: 'Cancel editing',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    btnConfirmDelete: 'Click again to confirm',
    monthLabel: 'Month',
    btnAllMonths: 'All months',
    emptyList: 'No records yet — add your first one',
    totalExpense: 'Total expense',
    totalIncome: 'Total income',
    tabStats: 'Stats',
    statsTrend: 'Monthly totals (last 12 months)',
    statsShare: 'Category share',
    statsMonth: 'Month',
    statsNoData: 'No data yet — add some records first',
    statsOther: 'Other',
    tableCat: 'Category',
    tableMonth: 'Month',
    tableAmount: 'Amount (CNY)',
    tablePercent: 'Share',
    btnViewData: 'View data',
    btnHideData: 'Hide data',
    langLabel: 'Language',
    errAmount: 'Enter a valid amount (greater than 0, up to 2 decimals)',
    errCategory: 'Please pick a subcategory',
    recordSaved: 'Saved'
  }
}

export const i18n = reactive({ locale: 'zh' })

// 取词表文案：当前语言缺失时回退到中文
export function t(key) {
  const dict = messages[i18n.locale] || messages.zh
  return dict[key] ?? messages.zh[key] ?? key
}

// 取分类的中/英文显示名（分类对象均带 zh / en 字段）
export function labelOf(item) {
  if (!item) return ''
  return i18n.locale === 'zh' ? item.zh : item.en
}
