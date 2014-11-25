/* jslint node:true, sub:true */
/* global describe, it */
'use strict';

var fs    = require('fs');
var child_process = require('child_process');
var should = require('should');
var skeleton = fs.readFileSync('./test/sample-maps/unitTestSampleMap.spec.js');

describe('unitTestGenerator', function () {

  it('should generate a test skeleton for sample mapper matching sample skeleton', function(next) {
    // console.log('process.env.running_under_istanbul = ' + process.env.running_under_istanbul);
    var command = process.env.running_under_istanbul ?
      './node_modules/.bin/istanbul cover ./tools/unitTestGenerator.js --dir ./.coverage/unitTestGenerator --report none -- ../test/sample-maps/unitTestSampleMap.js' :
      'node ./tools/unitTestGenerator.js ../test/sample-maps/unitTestSampleMap.js';
    child_process.exec(command, function (error, stdout, stderr) {
      should(error).eql.null;
      stdout.toString().should.startWith(skeleton.toString());
      if (!process.env.running_under_istanbul){stderr.toString().should.eql('');}
      next();
    });
  });

  it('should throw an error if sample mapper not found', function(next) {
    // console.log('process.env.running_under_istanbul = ' + process.env.running_under_istanbul);
    var command = process.env.running_under_istanbul ?
      './node_modules/.bin/istanbul cover ./tools/unitTestGenerator.js --dir ./.coverage/unitTestGeneratorError --report none -- ../test/sample-maps/nonExistantFile.js' :
      'node ./tools/unitTestGenerator.js ../test/sample-maps/nonExistantFile.js';
    child_process.exec(command, function (error, stdout, stderr) {
      should(error).not.eql.null;
      next();
    });
  });

});