#!/usr/bin/env bash

#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

THIRD_PARTY='../third_party'

#Start - Copy d3/vnd3 files from $THIRD_PARTY
rm -rf webroot/assets/d3
mkdir -p webroot/assets/d3/js
cp -af ./$THIRD_PARTY/d3/d3.js webroot/assets/d3/js/

rm -rf webroot/assets/crossfilter
mkdir -p webroot/assets/crossfilter/js
cp -af ./$THIRD_PARTY/crossfilter/crossfilter.min.js webroot/assets/crossfilter/js/

rm -rf webroot/assets/xdate
mkdir -p webroot/assets/xdate/js
cp -af ./$THIRD_PARTY/xdate.js webroot/assets/xdate/js/

rm -rf webroot/assets/jsonpath
mkdir -p webroot/assets/jsonpath/js
cp -af ./$THIRD_PARTY/jsonpath-0.8.0.js  webroot/assets/jsonpath/js/jsonpath-0.8.0.js

rm -rf webroot/assets/nvd3
mkdir -p webroot/assets/nvd3/js
mkdir -p webroot/assets/nvd3/css
cp -af ./$THIRD_PARTY/nvd3/nv.d3.js webroot/assets/nvd3/js/
cp -af ./$THIRD_PARTY/nvd3/lib/fisheye.js webroot/assets/nvd3/js/fisheye.js
cp -af ./$THIRD_PARTY/nvd3/src/nv.d3.css webroot/assets/nvd3/css/
#End - Copy d3/nvd3 files from $THIRD_PARTY

#Start - Copy JQuery files from $THIRD_PARTY
rm -rf webroot/assets/jquery
mkdir -p webroot/assets/jquery/js
cp -af ./$THIRD_PARTY/jquery.xml2json.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.ui.touch-punch.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.ba-bbq.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.timer.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.json-2.4.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.dataTables.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-1.8.3.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-1.9.1.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-validation-v1.11.1/jquery.validate.js webroot/assets/jquery/js/
#End - Copy JQuery files from $THIRD_PARTY

#Start - Copy jquery-ui files from $THIRD_PARTY
rm -rf webroot/assets/jquery-ui
mkdir -p webroot/assets/jquery-ui/js
mkdir -p webroot/assets/jquery-ui/css
cp -af ./$THIRD_PARTY/jquery-ui-1.10.4/ui/jquery-ui.js webroot/assets/jquery-ui/js/jquery-ui.js
cp -af ./$THIRD_PARTY/jquery-ui-1.10.4/themes/base/jquery-ui.css webroot/assets/jquery-ui/css/jquery-ui.css
cp -r ./$THIRD_PARTY/jquery-ui-1.10.4/themes/base/images webroot/assets/jquery-ui/css/
#End - Copy jquery-ui files from $THIRD_PARTY

#Start - Copy Bootstrap from $THIRD_PARTY
rm -rf webroot/assets/bootstrap
mkdir -p webroot/assets/bootstrap
cp -r ./$THIRD_PARTY/bootstrap-v2.3.2/js webroot/assets/bootstrap/js
cp -r ./$THIRD_PARTY/bootstrap-v2.3.2/css webroot/assets/bootstrap/css
#End - Copy Bootstrap from $THIRD_PARTY

#Start - Copy Font-Awesome from $THIRD_PARTY
rm -rf webroot/assets/font-awesome
mkdir -p webroot/assets/font-awesome
cp -r ./$THIRD_PARTY/font-awesome-v3.2.1/font webroot/assets/font-awesome/font
cp -r ./$THIRD_PARTY/font-awesome-v3.2.1/css webroot/assets/font-awesome/css

rm -rf webroot/font
cp -r ./$THIRD_PARTY/font-awesome-v3.2.1/font webroot/font
#End - Copy Font-Awesome from $THIRD_PARTY

#Start - Copy Font-Opensans from $THIRD_PARTY
rm -rf webroot/assets/fonts-opensans
mkdir -p webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff webroot/assets/fonts-opensans/
cp -af ./$THIRD_PARTY/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff webroot/assets/fonts-opensans/
cp -af ./$THIRD_PARTY/openSans.css webroot/assets/fonts-opensans/

rm -f webroot/css/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff
rm -f webroot/css/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff
cp -af  ./$THIRD_PARTY/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff  webroot/css/
cp -af ./$THIRD_PARTY/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff webroot/css/

#End - Copy Font-Opensans from $THIRD_PARTY

