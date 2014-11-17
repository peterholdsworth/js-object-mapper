var Mapper = require('../src/mapper');
var repos = require('./source.json');

var names = new Mapper().submap('repos', '', new Mapper().move('name', 'name')).execute(repos);

console.log(names);   //{ repos:
                      //  [ { name: 'ADE' },
                      //          ...
                      //    { name: 'o.deepObserve' }
                      //  ]
                      // }