'use strict';

/* globals WeakMap */

var test = require('tape');

var wrap = require('../../');
var withGlobal = require('../../withGlobal');
var withOverrides = require('../../withOverrides');
var withOverride = require('../../withOverride');

var hasPrivacy = typeof WeakMap === 'function';

var setup = function setup() {
	var msgFn = function (msg, fn) { fn(); };
	global.describe = msgFn;
	global.context = msgFn;
	global.it = msgFn;
	var runFn = function (fn) { fn(); };
	global.before = runFn;
	global.beforeEach = runFn;
	global.after = runFn;
	global.afterEach = runFn;
};
var teardown = function teardown() {
	delete global.describe;
	delete global.context;
	delete global.it;
	delete global.before;
	delete global.beforeEach;
	delete global.after;
	delete global.afterEach;
};

test('mocha-wrap', function (t) {
	setup();
	t.on('end', teardown);

	t.test('no transformations', function (st) {
		st['throws'](function () { wrap().describe('foo', function () {}); }, RangeError, 'throws when there are no transformations');
		st['throws'](function () { wrap().context('foo', function () {}); }, RangeError, 'throws when there are no transformations');
		st['throws'](function () { wrap().it('foo', function () {}); }, RangeError, 'throws when there are no transformations');
		st.end();
	});

	t.test('{describe,context,it}.{skip,only} throw', function (st) {
		st['throws'](function () { wrap().describe.skip('skip'); }, SyntaxError, 'describe.skip throws');
		st['throws'](function () { wrap().describe.only('only'); }, SyntaxError, 'describe.only throws');
		st['throws'](function () { wrap().context.skip('skip'); }, SyntaxError, 'context.skip throws');
		st['throws'](function () { wrap().context.only('only'); }, SyntaxError, 'context.only throws');
		st['throws'](function () { wrap().it.skip('skip'); }, SyntaxError, 'it.skip throws');
		st['throws'](function () { wrap().it.only('only'); }, SyntaxError, 'it.only throws');
		st['throws'](function () { wrap().specify.skip('skip'); }, SyntaxError, 'specify.skip throws');
		st['throws'](function () { wrap().specify.only('only'); }, SyntaxError, 'specify.only throws');
		st.end();
	});

	t.test('withOverrides deferred exceptions', function (st) {
		st['throws'](function () {
			wrap().withOverrides(function () { return null; }, function () { return {}; }).describe('msg', function () {});
		}, TypeError, 'requires objectThunk to return an object');
		st['throws'](function () {
			wrap().withOverrides(function () { return {}; }, function () { return null; }).describe('msg', function () {});
		}, TypeError, 'requires overridesThunk to return an object');
		st.end();
	});

	t.test('.supportedMethods', function (st) {
		st.equal(Array.isArray(wrap.supportedMethods), true, 'is an array');
		st.deepEqual(wrap.supportedMethods, ['before', 'beforeEach', 'after', 'afterEach'], 'has the expected methods');
		st.end();
	});

	t.test('.register()', function (st) {
		st.equal(typeof wrap.register, 'function', 'is a function');

		st.test('throws on an invalid plugin name', function (st2) {
			st2['throws'](function () { wrap.register(); }, TypeError, 'throws on a non-string plugin name');
			st2['throws'](function () { wrap.register(''); }, TypeError, 'throws on an empty string plugin name');
			st2['throws'](function () { wrap.register('foo'); }, TypeError, 'throws on a non-prefixed plugin name');
			st2.end();
		});

		st.end();
	});

	t.test('.unregister()', function (st) {
		st.equal(typeof wrap.unregister, 'function', 'is a function');

		st.test('throws on an invalid plugin name', function (st2) {
			st2['throws'](function () { wrap.unregister(); }, TypeError, 'throws on a non-string plugin name');
			st2['throws'](function () { wrap.unregister(''); }, TypeError, 'throws on an empty string plugin name');
			st2['throws'](function () { wrap.unregister('foo'); }, TypeError, 'throws on a non-prefixed plugin name');
			st2.end();
		});

		st['throws'](function () { wrap.unregister('withNope'); }, RangeError, 'throws on an unregistered plugin');

		st.end();
	});

	var plugin = function withFoo() { return this.extend('…'); };
	t.test('registration/unregistration', function (st) {
		var instance = wrap();
		st.equal(typeof instance.withFoo, 'undefined', 'withFoo is not registered');
		wrap.register(plugin);
		st.equal(typeof instance.withFoo, 'function', 'withFoo is registered');
		wrap.unregister('withFoo');
		st.equal(typeof instance.withFoo, 'undefined', 'withFoo is unregistered by name');
		wrap.register(plugin);
		st.equal(typeof instance.withFoo, 'function', 'withFoo is again registered');
		wrap.unregister(plugin);
		st.equal(typeof instance.withFoo, 'undefined', 'withFoo is unregistered by function');
		st.end();
	});

	t.test('duplicate registration', function (st) {
		var instance = wrap();
		wrap.register(plugin);
		var original = instance.withFoo;
		wrap.register(plugin);
		st.equal(original, instance.withFoo, 'duplicate "register" is a noop');
		st.end();
	});

	t.end();
});

