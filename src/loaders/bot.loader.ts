import { type RunnerHandle, run } from '@grammyjs/runner'
import { createBot } from '#root/bot/index.js'
import type { Config, PollingConfig, WebhookConfig } from '#root/configs/bot.js'
import type { Logger } from '#root/logger.js'
import { onShutdown } from '#root/utils/starter.js'
import { loadRedisStorage } from '#root/loaders/redis.loader.js'
import { botDi } from '#root/server/di/bot.container.js'

export default async function loadBot(config: Config, logger: Logger) {
  const { redisInstance, botSessionStorage } = loadRedisStorage()
  const bot = createBot(config.botToken, { config, logger }, {
    botSessionStorage,
  })

  // 將 bot 實例注入到 DI container
  botDi.setBot(bot)
    .setLogger(logger)
    .setConfig(config)
    .setRedisClient(redisInstance)

  await bot.init()
  if (config.isWebhookMode) {
    await loadWebhookBot(config)
  }
  else {
    await loadPollingBot(config)
  }
  return bot
}

async function loadPollingBot(config: PollingConfig) {
  const bot = botDi.getBot()
  const logger = botDi.getLogger()
  let runner: undefined | RunnerHandle

  // graceful shutdown
  onShutdown(async () => {
    logger.info('Bot shutdown')
    await runner?.stop()
  })

  await bot.api.deleteWebhook().catch(console.error)

  // start bot
  runner = run(bot, {
    runner: {
      fetch: {
        allowed_updates: config.botAllowedUpdates,
      },
    },
  })

  logger.info({
    msg: 'Bot running in polling mode...',
    username: bot.botInfo.username,
  })
}

async function loadWebhookBot(config: WebhookConfig) {
  const bot = botDi.getBot()
  const logger = botDi.getLogger()

  // set webhook
  await bot.api.setWebhook(config.botWebhook, {
    allowed_updates: config.botAllowedUpdates,
    secret_token: config.botWebhookSecret,
  }).catch(console.error)
  logger.info({
    msg: 'Webhook was set',
    url: config.botWebhook,
  })
}
