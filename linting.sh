#!/usr/bin/env bash

#
# Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
#
ONE_BACK='..'
TWO_BACK='../..'
THREE_BACK='../../..'
FOUR_BACK='../../../..'
FIVE_BACK='../../../../..'
SIX_BACK='../../../../../..'
GRUNT_DIR=./node_modules/grunt-cli
GRUNT_BIN=$GRUNT_DIR/bin/grunt

if [ -d "$GRUNT_DIR" ]; then
    #List all feature directories from where we need to run the test cases
    featureDirectories=(monitor/infra monitor/tenant_network js config/vn)

    IFS=',' read -ra REPOS <<< "$1"
    for REPO in "${REPOS[@]}"; do
        echo $REPO
        if [ $REPO = 'webCore' ] ; then
            echo    "*********************************************"
            echo    "*            Web Core CSS Linting           *"
            echo -e "*********************************************\n\n"

            $GRUNT_BIN csslint

            echo "DONE"
        fi

        if [ $REPO = 'webController' ] ; then
            echo    "**************************************************"
            echo    "*          Web Controller CSS Linting            *"
            echo -e "**************************************************\n\n"

            $GRUNT_BIN csslint --src=../contrail-web-controller/webroot/**/*.css

            echo "DONE"
        fi

        if [ $REPO = 'serverManager' ] ; then
            echo    "*******************************************"
            echo    "*        Server Manager CSS Linting       *"
            echo -e "*******************************************\n\n"

            $GRUNT_BIN csslint --src=../contrail-web-server-manager/webroot/**/*.css

            echo "DONE"
        fi

        if [ $REPO = 'webStorage' ] ; then
            echo    "*******************************************"
            echo    "*         Web Storage CSS Linting         *"
            echo -e "*******************************************\n\n"

            $GRUNT_BIN csslint --src=../contrail-web-storage/webroot/**/*.css

            echo "DONE"
        fi
    done
else
    echo -e "\033[31m<<<<<<<<<<<<<<< Warning! >>>>>>>>>>>>>>>>>>>>>>>>>>>>\033[0m"
    echo "Unable to find local node_modules for Grunt. UT execution requires Grunt modules."
    echo "To setup UT enviornment: "
    echo "Run make fetch-pkgs-dev from contrail-web-core repo; and do prod-env or dev-env with respective 'REPO=' arg set."
    echo -e "\033[31m<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\033[0m"
    exit 0
fi