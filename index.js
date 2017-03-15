const bot = require('./bot')
const http = require('http')  
const port = 3000

const requestHandler = (request, response) => {  
  console.log(request.url)
  if (request.url === 'postTweet') {
    console.log(request)
  }
  response.end('Hello Node.js Server!')
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {  
  if (err) return console.log('Something bad happened', err)
  console.log(`server is listening on ${port}`)
})


/*
 - env: have a secret
 - my command post with a secret
*/