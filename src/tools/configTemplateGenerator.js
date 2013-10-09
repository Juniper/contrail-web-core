/*
 * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.
 */

fs = require('fs'),
xml2js = require('xml2js'),
g = require('./global'),
cut = require('./cutils'),
util = require('util');

var parser = new xml2js.Parser();
var WEB_ROOT = "webroot/";
var CONFIG_FRAMEWORK_DIR = "src/xml/config_framework/";
var CONFIG = "config";
var JS_EXTN = ".js";
var JS_DIR= "js/";
var GLOBAL_CONFIG_FILE = WEB_ROOT + JS_DIR + "config_global" + JS_EXTN;
var CONFIG_OUTPUT_DIR = WEB_ROOT + CONFIG + "/";

createIncludeFile();
readFiles();

function createIncludeFile() {
    fs.stat(GLOBAL_CONFIG_FILE, function(a) {
        var str = getToBeIncluded();
        fs.writeFile(GLOBAL_CONFIG_FILE,
            str, function(err) {
            if (err) throw err;
        });
    });
}

function getToBeIncluded() {
    var global_str = "";
    global_str += 
    '/*\n' +
    ' * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.\n' + 
    ' */\n' +
    '\n';

    for (var key in global) {
        if (global.hasOwnProperty(key)) {
            if(cut.isNumber(global[key]))
                global_str += "var " + key + " = " + global[key] + ";\n";
            else
                global_str += "var " + key + " = " + "\"" +
                    global[key] + "\";\n";
        }
    }
    global_str += "\n\n";
    for (var key in cut) {
        if (cut.hasOwnProperty(key)) {
            global_str += cut[key].toString() + "\n";            
        }
    }
 
    return global_str;
}

function readFiles() {
    var xmlFiles = [];
    var filesCount = 0;
    var arrDir = fs.readdirSync(CONFIG_FRAMEWORK_DIR);
    for(var dir in arrDir) {
        if(arrDir.hasOwnProperty(dir)) {
            var files = fs.readdirSync(CONFIG_FRAMEWORK_DIR + arrDir[dir]);
            for(var file in files) {
                if(files.hasOwnProperty(file)) {
                    if(getExtension(files[file]+"") == (".xml".toLowerCase())) {
                        xmlFiles[filesCount] = {};
                        xmlFiles[filesCount].dir = arrDir[dir];
                        xmlFiles[filesCount].file = files[file];
                        filesCount++;
                    }
                }
            }
        }
    }
    for(var i in xmlFiles) {
        if(xmlFiles.hasOwnProperty(i)) {
            readXMLFile(xmlFiles[i]);
        }
    }
}

function readXMLFile(xmlFiles) {
    fs.readFile(CONFIG_FRAMEWORK_DIR + xmlFiles.dir + "/" +  
        xmlFiles.file, function(err, data) {
        var featureName = xmlFiles.dir;
        var fileName = 
        CONFIG_OUTPUT_DIR + xmlFiles.dir + "/" + JS_DIR + 
        CONFIG + "_" + xmlFiles.dir + JS_EXTN;
        parser.parseString(data, function(err, result) {
            startProcessingResult(fileName, featureName, result);
        });
    });
}

function startProcessingResult(fileName, featureName, result) {
    var config = processResult(result);
    fs.stat(fileName, function(res) {
        try {
            fs.mkdirSync(CONFIG_OUTPUT_DIR+featureName);
            fs.mkdirSync(CONFIG_OUTPUT_DIR+featureName+"/"+JS_DIR);
            fs.writeFile(fileName,
                getToBeGeneratedScript(util.format("%j", config), featureName), 
                function(err) {
                if (err) throw err;
                console.log("Done, creating file: " + fileName);
            });
        } catch (e) {
            fs.writeFile(fileName,
                getToBeGeneratedScript(util.format("%j", config), featureName), 
                function(err) {
                if (err) throw err;
                console.log("Done, creating file: " + fileName);
            });
        }
    });
}

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

function processResult(result) {
    var config = {};
    var page, page_id, page_width, page_height, url, title, table_id;
    var paging, page_size;
    var sortable, sort_type;
    var selectable, multiple;
    var config_tables, config_tabs, columns, tables=[], targets=[];
    var config_panels;

    if(cut.isSet(result.page)) {
        page = result.page;
        if(cut.isSet(page.$)) {
            page_width = page.$.width;
            if(cut.isSet(page_width)) {
                if(cut.isNumber(page_width)) {
                    page_width = parseInt(page_width);
                    if(page_width < g.PAGE_MIN_WIDTH_PX)
                       page_width = g.PAGE_MIN_WIDTH_PX + g.FORMAT_PIXEL;
                    else
                        page_width += g.FORMAT_PIXEL;
                }
                else if(cut.isString(page_width)) {
                    if((page_width).indexOf(g.FORMAT_PERCENTAGE) != -1) {
                        if(parseInt((page_width).
                        split(g.FORMAT_PERCENTAGE)[0]) < g.PAGE_MIN_WIDTH_PT) {
                            page_width = g.PAGE_MIN_WIDTH_PT + 
                            g.FORMAT_PERCENTAGE;
                        }
                        else {
                            page_width =
                            parseInt((page_width).
                            split(g.FORMAT_PERCENTAGE)[0]) +g.FORMAT_PERCENTAGE;
                        }
                    }
                    else if((page_width).indexOf(g.FORMAT_PIXEL) != -1) {
                        if(parseInt((page_width).split(g.FORMAT_PIXEL)[0]) <
                            g.PAGE_MIN_WIDTH_PX) {
                            page_width = g.PAGE_MIN_WIDTH_PX + g.FORMAT_PIXEL;
                        }
                        else {
                            page_width =
                            parseInt((page_width).split(g.FORMAT_PIXEL)[0]) +
                            g.FORMAT_PIXEL;
                        }
                    }
                }
                else {
                    page_width = g.PAGE_DEFAULT_WIDTH_PX + g.FORMAT_PIXEL;
                }
            }
            else {
                //page_width = g.PAGE_DEFAULT_WIDTH_PX + g.FORMAT_PIXEL;
            }
            config.pagewidth = page_width;

            page_height = page.$.height;
            if(cut.isSet(page_height)) {
                if(cut.isNumber(page_height)) {
                    page_height = parseInt(page_height);
                    if(page_height < g.PAGE_MIN_HEIGHT_PX)
                       page_height = g.PAGE_MIN_HEIGHT_PX + g.FORMAT_PIXEL;
                    else
                        page_height += g.FORMAT_PIXEL;
                }
                else if(cut.isString(page_height)) {
                    if((page_height).indexOf(g.FORMAT_PERCENTAGE) != -1) {
                        if(parseInt((page_height).
                        split(g.FORMAT_PERCENTAGE)[0]) < g.PAGE_MIN_HEIGHT_PT) {
                            page_height = g.PAGE_MIN_HEIGHT_PT +
                                g.FORMAT_PERCENTAGE;
                        }
                        else {
                            page_height =
                            parseInt((page_height).
                            split(g.FORMAT_PERCENTAGE)[0]) +g.FORMAT_PERCENTAGE;
                        }
                    }
                    else if((page_height).indexOf(g.FORMAT_PIXEL) != -1) {
                        if(parseInt((page_height).split(g.FORMAT_PIXEL)[0]) <
                        g.PAGE_MIN_HEIGHT_PX) {
                            page_height = g.PAGE_MIN_HEIGHT + g.FORMAT_PIXEL;
                        }
                        else {
                            page_height =
                            parseInt((page_height).split(g.FORMAT_PIXEL)[0]) +
                            g.FORMAT_PIXEL;
                        }
                    }
                } else {
                    page_height = g.PAGE_DEFAULT_HEIGHT + g.FORMAT_PIXEL;
                }
            }
            else {
                //page_height = g.PAGE_DEFAULT_HEIGHT_PX + g.FORMAT_PIXEL;
            }
            config.pageheight = page_height;

            page_id = page.$.id;
            if(!cut.isSet(page_id)) {
                page_id = "" + cut.generateUniqueID();
            }
            config.pageid = page_id;

            page_rows = page.$.rows;
            if(cut.isSet(page_rows)) {
                try {
                    page_rows = parseInt(page_rows.toString().trim());
                }
                catch (e) {
                    page_rows = 1;
                }
            }
            else {
                page_rows = 1;
            }

            config.rows = page_rows;

            page_cols = page.$.columns;
            if(cut.isSet(page_cols)) {
                try {
                    page_cols = parseInt(page_cols.toString().trim());
                }
                catch (e) {
                    page_cols = 1;
                }
            }
            else {
                page_cols = 1;
            }
            config.cols = page_cols;        
        }
        else {
            config.cols = 1;
            config.rows = 1;
            config.pageid = "" + cut.generateUniqueID();
        }
        
        config_urls = page["urls"];
        if(cut.isSet(config_urls)) {
            config.urls = [];
            config.urls = getURLConfig(config_urls);
        }
        
        config_tabs = page["tab"];
        if(cut.isSet(config_tabs)) {
            config.tabs = [];
            config.tabs = getTabConfig(config_tabs,config.pageid);
        }

        config_tables = page["table"];
        if(cut.isSet(config_tables)) {
            config.tables = [];
            config.tables = getTableConfig(config_tables,config.pageid);
        }
        
        config_panels = page["panel"];
        if(cut.isSet(config_panels)) {
            config.panels = [];
            config.panels = getPanelConfig(config_panels,config.pageid);        
        }
        
        return config;
    }
}

function getURLConfig(config_urls) {
    var urls = [];
    if(config_urls && config_urls.length > 0) {
        config_urls = config_urls[0].url;
        for(var i=0; i< config_urls.length; i++) {
            urls[i] = config_urls[i];
        }
    }
    return urls;
}

function getTabConfig(config_tabs, config_page_id) {
    var tabs = [];
    if(config_tabs && config_tabs.length > 0) {
        for(var i=0; i< config_tabs.length; i++) {
            tabs[i] = {};
            tab_id = config_tabs[i].$["id"];
            if(cut.isSet(tab_id)) {
                tabs[i].id = tab_id.toString().trim();
            }
            else {
                tabs[i].id = config_page_id + "_tab_" + i;
            }
            tab_title = config_tabs[i].$["title"];
            if(cut.isSet(tab_title)) {
                tabs[i].title = tab_title.toString().trim();
            }
            else {
                tabs[i].title = "";
            }

            tab_rows = config_tabs[i].$["rows"];
            if(cut.isSet(tab_rows)) {
                try {
                    tab_rows = parseInt(tab_rows.toString().trim());
                }
                catch (e) {
                    tab_rows = 1;
                }
            }
            else {
                tab_rows = 1;
            }
            tabs[i].rows = tab_rows;

            tab_row = config_tabs[i].$["row"];
            if(cut.isSet(tab_row)) {
                try {
                    tab_row = parseInt(tab_row.toString().trim());
                }
                catch (e) {
                    tab_row = 1;
                }
            }
            else {
                tab_row = 1;
            }
            tabs[i].row = tab_row;

            tab_cols = config_tabs[i].$["cols"];
            if(cut.isSet(tab_cols)) {
                try {
                    tab_cols = parseInt(tab_cols.toString().trim());
                }
                catch (e) {
                    tab_cols = 1;
                }
            }
            else {
                tab_cols = 1;
            }
            tabs[i].cols = tab_cols;

            tab_col = config_tabs[i].$["col"];
            if(cut.isSet(tab_col)) {
                try {
                    tab_col = parseInt(tab_col.toString().trim());
                }
                catch (e) {
                    tab_col = 1;
                }
            }
            else {
                tab_col = 1;
            }
            tabs[i].col = tab_col;

            tab_tables = config_tabs[i]["table"];
            if(cut.isSet(tab_tables)) {
                tabs[i].tables = [];
                tabs[i].tables = getTableConfig(tab_tables, tabs[i].id);
            }

            tab_panels = config_tabs[i]["panel"];
            if(cut.isSet(tab_panels)) {
                tabs[i].panels = [];
                tabs[i].panels = getPanelConfig(tab_panels, tabs[i].id);
            }
            
            tab_tabs = config_tabs[i]["tab"];
            if(cut.isSet(tab_tabs)) {
                tabs[i].tabs = [];
                tabs[i].tabs = getTabConfig(tab_tabs, tabs[i].id);
            }
        }
    }
    return tabs;
}

function getPanelConfig(config_panels, config_page_id) {
    var panels=[];
    if(!cut.isSet(config_panels))
        return null;
    for(var i=0; i<config_panels.length; i++) {
        panels[i] = {};
        var panel = config_panels[i];
        var panel_id = panel.$["id"];
        if(cut.isSet(panel_id)) {
            panels[i].id = panel_id.toString().trim();
        }
        else {
            panels[i].id = config_page_id + "_panel_" + i;
        }
        var panel_attr_row = panel.$["row"];
        if(cut.isSet(panel_attr_row)) {
            panels[i].row = panel_attr_row.toString().trim();
        }
        else {
            panels[i].row = 1;
        }
        var panel_attr_col = panel.$["col"];
        if(cut.isSet(panel_attr_col)) {
            panels[i].col = panel_attr_col.toString().trim();
        }
        else {
            panels[i].col = 1;
        }
        
        if(cut.isSet(panel["row"])) {
            var panel_rows = panel.row.length;
            if(panel_rows > 0) {
                panels[i].rows = panel_rows;
                panels[i].cols = 1;
                panels[i]["prow"] = [];
            }
            for(var row=0; row<panel_rows; row++) {
                var panel_row = panel.row[row];
                panels[i]["prow"][row] = [];
                if(cut.isSet(panel_row["col"])) {
                    var panel_cols = panel_row["col"].length;
                    if(panel_cols > 0) {
                        panels[i]["prow"][row]={};
                        panels[i]["prow"][row]["pcol"]=[];
                    }

                    for(var col=0; col<panel_cols; col++) {
                        var panel_col = panel_row["col"][col];
                        if(cut.isSet(panel_col["element"])) {
                            panel_els = panel_col.element.length;
                            if(panel_els > 0) {
                                panels[i]["prow"][row]["pcol"][col] = {};
                                panels[i]["prow"][row]["pcol"][col]["element"] = 
                                [];
                            }
                            for(var el=0; el<panel_els; el++) {
                                var element = panel_col["element"][el];
                                panels[i]["prow"][row]["pcol"][col]["element"][el]
                                = {};
                                panels[i]["prow"][row]["pcol"][col]["element"][el].title
                                = element.$["label"];
                                if(!cut.isSet(element.$["type"]))
                                    panels[i]["prow"][row]["pcol"]
                                    [col]["element"][el].type = "label";
                                else
                                    panels[i]["prow"][row]["pcol"][col]
                                    ["element"][el].type = element.$["type"];

                                if(cut.isSet(element.$["helptext"]))
                                    panels[i]["prow"][row]["pcol"]
                                    [col]["element"][el].help = 
                                    element.$["helptext"];

                                if(cut.isSet(element.$["datasource-url"]))
                                    panels[i]["prow"][row]["pcol"]
                                    [col]["element"][el].url = 
                                    element.$["datasource-url"];

                                if(cut.isSet(element.$["range"]))
                                    panels[i]["prow"][row]["pcol"]
                                    [col]["element"][el].range = 
                                    element.$["range"];

                                if(cut.isSet(element.$["value"]))
                                    panels[i]["prow"][row]["pcol"]
                                    [col]["element"][el].value = 
                                    element.$["value"];
                                
                                if(cut.isSet(element.$["field"])) {
                                    panels[i]["prow"][row]["pcol"][col]["element"][el].field
                                    = element.$["field"];
                                }
                                if(cut.isSet(element.$["path"])) {                                
                                    panels[i]["prow"][row]["pcol"][col]["element"][el].path
                                    = element.$["path"];
                                }
                                if(cut.isSet(element.$["format"])) {
                                    panels[i]["prow"][row]["pcol"][col]["element"][el].format
                                    = element.$["format"];
                                }
                                if(cut.isSet(element.$["datasource-url"])) {
                                    panels[i]["prow"][row]["pcol"][col]["element"][el].format
                                    = element.$["datasource-url"];
                                }
                                if(cut.isSet(element.$["lhspath"])) {
                                    panels[i]["prow"][row]["pcol"][col]["element"][el].format
                                    = element.$["lhspath"];
                                }
                                if(cut.isSet(element.$["rhspath"])) {
                                    panels[i]["prow"][row]["pcol"][col]["element"][el].format
                                    = element.$["rhspath"];
                                }
                            }
                        }
                    }
                }
            }
        }        
    }
    return panels;
}

function getTableConfig(config_tables, config_page_id) {
    var tables=[];
    for(var i=0; i<config_tables.length; i++) {
        tables[i] = {};

        var table_id = config_tables[i].$["id"];
        if(cut.isSet(table_id)) {
            tables[i].id = table_id.toString().trim();
        }
        else {
            tables[i].id = config_page_id + "_table_" + i;
        }

        var table_type = config_tables[i].$["type"];
        if(cut.isSet(table_type)) {
            tables[i].type = table_type.toString().trim();
        }
        else {
            tables[i].type = "";
        }

        var table_row = config_tables[i].$["row"];
        if(cut.isSet(table_row)) {
            try {
                table_row = parseInt(table_row.toString().trim());
            }
            catch (e) {
                table_row = 1;
            }
        }
        else {
            table_row = 1;
        }
        tables[i].row = table_row;

        var table_col = config_tables[i].$["col"];
        if(cut.isSet(table_col)) {
            try {
                table_col = parseInt(table_col.toString().trim());
            }
            catch (e) {
                table_col = 1;
            }
        }
        else {
            table_col = 1;
        }
        tables[i].col = table_col;

        var title = config_tables[i].$["title"];
        if(cut.isSet(title)) {
            tables[i].title = title.toString().trim();
        }
        else {
            tables[i].title = "";
        }

        var url = config_tables[i].$["datasource-url"];
        if(cut.isSet(url)) {
            tables[i].url = url.toString().trim();
        }
        else {
            tables[i].url = "";
        }

        var geturl = config_tables[i].$["get-url"];
        if(cut.isSet(geturl)) {
            tables[i].geturl = geturl.toString().trim();
        }
        else {
            tables[i].geturl = "";
        }

        var serverPaging = config_tables[i]["server-paging"];
        var paging;
        if(cut.isSet(serverPaging)) {
            if(serverPaging === false || serverPaging.toString() === "false") {
                tables[i].serverpaging = false;
                tables[i].pagesize = g.TABLE_PAGING_SIZE;
                paging = config_tables[i]["paging"];
                if(cut.isSet(paging)) {
                    if(paging === false || paging.toString() === "false") {
                        tables[i].paging = false;
                        tables[i].pagesize = 0;
                    }
                    else {
                        tables[i].paging = true;
                        tables[i].pagesize = getPageSize(paging);
                    }
                }
                else {
                    tables[i].paging = false;
                    tables[i].pagesize = 0;                
                }
            }
            else {
                tables[i].serverpaging = true;
                tables[i].pagesize = getPageSize(serverPaging);
            }
        } else {
            paging = config_tables[i]["paging"];
            if(cut.isSet(paging)) {
                if(paging === false || paging.toString() === "false") {
                    tables[i].paging = false;
                    tables[i].pagesize = 0;
                }
                else {
                    tables[i].paging = true;
                    tables[i].pagesize = getPageSize(paging);
                }
            } else {
                tables[i].serverpaging = true;
                tables[i].pagesize = g.TABLE_PAGING_SIZE;
            }
        }

        var sortable = config_tables[i]["sortable"];
        var at;
        if(cut.isSet(sortable)) {
            if(sortable === false || sortable.toString() === "false") {
                tables[i].sortable = false;
                tables[i].sortat = "client";
            }
            else {
                tables[i].sortable = true;
                var at = sortable[0].$["at"];
                tables[i].sortat = "server";
                if(cut.isSet(at)) {
                    if(at.toLowerCase().indexOf("client") != -1) {
                        tables[i].sortat = "client";
                    }
                }
            }
        } else {
            tables[i].sortable = true;
            tables[i].sortat = "server";
        }

        var selectable = config_tables[i]["selectable"];
        if(cut.isSet(selectable)) {
            if(selectable === false ||
                selectable.toString() === "false") {
                tables[i].selectable = false;
                tables[i].multiple = false;
            }
            else {
                tables[i].selectable = true;
                var multiple = selectable[0].$["multiple"];
                if(cut.isSet(multiple)) {
                    if(multiple === true || multiple.toString() === "true") {
                        tables[i].multiple = true;
                    }
                    else if(multiple === false || multiple.toString() === "false") {
                        tables[i].multiple = false;
                    }
                    else {
                        tables[i].multiple = true;
                    }
                } else {
                    tables[i].multiple = true;
                    //multiple = Boolean(multiple);
                }
            }
        } else {
            tables[i].selectable = true;
            tables[i].multiple = true;
        }

        var filterable = config_tables[i]["filterable"];
        if(cut.isSet(filterable)) {
            if(filterable === false ||
                filterable.toString() === "false") {
                tables[i].filterable = false;
                tables[i].filterat = "client";
            }
            else {
                tables[i].filterable = true;
                tables[i].filterat = "server";
                var at = filterable[0].$["at"];
                if(cut.isSet(at)) {
                    if(at.toLowerCase().indexOf("client") != -1) {
                        tables[i].filterat = "client";
                    }
                }
            }
        } else {
            tables[i].filterable = true;
            tables[i].filterat = "server";
        }
        
        var targets = config_tables[i]["target"];
        if(cut.isSet(targets)) {
            if(targets.length == 1) {
                var target_tables = targets[0]["table"];
                if(cut.isSet(target_tables)) {
                    var t_count = target_tables.length;
                    if(t_count > 0) {
                        tables[i].targets = [];
                        for(var count=0; count < t_count; count++) {
                            var target = target_tables[count];
                            tables[i].targets[count] =
                                target.toString().trim();
                        }
                    }
                }
            }
        }

        var columns = config_tables[i]["columns"][0];
        if(cut.isSet(columns)) {
            columns = getColumnsObj(columns, tables[i].type);
        }
        tables[i].columns = columns;
        var table_actions;
        if(typeof config_tables[i]["actions"] !== "undefined")
            table_actions = config_tables[i]["actions"][0];
        else
            table_actions = null;
        if(cut.isSet(table_actions)) {
            table_actions = getActionsObj(table_actions, url);
            tables[i].tableactions = table_actions;
        }
    }
    return tables;
}

function getPageSize(paging) {
    var psize = paging[0].$["page-size"];
    var pagesize = 0;
    if(cut.isSet(psize)) {
        try {
            pagesize = parseInt(psize);
        } catch(e) {
            pagesize = g.TABLE_PAGING_SIZE;
        }
    } else {
        pagesize = g.TABLE_PAGING_SIZE;
    }
    return pagesize;
}

function getColumnsObj(cols, type) {
    var columns = [];
    var col_count = cols.column.length;

    if(col_count > 0) {
        for(var i=0; i<col_count; i++) {
            var col = cols.column[i];
            columns[i] = {};
            if(cut.isSet(col.$)) {
                var col_width = col.$["width"];
                if(cut.isSet(col_width)) {
                    col_width = col_width.toString().trim();
                }
                else {
                    col_width = "0px";
                }
                columns[i].width = col_width;

                var col_setpath = col.$["setpath"];
                if(cut.isSet(col_setpath)) {
                    col_setpath = col_setpath.toString().trim();
                }
                else {
                    col_setpath = "";
                }
                columns[i].setpath = col_setpath;

                var col_primary = col.$["primary"];
                if(cut.isSet(col_primary)) {
                    if(col_primary === false ||
                        col_primary.toString().trim() === "false") {
                        col_primary = false;
                    }
                    else
                        col_primary = true;
                }
                else {
                    col_primary = false;
                }
                columns[i].primary = col_primary;
    
                var col_title = col.$["title"];
                if(cut.isSet(col_title)) {
                    col_title = col_title.toString().trim();
                }
                else {
                    col_title = "";
                }
                columns[i].title = col_title;

                var col_path = col.$["path"];
                if(cut.isSet(col_path)) {
                    col_path = col_path.toString().trim();
                }
                else {
                    col_path = "";
                }
                columns[i].path = col_path;

                var col_type = col.$["type"];
                if(cut.isSet(col_type)) {
                    col_type = col_type.toString().trim();
                }
                else {
                    col_type = "";
                }
                columns[i].type = col_type;
                
                var col_format = col.$["format"];
                if(cut.isSet(col_format)) {
                    col_format = col_format.toString().trim();
                } else {
                    col_format = "";
                }
                columns[i].format = col_format;

                var col_field = col.$["field"];
                if(cut.isSet(col_field)) {
                    col_field = col_field.toString().trim();
                }
                else {
                        col_field = "";
                }
                columns[i].field = col_field;

                var col_filterable = col.$["filterable"];
                if(cut.isSet(col_filterable)) {
                    if(col_filterable === false ||
                        col_filterable.toString().trim() === "false") {
                        col_filterable = false;
                    }
                    else
                        col_filterable = true;
                }
                else {
                    col_filterable = true;
                }
                columns[i].filterable = col_filterable;
    
                var visibility = col.$["visible"];
                if(cut.isSet(visibility)) {
                    if(visibility === false ||
                        visibility.toString().trim() === "false") {
                        visibility = false;
                    }
                    else
                        visibility = true;
                }
                else {
                    visibility = true;
                }
                columns[i].visible = visibility;
            }

            if(type === "detail") {
                if(cut.isSet(col["rowvalue"])) {
                    var rowvalues = col["rowvalue"];
                    if(cut.isSet(rowvalues)) {
                        var rowvalues_count = rowvalues.length;
                        if(rowvalues_count > 0) {
                            columns[i].rowvalues = [];
                            for(var rowcount=0; rowcount<rowvalues_count;
                                rowcount++) {
                                columns[i].rowvalues[rowcount] =
                                    rowvalues[rowcount].toString().trim();
                            }
                        }
                    }
                }

                if(cut.isSet(col["rowfield"])) {
                    var rowfields = col["rowfield"];
                    if(cut.isSet(rowfields)) {
                        var rowfields_count = rowfields.length;
                        if(rowfields_count > 0) {
                            columns[i].rowfields = [];
                            for(var rowcount=0; rowcount<rowfields_count;
                                rowcount++) {
                                columns[i].rowfields[rowcount] =
                                    rowfields[rowcount].toString().trim();
                            }
                        }
                    }
                }
            }
            if(cut.isSet(col.$)) {
                var column_type = col.$["type"];
                if(cut.isSet(column_type)) {
                    if(column_type === "action") {
                        //Action column
                        columns[i].type = column_type;
                        var col_values = col.values;
                        if(col_values && col_values.length > 0) {
                            col_values = col_values[0];
                            columns[i].values = {};
                            if(cut.isSet(col_values.$["action"]))
                                columns[i].values.action =
                                col_values.$["action"];
                            if(cut.isSet(col_values.value) &&
                                col_values.value.length > 0) {
                                columns[i].values.items = 
                                col_values.value.toString().trim();
                            }
                        }
                    }
                }
            }
        }
    }
    return columns;
}

