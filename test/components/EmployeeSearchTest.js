var React   = require('react')
var mount   = require('enzyme').mount
var expect  = require('chai').expect
var jsdom   = require('mocha-jsdom')
var rewire  = require('rewire')
var sinon   = require('sinon')

var EmployeeRemoteApiCalls = {}

var EmployeeSearch = rewire('../../app/scripts/components/EmployeeSearch')
EmployeeSearch.__set__('EmployeeRemoteApiCalls', EmployeeRemoteApiCalls)

describe('<EmployeeSearch />', () => {

  jsdom()

  beforeEach(() => {
    EmployeeRemoteApiCalls.search = sinon.stub()
  })


  function anEmployee(id, firstName, lastName) {
    return { _links: { self: { href: `/${id}` } }, firstName: firstName, lastName: lastName }
  }

  function stubSearchResults(employees) {
    EmployeeRemoteApiCalls.search.callsArgWith(1, null, { body: { _embedded: { employees: employees } } })
  }


  it('triggers initial search with empty search criteria', () => {
    var wrapper = mount(<EmployeeSearch />)

    expect(EmployeeRemoteApiCalls.search.calledOnce).to.be.true
    expect(EmployeeRemoteApiCalls.search.firstCall.args[0]).to.deep.equal({ firstName: '', lastName: '' })
  })
 
  it('makes search API call with values from text fields', () => {
    stubSearchResults([])

    var wrapper = mount(<EmployeeSearch />)

    wrapper.find('.EmployeeSearch_criteriaFirstNameField').simulate('change', { target: { value: 'entered first name' } })
    wrapper.find('.EmployeeSearch_criteriaLastNameField').simulate('change', { target: { value: 'entered last name' } })
    wrapper.find('form').simulate('submit')

    expect(EmployeeRemoteApiCalls.search.calledTwice).to.be.true
    expect(EmployeeRemoteApiCalls.search.secondCall.args[0]).to.deep.equal({ firstName: 'entered first name', lastName: 'entered last name' })
  })

  it('renders search results based on the values returned by API call', () => {
    stubSearchResults([
      anEmployee(10, 'bill', 'first'),
      anEmployee(20, 'mike', 'second') ])

    var wrapper = mount(<EmployeeSearch />)

    expect(wrapper.find('.EmployeeSearch_results a').map(_ => _.text())).to.deep.equal([ 'bill first', 'mike second' ])
  })
})