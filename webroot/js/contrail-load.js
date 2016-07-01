/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

$(document).ready(function () {

    //Listener to expand/collapse widget based on toggleButton in widget header
    //$("#content-container").find('div.widget-box div.widget-header div.widget-toolbar a[data-action="collapse"]').live('click', function () {
    var temp = $("#content-container").find('div.widget-box div.widget-header div.widget-toolbar a[data-action="collapse"]');
    $(document).on('click', temp, function () {
        $(this).find('i').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        var widgetBodyElem = $(this).parents('div.widget-box').find('div.widget-body');
        var widgetBoxElem = $(this).parents('div.widget-box');
        $(widgetBoxElem).toggleClass('collapsed');
    });

    // expand/collapse widget on click of widget header
    temp = $("#content-container").find('div.widget-box div.widget-header h4');
    $(document).on('click', temp, function () {
        $(this).parents('div.widget-header').find('a[data-action="collapse"] i').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        var widgetBodyElem = $(this).parents('div.widget-box').find('div.widget-body');
        var widgetBoxElem = $(this).parents('div.widget-box');
        $(widgetBoxElem).toggleClass('collapsed');
    });

    //$('.preBlock i').on('click', function () {
    $(document).on('click', '.preBlock i', function () {
        $(this).toggleClass('fa-minus').toggleClass('fa-plus');
        if ($(this).hasClass('fa-minus')) {
            $(this).parent('.preBlock').find('.collapsed').hide();
            $(this).parent('.preBlock').find('.expanded').show();
            $(this).parent('.preBlock').find('.preBlock').show();
            if ($(this).parent('.preBlock').find('.preBlock').find('.expanded').is(':visible')) {
                $(this).parent('.preBlock').find('.preBlock').find('.collapsed').hide();
                $(this).parent('.preBlock').find('.preBlock').find('i').removeClass('fa-plus').addClass('fa fa-minus');
            }
            else {
                $(this).parent('.preBlock').find('.preBlock').find('.collapsed').show();
                $(this).parent('.preBlock').find('.preBlock').find('i').removeClass('fa-minus').addClass('fa fa-plus');
            }
        }
        else if ($(this).hasClass('fa-plus')) {
            $(this).parent('.preBlock').find('.collapsed').show();
            $(this).parent('.preBlock').find('.expanded').hide();
        }
    });

    $(window).on('scroll', function () {
        scrollHeight = $(document).height() - $(window).height();
        var current_scroll = $(this).scrollTop();

        if (current_scroll < 50 || previous_scroll - current_scroll > 40) {
            $("#pageHeader").show();
            $('#sidebar').removeClass('scrolled');
            $('#breadcrumbs').removeClass('scrolled');
            $('#back-to-top').fadeOut();
        }
        else {
            $("#pageHeader").hide();
            $('#sidebar').addClass('scrolled');
            $('#breadcrumbs').addClass('scrolled');
            $('#back-to-top').fadeIn();
        }
        if (current_scroll < scrollHeight) {
            previous_scroll = $(window).scrollTop();
        }
    });

    $('#back-to-top').click(function (event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
    });


    // layoutHandler.load();

    jQuery.support.cors = true;

    //Get the CSRF token from cookie
    // globalObj['_csrf'] = getCookie('_csrf');
    // delete_cookie('_csrf');

//TODO: move all bbq code to a common location
    
    var jq_deparam_fragment;
    var str_querystring = 'querystring';
    var str_fragment = 'fragment';
    var aps = Array.prototype.slice;
    var jq_param = $.param;
    var str_location = 'location';
    var str_hashchange = 'hashchange';
    var str_href = 'href';
    var re_no_escape;
    var re_trim_querystring = /^.*\?|#.*$/g;
    var re_trim_fragment = /^.*\#/;

    function jq_deparam_sub( is_fragment, url_or_params, coerce ) {
        if ( url_or_params === undefined || typeof url_or_params === 'boolean' ) {
            // url_or_params not specified.
            coerce = url_or_params;
            url_or_params = jq_param[ is_fragment ? str_fragment : str_querystring ]();
        } else {
            url_or_params = is_string( url_or_params )
                ? url_or_params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' )
                : url_or_params;
        }

        return jq_deparam( url_or_params, coerce );
    };


    function jq_param_sub( is_fragment, get_func, url, params, merge_mode ) {
        var result,
            qs,
            matches,
            url_params,
            hash;

        if ( params !== undefined ) {
            // Build URL by merging params into url string.

            // matches[1] = url part that precedes params, not including trailing ?/#
            // matches[2] = params, not including leading ?/#
            // matches[3] = if in 'querystring' mode, hash including leading #, otherwise ''
            matches = url.match( is_fragment ? /^([^#]*)\#?(.*)$/ : /^([^#?]*)\??([^#]*)(#?.*)/ );

            // Get the hash if in 'querystring' mode, and it exists.
            hash = matches[3] || '';

            if ( merge_mode === 2 && is_string( params ) ) {
                // If merge_mode is 2 and params is a string, merge the fragment / query
                // string into the URL wholesale, without converting it into an object.
                qs = params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' );

            } else {
                // Convert relevant params in url to object.
                url_params = jq_deparam( matches[2] );

                params = is_string( params )

                    // Convert passed params string into object.
                    ? jq_deparam[ is_fragment ? str_fragment : str_querystring ]( params )

                    // Passed params object.
                    : params;

                qs = merge_mode === 2 ? params                              // passed params replace url params
                    : merge_mode === 1  ? $.extend( {}, params, url_params )  // url params override passed params
                    : $.extend( {}, url_params, params );                     // passed params override url params

                // Convert params object to a string.
                qs = jq_param( qs );

                // Unescape characters specified via $.param.noEscape. Since only hash-
                // history users have requested this feature, it's only enabled for
                // fragment-related params strings.
                if ( is_fragment ) {
                    qs = qs.replace( re_no_escape, decode );
                }
            }

            // Build URL from the base url, querystring and hash. In 'querystring'
            // mode, ? is only added if a query string exists. In 'fragment' mode, #
            // is always added.
            result = matches[1] + ( is_fragment ? '#' : qs || !matches[1] ? '?' : '' ) + qs + hash;

        } else {
            // If URL was passed in, parse params from URL string, otherwise parse
            // params from window.location.
            result = get_func( url !== undefined ? url : window[ str_location ][ str_href ] );
        }

        return result;
    };


    self.deparam = jq_deparam = function( params, coerce ) {
        var obj = {},
            coerce_types = { 'true': !0, 'false': !1, 'null': null };

        // Iterate over all name=value pairs.
        $.each( params.replace( /\+/g, ' ' ).split( '&' ), function(j,v){
            var param = v.split( '=' ),
                key = decodeURIComponent( param[0] ),
                val,
                cur = obj,
                i = 0,

            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
                keys = key.split( '][' ),
                keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if ( /\[/.test( keys[0] ) && /\]$/.test( keys[ keys_last ] ) ) {
                // Remove the trailing ] from the last keys part.
                keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat( keys );

                keys_last = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if ( param.length === 2 ) {
                val = decodeURIComponent( param[1] );

                // Coerce values.
                if ( coerce ) {
                    val = val && !isNaN(val)            ? +val              // number
                        : val === 'undefined'             ? undefined         // undefined
                        : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                        : val;                                                // string
                }

                if ( keys_last ) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for ( ; i <= keys_last; i++ ) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last
                            ? cur[key] || ( keys[i+1] && isNaN( keys[i+1] ) ? {} : [] )
                            : val;
                    }

                } else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if ( $.isArray( obj[key] ) ) {
                        // val is already an array, so push on the next value.
                        obj[key].push( val );

                    } else if ( obj[key] !== undefined ) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [ obj[key], val ];

                    } else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            } else if ( key ) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce
                    ? undefined
                    : '';
            }
        });

        return obj;
    };

    function jq_deparam_sub( is_fragment, url_or_params, coerce ) {
        if ( url_or_params === undefined || typeof url_or_params === 'boolean' ) {
            // url_or_params not specified.
            coerce = url_or_params;
            url_or_params = jq_param[is_fragment ? str_fragment : str_querystring]();
        } else {
            url_or_params = is_string( url_or_params )
                ? url_or_params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' )
                : url_or_params;
        }

        return jq_deparam( url_or_params, coerce );
    };

    jq_param[ str_querystring ]                  = curry( jq_param_sub, 0, get_querystring );
    jq_param[ str_fragment ] = jq_param_fragment = curry( jq_param_sub, 1, get_fragment );

    jq_deparam[ str_querystring ]                    = curry( jq_deparam_sub, 0 );
    jq_deparam[ str_fragment ] = jq_deparam_fragment = curry( jq_deparam_sub, 1 );

    function is_string( arg ) {
        return typeof arg === 'string';
    };

    self.getState = function( key, coerce ) {
        return key === undefined || typeof key === 'boolean'
            ? jq_deparam_fragment( key ) // 'key' really means 'coerce' here
            : jq_deparam_fragment( coerce )[ key ];
    };

    function curry( func ) {
        var args = aps.call( arguments, 1 );

        return function() {
            return func.apply( this, args.concat( aps.call( arguments ) ) );
        };
    };

    // Get location.hash (or what you'd expect location.hash to be) sans any
    // leading #. Thanks for making this necessary, Firefox!
    function get_fragment( url ) {
        return url.replace( /^[^#]*#?(.*)$/, '$1' );
    };

    // Get location.search (or what you'd expect location.search to be) sans any
    // leading #. Thanks for making this necessary, IEƒ6!
    function get_querystring( url ) {
        return url.replace( /(?:^[^?#]*\?([^#]*).*$)?.*/, '$1' );
    };

    self.pushState = jq_bbq_pushState = function( params, merge_mode ) {
        if ( is_string( params ) && /^#/.test( params ) && merge_mode === undefined ) {
            // Params string begins with # and merge_mode not specified, so completely
            // overwrite window.location.hash.
            merge_mode = 2;
        }

        var has_args = params !== undefined,
        // Merge params into window.location using $.param.fragment.
            url = jq_param_fragment( location.href,
                has_args ? params : {}, has_args ? merge_mode : 2 );

        // Set new window.location.href. Note that Safari 3 & Chrome barf on
        // location.hash = '#' so the entire URL is set.
        location.href = url;
    };

    //$(window).resize(onWindowResize);
    // lastHash = $.bbq.getState();
    lastHash = self.getState();
    

    /*var href = location.hash;
    var temp =  href.split('&').reduce(function (params, param) {
        var paramSplit = param.split('=').map(function (value) {
            return decodeURIComponent(value.replace('+', ' '));
        });
        params[paramSplit[0]] = paramSplit[1];
        return params;
    }, {});
    lastHash = temp;*/
    /*var temp1 = location.hash;
    var temp2 = temp1.split('&');
    var temp3 = temp2[1];
    var temp4 = decodeURIComponent(temp3);
    var temp = {}
    if (temp4 != "undefined") {
        var vals = temp4.split('=');
        var temp5 = vals[0].split('[')[1];
        var key = temp5.split(']')[0];
        temp[key] = vals[1];
    }
    var obj = {}
    obj['p'] = temp2[0].split('#')[1];
    obj['q'] = temp;
    lastHash = obj;*/

    $(window).on('hashchange', function () {
        /*var href = location.hash;
        var temp =  href.split('&').reduce(function (params, param) {
            var paramSplit = param.split('=').map(function (value) {
                return decodeURIComponent(value.replace('+', ' '));
            });
            params[paramSplit[0]] = paramSplit[1];
            return params;
        }, {});
        currHash = temp;*/
        /*var temp1 = location.hash;
        var temp2 = temp1.split('&');
        var temp3 = temp2[1];
        var temp4 = decodeURIComponent(temp3);
        var temp = {}
        if (temp4 != "undefined") {
            var vals = temp4.split('=');
            var temp5 = vals[0].split('[')[1];
            var key = temp5.split(']')[0];
            temp[key] = vals[1];
        }
        var obj = {}
        obj['p'] = temp2[0].split('#')[1];
        obj['q'] = temp;
        currHash = obj;*/
        //currHash = window.location.hash;//$.bbq.getState();
        currHash = self.getState();
        //Don't trigger hashChange if URL hash is updated from code
        //As the corresponding view has already been loaded from the place where hash is updated
        //Ideally,whenever to load a view,just update the hash let it trigger the handler,instead calling it manually
        if (globalObj.hashUpdated == 1) {
            globalObj.hashUpdated = 0;
            lastHash = currHash;
            return;
        }
        logMessage('hashChange', JSON.stringify(lastHash), ' -> ', currHash);
        logMessage('hashChange', JSON.stringify(currHash));
        layoutHandler.onHashChange(lastHash, currHash);
        lastHash = currHash;
    });
    // require(['contrail-elements'],function() {
    //     enableSearchAhead();
    // });
    addBrowserDetection(jQuery);
    generalInit();

    //bootstrap v 2.3.1 prevents this event which firefox's middle mouse button "new tab link" action, so we off it!
    $(document).off('click.dropdown-menu');
});

// $.fn.modal.Constructor.prototype.enforceFocus = function () {
// };

function parseWebServerInfo(webServerInfo) {
    if (webServerInfo['serverUTCTime'] != null) {
        webServerInfo['timeDiffInMillisecs'] = webServerInfo['serverUTCTime'] - new Date().getTime();
        if (Math.abs(webServerInfo['timeDiffInMillisecs']) > globalObj['timeStampTolerance']) {
            if (webServerInfo['timeDiffInMillisecs'] > 0) {
                globalAlerts.push({
                    msg: infraAlertMsgs['TIMESTAMP_MISMATCH_BEHIND'].format(diffDates(new XDate(), new XDate(webServerInfo['serverUTCTime']), 'rounded')),
                    sevLevel: sevLevels['INFO']
                });
            } else {
                globalAlerts.push({
                    msg: infraAlertMsgs['TIMESTAMP_MISMATCH_AHEAD'].format(diffDates(new XDate(webServerInfo['serverUTCTime']), new XDate(), 'rounded')),
                    sevLevel: sevLevels['INFO']
                });
            }
        }
        //Menu filename
        var featurePkgToMenuNameMap = {
            'webController': 'wc',
            'webStorage': 'ws',
            'serverManager': 'sm'
        },featureMaps = [];
        if (null != webServerInfo['featurePkg']) {
            var pkgList = webServerInfo['featurePkg'];
            for (var key in pkgList) {
                if (null != featurePkgToMenuNameMap[key]) {
                    featureMaps.push(featurePkgToMenuNameMap[key]);
                } else {
                    console.log('featurePkgToMenuNameMap key is null: ' + key);
                }
            }
            if (featureMaps.length > 0) {
                featureMaps.sort();
                globalObj['mFileName'] = 'menu_' + featureMaps.join('_') + '.xml';
            }
        }
    }
    return webServerInfo;
}

function getWebServerInfo(project, callback,fromCache) {
    var fromCache = (fromCache == null) ? true : fromCache;
    if(fromCache == false || globalObj['webServerInfo'] == null) {
        //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
        $.ajax({
            url: '/api/service/networking/web-server-info?project=' + project
        }).done(function (webServerInfo) {
            globalObj['webServerInfo'] = parseWebServerInfo(webServerInfo);
            $.ajax({
                url:'/' + globalObj['mFileName'] + '?built_at=' + built_at
            }).done(function(xml) {
                layoutDefObj.resolve(xml);
            });
            if(typeof(callback) == 'function') {
                callback(webServerInfo);
            }
        });
    } else {
        if(typeof(callback) == 'function') {
            callback(globalObj['webServerInfo']);
        }
    }
};
(function ($) {
    $.extend($.fn, {
        initWidgetHeader:function (data) {
            var widgetHdrTemplate = contrail.getTemplate4Id("widget-header-template");
            $(this).html(widgetHdrTemplate(data));
            if(data['widgetBoxId'] != undefined){
                startWidgetLoading(data['widgetBoxId']);
            }
            if (data['link'] != null)
                $(this).find('span').addClass('href-link');
            $(this).find('span').on('click', function () {
                if ((data['link'] != null) && (data['link']['hashParams'] != null))
                    layoutHandler.setURLHashObj(data['link']['hashParams']);
            });
        },
    });
})(jQuery);

$.deparamURLArgs = function (query) {
    var query_string = {};
    var query = ifNull(query,'');
    if (query.indexOf('?') > -1) {
        query = query.substr(query.indexOf('?') + 1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            pair[0] = decodeURIComponent(pair[0]);
            pair[1] = decodeURIComponent(pair[1]);
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [ query_string[pair[0]], pair[1] ];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(pair[1]);
            }
        }
    }
    return query_string;
};

$.xhrPool = [];

var previous_scroll = $(window).scrollTop(),
    scrollHeight = $(document).height() - $(window).height();

$.allajax = (function ($) {
    var xhrPool = [];
    var ajaxId = 0;
    $(document).ajaxSend(function (e, jqXHR, options) {
        if (options.abortOnNavigate != false && options.abortOnNavigate != "false") {
            xhrPool.push(jqXHR);
        }
    });
    $(document).ajaxComplete(function (e, jqXHR, options) {
        var index = xhrPool.indexOf(jqXHR);
        if (index > -1) {
            xhrPool.splice(index, 1);
        }
    });
    //Handle if any ajax response fails because of session expiry and redirect to login page
    $(document).ajaxComplete(function (event, xhr, settings) {
        var urlHash = window.location.hash;
        var redirectHeader = xhr.getResponseHeader('X-Redirect-Url');
        if (redirectHeader != null) {
            //Show login-form
            loadUtils.onAuthenticationReq();
            /*//Carry the current hash parameters to redirect URL(login page) such that user will be taken to the same page once he logs in
            if (redirectHeader.indexOf('#') == -1)
                window.location.href = redirectHeader + urlHash;
            else
                window.location.href = redirectHeader;*/
        }
    });
    this.abort = function () {
        var tempXhrPool = [];
        $.extend(true, tempXhrPool, xhrPool);
        for (var i = 0; i < tempXhrPool.length; i++) {
            tempXhrPool[i].abort();
        }
    };

    return this;
})($);

$(document).on('click', '.pre-format-JSON2HTML .expander', function(){
    var selfParent = $(this).parent(),
        jsonObj = {};
    selfParent.children('i').removeClass('fa-plus').removeClass('expander').addClass('fa fa-minus').addClass('collapser');
    if(selfParent.children('.node').hasClass('raw')){
        jsonObj = JSON.parse(selfParent.children('ul.node').text());
        selfParent.empty().append(contrail.formatJsonObject(jsonObj, 2, parseInt(selfParent.children('.node').data('depth')) + 1));
    }
    selfParent.children('.node').show();
    selfParent.children('.collapsed').hide();
});

$(document).on('click', '.pre-format-JSON2HTML .collapser', function(){
    var selfParent = $(this).parent();
    selfParent.children('i').removeClass('fa-minus').removeClass('collapser').addClass('fa fa-plus').addClass('expander');
    selfParent.children('.collapsed').show();
    selfParent.children('.node').hide();
});

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
	
	/*
	 * .addClassSVG(className)
	 * Adds the specified class(es) to each of the set of matched SVG elements.
	 */
	$.fn.addClassSVG = function(className){
		$(this).attr('class', function(index, existingClassNames) {
            return ((existingClassNames !== undefined) ? (existingClassNames + ' ') : '') + className;
		});
		return this;
	};
	
	/*
	 * .removeClassSVG(className)
	 * Removes the specified class to each of the set of matched SVG elements.
	 */
	$.fn.removeClassSVG = function(className){
		$(this).attr('class', function(index, existingClassNames) {
    		var re = new RegExp('\\b' + className + '\\b', 'g');
    		return existingClassNames.replace(re, '');
    	});
		return this;
	};
	
	/*
	 * .hasClassSVG(className)
	 * Determine whether any of the matched SVG elements are assigned the given class.
	 */
	$.fn.hasClassSVG = function(className){
		var existingClassNames = $(this).attr('class').split(' ');
		return (existingClassNames.indexOf(className) > -1 ? true : false);
	};
	
	/*
	 * .parentsSVG(className)
	 * Get the ancestors of each element in the current set of matched elements or SVG elements, optionally filtered by a selector
	 */
	$.fn.parentsSVG = function(selector){
		var parents = $(this).parents(),
			outputParents = [];
		$.each(parents, function(keyParents, valueParents){
			if($(valueParents).is(selector)){
				outputParents.push(valueParents);
			}
		});
		return outputParents;
	};

    /*
     * .heightSVG(className)
     * Get the current computed height for the first element in the set of matched SVG elements.
     */
    $.fn.heightSVG = function(){
        return ($(this).get(0)) ? $(this).get(0).getBBox().height : null;
    };

    /*
     * .widthSVG(className)
     * Get the current computed width for the first element in the set of matched SVG elements.
     */
    $.fn.widthSVG = function(){
        return ($(this).get(0)) ? $(this).get(0).getBBox().width : null;
    };

    /*
     * .redraw()
     * Redraw or refresh the DOM to reflect the styles configured (Safari hack to render svg elements)
     * */
    $.fn.redraw = function() {
        this.css('display', 'none');
        var temp = this[0].offsetHeight;
        this.css('display', '');
    };

    $.fn.deparam = jq_deparam = function( params, coerce ) {
        var obj = {},
            coerce_types = { 'true': !0, 'false': !1, 'null': null };

        // Iterate over all name=value pairs.
        $.each( params.replace( /\+/g, ' ' ).split( '&' ), function(j,v){
            var param = v.split( '=' ),
                key = decode( param[0] ),
                val,
                cur = obj,
                i = 0,

            // If key is more complex than 'foo', like 'a[]' or 'a[b][c]', split it
            // into its component parts.
                keys = key.split( '][' ),
                keys_last = keys.length - 1;

            // If the first keys part contains [ and the last ends with ], then []
            // are correctly balanced.
            if ( /\[/.test( keys[0] ) && /\]$/.test( keys[ keys_last ] ) ) {
                // Remove the trailing ] from the last keys part.
                keys[ keys_last ] = keys[ keys_last ].replace( /\]$/, '' );

                // Split first keys part into two parts on the [ and add them back onto
                // the beginning of the keys array.
                keys = keys.shift().split('[').concat( keys );

                keys_last = keys.length - 1;
            } else {
                // Basic 'foo' style key.
                keys_last = 0;
            }

            // Are we dealing with a name=value pair, or just a name?
            if ( param.length === 2 ) {
                val = decode( param[1] );

                // Coerce values.
                if ( coerce ) {
                    val = val && !isNaN(val)            ? +val              // number
                        : val === 'undefined'             ? undefined         // undefined
                        : coerce_types[val] !== undefined ? coerce_types[val] // true, false, null
                        : val;                                                // string
                }

                if ( keys_last ) {
                    // Complex key, build deep object structure based on a few rules:
                    // * The 'cur' pointer starts at the object top-level.
                    // * [] = array push (n is set to array length), [n] = array if n is 
                    //   numeric, otherwise object.
                    // * If at the last keys part, set the value.
                    // * For each keys part, if the current level is undefined create an
                    //   object or array based on the type of the next keys part.
                    // * Move the 'cur' pointer to the next level.
                    // * Rinse & repeat.
                    for ( ; i <= keys_last; i++ ) {
                        key = keys[i] === '' ? cur.length : keys[i];
                        cur = cur[key] = i < keys_last
                            ? cur[key] || ( keys[i+1] && isNaN( keys[i+1] ) ? {} : [] )
                            : val;
                    }

                } else {
                    // Simple key, even simpler rules, since only scalars and shallow
                    // arrays are allowed.

                    if ( $.isArray( obj[key] ) ) {
                        // val is already an array, so push on the next value.
                        obj[key].push( val );

                    } else if ( obj[key] !== undefined ) {
                        // val isn't an array, but since a second value has been specified,
                        // convert val into an array.
                        obj[key] = [ obj[key], val ];

                    } else {
                        // val is a scalar.
                        obj[key] = val;
                    }
                }

            } else if ( key ) {
                // No value was defined, so set something meaningful.
                obj[key] = coerce
                    ? undefined
                    : '';
            }
        });

        return obj;
    };

    $.fn.getState = function( key, coerce ) {
        return key === undefined || typeof key === 'boolean'
            ? jq_deparam_fragment( key ) // 'key' really means 'coerce' here
            : jq_deparam_fragment( coerce )[ key ];
    };

    function curry( func ) {
        var args = aps.call( arguments, 1 );

        return function() {
            return func.apply( this, args.concat( aps.call( arguments ) ) );
        };
    };

    // Get location.hash (or what you'd expect location.hash to be) sans any
    // leading #. Thanks for making this necessary, Firefox!
    function get_fragment( url ) {
        return url.replace( /^[^#]*#?(.*)$/, '$1' );
    };

    // Get location.search (or what you'd expect location.search to be) sans any
    // leading #. Thanks for making this necessary, IE6!
    function get_querystring( url ) {
        return url.replace( /(?:^[^?#]*\?([^#]*).*$)?.*/, '$1' );
    };

    $.fn.pushState = jq_bbq_pushState = function( params, merge_mode ) {
        if ( is_string( params ) && /^#/.test( params ) && merge_mode === undefined ) {
            // Params string begins with # and merge_mode not specified, so completely
            // overwrite window.location.hash.
            merge_mode = 2;
        }

        var has_args = params !== undefined,
        // Merge params into window.location using $.param.fragment.
            url = jq_param_fragment( location.href,
                has_args ? params : {}, has_args ? merge_mode : 2 );

        // Set new window.location.href. Note that Safari 3 & Chrome barf on
        // location.hash = '#' so the entire URL is set.
        location.href = url;
    };

})(jQuery);
