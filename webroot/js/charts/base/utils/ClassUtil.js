/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * Classes utility.
     * @public
     * @constructor
     */
    var ClassUtil = function () {

    }


    /**
     * Is component?
     * @public
     * @param {Object} obj
     * @returns {Boolean}
     */
    ClassUtil.prototype.isComponent = function (obj) {

        return obj.getClassName().split(".").slice(0, 2).join(".") == "coCharts.components";
    };


    /**
     * Get option setter method [name].
     * If second parameter is provided function will returned.
     * Otherwise will return string - name of the setter function.
     * @public
     * @param {String} option
     * @param {Object} obj
     * @returns {String|Function}
     */
    ClassUtil.prototype.getSetter = function (option, obj) {

        var setter = "set" + option;

        if (obj) {
            return obj[setter];
        } else {
            return setter;
        }
    };


    /**
     * Get class by chart short name.
     * For instance will return "coCharts.chart.BarChart" function
     * for type "bar" and namespace "charts".
     * @public
     * @param {String} type
     * @param {String} namespace
     * @returns {Function}
     */
    ClassUtil.prototype.getClassByType = function (type, namespace) {

        var type = type.slice(0, 1).toUpperCase() + type.slice(1).toLowerCase();

        var className;
        if (namespace == "charts") {
            className = "coCharts." + type + "Chart";
        } else if (namespace == "components") {
            className = "coCharts." + namespace + "." + type;
        } else {
            throw new Error("Unexpected namespace");
        }

        return this.getClassByName(className);
    };


    /**
     * Get class by name.
     * @public
     * @param {String} className
     * @returns {Function}
     */
    ClassUtil.prototype.getClassByName = function (className) {
        /*
         * Split className string by period and remove first "coCharts" element.
         */
        var parts = className.split(".").slice(1);
        /*
         * Set up namespace container.
         */
        var namespace = coCharts;
        /*
         * Loop over namespace chain.
         */
        for (var i = 0; i < parts.length; i++) {

            var part = parts[i];
            if (part in namespace) {
                namespace = namespace[part];
            }
        }
        /*
         * Return class function.
         */
        return namespace;
    };
    
    return ClassUtil;
});
