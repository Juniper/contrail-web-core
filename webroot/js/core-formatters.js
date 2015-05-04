/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreFormatters = function () {
        var self = this;
        this.getTextGenerator = function (formatterKey, value) {
            switch (formatterKey) {
                case 'byte' :
                    return formatBytes(value);
                    break;

                case 'kilo-byte' :
                    return formatBytes(value * 1024);
                    break;

                case 'mega-byte' :
                    return formatBytes(value * 1024 * 1024);
                    break;

                case 'length' :
                    return value.length;
                    break;

                case 'throughput' :
                    return formatThroughput(value);
                    break;

                case 'percentage' :
                    return value + " %";
                    break;

                case 'fault-state' :
                    if(value === true || value === 'true') {
                        return '<span class="red">' + value + '</span>';
                    } else {
                        return value
                    }
                    break;

                case 'status-state' :
                    if(value === 'ok') {
                        return '<span class="green">' + value + '</span>';
                    } else {
                        return value
                    }

                    break;

                case 'alert-percentage' :
                    try {
                        if (value != null && value > 90) {
                            return '<span class="red">' + value + ' %</span>';
                        } else {
                            return value + " %";
                        }
                    } catch (error) {
                        return value;
                    }
                    break;
            };
        };
    };
    return CoreFormatters;
});
