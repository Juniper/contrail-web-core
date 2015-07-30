/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreFormatters = function () {
        var self = this;
        this.getTextGenerator = function (formatterKey, value, obj) {
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

                case 'packet' :
                    return cowu.addUnits2Packets(value);
                    break;
            
                //run the user defined formatter function
                default : return eval(formatterKey)(value,obj);
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
    };
    return CoreFormatters;
});
