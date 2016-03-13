'use strict';

var assert = require('assert');
var wrap = require('../..');
var thunk = function (v) { return function () { return v; }; };

describe('withGlobal plugin', function () {
	before(function () {
		global.foo = 42;
		global.bar = 100;
		global.baz = -1;
	});

	after(function () {
		delete global.foo;
		delete global.bar;
		delete global.baz;
	});

	it('has globals set to initial values', function () {
		assert.equal(global.foo, 42);
		assert.equal(global.bar, 100);
		assert.equal(global.baz, -1);
	});

	wrap().withGlobal('foo', thunk(123)).it('foo is 123', function () {
		assert.equal(global.foo, 123);
		assert.equal(global.bar, 100);
		assert.equal(global.baz, -1);
	});

	wrap().withGlobal('foo', thunk(123)).withGlobal('bar', thunk(456)).describe('foo and bar', function () {
		it('has the right foo', function () {
			assert.equal(global.foo, 123);
		});

		it('has the right bar', function () {
			assert.equal(global.bar, 456);
		});

		it('has the right baz', function () {
			assert.equal(global.baz, -1);
		});
	});

	it('still has globals set to initial values', function () {
		assert.equal(global.foo, 42);
		assert.equal(global.bar, 100);
		assert.equal(global.baz, -1);
	});
});