function getActionsObj(actions) {
    var table_actions = actions.action;
    actions = [];
    var action_count = table_actions.length;

    if(action_count > 0) {
        for(var i=0; i<action_count; i++) {
            var action = table_actions[i];
            actions[i] = {};
            var action_type = action.$["type"];
            if(!cut.isSet(action_type)) {
                action_type = "";
            }
            else {
                action_type = action_type.toString().trim();
            }
            actions[i].type = action_type;

            var action_validator = action.$["validate"];
            if(!cut.isSet(action_validator)) {
                action_validator = "defaultValidator";
            }
            else {
                action_validator = action_validator.toString().trim();
            }
            actions[i].validate = action_validator;
            
            var action_path = action.$["path"];
            if(!cut.isSet(action_path)) {
                action_path = "";
            }
            else {
                action_path = action_path.toString().trim();
            }
            actions[i].path = action_path;

            var action_process = action.$["process"];
            if(!cut.isSet(action_process)) {
                action_process = "row";
            }
            else {
                action_process = action_process.toString().trim();
            }
            actions[i].process = action_process;

            var action_method = action.$["method"];
            if(!cut.isSet(action_method)) {
                if(action_type == "add") {
                    action_method = "POST";
                }
                else if(action_type == "edit") {
                    action_method = "PUT";
                }
                else if(action_type == "delete") {
                    action_method = "DELETE";
                } else {
                    action_method = "GET";
                }
            }
            else {
                action_method = action_method.toString().trim();
            }
            actions[i].method = action_method;

            var action_width = action.$["width"];
            if(!cut.isSet(action_width)) {
                action_width = "";
            }
            else {
                action_width = action_width.toString().trim();
            }
            actions[i].width = action_width;

            var action_title = action.$["title"];
            if(!cut.isSet(action_title)) {
                action_title = "";
            }
            else {
                action_title = action_title.toString().trim();
            }
            actions[i].title = action_title;

            var action_text = action.$["text"];
            if(!cut.isSet(action_text)) {
                action_text = "";
            }
            else {
                action_text = action_text.toString().trim();
            }
            actions[i].text = action_text;
            

            var action_okhandler = action.$["ok-action"];
            if(!cut.isSet(action_okhandler)) {
                action_okhandler = "defaultOKHandler";
            }
            else {
                action_okhandler = action_okhandler.toString().trim();
            }
            actions[i].okaction = action_okhandler;

            var action_url = action.$["submit-url"];
            if(!cut.isSet(action_url)) {
                action_url = "";
            }
            else {
                action_url = action_url.toString().trim();
            }
            actions[i].submiturl = action_url;

            if(cut.isSet(action.template)) {
                action.template = action.template[0];
                if(cut.isSet(action.template)) {
                    actions[i].template = action.template;
                }
            }

            if(cut.isSet(action.forms)) {
                action.forms = action.forms[0];
                if(cut.isSet(action.forms)) {
                    var forms_count = action.forms.form.length;
                    if(forms_count > 0) {
                        actions[i].forms = [];
                        for(formIndex=0; formIndex<forms_count; formIndex++) {
                            var form = action.forms.form[formIndex];
                            actions[i].forms[formIndex] = {};
                            var form_title = form.$["title"];
                            if(cut.isSet(form_title)) {
                                form_title = form_title.toString().trim();
                            }
                            else
                                form_title = "";
                            actions[i].forms[formIndex].title = form_title;

                            if(form.elements && form.elements.length > 0 &&
                                form.elements[0].row && 
                                form.elements[0].row.length > 0) {
                                
                                var rowCount = form.elements[0].row.length;
                                actions[i].forms[formIndex].elements=[];
                                for(var row=0; row<rowCount; row++) {
                                    var formRow = form.elements[0].row[row];
                                    if(formRow.col && formRow.col.length > 0) {
                                        actions[i].forms[formIndex].
                                        elements[row] = [];
                                        var colCount = formRow.col.length;
                                        
                                        for(col=0; col<colCount; col++) {
                                            if(formRow.col[col].element &&
                                            formRow.col[col].element.length > 0)
                                            {
                                                actions[i].forms[formIndex].
                                                elements[row][col]=[];
                                                var elements = 
                                                formRow.col[col].element;
                                                for(elIndex=0; 
                                                elIndex<elements.length; 
                                                elIndex++) {
                                                    var element = 
                                                    elements[elIndex];
                                                    actions[i].forms[formIndex].
                                                    elements[row][col][elIndex]
                                                    ={};
                                                    var el = actions[i].
                                                    forms[formIndex].
                                                    elements[row][col][elIndex];
                                                    
                                                    var el_title = 
                                                    element.$["label"];
                                                    if(cut.isSet(el_title)) {
                                                        el.title = 
                                                        el_title.toString().
                                                        trim();
                                                    }
                                                    else
                                                        el.title = "";

                                                    var el_type = 
                                                    element.$["type"];
                                                    if(cut.isSet(el_type)) {
                                                        el.type = 
                                                        el_type.toString().
                                                        trim();
                                                        if(el.type === 
                                                        "multiselect") {
                                                            var el_lhstitle = 
                                                            element.
                                                            $["lhslabel"];
                                                            if(cut.isSet(
                                                            el_lhstitle)) {
                                                                el.lhstitle = 
                                                                el_lhstitle.
                                                                toString()
                                                                .trim();
                                                            }
                                                            else
                                                                el.lhstitle = 
                                                                "";
                            
                                                            var el_rhstitle = 
                                                            element.
                                                            $["rhslabel"];
                                                            if(cut.isSet(
                                                            el_rhstitle)) {
                                                                el.rhstitle = 
                                                                el_rhstitle.
                                                                toString().
                                                                trim();
                                                            }
                                                            else
                                                                el.rhstitle = 
                                                                "";
                                                        }
                                                    }
                                                    else
                                                        el.type = "label";

                                                    var el_width =
                                                    element.$["width"];
                                                    if(cut.isSet(el_width)) {
                                                        var el_label_width =
                                                        element.$["labelwidth"];
                                                        if(cut.isSet(el_label_width)) {
                                                            el.labelwidth =
                                                            el_label_width;
                                                        }
                                                        el.width =
                                                        parseInt
                                                        (el_width.toString().
                                                        trim());
                                                    }
                                                    else {
                                                        if(el.type === "hidden")
                                                        el.width = 0;
                                                        else if(el.type === "multiselect")
                                                        el.width = g.MULTISELECT_WIDTH;
                                                        else
                                                        el.width = g.ELEMENT_WIDTH;
                                                        var el_label_width =
                                                        element.$["labelwidth"];
                                                        if(cut.isSet(el_label_width)) {
                                                            el.labelwidth =
                                                            el_label_width;
                                                        }
                                                    }

                                                    var el_id = 
                                                    element.$["id"];
                                                    if(cut.isSet(el_id)) {
                                                        el.id = 
                                                        el_id.toString().
                                                        trim();
                                                    }
                                                    else
                                                        el.id = "";

                                                    var el_mandatory = 
                                                    element.$["mandatory"];
                                                    if(cut.isSet(el_mandatory)) {
                                                        if(false === 
                                                        el_mandatory ||
                                                        "false" == el_mandatory.
                                                        toString().trim())
                                                            el.mandatory = "false";
                                                        else {
                                                            el.mandatory = "true";
                                                        }
                                                    }
                                                    else
                                                        el.mandatory = "false";

                                                    var el_highlight = 
                                                    element.$["highlightfirst"];
                                                    if(cut.isSet(el_highlight)) {
                                                        if(false === 
                                                        el_highlight ||
                                                        "false" == el_highlight.
                                                        toString().trim())
                                                            el.highlightfirst = "false";
                                                        else {
                                                            el.highlightfirst = "true";
                                                        }
                                                    }
                                                    else
                                                        el.highlightfirst = "true";

                                                    var el_visible = 
                                                    element.$["visible"];
                                                    if(cut.isSet(el_visible)) {
                                                        if(false === 
                                                        el_visible ||
                                                        "false" == el_visible.
                                                        toString().trim())
                                                            el.visible = "false";
                                                        else {
                                                            el.visible = "true";
                                                        }
                                                    }
                                                    else
                                                        el.visible = "true";
                                                        
                                                    var el_value = 
                                                    element.$["value"];
                                                    if(cut.isSet(el_value)) {
                                                        el.value = 
                                                        el_value.toString().
                                                        trim();
                                                    }
                                                    else
                                                        el.value = "";

                                                    var el_url = 
                                                    element.$["datasource-url"];
                                                    if(cut.isSet(el_url)) {
                                                        el.url = 
                                                        el_url.toString().
                                                        trim();
                                                    }
                                                    
                                                    var el_db = 
                                                    element.$["datasource-url-cb"];
                                                    if(cut.isSet(el_db)) {
                                                        el.urlcb = 
                                                        el_db.toString().
                                                        trim();
                                                    }
                                                    else
                                                        el.urlcb = "";

                                                    var el_help = 
                                                    element.$["helptext"];
                                                    if(cut.isSet(el_help)) {
                                                        el.help = 
                                                        el_help.toString().
                                                        trim();
                                                    }
                                                    else
                                                        el.help = "";

                                                    var el_range = 
                                                    element.$["range"];
                                                    if(cut.isSet(el_range)) {
                                                        el.range = 
                                                        el_range.toString().
                                                        trim();
                                                    }
                    
                                                    var el_field = 
                                                    element.$["field"];
                                                    if(cut.isSet(el_field)) {
                                                        el.field = 
                                                        el_field.toString()
                                                        .trim();
                                                    }
                                                    else
                                                        el.field = "";
                    
                                                    var el_path = 
                                                    element.$["path"];
                                                    if(cut.isSet(el_path)) {
                                                        el.path = 
                                                        el_path.toString()
                                                        .trim();
                                                    }
                                                    else
                                                        el.path = "";

                                                    var el_setpath = 
                                                    element.$["setpath"];
                                                    if(cut.isSet(el_setpath)) {
                                                        el.setpath = 
                                                        el_setpath.toString()
                                                        .trim();
                                                    }
                                                    else
                                                        el.setpath = "";

                                                    var el_format = 
                                                    element.$["format"];
                                                    if(cut.isSet(el_format)) {
                                                        el.format = 
                                                        el_format.toString()
                                                        .trim();
                                                    }
                                                    else
                                                        el.format = "";

                                                    var el_lhspath = 
                                                    element.$["lhspath"];
                                                    if(cut.isSet(el_lhspath)) {
                                                        el.lhspath = 
                                                        el_lhspath.toString()
                                                        .trim();
                                                    }

                                                    var el_rhspath = 
                                                    element.$["rhspath"];
                                                    if(cut.isSet(el_rhspath)) {
                                                        el.rhspath = 
                                                        el_rhspath.toString()
                                                        .trim();
                                                    }

                                                    var el_change_listener = "";
                                                    if(cut.isSet(element.$)) {
                                                        el_change_listener = 
                                                            element.
                                                            $["changeAction"];
                                                        if(cut.isSet(
                                                        el_change_listener)) {
                                                            el.changeAction = 
                                                            el_change_listener.
                                                            toString().trim();
                                                        }
                                                        else
                                                            el.changeAction = 
                                                            "";
                                                    }                                    
                    
                                                    var el_values = 
                                                    element.values;
                                                    if(el_values && 
                                                       el_values.length > 0) {
                                                        el_values = 
                                                        el_values[0];
                                                        if(cut.isSet(
                                                        el_values.value) &&
                                                        el_values.value.length 
                                                        > 0) {
                                                            el.values =
                                                            el_values.value.
                                                            toString();
                                                        }
                                                    }
                                                    else
                                                        el.values = "";
                    
                                                    var el_editable = 
                                                    element.$["editable"];
                                                    if(cut.isSet(el_editable)) {
                                                        if(false === 
                                                        el_editable ||
                                                        "false" == el_editable.
                                                        toString().trim())
                                                            el.editable = false;
                                                        else
                                                            el.editable = true;
                                                    }
                                                    else
                                                        el.editable = true;

                                                }
                                            }
                                        }
                                    }
                                } 
                            }
                        }
                    }
                }
            }
        }
    }
    return actions;
}

