/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * Configuration class.
     * @public
     * @constructor
     */
    var ConfigUtil = function (options) {
        /**
         * @private
         * @member {Object}
         */
        this._options = options;
    }


    /**
     * Get original options.
     * @public
     * @return {Object}
     */
    ConfigUtil.prototype.getOptions = function () {

        return this._options;
    };


    /**
     * Find and filter set of options.
     * @public
     * @param {String} where - path to set of options
     * @param {String} what - option name used for comparison
     * @param {Funcion} filter - filter function
     * @param {String} [appendAs] - add option set key as
     */
    ConfigUtil.prototype.find = function (where, what, filter, appendAs) {

        var result = [];

        if (!this.has(where)) {
            return result;
        }

        var data = this.get(where);
        for (var i in data) {
            if (filter.call(undefined, data[i][what])) {
                var option = data[i];

                if (appendAs) {
                    option[appendAs] = i;
                }

                result.push(option)
            }
        }
        ;

        return result;
    };


    /**
     * Check if option name is accessor.
     * @param {String} option
     * @returns {Boolean}
     */
    ConfigUtil.prototype.isAccessor = function (option) {

        return option.endsWith("Accessor");
    };


    /**
     * Check if option name is label.
     * @param {String} option
     * @returns {Boolean}
     */
    ConfigUtil.prototype.isLabel = function (option) {

        return option.endsWith("Label");
    };


    ConfigUtil.prototype.set = function (option, optionValue) {

        var parts = option.split(".");
        var options = this._options;

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (i == parts.length - 1) {
                options[part] = optionValue;
            } else if (!(part in options)) {
                options[part] = {};
            } else {
                options = options[part];
            }
        }
    };


    /**
     * Get option value.
     * @public
     * @param {String} option
     * @param {Mixed} defaultValue
     * @returns {Mixed}
     */
    ConfigUtil.prototype.get = function (option, defaultValue) {

        var value = this._options;
        var parts = option.split(".");

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (value[part] === undefined) {
                return defaultValue;
            } else {
                value = value[part];
            }
        }
        ;

        return value;
    };
    
    /**
     * Check if config has option.
     * @public
     * @param {String} option
     * @returns {Boolean}
     */
    ConfigUtil.prototype.has = function (option) {

        var value = this._options;
        var parts = option.split(".");

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            if (value[part] === undefined) {
                return false;
            } else {
                value = value[part];
            }
        }
        ;

        return true;
    };
    
    return ConfigUtil;
});