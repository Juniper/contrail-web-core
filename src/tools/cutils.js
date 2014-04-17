/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

//Common utility functions
cutils = module.exports;
g = require('./global')

function getCookie(name) {
	if(isSet(name) && isString(name)) {
	    var cookies = document.cookie.split(";");
	    for (var i = 0; i < cookies.length; i++) {
	        var x = cookies[i].substr(0, cookies[i].indexOf("="));
	        var y = cookies[i].substr(cookies[i].indexOf("=") + 1);
	        x = x.replace(/^s+|s+$/g, "").trim();
	        if (x == name)
	            return unescape(y);
	    }
	}
    return false;
}

function setCookie(name, value) {
    document.cookie = name + "=" + escape(value) + "; expires=Sun, 17 Jan 2038 00:00:00 UTC; path=/"
}

var class_A = 1;
var class_B = 2;
var class_C = 3;

function isSet(o) {
    if (typeof o == "undefined" || null == o)
        return false;
    else if (isString(o)) {
        return ("" !== o.trim())
    }
    else if (isNumber(o))
        return true;
    else if (isObject(o)) {
        return true;
    }
}

function isObject(o) {
    return (typeof o === "object");
}

function isNumber(o) {
    return !isNaN(o - 0);
}

function isString(o) {
    return (typeof o === "string");
}

function pad(num, size) {
    var s = g.UNIQUE_ID_PADDING + num;
    return s.substr(s.length - size);
}

function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isnt supported.");
}

function doAjaxCall(targetUrl, methodType, postData, successHandler, failureHandler, cacheEnabled, callbackParams, timeOut, hideErrMsg,abortCall) {
    var url = targetUrl, type = methodType, cache = cacheEnabled,
        success = successHandler, failure = failureHandler, data = postData,
        cbParams = callbackParams, headers = {}, timeout = timeOut, hideErrorMsg = hideErrMsg;
    headers["X-Tenant-Name"] = "default-project";
    var contentType = null, dataType = null;
    if (isSet(url)) {
        if (isSet(type)) {
            var type = type.trim();
            if (type !== "GET" && type !== "POST" && type !== "DELETE" &&
                type !== "PUT") {
                type = "GET";
            }
            if (type === "POST" || type === "PUT" || type === "DELETE") {
                headers["X-Tenant-Name"] = "default-project";
                if (!isSet(data)) {
                    data = "{}";
                }
                contentType = "application/json; charset=utf-8";
                dataType = "json";
            }
        } else {
        	type = "GET";
        }
        if (isSet(cache)) {
            if (cache === "true" || cache === true)
                cache = true;
            else if (cache === "false" || cache === false)
                cache = false;
        }
        else {
            cache = false;
        }
        if (!isSet(success)) {
            success = "";
        }
        if (!isSet(failure)) {
            failure = "";
        }

        var config = {
            type:type,
            cache:cache,
            url:url,
            data:data,
            headers:headers,
            abortOnNavigate:abortCall
        };
        if (isSet(contentType))
            config.contentType = contentType;
        if (isSet(dataType))
            config.dataType = dataType;

        if(isSet(timeout) && isNumber(timeout) && timeout > 0) {
        	config.timeout = timeout;
        }
        $.ajax(config)
            .success(function (res) {
                configObj = $.extend({}, configObj, res);
                if (typeof window[success] === "function")
                    window[success](res, cbParams);
            })
            .fail(function (res) {
                if(hideErrorMsg !== "true" && hideErrorMsg !== true) {
                    if(res.responseText && res.responseText != "") {
                        showInfoWindow(res.responseText, res.statusText);
                    }
                }
                console.log("Error in getting/submitting data");
                if (typeof window[failure] === "function")
                    window[failure](res, cbParams);
            });
    }
    else 
    	return false;
}

function toggleButtonStateByID(id, enable) {
    var btn = $("#" + id);
    if (isSet(btn) && btn.length > 0) {
        if (enable === true) {
            $("#" + id)[0].disabled = false;
            $("#" + id).removeClass("disabled");
        } else {
            $("#" + id)[0].disabled = true;
            $("#" + id).addClass("disabled");
        }
    }
}

function removeRTString(rt) {
    if (isSet(rt) && rt.indexOf("target:") != -1) {
        return rt.split("target:")[1];
    }
    return rt;
}

