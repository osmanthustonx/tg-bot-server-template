import dedent from 'dedent'
import type { Context } from '#root/bot/context.js'

export function todoListMessage(ctx: Context) {
  const content = ctx.session.perm.pending.map((todo, index) => {
    return dedent`
    ${index + 1}. ${todo.name} - ${todo.priority}
    `
  }).join('\n')
  return dedent`
    <b>${ctx.t('start.view-todo-list')}</b>
    ${content}
  `
}

export function viewTodoMessage(ctx: Context, id: string) {
  const content = ctx.session.perm.pending.find(todo => todo.id === id)
  if (!content)
    return '沒找到'
  return dedent`
    名稱: ${content.name}
    優先級: ${content.priority}
    日期: ${content.due_date}
    狀態: ${content.status}
  `
}

export function completedListMessage(ctx: Context) {
  const content = ctx.session.perm.completed.map((todo, index) => {
    return dedent`
    ${index + 1}. ${todo.name} - ${todo.priority} - ${todo.completed_at}
    `
  }).join('\n')
  return dedent`
    <b>${ctx.t('start.view-completed-list')}</b>
    ${content}
  `
}
