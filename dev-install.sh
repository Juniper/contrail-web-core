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

#Start - copy d3-v4.4.3 from node_modules 
rm -rf webroot/assets/d3-v4.4.3
mkdir -p webroot/assets/d3-v4.4.3/js
cp -af node_modules/d3/build/d3.min.js webroot/assets/d3-v4.4.3/js/
#End - copy d3-v4.4.3 from node_modules 

#Start - copy lodash-v4.17.12 from node_modules 
rm -rf webroot/assets/lodash-v4.17.12
mkdir -p webroot/assets/lodash-v4.17.12/js
cp -af node_modules/lodash/lodash.min.js webroot/assets/lodash-v4.17.12/js/
#End - copy lodash-v4.17.12 from node_modules 

#Start - copy contrail-charts from $THIRD_PARTY
rm -rf webroot/assets/contrail-charts
mkdir -p webroot/assets/contrail-charts/js
mkdir -p webroot/assets/contrail-charts/css
cp -af ./$THIRD_PARTY/contrail-charts/js/contrail-charts.js webroot/assets/contrail-charts/js/
cp -af ./$THIRD_PARTY/contrail-charts/css/contrail-charts.css webroot/assets/contrail-charts/css/
#End - copy contrail-charts from $THIRD_PARTY

#Start - copy event drops files from node_module
rm -rf webroot/assets/event-drops
mkdir -p webroot/assets/event-drops/js
mkdir -p webroot/assets/event-drops/css
cp -af ./$THIRD_PARTY/event-drops-v0.3.0/js/eventDrops.js webroot/assets/event-drops/js
cp -af ./$THIRD_PARTY/event-drops-v0.3.0/css/eventDrops.css webroot/assets/event-drops/css
#End - copy  event drops files from node_module

#Start - Copy d3/vnd3 files from $THIRD_PARTY
rm -rf webroot/assets/d3-v3.5.6
mkdir -p webroot/assets/d3-v3.5.6/js
cp -af ./$THIRD_PARTY/d3-v3.5.6/d3.js webroot/assets/d3-v3.5.6/js/

rm -rf webroot/assets/crossfilter
mkdir -p webroot/assets/crossfilter/js
cp -af ./$THIRD_PARTY/crossfilter/crossfilter.js webroot/assets/crossfilter/js/

rm -rf webroot/assets/xdate
mkdir -p webroot/assets/xdate/js
cp -af ./$THIRD_PARTY/xdate.js webroot/assets/xdate/js/

rm -rf webroot/assets/jsonpath
mkdir -p webroot/assets/jsonpath/js
cp -af ./$THIRD_PARTY/jsonpath-0.8.0.js  webroot/assets/jsonpath/js/jsonpath-0.8.0.js

#Start - Copy vis from web-third-party
rm -rf webroot/assets/vis-v4.9.0
mkdir -p webroot/assets/vis-v4.9.0/js
mkdir -p webroot/assets/vis-v4.9.0/css
cp -r ./$THIRD_PARTY/vis-v4.9.0/dist/vis.min.js webroot/assets/vis-v4.9.0/js/
cp -r ./$THIRD_PARTY/vis-v4.9.0/dist/vis.min.css webroot/assets/vis-v4.9.0/css/
cp -r ./$THIRD_PARTY/vis-v4.9.0/dist/img/ webroot/assets/vis-v4.9.0/css/img/
#End - Copy vis from web-third-party

rm -rf webroot/assets/nvd3-v1.8.1
mkdir -p webroot/assets/nvd3-v1.8.1/js
mkdir -p webroot/assets/nvd3-v1.8.1/css
cp -af ./$THIRD_PARTY/nvd3-v1.8.1/build/nv.d3.js webroot/assets/nvd3-v1.8.1/js/
cp -af ./$THIRD_PARTY/nvd3-v1.8.1/build/nv.d3.*css webroot/assets/nvd3-v1.8.1/css/

#End - Copy d3/nvd3 files from $THIRD_PARTY

