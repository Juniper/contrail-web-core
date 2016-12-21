WEB_CORE="."
WEB_CONTROLLER="../contrail-web-controller"
SRC_WEB_CORE_CHROME=./$WEB_CORE/webroot/extension/chrome/introspect
SRC_WEB_CONTROLLER_CHROME=./$WEB_CONTROLLER/webroot/extension/chrome/introspect
DEST_CHROME_EXTN=./$WEB_CONTROLLER/webroot/dist/extension/chrome
DEST_WEB_CORE_CHROME=./$DEST_CHROME_EXTN/contrail-web-core/webroot
DEST_WEB_CONTROLLER_CHROME=./$DEST_CHROME_EXTN/contrail-web-controller/webroot

rm -rf ./$DEST_CHROME_EXTN
mkdir -p ./$DEST_CHROME_EXTN/common/ui
mkdir -p ./$DEST_WEB_CONTROLLER_CHROME/setting
mkdir -p ./$DEST_WEB_CONTROLLER_CHROME/common/ui
mkdir -p ./$DEST_WEB_CORE_CHROME

cp -rf ./$WEB_CONTROLLER/webroot/setting/introspect ./$DEST_WEB_CONTROLLER_CHROME/setting/.
cp -rf ./$WEB_CONTROLLER/webroot/common/ui/js ./$DEST_WEB_CONTROLLER_CHROME/common/ui/.
cp -rf ./$WEB_CONTROLLER/webroot/common/ui/css ./$DEST_WEB_CONTROLLER_CHROME/common/ui/.
cp -rf ./$WEB_CORE/webroot/common/ui/xsl ./$DEST_CHROME_EXTN/common/ui/.
cp -rf ./$WEB_CORE/webroot/assets ./$DEST_WEB_CORE_CHROME/.
cp -rf ./$WEB_CORE/webroot/common ./$DEST_WEB_CORE_CHROME/.
cp -rf ./$WEB_CORE/webroot/js ./$DEST_WEB_CORE_CHROME/.
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/common/ui/css/contrail.init.css ./$DEST_WEB_CORE_CHROME/common/ui/css/contrail.init.css
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/common/ui/css/login.css ./$DEST_WEB_CORE_CHROME/common/ui/css/login.css
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/js/common/core.app.js  ./$DEST_WEB_CORE_CHROME/js/common/core.app.js
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/js/common/core.bundle.js ./$DEST_WEB_CORE_CHROME/js/common/core.bundle.js
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/js/common/jquery.dep.libs.js ./$DEST_WEB_CORE_CHROME/js/common/jquery.dep.libs.js
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/js/common/nonamd.libs.js ./$DEST_WEB_CORE_CHROME/js/common/nonamd.libs.js
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/assets/background.js ./$DEST_WEB_CORE_CHROME/assets/.
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/assets/content.js ./$DEST_WEB_CORE_CHROME/assets/.
cp -rf ./$SRC_WEB_CORE_CHROME/webroot/img ./$DEST_WEB_CORE_CHROME/.
cp -rf ./$SRC_WEB_CONTROLLER_CHROME/index.html ./$DEST_CHROME_EXTN/.
cp -rf ./$SRC_WEB_CONTROLLER_CHROME/menu.xml ./$DEST_CHROME_EXTN/.
cp -rf ./$SRC_WEB_CONTROLLER_CHROME/manifest.json ./$DEST_CHROME_EXTN/.
cp -rf ./$SRC_WEB_CONTROLLER_CHROME/webroot/common/ui/js/controller.app.js ./$DEST_WEB_CONTROLLER_CHROME/common/ui/js/controller.app.js
cp -rf ./$SRC_WEB_CONTROLLER_CHROME/webroot/common/ui/js/controller.init.js ./$DEST_WEB_CONTROLLER_CHROME/common/ui/js/controller.init.js
