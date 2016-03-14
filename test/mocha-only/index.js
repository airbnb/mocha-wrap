'use strict';

var assert = require('assert');
var wrap = require('../../');

var withNothing = function withNothing() {
	return this.extend('with nothing', { before: function () {} });
};

describe('#only()', function () {
	it('fails', function () {
		assert.equal(true, false, 'explode!');
	});

	wrap().use(withNothing).only().it('passes', function () {
		assert.equal(true, true, 'testing is fun');
	});
});
