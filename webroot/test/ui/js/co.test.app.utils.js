/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */

function getCoreTestAppPaths(coreBaseDir) {
    var coreTestAppBaseDir = coreBaseDir + '/test/ui/js';

    return {
        'co-test-basedir'       : coreTestAppBaseDir,
        'co-test-init'          : coreTestAppBaseDir + '/co.test.init',
        'co-test-constants'     : coreTestAppBaseDir + '/co.test.constants',
        'co-test-utils'         : coreTestAppBaseDir + '/co.test.utils',
        'co-test-messages'      : coreTestAppBaseDir + '/co.test.messages',
        'co-test-mockdata'      : coreTestAppBaseDir + '/co.test.mockdata',
        'co-test-grid-dataview' : coreTestAppBaseDir + '/grid/listmodel.test',
        'co-test-grid-gridview' : coreTestAppBaseDir + '/grid/gridview.test'
    };
}