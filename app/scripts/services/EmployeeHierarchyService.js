function isRoot(employee) {
  return employee.managers.length === 0
}

function getDirectSubordinatesOf(manager, employees) {
  var subordinates = []

  for (var id in employees) {
    var employee = employees[id]

    if (employee === manager || employee.managers.length === 0 || employee.managers[0] !== manager) {
      continue
    }

    subordinates.push(employee)
  }

  return subordinates
}

function traverseSubordinatesAndAddMetadata(employee, employees) {
  var subordinates = getDirectSubordinatesOf(employee, employees)

  if (subordinates.length === 0) {
    employee.span = 1
    return
  }

  employee.span = 0

  subordinates.forEach(subordinate => {
    subordinate.offset = employee.offset + employee.span
    subordinate.level = employee.level + 1

    traverseSubordinatesAndAddMetadata(subordinate, employees)

    employee.span += subordinate.span
  })
}

module.exports = {
  addHierarchicalMetadata: function(employees) {
    var offset = 0

    for (var id in employees) {
      var employee = employees[id]

      if (isRoot(employee)) {
        employee.offset = offset
        employee.level = 0

        traverseSubordinatesAndAddMetadata(employee, employees)

        offset += employee.span
      }
    }
  }
}