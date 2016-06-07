var React = require('react')
var Link  = require('react-router').Link

var EmployeeRemoteApiCalls = require('../api/EmployeeRemoteApiCalls')

var EmployeeSearch = React.createClass({
  getInitialState: function() {
    return {
      criteria: { firstName: '', lastName: '' },
      results: []
    }
  },

  componentDidMount: function() {
    this.performSearch()
  },

  onFirstNameChanged: function(e) {
    var value = e.target.value
    this.setState(state => state.criteria.firstName = value)
  },

  onLastNameChanged: function(e) {
    var value = e.target.value
    this.setState(state => state.criteria.lastName = value)
  },

  onSearchCriteriaSubmitted: function(e) {
    e.preventDefault()
    this.performSearch()
  },

  onResultsLoaded: function(error, response) {
    this.setState({ results: response.body._embedded.employees })
  },

  performSearch: function() {
    EmployeeRemoteApiCalls.search(this.state.criteria, this.onResultsLoaded)
  },

  render: function() {
    return (
      <div className='EmployeeSearch'>

        <h3 className='EmployeeSearch_criteriaTitle'>Search Criteria</h3>

        <div className='EmployeeSearch_criteria'>
          <form onSubmit={this.onSearchCriteriaSubmitted}>
            <input  className='EmployeeSearch_criteriaFirstNameField'
                    type='text'
                    placeholder='First Name'
                    value={this.state.criteria.firstName || ''}
                    onChange={this.onFirstNameChanged} />

            <input  className='EmployeeSearch_criteriaLastNameField'
                    type='text'
                    placeholder='Last Name'
                    value={this.state.criteria.lastName || ''}
                    onChange={this.onLastNameChanged} />

            <input type='submit' value='Search' />
          </form>
        </div>

        <div className='EmployeeSearch_newButton'>
          <Link to='/employee/new'>New</Link>
        </div>

        <h3 className='EmployeeSearch_resultsTitle'>Search Results</h3>

        <div className='EmployeeSearch_results'>
          {this.state.results.map(employee => {
            var selfLink = employee._links.self.href
            var id = selfLink.substring(selfLink.lastIndexOf('/') + 1, selfLink.length)

            return (
              <div key={selfLink}>
                <Link to={`/employee/${id}`}>{employee.firstName} {employee.lastName}</Link>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})

module.exports = EmployeeSearch