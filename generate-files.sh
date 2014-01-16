#!/usr/bin/env bash
#
#
# Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
#

if command -v node >/dev/null 2; then {
    echo "Node already installed"
} else {
    INSTALL_DIR=/usr/local

    # TODO This should be done for all platforms.
    grep -qi ubuntu /etc/issue
    if [ "$?" = "0" ]; then
        INSTALL_DIR=$PWD/../build/contrail-web-third-party
    fi

    PATH=$PATH:$INSTALL_DIR/bin
    mkdir -p $INSTALL_DIR

    echo "Installing NodeJS ..."
    cd ../contrail-web-third-party/node-v*
    ./configure --prefix=$INSTALL_DIR
    make
    if [ "$INSTALL_DIR" = "/usr/local" ]; then
        sudo make install
    else
        make install
    fi
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
