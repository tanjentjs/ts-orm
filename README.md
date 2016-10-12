***ON HOLD*** 

This project is mostly on hold until the typescript extensability stuff is implemented. That will probably result in some API changes as there will be better ways to structure the api 

See https://github.com/microsoft/typescript/issues/6508

***ON HOLD***

Overview
========
An object relational model which uses typescript annotations to define the data
schema. It can be used in node applications and includes bindings for angular 
js dependancy injection. It can also be used on the frontend with a little setup
and will talk via an api.

[![Build Status](https://travis-ci.org/tanjentjs/ts-orm.svg?branch=master)](https://travis-ci.org/tanjentjs/ts-orm)
[![Coverage Status](https://coveralls.io/repos/github/tanjentjs/ts-orm/badge.svg?branch=master)](https://coveralls.io/github/tanjentjs/ts-orm?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/tanjentjs-ts-orm.svg)](https://www.npmjs.com/package/tanjentjs-ts-orm)
[![Slack Status](https://tanjentjs-slack.herokuapp.com/badge.svg)](https://tanjentjs-slack.herokuapp.com/)

Installing
==========
```bash
npm install --save tanjentjs-ts-orm typescript typings
typings install --save --global dt~es6-shim
```
Usage
=====

Please checkout the [wiki](../../wiki)

Requests, Bugs, and Roadmap
===========================
Please submit all requests for features and bug requests via the github
 [bug tracker](../../issues), the roadmap will be tracked via github
 [milestones](../../milestones)

Testing
=======
* Tests will be placed along side the file in question in a file labeled <name>.spec.ts
* Tests will be written using Mocha with the describe statement containing the name of the file including the directory
   (ex. 'node/connect' for 'node/connect.ts')
* If you need to create classes for testing (ex. testing an abstract class) place them in a <name>.spec.class.ts
* All public interfaces must be tested
* In order to fix a bug you must write a test first, this is to avoid regressions
* The test reporter should always show 100% coverage. If something doesn't make sense to test you can ignore it using special comments

Directory structure
=======
* shared - contains the files shared across all vendors
* node - contains the files for use via nodejs
* mocks - contains mock objects for use in testing

Development
===========

Setup
-----
```bash
git clone git@github.com:tanjentjs/ts-orm.git
npm install
```
Project files are included for jetbrains IDEs, just load the project and start developing.
For other IDEs please load the tslint settings.

Contributing
------------
1. You should run `npm run lint` before creating the pr and fix any issues
1. Create the merge request
1. Make sure travis ci passes

Releasing
---------
1. Create a tag in github using [semantic versioning](http://semver.org/)
1. Travis CI should run the build and push it to npm

