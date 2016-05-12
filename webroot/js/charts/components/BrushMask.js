/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * Brush mask component.
     * @public
     * @constructor
     * @param {Function} brush - instance of d3.svg.brush()
     * @param {Selection} container - SVG <g/> element
     */
    var BrushMask = function(brush, container) {
        /*
         * Stash input values.
         */
        this._brush = brush;
        this._container = container;
        /*
         * Find brush background rectangle. Will use it as width/height template.
         */
        this._template = this._container.select('.background');
        /*
         * Get brush height.
         */
        var height = this._template.attr('height');
        /*
         * Create handles.
         */
        var arc = d3.svg.arc()
            .outerRadius(height / 4.5)
            .startAngle(0)
            .endAngle(function(d, i) {
                return i ? -Math.PI : Math.PI;
            });
        /*
         * Append handles to the brush.
         */
        this._container.selectAll('.resize')
            .append('path')
            .attr('transform', 'translate(0,' +  height / 2 + ')')
            .style('fill', 'lightgrey')
            .style('fill-opacity', 1)
            .attr('d', arc);
    }


    /**
     * Remove mask.
     * @public
     */
    BrushMask.prototype.remove = function() {

        this._container.selectAll('.brush-mask').remove();
    };


    /**
     * Update mask position.
     * @public
     */
    BrushMask.prototype.update = function() {
        /*
         * Check brush is empty and remove mask if true. And break.
         */
        if (this._brush.empty()) {
            return this.remove();
        }
        /*
         * Get brush extent.
         */
        var extent = this._brush.extent();
        /*
         * Get brush x scale.
         */
        var xScale = this._brush.x();
        /*
         * Convert brush extent boundaries into pixel values.
         */
        var min = xScale(extent[0]);
        var max = xScale(extent[1]);
        /*
         * Get brush surface dimension.
         */
        var width  = this._template.attr('width');
        var height = this._template.attr('height');
        /*
         * Do mask selection with data and key function.
         */
        var mask = this._container.selectAll('.brush-mask')
            .data([[0, min], [max, width]], function(d, i) {
                return i;
            });
        /*
         * Initialize mask rectangles.
         */
        mask.enter()
            .insert('rect', ':first-child')
            .attr('class', 'brush-mask')
            .attr('x', function(d) {
                return d[0];
            }).attr('y', 0)
            .attr('width', function(d, i) {
                if (i === 0) {
                    return d[1];
                } else {
                    return width - d[0];
                }
            }).attr('height', height)
            .style('fill', 'white')
            .style('fill-opacity', 0.7);
        /*
         * Update mask rectangles.
         */
        mask.attr('x', function(d) {
                return d[0];
            }).attr('width', function(d, i) {
                if (i === 0) {
                    return d[1];
                } else {
                    return width - d[0];
                }
            });
    };

    return BrushMask;
});