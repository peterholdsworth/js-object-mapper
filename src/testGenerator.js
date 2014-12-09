/* jshint undef: true, unused: true */
/* jslint node:true */
'use strict';

var util         = require('util');
var fs           = require('fs');
var _            = require('lodash');
var path = require('path');
var debug = require('debug')('js-object-mapper:test-generator');
/**
 * @param {String} str
 * @param {Number} tabs
 * @param {Boolean} noNewLine
 * @returns {string}
 */
var indent = function (str, tabs, noNewLine) {
  var indentedStr = '';
  for(var i = 0; i < tabs; i++){
    indentedStr += '  ';
  }
  var indented = str.split(/\n/).map(function(substr) {
    return indentedStr + substr;
  }).join('\n');
  if (noNewLine) {
    return indented;
  }
  return indented + '\n';
};

/**
 * @param {Object} input
 * @param {Object} context
 * @param {Object} output
 * @param {Object} opts
 * @param {String} opts.toPath to indicate where test should be generated
 **/
module.exports = function(input, context, output, opts) {
  debug('generation of test for a Mapper file: ', opts.mapperFile);

  var pathPrefix = opts.toPath || path.join('./', '/test/');

  var name = opts.mapperFile.substring(opts.mapperFile.lastIndexOf(path.sep) + 1, opts.mapperFile.length - 2);
  var fileName = pathPrefix + name + 'spec.js';
  var testStr = '';

  // For request mapper the complete req object is passed, generating the
  // json for it would be totally overkill
  var mapInput = input;

  context = context || {};

  if (!fs.existsSync(fileName)) {
    // Add headers to file
    var testHeaders = '';
    testHeaders += '/* global describe, it, before, after */\n';
    testHeaders += '/* jslint node: true */\n';
    testHeaders += "'use strict';\n\n";
    testHeaders += "var should = require('should');\n";

    var relativePathToMapper = path.relative( './', opts.mapperFile);
    relativePathToMapper = relativePathToMapper.replace(/\\/g, '/');
    testHeaders += 'var ' + opts.name + " = require('../" + relativePathToMapper + "');\n\n";
    testHeaders += "var context = " + JSON.stringify(context) + " ;\n\n\n";
    fs.appendFileSync(fileName, testHeaders);
  }

  debug('Generating test for map ' + name + ' on file ' + fileName);
  testStr += indent('describe("Test for mapper ' + opts.name + '", function () {', 0) + '\n';

  if (typeof opts.before === 'function') {
    testStr += indent('before(', 1, true);
    testStr += opts.before.toString();  //user defined function or empty function
    testStr += indent(');', 1) + '\n\n';
  }

  testStr += indent('var input = ' + util.inspect(mapInput, { depth: null }) + ';', 1) + '\n';
  testStr += indent('it("Test for mapper ' + opts.name + '", function () {', 1) ;
  testStr += indent('var output = ' + opts.name + '.execute(input, Object.create(context));', 2) + '\n';
  if (output instanceof Error) {
    testStr += indent('output.message.should.eql(' + util.inspect(output.message) + ');', 2) ;
    testStr += indent('output.error.message.should.eql(' + util.inspect(output.error.message) + ');', 2) ;
    testStr += indent('output.mapper.should.eql(' + util.inspect(output.mapper) + ');', 2) ;
    testStr += indent('output.target.should.eql(' + util.inspect(output.target) + ');', 2) ;
  } else {
    testStr += indent('output.should.eql(' + util.inspect(output, { depth: null }) + ');', 2) ;
  }
  testStr += indent('});', 1) + '\n';

  if (typeof opts.after === 'function') {
    testStr += indent('after(', 1, true);
    testStr += opts.after.toString();  //user defined function or empty function
    testStr += indent(');', 1) + '\n';
  }

  testStr += indent('});', 0) + '\n';

  fs.appendFileSync(fileName, testStr);
  debug('Added test for map ' + name);

};

