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
featureDirectories=(monitor/bgp monitor/tenant_network js config/vn)

if [ $1 = 'init' ] ; then
    ln -sf $FOUR_BACK/.jshintrc src/serverroot/web/api/.jshintrc
    cp .jshintrc webroot/monitor/bgp/.jshintrc
    ln -sf $FIVE_BACK/contrail-web-third-party/node_modules src/serverroot/web/api/node_modules
    #Generates qunit.js & qunit.css files by concatinating files from contrail-web-third-party/qunit
    grunt build
    #copy the default Gruntfile.js if it's not present in feature test directory
    for currFeatureDir in "${featureDirectories[@]}"
    do
        #Create "test" directory if it doesn't exist
        if [ ! -d webroot/${currFeatureDir}/test ]; then
            mkdir -p webroot/${currFeatureDir}/test
        fi
        ln -sf $FIVE_BACK/contrail-web-core/.jshintrc webroot/${currFeatureDir}/test/.jshintrc
        ln -sf $FIVE_BACK/contrail-web-third-party/node_modules webroot/${currFeatureDir}/test/node_modules
        confFiles=(Gruntfile.js karma.conf.js) 
        for currConfFile in "${confFiles[@]}"
        do
            #If a specific config file is not present,copy the default one for reference
            if [ ! -f webroot/${currFeatureDir}/test/${currConfFile} ]; then
                cp webroot/monitor/bgp/test/${currConfFile} webroot/${currFeatureDir}/test/
            fi
        done
    done
    ln -sf $THREE_BACK/contrail-web-core/.jshintrc webroot/test/.jshintrc
    ln -sf $THREE_BACK/contrail-web-third-party/node_modules webroot/test/node_modules
    ln -sf $FOUR_BACK/contrail-web-core/.jshintrc webroot/js/test/.jshintrc
    ln -sf $FOUR_BACK/contrail-web-third-party/node_modules webroot/js/test/node_modules
fi

if [ $1 = 'node' ] ; then
    ln -sf $FOUR_BACK/.jshintrc src/serverroot/web/api/.jshintrc
    cd src/serverroot/web/api
    grunt node-qunit
fi
if [ $1 = 'ui' ] ; then
    cd webroot/monitor/bgp/test
    grunt qunit
fi

