/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

(function ($) {
    // register namespace
    $.extend(true, window, {
        "ContrailGrid": {
            "Formatters": {
                "Text": TextFormatter,
                "Checkbox": CheckboxFormatter,
                "ContrailMultiselect": ContrailMultiselectFormatter
            }
        }
    });

    function TextFormatter (row, cell, value, columnDef, dataContext) {
        return value;
    }

    function CheckboxFormatter (row, cell, value, columnDef, dataContext) {
        return value ? '<i class="icon-ok margin-0-5"></i>' : '';
    }

    function ContrailMultiselectFormatter (row, cell, value, columnDef, dataContext) {
        return ($.isArray(value)) ? value.join(', ') : '';
    }
})(jQuery);
