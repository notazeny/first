import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

// 构建配置（打包工具的施工说明）：
// - main / preload：主进程与预加载脚本，第三方包保持外部引用（如数据库精密零件不拆散）
// - renderer：Vue 3 界面，由 vite 打包
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    plugins: [vue()]
  }
})
