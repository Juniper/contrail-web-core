define([
        'text!core-basedir/templates/core.common.tmpl',
        'web-utils',
        'config_global',
        'contrail-layout',
        'handlebars-utils',          
        'contrail-common',           
        'uuid',
        'protocol',
        'xdate',
        'ipv6',
        //Third-party
        'handlebars',
        'jsonpath'
        //Combining from layout-libs
        ], function(CoreCommonTmpls) {
            $("body").append(CoreCommonTmpls);
            console.info("loaded nonamd.libs");
        });
