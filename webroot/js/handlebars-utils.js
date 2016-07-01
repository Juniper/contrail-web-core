/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

Handlebars.registerHelper('IfCompare', function(lvalue, rvalue, options) {
    if (arguments.length < 3) {
        throw new Error("IfCompare helper function requires 2 parameters.");
    }

    var operator = options.hash.operator || "==",
        operators = {
            '==': function(l, r) { return l == r; },
            '===': function(l, r) { return l === r; },
            '!=': function(l, r) { return l != r; },
            '!==': function(l, r) { return l !== r; },
            '<': function(l, r) { return l < r; },
            '>': function(l, r) { return l > r; },
            '<=': function(l, r) { return l <= r; },
            '>=': function(l, r) { return l >= r; },
            '%3': function(l, r) { return (l % 3) == r; },
            '%2': function(l, r) { return (l % 2) == r; },
            '&&': function(l, r) { return l && r; },
            '||': function(l, r) { return l || r; },
            'lessByOne': function(l, r) { return (r - l) == 1; },
            'typeof': function(l, r) { return typeof l == r; }
        };

    if (!operators[operator]) {
        throw new Error("IfCompare helper function doesn't support given operator " + operator + ".");
    }

    var result = operators[operator](lvalue, rvalue);

    if( result ) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('ArthematicOps', function(lvalue, rvalue, options) {
    var operator = options.hash.operator;
    operators = {
        '+': function(l, r) { return l + r; },
        '-': function(l, r) { return l - r; }
    };
    return operators[operator](lvalue,rvalue);
});

Handlebars.registerHelper('typeof', function(variable, dataType,options) {
    if (typeof variable == dataType) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('getRelativeTime', function(timeStamp, options) {
    return diffDates(new XDate(parseInt(timeStamp/1000)),new XDate());
});

Handlebars.registerHelper('syntaxHighlight', function(rawdata, options) {
    return syntaxHighlight(rawdata);
});

Handlebars.registerHelper('formatJSON2HTML', function(rawdata, ignoreKeys, options) {
    return contrail.formatJSON2HTML(rawdata, 2, ignoreKeys);
});

Handlebars.registerHelper('formatGridJSON2HTML', function(rawdata, options) {
    var rawDataClone = $.extend(true,{}, rawdata);
    if (contrail.checkIfExist(rawDataClone.cgrid)) {
        delete rawDataClone.cgrid;
    }
    return contrail.formatJSON2HTML(rawDataClone,2);
});

Handlebars.registerHelper('formatString2HTML', function(string) {
    return string;
});

Handlebars.registerHelper('makeItValidDOMId', function(id, options) {
    return id.replace(/:/g,'-');
});

//core.common.tmpl is loaded via core-bundle
require(['core-bundle'],function() {
    Handlebars.registerPartial('scatterTooltip',$('#title-lblval-tooltip-template').html());
    Handlebars.registerPartial('scatterTooltipNew',$('#title-lblval-tooltip-template-new').html());
});


//Handlebar register helper for formatting json in details template
Handlebars.registerHelper('displayJson',function(rawjson){
	return syntaxHighlight(rawjson);
});

/* 
 * Register Helper to set index value inside the loop to be used under nested loops
 */
Handlebars.registerHelper('setLoopIndex', function(value){
    this.loopIndex = Number(value); 
});

Handlebars.registerHelper('eachCustomIncrement', function(context,loopstart,incrementor,options){
    var ret = "";
    for(var i = loopstart, j = context.length; i < j; i += Number(incrementor)) {
      ret = ret + options.fn(context[i]);
    }
    return ret;
});

Handlebars.registerHelper('jsonStringify', function(jsonObj) {
    return JSON.stringify(jsonObj);
});

Handlebars.registerHelper('getValue', function(context,key,options) {
    if(typeof(context) == 'string') {
        try{
            context = JSON.parse(context);
        }catch(e){
            throw new Error("Parameter passed is not an object");
        }
    }
    if($.isArray(context) && context[key] != null)
        return context[key]; 
    if(typeof(context) == 'object' && context[key] != null) 
        return context[key];
    else
        throw new Error("Parameter passed is not an object or the key doesn't exist");
});
/*
 * This method checks the menuItem object for hash if it find any hash property then it will return, else it will check for the 
 * sub menu items of the object and returns the first menu item object hash and query params if any and returns as string
 */
Handlebars.registerHelper('getHashFromMenuItem',function(menuItem){
    var result = {},params = {},childItems = [];
    if(menuItem['items'] != null && menuItem['items']['item'] != null) {
        childItems = menuItem['items']['item'];
        //If hash is not found for its first immediate children,look for one-level down
        var firstLevelMenuObj,leafLevelMenuObj;
        firstLevelMenuObj = childItems[0];
        leafLevelMenuObj = firstLevelMenuObj;
        if(firstLevelMenuObj != null && firstLevelMenuObj['hash'] == null)
            leafLevelMenuObj = firstLevelMenuObj['items']['item'][0];
        if(leafLevelMenuObj == null || leafLevelMenuObj['hash'] == null)
            return;
        result['p'] =  leafLevelMenuObj['hash'];
        $.each(ifNull(leafLevelMenuObj['queryParams'],[]),function(key,value){
            params[key] = value
        });
        result['q'] = params;
        // console.log(location.href);
        // console.log(result);
        // console.log($.param(result));
        return location.href + '#' + $.param(result);
        // return $.param.fragment(location.href,result,2);
    } else {
        if(menuItem['hash'] != null)
            result['p'] = menuItem['hash'];
        if(menuItem['queryParams'] != null){
            $.each(menuItem['queryParams'],function(key,value){
                params[key] = value
            });
            result['q'] = params;
        }
        // console.log(location.href);
        return location.href + '#' + $.param(result);
        // return $.param.fragment(location.href,result,2)
    }
});

Handlebars.registerHelper('showHidePIDetails', function(type) {
    return type === 'Physical' ? 'show' : 'hide';
});

Handlebars.registerHelper('showHideLIDetails', function(type) {
    return type === 'Logical' ? 'show' : 'hide';
});

Handlebars.registerHelper('formatVirtualRouterType', function(type) {
    return formatVirtualRouterType(type);
});

Handlebars.registerHelper('showLIServer', function(type) {
    return type != null && type === 'L2'  ? 'show' : 'hide';
});

Handlebars.registerHelper('showLISubnet', function(type) {
    return type != null && type === 'L3' ? 'show' : 'hide';
});

Handlebars.registerHelper('showDeviceOwner', function(block) {
    if(globalObj.webServerInfo.loggedInOrchestrationMode == 'vcenter')
        return 'hide'; 
    else
        return 'show';
});

Handlebars.registerHelper('getLabel', function (label, labelKey, feature) {
    if(label != null && label != "undefined") {
        return label;
    }
    if (feature == cowc.APP_CONTRAIL_SM) {
        return smwl.get(labelKey);
    } else if (feature == cowc.APP_CONTRAIL_CONTROLLER) {
        return ctwl.get(labelKey);
    } else if (feature == cowc.APP_CONTRAIL_STORAGE) {
        return swl.get(labelKey);
    }
});

Handlebars.registerHelper('getJSONValueByPath', function (path, obj) {
    var pathValue = cowu.getJSONValueByPath(path, obj);
    return $.isArray(pathValue) ? pathValue.join(', ') : pathValue;
});

Handlebars.registerHelper('getValueByConfig', function (obj, options) {
    var config = $.parseJSON(decodeURIComponent(options.hash.config)),
        key = config.key,
        value = cowu.getJSONValueByPath(key, obj),
        templateGenerator = config.templateGenerator,
        templateGeneratorConfig = config.templateGeneratorConfig,
        returnValue;

    if(value == '-') {
        return value;
    }

    switch (templateGenerator) {
        case 'TextGenerator':
            if (contrail.checkIfExist(templateGeneratorConfig)) {
                var formatterKey = templateGeneratorConfig.formatter,
                    options = {
                        iconClass: templateGeneratorConfig.iconClass,
                        obj: obj,
                        key: key
                    };

                return cowf.getFormattedValue(formatterKey, value, options);
            } else {
                returnValue = $.isArray(value) ? value.join(', ') : value;
            }
        break;

        case 'LinkGenerator':

            var linkTemplate, formatterKey, formatterOptions = {},
                params = contrail.handleIfNull(templateGeneratorConfig.params, {}),
                hrefLinkArray = [], hrefLink = 'javascript:void(0)';
            if(templateGeneratorConfig.template != null) {
                linkTemplate = Handlebars.compile(templateGeneratorConfig.template);
            }
            $.each(params, function(paramKey, paramValue) {
                if ($.isPlainObject(paramValue)) {
                    if (paramValue.type == 'fixed') {
                        params[paramKey] = paramValue.value;
                    } else if (paramValue.type == 'derived') {
                        params[paramKey] = cowu.getJSONValueByPath(paramValue.value, obj)
                    }
                } else {
                    params[paramKey] = cowu.getJSONValueByPath(paramValue, obj)
                }
            });

            if (contrail.checkIfExist(templateGeneratorConfig.formatter)) {
                formatterKey = templateGeneratorConfig.formatter;
                formatterOptions['linkGenerator'] = true;
            }

            if (formatterKey != null) {
                value = cowf.getFormattedValue(formatterKey, value, formatterOptions);
            }

            if ($.isArray(value)) {
                $.each(value, function(vKey, vValue) {
                    if(linkTemplate != null) {
                        hrefLink = linkTemplate({key: vValue, params: params});
                    }
                    hrefLinkArray.push('<a class="value-link" target="_blank" href="' + encodeURI(hrefLink) + '">' + vValue + '</a>');
                });

                returnValue = hrefLinkArray.join('');
            } else {
                if(linkTemplate != null) {
                    hrefLink = linkTemplate({key: value, params: params});
                }
                returnValue = '<a class="value-link" target="_blank" href="' + encodeURI(hrefLink) + '">' + value + '</a>';
            }
        break;

        case 'json' :
            return contrail.formatJSON2HTML(value,7);
        break;

        case 'PolicyRuleGenerator':
            var policyRuleArray = [],
                policyRuleTemplate = contrail.checkIfExist(templateGeneratorConfig.template) ?
                    Handlebars.compile(templateGeneratorConfig.template) : contrail.getTemplate4Id(cowc.TMPL_NETWORK_POLICY_RULE),
                templateOptions = contrail.checkIfExist(templateGeneratorConfig.templateOptions) ?
                    templateGeneratorConfig.templateOptions : {};
            formatterKey = contrail.checkIfExist(templateGeneratorConfig.formatter) ?
                    templateGeneratorConfig.formatter : null,
                formatterOptions = contrail.checkIfExist(templateGeneratorConfig.formatterOptions) ?
                    templateGeneratorConfig.formatterOptions : {};

            if (formatterKey != null) {
                value = cowf.getFormattedValue(formatterKey, value, formatterOptions);
            }

            if ($.isArray(value)) {
                $.each(value, function (vKey, vValue) {
                    $.each(vValue.src_addresses, function(idx, srcAddr) {
                        if (srcAddr.virtual_network) {
                            var linkTemplate = Handlebars.compile(ctwc.URL_NETWORK),
                                vn = srcAddr.virtual_network;
                            if (vn === 'any') {
                                srcAddr.virtual_network_tmpl = vn.toUpperCase();
                            } else {
                                srcAddr.virtual_network_tmpl = '<a class="value-link" target="_blank" href="' + linkTemplate({
                                        key: vn,
                                        params:{}
                                    }) + '">' + vn + '</a>';
                            }
                        }
                    });
                    $.each(vValue.dst_addresses, function(idx, dstAddr) {
                        if (dstAddr.virtual_network) {
                            var linkTemplate = Handlebars.compile(ctwc.URL_NETWORK),
                                vn = dstAddr.virtual_network;
                            if (vn === 'any') {
                                dstAddr.virtual_network_tmpl = vn.toUpperCase();
                            } else {
                                dstAddr.virtual_network_tmpl = '<a class="value-link" target="_blank" href="' + linkTemplate({
                                        key: vn,
                                        params: {}
                                    }) + '">' + vn + '</a>';
                            }
                        }
                    });
                    policyRuleArray.push(policyRuleTemplate({data: vValue, options: templateOptions}));
                });
                returnValue = policyRuleArray.join('');
            } else {
                returnValue = policyRuleTemplate({data: value, options: templateOptions});
            }
            break;
    };

    return returnValue;

});

Handlebars.registerHelper('IfValidJSONValueByPath', function (path, obj, index, options) {
    var result = (cowu.getJSONValueByPath(path, obj) != "-") ? true : false;
    if(result || index == 0) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('IfValidJSONValueByPathLength', function (path, obj, options) {
    var value = cowu.getJSONValueByPath(path, obj),
        result = (value != "-") ? true : false;
    if(result && value.length > 0) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('encodedVN', function(jsonObj) {
    if(null !== jsonObj && typeof jsonObj !== "undefined" &&
        jsonObj.hasOwnProperty('q') &&
        jsonObj['q'].hasOwnProperty('srcVN') && 
        jsonObj['q']['srcVN'].indexOf(' ') !== -1)
        jsonObj['q']['srcVN'] = encodeURIComponent(jsonObj['q']['srcVN']);
    return JSON.stringify(jsonObj);
});

Handlebars.registerHelper('handleIfNull', function(value, defaultValue) {
    return contrail.handleIfNull(value, defaultValue);
});

Handlebars.registerHelper('printJSON', function(jsonObject) {
    return JSON.stringify(jsonObject);
});

Handlebars.registerHelper ('truncate', function (str, len) {
    if (typeof(str) == "object") {
            str = JSON.stringify(str);
    }
    if (str.length > len && str.length > 0) {
        var new_str = str + " ";
        new_str = str.substr (0, len);
        new_str = str.substr (0, new_str.lastIndexOf(" "));
        new_str = (new_str.length > 0) ? new_str : str.substr (0, len);

        return new Handlebars.SafeString ( new_str +'...' ); 
    }
    return str;
});

Handlebars.registerHelper('toUpperCase', function(str) {
    return str.toUpperCase();
});
