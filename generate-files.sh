#!/usr/bin/env bash
#
#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

INSTALL_DIR=$PWD/../build/contrail-web-third-party
PATH=$INSTALL_DIR/bin:$PATH
if command -v node >/dev/null 2; then {
    echo "Node already installed"
} else {
    mkdir -p $INSTALL_DIR

    echo "Installing NodeJS ..."
    cd ../contrail-web-third-party/node-v*
    ./configure --prefix=$INSTALL_DIR
    make
    make install
    echo "Installed NodeJS"
    cd -
}
fi

if command -v nodejs > /dev/null; then
  node_exec=nodejs;
elif command -v node > /dev/null; then
  node_exec=node
else
  echo "error: Failed dependencies: node/nodejs is needed";
  exit;
fi;
$node_exec src/tools/registerURL.js
$node_exec src/tools/jobProcess.js
$node_exec src/tools/parseFeature.js
$node_exec src/tools/configTemplateGenerator.js

