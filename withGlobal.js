'use strict';

var isString = require('is-string');
var isSymbol = require('is-symbol');
var inspect = require('object-inspect');
var withOverrides = require('./withOverrides');

module.exports = function withGlobal(globalName, value) {
	var isNonEmptyString = isString(globalName) && globalName.length > 0;
	if (!isNonEmptyString && !isSymbol(globalName)) {
		throw new TypeError('global name must be a non-empty string or a Symbol');
	}

	var overrides = {};
	overrides[globalName] = value;
	return this.use(withOverrides, global, overrides).extend('with global: ' + inspect(globalName));
};
