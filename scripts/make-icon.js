// 生成应用图标 build/icon.png（512×512）：
// 品牌蓝渐变圆角底 + 白色 ¥ 符号，纯几何绘制，无需任何图片素材
// 用法：node scripts/make-icon.js
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const SIZE = 512
const SS = 3 // 抗锯齿超采样倍数

// —— 几何函数 ——
// 点到线段的距离
function sdSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax
  const aby = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / (abx * abx + aby * aby)))
  const dx = px - (ax + abx * t)
  const dy = py - (ay + aby * t)
  return Math.hypot(dx, dy)
}
// 点到圆角矩形的有符号距离
function sdRoundedBox(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r)
  const qy = Math.abs(py - cy) - (hh - r)
  return Math.min(Math.max(qx, qy), 0) + Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) - r
}
// 距离 → 覆盖度（1.5 像素平滑过渡，避免锯齿）
function coverOf(d) {
  return Math.max(0, Math.min(1, 0.5 - d / 1.5))
}

const HALF = SIZE / 2
const MARGIN = 14 // 圆角底与画布边距
const RADIUS = 108 // 圆角半径
const bgTop = [91, 124, 250] // 顶部色 #5b7cfa
const bgBottom = [63, 94, 232] // 底部色 #3f5ee8
const STROKE = 12 // ¥ 笔画半厚

// ¥ 符号笔画（线段集合）：竖笔 + 两条斜笔 + 上短横 + 下长横
const SEGMENTS = [
  [256, 150, 256, 380],
  [256, 150, 172, 238],
  [256, 150, 340, 238],
  [200, 288, 312, 288],
  [170, 335, 342, 335]
]

const rgba = Buffer.alloc(SIZE * SIZE * 4)

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    let bgA = 0
    let bgSum = [0, 0, 0]
    let whiteSum = 0
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const px = (x * SS + sx + 0.5) / SS
        const py = (y * SS + sy + 0.5) / SS
        // 背景覆盖度（带垂直渐变）
        const cBg = coverOf(sdRoundedBox(px, py, HALF, HALF, HALF - MARGIN, HALF - MARGIN, RADIUS))
        if (cBg > 0) {
          bgA += cBg
          const t = py / SIZE
          bgSum[0] += (bgTop[0] + (bgBottom[0] - bgTop[0]) * t) * cBg
          bgSum[1] += (bgTop[1] + (bgBottom[1] - bgTop[1]) * t) * cBg
          bgSum[2] += (bgTop[2] + (bgBottom[2] - bgTop[2]) * t) * cBg
        }
        // ¥ 白色覆盖度
        let cWhite = 0
        for (const [ax, ay, bx, by] of SEGMENTS) {
          cWhite = Math.max(cWhite, coverOf(sdSegment(px, py, ax, ay, bx, by) - STROKE))
        }
        whiteSum += cWhite
      }
    }
    const n = SS * SS
    const alpha = bgA / n
    const i = (y * SIZE + x) * 4
    if (alpha <= 0) {
      rgba[i + 3] = 0
    } else {
      // 白色与背景混合（非预乘 alpha）
      const white = whiteSum / n
      rgba[i] = Math.round((bgSum[0] / bgA) * (1 - white) + 255 * white)
      rgba[i + 1] = Math.round((bgSum[1] / bgA) * (1 - white) + 255 * white)
      rgba[i + 2] = Math.round((bgSum[2] / bgA) * (1 - white) + 255 * white)
      rgba[i + 3] = Math.round(alpha * 255)
    }
  }
}

// —— PNG 编码 ——
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(SIZE, 0)
ihdr.writeUInt32BE(SIZE, 4)
ihdr[8] = 8 // 位深
ihdr[9] = 6 // 颜色类型：RGBA
// 每行前加滤波字节 0
const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0
  rgba.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4)
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
  chunk('IEND', Buffer.alloc(0))
])

const outDir = path.join(__dirname, '..', 'build')
fs.mkdirSync(outDir, { recursive: true })
const outFile = path.join(outDir, 'icon.png')
fs.writeFileSync(outFile, png)
console.log(`图标已生成：${outFile}（${SIZE}×${SIZE}）`)
