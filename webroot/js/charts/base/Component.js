/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * Contrail component abstract class.
     * @public
     * @constructor
     */
    var Component = function () {

        this._container = undefined;
        this._color = undefined;
    }


    /**
     * Set color.
     * May carry different meanings depends on component type.
     * @public
     * @param {String} height
     * @returns {coCharts.Chart}
     */
    Component.prototype.setColor = function (color) {

        this._color = color;
        return this;
    };


    /**
     * Get chart color.
     * @public
     * @returns {String}
     */
    Component.prototype.getColor = function () {

        return this._color;
    };


    /**
     * Resize component.
     * @protected
     */
    Component.prototype._resize = function (container) {

        throw new Error("coCharts.Component._resize() not implemented");
    };


    /**
     * Render component.
     * @protected
     * @param {Selection} container
     */
    Component.prototype._render = function (container) {

        throw new Error("coCharts.Component._render() not implemented");
    };


    /**
     * Remove component.
     * @protected
     * @param {Selection} container
     */
    Component.prototype._remove = function (container) {

        container.selectAll("*").remove();
    };


    Component.prototype.setContainer = function (container) {

        this._container = container;
    };


    /**
     * Get object class name.
     * @public
     * @returns {String}
     */
    Component.prototype.getClassName = function () {

        throw new Error("coCharts.Chart.getClassName() not implemented.")
    };
    
    return Component;
});