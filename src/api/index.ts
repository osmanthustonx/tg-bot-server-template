import ky, { type Options as KyOptions } from 'ky'
import serviceAPI from '#root/api/service.js'
import { config } from '#root/configs/bot.js'
import { di } from '#root/server/di/bot.container.js'

// Default timeout for API requests (10 seconds)
const DEFAULT_TIMEOUT = 10000

// Default retry configuration
const DEFAULT_RETRY = {
  limit: 2,
  methods: ['GET'],
  statusCodes: [408, 413, 429, 500, 502, 503, 504],
  backoffLimit: 3000,
}

/**
 * Create API client with enhanced error handling and logging
 */
export function createApiClient(baseUrl?: string, options: KyOptions = {}) {
  const logger = di.getLogger()

  return ky.extend({
    prefixUrl: baseUrl || config.serviceApiUrl,
    timeout: DEFAULT_TIMEOUT,
    retry: DEFAULT_RETRY,
    hooks: {
      beforeRequest: [
        (request, option) => {
          // Add request ID for tracking
          const requestId = Math.random().toString(36).substring(2, 10)
          request.headers.set('X-Request-Id', requestId)

          // Log outgoing request
          logger.debug({
            msg: 'API Request',
            method: request.method,
            url: request.url,
            requestId,
          })

          // Transform request body from camelCase to snake_case
          if (!option.body)
            return request
          const originalBody = JSON.parse(option.body as string)
          return new Request(request, {
            body: originalBody ? JSON.stringify(originalBody) : undefined,
          })
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          const requestId = request.headers.get('X-Request-Id')
          const url = request.url
          const method = request.method

          try {
            // Clone response to avoid consuming it
            const clonedResponse = response.clone()
            const responseData = await clonedResponse.json()

            // Log response
            logger.debug({
              msg: 'API Response',
              method,
              url,
              status: response.status,
              requestId,
              success: responseData.code === 200,
            })

            // Handle successful response
            if (responseData.code === 200) {
              return new Response(
                JSON.stringify(responseData?.data ?? {}),
                {
                  status: 200,
                  statusText: 'OK',
                  headers: response.headers,
                },
              )
            }

            // Handle API error
            logger.error({
              msg: 'API Error',
              method,
              url,
              status: response.status,
              requestId,
              errorCode: responseData.code,
              errorMsg: responseData.message,
            })

            return new Response(
              JSON.stringify({
                error: true,
                code: responseData.code,
                message: responseData.message || 'Unknown error',
                data: responseData.data,
              }),
              {
                status: responseData.status || 400,
                statusText: responseData.message || 'Error',
                headers: response.headers,
              },
            )
          }
          catch (error) {
            // Handle JSON parsing error
            logger.error({
              msg: 'API Response Parse Error',
              method,
              url,
              status: response.status,
              requestId,
              error,
            })

            return new Response(
              JSON.stringify({
                error: true,
                code: 500,
                message: 'Failed to parse response',
                originalError: error instanceof Error ? error.message : String(error),
              }),
              {
                status: 500,
                statusText: 'Parse Error',
                headers: response.headers,
              },
            )
          }
        },
      ],
      beforeError: [
        (error) => {
          // Log network or timeout errors
          logger.error({
            msg: 'API Request Failed',
            method: error.request?.method,
            url: error.request?.url,
            name: error.name,
            message: error.message,
          })

          return error
        },
      ],
    },
    ...options,
  })
}

// Create default API client
export const api = createApiClient()

// Create service with the API client
export const service = serviceAPI(api)
