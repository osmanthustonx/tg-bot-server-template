import type { Update, UserFromGetMe } from '@grammyjs/types'
import { type Api, Context as DefaultContext, type SessionFlavor } from 'grammy'
import type { AutoChatActionFlavor } from '@grammyjs/auto-chat-action'
import type { HydrateFlavor } from '@grammyjs/hydrate'
import type { I18nFlavor } from '@grammyjs/i18n'
import type { ParseModeFlavor } from '@grammyjs/parse-mode'
import type { ConversationFlavor } from '@grammyjs/conversations'
import type { Logger } from '#root/logger.js'
import type { Config } from '#root/configs/bot.js'

interface todo { id: string, name: string, priority: 'high' | 'medium' | 'low', due_date: string, status: 'pending' | 'completed' | 'deleted', created_at: string }

export interface SessionData {
  perm: {
    pending: todo[]
    completed: (todo & { completed_at: string })[]
    deleted: (todo & { deleted_at: string })[]
    settings: {
      reminders_enabled: boolean
    }
  }
  temp: {
    adding?: todo
    addingForm: Record<number, todo>
    conversationMsgBuffer: number[]
  }
}

interface ExtendedContextFlavor {
  logger: Logger
  config: Config
}

export type Context = ParseModeFlavor<
  HydrateFlavor<
    DefaultContext &
    ExtendedContextFlavor &
    SessionFlavor<SessionData> &
    I18nFlavor &
    ConversationFlavor &
    AutoChatActionFlavor
  >
>

interface Dependencies {
  logger: Logger
  config: Config
}

export function createContextConstructor(
  {
    logger,
    config,
  }: Dependencies,
) {
  return class extends DefaultContext implements ExtendedContextFlavor {
    logger: Logger
    config: Config

    constructor(update: Update, api: Api, me: UserFromGetMe) {
      super(update, api, me)

      Object.defineProperty(this, 'logger', {
        writable: true,
      })

      this.logger = logger.child({
        update_id: this.update.update_id,
      })
      this.config = config
    }
  } as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context
}
