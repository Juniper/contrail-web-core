/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

//Common utility functions
cutils = module.exports;
g = require('./global')

function getCookie(name) {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var x = cookies[i].substr(0, cookies[i].indexOf("="));
        var y = cookies[i].substr(cookies[i].indexOf("=") + 1);
        x = x.replace(/^s+|s+$/g, "").trim();
        if (x == name)
            return unescape(y);
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

function generateUniqueID() {
    var unique_random_numbers = [];

    while (unique_random_numbers.length < g.UNIQUE_ID_LIMIT) {
        var random_number =
            Math.round(Math.random() *
                (g.UNIQUE_ID_UPPER_BOUND - g.UNIQUE_ID_LOWER_BOUND + 1) +
                g.UNIQUE_ID_LOWER_BOUND);

        if (unique_random_numbers.indexOf(random_number) == -1) {
            unique_random_numbers.push(random_number);
            return pad(random_number, 5);
        }
    }
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

        if (isSet(cbParams) && isSet(cbParams.table_id)) {
            toggleTableButtonsState(cbParams.table_id, false);
        }
        if(isSet(timeout) && isNumber(timeout) && timeout > 0) {
        	config.timeout = timeout;
        }
        $.ajax(config)
            .success(function (res) {
                configObj = $.extend({}, configObj, res);
                if (isSet(cbParams) && isSet(cbParams.table_id)) {
                    toggleTableButtonsState(cbParams.table_id, true);
                }
                if (typeof window[success] === "function")
                    window[success](res, cbParams);
            })
            .fail(function (res) {
                if (isSet(cbParams) && isSet(cbParams.table_id)) {
                    toggleTableButtonsState(cbParams.table_id, true);
                }
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
}

function toggleTableButtonsState(table_id, enable) {
    if (isSet(table_id)) {
        var btnaddid = "btn_" + table_id + "_add";
        var btneditid = "btn_" + table_id + "_edit";
        var btndelid = "btn_" + table_id + "_delete";
        var btnadd = $("#" + btnaddid);
        var btnedit = $("#" + btneditid);
        var btndel = $("#" + btndelid);
        if (enable === true) {
            toggleButtonStateByID(btnaddid, true);
            toggleButtonStateByID(btneditid, true);
            toggleButtonStateByID(btndelid, true);
        } else {
            toggleButtonStateByID(btnaddid, false);
            toggleButtonStateByID(btneditid, false);
            toggleButtonStateByID(btndelid, false);
        }
    }
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

function getRTString(rt) {
    if (isSet(rt) && rt != ":")
        return "target:" + rt;
    else
        return "";

}

function removeRTString(rt) {
    if (isSet(rt) && rt.indexOf("target:") != -1) {
        return rt.split("target:")[1];
    }
    return rt;
}

function getIPRange(subnet) {
    if (isSet(subnet)) {
        var ip_arr = [];
        var ip_arrs = ip_range(subnet, ip_arr);
        return ip_arrs[0] + " - " + ip_arrs[ip_arrs.length - 2];
    }
    return "";
}

function formatPolicyRule(rule) {
    var rule_display = "";
    if (isSet(rule)) {
        if (isSet(rule["action_list"]) && isSet(rule["action_list"]["simple_action"]))
            rule_display += rule["action_list"]["simple_action"];

        if (isSet(rule["application"]) && rule["application"].length > 0) {
            rule_display += " application " + rule["application"].toString();
            rule_display += " network " +
                policy_net_display(rule["src_addresses"]);
            rule_display += " " + rule["direction"];
            rule_display += " network " +
                policy_net_display(rule["dst_addresses"]);
            if (isSet(rule["action_list"]))
                rule_display += " action " + rule["action_list"].toString();
        } else {
        	if(null !== rule["simple_action"] && typeof rule["simple_action"] !== "undefined")
        	    rule_display += rule["simple_action"];
            if (isSet(rule["protocol"]))
                rule_display += " protocol " + rule["protocol"].toString();
            rule_display += " network " +
                policy_net_display(rule["src_addresses"]);
            rule_display += policy_ports_display(rule["src_ports"]);
            rule_display += " " + rule["direction"];
            rule_display += " network " +
                policy_net_display(rule["dst_addresses"]);
            rule_display += policy_ports_display(rule["dst_ports"]);
            rule_display += policy_services_display(rule["action_list"]);
        }
    }
    return rule_display;
}

function policy_net_display(nets) {
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
                if (isSet(net["virtual_network"]))
                    net_disp += net["virtual_network"].toString();
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

function getDHCPValue(key) {
    if (isSet(key)) {
        switch (key) {
            case "6":
                return "DNS Server";
                break;
            case "15":
                return "Domain Name";
                break;
            case "4":
                return "NTP Server";
                break;
            default:
                return "";
                break;
        }
    }
}

function getDHCPKey(value) {
    if (isSet(value)) {
        switch (value) {
            case "DNS Server":
                return "6";
                break;
            case "Domain Name":
                return "15";
                break;
            case "NTP Server":
                return "4";
                break;
            default:
                return "";
                break;
        }
    }
}

function getIPPrefix(ip) {
    if (isSet(ip) && ip.trim()) {
        if (validip(ip.trim()))
            return ip.trim().split("/")[0];
        else {
            showInfoWindow("Enter Valid IP Address and try again", "Invalid IP Address");
            return false;
        }
    }
    return "";
}

function populateRT(val) {
    var rt = $("#hiddenRT").val();
    val = rt.split(":")[0] + ":" + val.value;
    $("#hiddenRT").val(val);
}

function handleInstanceAction(e) {
    if ($("#div_window_launchvnc").length <= 0) {
        action_window_div = document.createElement("div");
        action_window_div.id = "div_window_launchvnc";
        document.body.appendChild(action_window_div);
    }
    if ($("#div_window_launchvnc_content").length <= 0) {
        action_window_content = document.createElement("iframe");
        action_window_content.id = "div_window_launchvnc_content";
        action_window_content.src = "";
        action_window_content.style.width = "1320px";
        action_window_content.style.height = "700px";
        action_window_content.style.margin = "5px";
        action_window_div.appendChild(action_window_content);
    }

    var who = $(e).text();
    switch (who) {
        case "Launch VNC Popup":
            launchVNC(e);
            break;
        case "Launch VNC":
            launchVNC(e, true);
            break;
    }
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

function policyValidator(arg) {
    if (isSet($("#simpleaction")) && $("#simpleaction").length > 0) {
        var action_value = $("#simpleaction").data("kendoComboBox").text();
        if ((!isSet(action_value) || action_value.trim().toLowerCase() === "pass" ||
            action_value.trim().toLowerCase() === "deny") && (action_value !== "")) {
            if (isSet($("#apply_service")) && $("#apply_service").length > 0) {
                var as_value = $("#apply_service").data("kendoMultiSelectBox").text();
                if (isSet(as_value)) {
                    showInfoWindow("Policy action and services are mutually exclusive.", "Invalid Rule");
                    return false;
                }
            }
            if (isSet($("#mirror_service")) && $("#mirror_service").length > 0) {
                var ms_value = $("#mirror_service").data("kendoDropDownList").text();
                if (isSet(ms_value)) {
                    showInfoWindow("Policy action and services are mutually exclusive.", "Invalid Rule");
                    return false;
                }
            }
        } else {
            if (action_value.trim().toLowerCase() === "none" || action_value.trim() === "" ||
                action_value.trim() == DUMMY_ITEM_VALUE) {
                var as_value = true, ms_value = true;
                if (isSet($("#apply_service")) && $("#apply_service").length > 0) {
                    as_value = $("#apply_service").data("kendoMultiSelectBox").text();
                    if (!isSet(as_value)) {
                        as_value = false;
                    }
                }
                if (isSet($("#mirror_service")) && $("#mirror_service").length > 0) {
                    var ms_value = $("#mirror_service").data("kendoDropDownList").text();
                    if (!isSet(ms_value)) {
                        ms_value = false;
                    }
                }
                /*if(as_value !== false || ms_value !== false) {
                 showInfoWindow("Select a valid action('Pass'/'Deny') and try again.", "Invalid Rule");
                 return false;
                 }*/
            }
            else {
                showInfoWindow("Policy action and services are mutually exclusive.", "Invalid Rule");
                return false;
            }
        }
    }
    return true;
}

function populateVNs(result, params) {
    var data = jsonPath(configObj, "$.virtual-networks[*].fq_name[2]");
    var dom_data = params.element.data;

    var combo_data = [];
    combo_data.push({"id":"Automatic", "value":DUMMY_ITEM_VALUE});
    if (isSet(data) && data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            combo_data.push({"id":d, "value":combo_data.length});
        }
    }

    if (isSet(params.mode) && params.mode === "edit" &&
        isSet(dom_data) && dom_data.length > 0) {
        if (isSet(combo_data) && combo_data.length > 0) {
            for (var i = 0; i < dom_data.length; i++) {
                for (var j = 0; j < combo_data.length; j++) {
                    if (dom_data[i].id == combo_data[j].id) {
                        combo_data.move(j, 0);
                        break;
                    }
                }
            }
        }
    }
    if (isSet(params.element) && isSet(params.element.id)) {
        $("#" + params.element.id).kendoDropDownList({
            dataValueField:"value",
            dataTextField:"id",
            dataSource:combo_data
        });
    }
}

function disableRigthIntf(e) {
    switch (e.value) {
        case "1":
            $("#interfacetypes").data("kendoMultiSelectBox").list[0].
                getElementsByTagName("ul")[0].getElementsByTagName("li")[1].
                getElementsByTagName("input")[0].disabled = true;
            $("#interfacetypes").data("kendoMultiSelectBox").list[0].
                getElementsByTagName("ul")[0].getElementsByTagName("li")[1].
                getElementsByTagName("label")[0].disabled = true;
            break;
        default:
            $("#interfacetypes").data("kendoMultiSelectBox").list[0].
                getElementsByTagName("ul")[0].getElementsByTagName("li")[1].
                getElementsByTagName("input")[0].disabled = false;
            $("#interfacetypes").data("kendoMultiSelectBox").list[0].
                getElementsByTagName("ul")[0].getElementsByTagName("li")[1].
                getElementsByTagName("label")[0].disabled = false;
            break;
    }
}

function getSelectedMirrorTo(mirrorTo) {
    var fqNameArray = jsonPath(configObj, "$.network-policy.fq_name"),
        fqName;
    if (fqNameArray != null && fqNameArray.length > 0) {
        fqName = fqNameArray[0].join(":");
        fqName = fqName.replace('-policy', '');
        fqName = fqName.replace('default-analyzer-', '');
        return {"analyzer_name":fqName};
    } else {
        return null;
    }
}

function toggleVNStates(val) {
    var sts = jsonPath(configObj, "$.service_templates[*].service-template");
    var intfs, rightVNDroplist, manVNDroplist;
    intfs = [];
    if (isSet(sts) && sts.length > 0) {
        for (var i = 0; i < sts.length; i++) {
            if (sts[i].fq_name[1] === $(val.options[val.selectedIndex]).text()) {
                var if_json = sts[i]["service_template_properties"]["interface_type"];
                if (isSet(if_json)) {
                    for (var j = 0; null != if_json[j]; j++) {
                        if (isSet(if_json[j]["service_interface_type"])) {
                            intfs[intfs.length] = if_json[j]["service_interface_type"];
                        }
                    }
                }
                break;
            }
        }
    }
    if (isSet(intfs) && intfs.length > 0) {
        intfs = intfs.toString();
        if (intfs.indexOf("left") != -1) {
            $("#leftvn").getKendoDropDownList().enable(true);
        }
        else {
            $("#leftvn").getKendoDropDownList().select(0);
            $("#leftvn").getKendoDropDownList().enable(false);
        }
        rightVNDroplist = $("#rightvn").getKendoDropDownList();
        if (!rightVNDroplist) {
            // Ignore
        } else if (intfs.indexOf("right") != -1) {
            $("#rightvn").getKendoDropDownList().enable(true);
        } else {
            $("#rightvn").getKendoDropDownList().select(0);
            $("#rightvn").getKendoDropDownList().enable(false);
        }
        manVNDroplist = $("#mgmtvn").getKendoDropDownList();
        if (!manVNDroplist) {
            //Ignore
        } else if (intfs.indexOf("management") != -1) {
            $("#mgmtvn").getKendoDropDownList().enable(true);
        } else {
            $("#mgmtvn").getKendoDropDownList().select(0);
            $("#mgmtvn").getKendoDropDownList().enable(false);
        }
    }
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
function getNullIfEmpty(arr) {
    if (isSet(arr) && arr.length > 0) {
        if (typeof arr == "string") {
            if (arr.trim() === "") {
                return null;
            }
        }
        return arr;
    }
    return null;
}

function getServiceType(stype) {
    if (isSet(stype)) {
        if (stype.trim().toLowerCase() === "firewall") {
            return "firewall";
        } else if (stype.trim().toLowerCase() === "mirroring")
            return "analyzer";
        else {
            showInfoWindow("Enter valid service type('transparent/non-transparent/mirroring' and try again",
                "Invalid Service Type");
            return false;
        }
    }
    showInfoWindow("Enter valid service type('transparent/non-transparent/mirroring' and try again",
        "Invalid Service Type");
    return false;
}

function getInterfaceTypes(intfs) {
    var interfaceType;
    if (isSet(intfs) && intfs.length > 0) {
        for (var i = 0; i < intfs.length; i++) {
            interfaceType = {"service_interface_type":intfs[i].trim().toLowerCase(), "shared_ip":false };
            intfs[i] = interfaceType;
        }
        return intfs;
    }
    return [];
}

function getInterfaceTypesForTable(if_json) {
    var intf_types = [];
    if (isSet(if_json) && if_json.length > 0) {
        for (var i = 0; null != if_json[i]; i++) {
            if (isSet(if_json[i].service_interface_type)) {
                intf_types[i] = if_json[i].service_interface_type;
                intf_types[i] =
                    intf_types[i].replace(intf_types[i][0], intf_types[i][0].toUpperCase());
                intf_types[i] = " " + intf_types[i];
            }
        }
        return intf_types.toString();
    }
    return if_json;
}

function getStringFromArray(arr) {
    if (isSet(arr) && arr.length > 0) {
        if (typeof arr === "object") {
            for (var i = 0; i < arr.length; i++) {
                arr[i] = arr[i].replace(arr[i][0], arr[i][0].toUpperCase());
                arr[i] = " " + arr[i];
            }
        }
        else if (typeof arr === "string") {
            arr = arr.replace(arr[0], arr[0].toUpperCase());
            return arr;
        }
        return arr.toString();
    }
    return arr;
}
function getEmptyStringIfNull(obj) {
    if (!isSet(obj))
        return "-";
    return obj;
}

function getTemplateRefs(si) {
    var tmpls = jsonPath(si, "$.service_template_refs[*].to[1]");
    if (isSet(tmpls) && tmpls !== false) {
        if (tmpls.length == 1) {
            tmpls = tmpls[0];
            return tmpls;
        }
        return tmpls.toString();
    }
    return "";
}

function getMirrorServices(arr) {
    if (isSet(arr) && arr.length > 0) {
        if (typeof arr == "string") {
            if (arr.trim() === "") {
                return null;
            }
        }
        var sis = jsonPath(configObj, "$..service_templates[*].service-template.service_instance_back_refs[*]");
        for (var j = 0; j < sis.length; j++) {
            var si = sis[j];
            if (si.to[2] == arr) {
                arr = si.to[0] + ":" + si.to[1] + ":" + si.to[2];
                break;
            }
        }
        return {"analyzer_name":arr};
    }
    return null;
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

function getServiceChainType(as) {
    var as = getApplyServices(as),
        mir = getNullIfEmpty($("#mirror_service").data("kendoDropDownList").text()),
        asType;
    if (!isSet(as)) {
        if (!isSet(mir)) {
            return null;
        } else {
            return null;
        }
    } else {
        if (!isSet(mir)) {
            asType = $("#apply_service_mode").val();
            if (asType == 1) {
                return "in-network";
            } else {
                return "transparent";
            }
        }
    }
    return null;
}

function populateApplyServices(e) {
    if (isSet($("#apply_service")) && $("#apply_service").length > 0) {
        var sts = jsonPath(configObj, "$.service_templates[*].service-template");
        var insts = [];
        if (isSet(sts) && sts.length > 0) {
            for (var i = 0; i < sts.length; i++) {
                if (sts[i].service_template_properties.service_type !== "analyzer") {
                    if (isSet(sts[i].service_instance_back_refs) && sts[i].service_instance_back_refs.length > 0) {
                        ;
                        for (var j = 0; j < sts[i].service_instance_back_refs.length; j++) {
                            insts[insts.length] = sts[i].service_instance_back_refs[j].to[2];
                        }
                    }
                }
            }
            if (isSet(insts) && insts.length > 0) {
                var ds = [];
                for (var count = 0; count < insts.length; count++) {
                    ds.push({
                        "id":insts[count],
                        "value":count
                    });
                }
                if (ds.length > 0) {
                    $("#apply_service").data("kendoMultiSelectBox").dataSource.data(ds);
                }
            }
        }
    }
}

function populateMirrorServices(result, params) {
    var sts = jsonPath(configObj, "$.service_templates[*].service-template");
    var data = [];
    if (isSet(sts) && sts.length > 0) {
        for (var i = 0; i < sts.length; i++) {
            if (isSet(sts[i].service_instance_back_refs) && sts[i].service_instance_back_refs.length > 0) {
                ;
                for (var j = 0; j < sts[i].service_instance_back_refs.length; j++) {
                    data[data.length] = sts[i].service_instance_back_refs[j].to[2];
                }
            }
        }
    }
    var dom_data = params.element.data;
    var combo_data = [];
    combo_data.push({"id":"", "value":DUMMY_ITEM_VALUE});
    if (isSet(data) && data.length > 0) {
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            combo_data.push({"id":d, "value":combo_data.length});
        }
    }

    if (isSet(params.mode) && params.mode === "edit" &&
        isSet(dom_data) && dom_data.length > 0) {
        if (isSet(combo_data) && combo_data.length > 0) {
            for (var i = 0; i < dom_data.length; i++) {
                for (var j = 0; j < combo_data.length; j++) {
                    if (dom_data[i].id == combo_data[j].id) {
                        combo_data.move(j, 0);
                        break;
                    }
                }
            }
        }
    }
    if (isSet(params.element) && isSet(params.element.id)) {
        $("#" + params.element.id).kendoDropDownList({
            dataValueField:"value",
            dataTextField:"id",
            dataSource:combo_data
        });
    }
}

function populateASN(asn) {
    var rt = $("#hiddenRT").val();
    asn = asn.value + ":" + rt.split(":")[1];
    $("#hiddenRT").val(asn);
}

function populateRule(val) {
    var rs = $("#hiddenruleseq").val();
    switch (val) {
        case "last":
        case "first":
            val = val + ":";
            break;
        default:
            val = val + ":" + rs.split(":")[1];
    }
    $("#hiddenruleseq").val(val);
}

function populateSeq(val) {
    var rs = $("#hiddenruleseq").val();
    val = rs.split(":")[0] + ":" + $("#" + val.id).data("kendoDropDownList").text();
    $("#hiddenruleseq").val(val);
}

function getRuleDict(ruleseq) {
    if (isSet(ruleseq) && ruleseq === "after:null") {
        showInfoWindow("Enter Sequence number", "Invalid Sequence number");
        return false;
    }
    var rs = ruleseq.split(":");
    var rule_dict = {};
    if (!isSet(rs[0]) || rs[0] == "null")
        rs[0] = "last";
    if (!isSet(rs[1]) || rs[1] == "null")
        rs[1] = null;
    rule_dict[rs[0]] = rs[1];
    return rule_dict;
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

function getIPPrefixLen(ip) {
    if (isSet(ip) && ip.trim()) {
        if (validip(ip.trim())) {
            var ip_split = ip.trim().split("/");
            if (ip_split.length == 2)
                return parseInt(ip_split[1]);
            else
                return 32;
        }
        else {
            showInfoWindow("Enter Valid IP Address and try again", "Invalid IP Address");
            return false;
        }
    }
    return "";
}

function getNetworkFromFIPool(fip) {
    if (isSet(fip)) {
        fip = fip.split(":")[0];
        if (isSet(fip)) {
            return fip;
        }
        return "";
    }
}
function getProjectForVNFromFIP(fip) {
    var vn = getNetworkFromFIPool(fip);
    var fqn =
        jsonPath(configObj, "$..floating_ip_pool_refs[?(@.to[2]=='" + vn + "')]");
    if (fqn && fqn.length == 1) {
        fqn = fqn[0].to[1];
        return fqn;
    } else if (isSet(vn)) {
        return vn;
    }
    return null;
}

function getPoolNameFromFIPool(fip) {
    if (isSet(fip)) {
        fip = fip.split(":")[1];
        if (isSet(fip)) {
            return fip;
        }
        return "";
    }
}

function getASNFromRT(rt) {
    return isSet(rt) ? rt.split(":")[0] : "";
}

function getTargetNumberFromRT(rt) {
    return isSet(rt) ? rt.split(":")[1] : "";
}

function getPrefix(prefix) {
    return isSet(prefix) ? prefix : null;
}

function getMajor(sequence) {
    if (isSet(sequence)) {
        try {
            sequence = Math.floor(parseInt(sequence));
            return sequence;
        }
        catch (e) {
            return 0;
        }
    }
    return 0;
}

function getMinor(sequence) {
    return 0;
}

function getDirection(direction) {
    if (isSet(direction)) {
        direction = direction.trim();
        if (direction.toLowerCase() == "bidirectional") {
            return "<>";
        } else if (direction.toLowerCase() == "unidirectional") {
            return ">";
        }
    }
    return "<>";
};

function getAction(action) {
    var ms_value = $("#mirror_service").data("kendoDropDownList").text(),
        as_value = $("#apply_service").data("kendoMultiSelectBox").text();
    action = action.toLowerCase().trim();
    if ((as_value === "" || as_value === DUMMY_ITEM_VALUE.toString())
        && (ms_value === "" || ms_value === DUMMY_ITEM_VALUE.toString())) {
        if (action === "") {
            return "pass";
        } else if (action === "deny" || action === "pass") {
            return action;
        }
    } else if (action === "") {
        if (ms_value !== "" && as_value === "") {
            return "pass";
        }
    }
    return "";
}

function getProtocol(protocol) {
    return (isSet(protocol)) ? protocol.toLowerCase() : "any";
}

function getFQNofVN(vn) {
    var fqn =
        jsonPath(configObj, "$..virtual-networks[?(@.fq_name[2]=='" + vn + "')]");
    if (fqn && fqn.length == 1) {
        fqn = fqn[0].fq_name;
        fqn = (fqn.toString()).replace(/,/g, ":");
        return fqn;
    } else if (isSet(vn)) {
        return vn
    }
    return null;
}

function getNameFromFQN(fqn) {
    if (isSet(fqn) && fqn.indexOf(":") != -1) {
        fqn = fqn.split(":");
        return fqn[fqn.length - 1];
    }
    return fqn;
}

function getEndPort(port) {
    if (isSet(port)) {
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

function getStringify(obj) {
    var str = [];
    if (isSet(obj) && obj.length > 0) {
        for (var i = 0; i < obj.length; i++) {
            str = obj.toString().replace(/,/g, ":");
        }
    }
    return str.toString();
}

function getAssignedProjectsForVN(fip) {
    var aps = jsonPath(fip, "$.projects[*].to");
    var ap = [];
    if (isSet(aps) && aps !== false) {
        for (var i = 0; i < aps.length; i++) {
            ap[i] = getStringify(aps[i]);
        }
    }
    return ap.toString();
}

function getInstancesOfFIP(fip) {
    var ins = jsonPath(fip, "$.virtual_machine_interface_refs[*].to[0]");
    if (isSet(ins) && ins !== false) {
        if (ins.length == 1) {
            ins = ins[0];
            return ins;
        }
        return ins.toString();
    }
    return "";
}

function getSelectedProjects(str) {
    if (isSet(str) && str.indexOf(":") != -1) {
        return str.split(":")[1];
    }
    else
        str = "";
    return str;
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

function macToInt(mac) {
    mac = mac.trim();
    var parts = mac.split(":");
    var res = 0;

    for (var i = 0; i < 6; i++) {
        res += parseInt(parts[i], 16) * Math.pow(256, 5 - i)
    }

    return res;
}

function intToMac(num) {
    var d = (num % 256).toString(16);

    for (var i = 5; i > 0; i--) {
        num = Math.floor(num / 256);
        //d = (num % 256).toString(16) + ':' + d;
        d = pad(((num % 256).toString(16)), 2) + ':' + d;
    }
    return d;
}

function getMacs(mac1, mac2) {
    var num_diff = macToInt(mac2) - macToInt(mac1);
    var macs = [];
    if (num_diff < 0) {
        alert("Invalid range of MAC addresses");
        return false;
    }

    for (var i = 0; i <= num_diff; i++) {
        macs.push(intToMac(macToInt(mac1) + i));
    }
    return macs;
}

function ipToInt(ip) {
    var d = ip.split('.');
    return ((((((+d[0]) * 256) + (+d[1])) * 256) + (+d[2])) * 256) + (+d[3]);
}

function intToIp(num) {
    var d = num % 256;
    for (var i = 3; i > 0; i--) {
        num = Math.floor(num / 256);
        d = num % 256 + '.' + d;
    }
    return d;
}

function is_valid_mask(ip_addr_str) {
    var ipsplit;
    var ip_addr_octet = [];

    if (null != ip_addr_str && "" != ip_addr_str) {
        ipsplit = ip_addr_str.split("/");
    }

    mask = parseInt(ipsplit[1]);
    var ip_addr = convert_str_to_ip(ipsplit[0]);
    ip_addr_octet[0] = (ip_addr >> 24) & 0xFF;
    ip_addr_octet[1] = (ip_addr >> 16) & 0xFF;
    ip_addr_octet[2] = (ip_addr >> 8) & 0xFF;
    ip_addr_octet[3] = (ip_addr >> 0) & 0xFF;

    for (var i = 0; i < 4; i++) {
        if (ip_addr_octet[i] > 0xFF) {
            alert("Invalid IP. IP Octets range 0-255.");
            return false;
        }
    }

    if ((ip_addr_octet[0] >> 5) == 6) {
        /* 1100-0000 => 0xC0 */
        /* Class C */
        /* Check Valid Masks */
        if ((mask < 25) || (mask > 31)) {
            alert("Invalid Class C IP mask: Valid range is from 25-31");
            return false;
        }
    } else if ((ip_addr_octet[0] >> 6) == 2) {
        /* 1000-0000 => 0x80 */
        /* Class B */
        /* Check Valid Masks */
        if ((mask < 17) || (mask > 31)) {
            alert("Invalid Class B IP mask: Valid range is from 17-31");
            return false;
        }
    } else if ((ip_addr_octet[0] >> 7) == 0) {
        /* 0000-0000 => 0x00 */
        /* Class A */
        /* Check Valid Masks */
        if ((mask < 9) || (mask > 31)) {
            alert("Invalid Class A IP mask: Valid range is from 9-31");
            return false;
        }
    } else {
        alert("Invalid IP. Either broadcast/multicast address provided.");
        return false;
    }

    if (!validip(ip_addr_str)) {
        alert("Invalid IP Range. Enter IP in xxx.xxx.xxx.xxx/yy format. Octet range (0-255)");
        return false;
    }
    return true;
}

function getRecordOrder(order) {
    if (isSet(order)) {
        return order.trim().toLowerCase();
    }
    return order;
}

function getNextDNSServer(dns) {
    if (isSet(dns)) {
        if ("none" === dns.trim().toLowerCase()) {
            return null;
        }
        var domain = that.getSelectedDomain();
        return domain + ":" + dns;
    }
    return dns;
}

function getIpamDnsMode(mode) {
    if (isSet(mode)) {
        if (mode === "None")
            mode = "none";
        else if (mode === "Default DNS")
            mode = "default-dns-server";
        else if (mode === "Tenant DNS")
            mode = "tenant-dns-server";
        else if (mode === "Virtual DNS")
            mode = "virtual-dns-server";
        else {
            var dnsMode = jsonPath(configObj, "$.network-ipam.network_ipam_mgmt.ipam_dns_method");
            if (isSet(dnsMode)) {
                if (dnsMode.length > 0) {
                    mode = dnsMode[0];
                } else
                    mode = dnsMode;
            }
            else {
                mode = null;
            }
        }
    }
    return mode;
}

function getIpamDnsServer(value) {
    var ipam_dns_config = {};
    ipam_dns_config.tenant_dns_server_address = null;
    ipam_dns_config.virtual_dns_server_name = null;
    var ipamdnsmode = $("#ipamdnsmode").val();

    switch (ipamdnsmode) {
        case "0":    //None
            break;
        case "1":    //Default DNS
            ipam_dns_config.virtual_dns_server_name = "";
            break;
        case "2":    //Tenant DNS
            ipam_dns_config.tenant_dns_server_address = {};
            if (value.trim().indexOf(" ") != -1) {
                //Space seperated IPs
                value = value.split(" ");
            } else if (value.trim().indexOf(",") != -1) {
                //Comma seperated IPs
                value = value.split(",");
            } else {
                value = value.split(",");
            }
            ipam_dns_config.tenant_dns_server_address.ip_address = value;
            break;
        case "3":    //Virtual DNS
            ipam_dns_config.virtual_dns_server_name = value;
            break;
        default:
            var dnsServer = jsonPath(configObj, "$.network-ipam.network_ipam_mgmt.ipam_dns_server");
            if (isSet(dnsServer)) {
                if (dnsServer.length > 0) {
                    return dnsServer[0];
                }
                return dnsServer;
            }
            else {
                return null;
            }
            break;
    }
    return ipam_dns_config;
}

function dnsServerValidator(arg) {
    var ipamdnsmodevalue = $("#ipamdnsmodevalue").data("kendoComboBox").text();
    var ipamdnsmode = $("#ipamdnsmode").val();
    if (isSet(ipamdnsmode)) {
        switch (ipamdnsmode) {
            case "0":    //None
                return true;
                break;
            case "1":    //Default DNS
                return true;
                break;
            case "2":    //Tenant DNS
                if (ipamdnsmodevalue.trim().indexOf(" ") != -1 || ipamdnsmodevalue.trim().indexOf(",") != -1) {
                    var ipamdnsmodevalues = "";
                    if (ipamdnsmodevalue.trim().indexOf(" ") != -1) {
                        //Space seperated IPs
                        ipamdnsmodevalues = ipamdnsmodevalue.split(" ");
                    } else if (ipamdnsmodevalue.trim().indexOf(",") != -1) {
                        //Comma seperated IPs
                        ipamdnsmodevalues = ipamdnsmodevalue.split(",");
                    }
                    for (var i = 0; null != ipamdnsmodevalues[i]; i++) {
                        if (validip(ipamdnsmodevalues[i].trim()))
                            continue;
                        else {
                            showInfoWindow("Enter valid IP address in the format xxx.xxx.xxx.xxx", "Invalid IP Address");
                            return false;
                        }
                    }
                    return true;
                } else {
                    if (validip(ipamdnsmodevalue.trim()))
                        return true;
                    else {
                        showInfoWindow("Enter valid IP address in the format xxx.xxx.xxx.xxx", "Invalid IP Address");
                        return false;
                    }
                }
                break;
            case "3":    //Virtual DNS
                var combo_data = $("#ipamdnsmodevalue").data("kendoComboBox").dataSource.data();
                var i = combo_data.length;
                while (i--) {
                    if (isSet(ipamdnsmodevalue) && combo_data[i].id == ipamdnsmodevalue) {
                        return true;
                    }
                }
                showInfoWindow("Select a valid DNS from available list", "Invalid DNS");
                break;
        }
    }
    return false;
}

function getDefaultTTL(ttl) {
    if (!isSet(ttl)) {
        return 86400;
    }
    try {
        var intTTL = parseInt(ttl);
        return intTTL;
    } catch (e) {
        return 86400;
    }
    return 86400;
}

function getDataAndType(recordData) {
    if (isSet(recordData)) {
        return recordData.record_type + " : " + recordData.record_data;
    }
    return "";
}

function handleDNSMode(e) {
    var mode = $("#" + e.id).data("kendoDropDownList").value();
    if (isSet(mode)) {
        switch (mode) {
            case "0":
                $("#ipamdnsmodevalue").data("kendoComboBox").enable(false);
                break;
            case "1":
                $("#ipamdnsmodevalue").data("kendoComboBox").enable(false);
                break;
            case "2":
                $("#ipamdnsmodevalue").data("kendoComboBox").enable(true);
                break;
            case "3":
                $("#ipamdnsmodevalue").data("kendoComboBox").enable(true);
                break;
        }
    }
}

function changeRecordData(type) {
    if (isSet(type)) {
        type = $(type).val();
        if (type === "0") {
            $("#label_recorddata").text("IP Address");
            $("#dnsrecorddata").data("kendoComboBox").dataSource.data([
                {"id":"", "value":""}
            ]);
        } else if (type === "1") {
            $("#label_recorddata").text("Instance Name");
            $("#dnsrecorddata").data("kendoComboBox").dataSource.data([
                {"id":"", "value":""}
            ]);
        } else if (type === "2") {
            $("#label_recorddata").text("Instance Name");
            $("#dnsrecorddata").data("kendoComboBox").dataSource.data([
                {"id":"", "value":""}
            ]);
        } else if (type === "3") {
            $("#label_recorddata").text("Next Server");
            $("#dnsrecorddata").data("kendoComboBox").dataSource.data([
                {"id":"", "value":""}
            ]);
            var domainUUID = getSelectedDomainUUID();
            doAjaxCall("/api/tenants/config/virtual-DNSs/" + domainUUID, "GET", null,
                "listVirtualDNSCallBack", "listVirtualDNSCallBack", null, {"type":type});
        } else {
            $("#label_recorddata").text("IP Address");
            $("#dnsrecorddata").data("kendoComboBox").dataSource.data([
                {"id":"", "value":""}
            ]);
        }
    }
}

function listVirtualDNSCallBack(result, cbParams) {
    if (isSet(result) && isSet(result["virtual_DNSs"]) && result["virtual_DNSs"].length > 0) {
        if (isSet(cbParams) && isSet(cbParams.type)) {
            var type = cbParams.type;
            switch (type) {
                case "1":
                    var vdnsRecords = jsonPath(result, "$.virtual_DNSs[*].virtual-DNS.virtual_DNS_records[*]");
                    if (isSet(vdnsRecords) && vdnsRecords.length > 0) {
                        var combo_data = [];
                        for (var i = 0; i < vdnsRecords.length; i++) {
                            var d = vdnsRecords[i].to[1] + ":" + vdnsRecords[i]["virtual"];
                            combo_data.push({"id":d, "value":combo_data.length});
                        }
                        $("#dnsrecorddata").data("kendoComboBox").dataSource.data(combo_data);
                    }

                    break;
                case "3":
                    var vdnss = jsonPath(result, "$.virtual_DNSs[*].virtual-DNS.fq_name");
                    if (isSet(vdnss) && vdnss.length > 0) {
                        var combo_data = [];
                        for (var i = 0; i < vdnss.length; i++) {
                            var d = vdnss[i];
                            combo_data.push({"id":d[0] + ":" + d[1], "value":combo_data.length});
                        }
                        $("#dnsrecorddata").data("kendoComboBox").dataSource.data(combo_data);
                    }
                    break;
            }
        }
    }
}
function getDHCPOptionList() {
    var dhcpOptionList = jsonPath(configObj, "$.network-ipam.network_ipam_mgmt.dhcp_option_list")
    if (isSet(dhcpOptionList) && dhcpOptionList.length > 0) {
        return dhcpOptionList[0];
    }
    return null;
}
function getDNSServer(dns_server) {
    if (isSet(dns_server)) {
        var dns_method = jsonPath(configObj, "$.network-ipam.network_ipam_mgmt.ipam_dns_method");
        if (isSet(dns_method) && dns_method.length > 0)
            dns_method = dns_method[0];
        switch (dns_method) {
            case "virtual-dns-server":
                return (dns_server.virtual_dns_server_name).split(":")[1];
                break;
            case "tenant-dns-server":
                return (dns_server.tenant_dns_server_address.ip_address).toString();
                break;
            case "default-dns-server":
                return "";
                break;
            case "none":
                return "";
                break;
        }
    }
}

function getDNSMethod(dns_method) {
    if (isSet(dns_method)) {
        switch (dns_method) {
            case "virtual-dns-server":
                return "Virtual DNS";
            case "tenant-dns-server":
                return "Tenant DNS";
            case "default-dns-server":
                return "Default DNS";
            case "none":
                return "None";
        }
    }
}

function stripIp(instIp) {
    if (isSet(instIp)) {
        return (instIp.split(":")[0]).trim();
    }
    return instIp;
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

function fetchProjects(successCB, failureCB) {
    doAjaxCall("/api/tenants/config/projects", "GET", null, successCB, (failureCB) ? failureCB : "errorInFetchingProjects", null, null);
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

function showSuccessMessage(header, message, howManySecs) {
	clearAllTimeout();
    closeMessageDialog(howManySecs);
	var hdr = "Success", msg = "Configuration committed successfully.";
	if(header)
		hdr = header;
	if(message)
		msg = message;
	$("#configPush").find(".modal-header-title").text(hdr);
	$("#configPush").find(".text-center").text(msg);
    //$("#configProgressBar")[0].style.width = "100%";
}

function closeMessageDialog(secs) {
	if(null === secs || typeof secs !== "number")
		secs = 1000;
	setTimeout(function () {$("#configPush").modal('hide')}, secs);
}

function clearAllTimeout() {
	for(var i=0; i<timeouts.length; i++) {
		clearTimeout(timeouts[i]);
	}
	timeouts = [];
}

function showMessageDialog() {
	if($("#configPush").length <= 0)
		createSuccessDialog();
	$("#configPush").modal('show');
	//startProgressBarScrolling();
}

function startProgressBarScrolling() {
	timeouts = [];
	for(var i=1; i<=25; i++) {
		timeouts[i] = setTimeout(setScrollCompletionWidth,480*i);
	}
}
function setScrollCompletionWidth() {
	var scrollWidth = $("#configProgressBar")[0].style.width;
	var width = parseInt(scrollWidth);
	if(width >= 100)
		width = 0;
	else
		width += 10;
	scrollWidth = width + "%";
	$("#configProgressBar")[0].style.width = scrollWidth;
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
cutils.generateUniqueID = generateUniqueID;
cutils.pad = pad;
cutils.doAjaxCall = doAjaxCall;
cutils.formatPolicyRule = formatPolicyRule;
cutils.policy_net_display = policy_net_display;
cutils.policy_ports_display = policy_ports_display;
cutils.getDHCPValue = getDHCPValue;
cutils.getDHCPKey = getDHCPKey;
cutils.getIPPrefixLen = getIPPrefixLen;
cutils.getIPPrefix = getIPPrefix;
cutils.getASNFromRT = getASNFromRT;
cutils.getTargetNumberFromRT = getTargetNumberFromRT;
cutils.clone = clone;
cutils.getNetworkFromFIPool = getNetworkFromFIPool;
cutils.getPoolNameFromFIPool = getPoolNameFromFIPool;
cutils.getPrefix = getPrefix;
cutils.getMajor = getMajor;
cutils.getMinor = getMinor;
cutils.getDirection = getDirection;
cutils.getAction = getAction;
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
cutils.macToInt = macToInt;
cutils.intToMac = intToMac;
cutils.getMacs = getMacs;
cutils.ipToInt = ipToInt;
cutils.intToIp = intToIp;
cutils.is_valid_mask = is_valid_mask;
cutils.getIPRange = getIPRange;
cutils.getNameFromFQN = getNameFromFQN
cutils.getRTString = getRTString;
cutils.removeRTString = removeRTString;
cutils.getStringify = getStringify;
cutils.getSelectedProjects = getSelectedProjects;
cutils.populateASN = populateASN;
cutils.populateRT = populateRT;
cutils.getProjectForVNFromFIP = getProjectForVNFromFIP;
cutils.getAssignedProjectsForVN = getAssignedProjectsForVN;
cutils.getInstancesOfFIP = getInstancesOfFIP;
cutils.populateRule = populateRule;
cutils.populateSeq = populateSeq;
cutils.getRuleDict = getRuleDict;
cutils.checkValidDestinationNetwork = checkValidDestinationNetwork;
cutils.checkValidSourceNetwork = checkValidSourceNetwork;
cutils.toggleButtonStateByID = toggleButtonStateByID;
cutils.toggleTableButtonsState = toggleTableButtonsState;
cutils.getInterfaceTypes = getInterfaceTypes;
cutils.getStringFromArray = getStringFromArray;
cutils.getTemplateRefs = getTemplateRefs;
cutils.toggleVNStates = toggleVNStates;
cutils.getFormatVNName = getFormatVNName;
cutils.getNullIfEmpty = getNullIfEmpty;
cutils.populateApplyServices = populateApplyServices;
cutils.populateMirrorServices = populateMirrorServices;
cutils.getApplyServices = getApplyServices;
cutils.getMirrorServices = getMirrorServices;
cutils.getSelectedMirrorTo = getSelectedMirrorTo;
cutils.getServiceChainType = getServiceChainType;
cutils.getServiceType = getServiceType;
cutils.getEmptyStringIfNull = getEmptyStringIfNull;
cutils.policy_services_display = policy_services_display;
cutils.handleInstanceAction = handleInstanceAction;
cutils.launchVNC = launchVNC;
cutils.launchVNCcb = launchVNCcb;
cutils.failureLaunchVNCcb = failureLaunchVNCcb;
cutils.policyValidator = policyValidator;
cutils.disableRigthIntf = disableRigthIntf;
cutils.populateVNs = populateVNs;
cutils.getRecordOrder = getRecordOrder;
cutils.getNextDNSServer = getNextDNSServer;
cutils.getDefaultTTL = getDefaultTTL;
cutils.getDataAndType = getDataAndType;
cutils.changeRecordData = changeRecordData;
cutils.handleDNSMode = handleDNSMode;
cutils.dnsServerValidator = dnsServerValidator;
cutils.listVirtualDNSCallBack = listVirtualDNSCallBack;
cutils.getDNSServer = getDNSServer;
cutils.getIpamDnsMode = getIpamDnsMode;
cutils.getIpamDnsServer = getIpamDnsServer;
cutils.getDHCPOptionList = getDHCPOptionList;
cutils.getInterfaceTypesForTable = getInterfaceTypesForTable;
cutils.getDNSMethod = getDNSMethod;
cutils.stripIp = stripIp;
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
cutils.showSuccessMessage = showSuccessMessage;
cutils.showMessageDialog = showMessageDialog; 
cutils.createSuccessDialog = createSuccessDialog;
cutils.closeMessageDialog = closeMessageDialog;
cutils.clearAllTimeout = clearAllTimeout;
cutils.showMessageDialog = showMessageDialog;
cutils.startProgressBarScrolling = startProgressBarScrolling;
cutils.setScrollCompletionWidth = setScrollCompletionWidth;
cutils.checkValidPortRange = checkValidPortRange;
cutils.deleteObject = deleteObject;
cutils.deleteSuccess = deleteSuccess;
cutils.deleteComplete = deleteComplete;
cutils.deleteFailure = deleteFailure;
cutils.checkSystemProject = checkSystemProject;
