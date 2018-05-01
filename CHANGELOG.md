2.1.2 / 2018-05-01
=================
  * [Fix] ensure that skip works inside plugins, and plugins with no changes but the mode work
  * [Deps] update `function-bind`, `function.prototype.name`, `object-inspect`
  * [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape`, `rimraf`, `istanbul-lib-coverage`
  * [Tests] add --no-save to testing install commands
  * [Tests] up to `node` `v10.0`, `v9.11`, `v8.11`, `v7.10`, `v6.14`, `v4.9`; use `nvm install-latest-npm`

2.1.1 / 2017-03-14
=================
  * [Fix] ensure wrappers are only applied once when `.use` is called multiple times.

2.1.0 / 2016-10-04
=================
  * [New] add support for `specify` as an alias to `it`
  * [Dev Deps] add `eslint`, `@ljharb/eslint-config`, `istanbul`, `istanbul-lib-coverage`, `istanbul-merge`, `safe-publish-latest`, `tape`
  * [Tests] up to `node` `v6.6`, `v4.5`; improve test matrix
  * [Tests] ensure coverage runs on mocha 3
  * [Docs] remove browser support matrix

2.0.5 / 2016-08-01
=================
  * [Patch] [Tests] update `peerDependencies` for `mocha` `v3`; remove `parallelshell` since it does not reliably report failures.
  * [Tests] on `node` `v6.3`, `v5.12`
  * [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `tape`, `rimraf`

2.0.4 / 2016-05-18
=================
  * [Fix] withOverride/withOverrides should work on something with only a getter.
  * [Deps] update `object-inspect`
  * [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `istanbul-merge`
  * [Tests] up to `node` `v6.1`

2.0.3 / 2016-03-22
=================
  * [Fix] withOverrides: allow functions to be used as both the object to override, and the object of overrides.
  * [Tests] on `node` `v5.9`

2.0.2 / 2016-03-15
=================
  * [Fix] make sure `withOverrides` re-calls the thunks on every iteration

2.0.1 / 2016-03-14
=================
  * Something broke with the v2.0.0 publish

2.0.0 / 2016-03-14
=================
  * [Breaking] `withGlobal`/`withOverride`/`withOverrides` now require a thunk for both targets and overrides (#2)
  * [Breaking] [New] Add `.only()`/`.skip()`, drop mocha < 1.4.1 support (#6, #1)
  * [Fix] ensure multiple nested before/after hooks are called in the right order (#3)
  * [Fix] ensure “no transformations” throws properly
  * [Tests] on `node` `v5.8`, `v4.4`
  * [Tests] parallelize tape tests and mocha tests
  * [Tests] ensure coverage dir is clean before running merge; parallelize coverage runs
  * [Tests] Echo a success message on `npm run cover:check`

1.1.0 / 2016-03-11
=================
  * [New] add `.context()` (#4)
  * [New] add `withOverride` plugin (#5)
  * [Deps] update `is-callable`
  * [Dev Deps] update `tape`, `eslint`
  * [Dev Deps] move merge-coverage script into `istanbul-merge` package
  * [Tests] move `tape` tests to their own directory

1.0.1 / 2016-03-04
=================
  * Improve `describe` wrapper message.

1.0.0 / 2016-03-03
=================
  * Initial release.
