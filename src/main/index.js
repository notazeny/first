import { app, BrowserWindow, Menu, ipcMain } from 'electron'
import { join } from 'path'
import {
  initDatabase,
  listRecords,
  addRecord,
  updateRecord,
  removeRecord,
  getSetting,
  setSetting
} from './db'

app.setName('黑马记账')

// 菜单：Windows/Linux 去掉 Electron 默认英文菜单；macOS 按平台惯例保留最小中文菜单
function setupMenu() {
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([{ label: '黑马记账', submenu: [{ role: 'quit', label: '退出' }] }])
    )
  } else {
    Menu.setApplicationMenu(null)
  }
}

// 注册数据库读写接口（供界面通过安全通道调用）
function registerIpcHandlers() {
  ipcMain.handle('records:list', (_event, month) => listRecords(month || null))
  ipcMain.handle('records:add', (_event, record) => addRecord(record))
  ipcMain.handle('records:update', (_event, id, fields) => updateRecord(id, fields))
  ipcMain.handle('records:remove', (_event, id) => removeRecord(id))
  ipcMain.handle('settings:get', (_event, key) => getSetting(key))
  ipcMain.handle('settings:set', (_event, key, value) => setSetting(key, value))
}

// 创建主窗口
function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    title: '黑马记账',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true, // 界面与系统底层隔离，更安全
      nodeIntegration: false
    }
  })

  // 开发模式加载调试地址，正式模式加载打包后的页面
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  initDatabase()
  setupMenu()
  registerIpcHandlers()
  createWindow()

  // macOS 惯例：点击 Dock 图标且没有窗口时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// 所有窗口关闭后退出（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