function formatPolicyRule(rule, domain, project) {
    var rule_display = "";
    if (isSet(rule) && !rule.hasOwnProperty("length")) {
        if (isSet(rule["action_list"]) && isSet(rule["action_list"]["simple_action"]))
            rule_display += rule["action_list"]["simple_action"];

        if (isSet(rule["application"]) && rule["application"].length > 0) {
            rule_display += " application " + rule["application"].toString();
            var src_addr = policy_net_display(rule["src_addresses"], domain, project); 
            if(isSet(src_addr))
                rule_display += " network " + src_addr;
            if(isSet(rule["direction"]))
            	rule_display += " " + rule["direction"];
            var dest_addr = policy_net_display(rule["dst_addresses"], domain, project);
            if(isSet(dest_addr))
            	rule_display += " network " + dest_addr;
            if (isSet(rule["action_list"]))
                rule_display += " action " + rule["action_list"].toString();
        } else {
        	if(null !== rule["simple_action"] && typeof rule["simple_action"] !== "undefined")
        	    rule_display += rule["simple_action"];
            if (isSet(rule["protocol"]))
                rule_display += " protocol " + rule["protocol"].toString();
            
            var src_addr = policy_net_display(rule["src_addresses"], domain, project); 
            if(isSet(src_addr))
                rule_display += " network " + src_addr;

            var src_ports = policy_ports_display(rule["src_ports"]); 
            if(isSet(src_ports))
                rule_display += src_ports;

            if(isSet(rule["direction"]))
            	rule_display += " " + rule["direction"];

            var dest_addr = policy_net_display(rule["dst_addresses"], domain, project); 
            if(isSet(dest_addr))
                rule_display += " network " + dest_addr;

            var dst_ports = policy_ports_display(rule["dst_ports"]); 
            if(isSet(dst_ports))
                rule_display += dst_ports;

            var action_list = policy_services_display(rule["action_list"]); 
            if(isSet(action_list))
                rule_display += action_list;
        }
    }
    return rule_display;
}

function policy_net_display(nets, domain, project) {
    var net_disp_all = "";
    if (isSet(nets) && nets.length > 0) {
        for (var i = 0; i < nets.length; i++) {
            var net_disp = "";
            var net = nets[i];
            if (isSet(net)) {
                if (isSet(net["security_group"]))
                    net_disp += net["security_group"].toString();
                if (isSet(net["subnet"]) && isSet(net["subnet"]["ip_prefix"]) &&
                    isSet(net["subnet"]["ip_prefix_len"]))
                    net_disp +=
                        net["subnet"]["ip_prefix"] + "/" +
                            net["subnet"]["ip_prefix_len"];
                if (isSet(net["virtual_network"])) {
                	if(isSet(domain) && isSet(project) && isString(domain) &&
                		isString(project)) {
                		var splits = net["virtual_network"].split(":");
                		if(domain === splits[0] && project === splits[1]) {
                			net_disp += splits[2];
                		} else {
                			net_disp += net["virtual_network"].toString();
                		}
                	} else {
                		net_disp += net["virtual_network"].toString();	
                	}
                }
            }
            net_disp_all += net_disp;
        }
    }
    return net_disp_all;
}

function policy_ports_display(ports) {
    var ports_str = "";
    if (isSet(ports) && ports.length > 0) {
        if (ports.length == 1 && ports[0]["start_port"] == -1) {
            ports_str += " port any";
        }
        else {
            ports_str += " port [";
            for (var i = 0; i < ports.length; i++) {
                var p = ports[i];
                if (isSet(p["start_port"])) {
                    ports_str += " " + p["start_port"].toString();

                    if (isSet(p["end_port"])) {
                        if (p["start_port"] !== p["end_port"]) {
                            ports_str += "-" + p["end_port"].toString();
                        }
                    }
                }
                if (i != (ports.length - 1)) {
                    ports_str += ",";
                }
            }
            ports_str = ports_str + " ]";
        }
    }
    return ports_str;
}

function policy_services_display(action_list) {
    var service_str = "";
    if (isSet(action_list)) {
        var as = action_list.apply_service;
        var mt = action_list.mirror_to;
        if (isSet(as) && as.length > 0) {
            service_str += " apply_service ";
            for (var i = 0; i < as.length; i++) {
                service_str += as[i];
                if (i != (as.length - 1)) {
                    service_str += ",";
                }
            }
        }
        if (isSet(mt) && isSet(mt.analyzer_name)) {
            service_str += " mirror_to " + mt.analyzer_name;
        }
    }
    return service_str;
}

