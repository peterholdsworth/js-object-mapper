var util = require('util');
var jsonPath = require('JSONPath');
var logger = require('../src/logger');

/**
 * @param {String} name
 * @constructor
 */
var Mapper = function(name){
  /**
   * @type {Array<Function>}
   */
  this.ops = [];
  /**
   * @type {string}
   */
  this.name = name || '';
  this.to = {}; // maps 'to' string to transform or submap so they can be easily accessed for unit testing
  this.paramTo = {}; // maps 'to' string to parameters so they can be easily accessed for unit testing
  this.generatorOpts = {name: this.name};

  //if (process.env.MAPPER_TESTS_GEN === 'true') {
    var stack = new Error().stack;

    var mapperFile = stack.split('\n')[2].match(/\(.*\)/g)[0];
    mapperFile = mapperFile.substr(1, mapperFile.indexOf('.js') + 2);
    //console.log("mapper file", mapperFile);
    this.generatorOpts.mapperFile = mapperFile; //absolute path to the mapperFile
  //}
};

var identityFn = function(v) {
  return v;
};

var contextPrefix = '/';
var expand = function expand(v){ // expands dot separated string with optional context prefix character
// 'a.b' -> {root:'object', path:[a','b']}
// '' -> {root:'object', path:[]}
// '/occupation' -> {root:'context',path:['occupation']}
// '$.a' -> {root:'object', path:'$.a'}   for JSONPath
// '/$.a' -> {root:'context', path:'$.a'} for JSONPath
  var root = 'object';
  if (v.charAt(0) === contextPrefix) {
    v = v.substring(1);
    root = 'context';
  }
  if (v.charAt(0) === '$' && v.charAt(1) === '.') { // JSONPath
    return {root: root, path: v};
  }
  return {root: root, path: (v ? v.split('.') : [])};
};

var add = function(object, property, value){
// set or push property in object
  if(object[property]){ // repeated property
    if(!Array.isArray(object[property])){ // make sure it's an array
      object[property] = [object[property]];
    }
    object[property].push(value); // push value
  } else {
    object[property] = value;
  }
};

