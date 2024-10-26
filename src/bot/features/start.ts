import { randomUUID } from 'node:crypto'
import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { handleCommandStart, handleEditAddTodo, handleEditCompleteTodo, handleEditCompletedList, handleEditDeletedTodo, handleEditSelectPriority, handleEditViewTodo } from '#root/bot/handlers/start.handler.js'
import { addTodo, completeTodo, deleteTodo, selectPriority, setPriority, setTodoName, viewCompletedList, viewTodo } from '#root/bot/callback-data/start.callbackdata.js'
import { SET_TODO_NAME_CONVERSATION } from '#root/bot/conversation/start.conversation.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('start', logHandle('command-start'), handleCommandStart)

feature.callbackQuery(viewTodo.filter(), logHandle('view todo'), (ctx) => {
  return Promise.all([
    handleEditViewTodo(ctx),
    ctx.answerCallbackQuery(),
  ])
})

feature.callbackQuery(addTodo.filter(), logHandle('add todo'), (ctx) => {
  // ctx.session.adding = {
  //   id: randomUUID(),
  //   created_at: new Date().toDateString(),
  //   due_date: '',
  //   name: '',
  //   priority: 'low',
  //   status: 'pending',
  // }
  if (ctx.callbackQuery.message?.message_id) {
    ctx.session.addingForm[ctx.callbackQuery.message.message_id] = {
      id: randomUUID(),
      created_at: new Date().toDateString(),
      due_date: '',
      name: '',
      priority: 'low',
      status: 'pending',
    }
  }
  return Promise.all([
    handleEditAddTodo(ctx),
    ctx.answerCallbackQuery(),
  ])
})

feature.callbackQuery(setTodoName.filter(), logHandle('set todo name'), async (ctx) => {
  return Promise.all([
    ctx.conversation.enter(SET_TODO_NAME_CONVERSATION),
    ctx.answerCallbackQuery(),
  ])
})

feature.callbackQuery(selectPriority.filter(), logHandle('select priority'), (ctx) => {
  return Promise.all([
    handleEditSelectPriority(ctx),
    ctx.answerCallbackQuery(),
  ])
})

feature.callbackQuery(setPriority.filter(), logHandle('set priority'), (ctx) => {
  const { priority } = setPriority.unpack(ctx.callbackQuery.data)
  if (ctx.callbackQuery.message?.message_id)
    ctx.session.addingForm[ctx.callbackQuery.message.message_id].priority = priority as 'low' | 'medium' | 'high'
  return Promise.all([
    handleEditAddTodo(ctx),
    ctx.answerCallbackQuery(),
  ])
})

feature.callbackQuery(completeTodo.filter(), logHandle('complete todo'), (ctx) => {
  return Promise.all([
    handleEditCompleteTodo(ctx),
    ctx.answerCallbackQuery(),
  ])
})

feature.callbackQuery(deleteTodo.filter(), logHandle('delete todo'), (ctx) => {
  return Promise.all([
    handleEditDeletedTodo(ctx),
    ctx.answerCallbackQuery(),
  ])
})

feature.callbackQuery(viewCompletedList.filter(), logHandle('view completed list'), (ctx) => {
  return Promise.all([
    handleEditCompletedList(ctx),
    ctx.answerCallbackQuery(),
  ])
})

export { composer as startFeature }
