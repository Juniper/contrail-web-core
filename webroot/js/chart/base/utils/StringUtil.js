/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {

    /**
     * String utility class.
     */
    var StringUtil = function () {

    }


    /**
     * Uppercase first letter of the string.
     * @param {String} str
     * @returns {String}
     */
    StringUtil.prototype.ucFirst = function (str) {

        return str.slice(0, 1).toUpperCase() + str.slice(1);
    };


    /**
     * Generate unique string by pattern.
     * See http://stackoverflow.com/a/2117523/1191125
     * @private
     * @param {String} pattern
     * @returns {String}
     */
    StringUtil.prototype.getUniqueId = function (pattern) {

        pattern = pattern || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    
    return StringUtil;
});
