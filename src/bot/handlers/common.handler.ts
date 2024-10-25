import type { Other } from '@grammyjs/hydrate'
import type { Conversation } from '@grammyjs/conversations'
import type { Message } from 'grammy/types'
import type { MessageXFragment } from '@grammyjs/hydrate/out/data/message.js'
import type { Context } from '#root/bot/context.js'
import { delay2 } from '#root/constants/time.js'
import { deleteMessageKeyboard } from '#root/bot/keyboards/common.keyboard.js'
import { timerManager } from '#root/bot/helpers/timer-manager.js'
import { back, cancel } from '#root/bot/callback-data/common.callbackdata.js'
import { selectPriority, viewCompletedList } from '#root/bot/callback-data/start.callbackdata.js'

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

export function leaveChecker(ctx: Context) {
  const isCommand = ['/start', '/language'].includes(ctx.message?.text ?? '')
  const shouldLeaveCallback = [
    cancel,
    back,
    selectPriority,
    viewCompletedList,
  ].some((callback) => {
    return callback.filter().test(ctx.callbackQuery?.data ?? '')
  })

  if (isCommand || shouldLeaveCallback) {
    return true
  }
  return false
}

export async function newLeaveConversation(
  ctx: Context,
  conversation: Conversation<Context>,
  messageIds: number[],
) {
  if (leaveChecker(ctx)) {
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
