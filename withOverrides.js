'use strict';

var entries = require('object.entries');
var has = require('has');
var isObject = require('is-object');
var forEach = require('for-each');
var supportsDescriptors = require('define-properties').supportsDescriptors;

module.exports = function withOverrides(object, overrides) {
	if (!isObject(object)) {
		throw new TypeError('can not override on a non-object');
	}
	if (!isObject(overrides)) {
		throw new TypeError('can not override without an object from which to get overrides');
	}
	var objectHadOwn = {};
	var overriddenDescriptor = {};
	var overriddenValue = {};
	var overridePairs = entries(overrides);
	return this.extend('with overrides', {
		beforeEach: function beforeEachWithOverrides() {
			forEach(overridePairs, function (entry) {
				var key = entry[0];
				var value = entry[1];
				if (has(object, key)) {
					objectHadOwn[key] = true;
					/* istanbul ignore else */
					if (supportsDescriptors) {
						overriddenDescriptor[key] = Object.getOwnPropertyDescriptor(object, key);
					} else {
						overriddenValue[key] = object[key];
					}
				}
				object[key] = value;
			});
		},
		afterEach: function afterEachWithOverrides() {
			forEach(overridePairs, function (entry) {
				var key = entry[0];
				if (objectHadOwn[key]) {
					/* istanbul ignore else */
					if (overriddenDescriptor[key]) {
						Object.defineProperty(object, key, overriddenDescriptor[key]);
					} else {
						object[key] = overriddenValue[key];
					}
				} else {
					delete object[key];
				}
			});
		}
	});
};
