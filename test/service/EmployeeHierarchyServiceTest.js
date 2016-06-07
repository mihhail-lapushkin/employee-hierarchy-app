var expect = require('chai').expect

var EmployeeHierarchyService = require('../../app/scripts/services/EmployeeHierarchyService')

describe('EmployeeHierarchyService.addHierarchicalMetadata', () => {
  it('does nothing for zero number of employees', () => {
    var employees = {}

    EmployeeHierarchyService.addHierarchicalMetadata(employees)

    expect(employees).to.deep.equal({})
  })

  it('adds correct metadata for single-manager hierarchy', () => {
    var ceo_in   = { id: 1, name:'ceo',  managers: [] }
    var bm1_in   = { id: 2, name:'bm1',  managers: [] }
    var bm2_in   = { id: 3, name:'bm2',  managers: [] }
    var svp1_in  = { id: 4, name:'svp1', managers: [ ceo_in ] }
    var svp2_in  = { id: 5, name:'svp2', managers: [ ceo_in ] }
    var svp3_in  = { id: 6, name:'svp3', managers: [ ceo_in ] }
    var vp1_in   = { id: 7, name:'vp1',  managers: [ svp3_in ] }
    var vp2_in   = { id: 8, name:'vp2',  managers: [ svp3_in ] }

    var ceo_out   = { id: 1, name:'ceo',  managers: [],           level:0, offset:0, span:4 }
    var bm1_out   = { id: 2, name:'bm1',  managers: [],           level:0, offset:4, span:1 }
    var bm2_out   = { id: 3, name:'bm2',  managers: [],           level:0, offset:5, span:1 }
    var svp1_out  = { id: 4, name:'svp1', managers: [ ceo_out ],  level:1, offset:0, span:1 }
    var svp2_out  = { id: 5, name:'svp2', managers: [ ceo_out ],  level:1, offset:1, span:1 }
    var svp3_out  = { id: 6, name:'svp3', managers: [ ceo_out ],  level:1, offset:2, span:2 }
    var vp1_out   = { id: 7, name:'vp1',  managers: [ svp3_out ], level:2, offset:2, span:1 }
    var vp2_out   = { id: 8, name:'vp2',  managers: [ svp3_out ], level:2, offset:3, span:1 }

    var employees = {
      1:ceo_in,
      2:bm1_in,
      3:bm2_in,
      4:svp1_in,
      5:svp2_in,
      6:svp3_in,
      7:vp1_in,
      8:vp2_in
    }

    EmployeeHierarchyService.addHierarchicalMetadata(employees)

    expect(employees).to.deep.equal({
      1:ceo_out,
      2:bm1_out,
      3:bm2_out,
      4:svp1_out,
      5:svp2_out,
      6:svp3_out,
      7:vp1_out,
      8:vp2_out
    })
  })

  it('works the same way for multi-manager hierarchy as for single-manager (decides based on the first manager)', () => {
    var ceo_in   = { id: 1, name:'ceo',  managers: [] }
    var bm1_in   = { id: 2, name:'bm1',  managers: [] }
    var bm2_in   = { id: 3, name:'bm2',  managers: [] }
    var svp1_in  = { id: 4, name:'svp1', managers: [ ceo_in ] }
    var svp2_in  = { id: 5, name:'svp2', managers: [ ceo_in, bm1_in ] }
    var svp3_in  = { id: 6, name:'svp3', managers: [ ceo_in, bm2_in ] }
    var vp1_in   = { id: 7, name:'vp1',  managers: [ svp3_in, svp2_in, svp1_in ] }
    var vp2_in   = { id: 8, name:'vp2',  managers: [ svp3_in, svp2_in ] }

    var ceo_out   = { id: 1, name:'ceo',  managers: [],                               level:0, offset:0, span:4 }
    var bm1_out   = { id: 2, name:'bm1',  managers: [],                               level:0, offset:4, span:1 }
    var bm2_out   = { id: 3, name:'bm2',  managers: [],                               level:0, offset:5, span:1 }
    var svp1_out  = { id: 4, name:'svp1', managers: [ ceo_out ],                      level:1, offset:0, span:1 }
    var svp2_out  = { id: 5, name:'svp2', managers: [ ceo_out, bm1_out ],             level:1, offset:1, span:1 }
    var svp3_out  = { id: 6, name:'svp3', managers: [ ceo_out, bm2_out ],             level:1, offset:2, span:2 }
    var vp1_out   = { id: 7, name:'vp1',  managers: [ svp3_out, svp2_out, svp1_out ], level:2, offset:2, span:1 }
    var vp2_out   = { id: 8, name:'vp2',  managers: [ svp3_out, svp2_out ],           level:2, offset:3, span:1 }

    var employees = {
      1:ceo_in,
      2:bm1_in,
      3:bm2_in,
      4:svp1_in,
      5:svp2_in,
      6:svp3_in,
      7:vp1_in,
      8:vp2_in
    }

    EmployeeHierarchyService.addHierarchicalMetadata(employees)

    expect(employees).to.deep.equal({
      1:ceo_out,
      2:bm1_out,
      3:bm2_out,
      4:svp1_out,
      5:svp2_out,
      6:svp3_out,
      7:vp1_out,
      8:vp2_out
    })
  })
})