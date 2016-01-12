#!/usr/bin/env bash

#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#
ONE_BACK='..'
TWO_BACK='../..'
THREE_BACK='../../..'
FOUR_BACK='../../../..'
FIVE_BACK='../../../../..'
SIX_BACK='../../../../../..'
GRUNT_DIR=./node_modules/grunt-cli
GRUNT_BIN=$GRUNT_DIR/bin/grunt

if [ $1 = 'set-env' ] ; then
    if command -v nodejs > /dev/null; then
      node_exec=nodejs;
    elif command -v node > /dev/null; then
      node_exec=node
    else
      echo "error: Failed dependencies: node/nodejs is needed";
      exit;
    fi;
    # Set test specific environments.
    $node_exec webroot/test/ui/js/tasks/setTestConfig.js "$@"
fi

if [ -d "$GRUNT_DIR" ]; then
    #List all feature directories from where we need to run the test cases
    featureDirectories=(monitor/infra monitor/tenant_network js config/vn)

    if [ $1 = 'init' ] && [ "$#" -eq 1 ]; then
        ln -sf $FOUR_BACK/.jshintrc src/serverroot/web/api/.jshintrc
        ln -sf $TWO_BACK/contrail-web-controller/webroot/test webroot/test
        #Generates qunit.js & qunit.css files by concatinating files from contrail-webui-third-party/qunit
        $GRUNT_BIN build
        #copy the default Gruntfile.js if it's not present in feature test directory
        for currFeatureDir in "${featureDirectories[@]}"
        do
            #Create "test" directory if it doesn't exist
            if [ ! -d webroot/${currFeatureDir}/test ]; then
                mkdir -p webroot/${currFeatureDir}/test
            fi
            ln -sf $FIVE_BACK/contrail-web-core/.jshintrc webroot/${currFeatureDir}/test/.jshintrc
            ln -sf $FIVE_BACK/contrail-webui-third-party/node_modules webroot/${currFeatureDir}/test/node_modules
            confFiles=(Gruntfile.js karma.conf.js)
            for currConfFile in "${confFiles[@]}"
            do
                #If a specific config file is not present,copy the default one for reference
                if [ ! -f webroot/${currFeatureDir}/test/${currConfFile} ]; then
                    cp webroot/monitor/infra/test/${currConfFile} webroot/${currFeatureDir}/test/
                fi
            done
        done
        ln -sf $THREE_BACK/contrail-web-core/.jshintrc webroot/test/.jshintrc
        ln -sf $THREE_BACK/contrail-web-core/node_modules webroot/test/node_modules
        ln -sf $FOUR_BACK/contrail-web-core/.jshintrc webroot/js/test/.jshintrc
        ln -sf $FOUR_BACK/contrail-web-core/node_modules webroot/js/test/node_modules
    fi

    if [ $1 = 'node' ] ; then
        ln -sf $FOUR_BACK/.jshintrc src/serverroot/web/api/.jshintrc
        ln -sf $FOUR_BACK/node_modules src/serverroot/web/api/node_modules
        cd src/serverroot/web/api
        $GRUNT_BIN node-qunit
    fi

    IFS=',' read -ra REPOS <<< "$2"
    for REPO in "${REPOS[@]}"; do
        echo $REPO
        if [ $REPO = 'webController' ] ; then
            echo    "**************************************************"
            echo    "*     Web Controller Unit Tests Setup            *"
            echo -e "**************************************************\n\n"

            cd ../contrail-web-controller/webroot/test/ui

            echo "Creating link for node_modules....."
            ln -sf ../../../../contrail-web-core/node_modules/ node_modules
            cd -
            echo "DONE"
        fi

        if [ $REPO = 'serverManager' ] ; then
            echo    "*******************************************"
            echo    "*     Server Manager Unit Tests setup     *"
            echo -e "*******************************************\n\n"

            cd ../contrail-web-server-manager/webroot/test/ui

            echo "Creating link for node_modules....."
            ln -sf ../../../../contrail-web-core/node_modules/ node_modules
            cd -
            echo "DONE"
        fi

        if [ $REPO = 'webStorage' ] ; then
            echo    "*******************************************"
            echo    "*     Web Storage Unit Tests setup        *"
            echo -e "*******************************************\n\n"

            cd ../contrail-web-storage/webroot/test/ui

            echo "Creating link for node_modules....."
            ln -sf ../../../../contrail-web-core/node_modules/ node_modules
            cd -
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
