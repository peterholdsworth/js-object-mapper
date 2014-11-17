## js-object-mapper


Use this library to construct a Mapper object for transforming a javascript object into a different format with nice fluent api syntax.

Installation
```
npm i js-object-mapper
```

## Example
as in examples.js:
``` js
var Mapper = require('js-object-mapper');
var repos = require('./source.json');   //our source object is array of repos for a github user

var names = new Mapper().submap('repos', '', new Mapper().move('name', 'name')).execute(repos);
//returns array with object containing just one property
console.log(names);   //{ repos:
                      //  [ { name: 'ADE' },
                      //          ...
                      //    { name: 'o.deepObserve' }
                      //  ]
                      // }
```

``` js

```

 *assign* is used to set an output field to a fixed value

## Development

``` js
npm install js-object-mapper
```

## Testing

``` js
npm test
```

## Require it

``` js
var Mapper = require('mapper');    
var searchMapper = new Mapper()
    .move(..........
```
### Execute it

The mapper can be executed like this:
``` js
mapResults = searchMapper.execute(input, context);
```

An instance of Mapper may be configured by calling a cascade of move, assign and submap methods(described below).

Each method takes four parameters:
 
   * to - string - dot separated name of target field (prefixed with / to indicate context rather than input or output)
   * from - string - name of source field OR array of strings - names of input fields OR javascript literal - value
   * parameters - an object with properties e.g. condition, filter, default etc. (described for each method). optional.
   * transform - javascript function OR Mapper instance.  Passed the source field value or array of values, current index of mapped array, and the context object during execution
   

``` js
var offerItemsMapper = new Mapper()
  .move('id','References.GiataCode')
  .move('ratings.starRating','@.Category.0', function(v){return v.charAt(0);})
  .submap('flights','Offers.Offer', {multiple:true}, GenericMapper.flightMapper)
  .assign('descriptions',[]);
```

When the instance is executed the transformations are carried out in the order in which they are defined.

``` js
var output searchMapper.execute(input, context)
```

The context may be used both to pass external variables into and out of the mapper (e.g input parameters).It may also be used to pass variables around within a mapper. (e.g a currency code may be defined at the highest level in the input
but embedded within several sub-maps in the output. We can move it from source into the context in the top level map,
and move it from the context to the output in an embedded sub-map.)

Context is indicated by a leading / in the field label of a move command.

## Operations

1) **move**

A *move* takes to value of an input field and sets an output field to this value.

Parameters:

`default`: javascript literal used as input value if the source field is not present
`condition`: javascript function of full source object which must return true for the move to be executed
`multiple`: true indicated that the target field is an array and that source value should be pushed onto array.

2) **assign**

Parameters:

`condition`: javascript function of full source object which must return true for the move to be executed

3) **submap**

A *submap* is an instance of Mapper which is applied to a field of the source object to generate a field of the target object.
If the source object is an array then, by default, sub-map will be applied to each element of the array,  generating an output array.

Parameters:

`filter`: function of array element and context returning boolean. Array element will only be pushed onto target field if true
`condition`: javascript function of full source object which must return true for the sub-map to be executed
`multiple`: false (maps to same output object)          true  (maps to array)
`default`: javascript literal used as target value if the source field is not present






