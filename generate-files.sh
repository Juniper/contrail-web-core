#
# Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
#

#!/bin/bash

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