test('MochaWrapper', function (t) {
	t.notEqual(wrap(), wrap(), 'wrap() returns different instances');

	var instance = wrap();
	var described = instance.extend('described!');
	t.notEqual(instance, described, 'sanity check: .extend() returns a new instance');

	t.test('hidden instance properties', { skip: !hasPrivacy }, function (st) {
		st.deepEqual(Object.keys(instance), [], 'has no own keys');
		st.deepEqual(Object.keys(described), [], 'has no own keys');

		st.end();
	});

	t.test('visible instance properties', { skip: hasPrivacy }, function (st) {
		st.deepEqual(Object.keys(instance), ['wrappers', 'mode'], 'has "wrappers" and "mode" key');
		st.deepEqual(Object.keys(described), ['wrappers', 'mode', 'description'], 'has "wrappers", "mode", and "description" keys');

		st.end();
	});

	t.test('#use()', function (st) {
		st.test('borrowing on a non-wrapper', function (sst) {
			sst['throws'](function () { instance.use.call({}, function withFoo() {}); }, TypeError, 'throws with receiver is not MochaWrapper');
			sst.end();
		});

		st.test('non-functions', function (sst) {
			sst['throws'](function () { instance.use(); }, TypeError, 'throws with undefined');
			sst['throws'](function () { instance.use(null); }, TypeError, 'throws with null');
			sst['throws'](function () { instance.use(true); }, TypeError, 'throws with true');
			sst['throws'](function () { instance.use('foo'); }, TypeError, 'throws with string');
			sst['throws'](function () { instance.use(/a/g); }, TypeError, 'throws with regex');
			sst['throws'](function () { instance.use([]); }, TypeError, 'throws with array');
			sst['throws'](function () { instance.use({}); }, TypeError, 'throws with object');
			sst.end();
		});

		st.test('functions without the correct name', function (sst) {
			var anon = function () {};
			sst['throws'](function () { instance.use(anon); }, TypeError, 'throws with anonymous function');
			var badPlugin = function wrongPrefix() {};
			sst['throws'](function () { instance.use(badPlugin); }, TypeError, 'throws with badly named function');
			sst.end();
		});

		st.test('with a plugin', function (sst) {
			sst.test('plugins not returning a description', function (s2t) {
				s2t['throws'](
					function () { instance.use(function withFoo() {}); },
					TypeError,
					'throws when plugin returns undefined'
				);
				s2t['throws'](
					function () { instance.use(function withFoo() { return {}; }); },
					TypeError,
					'throws when plugin returns no description'
				);
				s2t['throws'](
					function () { instance.use(function withFoo() { return { description: true }; }); },
					TypeError,
					'throws when plugin returns nonstring description'
				);
				s2t['throws'](
					function () { instance.use(function withFoo() { return { description: '' }; }); },
					TypeError,
					'throws when plugin returns empty description'
				);
				s2t.end();
			});

			sst.test('receiver and proxied arguments', function (s2t) {
				s2t.plan(7);
				var plugin = function withFoo(a, b, c, d) {
					s2t.equal(arguments.length, 3, '3 args passed');
					s2t.equal(a, 1, 'a arg is 1');
					s2t.equal(b, 2, 'b arg is 1');
					s2t.equal(c, 3, 'c arg is 1');
					s2t.equal(d, undefined, 'd arg is undefined');
					s2t.equal(instance, this, 'plugin receiver is instance');
					return { description: 'something' };
				};
				var withPlugin = instance.use(plugin, 1, 2, 3);
				s2t.notEqual(instance, withPlugin, 'sanity check: "use" returns a new instance');
			});

			sst.test('plugin that calls .extend()', function (s2t) {
				var plugin = function withFoo() {
					return this.extend('description');
				};
				var withPlugin = instance.use(plugin);
				s2t.notEqual(instance, withPlugin, 'sanity check: "use" returns a new instance');
				s2t.end();
			});

			sst.end();
		});

		st.end();
	});

	t.test('#extend()', function (st) {
		st['throws'](function () { instance.extend(); }, TypeError, 'throws with no description');
		st['throws'](function () { instance.extend({}); }, TypeError, 'throws with non-string description');
		st['throws'](function () { instance.extend(''); }, TypeError, 'throws with empty description');

		var noDescriptor = instance.extend('…');
		st.notEqual(instance, noDescriptor, 'sanity check: "extend" returns a new instance with no descriptor');

		var emptyDescriptor = instance.extend('…', {});
		st.notEqual(instance, emptyDescriptor, 'sanity check: "extend" returns a new instance with empty descriptor');

		var extraDescriptor = instance.extend('…', { foo: 'bar' });
		st.notEqual(instance, extraDescriptor, 'sanity check: "extend" returns a new instance with descriptor with extra properties');

		st['throws'](function () { instance.extend('…', { before: true }); }, TypeError, 'throws with method override: noncallable function');
		st['throws'](function () { instance.extend('…', { before: [true] }); }, TypeError, 'throws with method override: array with noncallable function');

		var validDescriptor = instance.extend('…', { before: function () {}, beforeEach: [], afterEach: [function () {}] });
		st.notEqual(instance, validDescriptor, 'sanity check: "extend" returns a new instance with valid descriptor');

		st.end();
	});

	t.end();
});

