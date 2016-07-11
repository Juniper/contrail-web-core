/*
 * Copyright (c) 2016 Juniper Networks, Inc.
 * All rights reserved.
 */

define(['underscore'], function (_) {
    var jq_param_fragment, jq_deparam_fragment,
        str_querystring = 'querystring',
        str_fragment = 'fragment',
        aps = Array.prototype.slice,
        jq_param = $.param,
        jq_deparam,
        str_location = 'location',
        str_hashchange = 'hashchange',
        str_href = 'href',
        re_no_escape,
        re_trim_querystring = /^.*\?|#.*$/g,
        re_trim_fragment = /^.*\#/;

    var CoreHashUtils = function () {
        var self = this;

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

        self.getState = function( key, coerce ) {
            return key === undefined || typeof key === 'boolean'
                ? jq_deparam_fragment( key ) // 'key' really means 'coerce' here
                : jq_deparam_fragment( coerce )[ key ];
        };

        self.pushState = jq_bbq_pushState = function( params, merge_mode ) {
            console.log(params)
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
        
        

        initHashParams();

        lastHash = self.getState();

    };

    function initHashParams() {
        jq_param[ str_querystring ]                  = curry( jq_param_sub, 0, get_querystring );
        jq_param[ str_fragment ] = jq_param_fragment = curry( jq_param_sub, 1, get_fragment );

        jq_deparam[ str_querystring ]                    = curry( jq_deparam_sub, 0 );
        jq_deparam[ str_fragment ] = jq_deparam_fragment = curry( jq_deparam_sub, 1 );
    }

    function is_string( arg ) {
        return typeof arg === 'string';
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
                qs = $.param( qs );

                // Unescape characters specified via $.param.noEscape. Since only hash-
                // history users have requested this feature, it's only enabled for
                // fragment-related params strings.
                if ( is_fragment ) {
                    qs = qs.replace( re_no_escape, decodeURIComponent );
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
            url_or_params = jq_param[is_fragment ? str_fragment : str_querystring]();
        } else {
            url_or_params = is_string( url_or_params )
                ? url_or_params.replace( is_fragment ? re_trim_fragment : re_trim_querystring, '' )
                : url_or_params;
        }

        return jq_deparam( url_or_params, coerce );
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

    return CoreHashUtils;
});