function launchVNC(e, new_window) {
    var selects = getKendoGridForATable(getTableByID(e.id.split("_")[2])).tbody.children().find("a");
    var index = 0;
    for (var i = 0; i < selects.length; i++) {
        if (selects[i].id === e.id) {
            index = i;
            break;
        }
    }
    var table_data = getKendoGridForATable(getTableByID(e.id.split("_")[2])).dataSource.data();
    if (isSet(table_data) && table_data.length > 0) {
        index = Math.floor(index / 2);
    }

    table_data = getKendoGridForATable(getTableByID(e.id.split("_")[2])).dataSource.data()[index];

    var vmuuid = table_data.vmuuid;
    var project_uuid = that.getSelectedProject();
    var cbParams = {};
    cbParams.name = vmuuid;
    if (!isSet(new_window) || (isSet(new_window) && new_window === false)) {
        cbParams.new_window = false;
        var action_window = $("#div_window_launchvnc");
        if (!action_window.data("kendoWindow")) {
            action_window.kendoWindow({
                modal:true,
                width:"1350px",
                height:"730px",
                title:"VNC Console: " + vmuuid
            });
        }
        action_window.data("kendoWindow").center();
        action_window.data("kendoWindow").open();
    }
    else if (isSet(new_window) && new_window === true)
        cbParams.new_window = true;
    else
        cbParams.new_window = false;

    var url = "/api/tenants/config/service-instance-vm?project_id=" + project_uuid + "&vm_id=" + vmuuid;
    doAjaxCall(url, "GET", null, "launchVNCcb", "", false, cbParams);
}

function launchVNCcb(result, cbParams) {
    var href = jsonPath(result, "$.console.url")[0];
    if (cbParams.sameWindow) {
        $("#vnc-console-widget").show();
        if(cbParams.title) {
            $("#vnc-console-title").text(cbParams.title);
        }
        $("#vnc-console-frame").attr("src", href);
    } else {
        window.open(href);
    }
}

function failureLaunchVNCcb(error) {
    $("#vnc-console-widget").hide();
    $("#vnc-console-frame").attr("src", "");
    showInfoWindow("Error in getting url of VNC console: " + error.statusText, "Error");
}

function getFormatVNName(vn) {
    if (isSet(vn) && vn.length > 0) {
        if (vn.trim().toLowerCase() === "automatic") {
            return "";
        }
        return vn.trim();
    }
    return "";

}

function getApplyServices(arr) {
    if (isSet(arr) && arr.length > 0) {
        for (var i = 0; i < arr.length; i++) {
            arr[i] = arr[i].trim();
            var sis = jsonPath(configObj, "$..service_templates[*].service-template.service_instance_back_refs[*]");
            for (var j = 0; j < sis.length; j++) {
                var si = sis[j];
                if (si.to[2] == arr[i]) {
                    arr[i] = si.to[0] + ":" + si.to[1] + ":" + si.to[2];
                    break;
                }
            }
        }
        return arr;
    }
    return null;
}

function checkValidSourceNetwork(vn) {
    if (!isSet(vn)) {
        //showInfoWindow("Select valid source network", "Input required");
        return "any";
    }
    return vn;
}

function checkValidDestinationNetwork(vn) {
    if (!isSet(vn)) {
        //showInfoWindow("Select valid destination network", "Input required");
        return "any";
    }
    return vn;
}

function getProtocol(protocol) {
    return (isSet(protocol)) ? protocol.toLowerCase() : "any";
}

function getFQNofVN(domain, project, vn) {
	if(!isSet(domain) || !isSet(project)) {
		if(isSet(vn)) {
			return vn;
		} else {
			return null;
		}
	}
    var fqn = jsonPath(configObj, 
            "$..virtual-networks[?(@.fq_name[0]=='" + domain + 
            "' && @.fq_name[1]=='" + project + 
            "' && @.fq_name[2]=='" + vn + "')]");
    if (fqn && fqn.length == 1) {
        fqn = fqn[0].fq_name;
        fqn = (fqn.toString()).replace(/,/g, ":");
        return fqn;
    } else if (isSet(vn)) {
        return vn
    }
    return null;
}

function getEndPort(port) {
    if (isSet(port)) {
    	port = port.toString();
        if (port.trim().toLowerCase() == "any")
            return -1;
        else {
            if (port.indexOf(",") != -1) {
                var startports = [];
                var parts = port.split(",");
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (isSet(part.split("-")[1]))
                        startports[startports.length] = part.split("-")[1];
                    else {
                        if (isSet(part.split("-")[0])) {
                            startports[startports.length] =
                                part.split("-")[0];
                        }
                    }
                }
                return startports.toString();
            } else {
                var part = port.split("-")[1];
                if (isSet(part)) {
                    part = part.trim().toLowerCase();
                    return part;
                } else if (isSet(port.split("-")[0])) {
                    port = port.split("-")[0];
                    return port;
                }
            }
        }
    }
    return -1;
}

