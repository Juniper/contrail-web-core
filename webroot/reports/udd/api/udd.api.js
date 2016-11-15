/* Copyright (c) 2016 Juniper Networks, Inc. All rights reserved. */

var _ = require("lodash");
var commonUtils = require(process.mainModule.exports.corePath + "/src/serverroot/utils/common.utils");
var config = process.mainModule.exports.config;
var cassandra = require("cassandra-driver");

var uddKeyspace = "config_webui";
var tableName = "user_widgets";

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
        var q4 = ["CREATE TABLE", tableName, '(  id uuid,  "userId" text,  "dashboardId" text,  "tabId" text, "tabCreationTime" text, "tabName" text, config frozen <config>,  "contentConfig" map<text, frozen <widget_view>>,  PRIMARY KEY(id));'].join(" ");
        var q5 = ["CREATE INDEX ON", tableName, '("userId");'].join(" ");
        var q6 = ["CREATE INDEX ON", tableName, '("tabId");'].join(" ");

        client.execute(q1, function() {
            client = connectDB();
            client.execute(q2, function() {
                client.execute(q3, function() {
                    client.execute(q4, function() {
                        client.execute(q5, function() {
                            client.execute(q6, function() {});
                        });
                    });
                });
            });
        });
    } else {
        client = connectDB();
    }

    /**
     * This code is used to add new "tabCreationTime" column to existing tables.
     * For the existing old tables, the defualt value for this new column will be
     * the current time.
     * 
     * This code won't run for any new table created by the above code snippet.
     * 
     * Once the DB is stable (all existing tables have been augmented with new column),
     * this code should be removed.
     */
    client.execute(['select "tabCreationTime" from', tableName].join(" "), function(err) {
        if (err.message && err.message.toLowerCase() === "undefined name tabcreationtime in selection clause") {
            client.execute(["alter table", tableName, 'add "tabCreationTime" text'].join(" "), function(err) {
                if (!err) {
                    client.execute(["select id from", tableName].join(" "), function(err, result) {
                        var addTabCreationTime = ["update", tableName, 'set "tabCreationTime" = ? where "id" = ?'].join(" ");
                        
                        _.forEach(result.rows, function(row) {
                            client.execute(addTabCreationTime, [Date.now() + "", row.id], function(err) {
                                if (err) {
                                    console.error(err);
                                }
                            });
                        });
                    });
                } else {
                    console.error(err);
                }
            });
        } else if (err) {
            console.error(err);
        }
    });
});

function connectDB() {
    return new cassandra.Client({ contactPoints: config.cassandra.server_ips, keyspace: uddKeyspace });
}

function createWidget(req, res) {
    var w = req.body;

    w.id = req.param("id");
    w.userId = req.session.userid;

    var upsertWidget = ["INSERT INTO", tableName, '(id, "userId", "dashboardId", "tabId", "tabName", "tabCreationTime", config, "contentConfig") VALUES (?, ?, ?, ?, ?, ?, ?, ?);'].join(" ");
    client.execute(upsertWidget, [w.id, w.userId, w.dashboardId, w.tabId, w.tabName, w.tabCreationTime + "", w.config, w.contentConfig], { prepare: true },
        function(error, result) {
            commonUtils.handleJSONResponse(null, res, { result: result, error: error });
        }
    );
}
// as it is supposed to be not many widgets per user filtering is delegated to client-side
function getWidgets(req, res) {
    var getWidgetsByUser = ["SELECT * FROM", tableName, 'WHERE "userId" = ?'].join(" ");
    var userId = req.session.userid;
    client.execute(getWidgetsByUser, [userId], function(error, result) {
        commonUtils.handleJSONResponse(null, res, { result: result, error: error });
    });
}

function removeWidget(req, res) {
    var removeWidgetByUser = ["DELETE from", tableName, "where id = ?"].join(" ");
    var widgetId = req.param("id");
    // var userId = req.session.userid
    client.execute(removeWidgetByUser, [widgetId], function(error, result) {
        commonUtils.handleJSONResponse(null, res, { result: result, error: error });
    });
}

exports.createWidget = createWidget;
exports.getWidgets = getWidgets;
exports.removeWidget = removeWidget;
