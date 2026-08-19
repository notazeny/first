import { contextBridge, ipcRenderer } from 'electron'

// 预加载脚本：界面与主进程之间的"安全通道"
// 界面通过 window.heima 调用这些接口，实现记账数据的读写
contextBridge.exposeInMainWorld('heima', {
  // 记录：查（按月）、增、改、删
  listRecords: (month) => ipcRenderer.invoke('records:list', month),
  addRecord: (record) => ipcRenderer.invoke('records:add', record),
  updateRecord: (id, fields) => ipcRenderer.invoke('records:update', id, fields),
  removeRecord: (id) => ipcRenderer.invoke('records:remove', id),
  // 设置：读写键值
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value)
})
