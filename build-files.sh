#!/usr/bin/env bash
#
# Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
#

if command -v nodejs > /dev/null; then
  node_exec=nodejs;
elif command -v node > /dev/null; then
  node_exec=node
else
  echo "error: Failed dependencies: node/nodejs is needed";
  exit;
fi;
$node_exec ./node_modules/requirejs/bin/r.js -o webroot/core.init.build.js
$node_exec ./node_modules/requirejs/bin/r.js -o webroot/core.css.build.js

# Manually moving following views due to error in minification. will use the source file for now.
mv webroot/built/js/views/GridView.js webroot/built/js/views/GridView.min.js
cp webroot/js/views/GridView.js webroot/built/js/views/GridView.js

IFS=',' read -ra REPOS <<< "$2"
for REPO in "${REPOS[@]}"; do
    echo $REPO
    if [ $REPO = 'webController' ] ; then
        echo    "**************************************************"
        echo    "*     Building Web Controller Repo               *"
        echo -e "**************************************************\n\n"

        cd ../contrail-web-controller/
        $node_exec ./node_modules/requirejs/bin/r.js -o webroot/controller.build.js
        cd -
        echo "DONE"
    fi

    if [ $REPO = 'serverManager' ] ; then
        echo    "*******************************************"
        echo    "*     Building Server Manager Repo        *"
        echo -e "*******************************************\n\n"

        cd ../contrail-web-server-manager/

        # commenting out till files are checked in
        #$node_exec ./node_modules/requirejs/bin/r.js -o webroot/sm.build.js
        cd -
        echo "DONE"
    fi

    if [ $REPO = 'webStorage' ] ; then
        echo    "*******************************************"
        echo    "*     Building Web Storage Repo           *"
        echo -e "*******************************************\n\n"

        cd ../contrail-web-storage/

        # commenting out till files are checked in
        # $node_exec ./node_modules/requirejs/bin/r.js -o webroot/storage.build.js
        cd -
        echo "DONE"
    fi
done