#Start - Copy JQuery files from $THIRD_PARTY
rm -rf webroot/assets/jquery
mkdir -p webroot/assets/jquery/js
mkdir -p webroot/assets/jquery/css
cp -af ./$THIRD_PARTY/jquery.xml2json.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/x2js-1.2.0/xml2json.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.ui.touch-punch.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.timer.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.json-2.4.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery.dataTables.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-2.2.4/dist/jquery.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-steps-1.1.0/build/jquery.steps.min.js webroot/assets/jquery/js/
cp -af ./$THIRD_PARTY/jquery-steps-1.1.0/demo/css/jquery.steps.css webroot/assets/jquery/css/
cp -af ./$THIRD_PARTY/jquery-validation-v1.15.1/dist/jquery.validate.min.js webroot/assets/jquery/js/jquery.validate.min.js
cp -af ./$THIRD_PARTY/jquery.panzoom-v3.2.1/dist/jquery.panzoom.min.js webroot/assets/jquery/js/jquery.panzoom.min.js
cp -af ./$THIRD_PARTY/tristate/jquery.tristate.js webroot/assets/jquery/js/jquery.tristate.js
#End - Copy JQuery files from web-third-party

#End - Copy JQuery files from $THIRD_PARTY

#Start - Copy jquery-ui files from $THIRD_PARTY
rm -rf webroot/assets/jquery-ui
mkdir -p webroot/assets/jquery-ui/js
mkdir -p webroot/assets/jquery-ui/css
cp -af ./$THIRD_PARTY/jquery-ui-1.11.4/jquery-ui.min.js webroot/assets/jquery-ui/js/jquery-ui.min.js
cp -af ./$THIRD_PARTY/jquery-ui-1.11.4/jquery-ui.js webroot/assets/jquery-ui/js/jquery-ui.js
cp -af ./$THIRD_PARTY/jquery-ui-1.11.4/jquery-ui.min.css webroot/assets/jquery-ui/css/jquery-ui.min.css
cp -af ./$THIRD_PARTY/jquery-ui-1.11.4/images webroot/assets/jquery-ui/css/
#End - Copy jquery-ui files from $THIRD_PARTY

#Start - Copy jquery-ui-multiselect files from $THIRD_PARTY
cp -af ./$THIRD_PARTY/jquery-ui-multiselect-widget-1.15/src/jquery.multiselect.js webroot/assets/jquery-ui/js/jquery.multiselect.js
cp -af ./$THIRD_PARTY/jquery-ui-multiselect-widget-1.15/src/jquery.multiselect.filter.js webroot/assets/jquery-ui/js/jquery.multiselect.filter.js
#End - Copy jquery-ui-multiselect files from $THIRD_PARTY

#Start - Copy gridstack files from $THIRD_PARTY
rm -rf webroot/assets/gridstack
mkdir -p webroot/assets/gridstack/js
mkdir -p webroot/assets/gridstack/css
cp -af ./$THIRD_PARTY/gridstack-v0.2.5/dist/gridstack.js webroot/assets/gridstack/js/gridstack.js
cp -af ./$THIRD_PARTY/gridstack-v0.2.5/dist/gridstack.css webroot/assets/gridstack/css/gridstack.css
cp -af ./$THIRD_PARTY/gridstack-v0.2.5/dist/gridstack-extra.css webroot/assets/gridstack/css/gridstack-extra.css
#End - Copy gridstack files from $THIRD_PARTY

#Start - Copy palette files from $THIRD_PARTY
rm -rf webroot/assets/palette
mkdir -p webroot/assets/palette/js
cp -af ./$THIRD_PARTY/palette.js-master/palette.js webroot/assets/palette/js/palette.js
#End - Copy palette files from $THIRD_PARTY

#Start - Copy toolbar files from $THIRD_PARTY
rm -rf webroot/assets/toolbar
mkdir -p webroot/assets/toolbar/js
mkdir -p webroot/assets/toolbar/css
cp -af ./$THIRD_PARTY/toolbar-v1.0.0/jquery.toolbar.js webroot/assets/toolbar/js/jquery.toolbar.js
cp -af ./$THIRD_PARTY/toolbar-v1.0.0/jquery.toolbar.css webroot/assets/toolbar/css/jquery.toolbar.css
#End - Copy toolbar files from $THIRD_PARTY

