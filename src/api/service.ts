import type { KyInstance } from 'ky'
import { to } from 'await-to-js'
import type { BaseRes, ErrorRes } from '#root/api/response.js'
import type { Context } from '#root/bot/context.js'

export default function serviceAPI(instance: KyInstance) {
  return {
    createUser: (ctx: Context) => {
      return to<BaseRes, ErrorRes>(instance.post('users', {
        headers: {
          uuid: ctx.from?.id.toString(),
        },
        json: {
          payload: {
            ...ctx.from,
          },
        },
      }).json())
    },
  }
}
