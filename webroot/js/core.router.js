/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var CoreRouter = Backbone.Router.extend({
        initialize: function(options) {
            this.route(/.*/, "defaultPageHandler");
        },

        defaultPageHandler: function() {
            if(!contrail.checkIfExist(menuHandler)) {
                layoutHandler.load();
            } else {
                currHash = $.bbq.getState();

                //Don't trigger hashChange if URL hash is updated from code
                //As the corresponding view has already been loaded from the place where hash is updated
                //Ideally,whenever to load a view,just update the hash let it trigger the handler,instead calling it manually

                if (globalObj.hashUpdated == 1) {
                    globalObj.hashUpdated = 0;
                    lastHash = currHash;
                    return;
                }

                logMessage('hashChange', JSON.stringify(lastHash), ' -> ', currHash);
                logMessage('hashChange', JSON.stringify(currHash));

                layoutHandler.onHashChange(lastHash, currHash);
                lastHash = currHash;
            }
        }
    });

    return CoreRouter;
});