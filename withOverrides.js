'use strict';

var entries = require('object.entries');
var has = require('has');
var isCallable = require('is-callable');
var isPrimitive = require('is-primitive');
var forEach = require('for-each');
var supportsDescriptors = require('define-properties').supportsDescriptors;

module.exports = function withOverrides(objectThunk, overridesThunk) {
	if (!isCallable(objectThunk)) {
		throw new TypeError('a function that returns the object to override is required');
	}
	if (!isCallable(overridesThunk)) {
		throw new TypeError('a function that returns the object from which to get overrides is required');
	}
	var overridesData = [];
	return this.extend('with overrides', {
		beforeEach: function beforeEachWithOverrides() {
			var object = objectThunk();
			if (isPrimitive(object)) {
				throw new TypeError('can not override on a non-object');
			}
			var overrides = overridesThunk();
			if (isPrimitive(overrides)) {
				throw new TypeError('can not override without an object from which to get overrides');
			}
			var overridePairs = entries(overrides);
			var objectHadOwn = {};
			var overridden = {};
			forEach(overridePairs, function (entry) {
				var key = entry[0];
				var value = entry[1];
				if (has(object, key)) {
					objectHadOwn[key] = true;
					/* istanbul ignore else */
					if (supportsDescriptors) {
						overridden[key] = Object.getOwnPropertyDescriptor(object, key);
					} else {
						overridden[key] = object[key];
					}
				}
				/* istanbul ignore else */
				if (supportsDescriptors) {
					Object.defineProperty(object, key, {
						configurable: true,
						enumerable: objectHadOwn[key] ? overridden[key].enumerable : true,
						value: value,
						writable: objectHadOwn[key] ? overridden[key].writable : true
					});
				} else {
					object[key] = value;
				}
			});
			overridesData.push({
				objectHadOwn: objectHadOwn,
				overridden: overridden,
				object: object,
				overridePairs: overridePairs
			});
		},
		afterEach: function afterEachWithOverrides() {
			var data = overridesData.pop();
			forEach(data.overridePairs, function (entry) {
				var key = entry[0];
				if (data.objectHadOwn[key]) {
					/* istanbul ignore else */
					if (supportsDescriptors) {
						Object.defineProperty(data.object, key, data.overridden[key]);
					} else {
						data.object[key] = data.overridden[key];
					}
				} else {
					delete data.object[key];
				}
			});
		}
	});
};
