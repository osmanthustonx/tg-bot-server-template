import type { Context } from '#root/bot/context.js'
import { leaveConversationChecker, redundantConversationChecker } from '#root/bot/handlers/common.handler.js'

export function exitConversationMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    if (leaveConversationChecker(ctx)) {
      await ctx.conversation.exit()
    }
    await next()
  }
}
