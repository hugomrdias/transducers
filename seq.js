'use strict';

var sequence = {};

// List Processor
sequence.map = function(f, seq) {
    return function(step) {
        seq(function(x) {
            return step(f(x));
        });
    };
};

sequence.filter = function(p, seq) {
    return function(step) {
        seq(function(x) {
            if (p(x)) {
                return step(x);
            }
        });
    };
};

sequence.ofList = function(list) {
    return function(step) {
        for (var i = 0; i < list.length; i++) {
            if (step(list[i])) {
                // console.log("consumer is done, closing...");
                break;
            }
        }
        // console.log("producer is empty, closing...");
    };
};

sequence.take = function(n, seq) {
    var count = 0;

    return function(step) {
        seq(function(x) {
            if (count === n) {
                return true;
            }
            count++;
            return step(x);
        });
    };
};

// Consumers
sequence.reduce = function(f, init, seq) {
    var r = init;

    seq(function(x) {
        r = f(r, x);
    });
    return r;
};

sequence.toList = function(seq) {
    return sequence.reduce(function(list, x) {
        list.push(x);
        return list;
    }, [], seq);
};
module.exports = sequence;


function addTen(x) {
    return x + 10;
}

function double(x) {
    return x * 2;
}

// var seq1 = sequence.ofList([1, 2, 3, 4, 5, 6, 7]);
// console.log(sequence.toList(sequence.map(addTen, sequence.map(double, seq1))));
