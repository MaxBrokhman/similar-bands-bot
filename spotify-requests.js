const querystring = require('querystring');
const slice = require('lodash/slice')

const {sendRequest} = require('./send-request')
const {getArtists} = require('./request-utils')
const {getArtistsKeyboard} = require('./utils')

const getSpotifyAuthToken = async () => {
  const data = await sendRequest({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'client_credentials',
    }),
    config: {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, 
    error: 'auth request error',
  })
  return data.access_token
}

const searchForArtistOnSpotify = async (query, token) => {
  const artists = await getArtists({
    method: 'get',
    url: `https://api.spotify.com/v1/search?q=${query}&type=artist`,
    config: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    error: 'error fetching id ',
  },
  ['artists', 'items'],
  )
  return slice(artists, 0, 5)
}

let authToken;

const getArtistsOnSpotify = async (query) => {
  if (!authToken) {
    authToken = await getSpotifyAuthToken()
  }
  let artists = await searchForArtistOnSpotify(query, authToken)
  if (!artists) {
    authToken = await getSpotifyAuthToken()
    artists = await searchForArtistOnSpotify(query, authToken)
  }
  return artists
}

const getSpotifyRelatedArtists = async (id) => {
  const data = await sendRequest({
    method: 'get',
    url: `https://api.spotify.com/v1/artists/${id}/related-artists`,
    config: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  })
  return data.artists
}

const getMostSimilarArtist = (artist, similarArtists) => {
  const mappedArtists =  similarArtists.map((item) => {
    const commonGenres = item.genres.reduce((sum, genre) => {
      if (artist.genres.indexOf(genre) > -1) sum += 1
      return sum
    }, 0)
    return {
      name: item.name,
      count: commonGenres,
    }
  })
  return mappedArtists.sort((a, b) => b.count - a.count).slice(0, 5)
}

const makeAnswerWithSpotify = async (query, bot, chatId) => {
  const artists = await getArtistsOnSpotify(query)
  bot.sendMessage(
    chatId, 
    'Which band did you mean?', 
    getArtistsKeyboard({
      artists,
      nameField: 'name',
      idField: 'id',
    }),
  );

  bot.on('callback_query', async (query) => {
    const relatedArtists = await getSpotifyRelatedArtists(query.data)
    const choosedArtist = artists.find(artist => artist.id === query.data)
    const similarsByGenre = getMostSimilarArtist(choosedArtist, relatedArtists)
    console.log('related artists ', relatedArtists.map(artist => artist.name).slice(0, 5).join(', '))
    bot.sendMessage(chatId, similarsByGenre.map(artist => artist.name).join(', '))
  })
}

module.exports = {
  makeAnswerWithSpotify,
}
