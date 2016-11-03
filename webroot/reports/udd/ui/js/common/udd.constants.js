/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([], function() {
    return {
        steps: {
            DATA_CONFIG: "configDataSrc",
            VISUAL_META_CONFIG: "configVisualMeta",
            SHOW_VISUALIZATION: "showVisualization"
        },
        raw: {
            WIDGET_META: "config",
            SUBVIEWS_CONFIG: "contentConfig",
            SUBVIEW_MODEL_DATA: "modelConfig"
        },
        modelIDs: {
            VISUAL_META: "contentConfigModel",
            DATA_SOURCE: "dataConfigModel",
            VIEWS_MODEL_COLLECTION: "viewsModel",
            WIDGET_META: "configModel",
        },
        subviewIDs: {
            DATA_SOURCE: "dataConfigView",
            VISUAL_META: "contentConfigView",
            VISUALIZATION: "contentView"
        }
    };
});
