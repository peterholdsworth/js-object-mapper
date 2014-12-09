var Mapper = require('../src/mapper');

var mapper = new Mapper('sampleMap')
  .move('Title', 'subject') // move value from property 'subject' to property 'Title'
  .assign('Version', 1) // assign 1 to property 'Version'
  .submap('Names', 'list', {}, new Mapper() // map property 'list' to property 'Names' using submap
    .move('LastName','surname', {}, function(v){return v.toUpperCase();}) // transform using function
  )
;

module.exports = mapper;
