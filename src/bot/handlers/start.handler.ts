import type { CallbackQueryContext, CommandContext } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { startMessage } from '#root/bot/messages/start.message.js'
import { startKeyboard } from '#root/bot/keyboards/start.keyboard.js'

export async function handleCommandStart(ctx: CommandContext<Context>) {
  return ctx.reply(
    startMessage(ctx),
    { reply_markup: startKeyboard(ctx) },
  )
}

export async function handleReplyStart(ctx: Context) {
  return ctx.reply(
    startMessage(ctx),
    { reply_markup: startKeyboard(ctx) },
  )
}

export async function handleEditStart(ctx: CallbackQueryContext<Context>) {
  return ctx.editMessageText(
    startMessage(ctx),
    { reply_markup: startKeyboard(ctx) },
  )
}
