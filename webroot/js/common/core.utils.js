/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'moment',
    'handlebars',
    'lodash',
    "core-constants",
    'contrail-list-model',
    'core-alarm-parsers'
    
], function (_, moment, Handlebars, lodash, cowc, ContrailListModel, CoreAlarmsParsers) {
    var serializer = new XMLSerializer(),
    domParser = new DOMParser();

    var CoreUtils = function () {
        var self = this;
        //Setting the sevLevels used to display the node colors
        sevLevels = {
            CRITICAL : 0, //Red
            ERROR    : 1, //Red
            WARNING  : 2 //Orange
        };
        this.renderGrid = function (elementId, gridConfig) {
            $(elementId).contrailGrid($.extend(true, {
                header: {
                    title: {
                        cssClass: 'blue',
                        iconCssClass: 'blue'
                    },
                    defaultControls: {
                        refreshable: true,
                        collapseable: false
                    }
                },
                columnHeader: {},
                body: {
                    options: {
                        autoRefresh: false,
                        forceFitColumns: true,
                        checkboxSelectable: true,
                        detail: {
                            template: '<pre>{{{formatJSON2HTML this}}}</pre>'
                        }
                    },
                    dataSource: {}
                }
            }, gridConfig));
        };
        this.renderJSONEditor = function (options) {
            var modalId = 'configure-' + options['prefixId'];
            $.contrailBootstrapModal({
                id: modalId,
                className: options['className'],
                title: options['title'],
                body: '<div id="' + options['prefixId'] + '-pane-container"><pre>' + JSON.stringify(options['model'].attributes, null, " ") + '</pre></div>',
                footer: [
                    {
                        id: 'cancelBtn',
                        title: 'Cancel',
                        onclick: 'close'
                    },
                    {
                        className: 'btn-primary',
                        title: 'Save',
                        onclick: function () {
                            $("#" + modalId).modal('hide');
                            options['onSave']();
                        }
                    }
                ],
                onEnter: function () {
                    $("#" + modalId).modal('hide');
                }
            });
        };
        this.createPopoverModal = function (options) {
            var modalId = options['modalId'],
                actions = [];
            if ((contrail.checkIfExist(options['onCancel'])) && (contrail.checkIfFunction(options['onCancel']))) {
                actions.push({
                    id        : 'cancel',
                    onclick   : function () {
                        options['onCancel']();
                    },
                    onKeyupEsc: true
                });
            }
            if ((contrail.checkIfExist(options['onSave'])) && (contrail.checkIfFunction(options['onSave']))) {
                actions.push({
                    id       : 'save',
                    onclick: function () {
                        options['onSave']();
                        if ($('#' + modalId).find('.generic-delete-form').length > 0) {
                            $('#' + modalId).find('.btn-primary.btnSave').hide();
                        }
                    },
                    onKeyupEnter: true
                });
            }

            $.contrailBootstrapPopover({
                id: modalId,
                className: options['className'],
                title: options['title'],
                body: options['body'],
                actions: actions,
                isBackdropReq: options['isBackdropReq'],
                targetId: options['targetId']
            });
        };
        this.createModal = function (options) {
            var modalId = options['modalId'],
                footer = [];
            if(options['footer'] == null || options['footer'] == undefined) {
                if ((contrail.checkIfExist(options['onBack'])) && (contrail.checkIfFunction(options['onBack']))) {
                    footer.push({
                        id        : 'backBtn',
                        className : 'btn-primary',
                        title     : 'Back',
                        onclick   : function () {
                            options['onBack']();
                        }
                    });
                }
            if ((contrail.checkIfExist(options['onClose'])) && (contrail.checkIfFunction(options['onClose']))) {
                footer.push({
                    id        : 'closeBtn',
                    className : 'btn-primary',
                    title     : 'Close',
                    onclick   : function () {
                        options['onClose']();
                    },
                    onKeyupEsc: true
                });
            }
            if ((contrail.checkIfExist(options['onReset'])) && (contrail.checkIfFunction(options['onReset']))) {
                footer.push({
                    id        : 'resetBtn',
                    title     : 'Reset',
                    onclick   : function () {
                        options['onReset']();
                    },
                    onKeyupEsc: true
                });
            }
            if ((contrail.checkIfExist(options['onCancel'])) && (contrail.checkIfFunction(options['onCancel']))) {
                footer.push({
                    id        : 'cancelBtn',
                    title     : 'Cancel',
                    onclick   : function () {
                        options['onCancel']();
                    },
                    onKeyupEsc: true
                });
            }
            if ((contrail.checkIfExist(options['onSave'])) && (contrail.checkIfFunction(options['onSave']))) {
                footer.push({
                    className: 'btn-primary btnSave',
                    title: (options['btnName']) ? options['btnName'] : 'Save',
                    onclick: function () {
                        options['onSave']();
                        if ($('#' + modalId).find('.generic-delete-form').length > 0) {
                            $('#' + modalId).find('.btn-primary.btnSave').hide();
                        }
                    },
                    onKeyupEnter: true
                });
            }
            } else {
                footer = options['footer'];
            }
            $.contrailBootstrapModal({
                id: modalId,
                className: options['className'],
                title: options['title'],
                body: options['body'],
                footer: footer
            });
        };

        this.createWizardModal = function (options) {
            var modalId = options['modalId'];
            $.contrailBootstrapModal({
                id: modalId,
                className: options['className'],
                title: options['title'],
                body: options['body'],
                footer: false,
                keyupAction: {
                    onKeyupEnter: function () {
                        options['onSave']();
                    },
                    onKeyupEsc: function () {
                        options['onCancel']();
                    }
                }
            });
        };

        this.updateColorSettingsWithCookie = function () {
            var cookieColorScheme = JSON.parse(contrail.getCookie(cowc.COOKIE_COLOR_SCHEME));
            if(cookieColorScheme && cookieColorScheme.color) {
                var color = cookieColorScheme.color;
                cowc.FIVE_NODE_COLOR = color.FIVE_NODE_COLOR;
                cowc.THREE_NODE_COLOR = color.THREE_NODE_COLOR;
                cowc.SINGLE_NODE_COLOR = color.SINGLE_NODE_COLOR;
                cowc.DEFAULT_COLOR = color.SINGLE_NODE_COLOR;
            }
        };

        this.updateSettingsWithCookie =  function (viewConfig) {
            try {
                this.updateColorSettingsWithCookie();
                var cookieSettings = JSON.parse(contrail.getCookie(cowc.COOKIE_CHART_SETTINGS));
                if(cookieSettings && viewConfig && viewConfig.chartOptions) {
                    var isChartSettingsOverride = cowu.getValueByJsonPath(viewConfig, "chartOptions;isChartSettingsOverride", true);
                    if(isChartSettingsOverride) {
                        for(var key in cookieSettings) {
                            viewConfig.chartOptions[key] = cookieSettings[key];
                        }
                    }
                }
            }
            catch(e) {

            }
        };

        this.updateMultiViewSettingsFromCookie = function() {
            try {
                var cookieSettings =
                    JSON.parse(contrail.getCookie(cowc.COOKIE_CHART_SETTINGS));
                if(cookieSettings) {
                    for(var key in cookieSettings) {
                        if(key == cowc.SHOW_MULTI_VIEWS) {
                            cowc.ENABLE_CAROUSEL = cookieSettings[key];
                            break;
                        }
                    }
                }
            }
            catch(e){

            }
        }

        this.enableModalLoading = function (modalId) {
            $('#' + modalId).find('.modal-header h6').prepend('<i class="fa fa-spinner fa-spin margin-right-10 modal-loading-icon">');
            $('#' + modalId).find('.modal-header .fa-remove').addClass('icon-muted');

            $('#' + modalId).find('.modal-footer .btn').attr('disabled', true);
            $('#' + modalId).find('.modal-header button').attr('disabled', true);

        };

        this.disableModalLoading = function (modalId, callback) {
            setTimeout(function () {
                $('#' + modalId).find('.modal-body').animate({scrollTop: 0});

                $('#' + modalId).find('.modal-header h6 .modal-loading-icon').remove();
                $('#' + modalId).find('.modal-header .fa-remove').removeClass('icon-muted');

                $('#' + modalId).find('.modal-footer .btn').attr('disabled', false);
                $('#' + modalId).find('.modal-header button').attr('disabled', false);

                callback();
            }, 1000);
        };

        this.createColumns4Grid = function (fieldsObj) {
            var key, columns = [];
            for (key in fieldsObj) {
                columns.push({id: key, field: key, name: self.getGridTitle4Field(key), width: 150, minWidth: 15});
            }
        };
        this.getGridTitle4Field = function (field) {
            var title = field;
            return title;
        };
        this.getJSONValueByPath = function (jsonPath, jsonObj) {
            var path = jsonPath.replace(/\[(\w+)\]/g, '.$1');
            path = path.replace(/^\./, '');

            var pathArray = path.split('.'),
                obj = jsonObj;

            while (pathArray.length) {
                var property = pathArray.shift();
                if (obj != null && property in obj) {
                    obj = obj[property];
                } else {
                    return '-';
                }
            }

            if (contrail.checkIfExist(obj)) {
                obj = ($.isArray(obj) || typeof(obj) == "object") ? obj : obj.toString().trim();
                if (obj !== '' || obj === 0) {
                    return obj;
                }
            }

            return '-';
        };

        this.formatXML2JSON = function(xmlString, is4SystemLogs) {
            if (xmlString && xmlString != '') {
                var xmlDoc = filterXML(xmlString, is4SystemLogs);
                return $.xml2json(serializer.serializeToString(xmlDoc))
            } else {
                return '';
            }
        };

        this.getRequestState4Model = function(model, data, checkEmptyDataCB) {
            if (model.isRequestInProgress()) {
                return cowc.DATA_REQUEST_STATE_FETCHING;
            } else if (model.error === true) {
                return cowc.DATA_REQUEST_STATE_ERROR;
            } else if (model.empty === true || (contrail.checkIfFunction(checkEmptyDataCB) && checkEmptyDataCB(data))) {
                return cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY;
            } else {
                return cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY
            }
        };

        this.formatElementId = function (strArray) {
            var elId = '',
                str = strArray.join('_');
            elId = str.split(" ").join("_");
            return elId.toLowerCase();

        };

        this.flattenObject = function (object, intoObject, prefix) {
            var self = this;
            intoObject = intoObject || {};
            prefix = prefix || '';

            _.forEach(object, function (value, key) {
                if (object.hasOwnProperty(key)) {
                    if (value && typeof value === 'object' && !(value instanceof Array || value instanceof Date || value instanceof RegExp || value instanceof Backbone.Model || value instanceof Backbone.Collection)) {
                        self.flattenObject(value, intoObject, prefix + key + '.');
                    } else {
                        intoObject[prefix + key] = value;
                    }
                }
            });

            return intoObject;
        };

        self.handleNull4Grid = function(value, placeHolder) {
            if(value == 0) {
                return 0;
            } else if (value != null && value != '') {
                return value;
            } else if (placeHolder != null) {
                return placeHolder;
            } else {
                return '';
            }
        };

        self.formatMicroDate = function(microDateTime) {
            var microTime, resultString;
            if(microDateTime == null || microDateTime == 0 || microDateTime == '') {
                resultString = '';
            } else {
                microTime = microDateTime % 1000;
                resultString = moment(new Date(microDateTime / 1000)).format('YYYY-MM-DD HH:mm:ss:SSS');
                if (microTime > 0) {
                    resultString += ':' + microTime;
                } else {
                    resultString += ':0';
                }
            }
            return resultString;
        };

        this.isEmptyObject = function (obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    return false;
            }
            return true;
        };

        this.formatFormData = function (data, option) {
            var self = this,
                formattedData = [];
            if (typeof data[0] === 'object') {
                if (typeof option.dataValueField !== 'undefined' && typeof option.dataTextField !== 'undefined') {
                    $.each(data, function (key, val) {
                        if ('children' in val){
                            self.formatFormData(val.children, option);
                        }
                        data[key][option.dataValueField.apiVar] = val[option.dataValueField.dsVar];
                        data[key][option.dataTextField.apiVar] = val[option.dataTextField.dsVar];
                    });
                }
            } else {
                $.each(data, function (key, val) {
                    formattedData.push({
                        id: val,
                        value: String(val),
                        text: String(val)
                    });
                });
                data = formattedData;
            }
            return data;
        };

        this.getEditConfigObj = function (configObj, locks, schema, path) {
            var lock = null,
                testobj = $.extend(true, {}, configObj);

            delete testobj.errors;
            delete testobj.locks;

            $.each(testobj, function (attribute, value) {
                if (_.isArray(value)) {
                    if (contrail.checkIfExist(locks[attribute + cowc.LOCKED_SUFFIX_ID])) {
                        lock = locks[attribute + cowc.LOCKED_SUFFIX_ID];
                        if (lock === true) {
                            delete testobj[attribute];
                        }
                    } else {
                        delete testobj[attribute];
                    }
                }
                // check if value is a key or object
                // if object make a recursive call on value
                else if (_.isObject(value)) {
                    testobj[attribute] = cowu.getEditConfigObj(value, locks, schema, path+'.properties.'+attribute);
                    if ($.isEmptyObject(testobj[attribute])) {
                        delete testobj[attribute];
                    }
                }
                // if we reach here :- then value is a key
                // now we check if the value is locked
                // we check it from the 'locks'
                else {
                    if (contrail.checkIfExist(value) && (typeof value == 'string')) {
                        testobj[attribute] = value.trim();
                    }

                    var currentAttr = testobj[attribute],
                        currentAttrPath = (path+'.properties.'+attribute).substring(1),
                        currentAttrSchemaObject = jsonPath(schema, currentAttrPath)[0];

                    if(contrail.checkIfExist(currentAttrSchemaObject)) {
                        if((currentAttrSchemaObject.type === cowc.TYPE_NUMBER) || (currentAttrSchemaObject.type === cowc.TYPE_INTEGER)) {
                            testobj[attribute] = parseInt(currentAttr, 10);
                        } else if(currentAttrSchemaObject.type === cowc.TYPE_BOOLEAN) {
                            // return boolean true or false if string 'true' or 'false' respectively
                            testobj[attribute] = (currentAttr == "true");
                        }
                    }

                    if (contrail.checkIfExist(locks[attribute + cowc.LOCKED_SUFFIX_ID])) {
                        lock = locks[attribute + cowc.LOCKED_SUFFIX_ID];
                        if (lock === true) {
                            delete testobj[attribute];
                        }
                    } else {
                        delete testobj[attribute];
                    }
                }
            });
            return testobj;
        };

        this.getForceAxis4Chart = function (chartData, fieldName, forceAxis) {
            var axisMin = 0, axisMax;

            //If all nodes are closer,then adding 10% buffer on edges makes them even closer
            if(chartData.length > 0) {
                axisMax = d3.max(chartData, function (d) {
                        return +d[fieldName];
                    });
                axisMin = d3.min(chartData, function (d) {
                        return +d[fieldName];
                    });

                if (axisMax == null) {
                    axisMax = 1;
                } else {
                    axisMax += axisMax * 0.1;
                }

                if (axisMin == null) {
                    axisMin = 0;
                } else {
                    axisMin -= axisMax * 0.1;

                    if(axisMin <= 0) {
                        axisMin = 0;
                    }
                }
            } else {
                axisMax = 1;
                axisMin = 0;
            }

            if (forceAxis) {
                if (axisMin > forceAxis[0]) {
                    axisMin = forceAxis[0];
                }

                if (axisMax < forceAxis[1]) {
                    axisMax = forceAxis[1];
                }
            }

            return [axisMin, axisMax];
        };

        this.getFilterEvent = function() {
            return {
                click: function (event, self, controlPanelSelector, configValue) {
                    var controlPanelExpandedTemplateConfig = configValue,
                        chartControlPanelExpandedSelector = $(controlPanelSelector).parent().find('.control-panel-expanded-container'),
                        templateId = (controlPanelExpandedTemplateConfig.viewConfig.groupType === '2-cols') ?
                            cowc.TMPL_CONTROL_PANEL_FILTER_2_COL : cowc.TMPL_CONTROL_PANEL_FILTER;

                    if (chartControlPanelExpandedSelector.find('.control-panel-filter-container').length == 0) {
                        var controlPanelExpandedTemplate = contrail.getTemplate4Id(templateId);

                        chartControlPanelExpandedSelector.html(controlPanelExpandedTemplate(controlPanelExpandedTemplateConfig));
                    }

                    $(self).toggleClass('active');
                    $(self).toggleClass('refreshing');

                    chartControlPanelExpandedSelector.toggleElement();

                    if (chartControlPanelExpandedSelector.is(':visible')) {
                        chartControlPanelExpandedSelector.find('.control-panel-filter-body').height(chartControlPanelExpandedSelector.height() - 30);
                        if (controlPanelExpandedTemplateConfig.viewConfig.groupType === '2-cols') {
                            $.each(controlPanelExpandedTemplateConfig.viewConfig.groups, function (groupColumnKey, groupColumnValue) {
                                $.each(groupColumnValue, function (groupKey, groupValue) {
                                    $.each(groupValue.items, function (itemKey, itemValue) {
                                        var controlPanelFilterGroupElement = $('#control-panel-filter-group-items-' + groupValue.id).find('input')[itemKey];

                                        _.forEach(itemValue.events, function (eventValue, eventKey) {
                                            $(controlPanelFilterGroupElement)
                                                .off(eventKey)
                                                .on(eventKey, function (event) {
                                                    eventValue(event)
                                                });
                                        });
                                    });
                                });
                            });
                        } else {
                            $.each(controlPanelExpandedTemplateConfig.viewConfig.groups, function (groupKey, groupValue) {
                                $.each(groupValue.items, function (itemKey, itemValue) {
                                    var controlPanelFilterGroupElement = $('#control-panel-filter-group-items-' + groupValue.id).find('input')[itemKey];

                                    _.forEach(itemValue.events, function (eventValue, eventKey) {
                                        $(controlPanelFilterGroupElement)
                                            .off(eventKey)
                                            .on(eventKey, function (event) {
                                                eventValue(event)
                                            });
                                    });
                                });
                            });
                        }

                        chartControlPanelExpandedSelector.find('.control-panel-filter-close')
                            .off('click')
                            .on('click', function() {
                                chartControlPanelExpandedSelector.hideElement();
                                $(self).removeClass('active');
                                $(self).removeClass('refreshing');
                                $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                            });

                    } else {
                        $(controlPanelSelector).find('.control-panel-item').removeClass('disabled');
                    }

                    event.stopPropagation();
                }
            }
        };

        this.constructJsonHtmlViewer = function (jsonValue, formatDepth, currentDepth, ignoreKeys) {
            var htmlValue = '',
                objType = {type: 'object', startTag: '{', endTag: '}'};

            if(jsonValue instanceof Array){
                objType = {type: 'array', startTag: '[', endTag: ']'};
            }

            if(formatDepth == 0){
                htmlValue += '<i class="node-' + currentDepth + ' fa fa-plus expander"></i> ' + objType.startTag + '<ul data-depth="' + currentDepth + '" class="node-' + currentDepth + ' node hidden raw">' +
                    JSON.stringify(jsonValue) + '</ul><span class="node-' + currentDepth + ' collapsed expander"> ... </span>' + objType.endTag;
            }
            else {
                htmlValue += '<i class="node-' + currentDepth + ' fa fa-minus collapser"></i> ' + objType.startTag + '<ul data-depth="' + currentDepth + '" class="node-' + currentDepth + ' node">';
                $.each(jsonValue, function(key, val){
                    if (!contrail.checkIfExist(ignoreKeys) || (contrail.checkIfExist(ignoreKeys) && ignoreKeys.indexOf(key) === -1)) {
                        if (objType['type'] == 'object') {
                            htmlValue += '<li class="key-value"><span class="key">' + key + '</span>: ';
                        }
                        else {
                            htmlValue += '<li class="key-value">';
                        }

                        if (val != null && typeof val == 'object') {
                            htmlValue += '<span class="value">' + cowu.constructJsonHtmlViewer(val, formatDepth - 1, currentDepth + 1) + '</span>';
                        }
                        else {
                            htmlValue += '<span class="value ' + typeof val + '">' + val + '</span>';
                        }
                        htmlValue += '</li>';
                    }
                });
                htmlValue += '</ul><span class="node-' + currentDepth + ' collapsed hidden expander"> ... </span>' + objType.endTag;
            }
            return htmlValue;
        };

        this.expandJsonHtml = function(element) {
            var selfParent = element.parent(),
                jsonObj = {};
            selfParent.children('i').removeClass('fa-plus').removeClass('expander').addClass('fa fa-minus').addClass('collapser');
            if(selfParent.children('.node').hasClass('raw')){
                jsonObj = JSON.parse(selfParent.children('ul.node').text());
                selfParent.empty().append(contrail.formatJsonObject(jsonObj, 2, parseInt(selfParent.children('.node').data('depth')) + 1));
            }
            selfParent.children('.node').showElement();
            selfParent.children('.collapsed').hideElement();
        };

        this.collapseJsonHtml = function(element) {
            var selfParent = element.parent();
            selfParent.children('i').removeClass('fa-minus').removeClass('collapser').addClass('fa fa-plus').addClass('expander');
            selfParent.children('.collapsed').showElement();
            selfParent.children('.node').hideElement();
        };

        // Deprecated: We should use renderView4Config of ContrailView instead of following function.
        this.renderView4Config = function (parentElement, model, viewObj, validation, lockEditingByDefault, modelMap) {
            var viewName = viewObj['view'],
                viewPathPrefix = viewObj['viewPathPrefix'],
                elementId = viewObj[cowc.KEY_ELEMENT_ID],
                validation = (validation != null) ? validation : cowc.KEY_VALIDATION,
                viewConfig = viewObj[cowc.KEY_VIEW_CONFIG],
                viewAttributes = {viewConfig: viewConfig, elementId: elementId, validation: validation, lockEditingByDefault: lockEditingByDefault},
                app = viewObj['app'];

            console.warn(cowm.DEPRECATION_WARNING_PREFIX + 'Function renderView4Config of core-utils is deprecated. Use renderView4Config() of ContrailView instead.');

            var renderConfig = {
                parentElement: parentElement,
                viewName: viewName,
                viewPathPrefix: viewPathPrefix,
                model: model,
                viewAttributes: viewAttributes,
                modelMap: modelMap,
                app: app
            };

            cowu.renderView(renderConfig);
        };

        this.renderView = function (renderConfig, renderCallback) {
            var elementView, viewPath, viewName, parentElement,
                model, viewAttributes, modelMap, rootView, viewPathPrefix,
                onAllViewsRenderCompleteCB, onAllRenderCompleteCB,
                lazyRenderingComplete, app = renderConfig['app'];

            if (app == cowc.APP_CONTRAIL_CONTROLLER) {
                ctwu.renderView(renderConfig, renderCallback);
            } else if (app == cowc.APP_CONTRAIL_SM) {
                smwu.renderView(renderConfig, renderCallback);
            } else if (app == cowc.APP_CONTRAIL_STORAGE) {
                swu.renderView(renderConfig, renderCallback);
            } else {
                parentElement = renderConfig['parentElement'];
                viewName = renderConfig['viewName'];
                /**
                 * if views are dynamically loaded using viewPathPrefix in a viewConfig, the path should prefix
                 * with 'core-basedir' as depending on the env, the root dir from which the files are served changes.
                 */
                viewPathPrefix = contrail.checkIfExist(renderConfig['viewPathPrefix']) ? 'core-basedir/' + renderConfig['viewPathPrefix'] : 'core-basedir/js/views/',
                model = renderConfig['model'];
                viewAttributes = renderConfig['viewAttributes'];
                modelMap = renderConfig['modelMap'];
                rootView = renderConfig['rootView'];
                viewPath = viewPathPrefix + viewName;

                //If there exists requireJS alias for the current view path,use that
                var pathMapping = _.invert(require.s.contexts._.config.paths);
                pathMapping = {
                    'core-basedir/js/views/GridStackView' : 'gs-view'
                }
                viewPath = ifNull(pathMapping[viewPath],viewPath);

                onAllViewsRenderCompleteCB = renderConfig['onAllViewsRenderCompleteCB'];
                onAllRenderCompleteCB = renderConfig['onAllRenderCompleteCB'];
                lazyRenderingComplete  = renderConfig['lazyRenderingComplete'];

                require([viewPath], function(ElementView) {
                    elementView = new ElementView({el: parentElement, model: model, attributes: viewAttributes, rootView: rootView, onAllViewsRenderCompleteCB: onAllViewsRenderCompleteCB, onAllRenderCompleteCB: onAllRenderCompleteCB});
                    elementView.viewName = viewName;
                    elementView.modelMap = modelMap;
                    elementView.beginMyViewRendering();
                    try {
                        elementView.render();
                    } catch (error) {
                        elementView.error = true;
                        console.log(error.stack);
                    }
                    if(contrail.checkIfFunction(renderCallback)) {
                        renderCallback(elementView);
                    }

                    if(lazyRenderingComplete == null || !lazyRenderingComplete) {
                        elementView.endMyViewRendering();
                    }
                });
            }
        };

        this.getAttributeFromPath = function (attributePath) {
            var attributePathArray = attributePath.split('.'),
                attribute = attributePathArray[attributePathArray.length - 1];

            return attribute;
        };

        this.checkAndRefreshContrailGrids = function(elements) {
            if (_.isArray(elements)) {
                _.forEach(elements, function(elementValue) {
                    if (contrail.checkIfExist($(elementValue).data('contrailGrid'))) {
                        $(elementValue).data('contrailGrid').refreshView();
                    }
                });
            } else {
                if (contrail.checkIfExist($(elements).data('contrailGrid'))) {
                    $(elements).data('contrailGrid').refreshView();
                }
            }
        };
    //function for setting the page id on changeRegion event
        this.setGlobalControllerPageId = function(region){
            var hashString = window.location.hash;
            if(region != 'All Regions'){
                currHashState = layoutHandler.getURLHashObj();
                currHashState = (currHashState && !isGlobalControllerFlow(currHashState)) ? currHashState.p : 'mon_infra_dashboard';
                if ((hashString.indexOf('config_gc') > -1)) {
                    layoutHandler.setURLHashObj({'p' : 'config_infra_gblconfig', 'region' : region});
                }
                else{
                    layoutHandler.setURLHashObj({'p' : currHashState, 'region' : region});
                }
                $("#page-content").removeClass("dashboard-no-padding").addClass("dashboard-padding");
           }
           else{
               if ((hashString.indexOf('config_infra_gblconfig') > -1)) {
                   layoutHandler.setURLHashObj({'p' : 'config_gc_location', 'region' : region});
               }
               else {
                   layoutHandler.setURLHashObj({'p' : 'mon_gc_globalcontroller', 'region' : region});
               }
               $("#page-content").removeClass("dashboard-padding").addClass("dashboard-no-padding");
           }
        }
        /* It is used to manipulate the hashparams for custom requirements*/
        this.overrideHashParams = function(hashParams, lastHash){
            var prevTab = getValueByJsonPath(lastHash,
                    'q;tab;security-policy-tab', '', false);
            /* retain selected tab when navigating between
            global policies and project scoped policies pages */
            if(prevTab) {
                hashParams.q = {tab: {'security-policy-tab' : prevTab}};
            }
            return hashParams;
        }

        /* Detail Template Generator*/
        this.generateBlockListTemplate = function (config, app, parentConfig) {
            var template = '' +
                '{{#IfCompare requestState "' + cowc.DATA_REQUEST_STATE_SUCCESS_NOT_EMPTY + '" operator="!==" }}' +
                    '{{#IfCompare requestState "' + cowc.DATA_REQUEST_STATE_FETCHING + '" operator="===" }}' +
                        '<p>' + cowm.DATA_FETCHING+ '</p>' +
                    '{{/IfCompare}} ' +
                    '{{#IfCompare requestState "' + cowc.DATA_REQUEST_STATE_ERROR + '" operator="===" }}' +
                        '<p class="error-text">' + cowm.DATA_ERROR + '</p>' +
                    '{{/IfCompare}} ' +
                    '{{#IfCompare requestState "' + cowc.DATA_REQUEST_STATE_SUCCESS_EMPTY + '" operator="===" }}' +
                        '<p>' + cowm.DATA_SUCCESS_EMPTY + '</p>' +
                    '{{/IfCompare}} ' +
                '{{else}}' +
                 self.generateBlockListKeyValueTemplate(config, app, parentConfig, 'data') +
                '{{/IfCompare}}';

            return template;
        };

        this.generateBlockListKeyValueTemplate = function (config, app, parentConfig, objectAccessor) {
            var template = '<ul class="item-list">',
                showAllFields = contrail.checkIfExist(parentConfig.showAllFields) ? parentConfig.showAllFields : false;

            $.each(config, function (configKey, configValue) {
                var keyValueTemplate = '' +
                    '<li>' +
                        '<div class="row">' +
                            '<div class="key col-xs-5 ' + (parentConfig.keyClass != null ? parentConfig.keyClass : '') +
                            ' ' + (configValue.keyClass != null ? configValue.keyClass : '')+'"> {{getLabel "' +
                            configValue.label + '" "' + configValue.key + '" "' + app + '"}} </div>' +
                            '<div class="value col-xs-7 ' + (parentConfig.valueClass != null ? parentConfig.valueClass : '') +
                            ' ' + (configValue.valueClass != null ? configValue.valueClass : '')+'">' + self.getValueByConfig(configValue, app, objectAccessor) + '</div>'+
                        '</div>' +
                    '</li>';

                if (!showAllFields) {
                    template += '' +
                        '{{#IfValidJSONValueByPath "' + configValue.key + '" ' + objectAccessor + ' ' + configKey + '}}' +
                            keyValueTemplate +
                        '{{/IfValidJSONValueByPath}}';
                } else {
                    template += keyValueTemplate;
                }
            });

            template += '</ul>';

            return template;
        };

        /**
        * Get the value of a property inside a json object with a given path
        */
        this.getValueByJsonPath = function(obj,pathStr,defValue,doClone) {
            try {
                var currObj = obj;
                var pathArr = pathStr.split(';');
                var doClone = ifNull(doClone,true);
                var arrLength = pathArr.length;
                for(var i=0;i<arrLength;i++) {
                    if(currObj[pathArr[i]] != null) {
                        currObj = currObj[pathArr[i]];
                    } else
                        return defValue;
                }
                if(currObj instanceof Array) {
                    if(doClone == false) {
                        return currObj;
                    } else {
                        return $.extend(true,[],currObj);
                    }
                } else if(typeof(currObj) == "object") {
                    if(doClone == false) {
                        return currObj;
                    } else {
                        return $.extend(true,{},currObj);
                    }
                } else
                    return currObj;
            } catch(e) {
                return defValue;
            }
        }

        this.sanitize = function (str) {
            try {
                return (str != null)? (str + "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"): str;
            } catch(e) {
                return str;
            }
        }

        this.deSanitize = function (str) {
            try {
                return (str != null)? (str + "").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">"): str;
            } catch(e) {
                return str;
            }
        }

        this.getValueByConfig = function(configValue, app, objectAccessor) {
            var templateGenerator = configValue.templateGenerator;
            if (templateGenerator === 'TextGenerator' || templateGenerator === 'LinkGenerator' || templateGenerator === 'json') {
                return '{{{getValueByConfig ' + objectAccessor + ' config=\'' + encodeURIComponent(JSON.stringify(configValue)) + '\'}}}';
            } else {
                return self.generateInnerTemplate(configValue, app, objectAccessor);
            }

        };

        this.generateBlockGridHeaderTemplate = function (config, app, parentConfig) {
            var template = '<div class="detail-block-grid-header"><div class="detail-block-grid-row">';

            $.each(config, function (configKey, configValue) {
                template += '<div class="detail-block-grid-cell"' +
                    (contrail.checkIfKeyExistInObject(true, configValue, 'templateGeneratorConfig.width') ?
                    'style="width: ' + configValue.templateGeneratorConfig.width + 'px;"' : '') + '>' +
                    '<div style="width: inherit; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 20px;">' + cowl.get(configValue.key, app) + '</div></div>';
            });

            template += '</div></div>';

            return template;
        };

        this.generateBlockGridBodyTemplate = function (config, app, objectAccessor) {
            var objectAccessor = contrail.checkIfExist(objectAccessor) ? objectAccessor : 'data',
                template = '<div class="detail-block-grid-body">' +
                '{{#each ' + objectAccessor + '.' + config.key + '}} ' +
                '<div class="detail-block-grid-row">' +
                '';

            $.each(config.templateGeneratorConfig.dataColumn, function (configKey, configValue) {
                template += '<div class="detail-block-grid-cell" ' +
                    (contrail.checkIfKeyExistInObject(true, configValue, 'templateGeneratorConfig.width') ?
                    'style="width: ' + configValue.templateGeneratorConfig.width + 'px;"' : '') + '>' +
                    '<div style="width: inherit; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; height: 20px;" ' +
                    'title="{{{getValueByConfig this config=\'' + encodeURIComponent(JSON.stringify(configValue)) + '\'}}}">' +
                    '{{{getValueByConfig this config=\'' + encodeURIComponent(JSON.stringify(configValue)) + '\'}}}</div>' +
                    '</div>';
            });

            template += '' +
                '</div> ' +
                '{{/each}}' +
                '</div>';

            return template;
        };

        this.generateInnerTemplate = function (config, app, objectAccessor) {
            var template, templateObj,
                templateGenerator = config.templateGenerator, templateGeneratorConfig = config.templateGeneratorConfig,
                objectAccessor = contrail.checkIfExist(objectAccessor) ? objectAccessor : 'data';

            switch (templateGenerator) {
                case 'RowSectionTemplateGenerator':
                    var rowTemplate, rowTemplateObj;
                    template = contrail.getTemplate4Id(cowc.TMPL_DETAIL_SECTION);
                    templateObj = $(template());

                    $.each(templateGeneratorConfig.rows, function (rowKey, rowValue) {
                        rowTemplate = contrail.getTemplate4Id(cowc.TMPL_DETAIL_SECTION_ROW);
                        rowTemplateObj = $(rowTemplate());

                        rowTemplateObj.append(self.generateInnerTemplate(rowValue, app))
                        templateObj.append(rowTemplateObj);
                    });
                    break;

                case 'ColumnSectionTemplateGenerator':
                    var columnTemplate, columnTemplateObj;
                    template = contrail.getTemplate4Id(cowc.TMPL_DETAIL_SECTION);
                    templateObj = $(template());

                    $.each(templateGeneratorConfig.columns, function (columnKey, columnValue) {
                        columnTemplate = contrail.getTemplate4Id(cowc.TMPL_DETAIL_SECTION_COLUMN);
                        columnTemplateObj = $(columnTemplate({class: columnValue.class}));

                        $.each(columnValue.rows, function (rowKey, rowValue) {
                            columnTemplateObj.append(self.generateInnerTemplate(rowValue, app));
                            templateObj.append(columnTemplateObj);
                        });
                    });
                    break;

                case 'BlockListTemplateGenerator':
                    var template = '';
                    if (config.theme == cowc.THEME_DETAIL_WIDGET) {
                        template = '' +
                            '<div class="detail-block-list-content widget-box transparent">' +
                                '<div class="widget-header">' +
                                    '<h4 class="smaller">' +
                                        '{{#IfCompare requestState "fetching" operator="==" }}' + '<i class="fa fa-spin fa-spinner"></i>' + '{{/IfCompare}}' +
                                        config.title +
                                    '</h4>' +
                                    '<div class="widget-toolbar pull-right">' +
                                        '<a data-action="collapse"><i class="fa fa-chevron-up"></i></a>' +
                                    '</div>' +
                                    ((config.advancedViewOptions !== false) ? '' +
                                        '<div class="widget-toolbar pull-right">' +
                                            '<a data-action="settings" data-toggle="dropdown" style="display: inline-block;"><i class="fa fa-cog"></i></a>' +
                                            '<ul class="pull-right dropdown-menu dropdown-caret dropdown-closer">' +
                                                '<li><a data-action="list-view"><i class="fa fa-list"></i> &nbsp; Basic view </a></li>' +
                                                '<li><a data-action="advanced-view"><i class="fa fa-code"></i> &nbsp; Advanced view </a></li>' +
                                            '</ul>' +
                                        '</div>' : '') +
                                '</div>' +
                                '<div class="widget-body">' +
                                    '<div class="widget-main">' +
                                        '<div class="list-view">' +
                                            self.generateBlockListTemplate(config.templateGeneratorConfig, app, config) +
                                        '</div>' +
                                        '<div class="advanced-view hidden">' +
                                            '{{{formatGridJSON2HTML this.data' +
                                                ((contrail.checkIfExist(config.templateGeneratorData) && config.templateGeneratorData !== '') ? '.' + config.templateGeneratorData : '') +
                                            '}}}' +
                                        '</div>' +
                                        '<div class="contrail-status-view hidden">' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';
                    } else {
                        template = '<div class="detail-block-list-content row-fluid">' +
                            '<h6>' + config.title + '</h6>' +
                             self.generateBlockListTemplate(config.templateGeneratorConfig, app, config) +
                            '<br/></div>';
                    }

                    templateObj = $(template);
                    break;

                case 'BlockArrayListTemplateGenerator':
                    var template = '<div>' +
                        '{{#IfValidJSONValueByPathLength "' + objectAccessor + '.' + config.key + '" this}} ' +
                        '<div class="detail-block-array-list-content row-fluid">' +
                        (contrail.checkIfExist(config.title) ? '<h6>' + config.title + '</h6>' : '') +
                        '<div class="row-fluid detail-block-array-list">' +
                        '{{#each ' + objectAccessor + '.' + config.key + '}} ' +
                        '{{#IfCompare @index 0 operator="%2"}} ' +
                        '{{#IfCompare @index 0 operator="!="}}' +
                        '</div>' +
                        '<div class="row-fluid">' +
                        '{{else}}' +
                        '<div class="row-fluid">' +
                        '{{/IfCompare}}' +
                        '{{/IfCompare}}' +
                        '<div class="col-xs-6">' +
                        '<div class="row-fluid detail-block-array-list-item"> ' +
                        '<div class="row-fluid title">' + cowl.get(config.templateGeneratorConfig.titleColumn.key, app) + ': {{{getValueByConfig this config=\'' + encodeURIComponent(JSON.stringify(config.templateGeneratorConfig.titleColumn)) + '\'}}}</div>' +
                        '<div class="row-fluid data">' + self.generateBlockListKeyValueTemplate(config.templateGeneratorConfig.dataColumn, app, config, 'this') + '</div>' +
                        '</div>' +
                        '</div>' +
                        '{{/each}}' +
                        '</div> {{/IfValidJSONValueByPathLength}} </div>';

                    templateObj = $(template);
                    break;

                case 'BlockGridTemplateGenerator':
                    var template = '<div>' +
                        '{{#IfValidJSONValueByPathLength "' + config.key + '" ' + objectAccessor + '}} ' +
                        '<div class="row-fluid">' +
                        (contrail.checkIfExist(config.title) ? '<h6>' + config.title + '</h6>' : '') +
                        '<div class="row-fluid">' +
                        '<div class="detail-block-grid">' +
                        self.generateBlockGridHeaderTemplate(config.templateGeneratorConfig.dataColumn, app, config) +
                        self.generateBlockGridBodyTemplate(config, app, objectAccessor) +
                        '</div>' +
                        '</div></div>{{/IfValidJSONValueByPathLength}} </div>';

                    templateObj = $(template);
                    break;

                case 'BlockAdvancedOnlyTemplateGenerator':
                    var template = '';

                    template = '' +
                        '<div class="advanced-view">' +
                            '{{{formatGridJSON2HTML this.data' +
                                ((contrail.checkIfExist(config.templateGeneratorData) && config.templateGeneratorData !== '') ? '.' + config.templateGeneratorData : '') +
                            '}}}' +
                        '</div>' ;

                    templateObj = $(template);
                    break;
            };

            return (templateObj.prop('outerHTML'))
        };

        this.generateDetailTemplateHTML = function (config, app, jsonString) {
            var template = contrail.getTemplate4Id(cowc.TMPL_DETAIL_FOUNDATION),
                templateObj = $(template(config)),
                jsonValueString ='{{#if this.data.rawJson}}{{{formatGridJSON2HTML this.data.rawJson' +  (contrail.checkIfExist(jsonString) ? '.' + jsonString : '') + '}}}'+
                                '{{else}}{{{formatGridJSON2HTML this.data' +  (contrail.checkIfExist(jsonString) ? '.' + jsonString : '') + '}}}' +
                                '{{/if}}';

            templateObj.find('.detail-foundation-content-basic').append(self.generateInnerTemplate(config, app));
            templateObj.find('.detail-foundation-content-advanced').append(jsonValueString);

            return (templateObj.prop('outerHTML'))
        };

        this.generateDetailTemplate = function (config, app) {
            var template = contrail.getTemplate4Id(cowc.TMPL_DETAIL_FOUNDATION),
                templateObj = $(template(config));

            templateObj.find('.detail-foundation-content-basic').append(self.generateInnerTemplate(config, app));
            templateObj.find('.detail-foundation-content-advanced').append('{{{formatGridJSON2HTML this.data}}}');

            return Handlebars.compile(templateObj.prop('outerHTML'));
        };

        this.getValueFromTemplate = function (args) {
            return args[0].replace(/\{(\d+)\}/g, function (m, n) {
                n = parseInt(n) + 1;
                return args[n];
            });
        };

        this.replaceAll = function (find, replace, strValue) {
            return strValue.replace(new RegExp(find, 'g'), replace);
        };

        this.addUnits2Bytes = function (traffic, noDecimal, maxPrecision, precision, timeInterval) {
            var trafficPrefixes = cowc.BYTE_PREFIX,
                formatStr = '', decimalDigits = 2, size = 1024;

            if (!$.isNumeric(traffic)) {
                return '-';
            } else if (traffic == 0) {
                if (timeInterval != null && timeInterval != 0) {
                    return '0 bps';
                } else {
                    return '0 B';
                }
            }

            if (timeInterval != null && timeInterval != 0) {
                trafficPrefixes = ['bps', 'kbps', 'mbps', 'gbps', 'tbps', 'pbps', 'ebps', 'zbps'];
                size = 1000;
                traffic = (traffic * 8) / timeInterval;
            }

            if ((maxPrecision != null) && (maxPrecision == true)) {
                decimalDigits = 6;
            } else if (precision != null) {
                decimalDigits = precision < 7 ? precision : 6;
            }

            if (noDecimal != null && noDecimal == true)
                decimalDigits = 0;


            traffic = parseInt(traffic);
            traffic = makePositive(traffic);

            $.each(trafficPrefixes, function (idx, prefix) {
                if (traffic < size) {
                    formatStr = contrail.format('{0} {1}', parseFloat(traffic.toFixed(decimalDigits)), prefix);
                    return false;
                } else {
                    //last iteration
                    if (idx == (trafficPrefixes.length - 1))
                        formatStr = contrail.format('{0} {1}', parseFloat(traffic.toFixed(decimalDigits)), prefix);
                    else
                        traffic = traffic / size;
                }
            });
            return formatStr;
        };

        this.addUnits2Packets = function (traffic, noDecimal, maxPrecision, precision) {
            var trafficPrefixes = ['packets', 'K packets', 'M packets', "B packets", "T packets"],
                formatStr = '', decimalDigits = 2, size = 1000;

            if (!$.isNumeric(traffic)) {
                return '-';
            } else if (traffic == 0) {
                return '0 packets';
            }

            if ((maxPrecision != null) && (maxPrecision == true)) {
                decimalDigits = 6;
            } else if (precision != null) {
                decimalDigits = precision < 7 ? precision : 6;
            }

            if (noDecimal != null && noDecimal == true)
                decimalDigits = 0;


            traffic = parseInt(traffic);
            traffic = makePositive(traffic);

            $.each(trafficPrefixes, function (idx, prefix) {
                if (traffic < size) {
                    formatStr = contrail.format('{0} {1}', parseFloat(traffic.toFixed(decimalDigits)), prefix);
                    return false;
                } else {
                    //last iteration
                    if (idx == (trafficPrefixes.length - 1))
                        formatStr = contrail.format('{0} {1}', parseFloat(traffic.toFixed(decimalDigits)), prefix);
                    else
                        traffic = traffic / size;
                }
            });
            return formatStr;
        };

        this.interpolateSankey = function(points) {
            var x0 = points[0][0], y0 = points[0][1], x1, y1, x2,
                path = [x0, ",", y0],
                i = 0, n = points.length;
            while (++i < n) {
                x1 = points[i][0], y1 = points[i][1], x2 = (x0 + x1) / 2;
                path.push("C", x2, ",", y0, " ", x2, ",", y1, " ", x1, ",", y1);
                x0 = x1, y0 = y1;
            }
            return path.join("");
        };

        this.flattenList = function (arr) {
            //Flatten one-level of the list
            return $.map(arr, function (val) {
                return val;
            });
        };
        this.notifySettingsChange = function(colorModel, callbackName) {
            var p = layoutHandler.getURLHashObj().p,
                callback = callbackName ? callbackName : 'settingsChanged',
            resources =
                menuHandler.getMenuObjByHash(p).resources.resource;
            for(var i=0; i<resources.length; i++ ) {
                var className = resources[i].class;
                if(className == undefined)
                    continue;
                var classIns = window[className];
                if(classIns == undefined)
                    continue
                for(var tag in classIns) {
                    if(classIns[tag].hasOwnProperty("viewMap")) {
                        var viewMap = classIns[tag]["viewMap"]
                        for(var view in viewMap) {
                            if(typeof viewMap[view][callback] ==
                                "function") {
                                viewMap[view][callback](colorModel);
                            }
                        }
                    }
                }
            }
        };
        this.loadAlertsPopup = function(cfgObj) {
           var region = contrail.getCookie('region');
           var prefixId = 'dashboard-alerts';
           var notificationView = false;
           var cfgObj = ifNull(cfgObj,{});
           var modalTemplate =
               contrail.getTemplate4Id('core-modal-template');
           var modalId = 'dashboard-alerts-modal';
           var modalLayout = modalTemplate({prefixId: prefixId, modalId: modalId});
           var formId = prefixId + '_modal';
           var modalConfig = {
                   'modalId': modalId,
                   'className': 'modal-840',
                   'body': modalLayout,
                   'onCancel': function() {
                       $("#" + modalId).modal('hide');
                   }
               }
           if(region != 'All Regions') {
                if (notificationView) {
                    require(['js/views/NotificationView', 'core-alarm-parsers', 'core-alarm-utils'],
                     function (NotificationView, coreAlarmParsers, coreAlarmUtils) {
                        var notificationView = new NotificationView({
                            el: $("#alarms-popup-link a"),
                            viewConfig: {
                                template: 'notification-popover-template',
                                title: 'Alarms'
                            }
                        });
                        notificationView.render();
                    });
                } else {
                        cowu.createModal(modalConfig);
                        require(['js/views/alarms/AlarmGridView'], function(AlarmGridView) {
                            var alarmGridView = new AlarmGridView({
                                el:$("#" + modalId).find('#' + formId),
                                viewConfig:{}
                            });
                            alarmGridView.render();
                        });
                }
           }else{
             require(['core-alarm-utils'], function (coreAlarmUtils) {
               var regionList = globalObj.webServerInfo.regionList;
               var primaryRemoteConfig ;
               var vlRemoteList = [];
               for (var i = 0; i < regionList.length; i++) {
                   var remoteConfig ;
                   if(i == 0) {
                       var remoteObj = {
                               ajaxConfig : {
                                   url : './api/tenant/monitoring/alarms?reqRegion='+ regionList[i],
                                   type: 'GET',
                                },
                               dataParser : function(response){
                                        var regionName = response.regionName;
                                           var parsedAlarms = CoreAlarmsParsers.alarmDataParser(getValueByJsonPath(response,'data'));
                                           for(var i = 0; i < parsedAlarms.length; i++){
                                               parsedAlarms[i]['regionName'] = regionName;
                                           }
                                           return parsedAlarms;
                               }
                           };
                           primaryRemoteConfig = remoteObj;
                   }else {
                       var vlRemoteObj = {
                               ajaxConfig: {
                                       url : './api/tenant/monitoring/alarms?reqRegion=' + regionList[i],
                                       type: 'GET'
                               },
                           dataParser : function(response){
                                var regionName = response.regionName;
                                  var parsedAlarms = CoreAlarmsParsers.alarmDataParser(getValueByJsonPath(response,'data'));
                                  for(var i = 0; i < parsedAlarms.length; i++){
                                      parsedAlarms[i]['regionName'] = regionName;
                                  }
                                  return parsedAlarms;
                           },
                           successCallback: function(data, contrailListModel) {
                               var oldData = contrailListModel.getItems();
                               data = oldData.concat(data);
                               contrailListModel.setData(coreAlarmUtils.alarmsSort(data));
                           }
                       };
                       vlRemoteList.push (vlRemoteObj);
                   }
               }
               var listModelConfig =  {
                   remote : primaryRemoteConfig,
                   cacheConfig:{
                       cacheTimeout: 5*60*1000
                   }
               };
               if(vlRemoteList.length > 0) {
                   var vlRemoteConfig = {vlRemoteList:vlRemoteList};
                   listModelConfig['vlRemoteConfig'] = vlRemoteConfig;
               }
               cowu.createModal(modalConfig);
               self.renderView4Config($("#" + modalId).find('#' + formId),
                           new ContrailListModel(listModelConfig),function() {
                                   return {
                                        elementId : ctwl.CONTROL_NODE_ALARMS_GRID_SECTION_ID,
                                        view : "AlarmGridView",
                                        viewPathPrefix: cowc.ALARMS_VIEWPATH_PREFIX,
                                        viewConfig : { showRegion: false }
                                    };
                            }());
               });
           }
        };
        
        this.delete_cookie = function(name) {
            document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        };

        this.splitString2Array = function (strValue, delimiter) {
            var strArray = strValue.split(delimiter),
                count = strArray.length;
            for (var i = 0; i < count; i++) {
                strArray[i] = strArray[i].trim();
            }
            return strArray;
        };

        this.bindPopoverInTopology = function (tooltipConfig, graphView) {
            var timer = null;
            $.each(tooltipConfig, function (keyConfig, valueConfig) {
                valueConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, valueConfig);
                $('g.' + keyConfig).popover({
                    trigger: 'manual',
                    html: true,
                    animation: false,
                    placement: function (context, src) {
                        var srcOffset = $(src).offset(),
                            srcWidth = $(src)[0].getBoundingClientRect().width,
                            bodyWidth = $('body').width(),
                            bodyHeight = $('body').height(),
                            tooltipWidth = valueConfig.dimension.width;

                        $(context).addClass('popover-tooltip');
                        $(context).css({
                            'min-width': tooltipWidth + 'px',
                            'max-width': tooltipWidth + 'px'
                        });
                        $(context).addClass('popover-tooltip');

                        if (srcOffset.left > tooltipWidth) {
                            return 'left';
                        } else if (bodyWidth - srcOffset.left - srcWidth > tooltipWidth){
                            return 'right';
                        } else if (srcOffset.top > bodyHeight / 2){
                             return 'top';
                        } else {
                            return 'bottom';
                        }
                    },
                    title: function () {
                        return valueConfig.title($(this), graphView);
                    },
                    content: function () {
                        return valueConfig.content($(this), graphView);
                    },
                    container: $('body')
                })
                .off("mouseenter")
                .on("mouseenter", function () {
                    var _this = this;
                        clearTimeout(timer);
                        timer = setTimeout(function(){
                            $('g').popover('hide');
                            $('.popover').remove();

                            $(_this).popover("show");

                            $(".popover").find('.btn')
                                .off('click')
                                .on('click', function() {
                                    var actionKey = $(this).data('action'),
                                        actionsCallback = valueConfig.actionsCallback($(_this), graphView);

                                    actionsCallback[actionKey].callback();
                                    $(_this).popover('hide');
                                }
                            );

                            $(".popover").find('.popover-remove-icon')
                                .off('click')
                                .on('click', function() {
                                    $(_this).popover('hide');
                                    $(this).parents('.popover').remove();
                                }
                            );

                        }, contrail.handleIfNull(valueConfig.delay, cowc.TOOLTIP_DELAY))
                })
                .off("mouseleave")
                .on("mouseleave", function () {
                    clearTimeout(timer);
                });
            });
        };

        /*
        * Filter keys in given json object recursively whose value matches with null
        */
        this.filterJsonKeysWithNullValues = function(obj) {
            if(typeof(obj) instanceof Array) {
                for(var i=0,len=obj.length;i<len;i++) {
                    obj[i] = this.filterJsonKeysWithNullValues(obj[i]);
                }
            } else if(typeof(obj) == "object") {
                for(var key in obj) {
                    if(obj[key] == null) {
                        delete obj[key];
                    } else if(typeof(obj[key]) == "object") {
                        obj[key] = this.filterJsonKeysWithNullValues(obj[key]);
                    }
                }
            }
            return obj;
        }

        this.deparamURLArgs = function (query) {
            var query_string = {},
                query = contrail.handleIfNull(query,'');

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

        //Function to add grouping feature to a grid.
        this.addGridGrouping = function (gridId,options) {
            var groupingField = options['groupingField'];
            var groupHeadingPrefix = options['groupHeadingPrefix'];
            var rowCountSuffix = getValueByJsonPath(options,'rowCountSuffix',[]);
            var dv = $('#' + gridId).data('contrailGrid')._dataView;
            dv.setGrouping({
                getter: groupingField,
                formatter: function (g) {
                    var headingTemplate = contrail.getTemplate4Id('grid-grouping-heading-template'),
                    headingHTML = headingTemplate({mainText: ((groupHeadingPrefix)?
                                                        groupHeadingPrefix :'') + g.value,
                                           rowsCount: g.rows.length,
                                           rowsCountSuffix: (g.rows.length > 1)?
                                                   ((rowCountSuffix[1]) ? rowCountSuffix[1] : '') :
                                                   ((rowCountSuffix[0]) ? rowCountSuffix[0] : '')
                                  });
                    return headingHTML;
                },
              });
        };
        this.ifNull = function(value, defValue) {
            if (value == null)
                return defValue;
            else
                return value;
        };
        this.formatTimeRange = function(timeRange) {
            var formattedTime = 'custom', timeInSecs;
            if(timeRange != null && timeRange != -1) {
                timeInSecs = parseInt(timeRange);
                if(timeInSecs <= 3600) {
                    formattedTime = 'Last ' + timeInSecs/60 + ' mins';
                } else if ( timeInSecs <= 43200) {
                    formattedTime = 'Last ' + timeInSecs/3600 + ' hrs';
                }
            }
            return formattedTime;
        };
        this.filterJsonKeysWithCfgOptions = function(obj,cfg) {
            var cfg = self.ifNull(cfg,{});
            var filterEmptyArrays = self.ifNull(cfg['filterEmptyArrays'],true);
            var filterEmptyObjects = self.ifNull(cfg['filterEmptyObjects'],false);
            var filterNullValues = self.ifNull(cfg['filterNullValues'],true);
            if(obj instanceof Array) {
                for(var i=0,len=obj.length;i<len;i++) {
                    obj[i] = this.filterJsonKeysWithCfgOptions(obj[i],cfg);
                }
            } else if(typeof(obj) == "object") {
                for(var key in obj) {
                    if(filterNullValues && (obj[key] == null)) {
                        delete obj[key];
                    } else if(obj[key] instanceof Array) {
                        if(filterEmptyArrays && obj[key].length == 0) {
                            delete obj[key];
                        }
                    } else if(typeof(obj[key]) == "object") {
                        if(filterEmptyObjects && _.keys(obj[key]).length == 0) {
                            delete obj[key];
                        } else {
                            obj[key] = this.filterJsonKeysWithCfgOptions(obj[key],cfg);
                        }
                    }
                }
            }
            return obj;
        };

        this.getAttributes4Schema = function(attributes, schema, schemaStart) {
            var json = $.extend(true, {}, attributes);

            if (!schemaStart) {
                finalSchema = contrail.checkIfExist(schema['items']) ? schema['items']['properties'] : schema['properties'];
            } else {
                finalSchema = schemaStart;
            }
            for(var key in json) {
                if(!contrail.checkIfExist(finalSchema[key])) {
                    delete json[key];
                }
            }
            return json;
        };

        this.numberFormatter = function(number, decimals) {
            var units = ['', 'K', 'M', 'B', 'T'],
            unit = units.length - 1,
            kilo = 1000,
            decimals = isNaN(decimals) ? 2 : Math.abs(decimals),
            decPoint = '.';
            for (var i=0; i < units.length; i++) {
              if (number < Math.pow(kilo, i+1)) {
                unit = i;
                break;
              }
            }
            number = number / Math.pow(kilo, unit);
            var suffix = units[unit] ;
            var sign = number < 0 ? '-' : '';
            number = Math.abs(+number || 0);
            var intPart = parseInt(number.toFixed(decimals), 10) + '';
            if (Math.abs(number - intPart) > 0)
                return sign + intPart + (decimals ? decPoint + Math.abs(number - intPart).toFixed(decimals).slice(2) : '') + " "+suffix;
            else
                return sign + intPart +" "+suffix;
        };

        this.timeSeriesParser = function (config, data) {
            if (_.isEmpty(data)) {
                return [];
            }

            //Config may have only one dataField.
            if (config && config.dataField) {
                config.dataFields = [config.dataField];
            }

            var series = [];

            //Todo when data has "T=", we should group series by using respective CLASS field.
            for (var i = 0; i < data.length; i++) {
                if (_.isUndefined(data[i]["T="]) && _.isUndefined(data[i].T)) {
                    //Record has empty timestamp; return whatever is on series now.
                    return series;
                }
                var timeStamp = Math.floor((data[i]["T="] || data[i].T) / 1000);

                _.forEach(config.dataFields, function (dataField, seriesIndex) {
                    if (i === 0) {
                        series[seriesIndex] = {values: []};
                    }
                    series[seriesIndex].values.push({x: timeStamp, y: data[i][dataField]});
                });
            }
            return series;
        };

        this.logsParser = function (data) {
            if (!data || data.length === 0 || !_.isString(data[0].Xmlmessage) || !_.isNumber(data[0].MessageTS)) {
                return [];
            }

            var UVEModuleIds = cowc.UVEModuleIds,
                retArr = $.map(data, function(obj) {
                    obj.message = window.cowu.formatXML2JSON(obj.Xmlmessage);

                    _.forEach(obj.message, function(value, key, obj) {
                        obj[key] = value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\\"/g, "\"");
                    });

                    obj.timeStr = window.diffDates(new window.XDate(obj.MessageTS / 1000), new window.XDate());

                    if (obj.Source === null) {
                        obj.moduleId = window.contrail.format("{0}", obj.ModuleId);
                    } else {
                        obj.moduleId = window.contrail.format("{0} ({1})", obj.ModuleId, obj.Source);
                    }

                    obj.link = {
                        q: {
                            view: "details",
                            focusedElement: {
                                node: obj.Source,
                                tab: "details",
                            }
                        }
                    };

                    switch(obj.ModuleId) {
                        case UVEModuleIds.DISCOVERY_SERVICE:
                        case UVEModuleIds.SERVICE_MONITOR:
                        case UVEModuleIds.SCHEMA:
                        case UVEModuleIds.CONFIG_NODE:
                            obj.link = _.merge(obj.link, {
                                p: "mon_infra_config",
                                q: {
                                    type: "configNode"
                                },
                            });
                            break;
                        case UVEModuleIds.COLLECTOR:
                        case UVEModuleIds.OPSERVER:
                        case UVEModuleIds.QUERYENGINE:
                            obj.link = _.merge(obj.link, {
                                p: "mon_infra_config",
                                q: {
                                    type: "configNode"
                                },
                            });
                            break;
                        case UVEModuleIds.VROUTER_AGENT:
                            obj.link = _.merge(obj.link, {
                                p: "mon_infra_vrouter",
                                q: {
                                    type: "vRouter"
                                },
                            });
                            break;
                        case UVEModuleIds.CONTROLNODE:
                            obj.link = _.merge(obj.link, {
                                p: "mon_infra_control",
                                q: {
                                    type: "controlNode"
                                },
                            });
                            break;
                        case UVEModuleIds.DATABASE:
                            obj.link = _.merge(obj.link, {
                                p: "mon_infra_database",
                                q: {
                                    type: "dbNode"
                                },
                            });
                            break;
                    }
                    return obj;
                });

            return retArr;
        };

        /**
         * This function bucketize the given data as per the
         * bucket duration parameter
         */
        this.bucketizeStats = function (stats, options) {
            var bucketSize = getValueByJsonPath(options, 'bucketSize', cowc.DEFAULT_BUCKET_DURATION),
                insertEmptyBuckets = getValueByJsonPath(options, 'insertEmptyBuckets', true);
            if (options['timeRange'] == null) {
                options['timeRange'] = cowu.getValueByJsonPath(stats, '0;queryJSON');
            }
            var timeRange = getValueByJsonPath(options, 'timeRange', {
                    start_time: Date.now() * 1000 - (2 * 60 * 60 * 1000 * 1000), // converting to micros secs
                    end_time: Date.now() * 1000
                }),
                stats = ifNull(stats, []);
            bucketSize = parseFloat(bucketSize) * 60 * 1000 * 1000 //Converting to micros seconds
            var timestampField = 'T';
            if (stats != null && getValueByJsonPath(stats, '0;T') == null) {
                timestampField = 'T=';
            }
            var minMaxTS = d3.extent(stats,function(obj){
                return obj[timestampField];
            });
            if (insertEmptyBuckets && timeRange != null
                   && timeRange['start_time'] && timeRange['end_time']) {
                   minMaxTS[0] = timeRange['start_time'];
                   minMaxTS[1] = timeRange['end_time'];
            }
            //If only 1 value extend the range by DEFAULT_BUCKET_DURATION (5 mins) on both sides
            if(minMaxTS[0] == minMaxTS[1]) {
                minMaxTS[0] -= bucketSize;
                minMaxTS[1] += bucketSize;
            }
            var range = d3.range(minMaxTS[0], minMaxTS[1], bucketSize);
            var xBucketScale = d3.scale.quantize().domain(minMaxTS).range(range);
            var lastbucketTimestamp = range[range.length - 1];
            var buckets = {};
            if (insertEmptyBuckets) {
                var rangeLen = range.length;
                for (var i = 0; i < rangeLen; i++) {
                    buckets[range[i]] = {
                        timestampExtent: xBucketScale.invertExtent(range[i]),
                        data: []
                    }
                }
            }
            //Group stats into buckets
            $.each(stats,function(idx,obj) {
                var xBucket = xBucketScale(obj[timestampField]);
                if(typeof xBucket != 'undefined'){
                    if(buckets[xBucket] == null) {
                        var timestampExtent = xBucketScale.invertExtent(xBucket);
                        buckets[xBucket] = {timestampExtent:timestampExtent,
                                            data:[]};
                    }
                    buckets[xBucket]['data'].push(obj);
                }
            });
            if(options.stripLastBucket){
                delete buckets[lastbucketTimestamp];
            }
            return buckets;
        };

        this.chartDataFormatter = function (response, options, isRequestInProgress) {
            var cf = crossfilter(response);
            var timeStampField = 'T',
                parsedData = [], failureCheckFn = getValueByJsonPath(options, 'failureCheckFn'),
                substractFailures = getValueByJsonPath(options, 'substractFailures'),
                colors = getValueByJsonPath(options, 'colors',cowc.FIVE_NODE_COLOR),
                groupBy = getValueByJsonPath(options, 'groupBy'),
                yField = getValueByJsonPath(options, 'yField'),
                yFieldOperation = getValueByJsonPath(options, 'yFieldOperation'),
                failureLabel = getValueByJsonPath(options, 'failureLabel', cowc.FAILURE_LABEL),
                yAxisLabel = getValueByJsonPath(options, 'yAxisLabel'),
                defaultZeroLineDisplay = getValueByJsonPath(options,'defaultZeroLineDisplay', false),
                // limit is for requirements like top 5 records etc;
                limit = getValueByJsonPath(options, 'limit'),
                groupDim;
            if (response != null && getValueByJsonPath(response, '0;T') == null) {
                timeStampField = 'T=';
            }
            if (groupBy != null) {
                groupDim = cf.dimension(function(d) { return d[groupBy]});
            }
            //bucket size is in mins need to convert in to milli secs
            var buckets = cowu.bucketizeStats(response,{
                bucketSize: getValueByJsonPath(options, 'bucketSize'),
                timeRange: getValueByJsonPath(options, 'timeRange'),
                insertEmptyBuckets: getValueByJsonPath(options, 'insertEmptyBuckets', true),
                stripLastBucket: getValueByJsonPath(options, 'stripLastBucket', true)
            });
            var tsDim = cf.dimension(function(d) { return d[timeStampField]});
            if (failureCheckFn != null && typeof failureCheckFn == 'function'
                && response.length > 0) {
                parsedData.push({
                   key: failureLabel,
                   color: cowu.getValueByJsonPath(options, 'failureColor', cowc.FAILURE_COLOR),
                   values: []
                });
            }
            if(response.length === 0 || isRequestInProgress && defaultZeroLineDisplay && groupBy!=null){
                parsedData.push({
                    key: 'DEFAULT',
                    color: cowc.DEFAULT_COLOR,
                    values: []
                });
            }
            if (limit != null) {
                limit = parseInt(limit);
                if (groupBy != null) {
                    var grpMap = groupDim.group().all(),
                        grpMapLen = grpMap.length;
                    if (grpMapLen < limit) {
                        limit = grpMapLen;
                    }
                }
                parsedData.push({
                    key: cowc.OTHERS,
                    color: cowc.OTHERS_COLORS,
                    values: []
                });
                for (var i = 0; i < limit; i++) {
                    parsedData.push({
                        key: i,
                        color: colors[i],
                        values: []
                    });
                }
            } else if (groupBy != null) {
                var groupByMap = groupDim.group().all(),
                    groupByMap = _.sortBy(groupByMap, 'key'),
                    groupByMapLen = groupByMap.length,
                    groupByKeys = _.pluck(groupByMap, 'key');
                if (colors != null && typeof colors == 'function') {
                    colors = colors(groupByKeys, options.resetColor);
                }
                for (var i = 0; i < groupByMapLen; i++) {
                    parsedData.push({
                        key: groupByMap[i]['key'],
                        color: (colors[groupByMap[i]['key']] == null)? colors[i % colors.length]
                                : colors[groupByMap[i]['key']],
                        values: []
                    });
                }
            } else {
                parsedData.push({
                    key: yAxisLabel,
                    color: (colors != null)?  ($.isArray(colors) ? colors[0] : colors) :
                                    ($.isArray(cowc.DEFAULT_COLOR) ? cowc.DEFAULT_COLOR[0] : cowc.DEFAULT_COLOR),
                    values: []
                });
            }

            if (parsedData.length > 0) {
                parsedData = _.indexBy(parsedData, 'key');
            }
            var lastTimeStamp = _.max(_.keys(buckets));
            for(var i  in buckets) {
                var timestampExtent = buckets[i]['timestampExtent'],
                    failedBarCnt = 0, total = 0;
                //Filter the records based on time interval
                if (i == lastTimeStamp) {
                    timestampExtent[1] += 1;
                }
                tsDim.filter(timestampExtent);
                if (groupBy != null) {
                    groupByMap = groupDim.group().all();
                    if (yField != null) {
                        var groupByDimSum = groupDim.group().reduceSum(
                            function (d) {
                                return cowu.getValueByJsonPath(d, yField);
                        });
                        if (yFieldOperation == 'average') {
                            groupCountsObj = _.indexBy(groupDim.group().reduceCount().all(), 'key');
                            groupSumObj = _.indexBy(groupByDimSum.top(Infinity), 'key');
                            groupByMap = [];
                            for (var key in groupCountsObj) {
                                var count = getValueByJsonPath(groupCountsObj, key+';value', 1);
                                //To calculate average denominator should be non zero..
                                if (count == 0) {
                                    count = 1;
                                }
                                groupByMap.push({key: key,
                                    value: getValueByJsonPath(groupSumObj, key+';value', 0)/count});
                            }
                        } else {
                            //Default is sum
                            groupByMap = groupByDimSum.top(Infinity);
                        }
                    }
                    if (limit != null) {
                        groupByMap = _.sortBy(groupByMap, 'value');
                        groupByMap = groupByMap.reverse();
                        var othersSum = _.pluck(groupByMap.slice(limit, groupByMap.length - 1), 'value').reduce(function (a, b) {
                            return a + b;
                        }, 0);
                        groupByMap = groupByMap.slice(0, limit);
                        groupByMap.push({
                            key: cowc.OTHERS,
                            value: othersSum
                        });
                    }
                    /*var missingKeys = _.difference(_.without(groupByKeys, failureLabel), _.pluck(groupByMap, 'key'));
                    $.each(missingKeys, function(idx, obj){
                        groupByMap.push({
                            key: obj,
                            value: 0,
                        });
                    });*/
                    groupByMapLen = groupByMap.length;
                    total = _.pluck(groupByMap, 'value').reduce(function (a, b) {
                        return a + b;
                    }, 0);
                    for (var j = 0; j < groupByMapLen; j++) {
                        var groupByObj = groupByMap[j],
                            groupByObjKey = groupByObj['key'],
                            groupByObjVal = parseFloat(groupByObj['value']),
                            parseDataKey = groupByObjKey;
                        //total += groupByObjVal;
                        if (failureCheckFn) {
                            var failureDim = groupDim.group().reduceSum(failureCheckFn),
                                failureArr = failureDim.top(Infinity);
                            failureMap = _.indexBy(failureArr, 'key');
                            if(failureMap[groupByObjKey] != null) {
                                var failedSliceCnt = getValueByJsonPath(failureMap,
                                        groupByObjKey+';value', 0);
                                //Adding the failures for all slice to get
                                // total failure in this bar(or bucket)
                                failedBarCnt += failedSliceCnt;
                                //Subtracting the failures from total records
                                if (substractFailures == false) {
                                    total += failedBarCnt;
                                } else {
                                    groupByObjVal -= parseInt(failedSliceCnt);
                                }

                            }
                        }
                        if (limit != null && groupByObjKey != cowc.OTHERS) {
                            parseDataKey = j;
                        }
                        parsedData[parseDataKey].values.push({
                            date: new Date(ifNull(i, 0)/1000), //converting to milli secs
                            name: groupByObjKey,
                            timestampExtent: timestampExtent,
                            x: ifNull(i, 0)/1000,
                            y: groupByObjVal,
                            failedSliceCnt:failedSliceCnt,
                            total: total
                        });
                    }
                    if (failureCheckFn && parsedData[failureLabel]) {
                        //Failure at bar level
                          parsedData[failureLabel].values.push({
                              date: new Date(i/1000),
                              x: ifNull(i, 0)/1000,
                              y: failedBarCnt,
                              name: failureLabel,
                              total: total,
                          });
                      } else if(response.length === 0 || isRequestInProgress && defaultZeroLineDisplay && groupBy!=null){
                          parsedData['DEFAULT'].values.push({
                              date: new Date(i/1000),
                              x: ifNull(i, 0)/1000,
                              timestampExtent: timestampExtent,
                              y: 0.01,
                              name: 'DEFAULT',
                              total: 1,
                          });
                      }
                } else {
                     var recordsArr = tsDim.top(Infinity);
                     // Currently we are computing the max value
                     // we can add sum, failures etc based on need
                     var maxValueObj = _.max(recordsArr, function (d) {
                         return cowu.getValueByJsonPath(d, yField, 0);
                     });
                     var maxValue = getValueByJsonPath(maxValueObj, yField, 0);
                     parsedData[yAxisLabel].values.push({
                         date: new Date(ifNull(i, 0)/1000),
                         timestampExtent: timestampExtent,
                         name: yAxisLabel,
                         x: ifNull(i, 0)/1000,
                         y: maxValue,
                         total: maxValue
                     });
                }
            }
            return _.values(parsedData);
        };

        this.parseDataForScatterChart = function(data,options) {
            //Loop through and set the x, y and size field based on the chartOptions selected
            var xField = getValueByJsonPath(options,'xField','x');
            var yField = getValueByJsonPath(options,'yField','y');
            var sizeField = getValueByJsonPath(options,'sizeField','size');
            var ret =  [];
            var clonedData = $.extend([],true,data);
            $.each(clonedData,function(i,d){
                var obj = $.extend({},true,d);
                obj['x'] = getValueByJsonPath(obj,xField,0);
                obj['y'] = getValueByJsonPath(obj,yField,0);
                obj['size'] = getValueByJsonPath(obj,sizeField,0);
                ret.push(obj);
            });
            return ret;
        };

        this.parsePercentilesData = function(data,options) {
            var yFields = getValueByJsonPath(options,'yFields',[]);
            var parsedData = [];
            var colors = getValueByJsonPath(options,'colors',cowc.FIVE_NODE_COLOR);
            var yLabels = getValueByJsonPath(options,'yLabels', []);
            $.each(yFields,function(i,yField){
                var key = yLabels[i] != null ? yLabels[i]: getLabelForPercentileYField(yField);
                parsedData[yField] = {"key":key,"color":colors[i],values:[]};
                var values = parsedData[yField]['values'];
                $.each(data,function(j,d){
                    values.push({x:parseInt(getValueByJsonPath(d,"T=",0))/1000,y:getValueByJsonPath(d,yField,0)});
                });
                parsedData[yField]['values'] = values;
            });
            return _.values(parsedData);
        };
        this.parseDataForLineChart = function(data,options) {
            var yFields = getValueByJsonPath(options,'yFields',[]);
            var yLabels = getValueByJsonPath(options,'yLabels',[]);
            var parsedData = [];
            var colors = getValueByJsonPath(options,'colors',cowc.FIVE_NODE_COLOR);
            $.each(yFields,function(i,yField){
                var key = getValueByJsonPath(yLabels,""+i,yField);
                parsedData[yField] = {"key":key,"color":colors[i],values:[]};
                var values = parsedData[yField]['values'];
                $.each(data,function(j,d){
                    values.push({x:parseInt(getValueByJsonPath(d,"T=",0))/1000,y:getValueByJsonPath(d,yField,0)});
                });
                parsedData[yField]['values'] = values;
            });
            return _.values(parsedData);
        }
        this.parsePercentilesDataForStack = function (data,options) {
            var yFields = getValueByJsonPath(options,'yFields',[]);
            var yLabels = getValueByJsonPath(options,'yLabels',[]);
            var parsedData = [];
            $.each(yFields,function(i,yfield){
                $.each(data,function(j,d){
                   var itemData = $.extend(true,{},d);
                   itemData['Source'] = getValueByJsonPath(yLabels,""+i,yfield);
                   itemData['plotValue'] = getValueByJsonPath(d,yfield);
                   parsedData.push(itemData);
                });
            });
            return parsedData;
        };
        function getLabelForPercentileYField (key) {
            var splits = key.split(';');
            return splits[splits.length - 1] + "th Percentile";
        }

        this.parseLineBarChartWithFocus = function (data, options) {
            var cf = crossfilter(data);
            var buckets = cowu.bucketizeStats(data, {
                bucketSize: 4});
            var groupBy = getValueByJsonPath(options, 'groupBy', 'Source');
            var y1Field = getValueByJsonPath(options, 'y1Field');
            var y2Field = getValueByJsonPath(options, 'y2Field');
            var y2FieldOperation = getValueByJsonPath(options, 'y2FieldOperation');
            var y1FieldOperation = getValueByJsonPath(options, 'y1FieldOperation');
            var y2AxisLabel = getValueByJsonPath(options, 'y2AxisLabel');
            var y2AxisColor = getValueByJsonPath(options, 'y2AxisColor');
            var colors = getValueByJsonPath(options, 'colors');
            var resetColor = getValueByJsonPath(options,'resetColor',false);
            var tsDim = cf.dimension(function (d) {return d.T});
            var groupDim = cf.dimension(function (d) {return d[groupBy]});
            var groupDimData = groupDim.group().all();
            var groupDimKeys = _.pluck(groupDimData, 'key');
            if (typeof colors == 'function') {
               colors = colors(_.sortBy(groupDimKeys), resetColor);
            }
            var nodeMap = {}, chartData = [];
            $.each(groupDimData, function (idx, obj) {
                nodeMap[obj['key']] = {
                    key: obj['key'],
                    values: [],
                    bar: true,
                    color: colors[obj['key']] != null ? colors[obj['key']] : cowc.D3_COLOR_CATEGORY5[1]
                };
                chartData.push(nodeMap[obj['key']]);
            });
            var lineChartData = {
                key: y2AxisLabel,
                values: [],
                color: y2AxisColor
            }
            for (var i in buckets) {
                var timestampExtent = buckets[i]['timestampExtent'],
                    y1Value = 0,
                    y2Value = 0,
                    groupCnt = {};
                tsDim.filter(timestampExtent);
                var sampleCnt = tsDim.top(Infinity).length;
                if (sampleCnt == 0) {
                    sampleCnt = 1;
                }
                groupDimData = groupDim.group().all();
                groupDimData = _.sortBy(groupDimData, 'key');
                $.each(groupDimData, function(idx, obj) {
                    groupCnt[obj['key']] = obj['value'];
                });
                var y1FieldData = groupDim.group().reduceSum(function (d) {
                    return d[y1Field];
                });
                var y2FieldData = groupDim.group().reduceSum(function (d) {
                    return d[y2Field];
                });
                var y1DataArr = y1FieldData.top(Infinity);
                var y2DataArr = y2FieldData.top(Infinity);
                var y1DataArrLen = y1DataArr.length;
                var y2DataArrLen = y2DataArr.length;

                for (var j = 0; j < y1DataArrLen; j++) {
                    var y1DataObj = y1DataArr[j];
                    if (nodeMap[y1DataObj['key']] != null ) {
                        y1Value = y1DataObj['value'];
                        if (y1FieldOperation == 'average') {
                            y1Value = y1DataObj['value']/groupCnt[y1DataObj['key']];
                        }
                        //avgResTime = avgResTime/1000; // converting to milli secs
                        nodeMap[y1DataObj['key']]['values'].push({
                            x: Math.round(i/1000),
                            y: y1Value
                        });
                    }
                }

                for (var j = 0; j < y2DataArrLen; j++) {
                    y2Value += y2DataArr[j]['value'];
                }
                if (y2FieldOperation == 'average') {
                    y2Value = y2Value/sampleCnt;
                }
                lineChartData['values'].push({
                    x: Math.round(i/1000),
                    y: y2Value
                });
            }
            chartData.push(lineChartData);
            return chartData;
        };
        this.isGridStackWidget = function (selector) {
            if ($(selector).parents('.grid-stack-item-content').length) {
                return true;
            }
            return false;
        };
        this.isNil = function(value) {
            if ((null === value) || (undefined === value)) {
                return true;
            }
            return false;
        }

        this.getXPathValuesFromXmlDoc = function(data, xpathObj) {
            var doc = (new DOMParser).parseFromString(data, 'text/xml');
            var retObj = {};
            _.each(xpathObj,function(value,key) {
                var it = doc.evaluate(value, doc, null, 5, null);
                var node = it.iterateNext();
                retObj[key] = '';
                if(node != null)
                    retObj[key] = node.textContent;

            });
            return retObj;
        }

        self.parseAndMergeStats = function (response,primaryDS) {
            var primaryData = primaryDS.getItems();
            if(primaryData.length == 0) {
                primaryDS.setData(response);
                return;
            }
            if(response.length == 0) {
                return;
            }
            //If both arrays are not having first element at same time
            //remove one item accordingly
            while (primaryData[0]['T='] != response[0]['T=']) {
                if(primaryData[0]['T='] > response[0]['T=']) {
                    response = response.slice(1,response.length-1);
                } else {
                    primaryData = primaryData.slice(1,primaryData.length-1);
                }
            }
            var cnt = primaryData.length;
            var responseKeys = _.keys(response[0]);
            for (var i = 0; i < cnt ; i++) {
//                primaryData[i]['T'] = primaryData[i]['T='];
                for (var j = 0; j < responseKeys.length; j++) {
                    if (response[i] != null && response[i][responseKeys[j]] != null) {
                        primaryData[i][responseKeys[j]] =
                            response[i][responseKeys[j]];
                    } else if (i > 0){
                        primaryData[i][responseKeys[j]] =
                            primaryData[i-1][responseKeys[j]];
                    }
                }
            }
            primaryDS.updateData(primaryData);
        };

