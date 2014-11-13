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

  describe('testGenerator from Mapper', function() {
    var out = require('./sample-maps/mapgen_test').execute({'b': 1});

    it('should generate the test', function() {
      var generatedTest = fs.readFileSync('./testTest.js');
      generatedTest.should.equal('TODO FILL IN');
    });
  });

  describe('testGenerator', function() {

    var input = [ {}, { req: { query: { q1: 'q1', q2: 'q2' }, params: { p1: 'p1', p2: 'p2' } } } ];


    afterEach(function (done) {
      fs.unlink('./testTest.js', function() {
        done();
      });
    });


    it('should trigger the test generation callback function', function (done) {
      testGenerator.mapCompleted(input, {}, 'test');
      setTimeout(function () {
        var generatedTest = fs.readFileSync('./testTest.js', { encoding: 'utf8' });
        generatedTest.should.eql("/* global describe, it, before, after */\n/* jslint node: true */\n'use strict';\n\nvar should = require('should');\nvar i18n = require('i18next');\nvar config = require('../../src/lib/config');\nvar data = require('../../data');\nvar test = require('<path_to_map>/test');\n\ni18n.init({lng: 'en'});\ni18n.language = function(){return 'en';};\nvar context = { req:{i18n:i18n}, res:{locals:{context:{country:'uk',context:'thomascook.com',langShort:'en',langLong:'en-EN',dateFormat:'dddd LL',market:'UK'}}}, config:config, data:data };\n\n\ndescribe(\"Test for mapper test\", function () {\n\n  before(function () {\n    context.req.query = { q1: 'q1', q2: 'q2' };\n    context.req.params = { p1: 'p1', p2: 'p2' };\n    context.pricingCalendar = undefined;\n  });\n\n  var input = {};\n\n  it(\"Test for mapper test\", function () {\n    var output = test.execute(input, Object.create(context));\n\n    output.should.eql({});\n  });\n\n  after(function () {\n    delete context.req.query;\n    delete context.req.params;\n    delete context.pricingCalendar;\n  });\n\n});\n\n");
        done();
      }, 200);
    });

    it('should trigger the test generation callback function twice', function (done) {
      testGenerator.mapCompleted(input, {}, 'test');
      testGenerator.mapCompleted(input, {}, 'test');
      setTimeout(function () {
        var generatedTest = fs.readFileSync('./testTest.js', { encoding: 'utf8' });
        generatedTest.should.eql("/* global describe, it, before, after */\n/* jslint node: true */\n'use strict';\n\nvar should = require('should');\nvar i18n = require('i18next');\nvar config = require('../../src/lib/config');\nvar data = require('../../data');\nvar test = require('<path_to_map>/test');\n\ni18n.init({lng: 'en'});\ni18n.language = function(){return 'en';};\nvar context = { req:{i18n:i18n}, res:{locals:{context:{country:'uk',context:'thomascook.com',langShort:'en',langLong:'en-EN',dateFormat:'dddd LL',market:'UK'}}}, config:config, data:data };\n\n\ndescribe(\"Test for mapper test\", function () {\n\n  before(function () {\n    context.req.query = { q1: 'q1', q2: 'q2' };\n    context.req.params = { p1: 'p1', p2: 'p2' };\n    context.pricingCalendar = undefined;\n  });\n\n  var input = {};\n\n  it(\"Test for mapper test\", function () {\n    var output = test.execute(input, Object.create(context));\n\n    output.should.eql({});\n  });\n\n  after(function () {\n    delete context.req.query;\n    delete context.req.params;\n    delete context.pricingCalendar;\n  });\n\n});\n\ndescribe(\"Test for mapper test\", function () {\n\n  before(function () {\n    context.req.query = { q1: 'q1', q2: 'q2' };\n    context.req.params = { p1: 'p1', p2: 'p2' };\n    context.pricingCalendar = undefined;\n  });\n\n  var input = {};\n\n  it(\"Test for mapper test\", function () {\n    var output = test.execute(input, Object.create(context));\n\n    output.should.eql({});\n  });\n\n  after(function () {\n    delete context.req.query;\n    delete context.req.params;\n    delete context.pricingCalendar;\n  });\n\n});\n\n");
        done();
      }, 200);
    });

    it('should trigger the test generation callback function with an error', function (done) {
      var e = new Error('Mapper failure');
      e.error = new Error('inner error');
      e.mapper = 'test';
      e.target = 'path/to/target';
      testGenerator.mapCompleted(input, e, 'test');
      setTimeout(function () {
        var generatedTest = fs.readFileSync('./testTest.js', { encoding: 'utf8' });
        generatedTest.should.eql("/* global describe, it, before, after */\n/* jslint node: true */\n'use strict';\n\nvar should = require('should');\nvar i18n = require('i18next');\nvar config = require('../../src/lib/config');\nvar data = require('../../data');\nvar test = require('<path_to_map>/test');\n\ni18n.init({lng: 'en'});\ni18n.language = function(){return 'en';};\nvar context = { req:{i18n:i18n}, res:{locals:{context:{country:'uk',context:'thomascook.com',langShort:'en',langLong:'en-EN',dateFormat:'dddd LL',market:'UK'}}}, config:config, data:data };\n\n\ndescribe(\"Test for mapper test\", function () {\n\n  before(function () {\n    context.req.query = { q1: 'q1', q2: 'q2' };\n    context.req.params = { p1: 'p1', p2: 'p2' };\n    context.pricingCalendar = undefined;\n  });\n\n  var input = {};\n\n  it(\"Test for mapper test\", function () {\n    var output = test.execute(input, Object.create(context));\n\n    output.message.should.eql('Mapper failure');\n    output.error.message.should.eql('inner error');\n    output.mapper.should.eql('test');\n    output.target.should.eql('path/to/target');\n  });\n\n  after(function () {\n    delete context.req.query;\n    delete context.req.params;\n    delete context.pricingCalendar;\n  });\n\n});\n\n");
        done();
      }, 200);
    });

    after(function () {
      delete process.env.PAPI_MAP_TESTS_GEN;
    });

  });


});
