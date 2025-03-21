import { GrammyError, HttpError } from 'grammy'

/**
 * Base error class for application-specific errors
 * Provides consistent error structure with timestamp and error code
 */
export class BaseError extends Error {
  public readonly timestamp: Date
  public readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = this.constructor.name
    this.timestamp = new Date()
    this.code = code
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      stack: this.stack,
    }
  }
}

/**
 * Error class for payload-related errors
 * Includes the original payload that caused the error
 */
export class PayloadError extends BaseError {
  public readonly payload: unknown

  constructor(message: string, payload: unknown, code = 'PAYLOAD_ERROR') {
    super(message, code)
    this.payload = payload
  }

  toJSON() {
    return {
      ...super.toJSON(),
      payload: this.payload,
    }
  }
}

/**
 * Error class for validation errors
 */
export class ValidationError extends BaseError {
  constructor(message: string, code = 'VALIDATION_ERROR') {
    super(message, code)
  }
}

/**
 * Error class for API-related errors
 */
export class ApiError extends BaseError {
  constructor(message: string, code = 'API_ERROR') {
    super(message, code)
  }
}

/**
 * Error class for authentication errors
 */
export class AuthError extends BaseError {
  constructor(message: string, code = 'AUTH_ERROR') {
    super(message, code)
  }
}

/**
 * Get a standardized error message from any error type
 * @param error - The error to process
 * @returns A formatted error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof BaseError) {
    return `[${error.code}] ${error.message}`
  }
  if (error instanceof GrammyError) {
    return `[BOT_ERROR_${error.error_code}] ${error.payload.chat_id} ${error.method}: ${error.description}`
  }
  if (error instanceof HttpError) {
    return `[NETWORK_ERROR] ${error.message}`
  }
  if (error instanceof Error) {
    return `[UNKNOWN_ERROR] ${error.message}`
  }
  return `[UNEXPECTED_ERROR] ${error}`
}

/**
 * Safely parse JSON with error handling
 * @param jsonString - The JSON string to parse
 * @returns The parsed object or null if parsing failed
 */
export function safeJsonParse<T>(jsonString: string): T | null {
  try {
    return JSON.parse(jsonString) as T
  }
  catch {
    // Silently return null on parsing errors
    return null
  }
}

/**
 * Wrap an async function with error handling
 * @param fn - The async function to wrap
 * @returns A function that returns a Result object with success/error status
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
): Promise<{ success: true, data: T } | { success: false, error: unknown }> {
  try {
    const data = await fn()
    return { success: true, data }
  }
  catch (error) {
    return { success: false, error }
  }
}
