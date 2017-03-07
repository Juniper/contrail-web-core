/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore'
], function (_) {
var ChartSettings = function() {
	var self = this;
		self.config = {
			'min-width': {
				350: {
					'showXAxis': true,
					'showXLabel': true
				},
				200: {
					'showLegend': false,
					'showXAxis': false,
					'showXLabel': false	
				},
				0: {
					'showXAxis': false,
					'showXLabel': false,
					'showYAxis': false,
					'showYLabel': false	
				}
			},
			'min-height': {
				200: {
					'showYAxis': true,
					'showYLabel': true	
				},
				150: {
					'showLegend': false,
					'showYAxis': false,
					'showYLabel': false		
				},
				0: {
					'showXAxis': false,
					'showXLabel': false,
					'showYAxis': false,
					'showYLabel': false	
				}
			}
		}
	}
	return ChartSettings;
});