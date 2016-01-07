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

function take(n) {
    return function(reduce) {
        return function(result, input) {
            return (result.length >= n ? result : reduce(result, input));
        };
    };
}

function mapping(transform) {
    return function(reduce) {
        return function(result, input) {
            return reduce(result, transform(input));
        };
    };
}

function filtering(predicate) {
    return function(reduce) {
        return function(result, input) {
            return (predicate(input) ? reduce(result, input) : result);
        };
    };
}

var filterLessThanThreeAndIncrement = _.flowRight(
    take(1),
    mapping(inc),
    filtering(lessThanThree)
);

/* var result = [1,2,3,4].reduce(
  filterLessThanThreeAndIncrement(function (result, input) {
    result[input] = true;
    log(result);
    return result;
  }), {});*/

// var result = [1, 2, 3, 4, 5, 6].reduce(
//     filterLessThanThreeAndIncrement(concat), []);

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

module.exports = transducers;
