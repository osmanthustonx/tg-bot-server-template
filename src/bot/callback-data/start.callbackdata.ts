import { createCallbackData } from 'callback-data'

export const viewTodo = createCallbackData('viewTodoList', { id: String })

export const completeTodo = createCallbackData('completeTodo', { id: String })

export const deleteTodo = createCallbackData('deleteTodo', { id: String })

export const viewCompletedList = createCallbackData('viewCompletedList', {})

export const addTodo = createCallbackData('addTodo', {})

export const setTodoName = createCallbackData('setTodoName', {})

export const selectPriority = createCallbackData('selectPriority', {})

export const setPriority = createCallbackData('setPriority', { priority: String })

export const setTodoDueDay = createCallbackData('setTodoDueDay', {})

export const submitTodo = createCallbackData('submitTodo', {})

export const settings = createCallbackData('settings', {})
