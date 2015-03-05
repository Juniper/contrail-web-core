/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'joint',
    'contrail-graph-model'
], function (_, Joint, ContrailGraphModel) {
    var GraphView = joint.dia.Paper.extend({
        linkView: joint.shapes.contrail.LinkView,

        constructor: function (viewConfig) {
            var graphConfig = viewConfig.graphModelConfig,
                tooltipConfig, clickEventsConfig,
                self = this;

            self.model = new ContrailGraphModel(graphConfig);
            self.viewConfig = viewConfig;

            joint.dia.Paper.apply(self, arguments);

            tooltipConfig = contrail.handleIfNull(viewConfig.tooltipConfig, []);
            clickEventsConfig = contrail.handleIfNull(viewConfig.clickEvents, {});

            self.model.onAllRequestsComplete.subscribe(function() {

                var directedGraphSize = self.model.directedGraphSize,
                    jointObject = {
                        connectedGraph: self.model,
                        connectedPaper: self
                    };

                if(contrail.checkIfFunction(viewConfig.successCallback)) {
                    viewConfig.successCallback(self, directedGraphSize, jointObject);
                }
                initTooltip(tooltipConfig, jointObject);
                initClickEvents(clickEventsConfig, jointObject);
            });

            return self;
        },

        render: function () {
            var self = this, viewConfig = self.viewConfig;

            self.model.fetchData();
        }
    });

    function initTooltip(tooltipConfig, jointObject) {
        $.each(tooltipConfig, function (keyConfig, valueConfig) {
            $('g.' + keyConfig).popover('destroy');
            $('g.' + keyConfig).popover({
                trigger: 'click',
                html: true,
                delay: {show: 200, hide: 0},
                placement: function (context, src) {
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
            });
        });
    };

    function initClickEvents(eventConfig, jointObject) {
        if(contrail.checkIfFunction(eventConfig['blank:pointerclick'])) {
            jointObject.connectedPaper.on('blank:pointerclick', eventConfig['blank:pointerclick']);
        }

        if(contrail.checkIfFunction(eventConfig['cell:pointerdblclick'])) {
            jointObject.connectedPaper.on('cell:pointerdblclick', eventConfig['cell:pointerdblclick']);
        }

        if(contrail.checkIfExist(eventConfig['cell:rightclick'])) {
            initRightClickEvent(eventConfig['cell:rightclick'], jointObject);
        }
    };

    function initRightClickEvent(rightClickConfig, jointObject) {
        $.contextMenu('destroy', 'g');
        $.contextMenu({
            selector: 'g',
            position: function (opt, x, y) {
                opt.$menu.css({top: y + 5, left: x + 5});
            },
            build: function ($trigger, e) {
                if (!$trigger.hasClassSVG('element') && !$trigger.hasClassSVG('link')) {
                    $trigger = $trigger.parentsSVG('g.element');
                    if ($trigger.length > 0) {
                        $trigger = $($trigger[0]);
                    }
                }
                var contextMenuItems = false;
                if (contrail.checkIfExist($trigger)) {
                    $.each(rightClickConfig, function (keyConfig, valueConfig) {
                        if ($trigger.hasClassSVG(keyConfig)) {
                            contextMenuItems = valueConfig($trigger, jointObject);
                            $('g.' + keyConfig).popover('hide');
                            return false;
                        }
                    });
                }
                return contextMenuItems;
            }
        });
    };

    return GraphView;
});