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

# r.js binary file used for optimization.
rjs_bin=./../contrail-web-core/node_modules/requirejs/bin/r.js

# Path where the build script is located
build_path=webroot/build/

# Path where the built modules and minified files are located.
dist_path=webroot/dist/

# Build config generator script
build_conf_generator=$build_path"config.generator.js"

# Path to store the build config
out_path=$build_path

# Build config filename
build_filename="build.config.js"

# Build output file
build_file="$out_path$build_filename"

# Build config output files.
core_build_file=./webroot/build/core.build.config.js
controller_build_file=./../contrail-web-controller/webroot/build/controller.build.config.js
sm_build_file=./../contrail-web-server-manager/webroot/build/sm.build.config.js
storage_build_file=./../contrail-web-storage/webroot/build/storage.build.config.js

echo    "**************************************************"
echo    "*     Building Web Core Repo                     *"
echo -e "**************************************************\n"
REPO="webCore"
$node_exec $build_conf_generator $REPO $core_build_file
$node_exec $rjs_bin -o $core_build_file

#$node_exec $rjs_bin -o $build_path/core.css.build.js

echo "Post Build additional changes: "
# Manually moving following views due to error in minification. will use the source file for now.
#echo "GridView.js: Replacing minified GridView with original source."
#mv $dist_path/js/views/GridView.js $dist_path/js/views/GridView.min.js
#cp webroot/js/views/GridView.js $dist_path/js/views/GridView.js
# Workaround for vis.min.js taking too much time in r.js.
echo "vis-v4.9.0: Copying original minified version"
mkdir -p $dist_path/assets/vis-v4.9.0/js
cp webroot/assets/vis-v4.9.0/js/vis.min.js $dist_path/assets/vis-v4.9.0/js/

IFS=',' read -ra REPOS <<< "$2"
for REPO in "${REPOS[@]}"; do
    if [ $REPO = 'webController' ] ; then
        echo    "**************************************************"
        echo    "*     Building Web Controller Repo               *"
        echo -e "**************************************************\n"

        $node_exec $build_conf_generator $REPO $controller_build_file
        cd ../contrail-web-controller/
        $node_exec $rjs_bin -o $controller_build_file
        cd -
        echo "DONE"
    fi

    if [ $REPO = 'serverManager' ] ; then
        echo    "*******************************************"
        echo    "*     Building Server Manager Repo        *"
        echo -e "*******************************************\n"

        $node_exec $build_conf_generator $REPO $sm_build_file
        cd ../contrail-web-server-manager/
        $node_exec $rjs_bin -o $sm_build_file
        cd -
        echo "DONE"
    fi

    if [ $REPO = 'webStorage' ] ; then
        echo    "*******************************************"
        echo    "*     Building Web Storage Repo           *"
        echo -e "*******************************************\n"

        $node_exec $build_conf_generator $REPO $storage_build_file
        cd ../contrail-web-storage/
        $node_exec $rjs_bin -o $storage_build_file
        cd -
        echo "DONE"
    fi
done
