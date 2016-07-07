#!/usr/bin/env bash
./node_modules/.bin/nodemon -x ./run_mocha.sh &
nodemon=$!
sleep 5s
./node_modules/.bin/browser-sync start --no-inject-changes --logLevel info --no-open -f 'coverage/lcov-report' -s --ss 'coverage/lcov-report' &
browsersync=$!

wait $nodemon
wait $browsersync