// Service 層
// 職責：
// 1. 包含業務邏輯
// 2. 協調一個或多個 Repository 的調用
// 3. 處理數據轉換和驗證
// 4. 不直接處理 HTTP 請求/響應

import { fetchBasic } from '#root/server/repository/bot.repository.js'

export async function getBasic(uuid: string) {
  const data = await fetchBasic(uuid)
  // 在這裡可以添加額外的業務邏輯
  return { testData: data }
}
