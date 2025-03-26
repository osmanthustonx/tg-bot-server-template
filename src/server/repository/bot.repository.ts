// Repository 層
// 職責：
// 1. 處理數據存儲和檢索
// 2. 與數據庫或外部 API 進行交互
// 3. 不包含業務邏輯
// 4. 返回原始數據，不進行數據轉換

import type { Other } from '@grammyjs/hydrate'
import { service } from '#root/api/index.js'
import { botDi } from '#root/server/di/bot.container.js'

export async function fetchBasic(dataKey: string) {
  // 從數據庫獲取 bot 狀態

  return service.getTest(dataKey)
}

export async function sendMessage(uid: number, content: string, option?: Other<'sendMessage', 'text' | 'chat_id'>) {
  const bot = botDi.getBot()
  return bot.api.sendMessage(uid, content, option)
}

export async function editMessageText(uid: number, msgId: number, content: string, option?: Other<'editMessageText', 'chat_id' | 'text' | 'message_id' | 'inline_message_id'>) {
  const bot = botDi.getBot()
  return bot.api.editMessageText(uid, msgId, content, option)
}
