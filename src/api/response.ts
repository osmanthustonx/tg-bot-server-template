import type { HTTPError } from 'ky'
import type { CamelCasedPropertiesDeep } from 'type-fest'

export interface BaseRes {
  code: string
  message: string
  data?: unknown
}

export type ErrorRes = HTTPError<BaseRes>

export type ExampleRes = CamelCasedPropertiesDeep<{
  id: number
}>
