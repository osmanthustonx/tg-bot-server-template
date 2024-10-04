import { createServer, createServerManager } from '#root/server/index.js'
import type { WebhookConfig } from '#root/configs/bot.js'
import type { Logger } from '#root/logger.js'
import type { Bot } from '#root/bot/index.js'
import { onShutdown } from '#root/utils/starter.js'

export async function loadServer(bot: Bot, config: WebhookConfig, logger: Logger) {
  const server = createServer({
    bot,
    config,
    logger,
  })
  const serverManager = createServerManager(server, {
    host: config.serverHost,
    port: config.serverPort,
  })

  onShutdown(async () => {
    logger.info('Server shutdown')
    await serverManager.stop()
  })

  const info = await serverManager.start()
  logger.info({
    msg: 'Server started',
    url: info.url,
  })

  return serverManager
}
