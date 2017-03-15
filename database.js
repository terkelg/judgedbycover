'use strict'

const MongoClient = require('mongodb').MongoClient
const URI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds145299.mlab.com:45299/judgedbycover`

let _db
let _current

module.exports.connectDB = function connectDB() {
  return new Promise((resolve, reject) => {
     MongoClient.connect(URI, function(err, db) {
      if (err) reject(err)
      _db = db
      resolve(db)
    })
  })
}

module.exports.closeDB = function closeDB() {
  _db.close((err) => {
    if(err) return Promise.reject()
    return Promise.resolve()
  })
}

module.exports.getNextBook = function getNextBook() {
  return new Promise((resolve, reject) => {
    if (!_db) reject('No database provided')

    let booksDB = _db.collection('books')
    let progressDB = _db.collection('progress')

    progressDB.findOne((err, item) => {
      if (err) reject(err)
      _current = item.current
      booksDB.findOne({"index": _current}, (err, book) => {
        if (err) reject(err)
        resolve(book)
      })
    })
  })
}

module.exports.setProgress = function progress() {
  return new Promise((resolve, reject) => {
    if (!_db) reject('No database connection open')
    let progressDB = _db.collection('progress')
    progressDB.updateOne({}, {$set: {current: _current+1}}, (err, progress) => {
      if (err) reject('Could not update progress', err)
      resolve(_current+1)
    })
  })
}