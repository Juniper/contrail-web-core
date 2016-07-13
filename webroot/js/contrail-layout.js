/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */


var lastHash = {};

Object.identical = function (a, b, sortArrays) {
    function sort(object) {
        if (sortArrays === true && Array.isArray(object)) {
            return object.sort();
        }
        else if (typeof object !== "object" || object === null) {
            return object;
        }

        return Object.keys(object).sort().map(function (key) {
            return {
                key: key,
                value: sort(object[key])
            };
        });
    }

    return JSON.stringify(sort(a)) === JSON.stringify(sort(b));
};

function onClickSidebarCollapse() {
    var $minimized = false;
    $('#sidebar').toggleClass('menu-min');
    $('#sidebar-collapse').find('i').toggleClass('icon-chevron-left').toggleClass('icon-chevron-right');

    $minimized = $('#sidebar').hasClass('menu-min');
    if ($minimized) {
        $('.open > .submenu').removeClass('open');
        setCookie('sidebar', 'close');
    } else {
        setCookie('sidebar', 'open');
    }
}

function enableSearchAhead() {
    $('#nav-search-input').val('');
    $('#nav-search-input').contrailAutoComplete({
        source: globalObj['siteMapSearchStrings'],
        select: function (event, ui) {
            searchSiteMap();
        }
    });
}

function searchSiteMap() {
    var searchString = $('#nav-search-input').val(), hash, queryParams;
    var siteMap = globalObj['siteMap'];
    for (hash in siteMap) {
        if (siteMap[hash]['searchStrings'].indexOf(searchString.trim()) != -1) {
            lastHash = $.bbq.getState();
            queryParams = siteMap[hash]['queryParams'];
            currHash = {p: hash, q: queryParams};
            globalObj['menuClicked'] = true;
            layoutHandler.onHashChange(lastHash, currHash);
            lastHash = currHash;
            return false;
        }
    }
    return false;
};

function generalInit() {
    $('.ace-nav [class*="icon-animated-"]').closest('a').on('click', function () {
        var icon = $(this).find('[class*="icon-animated-"]').eq(0);
        var $match = icon.attr('class').match(/icon\-animated\-([\d\w]+)/);
        icon.removeClass($match[0]);
        $(this).off('click');
    });

    $('#btn-scroll-up').on('click', function () {
        var duration = Math.max(100, parseInt($('html').scrollTop() / 3));
        $('html,body').animate({scrollTop: 0}, duration);
        return false;
    });

}

function openWidget(id) {
    var $this = $(id).find('.widget-toolbar > a[data-action]');
    var $box = $this.closest('.widget-box');
    var $body = $box.find('.widget-body');
    var $icon = $this.find('[class*=icon-]').eq(0);
    var $match = $icon.attr('class').match(/icon\-(.*)\-(up|down)/);
    var $icon_down = 'icon-' + $match[1] + '-down';
    var $icon_up = 'icon-' + $match[1] + '-up';
    $body = $body.find(':first-child').eq(0);
    if ($box.hasClass('collapsed')) {
        if ($icon) $icon.addClass($icon_up).removeClass($icon_down);
        $box.removeClass('collapsed');
        $body.slideDown(200);
    }
    if ($box.hasClass('collapsed') && $icon) $icon.addClass($icon_down).removeClass($icon_up);
};

function collapseWidget(id) {
    var $this = $(id).find('.widget-toolbar > a[data-action]');
    var $box = $this.closest('.widget-box');
    var $body = $box.find('.widget-body');
    var $icon = $this.find('[class*=icon-]').eq(0);
    var $match = $icon.attr('class').match(/icon\-(.*)\-(up|down)/);
    var $icon_down = 'icon-' + $match[1] + '-down';
    var $icon_up = 'icon-' + $match[1] + '-up';
    $body = $body.find(':first-child').eq(0);
    if (!($box.hasClass('collapsed'))) {
        if ($icon) $icon.addClass($icon_down).removeClass($icon_up);
        //$body.slideUp(300, function () {
        $box.addClass('collapsed');
        //});
    }
};

function toggleWidget(id) {
    var $this = $(id);
    var $box = $this.closest('.widget-box');
    var $body = $box.find('.widget-body');
    var $icon = $this.find('[class*=icon-]').eq(0);
    var $match = $icon.attr('class').match(/icon\-(.*)\-(up|down)/);
    var $icon_down = 'icon-' + $match[1] + '-down';
    var $icon_up = 'icon-' + $match[1] + '-up';
    $body = $body.wrapInner('<div class="widget-body-inner"></div>').find(':first-child').eq(0);
    if ($box.hasClass('collapsed')) {
        if ($icon) $icon.addClass($icon_up).removeClass($icon_down);
        $box.removeClass('collapsed');
        $body.slideDown(200);
    } else {
        if ($icon) $icon.addClass($icon_down).removeClass($icon_up);
        $body.slideUp(300, function () {
            $box.addClass('collapsed');
        });
    }
    if ($box.hasClass('collapsed') && $icon) $icon.addClass($icon_down).removeClass($icon_up);
};