function getToBeGeneratedScript(config, featureName) {
var str = 
'/*\n' +
' * Copyright (c) 2013 Juniper Networks, Inc. All rights reserved.\n' +
' */\n' +
'\n';

str += 
'checkAndSetStrTrim();' + '\n' +
featureName + 'ConfigObj = new ' + featureName + '();' + '\n' +
'var that = null;' + '\n' +
'that = ' + featureName + 'ConfigObj;' + '\n' +
'var config;' + '\n' +
'var module_name = "config_' + featureName + '";' + '\n' +
'var project_admin = {};' + '\n' +
'function ' + featureName + '() {' + '\n' +
'    var cookiedProject = getCookie("project");' + '\n' +
'    if(cookiedProject === false)' + '\n' +
'        setCookie("project", "");' + '\n' +
'    this.load = load;' + '\n' +
'    this.init = init;' + '\n' +
'    this.destroy = destroy;' + '\n' +
'    function load(obj) {' + '\n' +
'        init(' + config + ',obj);' + '\n' +
'    }' + '\n' +
'' + '\n' +
'    function destroy() {' + '\n' +
'        custom_table = custom_action = source_table_id = null;' + '\n' +
'        config = module_name = project_admin = null;' + '\n' +
'    }' + '\n' +
'    this.generateHTMLComponents = generateHTMLComponents; ' + '\n' +
'    this.getSectionDivs = getSectionDivs; ' + '\n' +
'    this.plotPanels = plotPanels; ' + '\n' +
'    this.plotTables = plotTables; ' + '\n' +
'    this.plotTabs = plotTabs; ' + '\n' +
'    this.generatePanel = generatePanel; ' + '\n' +
'    this.applyKendoStyle = applyKendoStyle; ' + '\n' +
'    this.addElement = addElement; ' + '\n' +
'    this.getFieldFromURL = getFieldFromURL; ' + '\n' +
'    this.resolveFieldsInURL = resolveFieldsInURL; ' + '\n' +
'    this.handleltor = handleltor; ' + '\n' +
'    this.handlertol = handlertol; ' + '\n' +
'    this.loadComboBox = loadComboBox; ' + '\n' +
'    this.loadMultiSelect = loadMultiSelect; ' + '\n' +
'    this.generateHTMLTable = generateHTMLTable; ' + '\n' +
'    this.generateTitleDiv = generateTitleDiv; ' + '\n' +
'    this.generateActionsDiv = generateActionsDiv; ' + '\n' +
'    this.createWindow = createWindow; ' + '\n' +
'    this.getTableIDFromButtonID = getTableIDFromButtonID; ' + '\n' +
'    this.getParentForTable = getParentForTable; ' + '\n' +
'    this.resolveURLFields = resolveURLFields; ' + '\n' +
'    this.cleanupAllTables = cleanupAllTables; ' + '\n' +
'    this.getParentsForTable = getParentsForTable; ' + '\n' +
'    this.getTableByID = getTableByID; ' + '\n' +
'    this.onLandingTableAddEdit = onLandingTableAddEdit; ' + '\n' +
'    this.launchAddEditWindow = launchAddEditWindow; ' + '\n' +
'    this.createButton = createButton; ' + '\n' +
'    this.applyKendoCombobox = applyKendoCombobox; ' + '\n' +
'    this.applyKendoAutoComplete = applyKendoAutoComplete; ' + '\n' +
'    this.applyKendoListView = applyKendoListView; ' + '\n' +
'    this.applyKendoMultiCombo = applyKendoMultiCombo; ' + '\n' +
'    this.applyKendoNumericTextBox = applyKendoNumericTextBox; ' + '\n' +
'    this.applyKendoDropdown = applyKendoDropdown; ' + '\n' +
'    this.applyKendoTab = applyKendoTab; ' + '\n' +
'    this.defaultCancelHandler = defaultCancelHandler; ' + '\n' +
'    this.closeWindow = closeWindow; ' + '\n' +
'    this.defaultOKHandler = defaultOKHandler; ' + '\n' +
'    this.getDataFromTable = getDataFromTable; ' + '\n' +
'    this.makeDuplicate = makeDuplicate; ' + '\n' +
'    this.makeDupes = makeDupes; ' + '\n' +
'    this.makeJson = makeJson; ' + '\n' +
'    this.getKendoGridForATable = getKendoGridForATable; ' + '\n' +
'    this.getActualURL = getActualURL; ' + '\n' +
'    this.createFailCB = createFailCB; ' + '\n' +
'    this.createCB = createCB; ' + '\n' +
'    this.getDataFromAllRows = getDataFromAllRows; ' + '\n' +
'    this.fillupActionTemplate = fillupActionTemplate; ' + '\n' +
'    this.fillupTemplate = fillupTemplate; ' + '\n' +
'    this.getDataFromDom = getDataFromDom; ' + '\n' +
'    this.onSuccessfulDelete = onSuccessfulDelete; ' + '\n' +
'    this.onLandingTableDelete = onLandingTableDelete; ' + '\n' +
'    this.deleteRow = deleteRow; ' + '\n' +
'    this.getDetailsTableData = getDetailsTableData; ' + '\n' +
'    this.onRowSelect = onRowSelect; ' + '\n' +
'    this.onRowSelectCB = onRowSelectCB; ' + '\n' +
'    this.wrapupWithKendo = wrapupWithKendo; ' + '\n' +
'    this.showLoadingMaskForTargetsOfTable = showLoadingMaskForTargetsOfTable; ' + '\n' +
'    this.showLoadingMaskOfElement = showLoadingMaskOfElement; ' + '\n' +
'    this.hideLoadingMaskOfElement = hideLoadingMaskOfElement; ' + '\n' +
'    this.hideLoadingMaskForTargetsOfTable = hideLoadingMaskForTargetsOfTable; ' + '\n' +
'    this.fetchDataForTable = fetchDataForTable; ' + '\n' +
'    this.fetchDataFromURLs = fetchDataFromURLs; ' + '\n' +
'    this.fetchDataForAllTablesInTab = fetchDataForAllTablesInTab; ' + '\n' +
'    this.setDomainDetails = setDomainDetails; ' + '\n' +
'    this.setProjectDetails = setProjectDetails; ' + '\n' +
'    this.setProjectToConfigObj = setProjectToConfigObj; ' + '\n' +
'    this.getSelectedProjectName = getSelectedProjectName; ' + '\n' +
'    this.getSelectedDomain = getSelectedDomain; ' + '\n' +
'    this.getProjectAdminUUID = getProjectAdminUUID; ' + '\n' +
'    this.getProjectUUID = getProjectUUID; ' + '\n' +
'    this.getDomainUUID = getDomainUUID; ' + '\n' +
'    this.getPolicyUUID = getPolicyUUID; ' + '\n' +
'    this.getIpamUUID = getIpamUUID; ' + '\n' +
'    this.getIpamHref = getIpamHref; ' + '\n' +
'    this.getNetworkUUID = getNetworkUUID; ' + '\n' +
'    this.fetchDataForAllTables = fetchDataForAllTables; ' + '\n' +
'    this.initWrapup = initWrapup; ' + '\n' +
'    this.wrapTabpanel = wrapTabpanel; ' + '\n' +
'    this.wrapGrid = wrapGrid; ' + '\n' +
'    this.createTableElement = createTableElement; ' + '\n' +
'    this.createScriptElement = createScriptElement; ' + '\n' +
'    this.populateFailureData = populateFailureData; ' + '\n' +
'    this.populateData = populateData; ' + '\n' +
'    this.populateSourceTableData = populateSourceTableData; ' + '\n' +
'    this.getDataFromPath = getDataFromPath; ' + '\n' +
'    this.disableGridButton = disableGridButton; ' + '\n' +
'    this.populateTargetTableData = populateTargetTableData; ' + '\n' +
'    this.handleAllowAllProjects = handleAllowAllProjects; ' + '\n' +
'    this.handleFip = handleFip; ' + '\n' +
'    this.fillupTemplateFromRow = fillupTemplateFromRow; ' + '\n' +
'    this.disassociate = disassociate; ' + '\n' +
'    this.launchAssociateWindow = launchAssociateWindow; ' + '\n' +
'    this.okCustomHandler = okCustomHandler; ' + '\n' +
'    this.handleProject = handleProject; ' + '\n' +
'    this.handleDomain = handleDomain; ' + '\n' +
'    this.getSelectedProjectUUID = getSelectedProjectUUID;' + '\n' +
'    this.getSelectedDomainUUID = getSelectedDomainUUID;' + '\n' +
'    this.handleSequence = handleSequence;' + '\n' +
'    this.setTitle = setTitle;' + '\n' +
'    this.defaultValidator = defaultValidator;' + '\n' +
'    function init(page_config, obj) {' + '\n' +
'        config = page_config;' + '\n' +
'        fetchDataFromURLs(config.urls);' + '\n' +
'        var page_div = generateHTMLComponents(config,$(obj.containerId)[0]);' + '\n' +
'        $(obj.containerId)[0].appendChild(page_div);' + '\n' +
'        wrapupWithKendo(config);' + '\n' +
'    }' + '\n' +
'}' + '\n' +
'' + '\n' +
' function generateHTMLComponents(config, ctr) {' + '\n' +
'     var page_div = null;' + '\n' +
'     if (config) {' + '\n' +
'         var page_div = document.createElement("div");' + '\n' +
'         page_div.id = config.pageid;' + '\n' +
'         page_div.style.width = config.pagewidth;' + '\n' +
'         if (!isSet(page_div.style.width)) {' + '\n' +
'             if (ctr.clientWidth <= 0) {' + '\n' +
'                 page_div.style.width = window.innerWidth - 30 + PX;' + '\n' +
'             } else {' + '\n' +
'                 page_div.style.width = ctr.clientWidth - 30 + PX;' + '\n' +
'             }' + '\n' +
'             config.pagewidth = page_div.style.width;' + '\n' +
'         }' + '\n' +
' ' + '\n' +
'         page_div.style.height = config.pageheight;' + '\n' +
'         if (!isSet(page_div.style.height)) {' + '\n' +
'             if (layoutHandler.getViewHeight() <= 0) {' + '\n' +
'                 page_div.style.height = window.innerHeight - JNPR_HDR_HEIGHT + PX;' + '\n' +
'             } else {' + '\n' +
'                 page_div.style.height = layoutHandler.getViewHeight() + PX;' + '\n' +
'             }' + '\n' +
'             config.pageheight = page_div.style.height.split(PX)[0] - 40 + PX;' + '\n' +
'         }' + '\n' +
' ' + '\n' +
'         var proj_switch_div = document.createElement("div");' + '\n' +
'         page_div.appendChild(proj_switch_div);' + '\n' +
'         proj_switch_div.id = page_div.id + "_ps";' + '\n' +
'         proj_switch_div.style.width = page_div.style.width;' + '\n' +
'         proj_switch_div.style.height = 40 + PX;' + '\n' +
'         var ps_avl = false, ds_avl = false;' + '\n' +
'         if(isSet(config.urls) && config.urls.length > 0) {' + '\n' +
'             for(var i=0; i<config.urls.length; i++) {' + '\n' +
'                 var url = config.urls[i];' + '\n' +
'                 if(url.indexOf("projects") != -1) {' + '\n' +
'                     ps_avl = true;' + '\n' +
'                 }' + '\n' +
'                 if(url.indexOf("domains") != -1) {' + '\n' +
'                     ds_avl = true;' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         if(ps_avl === true) {' + '\n' +
'             config.ps_avl = true;' + '\n' +
'             var ps_combo = document.createElement("select");' + '\n' +
'             ps_combo.id = "projectswitcher";' + '\n' +
'             ps_combo.style.width = ELEMENT_WIDTH/2 + PX;' + '\n' +
'             ps_combo.style.position = RELATIVE;' + '\n' +
'             ps_combo.style.top = 15+PX;' + '\n' +
'             ps_combo.style.left = ' + '\n' +
'             (parseInt(proj_switch_div.style.width.split("px")[0]) - (ELEMENT_WIDTH/2)) + PX;' + '\n' +
'             proj_switch_div.appendChild(ps_combo);' + '\n' +
'         }' + '\n' +
'         else {' + '\n' +
'             config.ps_avl = false;' + '\n' +
'         }' + '\n' +
'         if(ds_avl === true) {' + '\n' +
'             config.ds_avl = true;' + '\n' +
'             var domain_combo = document.createElement("select");' + '\n' +
'             domain_combo.id = "domainswitcher";' + '\n' +
'             domain_combo.style.width = ELEMENT_WIDTH/2 + PX;' + '\n' +
'             domain_combo.style.top = 15+PX;' + '\n' +
'             domain_combo.style.position = RELATIVE;' + '\n' +
'             proj_switch_div.appendChild(domain_combo);' + '\n' +
'             if(ps_avl === true) {' + '\n' +
'             domain_combo.style.left = ' + '\n' +
'             proj_switch_div.style.width.split("px")[0] - 560 + PX;' + '\n' +
'             } else {' + '\n' +
'             domain_combo.style.left = ' + '\n' +
'             (parseInt(proj_switch_div.style.width.split("px")[0]) - (ELEMENT_WIDTH/2)) + PX;' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         else {' + '\n' +
'             config.ds_avl = false;' + '\n' +
'         }' + '\n' +
'         var title_span = document.createElement("span");' + '\n' +
'         title_span.id = "span_table_title";' + '\n' +
'         title_span.style.fontSize = "18px";' + '\n' +
'         title_span.style.left = "-350px";' + '\n' +
'         title_span.style.position = "relative";' + '\n' +
'         title_span.style.top = "12%";' + '\n' +
'         proj_switch_div.appendChild(title_span);' + '\n' +
'         var rest_proj_switch_div = document.createElement("div");' + '\n' +
'         page_div.appendChild(rest_proj_switch_div);' + '\n' +
'         rest_proj_switch_div.id = page_div.id + "_rps";' + '\n' +
'         rest_proj_switch_div.style.width = page_div.style.width;' + '\n' +
'         rest_proj_switch_div.style.height = config.pageheight;' + '\n' +
'         var sections =' + '\n' +
'             parseInt(config.rows) * parseInt(config.cols);' + '\n' +
'         var section_divs = getSectionDivs(config.rows, config.cols, rest_proj_switch_div);' + '\n' +
'         var tabs_in_page = [];' + '\n' +
'         var tables_in_page = [];' + '\n' +
'         var panels_in_page = [];' + '\n' +
'         for (var i = 0; i < config.rows; i++) {' + '\n' +
'             tabs_in_page[i] = [];' + '\n' +
'             tables_in_page[i] = [];' + '\n' +
'             panels_in_page[i] = [];' + '\n' +
'             for (var j = 0; j < config.cols; j++) {' + '\n' +
'                 tabs_in_page[i][j] = [];' + '\n' +
'                 tables_in_page[i][j] = [];' + '\n' +
'                 panels_in_page[i][j] = [];' + '\n' +
'                 rest_proj_switch_div.appendChild(section_divs[i][j]);' + '\n' +
' ' + '\n' +
'                 if (config.tabs && config.tabs.length > 0) {' + '\n' +
'                     for (var k = 0; k < config.tabs.length; k++) {' + '\n' +
'                         var tab = config.tabs[k];' + '\n' +
'                         if ((tab.row - 1) == i && (tab.col - 1 == j)) {' + '\n' +
'                             tabs_in_page[i][j][k] = tab;' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'                 if (config.tables && config.tables.length > 0) {' + '\n' +
'                     for (var k = 0; k < config.tables.length; k++) {' + '\n' +
'                         var table = config.tables[k];' + '\n' +
'                         if ((table.row - 1) == i && (table.col - 1 == j)) {' + '\n' +
'                             tables_in_page[i][j][k] = table;' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'                 if (config.panels && config.panels.length > 0) {' + '\n' +
'                     for (var k = 0; k < config.panels.length; k++) {' + '\n' +
'                         var panel = config.panels[k];' + '\n' +
'                         if ((panel.row - 1) == i && (panel.col - 1 == j)) {' + '\n' +
'                             panels_in_page[i][j][k] = panel;' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         plotTabs(tabs_in_page, section_divs);' + '\n' +
'         plotTables(tables_in_page, section_divs);' + '\n' +
'         plotPanels(panels_in_page, section_divs);' + '\n' +
' ' + '\n' +
'     }' + '\n' +
'     return page_div;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getSectionDivs(rows, cols, parent) {' + '\n' +
'     var section_divs = [];' + '\n' +
'     for (var i = 0; i < rows; i++) {' + '\n' +
'         section_divs[i] = [];' + '\n' +
'         for (var j = 0; j < cols; j++) {' + '\n' +
'             var section_div = document.createElement("div");' + '\n' +
'             section_div.id = parent.id + "_" + i + "_" + j;' + '\n' +
'             section_div.style.width =' + '\n' +
'                 (parseInt(parent.style.width.split(PX)[0]) / cols) +' + '\n' +
'                 PX;' + '\n' +
'             section_div.style.height =' + '\n' +
'                 (parseInt(parent.style.height.split(PX)[0]) / rows) +' + '\n' +
'                 PX;' + '\n' +
'             section_div.style.display = INLINE_BLOCK;' + '\n' +
'             section_div.style.verticalAlign = TOP;' + '\n' +
'             section_div.style.margin = 10 + PX;' + '\n' +
'             section_div.style.position = RELATIVE;' + '\n' +
'             section_divs[i][j] = section_div;' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return section_divs;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function plotPanels(panels_in_page, section_divs, div_sibling_ul) {' + '\n' +
'     for (var i = 0; i < panels_in_page.length; i++) {' + '\n' +
'         for (var j = 0; j < panels_in_page[i].length; j++) {' + '\n' +
'             for (var k = 0; k < panels_in_page[i][j].length; k++) {' + '\n' +
'                 var panel = panels_in_page[i][j][k];' + '\n' +
'                 if (isSet(panel)) {' + '\n' +
'                     var div_panel_sibling = document.createElement("div");' + '\n' +
'                     div_panel_sibling.id = "div_panel_sibling_" +' + '\n' +
'                         section_divs[i][j].id;' + '\n' +
'                     var sec_width = section_divs[i][j].style.width;' + '\n' +
'                     sec_width =' + '\n' +
'                         (parseInt(sec_width.split(PX)[0]));' + '\n' +
'                     div_panel_sibling.style.width = (sec_width) + PX;' + '\n' +
'                     var sec_height = section_divs[i][j].style.height;' + '\n' +
'                     sec_height = (parseInt(sec_height.split(PX)[0]));' + '\n' +
'                     div_panel_sibling.style.height = (sec_height) + PX;' + '\n' +
'                     section_divs[i][j].appendChild(div_panel_sibling);' + '\n' +
'                     generatePanel(config.rows, config.cols,' + '\n' +
'                         div_panel_sibling, panel);' + '\n' +
'                     if (typeof div_panel_sibling !== "undefined" &&' + '\n' +
'                         typeof div_sibling_ul !== "undefined")' + '\n' +
'                         div_sibling_ul.appendChild(div_panel_sibling);' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function plotTables(tables_in_page, section_divs, div_sibling_ul) {' + '\n' +
'     for (var i = 0; i < tables_in_page.length; i++) {' + '\n' +
'         for (var j = 0; j < tables_in_page[i].length; j++) {' + '\n' +
'             for (var k = 0; k < tables_in_page[i][j].length; k++) {' + '\n' +
'                 var table = tables_in_page[i][j][k];' + '\n' +
'                 if (isSet(table)) {' + '\n' +
'                     var div_table_sibling = document.createElement("div");' + '\n' +
'                     div_table_sibling.id = "div_table_sibling_" +' + '\n' +
'                         section_divs[i][j].id;' + '\n' +
'                     var sec_width = section_divs[i][j].style.width;' + '\n' +
'                     sec_width =' + '\n' +
'                         (parseInt(sec_width.split(PX)[0]));' + '\n' +
'                     div_table_sibling.style.width = (sec_width) + PX;' + '\n' +
'                     var sec_height = section_divs[i][j].style.height;' + '\n' +
'                     sec_height = (parseInt(sec_height.split(PX)[0]));' + '\n' +
'                     div_table_sibling.style.height = (sec_height) + PX;' + '\n' +
'                     section_divs[i][j].appendChild(div_table_sibling);' + '\n' +
'                     generateHTMLTable(config.rows, config.cols,' + '\n' +
'                         div_table_sibling, table);' + '\n' +
'                     if (typeof div_table_sibling !== "undefined" &&' + '\n' +
'                         typeof div_sibling_ul !== "undefined")' + '\n' +
'                         div_sibling_ul.appendChild(div_table_sibling);' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function plotTabs(tabs_in_page, section_divs) {' + '\n' +
'     var div_sibling_ul;' + '\n' +
'     for (var i = 0; i < tabs_in_page.length; i++) {' + '\n' +
'         for (var j = 0; j < tabs_in_page[i].length; j++) {' + '\n' +
'             if (section_divs[i] && tabs_in_page[i][j].length > 0) {' + '\n' +
'                 div_sibling_ul = document.createElement("div");' + '\n' +
'                 div_sibling_ul.id = "tabs_" +' + '\n' +
'                     section_divs[i][j].id;' + '\n' +
'                 var sec_width = section_divs[i][j].style.width;' + '\n' +
'                 sec_width =' + '\n' +
'                     (parseInt(sec_width.split(PX)[0]));' + '\n' +
'                 div_sibling_ul.style.width = (sec_width) + PX;' + '\n' +
'                 var sec_height = section_divs[i][j].style.height;' + '\n' +
'                 sec_height = (parseInt(sec_height.split(PX)[0]));' + '\n' +
'                 div_sibling_ul.style.height = (sec_height) + PX;' + '\n' +
'                 section_divs[i][j].appendChild(div_sibling_ul);' + '\n' +
'                 var ul;' + '\n' +
'                 if (tabs_in_page[i][j].length > 0) {' + '\n' +
'                     ul = document.createElement("ul");' + '\n' +
'                     div_sibling_ul.appendChild(ul);' + '\n' +
'                 }' + '\n' +
'                 for (var k = 0; k < tabs_in_page[i][j].length; k++) {' + '\n' +
'                     var tab = tabs_in_page[i][j][k];' + '\n' +
'                     if (isSet(tab)) {' + '\n' +
'                         var li = document.createElement("li");' + '\n' +
'                         li.innerHTML = tab.title;' + '\n' +
'                         if (k == 0) li.className = "k-state-active";' + '\n' +
'                         ul.appendChild(li);' + '\n' +
'                         var div_sibling = document.createElement("div");' + '\n' +
'                         div_sibling.id = "tab_sibling_" + tab.id;' + '\n' +
'                         tab.id = div_sibling_ul.id;' + '\n' +
'                         var sec_width = div_sibling_ul.style.width;' + '\n' +
'                         sec_width =' + '\n' +
'                             (parseInt(sec_width.split(PX)[0]) - 30);' + '\n' +
'                         div_sibling.style.width = sec_width + PX;' + '\n' +
'                         var sec_height = div_sibling_ul.style.height;' + '\n' +
'                         sec_height =' + '\n' +
'                             (parseInt(sec_height.split(PX)[0]) - 50);' + '\n' +
'                         div_sibling.style.height = sec_height + PX;' + '\n' +
'                         div_sibling_ul.appendChild(div_sibling);' + '\n' +
'                         var tables_in_tab = [];' + '\n' +
'                         var tabs_in_tab = [];' + '\n' +
'                         var panels_in_tab = [];' + '\n' +
'                         for (var t_row = 0; t_row < tab.rows; t_row++) {' + '\n' +
'                             tables_in_tab[t_row] = [];' + '\n' +
'                             tabs_in_tab[t_row] = [];' + '\n' +
'                             panels_in_tab[t_row] = [];' + '\n' +
'                             for (var t_col = 0; t_col < tab.cols; t_col++) {' + '\n' +
'                                 tables_in_tab[t_row][t_col] = [];' + '\n' +
'                                 tabs_in_tab[t_row][t_col] = [];' + '\n' +
'                                 panels_in_tab[t_row][t_col] = [];' + '\n' +
'                                 if (tab.tables && tab.tables.length > 0) {' + '\n' +
'                                     for (var t = 0; t < tab.tables.length; t++) {' + '\n' +
'                                         var table = tab.tables[t];' + '\n' +
'                                         if (isSet(table)) {' + '\n' +
'                                             if ((table.row - 1 == t_row) &&' + '\n' +
'                                                 (table.col - 1 == t_col)) {' + '\n' +
'                                                 tables_in_tab[t_row][t_col][t] =' + '\n' +
'                                                     table;' + '\n' +
'                                             }' + '\n' +
'                                         }' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                                 if (tab.panels && tab.panels.length > 0) {' + '\n' +
'                                     for (var t = 0; t < tab.panels.length; t++) {' + '\n' +
'                                         var panel = tab.panels[t];' + '\n' +
'                                         if (isSet(panel)) {' + '\n' +
'                                             if ((panel.row - 1 == t_row) &&' + '\n' +
'                                                 (panel.col - 1 == t_col)) {' + '\n' +
'                                                 panels_in_tab[t_row][t_col][t] =' + '\n' +
'                                                     panel;' + '\n' +
'                                             }' + '\n' +
'                                         }' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                                 if (tab.tabs && tab.tabs.length > 0) {' + '\n' +
'                                     for (var t = 0; t < tab.tabs.length; t++) {' + '\n' +
'                                         var tab_tab = tab.tabs[t];' + '\n' +
'                                         if (isSet(tab_tab)) {' + '\n' +
'                                             if ((tab_tab.row - 1 == t_row) &&' + '\n' +
'                                                 (tab_tab.col - 1 == t_col)) {' + '\n' +
'                                                 tabs_in_tab[t_row][t_col][t] =' + '\n' +
'                                                     tab_tab;' + '\n' +
'                                             }' + '\n' +
'                                         }' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
' ' + '\n' +
'                         var div_tab_elements = document.createElement("div");' + '\n' +
'                         div_tab_elements.id = div_sibling.id + "_content";' + '\n' +
'                         div_tab_elements.style.width = div_sibling.style.width;' + '\n' +
'                         div_tab_elements.style.height = div_sibling.style.height;' + '\n' +
'                         for (var el_row = 0; el_row < tables_in_tab.length; el_row++) {' + '\n' +
'                             for (var el_col = 0; el_col < tables_in_tab[el_row].length; el_col++) {' + '\n' +
'                                 for (var el_count = 0; el_count < tables_in_tab[el_row][el_col].length; el_count++) {' + '\n' +
'                                     var table =' + '\n' +
'                                         tables_in_tab[el_row][el_col][el_count];' + '\n' +
'                                     if (typeof table !== "undefined") {' + '\n' +
'                                         var comp = document.createElement("div");' + '\n' +
'                                         comp.id = "div_tab_" + table.id;' + '\n' +
'                                         comp.style.width =' + '\n' +
'                                             (parseInt(div_tab_elements.style.width.split(PX)[0]) / tab.cols) + PX;' + '\n' +
'                                         comp.style.height =' + '\n' +
'                                             (parseInt(div_tab_elements.style.height.split(PX)[0]) / tab.rows) + PX;' + '\n' +
'                                         generateHTMLTable(tab.rows,' + '\n' +
'                                             tab.cols, comp, table);' + '\n' +
'                                         div_tab_elements.appendChild(comp);' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                         for (var el_row = 0; el_row < panels_in_tab.length; el_row++) {' + '\n' +
'                             for (var el_col = 0; el_col < panels_in_tab[el_row].length; el_col++) {' + '\n' +
'                                 for (var el_count = 0; el_count < panels_in_tab[el_row][el_col].length; el_count++) {' + '\n' +
'                                     var panel =' + '\n' +
'                                         panels_in_tab[el_row][el_col][el_count];' + '\n' +
'                                     if (typeof panel !== "undefined") {' + '\n' +
'                                         var comp = document.createElement("div");' + '\n' +
'                                         comp.id = "div_tab_" + panel.id;' + '\n' +
'                                         comp.style.width =' + '\n' +
'                                             (parseInt(div_tab_elements.style.width.split(PX)[0]) / tab.cols) + PX;' + '\n' +
'                                         comp.style.height =' + '\n' +
'                                             (parseInt(div_tab_elements.style.height.split(PX)[0]) / tab.rows) + PX;' + '\n' +
'                                         generatePanel(tab.rows, tab.cols, comp,' + '\n' +
'                                             panel);' + '\n' +
'                                         div_tab_elements.appendChild(comp);' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                         for (var t_row = 0; null != tabs_in_tab[t_row]; t_row++) {' + '\n' +
'                             for (var t_col = 0; null != tabs_in_tab[t_row] &&' + '\n' +
'                                 null != tabs_in_tab[t_row][t_col]; t_col++) {' + '\n' +
'                                 if (tabs_in_tab[t_row] && tabs_in_tab[t_row][t_col] &&' + '\n' +
'                                     tabs_in_tab[t_row][t_col].length <= 0)' + '\n' +
'                                     tabs_in_tab.splice(t_row, 1);' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
' ' + '\n' +
'                         if (tabs_in_tab.length > 0 && tabs_in_tab[0].length > 0 && tabs_in_tab[0][0].length > 0) {' + '\n' +
'                             var div_sibling_tab_ul = document.createElement("div");' + '\n' +
'                             div_sibling_tab_ul.id = "tabs_" + div_sibling_ul.id;' + '\n' +
'                             div_sibling_tab_ul.style.width =' + '\n' +
'                                 (parseInt(div_tab_elements.style.width.split(PX)[0]) / tab.cols) + PX;' + '\n' +
'                             div_sibling_tab_ul.style.height =' + '\n' +
'                                 (parseInt(div_tab_elements.style.height.split(PX)[0]) / tab.rows) + PX;' + '\n' +
' ' + '\n' +
'                             var tab_sections = getSectionDivs(tab.rows,' + '\n' +
'                                 tab.cols, div_tab_elements);' + '\n' +
'                             var div_sibling_tab_tab =' + '\n' +
'                                 plotTabs(tabs_in_tab, tab_sections);' + '\n' +
'                             div_tab_elements.appendChild(div_sibling_tab_tab);' + '\n' +
'                         }' + '\n' +
' ' + '\n' +
'                         if (typeof div_tab_elements !== "undefined")' + '\n' +
'                             div_sibling.appendChild(div_tab_elements);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return div_sibling_ul;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function generatePanel(rows, cols, sections, panel_config) {' + '\n' +
'     var whichRow = -1,' + '\n' +
'         whichCol = -1;' + '\n' +
'     var maxHeight = 0,' + '\n' +
'         maxWidth = 0,' + '\n' +
'         formHeight = 0,' + '\n' +
'         formWidth = 0;' + '\n' +
'     var rowCount = panel_config["prow"].length;' + '\n' +
'     if (rowCount > 0) {' + '\n' +
'         for (var row = 0; row < rowCount; row++) {' + '\n' +
'             var colCount = panel_config["prow"][row]["pcol"].length;' + '\n' +
'             if (colCount > 0) {' + '\n' +
'                 for (var col = 0; col < colCount; col++) {' + '\n' +
'                     var elCount =' + '\n' +
'                         panel_config["prow"][row]["pcol"][col]["element"].length;' + '\n' +
'                     for (var elIndex = 0; elIndex < elCount; elIndex++) {' + '\n' +
'                         var element =' + '\n' +
'                             panel_config["prow"][row]' + '\n' +
'                         ["pcol"][col]["element"][elIndex];' + '\n' +
'                         if (whichRow < row) {' + '\n' +
'                             whichRow = row;' + '\n' +
'                             if (element.type == "hidden") {' + '\n' +
'                                 formHeight += 0;' + '\n' +
'                             }' + '\n' +
'                             else if (element.type == "multiselect") {' + '\n' +
'                                 formHeight += MULTISELECT_HEIGHT;' + '\n' +
'                             } else {' + '\n' +
'                                 formHeight += ELEMENT_HEIGHT;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                         if (whichCol < col) {' + '\n' +
'                             whichCol = col;' + '\n' +
'                             if (isSet(element.title)) {' + '\n' +
'                                 if(element.type == "hidden") {' + '\n' +
'                                     formWidth += 0;' + '\n' +
'                                 } else if (element.type == "multiselect") {' + '\n' +
'                                     formWidth += MULTISELECT_WIDTH;' + '\n' +
'                                 } else if (element.type == "button") {' + '\n' +
'                                     formWidth += ELEMENT_WIDTH / 2;' + '\n' +
'                                 } else {' + '\n' +
'                                     formWidth += ELEMENT_WIDTH;' + '\n' +
'                                 }' + '\n' +
'                             } else {' + '\n' +
'                                 if(element.type == "hidden")' + '\n' +
'                                     formWidth += 0;' + '\n' +
'                                 else if (element.type == "multiselect")' + '\n' +
'                                     formWidth += MULTISELECT_WIDTH;' + '\n' +
'                                 else' + '\n' +
'                                     formWidth += ELEMENT_WIDTH / 2;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                         if (element.type == "hidden") {' + '\n' +
'                             element.width = 0;' + '\n' +
'                             element.height = 0;' + '\n' +
'                         } else if (element.type == "multiselect") {' + '\n' +
'                             element.width = MULTISELECT_WIDTH;' + '\n' +
'                             element.height = MULTISELECT_HEIGHT;' + '\n' +
'                         } else if (element.type == "button") {' + '\n' +
'                             element.width = ELEMENT_WIDTH / 2;' + '\n' +
'                             element.height = ELEMENT_HEIGHT;' + '\n' +
'                         } else {' + '\n' +
'                             if (isSet(element.title))' + '\n' +
'                                 element.width = ELEMENT_WIDTH;' + '\n' +
'                             else' + '\n' +
'                                 element.width = ELEMENT_WIDTH / 2;' + '\n' +
'                             element.height = ELEMENT_HEIGHT;' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                     panel_config["prow"][row]["pcol"][col].width = formWidth / col;' + '\n' +
'                     panel_config["prow"][row]["pcol"][col].height =' + '\n' +
'                         element.height;' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             panel_config["prow"][row].width = formWidth;' + '\n' +
'             panel_config["prow"][row]["pcol"].height = element.height / (row + 1);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (formHeight > maxHeight)' + '\n' +
'         maxHeight = formHeight;' + '\n' +
'     else' + '\n' +
'         formHeight = 0;' + '\n' +
'     if (formWidth > maxWidth)' + '\n' +
'         maxWidth = formWidth;' + '\n' +
'     else' + '\n' +
'         formWidth = 0;' + '\n' +
' ' + '\n' +
'     var form_div = document.createElement("div");' + '\n' +
'     form_div.id = "form_" + panel_config.id + "_div";' + '\n' +
'     form_div.style.height = maxHeight + PX;' + '\n' +
'     form_div.style.width = maxWidth + PX;' + '\n' +
'     sections.appendChild(form_div);' + '\n' +
' ' + '\n' +
'     var rowCount = panel_config["prow"].length;' + '\n' +
'     for (var row = 0; row < rowCount; row++) {' + '\n' +
'         var rowDiv = document.createElement("div");' + '\n' +
'         form_div.appendChild(rowDiv);' + '\n' +
'         rowDiv.id = form_div.id + "_row_" + row;' + '\n' +
'         rowDiv.style.height = panel_config["prow"][row].height + PX;' + '\n' +
'         rowDiv.style.width = panel_config["prow"][row].width + PX;' + '\n' +
' ' + '\n' +
'         var colCount = panel_config["prow"][row]["pcol"].length;' + '\n' +
'         for (var col = 0; col < colCount; col++) {' + '\n' +
'             var colDiv = document.createElement("div");' + '\n' +
'             rowDiv.appendChild(colDiv);' + '\n' +
'             colDiv.id = rowDiv.id + "_col_" + col;' + '\n' +
'             colDiv.style.display = INLINE_BLOCK;' + '\n' +
'             colDiv.style.height =' + '\n' +
'                 panel_config["prow"][row]["pcol"][col].height + PX;' + '\n' +
'             colDiv.style.width =' + '\n' +
'                 panel_config["prow"][row]["pcol"][col].width + PX;' + '\n' +
' ' + '\n' +
'             var elCount =' + '\n' +
'                 panel_config["prow"][row]["pcol"][col]["element"].length;' + '\n' +
'             for (var elIndex = 0; elIndex < elCount; elIndex++) {' + '\n' +
'                 var element =' + '\n' +
'                     panel_config["prow"][row]["pcol"][col]["element"][elIndex];' + '\n' +
'                 var element_div = document.createElement("div");' + '\n' +
'                 element_div.style.width =' + '\n' +
'                     (maxWidth / colCount) + PX;' + '\n' +
'                 colDiv.appendChild(element_div);' + '\n' +
'                 addElement(element, element_div, form_div, row, col, elIndex, mode);' + '\n' +
'             }' + '\n' +
'             for (var elIndex = 0; elIndex < elCount; elIndex++) {' + '\n' +
'                 var element =' + '\n' +
'                     panel_config["prow"][row]["pcol"][col]["element"][elIndex];' + '\n' +
'                 applyKendoStyle(element);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function applyKendoStyle(element) {' + '\n' +
'     if (element.type == "dropdown") {' + '\n' +
'         applyKendoDropdown(element);' + '\n' +
'     } else if (element.type == "combobox") {' + '\n' +
'         applyKendoCombobox(element);' + '\n' +
'     } else if (element.type == "textbox") {' + '\n' +
'         applyKendoAutoComplete(element);' + '\n' +
'     } else if (element.type == "spinner") {' + '\n' +
'         applyKendoNumericTextBox(element);' + '\n' +
'     } else if (element.type == "multiselect") {' + '\n' +
'         applyKendoListView(element);' + '\n' +
'     } else if (element.type == "multicombo") {' + '\n' +
'         applyKendoMultiCombo(element);' + '\n' +
'     }' + '\n' +
' ' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function addElement(element, element_div, form_div, row, col, elIndex, mode, selected_row, last_col) {' + '\n' +
'     if (element.type !== "multiselect") {' + '\n' +
'         if (element.type !== "button") {' + '\n' +
'             var label_element = "";' + '\n' +
'             label_element = document.createElement("span");' + '\n' +
'             label_element.innerHTML =' + '\n' +
'                 isSet(element.title) ? element.title : "";' + '\n' +
'             label_element.style.width =' + '\n' +
'                 isSet(element.title) ? ' + '\n' +
'                     isSet(element.labelwidth) ? (element.labelwidth - 10 + PX) : ((element.width / 3 - 10) + PX)' + '\n' +
'                     : 0 + PX;' + '\n' +
'             label_element.style.margin =' + '\n' +
'                 isSet(element.title) ? 5 + PX : 0 + PX;' + '\n' +
'             label_element.style.display =' + '\n' +
'                 isSet(element.title) ? INLINE_BLOCK : "NONE";' + '\n' +
'             if (isSet(element.visible) && element.visible === false || element.visible === "false") {' + '\n' +
'                 label_element.style.display = "none";' + '\n' +
'             }' + '\n' +
'             element_div.appendChild(label_element);' + '\n' +
'             var input_element = "";' + '\n' +
'             if(element.type == "hidden") {' + '\n' +
'                 input_element = document.createElement("input");' + '\n' +
'                 if(isSet(element.id))' + '\n' +
'                     input_element.id = element.id;' + '\n' +
'                 else ' + '\n' +
'                     input_element.id =' + '\n' +
'                     form_div.id + "_" + element.field + "_text_" + row + "_" + col +' + '\n' +
'                     "_" + elIndex;' + '\n' +
'                 element.id = input_element.id;' + '\n' +
'                 if(isSet(element.value))' + '\n' +
'                     input_element.value = element.value;' + '\n' +
'                 input_element.type = "hidden";' + '\n' +
'             }' + '\n' +
'             else if (element.type == "textbox") {' + '\n' +
'                 input_element = document.createElement("input");' + '\n' +
'                 if(isSet(element.changeAction)) {' + '\n' +
'                     input_element.setAttribute("onChange", element.changeAction+"(this)");' + '\n' +
'                 }' + '\n' +
'                 if(isSet(element.id))' + '\n' +
'                     input_element.id = element.id;' + '\n' +
'                 else ' + '\n' +
'                     input_element.id =' + '\n' +
'                     form_div.id + "_" + element.field + "_text_" + row + "_" + col +' + '\n' +
'                     "_" + elIndex;' + '\n' +
'                 element.id = input_element.id;' + '\n' +
'                 if(isSet(element.value))' + '\n' +
'                     input_element.value = element.value;' + '\n' +
'                 input_element.type = "text";' + '\n' +
'                 if(isSet(mode) && mode == "edit") {' + '\n' +
'                     if (isSet(element.path)) {' + '\n' +
'                         var arr = [];' + '\n' +
'                         arr[0] = element;' + '\n' +
'                         var data = getDataFromPath(configObj, arr);' + '\n' +
'                         if (isSet(data)) {' + '\n' +
'                             if (data.length > 0) {' + '\n' +
'                                 input_element.value =' + '\n' +
'                                     data[0][element.field];' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                     if(isSet(selected_row) && isSet(element.field)) {' + '\n' +
'                         if(isSet(selected_row[element.field]))' + '\n' +
'                             input_element.value = selected_row[element.field];' + '\n' +
'                         else' + '\n' +
'                             input_element.value = "";' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             } else if (element.type == "combobox" ||' + '\n' +
'                 element.type == "dropdown") {' + '\n' +
'                 input_element =' + '\n' +
'                     document.createElement("select");' + '\n' +
'                 if(isSet(element.changeAction)) {' + '\n' +
'                     input_element.setAttribute("onChange", element.changeAction+"(this)");' + '\n' +
'                 }' + '\n' +
'                 if(isSet(mode) && mode == "edit") {' + '\n' +
'                     element.data = [];' + '\n' +
'                 }' + '\n' +
'                 if (isSet(element.values)) {' + '\n' +
'                     var options = element.values.split(",");' + '\n' +
'                     for (var oCount = 0; oCount < options.length; oCount++) {' + '\n' +
'                         var option_el =' + '\n' +
'                             document.createElement("option");' + '\n' +
'                         option_el.value = oCount;' + '\n' +
'                         option_el.text = options[oCount];' + '\n' +
'                         input_element.appendChild(option_el);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'                 if (isSet(element.path)) {' + '\n' +
'                     var arr = [];' + '\n' +
'                     arr[0] = element;' + '\n' +
'                     var data = getDataFromPath(configObj, arr);' + '\n' +
'                     if (isSet(data) && data.length > 0) {' + '\n' +
'                         var cdata = [];' + '\n' +
'                         var editdata = [];' + '\n' +
'                         for (var count = 0; count < data.length; count++) {' + '\n' +
'                             var option_el =' + '\n' +
'                             document.createElement("option");' + '\n' +
'                             option_el.value = count;' + '\n' +
'                             option_el.text =' + '\n' +
'                             data[count][element.field];' + '\n' +
'                             input_element.' + '\n' +
'                             appendChild(option_el);' + '\n' +
'                             cdata.push({"id": data[count][element.field], "value":count});' + '\n' + 
'                         }' + '\n' +
'                         if(isSet(cdata) && cdata.length > 0) {' + '\n' +
'                             if(isSet(mode) && mode == "edit") {' + '\n' +
'                                 if(isSet(selected_row) && isSet(element.field)) {' + '\n' +
'                                     if(isSet(selected_row[element.field])) {' + '\n' +
'                                         for(var count=0; count<cdata.length; count++) {' + '\n' +
'                                             if(cdata[count]["id"] === selected_row[element.field]) {' + '\n' +
'                                                 editdata[0] = cdata[count];' + '\n' +
'                                                 break;' + '\n' +
'                                             }' + '\n' +
'                                         }' + '\n' +
'                                         if(editdata.length > 0)' + '\n' +
'                                         element.data = editdata;' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                             } else {' + '\n' +
'                                 element.data = cdata;' + '\n' +
'                             }' + '\n' +
'                         } ' + '\n' +
'                     } else {' + '\n' +
'                         if(isSet(mode) && mode == "edit") {' + '\n' +
'                             if(isSet(selected_row) && isSet(element.field) && isSet(selected_row[element.field])) {' + '\n' +
'                                 element.data = [{"id":selected_row[element.field],"value":0}];' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
' ' + '\n' +
'                 if(isSet(element.url)) {' + '\n' +
'                     var url = resolveFieldsInURL(element.url);' + '\n' +
'                     var cbParams = {};' + '\n' +
'                     cbParams.element = element;' + '\n' +
'                     cbParams.mode = mode;' + '\n' +
'                     if(isSet(url)) {' + '\n' +
'                         if(isSet(element.urlcb) && typeof window[element.urlcb] === "function")' + '\n' +
'                         doAjaxCall(url, "GET", null, element.urlcb, "", false,' + '\n' +
'                         cbParams);' + '\n' +
'                         else' + '\n' +                       
'                         doAjaxCall(url, "GET", null, "loadComboBox", "", false,' + '\n' +
'                         cbParams);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'' + '\n' +
'                 if (element.type == "combobox") {' + '\n' +
'                     if(isSet(element.id))' + '\n' +
'                         input_element.id = element.id;' + '\n' +
'                     else ' + '\n' +
'                         input_element.id =' + '\n' +
'                         form_div.id + "_" + element.field + "_combo_" + row + "_" + col +' + '\n' +
'                         "_" + elIndex;' + '\n' +
'                     element.id = input_element.id;' + '\n' +
'                 } else if (element.type == "dropdown") {' + '\n' +
'                     if(isSet(element.id))' + '\n' +
'                         input_element.id = element.id;' + '\n' +
'                     else ' + '\n' +
'                         input_element.id =' + '\n' +
'                         form_div.id + "_" + element.field + "_dropdown_" + row + "_" + col +' + '\n' +
'                         "_" + elIndex;' + '\n' +
'                     element.id = input_element.id;' + '\n' +
'                 }' + '\n' +
'                 if (isSet(element.path) && isSet(mode) && mode == "edit") {' + '\n' +
'                     var arr = [];' + '\n' +
'                     arr[0] = element;' + '\n' +
'                     var data = getDataFromPath(configObj, arr);' + '\n' +
'                     if (isSet(data)) {' + '\n' +
'                         if (data.length > 0) {' + '\n' +
'                             input_element.value =' + '\n' +
'                                 data[0][element.field];' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             } else if (element.type == "checkbox") {' + '\n' +
'                 input_element = document.createElement("input");' + '\n' +
'                 input_element.id =' + '\n' +
'                     form_div.id + "_" + element.field + "_checkbox_" + row + "_" + col +' + '\n' +
'                     "_" + elIndex;' + '\n' +
'                 element.id = input_element.id;' + '\n' +
'                 input_element.type = "checkbox";' + '\n' +
'                 input_element.className = "k-checkbox";' + '\n' +
'                 if(isSet(element.changeAction)) {' + '\n' +
'                     input_element.setAttribute("onChange", element.changeAction+"(this)");' + '\n' +
'                 }' + '\n' +
'             } else if (element.type == "radio") {' + '\n' +
'                 input_element = document.createElement("input");' + '\n' +
'                 input_element.id =' + '\n' +
'                     form_div.id + "_" + element.field + "_radio_" + row + "_" + col +' + '\n' +
'                     "_" + elIndex;' + '\n' +
'                 element.id = input_element.id;' + '\n' +
'                 input_element.type = "radio";' + '\n' +
'             } else if (element.type == "label") {' + '\n' +
'                 input_element = document.createElement("span");' + '\n' +
'                 input_element.id =' + '\n' +
'                     form_div.id + "_" + element.field + "_label_" + row + "_" + col +' + '\n' +
'                     "_" + elIndex;' + '\n' +
'                 element.id = input_element.id;' + '\n' +
'             } else if (element.type == "spinner") {' + '\n' +
'                 input_element = document.createElement("input");' + '\n' +
'                 input_element.id =' + '\n' +
'                     form_div.id + "_" + element.field + "_spinner_" + row + "_" + col +' + '\n' +
'                     "_" + elIndex;' + '\n' +
'                 element.id = input_element.id;' + '\n' +
'             } else if (element.type == "multicombo") {' + '\n' +
'                 input_element = document.createElement("input");' + '\n' +
'                     if(isSet(element.id))' + '\n' +
'                         input_element.id = element.id;' + '\n' +
'                     else ' + '\n' +
'                     input_element.id =' + '\n' +
'                     form_div.id + "_" + element.field + "_multicombo_" + row + "_" + col +' + '\n' +
'                     "_" + elIndex;' + '\n' +
'                 element.id = input_element.id;' + '\n' +
'                 if(isSet(element.url)) {' + '\n' +
'                     var url = resolveFieldsInURL(element.url);' + '\n' +
'                     var cbParams = {};' + '\n' +
'                     cbParams.element = element;' + '\n' +
'                     if(isSet(url)) {' + '\n' +
'                         if(isSet(element.urlcb) && typeof window[element.urlcb] === "function")' + '\n' +
'                         doAjaxCall(url, "GET", null, element.urlcb, "", false,' + '\n' +
'                         cbParams);' + '\n' +
'                         else' + '\n' +
'                         doAjaxCall(url, "GET", null, "loadComboBox", "", false,' + '\n' +
'                         cbParams);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'                 if (isSet(element.path)) {' + '\n' +
'                     var arr = [];' + '\n' +
'                     arr[0] = element;' + '\n' +
'                     var data = getDataFromPath(configObj, arr);' + '\n' +
'                     if (isSet(data) && data.length > 0) {' + '\n' +
'                         var ds = [];' + '\n' +
'                         for (var count = 0; count < data.length; count++) {' + '\n' +
'                             ds.push({' + '\n' +
'                                 "id": data[count][element.field],' + '\n' +
'                                 "value": count' + '\n' +
'                             });' + '\n' +
'                         }' + '\n' +
'                         if (ds.length > 0)' + '\n' +
'                             element.data = ds;' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             if (element.editable === "false" ||' + '\n' +
'                element.editable === false) {' + '\n' +
'                input_element.disabled = true;' + '\n' +
'             }' + '\n' +
' ' + '\n' +
'             if (isSet(element.title)) {' + '\n' +
'                 if(!isSet(element.labelwidth)) {' + '\n' +
'                     input_element.style.width =' + '\n' +
'                     (element.width * 2/3) + PX;' + '\n' +
'                 }' + '\n' +
'                 else {' + '\n' +
'                     input_element.style.width = element.width - element.labelwidth + PX;' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             else {' + '\n' +
'                 input_element.style.width =' + '\n' +
'                     (element.width - 10) + PX;' + '\n' +
'             }' + '\n' +
'             input_element.style.display = INLINE_BLOCK;' + '\n' +
'             element_div.appendChild(input_element);' + '\n' +
'             if(last_col === false && element.type !== "hidden") {' + '\n' +
'                 var div_empty = document.createElement("div");' + '\n' +
'                 div_empty.style.width = EDIV_WIDTH + PX;' + '\n' +
'                 div_empty.style.height = 25 + PX;' + '\n' +
'                 div_empty.style.display = "inline-block";' + '\n' +
'                 div_empty.style.verticalAlign = "middle";' + '\n' +
'                 element_div.appendChild(div_empty);' + '\n' +
'             }' + '\n' +
'             label_element.id = "label_" + element.field;' + '\n' +
'         } else {' + '\n' +
'             var input_element =' + '\n' +
'                 createButton(form_div.id + "_" + element.field + "_text_" + row +' + '\n' +
'                 "_" + col + "_" + elIndex, "Add", null, null, (element.width / 2 - 10) + PX, 5 + PX);' + '\n' +
'             input_element.style.display = INLINE_BLOCK;' + '\n' +
'             element.id = input_element.id;' + '\n' +
'             element_div.appendChild(input_element);' + '\n' +
'         }' + '\n' +
' ' + '\n' +

'     } else if (element.type == "multiselect") {' + '\n' +
'         var multiselect_div =' + '\n' +
'             document.createElement("div");' + '\n' +
'         multiselect_div.style.minWidth = LTOR_BTN_TOP + PX;' + '\n' +
'         multiselect_div.style.minHeight = LTOR_BTN_TOP + PX;' + '\n' +
'         element_div.appendChild(multiselect_div);' + '\n' +
' ' + '\n' +
'         var lhs_div =' + '\n' +
'             document.createElement("div");' + '\n' +
'         lhs_div.style.margin = 1 + PC;' + '\n' +
'         lhs_div.style.verticalAlign = TOP;' + '\n' +
'         lhs_div.style.width = SELECT_WIDTH + PX;' + '\n' +
'         lhs_div.style.height = SELECT_HEIGHT + PX;' + '\n' +
'         lhs_div.style.display = INLINE_BLOCK;' + '\n' +
'         multiselect_div.appendChild(lhs_div);' + '\n' +
'         var lhs_span_div =' + '\n' +
'             document.createElement("div");' + '\n' +
'         lhs_div.appendChild(lhs_span_div);' + '\n' +
'         lhs_span_div.style.width = SELECT_WIDTH + PX;' + '\n' +
'         var lhslabel_element =' + '\n' +
'             document.createElement("span");' + '\n' +
'         lhslabel_element.innerHTML =' + '\n' +
'             isSet(element.lhstitle) ? element.lhstitle : "";' + '\n' +
'         lhs_span_div.appendChild(lhslabel_element);' + '\n' +
'         var lhs_select_div =' + '\n' +
'             document.createElement("div");' + '\n' +
'         lhs_select_div.id =' + '\n' +
'             form_div.id + "_multiselect_lhs_" + elIndex;' + '\n' +
'         element.lhsid = lhs_select_div.id' + '\n' +
'         lhs_select_div.className = "multiselect";' + '\n' +
'         lhs_select_div.style.height = SELECT_WIDTH + PX;' + '\n' +
'         lhs_select_div.style.overflow = AUTO;' + '\n' +
'         lhs_select_div.style.border = 1 + PX + " " + SOLID;' + '\n' +
'         lhs_select_div.style.borderColor = "#CCC";' + '\n' +
'         lhs_div.appendChild(lhs_select_div);' + '\n' +
' ' + '\n' +
'         var btn_div =' + '\n' +
'             document.createElement("div");' + '\n' +
'         btn_div.style.width = 30 + PX;' + '\n' +
'         btn_div.style.height = SELECT_HEIGHT + PX;' + '\n' +
'         btn_div.style.display = INLINE_BLOCK;' + '\n' +
'         multiselect_div.appendChild(btn_div);' + '\n' +
'         var btnltor =' + '\n' +
'             document.createElement("input");' + '\n' +
'         btnltor.id = form_div.id + "_ltor_btn_" + elIndex;' + '\n' +
'         btnltor.type = "button";' + '\n' +
'         btnltor.value = ">>";' + '\n' +
'         btnltor.onclick = this.handleltor;' + '\n' +
'         btnltor.className = "k-button";' + '\n' +
'         btnltor.style.fontSize = 10 + PX;' + '\n' +
'         btnltor.style.width = ARROW_BTN_WIDTH + PX;' + '\n' +
'         btnltor.style.margin = 1 + PX;' + '\n' +
'         btnltor.style.marginTop = LTOR_BTN_TOP + PX;' + '\n' +
'         btn_div.appendChild(btnltor);' + '\n' +
'         var btnrtol =' + '\n' +
'             document.createElement("input");' + '\n' +
'         btnrtol.id = form_div.id + "_rtol_btn_" + elIndex;' + '\n' +
'         btnrtol.type = "button";' + '\n' +
'         btnrtol.value = "<<";' + '\n' +
'         btnrtol.onclick = this.handlertol;' + '\n' +
'         btnrtol.className = "k-button";' + '\n' +
'         btnrtol.style.fontSize = 10 + PX;' + '\n' +
'         btnrtol.style.width = ARROW_BTN_WIDTH + PX;' + '\n' +
'         btnrtol.style.margin = 1 + PX' + '\n' +
'         btnltor.style.marginTop = RTOL_BTN_TOP + PX;' + '\n' +
'         btn_div.appendChild(btnrtol);' + '\n' +
' ' + '\n' +
'         var rhs_div =' + '\n' +
'             document.createElement("div");' + '\n' +
'         rhs_div.style.margin = 1 + PC;' + '\n' +
'         rhs_div.style.verticalAlign = TOP;' + '\n' +
'         rhs_div.style.width = SELECT_WIDTH + PX;' + '\n' +
'         rhs_div.style.height = SELECT_HEIGHT + PX;' + '\n' +
'         rhs_div.style.display = INLINE_BLOCK;' + '\n' +
'         multiselect_div.appendChild(rhs_div);' + '\n' +
'         var rhs_span_div =' + '\n' +
'             document.createElement("div");' + '\n' +
'         rhs_div.appendChild(rhs_span_div);' + '\n' +
'         rhs_span_div.style.width = SELECT_WIDTH + PX;' + '\n' +
'         var rhslabel_element =' + '\n' +
'             document.createElement("span");' + '\n' +
'         rhslabel_element.innerHTML =' + '\n' +
'             isSet(element.rhstitle) ? element.rhstitle : "";' + '\n' +
'         rhs_span_div.appendChild(rhslabel_element);' + '\n' +
'         var rhs_select_div =' + '\n' +
'             document.createElement("div");' + '\n' +
'         rhs_select_div.id =' + '\n' +
'             form_div.id + "_multiselect_rhs_" + elIndex;' + '\n' +
'         element.rhsid = rhs_select_div.id' + '\n' +
'         rhs_select_div.className = "multiselect";' + '\n' +
'         rhs_select_div.style.height = SELECT_WIDTH + PX;' + '\n' +
'         rhs_select_div.style.overflow = AUTO;' + '\n' +
'         rhs_select_div.style.border = 1 + PX + " " + SOLID;' + '\n' +
'         rhs_select_div.style.borderColor = "#CCC";' + '\n' +
'         rhs_div.appendChild(rhs_select_div);' + '\n' +
' ' + '\n' +
'         if (($("#mstemplate")).length <= 0) {' + '\n' +
'             var scr = document.createElement("script");' + '\n' +
'             scr.id = "mstemplate";' + '\n' +
'             scr.type = "text/x-kendo-tmpl";' + '\n' +
'             scr.innerHTML = "<div><span>${item}</span></div>";' + '\n' +
'             document.body.appendChild(scr);' + '\n' +
'         }' + '\n' +
'         if (isSet(element.url)) {' + '\n' +
'             var url = resolveFieldsInURL(element.url);' + '\n' +
'             var cbParams = {};' + '\n' +
'             cbParams.element = element;' + '\n' +
'             cbParams.mode = mode;' + '\n' +
'             cbParams.selected_row = selected_row;' + '\n' +
'             if(isSet(url)) {' + '\n' +
'                 if(isSet(element.urlcb) && typeof window[element.urlcb] === "function")' + '\n' +
'                     doAjaxCall(url, "GET", null, element.urlcb, "", false,' + '\n' +
'                     cbParams);' + '\n' +
'                 else' + '\n' +                       
'                     doAjaxCall(url, "GET", null, "loadMultiSelect", "", false,' + '\n' +
'                     cbParams);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getFieldFromURL(url) {' + '\n' +
'     var re = /{{(.*?)}}/g;' + '\n' +
'     var paths = url.match(re);' + '\n' +
'     if (isSet(paths)) {' + '\n' +
'         paths = (paths.toString()).replace(/[{{}}]/g, "");' + '\n' +
'         paths = paths.split(",");' + '\n' +
'     }' + '\n' +
'     return paths;' + '\n' +
' }' + '\n' +
' function resolveFieldsInURL(url) {' + '\n' +
'     var re = /{{(.*?)}}/g;' + '\n' +
'     var paths = url.match(re);' + '\n' +
'     if (isSet(paths)) {' + '\n' +
'         paths = (paths.toString()).replace(/[{{}}]/g, "");' + '\n' +
'         paths = paths.split(",");' + '\n' +
'     } else' + '\n' +
'         paths = [];' + '\n' +
' ' + '\n' +
'     for (var i = 0; i < paths.length; i++) {' + '\n' +
'         if (paths[i].indexOf("(") != -1 && paths[i].indexOf(")") != -1) {' + '\n' +
'             //function name given' + '\n' +
'             var format = paths[i];' + '\n' +
'             var fn = format.split("(")[0];' + '\n' +
'             format = format.split("(")[1];' + '\n' +
'             format = format.split(")")[0];' + '\n' +
'             format = format.replace(/[{{}}]/g, "");' + '\n' +
'             if (typeof window[fn] === "function") {' + '\n' +
'                 var value = window[fn]();' + '\n' +
'                 url = url.replace("{{" + paths[i] + "}}", value);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return url;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function handleltor(arg) {' + '\n' +
'     var dataItems = [];' + '\n' +
'     var btn_id = arg.target.id;' + '\n' +
'     var lhs_list_id = btn_id.replace("ltor_btn", "multiselect_lhs");' + '\n' +
'     var rhs_list_id = btn_id.replace("ltor_btn", "multiselect_rhs");' + '\n' +
'     var availablelist = $("#" + lhs_list_id).data("kendoListView");' + '\n' +
'     var selectlist = $("#" + rhs_list_id).data("kendoListView");' + '\n' +
'     var selected = availablelist.element.children().closest(".k-state-selected").find("span");' + '\n' +
'     if (selected.length > 0) {' + '\n' +
'         for (var i = 0; i < selected.length; i++) {' + '\n' +
'             dataItems.push(selected[i].innerHTML);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     var selectdata = selectlist.dataSource.data();' + '\n' +
'     var availdata = availablelist.dataSource.data();' + '\n' +
'     for (var i = 0; i < dataItems.length; i++) {' + '\n' +
'         selectdata.push({' + '\n' +
'             "item": dataItems[i]' + '\n' +
'         });' + '\n' +
'     }' + '\n' +
'     for (var i = 0; i < dataItems.length; i++) {' + '\n' +
'         for (var j = 0; j < availdata.length; j++) {' + '\n' +
'             if (dataItems[i] == availdata[j].item) {' + '\n' +
'                 availdata.splice(j, 1);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     selectlist.dataSource.data(selectdata);' + '\n' +
'     availablelist.dataSource.data(availdata);' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function handlertol(arg) {' + '\n' +
'     var dataItems = [];' + '\n' +
'     var btn_id = arg.target.id;' + '\n' +
'     var lhs_list_id = btn_id.replace("rtol_btn", "multiselect_lhs");' + '\n' +
'     var rhs_list_id = btn_id.replace("rtol_btn", "multiselect_rhs");' + '\n' +
'     var availablelist = $("#" + lhs_list_id).data("kendoListView");' + '\n' +
'     var selectlist = $("#" + rhs_list_id).data("kendoListView");' + '\n' +
'     var selected = selectlist.element.children().closest(".k-state-selected").find("span");' + '\n' +
'     if (selected.length > 0) {' + '\n' +
'         for (var i = 0; i < selected.length; i++) {' + '\n' +
'             dataItems.push(selected[i].innerHTML);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     var selectdata = selectlist.dataSource.data();' + '\n' +
'     var availdata = availablelist.dataSource.data();' + '\n' +
'     for (var i = 0; i < dataItems.length; i++) {' + '\n' +
'         availdata.push({' + '\n' +
'             "item": dataItems[i]' + '\n' +
'         });' + '\n' +
'     }' + '\n' +
'     for (var i = 0; i < dataItems.length; i++) {' + '\n' +
'         for (var j = 0; j < selectdata.length; j++) {' + '\n' +
'             if (dataItems[i] == selectdata[j].item) {' + '\n' +
'                 selectdata.splice(j, 1);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     selectlist.dataSource.data(selectdata);' + '\n' +
'     availablelist.dataSource.data(availdata);' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function loadComboBox(result, cbParam) {' + '\n' +
'     var el = cbParam.element;' + '\n' +
'     var combo_data = [];' + '\n' +
'     var arr = [];' + '\n' +
'     arr[0] = el;' + '\n' +
'     var data = getDataFromPath(result, arr);' + '\n' +
'     if(el.type == "combobox" || el.type == "dropdown") {' + '\n' +
'         if (isSet(data) && data.length > 0) {' + '\n' +
'             var ds = [];' + '\n' +
'             for (var count = 0; count < data.length; count++) {' + '\n' +
'                 ds.push({' + '\n' +
'                     "id": data[count][el.field],' + '\n' +
'                     "value": count' + '\n' +
'                 });' + '\n' +
'             }' + '\n' +
'             if (ds.length > 0)' + '\n' +
'                 el.data = ds;' + '\n' +
'         }' + '\n' +
'         if(el.type == "combobox")' + '\n' +
'             applyKendoCombobox(el);' + '\n' +
'         else if(el.type == "dropdown")' + '\n' +
'             applyKendoDropDown(el);' + '\n' +
'     }' + '\n' +
'     else if(el.type == "multicombo") {' + '\n' +
'         if (isSet(el.path)) {' + '\n' +
'             var arr = [];' + '\n' +
'             arr[0] = el;' + '\n' +
'             var data = getDataFromPath(configObj, arr);' + '\n' +
'             if (isSet(data) && data.length > 0) {' + '\n' +
'                 var ds = [];' + '\n' +
'                 for (var count = 0; count < data.length; count++) {' + '\n' +
'                     ds.push({' + '\n' +
'                         "id": data[count][el.field],' + '\n' +
'                         "value": count' + '\n' +
'                     });' + '\n' +
'                 }' + '\n' +
'                 if (ds.length > 0)' + '\n' +
'                     el.data = ds;' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         applyKendoMultiCombo(el);' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' function loadMultiSelect(result, cbParam) {' + '\n' +
'     var ms = cbParam.element;' + '\n' +
'     var mode = cbParam.mode;' + '\n' +
'     var sel_row = cbParam.selected_row;' + '\n' +
'     var element = cbParam.element;' + '\n' +
'     var lhs_result = jsonPath(result, ms.lhspath);' + '\n' +
'     var tmpselectedlist = [];' + '\n' +
'     var tmpavailablelist = [];' + '\n' +
' ' + '\n' +
'     for (var i=0; i<lhs_result.length; i++) {' + '\n' +
'         tmpavailablelist.push({item: lhs_result[i]});' + '\n' +
'     }' + '\n' +
' ' + '\n' +
'     if(mode=="edit") {' + '\n' +
'         if(isSet(sel_row)) {' + '\n' +
'             var selected_row = [];' + '\n' +
'             if(!isSet(sel_row[0]))' + '\n' +
'                 selected_row[0] = sel_row;' + '\n' +
'             else' + '\n' +
'                 selected_row = sel_row;' + '\n' +
'             for(var row=0; row<selected_row.length; row++) {' + '\n' +
'             var data = selected_row[row][element.field];' + '\n' +
'             var result_data = "";' + '\n' +
'             if(!isSet(data))' + '\n' +
'                 data = "";' + '\n' +
'             else' + '\n' +
'                 data = data.split(",");' + '\n' +
'             for(var i=0; i<data.length; i++) {' + '\n' +
'                 if(isSet(element.rhspath)) {' + '\n' +
'                     if (element.rhspath.indexOf("(") != -1 &&' + '\n' +
'                         element.rhspath.indexOf(")") != -1) {' + '\n' +
'                         var fn = element.rhspath.split("(")[0];' + '\n' +
'                         if (typeof window[fn] === "function") {' + '\n' +
'                             result_data = window[fn](data[i]);' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'                 tmpselectedlist.push({item:result_data});' + '\n' +
'             }' + '\n' +
'             }' + '\n' +
'             for (var i=0; i<tmpselectedlist.length; i++) {' + '\n' +
'                 for(var j=0; j<tmpavailablelist.length; j++) {' + '\n' +
'                     if(tmpselectedlist[i].item == tmpavailablelist[j].item) {' + '\n' +
'                         tmpavailablelist.splice(j,1);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     $("#" + ms.lhsid).kendoListView({' + '\n' +
'         dataSource: tmpavailablelist,' + '\n' +
'         template: kendo.template($("#mstemplate").html()),' + '\n' +
'         selectable: "multiple row"' + '\n' +
'     });' + '\n' +
' ' + '\n' +
'     $("#" + ms.rhsid).kendoListView({' + '\n' +
'         dataSource: tmpselectedlist,' + '\n' +
'         template: kendo.template($("#mstemplate").html()),' + '\n' +
'         selectable: "multiple row"' + '\n' +
'     });' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function generateHTMLTable(rows, cols, sections, table_config) {' + '\n' +
'     if (table_config) {' + '\n' +
'         var parent;' + '\n' +
'         if (isSet(sections[table_config.row - 1]) &&' + '\n' +
'             isSet(sections[table_config.row - 1][table_config.col - 1]))' + '\n' +
'             parent = sections[table_config.row - 1][table_config.col - 1];' + '\n' +
'         else' + '\n' +
'             parent = sections;' + '\n' +
' ' + '\n' +
'         var enclosing_div = document.createElement("div");' + '\n' +
'         enclosing_div.id = "div_" + table_config.id;' + '\n' +
'         //enclosing_div.style.left = 5 + PX;' + '\n' +
'         //enclosing_div.style.top = 5 + PX;' + '\n' +
'         enclosing_div.style.margin = 5 + PX;' + '\n' +
'         if (isNumber(parent.style.width)) {' + '\n' +
'             var enc_width = parent.style.width;' + '\n' +
'             enclosing_div.width = enc_width + PX;' + '\n' +
'         } else if (isString(parent.style.width)) {' + '\n' +
'             if ((parent.style.width).indexOf(PC) != -1) {' + '\n' +
'                 var enc_width =' + '\n' +
'                     parseInt((parent.style.width).split(PC)[0]) -' + '\n' +
'                     0.5;' + '\n' +
'                 enclosing_div.width = enc_width + PC;' + '\n' +
'                 enclosing_div.style.left = 0.5 + PC;' + '\n' +
'             } else if ((parent.style.width).indexOf(PX) != -1) {' + '\n' +
'                 var enc_width =' + '\n' +
'                     parseInt((parent.style.width).split(PX)[0]) - 30;' + '\n' +
'                 enclosing_div.width = enc_width + PX;' + '\n' +
'             } else {' + '\n' +
'                 try {' + '\n' +
'                     var enc_width = parseInt(parent.style.width) - 10;' + '\n' +
'                     enclosing_div.width = enc_width + PX;' + '\n' +
'                 } catch (e) {' + '\n' +
'                     var enc_width = PAGE_DEFAULT_WIDTH_PX;' + '\n' +
'                     enclosing_div.width = enc_width + PX;' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         } else {' + '\n' +
'             var enc_width = PAGE_DEFAULT_WIDTH_PX;' + '\n' +
'             enclosing_div.width = enc_width + PX;' + '\n' +
'         }' + '\n' +
' ' + '\n' +
'         if (isNumber(parent.style.height)) {' + '\n' +
'             var enc_height = parseInt(parent.style.height - 40);' + '\n' +
'             enclosing_div.height = enc_height + PX;' + '\n' +
'         } else if (isString(parent.style.height)) {' + '\n' +
'             if ((parent.style.height).indexOf(PC) != -1) {' + '\n' +
'                 var enc_height =' + '\n' +
'                     parseInt((parent.style.height).split(PC)[0] - 1);' + '\n' +
'                 enclosing_div.height = enc_height + PC;' + '\n' +
'                 enclosing_div.style.top = 0.5 + PC;' + '\n' +
'             } else if ((parent.style.height).indexOf(PX) != -1) {' + '\n' +
'                 var enc_height =' + '\n' +
'                     parseInt((parent.style.height).split(PX)[0]) - 65;' + '\n' +
'                 enclosing_div.height = enc_height + PX;' + '\n' +
'             } else {' + '\n' +
'                 try {' + '\n' +
'                     var enc_height = PAGE_DEFAULT_HEIGHT_PX - 40;' + '\n' +
'                     enclosing_div.height = enc_height + PX;' + '\n' +
'                 } catch (e) {' + '\n' +
'                     var enc_height = (PAGE_DEFAULT_HEIGHT_PX - 40);' + '\n' +
'                     enclosing_div.height = enc_height + PX;' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         } else {' + '\n' +
'             var enc_height = (PAGE_DEFAULT_HEIGHT_PX - 40);' + '\n' +
'             enclosing_div.height = enc_height + PX;' + '\n' +
'         }' + '\n' +
' ' + '\n' +
'         enclosing_div.style.position = RELATIVE;' + '\n' +
'         table_config.width = enclosing_div.width;' + '\n' +
'         if (table_config.width.indexOf(PX) != -1) {' + '\n' +
'             table_config.width =' + '\n' +
'                 parseInt((table_config.width).split(PX)[0]) - 5 +' + '\n' +
'                 PX;' + '\n' +
'         } else if (table_config.width.indexOf(PC) != -1) {' + '\n' +
'             table_config.width =' + '\n' +
'                 parseInt((table_config.width).split(PC)[0]) - 0.5 +' + '\n' +
'                 PC;' + '\n' +
'         }' + '\n' +
'         table_config.height = enclosing_div.height;' + '\n' +
'         if (table_config.height.indexOf(PX) != -1) {' + '\n' +
'             table_config.height =' + '\n' +
'                 parseInt((table_config.height).split(PX)[0]) - 5 +' + '\n' +
'                 PX;' + '\n' +
'         } else if (table_config.height.indexOf(PC) != -1) {' + '\n' +
'             table_config.height =' + '\n' +
'                 parseInt((table_config.height).split(PC)[0]) - 0.5 +' + '\n' +
'                 PC;' + '\n' +
'         }' + '\n' +
' ' + '\n' +
'         //Handle title bar' + '\n' +
'         var title_div = generateTitleDiv(table_config);' + '\n' +
'         var actions_div = generateActionsDiv(table_config);' + '\n' +
'         parent.appendChild(title_div);' + '\n' +
'         parent.appendChild(actions_div);' + '\n' +
'         parent.appendChild(enclosing_div);' + '\n' +
'     }' + '\n' +
'     return parent;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function generateTitleDiv(table_config) {' + '\n' +
'     var title_div = document.createElement("div");' + '\n' +
'     title_div.id = "div_" + table_config.id + "_title";' + '\n' +
'     title_div.style.display = INLINE_BLOCK;' + '\n' +
'     title_div.style.height = 40 + PX;' + '\n' +
'     title_div.style.left = 5 + PX;' + '\n' +
'     title_div.style.top = 5 + PX;' + '\n' +
'     title_div.style.verticalAlign = "bottom";' + '\n' +
'     var title_span = document.createElement("span");' + '\n' +
'     title_span.id = "span_" + table_config.id + "_title";' + '\n' +
'     title_span.style.fontSize = "11px";' + '\n' +
'     title_span.style.fontWeight = "bold";' + '\n' +
'     title_span.style.marginTop = "10px";' + '\n' +
'     title_span.style.lineHeight = "40px";' + '\n' +
'     title_span.style.verticalAlign = "bottom";' + '\n' +
'     title_span.style.marginLeft = "5px";' + '\n' +
'     var p = getParentsForTable(table_config.id);' + '\n' +
'     if(isSet(p) && p.length > 0)'  + '\n' +
'     title_span.innerHTML = table_config.title;' + '\n' +
'     title_div.appendChild(title_span);' + '\n' +
'     return title_div;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function generateActionsDiv(table_config) {' + '\n' +
'     var actions_div = document.createElement("div");' + '\n' +
'     actions_div.id = "div_" + table_config.id + "_actions";' + '\n' +
'     actions_div.style.height = 40 + PX;' + '\n' +
'     actions_div.style.top = 5 + PX;' + '\n' +
'     actions_div.style.display = INLINE_BLOCK;' + '\n' +
'     actions_div.style.verticalAlign = "bottom";' + '\n' +
'     var action_div_width = 0;' + '\n' +
'     if (table_config.tableactions && table_config.tableactions.length > 0) {' + '\n' +
'         var actions_count = table_config.tableactions.length;' + '\n' +
'         var actual_actions_count = 0;' + '\n' +
'         for (var i = 0; i < table_config.tableactions.length; i++) {' + '\n' +
'             actual_actions_count += 1;' + '\n' +
'             var width = table_config.tableactions[i].width;' + '\n' +
'             if(isSet(width)) {' + '\n' +
'                 try{' + '\n' +
'                     width = parseInt(width.split("px")[0]);' + '\n' +
'                 } catch(e) {' + '\n' +
'                     width = BTN_WIDTH;' + '\n' +
'                 }' + '\n' +
'                 action_div_width+=width+10;' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         //action_div_width = (actual_actions_count * BTN_WIDTH +' + '\n' +
'         //    (actual_actions_count + 1) * 10);' + '\n' +
'         action_div_width += PX' + '\n' +
'         var action_div_left = (table_config.width - action_div_width);' + '\n' +
'         actions_div.style.width = action_div_width + PX;' + '\n' +
'         actions_div.style.left = action_div_left + PX;' + '\n' +
'         actions_div.style.cssFloat = RIGHT;' + '\n' +
' ' + '\n' +
'         for (var i = 0; i < actions_count; i++) {' + '\n' +
'             var text = table_config.tableactions[i].text;' + '\n' +
'             var width = table_config.tableactions[i].width;' + '\n' +
'             if (table_config.tableactions[i].type == "add") {' + '\n' +
'                 var btn_add = createButton("btn_" + table_config.id + "_add", (isSet(text) ? text : "Create"), null, 0 + PX, (isSet(width) ? width : null), null, null, false);' + '\n' +
'                 actions_div.appendChild(btn_add);' + '\n' +
'             } else if (table_config.tableactions[i].type == "edit") {' + '\n' +
'                 var btn_edit = createButton("btn_" + table_config.id + "_edit", (isSet(text) ? text : "Edit"), null, 0 + PX, (isSet(width) ? width : null), null, null, false);' + '\n' +
'                 actions_div.appendChild(btn_edit);' + '\n' +
'             } else if (table_config.tableactions[i].type == "delete") {' + '\n' +
'                 var btn_del = createButton("btn_" + table_config.id + "_delete", (isSet(text) ? text : "Delete"), null, 0 + PX, (isSet(width) ? width : null), null, null, false);' + '\n' +
'                 actions_div.appendChild(btn_del);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' ' + '\n' +
'     return actions_div;' + '\n' +
' }' + '\n' +
' function createWindow(windowId) {' + '\n' +
'     var action_window = document.createElement("div");' + '\n' +
'     action_window.id = windowId;' + '\n' +
'     action_window.style.display = "none";' + '\n' +
'     return action_window;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getTableIDFromButtonID(buttonId) {' + '\n' +
'     var target_id = buttonId.split("_");' + '\n' +
'     var len = target_id.length;' + '\n' +
'     var table_id = "";' + '\n' +
'     if (len > 0) {' + '\n' +
'         for (var i = 1; i < len - 1; i++) {' + '\n' +
'             if (i != (len - 2))' + '\n' +
'                 table_id += target_id[i] + "_";' + '\n' +
'             else' + '\n' +
'                 table_id += target_id[i];' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return table_id;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getParentForTable(parent, table_id, parents) {' + '\n' +
'     var index = parents.length;' + '\n' +
'     if (parent.targets && parent.targets.length > 0) {' + '\n' +
'         for (var j = 0; j < parent.targets.length; j++) {' + '\n' +
'             var tt = parent.targets[j];' + '\n' +
'             if (tt == table_id) {' + '\n' +
'                 parents[index++] = parent.id;' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return parents;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function resolveURLFields(url, table) {' + '\n' +
'     var parents = getParentsForTable(table.id);' + '\n' +
'     if (parents.length > 0) {' + '\n' +
'         var parentTables = [];' + '\n' +
'         for (var i = 0; i < parents.length; i++) {' + '\n' +
'             var parent = getTableByID(parents[i]);' + '\n' +
'             url = getActualURL(url, parent);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     url = getActualURL(url, table);' + '\n' +
'     return url;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function cleanupAllTables() {' + '\n' +
'     if (config.tables && config.tables.length > 0) {' + '\n' +
'         for (var i = 0; i < config.tables.length; i++) {' + '\n' +
'             var table = config.tables[i];' + '\n' +
'             if(isSet($("#div_"+table.id).data("kendoGrid")))' + '\n' +
'                 $("#div_"+table.id).data("kendoGrid").dataSource.data([]);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (config.tabs && config.tabs.length > 0) {' + '\n' +
'     for (var i = 0; i < config.tabs.length; i++) {' + '\n' +
'         if (config.tabs[i].tables && config.tabs[i].tables.length > 0) {' + '\n' +
'             for (var j = 0; j < config.tabs[i].tables.length; j++) {' + '\n' +
'                 var table = config.tabs[i].tables[j];' + '\n' +
'                 if(isSet($("#div_"+table.id).data("kendoGrid")))' + '\n' +
'                     $("#div_"+table.id).data("kendoGrid").dataSource.data([]);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         if (config.tabs[i].tabs && config.tabs[i].tabs.length > 0) {' + '\n' +
'             for (var j = 0; j < config.tabs[i].tabs.length; j++) {' + '\n' +
'                 if (config.tabs[i].tabs[j] && config.tabs[i].tabs[j].tables &&' + '\n' +
'                     config.tabs[i].tabs[j].tables.length > 0) {' + '\n' +
'                     for (var k = 0; k < config.tabs[i].tabs[j].tables.length; k++) {' + '\n' +
'                         var table = config.tabs[i].tabs[j].tables[k];' + '\n' +
'                         if(isSet($("#div_"+table.id).data("kendoGrid")))' + '\n' +
'                             $("#div_"+table.id).data("kendoGrid").dataSource.data([]);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' function getParentsForTable(table_id) {' + '\n' +
'     var parents = [];' + '\n' +
'     if (config.tables && config.tables.length > 0) {' + '\n' +
'         for (var i = 0; i < config.tables.length; i++) {' + '\n' +
'             table = config.tables[i];' + '\n' +
'             parents = getParentForTable(table, table_id, parents);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (config.panels && config.panels.length > 0) {' + '\n' +
'         for (var i = 0; i < config.panels.length; i++) {' + '\n' +
'             table = config.panels[i];' + '\n' +
'             parents = getParentForTable(table, table_id, parents);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if(config.tabs && config.tabs.length > 0) {' + '\n' +
'     for (var i = 0; i < config.tabs.length; i++) {' + '\n' +
'         if (config.tabs[i].tables && config.tabs[i].tables.length > 0) {' + '\n' +
'             for (var j = 0; j < config.tabs[i].tables.length; j++) {' + '\n' +
'                 table = config.tabs[i].tables[j];' + '\n' +
'                 parents = getParentForTable(table, table_id, parents);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         if (config.tabs[i].panels && config.tabs[i].panels.length > 0) {' + '\n' +
'             for (var j = 0; j < config.tabs[i].panels.length; j++) {' + '\n' +
'                 table = config.tabs[i].panels[j];' + '\n' +
'                 parents = getParentForTable(table, table_id, parents);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         if (config.tabs[i].tabs && config.tabs[i].tabs.length > 0) {' + '\n' +
'             for (var j = 0; j < config.tabs[i].tabs.length; j++) {' + '\n' +
'                 if (config.tabs[i].tabs[j] && config.tabs[i].tabs[j].tables &&' + '\n' +
'                     config.tabs[i].tabs[j].tables.length > 0) {' + '\n' +
'                     for (var k = 0; k < config.tabs[i].tabs[j].tables.length; k++) {' + '\n' +
'                         table = config.tabs[i].tabs[j].tables[k];' + '\n' +
'                         parents = getParentForTable(table, table_id, parents);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'                 if (config.tabs[i].tabs[j] && config.tabs[i].tabs[j].panels &&' + '\n' +
'                     config.tabs[i].tabs[j].panels.length > 0) {' + '\n' +
'                     for (var k = 0; k < config.tabs[i].tabs[j].panels.length; k++) {' + '\n' +
'                         table = config.tabs[i].tabs[j].panels[k];' + '\n' +
'                         parents = getParentForTable(table, table_id, parents);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     }' + '\n' +
'     return parents;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getTableByID(table_id) {' + '\n' +
'     if (config.tables && config.tables.length > 0) {' + '\n' +
'         for (var i = 0; i < config.tables.length; i++) {' + '\n' +
'             table = config.tables[i];' + '\n' +
'             if (table.id == table_id) {' + '\n' +
'                 return table;' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (config.panels && config.panels.length > 0) {' + '\n' +
'         for (var i = 0; i < config.panels.length; i++) {' + '\n' +
'             table = config.panels[i];' + '\n' +
'             if (table.id == table_id) {' + '\n' +
'                 return table;' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (config.tabs && config.tabs.length > 0) {' + '\n' +
'         for (var i = 0; i < config.tabs.length; i++) {' + '\n' +
'             if (config.tabs[i].tables && config.tabs[i].tables.length > 0) {' + '\n' +
'                 for (var j = 0; j < config.tabs[i].tables.length; j++) {' + '\n' +
'                     table = config.tabs[i].tables[j];' + '\n' +
'                     if (table.id == table_id) {' + '\n' +
'                         return table;' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             if (config.tabs[i].panels && config.tabs[i].panels.length > 0) {' + '\n' +
'                 for (var j = 0; j < config.tabs[i].panels.length; j++) {' + '\n' +
'                     table = config.tabs[i].panels[j];' + '\n' +
'                     if (table.id == table_id) {' + '\n' +
'                         return table;' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             if (config.tabs[i].tabs && config.tabs[i].tabs.length > 0) {' + '\n' +
'                 for (var j = 0; j < config.tabs[i].tabs.length; j++) {' + '\n' +
'                     if (config.tabs[i].tabs[j] && config.tabs[i].tabs[j].tables &&' + '\n' +
'                         config.tabs[i].tabs[j].tables.length > 0) {' + '\n' +
'                         for (var k = 0; k < config.tabs[i].tabs[j].tables.length; k++) {' + '\n' +
'                             table = config.tabs[i].tabs[j].tables[k];' + '\n' +
'                             if (table.id == table_id) {' + '\n' +
'                                 return table;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                     if (config.tabs[i].tabs[j] && config.tabs[i].tabs[j].panels &&' + '\n' +
'                         config.tabs[i].tabs[j].panels.length > 0) {' + '\n' +
'                         for (var k = 0; k < config.tabs[i].tabs[j].panels.length; k++) {' + '\n' +
'                             table = config.tabs[i].tabs[j].panels[k];' + '\n' +
'                             if (table.id == table_id) {' + '\n' +
'                                 return table;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return "";' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function onLandingTableAddEdit(arg) {' + '\n' +
'     var table_id = getTableIDFromButtonID(arg.target.id)' + '\n' +
'     var table = getTableByID(table_id);' + '\n' +
'     if (table != "" && table.tableactions.length > 0) {' + '\n' +
'         var actions_count = table.tableactions.length;' + '\n' +
'         for (var i = 0; i < actions_count; i++) {' + '\n' +
'             var action = table.tableactions[i];' + '\n' +
'             if (action.type == "add" || action.type == "edit") {' + '\n' +
'                 var mode =' + '\n' +
'                     arg.target.id.split(table_id + "_")[1];' + '\n' +
'                 if (action.type == mode) {' + '\n' +
'                     var source = getKendoGridForATable(table);' + '\n' +
'                     var selected_row = [];' + '\n' +
'                     if(isSet(source)) {' + '\n' +
'                        if(action.process == "table") {' + '\n' +
'                        try {' + '\n' +
'                            selected_row = source.dataSource.data();' + '\n' +
'                        }' + '\n' +
'                        catch(e) {}' + '\n' +
'                 }' + '\n' +
'                else' + '\n' +
'                            try {' + '\n' +
'                               selected_row = source.dataItem(source.select());' + '\n' +
'                            } catch(e) {}' + '\n' +
'                     }' + '\n' +
'                     launchAddEditWindow(action, table, mode, selected_row);' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function launchAddEditWindow(action, table, mode, selected_row) {' + '\n' +
'     var table_id = table.id;' + '\n' +
'     var result = table.result;' + '\n' +
'     var window_title = "";' + '\n' +
'     if (mode == "add") {' + '\n' +
'         window_title = action.title;' + '\n' +
'     } else if (mode == "edit") {' + '\n' +
'         window_title = action.title;' + '\n' +
'     }' + '\n' +
'     var window_id = "window_" + table_id + "_" + mode;' + '\n' +
'     var target = $("#div_" + window_id);' + '\n' +
'     if (target.length > 0) {' + '\n' +
'         target.remove();' + '\n' +
'         target = $();' + '\n' +
'     }' + '\n' +
'     var window_div = document.createElement("div");' + '\n' +
'     window_div.id = "div_" + window_id;' + '\n' +
' ' + '\n' +
'     var tab_div, ul, lis = [];' + '\n' +
'     var maxHeight = 0,' + '\n' +
'         maxWidth = 0,' + '\n' +
'         formHeight = 0,' + '\n' +
'         formWidth = 0;' + '\n' +
'     var windowHeight = 0,' + '\n' +
'         windowWidth = 0;' + '\n' +
'     var finalForm = [];' + '\n' +
'     if (action.forms.length > 0) {' + '\n' +
'         for (var i = 0; i < action.forms.length; i++) {' + '\n' +
'             var form = action.forms[i];' + '\n' +
'             var whichRow = -1,' + '\n' +
'                 whichCol = -1,' + '\n' +
'                 formHeight = 0,' + '\n' +
'                 formWidth = 0;' + '\n' +
' ' + '\n' +
'             var rowCount = form.elements.length;' + '\n' +
'             if (rowCount > 0) {' + '\n' +
'                 for (var row = 0; row < rowCount; row++) {' + '\n' +
'                     var colCount = form.elements[row].length;' + '\n' +
'                     if (colCount > 0) {' + '\n' +
'                         for (var col = 0; col < colCount; col++) {' + '\n' +
'                             var colWidth = 0;' + '\n' +
'                             var elCount = form.elements[row][col].length;' + '\n' +
'                             for (var elIndex = 0; elIndex < elCount; elIndex++) {' + '\n' +
'                                 var element = form.elements[row][col][elIndex];' + '\n' +
'                                 if(element.type !== "hidden") {' + '\n' +
'                                 if (whichRow < row) {' + '\n' +
'                                     whichRow = row;' + '\n' +
'                                     if (element.type == "multiselect") {' + '\n' +
'                                         formHeight += MULTISELECT_HEIGHT;' + '\n' +
'                                     } else {' + '\n' +
'                                         formHeight += ELEMENT_HEIGHT;' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                                 if (whichCol < col) {' + '\n' +
'                                     whichCol = col;' + '\n' +
'                                     if (isSet(element.title)) {' + '\n' +
'                                         if (element.type == "multiselect") {' + '\n' +
'                                             if(isSet(element.width)) {' + '\n' +
'                                                formWidth += element.width + EDIV_WIDTH;' + '\n' +
'                                                colWidth += element.width;' + '\n' +
'                                             }' + '\n' +
'                                             else {' + '\n' +
'                                                formWidth += MULTISELECT_WIDTH + EDIV_WIDTH;' + '\n' +
'                                                colWidth += MULTISELECT_WIDTH;' + '\n' +
'                                             }' + '\n' +
'                                         } else if (element.type == "button") {' + '\n' +
'                                             if(isSet(element.width)) {' + '\n' +
'                                                formWidth += element.width + EDIV_WIDTH;' + '\n' +
'                                                colWidth += element.width;' + '\n' +
'                                             }' + '\n' +
'                                             else {' + '\n' +
'                                                formWidth += ELEMENT_WIDTH / 2 + EDIV_WIDTH;' + '\n' +
'                                                colWidth += ELEMENT_WIDTH / 2;' + '\n' +
'                                             }' + '\n' +
'                                         } else {' + '\n' +
'                                             if(isSet(element.width)) {' + '\n' +
'                                                formWidth += element.width + EDIV_WIDTH;' + '\n' +
'                                                colWidth += element.width;' + '\n' +
'                                             }' + '\n' +
'                                             else {' + '\n' +
'                                                formWidth += ELEMENT_WIDTH + EDIV_WIDTH;' + '\n' +
'                                                colWidth += ELEMENT_WIDTH;' + '\n' +
'                                             }' + '\n' +
'                                         }' + '\n' +
'                                     } else {' + '\n' +
'                                         if (element.type == "multiselect") {' + '\n' +
'                                             if(isSet(element.width)) {' + '\n' +
'                                                formWidth += element.width + EDIV_WIDTH;' + '\n' +
'                                                colWidth += element.width;' + '\n' +
'                                             }' + '\n' +
'                                             else {' + '\n' +
'                                                formWidth += MULTISELECT_WIDTH + EDIV_WIDTH;' + '\n' +
'                                                colWidth += MULTISELECT_WIDTH;' + '\n' +
'                                             }' + '\n' +
'                                         }' + '\n' +
'                                         else {' + '\n' +
'                                             if(isSet(element.width)) {' + '\n' +
'                                                 formWidth += element.width + EDIV_WIDTH;' + '\n' +
'                                                 colWidth += element.width;' + '\n' +
'                                             }' + '\n' +
'                                             else {' + '\n' +
'                                                 formWidth += ELEMENT_WIDTH + EDIV_WIDTH;' + '\n' +
'                                                 colWidth += ELEMENT_WIDTH;' + '\n' +
'                                             }' + '\n' +
'                                         }' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                                 if (element.type == "multiselect") {' + '\n' +
'                                     if(!isSet(element.width))' + '\n' +
'                                     element.width = MULTISELECT_WIDTH;' + '\n' +
'                                     element.height = MULTISELECT_HEIGHT;' + '\n' +
'                                 } else if (element.type == "button") {' + '\n' +
'                                    if(!isSet(element.width))' + '\n' +
'                                     element.width = ELEMENT_WIDTH / 2;' + '\n' +
'                                     element.height = ELEMENT_HEIGHT;' + '\n' +
'                                 } else {' + '\n' +
'                                     if (isSet(element.title)) {' + '\n' +
'                                        if(!isSet(element.width))' + '\n' +
'                                            element.width = ELEMENT_WIDTH;' + '\n' +
'                                     }' + '\n' +
'                                     else {' + '\n' +
'                                        if(!isSet(element.width))' + '\n' +
'                                            element.width = ELEMENT_WIDTH;' + '\n' +
'                                        element.height = ELEMENT_HEIGHT;' + '\n' +
'                                     }' + '\n' +
'                                 }' + '\n' +
'                                 }' + '\n' +
'                             }' + '\n' +
'                             form.elements[row][col].width = colWidth;' + '\n' +
'//                                 (row == 0 && col == 0) ?' + '\n' +
'//                                 formWidth : formWidth / (col + 1);' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                     form.elements[row].width = formWidth;' + '\n' +
'                     form.elements[row].height = formHeight / (row + 1);' + '\n' +
'                     if (formHeight > maxHeight)' + '\n' +
'                         maxHeight = formHeight;' + '\n' +
'                     if (formWidth > maxWidth)' + '\n' +
'                         maxWidth = formWidth;' + '\n' +
'                     formWidth = 0;' + '\n' +
'                     whichCol = -1;' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         if (action.forms.length > 1) ' + '\n' +
'         windowWidth = maxWidth + 30;' + '\n' +
'         else' + '\n' +
'         windowWidth = maxWidth;' + '\n' +
' ' + '\n' +
'         if (action.forms.length > 1) {' + '\n' +
'             tab_div = document.createElement("div");' + '\n' +
'             tab_div.id = "div_tab_" + table_id + "_" + mode;' + '\n' +
'             ul = document.createElement("ul");' + '\n' +
'             for (var i = 0; i < action.forms.length; i++) {' + '\n' +
'                 lis[i] = document.createElement("li");' + '\n' +
'                 lis[i].innerHTML = action.forms[i].title;' + '\n' +
'                 if (i == 0) lis[i].className = "k-state-active";' + '\n' +
'                 ul.appendChild(lis[i]);' + '\n' +
'             }' + '\n' +
'             tab_div.appendChild(ul);' + '\n' +
'             //Form Height + OK-Cancel div + Tab height + header' + '\n' +
'             windowHeight = maxHeight + 20 + 40 + 32;' + '\n' +
'             window_div.appendChild(tab_div);' + '\n' +
'         } else {' + '\n' +
'             //Form Height + OK-Cancel div + header' + '\n' +
'             windowHeight = maxHeight + 20 + 32;' + '\n' +
'         }' + '\n' +
' ' + '\n' +
'         for (var i = 0; i < action.forms.length; i++) {' + '\n' +
'             var form = action.forms[i];' + '\n' +
' ' + '\n' +
'             var form_div = document.createElement("div");' + '\n' +
'             form_div.id = "form_" + i + "_div";' + '\n' +
'             form_div.style.height = maxHeight + PX;' + '\n' +
'             form_div.style.width = maxWidth + PX;' + '\n' +
'             if (action.forms.length > 1) {' + '\n' +
'                 tab_div.appendChild(form_div);' + '\n' +
'             } else {' + '\n' +
'                 form_div.style.marginLeft = "5px";' + '\n' +
'                 form_div.style.paddingTop = "20px";' + '\n' +
'                 form_div.style.paddingBottom = "20px";' + '\n' +
'                 window_div.appendChild(form_div);' + '\n' +
'             }' + '\n' +
'             var rowCount = form.elements.length;' + '\n' +
'             for (var row = 0; row < rowCount; row++) {' + '\n' +
'                 var rowDiv = document.createElement("div");' + '\n' +
'                 form_div.appendChild(rowDiv);' + '\n' +
'                 rowDiv.id = form_div.id + "_row_" + row;' + '\n' +
'                 rowDiv.style.height = form.elements[row].height + PX;' + '\n' +
'                 rowDiv.style.width = form.elements[row].width + PX;' + '\n' +
' ' + '\n' +
'                 var colCount = form.elements[row].length;' + '\n' +
'                 for (var col = 0; col < colCount; col++) {' + '\n' +
'                     var colDiv = document.createElement("div");' + '\n' +
'                     rowDiv.appendChild(colDiv);' + '\n' +
'                     colDiv.id = rowDiv.id + "_col_" + col;' + '\n' +
'                     colDiv.style.display = INLINE_BLOCK;' + '\n' +
'                     colDiv.style.height = form.elements[row][col].height + PX;' + '\n' +
'                     var showEls = 0;' + '\n' +
'                     var elCount1 = form.elements[row][col].length;' + '\n' +
'                     for (var elIndex = 0; elIndex < elCount1; elIndex++) {' + '\n' +
'                         if(form.elements[row][col][elIndex].type === "hidden") {}' + '\n' +
'                         else' + '\n' + 
'                             showEls++;' + '\n' +
'                     }' + '\n' +
'                     colDiv.style.width = form.elements[row][col].width + showEls*EDIV_WIDTH + PX;' + '\n' +
'                     var elCount = form.elements[row][col].length;' + '\n' +
'                     for (var elIndex = 0; elIndex < elCount; elIndex++) {' + '\n' +
'                         var element = form.elements[row][col][elIndex];' + '\n' +
'                         var element_div = document.createElement("div");' + '\n' +
'                         if(element.type !== "hidden")' + '\n' +
'                             element_div.style.width = colDiv.style.width;' + '\n' +
'                         else ' + '\n' +
'                             element_div.style.width = 0 + PX;' + '\n' +           
'                         element_div.style.padding = 3 + PX;' + '\n' +
'                         colDiv.appendChild(element_div);' + '\n' +
'                         if(col !== colCount-1) { ' + '\n' +
'                             addElement(element, element_div, form_div, row, col, elIndex, mode, selected_row, false);' + '\n' +
'                         } else {' + '\n' +
'                             addElement(element, element_div, form_div, row, col, elIndex, mode, selected_row, true);' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         var window_actions_div = document.createElement("div");' + '\n' +
'         window_actions_div.style.width = windowWidth + PX;' + '\n' +
'         window_actions_div.style.height = 40 + PX;' + '\n' +
'         window_actions_div.style.position = RELATIVE;' + '\n' +
'         window_actions_div.style.top = 5 + PX;' + '\n' +
'         window_actions_div.style.marginLeft = "-3" + PX;' + '\n' +
'         window_actions_div.style.marginTop = 4 + PX;' + '\n' +
' ' + '\n' +
'         var input_submiturl = document.createElement("input");' + '\n' +
'         input_submiturl.type = "hidden";' + '\n' +
'         input_submiturl.value = action.submiturl;' + '\n' +
'         window_actions_div.appendChild(input_submiturl);' + '\n' +
' ' + '\n' +
'         var handler;' + '\n' +
'         if (isSet(action.okaction)) {' + '\n' +
'            if (typeof window[action.okaction] === "function") {' + '\n' +
'                 handler = window[action.okaction];' + '\n' +
'             } else {' + '\n' +
'                 handler = defaultOKHandler;' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         else ' + '\n' +
'            handler = defaultOKHandler;' + '\n' +
'         var btn_ok = createButton("btn_" + table_id + "_" + mode + "_ok",' + '\n' +
'             "OK", handler, (windowWidth - 190)/2 + PX, null, "4px 6px", ABSOLUTE);' + '\n' +
'         window_actions_div.appendChild(btn_ok);' + '\n' +
' ' + '\n' +
'         var btn_cancel = createButton("btn_" + table_id + "_" + mode + "_cancel",' + '\n' +
'             "Cancel", defaultCancelHandler, ((windowWidth-190)/2 + 100) + PX,' + '\n' +
'             null, "4px 6px", ABSOLUTE)' + '\n' +
'         window_actions_div.appendChild(btn_cancel);' + '\n' +
'         window_div.appendChild(window_actions_div);' + '\n' +
'     }' + '\n' +
' ' + '\n' +
'     var kendo_window = $("#" + window_id);' + '\n' +
'         if (action.forms.length > 1) ' + '\n' +
'         windowWidth += 16;' + '\n' +
'         else ' + '\n' +
'         windowWidth += 10;' + '\n' +

'     if (!kendo_window.data("kendoWindow")) {' + '\n' +
'         document.body.appendChild(createWindow(window_id));' + '\n' +
'         kendo_window = $("#" + window_id);' + '\n' +
'         kendo_window.kendoWindow({' + '\n' +
'             modal: true,' + '\n' +
'             title: window_title,' + '\n' +
'             resizable: true,' + '\n' +
'         });' + '\n' +
'     } else {' + '\n' +
'         kendo_window.data("kendoWindow").options.modal = true;' + '\n' +
'         kendo_window.data("kendoWindow").options.title = window_title;' + '\n' +
'     }' + '\n' +
'     kendo_window.append(window_div);' + '\n' +
'     kendo_window.data("kendoWindow").center();' + '\n' +
'     kendo_window.data("kendoWindow").open();' + '\n' +
'     if (action.forms.length > 1) {' + '\n' +
'         var t_id = "div_tab_" + table_id + "_" + mode;' + '\n' +
'         applyKendoTab(t_id, windowWidth + PX,' + '\n' +
'             windowHeight + PX);' + '\n' +
'     }' + '\n' +
' ' + '\n' +
'     for (var i = 0; i < action.forms.length; i++) {' + '\n' +
'         var form = action.forms[i];' + '\n' +
'         var rowCount = form.elements.length;' + '\n' +
'         for (var row = 0; row < rowCount; row++) {' + '\n' +
'             var colCount = form.elements[row].length;' + '\n' +
'             for (var col = 0; col < colCount; col++) {' + '\n' +
'                 var elCount = form.elements[row][col].length;' + '\n' +
'                 for (var elIndex = 0; elIndex < elCount; elIndex++) {' + '\n' +
'                     var element = form.elements[row][col][elIndex];' + '\n' +
'                     applyKendoStyle(element);' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function createButton(id, value, clickHandler, left, width, margin, position, enable) {' + '\n' +
'     var btn = document.createElement("input");' + '\n' +
'     btn.type = "button";' + '\n' +
'     btn.id = id;' + '\n' +
'     btn.value = value;' + '\n' +
'     btn.name = id;' + '\n' +
'     if (isSet(width))' + '\n' +
'         btn.style.width = width;' + '\n' +
'     else' + '\n' +
'         btn.style.width = BTN_WIDTH + PX;' + '\n' +
' ' + '\n' +
'     if (isSet(left))' + '\n' +
'         btn.style.left = left;' + '\n' +
' ' + '\n' +
'     if (isSet(margin))' + '\n' +
'         btn.style.margin = margin;' + '\n' +
'     else {' + '\n' +
'         btn.style.margin = 6 + PX;' + '\n' +
'     }' + '\n' +
'     if (isSet(position))' + '\n' +
'         btn.style.position = position;' + '\n' +
'     else' + '\n' +
'         btn.style.position = RELATIVE;' + '\n' +
' ' + '\n' +
'     if (isSet(enable) && enable === false) {' + '\n' +
'         btn.className = "k-button disabled btn btn-mini btn-primary";' + '\n' +
'         btn.disabled = true;' + '\n' +
'     } else {' + '\n' +
'         btn.className = "k-button btn-primary btn btn-mini";' + '\n' +
'         btn.disabled = false;' + '\n' +
'     }' + '\n' +
'     btn.onclick = clickHandler;' + '\n' +
'     return btn;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function applyKendoCombobox(element) {' + '\n' +
'     var config = {' + '\n' + 
'          suggest:true,' + '\n' +
'          dataValueField: "value",' + '\n' +
'          dataTextField: "id"' + '\n' + 
'     };' + '\n' +
'     if (isSet(element.help))' + '\n' +
'         config.placeholder = element.help;' + '\n' +
'     if(isSet(element.databound) && (typeof window[element.databound] === "function"))' + '\n' +
'         config.dataBound = window[element.databound];' + '\n' +
'     var cdata = [];' + '\n' +
'     if (isSet(element.values) && element.values.length > 0) {' + '\n' +
'         var options = element.values.split(",");' + '\n' +
'         for (var oCount = 0; oCount < options.length; oCount++) {' + '\n' +
'             cdata[oCount] = {};' + '\n' +
'             cdata[oCount]["id"] = options[oCount];' + '\n' +
'             cdata[oCount]["value"] = oCount;' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (isSet(element.data) && element.data.length > 0) {' + '\n' +
'         for (var oCount = 0; oCount < element.data.length; oCount++) {' + '\n' +
'             cdata[cdata.length] = element.data[oCount];' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if(isSet(element.highlightfirst) && element.highlightfirst === "false") {' + '\n' +
'         cdata.unshift({"id": "", "value":DUMMY_ITEM_VALUE});' + '\n' +
'     };' + '\n' +
'     config.dataSource = {' + '\n' +
'         "data": cdata' + '\n' +
'     };' + '\n' +
'     $("#" + element.id).kendoComboBox(config);' + '\n' +
'     $("#" + element.id).data("kendoComboBox").list[0].style.minWidth="160px";' + '\n' +
'     $("#" + element.id).data("kendoComboBox").list.width("auto");' + '\n' +
'     if (isSet(element.visible) && element.visible === false || element.visible === "false") {' + '\n' +
'         $("#" + element.id).data("kendoComboBox").wrapper.hide();' + '\n' +
'     }' + '\n' +
'     if(isSet(element.highlightfirst) && element.highlightfirst === "true") {' + '\n' +
'         if(isSet(cdata) && cdata.length > 0 && isSet(cdata[0]["value"]))' + '\n' +
'         $("#" + element.id).data("kendoComboBox").value(cdata[0]["id"]);' + '\n' +
'     };' + '\n' +
'     if ((isSet(element.values) && element.values.length > 0) || (isSet(element.data) && element.data.length > 0)) {' + '\n' +
'         if (isSet(element.changeAction)) {' + '\n' +
'             $("#" + element.id).data("kendoComboBox").trigger("change");' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function applyKendoAutoComplete(element) {' + '\n' +
'     var config = {};' + '\n' +
'     if (isSet(element.help))' + '\n' +
'         config.placeholder = element.help;' + '\n' +
'     $("#" + element.id).kendoAutoComplete(config);' + '\n' +
'     if (isSet(element.visible) && element.visible === false || element.visible === "false") {' + '\n' +
'         $("#" + element.id).data("kendoAutoComplete").wrapper.hide();' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function applyKendoListView(element) {' + '\n' +
'     $("#" + element.lhsid).kendoListView();' + '\n' +
'     $("#" + element.rhsid).kendoListView();' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function applyKendoMultiCombo(element) {' + '\n' +
'     var config = {' + '\n' +
'         optionLabel: (isSet(element.help)) ? element.help : "",' + '\n' +
'         dataValueField: "value",' + '\n' +
'         dataTextField: "id"' + '\n' + 
'     };' + '\n' +
'     if(isSet(element.databound) && (typeof window[element.databound] === "function"))' + '\n' +
'         config.dataBound = window[element.databound];' + '\n' +
'     var cdata = [];' + '\n' +
'     if (isSet(element.values) && element.values.length > 0) {' + '\n' +
'         var options = element.values.split(",");' + '\n' +
'         for (var oCount = 0; oCount < options.length; oCount++) {' + '\n' +
'             cdata[oCount] = {};' + '\n' +
'             cdata[oCount]["id"] = options[oCount];' + '\n' +
'             cdata[oCount]["value"] = oCount;' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (isSet(element.data) && element.data.length > 0) {' + '\n' +
'         for (var oCount = 0; oCount < element.data.length; oCount++) {' + '\n' +
'             cdata[cdata.length] = element.data[oCount];' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if(isSet(element.highlightfirst) && element.highlightfirst === "false") {' + '\n' +
'         cdata.unshift({"id": "", "value":DUMMY_ITEM_VALUE});' + '\n' +
'     };' + '\n' +
'     config.dataSource = {' + '\n' +
'         "data": cdata' + '\n' +
'     };' + '\n' +
'     $("#" + element.id).kendoMultiSelectBox(config);' + '\n' +
'     $("#" + element.id).data("kendoMultiSelectBox").list[0].style.minWidth="160px";' + '\n' +
'     $("#" + element.id).data("kendoMultiSelectBox").list.width("auto");' + '\n' +
'     if (isSet(element.visible) && element.visible === false  || element.visible === "false") {' + '\n' +
'         $("#" + element.id).data("kendoMultiSelectBox").wrapper.hide();' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function applyKendoNumericTextBox(element) {' + '\n' +
'     var config = {};' + '\n' +
'     if (isSet(element.help))' + '\n' +
'         config.placeholder = element.help;' + '\n' +
'     if (isSet(element.range)) {' + '\n' +
'         var min = element.range.split("-")[0];' + '\n' +
'         var max = element.range.split("-")[1];' + '\n' +
'         config.min = min;' + '\n' +
'         config.max = max;' + '\n' +
'         config.steps = 1;' + '\n' +
'         config.decimals = 0;' + '\n' +
'         config.format = "#";' + '\n' +
'     }' + '\n' +
'     $("#" + element.id).kendoNumericTextBox(config);' + '\n' +
'     if (isSet(element.visible) && element.visible === false || element.visible === "false") {' + '\n' +
'         $("#" + element.id).data("kendoNumericTextBox").wrapper.hide();' + '\n' +
'     }' + '\n' + 
' }' + '\n' +
' ' + '\n' +
' function applyKendoDropdown(element) {' + '\n' +
'     var config = {' + '\n' +
'         optionLabel: (isSet(element.help)) ? element.help : "",' + '\n' +
'         dataValueField: "value",' + '\n' +
'         dataTextField: "id"' + '\n' + 
'     };' + '\n' +
'     if(isSet(element.databound) && (typeof window[element.databound] === "function"))' + '\n' +
'         config.dataBound = window[element.databound];' + '\n' +
'     var cdata = [];' + '\n' +
'     if (isSet(element.values) && element.values.length > 0) {' + '\n' +
'         var options = element.values.split(",");' + '\n' +
'         for (var oCount = 0; oCount < options.length; oCount++) {' + '\n' +
'             cdata[oCount] = {};' + '\n' +
'             cdata[oCount]["id"] = options[oCount];' + '\n' +
'             cdata[oCount]["value"] = oCount;' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (isSet(element.data) && element.data.length > 0) {' + '\n' +
'         for (var oCount = 0; oCount < element.data.length; oCount++) {' + '\n' +
'             cdata[cdata.length] = element.data[oCount];' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if(isSet(element.highlightfirst) && element.highlightfirst === "false") {' + '\n' +
'         cdata.unshift({"id": "", "value":DUMMY_ITEM_VALUE});' + '\n' +
'     };' + '\n' +
'     config.dataSource = {' + '\n' +
'         "data": cdata' + '\n' +
'     };' + '\n' +
'     $("#" + element.id).kendoDropDownList(config);' + '\n' +
'     if (isSet(element.visible) && element.visible === false  || element.visible === "false") {' + '\n' +
'         $("#" + element.id).data("kendoDropDownList").wrapper.hide();' + '\n' +
'     }' + '\n' +
'     if ((isSet(element.values) && element.values.length > 0) || (isSet(element.data) && element.data.length > 0)) {' + '\n' +
'         if (isSet(element.changeAction)) {' + '\n' +
'             $("#" + element.id).data("kendoDropDownList").trigger("change");' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function applyKendoTab(id, h, w) {' + '\n' +
'     $("#" + id).kendoTabStrip({' + '\n' +
'         height: h | $("#" + id).height(),' + '\n' +
'         select: fetchDataForAllTablesInTab,' + '\n' +
'         activate: setTitle,' + '\n' +
'         width: w | AUTO,' + '\n' +
'         animation: {' + '\n' +
'             open: {' + '\n' +
'                 effects: "fadeIn"' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     });' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function defaultCancelHandler(arg) {' + '\n' +
'     var window_partial_id = arg.currentTarget.id.split("_cancel")[0];' + '\n' +
'     var window_id = "window_" + window_partial_id.split("btn_")[1];' + '\n' +
'     closeWindow(window_id);' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function closeWindow(window_id) {' + '\n' +
'     var target = $("#div_" + window_id);' + '\n' +
'     if (target.length > 0) {' + '\n' +
'         target.remove();' + '\n' +
'         target = $();' + '\n' +
'     }' + '\n' +
'     var this_window = $("#" + window_id);' + '\n' +
'     this_window.data("kendoWindow").close();' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function defaultOKHandler(arg) {' + '\n' +
'     var table_id = getTableIDFromButtonID(arg.target.id).split("_")[0];' + '\n' +
'     var table = getTableByID(table_id);' + '\n' +
'     var action_url =' + '\n' +
'         (($(arg.currentTarget.parentNode)).find("input")[0]).getAttribute("value");' + '\n' +
' ' + '\n' +
'     var action_method = "";' + '\n' +
'     var window_partial_id = arg.currentTarget.id.split("_ok")[0];' + '\n' +
'     var window_id = "window_" + window_partial_id.split("btn_")[1];' + '\n' +
'     var tab_id = "div_tab_" + window_id.split("window_")[1];' + '\n' +
'     var mode =' + '\n' +
'         arg.currentTarget.id.split("_")[arg.currentTarget.id.split("_").length - 2];' + '\n' +
'     var edit_data = getDataFromAllRows(table, mode);' + '\n' +
'     if(edit_data === false)' + '\n' +
'         return false;' + '\n' +
'     var validator = "";' + '\n' +
'     if (isSet(table.tableactions) && table.tableactions.length > 0) {' + '\n' +
'         for (var i = 0; i < table.tableactions.length; i++) {' + '\n' +
'             var action = table.tableactions[i];' + '\n' +
'             if (isSet(action.forms) && action.forms.length > 0 &&' + '\n' +
'                 action.type == mode) {' + '\n' +
'                 validator = action.validate;' + '\n' +
'                 action_method = action.method;' + '\n' +
'                 edit_data = makeDupes(action, edit_data);' + '\n' +
'                 makeDuplicate(edit_data, table.columns);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     if (isSet(action_url)) {' + '\n' +
'         var cbParams = {};' + '\n' +
'         var parents = getParentsForTable(table.id);' + '\n' +
'         if(parents.length == 0) {' + '\n' +
'             cbParams.table_id = table.id;' + '\n' +
'             cbParams.who = "parent";' + '\n' +
'         }' + '\n' +
'         else if(parents.length == 1) {' + '\n' +
'            cbParams.table_id = parents[0];' + '\n' +
'             cbParams.who = "child";' + '\n' +
'         }' + '\n' +
'         cbParams.window_id = window_id;' + '\n' +
'         //TBD: have validation functionality here. if(validate())' + '\n' +
'          if(isSet(validator) && typeof window[validator] === "function" && window[validator](arg) === true) {' + '\n' +          
'          action_url = resolveURLFields(action_url, table);' + '\n' +
'          showLoadingMaskOfElement($("#"+window_id).data("kendoWindow"));' + '\n' +
'          if(isSet(action_url))' + '\n' +
'          doAjaxCall(action_url, action_method, JSON.stringify(edit_data),' + '\n' +
'          "createCB", "createFailCB", false, cbParams);' + '\n' +
'          }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getDataFromTable(table, all_rows, cname) {' + '\n' +
'    var table_data = [];' + '\n' +
'    var columns = table.columns;' + '\n' +
'    for(var col=0; col<columns.length; col++) {' + '\n' +
'        if(cname == columns[col].field) {' + '\n' +
'            var path = columns[col].path;' + '\n' +
'            if(!isSet(path)) {' + '\n' +
'                path = columns[col].format;' + '\n' +
'            }' + '\n' +
'            if(isSet(path)) {' + '\n' +
'                var re = /{{(.*?)}}/g;' + '\n' +
'                var paths = path.match(re);' + '\n' +
'                if (isSet(paths)) {' + '\n' +
'                    paths = (paths.toString()).replace(/[{{}}]/g, "");' + '\n' +
'                    paths = paths.split(",");' + '\n' +
'                } else' + '\n' +
'                    paths = [];' + '\n' +
'            ' + '\n' +
'                for (var i = 0; i < paths.length; i++) {' + '\n' +
'                    if (paths[i].indexOf("(") != -1 && paths[i].indexOf(")") != -1) {' + '\n' +
'                        //function name given' + '\n' +
'                        var format = paths[i];' + '\n' +
'                        var fn = format.split("(")[0];' + '\n' +
'                        format = format.split("(")[1];' + '\n' +
'                        format = format.split(")")[0];' + '\n' +
'                        format = format.replace(/[{{}}]/g, "");' + '\n' +
'                    } else if(paths[i].indexOf("{{") != -1 && ' + '\n' +
'                        paths[i].indexOf("}}") != -1) {' + '\n' +
'                    ' + '\n' +
'                    } else {' + '\n' +
'                        var partial_paths = paths[i].split(".");' + '\n' +
'                        var last_path = partial_paths[partial_paths.length-1];' + '\n' +
'                        last_path = last_path.split("[*]")[0];' + '\n' +
'                        var copyOfResult;' + '\n' +
'                        for(var j=0; j<all_rows.length; j++) { ' + '\n' +
'                            if(isSet(all_rows[j][last_path])) {' + '\n' +
'                                table_data[table_data.length] = ' + '\n' +
'                                all_rows[j][last_path];' + '\n' +
'                            }' + '\n' +
'                        }' + '\n' +
'                    }' + '\n' +
'                    ' + '\n' +
'                }' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return table_data;' + '\n' +
' }' + '\n' +
'function makeDuplicate(edit_data, columns) {' + '\n' +
'    if(!isSet(columns))' + '\n' +
'        return [];' + '\n' +
'    if(!isSet(edit_data))' + '\n' +
'        edit_data = [];' + '\n' +
'        ' + '\n' +
'    for(var col=0; col<columns.length; col++) {' + '\n' +
'            var setpath = columns[col].setpath;' + '\n' +
'            if(!isSet(setpath))' + '\n' +
'                continue;' + '\n' +
'            var table_data = jsonPath(configObj, setpath);' + '\n' +
'            var new_data = jsonPath(edit_data, setpath);' + '\n' +
'            if(new_data === false)' + '\n' +
'                new_data = [];' + '\n' +
'            for(var i=0; i<table_data.length; i++) {' + '\n' +
'                new_data[new_data.length] = table_data[i];' + '\n' +
'            }' + '\n' +
'            var newsetpath = setpath.split(".");' + '\n' +
'            newsetpath = newsetpath.splice(1);' + '\n' +
'            newsetpath = newsetpath.toString().replace(/,/g, ".");' + '\n' +
'            newsetpath = newsetpath.replace(/[\\[*\\]]/g,"");' + '\n' +
'            if(edit_data.length == 0)' + '\n' +
'                return new_data;' + '\n' +
'            else' + '\n' +
'                pinch(edit_data, newsetpath, new_data);' + '\n' +
'    }' + '\n' +
' }';
var str1 =
' function makeDupes(action, edit_data) {' + '\n' +
'     for (var j = 0; j < action.forms.length; j++) {' + '\n' +
'        var form = action.forms[j];' + '\n' +
'        if (isSet(form.elements && form.elements.length > 0)) {' + '\n' +
'            for (var k = 0; k < form.elements.length; k++) {' + '\n' +
'                var element = form.elements[k];' + '\n' +
'                if (isSet(element) && element.length > 0) {' + '\n' +
'                    for (var row = 0; row < element.length; row++) {' + '\n' +
'                        for (var col = 0; col < element[row].length; col++) {' + '\n' +
'                            var spath = element[row][col].setpath;' + '\n' +
'                            spath = spath.split("+");' + '\n' +
'                            for(var i=0; i<spath.length; i++) {' + '\n' +
'                                var setpath = spath[i];' + '\n' +
'                                if (isSet(setpath) && ' + '\n' +
'                                    setpath.indexOf("/") != -1) {' + '\n' +
'                                    var setpaths = setpath.split("/");' + '\n' +
'                                    if (isSet(setpaths[0])) {' + '\n' +
'                                        var result =' + '\n' +
'                                        jsonPath(edit_data, setpaths[0]);' + '\n' +
'                                        var resultCount = 0;' + '\n' +
'                                        if (isSet(result) && ' + '\n' +
'                                            result.length > 0) {' + '\n' +
'                                            result[0] = result[0].toString()' + '\n' +
'                                            resultCount = ' + '\n' +
'                                            result[0].split(",").length;' + '\n' +
'                                        }' + '\n' +
'                                        if (resultCount > 1) {' + '\n' +
'                                            var copies =' + '\n' +
'                                            jsonPath(edit_data, setpaths[1]);' + '\n' +
'                                            if (copies.length >= 1) {' + '\n' +
'                                                var copyOfResult = [];' + '\n' +
'                                                if(isSet(element[row][col].data) ' + '\n' +
'                                                &&' + '\n' +
'                                                element[row][col]' + '\n' +
'                                                .data.length > 1) {' + '\n' +
'                                                for (var l = 0; ' + '\n' +
'                                                l < element[row][col].' + '\n' +
'                                                data.length; l++) {' + '\n' +
'                                                if(copies.length == 1) {' + '\n' +
'                                                    copyOfResult[l] =' + '\n' +
'                                                    clone(copies[0]);' + '\n' +
'                                                }' + '\n' +
'                                                else {' + '\n' +
'                                                     copyOfResult[l] =' + '\n' +
'                                                     clone(copies[l]);' + '\n' +
'                                                }' + '\n' +
'                                            }' + '\n' +
'                                            var data;' + '\n' +
'                                            if(i==0)' + '\n' +
'                                                data = element[row][col].data;' + '\n' +
'                                            else' + '\n' +
'                                                data = result[0].split(",");' + '\n' +
'                                            for (var l=0; l<data.length; l++) {' + '\n' +
'                                                var cpy;' + '\n' +
'                                                if (element[row][col].type ' + '\n' +
'                                                    == "multiselect")' + '\n' +
'                                                    cpy = ' + '\n' +
'                                                    makeJson(setpaths[2], ' + '\n' +
'                                                    copyOfResult[l], data[l]);' + '\n' +
'                                                else if (element[row][col].type ' + '\n' +
'                                                    == "multicombo")' + '\n' +
'                                                    cpy = ' + '\n' +
'                                                    makeJson(setpaths[2], ' + '\n' +
'                                                    copyOfResult[l], data[l].id);' + '\n' +
'                                                else' + '\n' +
'                                                    cpy = ' + '\n' +
'                                                    makeJson(setpaths[2], ' + '\n' +
'                                                    copyOfResult[l], data[l]);' + '\n' +
'                                                copyOfResult[l] = cpy;' + '\n' +
'                                            }' + '\n' +
'                                            edit_data = ' + '\n' +
'                                            pinch(edit_data, setpaths[3], ' + '\n' +
'                                                copyOfResult);' + '\n' +
'                                            } else {' + '\n' +
'                                                var data = result[0].split(",");' + '\n' +
'                                                for (var l = 0; ' + '\n' +
'                                                l < data.length; l++) {' + '\n' +
'                                                    if(copies.length == 1) {' + '\n' +
'                                                    copyOfResult[l] =' + '\n' +
'                                                    clone(copies[0]);' + '\n' +
'                                                    }' + '\n' +
'                                                    else {' + '\n' +
'                                                    copyOfResult[l] = ' + '\n' +
'                                                    clone(copies[l]);' + '\n' +
'                                                    }' + '\n' +
'                                                    var cpy = makeJson(setpaths[2],' + '\n' + 
'                                                    copyOfResult[l], parseInt(data[l]));' + '\n' +
'                                                    copyOfResult[l] = cpy;' + '\n' +
'                                                }' + '\n' +
'                                                edit_data =' + '\n' + 
'                                                pinch(edit_data, setpaths[3],' + '\n' + 
'                                                copyOfResult);' + '\n' +
'                                            }' + '\n' +
'                                        }' + '\n' +
'                                    } else if(resultCount == 1 && ' + '\n' +
'                                       element[row][col].type !== "multiselect") {' + '\n' +
'                                       if(isSet(action.process) && ' + '\n' +
'                                            action.process == "table") {' + '\n' +
'                                            var source = ' + '\n' +
'                                            getKendoGridForATable(table);' + '\n' +
'                                           var all_rows = [];' + '\n' +
'                                           if(isSet(source)) {' + '\n' +
'                                              try {' + '\n' +
'                                                  all_rows = ' + '\n' +
'                                                  source.dataSource.data();' + '\n' +
'                                                   var copies =' + '\n' +
'                                                   jsonPath(edit_data, ' + '\n' +
'                                                   setpaths[1]);' + '\n' +
'                                                   if(copies.length == 1) {' + '\n' +
'                                                       copies = copies[0];' + '\n' +
'                                                   }' + '\n' +
'                                                   if(isSet(all_rows)) {' + '\n' +
'                                                       var data = getDataFromTable(table, all_rows, element[row][col].field);' + '\n' +
'                                                       var action_template = action.template;' + '\n' +
'                                                       action_template = action_template.replace(/\\n/g, "");' + '\n' +
'                                                       action_template = action_template.replace(/  /g, "");' + '\n' +
'                                                       action_template = JSON.parse(action_template);' + '\n' +
'                                                       var p = jsonPath(action_template, setpaths[0]);' + '\n' +
'                                                       p = p[0];var el=0;' + '\n' +
'                                                       if(typeof copies[setpaths[2]] === "object")' + '\n' +
'                                                       el=copies[setpaths[2]].length;' + '\n' +
'                                                      for (var l= 0; l < data.length; l++) {' + '\n' +
'                                                        if (p.indexOf("(") != -1 && p.indexOf(")") != -1) {' + '\n' +
'                                                            //function name given' + '\n' +
'                                                            var format = p;' + '\n' +
'                                                            var fn = format.split("(")[0];' + '\n' +
'                                                            format = format.split("(")[1];' + '\n' +
'                                                            format = format.split(")")[0];' + '\n' +
'                                                            format = format.replace(/[{{}}]/g, "");' + '\n' +
'                                                            if (typeof window[fn] === "function") {' + '\n' +
'                                                                var fdata = window[fn](data[l]);' + '\n' +
'                                                                if(isSet(fdata))' + '\n' +
'                                                                    if(typeof copies[setpaths[2]] === "object")' + '\n' +
'                                                                        copies[setpaths[2]][el++] = fdata;' + '\n' +
'                                                                    else' + '\n' +
'                                                                        copies[setpaths[2]] = fdata;' + '\n' +
'                                                            }' + '\n' +
'                                                         }' + '\n' +
'                                                      }' + '\n' +
'                                                   }' + '\n' +
'                                                }' + '\n' +
'                                                catch(e) {' + '\n' +
'                                                }' + '\n' +
'                                            }' + '\n' +
'                                       }' + '\n' +
'                                    }' + '\n' +
'                                }' + '\n' +
'                            }' + '\n' +
'                        }' + '\n' +
'                        }' + '\n' +
'                    }' + '\n' +
'                }' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return edit_data;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function makeJson(path, json, value) {' + '\n' +
'     if (isSet(path)) {' + '\n' +
'         var paths = [];' + '\n' +
'         if (isSet(path))' + '\n' +
'             paths = path.split(".");' + '\n' +
'         else' + '\n' +
'             return json;' + '\n' +
' ' + '\n' +
'         var pathCount = paths.length;' + '\n' +
' ' + '\n' +
'         for (var i = pathCount - 1; i >= 0; i--) {' + '\n' +
'             if (!json[paths[i]])' + '\n' +
'                 json[paths[i]] = {};' + '\n' +
'             if (i == pathCount - 1)' + '\n' +
'                 json[paths[i]] = value;' + '\n' +
'             else {' + '\n' +
'                 json[paths[i]][paths[i + 1]] = json[paths[i + 1]];' + '\n' +
'                 delete json[paths[i + 1]];' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return json;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getKendoGridForATable(table) {' + '\n' +
'     var source;' + '\n' +
'     if (table.hasActionColumn === false)' + '\n' +
'         source = $("#div_" + table.id).data("kendoGrid");' + '\n' +
'     else' + '\n' +
'         source = $("#div_" + table.id).data("kendoGrid");' + '\n' +
'     return source;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getActualURL(submit_url, table) {' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
'     if(isSet(source)) {' + '\n' +
'         var selected_row = [];' + '\n' +
'         try {' + '\n' +
'             selected_row = source.dataItem(source.select());' + '\n' +
'         } catch(e) {}' + '\n' +
'         if (isSet(submit_url)) {' + '\n' +
'             var re = /{{(.*?)}}/g;' + '\n' +
'             var fields = submit_url.match(re);' + '\n' +
'             if(isSet(fields)) {' + '\n' +
'                 fields = (fields.toString()).replace(/[{{}}]/g, "");' + '\n' +
'                 fields = fields.split(",");' + '\n' +
'                 if(isSet(selected_row)) {' + '\n' +
'                     for (var j = 0; j < fields.length; j++) {' + '\n' +
'                         if(isSet(selected_row[fields[j]]))' + '\n' +
'                             submit_url = submit_url.replace("{{" + fields[j] + "}}",' + '\n' +
'                         selected_row[fields[j]]);' + '\n' +
'                     }' + '\n' +
'                 } else {' + '\n' +
'                     return "";' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         else {' + '\n' +
'             return "";' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return submit_url;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function createFailCB(result, cbParams) { ' + '\n' +
'     var table_id = cbParams.table_id; ' + '\n' +
'     var window_id = cbParams.window_id; ' + '\n' +
'     if(isSet(window_id)) { ' + '\n' +
'         hideLoadingMaskOfElement($("#"+window_id).data("kendoWindow"));' + '\n' +
'     } ' + '\n' +
' } ' + '\n' +
' ' + '\n' +
' function createCB(result, cbParams) {' + '\n' +
'     var table_id = cbParams.table_id;' + '\n' +
'     var window_id = cbParams.window_id;' + '\n' +
'     if(isSet(window_id)) {' + '\n' +
'         hideLoadingMaskOfElement($("#"+window_id).data("kendoWindow"));' + '\n' +
'         closeWindow(window_id);' + '\n' +
'     }' + '\n' +
'     var table = getTableByID(table_id);' + '\n' +
'     var select_uuid = jsonPath(result, "$..uuid")[0];' + '\n' +
'     fetchDataForTable(table, select_uuid, cbParams.who);' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getDataFromAllRows(table, mode) {' + '\n' +
'     var action_template;' + '\n' +
'     if (isSet(table.tableactions) && table.tableactions.length > 0) {' + '\n' +
'         for (var i = 0; i < table.tableactions.length; i++) {' + '\n' +
'             var action = table.tableactions[i];' + '\n' +
'             if(action.type == mode && isSet(action.template))' + '\n' +
'                 action_template = fillupActionTemplate(action, mode);' + '\n' +
'                 if(action_template === false)' + '\n' +
'                     return false;' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return action_template;' + '\n' +
' }' + '\n' +
' ' + '\n' +
'function fillupActionTemplate(action, mode) {' + '\n' +
'    var action_template;' + '\n' +
'    if (isSet(action.forms) && action.forms.length > 0 &&' + '\n' +
'        action.type == mode) {' + '\n' +
'        action_template = action.template;' + '\n' +
'        action_template = action_template.replace(/\\n/g, "");' + '\n' +
'        action_template = action_template.replace(/  /g, "");' + '\n' +
'        action_template = JSON.parse(action_template);' + '\n' +
'        for (var j = 0; j < action.forms.length; j++) {' + '\n' +
'            var form = action.forms[j];' + '\n' +
'            if (isSet(form.elements && form.elements.length > 0)) {' + '\n' +
'                for (var k = 0; k < form.elements.length; k++) {' + '\n' +
'                    var element = form.elements[k];' + '\n' +
'                    if (isSet(element) && element.length > 0) {' + '\n' +
'                        for (var row = 0; row < element.length; row++) {' + '\n' +
'                            for (var col = 0; col < element[row].length; col++) {' + '\n' +
'                                var new_data = {};' + '\n' +
'                                var el = element[row][col];' + '\n' +
'                                var el_dom;' + '\n' +
'                                if (el.type == "multiselect")' + '\n' +
'                                    el_dom = $("#" + el.rhsid);' + '\n' +
'                                else' + '\n' +
'                                    el_dom = $("#" + el.id);' + '\n' +
'                                if (isSet(action_template)) {' + '\n' +
'                                    var value = getDataFromDom(el_dom, el.type);' + '\n' +
'                                    if (el.type == "multiselect")' + '\n' +
'                                        el.data = value;' + '\n' +
'                                    if(value == "" && el.mandatory === "true") {' + '\n' +
'                                        if(el.title == ":" || el.title == "") {' + '\n' +
'                                            showInfoWindow("All fields are mandatory",' + '\n' +
'                                            "Input required");' + '\n' +
'                                            return false;' + '\n' +
'                                        } else {' + '\n' +
'                                            showInfoWindow("Field \'" + el.title+"\' cannot be empty.",' + '\n' +
'                                            "Input required");' + '\n' +
'                                            return false;' + '\n' +
'                                        }' + '\n' +
'                                    }' + '\n' +
'                                    var res = fillupTemplate(action_template, null, el, value);' + '\n' +
'                                    if(res === false)' + '\n' +
'                                        return false;' + '\n' +
'                                }' + '\n' +
'                            }' + '\n' +
'                        }' + '\n' +
'                    }' + '\n' +
'                }' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return action_template;' + '\n' +
'}' + '\n' +
' ' + '\n' +
' function fillupTemplate(obj, parent, el, value) {' + '\n' +
'     for (var k in obj) {' + '\n' +
'         if (typeof obj[k] === "object") {' + '\n' +
'             parent = obj;' + '\n' +
'             var res=fillupTemplate(obj[k], parent, el, value);' + '\n' +
'             if(res === false)' + '\n' +
'                 return false;' + '\n' +
'         } else {' + '\n' +
'             if (typeof obj[k] === "string" && obj[k].indexOf("{{") != -1 && obj[k].indexOf("}}") != -1) {' + '\n' +
' ' + '\n' +
'                 var re = /{{(.*?)}}/g;' + '\n' +
'                 var paths = obj[k].match(re);' + '\n' +
'                 if (isSet(paths)) {' + '\n' +
'                     paths = (paths.toString()).replace(/[{{}}]/g, "");' + '\n' +
'                     paths = paths.split(",");' + '\n' +
'                 } else' + '\n' +
'                     paths = [];' + '\n' +
' ' + '\n' +
'                 if (obj[k].indexOf("(") != -1 && obj[k].indexOf(")") != -1) {' + '\n' +
'                     //function name given' + '\n' +
'                     if (el.field == paths[0]) {' + '\n' +
'                         var format = obj[k];' + '\n' +
'                         var fn = format.split("(")[0];' + '\n' +
'                         format = format.split("(")[1];' + '\n' +
'                         format = format.split(")")[0];' + '\n' +
'                         format = format.replace(/[{{}}]/g, "");' + '\n' +
'                         if (typeof window[fn] === "function") {' + '\n' +
'                             obj[k] = window[fn](value);' + '\n' +
'                             if(obj[k] === false)' + '\n' +
'                                 return false;' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 } else {' + '\n' +
'                     for (var i = 0; i < paths.length; i++) {' + '\n' +
'                         if (paths[i].indexOf("$") != -1) {' + '\n' +
'                             //jsonpath given' + '\n' +
'                             var data = jsonPath(configObj, paths[i]);' + '\n' +
'                             if (typeof data == "object") {' + '\n' +
'                                 data = data.toString();' + '\n' +
'                             }' + '\n' +
'                             obj[k] = data;' + '\n' +
'                             if(obj[k] === false)' + '\n' +
'                                 return false;' + '\n' +
'                         } else {' + '\n' +
'                             if (paths[i] == el.field) {' + '\n' +
'                                 //Field name given' + '\n' +
'                                 if (typeof value === "object" &&' + '\n' +
'                                     value.length > 0) {' + '\n' +
'                                     value = value.toString();' + '\n' +
'                                     obj[k] = value;' + '\n' +
'                                     if(obj[k] === false)' + '\n' +
'                                         return false;' + '\n' +
'                                 } else' + '\n' +
'                                     obj[k] = value;' + '\n' +
'                                     if(obj[k] === false)' + '\n' +
'                                         return false;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getDataFromDom(el_dom, type) {' + '\n' +
'     var value = "";' + '\n' +
'     if (isSet(el_dom)) {' + '\n' +
'         el_dom = el_dom[0];' + '\n' +
'         var element_type = el_dom.type;' + '\n' +
'         if (isSet(element_type)) {' + '\n' +
'             if (el_dom.nodeName.toLowerCase() == "input") {' + '\n' +
'                 switch (element_type) {' + '\n' +
'                     case "text":' + '\n' +
'                         if (el_dom.id.indexOf("_multicombo_") != -1 || type === "multicombo") {' + '\n' +
'                             value =' + '\n' +
'                                 el_dom.previousSibling.childNodes[0].' + '\n' +
'                             childNodes[0].textContent;' + '\n' +
'                             if (isSet(value))' + '\n' +
'                                 value = value.split(",");' + '\n' +
'                         } else {' + '\n' +
'                             try {' + '\n' +
'                             value = el_dom.previousSibling.childNodes[0].childNodes[0].textContent;' + '\n' +
'                             if(!isSet(value))' + '\n' +
'                                 value = el_dom.value;' + '\n' +
'                             } catch(e) {' + '\n' +
'                                 value = el_dom.value;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                         break;' + '\n' +
'                     case "checkbox":' + '\n' +
'                         value = el_dom.checked;' + '\n' +
'                         break;' + '\n' +
'                     case "hidden":' + '\n' +
'                         value = el_dom.value;' + '\n' +
'                         break;' + '\n' +
'                 }' + '\n' +
'             } else if (el_dom.nodeName.toLowerCase() == "select") {' + '\n' +
'                 var options = el_dom.childNodes;' + '\n' +
'                 for (var oCount = 0; oCount < options.length; oCount++) {' + '\n' +
'                     var option = options[oCount];' + '\n' +
'                     if (option.selected === true && isSet(option.childNodes[0])) {' + '\n' +
'                         value = option.childNodes[0].textContent;' + '\n' +
'                         break;' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         } else {' + '\n' +
'             if (el_dom.nodeName.toLowerCase() == "div") {' + '\n' +
'                 if (el_dom.id.indexOf("_multiselect_") != -1) {' + '\n' +
'                     var divs = $("#" + el_dom.id).children();' + '\n' +
'                     value = [];' + '\n' +
'                     for (var i = 0; i < divs.length; i++) {' + '\n' +
'                         value[i] = divs[i].textContent;' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return value;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function onSuccessfulDelete(result, cbParam) {' + '\n' +
'     var table_id = cbParam.table_id;' + '\n' +
'     var table = getTableByID(table_id);' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
'     if (source.select().length > 0) {' + '\n' +
'         source.select().each(function (row) {' + '\n' +
'             source.removeRow($(this));' + '\n' +
'             if(isSet(source.dataItem($(this))))' + '\n' +
'             source.dataSource.remove(source.dataItem($(this)));' + '\n' +
'         });' + '\n' +
'         var selects = source.tbody.children().find("select");' + '\n' +
'         for (var i = 0; i < selects.length; i++) {' + '\n' +
'             $("#" + selects[i].id).kendoDropDownList();' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     var row = source.tbody.find(">tr:first");' + '\n' +
'     if (row && row.length > 0) {' + '\n' +
'         source.select(row);' + '\n' +
'     } else {' + '\n' +
'         toggleButtonStateByID("btn_" + $(source.element).attr("id").split("div_")[1] + "_delete");' + '\n' +
'         toggleBtnByAction("edit", table, source)' + '\n' +
'         showGridMessage("#" + $(source.element).attr("id"),"No Data Found");' + '\n' +         
'         var targets = table.targets;' + '\n' +
'         if (targets && targets.length > 0) {' + '\n' +
'             for (var i = 0; i < targets.length; i++) {' + '\n' +
'                 var target = $("#div_" + targets[i]).data("kendoGrid");' + '\n' +
'                 if (isSet(target)) {' + '\n' +
'                     var details_table_data = [];' + '\n' +
'                     if (typeof target !== "undefined") {' + '\n' +
'                         target.dataSource.data([]);' + '\n' +
'                         toggleButtonStateByID("btn_" + $(target.element).attr("id").split("div_")[1] + "_delete");' + '\n' +
'                         toggleBtnByAction("edit", table, target)' + '\n' +
'                         showGridMessage("#" + $(target.element).attr("id"),"No Data Found");' + '\n' +
'                     }' + '\n' +
'                 } else {' + '\n' +
'                     //cleanup panel here.' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     var parents = getParentsForTable(table_id);' + '\n' +
'     if(parents.length == 1) {' + '\n' +
'         var ptable = getTableByID(parents[0]);' + '\n' +
'         var psource = getKendoGridForATable(ptable);' + '\n' +
'         if (psource.select().length > 0) {' + '\n' +
'             psource.select(psource.select());' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
'function onLandingTableDelete(e) {' + '\n' +
'     e.preventDefault();' + '\n' +
'     var kendoWindow = $("<div />").kendoWindow({' + '\n' +
'         title: "Confirm",' + '\n' +
'         resizable: false,' + '\n' +
'         modal: true' + '\n' +
'     });' + '\n' +
'     kendoWindow.data("kendoWindow")' + '\n' +
'        .content($("#delete-confirmation").html())' + '\n' +
'        .center().open();' + '\n' +
'     kendoWindow' + '\n' +
'        .find(".delete-confirm,.delete-cancel")' + '\n' +
'        .click(function() {' + '\n' +
'             if ($(this).hasClass("delete-confirm")) {' + '\n' +
'                 deleteRow(e);' + '\n' +
'             }' + '\n' +
'             kendoWindow.data("kendoWindow").close();' + '\n' +
'         })' + '\n' +
' }' + '\n' +
'function deleteRow(e) {' + '\n' +
'     var table_id = getTableIDFromButtonID(e.currentTarget.id);' + '\n' +
'     var table = getTableByID(table_id);' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
'     if (table.tableactions && table.tableactions.length > 0) {' + '\n' +
'         for (var i = 0; i < table.tableactions.length; i++) {' + '\n' +
'             if (table.tableactions[i].type == "delete") {' + '\n' +
'                 var submit_url = table.tableactions[i].submiturl;' + '\n' +
'                 var action_method = table.tableactions[i].method;' + '\n' +
'                 var validator = table.tableactions[i].validate;' + '\n' +
'                 submit_url = resolveURLFields(submit_url, table);' + '\n' +
'                 if (isSet(submit_url)) {' + '\n' +
'                     var cbParams = {};' + '\n' +
'                     var edit_data = null;' + '\n' +
'                     var commit_data = {};' + '\n' +
'                     if(action_method.toLowerCase() != "delete") {' + '\n' +
'                         var selected_rows = source.select();' + '\n' +
'                         var table_data = source.dataSource.data();' + '\n' +
'                         var primary_columns = []' + '\n' +
'                         for(var l=0; l<table.columns.length;l++) {' + '\n' +
'                             var column = table.columns[l];' + '\n' +
'                             if(column.primary === "true" ||' + '\n' +
'                                 column.primary === true) {' + '\n' +
'                                 primary_columns[primary_columns.length] = column.field;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                         if(isSet(table_data[0][0]))' + '\n' +
'                             table_data = table_data[0];' + '\n' +
'                         for(var j=0; j<table_data.length; j++) {' + '\n' +
'                            for(var k=0; k< selected_rows.length; k++) {' + '\n' +
'                                var selected_row = source.dataItem(selected_rows[0]);' + '\n' +
'                                if(!isSet(selected_row))' + '\n' +
'                                    continue;' + '\n' +
'                                var same_row = true;' + '\n' +
'                                for(var col=0; col<primary_columns.length; col++) {' + '\n' +
'                                    if(selected_row[primary_columns[col]] != ' + '\n' +
'                                        table_data[j][primary_columns[col]]) {' + '\n' +
'                                        same_row = false;' + '\n' +
'                                        break;' + '\n' +
'                                    }' + '\n' +
'                                }' + '\n' +
'                                if(same_row === true) {' + '\n' +
'                                    table_data.splice(j,1);' + '\n' +
'                                    var config_data = jsonPath(configObj, table.tableactions[i].path)[0];' + '\n' +
'                                    if(isSet(config_data[j]) && (typeof config_data[j] === "object" || typeof config_data[j] === "string"))' + '\n' +
'                                        config_data.splice(j,1);' + '\n' +
'                                    else' + '\n' +
'                                        config_data = null;' + '\n' +
'                                    var newsetpath = table.tableactions[i].path.split(".");' + '\n' +
'                                    newsetpath = newsetpath.splice(1);' + '\n' +
'                                    newsetpath = newsetpath.toString().replace(/,/g, ".");' + '\n' +
'                                    newsetpath = newsetpath.replace(/[\\[*\\]]/g,"");' + '\n' +
'                                    newsetpath = "$." + newsetpath.split(".")[0];' + '\n' +
'                                    edit_data = jsonPath(configObj, newsetpath);' + '\n' +
'                                    edit_data = edit_data[0];' + '\n' +
'                                    newsetpath = newsetpath.split(".")[1];' + '\n' +
'                                    commit_data[newsetpath] = edit_data;' + '\n' +
'                                    var parents = getParentsForTable(table.id);' + '\n' +
'                                    if(parents.length == 0) {' + '\n' +
'                                        cbParams.table_id = table.id;' + '\n' +
'                                        cbParams.who = "parent";' + '\n' +
'                                    }' + '\n' +
'                                    else if(parents.length == 1) {' + '\n' +
'                                        cbParams.table_id = parents[0];' + '\n' +
'                                        cbParams.who = "child";' + '\n' +
'                                    }' + '\n' +
'                                    if(isSet(validator) && typeof window[validator] === "function" && window[validator](e) === true) {' + '\n' +
'                                    doAjaxCall(submit_url, action_method, JSON.stringify(commit_data),' + '\n' +
'                                    "createCB", "createFailCB", false, cbParams);' + '\n' +
'                                    }' + '\n' +
'                                }' + '\n' +
'                            }' + '\n' +
'                         }' + '\n' +
'                     } else {' + '\n' +
'                         cbParams.table_id = table.id;' + '\n' +
'                         if(isSet(validator) && typeof window[validator] === "function" && window[validator](e) === true) {' + '\n' +
'                         doAjaxCall(submit_url, action_method, null,' + '\n' +
'                             "onSuccessfulDelete", "", false, cbParams);' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function getDetailsTableData(cols) {' + '\n' +
'     var details_table_data = [];' + '\n' +
'     var index = 0;' + '\n' +
'     if (cols.length > 0) {' + '\n' +
'         details_table_data[index] = {};' + '\n' +
'         for (var i = 0; i < cols.length; i++) {' + '\n' +
'             if (!isSet(details_table_data[index]))' + '\n' +
'                 details_table_data[index] = {};' + '\n' +
'             var col = cols[i];' + '\n' +
'             details_table_data[index][col.field] = "";' + '\n' +
' ' + '\n' +
'             if (col.rowvalues && col.rowvalues.length > 0) {' + '\n' +
'                 for (var j = 0; j < col.rowvalues.length; j++) {' + '\n' +
'                     if (!isSet(details_table_data[j]))' + '\n' +
'                         details_table_data[j] = {};' + '\n' +
'                     details_table_data[j][col.field] = col.rowvalues[j];' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             if (col.rowfields && col.rowfields.length > 0) {' + '\n' +
'                 for (var j = 0; j < col.rowfields.length; j++) {' + '\n' +
'                     if (!isSet(details_table_data[j]))' + '\n' +
'                         details_table_data[j] = {};' + '\n' +
'                     details_table_data[j][col.field] = "";' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' ' + '\n' +
'     return details_table_data;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function onRowSelect(e) {' + '\n' +
'     disableGridButton(e);' + '\n' +
'     var grid_id = e.sender._cellId.split("_")[1];' + '\n' +
'     var table = getTableByID(grid_id);' + '\n' +
'     if(isSet(table.title))' + '\n' +
'         $("#span_"+table.id+"_title").text(resolveURLFields(table.title, table));' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
'     try {' + '\n' +
'       if(source.select().length ==0) return false;' + '\n' +
'     } catch(e) {return false;}' + '\n' +
'     showLoadingMaskForTargetsOfTable(table);' + '\n' +
'     if (isSet(table.geturl) && table.geturl.indexOf("/") != -1) {' + '\n' +
'         var resolvedURL = resolveURLFields(table.geturl, table);' + '\n' +
'         var cbParams = {};' + '\n' +
'         cbParams.table_id = table.id;' + '\n' +
'         if(isSet(resolvedURL))' + '\n' +
'         doAjaxCall(resolvedURL, "GET", null, "onRowSelectCB", "", false,' + '\n' +
'             cbParams);' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function onRowSelectCB(result, cbParams) {' + '\n' +
'     populateTargetTableData(result, cbParams.table_id);' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function wrapupWithKendo(config) {' + '\n' +
'     initWrapup(config);' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function showLoadingMaskForTargetsOfTable(table) {' + '\n' +
'     if (table.targets && table.targets.length > 0) {' + '\n' +
'         for (var j = 0; j < table.targets.length; j++) {' + '\n' +
'             var target_table = getTableByID(table.targets[j]);' + '\n' +
'             var ttGrid = getKendoGridForATable(target_table);' + '\n' +
'             showLoadingMaskOfElement(ttGrid);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function showLoadingMaskOfElement(el) {' + '\n' +
'     if(isSet(el)) {' + '\n' +
'     $("#"+el.element[0].id).busyIndicator(true);' + '\n' +
'         toggleTableButtonsState(el.element[0].id.split("div_")[1], false);' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function hideLoadingMaskOfElement(el) {' + '\n' +
'     if(isSet(el)) {' + '\n' +
'     $("#"+el.element[0].id).busyIndicator(false);' + '\n' +
'         toggleTableButtonsState(el.element[0].id.split("div_")[1], true);' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' function hideLoadingMaskForTargetsOfTable(table) {' + '\n' +
'     if (table.targets && table.targets.length > 0) {' + '\n' +
'         for (var j = 0; j < table.targets.length; j++) {' + '\n' +
'             var target_table = getTableByID(table.targets[j]);' + '\n' +
'             var ttGrid = getKendoGridForATable(target_table);' + '\n' +
'             hideLoadingMaskOfElement(ttGrid);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function fetchDataForTable(table, uuid, who) {' + '\n' +
'     if(!isSet(table))' + '\n' +
'         return;' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
'     showLoadingMaskOfElement(source);' + '\n' +
'     var url = "";' + '\n' +
'     showLoadingMaskForTargetsOfTable(table);' + '\n' +
'     if (isSet(table.url) && table.url.indexOf("{{") == -1 &&' + '\n' +
'         table.url.indexOf("}}") == -1) {' + '\n' +
'         var cbParams = {};' + '\n' +
'         cbParams.table_id = table.id;' + '\n' +
'         cbParams.uuid = uuid;' + '\n' +
'         doAjaxCall(table.url, "GET", null, "populateData", "populateFailureData", false,' + '\n' +
'             cbParams);' + '\n' +
'     } else {' + '\n' +
'         var re = /{{(.*?)}}/g;' + '\n' +
'         var paths = table.url.match(re);' + '\n' +
'         if (isSet(paths)) {' + '\n' +
'             paths = (paths.toString()).replace(/[{{}}]/g, "");' + '\n' +
'             paths = paths.split(",");' + '\n' +
'         } else' + '\n' +
'             paths = [];' + '\n' +
' ' + '\n' +
'         var pathArray = [];' + '\n' +
'         for (var i = 0; i < paths.length; i++) {' + '\n' +
'             var col_data = false;' + '\n' +
'             if (paths[i].indexOf("(") != -1 &&' + '\n' +
'                 paths[i].indexOf(")") != -1) {' + '\n' +
'                 //function name given' + '\n' +
'                 var format = paths[i];' + '\n' +
'                 var fn = format.split("(")[0];' + '\n' +
'                 format = format.split("(")[1];' + '\n' +
'                 format = format.split(")")[0];' + '\n' +
'                 format = format.replace(/[{{}}]/g, "");' + '\n' +
'                 if (typeof window[fn] === "function") {' + '\n' +
'                     col_data = window[fn]();' + '\n' +
'                 }' + '\n' +
'                 url =' + '\n' +
'                     table.url.replace("{{" + paths[i] + "}}", col_data);' + '\n' +
'             } else {' + '\n' +
'                 col_data = jsonPath(configObj, paths[i]);' + '\n' +
'                 for (var j = 0; j < col_data.length; j++) {' + '\n' +
'                     url =' + '\n' +
'                         table.url.replace("{{" + paths[i] + "}}", col_data[j]);' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             var cbParams = {};' + '\n' +
'             cbParams.table_id = table.id;' + '\n' +
'             cbParams.uuid = uuid;' + '\n' +
'            cbParams.who = who;' + '\n' +
'             doAjaxCall(url, "GET", null, "populateData", "populateFailureData", false,' + '\n' +
'                 cbParams);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     setTitle();' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function fetchDataFromURLs(urls) {' + '\n' +
'     if (isSet(urls) && urls.length > 0) {' + '\n' +
'         for (var i = 0; i < urls.length; i++) {' + '\n' +
'             if (urls[i] == "/api/tenants/config/projects")' + '\n' +
'                 doAjaxCall(urls[i], "GET", null, "setProjectDetails", "", false);' + '\n' +
'             else if (urls[i] == "/api/tenants/config/domains")' + '\n' +
'                 doAjaxCall(urls[i], "GET", null, "setDomainDetails", "", false);' + '\n' +
'             else' + '\n' +
'                 doAjaxCall(urls[i]);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function setDomainDetails(result) {' + '\n' +
'     var domains = [];' + '\n' +
'     if (isSet(result) && result.domains && result.domains.length > 0) {' + '\n' +
'         for (var i = 0; i < result.domains.length; i++) {' + '\n' +
'             domains[i] = result.domains[i].fq_name[0];' + '\n' +
'         }' + '\n' +
'         $("#domainswitcher").kendoDropDownList({' + '\n' +
'             dataSource: domains,' + '\n' +
'         });' + '\n' +
'         handleDomain();' + '\n' +
'     }' + '\n' +
'     else {' + '\n' +
'         $("#domainswitcher").kendoDropDownList();' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' function setProjectDetails(result) {' + '\n' +
'     var projects = [];' + '\n' +
'     if (isSet(result) && result.projects && result.projects.length > 0) {' + '\n' +
'         for (var i = 0; i < result.projects.length; i++) {' + '\n' +
'             projects[i] = result.projects[i].fq_name[1];' + '\n' +
'             if (result.projects[i].fq_name[1] == "admin") {' + '\n' +
'                 project_admin.domain = result.projects[i].fq_name[0];' + '\n' +
'                 project_admin.name = result.projects[i].fq_name[1];' + '\n' +
'                 project_admin.uuid = result.projects[i].uuid;' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         $("#projectswitcher").kendoDropDownList({' + '\n' +
'             dataSource: projects,' + '\n' +
'             change: handleProject' + '\n' +
'         });' + '\n' +
'        var sel_project = getSelectedProjectName();' + '\n' +
'        setProjectToConfigObj(sel_project);' + '\n' +
'        $("#projectswitcher").data("kendoDropDownList").value(sel_project);' + '\n' +
'        $("#projectswitcher").data("kendoDropDownList").trigger("change");' + '\n' +
'     }' + '\n' +
'     else {' + '\n' +
'         $("#projectswitcher").kendoDropDownList();' + '\n' +
'     }' + '\n' +
' }' + '\n' +
'function setProjectToConfigObj(pName) {' + '\n' +
'    var project, projectObj = {};' + '\n' +
'    var result = jsonPath(configObj, "$.projects[*]");' + '\n' +
'    if (isSet(result) && result.length > 0) {' + '\n' +
'        for (var i = 0; i < result.length; i++) {' + '\n' +
'            if(typeof pName == "string") {' + '\n' +
'               if (result[i].fq_name[1] == pName) {' + '\n' +
'                   project = result[i];' + '\n' +
'                   projectObj.project = project;' + '\n' +
'                   break;' + '\n' +
'               }' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    configObj = $.extend({}, configObj, projectObj);' + '\n' +
'}' + '\n' +
' function getSelectedProjectName() {' + '\n' +
'    var cookiedProject = getCookie("project");' + '\n' +
'    if(cookiedProject === false)' + '\n' +
'        return $("#projectswitcher").data("kendoDropDownList").text();' + '\n' +
'    else {' + '\n' +
'         for(var i=0; i<$("#projectswitcher").data("kendoDropDownList").dataSource.data().length; i++) {' + '\n' +
'            var pname = $("#projectswitcher").data("kendoDropDownList").dataSource.data()[i];' + '\n' +
'            if(pname === cookiedProject)' + '\n' +
'                return cookiedProject;' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return $("#projectswitcher").data("kendoDropDownList").text();' + '\n' +
' }' + '\n' +
' function getSelectedDomain() {' + '\n' +
'     return $("#domainswitcher").data("kendoDropDownList").text();' + '\n' +
' }' + '\n' +

' function getProjectAdminUUID() {' + '\n' +
'     return project_admin.uuid;' + '\n' +
' }' + '\n' +
' ' + '\n' +
'function getProjectUUID(pNames) {' + '\n' +
'    var result = jsonPath(configObj, "$.projects[*]");' + '\n' +
'    var uuids = [];' + '\n' +
'    if (isSet(result) && result.length > 0) {' + '\n' +
'        for (var i = 0; i < result.length; i++) {' + '\n' +
'            if(typeof pNames == "object") {' + '\n' +
'                for (var j = 0; j < pNames.length; j++) {' + '\n' +
'                    if (result[i].fq_name[1] == pNames[j]) {' + '\n' +
'                        uuids[j] = result[i].uuid;' + '\n' +
'                    }' + '\n' +
'                }' + '\n' +
'            }' + '\n' +
'            else if(typeof pNames == "string") {' + '\n' +
'               if (result[i].fq_name[1] == pNames) {' + '\n' +
'                   uuids[0] = result[i].uuid;' + '\n' +
'               }' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return uuids.toString();' + '\n' +
'}' + '\n' +

'function getDomainUUID(dNames) {' + '\n' +
'    var result = jsonPath(configObj, "$.domains[*]");' + '\n' +
'    var uuids = [];' + '\n' +
'    if (isSet(result) && result.length > 0) {' + '\n' +
'        for (var i = 0; i < result.length; i++) {' + '\n' +
'            if(typeof dNames == "object") {' + '\n' +
'                for (var j = 0; j < dNames.length; j++) {' + '\n' +
'                    if (result[i].fq_name[0] == dNames[j]) {' + '\n' +
'                        uuids[j] = result[i].uuid;' + '\n' +
'                    }' + '\n' +
'                }' + '\n' +
'            }' + '\n' +
'            else if(typeof dNames == "string") {' + '\n' +
'               if (result[i].fq_name[0] == dNames) {' + '\n' +
'                   uuids[0] = result[i].uuid;' + '\n' +
'               }' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return uuids.toString();' + '\n' +
'}' + '\n' +

' ' + '\n' +
'function getPolicyUUID(pNames) {' + '\n' +
'    var result = jsonPath(configObj, "$.network-policys[*]");' + '\n' +
'    var uuids = [];' + '\n' +
'    if (isSet(result) && result.length > 0) {' + '\n' +
'        if(typeof pNames == "object") {' + '\n' +
'            for(var i=0; i<pNames.length; i++) {' + '\n' +
'                var data =' + '\n' +
'                jsonPath(configObj, "$..network-policys[?(@.fq_name[2]==\'"+pNames[i]+"\')]");' + '\n' +
'                if(data && data.length == 1) {' + '\n' +
'                    data = data[0].uuid;' + '\n' +
'                }' + '\n' +
'                uuids[uuids.length] = data;' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'        else if(typeof pNames == "string") {' + '\n' +
'            var data =' + '\n' +
'            jsonPath(configObj, "$..network-policys[?(@.fq_name[2]==\'"+pNames+"\')]");' + '\n' +
'            if(data && data.length == 1) {' + '\n' +
'                data = data[0].uuid;' + '\n' +
'            }' + '\n' +
'            uuids[uuids.length] = data;' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return uuids.toString();' + '\n' +
'}' + '\n' +
'function getIpamUUID(pNames) {' + '\n' +
'    var result = jsonPath(configObj, "$.network-ipams[*]");' + '\n' +
'    var uuids = [];' + '\n' +
'    if (isSet(result) && result.length > 0) {' + '\n' +
'        if(typeof pNames == "object") {' + '\n' +
'            for(var i=0; i<pNames.length; i++) {' + '\n' +
'                var data =' + '\n' +
'                jsonPath(configObj, "$..network-ipams[?(@.fq_name[2]==\'"+pNames[i]+"\')]");' + '\n' +
'                if(data && data.length == 1) {' + '\n' +
'                    data = data[0].uuid;' + '\n' +
'                }' + '\n' +
'                uuids[uuids.length] = data;' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'        else if(typeof pNames == "string") {' + '\n' +
'            var data =' + '\n' +
'            jsonPath(configObj, "$..network-ipams[?(@.fq_name[2]==\'"+pNames+"\')]");' + '\n' +
'            if(data && data.length == 1) {' + '\n' +
'                data = data[0].uuid;' + '\n' +
'            }' + '\n' +
'            uuids[uuids.length] = data;' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return uuids.toString();' + '\n' +
'}' + '\n' +
'' + '\n' +
'function getIpamHref(pNames) {' + '\n' +
'    var result = jsonPath(configObj, "$.network-ipams[*]");' + '\n' +
'    var hrefs = [];' + '\n' +
'    if (isSet(result) && result.length > 0) {' + '\n' +
'        if(typeof pNames == "object") {' + '\n' +
'            for(var i=0; i<pNames.length; i++) {' + '\n' +
'                var data =' + '\n' +
'                jsonPath(configObj, "$..network-ipams[?(@.fq_name[2]==\'"+pNames[i]+"\')]");' + '\n' +
'                if(data && data.length == 1) {' + '\n' +
'                    data = data[0].href;' + '\n' +
'                }' + '\n' +
'                hrefs[hrefs.length] = data;' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'        else if(typeof pNames == "string") {' + '\n' +
'            var data =' + '\n' +
'            jsonPath(configObj, "$..network-ipams[?(@.fq_name[2]==\'"+pNames+"\')]");' + '\n' +
'            if(data && data.length == 1) {' + '\n' +
'                data = data[0].href;' + '\n' +
'            }' + '\n' +
'            hrefs[hrefs.length] = data;' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return hrefs.toString();' + '\n' +
'}' + '\n' +

'function getNetworkUUID(pNames) {' + '\n' +
'    var result = jsonPath(configObj, "$.virtual-networks[*]");' + '\n' +
'    var uuids = [];' + '\n' +
'    if (isSet(result) && result.length > 0) {' + '\n' +
'        if(typeof pNames == "object") {' + '\n' +
'            for(var i=0; i<pNames.length; i++) {' + '\n' +
'                var data =' + '\n' +
'                jsonPath(configObj, "$..virtual-networks[?(@.fq_name[2]==\'"+pNames[i]+"\')]");' + '\n' +
'                if(data && data.length == 1) {' + '\n' +
'                    data = data[0].uuid;' + '\n' +
'                }' + '\n' +
'                uuids[uuids.length] = data;' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'        else if(typeof pNames == "string") {' + '\n' +
'            var data =' + '\n' +
'            jsonPath(configObj, "$..virtual-networks[?(@.fq_name[2]==\'"+pNames+"\')]");' + '\n' +
'            if(data && data.length == 1) {' + '\n' +
'                data = data[0].uuid;' + '\n' +
'            }' + '\n' +
'            uuids[uuids.length] = data;' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    return uuids.toString();' + '\n' +
'}' + '\n' +
' function fetchDataForAllTables(config) {' + '\n' +
'     if (isSet(config.tables) && config.tables.length > 0) {' + '\n' +
'         for (var i = 0; i < config.tables.length; i++) {' + '\n' +
'             var table = config.tables[i];' + '\n' +
'             fetchDataForTable(table);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     fetchDataForAllTablesInTab(config.tabs);' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function fetchDataForAllTablesInTab(tabs) {' + '\n' +
'    if(!isSet(tabs))' + '\n' +
'	     return;' + '\n' +

'     if (isSet(tabs[0])) {' + '\n' +
'         for (var i = 0; i < tabs.length; i++) {' + '\n' +
'             var tab = tabs[i];' + '\n' +
'             var tables = tab.tables;' + '\n' +
'             for (var j = 0; j < tables.length; j++) {' + '\n' +
'                 var table = tables[j];' + '\n' +
'                 fetchDataForTable(table);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     } ' + '\n' +
'     else {' + '\n' +
'         var tables_in_tab = $("#"+tabs.contentElement.id).find("div[id^=\'div_tab_\']");' + '\n' +
'         for(var i=0; i<tables_in_tab.length; i++) {' + '\n' +
'             var table_id = tables_in_tab[i].id.split("div_tab_")[1];' + '\n' +
'             var table = getTableByID(table_id);' + '\n' +
'             if(isSet(table.geturl)) {' + '\n' +
'                 fetchDataForTable(table);' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +

' function initWrapup(config) {' + '\n' +
'     //Handle Landing Table - Begin' + '\n' +
'     wrapTabpanel(config.rows, config.cols, config.pageid, config.tabs);' + '\n' +
'     wrapGrid(config.tables);' + '\n' +
'     setTitle();' + '\n' +
' }' + '\n' +
' function setTitle() {' + '\n' +
'     if(isSet(config) && isSet(config.tabs) && config.tabs.length > 0) {' + '\n' +
'         var tab_id = config.tabs[0].id;' + '\n' +
'         var sel_tab_index = $("#"+tab_id).data("kendoTabStrip").select().index();' + '\n' +
'         var title = "Configure " + config.tabs[sel_tab_index].title;' + '\n' +
'         $("#span_table_title")[0].innerHTML=title;' + '\n' +
'     } else if(isSet(config) && isSet(config.tables) && isSet(config.tables)) {' + '\n' +
'         var title = "Configure " + config.tables[0].title;' + '\n' +
'         $("#span_table_title")[0].innerHTML= title;' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' function wrapTabpanel(rows, cols, id, tabs) {' + '\n' +
'     if (tabs && tabs.length > 0) {' + '\n' +
'         for (var row = 0; row < rows; row++) {' + '\n' +
'             for (var col = 0; col < cols; col++) {' + '\n' +
'                 for (var t = 0; t < tabs.length; t++) {' + '\n' +
'                     var tab = tabs[t];' + '\n' +
'                     if ((tab.row - 1 == row) && (tab.col - 1 == col)) {' + '\n' +
'                         var ulId = "tabs_" +' + '\n' +
'                             id + "_" + row + "_" + col;' + '\n' +
'                         applyKendoTab(tab.id);' + '\n' +
'                         if (tab.tabs && tab.tabs.length > 0)' + '\n' +
'                             wrapTabpanel(tab.rows, tab.cols, tab.id, tab.tabs);' + '\n' +
'                         if (tab.tables && tab.tables.length > 0)' + '\n' +
'                             wrapGrid(tab.tables);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function wrapGrid(tables) {' + '\n' +
'     if (tables && tables.length > 0) {' + '\n' +
'         for (var t_count = 0; t_count < tables.length; t_count++) {' + '\n' +
'             var table = tables[t_count];' + '\n' +
'             var cols = table.columns;' + '\n' +
'             var col_config = [];' + '\n' +
'             var tableHasActionColumn = false;' + '\n' +
'             if (cols) {' + '\n' +
'                 for (var i = 0; i < cols.length; i++) {' + '\n' +
'                     col_config[i] = {};' + '\n' +
'                     col_config[i].field = cols[i].field' + '\n' +
'                     col_config[i].width = cols[i].width;' + '\n' +
'                     col_config[i].filterable = cols[i].filterable;' + '\n' +
'                     if (cols[i].visible === "false" || cols[i].visible === false) {' + '\n' +
'                         col_config[i].hidden = true;' + '\n' +
'                     }' + '\n' +
'                     if (cols[i].title && "" != cols[i].title)' + '\n' +
'                         col_config[i].title = cols[i].title;' + '\n' +
'                     else' + '\n' +
'                         col_config[i].title = cols[i].field;' + '\n' +
'                     if (table.type === "detail") {' + '\n' +
'                         col_config[i].rowvalues = cols[i].rowvalues;' + '\n' +
'                         col_config[i].rowfields = cols[i].rowfields;' + '\n' +
'                     }' + '\n' +
'                     if (isSet(cols[i].type) && cols[i].type == "action") {' + '\n' +
'                         col_config[i].type = cols[i].type.trim();' + '\n' +
'                         col_config[i].values = cols[i].values;' + '\n' +
'                         tableHasActionColumn = true;' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             var table_data;' + '\n' +
'             if (table.type === "detail")' + '\n' +
'                 table_data = getDetailsTableData(cols);' + '\n' +
'             table.hasActionColumn = tableHasActionColumn;' + '\n' +
' ' + '\n' +
'             var grid_config = {};' + '\n' +
'             grid_config.attributes = {' + '\n' +
'                 "class": "table-cell",' + '\n' +
'                 style: "text-align: right; font-size: 14px"' + '\n' +
'             }' + '\n' +
'             grid_config.width = table.width;' + '\n' +
'             grid_config.height = table.height;' + '\n' +
'             grid_config.reorderable = true;' + '\n' +
'             grid_config.resizable = true;' + '\n' +
'             grid_config.columnMenu = false;' + '\n' +
'             //grid_config.sortable = table.sortable;' + '\n' +
'             grid_config.sortable = false;' + '\n' +
'             //grid_config.filterable = table.filterable;' + '\n' +
'             grid_config.filterable = false;' + '\n' +
'             grid_config.pageable =' + '\n' +
'                 ((table.type !== "detail") ?' + '\n' +
'                 ((table.paging) ?' + '\n' +
'                 ((table.pagesize) ? {' + '\n' +
'                 pageSize: parseInt(table.pagesize)' + '\n' +
'             } : 10) : false) : false);' + '\n' +
'             grid_config.dataSource = {' + '\n' +
'                 data: (table_data && table_data.length > 0) ? table_data : []' + '\n' +
'             };' + '\n' +
'             grid_config.selectable =' + '\n' +
'                 ((table.selectable) ?' + '\n' +
'                 ((table.multiple) ?' + '\n' +
'                 "multiple row" : "row") : false);' + '\n' +
'             grid_config.change = onRowSelect;' + '\n' +
' ' + '\n' +
'             if (tableHasActionColumn === false) {' + '\n' +
'                 grid_config.columns = col_config;' + '\n' +
'                 $("#div_" + table.id).kendoGrid(grid_config);' + '\n' +
'             } else {' + '\n' +
'                 //grid_config.columns = col_config;' + '\n' +
'                 var table_el = createTableElement("table_" + table.id, col_config);' + '\n' +
'                 $("#div_" + table.id)[0].appendChild(table_el);' + '\n' +
' ' + '\n' +
'                 var scr_div = document.createElement("div");' + '\n' +
'                 scr_div.id = module_name;' + '\n' +
'                 document.body.appendChild(scr_div);' + '\n' +
'                 var scr_row =' + '\n' +
'                     createScriptElement("row_tmpl_" + table.id, null, col_config);' + '\n' +
'                 scr_div.appendChild(scr_row);' + '\n' +
'                 var scr_alt_row =' + '\n' +
'                     createScriptElement("alt_row_tmpl_" + table.id, "k-alt", col_config);' + '\n' +
'                 scr_div.appendChild(scr_alt_row);' + '\n' +
'                 grid_config.rowTemplate =' + '\n' +
'                     kendo.template($("#row_tmpl_" + table.id).html());' + '\n' +
'                 grid_config.altRowTemplate =' + '\n' +
'                     kendo.template($("#alt_row_tmpl_" + table.id).html());' + '\n' +
'                 $("#div_" + table.id).kendoGrid(grid_config);' + '\n' +
'                 $("#table_" + table.id)[0].style.display = "none";' + '\n' +
'             }' + '\n' +
' ' + '\n' +
'             var tableactions = table.tableactions;' + '\n' +
'             if (tableactions && tableactions.length > 0) {' + '\n' +
'                 for (var a_count = 0; a_count < tableactions.length; a_count++) {' + '\n' +
'                     var action = tableactions[a_count];' + '\n' +
'                     if (action.type == "add") {' + '\n' +
'                         $("#btn_" + table.id + "_add").' + '\n' +
'                         click(onLandingTableAddEdit);' + '\n' +
'                     } else if (action.type == "edit") {' + '\n' +
'                         $("#btn_" + table.id + "_edit").' + '\n' +
'                         click(onLandingTableAddEdit);' + '\n' +
'                     } else if (action.type == "delete") {' + '\n' +
'                         $("#btn_" + table.id + "_delete").' + '\n' +
'                         click(onLandingTableDelete);' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function createTableElement(id, col_config) {' + '\n' +
'     var table = document.createElement("table");' + '\n' +
'     table.id = id;' + '\n' +
'     var thead = document.createElement("thead");' + '\n' +
'     table.appendChild(thead);' + '\n' +
'     var tbody = document.createElement("tbody");' + '\n' +
'     table.appendChild(tbody);' + '\n' +
'     var tr = document.createElement("tr");' + '\n' +
'     thead.appendChild(tr);' + '\n' +
'     for (var col = 0; col < col_config.length; col++) {' + '\n' +
'         if (col_config[col].hidden !== true &&' + '\n' +
'             col_config[col].hidden !== "true") {' + '\n' +
'             var th = document.createElement("th");' + '\n' +
'             th.innerHTML = col_config[col].title;' + '\n' +
'             th.width = col_config[col].width;' + '\n' +
'             tr.appendChild(th);' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return table;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function createScriptElement(id, rowClass, col_config) {' + '\n' +
'     var scr_row = document.createElement("script");' + '\n' +
'     scr_row.id = id;' + '\n' +
'     scr_row.type = "text/x-kendo-tmpl";' + '\n' +
'     var content = "";' + '\n' +
'     if (isSet(rowClass))' + '\n' +
'         content += "<tr class=\'" + rowClass + "\'>";' + '\n' +
'     else' + '\n' +
'         content += "<tr>";' + '\n' +
' ' + '\n' +
'     var td = "";' + '\n' +
'     var table_id = id.split("row_tmpl_")[1];' + '\n' +
'     for (var col = 0; col < col_config.length; col++) {' + '\n' +
'         if (col_config[col].type !== "action" && col_config[col].hidden !== true)' + '\n' +
'             td += "<td width=\'" + col_config[col].width + "\'>${ " + col_config[col].field + " }</td>";' + '\n' +
'         else {' + '\n' +
'             if (col_config[col].hidden !== true &&' + '\n' +
'                 col_config[col].hidden !== "true") {' + '\n' +
'                 td += "<td style=\\"overflow:visible\\" width=\'" + col_config[col].width + "\'><div style=\\"width:100px\\"><ul class=\\"configActionMenu\\" style=\\"margin:0;padding:0;border:0;outline:0;vertical-align:baseline;\\">";' + '\n' +
'                 if (isSet(col_config[col].values)) {' + '\n' +
'                     var action = col_config[col].values.action;' + '\n' +
'                     var items = col_config[col].values.items;' + '\n' +
'                     if (isSet(items)) {' + '\n' +
'                         items = items.split(",");' + '\n' +
'                         for (var i = 0; i < items.length; i++) {' + '\n' +
'                             if(i==0) {' + '\n' +
'                                 if(isSet(action)) {' + '\n' +
'                                     if(items.length > 1)' + '\n' +
'                                         td += "<li><a id=\'sel_${Math.floor(Math.random()*90000) + 10000}_" + table_id + "\' onclick=\\"" + action + "(this);\\" style=\\"display:inline-block\\" href=\\"javascript:void(0)\\">" + items[i] + "</a><span>&\\\\\#x25BE;</span><ul class=\\"noJS\\" style=\\"margin:0;padding:0;border:0;outline:0;vertical-align:baseline;\\">";' + '\n' +
'                                     else' + '\n' +
'                                         td += "<li><a id=\'sel_${Math.floor(Math.random()*90000) + 10000}_" + table_id + "\' onclick=\\"" + action + "(this);\\" href=\\"javascript:void(0)\\">" + items[i] + "</a>";' + '\n' +
'                                 } else {' + '\n' +
'                                     if(items.length > 1)' + '\n' +
'                                         td += "<li><a id=\'sel_${Math.floor(Math.random()*90000) + 10000}_" + table_id + "\' href=\\"javascript:void(0)\\">" + items[i] + "</a><ul class=\\"noJS\\" style=\\"margin:0;padding:0;border:0;outline:0;vertical-align:baseline;\\">";' + '\n' +
'                                     else' + '\n' +
'                                         td += "<li><a id=\'sel_${Math.floor(Math.random()*90000) + 10000}_" + table_id + "\' href=\\"javascript:void(0)\\">" + items[i] + "</a>";' + '\n' +
'                                 }' + '\n' +
'                             } else {' + '\n' +
'                                 if(isSet(action)) {' + '\n' +
'                                     if(i == (items.length - 1))' + '\n' +
'                                         td += "<li><a id=\'sel_${Math.floor(Math.random()*90000) + 10000}_" + table_id + "\' onclick=\\"" + action + "(this);\\" href=\\"javascript:void(0)\\">" + items[i] + "</a></li></ul></li>";' + '\n' +
'                                     else' + '\n' +
'                                         td += "<li><a id=\'sel_${Math.floor(Math.random()*90000) + 10000}_" + table_id + "\' onclick=\\"" + action + "(this);\\" href=\\"javascript:void(0)\\">" + items[i] + "</a></li>";' + '\n' +
'                                 } else {' + '\n' +
'                                     if(i == (items.length - 1))' + '\n' +
'                                         td += "<li><a id=\'sel_${Math.floor(Math.random()*90000) + 10000}_" + table_id + "\' href=\\"javascript:void(0)\\">" + items[i] + "</a></li></ul></li>";' + '\n' +
'                                     else' + '\n' +
'                                         td += "<li><a id=\'sel_${Math.floor(Math.random()*90000) + 10000}_" + table_id + "\' href=\\"javascript:void(0)\\">" + items[i] + "</a></li>";' + '\n' +
'                                 }' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'                 td += "</ul></div></td>";' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' ' + '\n' +
'     content += td + "</tr>";' + '\n' +
'     scr_row.innerHTML = content;' + '\n' +
'     return scr_row;' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function populateFailureData(result, cbParam) { ' + '\n' +
'     var table_id; ' + '\n' +
'     table_id = cbParam.table_id; ' + '\n' +
'     var table = getTableByID(table_id); ' + '\n' +
'     var source = getKendoGridForATable(table); ' + '\n' +
'     hideLoadingMaskOfElement(source); ' + '\n' +
'     hideLoadingMaskForTargetsOfTable(table); ' + '\n' +
' } ' + '\n' +
' ' + '\n' +
' function populateData(result, cbParam) {' + '\n' +
'     var table_id;' + '\n' +
'     table_id = cbParam.table_id;' + '\n' +
'     var uuid = cbParam.uuid;' + '\n' +
'     var table = getTableByID(table_id);' + '\n' +
'     if(!isSet(table))' + '\n' +
'        return;' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
'     hideLoadingMaskOfElement(source);' + '\n' +
'     hideLoadingMaskForTargetsOfTable(table);' + '\n' +
'     if (isSet(table)) {' + '\n' +
'         try {' + '\n' +
'             //table.result = JSON.parse(result);' + '\n' +
'             table.result = result;' + '\n' +
'         } catch (e) {' + '\n' +
'             table.result = result;' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     populateSourceTableData(table, uuid, cbParam.who);' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function populateSourceTableData(table, uuid, who) {' + '\n' +
'     var result = table.result;' + '\n' +
'     var cols = table.columns;' + '\n' +
'     if(isSet(table.title))' + '\n' +
'         $("#span_"+table.id+"_title").text(resolveURLFields(table.title, table));' + '\n' +
'     if (table.type !== "detail") {' + '\n' +
'         var lt = getKendoGridForATable(table);' + '\n' +
'         hideLoadingMaskOfElement(lt);' + '\n' +
'         if (table.hasActionColumn === false) {' + '\n' +
'             // Normal Grid - without action column' + '\n' +
'             var landing_table_data = lt.dataSource.data();             ' + '\n' +
'             if(isSet(uuid)) {' + '\n' +
'                  var index=0;' + '\n' +
'                  var column_data = [];' + '\n' +
'                  column_data = getDataFromPath(result, cols);' + '\n' +
'                  //create/edit' + '\n' +
'                  if(isSet(who) && who == "parent") {' + '\n' +
'                      var field = getFieldFromURL(table.geturl);' + '\n' +
'                      if(isSet(field) && field.length == 1) {' + '\n' +
'                          field = field[0];' + '\n' +
'                          var alluuids = jsonPath(column_data, "$.*." + field);' + '\n' +
'                          for(var i=0; i<alluuids.length; i++) {' + '\n' +
'                              if(alluuids[i] == uuid) {' + '\n' +
'                                  index=i;' + '\n' +
'                                  break;' + '\n' +
'                              }' + '\n' +
'                          }' + '\n' +
'                          var new_item = column_data[index];' + '\n' +
'                          column_data.splice(index, 1);' + '\n' +
'                          var ds1 = [];' + '\n' +
'                          ds1.unshift(new_item);' + '\n' +
'                          for(var i=0; i<column_data.length; i++) {' + '\n' +
'                              ds1[ds1.length] = column_data[i];' + '\n' +
'                          }' + '\n' +
'                          landing_table_data.splice(0, landing_table_data.length);' + '\n' +
'                          column_data = ds1;' + '\n' +
'                          for (var i = 0; i < column_data.length; i++)' + '\n' +
'                              landing_table_data.push(column_data[i]);' + '\n' +
'                          if(landing_table_data.length > 0) {' + '\n' +
'                             var row = lt.tbody.find(">tr:first");' + '\n' +
'                             lt.select(row);' + '\n' +
'                          }' + '\n' +
'                      }' + '\n' +
'                 } else {' + '\n' +
'                      var field = getFieldFromURL(table.geturl);' + '\n' +
'                      if(isSet(field) && field.length == 1) {' + '\n' +
'                          field = field[0];' + '\n' +
'                          var alluuids = landing_table_data;' + '\n' +
'                          for(var i=0; i<alluuids.length; i++) {' + '\n' +
'                              if(alluuids[i][field] == uuid) {' + '\n' +
'                                  index=i;' + '\n' +
'                                  break;' + '\n' +
'                              }' + '\n' +
'                          }' + '\n' +
'                          if(landing_table_data.length > 0)' + '\n' +
'                              //lt.select("tr:eq("+(index+1)+")");' + '\n' +
'                              var row = lt.tbody.find("tr:eq("+(index)+")");' + '\n' +
'                              lt.select(row);' + '\n' +
'                      }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             else {' + '\n' +
'                //GET request of Parent/Child' + '\n' +
'                var column_data = [];' + '\n' +
'                column_data = getDataFromPath(result, cols);' + '\n' +
'                landing_table_data.splice(0, landing_table_data.length);' + '\n' +
'                for (var i = 0; i < column_data.length; i++)' + '\n' +
'                    landing_table_data.push(column_data[i]);' + '\n' +
'                 if(landing_table_data.length > 0) {' + '\n' +
'                     var row = lt.tbody.find(">tr:first");' + '\n' +
'                     lt.select(row);' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         } else {' + '\n' +
'             // Action Grid - with action column' + '\n' +
'             var landing_table_data = lt.dataSource.data();             ' + '\n' +
'             if(isSet(uuid)) {' + '\n' +
'                  var index=0;' + '\n' +
'                  var column_data = [];' + '\n' +
'                  column_data = getDataFromPath(result, cols);' + '\n' +
'                  //create/edit' + '\n' +
'                  if(isSet(who) && who == "parent") {' + '\n' +
'                      var field = getFieldFromURL(table.geturl);' + '\n' +
'                      if(isSet(field) && field.length == 1) {' + '\n' +
'                          field = field[0];' + '\n' +
'                          var alluuids = jsonPath(column_data, "$.*." + field);' + '\n' +
'                          for(var i=0; i<alluuids.length; i++) {' + '\n' +
'                              if(alluuids[i] == uuid) {' + '\n' +
'                                  index=i;' + '\n' +
'                                  break;' + '\n' +
'                              }' + '\n' +
'                          }' + '\n' +
'                          var new_item = column_data[index];' + '\n' +
'                          column_data.splice(index, 1);' + '\n' +
'                          var ds1 = [];' + '\n' +
'                          ds1.unshift(new_item);' + '\n' +
'                          for(var i=0; i<column_data.length; i++) {' + '\n' +
'                              ds1[ds1.length] = column_data[i];' + '\n' +
'                          }' + '\n' +
'                          landing_table_data.splice(0, landing_table_data.length);' + '\n' +
'                          column_data = ds1;' + '\n' +
'                          for (var i = 0; i < column_data.length; i++)' + '\n' +
'                              landing_table_data.push(column_data[i]);' + '\n' +
'                          if(landing_table_data.length > 0) {' + '\n' +
'                              var row = lt.tbody.find(">tr:first");' + '\n' +
'                              lt.select(row);' + '\n' +
'                          }' + '\n' +
'                      }' + '\n' +
'                 }' + '\n' +
'                 else {' + '\n' +
'                      var field = getFieldFromURL(table.geturl);' + '\n' +
'                      var landing_index = 0;' + '\n' +
'                      var column_index = 0;' + '\n' +
'                      if(isSet(field) && field.length == 1) {' + '\n' +
'                          field = field[0];' + '\n' +
'                          var alluuids = landing_table_data;' + '\n' +
'                          for(var i=0; i<alluuids.length; i++) {' + '\n' +
'                              if(alluuids[i][field] == uuid) {' + '\n' +
'                                  landing_index=i;' + '\n' +
'                                  break;' + '\n' +
'                              }' + '\n' +
'                          }' + '\n' +
'                          for(var i=0; i<column_data.length; i++) {' + '\n' +
'                              if(column_data[i][field] == uuid) {' + '\n' +
'                                  column_index=i;' + '\n' +
'                                  break;' + '\n' +
'                              }' + '\n' +
'                          }' + '\n' +
'                          if(landing_table_data.length > 0) {' + '\n' +
'                              landing_table_data.splice(0, landing_table_data.length);' + '\n' +
'                              for (var i = 0; i < column_data.length; i++)' + '\n' +
'                                  landing_table_data.push(column_data[i]);' + '\n' +
'                              var row = lt.tbody.find("tr:eq("+(landing_index)+")");' + '\n' +
'                              lt.select(row);' + '\n' +
'                          }' + '\n' +
'                      }' + '\n' +
'                 } ' + '\n' +
'             }' + '\n' +
'             else {' + '\n' +
'                //GET request of Parent/Child' + '\n' +
'                var column_data = [];' + '\n' +
'                column_data = getDataFromPath(result, cols);' + '\n' +
'                landing_table_data.splice(0, landing_table_data.length);' + '\n' +
'                for (var i = 0; i < column_data.length; i++)' + '\n' +
'                    landing_table_data.push(column_data[i]);' + '\n' +
'                 if(landing_table_data.length > 0) {' + '\n' +
'                     var row = lt.tbody.find(">tr:first");' + '\n' +
'                     lt.select(row);' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'             var selects = lt.tbody.children().find("select");' + '\n' +
'             for (var i = 0; i < selects.length; i++) {' + '\n' +
'                 $("#" + selects[i].id).kendoDropDownList();' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         if(lt.dataSource.data().length == 0) {' + '\n' +
'             showGridMessage("#" + $(lt.element).attr("id"),"No Data Found");' + '\n' +
'             toggleButtonStateByID("btn_" + $(lt.element).attr("id").split("div_")[1] + "_delete");' + '\n' +
'             toggleBtnByAction("edit", table, lt)' + '\n' +
'         }' + '\n' +
'     } else {' + '\n' +
'         var dt = getKendoGridForATable(table);' + '\n' +
'         hideLoadingMaskOfElement(dt);' + '\n' +
'         var details_table_data = dt.dataSource.data();' + '\n' +
'         details_table_data.splice(0, details_table_data.length);' + '\n' +
'         var column_data = [];' + '\n' +
'         var index = 0;' + '\n' +
'         if (cols.length > 0) {' + '\n' +
'             for (var i = 0; i < cols.length; i++) {' + '\n' +
'                 var col = cols[i];' + '\n' +
'                 if (col.rowfields && col.rowfields.length > 0) {' + '\n' +
'                     for (var j = 0; j < col.rowfields.length; j++) {' + '\n' +
'                         var data = jsonPath(result, col.rowfields[j])' + '\n' +
'                         for (var k = 0; k < data.length; k++) {' + '\n' +
'                             if (!isSet(column_data[k]))' + '\n' +
'                                 column_data[k] = {};' + '\n' +
'                             if (isSet(col.format)) {' + '\n' +
'                                 var format = col.format;' + '\n' +
'                                 var fn = format.split("(")[0];' + '\n' +
'                                 format = format.split("(")[1];' + '\n' +
'                                 format = format.split(")")[0];' + '\n' +
'                                 format = format.replace(/[{{}}]/g, "");' + '\n' +
'                                 if (typeof window[fn] === "function")' + '\n' +
'                                     column_data[k][col.field] =' + '\n' +
'                                         window[fn](data[k]);' + '\n' +
'                             } else' + '\n' +
'                                 column_data[k][col.field] = data[k];' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'         for (var i = 0; i < column_data.length; i++) {' + '\n' +
'             details_table_data.push({' + '\n' +
'                 "name": column_data[i]["name"],' + '\n' +
'                 "value": column_data[i]["value"]' + '\n' +
'             });' + '\n' +
'         }' + '\n' +
'         var row = dt.tbody.find(">tr:first");' + '\n' +
'         dt.select(row);' + '\n' +
'         if(dt.dataSource.data().length == 0) {' + '\n' +
'             showGridMessage("#" + $(dt.element).attr("id"),"No Data Found");' + '\n' +
'             toggleButtonStateByID("btn_" + $(dt.element).attr("id").split("div_")[1] + "_delete");' + '\n' +
'             toggleBtnByAction("edit", table, dt)' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
'function toggleBtnByAction(action, table, grid) {' + '\n' +
'    if(isSet(action) && isSet(table) && isSet(table.tableactions)) {' + '\n' +
'        for(var i=0; i<table.tableactions.length;i++) {' + '\n' +
'            var taction = table.tableactions[i];' + '\n' +
'            if(action == taction.type) {' + '\n' +
'                if(action == "edit") {' + '\n' +
'                    if(isSet(taction.process) && taction.process === "table") {' + '\n' +
'                        toggleButtonStateByID("btn_" + $(grid.element).attr("id").split("div_")[1] + "_edit", true);' + '\n' +                    
'                    } else {' + '\n' +
'                        toggleButtonStateByID("btn_" + $(grid.element).attr("id").split("div_")[1] + "_edit", false);' + '\n' +
'                    }' + '\n' +
'                } else if(action == "add") {' + '\n' +
'                   var parents = getParentsForTable(table.id);' + '\n' +
'                   for(var p=0; p<parent.length; p++) {' + '\n' +
'                       var parent = $("#div_" + parent[p] + "_delete");' + '\n' +
'                       if(isSet(parent) && isSet(parent[0]) && parent[0].disabled === true)' + '\n' +
'                           toggleButtonStateByID("btn_" + $(grid.element).attr("id").split("div_")[1] + "_add", false);' + '\n' +
'                       else' + '\n' +
'                           toggleButtonStateByID("btn_" + $(grid.element).attr("id").split("div_")[1] + "_add", true);' + '\n' +
'                   }' + '\n' +
'                }' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'}' + '\n' +
'function getDataFromPath(result, cols) {' + '\n' +
'     var column_data = [];' + '\n' +
'     var re = /{{(.*?)}}/g;' + '\n' +
'     if (isSet(cols) && cols.length > 0) {' + '\n' +
'         for (var col = 0; col < cols.length; col++) {' + '\n' +
'             var col_type = cols[col].type;' + '\n' +
'             if (!isSet(col_type) || col_type !== "action") {' + '\n' +
'                 var format = cols[col].format;' + '\n' +
'                 var formatIsSet = false;' + '\n' +
'                 if (isSet(format)) {' + '\n' +
'                     if (format.indexOf("{{") != -1 && format.indexOf("}}") != -1) {' + '\n' +
'                         formatIsSet = true;' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'                 var path="";' + '\n' +
'                 if (formatIsSet === false) {' + '\n' +
'                     path = cols[col].path;' + '\n' +
'                 }' + '\n' +
'                 else ' + '\n' +
'                     path = cols[col].format;' + '\n' +
'                 if(isSet(path)) {' + '\n' +
'                    if(path.indexOf("(") !== -1 && path.indexOf(")") !== -1) {' + '\n' +
'                        var fn = path.split("(")[0];' + '\n' +
'                        path = path.split("(")[1];' + '\n' +
'                        path = path.split(")")[0];' + '\n' +
'                        path = path.replace(/[{{}}]/g, "");' + '\n' +
'                        if (typeof window[fn] === "function") {' + '\n' +
'                            var col_data = jsonPath(result, path);' + '\n' +
'                            for (var i = 0; i < col_data.length; i++) {' + '\n' +
'                                var formattedString = window[fn](col_data[i]);' + '\n' +
'                                if (!isSet(column_data[i]))' + '\n' +
'                                    column_data[i] = {};' + '\n' +
'                                column_data[i][cols[col].field] = formattedString;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                     else if(path.indexOf("{{") != -1 && path.indexOf("}}") != -1) {' + '\n' +
'                         var paths = path.match(re);' + '\n' +
'                         if (isSet(paths)) {' + '\n' +
'                             paths = (paths.toString()).replace(/[{{}}]/g, "");' + '\n' +
'                             paths = paths.split(",");' + '\n' +
'                             var pathArray = [];' + '\n' +
'                             for (var i = 0; i < paths.length; i++) {' + '\n' +
'                                 var col_data = jsonPath(result, paths[i]);' + '\n' +
'                                 for (var j = 0; j < col_data.length; j++) {' + '\n' +
'                                     if (!isSet(pathArray[j]))' + '\n' +
'                                         pathArray[j] = path;' + '\n' +
'                                     pathArray[j] =' + '\n' +
'                                         pathArray[j].replace("{{" + paths[i] + "}}", col_data[j]);' + '\n' +
'                                     if (!isSet(column_data[j]))' + '\n' +
'                                         column_data[j] = {};' + '\n' +
'                                     if (typeof pathArray[j] === "object") {' + '\n' +
'                                         pathArray[j] =' + '\n' +
'                                             pathArray[j].toString().replace(/,/gi, ":");' + '\n' +
'                                     }' + '\n' +
'                                     column_data[j][cols[col].field] = pathArray[j];' + '\n' +
'                                 }' + '\n' +
'                             }                             ' + '\n' +
'                         }' + '\n' +
'                     } else if(path.indexOf("{{") == -1 && path.indexOf("}}") == -1) {' + '\n' +
'                        var col_data = jsonPath(result, path);' + '\n' +
'                        for (var i = 0; i < col_data.length; i++) {' + '\n' +
'                            if (!isSet(column_data[i]))' + '\n' +
'                                column_data[i] = {};' + '\n' +
'                            if (typeof col_data[i] === "object") {' + '\n' +
'                                try {' + '\n' +
'                                    if (isSet(col_data[i])) {' + '\n' +
'                                        col_data[i] =' + '\n' +
'                                        col_data[i].toString().' + '\n' +
'                                        replace(/,/gi, ":");' + '\n' +
'                                    }' + '\n' +
'                                } catch (e) {' + '\n' +
'                                     col_data[i] = "";' + '\n' +
'                                }' + '\n' +
'                            }' + '\n' +
'                            column_data[i][cols[col].field] = col_data[i];' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
'     return column_data;' + '\n' +
' }' + '\n' +
'' + '\n' +
' function disableGridButton(e) {' + '\n' +
'     var grid_id = e.sender._cellId.split("_")[1];' + '\n' +
'     var lt = $("#div_" + grid_id).data("kendoGrid");' + '\n' +
'     var disableBtn = $("#btn_" + grid_id + "_edit");' + '\n' +
'     if (disableBtn.length > 0) {' + '\n' +
'         if (lt.select().length > 1) {' + '\n' +
'             $("#btn_" + grid_id + "_edit")[0].disabled = true;' + '\n' +
'             $("#btn_" + grid_id + "_edit")[0].className += " k-state-disabled";' + '\n' +
'         } else {' + '\n' +
'             $("#btn_" + grid_id + "_edit")[0].disabled = false;' + '\n' +
'         }' + '\n' +
'         //tbd' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function populateTargetTableData(result, grid_id) {' + '\n' +
'     //var grid_id = e.sender._cellId.split("_")[1];' + '\n' +
'     var table = getTableByID(grid_id);' + '\n' +
'     table.result = result;' + '\n' +
'     var targets = table.targets;' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
' ' + '\n' +
'     var selected_row_index = 0;' + '\n' +
'     selected_row_index = source.select().index();' + '\n' +
'     var selected_row = source.dataItem(source.select());' + '\n' +
' ' + '\n' +
'     if (targets && targets.length > 0) {' + '\n' +
'         for (var t_count = 0; t_count < targets.length; t_count++) {' + '\n' +
'             var target_table = getTableByID(targets[t_count]);' + '\n' +
'             target_table.result = result;' + '\n' +
'             var target = getKendoGridForATable(target_table);' + '\n' +
'             hideLoadingMaskOfElement(target);' + '\n' +
'             if (isSet(target)) {' + '\n' +
'                 var details_table_data = [];' + '\n' +
'                 details_table_data = target.dataSource.data();' + '\n' +
'                 var columns = target.columns;' + '\n' +
'                 if (isSet(target_table.url) &&' + '\n' +
'                     target_table.url.indexOf("{{") !== -1 &&' + '\n' +
'                     target_table.url.indexOf("}}") !== -1) {' + '\n' +
'                     var target_url = target_table.url;' + '\n' +
'                     var re = /{{(.*?)}}/g;' + '\n' +
'                     var fields = target_url.match(re);' + '\n' +
'                     fields = (fields.toString()).replace(/[{{}}]/g, "");' + '\n' +
'                     fields = fields.split(",");' + '\n' +
'                     for (var j = 0; j < fields.length; j++) {' + '\n' +
'                         target_url = target_url.replace("{{" + fields[j] + "}}",' + '\n' +
'                             selected_row[fields[j]]);' + '\n' +
'                     }' + '\n' +
'                     var cbParams = {};' + '\n' +
'                     cbParams.table_id = target_table.id;' + '\n' +
'                     doAjaxCall(target_url, "GET", null, "populateData", "populateFailureData", false,' + '\n' +
'                         cbParams);' + '\n' +
'                 } else {' + '\n' +
'                         target_table.result = result;' + '\n' +
'                         populateSourceTableData(target_table);' + '\n' +
'                 }' + '\n' +
'             } else {' + '\n' +
'                 var form_panel = $("#form_" + targets[t_count] + "_div");' + '\n' +
'                 if (isSet(form_panel) && isSet(form_panel[0])) {' + '\n' +
'                     var columns = [];' + '\n' +
'                     var values = [];' + '\n' +
'                     var column_index = 0;' + '\n' +
'                     var rowCount = form_panel[0].childNodes.length;' + '\n' +
'                     for (var row = 0; row < rowCount; row++) {' + '\n' +
'                         var formRow = form_panel[0].childNodes[row];' + '\n' +
'                         var colCount = formRow.childNodes.length;' + '\n' +
'                         for (var col = 0; col < colCount; col++) {' + '\n' +
'                             var formCol = formRow.childNodes[col];' + '\n' +
'                             var elCount = formCol.childNodes.length;' + '\n' +
'                             for (var elIndex = 0; elIndex < elCount; elIndex++) {' + '\n' +
'                                 var element = formCol.childNodes[elIndex];' + '\n' +
'                                 columns[column_index] = {};' + '\n' +
'                                 columns[column_index].label =' + '\n' +
'                                     element.childNodes[0].innerHTML;' + '\n' +
'                                 columns[column_index].value =' + '\n' +
'                                     element.childNodes[1].innerHTML;' + '\n' +
'                                 columns[column_index].field =' + '\n' +
'                                     element.childNodes[2].value;' + '\n' +
'                                 columns[column_index].path =' + '\n' +
'                                     element.childNodes[3].value;' + '\n' +
'                                 columns[column_index].element =' + '\n' +
'                                     element.childNodes[1];' + '\n' +
'                                 column_index++;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                     var cols = "";' + '\n' +
'                     if (isSet(target_table.columns))' + '\n' +
'                         cols = target_table.columns;' + '\n' +
'                     else if (isSet(columns))' + '\n' +
'                         cols = columns;' + '\n' +
'                     if (isSet(cols)) {' + '\n' +
'                         var column_data = [];' + '\n' +
'                         if (cols.length > 0) {' + '\n' +
'                             column_data = getDataFromPath(result, cols);' + '\n' +
'                             for (var col = 0; col < columns.length; col++) {' + '\n' +
'                                 var column = columns[col];' + '\n' +
'                                 if (isSet(column)) {' + '\n' +
'                                     var dataArray = [];' + '\n' +
'                                     for (var c_index = 0; c_index < column_data.length; c_index++) {' + '\n' +
'                                         if (isSet(column_data[c_index][column["field"]])) {' + '\n' +
'                                             dataArray[c_index] =' + '\n' +
'                                                 column_data[c_index][column["field"]];' + '\n' +
'                                         }' + '\n' +
'                                     }' + '\n' +
'                                     column.element.innerHTML =' + '\n' +
'                                         dataArray.toString();' + '\n' +
'                                 }' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function handleAllowAllProjects(e) {' + '\n' +
'    var form_div = e.parentNode.parentNode.parentNode.parentNode;' + '\n' +
'    var form_div_id = form_div.id;' + '\n' +
'    var mss = $("#form_0_div").children().find(".multiselect")' + '\n' +
'    if(mss.length == 2) {' + '\n' +
'        var lhs_list_id, rhs_list_id;' + '\n' +
'        if(mss[0].id.indexOf("multiselect_lhs") != -1)' + '\n' +
'            lhs_list_id = mss[0].id;' + '\n' +
'        if(mss[0].id.indexOf("multiselect_rhs") != -1)' + '\n' +
'            rhs_list_id = mss[0].id;' + '\n' +
'        if(mss[1].id.indexOf("multiselect_lhs") != -1)' + '\n' +
'            lhs_list_id = mss[1].id;' + '\n' +
'        if(mss[1].id.indexOf("multiselect_rhs") != -1)' + '\n' +
'            rhs_list_id = mss[1].id;' + '\n' +
'    }' + '\n' +
'    var availablelist = $("#" + lhs_list_id).data("kendoListView");' + '\n' +
'    var selectlist = $("#" + rhs_list_id).data("kendoListView");' + '\n' +
'    var selectdata = selectlist.dataSource.data();' + '\n' +
'    var availdata = availablelist.dataSource.data();' + '\n' +
'     for (var i = 0; i < availdata.length; i++) {' + '\n' +
'         selectdata.push({' + '\n' +
'             "item": availdata[i].item' + '\n' +
'         });' + '\n' +
'     }' + '\n' +
'    if(e.checked == true) {' + '\n' +
'        selectlist.dataSource.data(selectdata);' + '\n' +
'        availablelist.dataSource.data([]);' + '\n' +
'    }' + '\n' +
'    else {' + '\n' +
'        selectlist.dataSource.data([]);' + '\n' +
'        availablelist.dataSource.data(selectdata);' + '\n' +
'    }' + '\n' +
' }' + '\n' +
' function handleFip(e) {' + '\n' +
'     var who = $(e).text();' + '\n' +
'     switch (who) {' + '\n' +
'        case "Associate":' + '\n' +
'            launchAssociateWindow(e);' + '\n' +
'            break;' + '\n' +
'        case "Disassociate":' + '\n' +
'            disassociate(e);' + '\n' +
'            break;' + '\n' +
'        case "Release":' + '\n' +
'            break;' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' custom_table = {};' + '\n' +
' custom_action = {};' + '\n' +
' source_table_id = "";' + '\n' +
'' + '\n' +
' function fillupTemplateFromRow(obj, row) {' + '\n' +
'     for (var k in obj) {' + '\n' +
'         if (typeof obj[k] === "object") {' + '\n' +
'             fillupTemplateFromRow(obj[k], row);' + '\n' +
'         } else {' + '\n' +
'             if (typeof obj[k] === "string" && obj[k].indexOf("{{") != -1 && obj[k].indexOf("}}") != -1) {' + '\n' +
' ' + '\n' +
'                 var re = /{{(.*?)}}/g;' + '\n' +
'                 var paths = obj[k].match(re);' + '\n' +
'                 if (isSet(paths)) {' + '\n' +
'                     paths = (paths.toString()).replace(/[{{}}]/g, "");' + '\n' +
'                     paths = paths.split(",");' + '\n' +
'                 } else' + '\n' +
'                     paths = [];' + '\n' +
' ' + '\n' +
'                 if (obj[k].indexOf("(") != -1 && obj[k].indexOf(")") != -1) {' + '\n' +
'                     //function name given' + '\n' +
'                     var format = obj[k];' + '\n' +
'                     var fn = format.split("(")[0];' + '\n' +
'                     format = format.split("(")[1];' + '\n' +
'                     format = format.split(")")[0];' + '\n' +
'                     format = format.replace(/[{{}}]/g, "");' + '\n' +
'                     if (typeof window[fn] === "function") {' + '\n' +
'                         if(isSet(row[format]))' + '\n' +
'                            obj[k] = window[fn](row[format]);' + '\n' +
'                         else' + '\n' +
'                            obj[k] = row[format];' + '\n' +
'                     }' + '\n' +
'                     else' + '\n' +
'                        obj[k] = row[format];' + '\n' +
'                 } else {' + '\n' +
'                     for (var i = 0; i < paths.length; i++) {' + '\n' +
'                         if (paths[i].indexOf("$") != -1) {' + '\n' +
'                             //jsonpath given' + '\n' +
'                             var data = jsonPath(configObj, paths[i]);' + '\n' +
'                             if (typeof data == "object") {' + '\n' +
'                                 data = data.toString();' + '\n' +
'                             }' + '\n' +
'                             obj[k] = data;' + '\n' +
'                         } else {' + '\n' +
'                             if (isSet(row[paths[i]])) {' + '\n' +
'                                 //Field name given' + '\n' +
'                                 var value =  row[paths[i]];' + '\n' +
'                                 if (typeof value === "object" &&' + '\n' +
'                                     value.length > 0) {' + '\n' +
'                                     value = value.toString();' + '\n' +
'                                     obj[k] = value;' + '\n' +
'                                 } else' + '\n' +
'                                     obj[k] = value;' + '\n' +
'                             }' + '\n' +
'                         }' + '\n' +
'                     }' + '\n' +
'                 }' + '\n' +
'             }' + '\n' +
'         }' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function disassociate(e) { ' + '\n' +
'     var table_id = e.id.split("_")[2];' + '\n' +
'     var table = getTableByID(table_id);' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
'     var selected_row = source.dataItem(source.select());' + '\n' +
'     custom_action.template=\'{"floating-ip":{"virtual_machine_interface_ref": [], "floating_ip_address":"{{floatingipaddress}}","fq_name":["{{$.projects[0].fq_name[0]}}","getSelectedProjectName()","getNetworkFromFIPool({{fipool}})","getPoolNameFromFIPool({{fipool}})","{{fipuuid}}"],"id_perms":{"enable": 1},"parent_type": "floating-ip-pool","uuid": "{{fipuuid}}"}}\';' + '\n' +
'     custom_action.template = JSON.parse(custom_action.template);' + '\n' +
'     custom_action.type = "edit";' + '\n' +
'     custom_action.method = "PUT";' + '\n' +
'     custom_action.submiturl = "/api/tenants/config/floating-ip/{{fipuuid}}";' + '\n' +
'     fillupTemplateFromRow(custom_action.template, selected_row);' + '\n' +
'' + '\n' +
'     if (isSet(custom_action.submiturl)) {' + '\n' +
'         custom_action.submiturl = resolveURLFields(custom_action.submiturl, table);' + '\n' +
'         var cbParams = {};' + '\n' +
'         cbParams.table_id = table.id;' + '\n' +
'         cbParams.who = "child";' + '\n' +
'         if(isSet(custom_action.submiturl))' + '\n' +
'         doAjaxCall(custom_action.submiturl, custom_action.method, JSON.stringify(custom_action.template),' + '\n' +
'             "createCB", "createFailCB", false, cbParams);' + '\n' +
'         ' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' ' + '\n' +
' function launchAssociateWindow(e) {' + '\n' +
'     var table_id = e.id.split("_")[2];' + '\n' +
'     source_table_id = table_id;' + '\n' +
'     custom_table.id = "associatefip";' + '\n' +
'     custom_table.result = "";' + '\n' +
'     custom_table.url = "/api/tenants/config/floating-ip-pools/{{getSelectedProjectUUID()}}";' + '\n' +
'     custom_action.submiturl = "/api/tenants/config/floating-ip/{{fipuuid}}";' + '\n' +
'     custom_action.okaction = "okCustomHandler";' + '\n' +
'     custom_action.type ="edit";' + '\n' +
'     custom_action.method = "PUT";' + '\n' +
'     custom_action.title = "Associate Floating IP to Instance";' + '\n' +
'     custom_action.template = \'{"floating-ip":{"floating_ip_address":"{{floatingipaddress}}","fq_name":["{{$.projects[0].fq_name[0]}}","getProjectForVNFromFIP({{fipool}})","getNetworkFromFIPool({{fipool}})","getPoolNameFromFIPool({{fipool}})","{{fipuuid}}"],"uuid": "{{fipuuid}}","virtual_machine_interface_refs":[{"attr":{},"to":["stripIp({{instance}})","{{instanceif}}"],"uuid":"{{instanceif}}"}],"parent_type": "floating-ip-pool"}}\';' + '\n' +
'     custom_action.forms = [];' + '\n' +
'     custom_action.forms[0] = {};' + '\n' +
'     var form = custom_action.forms[0];' + '\n' +
'     form.elements = [];' + '\n' +
'     form.elements[0] = [];' + '\n' +
'     form.elements[0][0] = [];' + '\n' +
'     form.elements[0][0][0] = {};    ' + '\n' +
'     var element = form.elements[0][0][0];' + '\n' +
'     element.field = "instance";' + '\n' +
'     element.id = "instance_uuid";' + '\n' +
'     element.path = "{{$.virtual_machine_interface_back_refs[*].to[0]}}: {{$.virtual_machine_interface_back_refs[*].instance_ip_address}}";' + '\n' +
'     element.url = "/api/tenants/config/virtual-machine-interfaces?tenant_id=default-domain:" + getSelectedProjectName();' + '\n' +
'     element.setpath = "";' + '\n' +
'     element.title = "Instance";' + '\n' +
'     element.type = "combobox";' + '\n' +
'     element.mandatory = "true";' + '\n' +
'     fetchDataForTable(custom_table);' + '\n' +
'     launchAddEditWindow(custom_action, custom_table, "edit");' + '\n' +
' }' + '\n' +
'' + '\n' +
' function okCustomHandler() {' + '\n' +
'     var action_template = fillupActionTemplate(custom_action, custom_action.type);' + '\n' +
'     var table_id = source_table_id;' + '\n' +
'     var table = getTableByID(table_id);' + '\n' +
'     var source = getKendoGridForATable(table);' + '\n' +
'     var selected_row = source.dataItem(source.select());' + '\n' +
'     fillupTemplateFromRow(action_template, selected_row);' + '\n' +
'     var instance = $("#"+custom_action.forms[0].elements[0][0][0].id).data("kendoComboBox").text();' + '\n' +
'     instance = (instance.split(":")[0]).trim();' + '\n' +
'     var instanceif = jsonPath(configObj, "$.virtual_machine_interface_back_refs[?(@.to[0]==\'" + instance + "\')]");' + '\n' +
'     if(isSet(instanceif) && instanceif.length == 1) {' + '\n' +
'         instanceif = instanceif[0];' + '\n' +
'     } else {' + '\n' +
'         var selectedIndex = $("#instance_uuid").data("kendoComboBox").value();' + '\n' +
'         instanceif = instanceif[selectedIndex];' + '\n' +
'     }' + '\n' +
'     instanceif = instanceif.to[1];' + '\n' +
'     action_template = JSON.stringify(action_template);' + '\n' +
'     action_template = action_template.replace(/{{instanceif}}/g, instanceif);' + '\n' +
'     action_template = JSON.parse(action_template);' + '\n' +
'     var action_url = custom_action.submiturl;' + '\n' +
'     var action_method = custom_action.method;' + '\n' +
'     if (isSet(action_url)) {' + '\n' +'         var cbParams = {};' + '\n' +
'         cbParams.table_id = table.id;' + '\n' +
'         cbParams.window_id = "window_" + custom_table.id + "_" + custom_action.type;' + '\n' +
'         cbParams.who = "child";' + '\n' +
' ' + '\n' +
'         //TBD: have validation functionality here. if(validate())' + '\n' +
'         action_url = resolveURLFields(action_url, table);' + '\n' +
'         if(isSet(action_url))' + '\n' +
'              doAjaxCall(action_url, action_method, JSON.stringify(action_template),' + '\n' +
'              "createCB", "createFailCB", false, cbParams);' + '\n' +
'         custom_table = {};' + '\n' +
'         custom_action = {};' + '\n' +
'         source_table_id = "";' + '\n' +
'     }' + '\n' +
' }' + '\n' +
' function handleProject(e) {' + '\n' +
'     var pname = e.sender._current.text();' + '\n' +
'     setCookie("project", pname);' + '\n' +
'     cleanupAllTables();' + '\n' +
'     setProjectToConfigObj(pname);' + '\n' +
'     fetchDataForAllTables(config);' + '\n' +
' }' + '\n' +
' function handleDomain() {' + '\n' +
'     if(config.ps_avl === false) {' + '\n' +
'         cleanupAllTables();' + '\n' +
'         fetchDataForAllTables(config);' + '\n' +
'     }' + '\n' +
' }' + '\n' +
'function handleSequence(e) {' + '\n' +
'    var sel_text = $("#"+e.id).data("kendoComboBox").text();' + '\n' +
'    var parent = e;' + '\n' +
'    while(parent.parentNode.id.indexOf("window_") == -1) {' + '\n' +
'        parent = parent.parentNode;' + '\n' +
'    }' + '\n' +
'    var window_id = parent.parentNode.id;' + '\n' +
'    var partial_window_ids = window_id.split("_");' + '\n' +
'    var table_id = partial_window_ids[2];' + '\n' +
'    var mode = partial_window_ids[3];' + '\n' +
'    var table = getTableByID(table_id);' + '\n' +
'    var forms;' + '\n' +
'    if(isSet(table) && isSet(table.tableactions)) {' + '\n' +
'        for(var i=0; i<table.tableactions.length; i++) {' + '\n' +
'            if(table.tableactions[i].type == mode) {' + '\n' +
'                forms = table.tableactions[i].forms;' + '\n' +
'                break; ' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    var allfields = {};' + '\n' +
'    if(isSet(forms)) {' + '\n' +
'        for(var i=0; i<forms.length; i++) {' + '\n' +
'            var elements = forms[i].elements;' + '\n' +
'            if(!isSet(elements))' + '\n' +
'                continue;' + '\n' +
'            for(var row=0; row<elements.length; row++) {' + '\n' +
'                var el_row = elements[row];' + '\n' +
'                if(!isSet(el_row))' + '\n' +
'                    continue;' + '\n' +
'                for(var col=0; col<el_row.length; col++) {' + '\n' +
'                    var els = el_row[col];' + '\n' +
'                    if(!isSet(els))' + '\n' +
'                        continue;' + '\n' +
'                    for(var index=0; index<els.length; index++) {' + '\n' +
'                        allfields[els[index]["field"]] = els[index];' + '\n' +
'                    }' + '\n' +
'                }' + '\n' +
'            }' + '\n' +
'        }' + '\n' +
'    }' + '\n' +
'    if(!isSet(allfields))' + '\n' +
'        return false;' + '\n' +
'' + '\n' +
'    var seq_el = allfields["sequence"];' + '\n' +
'    populateRule(sel_text.toLowerCase());' + '\n' +
'    switch(sel_text.toLowerCase()) {' + '\n' +
'        case "after":' + '\n' +
'        case "before":' + '\n' +
'            $("#"+seq_el.id).data("kendoDropDownList").wrapper.show();' + '\n' +
'            break;' + '\n' +
'        case "last":' + '\n' +
'        case "first":' + '\n' +
'            $("#"+seq_el.id).data("kendoDropDownList").wrapper.hide();' + '\n' +
'            break;' + '\n' +
'    }' + '\n' +
'    ' + '\n' +
'}' + '\n' +
' function getSelectedProjectUUID() {' + '\n' +
'     var pname = getSelectedProjectName();' + '\n' +
'     return getProjectUUID(pname);' + '\n' +
' }' + '\n' +
' function getSelectedDomainUUID() {' + '\n' +
'     var dname = getSelectedDomain();' + '\n' +
'     return getDomainUUID(dname);' + '\n' +
' }' + '\n' +
' function defaultValidator(arg) {' + '\n' +
'     return true;' + '\n' +
' }';

return str+str1;
}
