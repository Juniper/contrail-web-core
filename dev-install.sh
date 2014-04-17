#!/usr/bin/env bash

#
# Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
#

ONE_BACK='..'
TWO_BACK='../..'
THREE_BACK='../../..'
FOUR_BACK='../../../..'
FIVE_BACK='../../../../..'

if [ $1 = 'prod' ] ; then 
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
    cp -r ../contrail-web-third-party/jquery-ui-1.10.3/development-bundle/themes/smoothness/jquery-ui.css webroot/assets/jquery/js/
    cp -r ../contrail-web-third-party/jquery-ui-1.10.3/development-bundle/themes/smoothness/jquery.ui.theme.css webroot/assets/jquery/js/
    cp -r ../contrail-web-third-party/jquery-ui-1.10.3/development-bundle/themes/smoothness/images webroot/assets/jquery/js/
    cp -r ../contrail-web-third-party/jquery-validation-v1.11.1/jquery.validate.js webroot/assets/jquery/js/jquery.validate.js
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
    #End - Copy Font-Opensans from contrail-web-third-party

    #Start - Copy Handlebars from contrail-web-third-party
    rm -rf webroot/assets/handlebars
    mkdir webroot/assets/handlebars
    cp -r ../contrail-web-third-party/handlebars-v1.3.0/handlebars-v1.3.0.js webroot/assets/handlebars/handlebars-v1.3.0.js
    #End - Copy Handlebars from contrail-web-third-party

    #Start - Copy Select2 from contrail-web-third-party
    rm -rf webroot/assets/select2
    mkdir -p webroot/assets/select2/js
    mkdir -p webroot/assets/select2/styles
    cp -r ../contrail-web-third-party/select2-v3.4.6/select2.min.js webroot/assets/select2/js/select2.min.js
    cp -r ../contrail-web-third-party/select2-v3.4.6/select2.css webroot/assets/select2/styles/select2.css
    cp -r ../contrail-web-third-party/select2-v3.4.6/select2-bootstrap.css webroot/assets/select2/styles/select2-bootstrap.css
    cp -r ../contrail-web-third-party/select2-v3.4.6/select2.png webroot/assets/select2/styles/select2.png
    cp -r ../contrail-web-third-party/select2-v3.4.6/select2x2.png webroot/assets/select2/styles/select2x2.png
    cp -r ../contrail-web-third-party/select2-v3.4.6/select2-spinner.gif webroot/assets/select2/styles/select2-spinner.gif
    #End - Copy Select2 from contrail-web-third-party

    #Start - Copy 2way-Multiselect from contrail-web-third-party
    rm -rf webroot/assets/2way-multiselect
    mkdir -p webroot/assets/2way-multiselect/js
    cp -r ../contrail-web-third-party/multiselect-v1.0/js/multiselect.js webroot/assets/2way-multiselect/js/multiselect.js
    #End - Copy 2way-Multiselect from contrail-web-third-party

    #Start - Copy Slickgrid from contrail-web-third-party
    rm -rf webroot/assets/slickgrid
    mkdir -p webroot/assets/slickgrid/js
    mkdir -p webroot/assets/slickgrid/styles
    cp -r ../contrail-web-third-party/slickgrid-v2.1.0/slick.core.js webroot/assets/slickgrid/js/slick.core.js
    cp -r ../contrail-web-third-party/slickgrid-v2.1.0/slick.grid.js webroot/assets/slickgrid/js/slick.grid.js
    cp -r ../contrail-web-third-party/slickgrid-v2.1.0/slick.dataview.js webroot/assets/slickgrid/js/slick.dataview.js
    cp -r ../contrail-web-third-party/slickgrid-v2.1.0/lib/jquery.event.drag-2.2.js webroot/assets/slickgrid/js/jquery.event.drag-2.2.js

    cp -r ../contrail-web-third-party/slickgrid.enhancement.pager/slick.enhancementpager.js webroot/assets/slickgrid/js/slick.enhancementpager.js
    cp -r ../contrail-web-third-party/slickgrid.enhancement.pager/libs/jquery.json-2.3.min.js webroot/assets/slickgrid/js/jquery.json-2.3.min.js
    cp -r ../contrail-web-third-party/slickgrid.enhancement.pager/libs/jquery.dropkick-1.0.0.js webroot/assets/slickgrid/js/jquery.dropkick-1.0.0.js

    cp -r ../contrail-web-third-party/slickgrid-v2.1.0/slick.grid.css webroot/assets/slickgrid/styles/slick.grid.css
    #End - Copy Slickgrid from contrail-web-third-party

    #Start - Cooy Datetimepicker from contrail-web-third-party
    rm -rf webroot/assets/datetimepicker
    mkdir -p webroot/assets/datetimepicker/js
    mkdir -p webroot/assets/datetimepicker/styles
    cp -r ../contrail-web-third-party/datetimepicker-v2.1.9/jquery.datetimepicker.js webroot/assets/datetimepicker/js/jquery.datetimepicker.js
    cp -r ../contrail-web-third-party/datetimepicker-v2.1.9/jquery.datetimepicker.css webroot/assets/datetimepicker/styles/jquery.datetimepicker.css
    #End - Cooy Datetimepicker from contrail-web-third-party

    #Start - Copy Knockout from contrail-web-third-party
    rm -rf webroot/assets/knockout
    mkdir webroot/assets/knockout
    cp -r ../contrail-web-third-party/knockout-v3.0.0/knockout-3.0.0.js webroot/assets/knockout/knockout-3.0.0.js
    #End - Copy Knockout from contrail-web-third-party

    #Start - Copy Moment Date-Formatter from contrail-web-third-party
    rm -rf webroot/assets/moment
    mkdir webroot/assets/moment
    cp -r ../contrail-web-third-party/moment-v2.5.1/moment.min.js webroot/assets/moment/moment.min.js
    #End - Copy Moment Date-Formatter from contrail-web-third-party
