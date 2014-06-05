#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

#!/bin/bash

if [ !$NODE_LAUNCH_SCRIPT ]; then
  export NODE_LAUNCH_SCRIPT="webServerStart.js"
fi

forever stop $NODE_LAUNCH_SCRIPT