#Start - Copy Handlebars from $THIRD_PARTY
rm -rf webroot/assets/handlebars
mkdir -p webroot/assets/handlebars
cp -r ./$THIRD_PARTY/handlebars-v1.3.0.js webroot/assets/handlebars/handlebars-v1.3.0.js
#End - Copy Handlebars from $THIRD_PARTY

#Start - Copy Select2 from $THIRD_PARTY
rm -rf webroot/assets/select2
mkdir -p webroot/assets/select2/js
mkdir -p webroot/assets/select2/styles
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2.min.js webroot/assets/select2/js/select2.min.js
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2.css webroot/assets/select2/styles/select2.css
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2-bootstrap.css webroot/assets/select2/styles/select2-bootstrap.css
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2.png webroot/css/select2.png
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2x2.png webroot/css/select2x2.png
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2-spinner.gif webroot/css/select2-spinner.gif
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2.png webroot/assets/select2/styles/select2.png
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2x2.png webroot/assets/select2/styles/select2x2.png
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2-spinner.gif webroot/assets/select2/styles/select2-spinner.gif
#End - Copy Select2 from $THIRD_PARTY

#Start - Copy 2way-Multiselect from $THIRD_PARTY
rm -rf webroot/assets/2way-multiselect
mkdir -p webroot/assets/2way-multiselect/js
cp -af ./$THIRD_PARTY/multiselect-v1.0/js/multiselect.js webroot/assets/2way-multiselect/js/multiselect.js
#End - Copy 2way-Multiselect from $THIRD_PARTY

#Start - Copy Slickgrid from $THIRD_PARTY
rm -rf webroot/assets/slickgrid
mkdir -p webroot/assets/slickgrid/js
mkdir -p webroot/assets/slickgrid/styles
cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.core.js webroot/assets/slickgrid/js/slick.core.js
cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.grid.js webroot/assets/slickgrid/js/slick.grid.js
cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.dataview.js webroot/assets/slickgrid/js/slick.dataview.js
cp -af ./$THIRD_PARTY/jnpr_slickgrid/lib/jquery.event.drag-2.2.js webroot/assets/slickgrid/js/jquery.event.drag-2.2.js

cp -af ./$THIRD_PARTY/slickgrid.enhancement.pager/slick.enhancementpager.js webroot/assets/slickgrid/js/slick.enhancementpager.js
cp -af ./$THIRD_PARTY/slickgrid.enhancement.pager/libs/jquery.json-2.3.min.js webroot/assets/slickgrid/js/jquery.json-2.3.min.js
cp -af ./$THIRD_PARTY/slickgrid.enhancement.pager/libs/jquery.dropkick-1.0.0.js webroot/assets/slickgrid/js/jquery.dropkick-1.0.0.js

cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.grid.css webroot/assets/slickgrid/styles/slick.grid.css
#End - Copy Slickgrid from $THIRD_PARTY

#Start - Cooy Datetimepicker from $THIRD_PARTY
rm -rf webroot/assets/datetimepicker
mkdir -p webroot/assets/datetimepicker/js
mkdir -p webroot/assets/datetimepicker/styles
cp -af ./$THIRD_PARTY/datetimepicker-v2.1.9/jquery.datetimepicker.js webroot/assets/datetimepicker/js/jquery.datetimepicker.js
cp -af ./$THIRD_PARTY/datetimepicker-v2.1.9/jquery.datetimepicker.css webroot/assets/datetimepicker/styles/jquery.datetimepicker.css
#End - Cooy Datetimepicker from $THIRD_PARTY

#Start - Copy Knockout from $THIRD_PARTY
rm -rf webroot/assets/knockout
mkdir -p webroot/assets/knockout
cp -af ./$THIRD_PARTY/knockout-3.0.0.js webroot/assets/knockout/knockout-3.0.0.js
#End - Copy Knockout from $THIRD_PARTY

#Start - Copy Moment Date-Formatter from $THIRD_PARTY
rm -rf webroot/assets/moment
mkdir -p webroot/assets/moment
cp -af ./$THIRD_PARTY/moment-v2.6.0/moment.js webroot/assets/moment/moment.js
#End - Copy Moment Date-Formatter from $THIRD_PARTY

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
MAINFILE[4]=webroot/assets/jquery/js/jquery.ui.touch-punch.min.js
MAINFILE[5]=webroot/assets/jquery-ui/js/jquery-ui.js
MAINFILE[6]=webroot/assets/bootstrap/js/bootstrap.min.js

MAINFILE[7]=webroot/assets/d3/js/d3.js
MAINFILE[8]=webroot/assets/nvd3/js/nv.d3.js

