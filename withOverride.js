'use strict';

var isCallable = require('is-callable');
var isString = require('is-string');
var isSymbol = require('is-symbol');
var inspect = require('object-inspect');
var withOverrides = require('./withOverrides');

module.exports = function withOverride(objectThunk, key, valueThunk) {
	if (!isString(key) && !isSymbol(key)) {
		throw new TypeError('override key must be a string or a Symbol');
	}
	if (!isCallable(valueThunk)) {
		throw new TypeError('a function that returns the value is required');
	}
	var overridesThunk = function () {
		var overrides = {};
		overrides[key] = valueThunk();
		return overrides;
	};
	return this.use(withOverrides, objectThunk, overridesThunk).extend('with override: ' + inspect(key));
};
