/* jslint node:true, sub:true */
/* global describe, it, before, after,afterEach */

'use strict';
var should = require('should'),
    fs    = require('fs');
var testGenerator = require('../tools/testGenerator');
var path = require('path');

describe('testGenerator', function() {

  before(function () {
    process.env.MAPPER_TESTS_GEN = 'true';
  });

  describe('testGenerator from Mapper', function() {
    var p1 = './sample-maps/mapper-testgen1';

    it('should generate test for each of the mappers run', function() {
      require(p1).execute({'b': 1});
      require('./sample-maps/mapper-testgen2').execute([1,2]);

      var generatedTest1 = fs.readFileSync('./tests/mapper-testgen1.spec.js');
      var generatedTest2 = fs.readFileSync('./tests/mapper-testgen2.spec.js');
      generatedTest1.length.should.equal(445);
      generatedTest2.toString().indexOf('{ arr: [ { x: 1 }, { x: 1 } ] }').should.not.eql(-1);
      generatedTest2.length.should.equal(468);
    });

    it('should add describe block when existing spec is run again', function() {
      require(p1).execute({b: 3});
      var generatedTest1 = fs.readFileSync('./tests/mapper-testgen1.spec.js').toString();
      generatedTest1.match(/describe\(/g).length.should.eql(2);
    });


    it('should expect an error when thrown', function() {
      var m = require('./sample-maps/mapper-error-throwing');
      m.execute({b:1});
      var generatedTestWithErr = fs.readFileSync('./tests/mapper-error-throwing.spec.js').toString();
      generatedTestWithErr.indexOf('Mapper failure').should.not.eql(-1);

    });

    after(function () {
      fs.unlinkSync('./tests/mapper-testgen1.spec.js');
      fs.unlinkSync('./tests/mapper-testgen2.spec.js');
      fs.unlinkSync('./tests/mapper-error-throwing.spec.js');
    });

  });

  describe('testGenerator directly', function() { //tests from running maps.execute are not picked up by istanbul
     it('should generate when called directly', function(){
       var file = path.resolve("./sample-maps/mapper-error-throwing.js");
       var opts = {"name":"mapperWithError","mapperFile": file};
       var errOut = new Error('error for test');
       errOut.message =  'Mapper failure';
       errOut.mapper = "mapperWithError";
       errOut.target = ['a'];
       errOut.error = {message: 'error for test'};
       testGenerator({b:1}, undefined, errOut, opts);
     });

    after(function () {
      fs.unlinkSync('./tests/mapper-error-throwing.spec.js');
    });
  });

  after(function () {
    delete process.env.MAPPER_TESTS_GEN;
  });

});
