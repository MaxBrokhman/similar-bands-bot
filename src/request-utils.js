const get = require('lodash/get')

const {sendRequest} = require('./send-request')

const getArtists = async (requestData, dataPath) => {
  const data = await sendRequest(requestData)
  return get(data, dataPath, [])
}

module.exports = {
  getArtists,
}
