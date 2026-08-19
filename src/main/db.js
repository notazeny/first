import { app } from 'electron'
import { join } from 'path'
import { DatabaseSync } from 'node:sqlite'

// 数据库模块：负责记账数据的读写
// 金额以"分"为单位的整数存储，避免小数误差（如 12.5 元存为 1250）

let db = null

// 打开/创建数据库文件并初始化表结构
export function initDatabase() {
  const dbPath = join(app.getPath('userData'), 'heima.db')
  db = new DatabaseSync(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      type       TEXT    NOT NULL,              -- 类型：expense 支出 / income 收入
      amount     INTEGER NOT NULL,              -- 金额（单位：分）
      category1  TEXT    NOT NULL,              -- 一级分类标识
      category2  TEXT    NOT NULL,              -- 二级分类标识
      date       TEXT    NOT NULL,              -- 日期 YYYY-MM-DD
      note       TEXT    NOT NULL DEFAULT '',   -- 备注
      created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM records').get()
  console.log(`[黑马记账] 数据库初始化成功，文件：${dbPath}（现有记录 ${count} 条）`)
}

// 查询记录；month 形如 '2026-08'，为空则查全部
export function listRecords(month) {
  if (month) {
    return db
      .prepare('SELECT * FROM records WHERE date LIKE ? ORDER BY date DESC, id DESC')
      .all(`${month}%`)
  }
  return db.prepare('SELECT * FROM records ORDER BY date DESC, id DESC').all()
}

export function addRecord({ type, amount, category1, category2, date, note = '' }) {
  const result = db
    .prepare('INSERT INTO records (type, amount, category1, category2, date, note) VALUES (?, ?, ?, ?, ?, ?)')
    .run(type, amount, category1, category2, date, note)
  return result.lastInsertRowid
}

export function updateRecord(id, { type, amount, category1, category2, date, note = '' }) {
  db.prepare('UPDATE records SET type = ?, amount = ?, category1 = ?, category2 = ?, date = ?, note = ? WHERE id = ?')
    .run(type, amount, category1, category2, date, note, id)
}

export function removeRecord(id) {
  db.prepare('DELETE FROM records WHERE id = ?').run(id)
}

export function getSetting(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
  return row ? row.value : null
}

export function setSetting(key, value) {
  db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, String(value))
}
