// takes map file name from command line.
// Writes skeleton unit test file to console
// node unitTestGenerator.js <mappath>

var indent = '  '; // two spaces
var mapper;
var name;
var targetList = []; // array of target objects specifying current target

// write to console with indentation determined by length of targetList
var print = function(str){
  if (!str) {console.log(''); return; }
  for(var i = 0; i < targetList.length; i++){
    process.stdout.write(indent);
  }
  console.log(str);
};

// convert 'to' object from ops list to possibly bracketed string and offset e.g .hotel or .room[1] or ['/resort'][2]
var toString = function (to){
  var s = ((to.root === 'context') ? '/' : '') + to.path.join('.');
  var b = !(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(s)); // use ['b'] rather than .b
  var o = [];
  o.push(b ? "['" : '.');
  o.push(s);
  if (b) {o.push("']");}
  if (to.offset !== undefined) {o.push('['); o.push(to.offset); o.push(']');}
  return o.join('');
};

// format 'to' object for use in describe
var toFormat = function (to){
  if (to) {
    return [
      to.root === 'context' ? '/' : '',
      to.path.join('.'),
      to.offset !== undefined ? ' ' + to.offset : ''
    ].join('');
  } else {
    return;
  }
};

// add offsets (starting from 0) to all repeated 'to' fields
var addOffsets = function (mapper) {
  // count all targets
  var target, i, offsets = {};
  for ( i = 0; i < mapper.ops.length; i++ ) {
    target = toString(mapper.ops[i].to);
    offsets[target] = (offsets[target] !== undefined) ? offsets[target]+1 : 0 ;
    var transform = mapper.ops[i].transform;
    // add offsets recursively
    if (typeof transform !== 'function'){ addOffsets(transform); }
  }
  // remove singletons form offsets list
  for ( i in offsets ) {
    if (offsets[i] === 0) { delete offsets[i]; }
  }
  // set offsets
  for ( i = mapper.ops.length - 1; i >= 0; i--){
    target = toString(mapper.ops[i].to);
    if (offsets[target] !== undefined) {
      mapper.ops[i].to.offset = offsets[target]--;
    }
  }
};

var format = function(type){
  var x = {transform:'', condition:' condition', filter:' filter'};
  var pre = {transform:'.to', condition:'.paramTo', filter:'.paramTo'};
  var post = {transform:'', condition:'.condition', filter:'.filter'};
  print(["describe('", toFormat(targetList[targetList.length-1]), x[type], "', function(){"].join(''));
  print();
  print("  it('should .....', function(){  // TODO");
  print("    var input = {}; // TODO");
  print("    var output = {}; // TODO");
  var code = [name];
  for (var j = 0; j < targetList.length-1; j++){
    code.push('.to');
    code.push(toString(targetList[j]));
  }
  code.push(pre[type]);
  code.push(toString(targetList[targetList.length-1]));
  code.push(post[type]);
  code.push('(input, 0, context).should.eql(output);');
  print("    " + code.join(''));
  print("  });");
  print();
  print("});");
  print();
};


var formatMapper = function(mapper){
  print([ "describe('", toFormat(targetList[targetList.length-1]) || mapper.name, "', function(){"].join(''));
  print();
  for ( var i=0; i < mapper.ops.length; i++ ){
    targetList.push(mapper.ops[i].to);
    if (mapper.ops[i].params.condition){
      format('condition');
    }
    if (mapper.ops[i].params.filter){
      format('filter');
    }
    if (typeof mapper.ops[i].transform === 'function'){ // move or assign
      format('transform');
    } else { // recursively format submap
      formatMapper(mapper.ops[i].transform);
    }
    targetList.pop();
  }
  print("});");
  print();
};

try {
  mapper = require(process.argv[2]);
  name = mapper.name;
  print('/* global describe, it, before, after */');
  print('/* jslint node: true */');
  print("'use strict';");
  print("var should = require('should');");
  print();
  print("var " + name + " = require('" + process.argv[2] + "');" );
  print();
  print('var context = {}; // TODO');
  print();
  addOffsets(mapper);
  formatMapper(mapper);
} catch (err) {
  console.error('Error processing mapper file: ' + process.argv[2]);
  console.error(err.stack);
}
