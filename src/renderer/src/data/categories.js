// 分类数据：两级分类（一级大类 + 二级小类），内置中英文名称与图标
// 记录里只存分类标识（如 food.breakfast），显示时按当前界面语言取对应名称

export const EXPENSE_CATEGORIES = [
  {
    id: 'food',
    emoji: '🍚',
    zh: '餐饮',
    en: 'Food',
    children: [
      { id: 'breakfast', zh: '早餐', en: 'Breakfast' },
      { id: 'lunch', zh: '午餐', en: 'Lunch' },
      { id: 'dinner', zh: '晚餐', en: 'Dinner' },
      { id: 'late_night', zh: '夜宵', en: 'Late-night snack' },
      { id: 'snacks', zh: '零食饮料', en: 'Snacks & drinks' },
      { id: 'takeout', zh: '外卖', en: 'Takeout' },
      { id: 'dining_out', zh: '聚餐应酬', en: 'Dining out' },
      { id: 'groceries', zh: '食材', en: 'Groceries' }
    ]
  },
  {
    id: 'transport',
    emoji: '🚌',
    zh: '交通',
    en: 'Transport',
    children: [
      { id: 'public_transit', zh: '公交地铁', en: 'Public transit' },
      { id: 'taxi', zh: '打车', en: 'Taxi' },
      { id: 'fuel', zh: '加油充电', en: 'Fuel & charging' },
      { id: 'parking', zh: '停车费', en: 'Parking' },
      { id: 'train', zh: '火车高铁', en: 'Train' },
      { id: 'flight', zh: '机票', en: 'Flight' },
      { id: 'bike', zh: '共享单车', en: 'Bike share' }
    ]
  },
  {
    id: 'shopping',
    emoji: '🛍️',
    zh: '购物',
    en: 'Shopping',
    children: [
      { id: 'clothing', zh: '服饰鞋包', en: 'Clothing & shoes' },
      { id: 'daily', zh: '日用品', en: 'Daily essentials' },
      { id: 'digital', zh: '数码电器', en: 'Electronics' },
      { id: 'beauty', zh: '美妆护肤', en: 'Beauty' },
      { id: 'baby', zh: '母婴', en: 'Baby & mom' },
      { id: 'other', zh: '其他购物', en: 'Other shopping' }
    ]
  },
  {
    id: 'housing',
    emoji: '🏠',
    zh: '居住',
    en: 'Housing',
    children: [
      { id: 'rent', zh: '房租', en: 'Rent' },
      { id: 'mortgage', zh: '房贷', en: 'Mortgage' },
      { id: 'utilities', zh: '水电燃气', en: 'Utilities' },
      { id: 'property_fee', zh: '物业费', en: 'Property fee' },
      { id: 'furniture', zh: '家具家电', en: 'Furniture & appliances' },
      { id: 'repair', zh: '维修', en: 'Repairs' }
    ]
  },
  {
    id: 'communication',
    emoji: '📱',
    zh: '通讯',
    en: 'Communication',
    children: [
      { id: 'phone_bill', zh: '话费充值', en: 'Phone bill' },
      { id: 'broadband', zh: '宽带网络', en: 'Broadband' },
      { id: 'delivery', zh: '快递邮寄', en: 'Delivery & postage' }
    ]
  },
  {
    id: 'health',
    emoji: '💊',
    zh: '医疗健康',
    en: 'Health',
    children: [
      { id: 'clinic', zh: '门诊', en: 'Clinic' },
      { id: 'medicine', zh: '药品', en: 'Medicine' },
      { id: 'hospital', zh: '住院', en: 'Hospital' },
      { id: 'checkup', zh: '体检', en: 'Checkup' },
      { id: 'supplements', zh: '保健品', en: 'Supplements' }
    ]
  },
  {
    id: 'education',
    emoji: '📚',
    zh: '教育',
    en: 'Education',
    children: [
      { id: 'tuition', zh: '学费培训', en: 'Tuition & training' },
      { id: 'books', zh: '书籍资料', en: 'Books' },
      { id: 'stationery', zh: '文具', en: 'Stationery' },
      { id: 'exam', zh: '考试报名', en: 'Exam fees' }
    ]
  },
  {
    id: 'entertainment',
    emoji: '🎮',
    zh: '娱乐',
    en: 'Entertainment',
    children: [
      { id: 'movies', zh: '电影演出', en: 'Movies & shows' },
      { id: 'games', zh: '游戏充值', en: 'Games' },
      { id: 'subscription', zh: '会员订阅', en: 'Subscriptions' },
      { id: 'travel', zh: '旅游度假', en: 'Travel' },
      { id: 'fitness', zh: '运动健身', en: 'Fitness' },
      { id: 'pets', zh: '宠物', en: 'Pets' }
    ]
  },
  {
    id: 'social',
    emoji: '🎁',
    zh: '人情',
    en: 'Social',
    children: [
      { id: 'treat', zh: '请客送礼', en: 'Treats & gifts' },
      { id: 'red_packet', zh: '红包', en: 'Red packets' },
      { id: 'donation', zh: '捐款', en: 'Donations' },
      { id: 'parents', zh: '孝敬父母', en: 'Parents' }
    ]
  },
  {
    id: 'other',
    emoji: '📦',
    zh: '其他',
    en: 'Other',
    children: [{ id: 'misc', zh: '其他杂项', en: 'Misc' }]
  }
]

export const INCOME_CATEGORIES = [
  {
    id: 'salary',
    emoji: '💰',
    zh: '工资',
    en: 'Salary',
    children: [
      { id: 'wage', zh: '工资', en: 'Wage' },
      { id: 'bonus', zh: '奖金', en: 'Bonus' },
      { id: 'allowance', zh: '补贴报销', en: 'Allowance' }
    ]
  },
  {
    id: 'side_job',
    emoji: '💼',
    zh: '兼职副业',
    en: 'Side jobs',
    children: [
      { id: 'part_time', zh: '兼职收入', en: 'Part-time' },
      { id: 'freelance', zh: '自由职业', en: 'Freelance' }
    ]
  },
  {
    id: 'investment',
    emoji: '📈',
    zh: '投资理财',
    en: 'Investment',
    children: [
      { id: 'interest', zh: '利息收入', en: 'Interest' },
      { id: 'wealth_mgmt', zh: '理财收益', en: 'Wealth management' }
    ]
  },
  {
    id: 'gift',
    emoji: '🧧',
    zh: '红包礼金',
    en: 'Gifts',
    children: [
      { id: 'red_packet', zh: '红包', en: 'Red packets' },
      { id: 'gift_money', zh: '礼金', en: 'Gift money' }
    ]
  },
  {
    id: 'other',
    emoji: '📦',
    zh: '其他',
    en: 'Other',
    children: [{ id: 'misc', zh: '其他收入', en: 'Misc' }]
  }
]

// 按类型与标识查找一级分类
export function findCategory(type, categoryId) {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  return list.find((c) => c.id === categoryId) || null
}
