'use strict';

require('dotenv').config()
const request = require('request')
const DB = require('./database')
const TW = require('./twitter')

const ENDPOINT = 'https://westus.api.cognitive.microsoft.com/vision/v1.0/describe?maxCandidates=1'

/**
 * downloadCover - return promise with base64 image from url
 * @param {String} coverURL - URL to image
 */
function downloadCover(coverURL) {
    return new Promise((resolve, reject) => {
      request.get({url : coverURL, encoding: null}, (err, res, body) => {
        if (err) reject(err)
        const type = res.headers["content-type"];
        const base64 = body.toString('base64');
        const dataUri = base64;
        resolve(dataUri)
    })
  })
}

/**
 * analyzeCover - Analyzes the cover using Microsoft Cognitive services
 * @param {String} coverURL - URL to image
 */
function analyzeCover(coverURL) {
  return new Promise((resolve, reject) => {
    const options = {
      url: ENDPOINT,
      method: 'POST',
      json: true,
      headers: { 'Ocp-Apim-Subscription-Key': process.env.MICROSOFT_KEY },
      body: { url: coverURL }
    }
    request(options, function(error, response, body) {
      if (error) reject(error)
      resolve(body)
    })
  })
}

/**
 * capitalizeFirst - Capitalize first letter in a string
 * @param {String} string - String to transform
 */
function capitalizeFirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ------------------------------------------------------------

function book() {
 return DB.connectDB()
  .then(DB.getNextBook)
  .catch(e => console.log('Error: Could not get book', e))
}

function analyze(book) {
  let cover = book.coverLarge
  console.log('Analyzed cover:', cover)
  return Promise
    .all([analyzeCover(cover), downloadCover(cover)])
    .catch(e => console.log('Error: Analyzing', e))
}

function tweet(data) {
  let [response, media] = data
  if(!response && !response.description) return DB.setProgress().then(Main)

  let desc = response.description.captions[0].text
  let status = capitalizeFirst(desc)

  return TW(status, media)
    .catch(e => console.log('Error: Posting tweet', e))
}

function progress() {
  return DB.setProgress().then(DB.closeDB)
}

// ------------------------------------------------------------

function Main() {
  book()
  .then(analyze)
  .then(tweet)
  .then(progress)
  .then(() => console.log('Done', +new Date()))
  .catch(err => {
    console.log('Error:', err)
    return DB.setProgress().then(Main)
  })
}

module.exports = Main