function getStartPort(port) {
    if (isSet(port)) {
        if (port.trim().toLowerCase() == "any")
            return -1;
        else {
            if (port.indexOf(",") != -1) {
                var startports = [];
                var parts = port.split(",");
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (isSet(part.split("-")[0]))
                        startports[startports.length] = part.split("-")[0];
                    else {
                        if (isSet(part.split("-")[1])) {
                            startports[startports.length] =
                                part.split("-")[1];
                        }
                    }
                }
                return startports.toString();
            } else {
                port = port.split("-")[0];
                if (isSet(port)) {
                    port = port.trim().toLowerCase();
                    return port;
                }
            }
        }
    }
    return -1;
}

function validip(ip) {
    if (null != ip && "" != ip) {
        ipsplit = ip.split("/");
        if (null != ipsplit && "" != ipsplit) {
            var regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/
            if (regex.test(ipsplit[0]) == true) {
                if (null != ipsplit[1] && "" != ipsplit[1]) {
                    try {
                        var subnet = parseInt(ipsplit[1]);
                        if (subnet >= 0 && subnet <= 32)
                            return true;
                        else
                            return false;
                    } catch (e) {
                        return false;
                    }
                }
                else {
                    return true;
                }
            }
            else {
                //invalid ip
                return false;
            }
        }
        else {
            return false;
        }
    }
    else {
        //blank input - throw error
        return false;
    }
    return false;
}

function convert_str_to_ip(ip_str) {
    var temp_ip_str = ip_str.trim();
    var ip_octet = "";
    var ip_int = 0;
    var ip_int = 0;
    var max_bits = 32;
    pos = temp_ip_str.indexOf('.');
    while (-1 != pos) {
        ip_octet = temp_ip_str.substr(0, pos);
        ip_int += (parseInt(ip_octet) << (max_bits - 8));
        max_bits -= 8;
        temp_ip_str = temp_ip_str.slice(pos + 1);
        pos = temp_ip_str.indexOf('.');
    }
    ip_int += (parseInt(temp_ip_str) << (max_bits - 8));
    return ip_int;
}

function get_subnet_mask(ip_str) {
    var pos = ip_str.indexOf('/');
    var subnet_mask = 0;
    if (-1 == pos) {
        return;
    }
    var mask = parseInt(ip_str.slice(pos + 1));

    for (var i = 1; i <= mask; i++) {
        subnet_mask += (1 << (32 - i));
    }
    return convert_ip_to_str(subnet_mask);

}

function convert_ip_to_str(ip_addr) {
    ip_addr = ip_addr;
    var ip_str = "";
    var max_bits = 32;
    while (max_bits > 0) {
        ip_str += ((ip_addr >> (max_bits - 8)) & 0xff);
        max_bits -= 8;
        if (max_bits) {
            ip_str += ".";
        }
    }
    return ip_str;
}

function ip_range_add(ip_str, ip_list) {

    var pos = ip_str.indexOf('-');
    var ip_str1 = ip_str.substr(0, pos);
    var ip_str2 = ip_str.slice(pos + 1);
    var ip_addr1 = convert_str_to_ip(ip_str1);
    var ip_addr2 = convert_str_to_ip(ip_str2);

    if (ip_addr2 < ip_addr1) {
        ip_list = "";
        alert("ip2 < ip1")
        return 0;
    }
    while (ip_addr1 <= ip_addr2) {
        /* Skip FF and 0 as 4th Octet */
        ip_fourth_octet = ip_addr1 & 0xFF;
        if (!(ip_fourth_octet) || (0xFF == ip_fourth_octet)) {
            ip_addr1++;
            continue;
        }
        ip_list.push(convert_ip_to_str(ip_addr1));
        ip_addr1++;
    }
    return 1;
}

function ip_range_with_mask(ip_str, ip_list) {
    var i;
    var ip_addr = 0;
    var subnet_mask = 0;
    var ip_addr_octet = [];
    var host_all_1s = 0;
    var subnet_octet = [];
    var pos = ip_str.indexOf('/');
    var mask = parseInt(ip_str.slice(pos + 1));
    var str = ip_str.substr(0, pos);
    var max_no_subnet = 0;
    var no_host = 0;
    var subnet_mask = 0;

    for (i = 1; i <= mask; i++) {
        subnet_mask += (1 << (32 - i));
    }

    ip_addr = convert_str_to_ip(str);
    ip_addr_octet[0] = (ip_addr >> 24) & 0xFF;
    ip_addr_octet[1] = (ip_addr >> 16) & 0xFF;
    ip_addr_octet[2] = (ip_addr >> 8) & 0xFF;
    ip_addr_octet[3] = (ip_addr >> 0) & 0xFF;

    var first_ip = subnet_mask && ip_addr;
    //console.log("first :", convert_ip_to_str(first_ip));
    for (i = 0; i < 32 - mask; i++) {
        host_all_1s += (1 << i);
    }
    var last_ip = ip_addr | host_all_1s;
    for (i = first_ip + 1; i <= last_ip - 1; i++) {
        str = convert_ip_to_str(i);
        ip_list.push(str);
    }
    //console.log("Last:", convert_ip_to_str(last_ip));
    return ip_list;
}

