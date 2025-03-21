import type { Message, Update } from 'grammy/types'
import type { MessageXFragment } from '@grammyjs/hydrate/out/data/message.js'
import { getErrorMessage } from '#root/utils/error.js'
import type { Context } from '#root/bot/context.js'
import { removeMessage } from '#root/bot/handlers/common.handler.js'

export interface ApiErrorOptions {
  logError?: boolean
  notifyUser?: boolean
  defaultMessage?: string
  context?: Context
  // 自定義錯誤處理邏輯
  errorHandlers?: Record<number | string, (ctx: Context, errorDetails: any) => void | Promise<true | (Update.Edited & Message.CommonMessage & { text: string })| (MessageXFragment & Message)>>
  // 是否使用 removeMessage 而不是 reply
  useRemoveMessage?: boolean
}

const DEFAULT_OPTIONS: ApiErrorOptions = {
  logError: true,
  notifyUser: false,
  defaultMessage: 'An unexpected error occurred',
  useRemoveMessage: false,
}

/**
 * 處理 API 錯誤的通用函數
 *
 * @param error API 調用返回的錯誤
 * @param options 錯誤處理選項
 */
export async function handleApiError(
  error: any,
  options: ApiErrorOptions = {},
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  // 安全提取錯誤詳情
  let errorDetails: any = {}
  let errorMessage = opts.defaultMessage
  let errorCode: number | string | undefined

  try {
    // 嘗試獲取響應 JSON（如果可用）
    if (error?.response) {
      try {
        errorDetails = await error.response.json()
        errorCode = errorDetails.code
        errorMessage = errorDetails.message || errorMessage
      }
      catch {
        // JSON 解析失敗時使用原始錯誤
        errorDetails = { parseError: true, originalError: error }
      }
    }
    else if (error && typeof error === 'object') {
      // 處理已經解析過的錯誤對象
      errorDetails = error
      errorCode = error.code
      errorMessage = error.message || errorMessage
    }
  }
  catch {
    // 如果提取過程失敗，使用原始錯誤
    errorDetails = { extractError: true, originalError: error }
  }

  // 獲取格式化的錯誤消息
  const formattedError = getErrorMessage(error)

  // 如果請求記錄錯誤
  if (opts.logError) {
    console.error('API Error:', formattedError, errorDetails)

    // 如果提供了上下文，使用其記錄器
    if (opts.context?.logger) {
      opts.context.logger.error({
        error: formattedError,
        details: errorDetails,
      })
    }
  }

  // 檢查是否有針對此錯誤代碼的自定義處理程序
  if (errorCode && opts.errorHandlers && opts.context && errorCode in opts.errorHandlers) {
    await opts.errorHandlers[errorCode](opts.context, errorDetails)
    return
  }

  // 如果請求通知用戶且上下文可用
  if (opts.notifyUser && opts.context) {
    if (opts.useRemoveMessage) {
      removeMessage(opts.context, `❌ ${errorMessage}`)
    }
    else {
      opts.context.reply(`❌ ${errorMessage}`)
    }
  }
}

/**
 * 檢查結果是否為錯誤
 *
 * @param result API 調用結果
 * @returns 是否為錯誤結果
 */
export function isErrorResult(result: any): boolean {
  return result && typeof result === 'object' && 'code' in result && result.code !== 200
}
