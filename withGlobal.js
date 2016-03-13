'use strict';

var isString = require('is-string');
var isSymbol = require('is-symbol');
var inspect = require('object-inspect');
var withOverride = require('./withOverride');

var getGlobal = function () { return global; };

module.exports = function withGlobal(globalName, valueThunk) {
	var isNonEmptyString = isString(globalName) && globalName.length > 0;
	if (!isNonEmptyString && !isSymbol(globalName)) {
		throw new TypeError('global name must be a non-empty string or a Symbol');
	}

	return this.use(withOverride, getGlobal, globalName, valueThunk).extend('with global: ' + inspect(globalName));
};
