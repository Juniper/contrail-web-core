define(['underscore', 'contrail-model', 'vis-tooltip-model'],
function(_, ContrailModel, VisTooltipModel) {
    var visNodeModel = ContrailModel.extend({
        defaultConfig: {
            "element_id"          : null,
            "name"                : null,
            "label"               : null,
            "image"               : "/img/router-default.svg",
            "shape"               : "image",
            "font"                : {
                                    "face" : "Arial, helvetica, sans-serif",
                                    "size" : 10,
                                    "color" : "#333",
                                    "strokeColor" : "#333",
                                    "strokeWidth" : 0.4
                                    },
            "color"               : "#333",
            "labelHighlightBold"  : true,
            "size"                : 20,
            "level"               : 1,
            "title"               : "",
            "tooltip"             : null,
            "tooltipConfig"       : null,
            "errorMsg"            : null,
            "chassis_type"        : "unknown",
            "node_type"           : "unknown"
        },
        formatModelConfig: function(modelConfig) {
            var self = this;
            modelConfig["element_id"] = UUIDjs.create().hex;
            modelConfig["label"] =
                contrail.truncateText(modelConfig["name"], 20);
            if(modelConfig.hasOwnProperty("chassis_type")) {
                switch (modelConfig["chassis_type"]) {
                    case "coreswitch":
                        modelConfig["level"] = 2;
                        modelConfig["image"] =
                            "/img/router-default.svg";
                        break;
                    case "spine":
                        modelConfig["level"] = 3;
                        modelConfig["image"] =
                            "/img/router-default.svg";
                        break;
                    case "tor":
                        modelConfig["level"] = 4;
                        modelConfig["image"] =
                            "/img/tor-default.svg";
                        break;
                    case "virtual-router":
                        modelConfig["level"] = 5;
                        modelConfig["image"] =
                            "/img/virtual-router-default.svg";
                        break;
                    case "virtual-machine":
                        modelConfig["level"] = 6;
                        modelConfig["image"] =
                            "/img/virtual-machine-default.svg";
                        if (modelConfig.hasOwnProperty("more_attributes") &&
                            modelConfig["more_attributes"].hasOwnProperty("vm_name") &&
                            modelConfig["more_attributes"]["vm_name"].trim() !== "" &&
                            modelConfig["more_attributes"]["vm_name"].trim() !== "-") {
                            modelConfig["label"] = contrail.truncateText(
                                modelConfig["more_attributes"]["vm_name"].trim(), 10);
                        } else {
                            modelConfig["label"] = contrail.truncateText(modelConfig["name"], 10);
                        }
                        break;
                }
            }
            return modelConfig;
        },
        validateAttr: {},
        validations: {}
    });
    return visNodeModel;
});