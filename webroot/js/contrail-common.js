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
    this.checkIfExist = function(value) {
        var exist = true;
        if(value == null ||  typeof value  == "undefined") {
            exist = false;
        }
        return exist;
    };
    this.checkIfFunction = function(value) {
        var isFunction = true;
        if(value == null ||  typeof value  != "function") {
            isFunction = false;
        }
        return isFunction;
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
    this.ajaxHandler = function (config, initHandler, successHandler, failureHandler) {
        var contentType = null, dataType = null,
            methodType = config['type'], cacheEnabled = config['cache'],
            reqTimeOut = config['timeout'], dataUrl = config['url'],
            postData = config['data'], ajaxConfig = {};

        cacheEnabled = (cacheEnabled) == null ? false : cacheEnabled;

        if(initHandler != null) {
            initHandler();
        }

        if (isSet(methodType)) {
            if (methodType == "POST" || methodType == "PUT" || methodType == "DELETE") {
                if (!isSet(postData)) {
                    postData = "{}";
                }
                contentType = "application/json; charset=utf-8";
                dataType = "json";
                ajaxConfig.dataType = dataType;
                ajaxConfig.contentType = contentType;
            }
        } else {
            methodType == "GET";
        }

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
            successHandler(response);
        }).fail(function(response){
            failureHandler(response);
        });
    };
    this.formatJSON2HTML = function(json, formatDepth){
    	if(typeof json == 'string'){
    		json = JSON.parse(json);
    	}
		return '<pre class="pre-format-JSON2HTML">' + formatJsonObject(json, formatDepth, 0) + '</pre>';
    };
    
    function formatJsonObject(jsonObj, formatDepth, currentDepth) {
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
				if(objType['type'] == 'object') {
					output += '<li class="key-value"><span class="key">' + key + '</span>: ';
				}
				else{
					output += '<li class="key-value">';	
				}
				
				if(typeof val == 'object'){
					output += '<span class="value">' + formatJsonObject(val, formatDepth-1, currentDepth+1) + '</span>';
				}
				else {
					output += '<span class="value ' + typeof val + '">' + val + '</span>';
				}
				output += '</li>';
			});
			output += '</ul><span class="node-' + currentDepth + ' collapsed hide expander"> ... </span>' + objType.endTag;
		}
		return output;
    };

    $('.pre-format-JSON2HTML .expander').live('click', function(){
		var selfParent = $(this).parent(),
			jsonObj = {};
		selfParent.children('i').removeClass('icon-plus').removeClass('expander').addClass('icon-minus').addClass('collapser');
		if(selfParent.children('.node').hasClass('raw')){
			jsonObj = JSON.parse(selfParent.children('ul.node').text());
			selfParent.empty().append(formatJsonObject(jsonObj, 2, parseInt(selfParent.children('.node').data('depth')) + 1));
		}
		selfParent.children('.node').show('fast');
		selfParent.children('.collapsed').hide('fast');
    });
    $('.pre-format-JSON2HTML .collapser').live('click', function(){
    	var selfParent = $(this).parent();
    	selfParent.children('i').removeClass('icon-minus').removeClass('collapser').addClass('icon-plus').addClass('expander');
		selfParent.children('.collapsed').show('fast');
		selfParent.children('.node').hide('fast');
	});
    
};

(function($) {
	//Plugin to serializeObject similar to serializeArray.
	$.fn.serializeObject = function() {
	   var o = {};
	   var a = this.serializeArray();
	   $.each(a, function() {
	       if (o[this.name]) {
	           if (!o[this.name].push) {
	               o[this.name] = [o[this.name]];
	           }
	           o[this.name].push(this.value || '');
	       } else {
	           o[this.name] = this.value || '';
	       }
	   });
	   return o;
	};
})(jQuery);