Mapper.prototype = {
  /**
   *
   * @param {String} to property on the output
   * @param {String} [from] if not supplied, same as 'to' param
   * @param {Object} [params]
   * @param {Function} [customjs] which is invoked with three arguments- value, index and context
   * @returns {Mapper}
   */
  move: function(to, from, params, customjs){
    var expandFrom, expandTo;
    if (from === undefined) {
      from = to;
    }
    if (params === undefined) {
      params = {};
    }
    if (params instanceof Function) {
      customjs = params;
      params = {};
    } // handle missing params

    customjs = customjs || identityFn;
    if(Array.isArray(from)){
      expandFrom = from.map(function(v){return expand(v);});
    } else if (typeof from !== 'string' ) {
      expandFrom = {};
      for (var i in from ){
        expandFrom[i] = expand(from[i]);
      }
    } else {
      expandFrom = expand(from);
    }
    expandTo = expand(to);
    this.ops.push({op:move, from:expandFrom, to:expandTo, params: params, transform: customjs});
    add(this.to, to, customjs);
    add(this.paramTo, to, params);
    return this;
  },
  /**
   *
   * @param {String} to
   * @param {*} value
   * @param {Object} [params]
   * @param {Function} [customjs] which is invoked with three arguments- value, index and context
   * @returns {Mapper}
   */
  assign: function(to, value, params, customjs){
    params = params || {};
    if (params instanceof Function) {
      customjs = params;
      params = {};
    } // handle missing params
    customjs = customjs || identityFn;
    this.ops.push({op: assign, from: value, to: expand(to), params: params, transform: customjs});
    add(this.to, to, customjs);
    add(this.paramTo, to, params);
    return this;
  },
  /**
   * @param {String} [from=''] path to the property you want to log. If '', the the whole object is logged.
   *                 At the end just before execute, '' will log the whole output from mapper
   * @returns {Mapper}
   */
  log: function(from){
    if (from === undefined) {
      from = '';
    }
    this.ops.push({op:log, from:expand(from)});
    return this;
  },
  /**
   * @param {String} to
   * @param {String} from
   * @param {Object} [params]
   * @param {Mapper} mapping
   * @returns {Mapper}
   */
  submap: function(to, from, params, mapping){
    if (params instanceof Mapper) {
      mapping = params;
      params = {};
    } // handle missing params
    this.ops.push({op: submap, from: expand(from), to: expand(to), params: params, transform: mapping});
    add(this.to, to, mapping);
    add(this.paramTo, to, params);
    return this;
  },
  /**
   *
   * @param {Object} input
   * @param {Object} [context]
   * @param {Object} [output] this param is passed when chaining
   * @param {Array<String>} [target]
   * @returns {*}
   */
  execute: function(input, context, output, target){
    var out;
    try {
      target = []; // full path of the current target element (for error reporting)
      out = this.map(input, context, output, target);
    } catch (error) {
      var e = new Error('Mapper failure');
      e.error = error;
      e.mapper = this.name;
      e.target = target.map(function(v) {
        return ((v.root === 'object') ? '' : '/') + v.path.join('.');
      });
      out = e;
    }
    if (process.env.MAPPER_TESTS_GEN === 'true') {
      var generator = require('../src/testGenerator');

      generator(input, context, out, this.generatorOpts);
    }
    return out;
  },
  /**
   *
   * @param {Object} input
   * @param {Object} context
   * @param {Object} [output] used internally when chaining
   * @param {Array} [target] used internally for error handling
   * @param index
   * @returns {Object}
   */
  map: function(input, context, output, target, index){
    output = output || {};
    context = context || {};
    var i;
    var t;
    for ( i=0; i<this.ops.length; i++){
      t = this.ops[i];
      logger.debug(input, output, t.from, t.to, t.params, t.transform);

      target.push(t.to);
      t.op.call(this, input, output, t.from, t.to, t.params, t.transform, context, target, index);
      target.pop();
      //logger.debug(input, output, t.from, t.to, t.params, t.transform);
    }
    return output;
  }
};

// safe get function
// fetch property from nested path. return undefined if not present
// Default to first element of an array if property name is not a number
// Check for zero length array so that we can fetch id from req.params.id


var get = function get(obj, path){
  if ((typeof path === 'string') && path.charAt(0) === '$' && path.charAt(1) === '.') {
    return jsonPath.eval(obj, path);
  }
  if (typeof path === 'string') {
    path = (path ? path.split('.') : []);
  }
  if (path.length === 0) {
    return obj;
  }
  var pointer = obj;
  for ( var i = 0; i < path.length-1; i++) {
    if (!(pointer instanceof Object)) {return undefined;}
    pointer = (Array.isArray(pointer) && pointer.length > 0 && isNaN(path[i]))? pointer[0][path[i]] : pointer[path[i]];
    if ( pointer === undefined ) {return undefined;}
  }
  return pointer?(Array.isArray(pointer) && pointer.length > 0 && isNaN(path[i]))? pointer[0][path[i]] :pointer[path[i]]:undefined;
};
// make available externally
Mapper.get = get;

// safe put function
var put = function put(obj, path, value){
  var pointer = obj;
  for ( var i = 0; i < path.length-1; i++) {
    if ( pointer[path[i]] === undefined ) {
      pointer[path[i]] = (Number.isNaN(parseInt(path[i+1], 10)))?{}:[];
    }
    pointer = pointer[path[i]];
  }
  pointer[path[path.length-1]] = value;
  return obj;
};

