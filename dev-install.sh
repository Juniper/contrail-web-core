#!/usr/bin/env bash

#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

THIRD_PARTY='../contrail-webui-third-party'

#Start - copy javascript-ipv6 node module files for IPv4/v6 address manipulations/validations
rm -rf webroot/assets/ip
mkdir -p webroot/assets/ip
cp -af node_modules/ipv6/lib/browser/jsbn-combined.js webroot/assets/ip/
cp -af node_modules/ipv6/lib/browser/sprintf.js webroot/assets/ip/
cp -af node_modules/ipv6/ipv6.js webroot/assets/ip/
#End - copy javascript-ipv6 node module files for IPv4/v6 address manipulations/validations

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
mkdir -p webroot/assets/jquery/css
cp -af ./$THIRD_PARTY/jquery.xml2json.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.ui.touch-punch.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.ba-bbq.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.timer.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.json-2.4.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.dataTables.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-1.8.3.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-1.9.1.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-validation-v1.11.1/jquery.validate.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-steps-1.1.0/build/jquery.steps.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-steps-1.1.0/demo/css/jquery.steps.css webroot/assets/jquery/css/
cp -af ./$THIRD_PARTY/jquery-validation-v1.11.1/jquery.validate.js webroot/assets/jquery/js/jquery.validate.js
cp -af ./$THIRD_PARTY/jquery.panzoom-v2.0.5/dist/jquery.panzoom.min.js webroot/assets/jquery/js/jquery.panzoom.min.js
cp -af ./$THIRD_PARTY/tristate/jquery.tristate.js webroot/assets/jquery/js/jquery.tristate.js
#End - Copy JQuery files from web-third-party

#End - Copy JQuery files from $THIRD_PARTY

#Start - Copy jquery-ui files from $THIRD_PARTY
rm -rf webroot/assets/jquery-ui
mkdir -p webroot/assets/jquery-ui/js
mkdir -p webroot/assets/jquery-ui/css
cp -af ./$THIRD_PARTY/jquery-ui-1.10.4/ui/jquery-ui.js webroot/assets/jquery-ui/js/jquery-ui.js
cp -af ./$THIRD_PARTY/jquery-ui-1.10.4/themes/base/jquery-ui.css webroot/assets/jquery-ui/css/jquery-ui.css
cp -af ./$THIRD_PARTY/jquery-ui-1.10.4/themes/base/images webroot/assets/jquery-ui/css/
#End - Copy jquery-ui files from $THIRD_PARTY

#Start - Copy jquery-ui-multiselect files from $THIRD_PARTY
cp -af ./$THIRD_PARTY/jquery-ui-multiselect-widget-1.13/src/jquery.multiselect.js webroot/assets/jquery-ui/js/jquery.multiselect.js
cp -af ./$THIRD_PARTY/jquery-ui-multiselect-widget-1.13/src/jquery.multiselect.filter.js webroot/assets/jquery-ui/js/jquery.multiselect.filter.js
#End - Copy jquery-ui-multiselect files from $THIRD_PARTY

#Start - Copy Bootstrap from $THIRD_PARTY
rm -rf webroot/assets/bootstrap
mkdir webroot/assets/bootstrap
cp -r ./$THIRD_PARTY/bootstrap-v2.3.2/js webroot/assets/bootstrap/js
cp -r ./$THIRD_PARTY/bootstrap-v2.3.2/css webroot/assets/bootstrap/css
#End - Copy Bootstrap from $THIRD_PARTY

#Start - Copy Font-Awesome from $THIRD_PARTY
rm -rf webroot/assets/font-awesome
mkdir webroot/assets/font-awesome
cp -r ./$THIRD_PARTY/font-awesome-v3.2.1/font webroot/assets/font-awesome/font
cp -r ./$THIRD_PARTY/font-awesome-v3.2.1/css webroot/assets/font-awesome/css

rm -rf webroot/font
cp -r ./$THIRD_PARTY/font-awesome-v3.2.1/font webroot/font
#End - Copy Font-Awesome from $THIRD_PARTY

