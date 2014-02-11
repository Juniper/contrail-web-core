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

if [ $1 = 'init' ] ; then
    ln -sf $FOUR_BACK/.jshintrc src/serverroot/web/api/.jshintrc
    cp .jshintrc webroot/monitor/bgp/.jshintrc
    ln -sf $FIVE_BACK/contrail-web-third-party/node_modules src/serverroot/web/api/node_modules
    grunt build
fi
if [ $1 = 'node' ] ; then
    ln -sf $FOUR_BACK/.jshintrc src/serverroot/web/api/.jshintrc
    cd src/serverroot/web/api
    grunt node-qunit
fi
if [ $1 = 'ui' ] ; then
    ln -sf $FIVE_BACK/contrail-web-core/.jshintrc webroot/monitor/bgp/test/.jshintrc
    ln -sf $FIVE_BACK/contrail-web-third-party/node_modules webroot/monitor/bgp/test/node_modules
    cd webroot/monitor/bgp/test
    grunt qunit
fi

