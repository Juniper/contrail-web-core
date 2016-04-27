define(['underscore', 'contrail-model', 'vis-tooltip-model'],
function(_, ContrailModel, VisTooltipModel) {
	var visEdgeModel = ContrailModel.extend({
		defaultConfig: {
			"element_id"		: null,
			"endpoints"			: null,
			"link_type"     	: null,
			"tooltip"			: null,
			"title"				: "",
			"arrows"			: null,
			"tooltipConfig"		: null,
			"color"				: "rgba(57,57,57,.6)"
		},
		constructor: function(edgeData, nodesCollection) {
			var modelConfig = {
				"from"		: null,
				"to"		: null
			};
			if(edgeData.hasOwnProperty("endpoints") &&
				edgeData["endpoints"].length == 2) {
				 var fromNode = 
					_.filter(nodesCollection.models, function(model){ 
						return (model.attributes.name() == edgeData["endpoints"][0]);
					});
				if(fromNode && fromNode.length > 0) {
					modelConfig["from"] = fromNode[0].attributes.element_id();
				}
				var toNode = 
					_.filter(nodesCollection.models, function(model){ 
						return (model.attributes.name() == edgeData["endpoints"][1]);
					});
				if(toNode && toNode.length > 0) {
					modelConfig["to"] = toNode[0].attributes.element_id();
				}

			}
			edgeData = $.extend(true, {}, modelConfig, edgeData);
			ContrailModel.prototype.constructor.call(this, edgeData);
			return this;
		},
		formatModelConfig: function(modelConfig) {
			var self = this;
			if(modelConfig.hasOwnProperty("from") &&
				modelConfig["from"].trim() !== "" &&
				modelConfig.hasOwnProperty("to") &&
				modelConfig["to"].trim() !== "") {
				modelConfig["element_id"] = UUIDjs.create().hex;
			}
			return modelConfig;
		},
        validateAttr: {},
        validations: {}
	});
	return visEdgeModel;
});