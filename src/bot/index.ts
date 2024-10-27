import { autoChatAction } from '@grammyjs/auto-chat-action'
import { hydrate } from '@grammyjs/hydrate'
import { hydrateReply, parseMode } from '@grammyjs/parse-mode'
import type { BotConfig, StorageAdapter } from 'grammy'
import { Bot as TelegramBot } from 'grammy'
import { sequentialize } from '@grammyjs/runner'
import { conversations } from '@grammyjs/conversations'
import { adminFeature } from '#root/bot/features/admin.js'
import { languageFeature } from '#root/bot/features/language.js'
import { unhandledFeature } from '#root/bot/features/unhandled.js'
import { errorHandler } from '#root/bot/handlers/error.js'
import { updateLogger } from '#root/bot/middlewares/update-logger.js'
import { session } from '#root/bot/middlewares/session.js'
import type { Context, SessionData } from '#root/bot/context.js'
import { createContextConstructor } from '#root/bot/context.js'
import { i18n, isMultipleLocales } from '#root/bot/i18n.js'
import type { Logger } from '#root/logger.js'
import type { Config } from '#root/configs/bot.js'
import { startFeature } from '#root/bot/features/start.js'
import { commonFeature } from '#root/bot/features/common.js'
import { setTodoNameConversation } from '#root/bot/conversation/start.conversation.js'
import { exitConversationMiddleware } from '#root/bot/middlewares/conversation.js'

interface Dependencies {
  config: Config
  logger: Logger
}

interface Options {
  permSessionStorage?: StorageAdapter<SessionData['perm']>
  tempSessionStorage?: StorageAdapter<SessionData['temp']>
  botConfig?: Omit<BotConfig<Context>, 'ContextConstructor'>
}

function getSessionKey(ctx: Omit<Context, 'session'>) {
  return ctx.from?.id.toString()
}

export function createBot(token: string, dependencies: Dependencies, options: Options = {}) {
  const {
    config,
    logger,
  } = dependencies

  const bot = new TelegramBot(token, {
    ...options.botConfig,
    ContextConstructor: createContextConstructor({
      logger,
      config,
    }),
  })
  const protectedBot = bot.errorBoundary(errorHandler)

  // Middlewares
  bot.api.config.use(parseMode('HTML'))

  if (config.isPollingMode)
    protectedBot.use(sequentialize(getSessionKey))
  if (config.isDebug)
    protectedBot.use(updateLogger())
  protectedBot.use(autoChatAction(bot.api))
  protectedBot.use(hydrateReply)
  protectedBot.use(hydrate())
  protectedBot.use(session({
    type: 'multi',
    perm: {
      getSessionKey,
      storage: options.permSessionStorage,
    },
    temp: {
      getSessionKey,
      storage: options?.tempSessionStorage,
    },
  }))
  protectedBot.use(i18n)

  protectedBot.use(conversations())
  protectedBot.use(setTodoNameConversation())
  protectedBot.use(exitConversationMiddleware())

  // Handlers
  protectedBot.use(startFeature)
  protectedBot.use(adminFeature)
  if (isMultipleLocales)
    protectedBot.use(languageFeature)

  protectedBot.use(commonFeature)

  // must be the last handler
  protectedBot.use(unhandledFeature)

  return bot
}

export type Bot = ReturnType<typeof createBot>
