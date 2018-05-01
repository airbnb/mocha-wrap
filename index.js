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
var modeMap = hasPrivacy ? new WeakMap() : /* istanbul ignore next */ null;

var MODE_ALL = 'all';
var MODE_SKIP = 'skip';
var MODE_ONLY = 'only';

var beforeMethods = ['before', 'beforeEach'];
var afterMethods = ['after', 'afterEach'];
var supportedMethods = [].concat(beforeMethods, afterMethods);

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

var setThisMode = function (instance, mode) {
	checkThis(instance);
	/* istanbul ignore else */
	if (hasPrivacy) {
		modeMap.set(instance, mode);
	} else {
		instance.mode = mode;
	}
	return instance;
};

var getThisMode = function (instance) {
	checkThis(instance);
	return hasPrivacy ? modeMap.get(instance) : /* istanbul ignore next */ instance.mode;
};

MochaWrapper = function MochaWrapper() {
	setThisWrappers(this, []);
	setThisMode(this, MODE_ALL);
};

var createWithWrappers = function (wrappers, description) {
	return setThisDescription(setThisWrappers(new MochaWrapper(), wrappers), description);
};

var concatThis = function (instance, toConcat) {
	var thisWrappers = getThisWrappers(instance);
	var thisMode = getThisMode(instance);
	return setThisMode(createWithWrappers(thisWrappers.concat(toConcat || [])), thisMode);
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

var applyMethods = function applyMethods(methodsToApply, descriptors) {
	forEach(descriptors, function (methods) {
		forEach(methodsToApply, function (method) {
			var functions = methods[method];
			if (functions) {
				forEach(functions, function (func) {
					global[method](func);
				});
			}
		});
	});
};

var createAssertion = function createAssertion(type, message, wrappers, block, mode) {
	var descriptors = flattenToDescriptors(wrappers);
	if (descriptors.length === 0 && mode === MODE_ALL) {
		throw new RangeError(inspect(type) + ' called with no wrappers defined');
	}
	var describeMsgs = [];
	forEach(wrappers, function (wrapper) {
		checkThis(wrapper);
		describeMsgs.push(getThisDescription(wrapper));
	});
	var describeMsg = 'wrapped: ' + describeMsgs.join('; ') + ':';
	var describeMethod = global.describe;
	if (mode === MODE_SKIP) {
		describeMethod = global.describe.skip;
	} else if (mode === MODE_ONLY) {
		describeMethod = global.describe.only;
	}

	describeMethod(describeMsg, function () {
		applyMethods(beforeMethods, descriptors);
		global[type](message, block);
		applyMethods(afterMethods, descriptors.reverse());
	});
};

MochaWrapper.prototype.skip = function skip() {
	return setThisMode(concatThis(this), MODE_SKIP);
};

MochaWrapper.prototype.only = function only() {
	return setThisMode(concatThis(this), MODE_ONLY);
};

MochaWrapper.prototype.it = function it(msg, fn) {
	var wrappers = getThisWrappers(checkThis(this));
	var mode = getThisMode(this);
	createAssertion('it', msg, wrappers, fn, mode);
};
MochaWrapper.prototype.it.skip = function skip() {
	throw new SyntaxError('mocha-wrap requires `.skip().it` rather than `it.skip`');
};
MochaWrapper.prototype.it.only = function only() {
	throw new SyntaxError('mocha-wrap requires `.only().it` rather than `it.only`');
};

MochaWrapper.prototype.specify = function specify(msg, fn) {
	var wrappers = getThisWrappers(checkThis(this));
	var mode = getThisMode(this);
	createAssertion('specify', msg, wrappers, fn, mode);
};
MochaWrapper.prototype.specify.skip = function skip() {
	throw new SyntaxError('mocha-wrap requires `.skip().specify` rather than `specify.skip`');
};
MochaWrapper.prototype.specify.only = function only() {
	throw new SyntaxError('mocha-wrap requires `.only().specify` rather than `specify.only`');
};

MochaWrapper.prototype.describe = function describe(msg, fn) {
	var wrappers = getThisWrappers(checkThis(this));
	var mode = getThisMode(this);
	createAssertion('describe', msg, wrappers, fn, mode);
};
MochaWrapper.prototype.describe.skip = function skip() {
	throw new SyntaxError('mocha-wrap requires `.skip().describe` rather than `describe.skip`');
};
MochaWrapper.prototype.describe.only = function only() {
	throw new SyntaxError('mocha-wrap requires `.only().describe` rather than `describe.only`');
};

MochaWrapper.prototype.context = function context(msg, fn) {
	var wrappers = getThisWrappers(checkThis(this));
	var mode = getThisMode(this);
	createAssertion('context', msg, wrappers, fn, mode);
};
MochaWrapper.prototype.context.skip = function skip() {
	throw new SyntaxError('mocha-wrap requires `.skip().context` rather than `context.skip`');
};
MochaWrapper.prototype.context.only = function only() {
	throw new SyntaxError('mocha-wrap requires `.only().context` rather than `context.only`');
};

var wrap = function wrap() { return new MochaWrapper(); };

var isWithNameAvailable = function (name) {
	checkWithName(name);
	return !has(MochaWrapper.prototype, name) || !isCallable(MochaWrapper.prototype[name]);
};

wrap.supportedMethods = isCallable(Object.freeze)
	? Object.freeze(supportedMethods)
	: /* istanbul ignore next */ supportedMethods.slice();

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
		newWrappers = [createWithWrappers([descriptor])];
	}
	return setThisDescription(concatThis(this, newWrappers), description);
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

	var instance = descriptorOrInstance;
	if (!(descriptorOrInstance instanceof MochaWrapper)) {
		instance = wrap().extend(descriptorOrInstance.description, descriptorOrInstance);
	}

	var thisMode = getThisMode(instance);
	return setThisMode(setThisWrappers(new MochaWrapper(), [instance]), thisMode);
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
