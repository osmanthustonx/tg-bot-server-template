import { Hono } from 'hono'
import { getBasicHandler } from '#root/server/controllers/bot.controller.js'

const botRouter = new Hono()

botRouter.get('/test', getBasicHandler)

export default botRouter
