import { GrammyError, HttpError } from 'grammy'

export function getErrorMessage(error: unknown): string {
  if (error instanceof GrammyError) {
    return `[${error.error_code}] ${error.payload.chat_id} ${error.method}: ${error.description}`
  }
  if (error instanceof HttpError) {
    return `Network error: ${error.message}`
  }
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export class PayloadError extends Error {
  public payload: unknown

  constructor(message: string, payload: unknown) {
    super(message)
    this.name = 'PayloadError'
    this.payload = payload
  }
}
