#!/usr/bin/env bash
./node_modules/.bin/istanbul cover \
    -x *.spec.js \
    -x *.spec.class.js \
    -i './{,!(node_modules|coverage|webpack|mocks)/**/}/{,!(index|nonAllowedFatal)*}.js' \
    --include-all-sources \
    ./node_modules/.bin/_mocha \
        -r node_modules/reflect-metadata \
        -r ./nonAllowedFatal './{,!(node_modules)/**/}/*.spec.js'