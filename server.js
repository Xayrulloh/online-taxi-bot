import { Bot, session } from 'grammy';
import { scenes } from './scenes/index.js'
import dotenv from 'dotenv'

dotenv.config()
const token = process.env.TOKEN, bot = new Bot(token);

// middlewares
bot.use( session({ initial: () => ({}), }) )
bot.use(scenes.manager())
bot.use(scenes)

// Commands
bot.command('start', async(ctx) => {
    await ctx.scenes.enter('Start')
})

bot.command('register', async(ctx) => {
    await ctx.scenes.enter('reRegister')
})

bot.command('order', async(ctx) => {
    await ctx.scenes.enter('Order')
})

bot.command('client', async(ctx) => {
    await ctx.scenes.enter('Client')
})

bot.command('history', async(ctx) => {
    await ctx.scenes.enter('History')
})

bot.start()