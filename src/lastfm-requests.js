const filter = require('lodash/filter')

const {getArtists} = require('./request-utils')
const {
  getLastfmSearchUrl,
  getLastfmRelatedArtistUrl,
} = require('./utils')

const getArtistsOnLastfm = async (query) =>  {
  const artists = await getArtists({
    method: 'get',
    url: getLastfmSearchUrl(query),
  }, 
  ['results', 'artistmatches', 'artist']
  )
  return filter(artists, (artist => artist.name && artist.mbid))
}

const getRelatedArtistsOnLastfm = async (id) => await getArtists({
    method: 'get',
    url: getLastfmRelatedArtistUrl(id),
  }, 
  ['similarartists', 'artist']
)

module.exports = {
  getArtistsOnLastfm,
  getRelatedArtistsOnLastfm,
}
