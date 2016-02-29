'use strict';

var assert = require('assert');
var has = require('has');
var wrap = require('../..');

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

	wrap().withOverrides(obj, { foo: 'after foo' })
		.it('foo is "after foo"', function () {
			assert.deepEqual(obj, { foo: 'after foo', bar: 'before bar', baz: -1, quux: 'quux' });
		});

	wrap().withOverrides(obj, { foo: 'after foo' })
		.withOverrides(obj, { bar: 'after bar', baz: 'after baz' })
		.describe('foo + (bar, baz)', function () {
			it('is overridden as expected', function () {
				assert.deepEqual(obj, { foo: 'after foo', bar: 'after bar', baz: 'after baz', quux: 'quux' });
			});
		});

	it('still has properties set to initial values', function () {
		assert.deepEqual(obj, { foo: 'before foo', bar: 'before bar', baz: -1, quux: 'quux' });
	});

	it('lacks the key "absent"', function () {
		assert.equal(has(obj, 'absent'), false);
	});

	wrap().withOverrides(obj, { absent: 'yay' })
		.it('absent property is added', function () {
			assert.equal(has(obj, 'absent'), true);
		});

	it('still lacks the key "absent"', function () {
		assert.equal(has(obj, 'absent'), false);
	});

});
