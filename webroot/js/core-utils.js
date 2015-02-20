/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'js/views/FormInputView',
    'js/views/FormGridView',
    'js/views/FormDynamicGridView',
    'js/views/FormMultiselectView',
    'js/views/FormDropdownView',
    'js/views/FormSelect2DropdownView',
    'js/views/FormCheckboxView',
    'js/views/AccordianView',
    'js/views/SectionView',
    'js/views/WizardView',
    'js/views/FormEditableGridView',
    'js/views/GridInputView',
    'js/views/GridCheckboxView',
    'js/views/GridDropdownView',
    'js/views/GridMultiselectView',
    'graph-view',
    'js/views/TabsView',
    'js/views/ChartView',
    'js/views/GridView',
    'js/views/DetailsView'
], function (_, FormInputView, FormGridView, FormDynamicGridView, FormMultiselectView, FormDropdownView, FormSelect2DropdownView, FormCheckboxView,
             AccordianView, SectionView, WizardView, FormEditableGridView, GridInputView, GridCheckboxView, GridDropdownView, GridMultiselectView,
             GraphView, TabsView, ChartView, GridView, DetailsView) {
    var CoreUtils = function () {
        var self = this;
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
                    console.log("onEnter");
                    $("#" + modalId).modal('hide');
                }
            });
        };
        this.createModal = function (options) {
            var modalId = options['modalId'];
            $.contrailBootstrapModal({
                id: modalId,
                className: options['className'],
                title: options['title'],
                body: options['body'],
                footer: [
                    {
                        id: 'cancelBtn',
                        title: 'Cancel',
                        onclick: function () {
                            options['onCancel']();
                        }
                    },
                    {
                        className: 'btn-primary btnSave',
                        title: (options['btnName']) ? options['btnName'] : 'Save',
                        onclick: function () {
                            options['onSave']();
                        }
                    }
                ],
                onEnter: function () {
                    options['onCancel']();
                }
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
                onEnter: function () {
                    options['onCancel']();
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
                columns.push({ id: key, field: key, name: self.getGridTitle4Field(key), width: 150, minWidth: 15 });
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
                obj = $.isArray(obj) ? obj.join(', ') : obj;
                obj = obj.toString().trim();
                if (obj !== '' || obj === 0) {
                    return obj;
                }
            }

            return '-';
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

        this.getEditConfigObj = function (configObj, locks){
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
                    if(contrail.checkIfExist(value) && (typeof value == 'string')) {
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

        this.renderView4Config = function (parentElement, model, viewObj, validation, lockEditingByDefault) {
            var viewName = viewObj['view'],
                elementId = viewObj[cowc.KEY_ELEMENT_ID],
                validation = (validation != null) ? validation : cowc.KEY_VALIDATION,
                viewAttributes = {viewConfig: viewObj[cowc.KEY_VIEW_CONFIG], elementId: elementId, validation: validation, lockEditingByDefault: lockEditingByDefault},
                app = viewObj['app'],
                elementView;

            switch (viewName) {
                case "AccordianView":
                    elementView = new AccordianView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "SectionView":
                    elementView = new SectionView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "FormDropdownView":
                    elementView = new FormDropdownView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "FormSelect2DropdownView":
                    elementView = new FormSelect2DropdownView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "FormCheckboxView":
                    elementView = new FormCheckboxView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "FormInputView":
                    elementView = new FormInputView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "FormMultiselectView":
                    elementView = new FormMultiselectView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "FormGridView":
                    elementView = new FormGridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "FormDynamicGridView":
                    elementView = new FormDynamicGridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "WizardView":
                    elementView = new WizardView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "FormEditableGridView":
                    elementView = new FormEditableGridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "GridInputView":
                    elementView = new GridInputView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "GridCheckboxView":
                    elementView = new GridCheckboxView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "GridDropdownView":
                    elementView = new GridDropdownView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "GridMultiselectView":
                    elementView = new GridMultiselectView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "GraphView":
                    elementView = new GraphView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "TabsView":
                    elementView = new TabsView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "ChartView":
                    elementView = new ChartView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "GridView":
                    elementView = new GridView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                case "DetailsView":
                    elementView = new DetailsView({el: parentElement, model: model, attributes: viewAttributes});
                    elementView.render();
                    break;

                default:
                    if(app == cowc.APP_CONTRAIL_CONTROLLER) {
                        ctwu.renderView(viewName, parentElement, model, viewAttributes);
                    } else if(app == cowc.APP_CONTRAIL_SM) {
                        smwu.renderView(viewName, parentElement, model, viewAttributes);
                    }
                    break;
            }
        };

        this.getAttributeFromPath = function (attributePath) {
            var attributePathArray = attributePath.split('.'),
                attribute = attributePathArray[attributePathArray.length - 1];

            return attribute;
        };

        /* Detail Template Generator*/

        this.generateBlockListKeyValueTemplate = function(config, feature) {
            var template = '<ul class="item-list">';

            $.each(config, function(configKey, configValue) {
                template += '' +
                '{{#IfValidJSONValueByPath "' + configValue.key + '" this ' + configKey + '}}' +
                '<li>' +
                '<label class="inline">' +
                '<span class="key"> {{getLabel "' + configValue.key + '" "' + feature + '"}} </span>';

                if (configValue.valueType == 'text') {
                    template += '<span class="value"> {{{getJSONValueByPath "' + configValue.key + '" this}}} </span>';
                } else if (configValue.valueType == 'link') {
                    template += '<span class="value"> {{{getJSONValueLinkByPath "' + configValue.key + '" this}}} </span>';
                } else if (configValue.valueType == 'format-bytes') {
                    template += '<span class="value"> {{{getJSONValueFormattedBytesByPath "' + configValue.key + '" this "' + configValue.valueFormat + '"}}} </span>';
                } else if (configValue.valueType == 'length') {
                    template += '<span class="value"> {{{getJSONValueLengthByPath "' + configValue.key + '" this}}} </span>';
                }

                template += '</label>' +
                '</li>' +
                '{{/IfValidJSONValueByPath}}';
            });

            template += '</ul>';

            return template;
        };

        this.generateInnerTemplate = function(config, feature) {
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

                        rowTemplateObj.append(self.generateInnerTemplate(rowValue, feature))
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
                            columnTemplateObj.append(self.generateInnerTemplate(rowValue, feature))
                            templateObj.append(columnTemplateObj);
                        });
                    });

                break;

                case 'BlockListTemplateGenerator':
                    var template = '<div class="detail-block-list-content row-fluid">';

                        template += '<h6>' + config.title + '</h6>' +
                            self.generateBlockListKeyValueTemplate(config.templateGeneratorConfig, feature) +
                            '<br/></div>';

                    templateObj = $(template);
                break;

                case 'BlockGridTemplateGenerator':

                    var template = '<div class="detail-block-grid-content row-fluid">';

                    if (contrail.checkIfExist(config.title)) {
                        template += '<h6>' + config.title + '</h6>';
                    }

                    template += '<div class="row-fluid">' +
                    '{{#IfValidJSONValueByPath "' + config.key + '" this 1}} ' +
                        '{{#each ' + config.key +'}} ' +
                            '{{#IfCompare @index 0 operator="%2"}} ' +
                                '{{#IfCompare @index 0 operator="!="}}</div><br/>{{/IfCompare}}' +
                                '<div class="row-fluid">' +
                            '{{/IfCompare}}' +
                            '<div class="span6"><div class="row-fluid">' +
                            self.generateBlockListKeyValueTemplate(config.templateGeneratorConfig.dataColumn, feature) +
                            '</div></div>';

                    template += '{{/each}} </div> {{/IfValidJSONValueByPath}}';

                    template += '</div></div>';

                    templateObj = $(template);

                break;
            };

            return(templateObj.prop('outerHTML'))
        }

        this.generateDetailTemplate = function(config, feature) {
            var template = contrail.getTemplate4Id(cowc.TMPL_DETAIL_FOUNDATION),
                templateObj = $(template());

            templateObj.find('.detail-foundation-content').append(self.generateInnerTemplate(config, feature));
            templateObj.find('.group-detail-advanced-json').append('{{{formatGridJSON2HTML this}}}')

            return(templateObj.prop('outerHTML'))
        }

    };
    return CoreUtils;
});
