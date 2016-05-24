/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var contrail = new Contrail();

function Contrail() {
    var templates = {};
    this.format = function () {
        var args = arguments;
        return args[0].replace(/\{(\d+)\}/g, function (m, n) {
            n = parseInt(n) + 1;
            return args[n];
        });
    };
    this.getTemplate4Id = function(elementId, key) {
        var templateKey = key == null ? elementId : key;
        var template = templates[templateKey];
        if(template == null) {
            template = Handlebars.compile($('#' + elementId).html());
            templates[templateKey] = template;
        }
        return template;
    };
    this.getTemplate4Source = function(source, key) {
        if(!contrail.checkIfExist(templates[key])) {
            templates[key] = Handlebars.compile(source)
        }
        return templates[key];

    };

    this.checkIfExist = function(value) {
        var exist = true;
        if(value == null ||  typeof value  == "undefined") {
            exist = false;
        }
        return exist;
    };

    this.checkIfKnockoutBindingExist = function (id) {
        return this.checkIfExist(ko.dataFor(document.getElementById(id)))
    };

    this.handleIfNull = function(value, defaultValue) {
        if(value == null || typeof value == 'undefined') {
            return defaultValue;
        } else {
            return value;
        }
    };

    this.handleIfNaN = function(value, defaultValue) {
        if(isNaN(value)) {
            return defaultValue;
        } else {
            return value;
        }
    };

    this.checkAndReplace = function(value, ifValue, replaceValue) {
        if(value == null || typeof value == 'undefined' || value == ifValue) {
            return replaceValue;
        } else {
            return value;
        }
    };

    this.checkIfFunction = function(value) {
        var isFunction = true;
        if(value == null ||  typeof value  != "function") {
            isFunction = false;
        }
        return isFunction;
    };
    /*
        Function to check if key exist inside an object
        deep (Boolean): If true, the search becomes recursive (aka. deep copy).
        valueObject : Object to be searched.
        pathString: path to be traversed, separated by .(dot)
     */
    this.checkIfKeyExistInObject = function(deep, valueObject, pathString) {
        if (!contrail.checkIfExist(valueObject)) {
            return false;
        } else {
            if (deep) {
                var pathArray = pathString.split('.'),
                    traversedValue = valueObject,
                    returnFlag = true;
                $.each(pathArray, function (pathKey, pathValue) {
                    if (contrail.checkIfExist(traversedValue[pathValue])) {
                        traversedValue = traversedValue[pathValue];
                    } else {
                        returnFlag = false;
                        return;
                    }
                });

                return returnFlag;
            } else {
                return contrail.checkIfExist(valueObject[pathString]);
            }
        }
    };
    this.getObjectValueByPath = function(valueObject, pathString) {
        var pathArray = pathString.split('.'),
            returnValue = valueObject;

        $.each(pathArray, function (pathKey, pathValue) {
            if (contrail.checkIfExist(returnValue[pathValue])) {
                returnValue = returnValue[pathValue];
            } else {
                returnValue = null;
                return;
            }
        });

        return returnValue
    };
    this.parseErrorMsgFromXHR = function(xhr) {
        var errorMsg = '';
        if(contrail.checkIfExist(xhr.errorThrown)) {
            errorMsg = xhr.errorThrown;
        } else if(contrail.checkIfExist(xhr.responseText)) {
            errorMsg = xhr.responseText;
            if(errorMsg.length > 100) {
                errorMsg = errorMsg.substring(0, 100) + '...';
            }
        } else {
            errorMsg = 'Request Status Code: ' + xhr.status + ', Status Text: ' + xhr.statusText;
        }
        return errorMsg;
    };
    this.ajaxHandler = function (config, initHandler, successHandler,
        failureHandler, cbparam) {
        var contentType = config['contentType'], dataType = config['dataType'],
            methodType = config['type'], cacheEnabled = config['cache'],
            reqTimeOut = config['timeout'], dataUrl = config['url'],
            postData = config['data'], ajaxConfig = {};

        ajaxConfig.async = contrail.checkIfExist(config.async) ? config.async : true;

        cacheEnabled = (cacheEnabled) == null ? false : cacheEnabled;

        if(initHandler != null) {
            initHandler();
        }

        if (isSet(methodType)) {
            if (methodType == "POST" || methodType == "PUT" || methodType == "DELETE") {
                if (!isSet(postData)) {
                    postData = "{}";
                }
                ajaxConfig.contentType = (contentType == null)? "application/json; charset=utf-8" :
                    contentType;
            }
        } else {
            methodType == "GET";
        }
        ajaxConfig.dataType = (dataType == null)? "json" : dataType;
        ajaxConfig.type = methodType;
        ajaxConfig.cache = cacheEnabled;
        ajaxConfig.url = dataUrl;
        ajaxConfig.data = postData;

        if (isSet(reqTimeOut) && isNumber(reqTimeOut) && reqTimeOut > 0) {
            ajaxConfig.timeout = reqTimeOut;
        } else {
            ajaxConfig.timeout = 30000;
        }

        $.ajax(ajaxConfig).success(function(response){
            successHandler(response, cbparam);
        }).fail(function (error) {
            if (error['statusText'] === "timeout") {
                error['responseText'] = "Request timeout.";
            }
            if (contrail.checkIfFunction(failureHandler)) {
                failureHandler(error);
            }
        });
    };

    this.truncateText = function(text, size){
    	var textLength = text.length;
        if(textLength <= size){
    		return text;
    	} else{
    		return text.substr(0, (size - 6)) + '...' + text.substr((textLength - 3), textLength);
    	}
    };

    this.getCookie = function(name) {
        if(isSet(name) && isString(name)) {
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
                var x = cookies[i].substr(0, cookies[i].indexOf("="));
                var y = cookies[i].substr(cookies[i].indexOf("=") + 1);
                x = x.replace(/^s+|s+$/g, "").trim();
                if (x == name)
                    return unescape(y);
            }
        }
        return false;
    };

    this.setCookie = function(name, value) {
        var secureCookieStr = "";
        var insecureAccess = getValueByJsonPath(globalObj, 'webServerInfo;insecureAccess', false);
        if (globalObj['test-env'] == globalObj['env'] + '-test') {
            secureCookieStr = "";
        } else if (false == insecureAccess) {
            secureCookieStr = "; secure";
        }
        document.cookie = name + "=" + escape(value) +
            "; expires=Sun, 17 Jan 2038 00:00:00 UTC; path=/" + secureCookieStr;
    };

    this.formatJSON2HTML = function(json, formatDepth, ignoreKeys){
        if(typeof json == 'string'){
            json = JSON.parse(json);
        }

        return '<pre class="pre-format-JSON2HTML">' + formatJsonObject(json, formatDepth, 0, ignoreKeys) + '</pre>';
    };
    
    this.isItemExists = function(value, data){
        var isThere = false;
        for(var i = 0; i < data.length; i++) {
            for(var j = 0; j < data[i].children.length; j++) {
                if(value === data[i].children[j].value) {
                    return true;
                }
            }
        }
        return isThere;
    };

    this.appendNewItemMainDataSource = function(value, data){
        var valueArray = value.split(cowc.DROPDOWN_VALUE_SEPARATOR);
        if(valueArray.length === 2) {
            for(var i = 0; i < data.length; i++) {
                if(data[i].value === valueArray[1]) {
                    data[i].children.push(
                        {
                           text : valueArray[0],
                           id : value,
                           value : value ,
                           parent : valueArray[1]
                        }
                    );
                    break;
                }
            }
        }
    };

    function formatJsonObject(jsonObj, formatDepth, currentDepth, ignoreKeys) {
    	var output = '',
    		objType = {type: 'object', startTag: '{', endTag: '}'};
    	
    	if(jsonObj instanceof Array){
    		objType = {type: 'array', startTag: '[', endTag: ']'};
    	}
    	
		if(formatDepth == 0){
			output += '<i class="node-' + currentDepth + ' icon-plus expander"></i> ' + objType.startTag + '<ul data-depth="' + currentDepth + '" class="node-' + currentDepth + ' node hide raw">' + 
						JSON.stringify(jsonObj) + '</ul><span class="node-' + currentDepth + ' collapsed expander"> ... </span>' + objType.endTag;
		}
		else {
			output += '<i class="node-' + currentDepth + ' icon-minus collapser"></i> ' + objType.startTag + '<ul data-depth="' + currentDepth + '" class="node-' + currentDepth + ' node">';
            $.each(jsonObj, function(key, val){
                if (!contrail.checkIfExist(ignoreKeys) || (contrail.checkIfExist(ignoreKeys) && ignoreKeys.indexOf(key) === -1)) {
                    if (objType['type'] == 'object') {
                        output += '<li class="key-value"><span class="key">' + key + '</span>: ';
                    }
                    else {
                        output += '<li class="key-value">';
                    }

                    if (val != null && typeof val == 'object') {
                        output += '<span class="value">' + formatJsonObject(val, formatDepth - 1, currentDepth + 1) + '</span>';
                    }
                    else {
                        output += '<span class="value ' + typeof val + '">' + val + '</span>';
                    }
                    output += '</li>';
                }
			});
			output += '</ul><span class="node-' + currentDepth + ' collapsed hide expander"> ... </span>' + objType.endTag;
		}
		return output;
    };
};

