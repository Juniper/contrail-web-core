/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
var qUnitRunnerConfig =  {
    // logging options
    log: {
        // log assertions overview
        assertions: true,

        // log expected and actual values for failed tests
        errors: true,

        // log tests overview
        tests: true,

        // log summary
        summary: true,

        // log global summary (all files)
        globalSummary: true,

        // log currently testing code file
        testing: true
    },  
    // run test coverage tool
    coverage: false,

    // define dependencies, which are required then before code
    deps: null,
   
    // define namespace your code will be attached to on global['your namespace']
    namespace: null
};  

exports.qUnitRunnerConfig = qUnitRunnerConfig;

