#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

THIRD_PARTY='../third_party'
WEB_THIRD_PARTY='./web_third_party'
TMP_CACHE='/tmp/cache'

rm -rf node_modules
mkdir -p node_modules
if [ $1 = 'dev' ] ; then 
    mkdir -p $THIRD_PARTY
    cd $THIRD_PARTY/
    python fetch_packages.py
    cd -
    npm install
fi

cp -rf $THIRD_PARTY/node_modules/* node_modules/.
rm -rf $WEB_THIRD_PARTY
mkdir -p $WEB_THIRD_PARTY

mkdir -p $WEB_THIRD_PARTY/xdate/js
cp -af $THIRD_PARTY/xdate.js $WEB_THIRD_PARTY/xdate/js/

mkdir -p $WEB_THIRD_PARTY/jsonpath/js
cp -af $THIRD_PARTY/jsonpath-0.8.0.js $WEB_THIRD_PARTY/jsonpath/js/

mkdir -p $WEB_THIRD_PARTY/jquery
cp -af $THIRD_PARTY/jquery.xml2json.js $WEB_THIRD_PARTY/jquery/
cp -af $THIRD_PARTY/jquery.ui.touch-punch.min.js $WEB_THIRD_PARTY/jquery/
cp -af $THIRD_PARTY/jquery.ba-bbq.min.js $WEB_THIRD_PARTY/jquery/
cp -af $THIRD_PARTY/jquery.timer.js $WEB_THIRD_PARTY/jquery/
cp -af $THIRD_PARTY/jquery.json-2.4.min.js $WEB_THIRD_PARTY/jquery/
cp -af $THIRD_PARTY/jquery.dataTables.min.js $WEB_THIRD_PARTY/jquery/
cp -af $THIRD_PARTY/jquery-1.8.3.min.js $WEB_THIRD_PARTY/jquery/
cp -af $THIRD_PARTY/jquery-1.9.1.min.js $WEB_THIRD_PARTY/jquery/

mkdir -p $WEB_THIRD_PARTY/fonts-opensans
cp -af $THIRD_PARTY/openSans.css $WEB_THIRD_PARTY/fonts-opensans/
cp -af $THIRD_PARTY/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff $WEB_THIRD_PARTY/fonts-opensans/
cp -af $THIRD_PARTY/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff $WEB_THIRD_PARTY/fonts-opensans/

mkdir -p $WEB_THIRD_PARTY/handlebars-v1.3.0
cp -af $THIRD_PARTY/handlebars-v1.3.0.js $WEB_THIRD_PARTY/handlebars-v1.3.0/

mkdir -p $WEB_THIRD_PARTY/knockout-v3.0.0
cp -af $THIRD_PARTY/knockout-3.0.0.js $WEB_THIRD_PARTY/knockout-v3.0.0/

