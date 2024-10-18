import { InlineKeyboard } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { addTodo, completeTodo, deleteTodo, settings, viewCompletedList, viewTodo } from '#root/bot/callback-data/start.callbackdata.js'
import { backElement } from '#root/bot/keyboards/common.keyboard.js'

export function startKeyboard(ctx: Context) {
  const keyboard = [
    ctx.session.pending.map(todo => ({ text: ctx.t('start.view-todo', { name: todo.name }), callback_data: viewTodo.pack({ id: todo.id }) })),
    [
      { text: ctx.t('start.view-completed-list'), callback_data: viewCompletedList.pack({}) },
      { text: ctx.t('start.add-todo'), callback_data: addTodo.pack({}) },
    ],
    [
      { text: ctx.t('start.settings'), callback_data: settings.pack({}) },
    ],
  ]

  return InlineKeyboard.from(keyboard)
}

export function viewTodoKeyboard(ctx: Context, id: string) {
  const keyboard = [
    [
      { text: '標示完成', callback_data: completeTodo.pack({ id }) },
      { text: '刪除', callback_data: deleteTodo.pack({ id }) },
      backElement(ctx, 'start'),
    ],
  ]

  return InlineKeyboard.from(keyboard)
}

export function completedListKeyboard(ctx: Context) {
  const keyboard = [
    [
      backElement(ctx, 'start'),
    ],
  ]

  return InlineKeyboard.from(keyboard)
}
