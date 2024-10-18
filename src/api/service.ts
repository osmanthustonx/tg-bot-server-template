import type { KyInstance } from 'ky'
import { to } from 'await-to-js'
import type { BaseRes, ErrorRes } from '#root/api/response.js'
import type { Context } from '#root/bot/context.js'

export default function serviceAPI(instance: KyInstance) {
  return {
    getTest: (dataKey: string) => {
      return to<BaseRes, ErrorRes>(instance.get(`https://wic.heo.taipei/OpenData/API/Rain/Get?stationNo=&loginId=open_rain&dataKey=${dataKey}`).json())
    },
    createUser: (ctx: Context) => {
      return to<BaseRes, ErrorRes>(instance.post('users', {
        headers: {
          uuid: ctx.from?.id.toString(),
        },
        json: ctx.from,
      }).json())
    },
  }
}
