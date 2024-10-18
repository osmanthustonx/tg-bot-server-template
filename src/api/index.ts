import ky from 'ky'
import { config } from '#root/configs/bot.js'
import type { BaseRes } from '#root/api/response.js'
import serviceAPI from '#root/api/service.js'
import { convertKeysToCamelCase, convertKeysToSnakeCase } from '#root/utils/transform.js'

export const api = ky.extend({ prefixUrl: config.serviceApiUrl, hooks: {
  beforeRequest: [
    (request, option) => {
      if (!option.body)
        return request
      const originalBody = JSON.parse(option.body as string)
      return new Request(request, {
        body: originalBody ? JSON.stringify(convertKeysToSnakeCase(originalBody)) : undefined,
      })
    },
  ],
  afterResponse: [
    async (_, __, response) => {
      const responseData = await response.json<BaseRes>()
      if (responseData.code === '200') {
        return new Response(
          JSON.stringify(convertKeysToCamelCase(responseData?.data ?? {})),
          {
            status: 200,
            statusText: 'OK',
            headers: response.headers,
          },
        )
      }

      return response
    },
  ],
} })

export const service = serviceAPI(api)
