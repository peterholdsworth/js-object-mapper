var Mapper = require('../../src/mapper');

//module.exports = new Mapper().move('a', 'b');
var a =new Mapper().submap('a', 'b', {}, new Mapper().move('number', '')).execute({b:[{a:1},{a:2}]});
console.log(a);
//module.exports = {a:[2,3]}

var d =new Mapper().move('a', 'b', {}, function(v) {
  return v.map(function(value) {
    return value += 1;
  })
}).execute({b:[1,2]});

console.log(d);
