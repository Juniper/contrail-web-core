/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

$(document).ready(function () {

    //Listener to expand/collapse widget based on toggleButton in widget header
    $("#content-container").on('click', 'div.widget-box div.widget-header div.widget-toolbar a[data-action="collapse"]', function () {
        $(this).find('i').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        var widgetBodyElem = $(this).parents('div.widget-box').find('div.widget-body');
        var widgetBoxElem = $(this).parents('div.widget-box');
        $(widgetBoxElem).toggleClass('collapsed');
    });

    // expand/collapse widget on click of widget header
    $("#content-container").on('click', 'div.widget-box div.widget-header h4', function () {
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

    $(document)
        .off('click', '.group-detail-advanced-action-item')
        .on('click', '.group-detail-advanced-action-item', function (event) {
            if (!$(this).hasClass('selected')) {
                var thisParent = $(this).parents('.group-detail-container'),
                    newSelectedView = $(this).data('view');

                thisParent.find('.group-detail-item').hideElement();
                thisParent.find('.group-detail-' + newSelectedView).showElement();

                thisParent.find('.group-detail-advanced-action-item').removeClass('selected');
                $(this).addClass('selected');

                if (contrail.checkIfExist($(this).parents('.slick-row-detail').data('cgrid'))) {
                    $(this).parents('.contrail-grid').data('contrailGrid').adjustDetailRowHeight($(this).parents('.slick-row-detail').data('cgrid'));
                }
            }
        });

    $(document)
        .off('click', '.input-type-toggle-action')
        .on('click', '.input-type-toggle-action', function (event) {
            var input = $(this).parent().find('input');
            if (input.prop('type') == 'text') {
                input.prop('type', 'password');
                $(this).removeClass('blue');
            } else {
                input.prop('type', 'text');
                $(this).addClass('blue');
            }
        });

    $(document)
        .off('click', '.input-type-toggle-action')
        .on('click', '.input-type-toggle-action', function (event) {
            var input = $(this).parent().find('input');
            if (input.prop('type') == 'text') {
                input.prop('type', 'password');
                $(this).removeClass('blue');
            } else {
                input.prop('type', 'text');
                $(this).addClass('blue');
            }
        });

    $(window).on('scroll', function () {
        var scrollHeight = $(document).height() - $(window).height(),
            previousScroll = 0,
            currentScroll = $(this).scrollTop();

        if (currentScroll < 45 || previousScroll - currentScroll > 40) {
            $("#pageHeader").show();
            $('#page-content').removeClass('scrolled');
            $('#sidebar').removeClass('scrolled');
            $('#breadcrumbs').removeClass('scrolled');
            $('#back-to-top').fadeOut();
        }
        else {
            $("#pageHeader").hide();
            $('#page-content').addClass('scrolled');
            $('#sidebar').addClass('scrolled');
            $('#breadcrumbs').addClass('scrolled');
            $('#back-to-top').fadeIn();
        }
        if (currentScroll < scrollHeight) {
            previousScroll = $(window).scrollTop();
        }
    });

    $(document).on('click', '#back-to-top', function (event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, 500);
        return false;
    });


    // layoutHandler.load();

    jQuery.support.cors = true;

    //Get the CSRF token from cookie
    // globalObj['_csrf'] = getCookie('_csrf');
    // delete_cookie('_csrf');

    $(window).on('hashchange', function () {
        currHash = cowhu.getState();
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

function startWidgetLoading(selectorId) {
    $("#" + selectorId + "-loading").show();
    $("#" + selectorId + "-box").find('a[data-action="collapse"]').hide();
    $("#" + selectorId + "-box").find('a[data-action="settings"]').hide();
};

function endWidgetLoading(selectorId) {
    setTimeout(function(){
        $("#" + selectorId + "-loading").hide();
        $("#" + selectorId + "-box").find('a[data-action="collapse"]').show();
        $("#" + selectorId + "-box").find('a[data-action="settings"]').show();
    },500);
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
        if ((redirectHeader != null) ||
            (cowc.HTTP_STATUS_CODE_AUTHORIZATION_FAILURE == xhr.status)) {
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
    cowu.expandJsonHtml($(this))
});

$(document).on('click', '.pre-format-JSON2HTML .collapser', function(){
    cowu.collapseJsonHtml($(this));
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
     * .hideElement()
     * Hide the matched elements. 
     */
    $.fn.hideElement = function(){
        $(this).addClass('hidden');
        return this;
    };

    /*
     * .showElement()
     * Show the matched elements.
     */
    $.fn.showElement = function(){
        $(this).removeClass('hidden');
        return this;
    };

    /*
     * .toggleElement()
     * Toggle the matched elements.
     */
    $.fn.toggleElement = function(){
        $(this).toggleClass('hidden');
        return this;
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
	
})(jQuery);
