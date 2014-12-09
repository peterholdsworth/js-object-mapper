/* jslint node:true, sub:true */
/* global describe, it, before, after */

'use strict';
var should = require('should');
var fs    = require('fs');
var testGenerator = require('../src/testGenerator');
var path = require('path');

describe('testGenerator', function() {

  before(function () {
    process.env.MAPPER_TEST_GEN = 'true';
  });

  describe('testGenerator from Mapper', function() {
    var p1 = './sample-maps/mapper-testgen1';

    it('should generate test for each of the mappers run', function() {
      require(p1).execute({'b': 1});
      require('./sample-maps/mapper-before-after').execute({'b': 1}); // for test coverage
      require('./sample-maps/mapper-testgen2').execute([1,2]);

      var generatedTest1 = fs.readFileSync('./test/mapper-testgen1.spec.js');
      var generatedTest2 = fs.readFileSync('./test/mapper-testgen2.spec.js');
      generatedTest1.length.should.equal(444);
      generatedTest2.toString().indexOf('{ arr: [ { x: 1 }, { x: 1 } ] }').should.not.eql(-1);
      generatedTest2.length.should.equal(467);
    });

    it('should add describe block when existing spec is run again', function() {
      require(p1).execute({b: 3});
      var generatedTest1 = fs.readFileSync('./test/mapper-testgen1.spec.js').toString();
      generatedTest1.match(/describe\(/g).length.should.eql(2);
    });


    it('should expect an error when thrown', function() {
      var m = require('./sample-maps/mapper-error-throwing');
      m.execute({b:1});
      var generatedTestWithErr = fs.readFileSync('./test/mapper-error-throwing.spec.js').toString();
      generatedTestWithErr.indexOf('Mapper failure').should.not.eql(-1);

    });

    after(function () {
      fs.unlinkSync('./test/mapper-testgen1.spec.js');
      fs.unlinkSync('./test/mapper-testgen2.spec.js');
      fs.unlinkSync('./test/mapper-before-after.spec.js');
      fs.unlinkSync('./test/mapper-error-throwing.spec.js');
    });

  });

  describe('testGenerator directly', function() { //test from running maps.execute are not picked up by istanbul
     it('should generate when called directly', function(){
       var file = path.resolve("./sample-maps/mapper-error-throwing.js");
       var opts = {"name":"mapperWithError", "mapperFile": file};
       var errOut = new Error('error for test');
       errOut.message =  'Mapper failure';
       errOut.mapper = "mapperWithError";
       errOut.target = ['a'];
       errOut.error = {message: 'error for test'};
       testGenerator({b:1}, undefined, errOut, opts);
     });

    after(function () {
      fs.unlinkSync('./test/mapper-error-throwing.spec.js');
    });
  });

  after(function () {
    delete process.env.MAPPER_TEST_GEN;
  });

});
