/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore', 'menu-handler', 'content-handler'], function (_, MenuHandler, ContentHandler) {
    var LayoutHandler = function () {
        var self = this;

        //TODO: move all bbq code to a common location

        function is_string( arg ) {
            return typeof arg === 'string';
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

        function noEscape( chars ) {
            chars = chars || '';
            var arr = $.map( chars.split(''), encodeURIComponent );
            re_no_escape = new RegExp( arr.join('|'), 'g' );
        };

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

        jq_param[ str_querystring ]                  = curry( jq_param_sub, 0, get_querystring );
        jq_param[ str_fragment ] = jq_param_fragment = curry( jq_param_sub, 1, get_fragment );

        jq_deparam[ str_querystring ]                    = curry( jq_deparam_sub, 0 );
        jq_deparam[ str_fragment ] = jq_deparam_fragment = curry( jq_deparam_sub, 1 );

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
        // leading #. Thanks for making this necessary, IE6!
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

        //Don't escape ":[]" characters while pushing state via bbq
        //noEscape(":[]");

        this.load = function (menuObj) {
            var webServerInfo = globalObj['webServerInfo'];
            menuHandler = new MenuHandler();
            //reset the cache
            if(typeof(cowch) != "undefined")
                cowch.reset();

            menuHandler.loadMenu(menuObj);
            menuHandler.handleSideMenu();
            //self.onHashChange({}, $.bbq.getState());
            self.onHashChange({}, self.getState());
            //self.onHashChange({}, $.deparam());
            /*var href = location.hash;
            var temp =  href.split('&').reduce(function (params, param) {
                var paramSplit = param.split('=').map(function (value) {
                    return decodeURIComponent(value.replace('+', ' '));
                });
                params[paramSplit[0]] = paramSplit[1];
                return params;
            }, {});
            //self.onHashChange({}, temp);*/
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
            self.onHashChange({}, obj);*/
        };

        /** Get view height excluding header & footer **/
        this.getViewHeight = function () {
            var windowHeight = $(window).height();
            //To enforce minimum height
            if (windowHeight < 768)
                windowHeight = 768;
            //Subtract the height of pageHeader and seperator height
            return (windowHeight - $('#pageHeader').outerHeight() - 1);
        };

        /** Returns the entire hash object */
        this.getURLHashObj = function () {
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
            return obj;*/
            /*var href = location.hash;
            var temp =  href.split('&').reduce(function (params, param) {
                var paramSplit = param.split('=').map(function (value) {
                    return decodeURIComponent(value.replace('+', ' '));
                });
                params[paramSplit[0]] = paramSplit[1];
                return params;
            }, {});
            return temp;*/
            //return $.bbq.getState();
            return self.getState();
        };

        /** Override the entire hash object with the given one */
        this.setURLHashObj = function (obj) {
            if (!menuHandler.isHashExists(obj))
                return
            var currHashObj = self.getURLHashObj();
            //Update Hash only if it differs from current hash
            if (JSON.stringify(sort(currHashObj)) != JSON.stringify(sort(obj))) {
                //$.bbq.pushState(obj, 2);
                //window.location.hash = $.param(obj);
                self.pushState(obj, 2);
            }
        };

        /** Returns the value of 'q' in urlHash which is used to maintain the state within a page */
        this.getURLHashParams = function () {
            /*var href = location.hash;
            var temp =  href.split('&').reduce(function (params, param) {
                var paramSplit = param.split('=').map(function (value) {
                    return decodeURIComponent(value.replace('+', ' '));
                });
                params[paramSplit[0]] = paramSplit[1];
                return params;
            }, {});*/
            /*var temp1 = location.hash;
            var temp2 = temp1.split('&');
            var temp3 = temp2[1];
            var temp4 = decodeURIComponent(temp3);
            if (temp4 != "undefined") {
                var vals = temp4.split('=');
                var temp5 = vals[0].split('[')[1];
                var key = temp5.split(']')[0];
                var temp = {}
                temp[key] = vals[1];
                return temp;
            }
            return {}*/
            //var test = $.String.deparam();
            /*var temp = search?JSON.parse('{"' + search.replace(/%/g, '","').replace(/=/g,'":"') + '"}',
                function(key, value) { return key===""?value:decodeURIComponent(value) }):{}*/
            //return temp;
            //var urlHash = $.bbq.getState('q');
            //return ifNull(temp, {});
            var urlHash = self.getState('q');
            return ifNull(urlHash, {});
        };

        /** Sets the vaue of 'q' in urlHash */
        this.setURLHashParams = function (hashParams, obj) {
            var merge = true, triggerHashChange = true;
            if (!menuHandler.isHashExists(obj))
                return
            if (obj != null) {
                merge = ifNull(obj['merge'], true);
                triggerHashChange = ifNull(obj['triggerHashChange'], true);
            }
            //Adding triggerHashChange as part of the URL itself.
            hashParams['reload'] = triggerHashChange; 
                
            //Update Hash only if it differs from current hash
            var currHashParams = self.getURLHashParams();
            //If merge is true, merge the parameters before comparing current hash with the new hash going to be pushed
            if ((merge == true) && (typeof(hashParams) == 'object'))
                hashParams = $.extend({}, currHashParams, hashParams);
            if (JSON.stringify(sort(currHashParams)) != JSON.stringify(sort(hashParams))) {
                //To avoid loading the view again
                if (triggerHashChange == false)
                    globalObj.hashUpdated = 1;
                if ((obj != null) && (obj['p'] != null))
                    //$.bbq.pushState({p: obj['p'], q: hashParams});
                    self.pushState({p: obj['p'], q: hashParams});
                else
                    //$.bbq.pushState({q: hashParams});
                    self.pushState({q: hashParams});
            }
        };

        this.onHashChange = function(lastHash, currHash, loadingStartedDefObj) {
            globalObj['featureAppDefObj'].done(function () {
                contentHandler.loadContent(lastHash, currHash, loadingStartedDefObj);
            });
        }
    };

    return LayoutHandler;
});

function getWebServerInfo(project, callback) {
    //Compares client UTC time with the server UTC time and display alert if mismatch exceeds the threshold
    $.ajax({
        url: '/api/service/networking/web-server-info?project=' +
            encodeURIComponent(project)
    }).done(function (webServerInfo) {
        if (webServerInfo['serverUTCTime'] != null) {
            webServerInfo['timeDiffInMillisecs'] = webServerInfo['serverUTCTime'] - new Date().getTime();
            if (Math.abs(webServerInfo['timeDiffInMillisecs']) > timeStampTolearence) {
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
            globalObj['webServerInfo'] = webServerInfo;
            callback(webServerInfo);
        }
    });
};
