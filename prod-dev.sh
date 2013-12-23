#
# Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
#
# This script is used to switch between production and dev environment
#
#!/bin/sh

tmpFile=$1.test
#UnSet env as $33
sed -e 's/<!-- Start '$3' -->/<!-- Start '$3'/g' $1 > $tmpFile
sed -e 's/<!-- End '$3' -->/End '$3' -->/g' $tmpFile > $1

#Set env as $3
sed -e 's/<!-- Start '$2' -->/<!-- Start '$2'/g' $1 > $tmpFile
sed -e 's/<!-- Start '$2'/<!-- Start '$2' -->/g' $tmpFile > $1
sed -e 's/<!-- End '$2' -->/End '$2'/g' $1 > $tmpFile
sed -e 's/End '$2' -->/End '$2'/g' $tmpFile > $1
sed -e 's/End '$2'/<!-- End '$2' -->/g' $1 > $tmpFile
ctDate=$(date +%s)
if [ $4 = true ] ; then 
    sed -e 's/built_at=""/built_at=/g' $tmpFile > $1
    sed -e s/built_at=[0-9]*/built_at=$ctDate/g $1 > $tmpFile
else 
    sed -e s/built_at=[0-9]*/built_at='""'/g $tmpFile > $1
    sed -e s/built_at='"""'/built_at='"'/g $1 > $tmpFile
fi
mv $tmpFile $1

