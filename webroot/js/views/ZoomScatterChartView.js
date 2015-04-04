/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone',
    'js/models/ZoomScatterChartModel',
    'contrail-list-model'
], function (_, Backbone, ZoomScatterChartModel, ContrailListModel) {
    var ZoomScatterChartView = Backbone.View.extend({
        renderChartInProgress: false,
        render: function () {
            var loadingSpinnerTemplate = contrail.getTemplate4Id(cowc.TMPL_LOADING_SPINNER),
                viewConfig = this.attributes.viewConfig,
                ajaxConfig = viewConfig['ajaxConfig'],
                chartOptions = viewConfig['chartOptions'],
                self = this, deferredObj = $.Deferred(),
                selector = $(self.$el);

            $(selector).append(loadingSpinnerTemplate);

            if(self.model == null && viewConfig['modelConfig'] != null) {
                self.model = new ContrailListModel(viewConfig['modelConfig']);
            }

            if (self.model != null) {
                if (self.model.loadedFromCache || !(self.model.isRequestInProgress())) {
                    self.renderChart(selector, viewConfig, self.model);
                }

                self.model.onAllRequestsComplete.subscribe(function () {
                    self.renderChart(selector, viewConfig, self.model);
                });

                if (viewConfig.loadChartInChunks) {
                    self.model.onDataUpdate.subscribe(function () {
                        if(!this.renderChartInProgress) {
                            //TODO: We should render chart less often
                            self.renderChart(selector, viewConfig, self.model);
                        }
                    });
                }
            }
        },

        renderChart: function (selector, viewConfig, dataListModel) {
            this.renderChartInProgress = true;
            var data = dataListModel.getFilteredItems(),
                error = dataListModel.error;

            var self = this, chartOptions = viewConfig['chartOptions'],
                chartConfig = getChartConfig(selector, chartOptions),
                margin = chartConfig['margin'],
                width = chartConfig['width'], height = chartConfig['height'];

            var chartModel = new ZoomScatterChartModel(data, chartConfig),
                zm, svg, viewObjects;

            svg = d3.select($(selector)[0]).append("svg")
                .attr("id", "scatter")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            svg.append("rect")
                .attr("width", width)
                .attr("height", height);


            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(chartModel.xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(chartModel.yAxis);

            viewObjects = svg.append("svg")
                .attr("class", "objects")
                .attr("width", width)
                .attr("height", height);

            viewObjects.append("svg:line")
                .attr("class", "axisLine hAxisLine")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", width)
                .attr("y2", 0)
                .attr("transform", "translate(0," + (chartModel.yScale(0)) + ")");

            viewObjects.append("svg:line")
                .attr("class", "axisLine vAxisLine")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", height);

            viewObjects.selectAll("circle")
                .data(chartModel.data)
                .enter()
                .append("circle")
                .attr("r", chartConfig.circleRadius)
                .attr("class", function (d) {
                    return getBubbleColor(d[chartConfig.colorFilterFields], chartModel.classes, chartModel.maxColorFilterFields);
                })
                .attr("transform", function (d) {
                    return "translate(" + chartModel.xScale(d[chartConfig.xField]) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
                })
                .attr("opacity", "0.8");

            svg.append("text")
                .attr("class", "x label")
                .attr("text-anchor", "end")
                .attr("x", width)
                .attr("y", height + margin.bottom - 10)
                .text(chartConfig.xLabel);

            svg.append("text")
                .attr("class", "y label")
                .attr("text-anchor", "end")
                .attr("y", -margin.left)
                .attr("x", 0)
                .attr("dy", ".75em")
                .attr("transform", "rotate(-90)")
                .text(chartConfig.yLabel);

            self.svg = svg;
            self.viewObjects = viewObjects;
            self.zm = chartModel.zoomBehavior.on("zoom", getZoomFn(self, chartModel, chartConfig));
            svg.call(self.zm);

            $(selector).find('.loading-spinner').remove();
            this.renderChartInProgress = false;
            //initFilterEvent()
        }
    });

    function getZoomFn(chartView, chartModel, chartConfig) {
        return function () {
            /*
             // Restrict translation to 0 value
             if (y.domain()[0] < 0 && x.domain()[0] < 0) {
             zm.translate([0, height * (1 - zm.scale())]);
             } else if (y.domain()[0] < 0) {
             zm.translate([d3.event.translate[0], height * (1 - zm.scale())]);
             } else if (x.domain()[0] < 0) {
             zm.translate([0, d3.event.translate[1]]);
             }
             */

            chartView.svg.select(".x.axis").call(chartModel.xAxis);
            chartView.svg.select(".y.axis").call(chartModel.yAxis);

            chartView.viewObjects.select(".hAxisLine").attr("transform", "translate(0," + chartModel.yScale(0) + ")");
            chartView.viewObjects.select(".vAxisLine").attr("transform", "translate(" + chartModel.xScale(0) + ",0)");

            chartView.viewObjects.select(".hMedianLine").attr("transform", "translate(0," + chartModel.yScale(chartModel.yMed) + ")");
            chartView.viewObjects.select(".vMedianLine").attr("transform", "translate(" + chartModel.xScale(chartModel.xMed) + ",0)");

            chartView.svg.selectAll("circle").attr("transform", function (d) {
                return "translate(" + chartModel.xScale(d[chartConfig.xField]) + "," + chartModel.yScale(d[chartConfig.yField]) + ")";
            });
        };
    };

    var getBubbleColor = function (val, array, maxColorFilterFields) {
        return 'medium';
        /*
        if (val > (0.75 * maxColorFilterFields)) {
            return array[0];
        } else if (val > (0.50 * maxColorFilterFields)) {
            return array[1];
        } else if (val > (0.25 * maxColorFilterFields)) {
            return array[2];
        } else {
            return array[3];
        }
        */
    };

    function getChartConfig(selector, chartOptions) {
        var margin = {top: 50, right: 50, bottom: 50, left: 50},
            width = $(selector).width() - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;

        var chartViewConfig = {
            circleRadius: 7.0,
            maxScale: 5,
            minScale: 1 / 5,
            yLabel: chartOptions.yLabel,
            xLabel: chartOptions.xLabel,
            xField: 'x',
            yField: 'y',
            forceX: chartOptions.forceX,
            forceY: chartOptions.forceY,
            colorFilterFields: 'throughput',
            titleKey: chartOptions.titleField,
            categoryKey: 'project',
            margin: margin,
            height: height,
            width: width,
            dataParser: chartOptions['dataParser']
        };

        return chartViewConfig;
    };

    //TODO: Implement Filter
    function initFilterEvent() {
        // cache jQuery element calls:
        var nt = $('#navToggle'),
            nla = $('#navListContainer').find('input[type="checkbox"]'),
            rn = $('#resetNav');

        // Show/hide nav list when button is clicked
        nt.off('click').on('click', function (e) {
            e.preventDefault();
            $(this).toggleClass('active');
            if ($(this).hasClass('active')) {
                $(this).next('#navListContainer').slideDown();
            } else {
                $(this).next('#navListContainer').slideUp();
            }
        });

        // Filter points by category:
        nla.off('click').on('click', function (e) {
            if ($(this).prop("checked")) {
                categories.push($(this).val());
            } else {
                categories = _.without(categories, $(this).val());
            }
            filter();
            if (categories.length > 0) {
                var cats = '',
                    showedNames = 0;
                $.each(categories, function (i) {
                    if ((cats + categories[i] + '; ').length < 130) {
                        var gap = (categories.length > 1 && i < categories.length - 1) ? '; ' : '';
                        showedNames++;
                        cats += categories[i] + gap;
                    } else {
                        return false;
                    }
                });
                if ((categories.length - showedNames) > 1)
                    cats = cats.substring(0, cats.length - 2) + ' + ' + (categories.length - showedNames) + ' other categories';
                else if ((categories.length - showedNames) > 0)
                    cats = cats.substring(0, cats.length - 2) + ' + 1 other category';
            }
        });

        // Reset categories
        rn.off('click').on('click', function (e) {
            e.preventDefault();
            categories = [];
            filter();
            nla.prop("checked", false);
        });

        // Reset categories AND close categories menu
        $('#doneNav').off('click').on('click', function (e) {
            e.preventDefault();
            categories = [];
            filter();
            $('#navListContainer').slideUp();
            nla.prop("checked", false);
        });

        // nvd3 method for dynamic rendering of chart on window resize
        nv.utils.windowResize(function () {
            var container = d3.select('#chart');
            var svg = container.select('svg');
            var aspect = svg.attr("width") / svg.attr("height");
            var targetWidth = parseInt(container.style('width'));
            svg.attr("width", targetWidth);
            svg.attr("height", Math.round(targetWidth / aspect));
            $('#chart').empty();
            scatter();

        });

        //TODO: Implement Zoom
        function initZoomEvents(chartView, chartModel, chartConfig) {
            var zm = chartView.zm,
                zoomFn = getZoomFn(chartView, chartModel, chartConfig);

            d3.select('#zoomIn').on('click', function () {
                d3.event.preventDefault();
                if (zm.scale() < chartConfig.maxScale) {
                    zm.translate([translateChart(0, -10), translateChart(1, -350)]);
                    zm.scale(zm.scale() * 2.0);
                    zoomFn();
                }
            });

            d3.select('#zoomOut').on('click', function () {
                d3.event.preventDefault();
                if (zm.scale() > chartConfig.minScale) {
                    zm.scale(zm.scale() * 0.5);
                    zm.translate([translateChart(0, 10), translateChart(1, 350)]);
                    zoomFn();
                }
            });

            d3.select('#zoomReset').on('click', function () {
                d3.event.preventDefault();
                zm.scale(1);
                zm.translate([0, 0]);
                zoomFn();
            });

            function translateChart(xy, constant) {
                return zm.translate()[xy] + (constant * (zm.scale()));
            };
        };
    };

    return ZoomScatterChartView;
});