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

repos: $(WEBUICLIENT) $(WEBUITHIRDPARTY)

package: 
	cp -a ../$(WEBUICLIENT)/* .
	cp -a ../$(WEBUITHIRDPARTY)/node_modules node_modules
	./dev-install.sh
	./generate-files.sh

all:	
	ln -sf ../$(WEBUICLIENT)/* .
	ln -sf ../$(WEBUITHIRDPARTY)/node_modules node_modules
	./dev-install.sh
	./generate-files.sh

dev-env:
	make all
	./prod-dev.sh html/dashboard.html dev_env prod_env
	./prod-dev.sh html/login.html dev_env prod_env

prod-env:
	make all
	./prod-dev.sh html/dashboard.html prod_env dev_env
	./prod-dev.sh html/login.html prod_env dev_env

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

