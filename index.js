'use strict';
var _ = require('lodash');
var transducers = {};

function concat(a, b) {
    var t = a.concat([b]);
    return t;
}

function identity(x) {
    return x;
}

function inc(x) {
    return x + 1;
}

function greaterThanTwo(x) {
    return (x > 2);
}

function lessThanThree(x) {
    return (x < 4);
}


// var filterLessThanThreeAndIncrement = _.flowRight(
//     take(1),
//     mapping(inc),
//     filtering(lessThanThree)
// );


/* var result = [1,2,3,4].reduce(
  filterLessThanThreeAndIncrement(function (result, input) {
    result[input] = true;
    log(result);
    return result;
  }), {});*/

// var result = [1, 2, 3, 4, 5, 6].reduce(
//     filterLessThanThreeAndIncrement(concat), []);

function Reduced(value) {
    this.reduced = true;
    this.value = value;
}

function isReduced(x) {
    return (x instanceof Reduced) || (x && x.reduced);
}

function deref(x) {
    return x.value;
}

/**
 * This is for transforms that may call their nested transforms before
 * Reduced-wrapping the result (e.g. "take"), to avoid nested Reduced.
 */
function ensureReduced(val) {
    if (isReduced(val)) {
        return val;
    } else {
        return new Reduced(val);
    }
}

/**
 * This is for tranforms that call their nested transforms when
 * performing completion (like "partition"), to avoid signaling
 * termination after already completing.
 */
function ensureUnreduced(v) {
    if (isReduced(v)) {
        return deref(v);
    } else {
        return v;
    }
}

transducers.range = function range(n) {
    var arr = new Array(n);
    var i;

    for (i = 0; i < arr.length; i++) {
        arr[i] = i;
    }
    return arr;
};

transducers.compose = function compose() {
    var funcs = Array.prototype.slice.call(arguments);

    return function(r) {
        var value = r;
        var i;

        for (i = funcs.length - 1; i >= 0; i--) {
            value = funcs[i](value);
        }
        return value;
    };
};

transducers.take = function take(n) {
    return function(reduce) {
        return function(result, input) {
            // console.log('taking: ' + input);
            if (n > 0) {
                result = reduce(result, input);
                if (n - 1 === 0) {
                    // console.log('DONE')
                    result = ensureReduced(result);
                }
            }
            n--;
            return result;
        };
    };
};

transducers.map = function mapping(f) {
    return function(reduce) {
        return function(result, input) {
            // console.log('map');
            return reduce(result, f(input));
        };
    };
};

transducers.filter = function filtering(f) {
    return function(reduce) {
        return function(result, input) {
            // console.log('filtering ' + f(input))
            return (f(input) ? reduce(result, input) : result);
        };
    };
};

function append(result, x) {
    return result.concat(x);
}

transducers.seq = function seq(xf, coll) {
    return transducers.transduce(xf, append, [], coll);
};

transducers.reduce = function reduce(xf, init, coll) {
    var acc = init;
    for (var i = 0; i < coll.length; i++) {
        // console.log('Reducing :', i + 1);
        acc = xf(acc, coll[i]);
        if (isReduced(acc)) {
            acc = deref(acc);
            break;
        }
    }
    return acc;
};

transducers.transduce = function transduce(xf, f, init, coll) {
    return transducers.reduce(xf(f), init, coll);
};

module.exports = transducers;
require('console2')();


function inc(x) {
    return x + 1;
}

function square(x) {
    return x * x;
}

var t = transducers;
var comp = t.compose(
    t.filter(function(x) {
        return x % 2 === 0
    }),
    t.map(inc),
    t.map(square),
    t.take(4)
);
console.spacer().time('trans');
console.log(t.seq(comp, t.range(10000)));
console.spacer().time('trans');
console.out();
