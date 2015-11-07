/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var async = require('async'),
    exec = require('child_process').exec,
    assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    xml2js = require('xml2js'),
    js2xml = require('data2xml')(),
    pd = require('pretty-data').pd,
    _ = require('underscore');

var parser = new xml2js.Parser({explicitArray: false});
var builder = new xml2js.Builder({headless: true});

module.exports = function (grunt) {

    function getAllXmlJsons(file, callback) {

        /**
         *  get all the html tags within <table></table> from file and convert to javascript obj.
         *  this will have the coverage details.
         * */
        cmd = 'awk \'/^<table>/{p=1;print;next} p&&/<\\/div>$/{p=0};p\' ' + file;

        exec(cmd, function (err, stdout, stderr) {
            if (err != null) {
                console.log(err);
            }
            var content = stdout.trim();
            parser.parseString(content, function (err, content) {
                assert(err == null);
                callback(err, content);
                return;
            });
        });
    }

    function mergeXmlObjects(xmlJs1, xmlJs2) {
        xmlJs1.push(xmlJs2.table);
        return xmlJs1;
    }

    function updateCoveragePath(config, data) {
        var len = data.length;
        for (var i = 0; i < len; i++) {
            console.log(": ", config.coverageDirNames[i]);
            //Update Test task name in table head
            var tableHeader = data[i].table.thead.tr;
            delete data[i].table.thead['tr'];
            data[i].table.thead.tr = {
                tr: [{
                    th: {
                        $: {class: 'testsuite'},
                        _: 'Task Name: ' + config.coverageDirNames[i]
                    }
                }]
            };
            data[i].table.thead.tr.tr.push(tableHeader);

            //update JS dir url path
            var href = data[i].table.tbody.tr[0].td[0].a.$.href;
            data[i].table.tbody.tr[0].td[0].a.$.href = config.options.coverageDirFromMergePath +
                config.coverageDirNames[i] + '/' + encodeURI(config.options.phantomJSDirName) + '/' + href;

            //update /js/views url path
            href = data[i].table.tbody.tr[1].td[0].a.$.href;
            data[i].table.tbody.tr[1].td[0].a.$.href = config.options.coverageDirFromMergePath +
                config.coverageDirNames[i] + '/' + encodeURI(config.options.phantomJSDirName) + '/' + href;
        }
        return data;
    }

    function mergeCoverage(config, asyncObj) {
        async.map(config.coverageFiles, getAllXmlJsons, function (err, data) {
            var resJSON = null;
            var len = data.length;
            var tables = updateCoveragePath(config, data);

            for (var i = 0; i < len; i++) {
                if (0 == i) {
                    resJSON = [tables[i].table];
                }
                if (null != tables[i + 1]) {
                    resJSON = mergeXmlObjects(resJSON, tables[i + 1]);
                }
            }

            //Get the HTML JSON
            var htmlJsonFile = path.normalize(path.join(__dirname, '/coverage_tmpl.json'));
            fs.readFile(htmlJsonFile, function (err, content) {
                var htmlJson = JSON.parse(content);
                htmlJson.html.body.div[1].div.table = [];
                htmlJson.html.body.div[1].div.table = resJSON;
                var xmlData = builder.buildObject(htmlJson);
                xmlData = pd.xml(xmlData);
                fs.writeFile(config.options.coverageReportFile, xmlData, function (err) {
                    asyncObj();
                    console.log("Report file: ", config.options.coverageReportFile);
                });
            });
        });
    }

    grunt.registerMultiTask('mergeCoverage', 'task merges all test coverage reports', function () {
        var target = this.target;
        var defaultConfig = {
            options: {
                basePath: '.',
                mergePath: 'reports/',
                coverageDirFromMergePath: './coverage/',
                mergeFileName: 'test-coverage',
                reportFileName: 'coverage-report',
                phantomJSDirName: ''
            },
            dir: []
        }
        var config = grunt.config('mergeCoverage');
        //doing twice to preserve deep extension
        config.options = _.extend({}, defaultConfig.options, config.options);
        config = _.extend({}, defaultConfig, config);

        config.options.coverageOutputFile = config.options.mergePath + config.options.mergeFileName + '.html';
        config.options.coverageReportFile = config.options.mergePath + config.options.reportFileName + '.html';

        var asyncObj = this.async();
        config.coverageFiles = [];
        config.coverageDirNames = [];

        // npm glob module not available. for now just getting PhantomJS dir name by ls command.
        var cmd = 'ls ' + config.dir[0] + "PhantomJS\*/index.html";

        exec(cmd, function (err, stdout, stderr) {
            assert(err == null);
            var filePath = stdout.trim();
            config.options.phantomJSDirName = filePath.split('/').slice(-2)[0];
            _.each(config.dir, function (dirPath) {
                config.coverageDirNames.push(dirPath.split('/').slice(-2)[0]);
                config.coverageFiles.push(dirPath + "PhantomJS*/index.html");
            });
            if (target == 'dir') {
                console.log("Merging coverage reports..");
                mergeCoverage(config, asyncObj);
            }
        });
    });
}