#Start - Copy Font-Opensans from $THIRD_PARTY
rm -rf webroot/assets/fonts-opensans
mkdir -p webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/MTP_ySUJH_bn48VBG8sNSqRDOzjiPcYnFooOUGCOsRk.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/k3k702ZOKiLJc3WVjuplzKRDOzjiPcYnFooOUGCOsRk.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/EInbV5DfGHOiMmvb1Xr-hqRDOzjiPcYnFooOUGCOsRk.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/PRmiXeptR36kaC0GEAetxvR_54zmj3SbGZQh3vCOwvY.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/xjAJXh38I15wypJXxuGMBrrIa-7acMAeDBVuclsi6Gc.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/PRmiXeptR36kaC0GEAetxuw_rQOTGi-AJs5XCWaKIhU.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/PRmiXeptR36kaC0GEAetxhbnBKKEOwRKgsHDreGcocg.woff webroot/assets/fonts-opensans
cp -af ./$THIRD_PARTY/PRmiXeptR36kaC0GEAetxsBo4hlZyBvkZICS3KpNonM.woff webroot/assets/fonts-opensans

#End - Copy Font-Opensans from $THIRD_PARTY

#Start - Copy Handlebars from $THIRD_PARTY
rm -rf webroot/assets/handlebars
mkdir -p webroot/assets/handlebars
cp -af ./$THIRD_PARTY/handlebars-v1.3.0.js webroot/assets/handlebars/handlebars-v1.3.0.js
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

#Start - Copy Slickgrid from $THIRD_PARTY
rm -rf webroot/assets/slickgrid
mkdir -p webroot/assets/slickgrid/js
mkdir -p webroot/assets/slickgrid/styles
cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.core.js webroot/assets/slickgrid/js/slick.core.js
cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.grid.js webroot/assets/slickgrid/js/slick.grid.js
cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.dataview.js webroot/assets/slickgrid/js/slick.dataview.js
cp -af ./$THIRD_PARTY/jnpr_slickgrid/plugins/slick.checkboxselectcolumn.js webroot/assets/slickgrid/js/slick.checkboxselectcolumn.js
cp -af ./$THIRD_PARTY/jnpr_slickgrid/plugins/slick.rowselectionmodel.js webroot/assets/slickgrid/js/slick.rowselectionmodel.js
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
mkdir webroot/assets/knockout
cp -af ./$THIRD_PARTY/knockout-3.0.0.js webroot/assets/knockout/knockout-3.0.0.js
#End - Copy Knockout from $THIRD_PARTY

#Start - Copy Moment Date-Formatter from $THIRD_PARTY
rm -rf webroot/assets/moment
mkdir webroot/assets/moment
cp -af ./$THIRD_PARTY/moment-v2.6.0/moment.js webroot/assets/moment/moment.js
#End - Copy Moment Date-Formatter from $THIRD_PARTY

#Start - Copy Joint from web-third-party
rm -rf webroot/assets/joint
mkdir -p webroot/assets/joint/js
mkdir -p webroot/assets/joint/css
cp -r ./$THIRD_PARTY/joint-v0.9.2/dist/joint.nojquery.js webroot/assets/joint/js/
cp -r ./$THIRD_PARTY/joint-v0.9.2/dist/joint.layout.DirectedGraph.js webroot/assets/joint/js/
cp -r ./$THIRD_PARTY/joint-v0.9.2/dist/joint.nojquery.css webroot/assets/joint/css/
#End - Copy Joint from web-third-party

#Start - Copy jquery-contextMenu from web-third-party
rm -rf webroot/assets/jquery-contextMenu
mkdir -p webroot/assets/jquery-contextMenu/js
mkdir -p webroot/assets/jquery-contextMenu/css
cp -r ./$THIRD_PARTY/jquery-contextMenu-v1.6.5/src/jquery.contextMenu.js webroot/assets/jquery-contextMenu/js/
cp -r ./$THIRD_PARTY/jquery-contextMenu-v1.6.5/src/jquery.ui.position.js webroot/assets/jquery-contextMenu/js/
cp -r ./$THIRD_PARTY/jquery-contextMenu-v1.6.5/src/jquery.contextMenu.css webroot/assets/jquery-contextMenu/css
#End - Copy jquery-contextMenu from web-third-party