test('withGlobal', function (t) {
	t.test('key exceptions', function (st) {
		st['throws'](withGlobal, TypeError, 'requires a string or Symbol');
		st['throws'](function () { withGlobal(''); }, TypeError, 'string must not be empty');
		st['throws'](function () { withGlobal(); }, TypeError, 'undefined is not a string or Symbol');
		st['throws'](function () { withGlobal(null); }, TypeError, 'null is not a string or Symbol');
		st['throws'](function () { withGlobal(true); }, TypeError, 'true is not a string or Symbol');
		st['throws'](function () { withGlobal(42); }, TypeError, '42 is not a string or Symbol');
		st['throws'](function () { withGlobal(/a/g); }, TypeError, 'regex is not a string or Symbol');
		st['throws'](function () { withGlobal([]); }, TypeError, 'array is not a string or Symbol');
		st['throws'](function () { withGlobal({}); }, TypeError, 'object is not a string or Symbol');
		st.end();
	});

	t.test('value exceptions', function (st) {
		st['throws'](function () { withGlobal('key', {}); }, TypeError, 'requires a callable valueThunk');
		st.end();
	});

	t.end();
});

test('withOverrides', function (t) {
	t.test('exceptions', function (st) {
		st['throws'](withOverrides, TypeError, 'requires an objectThunk to override');
		st['throws'](function () { withOverrides({}); }, TypeError, 'requires a callable objectThunk to override');
		st['throws'](function () { withOverrides(function () { return {}; }); }, TypeError, 'requires an objectThunk to override with');
		st.end();
	});

	t.test('works with functions', function (st) {
		st.doesNotThrow(function () {
			wrap().withOverrides(
				function () { return function () {}; },
				function () { return {}; }
			);
		}, 'accepts a function to override');
		st.doesNotThrow(function () {
			wrap().withOverrides(
				function () { return {}; },
				function () { return function () {}; }
			);
		}, 'accepts a function of overrides');
		st.end();
	});

	t.end();
});

test('withOverride', function (t) {
	t.test('exceptions', function (st) {
		var getObj = function () { return {}; };
		st['throws'](function () { withOverride(null, 'foo'); }, TypeError, 'requires an objectThunk');
		st['throws'](function () { withOverride({}, 'foo'); }, TypeError, 'requires a callable objectThunk');
		st['throws'](function () { withOverride(getObj); }, TypeError, 'undefined is not a string or Symbol');
		st['throws'](function () { withOverride(getObj, null); }, TypeError, 'null is not a string or Symbol');
		st['throws'](function () { withOverride(getObj, true); }, TypeError, 'true is not a string or Symbol');
		st['throws'](function () { withOverride(getObj, 42); }, TypeError, '42 is not a string or Symbol');
		st['throws'](function () { withOverride(getObj, /a/g); }, TypeError, 'regex is not a string or Symbol');
		st['throws'](function () { withOverride(getObj, []); }, TypeError, 'array is not a string or Symbol');
		st['throws'](function () { withOverride(getObj, {}); }, TypeError, 'object is not a string or Symbol');

		st['throws'](function () { withOverride(getObj, 'key', {}); }, TypeError, 'requires a callable valueThunk');
		st.end();
	});

	t.end();
});
