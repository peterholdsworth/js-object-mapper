var fs = require('fs');
var path = require('path');
var sampleMap = require('./sampleMap.js');

var input = {
  subject: 'Duty Roster',
  list: [{ surname: 'Smith'}, { surname: 'Jones'}]
};
var output = sampleMap.execute(input);

console.log('================== mapper ===================');
console.log(fs.readFileSync(path.resolve(__dirname + '/sampleMap.js')).toString());
console.log('================== input ===================');
console.log(input);
console.log('================== output ===================');
console.log(output);
