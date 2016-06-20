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

                // As we lazyload d3 don't use d3 for simple formatting
                // return d3.format(options.formatSpecifier)(value)
                return value.toLocaleString();
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
                return cowu.formatTimeRange(value);
            },
            'query-direction': function (value, options) {
                return (value == 0) ? 'EGRESS' : 'INGRESS';
            },
            'protocol': function (value, options) {
                return getProtocolName(value)
            },
            'xml2json': function (value, options) {
                var jsonValue = null;
                if (contrail.checkIfExist(options['dataObject']) && contrail.checkIfExist(options['jsonValuePath'])) {
                    var dataObject = options['dataObject'],
                        jsonValuePath = options['jsonValuePath'];

                    jsonValue = dataObject[jsonValuePath];
                }

                if (_.isString(value) && !$.isPlainObject(jsonValue)) {
                     return cowu.formatXML2JSON(value);
                }

                return jsonValue;
            },
            'status-boolean': function (value, options) {
                if (value === true || value === 'true') {
                    return '<span><i class="icon-circle green"></i> &nbsp;' + value + '</span>';
                } else {
                    return '<span><i class="icon-circle red"/> &nbsp;' + value + '</span>';
                }
            },
            'json2html': function (value, options) {
                var htmlValue = null, jsonValue = null,
                    expandLevel = contrail.checkIfExist(options.expandLevel) ? options.expandLevel : 1;

                if (contrail.checkIfExist(options['dataObject']) && contrail.checkIfExist(options['htmlValuePath'])) {
                    var dataObject = options['dataObject'],
                        htmlValuePath = options['htmlValuePath'],
                        jsonValuePath = options['jsonValuePath'];

                    if (contrail.checkIfExist(jsonValuePath)) {
                        value = dataObject[jsonValuePath];
                    }

                    htmlValue = dataObject[htmlValuePath];
                }

                if ($.isPlainObject(value) && !_.isString(htmlValue)) {
                    return '<pre class="json-html-viewer">' + cowu.constructJsonHtmlViewer(value, expandLevel, 0, options.ignoreKeys)+ '</pre>'
                }

                return htmlValue;
            },
            'nameFromFQName': function (value, options) {
                var name = "-";
                if (value.length >= 3) {
                    name = value[2];
                }
                return name;
            },
            'policyRules': function (value, options) {
                var policyRule = getValueByJsonPath(value,
                    "network_policy_entries;policy_rule", []);
                return policyRule;

            },
            'associatedNetworks': function (value, options) {
                var returnArray = [], returnString = "";
                if (options && !contrail.checkIfExist(options.linkGenerator)) {
                    options = {};
                    options['linkGenerator'] = false;
                }
                if (value.length > 0) {
                    var vnLen = value.length;
                    for (var i = 0; i < vnLen; i++) {
                        var network_to = getValueByJsonPath(value[i], "to", []);
                        if (network_to.length >= 2) {
                            if (options.linkGenerator) {
                                returnArray.push(network_to.join(':'))
                            } else {
                                returnString += network_to.join(':');
                                if (i != vnLen - 1) {
                                    returnString += ', ';
                                }
                            }
                        }
                    }
                }
                return (options.linkGenerator) ? returnArray : returnString;
            },
            'dnsMethod': function (value, option) {
                var retValue = "",
                    ipamDNS = option.obj.network_ipam_mgmt.ipam_dns_server;
                if (value == "tenant-dns-server") {
                    retValue += "Tenant Managed DNS: ";
                    var ipAddress = (contrail.checkIfExist(ipamDNS.tenant_dns_server_address.ip_address)) ? ipamDNS.tenant_dns_server_address.ip_address : [];
                    if (ipAddress.length > 0) {
                        $.each(ipAddress, function (idx, ip) {
                            retValue += ip;
                            if (idx != ipAddress.length - 1) {
                                retValue += ', ';
                            }
                        });
                    }
                } else if (value == "virtual-dns-server") {
                    retValue += "Virtual DNS: " + ipamDNS.virtual_dns_server_name;
                } else {
                    retValue = value;
                }
                return retValue;
            },
            'NTPServerIPFromDHCPOption': function (value, options) {
                var retValue = "",
                    dhcpOption = (contrail.checkIfExist(value.dhcp_option)) ? value.dhcp_option : [];
                if (dhcpOption.length > 0) {
                    $.each(dhcpOption, function (idx, dhcp) {
                        if (dhcp.dhcp_option_name == "4") {
                            if (retValue != "") retValue += ", ";
                            retValue += dhcp.dhcp_option_value;
                        }
                    });
                } else {
                    retValue = "-";
                }
                return retValue;
            },
            'domainNameFromDHCPOption': function (value, options) {
                var retValue = "",
                    dhcpOption = (contrail.checkIfExist(value.dhcp_option)) ? value.dhcp_option : [];
                if (dhcpOption.length > 0) {
                    $.each(dhcpOption, function (idx, dhcp) {
                        if (dhcp.dhcp_option_name == "15") {
                            if (retValue != "") retValue += ", ";
                            retValue += dhcp.dhcp_option_value;
                        }
                    });
                } else {
                    retValue = "-";
                }
                return retValue;
            }
        };

        this.getFormattedValue = function (formatterKey, value, options) {
            if (!contrail.checkIfExist(value)) {
                return '';
            } else if (contrail.checkIfFunction(formatterKey)) {
                return formatterKey(value, options);
            } else if (_.isArray(formatterKey)) {
                var formattedValue = value;
                $.each(formatterKey, function(formatIndex, formatObj){
                    formattedValue = self.getFormattedValue(formatObj.format, formattedValue, formatObj.options);
                });
                return formattedValue;
            } else if (contrail.checkIfExist(this.format[formatterKey])) {
                return this.format[formatterKey](value, options);
            }
            // if formatterKey is not defined then return stringified object
            // else we will eval the formatterKey
            else if ((_.isObject(value)) && (formatterKey === undefined)) {
                return JSON.stringify(value);
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

