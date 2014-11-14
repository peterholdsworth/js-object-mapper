/* jslint node:true, sub:true */
/* global describe, it, before, after,afterEach */

'use strict';
var should = require('should'),
    fs    = require('fs');
var testGenerator = require('../tools/testGenerator');

describe('testGenerator', function() {

  before(function () {
    process.env.MAPPER_TESTS_GEN = 'true';
  });

  describe('testGenerator from Mapper', function() {

    it('should generate test for each of the mappers run', function() {
      require('./sample-maps/mapper-testgen1').execute({'b': 1});
      require('./sample-maps/mapper-testgen2').execute([1,2]);

      var generatedTest1 = fs.readFileSync('./tests/mapper-testgen1.spec.js');
      var generatedTest2 = fs.readFileSync('./tests/mapper-testgen2.spec.js');
      generatedTest1.length.should.equal(445);
      generatedTest2.toString().indexOf('{ arr: [ { x: 1 }, { x: 1 } ] }').should.eql(422);
      generatedTest2.length.should.equal(468);
    });

    it('should add describe block when existing spec is run again', function() {
      require('./sample-maps/mapper-testgen1').execute({b: 3});
      var generatedTest1 = fs.readFileSync('./tests/mapper-testgen1.spec.js').toString();
      generatedTest1.match(/describe\(/g).length.should.eql(2);
    });


    after(function () {
      delete process.env.MAPPER_TESTS_GEN;
      fs.unlinkSync('./tests/mapper-testgen1.spec.js');
      fs.unlinkSync('./tests/mapper-testgen2.spec.js');
    });

  });



});