function ip_range_add_raw(ip_str, ip_list) {
    /* Check for - or / character */
    var pos = ip_str.indexOf('/');
    if (-1 == pos) {
        pos = ip_str.indexOf('-');
        if (-1 == pos) {
            ip_list.push(ip_str);
        } else {
            ip_range_add(ip_str, ip_list);
        }
    } else {
        ip_range_with_mask(ip_str, ip_list);
    }
}
function ip_range(ip_str, ip_list) {
    /* First divide the string into comma seperated strings and store all those
     * in some list
     */
    var i = 0;
    var pos = -1;
    var raw_ip_list = [];
    var ip_str_slice = "";
    ip_str = ip_str.trim();
    if (!ip_str.length) {
        return null;
    }
    pos = ip_str.indexOf(',');
    if (-1 == pos) {
        /* Only one IP */
        //ip_list.push(ip_str);
        ip_range_add_raw(ip_str, ip_list);
        return ip_list;
    }
    ip_str_slice = ip_str;
    while (-1 != pos) {
        raw_ip_list.push(ip_str_slice.substr(0, pos));
        ip_range_add_raw(ip_str_slice.substr(0, pos), ip_list);
        ip_str_slice = ip_str_slice.slice(pos + 1);
        pos = ip_str_slice.indexOf(',');
    }
    raw_ip_list.push(ip_str_slice);
    ip_range_add_raw(ip_str_slice, ip_list);
    return ip_list;
}

function getSelectedProjectObj() {
    var cookiedProject = getCookie("project"),
        firstProjectName = $("#ddProjectSwitcher").data("kendoDropDownList").text();
    if (cookiedProject === false) {
        setCookie("project", firstProjectName);
        return firstProjectName;
    } else {
        for (var i = 0; i < $("#ddProjectSwitcher").data("kendoDropDownList").dataSource.data().length; i++) {
            var pname = $("#ddProjectSwitcher").data("kendoDropDownList").dataSource.data()[i].text;
            if (pname === cookiedProject) {
                return $("#ddProjectSwitcher").data("kendoDropDownList").dataSource.data()[i].value;
            }
        }
    }
    setCookie("project", firstProjectName);
    return firstProjectName;
}

function getSelectedProjectObjNew (projectSwitcherId, elementType) {
    var firstProjectName = "", firstProjectValue = "";
    var cookiedProject = getCookie("project");
    if (cookiedProject === false) {
        if(elementType === "contrailDropdown") {
            firstProjectName = $("#" + projectSwitcherId).data(elementType).text();
            firstProjectValue = $("#" + projectSwitcherId).data(elementType).value();
        }
        setCookie("project", firstProjectName);
        return firstProjectValue;
    } else {
        if(elementType === "contrailDropdown") {
            for (var i = 0; i < $("#" + projectSwitcherId).data(elementType).getAllData().length; i++) {
                var pname = $("#" + projectSwitcherId).data(elementType).getAllData()[i].text;
                if (pname === cookiedProject) {
                    return $("#" + projectSwitcherId).data(elementType).getAllData()[i].value;
                }
            }
        }
    }
    setCookie("project", firstProjectName);
    return firstProjectValue;
}

function getSelectedProject() {
    var cookiedProject = getCookie("project"),
        firstProjectName = $("#ddProject").data("kendoDropDownList").text();
    if (cookiedProject === false) {
        setCookie("project", firstProjectName);
        return firstProjectName;
    } else {
        for (var i = 0; i < $("#ddProject").data("kendoDropDownList").dataSource.data().length; i++) {
            var pname = $("#ddProject").data("kendoDropDownList").dataSource.data()[i];
            if (pname === cookiedProject) {
                return cookiedProject;
            }
        }
    }
    setCookie("project", firstProjectName);
    return firstProjectName;
}

function fetchDomains(successCB, failureCB) {
    doAjaxCall("/api/tenants/config/domains", "GET", null, successCB, (failureCB) ? failureCB : "errorInFetchingDomains", null, null);
};

