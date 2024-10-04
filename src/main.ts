#!/usr/bin/env tsx

import process from 'node:process'
import { logger } from '#root/logger.js'
import { config } from '#root/configs/bot.js'
import loadBot from '#root/loaders/bot.loader.js'
import { loadServer } from '#root/loaders/server.loader.js'

try {
  const bot = await loadBot(config, logger)

  if (config.isWebhookMode) {
    await loadServer(bot, config, logger)
  }

  logger.info('Application started successfully')
}
catch (error) {
  logger.error(error)
  process.exit(1)
}
