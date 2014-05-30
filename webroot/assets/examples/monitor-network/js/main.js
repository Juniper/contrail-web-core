var globalConfigObj = {
    CIRCLE_RADIUS : 7.0,
    MAX_SCALE : 5,
    MIN_SCALE : 1/5,
    Y_AXIS_LABEL : 'Connected Networks',
    X_AXIS_LABEL : 'Interfaces',
    TOTAL_VALUES : 'connected_nw',
    MEDIAN_VALUES : 'interfaces',
    COLOR_FILTER_FIELDS : 'throughput',
    TITLE_KEY : 'vn',
    CATEGORY_KEY : 'project'

};
// main d3.js chart generator function
var scatter = function(){
    var categories = [];

    d3.json("/assets/examples/monitor-network/data/data.json", function(data) {

        var margin = {top: 0, right: 20, bottom: 50, left: 40},
            width = $('#content-container').width() - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var xMax = d3.max(data, function(d) { return +d[globalConfigObj.TOTAL_VALUES]; }) * 1.05,
            xMin = 0,
            yMax = d3.max(data, function(d) { return +d[globalConfigObj.MEDIAN_VALUES]; }) * 1.05,
            yMin = 0;

        var finalOverlapMap = getOverlapMap(data);

        //Define scales
        var x = d3.scale.linear()
            .domain([xMin, xMax])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([yMin, yMax])
            .range([height, 0]);

        var zm = d3.behavior.zoom().x(x).y(y).scaleExtent([1, 8]).on("zoom", zoom);

        var max_COLOR_FILTER_FIELDS = d3.max(data, function(d) { return +d[globalConfigObj.COLOR_FILTER_FIELDS] });
        // Colour classes array:
        var classes = ['high','medium','low','negative'];
        // Use in conjunction with classes array:
        var colourScale = function(val,array,active){
            if (val > (0.75 * max_COLOR_FILTER_FIELDS)) {
                return array[0];
            } else if (val > (0.50 * max_COLOR_FILTER_FIELDS)) {
                return array[1];
            } else if (val > (0.25 * max_COLOR_FILTER_FIELDS)) {
                return array[2];
            } else {
                return array[3];
            }
        };

        var superscript = "⁰¹²³⁴⁵⁶⁷⁸⁹",
            formatPower = function(d) { return (d + "").split("").map(function(c) { return superscript[c]; }).join(""); };
        //Define X axis
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(-height)
            .tickFormat(d3.format("s"));

        //Define Y axis
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5)
            .tickSize(-width)
            .tickFormat(d3.format("s"));

        // Zoom in/out buttons:
        d3.select('#zoomIn').on('click',function(){
            d3.event.preventDefault();
            if (zm.scale()< globalConfigObj.MAX_SCALE) {
                zm.translate([trans(0,-10),trans(1,-350)]);
                zm.scale(zm.scale()*2.0);
                zoom();
            }
        });
        d3.select('#zoomOut').on('click',function(){
            d3.event.preventDefault();
            if (zm.scale()> globalConfigObj.MIN_SCALE) {
                zm.scale(zm.scale()*0.5);
                zm.translate([trans(0,10),trans(1,350)]);
                zoom();
            }
        });
        d3.select('#zoomReset').on('click',function(){
            d3.event.preventDefault();
            zm.scale(1);
            zm.translate([0,0]);
            zoom();
        });

        // Define medians. There must be a way to do this with d3.js but I can't figure it out.
        var xMed = median(_.map(data,function(d){ return d[globalConfigObj.TOTAL_VALUES];}));
        var yMed = median(_.map(data,function(d){ return d[globalConfigObj.MEDIAN_VALUES];}));


        var svg = d3.select("#chart").append("svg")
            .attr("id", "scatter")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.behavior.zoom().x(x).y(y).scaleExtent([1, 13]).on("zoom", zoom));


        var tooltip = d3.select("#tooltip");
        var quadrant = d3.select("#quadrant");

        // Create background
        svg.append("rect")
            .attr("width", width)
            .attr("height", height);

        //Create axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var objects = svg.append("svg")
            .attr("class", "objects")
            .attr("width", width)
            .attr("height", height);

        //Create main 0,0 axis lines:
        objects.append("svg:line")
            .attr("class", "axisLine hAxisLine")
            .attr("x1",0)
            .attr("y1",0)
            .attr("x2",width)
            .attr("y2",0)
            .attr("transform", "translate(0," + (y(0)) + ")");
        objects.append("svg:line")
            .attr("class", "axisLine vAxisLine")
            .attr("x1",0)
            .attr("y1",0)
            .attr("x2",0)
            .attr("y2",height);

        //Create hexagon points
        objects.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", globalConfigObj.CIRCLE_RADIUS)
            .attr("class", function(d){
                return colourScale(d[globalConfigObj.COLOR_FILTER_FIELDS],classes);
            })
            .attr("transform", function(d) {
                return "translate("+x(d[globalConfigObj.TOTAL_VALUES])+","+y(d[globalConfigObj.MEDIAN_VALUES])+")";
            })
            .attr("opacity","0.8")
            .on("mouseover", function(d) {
                //Update the tooltip value
                var key = d[globalConfigObj.TOTAL_VALUES] +','+ d[globalConfigObj.MEDIAN_VALUES],
                    toolTipData = {};
                if(key in finalOverlapMap){
                    $.each(finalOverlapMap[key], function(k,v){
                        toolTipData[k] = data[v];
                        // we need to update the tooltip data instead of overwriting it ?
                    });
                    //getOverlapToolTipContent(toolTipData);
                } else {
                    tooltip.select("#name").text(d[globalConfigObj.TITLE_KEY]);
                    tooltip.select("#category").text("Category: " +d[globalConfigObj.CATEGORY_KEY]);
                    tooltip.select("#stats-1").text(numberWithCommas(d[globalConfigObj.MEDIAN_VALUES]));
                    tooltip.select("#stats-2").text(numberWithCommas(d[globalConfigObj.TOTAL_VALUES]));
                    tooltip.select("#stats-3").text(d[globalConfigObj.COLOR_FILTER_FIELDS]);
                }

                // Determine whether circle is in left/right side of screen, and alter tooltip location accordingly:
                if ($(this).attr("transform").substr(10,10)*1 > width/2) tooltip.classed("leftPos", true);
                else tooltip.classed("leftPos", false);

                //Show the tooltip
                if(($(this).attr('class') != 'inactive'))
                    tooltip.classed("hidden", false);

            })
            .on("mouseout", function() {
                //Hide the tooltip
                tooltip.classed("hidden", true);
            });


        // Create X Axis label
        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.bottom - 10)
            .text(globalConfigObj.X_AXIS_LABEL);

        // Create Y Axis label
        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left)
            .attr("x", 0)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text(globalConfigObj.Y_AXIS_LABEL);

        //If val is negative, return zero:
        function noNeg(val){
            return val = val>0 ? val : 0;
        }

        // Zoom/pan behaviour:
        function zoom() {

            // To restrict translation to 0 value
            if(y.domain()[0] < 0 && x.domain()[0] < 0) {
                zm.translate([0, height * (1 - zm.scale())]);
            } else if(y.domain()[0] < 0) {
                zm.translate([d3.event.translate[0], height * (1 - zm.scale())]);
            } else if(x.domain()[0] < 0) {
                zm.translate([0, d3.event.translate[1]]);
            }

            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);

            objects.select(".hAxisLine").attr("transform", "translate(0,"+y(0)+")");
            objects.select(".vAxisLine").attr("transform", "translate("+x(0)+",0)");

            objects.select(".hMedianLine").attr("transform", "translate(0,"+y(yMed)+")");
            objects.select(".vMedianLine").attr("transform", "translate("+x(xMed)+",0)");

            svg.selectAll("circle")
                .attr("transform", function(d) {
                    return "translate("+x(d[globalConfigObj.TOTAL_VALUES])+","+y(d[globalConfigObj.MEDIAN_VALUES])+")";
                });
        };

        function trans(xy,constant){
            return zm.translate()[xy]+(constant*(zm.scale()));
        };

        // Filter function: Sets circles in some categories to inactive using the category selecter
        function filter(){
            svg.selectAll("circle")
                .attr("class", function(d){
                    if(categories.length>0 && !_.contains(categories, d[globalConfigObj.CATEGORY_KEY])) {
                        $.each(categories,function(i){
                            $('#navToggle span').append(categories[i]+' ');
                        });
                        return "inactive";
                    } else {
                        return colourScale(d[globalConfigObj.COLOR_FILTER_FIELDS],classes);
                    }
                });
        };

        // jQuery Nav List events
        (function(){
            // cache jQuery element calls:
            var nt = $('#navToggle'),
                nla = $('#navListContainer').find('input[type="checkbox"]'),
                rn = $('#resetNav');

            // Show/hide nav list when button is clicked
            nt.off('click').on('click',function(e){
                e.preventDefault();
                $(this).toggleClass('active');
                if($(this).hasClass('active')){
                    $(this).next('#navListContainer').slideDown();
                } else {
                    $(this).next('#navListContainer').slideUp();
                }
            });

            // Filter points by category:
            nla.off('click').on('click',function(e){
                if($(this).prop("checked")){
                    categories.push($(this).val());
                } else {
                    categories = _.without(categories, $(this).val());
                }
                filter();
                if(categories.length>0) {
                    var cats = '',
                        showedNames = 0;
                    $.each(categories,function(i){
                        if((cats + categories[i]+'; ').length < 130) {
                            var gap = (categories.length>1 && i<categories.length-1) ? '; ' : '';
                            showedNames++;
                            cats += categories[i]+gap;
                        } else {
                            return false;
                        }
                    });
                    if((categories.length - showedNames)>1)
                        cats = cats.substring(0,cats.length-2)+' + '+(categories.length - showedNames)+' other categories';
                    else if ((categories.length - showedNames)>0)
                        cats = cats.substring(0,cats.length-2)+' + 1 other category';
                }
            });

            // Reset categories
            rn.off('click').on('click',function(e){
                e.preventDefault();
                categories = [];
                filter();
                nla.prop("checked", false);
            });

            // Reset categories AND close categories menu
            $('#doneNav').off('click').on('click',function(e){
                e.preventDefault();
                categories = [];
                filter();
                $('#navListContainer').slideUp();
                nla.prop("checked", false);
            });

            // nvd3 method for dynamic rendering of chart on window resize
            nv.utils.windowResize (function () {
                var container = d3.select('#chart');
                var svg = container.select('svg');
                    var aspect = svg.attr("width") / svg.attr("height");
                    var targetWidth = parseInt(container.style('width'));
                    svg.attr("width", targetWidth);
                    svg.attr("height", Math.round(targetWidth / aspect));
                $('#chart').empty();
                scatter();

            });

        })();
    });
}

