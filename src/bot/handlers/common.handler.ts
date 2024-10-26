import type { Other } from '@grammyjs/hydrate'
import type { Conversation } from '@grammyjs/conversations'
import type { Message } from 'grammy/types'
import type { MessageXFragment } from '@grammyjs/hydrate/out/data/message.js'
import type { Context } from '#root/bot/context.js'
import { delay2 } from '#root/constants/time.js'
import { deleteMessageKeyboard } from '#root/bot/keyboards/common.keyboard.js'
import { timerManager } from '#root/bot/helpers/timer-manager.js'
import { back, cancel } from '#root/bot/callback-data/common.callbackdata.js'
import { selectPriority, setTodoName, viewCompletedList } from '#root/bot/callback-data/start.callbackdata.js'

export async function removeMessage(ctx: Context, message: string, other?: Other<'sendMessage', 'chat_id' | 'text'>, delay = delay2) {
  return ctx.reply(message, other).then((msg) => {
    timerManager.createTimer(msg, delay)
    return msg
  })
}

export function leaveConversation(ctx: Context, messageId: number) {
  if (ctx.hasCallbackQuery('back:delete')) {
    ctx.deleteMessages([messageId]).catch(console.error)
    return true
  }
  return false
}

export async function checkIsDeleteCallbackQuery(
  ctx: Context,
  conversation: Conversation<Context>,
) {
  if (
    ctx.callbackQuery
    && ctx.callbackQuery.data !== 'back:delete'
  ) {
    await conversation.skip({ drop: true })
  }
}

export async function conversationCheck(
  ctx: Context,
  conversation: Conversation<Context>,
  messageId: number,
) {
  await checkIsDeleteCallbackQuery(ctx, conversation)
  return leaveConversation(ctx, messageId)
}

export function leaveConversationChecker(ctx: Context) {
  const isCommand = ['/start', '/language'].includes(ctx.message?.text ?? '')
  const shouldLeaveCallback = [
    cancel,
    back,
    selectPriority,
    viewCompletedList,
    setTodoName,
  ].some((callback) => {
    return callback.filter().test(ctx.callbackQuery?.data ?? '')
  })

  if (isCommand || shouldLeaveCallback) {
    return true
  }
  return false
}

// 使用 Set 來存儲對話類型，提供 O(1) 的查找效率
const MONITORED_CONVERSATIONS = new Set([
  'create user',
  'add todo',
  // 在這裡添加更多對話類型
])
export async function redundantConversationChecker(ctx: Context): Promise<boolean> {
  try {
    const active = await ctx.conversation.active()

    // 快速路徑：如果沒有活動對話，立即返回
    if (!active || Object.keys(active).length === 0)
      return false

    // 使用 some 進行快速檢查，一旦找到匹配就返回
    return Object.keys(active).some(key => MONITORED_CONVERSATIONS.has(key))
  }
  catch (error) {
    console.error('Error checking redundant conversations:', error)
  }

  return false
}

export async function newLeaveConversation(
  ctx: Context,
  conversation: Conversation<Context>,
  messageIds: number[],
) {
  if (leaveConversationChecker(ctx)) {
    ctx.deleteMessages(messageIds).catch(conversation.error)
    await conversation.skip()
  }
}

export async function handleConversationFieldInput(
  ctx: Context,
  conversation: Conversation<Context>,
  fieldName: string,
  backFn: (ctx: Context) => Promise<true | void | (Message.CommonMessage & MessageXFragment & Message)>,
  prevMsgsId?: number[],
) {
  const fieldMsg = await ctx.reply(
    `${ctx.t('start.plz-enter')}`,
    { reply_markup: deleteMessageKeyboard(ctx) },
  )

  ctx = await conversation.waitFor(['callback_query:data', 'message:text'])

  if (await conversationCheck(ctx, conversation, fieldMsg.message_id)) {
    backFn(ctx)
    if (prevMsgsId)
      ctx.deleteMessages([fieldMsg.message_id, ...prevMsgsId]).catch(console.error)
    return null
  }
  const fieldAnswerMsgId = ctx.msg?.message_id ?? 0
  const fieldAnswer = ctx.msg?.text ?? ''

  return { fieldMsg, fieldAnswer, fieldAnswerMsgId }
}
