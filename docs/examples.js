var Mapper = require('../src/mapper');
var repos = require('./source.json');

new Mapper().take('a').log().execute({a: 9, b: 11});

var out = new Mapper('repos').submap('repos', '', new Mapper().move('name', 'name')).log().execute(repos);
//{ repos:
//  [ { name: 'ADE' },
//          ...
//    { name: 'o.deepObserve' }
//  ]
// }



new Mapper()
  .submap('/repos', '', {}, new Mapper()
    .move('name', 'name'))
  .move('repos', '/repos', function(v) {  //we utilize context to perform another simplification on the data
    return v.map(function(v) {
      return v.name;
    })
  })
  .log()
  .execute(repos);