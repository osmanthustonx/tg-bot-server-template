import dedent from 'dedent'
import type { Context } from '#root/bot/context.js'

export function startMessage(ctx: Context) {
  return dedent`
    <b>${ctx.t('common.welcome')}🎉</b>
  `
}
