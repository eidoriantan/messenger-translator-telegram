/**
 *  Messenger Translator for Telegram
 *  Copyright (C) 2021, Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const TeleBot = require('telebot')

const localeStrings = require('./src/locale/')
const logger = require('./src/utils/log.js')

const database = require('./src/database.js')
const users = require('./src/users.js')
const feedbacks = require('./src/feedbacks.js')
const profile = require('./src/profile.js')
const translate = require('./src/translate.js')

const BOT_TOKEN = process.env.BOT_TOKEN
const URL = process.env.URL
const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || 443
const DEBUG = process.env.DEBUG

if (!BOT_TOKEN) throw new Error('Bot token/URL is not defined')

const bot = new TeleBot({
  token: BOT_TOKEN,
  webhook: {
    url: URL,
    host: HOST,
    port: PORT
  }
})

bot.on(['/help', '/start'], async (msg) => {
  const senderID = msg.from.id
  let user = await users.getUser(senderID)
  if (user === null) user = await users.addUser(msg.from)

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  const helpMessage = localeStrings(user.locale, 'help')
  msg.reply.text(helpMessage)
})

bot.on(/^(\/language) (.+)$/i, async (msg, props) => {
  const senderID = msg.from.id
  let user = await users.getUser(senderID)
  if (user === null) user = await users.addUser(msg.from)

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  const language = props.match[2]
  const response = await profile.changeLanguage(user, language)
  msg.reply.text(response)
})

bot.on(/^(\/feedback) (.+)$/i, async (msg, props) => {
  const senderID = msg.from.id
  let user = await users.getUser(senderID)
  if (user === null) user = await users.addUser(msg.from)

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  const message = props.match[2]
  const response = localeStrings(user.locale, 'feedback_confirmation')
  await feedbacks.logFeedback(senderID, msg.from.username, message)
  msg.reply.text(response)
})

bot.on('/messageonly', async (msg) => {
  const senderID = msg.from.id
  let user = await users.getUser(senderID)
  if (user === null) user = await users.addUser(msg.from)

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  user.message = user.message === 0 ? 1 : 0
  const id = 'message_only_' + (user.message === 1 ? 'enabled' : 'disabled')
  const response = localeStrings(user.locale, id)
  await users.setUser(user)
  msg.reply.text(response)
})

bot.on('text', async (msg) => {
  if (msg.text.startsWith('/')) return

  const senderID = msg.from.id
  let user = await users.getUser(senderID)
  if (user === null) user = await users.addUser(msg.from)

  if (DEBUG) {
    console.log('User Data: ')
    console.log(user)
  }

  const response = await translate(msg.text, user)
  msg.reply.text(response)
})

bot.start()

bot.on('stop', async () => {
  console.log('Server is closing...')
  logger.close()
  database.close()
})

process.on('SIGINT', () => {
  bot.stop()
})

process.on('uncaughtException', error => {
  logger.write('Uncaught Exception', 1)
  logger.write(`Error: ${error.message}`, 1)
  logger.write(error, 1)
})

process.on('unhandledRejection', error => {
  logger.write('Unhandled Promise rejection', 1)
  logger.write('Error:', 1)
  logger.write(error, 1)
})
