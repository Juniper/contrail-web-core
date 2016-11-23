#!/usr/bin/env bash
#
#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

if command -v nodejs > /dev/null; then
  node_exec=nodejs;
elif command -v node > /dev/null; then
  node_exec=node
else
  echo "error: Failed dependencies: node/nodejs is needed";
  exit;
fi;
$node_exec src/tools/preParsePackage.js "$@"
$node_exec src/tools/configTemplateGenerator.js

#Generate the json schemas and copy over to the core
if [ -a ../controller/src/schema/all_cfg.xsd ]; then
    ../tools/generateds/generateDS.py -f -g json-schema -o configJsonSchemas ../controller/src/schema/all_cfg.xsd
    test -d src/serverroot/configJsonSchemas || mkdir -p src/serverroot/configJsonSchemas
    cp configJsonSchemas/* src/serverroot/configJsonSchemas;
    echo "Copied json schema files to src/serverroot/configJsonSchemas";
    rm -rf configJsonSchemas;
else
    echo "error: ../controller/src/schema/all_cfg.xsd not found";
    echo "error: json-schema files not generated"
fi;

