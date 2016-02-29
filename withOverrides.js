'use strict';

var entries = require('object.entries');
var has = require('has');
var forEach = require('for-each');
var supportsDescriptors = require('define-properties').supportsDescriptors;

module.exports = function withOverrides(object, overrides) {
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
