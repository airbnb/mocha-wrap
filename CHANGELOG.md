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
