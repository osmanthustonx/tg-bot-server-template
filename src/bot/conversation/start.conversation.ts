import type { Conversation } from '@grammyjs/conversations'
import { createConversation } from '@grammyjs/conversations'
import { i18n } from '#root/bot/i18n.js'
import type { Context } from '#root/bot/context.js'
import { conversationCheck, handleConversationFieldInput, leaveConversation, newLeaveConversation, removeMessage } from '#root/bot/handlers/common.handler.js'
import { cancelKeyboard, deleteMessageKeyboard, retryKeyboard } from '#root/bot/keyboards/common.keyboard.js'
import { handleEditAddTodo, handleReplyAddTodo, handleReplyStart } from '#root/bot/handlers/start.handler.js'
import { service } from '#root/api/index.js'

export const CREATE_USER_CONVERSATION = 'create user'
export const SET_TODO_NAME_CONVERSATION = 'add todo'

export function createUserConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await conversation.run(i18n)

      if (!ctx.callbackQuery?.data)
        return console.error('錯誤 callback data')

      const fieldResult = await handleConversationFieldInput(ctx, conversation, 'uid', handleReplyStart)

      if (!fieldResult)
        return
      if (!ctx.chat?.id)
        return ctx.deleteMessages([fieldResult?.fieldMsg?.message_id, fieldResult?.fieldAnswerMsgId]).catch(conversation.error)

      const [error] = await conversation.external(() => service.createUser(ctx))

      if (fieldResult?.fieldMsg?.message_id && fieldResult?.fieldAnswerMsgId)
        ctx.deleteMessages([fieldResult?.fieldMsg?.message_id, fieldResult?.fieldAnswerMsgId]).catch(conversation.error)

      if (error) {
        return removeMessage(ctx, `❌${ctx.t('error.enter')}`, {
          reply_markup: retryKeyboard(ctx, CREATE_USER_CONVERSATION),
        })
      }

      handleReplyStart(ctx)
    },
    CREATE_USER_CONVERSATION,
  )
}

export function setTodoNameConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await conversation.run(i18n)
      const prev = ctx
      const message = await ctx.reply(
        'enter todo name',
        { reply_markup: cancelKeyboard(ctx) },
      )

      ctx = await conversation.waitFor(['callback_query:data', 'message:text'])

      await newLeaveConversation(ctx, conversation, [message.message_id].concat(conversation.session.conversationMsgBuffer))

      const input = ctx.msg?.text ?? ''

      conversation.session.conversationMsgBuffer.push(ctx.msg?.message_id ?? 0)
      const regex = /^[a-z0-9\u4E00-\u9FA5]+$/i
      if (!regex.test(input)) {
        const errorMessage = await ctx.reply(`❌wrong enter`)
        conversation.session.conversationMsgBuffer.push(errorMessage.message_id)
        await conversation.skip({ drop: true })
      }

      if (prev.callbackQuery?.message?.message_id) {
        conversation.session.addingForm[prev.callbackQuery.message.message_id].name = input
        prev.session.addingForm = conversation.session.addingForm
      }
      Promise.all([
        handleEditAddTodo(prev),
        ctx.deleteMessages([message.message_id].concat(conversation.session.conversationMsgBuffer)).catch(conversation.error),
      ])
      conversation.session.conversationMsgBuffer = []
    },
    SET_TODO_NAME_CONVERSATION,
  )
}

export function setTodoNameOldConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await conversation.run(i18n)
      const message = await ctx.reply(
        `輸入代辦名`,
        { reply_markup: deleteMessageKeyboard(ctx) },
      )

      ctx = await conversation.waitFor(['callback_query:data', 'message:text'])

      if (await conversationCheck(ctx, conversation, message.message_id))
        return handleReplyAddTodo(ctx)

      const answerMessageId = ctx.msg?.message_id ?? 0
      const input = ctx.msg?.text ?? ''

      const regex = /^[a-z0-9\u4E00-\u9FA5]+$/i
      if (!regex.test(input)) {
        ctx.deleteMessages([message.message_id, answerMessageId]).catch(console.error)
        return removeMessage(ctx, `❌${ctx.t('error.enter')}`, {
          reply_markup: retryKeyboard(ctx, SET_TODO_NAME_CONVERSATION),
        }, 1000000)
      }
      if (conversation.session.adding)
        conversation.session.adding.name = input
      Promise.all([
        handleReplyAddTodo(ctx),
        ctx.deleteMessages([message.message_id]).catch(conversation.error),
      ])
    },
    SET_TODO_NAME_CONVERSATION,
  )
}
