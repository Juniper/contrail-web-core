/**
 * Tooltip class.
 */
contrailD3.components.Tooltip = function() {


    this._content = undefined;
    this._container = undefined;
    this._offset = 15;
}


contrailD3.components.Tooltip.prototype.setContent = function(content) {

    this._content = content;
    return this;
};


contrailD3.components.Tooltip.prototype.show = function(x, y) {

    this._container = d3.select(document.body)
        .append("div")
        .attr("class", "contrail-tooltip");

    this._container.html(this._content)
        .style('visibility', 'hidden');

    var dimension = this._container.node().getBoundingClientRect();

    y = y - (dimension.height / 2);

    if (x + dimension.width > document.body.clientWidth) {
        x -= this._offset + dimension.width;
    } else {
        x += this._offset;
    }

    this._container.style('visibility', 'visible')
        .style('top', y + 'px')
        .style('left', x + 'px');
};


contrailD3.components.Tooltip.prototype.hide = function() {

    if (this._container) {
        this._container.remove();
        this._container = undefined;
    }
};