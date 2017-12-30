#!/usr/bin/env bash
# We will use the grunt binary from the node_modules locally installed.

TEST_DIR=./
ROOT_DIR=../../
TEST_CONFIG=$ROOT_DIR/webroot/test/ui/js/co.test.config.js
ENV=`grep 'testConfig.env' $TEST_CONFIG | sed "s/testConfig\.env \= '\([a-z]*\)';/\1/"`
GRUNT_DIR=$TEST_DIR/node_modules/grunt-cli
GRUNT_FILE=$TEST_DIR/Gruntfile.js
force=false

while [ "$#" -gt 0 ]; do
  case "$1" in
    --force) force=true; shift 1;;

    -*) echo "unknown option: $1" >&2; exit 1;;
    *) die "unrecognized argument: $1"; shift 1;;
  esac
done

if [ $ENV == "prod" ] || [ "$force" == true ]; then
    if [ -d "$GRUNT_DIR" ]; then
        ulimit -n 2054
        $GRUNT_DIR/bin/grunt --gruntfile $GRUNT_FILE run
    else
        echo -e "\033[31m<<<<<<<<<<<<<<< Error!! >>>>>>>>>>>>>>>>>>>>>>>>>>>>\033[0m"
        echo "Unable to find local node_modules."
        echo "Run make test-env from contrail-web-core repo with respective 'REPO=' arg set."
        echo -e "\033[31m<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\033[0m"
        exit 1
    fi
else
    echo -e "\033[31m<<<<<<<<<<<<<<< Warning!! >>>>>>>>>>>>>>>>>>>>>>>>>>>>\033[0m"
    echo "Current compiled environment is not production."
    echo "Its required to run tests in production environment before committing."
    echo "Run make prod-env from contrail-web-core repo and proceed with commit."
    echo -e "\033[31m<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\033[0m"
    exit 1
fi
