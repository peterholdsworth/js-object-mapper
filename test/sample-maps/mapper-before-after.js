var Mapper = require('../../src/mapper');

var m  = new Mapper('sampleMap-before-after').move('a', 'b');

m.generatorOpts.before  = function(next){next();};
m.generatorOpts.after   = function(next){next();};

module.exports = m;