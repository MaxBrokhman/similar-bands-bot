const map = require('lodash/map')
const slice = require('lodash/slice')

const getArtistsKeyboard = (artists) => ({
  reply_markup: {
    inline_keyboard: map(artists, ({name}) => ([{
      text: name,
      callback_data: name,
    }])),
  },
})

const getChoosingArtistKeyboard = (lastfmArtists, spotifyArtists) => {
  return lastfmArtists.length > spotifyArtists.length 
    ? getArtistsKeyboard(slice(lastfmArtists, 0, 5))
    : getArtistsKeyboard(slice(spotifyArtists, 0, 5))
}

const getLastfmSearchUrl = (query) => `http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${query}&api_key=${process.env.LASTFM_API_KEY}&format=json`

const getLastfmRelatedArtistUrl = (id) => `http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&mbid=${id}&api_key=${process.env.LASTFM_API_KEY}&format=json`

const getSpotifyAuthBasicString = () => `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`

const normalizeString = (str) => str.trim().toLowerCase()

const checkArtistName = (name) => (artist) => (
  normalizeString(artist.name) === normalizeString(name)
) 

module.exports = {
  getLastfmSearchUrl,
  getLastfmRelatedArtistUrl,
  getSpotifyAuthBasicString,
  normalizeString,
  getChoosingArtistKeyboard,
  getArtistsKeyboard,
  checkArtistName,
}
