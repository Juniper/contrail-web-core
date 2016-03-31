/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define(['underscore'], function (_) {
    var serializer = new XMLSerializer(),
        domParser = new DOMParser();

    var CoreUtils = function () {
        var self = this;
        this.getAlarmsFromAnalytics = true;
        //Setting the sevLevels used to display the node colors
        if(this.getAlarmsFromAnalytics) {
            sevLevels = cowc.SEV_LEVELS;
        }
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
        this.createModal = function (options) {
            var modalId = options['modalId'],
                footer = [];
            if(options['footer'] == null || options['footer'] == undefined) {
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

        this.enableModalLoading = function (modalId) {
            $('#' + modalId).find('.modal-header h6').prepend('<i class="icon-spinner icon-spin margin-right-10 modal-loading-icon">');
            $('#' + modalId).find('.modal-header .icon-remove').addClass('icon-muted');

            $('#' + modalId).find('.modal-footer .btn').attr('disabled', true);
            $('#' + modalId).find('.modal-header button').attr('disabled', true);

        };

        this.disableModalLoading = function (modalId, callback) {
            setTimeout(function () {
                $('#' + modalId).find('.modal-body').animate({scrollTop: 0});

                $('#' + modalId).find('.modal-header h6 .modal-loading-icon').remove();
                $('#' + modalId).find('.modal-header .icon-remove').removeClass('icon-muted');

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

            _.each(object, function (value, key) {
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

        this.getEditConfigObj = function (configObj, locks) {
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
                    testobj[attribute] = cowu.getEditConfigObj(value, locks);
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

        this.constructJsonHtmlViewer = function (jsonValue, formatDepth, currentDepth, ignoreKeys) {
            var htmlValue = '',
                objType = {type: 'object', startTag: '{', endTag: '}'};

            if(jsonValue instanceof Array){
                objType = {type: 'array', startTag: '[', endTag: ']'};
            }

            if(formatDepth == 0){
                htmlValue += '<i class="node-' + currentDepth + ' icon-plus expander"></i> ' + objType.startTag + '<ul data-depth="' + currentDepth + '" class="node-' + currentDepth + ' node hide raw">' +
                    JSON.stringify(jsonValue) + '</ul><span class="node-' + currentDepth + ' collapsed expander"> ... </span>' + objType.endTag;
            }
            else {
                htmlValue += '<i class="node-' + currentDepth + ' icon-minus collapser"></i> ' + objType.startTag + '<ul data-depth="' + currentDepth + '" class="node-' + currentDepth + ' node">';
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
                htmlValue += '</ul><span class="node-' + currentDepth + ' collapsed hide expander"> ... </span>' + objType.endTag;
            }
            return htmlValue;
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

        /* Detail Template Generator*/

        this.generateBlockListKeyValueTemplate = function (config, app, parentConfig) {
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
                    '<ul class="item-list">';

            $.each(config, function (configKey, configValue) {
                template += '' +
                    '{{#IfValidJSONValueByPath "' + configValue.key + '" data ' + configKey + '}}' +
                    '<li>' +
                    '<label class="inline row-fluid">' +
                    '<span class="key span5 ' + (parentConfig.keyClass != null ? parentConfig.keyClass : '') +
                    ' ' + (configValue.keyClass != null ? configValue.keyClass : '')+'"> {{getLabel "' +
                    configValue.label + '" "' + configValue.key + '" "' + app + '"}} </span>' +
                    '<span class="value span7 ' + (parentConfig.valueClass != null ? parentConfig.valueClass : '') +
                    ' ' + (configValue.valueClass != null ? configValue.valueClass : '')+'">{{{getValueByConfig data config=\'' + JSON.stringify(configValue) + '\'}}}</span>';

                template += '</label>' +
                    '</li>' +
                    '{{/IfValidJSONValueByPath}}';
            });

            template += '</ul>' +
                '{{/IfCompare}}';

            return template;
        };

        this.generateInnerTemplate = function (config, app) {
            var template, templateObj,
                templateGenerator = config.templateGenerator, templateGeneratorConfig = config.templateGeneratorConfig;

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
                                        '{{#IfCompare requestState "fetching" operator="==" }}' + '<i class="icon-spin icon-spinner"></i>' + '{{/IfCompare}}' +
                                        config.title +
                                    '</h4>' +
                                    '<div class="widget-toolbar pull-right">' +
                                        '<a data-action="collapse"><i class="icon-chevron-up"></i></a>' +
                                    '</div>' +
                                    ((config.advancedViewOptions !== false) ? '' +
                                        '<div class="widget-toolbar pull-right">' +
                                            '<a data-action="settings" data-toggle="dropdown" style="display: inline-block;"><i class="icon-cog"></i></a>' +
                                            '<ul class="pull-right dropdown-menu dropdown-caret dropdown-closer">' +
                                                '<li><a data-action="list-view"><i class="icon-list"></i> &nbsp; Basic view </a></li>' +
                                                '<li><a data-action="advanced-view"><i class="icon-code"></i> &nbsp; Advanced view </a></li>' +
                                            '</ul>' +
                                        '</div>' : '') +
                                '</div>' +
                                '<div class="widget-body">' +
                                    '<div class="widget-main row-fluid">' +
                                        '<div class="list-view">' +
                                            self.generateBlockListKeyValueTemplate(config.templateGeneratorConfig, app, config) +
                                        '</div>' +
                                        '<div class="advanced-view hide">' +
                                            '{{{formatGridJSON2HTML this.data' +
                                                ((contrail.checkIfExist(config.templateGeneratorData) && config.templateGeneratorData !== '') ? '.' + config.templateGeneratorData : '') +
                                            '}}}' +
                                        '</div>' +
                                        '<div class="contrail-status-view hide">' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';
                    } else {
                        template = '<div class="detail-block-list-content row-fluid">' +
                            '<h6>' + config.title + '</h6>' +
                            self.generateBlockListKeyValueTemplate(config.templateGeneratorConfig, app, config) +
                            '<br/></div>';
                    }

                    templateObj = $(template);
                    break;

                case 'BlockGridTemplateGenerator':
                    var template = '<div>' +
                        '{{#IfValidJSONValueByPathLength "' + config.key + '" this}} ' +
                        '<div class="detail-block-grid-content row-fluid">' +
                        (contrail.checkIfExist(config.title) ? '<h6>' + config.title + '</h6>' : '') +
                        '<div class="row-fluid">' +
                        '{{#each ' + config.key + '}} ' +
                        '{{#IfCompare @index 0 operator="%2"}} ' +
                        '{{#IfCompare @index 0 operator="!="}}' +
                        '</div>' +
                        '<div class="row-fluid block-grid-row">' +
                        '{{else}}' +
                        '<div class="row-fluid block-grid-row">' +
                        '{{/IfCompare}}' +
                        '{{/IfCompare}}' +
                        '<div class="span6">' +
                        '<div class="row-fluid">' +
                        self.generateBlockListKeyValueTemplate(config.templateGeneratorConfig.dataColumn, app, config) +
                        '</div>' +
                        '</div>' +
                        '{{/each}} </div>' +
                        '</div></div> {{/IfValidJSONValueByPathLength}} </div>';

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

        this.loadAlertsPopup = function(cfgObj) {
            var prefixId = 'dashboard-alerts';
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
            if(!self.getAlarmsFromAnalytics) {
                modalConfig['title'] = 'Alerts';
            }
            cowu.createModal(modalConfig);

            if(cfgObj.model == null && !self.getAlarmsFromAnalytics) {
                require(['mon-infra-node-list-model','monitor-infra-parsers',
                    'monitor-infra-constants','monitor-infra-utils'],
                    function(NodeListModel,MonitorInfraParsers,MonitorInfraConstants,
                        MonitorInfraUtils) {
                        if(typeof(monitorInfraConstants) == 'undefined') {
                            monitorInfraConstants = new MonitorInfraConstants();
                        }
                        if(typeof(monitorInfraUtils) == 'undefined') {
                            monitorInfraUtils = new MonitorInfraUtils();
                        }
                        if(typeof(monitorInfraParsers) == 'undefined') {
                            monitorInfraParsers = new MonitorInfraParsers();
                        }
                        var nodeListModel = new NodeListModel();
                        var nodeListModelResources = [];
                        //Register node List models
                        if(ctwu != null)
                            nodeListModelResources = nodeListModelResources.concat(ctwu.getNodeListModelsForAlerts());
                        if(contrail.checkIfExist(globalObj.webServerInfo.featurePkg.webStorage) && globalObj.webServerInfo.featurePkg.webStorage == true)
                            nodeListModelResources = nodeListModelResources.concat(swu.getNodeListModelsForAlerts());
                        if(self.getAlarmsFromAnalytics) {
                            require(['js/views/AlarmGridView'], function(AlarmGridView) {
                                var alarmGridView = new AlarmGridView({
                                    el:$("#" + modalId).find('#' + formId),
                                    viewConfig:{}
                                });
                                alarmGridView.render();
                            });
                        } else {
                            require(nodeListModelResources,function() {
                                $.each(arguments,function(idx,currListModel) {
                                    nodeListModel.addListModel(new currListModel());
                                    cfgObj.model = nodeListModel.getAlertListModel();
                                    require(['mon-infra-alert-grid-view'], function(AlertGridView) {
                                        var alertGridView = new AlertGridView({
                                            el:$("#" + modalId).find('#' + formId),
                                            model:cfgObj.model
                                        });
                                        alertGridView.render();
                                    });
                                });
                            });
                        }
                    });
            } else {
                if(self.getAlarmsFromAnalytics) {
                    require(['js/views/AlarmGridView'], function(AlarmGridView) {
                        var alarmGridView = new AlarmGridView({
                            el:$("#" + modalId).find('#' + formId),
                            viewConfig:{}
                        });
                        alarmGridView.render();
                    });
                } else {
                    require(['mon-infra-alert-grid-view'], function(AlertGridView) {
                        var alertGridView = new AlertGridView({
                            el:$("#" + modalId).find('#' + formId),
                            model:cfgObj.model
                        });
                        alertGridView.render();
                    });
                }
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
            $('.popover').remove();
            $.each(tooltipConfig, function (keyConfig, valueConfig) {
                valueConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, valueConfig);
                $('g.' + keyConfig).popover('destroy');
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

    return CoreUtils;
});
