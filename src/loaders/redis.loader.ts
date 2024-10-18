import { RedisAdapter } from '@grammyjs/storage-redis'
import { Redis } from 'ioredis'
import type { SessionData } from '#root/bot/context.js'
import { config } from '#root/configs/bot.js'

export function loadRedisStorage() {
  const redisInstance = new Redis({
    host: config.redisHost,
    port: config.redisPort,
    db: config.redisIndex,
  })

  const botSessionStorage = new RedisAdapter<SessionData>({
    instance: redisInstance,
    ttl: 604_800, // 7 天
  })

  return {
    redisInstance,
    botSessionStorage,
  }
}
