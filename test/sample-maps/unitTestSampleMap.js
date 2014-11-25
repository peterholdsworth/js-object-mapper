'use strict';
var Mapper = require('../../src/mapper.js');
var map = new Mapper('unitTestSampleMap')
  .move('a', 'b')
  .move('C.D', 'b')
  .move('/a', 'b')
  .move('a', '/b', {condition: function(){return true;}})
  .move('a', 'b')
  .submap('c', 'd', {filter:function(){return true;}}, new Mapper().move('a', 'b'))
  .assign('e', 'f');
module.exports = map;
