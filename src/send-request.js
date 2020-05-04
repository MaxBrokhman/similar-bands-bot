const axios = require('axios').default

const sendRequest = async ({
  method,
  url,
  data,
  config,
  error,
}) => {
  try {
    const response = data 
    ? await axios[method](url, data, config)
    : await axios[method](url, config)
    return response.data
  } catch {
    console.log(error)
  }
}

module.exports = {
  sendRequest,
}
