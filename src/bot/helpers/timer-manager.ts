import type { Message } from 'grammy/types'
import type { MessageXFragment } from '@grammyjs/hydrate/out/data/message.js'

// 定義類型
interface MessageTimer {
  messageId: number
  chatId: number
  timerId: NodeJS.Timeout
}

// 使用立即執行函數創建單例
export const timerManager = (() => {
  // timers Map 現在被封裝在閉包中
  const timers = new Map<string, MessageTimer>()

  // 生成計時器的唯一鍵值
  const getTimerKey = (chatId: number, messageId: number): string =>
    `${chatId}:${messageId}`

  // 移除特定消息的計時器
  const removeTimer = (chatId: number, messageId: number) => {
    const key = getTimerKey(chatId, messageId)
    const timer = timers.get(key)

    if (timer) {
      clearTimeout(timer.timerId)
      timers.delete(key)
    }
  }

  // 創建並存儲計時器
  const createTimer = (msg: MessageXFragment & Message, delay: number) => {
    const messageId = msg.message_id
    const chatId = msg.chat.id

    // 創建計時器
    const timer = setTimeout(() => {
      msg.delete().catch(console.error)
      // 計時器執行後自動從 Map 中移除
      removeTimer(chatId, messageId)
    }, delay)

    // 存儲計時器信息
    const key = getTimerKey(chatId, messageId)
    timers.set(key, {
      messageId,
      chatId,
      timerId: timer,
    })
  }

  // 返回公開的方法
  return {
    createTimer,
    removeTimer,
  }
})()
