/* jshint undef: true, unused: true */
/* jslint node:true */
'use strict';

var util         = require('util');
var fs           = require('fs');
var _            = require('lodash');

var logger       = require('./logger');


var indent = function (str, tabs) {
  var indentedStr = '';
  for(var i = 0; i < tabs; i++){
    indentedStr += '  ';
  }
  var indented = str.split(/\n/).map(function(substr) {
    return indentedStr + substr;
  }).join('\n');
  return indented + '\n';
};

/**
 * @param {Object} input
 * @param {Object} context
 * @param {Object} output
 * @param {Object} opts
 **/
module.exports = function(input, context, output, opts) {
  logger.debug('Adding event listeners for mappers tests generation');

  var pathPrefix = opts.path || __dirname + './test/maps/';

  var fileName = pathPrefix + name + 'Test.js';
  var testStr = '';

  // For request mapper the complete req object is passed, generating the
  // json for it would be totally overkill
  var mapInput = _.isPlainObject(input[0]) ? input[0] : _.pick(input[0], ['query']);

  if (! fs.existsSync(fileName)) {
    // Add headers to file
    var testHeaders = '';
    testHeaders += '/* global describe, it, before, after */\n';
    testHeaders += '/* jslint node: true */\n';
    testHeaders += "'use strict';\n\n";
    testHeaders += "var should = require('should');\n";
    testHeaders += 'var ' + name + " = require('<path_to_map>/" + name + "');\n\n";
    testHeaders += "var context = " + JSON.stringify(ctxBase) + " ;\n\n\n";
    fs.appendFileSync(fileName, testHeaders);
  }

  logger.debug('Generating test for map ' + name + ' on file ' + fileName);
  testStr += indent('describe("Test for mapper ' + name + '", function () {', 0) + '\n';
  testStr += indent('before(function () {', 1) ;
  testStr += indent('context.req.query = ' + util.inspect(input[1].req.query, { depth: null }) + ';', 2) ;
  // For some reason using util.inspect with req.params returns an array that looks like [ id: 'H0005490' ]
  // Trying to parse that array throws an error, so we resort to go through all object attributes instead
  var params = {};
  for (var key in input[1].req.params) {
    params[key] = input[1].req.params[key];
  }
  testStr += indent('context.req.params = ' + util.inspect(params, { depth: null }) + ';', 2) ;
  testStr += indent('context.pricingCalendar = ' + util.inspect(input[1].pricingCalendar, { depth: null }) + ';', 2) ;
  testStr += indent('});', 1) + '\n\n';
  testStr += indent('var input = ' + util.inspect(mapInput, { depth: null }) + ';', 1) + '\n';
  testStr += indent('it("Test for mapper ' + name + '", function () {', 1) ;
  testStr += indent('var output = ' + name + '.execute(input, Object.create(context));', 2) + '\n\n';
  if (output instanceof Error) {
    testStr += indent('output.message.should.eql(' + util.inspect(output.message) + ');', 2) ;
    testStr += indent('output.error.message.should.eql(' + util.inspect(output.error.message) + ');', 2) ;
    testStr += indent('output.mapper.should.eql(' + util.inspect(output.mapper) + ');', 2) ;
    testStr += indent('output.target.should.eql(' + util.inspect(output.target) + ');', 2) ;
  } else {
    testStr += indent('output.should.eql(' + util.inspect(output, { depth: null }) + ');', 2) ;
  }
  testStr += indent('});', 1) + '\n';
  testStr += indent('after(function () {', 1) ;
  testStr += indent('delete context.req.query;', 2) ;
  testStr += indent('delete context.req.params;', 2) ;
  testStr += indent('delete context.pricingCalendar;', 2) ;
  testStr += indent('});', 1) + '\n';
  testStr += indent('});', 0) + '\n';
  fs.appendFile(fileName, testStr, function (err) {
    if (err) { throw err; }
    logger.debug('Added test for map ' + name);
  });
};

