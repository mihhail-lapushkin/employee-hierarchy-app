var request = require('superagent')

module.exports = {
  toEmployeeHref: function(id) {
    return `@API/employees/${id}`
  },

  search: function(query, callback) {
    request.get('@API/employees/search/byFields').query(query).end(callback)
  },

  all: function(callback) {
    request.get('@API/employees').end(callback)
  },

  managersOf: function(selfHref, callback) {
    request.get(`${selfHref}/managers`).end(callback)
  },

  create: function(employee, callback) {
    request.post('@API/employees').send(employee).end(callback)
  },

  update: function(selfHref, employee, callback) {
    request.put(selfHref).send(employee).end(callback)
  }
}