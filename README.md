## js-object-mapper


Use this library to construct a Mapper object for transforming a javascript object into a different format.

Basic usage


## Example

This is an example of a mapper for transforming a playerhub search response from the original xml2json output.

``` js
var searchMapper = new Mapper()

  .move('/currency',  // save currency in context
    'S:Body.PackageProductResponse.@.Currency'
  )
  .move('stats.start',
    'S:Body.PackageProductResponse.@.ShowingResultsFrom',
    function(v){return parseInt(v,10)+'';}
  )
  .move('stats.end',
    ['S:Body.PackageProductResponse.@.ShowingResultsFrom',
     'S:Body.PackageProductResponse.@.ResultsPerPage'],
    function(v){return parseInt(v[0],10)+parseInt(v[1],10)-1+'';}
  )
  .move('stats.total',
    'S:Body.PackageProductResponse.@.ResultsTotal',
    function(v){return parseInt(v,10)+'';}
  )
  .submap('products',
    'S:Body.PackageProductResponse.Hotel',
    { multiple:true,
      condition: function(v){
        var rpp = Mapper.get(v,'S:Body.PackageProductResponse.@.ResultsPerPage');
        return !!(rpp && rpp*1>0);}
    },
    offerItemsMapper
  )
  .move('contentKeys',
    'S:Body.PackageProductResponse.Hotel',
    { condition: function(v){
        var rpp = Mapper.get(v,'S:Body.PackageProductResponse.@.ResultsPerPage');
        return !!(rpp && rpp*1>0);}
    },
    function(v){
      var keys = {},id,contentId;
      if(!Array.isArray(v)){v=[v];}
      v.forEach(
        function(w){
          id = Mapper.get(w, 'References.GiataCode');
          contentId = Mapper.get(w, 'HotelCodes.HotelCode.#');
          if(id && contentId){keys[id] = contentId;}
        }
      );
      return keys;
    }
  );
```

The first *move* takes the Currency attribute and stores it in a context which can be accessed elsewhere in the map. This is indicated by the / character preceding the context field name.

The second *move* takes the ShowingResultsFrom attribute, applies a transformation to the field and stores it in stats.start.

The third *move* shows how multiple input fields can be transformed.

After the fourth move a *submap* (shown below) is used to transform S:Body.PackageProductResponse.Hotel to products. The multiple parameter ensures that the output is an array and the transformation only occurs if the condition function returns true. Mapper.get is used to safely a return a value, undefined if the input field is not present.

``` js
var offerItemsMapper = new Mapper()
  .move('id','References.GiataCode')
  .move('ratings.starRating','@.Category.0', function(v){return v.charAt(0);})
  .move('contentId','HotelCodes.HotelCode.#')
  .submap('priceDetail','Offers.Offer', priceDetailMapper)
  .submap('flights','Offers.Offer', {multiple:true}, GenericMapper.flightMapper)
  .move('tourOperator.id','Offers.Offer.TourOperator.@.Code')
  .move('tourOperator.name','Offers.Offer.TourOperator.#')
  .assign('included', [])  //@TODO
  .move('brandCode','Offers.Offer.TourOperator.@.Code')
  .move('brochureName','Offers.Offer.@.TravelType')
  .submap('rooms','Offers.Offer', {multiple:true}, roomInfoMapper)
  .move('duration','Offers.Offer.@.LengthOfStay')
  .move('occupation', '/occupation')
  .move('hotelName.value','Name')
  .assign('hotelName.uriFriendlyName','') //@TODO
  .move('geoLocation.latitude','Location.GeoCode.@.Latitude')
  .move('geoLocation.longitude','Location.GeoCode.@.Longitude')
  .move('geoPath.value',['Location.Country.#','Location.Region.#','Location.City.#'],
    function(v){ return (v[0] || '') + '/' + (v[1] || '') + '/' + (v[2] || '');})
  .move('geoPath.uriFriendlyGeoPath',['Location.Country.#','Location.Region.#','Location.City.#'],
    function(v){ return (v[0] || '') + '/' + (v[1] || '') + '/' + (v[2] || '');})
  .move('resort','Location.Region.#',{default:''})
  .move('destination','Location.City.#', {default:''})
  .assign('descriptions',[]);
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






