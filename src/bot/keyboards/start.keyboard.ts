import { InlineKeyboard } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { language } from '#root/bot/callback-data/language.callbackdata.js'

export function startKeyboard(ctx: Context) {
  const keyboard = [
    [
      { text: `🌐${ctx.t('start.language')}`, callback_data: language.pack({}) },
    ],
  ]

  return InlineKeyboard.from(keyboard)
}
