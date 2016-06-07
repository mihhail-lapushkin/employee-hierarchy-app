var express = require('express')
var serveStatic = require('serve-static')
var compression = require('compression')
var port = process.env.PORT

var app = express()

app.use(compression())
app.use(serveStatic(`${__dirname}/dist`))

app.listen(port, () => {
  console.log('Server running...')
})