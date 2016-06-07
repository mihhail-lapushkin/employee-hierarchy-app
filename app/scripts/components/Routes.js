var React       = require('react')
var Router      = require('react-router').Router
var Route       = require('react-router').Route
var IndexRoute  = require('react-router').IndexRoute
var hashHistory = require('react-router').hashHistory

var App               = require('./App')
var EmployeeSearch    = require('./EmployeeSearch')
var EmployeeDetails   = require('./EmployeeDetails')
var EmployeeHierarchy = require('./EmployeeHierarchy')

var Routes = React.createClass({
  render: function() {
    return (
      <Router history={hashHistory}>
        <Route path='/' component={App}>
          <IndexRoute component={EmployeeSearch} />

          <Route  path='employee/search'     
                  component={EmployeeSearch} />

          <Route  path='employee/hierarchy'
                  component={EmployeeHierarchy} />

          <Route  path='employee/:id'
                  component={EmployeeDetails} />
        </Route>
      </Router>
    )
  }
})

module.exports = Routes