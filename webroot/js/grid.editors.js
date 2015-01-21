/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

(function ($) {
    // register namespace
    $.extend(true, window, {
        "ContrailGrid": {
            "Editors": {
                "Text": TextEditor,
                "Checkbox": CheckboxEditor,
                "ContrailDropdown": ContrailDropdownEditor,
                "ContrailMultiselect": ContrailMultiselectEditor
            }
        }
    });

    function TextEditor(args) {
        var $input;
        var defaultValue;
        var scope = this;

        this.init = function () {
            $input = $("<input type=text class='editor-text'/>")
                .appendTo(args.container)
                .bind("keydown.nav", function (e) {
                    if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                        e.stopImmediatePropagation();
                    }
                })
                .focus()
                .select();

            $input.attr('placeholder', contrail.checkIfExist(args.column.elementConfig.placeholder) ? args.column.elementConfig.placeholder : '');
        };

        this.destroy = function () {
            $input.remove();
        };

        this.focus = function () {
            $input.focus();
        };

        this.getValue = function () {
            return $input.val();
        };

        this.setValue = function (val) {
            $input.val(val);
        };

        this.loadValue = function (item) {
            if(contrail.checkIfFunction(args.column.editEnabler)) {
                var disableFlag = args.column.editEnabler(item);
                $input.prop('disabled', !disableFlag);
                if(!disableFlag) {
                    $input.val('');
                    return;
                }
            }
            defaultValue = item[args.column.field] || "";
            $input.val(defaultValue);
            $input[0].defaultValue = defaultValue;
            $input.select();
        };

        this.serializeValue = function () {
            return $input.val();
        };

        this.applyValue = function (item, state) {
            item[args.column.field] = state;
        };

        this.isValueChanged = function () {
            return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
        };

        this.validate = function () {
            if (args.column.validator) {
                var validationResults = args.column.validator($input.val());
                if (!validationResults.valid) {
                    return validationResults;
                }
            }

            return {
                valid: true,
                msg: null
            };
        };

        this.init();
    }

    function CheckboxEditor(args) {
        var $select;
        var defaultValue;
        var scope = this;

        this.init = function () {
            $select = $('<input type="checkbox" value="true" class="editor-checkbox ace-input" /><span class="ace-lbl"></span>');
            $select.appendTo(args.container);
            $select.focus();
        };

        this.destroy = function () {
            $select.remove();
        };

        this.focus = function () {
            $select.focus();
        };

        this.loadValue = function (item) {
            if(contrail.checkIfFunction(args.column.editEnabler)) {
                var disableFlag = args.column.editEnabler(item);
                $select.prop('disabled', !disableFlag);
                if(!disableFlag) {
                    $select.prop('checked', false);
                    return;
                }
            }
            defaultValue = !!item[args.column.field];
            if (defaultValue) {
                $select.prop('checked', true);
            } else {
                $select.prop('checked', false);
            }
        };

        this.serializeValue = function () {
            return $select.prop('checked');
        };

        this.applyValue = function (item, state) {
            item[args.column.field] = state;
        };

        this.isValueChanged = function () {
            return (this.serializeValue() !== defaultValue);
        };

        this.validate = function () {
            return {
                valid: true,
                msg: null
            };
        };

        this.init();
    }

    function ContrailDropdownEditor(args) {
        var $dropdown, $contrailDropdown = null,
            defaultValue,
            scope = this;

        this.init = function () {
            if(!contrail.checkIfExist($contrailDropdown)) {
                $dropdown = $("<input type=text class='editor-contrail-dropdown' />");
                $dropdown.appendTo(args.container);
                $dropdown.contrailDropdown(args.column.elementConfig);
                $dropdown.select();

                $contrailDropdown = $dropdown.data('contrailDropdown');

                if (contrail.checkIfFunction(args.column.initSetData)) {
                    args.column.initSetData(args, $contrailDropdown);
                }
            }
        };

        this.destroy = function () {
            if(contrail.checkIfExist($contrailDropdown)) {
                $contrailDropdown.destroy();
            }
        };

        this.focus = function () {
        };

        this.loadValue = function (item) {
            defaultValue = item[args.column.field];
            $contrailDropdown.value(defaultValue)
        };

        this.serializeValue = function () {
            return $contrailDropdown.value()
        };

        this.applyValue = function (item, state) {
            item[args.column.field] = state;
        };

        this.isValueChanged = function () {
            return (this.serializeValue() !== defaultValue);
        };

        this.validate = function () {
            return {
                valid: true,
                msg: null
            };
        };

        this.init();
    }

    function ContrailMultiselectEditor(args) {
        var $multiselect, $contrailMultiselect,
            defaultValue,
            scope = this;

        this.init = function () {
            $multiselect = $("<input type=text class='editor-contrail-multiselect' />");
            $multiselect.appendTo(args.container);
            $multiselect.contrailMultiselect(args.column.elementConfig);
            $multiselect.focus().select();

            $contrailMultiselect = $multiselect.data('contrailMultiselect');

            if (contrail.checkIfFunction(args.column.initSetData)) {
                args.column.initSetData(args, $contrailMultiselect);
            }
        };

        this.destroy = function () {
            $contrailMultiselect.destroy();
        };

        this.focus = function () {
        };

        this.loadValue = function (item) {
            if(contrail.checkIfFunction(args.column.editEnabler)) {
                var disableFlag = args.column.editEnabler(item);
                $contrailMultiselect.enable(disableFlag);
                if(!disableFlag) {
                    $contrailMultiselect.value([]);
                    return;
                }
            }

            defaultValue = item[args.column.field];
            $contrailMultiselect.value(defaultValue);
        };

        this.serializeValue = function () {
            return $contrailMultiselect.value()
        };

        this.applyValue = function (item, state) {
            item[args.column.field] = state;
        };

        this.isValueChanged = function () {
            return (this.serializeValue() !== defaultValue);
        };

        this.validate = function () {
            return {
                valid: true,
                msg: null
            };
        };

        this.init();
    }

})(jQuery);