function fetchProjects(successCB, failureCB, domainUUID) {
    if(domainUUID) {
        domainUUID = "/" + domainUUID;
    } else {
        if($("#ddDomainSwitcher").hasOwnProperty("length")) {
            //Works fine when the ID of the domain switcher is 'ddDomainSwitcher'
            //and is either a contrailDropdown or kendoDropDownList. 
            //Pass UUID of the Domain, otherwise. Also, remove check for 
            //kendoDropDownList once domain switcher component in all pages
            //are moved to contrailDropdown.
            if(undefined !== $("#ddDomainSwitcher").data("contrailDropdown")) {
                domainUUID = "/" + $("#ddDomainSwitcher").data("contrailDropdown").value();
            } else if(undefined !== $("#ddDomainSwitcher").data("kendoDropDownList")) {
                domainUUID = "/" + $("#ddDomainSwitcher").data("kendoDropDownList").value();   
            }
        } else {
            domainUUID = "";
        }
    }
    doAjaxCall("/api/tenants/config/projects"+domainUUID, "GET", null, successCB, (failureCB) ? failureCB : "errorInFetchingProjects", null, null);
};

function errorInFetchingProjects(error) {
    showInfoWindow("Error in Fetching projects", "Error");
};

function errorInFetchingDomains(error) {
    showInfoWindow("Error in Fetching domains", "Error");
};

function gridSelectAllRows(args, buttonId) {
    var tableId = args.id.split("_")[1];
    var checked = $("#cb_" + tableId)[0].checked;
    if (checked === true) {
    	if($("tr", "#" + tableId).find("td").length > 0) {
            var colspan = $("td", "#" + tableId).attr('colspan');
            if(typeof colspan === "undefined") {
                $("tr.k-master-row", "#" + tableId).addClass('k-state-selected');
                $("#" + buttonId).removeAttr("disabled");
            }
        }
    } else {
        $("tr.k-master-row", "#" + tableId).removeClass('k-state-selected');
        $("#" + buttonId).attr("disabled", "disabled");
    }
    var tableRows = $("#" + tableId).data("kendoGrid").dataSource.data();
    if (tableRows && tableRows.length > 0) {
        for (var i = 0; i < tableRows.length; i++) {
            $("#" + tableId + "_" + i)[0].checked = checked;
        }
    }
}

function gridSelectRow(args, buttonId) {
    var tableId = args.id.split("_")[0];
    var tableRowId = parseInt(args.id.split("_")[1]);
    tableRowId += 1;
    var checked = args.checked;
    var checkedRowsLen = getCheckedRows(tableId).length;
    var dsLen = $("#"+tableId).data("kendoGrid").dataSource.data().length;
    if(dsLen === checkedRowsLen) {
    	$("#cb_"+tableId).attr("checked", true);
    } else {
    	$("#cb_"+tableId).attr("checked", false);
    }
    if (checked === true) {
        $(args).parents('.k-master-row').addClass('k-state-selected');
        $("#" + buttonId).removeAttr("disabled");
    } else {
    	$(args).parents('.k-master-row').removeClass('k-state-selected');
        var tableRows = $("#" + tableId).data("kendoGrid").dataSource.data();
        if (tableRows && tableRows.length > 0) {
            checkedRowFound = false;
            for (var i = 0; i < tableRows.length; i++) {
                if($("#" + tableId + "_" + i)[0].checked === true) {
                    checkedRowFound = true;
                    break;
                }
            }
            if(checkedRowFound === false) {
                $("#" + buttonId).attr("disabled", "disabled");
            }
        }
    }
}

function getCheckedRows(gridId) {
	var rows = [];
	var ds = $("#"+gridId).data("kendoGrid").dataSource.data();
	for(var i=0; i<ds.length; i++) {
		if($("#"+gridId+"_"+i).prop("checked") === true)
			rows.push(ds[i]);
	}
	return rows;	
}

function isValidDomainAndProject(selectedDomain, selectedProject) {
	if(isValidDomain(selectedDomain) === true &&
		isValidProject(selectedProject) === true) {
		return true;
	}
	return false;
}

function isValidDomain(selectedDomain) {
    if(null == selectedDomain || typeof selectedDomain === "boolean" || "" == selectedDomain.trim()) {
    	showInfoWindow("Selected Domain appears to be invalid. Select a valid Domain and try again.", "Invalid Domain");
    	return false;
    }
    return true;
}

