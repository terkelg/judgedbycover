'use strict'

const Twit = require('twit')

var T = new Twit({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  timeout_ms: 60*1000 // optional HTTP request timeout to apply to all requests. 
})

module.exports = function postTweet(status, media) {
  return new Promise((resolve, reject) => {

    // Upload data first
    T.post('media/upload', { media_data: media }, function (err, data, response) {
      var mediaIdStr = data.media_id_string
      var altText = status
      var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }

      // Create metadata
      T.post('media/metadata/create', meta_params, function (err, data, response) {
        if (err) reject(err)
        var params = { status: status, media_ids: [mediaIdStr] }

        // Post
        T.post('statuses/update', params, function (err, data, response) {
          if (err) reject(err)
          resolve(response)
        })
      })
    })

  })
}