//        self.mergingFlag = false;
        self.parseAndMergeObjectLogs = function (response,primaryDS) {
//            if(self.mergingFlag) {
//                setTimeout(function () {
//                    self.parseAndMergeObjectLogs(response,primaryDS);
//                }, 1000);
//                return;
//            }
//            self.mergingFlag = true;
            var primaryData = primaryDS.getItems();
            if(primaryData.length == 0) {
                primaryDS.setData(response);
//                self.mergingFlag = false;
                return;
            }
            if(response.length == 0) {
//                self.mergingFlag = false;
                return;
            }
            primaryDS.addData(response);
//            self.mergingFlag = false;
        };

        self.getGridItemsForWidgetId = function(widgetId) {
            var gridInst = $("[data-widget-id='" + widgetId + "']").find('.contrail-grid').data('contrailGrid');
            var items = [];
            if(gridInst != null) {
                items = gridInst._dataView.getItems();
            }
            return items;
        }

        self.resetGridStackLayout = function(allPages) {
            //var gridStackId = $('.custom-grid-stack').attr('data-widget-id');
            localStorage.removeItem(cowc.LAYOUT_PREFERENCE);
            var gridStackInst = $('.custom-grid-stack').data('grid-stack-instance')
            if(gridStackInst != null ) {
                gridStackInst.render()
            }
        };

        self.getGridItemsForWidgetId = function(widgetId) {
            var gridInst = $("[data-widget-id='" + widgetId + "']").find('.contrail-grid').data('contrailGrid');
            var items = [];
            if(gridInst != null) {
                items = gridInst._dataView.getItems();
            }
            return items;
        };
        self.getLayoutPreference = function (elementId) {
            // We have remove this if block once all the keys
            // are removed from local storage
            if (localStorage.getItem(elementId) != null) {
                var preferences = JSON.parse(localStorage.getItem(elementId));
                _.map(preferences, function (item) {
                    if (item != null && item.itemAttr != null) {
                        item.itemAttr.width *= 2;
                        item.itemAttr.x *= 2;
                    }
                    return item;
                });
                self.updateLayoutPreference(elementId, preferences);
                localStorage.removeItem(elementId);
            }

            if (localStorage.getItem(cowc.LAYOUT_PREFERENCE) != null) {
                return _.result(JSON.parse(localStorage.getItem(cowc.LAYOUT_PREFERENCE)), elementId);
            }
        };
        self.updateLayoutPreference = function (elementId, preferences, cfg) {
            var layoutPref = localStorage.getItem(cowc.LAYOUT_PREFERENCE);
            if (layoutPref != null) {
                layoutPref = JSON.parse(layoutPref);
            } else {
                layoutPref = {};
            }
            if(_.result(cfg,'delete',false) == true) {
                delete layoutPref[elementId];
            } else {
                layoutPref[elementId] = preferences;
            }
            localStorage.setItem(cowc.LAYOUT_PREFERENCE, JSON.stringify(layoutPref));
        }
        /**
         * Takes input as an array of configs.
         * The first one is considered as primary req and the rest are added as
         * vl config
         */
        self.getStatsModelConfig = function (config,timeRange) {
            if (!_.isArray(config)) {
                config = [config];
            }
            timeRange = (timeRange)? timeRange :
                    [Date.now() - (2 * 60 * 60 * 1000), Date.now()];
            var primaryRemoteConfig ;
            var vlRemoteList = [];
            for (var i = 0; i < config.length; i++) {
                var statsConfig = config[i];
                var noSanitize = cowu.getValueByJsonPath(statsConfig,'no_sanitize',false);
                var queryType = cowu.getValueByJsonPath(statsConfig,'type','Aggregate');
                var postData = {
                    "autoSort": true,
                    "async": false,
                    "formModelAttrs": {
                      "table_type": "STAT",
                      "query_prefix": "stat",
                      "from_time": timeRange[0],
                      "from_time_utc": timeRange[0],
                      "to_time": timeRange[1],
                      "to_time_utc": timeRange[1],
                      "limit": "150000"
                    }
                };
                if (queryType.toUpperCase() != 'NONAGGREGATE') {
                    postData['formModelAttrs']['time_granularity_unit'] = "secs";
                    postData['formModelAttrs']['time_granularity'] = 150;
                }
                var remoteConfig ;
                if (statsConfig['type'] != null && statsConfig['type'] == "non-stats-query") {
                    if(statsConfig['remoteConfig']) {
                        remoteConfig = statsConfig['remoteConfig'];
                    }
                } else {
                    if (statsConfig['from_time_utc'] != null) {
                        postData['formModelAttrs']['from_time_utc'] = statsConfig['from_time_utc'];
                    }
                    if (statsConfig['to_time_utc'] != null) {
                        postData['formModelAttrs']['to_time_utc'] = statsConfig['to_time_utc'];
                    }
                    if (statsConfig['table_name'] != null) {
                        postData['formModelAttrs']['table_name'] = statsConfig['table_name'];
                    }
                    if (statsConfig['table_type'] != null) {
                        postData['formModelAttrs']['table_type'] = statsConfig['table_type'];
                    }
                    if (statsConfig['select'] != null) {
                        postData['formModelAttrs']['select'] = statsConfig['select'];
                    }
                    if (statsConfig['where'] != null) {
                        postData['formModelAttrs']['where'] = statsConfig['where'];
                    }
                    if (statsConfig['time_granularity'] != null) {
                        postData['formModelAttrs']['time_granularity'] = statsConfig['time_granularity'];
                    }
                    if (statsConfig['time_granularity_unit'] != null) {
                        postData['formModelAttrs']['time_granularity_unit'] = statsConfig['time_granularity_unit'];
                    }
                }
                if(i == 0) {
                    if (statsConfig['type'] != null && statsConfig['type'] == "non-stats-query"){
                        primaryRemoteConfig = remoteConfig;
                    } else {
                        var remoteObj = {
                            ajaxConfig : {
                                url : "/api/qe/query",
                                type: 'POST',
                                data: JSON.stringify(postData)
                            },
                            dataParser : (statsConfig['parser'])? statsConfig['parser'] :
                                function (response) {
                                    var data = getValueByJsonPath(response,'data',[]);
                                    if (response['queryJSON'] != null) {
                                        data = _.map(data, function(obj) {
                                            return _.extend({}, obj, {queryJSON: response['queryJSON']});
                                        });
                                    }
                                    return data;
                                }
                        };
                        if(noSanitize) {
                            remoteObj.ajaxConfig['dataFilter'] = function(data){
                                                                    return data;
                                                                };
                        }
                        if (statsConfig['timeout']) {
                            remoteObj.ajaxConfig['timeout'] = statsConfig['timeout'];
                        }
                        primaryRemoteConfig = remoteObj;
                    }
                } else {
                    var vlRemoteObj = {
                        getAjaxConfig: function(primaryResponse) {
                            if(statsConfig['getAjaxConfig']) {
                                return statsConfig['getAjaxConfig'](primaryResponse,postData);
                            } else {
                                var ajaxConfig = {
                                    url : "/api/qe/query",
                                    type: 'POST',
                                    data: JSON.stringify(postData)
                                }
                                if (noSanitize) {
                                    ajaxConfig['dataFilter'] = function(data){
                                                                    return data;
                                                                };
                                }
                                if (statsConfig['timeout']) {
                                    ajaxConfig['timeout'] = statsConfig['timeout'];
                                }
                                return ajaxConfig;
                            }
                        },
                        ajaxConfig : {
                            url : "/api/qe/query",
                            type: 'POST',
                            data: JSON.stringify(postData)
                        },
                        dataParser : (statsConfig['parser'])? statsConfig['parser'] :
                            function (response) {
                                var data = getValueByJsonPath(response,'data',[]);
                                if (response['queryJSON'] != null) {
                                    data = _.map(data, function(obj) {
                                        return _.extend({}, obj, {queryJSON: response['queryJSON']});
                                    });
                                }
                                return data;
                            },
                        successCallback: function(data, contrailListModel) {
                                if(statsConfig['mergeFn']){
                                    statsConfig['mergeFn'] (data,contrailListModel);
                                }
                            }
                    };
                    if(noSanitize) {
                        vlRemoteObj.ajaxConfig['dataFilter'] = function(data){
                                                                    return data;
                                                                };
                    }
                    if (statsConfig['timeout']) {
                        vlRemoteObj.ajaxConfig['timeout'] = statsConfig['timeout'];
                    }
                    vlRemoteList.push (vlRemoteObj);
                }
            }
            var listModelConfig =  {
                remote : primaryRemoteConfig,
                cacheConfig:{
                    cacheTimeout: 5*60*1000
                }
            };
            if(vlRemoteList.length > 0) {
                var vlRemoteConfig = {vlRemoteList:vlRemoteList};
                listModelConfig['vlRemoteConfig'] = vlRemoteConfig;
            }
            if (statsConfig['modelId'] != null) {
                listModelConfig['cacheConfig']['ucid'] = statsConfig['modelId'];
            }
            return listModelConfig;
        };

        self.modifyTimeRangeInRemoteConfig = function (remoteConfig,timeExtent) {
            var postData = JSON.parse(getValueByJsonPath(remoteConfig,'ajaxConfig;data'));
            var formModelAttrs = getValueByJsonPath(postData,'formModelAttrs');
            formModelAttrs["from_time"] = timeExtent[0] / 1000;
            formModelAttrs["from_time_utc"] = timeExtent[0] / 1000;
            formModelAttrs["to_time"] = timeExtent[1] / 1000;
            formModelAttrs["to_time_utc"] = timeExtent[1] / 1000;
            postData['formModelAttrs'] = formModelAttrs;
            remoteConfig['ajaxConfig']['data'] = JSON.stringify(postData);
            return remoteConfig;
        }

        /**
         * Given a model and time range change the time range in all the
         * ajaxconfig - primary, vl and hl and return the new list model.
         */
        self.buildNewModelForTimeRange = function (model, viewConfig, timeExtent) {
            var postData, remoteConfig, vlConfigs, hlConfigs;
            if (model === null && viewConfig['modelConfig'] != null) {
                remoteConfig = viewConfig['modelConfig'];
                postData = JSON.parse(getValueByJsonPath(pRemoteConfig,'remote;ajaxConfig;data'));
            } else {
              //get the models ajax config and then modify the timeextent
                remoteConfig = model.getRemoteConfig();
                var pRemoteConfig = cowu.getValueByJsonPath(remoteConfig,'remote');
                vlConfigs = cowu.getValueByJsonPath(remoteConfig,'vlRemoteConfig;vlRemoteList',[]);
                hlConfigs = cowu.getValueByJsonPath(remoteConfig,'hlRemoteConfig;hlRemoteList',[]);
            }
            var pRemoteConfig = cowu.modifyTimeRangeInRemoteConfig(pRemoteConfig, timeExtent);
            $.each(vlConfigs,function(i,vlConfig){
                vlConfigs[i] = cowu.modifyTimeRangeInRemoteConfig(vlConfig,timeExtent);
            });
            $.each(hlConfigs,function(i,hlConfig){
                hlConfigs[i] = cowu.modifyTimeRangeInRemoteConfig(vlConfig,timeExtent);
            });
            remoteConfig['remote'] = pRemoteConfig;
            if(vlConfigs.length > 0) {
                remoteConfig['vlRemoteConfig']['vlRemoteList'] = vlConfigs;
            }
            if(hlConfigs.length > 0) {
                remoteConfig['hlRemoteConfig']['hlRemoteList'] = hlConfigs;
            }
            return new ContrailListModel(remoteConfig);
        }

        this.populateTrafficGroupsData = function(data) {
            var applicationArr = ['HR','Finance','Oracle','SAP'],
                siteArr = ['Bangalore','Sunnyvale'],
                tierArr = ['FrontEnd','Web','Database'],
                deploymentArr = ['Production','Development'];
            $.each(data,function(idx,value) {
                value['eps.traffic.remote_app_id'] = _.sample(applicationArr); 
                value['eps.traffic.remote_deployment_id'] = _.sample(deploymentArr);
                value['eps.traffic.remote_site_id'] = _.sample(siteArr);
                value['eps.traffic.remote_tier_id'] = _.sample(tierArr);

                value['app'] = _.sample(applicationArr); 
                value['deployment'] = _.sample(deploymentArr);
                value['site'] = _.sample(siteArr);
                value['tier'] = _.sample(tierArr);
            });
            return data;
        }

        this.getTrafficGroupsData = function() {
            var applicationArr = ['HR','Finance','Oracle','SAP'],
                siteArr = ['Bangalore','Sunnyvale'],
                tierArr = ['FrontEnd','Web','Database'],
                deploymentArr = ['Production','Development'];
            var flowCount = 100,data = [];    
            for (var i = 0; i < flowCount; i++) {
                const bytes = _.random(74325736, 474325736)

                var dst = {
                    application: _.sample(applicationArr),
                    site: _.sample(siteArr),
                    tier: _.sample(tierArr),
                    deployment: _.sample(deploymentArr)
                }
                if (i % 2 == 0) {
                    dst = {};
                }
                const flow = {
                    /*src_application: _.sample(applicationArr),
                    src_site: _.sample(siteArr),
                    src_tier: _.sample(tierArr),
                    src_deployment: _.sample(deploymentArr),*/
                    src: {
                        application: _.sample(applicationArr),
                        site: _.sample(siteArr),
                        tier: _.sample(tierArr),
                        deployment: _.sample(deploymentArr)
                    },
                    dst: dst,
                    /*dst_application: _.sample(applicationArr),
                    dst_site: _.sample(siteArr),
                    dst_tier: _.sample(tierArr),
                    dst_deployment: _.sample(deploymentArr),*/
                    'agg-packets': _.round((bytes / 330), 0),
                    'agg-bytes': bytes,
                }

                data.push(flow)
            }

            return data;
        }
    };

    function filterXML(xmlString, is4SystemLogs) {
        var xmlDoc = parseXML(xmlString);
        $(xmlDoc).find("[type='struct']").each(function () {
            formatStruct(this);
        });
        if(!is4SystemLogs) {
            $(xmlDoc).find("[type='sandesh']").each(function () {
                formatSandesh(this, is4SystemLogs);
            });
        }
        $(xmlDoc).find("[type]").each(function () {
            removeAttributes(this, ['type', 'size', 'identifier', 'aggtype', 'key']);
        });
        $(xmlDoc).find("data").each(function () {
            $(this).children().unwrap();
        });
        return xmlDoc;
    }

    function parseXML(xmlString) {
        if (window.DOMParser) {
            xmlDoc = domParser.parseFromString(xmlString, "text/xml");
        } else { // Internet Explorer
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(xmlString);
        }
        return xmlDoc;
    };


    function formatStruct(xmlNode) {
        $(xmlNode).find("list").each(function () {
            $(this).children().unwrap();
        });
        //$(xmlNode).children().unwrap();
    };

    function formatSandesh(xmlNode, is4SystemLogs) {
        var messageString = '', nodeCount, i;
        $(xmlNode).find("file").each(function () {
            $(this).remove();
        });
        $(xmlNode).find("line").each(function () {
            $(this).remove();
        });
        if(is4SystemLogs != null && is4SystemLogs) {
            nodeCount = $(xmlNode).find("[identifier]").length;
            for (i = 1; i < (nodeCount + 1); i++) {
                $(xmlNode).find("[identifier='" + i + "']").each(function () {
                    messageString += $(this).text() + ' ';
                    $(this).remove();
                });
            }
            if (messageString != '') {
                $(xmlNode).text(messageString);
            }
            removeAttributes(xmlNode, ['type']);
        }
    };

    function removeAttributes(xmlNode, attrArray) {
        for (var i = 0; i < attrArray.length; i++) {
            xmlNode.removeAttribute(attrArray[i]);
        }
    };
    function getDeepDiffOfKey(updatedObj, oldObj, oldJson){
        for(var i in updatedObj){
            if(typeof updatedObj[i] === 'number' || typeof updatedObj[i] === 'string' || typeof updatedObj[i] === 'boolean'){
                if(oldObj === undefined){
                    if(updatedObj[i] === '' || updatedObj[i] === false){
                        delete updatedObj[i];
                    }
                }else{
                    if(oldJson !== undefined && oldJson !== null){
                        if(updatedObj[i] === oldObj[i] && !oldJson.hasOwnProperty(i)){
                            delete updatedObj[i];
                        }
                        if(oldJson[i] === null && updatedObj[i] === null){
                            updatedObj[i] = null;
                        }
                    }else{
                        if(updatedObj[i] === oldObj[i]){
                            delete updatedObj[i];
                        }
                    }
                }
            }else if(updatedObj[i] === null){
                delete updatedObj[i];
            }else if(typeof updatedObj[i] === 'object' && updatedObj[i] !== null && updatedObj[i].constructor !== Array){
                if(oldJson !== undefined && oldJson !== null){
                    getDeepDiffOfKey(updatedObj[i], oldObj[i], oldJson[i]);
                }else{
                    if(oldObj !== undefined){
                        getDeepDiffOfKey(updatedObj[i], oldObj[i], undefined);
                    }else{
                        getDeepDiffOfKey(updatedObj[i], undefined, undefined);
                    }
                }
                if(Object.keys(updatedObj[i]).length === 0){
                    if(oldJson !== undefined && oldJson !== null){
                        if(oldJson[i] === null ){
                            updatedObj[i] = null;
                        }else{
                            delete updatedObj[i];
                        }
                    }else{
                        delete updatedObj[i];
                    }
                }
            }else if(updatedObj[i] !== null && updatedObj[i].constructor === Array){
                if(updatedObj[i].length > 0){
                    var updatedVal = updatedObj[i].filter(function(n){ return n != undefined});
                    if(updatedVal.length == 0){
                        updatedObj[i] = updatedVal;
                    }
                }
                if(updatedObj[i].length == 0){
                       delete updatedObj[i];
                }else if(typeof checkArrayContainsString(updatedObj[i]) === 'string'){
                    if(oldObj !== undefined){
                        if(updatedObj[i].length === oldObj[i].length){
                            if(oldJson != undefined){
                                if(updatedObj[i].length == oldJson[i].length){
                                    updatedObj[i] = updatedObj[i];
                                }else{
                                    delete updatedObj[i];
                                }
                            }else{
                                delete updatedObj[i];
                            }
                        }else{
                            var updatedVal = updatedObj[i].filter(function(n){ return n != ""});
                            if(updatedVal.length == 0){
                                delete updatedObj[i];
                            }else{
                                updatedObj[i] = updatedVal;
                            }
                        }
                    }else{
                        if(updatedObj[i].length === 0){
                            delete updatedObj[i];
                        }else{
                          var updatedVal = updatedObj[i].filter(function(n){ return n != ""});
                          if(updatedVal.length == 0){
                              delete updatedObj[i];
                          }else{
                              updatedObj[i] = updatedVal;
                          }
                        }
                    }
                }else if(typeof checkArrayContainsObject(updatedObj[i]) == 'object' && checkArrayContainsObject(updatedObj[i]) !== null && checkArrayContainsObject(updatedObj[i]).constructor !== Array){
                    for(var j = 0; j < updatedObj[i].length; j++){
                            if(oldJson !== undefined && oldJson !== null){
                                if(oldJson[i] !== undefined){
                                    getDeepDiffOfKey(updatedObj[i][j], oldObj[i][j], oldJson[i][j]);
                                }else{
                                    getDeepDiffOfKey(updatedObj[i][j], oldObj[i][j], undefined);
                                }
                            }else{
                                if(oldObj !== undefined){
                                    getDeepDiffOfKey(updatedObj[i][j], oldObj[i][j], undefined);
                                }else{
                                    getDeepDiffOfKey(updatedObj[i][j], undefined, undefined);
                                }
                            }
                            if(updatedObj[i][j] != undefined){
                                if(Object.keys(updatedObj[i][j]).length === 0 ){
                                    if(oldJson !== undefined){
                                        if(oldJson[i] !== undefined && oldJson[i] !== null){
                                            if(oldJson[i][j] === null){
                                                updatedObj[i][j] = null;
                                            }else{
                                                delete updatedObj[i][j];
                                                updatedObj[i] = updatedObj[i].filter(function(n){ return n != undefined });
                                            }
                                        }else{
                                            delete updatedObj[i][j];
                                            updatedObj[i] = updatedObj[i].filter(function(n){ return n != undefined });
                                         }
                                    }else{
                                        delete updatedObj[i][j];
                                        updatedObj[i] = updatedObj[i].filter(function(n){ return n != undefined });
                                    }
                                }
                            }
                        }
                        updatedObj[i] = updatedObj[i].filter(function(n){ return n != undefined });
                        if(updatedObj[i].length == 0){
                            if(oldJson !== undefined){
                                if(oldJson[i] !== undefined){
                                    if(oldJson[i].length === updatedObj[i].length){}
                                }else{
                                    delete updatedObj[i];
                                }
                            }else{
                                delete updatedObj[i];
                            }
                        }
                }
            }
        }
        return updatedObj;
    };
    function checkArrayContainsObject(array){
        var obj;
        for(var i = 0; i < array.length; i++){
            if(typeof array[i] == 'object' && array[i].constructor !== Array){
                obj = array[i];
                break;
            }
        }
       return obj;
    };
    function checkArrayContainsString(array){
        var str;
        for(var i = 0; i < array.length; i++){
            if(typeof array[i] == 'string' || typeof array[i] == 'number'){
                str = array[i];
                break;
            }
        }
       return str;
    };
    function deepDiff(a, b, r, reversible, oldJson, enumKeys) {
        lodash.each(a, function(v, k) {
            if (r.hasOwnProperty(k) || (b[k] === v && enumKeys.indexOf(k) == -1)){
                return;
            }
            var value;
          if (lodash.isObject(v)) {
              if (lodash.isArray(v)) {
                if (v.length > 0 || b[k].length > 0) {
                    var isSame = true;
                    if(v.length == b[k].length){
                            if(oldJson !== undefined){
                                 var diff = getDeepDiffOfKey(b[k],v, oldJson[Object.keys(oldJson)[0]][k]);
                             }else{
                                 var diff = getDeepDiffOfKey(b[k],v, undefined);
                             }
                             for(var i =0; i < v.length ; i++){
                                 var found = false;
                                for(var j=0; j< diff.length;j++){
                                    if(lodash.isEqual(v[i], diff[j])){
                                        found = true;
                                        break;
                                    }
                                }
                                if(!found) {
                                    isSame = false;
                                    break;
                                }
                             }
                             if(!isSame){
                                 diff = diff.filter(function(n){ return n != "" });
                                 value = diff;
                             }
                        }else if(v.length > b[k].length || v.length < b[k].length){
                            if(oldJson !== undefined){
                                var diff = getDeepDiffOfKey(b[k],v, oldJson[Object.keys(oldJson)[0]][k]);
                            }else{
                                var diff = getDeepDiffOfKey(b[k],v, undefined);
                            }
                            var newVal = diff.filter(function(n){ return n != undefined });
                            newVal = newVal.filter(function(n){ return n != "" });
                            if(newVal.length != 0){
                                value = newVal;
                            }
                            if(v.length != 0 && newVal.length == 0){
                                value = newVal;
                            }
                        }
                  }
              } else {
                 if(!lodash.isEqual(v,b[k])){
                     if(oldJson !== undefined){
                         var diff = getDeepDiffOfKey(b[k],v, oldJson[Object.keys(oldJson)[0]][k]);
                     }else{
                         if(k === 'perms2' || k === 'id_perms'){
                             var diff = b[k];
                         }else{
                             var diff = getDeepDiffOfKey(b[k],v, oldJson);
                         }
                      }
                     if(!lodash.isEqual(v,diff)){
                         value = diff;
                     }
                 }
              }
          } else {
              value = b[k]
          }
            if(value != undefined){
                if(typeof value === 'object' && value.constructor !== Array && Object.keys(value).length == 0){
                    r[k] = {};
                }else{
                   r[k] = value;
                }
             }
            if(value === null){
                r[k] = value;
            }
          });

    };
    lodash.mixin({
        shallowDiff: function(a, b) {
          return lodash.omit(a, function(v, k) {
            return b[k] === v;
          })
        },
        diff: function(a, b, reversible, oldJson, enumKeys) {
          var r = {};
          deepDiff(a, b, r, reversible, oldJson, enumKeys);
          if(reversible) deepDiff(b, a, r, reversible, oldJson, enumKeys);
          return r;
        }
   });


    return CoreUtils;
});
