'use strict';

var Benchmark = require('benchmark');
var t = require('../');
var _ = require('lodash');
// var u = require('underscore');
var suite = Benchmark.Suite('transducers');

function double(x) {
    return x * 2;
}

function inc(x) {
    return x + 1;
}

function multipleOfFive(x) {
    return x % 5 === 0;
}

function even(x) {
    return x % 2 === 0;
}

function baseline(arr, limit) {
    var result = new Array(limit);
    var entry;
    var count = 0;
    var index = 0;
    var length = arr.length;

    while (count < limit && index < length) {
        var entry = double(arr[index]);

        if (multipleOfFive(entry)) {
            result[count] = entry;
            count++;
        }

        index++;
    }

    if (limit !== count) {
        result.length = count;
    }

    return result;
}

function benchArray(n) {
    var arr = _.range(n);

    suite
    // .add(' (n=' + n + ') hand-rolled baseline', function() {
    //     baseline(arr, 20);
    // })
        .add(' (n=' + n + ') native', function() {
            arr
                .map(inc)
                .map(double)
                .filter(multipleOfFive)
                .filter(even)
                .slice(0, 100);
        })
        .add(' (n=' + n + ') _.map/filter', function() {
            _(arr)
                .map(inc)
                .map(double)
                .filter(multipleOfFive)
                .filter(even)
                .take(100)
                .value();
        })
        .add(' (n=' + n + ') t.map/filter+transduce', function() {
            t.seq(
                t.compose(
                    t.map(inc),
                    t.map(double),
                    t.filter(multipleOfFive),
                    t.filter(even),
                    t.take(100)
                ),
                arr
            );
        });
}

[10000].forEach(function(n) {
    benchArray(n);
});

suite.on('cycle', function(event) {
    console.log(String(event.target));
});

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
});

suite.run();
