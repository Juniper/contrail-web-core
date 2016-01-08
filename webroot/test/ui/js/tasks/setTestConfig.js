/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

var exec = require('child_process').exec,
    args = process.argv.slice(2);

var TEST_CONFIG_FILE = "webroot/test/ui/js/co.test.config.js"

if ('set-env' == args[0]) {
    // set test env
    if (args[1] != null) {
        var cmd = "sed \"s/testConfig.env.*/testConfig.env = '" + args[1] + "';/g\" " +
            TEST_CONFIG_FILE +
            " > " +
            TEST_CONFIG_FILE + ".new";
        run_cmd(cmd);

        // set test config for the env
        if (args[2] != null) {
            console.log(args[2]);
            var confObj = JSON.parse(args[2]);
            console.log(confObj);
            if (confObj.run_severity) {
                cmd = "sed \"s/testConfig.run_severity.*/testConfig.run_severity = '" + confObj.run_severity + "';/g\" " +
                    TEST_CONFIG_FILE +
                    " > " +
                    TEST_CONFIG_FILE + ".new";
                run_cmd(cmd);
            }

            if (confObj.page_load_timeout) {
                cmd = "sed \"s/testConfig.page_load_timeout.*/testConfig.page_load_timeout = " + confObj.page_load_timeout + ";/g\" " +
                    TEST_CONFIG_FILE +
                    " > " +
                    TEST_CONFIG_FILE + ".new";
                run_cmd(cmd);
            }

            if (confObj.page_init_timeout) {
                cmd = "sed \"s/testConfig.page_init_timeout.*/testConfig.page_init_timeout = " + confObj.page_init_timeout + ";/g\" " +
                    TEST_CONFIG_FILE +
                    " > " +
                    TEST_CONFIG_FILE + ".new";
                run_cmd(cmd);
            }

            if (confObj.assert_timeout) {
                cmd = "sed \"s/testConfig.assert_timeout.*/testConfig.assert_timeout = " + confObj.assert_timeout + ";/g\" " +
                    TEST_CONFIG_FILE +
                    " > " +
                    TEST_CONFIG_FILE + ".new";
                run_cmd(cmd);
            }
        }

        cmd = "mv " + TEST_CONFIG_FILE + ".new " + TEST_CONFIG_FILE;
        run_cmd(cmd);
    }
}

function run_cmd(cmd) {
    console.log("Executing: " + cmd);
    exec(cmd, function(err, stdout, stderr) {
        if (err) {
            console.log(err, stdout, stderr);
        }
    });
}