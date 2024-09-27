import type { Conversation } from '@grammyjs/conversations'
import { createConversation } from '@grammyjs/conversations'
import { i18n } from '#root/bot/i18n.js'
import type { Context } from '#root/bot/context.js'
import { handleConversationFieldInput, removeMessage } from '#root/bot/handlers/common.handler.js'
import { retryKeyboard } from '#root/bot/keyboards/common.keyboard.js'
import { handleReplyStart } from '#root/bot/handlers/start.handler.js'
import { service } from '#root/api/index.js'

export const CREATE_USER_CONVERSATION = 'create user'

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
