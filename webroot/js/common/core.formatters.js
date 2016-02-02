/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
    var CoreFormatters = function () {
        var self = this;

        this.format = {
            'number': function (value, options) {
                var defaultOptions = {formatSpecifier: ',d'},
                    options = _.extend(defaultOptions, options);

                return d3.format(options.formatSpecifier)(value)
            },
            'date': function (value, options) {
                var defaultOptions = {formatSpecifier: 'llll'},
                    options = _.extend(defaultOptions, options);

                return moment(parseInt(value)).format(options.formatSpecifier)
            },
            'micro-date': function (value, options) {
                var defaultOptions = {formatSpecifier: 'YYYY-MM-DD HH:mm:ss:SSS'},
                    options = _.extend(defaultOptions, options);

                if(value == null || value == 0 || value == '') {
                    return ''
                } else {
                    return self.format.date(value / 1000, options)
                        + ':' + ((value % 1000 === 0) ? '0' : value % 1000);
                }
            },
            'percentage': function (value, options) {
                return value + " %";
            },
            'length': function (value, options) {
                return value.length;
            },
            'byte': function (value, options) {
                var defaultOptions = {valueFormat: 'B'},
                    options = _.extend(defaultOptions, options),
                    byteIndex = cowc.BYTE_PREFIX.indexOf(options.valueFormat);

                value = (byteIndex > 0) ? value * (Math.pow(1024,byteIndex)) : value

                return cowu.addUnits2Bytes(value);
            },
            'kilo-byte': function (value, options) {
                return cowu.addUnits2Bytes(value * 1024);
            },
            'mega-byte': function (value, options) {
                return cowu.addUnits2Bytes(value * 1024 * 1024);
            },
            'time-period': function (value, options) {
                var timeValue = parseInt(value),
                    timeStr = '';

                if (timeValue === -1) {
                    timeStr = '-';
                } else {
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
                }

                return timeStr;
            },
            'query-time-range': function (value, options) {
                return qewu.formatTimeRange(value);
            },
            'query-direction': function (value, options) {
                return (value == 0) ? 'EGRESS' : 'INGRESS';
            },
            'protocol': function (value, options) {
                return getProtocolName(value)
            }
        };

        this.getFormattedValue = function (formatterKey, value, options) {
            if (!contrail.checkIfExist(value)) {
                return '';
            } else if (contrail.checkIfFunction(formatterKey)) {
                return formatterKey(value, options);
            } else if (contrail.checkIfExist(this.format[formatterKey])) {
                return this.format[formatterKey](value, options);
            } else {
                var obj = contrail.checkIfExist(options) ? options.obj : null,
                    iconClass = contrail.checkIfExist(options) ? options.iconClass : null,
                    key = contrail.checkIfExist(options) ? options.key : null;

                switch (formatterKey) {

                    case 'throughput' :
                        return formatThroughput(value);
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
                        var iconClass = options.iconClass,
                            iconHTML = (contrail.checkIfExist(iconClass) ?
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
                        if (contrail.checkIfFunction(eval(formatterKey))) {
                            return eval(formatterKey)(value, obj, iconClass, key);
                        } else {
                            //Reg Ex to display comma separated numbers
                            return value;
                        }
                };
            }
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
                case 'percentage' :
                    return function(d) { return d + ' %'; }
                    break;

                default: return function(d) { return d; }
            }
        };

        this.formatElementName = function(options) {
            var elementNameTemplate = contrail.getTemplate4Id(cowc.TMPL_ELEMENT_NAME);

            return elementNameTemplate(options);
        };
    };
    return CoreFormatters;
});
