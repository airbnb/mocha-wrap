'use strict';

var bind = require('function-bind');
var isString = require('is-string');

var withRegex = /^with[^\s\n]+$/;
var validWithName = bind.call(withRegex.test, withRegex);

module.exports = function checkWithName(name) {
	if (!isString(name) || name.length === 0) {
		throw new TypeError('withName must be a non-empty string');
	}
	if (!validWithName(name)) {
		throw new TypeError('withName must start with "with" and contain no whitespace');
	}
};
