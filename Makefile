#
# Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
#

REPORTER = dot
WEBUISERVER = contrail-web-core
WEBUICLIENT = contrail-web-controller
WEBUITHIRDPARTY = contrail-webui-third-party
THIRD_PARTY='../contrail-webui-third-party'

$(WEBUISERVER):
	if [ ! -d ../$(WEBUISERVER) ]; then git clone git@github.com:Juniper/contrail-web-core.git ../$(WEBUISERVER); else cd ../$(WEBUISERVER) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

$(WEBUICLIENT):
	if [ ! -d ../$(WEBUICLIENT) ]; then git clone git@github.com:Juniper/contrail-web-controller.git ../$(WEBUICLIENT); else cd ../$(WEBUICLIENT) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

$(WEBUITHIRDPARTY):
	if [ ! -d ../$(WEBUITHIRDPARTY) ]; then git clone git@github.com:Juniper/contrail-webui-third-party.git ../$(WEBUITHIRDPARTY); else cd ../$(WEBUITHIRDPARTY) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

repos: $(WEBUISERVER) $(WEBUICLIENT) $(WEBUITHIRDPARTY)

fetch-pkgs-prod:
	make clean
	rm -rf node_modules
	mkdir -p node_modules
	cp -rf $(THIRD_PARTY)/node_modules/* node_modules/.

fetch-pkgs-dev:
	make clean
	rm -rf node_modules
	mkdir -p node_modules
	python ../contrail-webui-third-party/fetch_packages.py -f ../contrail-webui-third-party/packages.xml    
	python ../contrail-webui-third-party/fetch_packages.py -f ../contrail-webui-third-party/packages_dev.xml    
	cp -rf $(THIRD_PARTY)/node_modules/* node_modules/.

package:
	make clean
	make fetch-pkgs-prod 
	rm -f webroot/html/dashboard.html
	rm -f webroot/html/login.html
	rm -f webroot/html/login-error.html
	cp -a webroot/html/dashboard.tmpl webroot/html/dashboard.html
	cp -a webroot/html/login.tmpl webroot/html/login.html
	cp -a webroot/html/login-error.tmpl webroot/html/login-error.html
	./generate-files.sh 'prod-env' $(REPO)
	./dev-install.sh
	./prod-dev.sh webroot/html/dashboard.html prod_env dev_env true
	./prod-dev.sh webroot/html/login.html prod_env dev_env true
	./prod-dev.sh webroot/html/login-error.html prod_env dev_env true

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
	
dev-env:
	mkdir -p webroot/html
	ln -sf ../../webroot/html/dashboard.tmpl webroot/html/dashboard.html
	ln -sf ../../webroot/html/login.tmpl webroot/html/login.html
	ln -sf ../../webroot/html/login-error.tmpl webroot/html/login-error.html
	./generate-files.sh "dev-env" $(REPO)
	./dev-install.sh
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
	./generate-files.sh "prod-env" $(REPO)
	./dev-install.sh
	./prod-dev.sh webroot/html/dashboard.html prod_env dev_env true
	./prod-dev.sh webroot/html/login.html prod_env dev_env true
	./prod-dev.sh webroot/html/login-error.html prod_env dev_env true
	make make-ln

clear-cache-dev:
	./prod-dev.sh webroot/html/dashboard.html dev_env prod_env false
	./prod-dev.sh webroot/html/login.html dev_env prod_env false
	./prod-dev.sh webroot/html/login-error.html dev_env prod_env false
	make make-ln

clear-cache-prod:
	./prod-dev.sh webroot/html/dashboard.html prod_env dev_env false
	./prod-dev.sh webroot/html/login.html prod_env dev_env false
	./prod-dev.sh webroot/html/login-error.html prod_env dev_env false
	make make-ln

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
	rm -rf webroot/assets

.PHONY: package dev-env prod-env test clean