#Start - Copy Backbone from $THIRD_PARTY
rm -rf webroot/assets/backbone
mkdir webroot/assets/backbone
cp -af ./$THIRD_PARTY/backbone-min.js webroot/assets/backbone/backbone-min.js
cp -af ./$THIRD_PARTY/backbone-min.map webroot/assets/backbone/backbone-min.map
cp -af ./$THIRD_PARTY/knockback.min.js webroot/assets/backbone/knockback.min.js
cp -af ./$THIRD_PARTY/backbone-validation-amd.js webroot/assets/backbone/backbone-validation-amd.js
#End - Copy Backbone from $THIRD_PARTY

#Start - Copy Requirejs & Textjs from $THIRD_PARTY
rm -rf webroot/assets/requirejs
mkdir webroot/assets/requirejs
#cp -af ./$THIRD_PARTY/require.min.js webroot/assets/requirejs/require.min.js
#cp -af ./$THIRD_PARTY/text.js webroot/assets/requirejs/text.js
cp -af ./$THIRD_PARTY/requirejs-v1.0.2/require.js webroot/assets/requirejs/require.js
cp -af ./$THIRD_PARTY/text.js webroot/assets/requirejs/text.js
#End - Copy Requirejs & Textjs  from $THIRD_PARTY

#Start - Copy Underscore from $THIRD_PARTY
rm -rf webroot/assets/underscore
mkdir webroot/assets/underscore
cp -af ./$THIRD_PARTY/underscore-min.js webroot/assets/underscore/underscore-min.js
cp -af ./$THIRD_PARTY/underscore-min.map webroot/assets/underscore/underscore-min.map
#End - Copy Underscore from $THIRD_PARTY

#Start - Merging All JS files
rm -f webroot/js/contrail-all-1.js
rm -f webroot/js/contrail-all-2.js
rm -f webroot/js/contrail-all-3.js
rm -f webroot/js/contrail-all-4.js
rm -f webroot/js/contrail-all-5.js
rm -f webroot/js/contrail-all-6.js
rm -f webroot/js/contrail-all-7.js

MAINFILE[0]=webroot/assets/jquery/js/jquery-1.8.3.min.js
MAINFILE[1]=webroot/assets/jquery/js/jquery.xml2json.js
MAINFILE[2]=webroot/assets/jquery/js/jquery.ba-bbq.min.js
MAINFILE[3]=webroot/assets/jquery/js/jquery.timer.js
MAINFILE[4]=webroot/assets/jquery-ui/js/jquery-ui.js
MAINFILE[5]=webroot/assets/jquery/js/jquery.ui.touch-punch.min.js
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
MAINFILE[22]=webroot/assets/slickgrid/js/slick.rowselectionmodel.js
MAINFILE[23]=webroot/assets/slickgrid/js/slick.checkboxselectcolumn.js
MAINFILE[24]=webroot/assets/slickgrid/js/slick.enhancementpager.js
MAINFILE[25]=webroot/assets/datetimepicker/js/jquery.datetimepicker.js
MAINFILE[26]=webroot/assets/moment/moment.js
MAINFILE[27]=webroot/assets/jquery/js/jquery.tristate.js

MAINFILE[28]=webroot/assets/ip/jsbn-combined.js
MAINFILE[29]=webroot/assets/ip/sprintf.js
MAINFILE[30]=webroot/assets/ip/ipv6.js

MAINFILE[31]=webroot/js/contrail-common.js
MAINFILE[32]=webroot/js/handlebars-utils.js
MAINFILE[33]=webroot/js/select2-utils.js
MAINFILE[34]=webroot/js/slickgrid-utils.js
MAINFILE[35]=webroot/js/contrail-elements.js
MAINFILE[36]=webroot/js/topology_api.js
MAINFILE[37]=webroot/js/web-utils.js
MAINFILE[38]=webroot/js/contrail-layout.js
MAINFILE[39]=webroot/js/config_global.js
MAINFILE[40]=webroot/js/protocol.js
MAINFILE[41]=webroot/js/qe-utils.js
MAINFILE[42]=webroot/js/nvd3-plugin.js
MAINFILE[43]=webroot/js/d3-utils.js
MAINFILE[44]=webroot/js/analyzer-utils.js
MAINFILE[45]=webroot/js/chart-utils.js
MAINFILE[46]=webroot/js/dashboard-utils.js

