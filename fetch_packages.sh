#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

THIRD_PARTY='../third_party'

rm -rf node_modules
mkdir -p node_modules
if [ $1 = 'dev' ] ; then 
    cd $THIRD_PARTY/
    python fetch_packages.py
    cd -
    npm install
fi

cp -rf $THIRD_PARTY/node_modules/* node_modules/.

