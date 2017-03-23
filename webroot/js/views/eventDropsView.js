/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'lodash',
    'contrail-view',
    'contrail-list-model',
    'legend-view',
    'core-constants',
    'chart-utils',
    'event-drops'
], function (_, ContrailView,  ContrailListModel, LegendView, cowc,chUtils) {
    var cfDataSource;
    var eventDropsView = ContrailView.extend({
        initialize: function(options) {
            var self = this;
            self.viewCfg = cowu.getValueByJsonPath(options,'attributes;viewConfig',{});
        },
        render: function () {
            var self = this;
            var viewConfig = this.attributes.viewConfig;
            var chartOptions = getValueByJsonPath(viewConfig, 'chartOptions', {});
            var listenToHistory = getValueByJsonPath(chartOptions,'listenToHistory',false);
            self.timeExtent = [new Date(new Date().getTime() - 2 * 60 * 60 * 1000),
                new Date()];
            if(listenToHistory) {
                chUtils.listenToHistory(function(event){
                    //create a new model and then bind to self.
                      var timeExtent = getValueByJsonPath(event,'state;timeExtent',null);
                      if(timeExtent != null && timeExtent.length > 0) {
                          self.model.setData([]);
                          self.showLoading(self);
                          self.model = cowu.buildNewModelForTimeRange (self.model,viewConfig,timeExtent);
                          self.timeExtent = [new Date(timeExtent[0]/1000),
                              new Date(timeExtent[1]/1000)];
                          self.model.onAllRequestsComplete.subscribe(function () {
                              self.renderChart(true);
                          });
                      }
                });
            }
            if (self.model.loadedFromCache == true) {
                self.renderChart(true);
            } else {
                self.model.onAllRequestsComplete.subscribe(function() {
                    self.renderChart(true);
                });
            }
            self.model.onDataUpdate.subscribe(function () {
                self.renderChart();
            });
            $($(self.$el)).bind("refresh", function () {
                self.renderChart(true);
            });
            var prevDimensions = chUtils.getDimensionsObj(self.$el);
            /* window resize may not be require since the nvd3 also provides a smoother refresh*/
            self.resizeFunction = _.debounce(function (e) {
                if(!chUtils.isReRenderRequired({
                    prevDimensions:prevDimensions,
                    elem:self.$el})) {
                    return;
                }
                prevDimensions = chUtils.getDimensionsObj(self.$el);
                self.renderChart();
            },cowc.THROTTLE_RESIZE_EVENT_TIME);
            window.addEventListener('resize',self.resizeFunction);
            $(self.$el).parents('.custom-grid-stack-item').on('resize',self.resizeFunction);
            self.renderChart();
        },
        showLoading: function (self) {
            self.$el.find('.event-drops-header > .loading').show();
        },
        hideLoading: function (self) {
            self.$el.find('.event-drops-header > .loading').hide();
        },
        showDetailsInTarget : function (d,viewCfg) {
//            d3.select('body').selectAll('.event-drops-tooltip').remove();
            var targetSelector = cowu.getValueByJsonPath(self.viewCfg,'target','.alarms-event-log-container');
            var detailsFn = getValueByJsonPath(viewCfg,'chartOptions;detailsFn');
            var tooltipContent = (detailsFn)? detailsFn(d): getTooltipContent(d);
            $(targetSelector).html(tooltipContent);
            $(targetSelector).parent().children().hide();
            $(targetSelector).show();
            $('.event-drops.popover-remove').on('click',function() {
                $(targetSelector).hide();
                $($(targetSelector).parent().children()[0]).show();
            });
        },
        showTooltip : function(d,viewCfg) {
            d3.select('body').selectAll('.event-drops-tooltip').remove();
            var self = this;
            var FONT_SIZE = 12; // in pixels
            var TOOLTIP_WIDTH = 30; // in rem
            var tooltip = d3.select("body").append("div")
                            .attr("class", "event-drops-tooltip")
                            .style("opacity", 0);
            // show the tooltip with a small animation
            tooltip.transition()
                .duration(200)
                .each('start', function start() {
                    d3.select(this).style('block');
                })
                .style('opacity', 1);
            var rightOrLeftLimit = FONT_SIZE * TOOLTIP_WIDTH;
            rightOrLeftLimit = 300;
            //Check if tooltip can be accomodated on right
            var direction = d3.event.pageX > rightOrLeftLimit ? 'right' : 'left';

            var ARROW_MARGIN = 1.65;
            var ARROW_WIDTH = FONT_SIZE;
            var left = direction === 'right' ?
                d3.event.pageX - rightOrLeftLimit + 30 :
                d3.event.pageX - ARROW_MARGIN * FONT_SIZE - ARROW_WIDTH / 2;
           var tooltipFn = getValueByJsonPath(viewCfg,'chartOptions;tooltipFn');
           var tooltipContent = (tooltipFn)? tooltipFn(d): getTooltipContent(d);
            // var tooltipTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_TOOLTIP_CONTENT);
            tooltip.html(tooltipContent);
            $('.event-drops.popover-remove').on('click',function() {
                $('.event-drops-tooltip').remove();
            });

            tooltip
                .classed(direction,true)
                .style({
                    left: left + 'px',
                    top: (d3.event.pageY + 16) + 'px',
                    position: 'absolute'
                });
        },
        hideTooltip : function() {
            d3.select('.event-drops-tooltip').transition()
                .duration(200)
                .each('end', function end() {
                    this.remove();
                })
                .style('opacity', 0);
        },

        renderChart: function(hideLoading) {
            var self = this;
            var colors =  d3.scale.category10();
            var eventDropsWidgetTmpl;
            if ($(self.$el).find('.eventdrops-widget').length == 0){
                eventDropsWidgetTmpl = contrail.getTemplate4Id('eventdrops-widget-template');
                self.$el.html(eventDropsWidgetTmpl);
            }
            colors = cowc.FIVE_NODE_COLOR;
            colors = ["rgb(13,81,156)","rgb(50,129,189)","rgb(106,174,214)"]
            var data = self.model.getItems();
            var labelsWidth = 160;
            if(self.viewCfg.groupBy != null) {
                data = _.groupBy(data,function(d) {
                    return _.result(d,self.viewCfg.groupBy,d.Messagetype);
                });
                data = _.map(data,function(value,key) {
                    return {
                        name: key,
                        data: value
                    }
                });
            } else {
                data = [{
                    name: '',
                    data: data
                }]
                labelsWidth = 0;
            }
            var eventDropsChart = d3.chart.eventDrops()
                .start(self.timeExtent[0])
                .end(self.timeExtent[1])
                // .eventLineColor(function(d, i) { return colors[i]})
                .labelsWidth(200)
                // .zoomable(false)
                //.eventLineColor(function(d, i) { return colors(i)})
                .eventLineColor(function(d, i) { return colors[i%colors.length]})
                // .labelsWidth(labelsWidth)
                .mouseover(function(d){
                    self.showTooltip(d,self.viewCfg);
                })
                .mouseout(self.hideTooltip)
                .click(function(d){
                    self.showDetailsInTarget(d,self.viewCfg);
                })
                .date(function(d){
                    return new Date(d.MessageTS/1000);
                });
            self.$el.find('.eventdrops-widget-title').text(self.viewCfg['title']);
            self.$el.find('.eventdrops-widget-title').addClass('drag-handle');
            if(hideLoading) {
                self.$el.find('.event-drops-header > .loading').hide();
            }
            d3.select(self.$el.find('.eventdrops-chart')[0])
            .datum(data)
            .call(eventDropsChart);
        }
    });
    function getXMLMessageContent(d) {
        var jsonField = '';
        if(d['ObjectLog'] != null) {
            jsonField = 'ObjectLog';
            // var xmlMessageJSON = cowu.formatXML2JSON(d.Xmlmessage);
            // tooltip.html('<div>' + d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d['MessageTS']/1000)) + '</div>' +
            //             '<div>' + d.Source + '</div>' +
            //             '<div>' + d.Category + '</div>' +
            //             '<div>' + xmlMessage.join(' ') + '</div>')
        } else if(d['body'] != null) {
            jsonField = 'body';
        } else {
            jsonField = 'Xmlmessage';
        }
        var xmlMessageJSON;
        if(typeof(d[jsonField]) == 'string') {
            try{
                xmlMessageJSON = JSON.parse(d[jsonField]);
            }catch(e) {
                xmlMessageJSON = cowu.formatXML2JSON(d[jsonField]);
            }
        } else {
            xmlMessageJSON = cowu.formatXML2JSON(d[jsonField]);
        }
        var xmlMessage = '<pre class="pre-format-JSON2HTML">' + contrail.formatJsonObject(xmlMessageJSON) + '</pre>';
        return '<div>' + xmlMessage  + '</div>';
    }
    function getTooltipContent(d) {
        var jsonField = '';
        if(d['ObjectLog'] != null) {
            jsonField = 'ObjectLog';
            // var xmlMessageJSON = cowu.formatXML2JSON(d.Xmlmessage);
            // tooltip.html('<div>' + d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d['MessageTS']/1000)) + '</div>' +
            //             '<div>' + d.Source + '</div>' +
            //             '<div>' + d.Category + '</div>' +
            //             '<div>' + xmlMessage.join(' ') + '</div>')
        } else if(d['body'] != null) {
            jsonField = 'body';
        } else {
            jsonField = 'Xmlmessage';
        }
        var xmlMessageJSON;
        if(typeof(d[jsonField]) == 'string') {
            try{
                xmlMessageJSON = JSON.parse(d[jsonField]);
            }catch(e) {
                xmlMessageJSON = cowu.formatXML2JSON(d[jsonField]);
            }
        } else {
            xmlMessageJSON = cowu.formatXML2JSON(d[jsonField]);
        }
        var tooltipColumns = [
            { field:'MessageTS',
              label: 'Time',
              formatter: function(d) {
                return d3.time.format("%d/%m/%y %H:%M:%S")(new Date(d/1000))
              }
            }
            ,{
                field:'Source',
                label:'Source'
            },{
                field:'useragent',
                label:'Useragent'
            },{
                field:'remote_ip',
                label:'Remote IP'
            },{
                field:'domain',
                label:'Domain'
            },{
                field:'project',
                label:'Project'
            },{
                field:'operation',
                label:'Operation'
            }
        ]
        var xmlMessage = '<pre class="pre-format-JSON2HTML">' + contrail.formatJsonObject(xmlMessageJSON) + '</pre>';
        var tooltipContent = '';
        tooltipContent += '<div class="event-drops popover-remove">' +
            '<i class="fa fa-remove pull-right popover-remove-icon"></i>'+
        '</div>';
        $.each(tooltipColumns,function(idx,tooltipCfg) {
            tooltipContent += '<div>';
            tooltipContent += '<b>' + tooltipCfg['label'] + ': </b>';
            if(typeof(tooltipCfg['formatter']) == 'function') {
                tooltipContent += tooltipCfg['formatter'](d[tooltipCfg['field']]);
            } else {
                tooltipContent += d[tooltipCfg['field']];
            }
            tooltipContent += '</div>';
        });
        return tooltipContent +
        '<hr/>' +
        '<div><b>' + 'Object Log'  + '</b></div>' +
        '<div>' + xmlMessage  + '</div>';
    }
    return eventDropsView;
});