function toggleWidgetsVisibility(showWidgetIds, hideWidgetIds) {
    for (var i = 0; i < showWidgetIds.length; i++) {
        $('#' + showWidgetIds[i]).removeClass('hide');
    }
    for (var j = 0; j < hideWidgetIds.length; j++) {
        $('#' + hideWidgetIds[j]).addClass('hide');
    }
};

function initWidgetBoxes() {
    $('.widget-toolbar > a[data-action]').each(function () {
        initWidget(this);
    });
};

function initWidget4Id(id) {
    $(id).find('.widget-toolbar > a[data-action]').each(function () {
            initWidget(this);
        }
    );
};

function initWidget(widget) {
    var $this = $(widget);
    var $action = $this.data('action');
    var $box = $this.closest('.widget-box');

    if ($action == 'collapse') {
        /*var $body = $box.find('.widget-body');
         var $icon = $this.find('[class*=icon-]').eq(0);
         var $match = $icon.attr('class').match(/icon\-(.*)\-(up|down)/);
         var $icon_down = 'icon-' + $match[1] + '-down';
         var $icon_up = 'icon-' + $match[1] + '-up';

         $body = $body.wrapInner('<div class="widget-body-inner"></div>').find(':first-child').eq(0);
         $this.on('click', function (ev) {
         if ($box.hasClass('collapsed')) {
         if ($icon) $icon.addClass($icon_up).removeClass($icon_down);
         $box.removeClass('collapsed');
         $body.slideDown(200);
         } else {
         if ($icon) $icon.addClass($icon_down).removeClass($icon_up);
         $body.slideUp(300, function () {
         $box.addClass('collapsed')
         });
         }
         ev.preventDefault();
         });
         if ($box.hasClass('collapsed') && $icon) $icon.addClass($icon_down).removeClass($icon_up);*/

    } else if ($action == 'close') {
        $this.on('click', function (ev) {
            $box.hide(300, function () {
                $box.remove();
            });
            ev.preventDefault();
        });
    } else if ($action == 'close-hide') {
        $this.on('click', function (ev) {
            $box.slideUp();
            ev.preventDefault();
        });
    } else if ($action == 'reload') {
        $this.on('click', function (ev) {
            $this.blur();
            //var $body = $box.find('.widget-body');
            var $remove = false;
            if (!$box.hasClass('position-relative')) {
                $remove = true;
                $box.addClass('position-relative');
            }
            $box.append('<div class="widget-box-layer"><i class="icon-spinner icon-spin icon-2x white"></i></div>');
            setTimeout(function () {
                $box.find('> div:last-child').remove();
                if ($remove) $box.removeClass('position-relative');
            }, parseInt(Math.random() * 1000 + 1000));
            ev.preventDefault();
        });
    } else if ($action == 'settings') {
        $this.on('click', function (ev) {
            ev.preventDefault();
        });
    }
};

//code taken from http://code.jquery.com/jquery-1.8.3.js to provide simple browser detection for 1.9+ versions
function addBrowserDetection($) {
    if (!$.browser) {
        var matched, browser;

        // Use of jQuery.browser is frowned upon.
        // More details: http://api.jquery.com/jQuery.browser
        // jQuery.uaMatch maintained for back-compat
        $.uaMatch = function (ua) {
            ua = ua.toLowerCase();

            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                [];

            return {
                browser: match[1] || "",
                version: match[2] || "0"
            };
        };

        matched = $.uaMatch(navigator.userAgent);
        browser = {};

        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }

        // Chrome is Webkit, but Webkit is also Safari.
        if (browser.chrome) {
            browser.webkit = true;
        } else if (browser.webkit) {
            browser.safari = true;
        }

        $.browser = browser;

    }
}

function onWindowResize() {
    //Trigger resize event on current view
    if ((globalObj.currMenuObj != null))
        if (globalObj.currMenuObj['class'] != null)
            globalObj.currMenuObj['class'].resize();
}

function getScript(url, callback) {
    var scriptPath = url + '?built_at=' + built_at;
    globalObj['loadedScripts'].push(url);
    return $.ajax({
        type: "GET",
        url: scriptPath,
        success: callback,
        dataType: "script",
        cache: true
    }).fail(function() {
        console.info("Error in loading script",url);
    });
};

