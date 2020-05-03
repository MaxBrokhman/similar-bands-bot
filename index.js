const TelegramBot = require('node-telegram-bot-api')

const {makeAnswerWithSpotify} = require('./spotify-requests')
const {makeAnswerWithLastFm} = require('./lastfm-requests')

const bot = new TelegramBot(process.env.BOT_API_KEY, {
  polling: true,
})

bot.on('contact', async (msg) => {
  const chatId = msg.chat.id
  bot.sendMessage(chatId, 'Hello World!')
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  const bandName = msg.text.trim().toLowerCase()
  const bandNamePrepared = bandName.split(' ').join('%20')
  // makeAnswerWithSpotify(bandNamePrepared, bot, chatId)
  makeAnswerWithLastFm(bandNamePrepared, bot, chatId)
});


