var Mapper = require('../src/mapper');

var mapper = new Mapper()
  .move('Title', 'subject') // move value from property 'subject' to property 'Title'
  .assign('Version', 1) // assign 1 to property 'Version'
  .submap('Names', 'list', {}, new Mapper() // map property 'list' to property 'Names' using submap
    .move('LastName','surname', {}, function(v){return v.toUpperCase();}) // transform using function
  )
;

var input = {
  subject: 'Duty Roster',
  list: [{ surname: 'Smith'}, { surname: 'Jones'}]
};
var output = mapper.execute(input);

console.log('mapper:');
console.log("new Mapper()");
console.log("  .move('Title', 'subject') // move value from property 'subject' to property 'Title'");
console.log("  .assign('Version', 1) // assign 1 to property 'Version'");
console.log("  .submap('Names', 'list', {}, new Mapper() // map property c to property C using submap");
console.log("    .move('LastName','surname', {}, function(v){return v.toUpperCase();}) // transform using function");
console.log("  )");
console.log(";");
console.log();
console.log('input: ', input);
console.log();
console.log('output: ', output);
