// Repository 層
// 職責：
// 1. 處理數據存儲和檢索
// 2. 與數據庫或外部 API 進行交互
// 3. 不包含業務邏輯
// 4. 返回原始數據，不進行數據轉換

export async function fetchBasic(uuid: string) {
  // 從數據庫獲取 bot 狀態
  return Promise.resolve(() => uuid)
}
