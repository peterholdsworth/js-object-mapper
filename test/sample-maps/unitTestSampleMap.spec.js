/* global describe, it, before, after */
/* jslint node: true */
'use strict';
var should = require('should');

var unitTestSampleMap = require('../test/sample-maps/unitTestSampleMap.js');

var context = {}; // TODO

describe('unitTestSampleMap', function(){

  describe('a 0', function(){

    it('should .....', function(){  // TODO
      var input = {}; // TODO
      var output = {}; // TODO
      unitTestSampleMap.to.a[0](input, 0, context).should.eql(output);
    });

  });

  describe('C.D', function(){

    it('should .....', function(){  // TODO
      var input = {}; // TODO
      var output = {}; // TODO
      unitTestSampleMap.to['C.D'](input, 0, context).should.eql(output);
    });

  });

  describe('/a', function(){

    it('should .....', function(){  // TODO
      var input = {}; // TODO
      var output = {}; // TODO
      unitTestSampleMap.to['/a'](input, 0, context).should.eql(output);
    });

  });

  describe('a 1 condition', function(){

    it('should .....', function(){  // TODO
      var input = {}; // TODO
      var output = {}; // TODO
      unitTestSampleMap.paramTo.a[1].condition(input, 0, context).should.eql(output);
    });

  });

  describe('a 1', function(){

    it('should .....', function(){  // TODO
      var input = {}; // TODO
      var output = {}; // TODO
      unitTestSampleMap.to.a[1](input, 0, context).should.eql(output);
    });

  });

  describe('a 2', function(){

    it('should .....', function(){  // TODO
      var input = {}; // TODO
      var output = {}; // TODO
      unitTestSampleMap.to.a[2](input, 0, context).should.eql(output);
    });

  });

  describe('c filter', function(){

    it('should .....', function(){  // TODO
      var input = {}; // TODO
      var output = {}; // TODO
      unitTestSampleMap.paramTo.c.filter(input, 0, context).should.eql(output);
    });

  });

  describe('c', function(){

    describe('a', function(){

      it('should .....', function(){  // TODO
        var input = {}; // TODO
        var output = {}; // TODO
        unitTestSampleMap.to.c.to.a(input, 0, context).should.eql(output);
      });

    });

  });
  describe('e', function(){

    it('should .....', function(){  // TODO
      var input = {}; // TODO
      var output = {}; // TODO
      unitTestSampleMap.to.e(input, 0, context).should.eql(output);
    });

  });

});