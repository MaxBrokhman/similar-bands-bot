const filter = require('lodash/filter')
const slice = require('lodash/slice')
const map = require('lodash/map')

const {getArtists} = require('./request-utils')
const {getArtistsKeyboard} = require('./utils')

const searchForArtists = async (query) => {
  const url = `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${query}&api_key=${process.env.LASTFM_API_KEY}&format=json`
  return await getArtists({
    method: 'get',
    url,
  }, 
  ['results', 'artistmatches', 'artist']
  )
}

const getRelatedArtists = async (id) => {
  const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&mbid=${id}&api_key=${process.env.LASTFM_API_KEY}&format=json`
  return await getArtists({
    method: 'get',
    url,
  }, 
  ['similarartists', 'artist']
  )
}

const makeAnswerWithLastFm = async (query, bot, chatId) => {
  const artists = await searchForArtists(query)
  const filteredArtists = filter(artists, (artist => artist.name && artist.mbid))
  const keyboard = getArtistsKeyboard({
    artists: slice(filteredArtists, 0, 5),
    nameField: 'name',
    idField: 'mbid',
  })
  bot.sendMessage(
    chatId, 
    'Which band did you mean?', 
    keyboard,
  );
  bot.on('callback_query', async (query) => {
    const related = await getRelatedArtists(query.data)
    const relatedMapped = map(slice(related, 0, 5), (artist) => artist.name)
    bot.sendMessage(chatId, relatedMapped.join(', '))
  })
}

module.exports = {
  searchForArtists,
  makeAnswerWithLastFm,
}
