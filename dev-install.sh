#
# Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
#

#!/bin/bash

#Start - Copy kendoUI from contrail-web-third-party

rm -rf webroot/assets/kendoui
mkdir -p webroot/assets/kendoui
cp -r ../contrail-web-third-party/kendoui.complete.2013.1.514.commercial/js webroot/assets/kendoui/
cp -r ../contrail-web-third-party/kendoui.complete.2013.1.514.commercial/styles webroot/assets/kendoui/

#End - Copy KendoUI from contrail-web-third-party

#Start - Copy d3/vnd3 files from contrail-web-third-party

rm -rf webroot/assets/d3
mkdir -p webroot/assets/d3/js
cp -r ../contrail-web-third-party/d3/d3.js webroot/assets/d3/js/

rm -rf webroot/assets/crossfilter
mkdir -p webroot/assets/crossfilter/js
cp -r ../contrail-web-third-party/crossfilter/crossfilter.min.js webroot/assets/crossfilter/js/

rm -rf webroot/assets/nvd3
mkdir -p webroot/assets/nvd3/js
mkdir -p webroot/assets/nvd3/css
cp -r ../contrail-web-third-party/nvd3/nv.d3.js webroot/assets/nvd3/js/
cp -r ../contrail-web-third-party/nvd3/lib/fisheye.js webroot/assets/nvd3/js/fisheye.js
cp -r ../contrail-web-third-party/nvd3/src/nv.d3.css webroot/assets/nvd3/css/

#End - Copy d3/nvd3 files from contrail-web-third-party

#Start - Copy JQuery files from contrail-web-third-party

rm -rf webroot/assets/jquery
mkdir -p webroot/assets/jquery
cp -r ../contrail-web-third-party/jquery webroot/assets/jquery/js
cp -r ../contrail-web-third-party/jquery-ui-1.10.3/js/jquery-ui-1.10.3.custom.min.js webroot/assets/jquery/js/

#End - Copy JQuery files from contrail-web-third-party

#Start - Copy Bootstrap from contrail-web-third-party

rm -rf webroot/assets/bootstrap
mkdir webroot/assets/bootstrap
cp -r ../contrail-web-third-party/bootstrap-v2.3.2/js webroot/assets/bootstrap/js
cp -r ../contrail-web-third-party/bootstrap-v2.3.2/css webroot/assets/bootstrap/css

#End - Copy Bootstrap from contrail-web-third-party

#Start - Copy Font-Awesome from contrail-web-third-party

rm -rf webroot/assets/font-awesome
mkdir webroot/assets/font-awesome
cp -r ../contrail-web-third-party/font-awesome-v3.2.1/font webroot/assets/font-awesome/font
cp -r ../contrail-web-third-party/font-awesome-v3.2.1/css webroot/assets/font-awesome/css

rm -rf webroot/font
cp -r ../contrail-web-third-party/font-awesome-v3.2.1/font webroot/font

#End - Copy Font-Awesome from contrail-web-third-party

#Start - Copy Font-Opensans from contrail-web-third-party

rm -rf webroot/assets/fonts-opensans
mkdir webroot/assets/fonts-opensans
cp -r ../contrail-web-third-party/fonts-opensans webroot/assets/

rm -f webroot/css/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff
cp -r  ../contrail-web-third-party/fonts-opensans/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff  webroot/css/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff

rm -f webroot/css/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff
cp -r  ../contrail-web-third-party/fonts-opensans/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff  webroot/css/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff

#End - Copy Font-Awesome from contrail-web-third-party

#Start - Merging All JS files
rm -f webroot/js/contrail-all-1.js
rm -f webroot/js/contrail-all-2.js
rm -f webroot/js/contrail-all-3.js
rm -f webroot/js/contrail-all-4.js
rm -f webroot/js/contrail-all-5.js


