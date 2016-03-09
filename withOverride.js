'use strict';

var isString = require('is-string');
var isSymbol = require('is-symbol');
var inspect = require('object-inspect');
var withOverrides = require('./withOverrides');

module.exports = function withOverride(object, key, value) {
	if (!isString(key) && !isSymbol(key)) {
		throw new TypeError('override key must be a string or a Symbol');
	}
	var overrides = {};
	overrides[key] = value;
	return this.use(withOverrides, object, overrides).extend('with override: ' + inspect(key));
};
