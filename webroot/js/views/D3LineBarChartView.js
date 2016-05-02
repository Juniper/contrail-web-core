/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'core-basedir/js/chart/LineBarChart',
    'contrail-list-model'
], function (_, ContrailView, LineBarWithFocusChartContainer, ContrailListModel) {
    var LineBarWithFocusChartView = ContrailView.extend({
        render: function () {
            var viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el),
                modelMap = contrail.handleIfNull(self.modelMap, {});

            if (contrail.checkIfExist(viewConfig.modelKey) && contrail.checkIfExist(modelMap[viewConfig.modelKey])) {
                self.model = modelMap[viewConfig.modelKey]
            }

            if (self.model === null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            self.renderChart(selector, viewConfig, self.model);

            if (self.model !== null) {
                if (self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderChart(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function () {
                    self.renderChart(selector, viewConfig, self.model);
                });

                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        self.renderChart(selector, viewConfig, self.model);
                    });
                }
            }
        },

        renderChart: function (selector, viewConfig, chartViewModel) {
            var self = this,
                data = chartViewModel.getItems(),

                widgetConfig = contrail.checkIfExist(viewConfig.widgetConfig) ? viewConfig.widgetConfig : null,
                chartViewConfig;

            if (contrail.checkIfFunction(viewConfig['parseFn'])) {
                data = viewConfig['parseFn'](data);
            }

            chartViewConfig = getChartViewConfig(data, viewConfig.chartOptions);

            setData2ChartAndRender(self, selector, chartViewConfig, chartViewModel, LineBarWithFocusChartContainer);

            if (widgetConfig !== null) {
                this.renderView4Config(selector.find('.contrailD3-container'), chartViewModel, widgetConfig, null, null, null);
            }
        },

        renderMessage: function(message, selector, chartOptions) {
            var self = this,
                message = contrail.handleIfNull(message, ""),
                selector = contrail.handleIfNull(selector, $(self.$el)),
                chartOptions = contrail.handleIfNull(chartOptions, self.chartContainer.chartOptions);

            var svgElement = $(selector).find('svg');
            if(!svgElement.length)
                $('<svg style="height:300px;" class="row-fluid"></svg>').appendTo(selector);

            var container = d3.select($(selector).find("svg")[0]),
                requestStateText = container.selectAll('.nv-requestState').data([message]),
                textPositionX = $(selector).width() / 2,
                textPositionY = chartOptions.margin.top + $(selector).find('.nv-focus').heightSVG() / 2 + 10;

            requestStateText
                .enter().append('text')
                .attr('class', 'nvd3 nv-requestState')
                .attr('dy', '-.7em')
                .style('text-anchor', 'middle');

            requestStateText
                .attr('x', textPositionX)
                .attr('y', textPositionY)
                .text(function(t){ return t; });
        },

        removeMessage: function(selector) {
            var self = this,
                selector = contrail.handleIfNull(selector, $(self.$el));
            $(selector).find('svg').remove();
        }
    });

    function setData2ChartAndRender(self, selector, chartViewConfig, chartViewModel, ChartContainer) {
        var chartTemplate = contrail.getTemplate4Id("contrailD3-chart-template"),
            chartData = chartViewConfig.chartData,
            checkEmptyDataCB = function (data) {
                return (!data || data.length === 0 || !data.filter(function (d) { return d.values.length; }).length);
            },
            chartDataRequestState = cowu.getRequestState4Model(chartViewModel, chartData, checkEmptyDataCB),
            chartOptions = chartViewConfig['chartOptions'];

        self.chartContainer = contrail.handleIfNull(self.chartContainer, {}); //Initialize chart container with empty obj.

        if (chartOptions.defaultDataStatusMessage && !(chartData.length > 0 && chartData[0].values.length > 0)) {
            var messageHandler = chartOptions.statusMessageHandler;
            self.renderMessage(messageHandler(chartDataRequestState), selector, chartOptions);
        } else {
            self.removeMessage();
            $(selector).find(".contrailD3-container").remove();
            $(selector).append(chartTemplate(chartOptions));

            var configDataObj  = createConfigAndData4ContrailD3(chartOptions, chartData);
            var config = {
                "metaData": {
                    "x":{
                        "isAvailable":false
                    },
                    "cpu_one_min_avg":{
                        "min":0,
                        "isAvailable":true,
                        "tooltip": {
                            nameFormatter: function(name) {
                                return "CPU 1min average";
                            }
                        }
                    },
                    "rss":{
                        "isAvailable":true,
                        "tooltip":{}
                    }
                },
                "components":[
                    {"type":"crosshair"}
                ],
                "options":{
                    "container":{
                        "mainChartHeight":220,
                        "navChartHeight":80,
                        "showControls": true
                    },
                    "axes":{
                        "forceY1": [0, undefined],
                        "y1Label":"CPU Utilization (%)",
                        "y2Label":"Memory Usage",
                        "x1Formatter": function(value) {
                            return d3.time.format("%H:%M")(value);
                        }
                    },
                    "showLegend":true
                }
            };
            var charts = [{
                "type":"bar",
                "color":"#6baed6",
                "xField":"x",
                "yField":"cpu_one_min_avg",
                "y":1,
                "data":[{"x":1462045000720,"cpu_one_min_avg":1.5},{"x":1462045060825,"cpu_one_min_avg":1.5},{"x":1462045120921,"cpu_one_min_avg":1.66667},{"x":1462045181018,"cpu_one_min_avg":1.5},{"x":1462045241118,"cpu_one_min_avg":1.47541},{"x":1462045301212,"cpu_one_min_avg":1.66667},{"x":1462045361308,"cpu_one_min_avg":1.5},{"x":1462045421403,"cpu_one_min_avg":1.66667},{"x":1462045481501,"cpu_one_min_avg":1.5},{"x":1462045541602,"cpu_one_min_avg":1.66667},{"x":1462045601693,"cpu_one_min_avg":1.5},{"x":1462045661794,"cpu_one_min_avg":1.66667},{"x":1462045721894,"cpu_one_min_avg":1.66667},{"x":1462045781991,"cpu_one_min_avg":1.5},{"x":1462045842085,"cpu_one_min_avg":1.47541},{"x":1462045902182,"cpu_one_min_avg":1.5},{"x":1462045962274,"cpu_one_min_avg":1.66667},{"x":1462046022369,"cpu_one_min_avg":1.5},{"x":1462046082468,"cpu_one_min_avg":1.5},{"x":1462046142570,"cpu_one_min_avg":1.66667},{"x":1462046202670,"cpu_one_min_avg":1.5},{"x":1462046262781,"cpu_one_min_avg":1.5},{"x":1462046322882,"cpu_one_min_avg":1.5},{"x":1462046382976,"cpu_one_min_avg":1.66667},{"x":1462046443074,"cpu_one_min_avg":1.47541},{"x":1462046503171,"cpu_one_min_avg":1.66667},{"x":1462046563274,"cpu_one_min_avg":1.5},{"x":1462046623375,"cpu_one_min_avg":1.66667},{"x":1462046683471,"cpu_one_min_avg":1.5},{"x":1462046743564,"cpu_one_min_avg":1.66667},{"x":1462046803661,"cpu_one_min_avg":1.5},{"x":1462046863764,"cpu_one_min_avg":1.66667},{"x":1462046923859,"cpu_one_min_avg":1.66667},{"x":1462046983954,"cpu_one_min_avg":1.5},{"x":1462047044047,"cpu_one_min_avg":1.66667},{"x":1462047104143,"cpu_one_min_avg":1.63934},{"x":1462047164249,"cpu_one_min_avg":1.5},{"x":1462047224339,"cpu_one_min_avg":1.66667},{"x":1462047284436,"cpu_one_min_avg":1.66667},{"x":1462047344538,"cpu_one_min_avg":1.66667},{"x":1462047404637,"cpu_one_min_avg":1.66667},{"x":1462047464738,"cpu_one_min_avg":1.66667},{"x":1462047524830,"cpu_one_min_avg":1.66667},{"x":1462047584920,"cpu_one_min_avg":1.66667},{"x":1462047645012,"cpu_one_min_avg":1.66667},{"x":1462047705110,"cpu_one_min_avg":1.63934},{"x":1462047765213,"cpu_one_min_avg":1.66667},{"x":1462047825316,"cpu_one_min_avg":1.66667},{"x":1462047885409,"cpu_one_min_avg":1.66667},{"x":1462047945508,"cpu_one_min_avg":1.5},{"x":1462048005598,"cpu_one_min_avg":1.66667},{"x":1462048065697,"cpu_one_min_avg":1.5},{"x":1462048125793,"cpu_one_min_avg":1.66667},{"x":1462048185890,"cpu_one_min_avg":1.66667},{"x":1462048245976,"cpu_one_min_avg":1.5},{"x":1462048306069,"cpu_one_min_avg":1.63934},{"x":1462048366162,"cpu_one_min_avg":1.5},{"x":1462048426259,"cpu_one_min_avg":1.66667},{"x":1462048486359,"cpu_one_min_avg":1.5},{"x":1462048546458,"cpu_one_min_avg":1.5},{"x":1462048606556,"cpu_one_min_avg":1.66667},{"x":1462048666654,"cpu_one_min_avg":1.5},{"x":1462048726760,"cpu_one_min_avg":1.66667},{"x":1462048786860,"cpu_one_min_avg":1.5},{"x":1462048846960,"cpu_one_min_avg":1.5},{"x":1462048907060,"cpu_one_min_avg":1.5},{"x":1462048967155,"cpu_one_min_avg":1.47541},{"x":1462049027253,"cpu_one_min_avg":1.5},{"x":1462049087354,"cpu_one_min_avg":1.66667},{"x":1462049147460,"cpu_one_min_avg":1.5},{"x":1462049207565,"cpu_one_min_avg":1.5},{"x":1462049267664,"cpu_one_min_avg":1.66667},{"x":1462049327770,"cpu_one_min_avg":1.5},{"x":1462049387870,"cpu_one_min_avg":1.66667},{"x":1462049447981,"cpu_one_min_avg":1.66667},{"x":1462049508089,"cpu_one_min_avg":1.47541},{"x":1462049568192,"cpu_one_min_avg":1.66667},{"x":1462049628288,"cpu_one_min_avg":1.66667},{"x":1462049688399,"cpu_one_min_avg":1.5},{"x":1462049748513,"cpu_one_min_avg":1.66667},{"x":1462049808613,"cpu_one_min_avg":1.5},{"x":1462049868739,"cpu_one_min_avg":1.66667},{"x":1462049928869,"cpu_one_min_avg":1.66667},{"x":1462049988981,"cpu_one_min_avg":1.5},{"x":1462050049089,"cpu_one_min_avg":1.80328},{"x":1462050109197,"cpu_one_min_avg":1.5},{"x":1462050169308,"cpu_one_min_avg":1.66667},{"x":1462050229418,"cpu_one_min_avg":1.66667},{"x":1462050289515,"cpu_one_min_avg":1.5},{"x":1462050349623,"cpu_one_min_avg":1.66667},{"x":1462050409728,"cpu_one_min_avg":1.5},{"x":1462050469839,"cpu_one_min_avg":1.66667},{"x":1462050529944,"cpu_one_min_avg":1.5},{"x":1462050590045,"cpu_one_min_avg":1.66667},{"x":1462050650143,"cpu_one_min_avg":1.47541},{"x":1462050710243,"cpu_one_min_avg":1.5},{"x":1462050770358,"cpu_one_min_avg":1.5},{"x":1462050830467,"cpu_one_min_avg":1.5},{"x":1462050890582,"cpu_one_min_avg":1.66667},{"x":1462050950682,"cpu_one_min_avg":1.66667},{"x":1462051010793,"cpu_one_min_avg":1.5},{"x":1462051070894,"cpu_one_min_avg":1.5},{"x":1462051130982,"cpu_one_min_avg":1.66667},{"x":1462051191073,"cpu_one_min_avg":1.5},{"x":1462051251166,"cpu_one_min_avg":1.47541},{"x":1462051311255,"cpu_one_min_avg":1.66667},{"x":1462051371359,"cpu_one_min_avg":1.5},{"x":1462051431451,"cpu_one_min_avg":1.5},{"x":1462051491547,"cpu_one_min_avg":1.66667},{"x":1462051551639,"cpu_one_min_avg":1.5},{"x":1462051611731,"cpu_one_min_avg":1.5},{"x":1462051671824,"cpu_one_min_avg":1.66667},{"x":1462051731906,"cpu_one_min_avg":1.5},{"x":1462051792000,"cpu_one_min_avg":1.66667},{"x":1462051852097,"cpu_one_min_avg":1.63934},{"x":1462051912187,"cpu_one_min_avg":1.5},{"x":1462051972285,"cpu_one_min_avg":1.66667},{"x":1462052032383,"cpu_one_min_avg":1.66667},{"x":1462052092481,"cpu_one_min_avg":1.66667},{"x":1462052152570,"cpu_one_min_avg":1.66667}]
            },{
                "type":"bar",
                "color":"#9e9ac8",
                "xField":"x",
                "yField":"cpu_five_min_avg",
                "y":1,
                "data":[{"x":1462045000720,"cpu_five_min_avg":1.5},{"x":1462045060825,"cpu_five_min_avg":1.5},{"x":1462045120921,"cpu_five_min_avg":1.66667},{"x":1462045181018,"cpu_five_min_avg":1.5},{"x":1462045241118,"cpu_five_min_avg":1.47541},{"x":1462045301212,"cpu_five_min_avg":1.66667},{"x":1462045361308,"cpu_five_min_avg":1.5},{"x":1462045421403,"cpu_five_min_avg":1.66667},{"x":1462045481501,"cpu_five_min_avg":1.5},{"x":1462045541602,"cpu_five_min_avg":1.66667},{"x":1462045601693,"cpu_five_min_avg":1.5},{"x":1462045661794,"cpu_five_min_avg":1.66667},{"x":1462045721894,"cpu_five_min_avg":1.66667},{"x":1462045781991,"cpu_five_min_avg":1.5},{"x":1462045842085,"cpu_five_min_avg":1.47541},{"x":1462045902182,"cpu_five_min_avg":1.5},{"x":1462045962274,"cpu_five_min_avg":1.66667},{"x":1462046022369,"cpu_five_min_avg":1.5},{"x":1462046082468,"cpu_five_min_avg":1.5},{"x":1462046142570,"cpu_five_min_avg":1.66667},{"x":1462046202670,"cpu_five_min_avg":1.5},{"x":1462046262781,"cpu_five_min_avg":1.5},{"x":1462046322882,"cpu_five_min_avg":1.5},{"x":1462046382976,"cpu_five_min_avg":1.66667},{"x":1462046443074,"cpu_five_min_avg":1.47541},{"x":1462046503171,"cpu_five_min_avg":1.66667},{"x":1462046563274,"cpu_five_min_avg":1.5},{"x":1462046623375,"cpu_five_min_avg":1.66667},{"x":1462046683471,"cpu_five_min_avg":1.5},{"x":1462046743564,"cpu_five_min_avg":1.66667},{"x":1462046803661,"cpu_five_min_avg":1.5},{"x":1462046863764,"cpu_five_min_avg":1.66667},{"x":1462046923859,"cpu_five_min_avg":1.66667},{"x":1462046983954,"cpu_five_min_avg":1.5},{"x":1462047044047,"cpu_five_min_avg":1.66667},{"x":1462047104143,"cpu_five_min_avg":1.63934},{"x":1462047164249,"cpu_five_min_avg":1.5},{"x":1462047224339,"cpu_five_min_avg":1.66667},{"x":1462047284436,"cpu_five_min_avg":1.66667},{"x":1462047344538,"cpu_five_min_avg":1.66667},{"x":1462047404637,"cpu_five_min_avg":1.66667},{"x":1462047464738,"cpu_five_min_avg":1.66667},{"x":1462047524830,"cpu_five_min_avg":1.66667},{"x":1462047584920,"cpu_five_min_avg":1.66667},{"x":1462047645012,"cpu_five_min_avg":1.66667},{"x":1462047705110,"cpu_five_min_avg":1.63934},{"x":1462047765213,"cpu_five_min_avg":1.66667},{"x":1462047825316,"cpu_five_min_avg":1.66667},{"x":1462047885409,"cpu_five_min_avg":1.66667},{"x":1462047945508,"cpu_five_min_avg":1.5},{"x":1462048005598,"cpu_five_min_avg":1.66667},{"x":1462048065697,"cpu_five_min_avg":1.5},{"x":1462048125793,"cpu_five_min_avg":1.66667},{"x":1462048185890,"cpu_five_min_avg":1.66667},{"x":1462048245976,"cpu_five_min_avg":1.5},{"x":1462048306069,"cpu_five_min_avg":1.63934},{"x":1462048366162,"cpu_five_min_avg":1.5},{"x":1462048426259,"cpu_five_min_avg":1.66667},{"x":1462048486359,"cpu_five_min_avg":1.5},{"x":1462048546458,"cpu_five_min_avg":1.5},{"x":1462048606556,"cpu_five_min_avg":1.66667},{"x":1462048666654,"cpu_five_min_avg":1.5},{"x":1462048726760,"cpu_five_min_avg":1.66667},{"x":1462048786860,"cpu_five_min_avg":1.5},{"x":1462048846960,"cpu_five_min_avg":1.5},{"x":1462048907060,"cpu_five_min_avg":1.5},{"x":1462048967155,"cpu_five_min_avg":1.47541},{"x":1462049027253,"cpu_five_min_avg":1.5},{"x":1462049087354,"cpu_five_min_avg":1.66667},{"x":1462049147460,"cpu_five_min_avg":1.5},{"x":1462049207565,"cpu_five_min_avg":1.5},{"x":1462049267664,"cpu_five_min_avg":1.66667},{"x":1462049327770,"cpu_five_min_avg":1.5},{"x":1462049387870,"cpu_five_min_avg":1.66667},{"x":1462049447981,"cpu_five_min_avg":1.66667},{"x":1462049508089,"cpu_five_min_avg":1.47541},{"x":1462049568192,"cpu_five_min_avg":1.66667},{"x":1462049628288,"cpu_five_min_avg":1.66667},{"x":1462049688399,"cpu_five_min_avg":1.5},{"x":1462049748513,"cpu_five_min_avg":1.66667},{"x":1462049808613,"cpu_five_min_avg":1.5},{"x":1462049868739,"cpu_five_min_avg":1.66667},{"x":1462049928869,"cpu_five_min_avg":1.66667},{"x":1462049988981,"cpu_five_min_avg":1.5},{"x":1462050049089,"cpu_five_min_avg":1.80328},{"x":1462050109197,"cpu_five_min_avg":1.5},{"x":1462050169308,"cpu_five_min_avg":1.66667},{"x":1462050229418,"cpu_five_min_avg":1.66667},{"x":1462050289515,"cpu_five_min_avg":1.5},{"x":1462050349623,"cpu_five_min_avg":1.66667},{"x":1462050409728,"cpu_five_min_avg":1.5},{"x":1462050469839,"cpu_five_min_avg":1.66667},{"x":1462050529944,"cpu_five_min_avg":1.5},{"x":1462050590045,"cpu_five_min_avg":1.66667},{"x":1462050650143,"cpu_five_min_avg":1.47541},{"x":1462050710243,"cpu_five_min_avg":1.5},{"x":1462050770358,"cpu_five_min_avg":1.5},{"x":1462050830467,"cpu_five_min_avg":1.5},{"x":1462050890582,"cpu_five_min_avg":1.66667},{"x":1462050950682,"cpu_five_min_avg":1.66667},{"x":1462051010793,"cpu_five_min_avg":1.5},{"x":1462051070894,"cpu_five_min_avg":1.5},{"x":1462051130982,"cpu_five_min_avg":1.66667},{"x":1462051191073,"cpu_five_min_avg":1.5},{"x":1462051251166,"cpu_five_min_avg":1.47541},{"x":1462051311255,"cpu_five_min_avg":1.66667},{"x":1462051371359,"cpu_five_min_avg":1.5},{"x":1462051431451,"cpu_five_min_avg":1.5},{"x":1462051491547,"cpu_five_min_avg":1.66667},{"x":1462051551639,"cpu_five_min_avg":1.5},{"x":1462051611731,"cpu_five_min_avg":1.5},{"x":1462051671824,"cpu_five_min_avg":1.66667},{"x":1462051731906,"cpu_five_min_avg":1.5},{"x":1462051792000,"cpu_five_min_avg":1.66667},{"x":1462051852097,"cpu_five_min_avg":1.63934},{"x":1462051912187,"cpu_five_min_avg":1.5},{"x":1462051972285,"cpu_five_min_avg":1.66667},{"x":1462052032383,"cpu_five_min_avg":1.66667},{"x":1462052092481,"cpu_five_min_avg":1.66667},{"x":1462052152570,"cpu_five_min_avg":1.66667}]
            },{
                "type":"line",
                "color":"#2ca02c",
                "xField":"x",
                "yField":"rss",
                "y":2,
                "data":[{"x":1462045000720,"rss":1310004},{"x":1462045060825,"rss":1310004},{"x":1462045120921,"rss":1310004},{"x":1462045181018,"rss":1310004},{"x":1462045241118,"rss":1310004},{"x":1462045301212,"rss":1310004},{"x":1462045361308,"rss":1310004},{"x":1462045421403,"rss":1310004},{"x":1462045481501,"rss":1310004},{"x":1462045541602,"rss":1310004},{"x":1462045601693,"rss":1310004},{"x":1462045661794,"rss":1310004},{"x":1462045721894,"rss":1310004},{"x":1462045781991,"rss":1310004},{"x":1462045842085,"rss":1310004},{"x":1462045902182,"rss":1310004},{"x":1462045962274,"rss":1310004},{"x":1462046022369,"rss":1310004},{"x":1462046082468,"rss":1310004},{"x":1462046142570,"rss":1310004},{"x":1462046202670,"rss":1310004},{"x":1462046262781,"rss":1310004},{"x":1462046322882,"rss":1310004},{"x":1462046382976,"rss":1310004},{"x":1462046443074,"rss":1310004},{"x":1462046503171,"rss":1310004},{"x":1462046563274,"rss":1310004},{"x":1462046623375,"rss":1310004},{"x":1462046683471,"rss":1310004},{"x":1462046743564,"rss":1310004},{"x":1462046803661,"rss":1310004},{"x":1462046863764,"rss":1310004},{"x":1462046923859,"rss":1310004},{"x":1462046983954,"rss":1310004},{"x":1462047044047,"rss":1310004},{"x":1462047104143,"rss":1310004},{"x":1462047164249,"rss":1310004},{"x":1462047224339,"rss":1310004},{"x":1462047284436,"rss":1310004},{"x":1462047344538,"rss":1310004},{"x":1462047404637,"rss":1310004},{"x":1462047464738,"rss":1310004},{"x":1462047524830,"rss":1309988},{"x":1462047584920,"rss":1309988},{"x":1462047645012,"rss":1309988},{"x":1462047705110,"rss":1309988},{"x":1462047765213,"rss":1309988},{"x":1462047825316,"rss":1309988},{"x":1462047885409,"rss":1309988},{"x":1462047945508,"rss":1309988},{"x":1462048005598,"rss":1309988},{"x":1462048065697,"rss":1309988},{"x":1462048125793,"rss":1309988},{"x":1462048185890,"rss":1309988},{"x":1462048245976,"rss":1309988},{"x":1462048306069,"rss":1309988},{"x":1462048366162,"rss":1309988},{"x":1462048426259,"rss":1309988},{"x":1462048486359,"rss":1309988},{"x":1462048546458,"rss":1309988},{"x":1462048606556,"rss":1309988},{"x":1462048666654,"rss":1309988},{"x":1462048726760,"rss":1309988},{"x":1462048786860,"rss":1309988},{"x":1462048846960,"rss":1309988},{"x":1462048907060,"rss":1309988},{"x":1462048967155,"rss":1309988},{"x":1462049027253,"rss":1309988},{"x":1462049087354,"rss":1309988},{"x":1462049147460,"rss":1309988},{"x":1462049207565,"rss":1309988},{"x":1462049267664,"rss":1309988},{"x":1462049327770,"rss":1309988},{"x":1462049387870,"rss":1309988},{"x":1462049447981,"rss":1309988},{"x":1462049508089,"rss":1309988},{"x":1462049568192,"rss":1309988},{"x":1462049628288,"rss":1309988},{"x":1462049688399,"rss":1309988},{"x":1462049748513,"rss":1309988},{"x":1462049808613,"rss":1309988},{"x":1462049868739,"rss":1309988},{"x":1462049928869,"rss":1309988},{"x":1462049988981,"rss":1309988},{"x":1462050049089,"rss":1309988},{"x":1462050109197,"rss":1309988},{"x":1462050169308,"rss":1309988},{"x":1462050229418,"rss":1309988},{"x":1462050289515,"rss":1309988},{"x":1462050349623,"rss":1309988},{"x":1462050409728,"rss":1309988},{"x":1462050469839,"rss":1309988},{"x":1462050529944,"rss":1309988},{"x":1462050590045,"rss":1309988},{"x":1462050650143,"rss":1309988},{"x":1462050710243,"rss":1309988},{"x":1462050770358,"rss":1309988},{"x":1462050830467,"rss":1309988},{"x":1462050890582,"rss":1309988},{"x":1462050950682,"rss":1309988},{"x":1462051010793,"rss":1309988},{"x":1462051070894,"rss":1312036},{"x":1462051130982,"rss":1310004},{"x":1462051191073,"rss":1310004},{"x":1462051251166,"rss":1310004},{"x":1462051311255,"rss":1310004},{"x":1462051371359,"rss":1310004},{"x":1462051431451,"rss":1310004},{"x":1462051491547,"rss":1310004},{"x":1462051551639,"rss":1310004},{"x":1462051611731,"rss":1310004},{"x":1462051671824,"rss":1310004},{"x":1462051731906,"rss":1310004},{"x":1462051792000,"rss":1310004},{"x":1462051852097,"rss":1310004},{"x":1462051912187,"rss":1310004},{"x":1462051972285,"rss":1310004},{"x":1462052032383,"rss":1310004},{"x":1462052092481,"rss":1310004},{"x":1462052152570,"rss":1310004}]
            }];
            self.chartContainer = new ChartContainer(config, charts);
            self.chartContainer.chartOptions = chartOptions;

            self.chartContainer.render($(selector).find(".contrailD3-container")[0]);

            //Store the chart object as a data attribute so that the chart can be updated dynamically
            $(selector).find(".contrailD3-container").data('chart', self.chartContainer);
        }
    }

    function getChartViewConfig(chartData, chartOptions) {
        var chartViewConfig = {};

        var chartOptions = $.extend(true, {}, covdc.lineBarWithFocusChartConfig, chartOptions);

        chartOptions['chartId'] = 'linebar-chart';
        chartOptions['forceY1'] = getForceY1Axis(chartData, chartOptions['forceY1']);
        chartOptions['forceY2'] = getForceY2Axis(chartData, chartOptions['forceY2']);

        if (chartData.length > 0) {
            var values = chartData[0].values,
                brushExtent = null,
                start, end;

            if (values.length >= 25) {
                start = values[values.length - 25];
                end = values[values.length - 1];
                chartOptions['brushExtent'] = [chUtils.getViewFinderPoint(start.x), chUtils.getViewFinderPoint(end.x)];
            }
        }

        chartViewConfig['chartData'] = chartData;
        chartViewConfig['chartOptions'] = chartOptions;

        return chartViewConfig;
    };

    function getForceY1Axis(chartData, defaultForceY1) {
        var dataBars = chartData.filter(function (d) {
                return !d.disabled && d.bar
            }),
            dataAllBars = [], forceY1;

        for (var j = 0; j < dataBars.length; j++) {
            dataAllBars = dataAllBars.concat(dataBars[j]['values']);
        }

        forceY1 = cowu.getForceAxis4Chart(dataAllBars, "y", defaultForceY1);
        return forceY1;
    };

    function getForceY2Axis(chartData, defaultForceY2) {
        var dataLines = chartData.filter(function (d) {
                return !d.bar
            }),
            dataAllLines = [], forceY2;

        for (var i = 0; i < dataLines.length; i++) {
            dataAllLines = dataAllLines.concat(dataLines[i]['values']);
        }

        forceY2 = cowu.getForceAxis4Chart(dataAllLines, "y", defaultForceY2);
        return forceY2;
    };
    
    function createConfigAndData4ContrailD3(options, data) {

        var config = {
            metaData : {},
            components: [{
                type: "crosshair"
            }],
            options: {
                container : {
                    "mainChartHeight": 300,
                    "navChartHeight": 80,
                    "showControls": true
                },
                axes: {},
                brush: {
                    "size": 45
                }
            }
        };

        var dataSeries = [],
            metaKeyData = {};
        data.forEach(function(series, idx) {
            series.values.forEach(function(valueObj) {
                _.each(valueObj, function(value, key) {
                    var chartDataObj = {};
                    if (key !== options.xAccessor) {
                        chartDataObj[options.xAccessor] = valueObj[options.xAccessor];
                        chartDataObj[key] = value;
                        if (metaKeyData[key] == undefined) {
                            metaKeyData[key] = {
                                type: function(bar){return (bar) ? 'bar': 'line';}(series.bar),
                                color: options.metaData[key] && options.metaData[key].color || cowc.D3_COLOR_CATEGORY5[idx],
                                y: function(bar){return (bar) ? 1 : 2;}(series.bar),
                                data: []
                            };
                        }
                        metaKeyData[key].data.push(chartDataObj);
                    }
                });
            });
        });
        /**
         * only need chart data series for the field defined in metaData.
         */
        for (var key in options.metaData) {
            if (options.metaData.hasOwnProperty(key) && key !== options.xAccessor) {
                dataSeries.push(metaKeyData[key]);
            }
        }
        
        if (options.height) {
            config.options.container.mainChartHeight =  options.height - config.options.container.navChartHeight;
        }
        config.options.container.mainChartMargin = (options.margin) ? options.margin: {top: 20, right: 70, bottom: 50, left: 70};
        config.options.container.navChartMargin = (options.margin2) ? options.margin2: {top: 0, right: 70, bottom: 20, left: 70};

        config.metaData = options.metaData;

        config.options.axes = {
            y1Label: options.y1AxisLabel,
            y2Label: options.y2AxisLabel,
            xAccessor: options.xAccessor,
            y1Accessor: options.y1Accessor,
            y2Accessor: options.y2Accessor,
            forceY1: options.forceY1,
            forceY2: options.forceY2
        };

        config.options.container.showContainer = options.showLegend;
        config.options.brush.extent = options.brushExtent;

        return {
            config: config,
            chartData: dataSeries
        };

    }

    return LineBarWithFocusChartView;
});