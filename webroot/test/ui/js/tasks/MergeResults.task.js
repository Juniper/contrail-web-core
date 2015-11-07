/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var async = require('async'),
    fs = require('fs'),
    xml2js = require('xml2js'),
    js2xml = require('data2xml')(),
    pd = require('pretty-data').pd,
    _ = require('underscore');

var parser = new xml2js.Parser({explicitArray: false});
var builder = new xml2js.Builder({headless: true});

var reportsJson = {
    html: {
        head: {
            meta: {'$': {charset: 'utf-8'}},
            title: 'Unit Test Report',
            style: {
                _: 'html,body{font-family: Helvetica Neue, Helvetica,Arial;font-size: 10pt;margin:0;padding:0;}' +
                'body{padding:10px 40px;}table{margin-bottom:20px;}' +
                'tr.header{background:#ddd;font-weight:bold;border-bottom:none;}' +
                'tr.results{font-weight:bold;border-bottom:none;}' +
                'td{padding:7px;border-top:none;border-left:1px black solid;border-bottom:1px black solid;border-right:none;}' +
                'td.value{font-weight:normal;}'+
                'tr.pass td{color:#003b07;background:#86e191;}tr.skip td{color:#7d3a00;background:#ffd24a;}' +
                'tr.fail td{color:#5e0e00;background:#ff9c8a;}tr:first-child td{border-top:1px black solid;}' +
                'td:last-child{border-right:1px black solid;}tr.overview{font-weight:bold;color:#777;}' +
                'tr.overview td{padding-bottom:0px;border-bottom:none;}tr.system-out td{color:#777;}' +
                'hr{height:2px;margin:30px 0;background:#000;border:none;}' +
                '.results .key {font-weight:bold;}',
                '$': {type: 'text/css'}
            }
        },
        body: {
            div: [{}, {}]
        }
    }
};

