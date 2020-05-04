const axios = require('axios').default
const get = require('lodash/get')
const find = require('lodash/find')
const intersectionBy = require('lodash/intersectionBy')
const map = require('lodash/map')

const {checkArtistName, normalizeString} = require('./utils')
const {getRelatedArtistsOnSpotify, getArtistsOnSpotify} = require('./spotify-requests')
const {getRelatedArtistsOnLastfm, getArtistsOnLastfm} = require('./lastfm-requests')

const getRelatedArtists = async ({
  name, 
  lastfmArtists, 
  spotifyArtists,
}) => {
  const callback = checkArtistName(name)
  const lastfmArtist = find(lastfmArtists, callback)
  const spotifyArtist = find(spotifyArtists, callback)
  const variants = await axios.all([
    getRelatedArtistsOnLastfm(get(lastfmArtist, 'mbid')),
    getRelatedArtistsOnSpotify(get(spotifyArtist, 'id'))
  ])
  const commonArtists = intersectionBy(
    variants[0], 
    variants[1], 
    (artist => normalizeString(artist.name)),
  )
  const resultingArtists = commonArtists.length 
    ? commonArtists
    : variants[0].length 
      ? variants[0] 
      : variants[1]
  return map(resultingArtists, 'name')
}

const getSearchedArtists = async (name) => {
  const variants = await axios.all([
    getArtistsOnLastfm(name),
    getArtistsOnSpotify(name)
  ])

  return {
    lastfmArtists: variants[0],
    spotifyArtists: variants[1],
  }
}

module.exports = {
  getRelatedArtists,
  getSearchedArtists,
}
