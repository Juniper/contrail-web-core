/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
define(['underscore'], function (_) {
    var self = this;

    this.getRegExForUrl = function (url) {
        var regexUrlMap = {
            '/api/admin/webconfig/featurePkg/webController': /\/api\/admin\/webconfig\/featurePkg\/webController\?.*$/,
            '/api/admin/webconfig/features/disabled': /\/api\/admin\/webconfig\/features\/disabled\?.*$/,
            '/api/service/networking/web-server-info': /\/api\/service\/networking\/web-server-info.*$/,
            '/menu.xml': /\/menu\.xml.*$/,
            '/api/tenants/config/domains': /\/api\/tenants\/config\/domains.*$/,
            '/sm/tags/names': /\/sm\/tags\/names.*$/,
            '/sm/objects/details/image': /\/sm\/objects\/details\/image\?.*$/,
            '/api/tenant/networking/virtual-networks/details': /\/api\/tenant\/networking\/virtual-networks\/details\?.*$/,
            '/api/tenant/networking/stats': /\/api\/tenant\/networking\/stats.*$/
        };

        return regexUrlMap [url];
    };

    this.getNumberOfColumnsForGrid = function (viewObj) {

        var noOfColumns = 0;
        noOfColumns = viewObj.getGridConfig().columnHeader.columns.length;
        if (contrail.checkIfExist(viewObj.getGridConfig().body.options.actionCell))
            noOfColumns++;
        if (contrail.checkIfExist(viewObj.getGridConfig().body.options.checkboxSelectable))
            noOfColumns++;
        if (contrail.checkIfExist(viewObj.getGridConfig().body.options.detail))
            noOfColumns++;
        return noOfColumns;
    };

    this.startQunitWithTimeout = function (timeoutInMilliSec) {
        window.setTimeout(function () {
            QUnit.start();
        }, timeoutInMilliSec);
    };


    this.getPageHeaderHTML = function() {
        return '<div id="pageHeader" class="navbar navbar-inverse navbar-fixed-top"> ' +
            '<div class="navbar-inner"> ' +
            '<div class="container-fluid"> ' +
            '<a href="#" class="brand"> <img class="logo" src="base/contrail-web-core/webroot/img/sdn-logo.png"/> </a> ' +
            '<ul style="width:270px" class="nav ace-nav pull-right"> ' +
            '<li id="user-profile" class="hide"> ' +
            '<a data-toggle="dropdown" href="#" class="user-menu dropdown-toggle"> ' +
            '<i class="icon-user icon-only icon-2"></i> ' +
            '<span id="user_info"></span> ' +
            '<i class="icon-caret-down"></i> ' +
            '</a> ' +
            '<ul class="pull-right dropdown-menu dropdown-caret dropdown-closer" id="user_menu"> ' +
            '<li> ' +
            '<a href="logout"> ' +
            '<i class="icon-off"></i>' +
            'Logout </a>' +
            ' </li> ' +
            '</ul> ' +
            '</li> <li onclick="showMoreAlerts();"> ' +
            '<a href="javascript:void(0);"> ' +
            '<i class="icon-bell-alt icon-only icon-2"></i> <span id="alert_info">Alerts</span> <!-- <i class="icon-caret-down"></i> --> ' +
            '</a> </li> </ul> <div id="nav-search"> ' +
            '<form id="search-form" onsubmit="searchSiteMap();"> <span class="input-icon"> ' +
            '<input type="text" placeholder="Search Sitemap" class="input-small search-query" id="nav-search-input" autocomplete="off"> ' +
            '<i class="icon-search" id="nav-search-icon"></i> </span> ' +
            '</form> </div> </div> <!--/.container-fluid-->' +
            '</div> <!--/.navbar-inner--> </div>';
    };

    this.getSidebarHTML = function() {
        return '<div class="container-fluid" id="main-container"> ' +
            '<a id="menu-toggler" href="#"> ' +
            '<span></span> ' +
            '</a> ' +
            '<div id="sidebar"> ' +
            '<div id="sidebar-shortcuts"> ' +
            '</div> ' +
            '<ul id="menu" class="nav nav-list"></ul> ' +
            '</div> ' +
            '<div id="main-content" class="clearfix"> ' +
            '<div id="breadcrumbs" class="fixed"> ' +
            '<ul id="breadcrumb" class="breadcrumb"> ' +
            '</ul> ' +
            '<div class="hardrefresh breadcrumb" style="display:none"> ' +
            '<span> <i class="icon-time" style="cursor:default"></i></span><span data-bind="text:timeObj.timeStr"></span> ' +
            '<span class="loading"><i class="icon-spinner icon-spin"></i></span> ' +
            '<span class="refresh" title="refresh" style="color: #3182bd;cursor:pointer">Refresh</i></span> ' +
            '</div> ' +
            '</div> ' +
            '<div id="page-content" class="clearfix"> ' +
            '<div id="content-container"></div> ' +
            '</div> ' +
            '</div> </div>'
    };

    this.getCSSList = function() {
        var cssList = [];
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/bootstrap/css/bootstrap.min.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/bootstrap/css/bootstrap-responsive.min.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/test/ui/css/jquery-ui.test.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.jquery.ui.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/test/ui/css/font-awesome.test.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/nvd3/css/nv.d3.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/select2/styles/select2.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/datetimepicker/styles/jquery.datetimepicker.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/slickgrid/styles/slick.grid.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/jquery/css/jquery.steps.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/assets/jquery-contextMenu/css/jquery.contextMenu.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/test/ui/css/contrail.layout.test.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.elements.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.responsive.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.custom.css"/>');
        cssList.push('<link rel="stylesheet" href="/base/contrail-web-core/webroot/css/contrail.font.css"/>');
        return cssList;
    };

    this.getFakeServer = function(serverConfig) {
        var fakeServer = sinon.fakeServer.create();
        fakeServer.autoRespond = (serverConfig == null || serverConfig['autoRespond'] == null) ? true : serverConfig['autoRespond'];
        fakeServer.xhr.useFilters = true;

        fakeServer.xhr.addFilter(function(method, url) {
            var searchResult = url.search(/.*\.tmpl.*/);
            return searchResult == -1 ? false : true;
        });

        return fakeServer;
    };

    return {
        self: self,
        getRegExForUrl: getRegExForUrl,
        getNumberOfColumnsForGrid: getNumberOfColumnsForGrid,
        startQunitWithTimeout: startQunitWithTimeout,
        getCSSList: getCSSList,
        getSidebarHTML: getSidebarHTML,
        getPageHeaderHTML: getPageHeaderHTML,
        getFakeServer: getFakeServer
    };
});
