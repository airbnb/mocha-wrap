'use strict';

var entries = require('object.entries');
var has = require('has');
var isCallable = require('is-callable');
var isObject = require('is-object');
var forEach = require('for-each');
var supportsDescriptors = require('define-properties').supportsDescriptors;

module.exports = function withOverrides(objectThunk, overridesThunk) {
	if (!isCallable(objectThunk)) {
		throw new TypeError('a function that returns the object to override is required');
	}
	if (!isCallable(overridesThunk)) {
		throw new TypeError('a function that returns the object from which to get overrides is required');
	}
	var objectHadOwn = {};
	var overriddenDescriptor = {};
	var overriddenValue = {};
	var overridePairs, object, overrides;
	return this.extend('with overrides', {
		beforeEach: function beforeEachWithOverrides() {
			if (!object) {
				object = objectThunk();
				if (!isObject(object)) {
					throw new TypeError('can not override on a non-object');
				}
			}
			if (!overrides) {
				overrides = overridesThunk();
				if (!isObject(overrides)) {
					throw new TypeError('can not override without an object from which to get overrides');
				}
				overridePairs = entries(overrides);
			}
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
