#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

#function to check if the file checksum is correct
rm -rf web-third-party

if command -v npm >/dev/null 2; then {
    echo "npm already installed"
} else {
    echo "error: Failed dependencies: npm is needed";
    exit 1
}
fi

# Web Core Third Party Modules
if [ $1 = 'prod' ] ; then 
    npm install --production
else
    npm install
fi
# restler Module 
cd node_modules
patch -p1 -N < ../distro/patches/restler_2.0.1.patch
if [ $? -ne 0 ] ; then
    echo "restler - patch apply failed"
    exit 1
fi

# xml2js Module
patch -p1 -N < ../distro/patches/xml2js_0.2.3.patch
if [ $? -ne 0 ] ; then
    echo "xml2js - patch apply failed"
    exit 1
fi

# connect-redis Module
patch -p1 -N < ../distro/patches/connect-redis_1.4.5.patch
if [ $? -ne 0 ] ; then
    echo "connect-redis - patch apply failed"
    exit 1
fi

if [ $(command -v md5sum) > /dev/null 2>&1 ]; then
    md5_exec=md5sum
elif [ $(command -v md5) > /dev/null 2>&1 ]; then
    md5_exec=md5
fi

TMP_CACHE=/tmp/cache

# $1 - URL of package
# $2 - package name
getPackage() {
   #If package doesn't exist in "/tmp/cache",get the package using wget
   if [ ! -f ${TMP_CACHE}/$2 ];
   then
      wget --no-check-certificate $1 -O ${TMP_CACHE}/$2
   fi
   cp ${TMP_CACHE}/$2 .
}
# UI Third Party Code
cd -
mkdir web-third-party
cd web-third-party/

mkdir -p -m 0777 $TMP_CACHE

# fetching the packages to common directory /tmp/cache.. need to make readable
# by others
umask 0022
getPackage https://github.com/cjohansen/Sinon.JS/archive/v1.8.1.tar.gz v1.8.1.tar.gz 
tar -xf v1.8.1.tar.gz
rm -rf v1.8.1.tar.gz
mv Sinon.JS-1.8.1 Sinon.JS

getPackage http://getbootstrap.com/2.3.2/assets/bootstrap.zip bootstrap.zip 
unzip -o bootstrap.zip
rm -rf bootstrap.zip
mv bootstrap bootstrap-v2.3.2

mkdir -p xdate/js
cd xdate/js
getPackage http://arshaw.com/xdate/downloads/0.7/xdate.js xdate.js 
cd -

mkdir -p jsonpath/js
cd jsonpath/js
getPackage https://jsonpath.googlecode.com/files/jsonpath-0.8.0.js.txt jsonpath-0.8.0.js
cd -

mkdir jquery
cd jquery
getPackage http://jquery-xml2json-plugin.googlecode.com/svn/trunk/jquery.xml2json.js jquery.xml2json.js 
getPackage http://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.2/jquery.ui.touch-punch.min.js jquery.ui.touch-punch.min.js
getPackage https://raw.githubusercontent.com/cowboy/jquery-bbq/master/jquery.ba-bbq.min.js jquery.ba-bbq.min.js   
getPackage https://jquery-timer.googlecode.com/files/jquery.timer.js jquery.timer.js
getPackage https://jquery-json.googlecode.com/files/jquery.json-2.4.min.js jquery.json-2.4.min.js
getPackage http://datatables.net/download/build/jquery.dataTables.min.js jquery.json-2.4.min.js
getPackage http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min.js jquery-1.8.3.min.js
getPackage http://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js jquery-1.9.1.min.js
cd -

mkdir fonts-opensans
cd fonts-opensans
getPackage http://themes.googleusercontent.com/static/fonts/opensans/v8/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff
cd -

getPackage https://github.com/components/jqueryui/archive/1.10.4.tar.gz 1.10.4.tar.gz
tar -xf 1.10.4.tar.gz
rm -rf 1.10.4.tar.gz
mv jqueryui-1.10.4 jquery-ui-1.10.4

#Download crossfilter
getPackage https://github.com/square/crossfilter/archive/v1.2.0.tar.gz v1.2.0.tar.gz
tar -xf v1.2.0.tar.gz
rm -rf v1.2.0.tar.gz
mv crossfilter-1.2.0 crossfilter

