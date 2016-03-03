#!/usr/bin/env node

'use strict';

var istanbul = require('istanbul-lib-coverage');
var fs = require('fs');
var path = require('path');

var tape = require('../coverage/tape/coverage.raw.json');
var mocha = require('../coverage/mocha/coverage.raw.json');

var map = istanbul.createCoverageMap({});

map.merge(tape);
map.merge(mocha);

fs.writeFileSync(path.join(process.cwd(), 'coverage', 'coverage.raw.json'), JSON.stringify(map));

