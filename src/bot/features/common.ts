import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { back, retry } from '#root/bot/callback-data/common.callbackdata.js'
import { handleEditStart } from '#root/bot/handlers/start.handler.js'
import { timerManager } from '#root/bot/helpers/timer-manager.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.callbackQuery(
  back.filter(),
  logHandle('back'),
  (ctx) => {
    const values: unknown[] = [ctx.answerCallbackQuery()]
    const { to } = back.unpack(ctx.callbackQuery.data)
    if (to === 'start')
      values.push(handleEditStart(ctx))

    return Promise.all(values)
  },
)

feature.callbackQuery(retry.filter(), logHandle('retry'), (ctx) => {
  const { conversation } = retry.unpack(ctx.callbackQuery.data)
  const message = ctx.callbackQuery.message
  if (message) {
    timerManager.removeTimer(message.chat.id, message.message_id)
  }
  return Promise.all([
    ctx.conversation.enter(conversation),
    ctx.deleteMessage().catch(console.error),
    ctx.answerCallbackQuery(),
  ])
})

export { composer as commonFeature }
