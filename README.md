# js-object-mapper

Use this library to declare move, assign and submap instructions which, when executed, transform an input javascript object into an output javascript object.
	
Optional parameters and transform functions make these instructions flexible enough to handle most data mapping requirements.


## Install

``` js
npm install js-object-mapper
```

## Run the Sample

``` js
cd js-object-mapper
node docs/sample.js
```
You should see:

```js
mapper:
new Mapper()
  .move('Title', 'subject') // move value from property 'subject' to property 'Title'
  .assign('Version', 1) // assign 1 to property 'Version'
  .submap('Names', 'list', {}, new Mapper() // map property 'list' to property  ''Names' using submap
    .move('LastName','surname', {}, function(v){return v.toUpperCase();}) // transform using function
  )
;

input:  { subject: 'Duty Roster',
  list: [ { surname: 'Smith' }, { surname: 'Jones' } ] }

output:  { Title: 'Duty Roster',
  Version: 1,
  Names: [ { LastName: 'SMITH' }, { LastName: 'JONES' } ] }
```

## Test

``` js
npm test

npm run cov // writes code coverage to .coverage

```

## Use

### Definition

Construct a named mapper using the Mapper constructor and configure with a cascade of move, assign and submap instructions.

``` js
var Mapper = require('mapper');
var mapper = new Mapper('myMapper')
    .move(..)
    .assign(..)
    .submap(..)
;
```

### Execution
```js
var context = {config:config, data:data}; // for example
var output = mapper.execute(input, context);
```
When mapper is executed instructions are carried out in the order in which they are defined.

Execution context may be used to pass external variables into and out of the mapper (e.g configuration parameters or reference data). It may also be used to store intermediate results during mapper execution. (e.g a currency code may be defined at the highest level in the input
but embedded within several sub-maps in the output. We can move it from source into the context in the top level map,
and move it from the context to the output in an embedded sub-map.)

Context is indicated by a leading / in the field label of a move instruction, as the following diagram illustrates:

![context-source-output](docs/js_object_mapper.png)

## Instruction Reference

Instructions take up to four parameters:

   1. **to** specifies the property in the output object for the instruction to update. 
     * Can be a property name e.g.`'lastName'`
     * or a dot-separated list of nested property names e.g.`'name.last'` 
     * A `'/'` prefix is used to indicate that the target is a property of the execution context rather than the output. 
     * Mandatory. 
   2. **from** specifies the properties in the input object used by the instruction. 
     * Can be property name  e.g.`'lastName'`
     * or a dot-separated list of nested property names e.g.`'name.last'`.
     * `' '` indicates the entire input object. 
     * Multiple inputs may be specified in an array e.g.`['last','first']`
     * or an object  e.g.`{last:'last', first:'first'}`
     * A `'/'` prefix is used to indicate that the source is a property of the execution context rather than the input object. 
     * Optional. If not specified then it is assumed to be the same as 'to'. 
   3. **options** - an object with properties (e.g. condition, filter, default) which modify the instruction's behaviour. 
      * Varies by instruction (see below)
      * Optional.
   4. **transform** - function or mapper instance used to transform  ''from' value to 'to' value'.
     * Varies by function (see below)
     * Optional.


#### Move

sets target property from values of source properties.
	
*options*

* condition
	* `function(v,i,c){return boolean}` 
    * v is input value, i is index of iterated submap, c is execution context 
    * returns true or false to indicate whether on not the move takes place
* multiple 
    * false (default) - set target value
    * true - push value to target array
* default - set target to this value if otherwise unset

*transform*
 
* `function(v,i,c){return output;}`
* v is value of source property (or array or object of values)
* i is index of enclosing iterated submap (or undefined if not iterated)
* c is execution context
* target property set to output (unless transform returns undefined)
	


#### Assign
	
sets target property from static value.

*options*

* condition
	* `function(v,i,c){return boolean}` 
    * v is input value, i is index of iterated submap, c is execution context 
    * returns true or false to indicate whether on not the move takes place

#### Submap

A *submap* is an instance of Mapper which is applied to the value of the source object property to generate a value to push or set to target object property.

If the source object is an array then, by default, sub-map will be applied to each element of the array,  generating an output array.

Options:

`filter`: function of array element and context returning boolean. Array element will only be pushed onto target field if true
`condition`: javascript function of full source object which must return true for the sub-map to be executed
`multiple`: false (maps to same output object)          true  (maps to array)
`default`: javascript literal used as target value if the source field is not present


## Mapping Tips


## Generate Unit Tests

## Generate Map Tests







