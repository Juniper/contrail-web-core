#!/usr/bin/env bash

#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#
ROOT_DIR=$(dirname `pwd`)
WEBCORE_DIR=$ROOT_DIR/contrail-web-core
GRUNT_DIR=$WEBCORE_DIR/node_modules/grunt-cli
GRUNT_BIN=$GRUNT_DIR/bin/grunt

WEBCORE_TEST_DIR=$WEBCORE_DIR/webroot/test/ui
CONTROLLER_TEST_DIR=$ROOT_DIR/contrail-web-controller/webroot/test/ui
SM_TEST_DIR=$ROOT_DIR/contrail-web-server-manager/webroot/test/ui
STORAGE_TEST_DIR=$ROOT_DIR/contrail-web-storage/webroot/test/ui
RUNTEST_ARG=''

if [ "$1" = 'set-env' ] ; then
    if command -v nodejs > /dev/null; then
      node_exec=nodejs;
    elif command -v node > /dev/null; then
      node_exec=node
    else
      echo "error: Failed dependencies: node/nodejs is needed";
      exit;
    fi;
    # Set test specific environments.
    $node_exec $WEBCORE_TEST_DIR/js/tasks/setTestConfig.js "$@"
fi

if [ -d "$GRUNT_DIR" ]; then
    IFS=',' read -ra REPOS <<< "$2"
    
    if [ "$1" = 'init' ] ; then
        echo -e "== Test infrastructure initialization\n"
        ln -sfn $WEBCORE_DIR/node_modules $WEBCORE_TEST_DIR/node_modules
        for REPO in "${REPOS[@]}"; do
            if [ $REPO = 'webController' ] ; then
                echo "Repo: $REPO"
                ln -sfn $WEBCORE_DIR/node_modules $CONTROLLER_TEST_DIR/node_modules
                #Adding sleep seems to solve the issue of grunt-karma not starting up
                sleep 1
                echo -e "DONE \n"
            fi

            if [ $REPO = 'serverManager' ] ; then
                echo "Repo: $REPO"
                ln -sfn $WEBCORE_DIR/node_modules $SM_TEST_DIR/node_modules
                sleep 1
                echo -e "DONE \n"
            fi

            if [ $REPO = 'webStorage' ] ; then
                echo "Repo: $REPO"
                ln -sfn $WEBCORE_DIR/node_modules $STORAGE_TEST_DIR/node_modules
                sleep 1
                echo -e "DONE \n"
            fi
        done
    fi

    if [ "$1" = 'ui' ] ; then
        if [ ! -z "$3" ] && [ "$3" = 'dev' ] ; then
            RUNTEST_ARG='--force'
        fi
        
        for REPO in "${REPOS[@]}"; do
            if [ $REPO = 'webController' ] ; then
                echo    "**************************************************"
                echo    "*     Web Controller Unit Tests                  *"
                echo -e "**************************************************\n"
                cd $CONTROLLER_TEST_DIR ;\
                ./run_tests.sh $RUNTEST_ARG ;\
                cd -
                echo "DONE"
            fi

            if [ $REPO = 'serverManager' ] ; then
                echo    "*******************************************"
                echo    "*     Server Manager Unit Tests           *"
                echo -e "*******************************************\n"
                cd $SM_TEST_DIR ;\
                ./run_tests.sh $RUNTEST_ARG ;\
                cd -
                echo "DONE"
            fi

            if [ $REPO = 'webStorage' ] ; then
                echo    "*******************************************"
                echo    "*     Web Storage Unit Tests              *"
                echo -e "*******************************************\n"
                cd $STORAGE_TEST_DIR ;\
                ./run_test.sh $RUNTEST_ARG ;\
                cd -
                echo "DONE"
            fi
        done 
    fi

else
    echo -e "\033[31m<<<<<<<<<<<<<<< Warning! >>>>>>>>>>>>>>>>>>>>>>>>>>>>\033[0m"
    echo "Unable to find local node_modules for Grunt. UT execution requires Grunt modules."
    echo "To setup UT enviornment: "
    echo "Run make fetch-pkgs-dev from contrail-web-core repo; and do prod-env or dev-env with respective 'REPO=' arg set."
    echo -e "\033[31m<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\033[0m"
    exit 0
fi