module.exports = function (grunt) {

    function getAllXmlJsons(file, callback) {
        fs.readFile(file, function (err, content) {
            if (err!= null) {
                console.log(err);
            }
            parser.parseString(content, function (err, content) {
                callback(err, content);
                return;
            });
        });
    }

    function calculateCumulativeResults(xmlJsArr) {
        var results = null;
        _.each(xmlJsArr, function (xmlJs) {
            if (null != results) {
                results.package = results.package + ', ' + xmlJs.testsuites.testsuite.$.package;
                results.tests = parseInt(results.tests) + parseInt(xmlJs.testsuites.testsuite.$.tests);
                results.errors = parseInt(results.errors) + parseInt(xmlJs.testsuites.testsuite.$.errors);
                results.failures = parseInt(results.failures) + parseInt(xmlJs.testsuites.testsuite.$.failures);
                results.time = parseFloat(results.time) + parseFloat(xmlJs.testsuites.testsuite.$.time);
                results.timestamp = new Date();
            } else {
                results = xmlJsArr[0].testsuites.testsuite.$;
            }
        });
        return results;
    }

    function createTestReport(config, xmlJsArr) {
        var results = calculateCumulativeResults(xmlJsArr);
        var resultsDiv = {table: {
            tr: []
        }}
        function getColorClass (property, value) {
            if (property == 'errors' || property == 'failures') {
                if (parseInt(value) > 0) {
                    return 'fail';
                } else {
                    return 'pass'
                }
            } else {
                return '';
            }
        }
        for (var property in results) {
            if (results.hasOwnProperty(property)) {
                resultsDiv.table.tr.push({
                    $: {
                        class: 'results'
                    },
                    td: [
                        {
                            $: {
                                colspan: '3',
                                class: 'value'
                            },
                            _: property
                        }, {
                            $: {
                                class: getColorClass(property, results[property])
                            },
                            _: results[property]
                        }]
                })
            }
        }
        var resultsLinkDiv = {
            _: "Test suite Results: ",
            a: [ {
                    $: {
                        href: './tests/' + config.options.mergeFileName + '.xml'
                    },
                    _: '(XML)'
                },
                {
                $: {
                    href: './tests/' + config.options.mergeFileName + '.html'
                },
                _: '(HTML)'
                }]
        };
        reportsJson.html.body.div[0] = resultsDiv;
        reportsJson.html.body.div[1] = resultsLinkDiv;
        var xmlData = builder.buildObject(reportsJson);
        xmlData = pd.xml(xmlData);
        fs.writeFile(config.options.reportOutputFile, xmlData, function (err) {
            if (err != null) {
                console.log(err);
            }
            console.log("Report file: ", config.options.reportOutputFile);
            console.log(pd.json(results));
        });
    }

    function mergeXmlObjects(xmlJs1, xmlJs2) {
        xmlJs1.testsuites.testsuite.push(xmlJs2.testsuites);
        return xmlJs1;
    }

    function mergeHtmlObjects(htmlJs1, htmlJs2) {
        _.each(htmlJs2.html.body.table.tr, function (row) {
            htmlJs1.html.body.table.tr.push(row);
        })
        return htmlJs1;
    }

    function mergeXmlFiles(config, asyncObj) {
        async.map(config.xmlFiles, getAllXmlJsons, function (err, data) {
            var resJSON = null;
            var len = data.length;
            for (var i = 0; i < len; i++) {
                if (0 == i) {
                    resJSON = {
                        testsuites: {
                            testsuite: [
                                data[i].testsuites
                            ]
                        }
                    };
                }
                if (null != data[i + 1]) {
                    resJSON = mergeXmlObjects(resJSON, data[i + 1]);
                }
            }
            var xmlData = builder.buildObject(resJSON);
            xmlData = pd.xml(xmlData);

            fs.writeFile(config.options.xmlOutputFile, xmlData, function (err) {
                console.log("Completed XML file: ", config.options.xmlOutputFile);
                createTestReport(config, data);
                asyncObj();
            });
        });
    }

    function mergeHtmlFiles(config, asyncObj) {
        async.map(config.htmlFiles, getAllXmlJsons, function (err, data) {
            var resJSON = null;
            var len = data.length;
            for (var i = 0; i < len; i++) {
                if (0 == i) {
                    resJSON = data[i];
                }
                if (null != data[i + 1]) {
                    resJSON = mergeHtmlObjects(resJSON, data[i + 1]);
                }
            }
            var xmlData = builder.buildObject(resJSON);
            xmlData = pd.xml(xmlData);

            fs.writeFile(config.options.htmlOutputFile, xmlData, function (err) {
                asyncObj();
                console.log("Completed HTML file: ", config.options.htmlOutputFile);
            });

        });
    }

    grunt.registerMultiTask('mergeResults', 'task merges all test results', function () {
        var target = this.target;
        var defaultConfig = {
            options: {
                mergePath: '.',
                mergeFileName: 'test-results',
                reportFileName: 'test-report'
            },
            xmlFiles: [],
            htmlFiles: []
        }
        var config = grunt.config('mergeResults');
        //doing twice to preserve deep extension
        config.options = _.extend({}, defaultConfig.options, config.options);
        config = _.extend({}, defaultConfig, config);

        config.options.xmlOutputFile = config.options.mergePath + 'tests/' + config.options.mergeFileName + '.xml';
        config.options.htmlOutputFile = config.options.mergePath + 'tests/' + config.options.mergeFileName + '.html';
        config.options.reportOutputFile = config.options.mergePath + config.options.reportFileName + '.html';

        var asyncObj = this.async();

        if (target == 'xmlFiles') {
            console.log("Merging XML Results..");
            mergeXmlFiles(config, asyncObj);
        } else if (target == 'htmlFiles') {
            console.log("Merging HTML Results..");
            mergeHtmlFiles(config, asyncObj);
        }

    });
}
