const querystring = require('querystring');

const {sendRequest} = require('./send-request')
const {getArtists} = require('./request-utils')
const {getSpotifyAuthBasicString} = require('./utils')

const getSpotifyAuthToken = async () => {
  const data = await sendRequest({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'client_credentials',
    }),
    config: {
      headers: {
        Authorization: getSpotifyAuthBasicString(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, 
    error: 'auth request error',
  })
  return data.access_token
}

let authToken;

const searchForArtistOnSpotify = async (query) => {
  const artists = await getArtists({
    method: 'get',
    url: `https://api.spotify.com/v1/search?q=${query}&type=artist`,
    config: {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    },
    error: 'error fetching id ',
  },
  ['artists', 'items'],
  )
  return artists
}

const getArtistsOnSpotify = async (query) => {
  if (!authToken) {
    authToken = await getSpotifyAuthToken()
  }
  return await searchForArtistOnSpotify(query, authToken)
}

const getRelatedArtistsOnSpotify = async (id) => {
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

module.exports = {
  getArtistsOnSpotify,
  getRelatedArtistsOnSpotify,
}