MAINFILE[0]=webroot/assets/jquery/js/jquery-1.8.3.min.js
MAINFILE[1]=webroot/assets/jquery/js/jquery.xml2json.js
MAINFILE[2]=webroot/assets/jquery/js/jquery.ba-bbq.min.js
MAINFILE[3]=webroot/assets/jquery/js/jquery.timer.js
MAINFILE[4]=webroot/assets/jquery/js/jquery-ui-1.10.3.custom.min.js
MAINFILE[5]=webroot/assets/jquery/js/jquery.ui.touch-punch.min.js
MAINFILE[6]=webroot/assets/bootstrap/js/bootstrap.min.js
MAINFILE[7]=webroot/assets/kendoui/js/kendo.web.min.js
MAINFILE[8]=webroot/js/multiselect.js
MAINFILE[9]=webroot/assets/d3/js/d3.js
MAINFILE[10]=webroot/assets/nvd3/js/nv.d3.js
MAINFILE[11]=webroot/assets/crossfilter/js/crossfilter.min.js
MAINFILE[12]=webroot/js/jsonpath-0.8.0.js
MAINFILE[13]=webroot/js/xdate.js
MAINFILE[14]=webroot/js/kendo-utils.js
MAINFILE[15]=webroot/js/bootstrap-utils.js
MAINFILE[16]=webroot/js/topology_api.js
MAINFILE[17]=webroot/js/web-utils.js
MAINFILE[18]=webroot/js/contrail-layout.js
MAINFILE[19]=webroot/js/config_global.js
MAINFILE[20]=webroot/js/protocol.js
MAINFILE[21]=webroot/js/qe-utils.js
MAINFILE[22]=webroot/js/nvd3-plugin.js
MAINFILE[23]=webroot/js/d3-utils.js
MAINFILE[24]=webroot/js/analyzer-utils.js
MAINFILE[25]=webroot/js/qtip.js
MAINFILE[26]=webroot/js/cytoscape.min.js

cat ${MAINFILE[0]} > webroot/js/contrail-all-1.js
cat ${MAINFILE[1]} >> webroot/js/contrail-all-1.js
cat ${MAINFILE[2]} >> webroot/js/contrail-all-1.js 
cat ${MAINFILE[3]} >> webroot/js/contrail-all-1.js 
cat ${MAINFILE[4]} >> webroot/js/contrail-all-1.js 
cat ${MAINFILE[5]} >> webroot/js/contrail-all-1.js 
cat ${MAINFILE[6]} >> webroot/js/contrail-all-1.js

cat ${MAINFILE[7]} > webroot/js/contrail-all-2.js
cat ${MAINFILE[8]} >> webroot/js/contrail-all-2.js

cat ${MAINFILE[9]} > webroot/js/contrail-all-3.js

cat ${MAINFILE[10]} > webroot/js/contrail-all-4.js 
cat ${MAINFILE[11]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[12]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[13]} >> webroot/js/contrail-all-4.js

cat ${MAINFILE[14]} > webroot/js/contrail-all-5.js
cat ${MAINFILE[15]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[16]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[17]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[18]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[19]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[20]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[21]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[22]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[23]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[24]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[25]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[26]} >> webroot/js/contrail-all-5.js


# End - Merging All JS files

#Start - Merging All CSS files 
rm -f webroot/css/contrail-all.css

MAINCSS[1]=webroot/assets/font-awesome/css/font-awesome.min.css
MAINCSS[2]=webroot/assets/fonts-opensans/openSans.css
MAINCSS[3]=webroot/assets/kendoui/styles/kendo.common.min.css
MAINCSS[4]=webroot/css/kendo.contrail.css
MAINCSS[5]=webroot/css/nv.d3.contrail.css
MAINCSS[6]=webroot/css/vncon-web.css

cat ${MAINCSS[1]} > webroot/css/contrail-all.css 
cat ${MAINCSS[2]} >> webroot/css/contrail-all.css
cat ${MAINCSS[3]} >> webroot/css/contrail-all.css
cat ${MAINCSS[4]} >> webroot/css/contrail-all.css
cat ${MAINCSS[5]} >> webroot/css/contrail-all.css
cat ${MAINCSS[6]} >> webroot/css/contrail-all.css

#End - Merging ALL CSS files