MAINFILE[47]=webroot/assets/jquery-ui/js/jquery.multiselect.js
MAINFILE[48]=webroot/assets/jquery-ui/js/jquery.multiselect.filter.js
MAINFILE[49]=webroot/assets/requirejs/require.js
MAINFILE[50]=webroot/assets/jquery/js/jquery.steps.min.js

MAINFILE[51]=webroot/assets/joint/js/joint.nojquery.js
MAINFILE[52]=webroot/assets/joint/js/joint.layout.DirectedGraph.js
MAINFILE[53]=webroot/js/joint.contrail.js
MAINFILE[54]=webroot/assets/jquery/js/jquery.panzoom.min.js
MAINFILE[55]=webroot/assets/jquery-contextMenu/js/jquery.ui.position.js
MAINFILE[56]=webroot/assets/jquery-contextMenu/js/jquery.contextMenu.js

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
cat ${MAINFILE[26]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[27]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[28]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[29]} >> webroot/js/contrail-all-4.js
cat ${MAINFILE[30]} >> webroot/js/contrail-all-4.js

cat ${MAINFILE[31]} > webroot/js/contrail-all-5.js
cat ${MAINFILE[32]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[33]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[34]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[35]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[36]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[45]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[37]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[38]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[39]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[40]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[41]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[42]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[43]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[44]} >> webroot/js/contrail-all-5.js
cat ${MAINFILE[46]} >> webroot/js/contrail-all-5.js

cat ${MAINFILE[47]} > webroot/js/contrail-all-6.js
cat ${MAINFILE[48]} >> webroot/js/contrail-all-6.js
cat ${MAINFILE[49]} >> webroot/js/contrail-all-6.js
cat ${MAINFILE[50]} >> webroot/js/contrail-all-6.js

cat ${MAINFILE[51]} > webroot/js/contrail-all-7.js
cat ${MAINFILE[52]} >> webroot/js/contrail-all-7.js
cat ${MAINFILE[53]} >> webroot/js/contrail-all-7.js
cat ${MAINFILE[54]} >> webroot/js/contrail-all-7.js
cat ${MAINFILE[55]} >> webroot/js/contrail-all-7.js
cat ${MAINFILE[56]} >> webroot/js/contrail-all-7.js

# End - Merging All JS files

#Start - Merging All CSS files
rm -f webroot/css/contrail-all.css

MAINCSS[1]=webroot/assets/font-awesome/css/font-awesome.min.css
MAINCSS[2]=webroot/assets/nvd3/css/nv.d3.css
MAINCSS[3]=webroot/assets/select2/styles/select2.css
MAINCSS[4]=webroot/assets/datetimepicker/styles/jquery.datetimepicker.css
MAINCSS[5]=webroot/assets/slickgrid/styles/slick.grid.css
MAINCSS[6]=webroot/assets/jquery/css/jquery.steps.css

MAINCSS[7]=webroot/assets/joint/css/joint.nojquery.css
MAINCSS[8]=webroot/assets/jquery-contextMenu/css/jquery.contextMenu.css
MAINCSS[9]=webroot/css/contrail.font.css

cat ${MAINCSS[1]} > webroot/css/contrail-all.css
cat ${MAINCSS[2]} >> webroot/css/contrail-all.css
cat ${MAINCSS[3]} >> webroot/css/contrail-all.css
cat ${MAINCSS[4]} >> webroot/css/contrail-all.css
cat ${MAINCSS[5]} >> webroot/css/contrail-all.css
cat ${MAINCSS[6]} >> webroot/css/contrail-all.css

cat ${MAINCSS[7]} >> webroot/css/contrail-all.css
cat ${MAINCSS[8]} >> webroot/css/contrail-all.css
cat ${MAINCSS[9]} >> webroot/css/contrail-all.css
#End - Merging ALL CSS files
