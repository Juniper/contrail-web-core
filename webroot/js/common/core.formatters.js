/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreFormatters = function () {
        var self = this;
        this.getTextGenerator = function (templateGeneratorConfig, key, obj) {
            var formatterKey = templateGeneratorConfig.formatter,
                value = cowu.getJSONValueByPath(key, obj);

            return self.getFormattedValue(formatterKey, value, templateGeneratorConfig.iconClass, obj, key);
        };

        this.getFormattedValue = function (formatterKey, value, iconClass, obj, key) {
            switch (formatterKey) {
                case 'byte' :
                    return cowu.addUnits2Bytes(value);
                    break;

                case 'kilo-byte' :
                    return cowu.addUnits2Bytes(value * 1024);
                    break;

                case 'mega-byte' :
                    return cowu.addUnits2Bytes(value * 1024 * 1024);
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

                case 'date-time' :
                    return moment(parseInt(value)).format('YYYY-MM-DD HH:mm:ss');
                    break;

                case 'time-period' :
                    var timeValue = parseInt(value),
                        timeStr = '';

                    if (value >= 3600) {
                        var days = parseInt(timeValue / 3600);
                        timeStr += days.toString();
                        timeStr += (days === 1) ? ' day ' : ' days ';
                        timeValue = timeValue % 3600;
                    }

                    if (timeValue >= 60) {
                        var mins = parseInt(timeValue / 60);
                        timeStr += mins.toString();
                        timeStr += (mins === 1) ? ' min ' : ' mins ';
                        timeValue = timeValue % 60;
                    }

                    if (value > 0) {
                        var secs = timeValue;
                        timeStr += secs.toString();
                        timeStr += (secs === 1) ? ' sec' : ' secs';
                    }

                    return timeStr;

                    break;

                case 'fault-state' :
                    if (value === true || value === 'true') {
                        return '<span class="red">' + value + '</span>';
                    } else {
                        return value
                    }
                    break;

                case 'status-state' :
                    if (value === 'ok') {
                        return '<span class="green">' + value + '</span>';
                    } else {
                        return value
                    }

                    break;

                case 'health-status-state' :
                    var iconHTML = (contrail.checkIfExist(iconClass) ?
                    '<i class="' + iconClass + ' pull-right padding-3-0"></i>' : '');

                    if (value === 'critical') {
                        return '<span class="red ' + key + '-value">'
                            + value + iconHTML +
                            '</span>';
                    } else if (value === 'ok') {
                        return '<span class="green">' + value + '</span>';
                    } else {
                        return value
                    }

                    break;

                case 'storage-health-status-state' :
                    var iconHTML = (contrail.checkIfExist(iconClass) ?
                    '<i class="' + iconClass + ' pull-right padding-3-0"></i>' : '');
                    if (value === 'critical') {
                        return '<span class="red ' + key + '-value"> style="font-size: x-large;">'
                            + value + iconHTML +
                            '</span>';
                    } else  if (value === 'warn') {
                        return '<span style="font-size: x-large; color: orange;">'
                            + value + iconHTML +
                            '</span>';
                    } else if (value === 'ok') {
                        return '<span class="green" style="font-size: x-large">' + value + '</span>';
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

                case 'packet' :
                    return cowu.addUnits2Packets(value);
                    break;

                //run the user defined formatter function
                default :
                    return eval(formatterKey)(value, obj, iconClass, key);
            };
        };

        this.formatValueArray4Grid = function (valueArray, entriesToShow) {
            var formattedStr = '',
                entriesToShow = (entriesToShow == null) ? 2 : entriesToShow;

            if (valueArray == null) {
                return formattedStr;
            }

            $.each(valueArray, function (idx, value) {
                if (idx == 0) {
                    formattedStr += value;
                } else if (idx < entriesToShow) {
                    formattedStr += '<br/>' + value;
                } else {
                    return;
                }
            });

            if (valueArray.length > 2) {
                formattedStr += '<br/>' + contrail.format('({0} more)', valueArray.length - entriesToShow);
            }

            return ((formattedStr == '') ? '-' : formattedStr);
        };

        this.getYAxisFormatterFunction4Chart = function(formatterKey) {
            switch (formatterKey) {
                case 'bytes' :
                    return function(d) { return cowu.addUnits2Bytes(d, false, false, 1); }
                    break;

                default: return function(d) { return d; }
            }
        };
    };
    return CoreFormatters;
});
