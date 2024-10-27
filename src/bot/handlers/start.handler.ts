import type { CallbackQueryContext, CommandContext } from 'grammy'
import dedent from 'dedent'
import type { Context } from '#root/bot/context.js'
import { completedListMessage, todoListMessage, viewTodoMessage } from '#root/bot/messages/start.message.js'
import { addTodoKeyboard, completedListKeyboard, priorityKeyboard, startKeyboard, viewTodoKeyboard } from '#root/bot/keyboards/start.keyboard.js'
import { completeTodo, deleteTodo, viewTodo } from '#root/bot/callback-data/start.callbackdata.js'

export async function handleCommandStart(ctx: CommandContext<Context>) {
  // ctx.conversation.exit()
  return ctx.reply(
    todoListMessage(ctx),
    { reply_markup: startKeyboard(ctx) },
  )
}

export async function handleReplyStart(ctx: Context) {
  return ctx.reply(
    todoListMessage(ctx),
    { reply_markup: startKeyboard(ctx) },
  )
}

export async function handleEditStart(ctx: CallbackQueryContext<Context>) {
  return ctx.editMessageText(
    todoListMessage(ctx),
    { reply_markup: startKeyboard(ctx) },
  )
}

export async function handleEditViewTodo(ctx: CallbackQueryContext<Context>) {
  const { id } = viewTodo.unpack(ctx.callbackQuery.data)
  return ctx.editMessageText(
    viewTodoMessage(ctx, id),
    { reply_markup: viewTodoKeyboard(ctx, id) },
  )
}

export async function handleEditAddTodo(ctx: Context) {
  if (!ctx.callbackQuery?.message?.message_id || !ctx.session.temp.addingForm[ctx.callbackQuery.message.message_id])
    return ctx.reply('session 消失ㄌ')
  const form = ctx.session.temp.addingForm[ctx.callbackQuery.message.message_id]
  return ctx.editMessageText(
    dedent`
      添加代辦事項:
      ${form.name}
      ${form.priority}
      ${form.due_date}
    `,
    { reply_markup: addTodoKeyboard(ctx) },
  )
}

export async function handleReplyAddTodo(ctx: Context) {
  if (!ctx.session.temp.adding)
    return
  return ctx.reply(
    dedent`
      添加代辦事項:
      ${ctx.session.temp.adding.name}
      ${ctx.session.temp.adding.priority}
      ${ctx.session.temp.adding.due_date}
    `,
    { reply_markup: addTodoKeyboard(ctx) },
  )
}

export async function handleEditSelectPriority(ctx: Context) {
  return ctx.editMessageText(
    dedent`請選擇優先級`,
    { reply_markup: priorityKeyboard(ctx) },
  )
}

export async function handleEditCompleteTodo(ctx: CallbackQueryContext<Context>) {
  const { id } = completeTodo.unpack(ctx.callbackQuery.data)
  const targetTodoIndex = ctx.session.perm.pending.findIndex(todo => todo.id === id)
  if (targetTodoIndex !== -1) {
    const completedTodo = {
      ...ctx.session.perm.pending[targetTodoIndex],
      completed_at: new Date().toDateString(),
    }
    ctx.session.perm.completed.push(completedTodo)
    ctx.session.perm.pending.splice(targetTodoIndex, 1)
  }

  return handleEditStart(ctx)
}

export async function handleEditDeletedTodo(ctx: CallbackQueryContext<Context>) {
  const { id } = deleteTodo.unpack(ctx.callbackQuery.data)
  const targetTodoIndex = ctx.session.perm.pending.findIndex(todo => todo.id === id)
  if (targetTodoIndex !== -1) {
    ctx.session.perm.pending.splice(targetTodoIndex, 1)
  }

  return handleEditStart(ctx)
}

export async function handleEditCompletedList(ctx: CallbackQueryContext<Context>) {
  return ctx.editMessageText(
    completedListMessage(ctx),
    { reply_markup: completedListKeyboard(ctx) },
  )
}
