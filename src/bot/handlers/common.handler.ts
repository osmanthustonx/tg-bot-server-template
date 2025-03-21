import type { Conversation } from '@grammyjs/conversations'
import type { Other } from '@grammyjs/hydrate'
import { back } from '#root/bot/callback-data/common.callbackdata.js'
import { language } from '#root/bot/callback-data/language.callbackdata.js'
import type { Context } from '#root/bot/context.js'
import { timerManager } from '#root/bot/helpers/timer-manager.js'
import { deleteMessageKeyboard } from '#root/bot/keyboards/common.keyboard.js'
import { delay2 } from '#root/constants/time.js'

export async function removeMessage(ctx: Context, message: string, other?: Other<'sendMessage', 'chat_id' | 'text'>, delay = delay2) {
  return ctx.reply(message, other).then((msg) => {
    timerManager.createTimer(msg, delay)
    return msg
  })
}

export function leaveConversationChecker(ctx: Context) {
  const isCommand = ['/start', '/language'].includes(ctx.message?.text ?? '')
  const shouldLeaveCallback = [
    back,
    language,
  ].some((callback) => {
    return callback.filter().test(ctx.callbackQuery?.data ?? '')
  })

  if (isCommand || shouldLeaveCallback) {
    return true
  }
  return false
}

export async function leaveConversation(
  ctx: Context,
  conversation: Conversation<Context>,
  messageIds: number[],
) {
  if (leaveConversationChecker(ctx)) {
    ctx.deleteMessages(messageIds).catch(conversation.error)
    if (conversation.session.msgId.length)
      conversation.session.msgId = []
    await conversation.skip()
  }
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

export async function handleConversationFieldInput(
  ctx: Context,
  conversation: Conversation<Context>,
) {
  const fieldMsg = await ctx.reply(
    `${ctx.t('start.plz-enter')}`,
    { reply_markup: deleteMessageKeyboard(ctx) },
  )

  ctx = await conversation.waitFor(['callback_query:data', 'message:text'])

  await leaveConversation(ctx, conversation, conversation.session.msgId)

  const fieldAnswerMsgId = ctx.msg?.message_id ?? 0
  const fieldAnswer = ctx.msg?.text ?? ''

  return { fieldMsg, fieldAnswer, fieldAnswerMsgId }
}