MAINFILE[9]=webroot/assets/crossfilter/js/crossfilter.min.js
MAINFILE[10]=webroot/assets/jsonpath/js/jsonpath-0.8.0.js
MAINFILE[11]=webroot/assets/xdate/js/xdate.js
MAINFILE[12]=webroot/assets/jquery/js/jquery.validate.js
MAINFILE[13]=webroot/assets/handlebars/handlebars-v1.3.0.js
MAINFILE[14]=webroot/assets/knockout/knockout-3.0.0.js
MAINFILE[15]=webroot/assets/select2/js/select2.min.js

MAINFILE[16]=webroot/assets/slickgrid/js/jquery.event.drag-2.2.js
MAINFILE[17]=webroot/assets/slickgrid/js/jquery.json-2.3.min.js
MAINFILE[18]=webroot/assets/slickgrid/js/jquery.dropkick-1.0.0.js
MAINFILE[19]=webroot/assets/slickgrid/js/slick.core.js
MAINFILE[20]=webroot/assets/slickgrid/js/slick.grid.js
MAINFILE[21]=webroot/assets/slickgrid/js/slick.dataview.js
MAINFILE[22]=webroot/assets/slickgrid/js/slick.enhancementpager.js
MAINFILE[23]=webroot/assets/datetimepicker/js/jquery.datetimepicker.js
MAINFILE[24]=webroot/assets/moment/moment.js
MAINFILE[25]=webroot/assets/2way-multiselect/js/multiselect.js

MAINFILE[26]=webroot/js/contrail-common.js
MAINFILE[27]=webroot/js/handlebars-utils.js
MAINFILE[28]=webroot/js/select2-utils.js
MAINFILE[29]=webroot/js/slickgrid-utils.js
MAINFILE[30]=webroot/js/contrail-elements.js
MAINFILE[31]=webroot/js/topology_api.js
MAINFILE[32]=webroot/js/web-utils.js
MAINFILE[33]=webroot/js/contrail-layout.js
MAINFILE[34]=webroot/js/config_global.js
MAINFILE[35]=webroot/js/protocol.js
MAINFILE[36]=webroot/js/qe-utils.js
MAINFILE[37]=webroot/js/nvd3-plugin.js
MAINFILE[38]=webroot/js/d3-utils.js
MAINFILE[39]=webroot/js/analyzer-utils.js
MAINFILE[40]=webroot/js/chart-utils.js

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
cat ${MAINFILE[10]} >> webroot/js/contrail-all-3.js
cat ${MAINFILE[11]} >> webroot/js/contrail-all-3.js
cat ${MAINFILE[12]} >> webroot/js/contrail-all-3.js
cat ${MAINFILE[13]} >> webroot/js/contrail-all-3.js
cat ${MAINFILE[14]} >> webroot/js/contrail-all-3.js
cat ${MAINFILE[15]} >> webroot/js/contrail-all-3.js

cat ${MAINFILE[16]} > webroot/js/contrail-all-4.js
cat ${MAINFILE[17]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[18]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[19]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[20]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[21]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[22]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[23]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[24]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[25]} >> webroot/js/contrail-all-4.js

cat ${MAINFILE[26]} > webroot/js/contrail-all-5.js
cat ${MAINFILE[27]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[28]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[29]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[30]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[31]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[40]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[32]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[33]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[34]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[35]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[36]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[37]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[38]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[39]} >> webroot/js/contrail-all-5.js

# End - Merging All JS files

#Start - Merging All CSS files
rm -f webroot/css/contrail-all.css

MAINCSS[1]=webroot/assets/font-awesome/css/font-awesome.min.css
MAINCSS[2]=webroot/assets/fonts-opensans/openSans.css
MAINCSS[3]=webroot/assets/nvd3/css/nv.d3.css
MAINCSS[4]=webroot/assets/select2/styles/select2.css
MAINCSS[5]=webroot/assets/datetimepicker/styles/jquery.datetimepicker.css
MAINCSS[6]=webroot/assets/slickgrid/styles/slick.grid.css

cat ${MAINCSS[1]} > webroot/css/contrail-all.css
cat ${MAINCSS[2]} >> webroot/css/contrail-all.css
cat ${MAINCSS[3]} >> webroot/css/contrail-all.css
cat ${MAINCSS[4]} >> webroot/css/contrail-all.css
cat ${MAINCSS[5]} >> webroot/css/contrail-all.css
cat ${MAINCSS[6]} >> webroot/css/contrail-all.css
#End - Merging ALL CSS files
