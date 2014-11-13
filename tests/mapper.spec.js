/*global describe, it, before, after*/

var should = require('should');
var util = require('util');
var Mapper = require('../src/mapper');
var m, o, i;


describe("Mapper", function() {

  beforeEach(function() {
    m = new Mapper();
  });

  it("should move field a to field b", function() {
    m.move('b', 'a');
    o = m.execute({a: 1});
    o.should.eql({b: 1});
  });

  it("should conditionally move field a to field b", function() {
    m.move('b', 'a', {
      condition: function() {
        return true;
      }
    });
    o = m.execute({a: 1});
    o.should.eql({b: 1});
  });

  it('should use whole value when source is an empty array', function(){
    o = m.submap('a', 'b', {}, new Mapper().move('number', '')).execute({b:[{a:1},{a:2}]});
    o.should.eql({ a: [ { number: { a: 1 } }, { number: { a: 2 } } ] });
  });

  it("should conditionally not move field a to field b", function() {
    m.move('b', 'a', {
        condition: function() {
          return false;
        }
      });
    o = m.execute({a: 1});
    o.should.eql({});
  });

  it("should conditionally not move field a to field b with default", function() {
    m.move('b', 'a', {
      condition: function() {
        return false;
      }, default: 2
    });
    o = m.execute({a: 1});
    o.should.eql({b: 2});
  });

  it("should conditionally not move field a to field /b with default", function() {
    m.move('/b', 'a', {
        condition: function() {
          return false;
        }, default: 2
      })
      .move('b', '/b');
    o = m.execute({a: 1});
    o.should.eql({b: 2});
  });

  it("should move field a to field b twice", function() {
    m.move('b', 'a');
    o = m.execute({a: 1});
    o.should.eql({b: 1});
    var m2 = new Mapper()
      .move('b', 'a');
    o = m2.execute({a: 1});
    o.should.eql({b: 1});
  });

  it("should move field a to field b and c to d", function() {
    m.move('b', 'a')
      .move('d', 'c');
    o = m.execute({a: 1, c: 2});
    o.should.eql({b: 1, d: 2});
  });

  it("should move empty field a to field b default", function() {
    m.move('b', 'a', {default: 1});
    o = m.execute({});
    o.should.eql({b: 1});
  });

  it("should move field a.b to field c", function() {
    m.move('c', 'a.b');
    o = m.execute({a: {b: 1}});
    o.should.eql({c: 1});
  });

  it("should move field a to field b.c", function() {
    m.move('b.c', 'a');
    o = m.execute({a: 1});
    o.should.eql({b: {c: 1}});
  });

  it("should move field a to field b.0", function() {
    m.move('b.0', 'a');
    o = m.execute({a: 1});
    o.should.eql({b: [1]});
  });

  it("should move field a to field b.1", function() {
    m.move('b.1', 'a');
    o = m.execute({a: 1});
    o.should.eql({b: [, 1]});
  });

  it("should move field a to field c.0 and b to c.1", function() {
    m.move('c.0', 'a').move('c.1', 'b');
    o = m.execute({a: 1, b: 2});
    o.should.eql({c: [1, 2]});
  });

  it("should apply a custom transform", function() {
    m.move('b', 'a', {}, function(v) {
      return v.trim();
    });
    o = m.execute({a: '    h     '});
    o.should.eql({b: 'h'});
  });

  it("should apply a custom transform (no parameters)", function() {
    m.move('b', 'a', function(v) {
      return v.trim();
    });
    o = m.execute({a: '    h     '});
    o.should.eql({b: 'h'});
  });

  it("should conditionally assign a field", function() {
    m.assign('b', 1, {
      condition: function() {
        return false;
      }
    });
    o = m.execute({});
    o.should.eql({});
  });

  it("should assign a field", function() {
    m.assign('b', 1);
    o = m.execute({});
    o.should.eql({b: 1});
  });


  it("should assign a field and apply a transform", function() {
    m.assign('b', '  h  ', function(v) {
      return v.trim();
    });
    o = m.execute({});
    o.should.eql({b: 'h'});
  });

  it("should assign a field and move c to d", function() {
    m.assign('b', 1).move('d', 'c');
    o = m.execute({c: 2});
    o.should.eql({b: 1, d: 2});
  });

  it.skip("should move field a to field b and c to d 10,000 times within 100 milliseconds", function() {
    m.move('b', 'a').move('d', 'c');
    var before = process.hrtime();
    for (i = 0; i < 10000; i++) {
      o = m.execute({a: 1, c: 2});
    }
    var diff = process.hrtime(before); // [seconds, nanoseconds]
    o.should.eql({b: 1, d: 2});
    diff[0].should.eql(0);
    diff[1].should.be.below(140 * 1000 * 1000);
  });

  it("should move field a to multiple field b", function() {
    m.move('b', 'a', {multiple: true});
    o = m.execute({a: 1});
    o.should.eql({b: [1]});
  });

  it("should move field a and b to multiple field c", function() {
    m.move('c', 'a', {multiple: true})
      .move('c', 'b', {multiple: true});
    o = m.execute({a: 1, b: 2});
    o.should.eql({c: [1, 2]});
  });


  it("should move field a and b to multiple field c.d", function() {
    m.move('c.d', 'a', {multiple: true})
      .move('c.d', 'b', {multiple: true});
    o = m.execute({a: 1, b: 2});
    o.should.eql({c: {d: [1, 2]}});
  });


  it("should move field a to b using a submap", function() {
    m.submap('b', 'a', {}, new Mapper().move('d', 'c'));
    o = m.execute({a: {c: 1}});
    o.should.eql({b: {d: 1}});
  });

  it("should move field a to b using a submap with no parameters", function() {
    m.submap('b', 'a', new Mapper().move('d', 'c'));
    o = m.execute({a: {c: 1}});
    o.should.eql({b: {d: 1}});
  });

  it("should map field a to b using a submap from top level", function() {
    m.submap('b', '', {}, new Mapper().move('d', 'a'));
    o = m.execute({a: 1});
    o.should.eql({b: {d: 1}});
  });


  it("should map multiple field a to multiple field b using a submap", function() {
    m.submap('b', 'a', {}, new Mapper().move('d', 'c'));
    o = m.execute({a: [{c: 1}, {c: 2}]});
    o.should.eql({b: [{d: 1}, {d: 2}]});
  });


  it("should map multiple field a to single field b using a submap with filter", function() {
    m.submap('b', 'a',
      {
        multiple: false,
        filter: function(v) {
          return Mapper.get(v, 'd') === 4;
        }
      },
      new Mapper().move('e', 'c'));
    o = m.execute({a: [{c: 1, d: 3}, {c: 2, d: 4}]});
    o.should.eql({b: {e: 2}});
  });

  it("should map from array of fields a and b using a transform", function() {
    m.move('c', ['a', 'b'], function(v) {
      return v[0] + v[1];
    });
    o = m.execute({a: 'a', b: 'b'});
    o.should.eql({c: 'ab'});
  });

  it("should map from an object of fields a and b using a transform", function() {
    m.move('c', {a: 'a', b: 'b'}, function(v) {
      return '' + v.a + v.b;
    });
    o = m.execute({a: 'a', b: 'b'});
    o.should.eql({c: 'ab'});
  });

  it("should map mobile phone and home phone to phones array", function() {
    m.move('phones', 'homePhone', {multiple: true}, function(v) {
      return {type: 'home', number: v};
    })
      .move('phones', 'mobilePhone', {multiple: true}, function(v) {
        return {type: 'mobile', number: v};
      });
    o = m.execute({homePhone: 1, mobilePhone: 2});
    o.should.eql({phones: [{type: 'home', number: 1}, {type: 'mobile', number: 2}]});
  });

  it("should map phones array to mobile phone and home phone by submap", function() { // bug - second submap overwrites the first
    m.submap('telephone', 'phones', {
        multiple: false, filter: function(v) {
          return v.type === 'home';
        }
      }, new Mapper().move('homePhone', 'number'))
      .submap('telephone', 'phones', {
        multiple: false, filter: function(v) {
          return v.type === 'mobile';
        }
      }, new Mapper().move('mobilePhone', 'number'));
    o = m.execute({phones: [{type: 'home', number: 1}, {type: 'mobile', number: 2}]});
    o.should.eql({telephone: {homePhone: 1, mobilePhone: 2}});
  });

  it("should map phones array to mobile phone and home phone by move", function() {
    m
      .move('homePhone', 'phones', function(v) {
        return v.filter(function(v) {
          return v.type === 'home';
        })[0].number;
      })
      .move('mobilePhone', 'phones', function(v) {
        return v.filter(function(v) {
          return v.type === 'mobile';
        })[0].number;
      });
    o = m.execute({phones: [{type: 'home', number: 1}, {type: 'mobile', number: 2}]});
    o.should.eql({homePhone: 1, mobilePhone: 2});
  });

  it("should map field a to b using a submap of a submap", function() {
    m.submap('d', 'a', {}, new Mapper().submap('e', 'b', {}, new Mapper().move('f', 'c')));
    o = m.execute({a: {b: {c: 1}}});
    o.should.eql({d: {e: {f: 1}}});
  });

  it("should throw an Error('Mapper failure') if a transform fails", function() {
    m = new Mapper('fail').move('a', 'b', {}, function(b) {
      return b.c.d;
    });
    o = m.execute({b: 1});
    o.should.be.instanceOf(Error);
  });

  it("should return array of targets when a submap fails", function() {
    m = new Mapper('top').submap('d', 'a', {}, new Mapper().submap('e', 'b', {}, new Mapper().move('f', 'c', function() {
      return g.h;
    })));
    o = m.execute({a: {b: {c: 1}}});
    o.target[0].should.eql('d');
    o.target[1].should.eql('e');
    o.target[2].should.eql('f');
    // console.log(util.inspect(o, {depth:null}));
  });

  it("should let me safely get the toplevel within a function", function() {
    m.move('z', '', {}, function(v) {
      return Mapper.get(v, '');
    });
    o = m.execute({d: 1});
    o.should.eql({z: {d: 1}});
  });

  it("should let me safely get a deeply nested property in a transform", function() {
    m.move('z', 'a', {}, function(v) {
      return Mapper.get(v, 'b.c.d');
    });
    o = m.execute({a: {b: {c: {d: 1}}}});
    o.should.eql({z: 1});
  });

  it("should let me safely get a deeply nested property in a transform with mis-spelled last property", function() {
    m.move('z', 'a', {}, function(v) {
      return Mapper.get(v, 'b.c.dd');
    });
    o = m.execute({a: {b: {c: {d: 1}}}});
    o.should.eql({});
  });

  it("should let me safely get a deeply nested property in a transform with mis-spelled penultimate property", function() {
    m.move('z', 'a', {}, function(v) {
      return Mapper.get(v, 'b.cc.d');
    });
    o = m.execute({a: {b: {c: {d: 1}}}});
    o.should.eql({});
  });

  it("should let me safely get a deeply nested property in a transform with mis-spelled two from last property ", function() {
    m.move('z', 'a', {}, function(v) {
      return Mapper.get(v, 'bb.c.d');
    });
    o = m.execute({a: {b: {c: {d: 1}}}});
    o.should.eql({});
  });

  it("should correctly assign to a context variable", function() {
    m.submap('A', 'a', {multiple: true}, new Mapper()
        .assign('/B', null) // does not work if you .assign('/B', []). Should clone object value before assignment
        .submap('/B', 'b', {multiple: true}, new Mapper()
          .move('C', 'c'))
        .move('/D', '/B', function(v) {
          return v.map(function(item) {
            return item.C;
          });
        })
        .move('B', '/D')
    );
    // o = m.execute({a:[{c:1},{c:2}]});
    o = m.execute({
      a: [
        {b: [{c: 1}, {c: 2}]},
        {b: [{c: 3}, {c: 4}]}
      ]
    });
    o.should.eql({A: [{B: [1, 2]}, {B: [3, 4]}]});
  });

  it("should move with multiple option by pushing to an array", function() {
    m.move('c', 'a', {multiple: true})
      .move('c', 'b', {multiple: true});
    o = m.execute({a: 1, b: 2});
    o.should.eql({c: [1, 2]});
  });

  it("should support JSONPath", function() {
                  //root operator and recursive descent
    m.move('c', '$..c', {multiple: true});
    o = m.execute({a: {b: {c: 1}, c: 2}});
    o.should.eql({c: [2, 1]});
  });

  it("should give access to transforms for unit testing", function() {
    m.move('a', 'b', function(v) {
      return -Math.round(-v);
    });
    m.to.a(0.5).should.eql(0);
  });

  it("should give access to nested transforms for unit testing", function() {
    m.submap('a', 'b', {}, new Mapper()
        .move('c', 'd', {}, function(v) {
          return -Math.round(-v);
        })
    );
    m.to.a.to.c(0.5).should.eql(0);
  });

  it("should give access to transforms to same target for unit testing", function() {
    m.move('c', 'a', {multiple: true}, function(v) {
      return Math.round(v);
    })
      .move('c', 'b', {multiple: true}, function(v) {
        return -Math.round(-v);
      });
    m.to.c[0](0.5).should.eql(1);
    m.to.c[1](0.5).should.eql(0);
  });

  it("should give access to parameters for unit testing", function() {
    m.move('a', 'b', {
        condition: function() {
          return false;
        }
      });
    m.paramTo.a.condition().should.eql(false);
  });


  it("should map field a to b using a submap with conditional move", function() {
    m.submap('b', 'a', {}, new Mapper().move('d', 'c', {
      condition: function(v, i, c) {
        return i === 0;
      }
    }));
    o = m.execute({a: [{c: 1}, {c: 2}]});
    o.should.eql({b: [{d: 1}, {}]});
  });

  it("should default conditionally map field a to b using a submap", function() {
    m.submap('b', 'a', {
      condition: function() {
        return false;
      }, default: 1
    }, new Mapper().move('d', 'c'));
    o = m.execute({a: [{c: 1}, {c: 2}]});
    o.should.eql({b: 1});
  });

  it("should map field a to b using a submap with conditional submap", function() {
    m.submap('b', 'a', {}, new Mapper()
        .submap('d', 'c', {
          condition: function(v, i, c) {
            return i === 0;
          }
        }, new Mapper()
          .move('f', 'e')
      )
    );
    o = m.execute({a: [{c: {e: 1}}, {c: {e: 2}}]});
    o.should.eql({b: [{d: {f: 1}}, {}]});
  });

  it("should log output value", function() {
    m.move('a', 'b').log('a');
    o = m.execute({b: 1});
    o.should.eql({a: 1});
  });

  it("should log context value", function() {
    m.move('/a', 'b').log('/a').move('a', '/a');
    o = m.execute({b: 1});
    o.should.eql({a: 1});
  });

  it('should let me get from a zero length array', function() {
    var context = {req: {params: []}};
    context.req.params.id = '123';
    Mapper.get(context, 'req.params.id').should.eql('123');
  });

  it('should filter out a singleton', function() {
    m.submap('a', 'b', {
        multiple: true, filter: function(v) {
          return v.c === 2;
        }
      }, new Mapper()
        .move('d', 'c')
    );
    o = m.execute({b: {c: 1}});
    o.should.eql({});
  });

  it('should filter out a singleton with default', function() {
    m.submap('a', 'b', {
        multiple: true, filter: function(v) {
          return v.c === 2;
        }, default: []
      }, new Mapper()
        .move('d', 'c')
    );
    o = m.execute({b: {c: 1}});
    o.should.eql({a: []});
  });

  it('should filter out all of an array with default', function() {
    m.submap('a', 'b', {
        multiple: true, filter: function(v) {
          return v.c === 2;
        }, default: []
      }, new Mapper()
        .move('d', 'c')
    );
    o = m.execute({b: [{c: 1}, {c: 3}]});
    o.should.eql({a: []});
  });

  it('should push to a deeply nested field within an array', function() {
    m.move('a.0.b', 'c', {multiple: true});
    o = m.execute({c: 1});
    o.should.eql({a: [{b: [1]}]});
  });

});