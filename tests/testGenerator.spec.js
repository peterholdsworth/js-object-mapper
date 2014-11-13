/* jslint node:true, sub:true */
/* global describe, it, before, after,afterEach */

'use strict';
var should = require('should'),
    fs    = require('fs');
var testGenerator = require('../tools/testGenerator');
var mapper = require('../src/mapper');

describe('testGenerator', function() {

  before(function () {
    process.env.MAPPER_TESTS_GEN = 'true';
  });

  describe.skip('testGenerator from Mapper', function() {

    it('should generate the test', function() {
      var out = require('./sample-maps/mapgen_test').execute({'b': 1});

      var generatedTest = fs.readFileSync('./testTest.js');
      generatedTest.should.equal('TODO FILL IN');
    });


    afterEach(function (done) {
      fs.unlink('./testTest.js', function() {
        done();
      });
    });


    after(function () {
      delete process.env.PAPI_MAP_TESTS_GEN;
    });

  });



});
