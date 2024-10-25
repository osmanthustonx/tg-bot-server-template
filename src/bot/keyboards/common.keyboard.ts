import { InlineKeyboard } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { back, cancel, retry } from '#root/bot/callback-data/common.callbackdata.js'

export function backElement(ctx: Context, to: string) {
  return InlineKeyboard.text(`⬅️${ctx.t('common.back')}`, back.pack({ to }))
}

export function cancelElement(ctx: Context) {
  return InlineKeyboard.text(`⬅️${ctx.t('common.cancel')}`, cancel.pack({ }))
}

export function backKeyboard(ctx: Context, to: string) {
  return InlineKeyboard.from([[backElement(ctx, to)]])
}

export function retryKeyboard(
  ctx: Context,
  conversation: string,
) {
  const keyboard = [
    [
      {
        text: `☝️${ctx.t('common.retry')}`,
        callback_data: retry.pack({ conversation }),
      },
    ],
  ]
  return InlineKeyboard.from(keyboard)
};

export function retryWithDataKeyboard(
  ctx: Context,
  data: string,
) {
  const keyboard = [
    [
      {
        text: `☝️${ctx.t('common.retry')}`,
        callback_data: data,
      },
    ],
  ]
  return InlineKeyboard.from(keyboard)
};

export function deleteMessageKeyboard(ctx: Context) {
  const keyboard = [
    [
      backElement(ctx, 'delete'),
    ],
  ]
  return InlineKeyboard.from(keyboard)
};

export function cancelKeyboard(ctx: Context) {
  const keyboard = [
    [
      cancelElement(ctx),
    ],
  ]
  return InlineKeyboard.from(keyboard)
};
