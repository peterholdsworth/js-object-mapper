var Mapper = require('../../src/mapper');

module.exports = new Mapper('sampleMap2').submap('arr', '', new Mapper().assign('x', 1));