// safe push function
var push = function push(obj, path, value){
  var pointer = obj;
  for ( var i = 0; i < path.length-1; i++) {
    if ( pointer[path[i]] === undefined ) {
      pointer[path[i]] = (Number.isNaN(parseInt(path[i+1], 10)))?{}:[];
    }
    pointer = pointer[path[i]];
  }
  pointer[path[path.length-1]] = pointer[path[path.length-1]] || [];
  // if( Array.isArray(pointer[path[path.length-1]])){
    pointer[path[path.length-1]].push(value);
  // }
  return obj;
};

// safe move. params={  default: <literal>,
//                      condition: <boolean function>,
//                      multiple: true }
//  transform is a custom js function
// from can be a {root:path:} object or an array of {root:path:} objects
var move = function move(input, output, from, to, params, transform, context, target, index){
  var value;
  if ((!params.condition) || params.condition.call(null, input, index, context)){
    if (Array.isArray(from)) {
      value = from.map(function(v) {
        return get((v.root === 'object') ? input : context, v.path);
      });
    } else if (from.root === 'object') {
      value = get(input, from.path);
    } else if (from.root === 'context'){
      value = get(context, from.path);
    } else { // object of fields
      value = {};
      for (var i in from){
        value[i] = get((from[i].root === 'object') ? input : context, from[i].path);
      }
    }
    if ((value !== undefined) && transform){ value = transform(value, index, context);}
    if (value !== undefined ) {
      (params.multiple && !Array.isArray(value)?push:put)((to.root==='object')?output:context, to.path, value);
      return output;
    } else if ( params.default !== undefined){
      put((to.root==='object')?output:context, to.path, params.default);
      return output;
    }
  } else if ( params.default !== undefined){
    put((to.root==='object')?output:context, to.path, params.default);
    return output;
  }
};

// assign fixed value
var assign = function assign(input, output, value, to, params, transform, context, target, index){
  var pu = params.multiple ? push : put;
  if ((!params.condition) || params.condition.call(null, input, index, context)){
    pu((to.root==='object')?output:context, to.path, transform(value, index, context));
    return output;
  }
};

// submap (iterated for elements of an array)
// params={ filter: <boolean function>
//          condition:<boolean function>
//          multiple: false (maps to same output object)
//                    true  (maps to array)
//          default: <literal>
// }
var submap = function submap(input, output, from, to, params, transform, context, target, index){
  var multiple, unset = true;
  var out = (to.root === 'context') ? context : output;

  if ((!params.condition) || params.condition.call(null, input, index, context)) {
    var source = get((from.root === 'context') ? context : input, from.path);
    if (source !== undefined) {
      if (Array.isArray(source)) {
        for (var i = 0; i < source.length; i++) {
          if ((!params.filter) || params.filter(source[i], i, context)) {
            multiple = (params.multiple === undefined) ? true : params.multiple; // if source is array default to multiple output
            (multiple ? push : put)(out, to.path, transform.map(source[i], context, multiple ? null : get(out, to.path), target, i));
            unset = false;
          }
        }
      } else {
        multiple = (params.multiple === undefined) ? false : params.multiple; // if source is singleton default to singleton output
        if ((!params.filter) || params.filter(source, undefined, context)) {
          (multiple ? push : put)(out, to.path, transform.map(source, context, multiple ? null : get(out, to.path), target, null));
          unset = false;
        }
      }
    }
  }

  if (unset === true && params.default !== undefined) {
    put(out, to.path, params.default);
  }

  return output;
};


var log = function log(input, output, from, to, params, transform, context, target, index) {
  var n = this.name || this.generatorOpts.mapperFile;
  console.log('==============start mapping log: ' + n + ' ' + ((from.root === 'context') ? '/' : '') + from.path.join('.') + '===============');
  console.log(util.inspect(get((from.root === 'context') ? context : output, from.path), {depth: null}));
  console.log('================end mapping log: ' + ((from.root === 'context') ? '/' : '') + from.path.join('.') + '===============');
};

module.exports = Mapper;
