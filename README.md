Overview
========
An object relational model which uses typescript annotations to define the data
schema. It can be used in node applications and includes bindings for angular 
js dependancy injection. It can also be used on the frontend with a little setup
and will talk via an api.

[![Build Status](https://travis-ci.org/tanjentjs/ts-orm.svg?branch=master)](https://travis-ci.org/tanjentjs/ts-orm)

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

