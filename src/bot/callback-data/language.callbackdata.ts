import { createCallbackData } from 'callback-data'

export const language = createCallbackData('language', {})

export const changeLanguageData = createCallbackData('language', {
  code: String,
})
