var React   = require('react')
var mount   = require('enzyme').mount
var expect  = require('chai').expect
var jsdom   = require('mocha-jsdom')
var rewire  = require('rewire')
var sinon   = require('sinon')

var context = { router: {} }
var EmployeeRemoteApiCalls = { toEmployeeHref: (id) => id }

var EmployeeDetails = rewire('../../app/scripts/components/EmployeeDetails')
EmployeeDetails.__set__('EmployeeRemoteApiCalls', EmployeeRemoteApiCalls)

describe('<EmployeeDetails />', () => {

  jsdom()

  beforeEach(() => {
    context.router.push               = sinon.stub()
    EmployeeRemoteApiCalls.all        = sinon.stub()
    EmployeeRemoteApiCalls.managersOf = sinon.stub()
    EmployeeRemoteApiCalls.create     = sinon.stub()
    EmployeeRemoteApiCalls.update     = sinon.stub()
  })


  function anEmployee(href, firstName, lastName) {
    return { _links: { self: { href: href } }, firstName: firstName, lastName: lastName }
  }

  function stubFindAllResults(employees) {
    EmployeeRemoteApiCalls.all.callsArgWith(0, null, { body: { _embedded: { employees: employees } } })
  }

  function stubFindManagersResults(employees) {
    EmployeeRemoteApiCalls.managersOf.callsArgWith(1, null, { body: { _embedded: { employees: employees } } })
  }

  function stubCreateResult(href) {
    EmployeeRemoteApiCalls.create.callsArgWith(1, null, { body: { _links: { self: { href: href } } } })
  }

  function stubUpdateResult(href) {
    EmployeeRemoteApiCalls.update.callsArgWith(2, null, { body: { _links: { self: { href: href } } } })
  }


  describe('for new record', () => {

    it('renders empty text fields', () => {
      var wrapper = mount(<EmployeeDetails params={{ id: 'new' }} />, { context: context })

      expect(wrapper.find('.EmployeeDetails_firstNameField').text()).to.be.empty
      expect(wrapper.find('.EmployeeDetails_lastNameField').text()).to.be.empty
    })

    it('triggers only find all API call', () => {
      var wrapper = mount(<EmployeeDetails params={{ id: 'new' }} />, { context: context })

      expect(EmployeeRemoteApiCalls.all.calledOnce).to.be.true
      expect(EmployeeRemoteApiCalls.managersOf.callCount).to.equal(0)
    })

    it('renders manager selection based on the values returned by API call', () => {
      stubFindAllResults([
        anEmployee(10, 'bill', 'first'),
        anEmployee(20, 'mike', 'second') ])

      var wrapper = mount(<EmployeeDetails params={{ id: 'new' }} />, { context: context })

      expect(wrapper.find('.EmployeeDetails_managersSelection option')
        .map(_ => [ _.get(0).value, _.text() ]))
        .to.deep.equal([
          [ '10', 'bill first' ],
          [ '20', 'mike second' ] ])
    })

    it('submits entered form data to create API call', () => {
      stubFindAllResults([ anEmployee(10), anEmployee(20) ])

      var wrapper = mount(<EmployeeDetails params={{ id: 'new' }} />, { context: context })

      wrapper.find('.EmployeeDetails_firstNameField').simulate('change', { target: { value: 'entered first name' } })
      wrapper.find('.EmployeeDetails_lastNameField').simulate('change', { target: { value: 'entered last name' } })
      wrapper.find('.EmployeeDetails_managersSelection').simulate('change', { target: { options: [ { selected: true, value: 10 }, { selected: true, value: 20 } ] } })
      wrapper.find('form').simulate('submit')

      expect(EmployeeRemoteApiCalls.create.calledOnce).to.be.true
      expect(EmployeeRemoteApiCalls.create.firstCall.args[0]).to.deep.equal({
        firstName: 'entered first name',
        lastName: 'entered last name',
        managers: [ 10, 20 ] })
    })

    it('after new record is created should redirect to created record path', () => {
      stubFindAllResults([])
      stubCreateResult('/348235895443')

      var wrapper = mount(<EmployeeDetails params={{ id: 'new' }} />, { context: context })
      wrapper.find('form').simulate('submit')

      expect(context.router.push.calledOnce).to.be.true
      expect(context.router.push.firstCall.args[0].pathname).to.contain('348235895443')
    })
  })

  describe('for existing record', () => {

    it('triggers both find all and find managers API calls', () => {
      var wrapper = mount(<EmployeeDetails params={{ id: 'some unique id' }} />, { context: context })

      expect(EmployeeRemoteApiCalls.all.calledOnce).to.be.true
      expect(EmployeeRemoteApiCalls.managersOf.calledOnce).to.be.true
      expect(EmployeeRemoteApiCalls.managersOf.firstCall.args[0]).to.contain('some unique id')
    })

    it('renders manager selection based on the values returned by API call minus self', () => {
      stubFindAllResults([
        anEmployee(10, 'bill', 'first'),
        anEmployee(20, 'mike', 'second') ])

      var wrapper = mount(<EmployeeDetails params={{ id: 10 }} />, { context: context })

      expect(wrapper.find('.EmployeeDetails_managersSelection option')
        .map(_ => [ _.get(0).value, _.text() ]))
        .to.deep.equal([ [ '20', 'mike second' ] ])
    })

    it('renders preselected managers', () => {
      stubFindAllResults([
        anEmployee(10, 'bill', 'first'),
        anEmployee(20, 'mike', 'second'),
        anEmployee(30, 'john', 'third') ])

      stubFindManagersResults([
        anEmployee(20, 'mike', 'second') ])

      var wrapper = mount(<EmployeeDetails params={{ id: 10 }} />, { context: context })

      expect(wrapper.find('.EmployeeDetails_managersSelection option')
        .filterWhere(_ => _.get(0).selected)
        .map(_ => _.text()))
        .to.deep.equal([ 'mike second' ])
    })

    it('renders text field values based on record with same ID found among all', () => {
      stubFindAllResults([
        anEmployee(10, 'bill', 'first'),
        anEmployee(20, 'mike', 'second'),
        anEmployee(30, 'john', 'third') ])

      var wrapper = mount(<EmployeeDetails params={{ id: 30 }} />, { context: context })

      expect(wrapper.find('.EmployeeDetails_firstNameField').get(0).value).to.equal('john')
      expect(wrapper.find('.EmployeeDetails_lastNameField').get(0).value).to.equal('third')
    })

    it('submits entered form data to update API call', () => {
      stubFindAllResults([
        anEmployee(5734895734, 'bill', 'first'),
        anEmployee(20, 'mike', 'second'),
        anEmployee(30, 'john', 'third') ])

      stubFindManagersResults([
        anEmployee(30, 'john', 'third') ])

      var wrapper = mount(<EmployeeDetails params={{ id: 5734895734 }} />, { context: context })

      wrapper.find('.EmployeeDetails_firstNameField').simulate('change', { target: { value: 'entered first name' } })
      wrapper.find('.EmployeeDetails_lastNameField').simulate('change', { target: { value: 'entered last name' } })
      wrapper.find('.EmployeeDetails_managersSelection').simulate('change', { target: { options: [ { selected: true, value: 20 } ] } })
      wrapper.find('form').simulate('submit')

      expect(EmployeeRemoteApiCalls.update.calledOnce).to.be.true
      expect(EmployeeRemoteApiCalls.update.firstCall.args[0]).to.equal(5734895734)
      expect(EmployeeRemoteApiCalls.update.firstCall.args[1]).to.deep.equal({
        firstName: 'entered first name',
        lastName: 'entered last name',
        managers: [ 20 ] })
    })

    it('after record is updated should redirect to the same path', () => {
      stubFindAllResults([ anEmployee(2348239482095, 'bill', 'first') ])
      stubUpdateResult('/43247982374')

      var wrapper = mount(<EmployeeDetails params={{ id: 2348239482095 }} />, { context: context })
      wrapper.find('form').simulate('submit')

      expect(context.router.push.calledOnce).to.be.true
      expect(context.router.push.firstCall.args[0].pathname).to.contain('2348239482095')
    })
  })
})