# mocha-wrap <sup>[![Version Badge][2]][1]</sup>

[![Build Status][3]][4]
[![dependency status][5]][6]
[![dev dependency status][7]][8]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

[![npm badge][11]][1]

Fluent pluggable interface for easily wrapping `describe`, `context`, `it`, and `specify` blocks in Mocha tests.

## Example

```js
var wrap = require('mocha-wrap');
var expect = require('chai').expect;

var mockWindow = {
	location: {
		href: 'test/url'
	}
};
wrap().withGlobal('window', () => mockWindow).describe('mocked window', function () {
	it('is mocked', function () {
		expect(window).to.equal(mockWindow);
	});

	it('has the right URL', function () {
		expect(window.location.href).to.equal('test/url');
	});
});

var obj = { a: 1 };
wrap().withOverrides(() => obj, () => ({ a: 2, b: 3 })).describe('overridden object keys', function () {
	it('has "b"', function () {
		expect(obj.b).to.equal(3);
	});

	it('has overridden "a"', function () {
		expect(obj.a).to.equal(2);
	});
});

wrap().withOverride(() => obj, 'a', () => 4).skip().describe('this test is skipped', function () {
	it('also supports .only()!', function () {
		expect(true).to.equal(false); // skipped
	});
});
```

## Plugins
A `mocha-wrap` **plugin** is a named function that returns a MochaWrapper instance or a descriptor object.
 - A plugin’s function `name` must begin with the string “with”.
 - Plugins can be globally registered, or `.use`d ad-hoc.
  - `.use` requires a plugin function as its first argument; further arguments are passed through to the plugin.
  - `.extend` requires a non-empty description string, and a descriptor object which may contain a value that is a function, or an array of functions, whose keys correspond to any or all of the supported mocha methods.
 - Globally registered plugins, `.use` calls, and `.extend` calls can be chained, stored, and reused - each link in the chain creates a new instance of a MochaWrapper.

 - A descriptor object may contain any or all of these 5 keys:
  - a `description` string, for use in “describe” and/or “it” (this is required when returning an object)
  - `beforeEach`: a function, or array of functions, for use in a `mocha` `beforeEach` function
  - `afterEach`: a function, or array of functions, for use in a `mocha` `afterEach` function
  - `before`: a function, or array of functions, for use in a `mocha` `before` function
  - `after`: a function, or array of functions, for use in a `mocha` `after` function

The most common approach will be for a plugin function to return `this.extend(description, descriptor)`.

A plugin function must have a `name` that starts with “with”, and will be invoked with a receiver (”this” value) of a MochaWrapper instance.

To register a plugin, call the `register` function on `mocha-wrap` with the plugin function. This should not be done in a reusable module.

```js
module.exports = function withFoo(any, args, you, want) {
	return this.extend('with some foo stuff', {
		beforeEach: function () {
			// setup ran before each test
		},
		afterEach: [
			function () {
				// teardown ran after each test
			},
			function () {
				// more teardown
			}
		],
		before: function () {
			// setup ran once before all tests
		},
		after: function () {
			// teardown ran once after all tests
		}
	});
};
```

## Usage
```js
var wrap = require('mocha-wrap');
wrap.register(require('mocha-wrap-with-foo'));

wrap().withFoo().describe…
```

## skip/only
Although mocha has `describe.skip`, `describe.only`, `context.skip`, `context.only`, `it.skip`, `it.only`, `specify.skip`, and `specify.only`, it is not possible to implement these in mocha-wrap without using ES5 property accessors. Since this project supports ES3, we decided to use `.skip().describe` etc rather than forfeit the ability to have skip/only.

## Tests
Simply clone the repo, `npm install`, and run `npm test`

[1]: https://npmjs.org/package/mocha-wrap
[2]: http://versionbadg.es/airbnb/mocha-wrap.svg
[3]: https://travis-ci.org/airbnb/mocha-wrap.svg
[4]: https://travis-ci.org/airbnb/mocha-wrap
[5]: https://david-dm.org/airbnb/mocha-wrap.svg
[6]: https://david-dm.org/airbnb/mocha-wrap
[7]: https://david-dm.org/airbnb/mocha-wrap/dev-status.svg
[8]: https://david-dm.org/airbnb/mocha-wrap#info=devDependencies
[11]: https://nodei.co/npm/mocha-wrap.png?downloads=true&stars=true
[license-image]: http://img.shields.io/npm/l/mocha-wrap.svg
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/mocha-wrap.svg
[downloads-url]: http://npm-stat.com/charts.html?package=mocha-wrap
