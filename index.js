'use strict';
var transducers = {};

function Reduced(value) {
    // console.log('Reduced');
    this.reduced = true;
    this.value = value;
}

function isReduced(x) {
    return (x instanceof Reduced) || (x && x.reduced);
    // return (x && x.reduced);
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
    }
    return new Reduced(val);
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
    var count = 0;

    return function(reduce) {
        return function(result, input) {
            // console.log('taking: ' + input);
            if (count === n) {
                result = ensureReduced(result);
                // if (n - 1 === 0) {
                //     // console.log('DONE')
                //     result = ensureReduced(result);
                // }
            } else {
                result = reduce(result, input);
            }
            count++;
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
            if (f(input)) {
                return reduce(result, input);
            }
            return result;
        };
    };
};

function append(result, x) {
    result.push(x);
    return result;
}

transducers.seq = function seq(xf, coll) {
    return transducers.transduce(xf, append, [], coll);
};

transducers.reduce = function reduce(xf, init, coll) {
    var acc = init;
    var index = -1;
    var len = coll.length;

    while (++index < len) {
        acc = xf(acc, coll[index]);
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

// function inc(x) {
//     return x + 1;
// }

// function square(x) {
//     return x * x;
// }

// var t = transducers;
// var comp = t.compose(
//     t.map(inc),
//     t.map(square),
//     t.filter(function(x) {
//         return x % 2 === 0
//     })
//     // t.take(100)
// );
// require('console2')();
// console.spacer().time('trans');
// t.seq(comp, t.range(100000));
// console.spacer().time('trans');
// console.out();
