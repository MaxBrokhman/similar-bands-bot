const TelegramBot = require('node-telegram-bot-api')
const get = require('lodash/get')
const express = require('express')
const bodyParser = require('body-parser')

const {
  normalizeString, 
  getChoosingArtistKeyboard, 
  getArtistsKeyboard,
} = require('./src/utils')
const {getRelatedArtists, getSearchedArtists} = require('./src/main-requests')

// const bot = new TelegramBot(process.env.BOT_API_KEY, {
//   polling: true,
// })
const bot = new TelegramBot(process.env.BOT_API_KEY)
bot.setWebHook(`${process.env.HEROKU_URL}${bot.token}`);

const postRelatedArtists = async ({
  chatId,
  name, 
  lastfmArtists, 
  spotifyArtists,
}) => {
  const relatedArtists = await getRelatedArtists({
    name,
    lastfmArtists,
    spotifyArtists,
  })
  if (!relatedArtists.length) {
    return bot.sendMessage(chatId, 'This artist unique! Nothing similar found');
  }
  bot.sendMessage(
    chatId, 
    relatedArtists.join(', '),
  );
}

bot.on('message', async (msg) => {
  const chatId = msg.chat.id
  if (msg.text === '/start') {
    return bot.sendMessage(chatId, `Hello! Enter artist's name to search for similar artists`)
  }
  const bandName = normalizeString(msg.text).split(' ').join('%20')
  bot.sendMessage(chatId, 'Wait a second..')

  const {lastfmArtists, spotifyArtists} = await getSearchedArtists(bandName)

  const queryCallback = (query) => {
    bot.removeListener('callback_query', queryCallback)
    bot.sendMessage(query.message.chat.id, 'Wait a second..')
    return postRelatedArtists({
      chatId: query.message.chat.id,
      name: query.data,
      lastfmArtists,
      spotifyArtists,
    })
  }

  const updateListenerAndSendAnswer = (keyboard) => {
    bot.addListener('callback_query', queryCallback) 
    bot.sendMessage(
      chatId, 
      'Which band did you have in mind?', 
      keyboard,
    );
  }

  if (lastfmArtists.length > 1 && spotifyArtists.length > 1) {
    return updateListenerAndSendAnswer(
      getChoosingArtistKeyboard(lastfmArtists, spotifyArtists)
    )
  }

  const lastfmArtist = get(lastfmArtists, ['0'], {})
  const spotifyArtist = get(spotifyArtists, ['0'], {})

  const lastfmName = get(lastfmArtist, 'name', '')
  const spotifyName = get(spotifyArtist, 'name', '')
  if (!lastfmName && !spotifyName) {
    return bot.sendMessage(chatId, 'Sorry, but artist not found')
  }

  if (lastfmName && spotifyName && normalizeString(lastfmName) !== normalizeString(spotifyName)) {
    return updateListenerAndSendAnswer(
      getArtistsKeyboard([lastfmArtist, spotifyArtist])
    )
  }

  const name = lastfmName || spotifyName
  postRelatedArtists({
    chatId,
    name,
    lastfmArtists,
    spotifyArtists,
  })
});

const app = express();
 
app.use(bodyParser.json());
 
app.listen(process.env.PORT || 3000);
 
app.post(`/${bot.token}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});