function isValidProject(selectedProject) {
    if(null == selectedProject || typeof selectedProject === "boolean" || "" == selectedProject.trim()) {
    	showInfoWindow("Selected Project appears to be invalid. Select a valid Project and try again.", "Invalid Project");
    	return false;
    }
	return true;
}

function createSuccessDialog() {
	var root = document.createElement("div");
	root.id = "configPush";
	$(root).attr("tabindex", "-1");
	$(root).addClass("modal modal-420 hide");
	
	var modalHdr = document.createElement("div");
	$(modalHdr).addClass("modal-header");
	
	var btnClose = document.createElement("button");
	btnClose.type = "button";
	$(btnClose).addClass("close");
	$(btnClose).attr("data-dismiss", "modal");
	$(btnClose).attr("aria-hidden", "true");

	var iconRemove = document.createElement("i");
	$(iconRemove).addClass("icon-remove");
	btnClose.appendChild(iconRemove);
	
	var hdrTitle = document.createElement("h6");
	$(hdrTitle).addClass("modal-header-title");
	$(hdrTitle).text("Saving configuration");

	modalHdr.appendChild(btnClose);
	modalHdr.appendChild(hdrTitle);

	var modalBody = document.createElement("div");
	$(modalBody).addClass("modal-body");

	var txtCenter = document.createElement("div");
	$(txtCenter).addClass("row-fluid text-center");
	var hdr6 = document.createElement("h6");
	$(hdr6).text("Please wait while configuration is saved.");
	txtCenter.appendChild(hdr6);
	
	/*var progress = document.createElement("div");
	$(progress).addClass("progress");

	var bar = document.createElement("div");
	bar.id = "configProgressBar";
	bar.style.width = "0%";
	$(bar).addClass("bar");
	progress.appendChild(bar);*/
	
	modalBody.appendChild(txtCenter);
	//modalBody.appendChild(progress);
	
	root.appendChild(modalHdr);
	root.appendChild(modalBody);

    $(root).modal({backdrop:'static', keyboard: false, show:false});
    document.body.appendChild(root);
}

function checkValidPortRange(startPortsArray, endPortsArray, source) {
    var validPortRangeMsg =
        (source && source === true) ? "Enter a valid source port between 1 - 65535 and try again" :
            "Enter a valid destination port between 1 - 65535 and try again";

    for (var j = 0; j < startPortsArray.length; j++) {
        if(!isNumber(startPortsArray[j]) || !isNumber(endPortsArray[j])) {
            showInfoWindow(validPortRangeMsg, "Invalid input");
            return false;
        }
        if(isNumber(startPortsArray[j]) && isNumber(endPortsArray[j])) {
            if(parseInt(startPortsArray[j]) <= 0 || parseInt(startPortsArray[j]) > 65535) {
                showInfoWindow(validPortRangeMsg, "Invalid input");
                return false;
            }
            if(parseInt(endPortsArray[j]) <= 0 || parseInt(endPortsArray[j]) > 65535) {
                showInfoWindow(validPortRangeMsg, "Invalid input");
                return false;
            }
        }
    }
    return true;
}

function deleteObject(cbParams) {
	if(cbParams && (cbParams.index === null || typeof cbParams.index === "undefined")) {
		cbParams.index = 0;
	}
	if(cbParams && (cbParams.index < cbParams.selected_rows.length)) {
		var selected_row_data = cbParams.selected_rows[cbParams.index];
	    doAjaxCall(cbParams.url + selected_row_data[cbParams.urlField], 
	        "DELETE", null, "deleteSuccess", "deleteFailure", null, cbParams, null, true);
	} else {
		deleteComplete(cbParams);
	}
}

function deleteSuccess(result, cbParams) {
	if(cbParams && (cbParams.index < cbParams.selected_rows.length)) {
		var params = {};
		params.selected_rows = cbParams.selected_rows;
		params.url = cbParams.url; 
		params.urlField = cbParams.urlField;
		params.fetchDataFunction = cbParams.fetchDataFunction;
		params.errorShortMessage = cbParams.errorShortMessage;
		params.errorTitle = cbParams.errorTitle;
		params.errorShortMessage = cbParams.errorShortMessage;
		params.errorField = cbParams.errorField;
		params.index = cbParams.index + 1;
        if(typeof cbParams.errors !== "undefined" &&
            null !== cbParams.errors) {
            params.errors = cbParams.errors;
            params.errorDesc = cbParams.errorDesc;
        }
        deleteObject(params);
	} else {
		deleteComplete(cbParams);
	}
}

