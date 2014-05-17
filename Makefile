#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

REPORTER = dot
WEBUISERVER = contrail-web-core
WEBUICLIENT = contrail-web-controller
THIRDPARTY = third_party

$(WEBUISERVER):
	if [ ! -d ../$(WEBUISERVER) ]; then git clone git@github.com:Juniper/contrail-web-core.git ../$(WEBUISERVER); else cd ../$(WEBUISERVER) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

$(WEBUICLIENT):
	if [ ! -d ../$(WEBUICLIENT) ]; then git clone git@github.com:Juniper/contrail-web-controller.git ../$(WEBUICLIENT); else cd ../$(WEBUICLIENT) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

$(THIRDPARTY):
	if [ ! -d ../$(THIRDPARTY) ]; then git clone git@github.com:Juniper/contrail-third-party.git ../$(THIRDPARTY); else cd ../$(THIRDPARTY) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

repos: $(WEBUISERVER) $(WEBUICLIENT) $(THIRDPARTY)

fetch-pkgs-prod:
	make clean
	./fetch_packages.sh prod

fetch-pkgs-dev:
	make clean
	./fetch_packages.sh dev

fetch-pkgs:
	./fetch_packages.sh dev

package:
	make clean
	make fetch-pkgs-prod 
	rm -f webroot/html/dashboard.html
	rm -f webroot/html/login.html
	rm -f webroot/html/login-error.html
	cp -a webroot/html/dashboard.tmpl webroot/html/dashboard.html
	cp -a webroot/html/login.tmpl webroot/html/login.html
	cp -a webroot/html/login-error.tmpl webroot/html/login-error.html
	rm -rf webroot/config
	rm -rf webroot/monitor
	rm -rf webroot/reports
	rm -rf webroot/setting
	rm -rf webroot/menu.xml
	cp -af ../$(WEBUICLIENT)/webroot/config webroot/.
	cp -af ../$(WEBUICLIENT)/webroot/monitor webroot/.
	cp -af ../$(WEBUICLIENT)/webroot/reports webroot/.
	cp -af ../$(WEBUICLIENT)/webroot/setting webroot/.
	cp -af ../$(WEBUICLIENT)/webroot/menu.xml webroot/menu.xml
	./generate-files.sh
	./dev-install.sh
	./prod-dev.sh webroot/html/dashboard.html prod_env dev_env true
	./prod-dev.sh webroot/html/login.html prod_env dev_env true
	./prod-dev.sh webroot/html/login-error.html prod_env dev_env true
	rm -rf web_third_party

all:
	mkdir -p webroot/html
	ln -sf ../../webroot/html/dashboard.tmpl webroot/html/dashboard.html
	ln -sf ../../webroot/html/login.tmpl webroot/html/login.html
	ln -sf ../../webroot/html/login-error.tmpl webroot/html/login-error.html
	./generate-files.sh
	./dev-install.sh

make-ln:
	cp -af webroot/html/dashboard.html webroot/html/dashboard.tmpl
	rm -f webroot/html/dashboard.html
	ln -sf ../../webroot/html/dashboard.tmpl webroot/html/dashboard.html
	cp -af webroot/html/login.html webroot/html/login.tmpl
	rm -f webroot/html/login.html
	ln -sf ../../webroot/html/login.tmpl webroot/html/login.html
	cp -af webroot/html/login-error.html webroot/html/login-error.tmpl
	rm -f webroot/html/login-error.html
	ln -sf ../../webroot/html/login-error.tmpl webroot/html/login-error.html
	rm -f webroot/html/login-error.html
	ln -sf ../../webroot/html/login-error.tmpl webroot/html/login-error.html
	rm -rf webroot/config webroot/monitor webroot/reports webroot/setting webroot/menu.xml
	ln -sf ../../$(WEBUICLIENT)/webroot/config webroot/config
	ln -sf ../../$(WEBUICLIENT)/webroot/monitor webroot/monitor
	ln -sf ../../$(WEBUICLIENT)/webroot/reports webroot/reports
	ln -sf ../../$(WEBUICLIENT)/webroot/setting webroot/setting
	ln -sf ../../$(WEBUICLIENT)/webroot/menu.xml webroot/menu.xml
	
dev-env:
	make all
	./prod-dev.sh webroot/html/dashboard.html dev_env prod_env true
	./prod-dev.sh webroot/html/login.html dev_env prod_env true
	./prod-dev.sh webroot/html/login-error.html dev_env prod_env true
	make make-ln

test-env:
	make dev-env
	./unit-test.sh init

prod-env:
	mkdir -p webroot/html
	ln -sf ../../webroot/html/dashboard.tmpl webroot/html/dashboard.html
	ln -sf ../../webroot/html/login.tmpl webroot/html/login.html
	ln -sf ../../webroot/html/login-error.tmpl webroot/html/login-error.html
	./generate-files.sh
	./dev-install.sh
	./prod-dev.sh webroot/html/dashboard.html prod_env dev_env true
	./prod-dev.sh webroot/html/login.html prod_env dev_env true
	./prod-dev.sh webroot/html/login-error.html prod_env dev_env true
	make make-ln

rem-ts-dev:
	./prod-dev.sh webroot/html/dashboard.html dev_env prod_env false
	./prod-dev.sh webroot/html/login.html dev_env prod_env false
	./prod-dev.sh webroot/html/login-error.html dev_env prod_env false
	make make-ln

rem-ts-prod:
	./prod-dev.sh webroot/html/dashboard.html prod_env dev_env false
	./prod-dev.sh webroot/html/login.html prod_env dev_env false
	./prod-dev.sh webroot/html/login-error.html prod_env dev_env false
	make make-ln

check: test

test-node:
	./unit-test.sh node
	
test-ui:
	./unit-test.sh ui
test: 
	make test-node
	make test-ui
             
clean:
	rm -f src/serverroot/jobs/core/jobsCb.api.js
	rm -f src/serverroot/web/core/feature.list.js
	rm -f src/serverroot/web/routes/url.routes.js
	rm -rf node_modules
	rm -rf web_third_party
	rm -rf html
	rm -rf webroot/assets/2way-multiselect
	rm -rf webroot//assets/bootstrap
	rm -rf webroot/assets/crossfilter
	rm -rf webroot/assets/d3
	rm -rf webroot/assets/datetimepicker
	rm -rf webroot/assets/font-awesome
	rm -rf webroot/assets/fonts-opensans
	rm -rf webroot/assets/handlebars
	rm -rf webroot/assets/jquery
	rm -rf webroot/assets/jquery-ui
	rm -rf webroot/assets/knockout
	rm -rf webroot/assets/moment
	rm -rf webroot/assets/nvd3
	rm -rf webroot/assets/select2
	rm -rf webroot/assets/slickgrid

.PHONY: package dev-env prod-env test clean

