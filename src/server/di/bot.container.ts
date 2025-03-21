import type { Redis } from 'ioredis'
import type { Api, Bot, RawApi } from 'grammy'
import type { Logger } from '#root/logger.js'
import type { Config } from '#root/configs/bot.js'
import type { Context } from '#root/bot/context.js'

class BotContainer {
  private static instance: BotContainer
  private bot: Bot<Context, Api<RawApi>> | null = null
  private redisClient: Redis | null = null
  private logger: Logger | null = null
  private config: Config | null = null

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new BotContainer()
    }
    return this.instance
  }

  setBot(bot: Bot<Context, Api<RawApi>>) {
    this.bot = bot
    return this
  }

  setLogger(logger: Logger) {
    this.logger = logger
    return this
  }

  setConfig(config: Config) {
    this.config = config
    return this
  }

  setRedisClient(client: Redis) {
    this.redisClient = client
    return this
  }

  getBot() {
    if (!this.bot)
      throw new Error('Bot not initialized')
    return this.bot
  }

  getLogger() {
    if (!this.logger)
      throw new Error('Logger not initialized')
    return this.logger
  }

  getConfig() {
    if (!this.config)
      throw new Error('Config not initialized')
    return this.config
  }

  getRedisClient() {
    if (!this.redisClient)
      throw new Error('Redis client not initialized')
    return this.redisClient
  }
}

export const botDi = BotContainer.getInstance()
