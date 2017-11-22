#!/usr/bin/env bash
#
#
# Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
#

websslpath=./keys
sslsub=/C=US/ST=CA/L=Sunnyvale/O=JuniperNetworks/OU=JuniperCA/CN=ContrailCA

if [ ! -e $websslpath/cs-key.pem ] && [ ! -e $websslpath/cs-cert.pem ]; then
    mkdir -p $websslpath
    openssl req -new -newkey rsa:2048 -nodes -out $websslpath/certrequest.csr \
        -keyout $websslpath/cs-key.pem -subj $sslsub
    openssl x509 -req -days 730 -in $websslpath/certrequest.csr -signkey \
        $websslpath/cs-key.pem -out $websslpath/cs-cert.pem
fi
