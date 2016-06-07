var React = require('react')

var EmployeeHierarchyService = require('../services/EmployeeHierarchyService')
var EmployeeRemoteApiCalls = require('../api/EmployeeRemoteApiCalls')

var SLOT_WIDTH_PIXELS = 100
var HORIZONTAL_GAP_WIDTH_PIXELS = 70
var SLOT_HEIGHT_PIXELS = 20

var EmployeeHierarchy = React.createClass({
  getInitialState: function() {
    return {
      employees: {}
    }
  },

  getEmployeesList: function() {
    var employeesList = []
    var employeesMap = this.state.employees

    for (var id in employeesMap) {
      employeesList.push(employeesMap[id])
    }

    return employeesList
  },

  componentDidMount: function() {
    EmployeeRemoteApiCalls.all(this.onEmployeesLoaded)
  },

  onEmployeesLoaded: function(error, response) {
    var employeesList = response.body._embedded.employees
    var employeesMap = {}

    employeesList.forEach(employee => {
      employee.id = employee._links.self.href
      employee.managers = []
      employeesMap[employee.id] = employee
    })

    employeesList.forEach(employee => {
      EmployeeRemoteApiCalls.managersOf(employee.id, (error, response) => this.onEmployeeManagersLoaded(error, response, employee, employeesMap))
    })
  },

  onEmployeeManagersLoaded: function(error, response, employee, employeesMap) {
    var managersIds = response.body._embedded.employees.map(manager => manager._links.self.href)

    employeesMap[employee.id].managers = managersIds.map(managerId => employeesMap[managerId])

    EmployeeHierarchyService.addHierarchicalMetadata(employeesMap)

    this.setState({ employees: employeesMap })
  },

  componentDidUpdate: function() {
    this.updateCanvas()
  },

  drawEmployee: function(context, employee) {
    context.fillText( `${employee.firstName} ${employee.lastName}`,
                      this.getEmployeeRightX(employee),
                      this.getEmployeeY(employee),
                      SLOT_WIDTH_PIXELS)
  },

  drawSubordinateToManagerConnections: function(context, subordinate) {
    context.strokeStyle = subordinate.managers.length === 1 ? 'gray' : 'rgb(255,150,150)'

    subordinate.managers.forEach(manager => {
      context.beginPath()
      context.moveTo(this.getEmployeeRightX(manager) + 3, this.getEmployeeY(manager))
      context.lineTo(this.getEmployeeLeftX(subordinate), this.getEmployeeY(subordinate))
      context.stroke()
    })
  },

  updateCanvas: function() {
    var context = this.refs.canvas.getContext('2d')

    if (!context) {
      return
    }

    context.clearRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight())
    context.font = '16px Arial'
    context.textBaseline = 'middle'
    context.textAlign = 'end'

    this.getEmployeesList().forEach(employee => {
      this.drawEmployee(context, employee)

      if (employee.level > 0) {
        this.drawSubordinateToManagerConnections(context, employee)
      }
    })
  },

  getEmployeeLeftX: function(employee) {
    return employee.level * (SLOT_WIDTH_PIXELS + HORIZONTAL_GAP_WIDTH_PIXELS)
  },

  getEmployeeRightX: function(employee) {
    return (employee.level + 1) * SLOT_WIDTH_PIXELS + employee.level * HORIZONTAL_GAP_WIDTH_PIXELS
  },

  getEmployeeY: function(employee) {
    return (employee.offset + employee.span / 2) * SLOT_HEIGHT_PIXELS
  },

  getVerticalNumberOfSlots: function() {
    return this.getEmployeesList()
      .filter(employee => employee.managers.length === 0)
      .map(employee => employee.span)
      .reduce((a, b) => a + b, 0)
  },

  getHorizontalNumberOfSlots: function() {
    return 1 + this.getEmployeesList()
      .map(employee => employee.level)
      .reduce((a, b) => Math.max(a, b), 0)
  },

  getCanvasWidth: function() {
    var slots = this.getHorizontalNumberOfSlots()

    return slots * SLOT_WIDTH_PIXELS + ((slots || 1) - 1) * HORIZONTAL_GAP_WIDTH_PIXELS
  },

  getCanvasHeight: function() {
    return this.getVerticalNumberOfSlots() * SLOT_HEIGHT_PIXELS
  },

  render: function() {
    return (
      <canvas ref='canvas' width={this.getCanvasWidth()} height={this.getCanvasHeight()}/>
    )
  }
})

module.exports = EmployeeHierarchy