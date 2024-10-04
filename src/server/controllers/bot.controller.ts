// Controller 層
// 職責：
// 1. 處理 HTTP 請求和響應
// 2. 解析請求參數
// 3. 調用適當的 Service 層函數
// 4. 處理錯誤並設置適當的 HTTP 狀態碼
// 5. 格式化響應數據

import type { Context } from 'hono'
import { getBasic } from '#root/server/services/bot.service.js'

export async function getBasicHandler(c: Context) {
  const uuid = c.req.param('uuid')
  try {
    const status = await getBasic(uuid)
    return c.json(status)
  }
  catch (error) {
    return c.json({ error, message: 'Bot not found' }, 404)
  }
}
