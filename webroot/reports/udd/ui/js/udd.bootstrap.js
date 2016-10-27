/**
 * UDD Loader definition model
 */

define(["require"], function(require) {
    return function UDDashboardLoader() {
        this.load = function (paramObject) {
            var self = this,
                UDDViewPath = window.coreBaseDir + "views/UDDashboardView.js",
                UDDModelPath = window.coreBaseDir + "models/WidgetsCollection.js",
                loadingStartedDefObj = paramObject.loadingStartedDefObj;

            self.hashParams = paramObject.hashParams;

            require([UDDViewPath, UDDModelPath], function (UDDView, WidgetsCollection) {
                if (self.widgets) {
                    self.uddView.render();
                } else {
                    self.widgets = new WidgetsCollection(null, {url: window.cowl.UDD_WIDGET_URL});
                    self.uddView = new UDDView({model: self.widgets});
                    self.widgets.fetch().done(self.uddView.render.bind(self.uddView));
                }

                if (window.contrail.checkIfExist(loadingStartedDefObj)) {
                    loadingStartedDefObj.resolve();
                }
            });
        };
    };
});
