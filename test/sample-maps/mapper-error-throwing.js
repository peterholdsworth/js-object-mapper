var Mapper = require('../../src/mapper');

module.exports = new Mapper('mapperWithError').move('a', 'b', function() {
  throw new Error('error for test');
});