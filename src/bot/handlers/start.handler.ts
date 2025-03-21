import type { CommandContext } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { startKeyboard } from '#root/bot/keyboards/start.keyboard.js'
import { startMessage } from '#root/bot/messages/start.message.js'

export async function handleCommandStart(ctx: CommandContext<Context>) {
  return ctx.reply(
    startMessage(ctx),
    { reply_markup: startKeyboard(ctx) },
  )
}

export async function handleStart(ctx: Context, action: 'reply' | 'editMessageText' = 'editMessageText') {
  return ctx[action](
    startMessage(ctx),
    { reply_markup: startKeyboard(ctx) },
  )
}
