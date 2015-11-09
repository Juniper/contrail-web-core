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
        'co-test-mockdata'      : coreTestAppBaseDir + '/co.test.mock.data',
        'co-test-runner'        : coreTestAppBaseDir + '/co.test.runner',
        'co-grid-contrail-list-model-test-suite'     : coreTestAppBaseDir + '/grid/ContrailListModel.test.suite',
        'co-grid-view-test-suite'                    : coreTestAppBaseDir + '/grid/GridView.test.suite',
        'co-grid-contrail-list-model-lib-test-suite' : coreTestAppBaseDir + '/grid/ContrailListModel.lib.test.suite',
        'co-grid-view-lib-test-suite'                : coreTestAppBaseDir + '/grid/GridView.lib.test.suite',
        'co-chart-view-zoom-scatter-test-suite'      : coreTestAppBaseDir + '/chart/ZoomScatterChartView.test.suite',
        'co-chart-view-line-bar-test-suite'          : coreTestAppBaseDir + '/chart/LineBarWithFocusChartView.test.suite',
        'co-chart-view-line-test-suite'              : coreTestAppBaseDir + '/chart/LineWithFocusChartView.test.suite',
        'co-tabs-view-test-suite'                    : coreTestAppBaseDir + '/generic/TabsView.test.suite',
        'co-details-view-test-suite'                 : coreTestAppBaseDir + '/generic/DetailsView.test.suite',

        'co-form-model-validations-test-suite'       : coreTestAppBaseDir + '/form/ModelValidations.test.suite',
    };
}

function coreTestAppShim() {
    return {
        'co-grid-contrail-list-model-lib-test-suite' : {
            deps: ['slick.core', 'slick.dataview']
        },
        'co-grid-view-lib-test-suite' : {
            deps: ['slick.core', 'slick.grid', 'jquery-ui', 'slick.enhancementpager']
        }
    };
}