'use strict';
var Benchmark = require('benchmark');
var t = require('../');
var _ = require('lodash');
var t2 = require('transducers.js');
var t3 = require('transducers-js');
var seq = require('../seq');
var suite = Benchmark.Suite('transducers');

function addTen(x) {
    return x + 10;
}

function double(x) {
    return x * 2;
}

function even(x) {
    return x % 2 === 0;
}

function multipleOfFive(x) {
    return x % 5 === 0;
}

function baseline(arr) {
    var result = [];
    var length = arr.length;
    var entry;

    for (var i = 0; i < length; i++) {
        entry = double(addTen(arr[i]));
        if (multipleOfFive(entry) && even(entry)) {
            result.push(entry);
        }
    }

    return result;
}

function benchArray(n) {
    var arr = _.range(n);

    suite
    // .add(' native (' + n + ')', function() {
    //     arr.map(addTen)
    //         .map(double)
    //         .filter(multipleOfFive)
    //         .filter(even);
    // })
    // .add(' baseline (' + n + ')', function() {
    //     baseline(arr);
    // })
        .add('_.map/filter            (' + n + ')', function() {
            // not even going to use chaining, it's slower
            // _.take(_.filter(_.filter(_.map(_.map(arr, addTen), double), multipleOfFive), even), 100);
            _.filter(_.filter(_.map(_.map(arr, addTen), double), multipleOfFive), even);
        })
        .add('_.map/filter, lazy      (' + n + ')', function() {
            _.chain(arr)
                .map(addTen)
                .map(double)
                .filter(multipleOfFive)
                .filter(even)
                .take(100)
                .value();
        })
        .add('_.map/filter, lazy      (' + n + ')', function() {
            _(arr)
                .map(addTen)
                .map(double)
                .filter(multipleOfFive)
                .filter(even)
                .take(100)
                .value();
        });
        // .add('t.map/filter+transduce  (' + n + ')', function() {
        //     t.seq(
        //         t.compose(
        //             t.map(addTen),
        //             t.map(double),
        //             t.filter(multipleOfFive),
        //             t.filter(even)
        //         ),
        //         arr);
        // })
        // .add('t2.map/filter+transduce (' + n + ')', function() {
        //     t2.into([],
        //         t2.compose(
        //             t2.map(addTen),
        //             t2.map(double),
        //             t2.filter(multipleOfFive),
        //             t2.filter(even)
        //         ),
        //         arr);
        // })
        // .add('t3.map/filter+transduce (' + n + ')', function() {
        //     t3.into([],
        //         t3.comp(
        //             t3.map(addTen),
        //             t3.map(double),
        //             t2.filter(multipleOfFive),
        //             t2.filter(even)
        //         ),
        //         arr);
        // });
    // .add('sequences               (' + n + ')', function() {
    //     var seq1 = seq.ofList(arr);

    //     seq.toList(
    //         seq.map(addTen, seq.map(double, seq1))
    //     );
    // });
}

// for (var i = 500; i <= 530000; i += 20000) {
//     benchArray(i);
// }
//
benchArray(1000);

suite.on('cycle', function(event) {
    console.log(String(event.target));
});

suite.on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
});

suite.run();
