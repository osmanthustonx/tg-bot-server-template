import type { Context } from '#root/bot/context.js'
import { leaveChecker } from '#root/bot/handlers/common.handler.js'

export function exitConversationMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    if (leaveChecker(ctx)) {
      await ctx.conversation.exit()
    }
    await next()
  }
}
