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
$node_exec src/tools/parsePackage.js "$@"
$node_exec src/tools/configTemplateGenerator.js

