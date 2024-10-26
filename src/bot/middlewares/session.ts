import { type Middleware, type SessionOptions, session as createSession } from 'grammy'
import type { Context, SessionData } from '#root/bot/context.js'

type Options = Pick<SessionOptions<SessionData, Context>, 'getSessionKey' | 'storage'>

export function session(options: Options): Middleware<Context> {
  return createSession({
    getSessionKey: options.getSessionKey,
    storage: options.storage,
    initial: () => ({
      conversationMsgBuffer: [],
      adding: undefined,
      addingForm: {},
      pending: [
        {
          id: '1',
          name: 'Buy groceries',
          priority: 'high',
          due_date: '2024-10-20T12:00:00Z',
          status: 'pending',
          created_at: '2024-10-18T08:30:00Z',
        },
        {
          id: '2',
          name: 'Prepare presentation',
          priority: 'medium',
          due_date: '2024-10-22T09:00:00Z',
          status: 'pending',
          created_at: '2024-10-18T09:15:00Z',
        },
      ],
      completed: [
        {
          id: '3',
          name: 'Clean the house',
          priority: 'low',
          completed_at: '2024-10-17T17:00:00Z',
          due_date: '2024-10-17T15:00:00Z',
          status: 'completed',
          created_at: '2024-10-10T08:00:00Z',
        },
      ],
      deleted: [
        {
          id: '4',
          name: 'Cancel gym membership',
          priority: 'medium',
          deleted_at: '2024-10-18T10:00:00Z',
          due_date: '2024-10-20T11:00:00Z',
          status: 'deleted',
          created_at: '2024-10-15T14:30:00Z',
        },
      ],
      settings: {
        reminders_enabled: true,
      },
    }),
  })
}