getPackage https://github.com/mbostock/d3/archive/v3.2.1.tar.gz v3.2.1.tar.gz
tar -xf v3.2.1.tar.gz
rm -rf v3.2.1.tar.gz
mv d3-3.2.1 d3

getPackage https://github.com/xdan/datetimepicker/archive/2.1.9.tar.gz 2.1.9.tar.gz
tar -xf 2.1.9.tar.gz
rm -rf 2.1.9.tar.gz
mv datetimepicker-2.1.9 datetimepicker-v2.1.9

getPackage http://fortawesome.github.io/Font-Awesome/3.2.1/assets/font-awesome.zip font-awesome.zip
unzip -o font-awesome.zip
rm -rf font-awesome.zip
mv font-awesome font-awesome-v3.2.1

getPackage https://github.com/novus/nvd3/archive/v1.0.0-beta.tar.gz v1.0.0-beta.tar.gz
tar -xf v1.0.0-beta.tar.gz
rm -rf v1.0.0-beta.tar.gz
mv nvd3-1.0.0-beta nvd3
patch -p1 -N < ../distro/patches/nvd3_1.0.0-beta.patch
if [ $? -ne 0 ] ; then
    echo "nvd3 - patch apply failed"
    exit 1
fi

getPackage http://knockoutjs.com/downloads/knockout-3.0.0.js knockout-3.0.0.js
mkdir knockout-v3.0.0
mv knockout-3.0.0.js knockout-v3.0.0/knockout-3.0.0.js

getPackage https://github.com/jzaefferer/jquery-validation/archive/1.11.1.tar.gz 1.11.1.tar.gz
tar -xf 1.11.1.tar.gz
rm -rf 1.11.1.tar.gz
mv jquery-validation-1.11.1 jquery-validation-v1.11.1

if [ $1 = 'dev' ] ; then 
    getPackage https://github.com/jquery/qunit/archive/v1.14.0.tar.gz v1.14.0.tar.gz
    tar -xf v1.14.0.tar.gz
    mv qunit-1.14.0 qunit
fi

getPackage https://github.com/ivaynberg/select2/archive/3.4.6.tar.gz 3.4.6.tar.gz
tar -xf 3.4.6.tar.gz
rm -rf 3.4.6.tar.gz
mv select2-3.4.6 select2-v3.4.6

getPackage https://github.com/Juniper/SlickGrid/archive/master.tar.gz SlickGrid-master.tar.gz
tar -xf SlickGrid-master.tar.gz
rm -rf SlickGrid-master.tar.gz
mv SlickGrid-master jnpr_slickgrid
patch -p1 -N < ../distro/patches/jnpr_slickgrid.patch
if [ $? -ne 0 ] ; then
    echo "slickgrid - patch apply failed"
    exit 1
fi

getPackage https://github.com/moment/moment/archive/2.6.0.tar.gz 2.6.0.tar.gz
tar -xf 2.6.0.tar.gz
rm -rf 2.6.0.tar.gz
mv moment-2.6.0 moment-v2.6.0


getPackage https://github.com/knockout/knockout/archive/v3.0.0.tar.gz v3.0.0.tar.gz
tar -xf v3.0.0.tar.gz
rm -rf v3.0.0.tar.gz
mv knockout-3.0.0 knockout-v3.0.0

getPackage http://builds.handlebarsjs.com.s3.amazonaws.com/handlebars-v1.3.0.js handlebars-v1.3.0.js
mkdir handlebars-v1.3.0
mv handlebars-v1.3.0.js handlebars-v1.3.0/.

getPackage https://github.com/crlcu/multiselect/archive/master.zip multiselect.zip
unzip -o multiselect.zip
rm -rf multiselect.zip
mv multiselect-master multiselect-v1.0
patch -p1 -N < ../distro/patches/multiselect_v1.0.patch
if [ $? -ne 0 ] ; then
    echo "multiselect - patch apply failed"
    exit 1
fi

getPackage https://github.com/kingleema/SlickGridEnhancementPager/archive/master.zip SlickGridEnhancementPager.zip
unzip -o SlickGridEnhancementPager.zip
rm -rf SlickGridEnhancementPager.zip
mv SlickGridEnhancementPager-master slickgrid.enhancement.pager
patch -p1 -N < ../distro/patches/SlickGridEnhancementPager.patch
if [ $? -ne 0 ] ; then
    echo "SlickGridEnhancementPager - patch apply failed"
    exit 1
fi

cd -

