var React   = require('react')
var mount   = require('enzyme').mount
var expect  = require('chai').expect
var jsdom   = require('mocha-jsdom')
var rewire  = require('rewire')
var sinon   = require('sinon')

var EmployeeRemoteApiCalls = {}
var EmployeeHierarchyService = {}

var EmployeeHierarchy = rewire('../../app/scripts/components/EmployeeHierarchy')
EmployeeHierarchy.__set__('EmployeeRemoteApiCalls', EmployeeRemoteApiCalls)
EmployeeHierarchy.__set__('EmployeeHierarchyService', EmployeeHierarchyService)

describe('<EmployeeHierarchy />', () => {

  jsdom()

  beforeEach(() => {
    EmployeeRemoteApiCalls.all                        = sinon.stub()
    EmployeeRemoteApiCalls.managersOf                 = sinon.stub()
    EmployeeHierarchyService.addHierarchicalMetadata  = sinon.stub()
  })


  function anEmployee(href, firstName, lastName) {
    return { _links: { self: { href: href } }, firstName: firstName, lastName: lastName }
  }

  function stubFindAllResults(employees) {
    EmployeeRemoteApiCalls.all.callsArgWith(0, null, { body: { _embedded: { employees: employees } } })
  }

  function stubFindManagersResultsForMultipleCalls(employeesByCall) {
    employeesByCall.forEach((employees, index) => {
      EmployeeRemoteApiCalls.managersOf.onCall(index).callsArgWith(1, null, { body: { _embedded: { employees: employees } } })
    })
  }


  it('triggers find all and for each found employee requests her managers', () => {
    stubFindAllResults([
      anEmployee(10, 'bill', 'first'),
      anEmployee(20, 'mike', 'second') ])

    var wrapper = mount(<EmployeeHierarchy />)

    expect(EmployeeRemoteApiCalls.all.calledOnce).to.be.true
    expect(EmployeeRemoteApiCalls.managersOf.calledTwice).to.be.true
    expect(EmployeeRemoteApiCalls.managersOf.firstCall.args[0]).to.equal(10)
    expect(EmployeeRemoteApiCalls.managersOf.secondCall.args[0]).to.equal(20)
  })

  it('incrementally links subordinates with their managers, adds metadata and updates state', () => {
    stubFindAllResults([
      anEmployee(10, 'bill', 'first'),
      anEmployee(20, 'mike', 'second'),
      anEmployee(30, 'john', 'third'),
      anEmployee(40, 'jim', 'fourth'),
      anEmployee(50, 'alice', 'fifth'),
      anEmployee(60, 'george', 'sixth') ])

    stubFindManagersResultsForMultipleCalls([
      [  ],
      [ anEmployee(10, 'bill', 'first') ],
      [ anEmployee(10, 'bill', 'first') ],
      [ anEmployee(20, 'mike', 'second') ],
      [ anEmployee(20, 'mike', 'second'), anEmployee(30, 'john', 'third') ],
      [ anEmployee(20, 'mike', 'second'), anEmployee(40, 'jim', 'fourth') ]
    ])

    var wrapper = mount(<EmployeeHierarchy />)

    expect(EmployeeHierarchyService.addHierarchicalMetadata.callCount).to.equal(6)

    expect(wrapper.state()
      .employees[30]
      .managers
      .map(_ => `${_.firstName} ${_.lastName}`))
      .to.deep.equal([ 'bill first' ])

    expect(wrapper.state()
      .employees[60]
      .managers
      .map(_ => `${_.firstName} ${_.lastName}`))
      .to.deep.equal([ 'mike second', 'jim fourth' ])
  })
})