/*
 * Copyright (c) 2015 Juniper Networks, Inc. All rights reserved.
 */
//console.info('test runner ', define);
define([
    'jquery',
    'co-test-utils',
    'co-test-runner',
    'co-infoboxes-view-test-suite',
], function ($, cotu, cotr, InfoboxesViewTestSuite) {
	console.log('component test suite called')
	var componentTestCfg = [{
		suites: [{
			class: InfoboxesViewTestSuite,
			groups: ['all']
		}]
	}];
	cotr.executeUnitTests(componentTestCfg);
});