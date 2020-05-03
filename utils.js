const getArtistsKeyboard = ({
  artists, 
  nameField, 
  idField,
}) => ({
  reply_markup: {
    inline_keyboard: artists.map(artist => ([{
      text: artist[nameField],
      callback_data: artist[idField],
    }])),
  },
})

module.exports = {
  getArtistsKeyboard,
}
