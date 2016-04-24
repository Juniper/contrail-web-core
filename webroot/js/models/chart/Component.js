/**
 * Contrail component abstract class.
 * @public
 * @constructor
 */
contrailD3.Component = function() {

    this._container = undefined;
    this._color = undefined;
}


/**
 * Set color.
 * May carry different meanings depends on component type.
 * @public
 * @param {String} height
 * @returns {contrailD3.Chart}
 */
contrailD3.Component.prototype.setColor = function(color) {

    this._color = color;
    return this;
};


/**
 * Get chart color.
 * @public
 * @returns {String}
 */
contrailD3.Component.prototype.getColor = function() {

    return this._color;
};


/**
 * Resize component.
 * @protected
 */
contrailD3.Component.prototype._resize = function(container) {

    throw new Error("contrailD3.Component._resize() not implemented");
};


/**
 * Render component.
 * @protected
 * @param {Selection} container
 */
contrailD3.Component.prototype._render = function(container) {

    throw new Error("contrailD3.Component._render() not implemented");
};


/**
 * Remove component.
 * @protected
 * @param {Selection} container
 */
contrailD3.Component.prototype._remove = function(container) {

    container.selectAll("*").remove();
};


contrailD3.Component.prototype.setContainer = function(container) {

    this._container = container;
};


/**
 * Get object class name.
 * @public
 * @returns {String}
 */
contrailD3.Component.prototype.getClassName = function() {

    throw new Error("contrailD3.Chart.getClassName() not implemented.")
};