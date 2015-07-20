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

#List all feature directories from where we need to run the test cases
featureDirectories=(monitor/infra monitor/tenant_network js config/vn)

if [ $1 = 'init' ] && [ "$#" -eq 1 ]; then
    ln -sf $FOUR_BACK/.jshintrc src/serverroot/web/api/.jshintrc
    ln -sf $TWO_BACK/contrail-web-controller/webroot/test webroot/test
    #Generates qunit.js & qunit.css files by concatinating files from contrail-webui-third-party/qunit
    grunt build
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
    grunt node-qunit
fi

if [ $2 = 'webController' ] ; then
    echo    "**************************************************"
    echo    "*     Networking Monitoring Unit Tests Setup     *"
    echo -e "**************************************************\n\n"

    cd ../contrail-web-controller/webroot/test/ui

    echo "Creating link for node_modules....."
    ln -sf ../../../../contrail-web-core/node_modules/ node_modules
    echo "DONE"
fi

if [ $2 = 'serverManager' ] ; then
    echo    "*******************************************"
    echo    "*     Server Manager Unit Tests setup     *"
    echo -e "*******************************************\n\n"

    cd ../contrail-web-server-manager/webroot/test/ui

    echo "Creating link for node_modules....."
    ln -sf ../../../../contrail-web-core/node_modules/ node_modules
    echo "DONE"
fi


