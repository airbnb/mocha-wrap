'use strict';

var assert = require('assert');
var wrap = require('../../');

describe('core MochaWrapper semantics', function () {
	it('throws when there are no transformations', function () {
		assert['throws'](function () { wrap().describe('foo', function () {}); }, RangeError);
		assert['throws'](function () { wrap().context('foo', function () {}); }, RangeError);
		assert['throws'](function () { wrap().it('foo', function () {}); }, RangeError);
	});

	describe('#use()', function () {
		var flag = false;
		var withDescriptor = function withDescriptor() {
			return {
				description: 'i am a descriptor',
				beforeEach: function () { flag = true; },
				afterEach: function () { flag = false; }
			};
		};
		var withNothing = function withNothing() {
			return { description: 'i am pointless' };
		};

		wrap().use(withDescriptor).context('with a plugin that returns a descriptor', function () {
			it('works', function () {
				assert.equal(flag, true);
			});
		});

		wrap().use(withNothing).it('works with a plugin that returns a descriptor with only a description', function () {
			assert.equal(true, true); // oh yeah, TESTING
		});
	});
});