else
    #Start - Link KendoUI from contrail-web-third-party
    rm -rf webroot/assets/kendoui
    mkdir -p webroot/assets/kendoui
    ln -sf $FOUR_BACK/contrail-web-third-party/kendoui.complete.2013.1.514.commercial/js webroot/assets/kendoui/js
    ln -sf $FOUR_BACK/contrail-web-third-party/kendoui.complete.2013.1.514.commercial/styles webroot/assets/kendoui/styles
    #End - Link KendoUI from contrail-web-third-party

    #Start - Link d3/vnd3 files from contrail-web-third-party
    rm -rf webroot/assets/d3
    mkdir -p webroot/assets/d3/js
    ln -sf $FIVE_BACK/contrail-web-third-party/d3/d3.js webroot/assets/d3/js/d3.js

    rm -rf webroot/assets/crossfilter
    mkdir -p webroot/assets/crossfilter/js
    ln -sf $FIVE_BACK/contrail-web-third-party/crossfilter/crossfilter.min.js webroot/assets/crossfilter/js/crossfilter.min.js

    rm -rf webroot/assets/nvd3
    mkdir -p webroot/assets/nvd3/js
    mkdir -p webroot/assets/nvd3/css
    ln -sf $FIVE_BACK/contrail-web-third-party/nvd3/nv.d3.js webroot/assets/nvd3/js/nv.d3.js
    ln -sf $FIVE_BACK/contrail-web-third-party/nvd3/lib/fisheye.js webroot/assets/nvd3/js/fisheye.js
    ln -sf $FIVE_BACK/contrail-web-third-party/nvd3/src/nv.d3.css webroot/assets/nvd3/css/nv.d3.css
    #End - Link d3/nvd3 files from contrail-web-third-party

    #Start - Link JQuery files from contrail-web-third-party
    rm -rf webroot/assets/jquery/js
    mkdir -p webroot/assets/jquery/js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery/jquery-1.8.3.min.js webroot/assets/jquery/js/jquery-1.8.3.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery/jquery-1.9.1.min.js webroot/assets/jquery/js/jquery-1.9.1.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery/jquery.ba-bbq.min.js webroot/assets/jquery/js/jquery.ba-bbq.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery/jquery.dataTables.min.js webroot/assets/jquery/js/jquery.dataTables.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery/jquery.json-2.4.min.js webroot/assets/jquery/js/jquery.json-2.4.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery/jquery.timer.js webroot/assets/jquery/js/jquery.timer.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery/jquery.ui.touch-punch.min.js webroot/assets/jquery/js/jquery.ui.touch-punch.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery/jquery.xml2json.js webroot/assets/jquery/js/jquery.xml2json.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery-ui-1.10.3/js/jquery-ui-1.10.3.custom.min.js webroot/assets/jquery/js/jquery-ui-1.10.3.custom.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery-ui-1.10.3/development-bundle/themes/smoothness/jquery-ui.css webroot/assets/jquery/js/jquery-ui.css
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery-ui-1.10.3/development-bundle/themes/smoothness/jquery.ui.theme.css webroot/assets/jquery/js/jquery.ui.theme.css
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery-ui-1.10.3/development-bundle/themes/smoothness/images webroot/assets/jquery/js/images
    ln -sf $FIVE_BACK/contrail-web-third-party/jquery-validation-v1.11.1/jquery.validate.js webroot/assets/jquery/js/jquery.validate.js
    #End - Link JQuery files from contrail-web-third-party

    #Start - Link Bootstrap from contrail-web-third-party
    rm -rf webroot/assets/bootstrap
    mkdir webroot/assets/bootstrap
    ln -sf $FOUR_BACK/contrail-web-third-party/bootstrap-v2.3.2/js webroot/assets/bootstrap/js
    ln -sf $FOUR_BACK/contrail-web-third-party/bootstrap-v2.3.2/css webroot/assets/bootstrap/css
    #End - Link Bootstrap from contrail-web-third-party

    #Start - Link Font-Awesome from contrail-web-third-party
    rm -rf webroot/assets/font-awesome
    mkdir webroot/assets/font-awesome
    ln -sf $FOUR_BACK/contrail-web-third-party/font-awesome-v3.2.1/font webroot/assets/font-awesome/font
    ln -sf $FOUR_BACK/contrail-web-third-party/font-awesome-v3.2.1/css webroot/assets/font-awesome/css

    rm -rf webroot/font
    ln -sf $TWO_BACK/contrail-web-third-party/font-awesome-v3.2.1/font webroot/font
    #End - Link Font-Awesome from contrail-web-third-party

    #Start - Link Font-Opensans from contrail-web-third-party
    rm -rf webroot/assets/fonts-opensans
    ln -sf $THREE_BACK/contrail-web-third-party/fonts-opensans webroot/assets/fonts-opensans

    rm -f webroot/css/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff
    ln -sf  $THREE_BACK/contrail-web-third-party/fonts-opensans/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff  webroot/css/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff

    rm -f webroot/css/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff
    ln -sf  $THREE_BACK/contrail-web-third-party/fonts-opensans/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff  webroot/css/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff
    #End - Link Font-Awesome from contrail-web-third-party

    #Start - Link Handlebars from contrail-web-third-party
    rm -rf webroot/assets/handlebars
    mkdir webroot/assets/handlebars
    ln -sf $FOUR_BACK/contrail-web-third-party/handlebars-v1.3.0/handlebars-v1.3.0.js webroot/assets/handlebars/handlebars-v1.3.0.js
    #End - Link Handlebars from contrail-web-third-party

    #Start - Link Select2 from contrail-web-third-party
    rm -rf webroot/assets/select2
    mkdir -p webroot/assets/select2/js
    mkdir -p webroot/assets/select2/styles
    ln -sf $FIVE_BACK/contrail-web-third-party/select2-v3.4.6/select2.min.js webroot/assets/select2/js/select2.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/select2-v3.4.6/select2.css webroot/assets/select2/styles/select2.css
    ln -sf $FIVE_BACK/contrail-web-third-party/select2-v3.4.6/select2-bootstrap.css webroot/assets/select2/styles/select2-bootstrap.css
    ln -sf $FIVE_BACK/contrail-web-third-party/select2-v3.4.6/select2.png webroot/assets/select2/styles/select2.png
    ln -sf $FIVE_BACK/contrail-web-third-party/select2-v3.4.6/select2x2.png webroot/assets/select2/styles/select2x2.png
    ln -sf $FIVE_BACK/contrail-web-third-party/select2-v3.4.6/select2-spinner.gif webroot/assets/select2/styles/select2-spinner.gif
    #End - Link Select2 from contrail-web-third-party

    #Start - Link 2way-Multiselect from contrail-web-third-party
    rm -rf webroot/assets/2way-multiselect
    mkdir -p webroot/assets/2way-multiselect/js
    ln -sf $FIVE_BACK/contrail-web-third-party/multiselect-v1.0/js/multiselect.js webroot/assets/2way-multiselect/js/multiselect.js
    #End - Link 2way-Multiselect from contrail-web-third-party

    #Start - Link Slickgrid from contrail-web-third-party
    rm -rf webroot/assets/slickgrid
    mkdir -p webroot/assets/slickgrid/js
    mkdir -p webroot/assets/slickgrid/styles
    ln -sf $FIVE_BACK/contrail-web-third-party/slickgrid-v2.1.0/slick.core.js webroot/assets/slickgrid/js/slick.core.js
    ln -sf $FIVE_BACK/contrail-web-third-party/slickgrid-v2.1.0/slick.grid.js webroot/assets/slickgrid/js/slick.grid.js
    ln -sf $FIVE_BACK/contrail-web-third-party/slickgrid-v2.1.0/slick.dataview.js webroot/assets/slickgrid/js/slick.dataview.js
    ln -sf $FIVE_BACK/contrail-web-third-party/slickgrid-v2.1.0/lib/jquery.event.drag-2.2.js webroot/assets/slickgrid/js/jquery.event.drag-2.2.js

    ln -sf $FIVE_BACK/contrail-web-third-party/slickgrid.enhancement.pager/slick.enhancementpager.js webroot/assets/slickgrid/js/slick.enhancementpager.js
    ln -sf $FIVE_BACK/contrail-web-third-party/slickgrid.enhancement.pager/libs/jquery.json-2.3.min.js webroot/assets/slickgrid/js/jquery.json-2.3.min.js
    ln -sf $FIVE_BACK/contrail-web-third-party/slickgrid.enhancement.pager/libs/jquery.dropkick-1.0.0.js webroot/assets/slickgrid/js/jquery.dropkick-1.0.0.js

    ln -sf $FIVE_BACK/contrail-web-third-party/slickgrid-v2.1.0/slick.grid.css webroot/assets/slickgrid/styles/slick.grid.css
    #End - Link Slickgrid from contrail-web-third-party

    #Start - Link Datetimepicker from contrail-web-third-party
    rm -rf webroot/assets/datetimepicker
    mkdir -p webroot/assets/datetimepicker/js
    mkdir -p webroot/assets/datetimepicker/styles
    ln -sf $FIVE_BACK/contrail-web-third-party/datetimepicker-v2.1.9/jquery.datetimepicker.js webroot/assets/datetimepicker/js/jquery.datetimepicker.js
    ln -sf $FIVE_BACK/contrail-web-third-party/datetimepicker-v2.1.9/jquery.datetimepicker.css webroot/assets/datetimepicker/styles/jquery.datetimepicker.css
    #End - Link Datetimepicker from contrail-web-third-party

    #Start - Link Knockout from contrail-web-third-party
    rm -rf webroot/assets/knockout
    mkdir webroot/assets/knockout
    ln -sf $FOUR_BACK/contrail-web-third-party/knockout-v3.0.0/knockout-3.0.0.js webroot/assets/knockout/knockout-3.0.0.js
    #End - Link Knockout from contrail-web-third-party

    #Start - Link Moment Date-Formatter from contrail-web-third-party
    rm -rf webroot/assets/moment
    mkdir webroot/assets/moment
    ln -sf $FOUR_BACK/contrail-web-third-party/moment-v2.5.1/moment.min.js webroot/assets/moment/moment.min.js
    #End - Link Moment Date-Formatter from contrail-web-third-party
fi

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

