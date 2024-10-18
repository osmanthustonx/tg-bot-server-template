import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { handleCommandStart, handleEditCompleteTodo, handleEditCompletedList, handleEditDeletedTodo, handleEditViewTodo } from '#root/bot/handlers/start.handler.js'
import { completeTodo, deleteTodo, viewCompletedList, viewTodo } from '#root/bot/callback-data/start.callbackdata.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private')

feature.command('start', logHandle('command-start'), handleCommandStart)

feature.callbackQuery(viewTodo.filter(), logHandle('view todo'), (ctx) => {
  return Promise.all([
    handleEditViewTodo(ctx),
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
