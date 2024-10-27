import { RedisAdapter } from '@grammyjs/storage-redis'
import { Redis } from 'ioredis'
import type { SessionData } from '#root/bot/context.js'
import { config } from '#root/configs/bot.js'

export function loadRedisStorage() {
  const permRedisInstance = new Redis({
    host: config.redisHost,
    port: config.redisPort,
    db: config.permRedisIndex,
  })

  const permSessionStorage = new RedisAdapter<SessionData['perm']>({
    instance: permRedisInstance,
  })

  const tempRedisInstance = new Redis({
    host: config.redisHost,
    port: config.redisPort,
    db: config.tempRedisIndex,
  })

  const tempSessionStorage = new RedisAdapter<SessionData['temp']>({
    instance: tempRedisInstance,
    ttl: 86_400, // 1 天
    // ttl: 20, // 20 秒
  })

  return {
    permRedisInstance,
    tempRedisInstance,
    permSessionStorage,
    tempSessionStorage,
  }
}
