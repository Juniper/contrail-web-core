#
# Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
#

REPORTER = dot
WEBUISERVER = contrail-web-core
WEBUICLIENT = contrail-web-ui
WEBUITHIRDPARTY = contrail-web-third-party

$(WEBUISERVER):
	if [ ! -d ../$(WEBUISERVER) ]; then git clone https://github.com/Juniper/contrail-web-core.git ../$(WEBUISERVER); else cd ../$(WEBUISERVER) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

$(WEBUICLIENT):
	if [ ! -d ../$(WEBUICLIENT) ]; then git clone https://github.com/Juniper/contrail-web-ui.git ../$(WEBUICLIENT); else cd ../$(WEBUICLIENT) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

$(WEBUITHIRDPARTY):
	if [ ! -d ../$(WEBUITHIRDPARTY) ]; then git clone https://github.com/Juniper/contrail-web-third-party.git ../$(WEBUITHIRDPARTY); else cd ../$(WEBUITHIRDPARTY) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

repos: $(WEBUISERVER) $(WEBUICLIENT) $(WEBUITHIRDPARTY)

package:
	cp -a ../$(WEBUICLIENT)/* .
	cp -a ../$(WEBUITHIRDPARTY)/node_modules node_modules
	./generate-files.sh
	./dev-install.sh
	./prod-dev.sh html/dashboard.html prod_env dev_env true
	./prod-dev.sh html/login.html prod_env dev_env true
	./prod-dev.sh html/login-error.html prod_env dev_env true

all:	
	ln -sf ../$(WEBUICLIENT)/* .
	ln -sf ../$(WEBUITHIRDPARTY)/node_modules node_modules
	./generate-files.sh
	./dev-install.sh

dev-env:
	make all
	./prod-dev.sh html/dashboard.html dev_env prod_env true
	./prod-dev.sh html/login.html dev_env prod_env true
	./prod-dev.sh html/login-error.html dev_env prod_env true

prod-env:
	make all 
	./prod-dev.sh html/dashboard.html prod_env dev_env true
	./prod-dev.sh html/login.html prod_env dev_env true
	./prod-dev.sh html/login-error.html prod_env dev_env true

rem-ts-dev:
	./prod-dev.sh html/dashboard.html dev_env prod_env false
	./prod-dev.sh html/login.html dev_env prod_env false
	./prod-dev.sh html/login-error.html dev_env prod_env false

rem-ts-prod:
	./prod-dev.sh html/dashboard.html prod_env dev_env false
	./prod-dev.sh html/login.html prod_env dev_env false
	./prod-dev.sh html/login-error.html prod_env dev_env false

check: test

test: test-integration
         
test-integration:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \ 
	tests/integration/*.js
             
test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	--reporter $(REPORTER) \
	tests/unit/*.js 

clean:
	rm -f src/serverroot/jobs/core/jobsCb.api.js
	rm -f src/serverroot/web/core/feature.list.js
	rm -f src/serverroot/web/routes/url.routes.js
	rm -rf node_modules
	rm -rf webroot
	rm -rf html

.PHONY: package dev-env prod-env test test-integration test-unit clean