function deleteComplete(cbParams) {
    if(typeof cbParams.errors !== "undefined" &&
        null !== cbParams.errors && 
        cbParams.errors.length > 0) {
    	var msg = "";
    	var objects = [];
        for(var i=0; i<cbParams.errors.length; i++) {
            objects[i] = cbParams.selected_rows[i][cbParams.errorField];
            msg = msg +
            cbParams.errorField + ": " + cbParams.selected_rows[i][cbParams.errorField] + "<br>" +
            cbParams.errorDesc[i] + "<br><br>";
        }
        objects = objects.join(", ");
        cbParams.errorShortMessage += objects;
        showInfoWindow(cbParams.errorShortMessage, cbParams.errorTitle, msg);
    }
    window[cbParams.fetchDataFunction]();
}

function deleteFailure(result, cbParams) {
    if(cbParams && (cbParams.index < cbParams.selected_rows.length)) {	
        var params = {};
        params.selected_rows = cbParams.selected_rows;
		params.url = cbParams.url; 
		params.urlField = cbParams.urlField;
		params.fetchDataFunction = cbParams.fetchDataFunction;
		params.errorShortMessage = cbParams.errorShortMessage;
		params.errorTitle = cbParams.errorTitle;
		params.errorShortMessage = cbParams.errorShortMessage;
		params.errorField = cbParams.errorField;
        if(typeof cbParams.errors !== "undefined" &&
            null !== cbParams.errors) {
        	params.errors = cbParams.errors;
        	params.errorDesc = cbParams.errorDesc;
        } else {
        	params.errors = [];
        	params.errorDesc = [];
        }
	    params.errors[params.errors.length] = cbParams.index;
	    params.errorDesc[params.errorDesc.length] = result.responseText;
	    params.index = cbParams.index + 1;
	    deleteObject(params);
    } else {
        deleteComplete(cbParams);	
    }
}

function checkSystemProject(project) {
	var sysProjects = ["service", "invisible_to_admin"];
	if(sysProjects.indexOf(project) !== -1)
		return true;
	return false;
}

cutils.getCookie = getCookie;
cutils.setCookie = setCookie;
cutils.isSet = isSet;
cutils.isObject = isObject;
cutils.isNumber = isNumber;
cutils.isString = isString;
cutils.pad = pad;
cutils.doAjaxCall = doAjaxCall;
cutils.formatPolicyRule = formatPolicyRule;
cutils.policy_net_display = policy_net_display;
cutils.policy_ports_display = policy_ports_display;
cutils.clone = clone;
cutils.getProtocol = getProtocol;
cutils.getFQNofVN = getFQNofVN;
cutils.getEndPort = getEndPort;
cutils.getStartPort = getStartPort;
cutils.validip = validip;
cutils.convert_str_to_ip = convert_str_to_ip;
cutils.get_subnet_mask = get_subnet_mask;
cutils.convert_ip_to_str = convert_ip_to_str;
cutils.ip_range_add = ip_range_add;
cutils.ip_range_with_mask = ip_range_with_mask;
cutils.ip_range_add_raw = ip_range_add_raw;
cutils.ip_range = ip_range;
cutils.removeRTString = removeRTString;
cutils.checkValidDestinationNetwork = checkValidDestinationNetwork;
cutils.checkValidSourceNetwork = checkValidSourceNetwork;
cutils.toggleButtonStateByID = toggleButtonStateByID;
cutils.getFormatVNName = getFormatVNName;
cutils.getApplyServices = getApplyServices;
cutils.policy_services_display = policy_services_display;
cutils.launchVNC = launchVNC;
cutils.launchVNCcb = launchVNCcb;
cutils.failureLaunchVNCcb = failureLaunchVNCcb;
cutils.getSelectedProjectObj = getSelectedProjectObj;
cutils.getSelectedProject = getSelectedProject;
cutils.fetchDomains = fetchDomains;
cutils.fetchProjects = fetchProjects;
cutils.errorInFetchingDomains = errorInFetchingDomains;
cutils.errorInFetchingProjects = errorInFetchingProjects;
cutils.gridSelectAllRows = gridSelectAllRows;
cutils.gridSelectRow = gridSelectRow;
cutils.getCheckedRows = getCheckedRows;
cutils.isValidDomainAndProject = isValidDomainAndProject;
cutils.isValidDomain = isValidDomain;
cutils.isValidProject = isValidProject; 
cutils.checkValidPortRange = checkValidPortRange;
cutils.deleteObject = deleteObject;
cutils.deleteSuccess = deleteSuccess;
cutils.deleteComplete = deleteComplete;
cutils.deleteFailure = deleteFailure;
cutils.checkSystemProject = checkSystemProject;
cutils.getSelectedProjectObjNew = getSelectedProjectObjNew;
