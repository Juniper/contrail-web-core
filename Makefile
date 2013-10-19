#
# Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
#

REPORTER = dot
WEBDIR = ../web-ui
UIDIR = $(WEBDIR)/ui
THIRDPARTYDIR =../web-ui/third-party
WEBUISERVER = contrail-web-core
WEBUICLIENT = contrail-web-ui
WEBUITHIRDPARTY = contrail-web-third-party

$(WEBUISERVER):
	if [ ! -d ../$(WEBUISERVER) ]; then git clone https://github.com/Juniper/contrail-web-core.git ../$(WEBUISERVER); else cd ../$(WEBUISERVER) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

$(WEBUICLIENT):
	if [ ! -d ../$(WEBUICLIENT) ]; then git clone https://github.com/Juniper/contrail-web-ui.git ../$(WEBUICLIENT); else cd ../$(WEBUICLIENT) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

$(WEBUITHIRDPARTY):
	if [ ! -d ../$(WEBUITHIRDPARTY) ]; then git clone https://github.com/Juniper/contrail-web-third-party.git ../$(WEBUITHIRDPARTY); else cd ../$(WEBUITHIRDPARTY) && touch testFile && git stash; git pull --rebase; git stash pop; rm testFile; fi

#package: $(WEBUISERVER) $(WEBUICLIENT) $(WEBUITHIRDPARTY)
package: 
	ln -sf ../$(WEBUICLIENT)/* .
	ln -sf ../$(WEBUITHIRDPARTY)/node_modules node_modules
	make -f Makefile.all

all:	
	make package

dev-install:
	make package

clean:

