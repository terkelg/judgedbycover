'use strict'

require('dotenv').config()

const bot = require('./bot')
const http = require('http')  
const port = process.env.PORT || 8080

const requestHandler = (request, response) => {  
  if(request.headers.secret_key === process.env.SECRET_KEY) {
    bot()
  }
  response.end('@judgedbycover')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {  
  if (err) return console.log('Something bad happened', err)
  console.log(`server is listening on ${port}`)
})