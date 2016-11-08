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
        },
        uddWidget: {
            TIMERANGE_DROPDOWN_VALUES_WO_CUSTOM: [
                {"id": 600, "text": "Last 10 Mins"},
                {"id": 1800, "text": "Last 30 Mins"},
                {"id": 3600, "text": "Last 1 Hr"},
                {"id": 21600, "text": "Last 6 Hrs"}
            ],
            gridPageSizeList: [8, 12, 16, 20]
        }
    };
});
