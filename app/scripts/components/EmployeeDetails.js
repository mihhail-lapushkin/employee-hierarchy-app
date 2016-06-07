var React = require('react')

var EmployeeRemoteApiCalls = require('../api/EmployeeRemoteApiCalls')

var EmployeeDetails = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      form: {
        firstName: '',
        lastName: '',
        managers: []
      },

      allOtherEmployees: []
    }
  },

  recordHref: function() {
    return EmployeeRemoteApiCalls.toEmployeeHref(this.props.params.id)
  },

  isNewRecord: function() {
    return this.props.params.id == 'new'
  },

  isExistingRecord: function() {
    return !this.isNewRecord()
  },

  componentDidMount: function() {
    if (this.isExistingRecord()) {
      EmployeeRemoteApiCalls.managersOf(this.recordHref(), this.onManagersLoaded)
    }

    EmployeeRemoteApiCalls.all(this.onEmployeesLoaded)
  },

  onEmployeesLoaded: function(error, response) {
    var employees = response.body._embedded.employees

    this.setState(state => {
      if (this.isExistingRecord()) {
        var thisEmployee = employees.filter(employee => employee._links.self.href == this.recordHref()).pop()
        state.form.firstName = thisEmployee.firstName
        state.form.lastName = thisEmployee.lastName
        state.allOtherEmployees = employees.filter(employee => employee !== thisEmployee)
      } else {
        state.allOtherEmployees = employees
      }
    })
  },

  onManagersLoaded: function(error, response) {
    this.setState(state => {
      state.form.managers = response.body._embedded.employees.map(employee => employee._links.self.href)
    })
  },

  onFirstNameChanged: function(e) {
    var firstName = e.target.value
    this.setState(state => state.form.firstName = firstName)
  },

  onLastNameChanged: function(e) {
    var lastName = e.target.value
    this.setState(state => state.form.lastName = lastName)
  },

  onManagersChanged: function(e) {
    var options = e.target.options
    var managers = []

    for (var i = 0; i < options.length; i++) {
      if (options[i].selected) {
        managers.push(options[i].value)
      }
    }

    this.setState(state => state.form.managers = managers)
  },

  onFormSubmitted: function(e) {
    e.preventDefault()
    
    if (this.isNewRecord()) {
      EmployeeRemoteApiCalls.create(this.state.form, this.onRecordCreated)
    } else {
      EmployeeRemoteApiCalls.update(this.recordHref(), this.state.form, this.onRecordUpdated)
    }
  },

  onRecordCreated: function(error, response) {
    var addedEmployeeHref = response.body._links.self.href
    var id = addedEmployeeHref.substring(addedEmployeeHref.lastIndexOf('/') + 1, addedEmployeeHref.length)

    this.context.router.push({ pathname: `/employee/${id}` })
  },

  onRecordUpdated: function(error, response) {
    this.context.router.push({ pathname: `/employee/${this.props.params.id}` })
  },

  render: function() {
    return (
      <div className='EmployeeDetails'>
        <form onSubmit={this.onFormSubmitted}>
          <div className='EmployeeDetails_formRow'>
            <input  className='EmployeeDetails_firstNameField'
                    type='text'
                    placeholder='First Name'
                    value={this.state.form.firstName || ''}
                    onChange={this.onFirstNameChanged} />
          </div>
          <div className='EmployeeDetails_formRow'>
            <input  className='EmployeeDetails_lastNameField'
                    type='text'
                    placeholder='Last Name'
                    value={this.state.form.lastName || ''}
                    onChange={this.onLastNameChanged} />
          </div>
          <div className='EmployeeDetails_formRow'>
            <select className='EmployeeDetails_managersSelection' multiple={true} value={this.state.form.managers} size={this.state.allOtherEmployees.length} onChange={this.onManagersChanged}>
            {this.state.allOtherEmployees.map(employee => {
              return (
                <option key={employee._links.self.href} value={employee._links.self.href}>{employee.firstName} {employee.lastName}</option>
              )
            })}
            </select>
          </div>
          <div className='EmployeeDetails_formRow'>
            <input type='submit' value={this.isNewRecord() ? 'Add New Employee' : 'Save'} />
          </div>
        </form>
      </div>
    )
  }
})

module.exports = EmployeeDetails