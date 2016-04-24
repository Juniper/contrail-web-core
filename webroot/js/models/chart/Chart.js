/**
 * Contrail chart abstract class.
 * @public
 * @constructor
 */
contrailD3.Chart = function() {
    /**
     * @private
     * @member {Object[]}
     */
    this._data = undefined;
}


contrailD3.Chart.prototype = Object.create(contrailD3.Component.prototype);


/**
 * Update chart.
 * @private
 * @param {Selection} container
 * @param {Object[]} data
 */
contrailD3.Chart.prototype._update = function(container, data) {

    throw new Error("contrailD3.Chart._update() not implemented");
};


/**
 * Set chart data.
 * @public
 * @param {Object[]} data
 */
contrailD3.Chart.prototype.setData = function(data) {
    /*
     * Clone data to prevent it from modifications be reference.
     */
    this._data = data.slice(0);
};


/**
 * Get width.
 * @public
 * @returns {Number}
 */
contrailD3.Chart.prototype.getWidth = function() {

    return this._width;
};


/**
 * Get chart data.
 * @public
 * @returns {Object[]}
 */
contrailD3.Chart.prototype.getData = function() {

    return this._data;
};


/**
 * Check chart data is defined.
 * @public
 * @returns {Boolean}
 */
contrailD3.Chart.prototype.hasData = function() {

    return this._data !== undefined;
};