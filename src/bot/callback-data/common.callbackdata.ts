import { createCallbackData } from 'callback-data'

export const back = createCallbackData('back', { to: String })

export const retry = createCallbackData('retry', { conversation: String })

export const cancel = createCallbackData('cancel', {})
