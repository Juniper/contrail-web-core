define([
    'underscore'
], function (_) {
    var ContrailGraphModel = joint.dia.Graph.extend({
        requestInProgress: false,

        elementMap: { node: {}, link: {}},

        generateElements:function(response) {},

        constructor: function (modelConfig, generateElementsFn) {
            this.initialize();
            this.config = modelConfig;
            this.generateElementsFn = generateElementsFn;
        },

        fetchData: function() {
            this.requestInProgress = true;

            var url = this.config.url;
            $.getJSON(url, function (response) {
                var elements = this.generateElements(response, this.elementMap);
                this.addCell(elements);
                this.requestInProgress = false;
            });
        }
    });

    return ContrailGraphModel;
});