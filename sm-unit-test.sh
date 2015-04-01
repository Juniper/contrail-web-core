#!/usr/bin/env bash

#
# Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
#

echo    "*******************************************"
echo    "*     Server Manager Unit Tests setup     *"
echo -e "*******************************************\n\n"

cd ../contrail-web-server-manager/webroot

echo "Creating links for assets, js, css, views....."
ln -sf ../../contrail-web-core/webroot/views/ views
ln -sf ../../contrail-web-core/webroot/js/ js
ln -sf ../../contrail-web-core/webroot/css/ css
ln -sf ../../contrail-web-core/webroot/assets/ assets
echo "DONE"

cd test
echo "Creating link for node_modules....."
ln -sf ../../../contrail-web-core/node_modules/ node_modules
echo "DONE"