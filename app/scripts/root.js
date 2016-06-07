var React     = require('react')
var ReactDom  = require('react-dom')
var Routes    = require('./components/Routes')

ReactDom.render(
  <Routes />,
  document.getElementById('app')
)