#function to check if the file checksum is correct
rm -rf web-third-party

INSTALL_DIR=$PWD/../build/contrail-web-third-party
PATH=$INSTALL_DIR/bin:$PATH
if command -v npm >/dev/null 2; then {
    echo "Node already installed"
} else {
    mkdir -p $INSTALL_DIR

    echo "Installing NodeJS ..."
    cd ../third_party/node-v*
    ./configure --prefix=$INSTALL_DIR
    make
    make install
    echo "Installed NodeJS"
    cd -
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
fi

# xml2js Module
patch -p1 -N < ../distro/patches/xml2js_0.2.3.patch
if [ $? -ne 0 ] ; then
    echo "xml2js - patch apply failed"
fi

# connect-redis Module
patch -p1 -N < ../distro/patches/connect-redis_1.4.5.patch
if [ $? -ne 0 ] ; then
    echo "connect-redis - patch apply failed"
fi

if [ $(command -v md5sum) > /dev/null 2>&1 ]; then
    md5_exec=md5sum
elif [ $(command -v md5) > /dev/null 2>&1 ]; then
    md5_exec=md5
fi

# UI Third Party Code
cd -
mkdir web-third-party
cd web-third-party/

wget --no-check-certificate https://github.com/cjohansen/Sinon.JS/archive/v1.8.1.tar.gz -O v1.8.1.tar.gz
tar -xf v1.8.1.tar.gz
rm -rf v1.8.1.tar.gz
mv Sinon.JS-1.8.1 Sinon.JS

wget --no-check-certificate http://getbootstrap.com/2.3.2/assets/bootstrap.zip -O bootstrap.zip
unzip -o bootstrap.zip
rm -rf bootstrap.zip
mv bootstrap bootstrap-v2.3.2

mkdir jquery
cd jquery
wget --no-check-certificate http://jquery-xml2json-plugin.googlecode.com/svn/trunk/jquery.xml2json.js 
wget --no-check-certificate http://cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.2/jquery.ui.touch-punch.min.js
wget --no-check-certificate https://raw.githubusercontent.com/cowboy/jquery-bbq/master/jquery.ba-bbq.min.js
wget --no-check-certificate https://jquery-timer.googlecode.com/files/jquery.timer.js
wget --no-check-certificate https://jquery-json.googlecode.com/files/jquery.json-2.4.min.js
wget --no-check-certificate http://datatables.net/download/build/jquery.dataTables.min.js
wget --no-check-certificate http://cdnjs.cloudflare.com/ajax/libs/jquery/1.8.3/jquery.min.js -O jquery-1.8.3.min.js
wget --no-check-certificate http://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js -O jquery-1.9.1.min.js
cd -

mkdir fonts-opensans
cd fonts-opensans
wget --no-check-certificate http://fonts.googleapis.com/css?family=Open+Sans:400italic,600italic,400,600,300 -O openSans.css
wget --no-check-certificate http://themes.googleusercontent.com/static/fonts/opensans/v6/DXI1ORHCpsQm3Vp6mXoaTaRDOzjiPcYnFooOUGCOsRk.woff
wget --no-check-certificate http://themes.googleusercontent.com/static/fonts/opensans/v6/cJZKeOuBrn4kERxqtaUH3bO3LdcAZYWl9Si6vvxL-qU.woff
cd -

wget --no-check-certificate https://github.com/components/jqueryui/archive/1.10.4.tar.gz -O 1.10.4.tar.gz
tar -xf 1.10.4.tar.gz
rm -rf 1.10.4.tar.gz
mv jqueryui-1.10.4 jquery-ui-1.10.4

#Download crossfilter
wget --no-check-certificate https://github.com/square/crossfilter/archive/v1.2.0.tar.gz -O v1.2.0.tar.gz
tar -xf v1.2.0.tar.gz
rm -rf v1.2.0.tar.gz
mv crossfilter-1.2.0 crossfilter

wget --no-check-certificate https://github.com/mbostock/d3/archive/v3.2.1.tar.gz -O v3.2.1.tar.gz
tar -xf v3.2.1.tar.gz
rm -rf v3.2.1.tar.gz
mv d3-3.2.1 d3

wget --no-check-certificate https://github.com/xdan/datetimepicker/archive/2.1.9.tar.gz -O 2.1.9.tar.gz
tar -xf 2.1.9.tar.gz
rm -rf 2.1.9.tar.gz
mv datetimepicker-2.1.9 datetimepicker-v2.1.9

wget --no-check-certificate http://fortawesome.github.io/Font-Awesome/3.2.1/assets/font-awesome.zip -O font-awesome.zip
unzip -o font-awesome.zip
rm -rf font-awesome.zip
mv font-awesome font-awesome-v3.2.1

wget --no-check-certificate https://github.com/novus/nvd3/archive/v1.0.0-beta.tar.gz -O v1.0.0-beta.tar.gz
tar -xf v1.0.0-beta.tar.gz
rm -rf v1.0.0-beta.tar.gz
mv nvd3-1.0.0-beta nvd3
patch -p1 -N < ../distro/patches/nvd3_1.0.0-beta.patch
if [ $? -ne 0 ] ; then
    echo "nvd3 - patch apply failed"
fi

wget --no-check-certificate http://knockoutjs.com/downloads/knockout-3.0.0.js
mkdir knockout-v3.0.0
mv knockout-3.0.0.js knockout-v3.0.0/knockout-3.0.0.js

wget --no-check-certificate https://github.com/jzaefferer/jquery-validation/archive/1.11.1.tar.gz -O 1.11.1.tar.gz
tar -xf 1.11.1.tar.gz
rm -rf 1.11.1.tar.gz
mv jquery-validation-1.11.1 jquery-validation-v1.11.1

if [ $1 = 'dev' ] ; then 
    wget --no-check-certificate https://github.com/jquery/qunit/archive/v1.14.0.tar.gz -O v1.14.0.tar.gz
    tar -xf v1.14.0.tar.gz
    mv qunit-1.14.0 qunit
fi

wget --no-check-certificate https://github.com/ivaynberg/select2/archive/3.4.6.tar.gz -O 3.4.6.tar.gz
tar -xf 3.4.6.tar.gz
rm -rf 3.4.6.tar.gz
mv select2-3.4.6 select2-v3.4.6

wget --no-check-certificate https://github.com/mleibman/SlickGrid/archive/2.1.0.tar.gz -O 2.1.0.tar.gz
tar -xf 2.1.0.tar.gz
rm -rf 2.1.0.tar.gz
mv SlickGrid-2.1.0 slickgrid-v2.1.0
patch -p1 -N < ../distro/patches/slickgrid_v2.1.0.patch
if [ $? -ne 0 ] ; then
    echo "slickgrid - patch apply failed"
fi

wget --no-check-certificate https://github.com/moment/moment/archive/2.6.0.tar.gz -O 2.6.0.tar.gz
tar -xf 2.6.0.tar.gz
rm -rf 2.6.0.tar.gz
mv moment-2.6.0 moment-v2.6.0


wget --no-check-certificate https://github.com/knockout/knockout/archive/v3.0.0.tar.gz -O v3.0.0.tar.gz
tar -xf v3.0.0.tar.gz
rm -rf v3.0.0.tar.gz
mv knockout-3.0.0 knockout-v3.0.0

wget --no-check-certificate http://builds.handlebarsjs.com.s3.amazonaws.com/handlebars-v1.3.0.js
mkdir handlebars-v1.3.0
mv handlebars-v1.3.0.js handlebars-v1.3.0/.

wget --no-check-certificate https://github.com/crlcu/multiselect/archive/master.zip -O master.zip
unzip -o master.zip
rm -rf master.zip
mv multiselect-master multiselect-v1.0
patch -p1 -N < ../distro/patches/multiselect_v1.0.patch
if [ $? -ne 0 ] ; then
    echo "multiselect - patch apply failed"
fi

wget --no-check-certificate https://github.com/kingleema/SlickGridEnhancementPager/archive/master.zip -O master.zip
unzip -o master.zip
rm -rf master.zip
mv SlickGridEnhancementPager-master slickgrid.enhancement.pager
patch -p1 -N < ../distro/patches/SlickGridEnhancementPager.patch
if [ $? -ne 0 ] ; then
    echo "SlickGridEnhancementPager - patch apply failed"
fi

cd -

