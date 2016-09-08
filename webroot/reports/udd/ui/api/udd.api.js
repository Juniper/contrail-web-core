/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

var _ = require("lodash");
var commonUtils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/common.utils");
var config = process.mainModule.exports.config;
var cassandra = require("cassandra-driver");

var uddKeyspace = "config_webui";
var client = new cassandra.Client({ contactPoints: config.cassandra.server_ips, keyspace: "system" });
client.execute("SELECT keyspace_name FROM system.schema_keyspaces;", function(err, result) {
    if (err) {
        console.error(err);
        return;
    }
    if (_.isEmpty(_.filter(result.rows, ["keyspace_name", uddKeyspace]))) {
        // if (client.metadata.keyspaces[uddKeyspace]) {
        // TODO why all keyspaces are nested inside one of them in client.metadata.keyspaces?
        var q1 = "CREATE KEYSPACE " + uddKeyspace + " WITH REPLICATION = {'class' : 'SimpleStrategy', 'replication_factor' : 1};";
        var q2 = "CREATE TYPE config (  title text,  x int,  y int,  width int,  height int,);";
        var q3 = 'CREATE TYPE widget_view (  view text,  "viewPathPrefix" text,  model text,  "modelConfig" text,  "modelPathPrefix" text,);';
        var q4 = 'CREATE TABLE user_widgets (  id uuid,  "userId" text,  "dashboardId" text,  "tabId" text,  "tabName" text, config frozen <config>,  "contentConfig" map<text, frozen <widget_view>>,  PRIMARY KEY(id));';
        var q5 = 'CREATE INDEX ON user_widgets ("userId");';

        client.execute(q1, function() {
            client = connectDB();
            client.execute(q2, function() {
                client.execute(q3, function() {
                    client.execute(q4, function() {
                        client.execute(q5, function() {});
                    });
                });
            });
        });
    } else {
        client = connectDB();
    }
});

function connectDB() {
    return new cassandra.Client({ contactPoints: config.cassandra.server_ips, keyspace: uddKeyspace });
}

function createWidget(req, res) {
    var w = req.body;

    w.id = req.param("id");
    w.userId = req.session.userid;

    var upsertWidget = 'INSERT INTO user_widgets (id, "userId", "dashboardId", "tabId", "tabName", config, "contentConfig") VALUES (?, ?, ?, ?, ?, ?, ?);';
    client.execute(upsertWidget, [w.id, w.userId, w.dashboardId, w.tabId, w.tabName, w.config, w.contentConfig], { prepare: true },
        function(error, result) {
            commonUtils.handleJSONResponse(null, res, { result: result, error: error });
        }
    );
}
// as it is supposed to be not many widgets per user filtering is delegated to client-side
function getWidgets(req, res) {
    var getWidgetsByUser = 'SELECT * FROM user_widgets WHERE "userId" = ?';
    var userId = req.session.userid;
    client.execute(getWidgetsByUser, [userId], function(error, result) {
        commonUtils.handleJSONResponse(null, res, { result: result, error: error });
    });
}

function removeWidget(req, res) {
    var removeWidgetByUser = "DELETE from user_widgets where id = ?";
    var widgetId = req.param("id");
    // var userId = req.session.userid
    client.execute(removeWidgetByUser, [widgetId], function(error, result) {
        commonUtils.handleJSONResponse(null, res, { result: result, error: error });
    });
}

exports.createWidget = createWidget;
exports.getWidgets = getWidgets;
exports.removeWidget = removeWidget;