function loadCSS(cssFilePath) {
    var links = document.getElementsByTagName('link'),
        loadcss = true;

    var loadedCSSs = $.map(links, function (idx, obj) {
        return link.getAttribute('href');
    });
    if ($.inArray(cssFilePath, loadedCSSs) == -1) {
        $("<link/>", {
            rel: "stylesheet",
            type: "text/css",
            href: cssFilePath
        }).appendTo("head");
    }
}

function getMenuButtonName(buttonHash) {
    if (buttonHash == "mon") {
        return "monitor"
    } else if (buttonHash == "config") {
        return "configure";
    } else if (buttonHash == "query") {
        return "query";
    } else if (buttonHash == "setting") {
        return "setting";
    } else {
        return "monitor";
    }
}

function check2ReloadMenu(lastPageHash, currentMenu) {
    var lastPageHashArray, reloadMenu = true;
    if (lastPageHash != null && lastPageHash != "") {
        lastPageHashArray = lastPageHash.split("_");
        reloadMenu = (lastPageHashArray[0] == currentMenu) ? false : true;
    }
    return reloadMenu;
}

// JSON Highlighter + Expand & Collapse
function syntaxHighlight(json) {
    if (json == null)
        return;
    json = JSON.stringify(json, undefined, 2)
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var syntaxedJson = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }

        if (cls == 'key') {
            match = match.replace(/"/g, '');
            return '<span class="' + cls + '">' + match + '</span>';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });

    syntaxedJson = syntaxedJson.replace(/\]/g, ']</span></span>');
    syntaxedJson = syntaxedJson.replace(/\[/g, '<span class="preBlock"><i class="icon-minus"></i><span class="collapsed hide"> [...]</span><span class="expanded"> [');

    syntaxedJson = syntaxedJson.replace(/\}/g, '}</span></span>');
    syntaxedJson = syntaxedJson.replace(/\{/g, '<span class="preBlock"><i class="icon-minus"></i><span class="collapsed hide"> {...}</span><span class="expanded"> {');

    return syntaxedJson;
}

// Loads the feature screen based on given hashParams
function loadFeature(hashParams) {
    var loadingStartedDefObj = $.Deferred();
    globalObj['menuClicked'] = true;
    //Set hashUpdated flag only if current URL hashParams differs from the passed on
    if (JSON.stringify(layoutHandler.getURLHashObj()) != JSON.stringify(hashParams)) {
        globalObj['hashUpdated'] = 1;
    }
    layoutHandler.setURLHashObj(hashParams);
    //Hiding the last updated time and refresh icon on click of an item left menu
    //hideHardRefresh();
    //Call onHashChange explicitly,as hashchange event is not triggered if there is no change in hahsParams being pushed
    layoutHandler.onHashChange(lastHash, hashParams, loadingStartedDefObj);
    return loadingStartedDefObj;
}

// Info Window Modal
function showInfoWindow(msg, title, detail, yesFunction) {
    //detail = "check check check check check <br> check check check
    //check check check check check <br> check check check";
    if ($('.modal-backdrop').is(':visible')) {
        var nameValue = $('body').find('#infoWindow').attr('id');
        if (nameValue != undefined) {
            if (($("#infoWindow").hasClass("in"))) {
                $('.modal-backdrop').remove();
                $('.modal').remove();
            }
        }
    }
    var content = '<div id="short-msg"><p>' + msg + '</p></div>';
    var footerValue = [];
    if (detail != "" && detail != undefined) {
        content += '<div id="detail" class=""><p><br>' + detail + '</p></div>';
        footerValue.push({
            title: 'Show More',
            className: 'detailNote'
        });
    }
    if (yesFunction != "" && yesFunction != null) {
        footerValue.push({
            title: 'Yes',
            onclick: window[yesFunction],
            className: 'btn-primary'
        });
        footerValue.push({
            title: 'No',
            onclick: 'close',
            className: 'btn-primary'
        });
    } else {
        footerValue.push({
            title: 'Close',
            onclick: 'close',
            className: 'btn-primary'
        });
    }
    $.contrailBootstrapModal({
        id: 'infoWindow',
        title: title,
        body: content,
        footer: footerValue
    });

    if (detail != "" && detail != undefined) {
        $("#detail").addClass("hide");
        $('.detailNote').on('click', function () {
            if ($('.detailNote').text().trim() == "Show More") {
                $('.detailNote').html("Show Less");
                $("#detail").removeClass("hide");
            } else {
                $('.detailNote').html("Show More");
                $("#detail").addClass("hide");
            }
        });
    }
    $('#infoWindow').css('z-index', 1052);
    $('.modal-backdrop:last-child').css('z-index', 1051);
};

