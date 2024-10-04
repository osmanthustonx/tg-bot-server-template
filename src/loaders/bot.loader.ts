import { type RunnerHandle, run } from '@grammyjs/runner'
import { createBot } from '#root/bot/index.js'
import type { Config, PollingConfig, WebhookConfig } from '#root/configs/bot.js'
import type { Logger } from '#root/logger.js'
import { onShutdown } from '#root/utils/starter.js'

export default async function loadBot(config: Config, logger: Logger) {
  const bot = createBot(config.botToken, { config, logger })
  await bot.init()
  if (config.isWebhookMode) {
    await loadWebhookBot(bot, config, logger)
  }
  else {
    await loadPollingBot(bot, config, logger)
  }
  return bot
}

async function loadPollingBot(bot: ReturnType<typeof createBot>, config: PollingConfig, logger: Logger) {
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

async function loadWebhookBot(bot: ReturnType<typeof createBot>, config: WebhookConfig, logger: Logger) {
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
