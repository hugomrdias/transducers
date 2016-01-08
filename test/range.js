'use strict';
var test = require('tape');
var t = require('../');

function inc(x) {
    return x + 1;
}

function hundred(x) {
    return x * 100;
}

test('test seq', function(test) {
    var comp;

    test.plan(1);

    comp = t.compose(
        t.map(hundred),
        t.map(inc)
    );
    test.same(t.seq(comp, [0, 0]), [1, 1]);
});

test('test range', function(test) {
    test.plan(1);

    test.same(t.range(2), [0, 1]);
});

test('test compose', function(test) {
    var comp;

    test.plan(2);

    function sum(list) {
        return list.map(function(i) {
            return i + 1;
        });
    }

    function isEven(list) {
        return list.filter(function(i) {
            return i % 2 === 0;
        });
    }

    comp = t.compose(
        sum,
        isEven
    );

    test.equal(typeof comp, 'function');
    test.same(comp([0, 1, 2]), [1, 3]);
});
