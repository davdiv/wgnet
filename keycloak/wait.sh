#!/bin/bash

while ! grep "Startup for wgnet successfully executed!" ./keycloak.log &> /dev/null ; do sleep 1; done
node ./transformConfig.js
