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


    Tooltip.prototype.show = function (x, y) {

        this._contentContainer = this._container.append("div")
            .attr("class", "contrailD3-tooltip");

        this._contentContainer.html(this._content)
            .style('visibility', 'hidden');

        var svgDimension = this._container.node().getBoundingClientRect(),
            dimension = this._contentContainer.node().getBoundingClientRect();
        
        y = y - (dimension.height / 2) - (svgDimension.height / 2);
        
        if (x + dimension.width > document.body.clientWidth) {
            x -= this._offset + (2 * dimension.width);
        } else {
            x += this._offset - (dimension.width / 2);
        }

        this._contentContainer.style('visibility', 'visible')
            .style('top', y + 'px')
            .style('left', x + 'px');
    };


    Tooltip.prototype.hide = function () {

        if (this._contentContainer) {
            this._contentContainer.remove();
            this._contentContainer = undefined;
        }
    };
    
    return Tooltip;
});