#Start - Copy Bootstrap from $THIRD_PART
#rm -rf webroot/assets/bootstrap
#mkdir -p webroot/assets/bootstrap/js
#cp -r ./$THIRD_PARTY/bootstrap-v2.3.2/js/bootstrap.js webroot/assets/bootstrap/js/
#cp -r ./$THIRD_PARTY/bootstrap-v2.3.2/css webroot/assets/bootstrap/css
#End - Copy Bootstrap from $THIRD_PARTY

#Start - Copy Bootstrap3 from $THIRD_PARTY
rm -rf webroot/assets/bootstrap
mkdir -p webroot/assets/bootstrap/js
cp -r ./$THIRD_PARTY/bootstrap-v3.3.6/dist/js/bootstrap.js webroot/assets/bootstrap/js/
cp -r ./$THIRD_PARTY/bootstrap-v3.3.6/dist/css webroot/assets/bootstrap/css
#End - Copy Bootstrap from $THIRD_PARTY

#Start - Copy Font-Awesome from $THIRD_PARTY
rm -rf webroot/assets/font-awesome
rm -rf webroot/common/ui/fonts

mkdir -p webroot/assets/font-awesome
mkdir -p webroot/common/ui/fonts

cp -r ./$THIRD_PARTY/font-awesome-v4.6.3/css webroot/assets/font-awesome/css
cp -r ./$THIRD_PARTY/font-awesome-v4.6.3/fonts webroot/assets/font-awesome/fonts
cp -r ./$THIRD_PARTY/font-awesome-v4.6.3/fonts/* webroot/common/ui/fonts/
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
cp -af ./$THIRD_PARTY/node_modules/handlebars/dist/handlebars.min.js webroot/assets/handlebars/handlebars.min.js
#End - Copy Handlebars from $THIRD_PARTY

#Start - Copy Select2 from $THIRD_PARTY
rm -rf webroot/assets/select2
mkdir -p webroot/assets/select2/js
mkdir -p webroot/assets/select2/styles
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2.min.js webroot/assets/select2/js/select2.min.js
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2.css webroot/assets/select2/styles/select2.css
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2-bootstrap.css webroot/assets/select2/styles/select2-bootstrap.css
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2.png webroot/common/ui/css/select2.png
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2x2.png webroot/common/ui/css/select2x2.png
cp -af ./$THIRD_PARTY/select2-v3.4.6/select2-spinner.gif webroot/common/ui/css/select2-spinner.gif
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
cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.groupitemmetadataprovider.js webroot/assets/slickgrid/js/slick.groupitemmetadataprovider.js

#cp -af ./$THIRD_PARTY/slickgrid.enhancement.pager/slick.enhancementpager.js webroot/assets/slickgrid/js/slick.enhancementpager.js
cp -af ./$THIRD_PARTY/slickgrid.enhancement.pager/libs/jquery.json-2.3.min.js webroot/assets/slickgrid/js/jquery.json-2.3.min.js
#cp -af ./$THIRD_PARTY/slickgrid.enhancement.pager/libs/jquery.dropkick-1.0.0.js webroot/assets/slickgrid/js/jquery.dropkick-1.0.0.js

cp -af ./$THIRD_PARTY/jnpr_slickgrid/slick.grid.css webroot/assets/slickgrid/styles/slick.grid.css
#End - Copy Slickgrid from $THIRD_PARTY

#Start - Cooy Datetimepicker from $THIRD_PARTY
rm -rf webroot/assets/datetimepicker
mkdir -p webroot/assets/datetimepicker/js
mkdir -p webroot/assets/datetimepicker/styles
cp -af ./$THIRD_PARTY/datetimepicker-v2.4.5/jquery.datetimepicker.js webroot/assets/datetimepicker/js/jquery.datetimepicker.js
cp -af ./$THIRD_PARTY/datetimepicker-v2.4.5/jquery.datetimepicker.css webroot/assets/datetimepicker/styles/jquery.datetimepicker.css
#End - Cooy Datetimepicker from $THIRD_PARTY

#Start - Copy Knockout from $THIRD_PARTY
rm -rf webroot/assets/knockout
mkdir webroot/assets/knockout
cp -af ./$THIRD_PARTY/knockout-3.4.0/dist/knockout.js webroot/assets/knockout/knockout.js
#End - Copy Knockout from $THIRD_PARTY

#Start - Copy Moment Date-Formatter from $THIRD_PARTY
rm -rf webroot/assets/moment
mkdir webroot/assets/moment
cp -af ./$THIRD_PARTY/node_modules/moment/moment.js webroot/assets/moment/moment.js
#End - Copy Moment Date-Formatter from $THIRD_PARTY

#Start - Copy Joint from web-third-party
rm -rf webroot/assets/joint
mkdir -p webroot/assets/joint/js
mkdir -p webroot/assets/joint/css
cp -r ./$THIRD_PARTY/joint-v0.9.3/dist/joint.clean.js webroot/assets/joint/js/
#cp -r ./$THIRD_PARTY/joint-v0.9.3/lib/lodash.js webroot/assets/joint/js/
cp -r ./$THIRD_PARTY/joint-v0.9.3/src/geometry.js webroot/assets/joint/js/
cp -r ./$THIRD_PARTY/joint-v0.9.3/src/vectorizer.js webroot/assets/joint/js/
cp -r ./$THIRD_PARTY/dagre-v0.7.1/dist/dagre.js webroot/assets/joint/js/
cp -r ./$THIRD_PARTY/joint-v0.9.3/dist/joint.layout.DirectedGraph.js webroot/assets/joint/js/
cp -r ./$THIRD_PARTY/joint-v0.9.3/dist/joint.nojquery.min.css webroot/assets/joint/css/
#End - Copy Joint from web-third-party

#Start - Copy Backbone from $THIRD_PARTY
rm -rf webroot/assets/backbone
mkdir webroot/assets/backbone
cp -af ./$THIRD_PARTY/backbone-1.3.3/backbone-min.js webroot/assets/backbone/backbone-min.js
cp -af ./$THIRD_PARTY/backbone-1.3.3/backbone-min.map webroot/assets/backbone/backbone-min.map
cp -af ./$THIRD_PARTY/knockback-1.1.0/knockback.min.js webroot/assets/backbone/knockback.min.js
cp -af ./$THIRD_PARTY/backbone-validation-amd.js webroot/assets/backbone/backbone-validation-amd.js
#End - Copy Backbone from $THIRD_PARTY

#Start - Copy Requirejs & Textjs from $THIRD_PARTY
rm -rf webroot/assets/requirejs
mkdir webroot/assets/requirejs
cp -af ./$THIRD_PARTY/require.js webroot/assets/requirejs/require.js
cp -af ./$THIRD_PARTY/text.js webroot/assets/requirejs/text.js
#End - Copy Requirejs & Textjs  from $THIRD_PARTY

#Start - Copy Lodashjs from $THIRD_PARTY
rm -rf webroot/assets/lodash
mkdir webroot/assets/lodash
cp -af ./$THIRD_PARTY/lodash.min.js webroot/assets/lodash/lodash.min.js
#End - Copy Lodashjs from $THIRD_PARTY

#Start - Copy Underscore from $THIRD_PARTY
rm -rf webroot/assets/underscore
mkdir webroot/assets/underscore
cp -af ./$THIRD_PARTY/underscore-1.8.3/underscore-min.js webroot/assets/underscore/underscore-min.js
cp -af ./$THIRD_PARTY/underscore-1.8.3/underscore-min.map webroot/assets/underscore/underscore-min.map
#End - Copy Underscore from $THIRD_PARTY

#Start - Copy bezier from $THIRD_PARTY
rm -rf webroot/assets/bezierjs
mkdir webroot/assets/bezierjs
cp -af ./$THIRD_PARTY/bezierjs-gh-pages/lib/bezier.js webroot/assets/bezierjs/bezier.js
#End - Copy bezier from $THIRD_PARTY

#Start - Copy uuid.js from $THIRD_PARTY
cp -af ./$THIRD_PARTY/uuid.js webroot/js/uuid.js
#End - Copy uuid.js from $THIRD_PARTY

#Start - Copy ajv.min.js from $THIRD_PARTY
rm -rf webroot/assets/ajv
mkdir webroot/assets/ajv
cp -af ./$THIRD_PARTY/ajv-4.1.0/ajv.min.js webroot/assets/ajv/ajv.min.js
#End - Copy ajv.min.js from $THIRD_PARTY

#Start - Copy jsoneditor.js from $THIRD_PARTY
rm -rf webroot/assets/jsoneditor
mkdir -p webroot/assets/jsoneditor/js
mkdir -p webroot/assets/jsoneditor/css/img

cp -af ./$THIRD_PARTY/jsoneditor-5.5.6/dist/jsoneditor.min.js webroot/assets/jsoneditor/js/jsoneditor.min.js
cp -af ./$THIRD_PARTY/jsoneditor-5.5.6/dist/jsoneditor.js webroot/assets/jsoneditor/js/jsoneditor.js
cp -af ./$THIRD_PARTY/jsoneditor-5.5.6/dist/jsoneditor.min.css webroot/assets/jsoneditor/css/jsoneditor.min.css
cp -af ./$THIRD_PARTY/jsoneditor-5.5.6/dist/jsoneditor.css webroot/assets/jsoneditor/css/jsoneditor.css
cp -af ./$THIRD_PARTY/jsoneditor-5.5.6/src/css/img/jsoneditor-icons.svg webroot/assets/jsoneditor/css/img/jsoneditor-icons.svg

rm -rf webroot/common/ui/css/img
mkdir -p webroot/common/ui/css/img
cp -af ./$THIRD_PARTY/jsoneditor-5.5.6/src/css/img/jsoneditor-icons.svg webroot/common/ui/css/img/jsoneditor-icons.svg
#End - Copy jsoneditor.js from $THIRD_PARTY

#Start - Copy jdorn-jsoneditor.js from $THIRD_PARTY
rm -rf webroot/assets/jdorn-jsoneditor
mkdir -p webroot/assets/jdorn-jsoneditor/js
cp -af ./$THIRD_PARTY/jdorn-jsoneditor.js webroot/assets/jdorn-jsoneditor/js/jdorn-jsoneditor.js
#End - Copy jdorn-jsoneditor.js from $THIRD_PARTY

#Start - Copy jquery-linedtextarea from $THIRD_PARTY
rm -rf webroot/assets/jquery-linedtextarea
mkdir -p webroot/assets/jquery-linedtextarea/js
mkdir -p webroot/assets/jquery-linedtextarea/css
cp -af ./$THIRD_PARTY/jquery-linedtextarea.js webroot/assets/jquery-linedtextarea/js/jquery-linedtextarea.js
cp -af ./$THIRD_PARTY/jquery-linedtextarea.css webroot/assets/jquery-linedtextarea/css/jquery-linedtextarea.css
#End - Copy jquery-linedtextarea from $THIRD_PARTY

#Start - Merging All CSS files
rm -f webroot/css/contrail.unified.css
#Loop through files in webroot/common/ui/scss and and running through sass compiler and move them to webroot/common/ui/css 
for cssFile in `find webroot/common/ui/scss -name '*.scss' -not -name '*.unified.scss'`
do
    outputFile=${cssFile##*/}
    outputFile=${outputFile%%.scss}
    ./node_modules/node-sass/bin/node-sass $cssFile > webroot/common/ui/css/${outputFile}.css
done


# compile sass
./node_modules/node-sass/bin/node-sass webroot/common/ui/scss/contrail.thirdparty.unified.scss > webroot/common/ui/css/contrail.thirdparty.unified.css
./node_modules/node-sass/bin/node-sass webroot/common/ui/scss/contrail.unified.scss > webroot/common/ui/css/contrail.unified.css
#End - Merging ALL CSS files
