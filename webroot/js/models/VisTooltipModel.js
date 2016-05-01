define(['underscore', 'contrail-model'],
function(_, ContrailModel) {
    var visTooltipModel = ContrailModel.extend({
        constructor: function(modelData) {
            var defaultConfig = {
                "title"                : null,
                "content"              : null,
                "actionsCallback"    : null
            };
            if(modelData) {
                if(modelData.hasOwnProperty("title"))
                    defaultConfig["title"] =
                        modelData["title"];
                if(modelData.hasOwnProperty("content"))
                    defaultConfig["content"] =
                        modelData["content"];
                if(modelData.hasOwnProperty("actionsCallback") &&
                    typeof modelData["actionsCallback"] == "function")
                    defaultConfig["actionsCallback"] =
                        modelData["actionsCallback"];

            }
            modelData = $.extend(true, {}, defaultConfig, modelData);
            ContrailModel.prototype.constructor.call(this, modelData);
            return this;
        },
        validateAttr: {},
        validations: {}
    });
    return visTooltipModel;
});