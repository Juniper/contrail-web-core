/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'backbone'
], function (_, Backbone) {
    var GraphView = joint.dia.Paper.extend({
        linkView: joint.shapes.contrail.LinkView
    });

    return GraphView;
});