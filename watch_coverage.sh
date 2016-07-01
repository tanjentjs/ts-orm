#!/usr/bin/env bash
./node_modules/.bin/nodemon -x ./run_mocha.sh &
nodemon=$!
sleep 5s
cd coverage/lcov-report
../../node_modules/.bin/browser-sync start --no-open --no-inject-changes -s &
browsersync=$!

wait $nodemon
wait $browsersync