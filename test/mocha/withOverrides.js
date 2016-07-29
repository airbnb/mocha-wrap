'use strict';

var assert = require('assert');
var has = require('has');
var wrap = require('../..');
var thunk = function (v) { return function () { return v; }; };
var supportsDescriptors = require('define-properties').supportsDescriptors;

describe('withOverrides plugin', function () {
	var obj = {};
	before(function () {
		obj.foo = 'before foo';
		obj.bar = 'before bar';
		obj.baz = -1;
		obj.quux = 'quux';
	});

	it('has properties set to initial values', function () {
		assert.deepEqual(obj, { foo: 'before foo', bar: 'before bar', baz: -1, quux: 'quux' });
	});

	wrap().withOverrides(thunk(obj), thunk({ foo: 'after foo' }))
	.it('foo is "after foo"', function () {
		assert.deepEqual(obj, { foo: 'after foo', bar: 'before bar', baz: -1, quux: 'quux' });
	});

	wrap().withOverrides(thunk(obj), thunk({ foo: 'after foo' }))
	.withOverrides(thunk(obj), thunk({ bar: 'after bar', baz: 'after baz' }))
	.describe('foo + (bar, baz)', function () {
		it('is overridden as expected', function () {
			assert.deepEqual(obj, { foo: 'after foo', bar: 'after bar', baz: 'after baz', quux: 'quux' });
		});
	});

	var holder = {};
	wrap()
	.withOverrides(thunk(holder), function () { return { toMutate: {} }; })
	.describe('mutations across multiple tests', function () {
		it('can be mutated in one test', function () {
			holder.toMutate.before = 'hi!';
			assert.deepEqual(holder, { toMutate: { before: 'hi!' } });
		});

		it('is reset in another test', function () {
			assert.deepEqual(holder, { toMutate: {} });
		});

		it('is mutated afterwards, so test order doesn’t matter', function () {
			holder.toMutate.after = 'hi!';
			assert.deepEqual(holder, { toMutate: { after: 'hi!' } });
		});
	});

	it('still has properties set to initial values', function () {
		assert.deepEqual(obj, { foo: 'before foo', bar: 'before bar', baz: -1, quux: 'quux' });
	});

	it('lacks the key "absent"', function () {
		assert.equal(has(obj, 'absent'), false);
	});

	wrap().withOverrides(thunk(obj), thunk({ absent: 'yay' }))
	.it('absent property is added', function () {
		assert.equal(has(obj, 'absent'), true);
	});

	it('still lacks the key "absent"', function () {
		assert.equal(has(obj, 'absent'), false);
	});

	var describeIfDescriptors = supportsDescriptors ? describe : describe.skip;
	describeIfDescriptors('when something is a getter', function () {
		var getter = Object.defineProperty({}, 'foo', {
			configurable: true,
			get: function () { return 42; },
			enumerable: true
		});

		wrap()
		.withOverrides(thunk(getter), thunk({ foo: 'bar' }))
		.it('overrides a getter', function () {
			assert.deepEqual(getter, { foo: 'bar' });
		});
	});
});
