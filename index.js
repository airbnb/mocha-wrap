'use strict';

/* globals WeakMap */

var isCallable = require('is-callable');
var isString = require('is-string');
var has = require('has');
var forEach = require('for-each');
var isArray = require('isarray');
var functionName = require('function.prototype.name');
var inspect = require('object-inspect');

var checkWithName = require('./helpers/checkWithName');

var withOverrides = require('./withOverrides');
var withOverride = require('./withOverride');
var withGlobal = require('./withGlobal');

var hasPrivacy = typeof WeakMap === 'function';
var wrapperMap = hasPrivacy ? new WeakMap() : /* istanbul ignore next */ null;
var descriptionMap = hasPrivacy ? new WeakMap() : /* istanbul ignore next */ null;

var supportedMethods = ['before', 'beforeEach', 'after', 'afterEach'];

var MochaWrapper;

var checkThis = function requireMochaWrapper(instance) {
	if (!instance || typeof instance !== 'object' || !(instance instanceof MochaWrapper)) {
		throw new TypeError(inspect(instance) + ' must be a MochaWrapper');
	}
	return instance;
};

var setThisWrappers = function (instance, value) {
	checkThis(instance);
	/* istanbul ignore else */
	if (hasPrivacy) {
		wrapperMap.set(instance, value);
	} else {
		instance.wrappers = value;
	}
	return instance;
};

var getThisWrappers = function (instance) {
	checkThis(instance);
	return hasPrivacy ? wrapperMap.get(instance) : /* istanbul ignore next */ instance.wrappers;
};

var setThisDescription = function (instance, value) {
	checkThis(instance);
	/* istanbul ignore else */
	if (hasPrivacy) {
		descriptionMap.set(instance, value);
	} else {
		instance.description = value;
	}
	return instance;
};
var getThisDescription = function (instance) {
	checkThis(instance);
	return hasPrivacy ? descriptionMap.get(instance) : /* istanbul ignore next */ instance.description;
};

MochaWrapper = function MochaWrapper() {
	setThisWrappers(this, []);
};

var createWithWrappers = function (wrappers, description) {
	return setThisDescription(setThisWrappers(new MochaWrapper(), wrappers), description);
};

var concatThisWrappers = function (instance, toConcat) {
	var thisWrappers = getThisWrappers(instance);
	return createWithWrappers(thisWrappers.concat(toConcat));
};

var flattenToDescriptors = function flattenToDescriptors(wrappers) {
	if (wrappers.length === 0) { return []; }

	var descriptors = [];
	forEach(wrappers, function (wrapper) {
		var subWrappers = wrapper instanceof MochaWrapper ? getThisWrappers(wrapper) : wrapper;
		if (Array.isArray(subWrappers)) {
			descriptors.push.apply(descriptors, flattenToDescriptors(subWrappers));
		} else {
			descriptors.push(subWrappers);
		}
	});
	return descriptors;
};

var createAssertion = function createAssertion(type, message, wrappers, block) {
	var descriptors = flattenToDescriptors(wrappers);
	if (descriptors.length === 0) {
		throw new RangeError(inspect(type) + ' called with no wrappers defined');
	}
	var describeMsgs = [];
	forEach(wrappers, function (wrapper) {
		checkThis(wrapper);
		describeMsgs.push(getThisDescription(wrapper));
	});
	var describeMsg = 'wrapped: ' + describeMsgs.join('; ') + ':';
	var describeMethod = global.describe;
	describeMethod(describeMsg, function () {
		forEach(descriptors, function (methods) {
			forEach(supportedMethods, function (method) {
				var functions = methods[method];
				if (functions) {
					forEach(functions, function (func) {
						global[method](func);
					});
				}
			});
		});

		global[type](message, block);
	});
};

MochaWrapper.prototype.it = function it(msg, fn) {
	var wrappers = getThisWrappers(checkThis(this));
	createAssertion('it', msg, wrappers, fn);
};

MochaWrapper.prototype.describe = function describe(msg, fn) {
	var wrappers = getThisWrappers(checkThis(this));
	createAssertion('describe', msg, wrappers, fn);
};

MochaWrapper.prototype.context = function context(msg, fn) {
	var wrappers = getThisWrappers(checkThis(this));
	createAssertion('context', msg, wrappers, fn);
};

var wrap = function wrap() { return new MochaWrapper(); };

var isWithNameAvailable = function (name) {
	checkWithName(name);
	return !has(MochaWrapper.prototype, name) || !isCallable(MochaWrapper.prototype[name]);
};

wrap.supportedMethods = isCallable(Object.freeze) ? Object.freeze(supportedMethods) : /* istanbul ignore next */ supportedMethods.slice();

MochaWrapper.prototype.extend = function extend(description, descriptor) {
	checkThis(this);
	if (!isString(description) || description.length === 0) {
		throw new TypeError('a non-empty description string is required');
	}
	var newWrappers = [];
	if (descriptor) {
		forEach(supportedMethods, function (methodName) {
			if (methodName in descriptor) {
				if (!isArray(descriptor[methodName])) {
					descriptor[methodName] = [descriptor[methodName]];
				}
				forEach(descriptor[methodName], function (method) {
					if (!isCallable(method)) {
						throw new TypeError('wrapper method "' + method + '" must be a function, or array of functions, if present');
					}
				});
			}
		});
		newWrappers = [descriptor];
	}
	return setThisDescription(concatThisWrappers(this, newWrappers), description);
};

MochaWrapper.prototype.use = function use(plugin) {
	checkThis(this);
	if (!isCallable(plugin)) {
		throw new TypeError('plugin must be a function');
	}
	var withName = functionName(plugin);
	checkWithName(withName);

	var extraArguments = Array.prototype.slice.call(arguments, 1);
	var descriptorOrInstance = plugin.apply(this, extraArguments) || {};

	if (!(descriptorOrInstance instanceof MochaWrapper)) {
		descriptorOrInstance = wrap().extend(descriptorOrInstance.description, descriptorOrInstance);
	}

	return concatThisWrappers(this, [descriptorOrInstance]);
};

wrap.register = function register(plugin) {
	var withName = functionName(plugin);
	checkWithName(withName);
	if (!isWithNameAvailable(withName)) {
		// already registered
		return;
	}
	MochaWrapper.prototype[withName] = function wrapper() {
		return this.use.apply(this, [plugin].concat(Array.prototype.slice.call(arguments)));
	};
};

wrap.unregister = function unregister(pluginOrWithName) {
	var withName = isCallable(pluginOrWithName) ? functionName(pluginOrWithName) : pluginOrWithName;
	checkWithName(withName);
	if (isWithNameAvailable(withName)) {
		throw new RangeError('error: plugin "' + withName + '" is not registered.');
	}
	delete MochaWrapper.prototype[withName];
};

wrap.register(withOverrides);
wrap.register(withOverride);
wrap.register(withGlobal);

module.exports = wrap;