// Get the median of an array.
function median(values) {
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);

    if(values.length % 2)
        return values[half];
    else
        return (parseFloat(values[half-1]) + parseFloat(values[half])) / 2.0;
};

//Add 'thousands' commas to numbers, for extra prettiness
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function getOverlapMap(data){
    var tempMap = {},
        finalOverlapMap = {};
    $.each(data, function(index, value){
        var key = (value[globalConfigObj.TOTAL_VALUES] +','+ value[globalConfigObj.MEDIAN_VALUES]);
        if (key in finalOverlapMap){
            // no need to check in tempMap. add directly to finalOverlapMap
            finalOverlapMap[key].push(index);
        } else{
            // need to check in tempMap
            if(key in tempMap){
                //push the index value in tempMap
                tempMap[key].push(index);
                //add the tempMap array to finalMap
                finalOverlapMap[key] = tempMap[key];
                // delete the value from tempMap
                delete tempMap[key];
            } else {
                var overlapArray = [];
                overlapArray.push(index);
                tempMap[key] = overlapArray;
            }
        }

    });
    return finalOverlapMap;
}
// method to get tooltip content
function getOverlapToolTipContent(toolTipData){
    var OverlapToolTipContent = {},
        nameStr = "", categoryStr = "" ;
    $.each(toolTipData, function(k,v){
        nameStr += (v[globalConfigObj.TITLE_KEY]+", ");
        categoryStr += ", "+v[globalConfigObj.CATEGORY_KEY];
    });
};