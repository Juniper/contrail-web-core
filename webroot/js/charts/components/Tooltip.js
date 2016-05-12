/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * Tooltip class.
     */
    var Tooltip = function () {


        this._content = undefined;
        this._container = d3.select(document.body);
        this._contentContainer = undefined;
        this._offset = 15;
    }


    Tooltip.prototype.setContent = function (content) {

        this._content = content;
        return this;
    };


    Tooltip.prototype.setContainer = function (container) {

        this._container = container._container;
    };


    /**
     * @public
     * @param {Number} x
     * @param {Number} y
     */
    Tooltip.prototype.show = function (x, y) {
        /*
         * Append hidden tooltip element.
         */
        this._contentContainer = this._container.append("div")
            .attr("class", "coCharts-tooltip")
            .style('visibility', 'hidden')
            .html(this._content);
        /*
         * Get element position/size.
         */
        var dimension = this._contentContainer.node().getBoundingClientRect();
        /*
         * Shift coordinates according with element size.
         */
        y += dimension.height / 2;
        x += this._offset;
        /*
         * Set coordinates.
         */
        this._contentContainer.style('left', x + 'px')
            .style('top', y + 'px');
        /*
         * Get element position/size again after positioning.
         */
        dimension = this._contentContainer.node().getBoundingClientRect();
        /*
         * Check window width violence and fix x coordinate id required.
         */
        if (dimension.right > document.body.clientWidth) {
            this._contentContainer.style('left', x - (this._offset * 2 + dimension.width) + 'px');
        }
        /*
         * Show tooltip.
         */
        this._contentContainer.style('visibility', 'visible');
    };


    Tooltip.prototype.hide = function () {

        if (this._contentContainer) {
            this._contentContainer.remove();
            this._contentContainer = undefined;
        }
    };
    
    return Tooltip;
});