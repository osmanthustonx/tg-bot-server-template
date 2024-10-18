import { createCallbackData } from 'callback-data'

export const viewTodo = createCallbackData('viewTodoList', { id: String })

export const completeTodo = createCallbackData('completeTodo', { id: String })

export const deleteTodo = createCallbackData('deleteTodo', { id: String })

export const viewCompletedList = createCallbackData('viewCompletedList', {})

export const addTodo = createCallbackData('addTodo', {})

export const settings = createCallbackData('settings', {})
