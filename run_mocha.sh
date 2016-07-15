#!/usr/bin/env bash
./node_modules/.bin/istanbul cover \
    -i './{,!(node_modules|coverage|webpack|mocks)/**/}/{,!(index|mochaInit|AuthHandler)*}.js' \
    ./node_modules/.bin/_mocha \
        -r node_modules/reflect-metadata \
        -r ./mochaInit \
        './{,!(node_modules)/**/}/*.spec.js'