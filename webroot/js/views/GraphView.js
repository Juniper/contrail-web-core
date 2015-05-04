/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'joint',
    'contrail-graph-model',
    'js/views/ControlPanelView'
], function (_, Joint, ContrailGraphModel, ControlPanelView) {
    var GraphView = joint.dia.Paper.extend({
        constructor: function (viewConfig) {
            var graphConfig = viewConfig.graphModelConfig,
                tooltipConfig, clickEventsConfig, controlPanelConfig,
                graphControlPanelId = "#graph-control-panel",
                graphLoadingId = '#graph-loading',
                self = this;

            self.model = new ContrailGraphModel(graphConfig);
            self.viewConfig = viewConfig;

            joint.dia.Paper.apply(self, arguments);

            tooltipConfig = contrail.handleIfNull(viewConfig.tooltipConfig, []);
            clickEventsConfig = contrail.handleIfNull(viewConfig.clickEvents, {});
            controlPanelConfig = contrail.handleIfNull(viewConfig.controlPanel, false);

            self.model.beforeDataUpdate.subscribe(function() {
                $(self.el).find(".font-element").remove();
            });

            self.model.onAllRequestsComplete.subscribe(function() {
                var directedGraphSize = self.model.directedGraphSize,
                    graphSelectorElement = self.el,
                    jointObject = {
                        graph: self.model,
                        paper: self
                    };

                if(controlPanelConfig) {
                    var viewAttributes = {
                            viewConfig: getControlPanelConfig(jointObject, graphConfig, controlPanelConfig)
                        },
                        controlPanelView = new ControlPanelView({
                            el: graphControlPanelId,
                            attributes: viewAttributes
                        });

                    controlPanelView.render();
                }

                if(contrail.checkIfFunction(viewConfig.successCallback)) {
                    $(graphLoadingId).remove();
                    viewConfig.successCallback(jointObject, directedGraphSize);
                }

                initClickEvents(graphSelectorElement, clickEventsConfig, jointObject);
                initMouseEvents(graphSelectorElement, tooltipConfig, jointObject)
            });

            return self;
        },

        render: function () {
            this.model.fetchData();
        },

        refreshData: function () {
            this.model.refreshData();
        }
    });

    var initZoomEvents = function(jointObject, controlPanelSelector, graphConfig, controlPanelConfig) {
        var graphControlPanelElement = $(controlPanelSelector),
            panzommTargetId = controlPanelConfig.default.zoom.selectorId,
            panZoomDefaultConfig = {
                increment: 0.3,
                minScale: 0.3,
                maxScale: 2,
                duration: 300,
                $zoomIn: graphControlPanelElement.find(".zoom-in"),
                $zoomOut: graphControlPanelElement.find(".zoom-out"),
                $reset: graphControlPanelElement.find(".zoom-reset")
            },
            panzoomConfig = $.extend(true, panZoomDefaultConfig, controlPanelConfig.default.zoom.config);

        $(panzommTargetId).panzoom("reset");
        $(panzommTargetId).panzoom("resetPan");
        $(panzommTargetId).panzoom("destroy");
        $(panzommTargetId).panzoom(panzoomConfig);
    };

    var getControlPanelConfig = function(jointObject, graphConfig, controlPanelConfig) {
        var customConfig = $.extend(true, {}, controlPanelConfig.custom);

        $.each(customConfig, function(configKey, configValue) {
            if (contrail.checkIfFunction(configValue.iconClass)) {
                configValue.iconClass = configValue.iconClass(jointObject);
            }
        });

        return {
            default: {
                zoom: {
                    enabled: true,
                    events: function(controlPanelSelector) {
                        initZoomEvents(jointObject, controlPanelSelector, graphConfig, controlPanelConfig);
                    }
                }
            },
            custom: customConfig
        }
    };

    var initMouseEvents = function(graphSelectorElement, tooltipConfig, jointObject) {
        var timer = null;
        $.each(tooltipConfig, function (keyConfig, valueConfig) {
            valueConfig = $.extend(true, {}, cowc.DEFAULT_CONFIG_ELEMENT_TOOLTIP, valueConfig);
            $('g.' + keyConfig).popover('destroy');
            $('g.' + keyConfig).popover({
                trigger: 'manual',
                html: true,
                animation: false,
                placement: function (context, src) {
                    $(context).addClass('popover-tooltip');
                    $(context).css({
                        'min-width': valueConfig.dimension.width + 'px',
                        'max-width': valueConfig.dimension.width + 'px'
                    });
                    $(context).addClass('popover-tooltip');

                    var srcOffset = $(src).offset(),
                        bodyWidth = $('body').width();

                    if (srcOffset.left > (bodyWidth / 2)) {
                        return 'left';
                    } else {
                        return 'right';
                    }
                },
                title: function () {
                    return valueConfig.title($(this), jointObject);
                },
                content: function () {
                    return valueConfig.content($(this), jointObject);
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
                                    actionsCallback = valueConfig.actionsCallback($(_this), jointObject);

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

        $(graphSelectorElement).find("text").on('mousedown touchstart', function (e) {
            e.stopImmediatePropagation();
            //jointObject.paper.pointerdown(e);
        });

        $(graphSelectorElement).find("image").on('mousedown touchstart', function (e) {
            e.stopImmediatePropagation();
            //jointObject.paper.pointerdown(e);
        });

        $(graphSelectorElement).find("polygon").on('mousedown touchstart', function (e) {
            e.stopImmediatePropagation();
            //jointObject.paper.pointerdown(e);
        });
        $(graphSelectorElement).find("path").on('mousedown touchstart', function (e) {
            e.stopImmediatePropagation();
            //jointObject.paper.pointerdown(e);
        });
        $(graphSelectorElement).find("rect").on('mousedown touchstart', function (e) {
            e.stopImmediatePropagation();
            //jointObject.paper.pointerdown(e);
        });
        $(graphSelectorElement).find(".font-element").on('mousedown touchstart', function (e) {
            e.stopImmediatePropagation();
            //jointObject.paper.pointerdown(e);
        });

    };

    function initClickEvents(graphSelectorElement, eventConfig, jointObject) {
        var timer = null,
            topContainerElement = $('#' + ctwl.TOP_CONTENT_CONTAINER);

        var onTopContainerBankDblClickHandler = function(e) {
            if(!$(e.target).closest('g').length && !$(e.target).closest('.control-panel-items').length) {
                if(contrail.checkIfFunction(eventConfig['blank:pointerdblclick'])) {
                    eventConfig['blank:pointerdblclick']();
                }
            }
        };

        if(contrail.checkIfFunction(eventConfig['cell:pointerclick'])) {
            jointObject.paper.on('cell:pointerclick', function(cellView, evt, x, y) {

                if (timer) {
                    clearTimeout(timer);
                }

                timer = setTimeout(function() {
                    eventConfig['cell:pointerclick'](cellView, evt, x, y);
                    clearTimeout(timer);
                }, 500);
            });
        }

        if(contrail.checkIfFunction(eventConfig['cell:pointerdblclick'])) {
            jointObject.paper.on('cell:pointerdblclick', function(cellView, evt, x, y) {
                clearTimeout(timer);
                eventConfig['cell:pointerdblclick'](cellView, evt, x, y);
            });
        }

        $(document)
            .off('click', onDocumentClickHandler)
            .on('click', onDocumentClickHandler);

        $(window).on('popstate', function (event) {
            $('g').popover('hide');

        });

        topContainerElement
            .off('dblclick', onTopContainerBankDblClickHandler)
            .on('dblclick', onTopContainerBankDblClickHandler);
    };

    var onDocumentClickHandler = function(e) {
        if(!$(e.target).closest('.popover').length) {
            $('g').popover('hide');
            $(this).parents('.popover').remove();
        }
    };

    return GraphView;
});