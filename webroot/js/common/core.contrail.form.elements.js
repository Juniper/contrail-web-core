/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'jquery',
    'underscore',
    'moment',
    'jquery-ui'
], function($, _, moment) {
    $.ui.tabs.prototype._tabKeydown = function(event){
        return;
    };

    $.fn.contrailAutoComplete = function(option){
        var self = this;
        option = (typeof option === "undefined") ? {} : option;
        self.autocomplete(option);
        self.data('contrailAutoComplete', {
            value: function (value) {
                if (typeof value === 'undefined') {
                    return self.val();
                } else {
                    self.val(value);
                }
            }
        });
        return self;
    };

    $.fn.contrailMultiselect = function(option,option2){
        var self = this;
        option.multiple = true;
        self.data('contrailMultiselect', constructSelect2(self, option, option2));
        return self;
    };

    $.fn.contrailTabs = function(option) {
        var self = this,
            theme = 'overcast';

        option = (typeof option === "undefined") ? {} : option;

        if (contrail.checkIfExist(option.theme)) {
            theme = option.theme;
        }

        self.addClass('contrail-tabs-' + theme)
            .tabs(option)
            .data('contrailTabs', {
                _tabsUIObj: self.tabs(),
                startLoading: function(selectedTabLinkId){
                    $(selectedTabLinkId).prepend('<i class="fa fa-spinner fa-spin contrail-tabs-loading"></i>');
                },
                endLoading: function(selectedTabLinkId){
                    $(selectedTabLinkId).find('.contrail-tabs-loading').remove();
                },
                destroy: function() {
                    $(self).tabs('destroy');
                },
                refresh: function() {
                    $(self).tabs('refresh');
                },
                /*
                 * This function adds a tab to the existing tabs,which accepts two parameters
                 * id,name.Id is href for anchor tag(div id) and name is the tab name
                 */
                addTab: function(id,name,options) {
                    if(options != null && options['position'] == 'before') {
                        $(self).find('ul').first().prepend('<li><a href="#'+id+'">'+name+'</a></li>');
                        $(self).find('ul').after('<div id="'+id+'" style="display:none">'+name+'</div>');
                    } else {
                        $(self).find('ul').first().append('<li><a href="#'+id+'">'+name+'</a></li>');
                        $(self).append('<div id="'+id+'" style="display:none">'+name+'</div>');
                    }
                    $(self).tabs('refresh');
                },

                /*
                 * This function disables the tab and hides it based on the flag
                 * accepts either array of tab indexes or single tab index
                 */
                disableTab: function (tabIndex, hide) {
                    if($.isArray(tabIndex)) {
                        for (var i = 0; i < tabIndex.length; i++) {
                            $(self).data('contrailTabs').disableTab(tabIndex[i], hide);
                        }
                        return;
                    }

                    // Get the array of disabled tabs, if any
                    var disabledTabs = self.tabs("option", "disabled");

                    if ($.isArray(disabledTabs)) {
                        var pos = $.inArray(tabIndex, disabledTabs);

                        if (pos < 0) {
                            disabledTabs.push(tabIndex);
                        }
                    }
                    else {
                        disabledTabs = [tabIndex];
                    }
                    $(self).tabs("option", "disabled", disabledTabs);

                    if (hide === true) {
                        $(self).find('li:eq(' + tabIndex + ')').addClass('ui-state-hidden');
                    }
                },
                /*
                 * This function enables the tab which accepts either array of
                 * indexes or single tab index
                 */
                enableTab: function (tabIndex) {
                    if($.isArray(tabIndex)) {
                        for (var i = 0; i < tabIndex.length; i++) {
                            $(self).data('contrailTabs').enableTab(tabIndex[i]);
                        }
                        return;
                    }
                    $(self).find('li:eq(' + tabIndex + ')').removeClass('ui-state-hidden');
                    $(self).tabs("enable", tabIndex);
                },

                activateTab: function (tabIndex) {
                    $(self).tabs({ active: tabIndex });
                }
            });

        return self;
    };

    $.fn.contrailNumericTextbox = function (option) {
        var self = this;
        option = (typeof option === "undefined") ? {} : option;
        self.spinner(option);
        self.data('contrailNumericTextbox', {
            value: function (value) {
                if (typeof value === 'undefined') {
                    return self.spinner("value");
                } else {
                    self.spinner("value", value);
                }
            },
            destroy: function() {
                self.spinner("destroy");
            }
        });
        return self;
    };

    $.fn.contrailDateTimePicker = function(option) {
        var self = this,
            defaultOption = {
                formatDate: 'M d, Y',
                formatTime: 'h:i:s A',
                format: 'M d, Y h:i:s A',
                step: 10,
                displayFormat: 'MMM DD, YYYY hh:mm:ss A'
            };
        option = (typeof option === "undefined") ? {} : option;

        option = $.extend(true, defaultOption, option);

        this.addClass('datetimepicker')
            .datetimepicker(option);

        self.data('contrailDateTimePicker', {
            option: option,
            setMinDateTime: function(minDateTime) {
                self.data('contrailDateTimePicker').option.minDate = moment(minDateTime).format('MMM DD, YYYY');
                self.data('contrailDateTimePicker').option.minTime = moment(minDateTime).format('hh:mm:ss A');

                self.addClass('datetimepicker')
                    .datetimepicker(self.data('contrailDateTimePicker').option);
            },
            setMaxDateTime: function(maxDate) {
                self.data('contrailDateTimePicker').option.maxDate = maxDate;
                self.addClass('datetimepicker')
                    .datetimepicker(self.data('contrailDateTimePicker').option);
            },
            val: function(dateTime) {
                console.warn('Contrail WebUI Warning: Function val of ContrailDateTimePicker is deprecated. Use value() instead.');
                self.val(moment(dateTime).format(option.displayFormat));
            },
            value: function(dateTime) {
                if(!contrail.checkIfExist(dateTime)) {
                    return self.val();
                } else {
                    var value = moment(dateTime).format(option.displayFormat);
                    self.val(value);
                    return value;
                }
            },
            destroy: function() {
                self.datetimepicker('destroy')
            }
        });
        return self;
    };

    $.fn.contrailDropdown = function(defaultOption, args) {
        var self = this;
        self.data('contrailDropdown', constructSelect2(self, defaultOption, args));
        return self;
    };

    $.fn.contrailCombobox = function(customOption) {
        var option = $.extend(true, {}, customOption),
            self = this,
            dataObject = {
                cachedValue: null,
                isRequestInProgress: false
            },
            formattedData = [];

        self.globalSelect = {};
        self.globalDisableList = [];

        option = (typeof option === "undefined") ? {} : option;

        if(typeof option === 'string'){
            var input = self.next().find('.custom-combobox-input');
            input.autocomplete(option);

            if(option == 'enable'){
                input.removeAttr('disabled');
            }
            else if(option == 'disable'){
                input.attr('disabled','disabled');
            }
        } else {
            option.dataTextField = {dsVar: option.dataTextField, apiVar: 'value'};
            option.dataValueField = {dsVar: option.dataValueField, apiVar: 'id'};
            if(!$.isEmptyObject(option) && typeof option.dataSource !== 'undefined') {
                var dataSourceOption = option.dataSource;
                if(dataSourceOption.type == "remote"){
                    var ajaxConfig = {
                            url: dataSourceOption.url,
                            dataType: contrail.checkIfExist(dataSourceOption.dataType) ? dataSourceOption.dataType : 'json'
                    };
                    if(dataSourceOption.contentType) {
                        ajaxConfig['contentType'] = dataSourceOption.contentType;
                    }
                    if(dataSourceOption.timeout) {
                        ajaxConfig['timeout'] = dataSourceOption.timeout;
                    }
                    if(dataSourceOption.requestType && (dataSourceOption.requestType).toLowerCase() == 'post') {
                        ajaxConfig['type'] = 'POST';
                        ajaxConfig['data'] = dataSourceOption.postData;
                    }
                    contrail.ajaxHandler(ajaxConfig,
                    function(){
                        dataObject.isRequestInProgress = true
                    }, function(data) {
                        dataObject.isRequestInProgress = false;

                        var parsedData = data;
                        if(typeof dataSourceOption.parse !== "undefined"){
                            parsedData = dataSourceOption.parse(data);
                        }
                        self.data('contrailCombobox').setData(parsedData);
                        self.data('contrailCombobox').value(dataObject.cachedValue);
                    });
               } else if(dataSourceOption.type == "local"){
                    formattedData = cowu.formatFormData(dataSourceOption.data, option);
                }
            } else if (self.is('select')) {
                self.children("option").each(function (key, val) {
                    formattedData.push({
                        id: val.value,
                        value: val.innerHTML });
                });
            }

            constructCombobox(self, option, formattedData);

            $.extend(true, dataObject, {
                value: function (value) {
                    if (dataObject.isRequestInProgress == true) {
                        dataObject.cachedValue = value;
                    } else {
                        var text, sourceValue, item4Value;
                        if (!contrail.checkIfExist(value)) {
                            var visibleValue = self.next().find('.custom-combobox-input').val();
                            if(contrail.checkIfExist(self.option.sourceMap[visibleValue])) {
                                sourceValue = self.option.sourceMap[visibleValue];
                                return self.option.source[sourceValue][self.option.dataValueField.apiVar];
                            } else {
                                // User entered a value not present in droplist. So just return the text itself.
                                return visibleValue;
                            }
                        } else {
                            item4Value = this.getItem4Value(value);
                            if(typeof item4Value === 'object') {
                                text = item4Value['value'];
                            } else {
                                text = item4Value;
                            }
                            self.next().find('.custom-combobox-input').val(text);
                        }
                    }
                },
                text: function (text) {
                    if(typeof text === 'undefined'){
                        return self.next().find('.custom-combobox-input').val();
                    } else {
                        self.next().find('.custom-combobox-input').val(text);
                        return true;
                    }
                },
                getSelectedItem: function() {
                    var dataVF = this.value();
                    return this.getItem4Value(dataVF);
                },
                getItem4Value: function(value) {
                    var sourceData = self.option.source,
                        dataValueField = self.option.dataValueField;
                    for (var i = 0 ;i < self.option.source.length; i++){
                        if (sourceData[i][dataValueField.dsVar] === value || sourceData[i][dataValueField.apiVar] === value){
                            return sourceData[i];
                        }
                    }
                    return value;
                },
                setData: function(data) {
                    formattedData = cowu.formatFormData(data, self.option);
                    constructCombobox(self, self.option, formattedData);
                },
                destroy: function(){
                    self.show();
                    self.next('.custom-combobox').find('input').autocomplete('destroy');
                    self.next('.custom-combobox').remove();
                },
                getAllData: function(){
                    return self.option.source;
                },
                enable: function(flag) {
                    var input = self.next('.custom-combobox').find('input');

                    if(flag){
                        input.autocomplete('enable');
                        input.removeAttr('disabled');
                    } else {
                        input.autocomplete('disable');
                        input.attr('disabled','disabled');
                    }
                },
                enableOptionList: function (flag, disableItemList) {
                    for(var i=0; i<disableItemList.length; i++){
                        if(flag == false){
                            if(self.globalDisableList.indexOf(disableItemList[i]) == -1){
                                self.globalDisableList.push(disableItemList[i]);
                            }
                        } else if (flag == true){
                            self.globalDisableList.pop(disableItemList[i]);
                        }
                    }
                },
                isEnabled: function () {
                    var input = self.next('.custom-combobox').find('input');
                    if (input.attr('disabled') == "disabled") {
                        return false;
                    } else {
                        return true;
                    }
                },
                isEnabledOption: function(optionText){
                    var result = self.globalDisableList.indexOf(optionText);
                    if(result === -1)
                        return true;
                    return false;
                },
                hide: function(){
                    self.next('.custom-combobox').hide();
                },
                show: function(){
                    self.next('.custom-combobox').show();
                }
            });

            self.data('contrailCombobox', dataObject);

        }
        return self;

        function getComboboxConfig(customConfig) {
            var option = {
                delay: 500,
                minLength: 0,
                placeholder: "Select...",
                dataTextField: "value",
                dataValueField: "id",
                select: function (e, ui) {
                    self.globalSelect = ui.item;
                }
            };
            $.extend(true, option, customConfig);
            return option;
        }

        function constructCombobox(dis, customConfig, formattedData){
            var wrapper, input,
                config = getComboboxConfig(customConfig),
                wasOpen = null;

            config.source = formattedData;
            dis.option = config;
            dis.globalSelect = {};
            dis.globalDisableList = [];
            dis.hide();
            dis.next('.custom-combobox').find('input').autocomplete('destroy');
            dis.next('.custom-combobox').remove();

            wrapper = $('<div>')
                .addClass( 'custom-combobox input-append ' + dis.attr('class'))
                .insertAfter( dis );

            input = $( "<input>" )
                .addClass('custom-combobox-input col-xs-12')
                .appendTo( wrapper )
                .autocomplete(config)
                .attr('placeholder', config.placeholder)

                // update the combobox when the input is updated to keep both in sync
                .on( "autocompleteselect", function( event, ui ) {
                    dis.val(ui.item.value);
                    dis.trigger('change');
                })
                .on('change', function(event){
                    dis.val($(event.target).val());
                    dis.trigger('change');
                });

            if(contrail.checkIfExist(config.defaultValue)){
                input.val(config.defaultValue);
            }

            input.data("ui-autocomplete")._renderItem = function (ul, item) {
                if(dis.globalDisableList.indexOf(item.label) != -1){
                    return $('<li class="ui-state-disabled">'+item.label+'</li>').appendTo(ul);
                }else{
                    return $("<li>")
                        .append("<a>" + item.label + "</a>")
                        .appendTo(ul);
                }
            };

            input.data("ui-autocomplete")._resizeMenu = function () {
                var ul = this.menu.element;
                if (config.dropdownCssClass) {
                    ul.addClass(config.dropdownCssClass)
                } else {
                    ul.outerWidth(this.element.outerWidth());
                }
            };

            $("<span>")
                .addClass('input-group-addon')
                .appendTo( wrapper )
                .mousedown(function() {
                    wasOpen = input.autocomplete( "widget" ).is( ":visible" );
                })
                .click(function() {
                    input.focus();

                    // Close if already visible
                    if ( wasOpen ) {
                        return;
                    }

                    input.autocomplete( "search", "" );
                })
                .append('<i class="fa fa-caret-down"></i>');
            dis.option.sourceMap = constructSourceMap(formattedData, 'value');
        };
    };

    $.fn.contrail2WayMultiselect = function (givenOptions) {
        var self = this;
        var defaultOptions = {
            dataTextField: "label",
            dataValueField: "value",
            leftTitle: "Left",
            rightTitle: "Right",
            sizeLeft: 8,
            sizeRight: 8,
            controls: {
                single: true,
                all: true
            },
            beforeMoveOneToRight: function() { return true; },
            afterMoveOneToRight: function(){},
            beforeMoveAllToRight: function(){ return true; },
            afterMoveAllToRight: function(){},
            beforeMoveOneToLeft: function(){ return true; },
            afterMoveOneToLeft: function(){},
            beforeMoveAllToLeft: function(){ return true; },
            afterMoveAllToLeft: function(){}
        };
        var options = $.extend({}, defaultOptions, givenOptions);
        constructContrail2WayMultiselect(this, options);

        options = (typeof options === "undefined") ? {} : options;

        var multiselectContainer = {
            lists: {
                left: $(this).find('.multiselect-left'),
                right: $(this).find('.multiselect-right')
            },
            controls: {
                leftAll: $(this).find('.multiselect-control-left-all'),
                leftSelected: $(this).find('.multiselect-control-left-selected'),
                rightAll: $(this).find('.multiselect-control-right-all'),
                rightSelected: $(this).find('.multiselect-control-right-selected')
            }
        };

        function getListData(selector){
            var result = [];
            selector.each(function() {
                var item = {};
                item[options.dataValueField] = $(this).data('value');
                item[options.dataTextField] = $(this).text();
                result.push(item);
            });
            return result;
        }

        function moveLeftToRight(){
            if(options.beforeMoveOneToRight() && !self.find('.contrail2WayMultiselect').hasClass('disabled')){
                var leftSelectedData = getListData(multiselectContainer.lists.left.find('li.ui-selected'));
                self.data('contrail2WayMultiselect').deleteLeftData(leftSelectedData);
                self.data('contrail2WayMultiselect').updateRightData(leftSelectedData);
                options.afterMoveOneToRight();
            }

        }

        function moveRightToLeft(){
            if(options.beforeMoveOneToLeft() && !self.find('.contrail2WayMultiselect').hasClass('disabled')){
                var rightSelectedData = getListData(multiselectContainer.lists.right.find('li.ui-selected'));
                self.data('contrail2WayMultiselect').deleteRightData(rightSelectedData);
                self.data('contrail2WayMultiselect').updateLeftData(rightSelectedData);
                options.afterMoveOneToLeft();
            }
        }

        function moveLeftAll(){
            if(options.beforeMoveAllToRight() && !self.find('.contrail2WayMultiselect').hasClass('disabled')){
                var leftData = getListData(multiselectContainer.lists.left.find('li'));
                self.data('contrail2WayMultiselect').deleteLeftAllData();
                self.data('contrail2WayMultiselect').updateRightData(leftData);
                options.afterMoveAllToRight();
            }
        }

        function moveRightAll(){
            if(options.beforeMoveAllToLeft() && !self.find('.contrail2WayMultiselect').hasClass('disabled')){
                var rightData = getListData(multiselectContainer.lists.right.find('li'));
                self.data('contrail2WayMultiselect').deleteRightAllData();
                self.data('contrail2WayMultiselect').updateLeftData(rightData);
                options.afterMoveAllToLeft();
            }
        }

        multiselectContainer.controls.leftSelected.on('click', function(){
            moveLeftToRight();
        });

        multiselectContainer.controls.rightSelected.on('click', function(){
            moveRightToLeft();
        });

        multiselectContainer.controls.leftAll.on('click', function(){
            moveLeftAll();
        });

        multiselectContainer.controls.rightAll.on('click', function(){
            moveRightAll();
        });

        self.data('contrail2WayMultiselect', {
            getLeftData: function () {
                return getListData(multiselectContainer.lists.left.find('li'));
            },
            getRightData: function () {
                return getListData(multiselectContainer.lists.right.find('li'));
            },
            setLeftData: function (data) {
                this.deleteLeftAllData();
                this.updateLeftData(data);
            },
            setRightData: function (data) {
                this.deleteRightAllData();
                this.updateRightData(data);
            },
            updateLeftData: function (data) {
                $.each(data, function(key,val){
                    $(multiselectContainer.lists.left).append('<li class="ui-widget-content" data-value="' + val[options.dataValueField] + '">' + val[options.dataTextField] + '</li>');
                });
            },
            updateRightData: function (data) {
                $.each(data, function(key,val){
                    $(multiselectContainer.lists.right).append('<li class="ui-widget-content" data-value="' + val[options.dataValueField] + '">' + val[options.dataTextField] + '</li>');
                });
            },
            getLeftSelectedData: function () {
                return getListData(multiselectContainer.lists.left.find('li.ui-selected'));
            },
            getRightSelectedData: function () {
                return getListData(multiselectContainer.lists.right.find('li.ui-selected'));
            },
            deleteLeftData: function (data) {
                $.each(data, function(key,val){
                    $(multiselectContainer.lists.left).find('li[data-value="' + val[options.dataValueField] + '"]').remove();
                });
            },
            deleteLeftAllData: function () {
                multiselectContainer.lists.left.find('li').remove();
            },
            deleteRightData: function (data) {
                $.each(data, function(key,val){
                    $(multiselectContainer.lists.right).find('li[data-value="' + val[options.dataValueField] + '"]').remove();
                });
            },
            deleteRightAllData: function () {
                multiselectContainer.lists.right.find('li').remove();
            },
            show: function () {
                self.find('.contrail2WayMultiselect').show();
            },
            hide: function () {
                self.find('.contrail2WayMultiselect').hide();
            },
            disable: function () {
                self.find('.contrail2WayMultiselect').addClass('disabled');
                self.find('.multiselect-list').selectable('disable');
            },
            enable: function () {
                self.find('.contrail2WayMultiselect').removeClass('disabled');
                self.find('.multiselect-list').selectable('enable');
            },
            destroy: function(){
                self.find('.multiselect-list').selectable('destroy');
                self.html('');
            }
        });
        function constructContrail2WayMultiselect(self, options){
            self.html('<div class="contrail2WayMultiselect row-fluid">\
                <div class="col-xs-5">\
                    <label>'+options.leftTitle+'</label>\
                    <ol class="row-fluid multiselect-left multiselect-list" style="height:'+(options.sizeLeft * 30).toString()+'px;"></ol>\
                </div>\
                <div class="col-xs-2 multiselect-controls">\
                    ' + ((options.controls.single) ? '<div class="row-fluid multiselect-control"><i title="Move to Left" class="multiselect-control-left-selected fa fa-angle-right"></i></div>\
                    <div class="row-fluid multiselect-control"><i title="Move to Right" class="multiselect-control-right-selected fa fa-angle-left"></i></div>' : '') + '\
                    ' + ((options.controls.all) ? '<div class="row-fluid multiselect-control"><i title="Move to Left" class="multiselect-control-left-all fa fa-angle-double-right"></i></div>\
                    <div class="row-fluid multiselect-control"><i title="Move to Right" class="multiselect-control-right-all fa fa-angle-double-left"></i></div>' : '') + '\
                </div>\
                <div class="col-xs-5">\
                     <label>'+options.rightTitle+'</label>\
                     <ol class="row-fluid multiselect-right multiselect-list" style="height:'+(options.sizeRight * 30).toString()+'px;"></ol>\
                </div>\
            </div>');

            self.find('.multiselect-list').selectable();
        };
    };

    $.fn.contrailWizard = function (config) {
        var defaultConfig = {
            enableStepJump: false
        };

        config = $.extend(true, {}, config, defaultConfig);

        var self = this,
            steps = config.steps,
            stepsInitFlag = [];

        self.addClass('contrailWizard');

        for (var i = 0 ; i < steps.length ; i++){
            stepsInitFlag.push(false);
        }

        config.onInit = function (event, currentIndex) {
            var onInitCompleteCBCalled = false,
                onInitCompleteCB = function(currentStep, config) {
                    if (contrail.checkIfFunction(currentStep.onLoadFromPrevious)) {
                        currentStep.onLoadFromPrevious(config.params);
                    }
                    if (contrail.checkIfFunction(currentStep.onLoadFromNext)) {
                        currentStep.onLoadFromNext(config.params);
                    }
                    configureButton(currentStep.buttons);
                };

            $.each(steps, function(stepKey, stepValue){
                if (contrail.checkIfFunction(stepValue.onInitWizard)) {
                    stepValue.onInitWizard(config.params, function() {
                        onInitCompleteCB(stepValue, config);
                    });
                    onInitCompleteCBCalled = true;
                    stepsInitFlag[stepKey] = true;
                }
            });

            if (!stepsInitFlag[currentIndex]) {
                if (contrail.checkIfFunction(steps[currentIndex].onInitFromPrevious)) {
                    steps[currentIndex].onInitFromPrevious(config.params, function() {
                        onInitCompleteCB(steps[currentIndex], config);
                    });
                    onInitCompleteCBCalled = true;
                }
                else if(contrail.checkIfFunction(steps[currentIndex].onInitFromNext)) {
                    steps[currentIndex].onInitFromNext(config.params, function() {
                        onInitCompleteCB(steps[currentIndex], config);
                    });
                    onInitCompleteCBCalled = true;
                }
                stepsInitFlag[currentIndex] = true;
            }

            if (!onInitCompleteCBCalled) {
                onInitCompleteCB(steps[currentIndex], config)
            }

        };

        config.onStepChanged = function(event, currentIndex, priorIndex) {
            var currentStepLiElement = self.find('.steps').find('li:eq(' + currentIndex + ')'),
                onInitCompleteCBCalled = false,
                onInitCompleteCB = function(currentStep, config) {
                    if (currentIndex > priorIndex && contrail.checkIfFunction(currentStep.onLoadFromNext)) {
                        currentStep.onLoadFromNext(config.params);
                    }
                    else if (currentIndex < priorIndex && contrail.checkIfFunction(currentStep.onLoadFromPrevious)) {
                        currentStep.onLoadFromPrevious(config.params);
                    }
                    configureButton(currentStep.buttons);
                };

            if (currentIndex < priorIndex) {
                self.find('.steps').find('li:eq(' + priorIndex + ')').removeClass('done');
                currentStepLiElement.removeClass('completed');
            }
            else if(currentIndex > priorIndex) {

                if(!currentStepLiElement.hasClass('subStep')) {
                    currentStepLiElement = self.find('.steps').find('li.done').addClass('completed')
                }
            }

            if(!stepsInitFlag[currentIndex]) {
                if (currentIndex > priorIndex && contrail.checkIfFunction(steps[currentIndex].onInitFromNext)) {
                    steps[currentIndex].onInitFromNext(config.params, function() {
                        onInitCompleteCB(steps[currentIndex], config)
                    });
                    onInitCompleteCBCalled = true;
                }
                else if(currentIndex < priorIndex && contrail.checkIfFunction(steps[currentIndex].onInitFromPrevious)) {
                    steps[currentIndex].onInitFromPrevious(config.params, function() {
                        onInitCompleteCB(steps[currentIndex], config)
                    });
                    onInitCompleteCBCalled = true;
                }
                stepsInitFlag[currentIndex] = true;
            }

            if(!onInitCompleteCBCalled) {
                onInitCompleteCB(steps[currentIndex], config)
            }

        };

        config.onStepChanging = function (event, currentIndex, newIndex) {

            if (Math.abs(currentIndex - newIndex) != 1 && !config.enableStepJump) {
                return false;
            }
            var returnFlag = true;
            // Next Button clicked
            if(currentIndex < newIndex && contrail.checkIfFunction(steps[currentIndex].onNext)) {
                returnFlag = steps[currentIndex].onNext(config.params);
            }
            // Previous Button Clicked
            else if(currentIndex > newIndex && contrail.checkIfFunction(steps[currentIndex].onPrevious)) {
                returnFlag = steps[currentIndex].onPrevious(config.params);
            }

            if(returnFlag) {
                self.find('.steps').find('li:eq(' + newIndex + ')').removeClass('completed');
            }
            return returnFlag;
        };

        config.onFinished = function (event, currentIndex) {
            steps[currentIndex].onNext(config.params);
        };

        self.steps(config);

        self.find('.actions').find('a').addClass('btn btn-mini');
        self.find('.actions').find('a[href="#next"]').addClass('btn-primary');
        self.find('.actions').find('a[href="#finish"]').addClass('btn-primary');

        $('.wizard > .steps > ul > li').css({
            'max-width': (100/steps.length) + '%'
        });

        var stepIndex = 0;
        $('.wizard > .steps ul li').each(function(key, value){
            if(steps[key].stepType == 'sub-step'){
                $(this).addClass('subStep');
                $(this).find('.number').text('');
                $(this).find('.title').text('');

            }
            else {
                $(this).find('.number').text(++stepIndex);
            }
        });

        function configureButton(buttons){
            self.find('.actions').find('a').parent('li[aria-hidden!="true"]').show();
            if(contrail.checkIfExist(buttons)) {
                $.each(buttons, function (buttonKey, buttonValue) {
                    if (buttonValue.visible === false) {
                        self.find('.actions').find('a[href="#' + buttonKey + '"]').parent('li').hide();
                    }
                    if (contrail.checkIfExist(buttonValue.label)) {
                        self.find('.actions').find('a[href="#' + buttonKey + '"]').empty().append(buttonValue.label);
                    }
                });
            }
        }

        self.data('contrailWizard', $.extend(true, {}, getDefaultStepsMethods(), {
            'getStepsLength': function() {
                return steps.length;
            }
        }));

        function getDefaultStepsMethods() {
            var methodObj = {},
                defaultMethods = ['getCurrentStep', 'getCurrentIndex', 'next', 'previous', 'finish', 'destroy', 'skip'];

            $.each(defaultMethods, function (defaultMethodKey, defaultMethodValue) {
                methodObj[defaultMethodValue] = function () {
                    return self.steps(defaultMethodValue);
                };
            });

            return methodObj;
        }
    };

    $.fn.contrailCheckedMultiselect = function (config) {
        var self = this,
            parse = contrail.checkIfFunction(config.parse) ? config.parse: null;

        self.prop('id',config.elementId);
        config.dataTextField = {dsVar: config.dataTextField, apiVar: 'text'};
        config.dataValueField = {dsVar: config.dataValueField, apiVar: 'id'};

        var defaultConfig = {
                dataTextField : 'text',
                dataValueField: 'id',
                //header: false,
                minWidth: 'auto',
                control: false,
                selectedList: 3,
                tristate: false,
                emptyOptionText: 'No option found.',
                position: {
                    my: 'left top',
                    at: 'left bottom'
                }
            },
            defaultFilterConfig = {
                label: false
            },
            config = $.extend(true, defaultConfig, config),
            defaultFilterConfig = $.extend(true, defaultFilterConfig, config.filterConfig),
            template = null, preChecked = [],
            multiSelectMenu = null;

        if(config.tristate) {
            config.optgrouptoggle = function(event, ui) {
                multiSelectMenu.find('input[type="checkbox"]').tristate('state', ui.checked);
            }
        }

        function constructCheckedMultiselect (config, defaultFilterConfig) {
            template = contrail.getTemplate4Id('checked-multiselect-optgroup-template');
            $(self).find('select').remove();
            $(self).find('button').remove();
            $(self).append(template(config));

            if (config.data.length == 0) {
                config.height = 'auto';
            }

            var multiselect = self.find('select').multiselect(config).multiselectfilter(defaultFilterConfig);
            preChecked = self.find('select').multiselect('getChecked');

            multiSelectMenu = self.find('select').multiselect("widget");

            if (config.data.length == 0) {
                multiSelectMenu.append('<p class="padding-0-0-5 margin-0-5">'+ config.emptyOptionText + '</p>')
            }

            if(config.tristate){
                multiSelectMenu.find('input[type="checkbox"]').tristate({state: null}).addClass('ace-input-tristate');
            } else {
                multiSelectMenu.find('input[type="checkbox"]').addClass('ace-input');
            }
            multiSelectMenu.find('input[type="checkbox"]').next('span').addClass('ace-lbl');

            multiSelectMenu.find('input[type="checkbox"]').each(function(){
                $(this).next('span').attr('title', $(this).attr('title'));
            });

            /*
             * Appending controls and related events
             */
            if(config.control != false) {
                var msControls = $('<div class="row-fluid ui-multiselect-controls""></div>');

                $.each(config.control, function(controlKey, controlValue) {
                    var btn = $('<button class="btn btn-mini ' + (contrail.checkIfExist(controlValue.cssClass) ? controlValue.cssClass : '') +
                        ' pull-right ui-multiselect-control-apply">' + controlValue.label + '</button>');
                    msControls.append(btn);

                    if (contrail.checkIfFunction(controlValue.click)) {
                        btn.on('click', function () {
                            var checkedRows = [];
                            if(config.tristate){
                                checkedRows = multiSelectMenu.find('input[type="checkbox"]:determinate');
                            } else {
                                checkedRows = self.find('select').multiselect('getChecked');
                            }
                            controlValue.click(self, checkedRows);
                            self.find('select').multiselect('close');
                        })
                    }
                });

                multiSelectMenu.append(msControls);
            }

            var closeFn = function(event) {
                var positionTop = multiSelectMenu.position().top,
                    scrollTop = $(this).scrollTop();

                if (multiSelectMenu.is(':visible') && (positionTop - scrollTop) < 40) {
                    self.find('select').multiselect('close');
                }
            };

            $(window)
                .off('scroll', closeFn)
                .on('scroll', closeFn);



            self.data('contrailCheckedMultiselect', $.extend(true, getDefaultMultiselectMethods(), {
                getPreChecked: function () {
                    return preChecked;
                },
                setChecked: function (checkedElements) {
                    this.uncheckAll();
                    $.each(checkedElements, function (elementKey, elementValue) {
                        $(elementValue).click();
                    });
                },
                setCheckedState: function (state) {
                    this.uncheckAll();
                    if(config.tristate) {
                        if (typeof state === "boolean" || state == null) {
                            multiSelectMenu.find('input[type="checkbox"]').tristate('state', state)
                        } else if (typeof state === "object") {
                            $.each(state, function (stateKey, stateValue) {
                                $(multiSelectMenu.find('input[type="checkbox"]')[stateKey]).tristate('state', stateValue);
                            });
                        }
                    } else {
                        if(typeof state === "boolean" && state) {
                            this.checkAll();
                        }
                        //TODO handle else if typeof state === object
                    }
                },
                refresh: function () {
                    this.destroy();
                    initCheckedMultiselect(config, defaultFilterConfig);
                }
            }));
        };

        function initCheckedMultiselect (config, defaultFilterConfig) {
            if(contrail.checkIfExist(config.dataSource)){
                contrail.ajaxHandler(config.dataSource, null, function (response){
                    if(!contrail.checkIfExist(response)){
                        throw "Error getting data from server";
                    }
                    var parsedData = (contrail.checkIfFunction(parse)) ? parse(response) : response;
                    config.data = cowu.formatFormData(parsedData, config);
                    constructCheckedMultiselect(config, defaultFilterConfig);
                });
            } else {
                constructCheckedMultiselect(config, defaultFilterConfig);
            }
        }

        if (contrail.checkIfExist(config.data)) {
            config.data = cowu.formatFormData((contrail.checkIfFunction(parse)) ? parse(config.data) : config.data, config);
        }

        if (!contrail.checkIfExist(self.data('contrailCheckedMultiselect'))) {
            initCheckedMultiselect(config, defaultFilterConfig);
        }
        else {
            self.find('select').multiselect(config);
        }

        function getDefaultMultiselectMethods () {
            var methodObj = {},
                defaultMethods = ['open', 'refresh', 'uncheckAll', 'getChecked', 'disable', 'enable', 'destroy'];

            $.each(defaultMethods, function (defaultMethodKey, defaultMethodValue) {
                methodObj[defaultMethodValue] = function () {
                    return self.find('select').multiselect(defaultMethodValue);
                };
            });

            return methodObj;
        }
    };

    $.extend({
        contrailBootstrapModal:function (options) {
            var keyupAction = $.extend(true, {}, {
                onKeyupEnter: null,
                onKeyupEsc: null
            }, options.keyupAction);

            options.id = options.id != undefined ? options.id : '';
            var className = (options.className == null) ? '' : options.className;

            var modalHTML = '<div id="' + options.id + '" class="modal fade contrail-modal ' + className + '" tabindex="-1" role="dialog" aria-hidden="true"> \
                <div class="modal-dialog" role="document">\
                    <div class="modal-content">\
                        <div class="modal-header"> \
                            <button id="modal-header-close" type="button" class="close"><i class="fa fa-remove"></i></button> \
                            <h6 class="modal-header-title"></h6> \
                        </div> \
                        <div class="modal-body"></div> \
                        <div class="modal-footer"></div> \
                    </div> \
                </div>\
        	</div> ';

            $('.modal-backdrop').remove();
            $('#' + options.id).remove();
            $('body').prepend(modalHTML);

            if(options.closeClickAction != null) {
                $('#modal-header-close').on('click', function() {
                    if(typeof options.closeClickAction === 'function'){
                        options.closeClickAction(options.closeClickParams);
                    }
                    else if(typeof options.closeClickAction === 'string'){
                        window[options.closeClickAction](options.closeClickParams);
                    }
                });
            } else {
                $('#modal-header-close').attr('data-dismiss', 'modal');
                $('#modal-header-close').attr('aria-hidden', 'true');
            }
            var modalId = $('#' + options.id);

            modalId.find('.modal-header-title').empty().append(options.title != undefined ? options.title : '&nbsp;');
            modalId.find('.modal-body').empty().append(options.body);

            if(options.footer != false) {
                $.each(options.footer, function (key, footerButton) {
                    function performFooterBtnClick(footerButton) {
                        if (typeof footerButton.onclick === 'function') {
                            footerButton.onclick(footerButton.onClickParams);
                        }
                        else if (footerButton.onclick != 'close' && typeof footerButton.onclick === 'string') {
                            window[footerButton.onclick](footerButton.onClickParams);
                        }
                    }

                    var btnId = (footerButton.id != undefined && footerButton.id != '') ? footerButton.id : options.id + 'btn' + key,
                        btn = '<button id="' + btnId + '" class="btn btn-mini ' + ((footerButton.className != undefined && footerButton.className != '') ? footerButton.className : '') + '"'
                            + ((footerButton.onclick === 'close') ? ' data-dismiss="modal" aria-hidden="true"' : '') + '>'
                            + ((footerButton.title != undefined) ? footerButton.title : '') + '</button>';

                    modalId.find('.modal-footer').append(btn);
                    $('#' + btnId).on('click', function () {
                        performFooterBtnClick(footerButton);
                    });

                    if (!contrail.checkIfFunction(keyupAction.onKeyupEnter) && footerButton.onKeyupEnter) {
                        keyupAction.onKeyupEnter = function () { performFooterBtnClick(footerButton); };
                    } else if (!contrail.checkIfFunction(keyupAction.onKeyupEsc) && footerButton.onKeyupEsc) {
                        keyupAction.onKeyupEsc = function () { performFooterBtnClick(footerButton); };
                    }
                });
            }
            else {
                modalId.find('.modal-footer').remove();
            }
            modalId.modal({backdrop:'static', keyboard: false});

            modalId.offset({left: ($(document).width() - modalId.width()) / 2, top: $(document).scrollTop() + 50});

            modalId.find('.modal-content')
                .draggable({
                    handle: ".modal-header",
                    containment: modalId,
                    cursor: 'move'
                });

            if (contrail.checkIfFunction(keyupAction.onKeyupEnter) || contrail.checkIfFunction(keyupAction.onKeyupEsc)) {
                modalId
                    .off('keyup')
                    .on('keyup', function(event) {
                        var code = event.which; // recommended to use e.which, it's normalized across browsers
                        if (code == 13) {
                            event.preventDefault();
                        }

                        if (modalId.prop('id') === $(event.target).prop('id')) {
                            if (contrail.checkIfFunction(keyupAction.onKeyupEnter) && code == 13) {
                                keyupAction.onKeyupEnter();
                            } else if (contrail.checkIfFunction(keyupAction.onKeyupEsc) && code == 27) {
                                keyupAction.onKeyupEsc();
                            }
                        }
                    });
            }
        }
    });

    $.extend({
        contrailBootstrapPopover:function (options) {
            var keyupAction = $.extend(true, {}, {
                onKeyupEnter: null,
                onKeyupEsc: null
            }, options.keyupAction);

            options.id = options.id != undefined ? options.id : '';
            var className = (options.className == null) ? '' :
                options.className;
            var modalHTML = '<div id="' + options.id + '" class="modal fade contrail-modal ' + className + '" tabindex="-1" role="dialog" aria-hidden="true"> \
                <div class="modal-dialog modal-popover" role="document">\
                    <div class="modal-content">\
                        <div class="modal-header"> \
                            <div class="modal-footer"></div> \
                            <h6 class="modal-header-title"></h6> \
                        </div> \
                        <div class="modal-body"></div> \
                    </div> \
                </div>\
            </div> ';

            //$('.modal-backdrop').remove();
            $('#' + options.id).remove();
            $('body').prepend(modalHTML);

            if(options.closeClickAction != null) {
                $('#modal-header-close').on('click', function() {
                    if(typeof options.closeClickAction === 'function'){
                        options.closeClickAction(options.closeClickParams);
                    }
                    else if(typeof options.closeClickAction === 'string'){
                        window[options.closeClickAction](options.closeClickParams);
                    }
                });
            } else {
                $('#modal-header-close').attr('data-dismiss', 'modal');
                $('#modal-header-close').attr('aria-hidden', 'true');
            }
            var modalId = $('#' + options.id);

            modalId.find('.modal-header-title').empty().append(options.title != undefined ? options.title : '&nbsp;');
            modalId.find('.modal-body').empty().append(options.body);

            if(options.actions != false) {
                $.each(options.actions, function (key, action) {
                    function performFooterBtnClick(action) {
                        if (typeof action.onclick === 'function') {
                            action.onclick();
                        }
                    }

                    var iconId = (action.id != undefined && action.id != '') ? action.id : options.id + 'icon' + key,
                        icon = '<a id="' + iconId + '" class="margin-right-10"><i class="' +
                        (action.id == 'save' ? 'fa fa-check' : 'fa fa-close') + '"></i></a>';

                    modalId.find('.modal-footer').append(icon);
                    $('#' + iconId).on('click', function () {
                        performFooterBtnClick(action);
                    });

                    if (!contrail.checkIfFunction(keyupAction.onKeyupEnter) && action.onKeyupEnter) {
                        keyupAction.onKeyupEnter = function () { performFooterBtnClick(action); };
                    } else if (!contrail.checkIfFunction(keyupAction.onKeyupEsc) && action.onKeyupEsc) {
                        keyupAction.onKeyupEsc = function () { performFooterBtnClick(action); };
                    }
                });
            }
            else {
                modalId.find('.modal-footer').remove();
            }

            var targetOffset = $(options['targetId']).offset(),
                calTop, calLeft;

            if(targetOffset) {
                calTop = targetOffset.top + 37;
                calLeft = targetOffset.left - 250;
            }

            modalId.offset({left: calLeft, top: calTop});
            modalId.modal({backdrop: false, keyboard: false})
            .on('click', function(event){
                if($(event.target).attr("class") != "fa fa-close" &&
                        $(event.target).attr("class") != "fa fa-check") {
                    event.stopPropagation();
                }
            });

            if (contrail.checkIfFunction(keyupAction.onKeyupEnter) || contrail.checkIfFunction(keyupAction.onKeyupEsc)) {
                modalId
                    .off('keyup')
                    .on('keyup', function(event) {
                        var code = event.which; // recommended to use e.which, it's normalized across browsers
                        if (code == 13) {
                            event.preventDefault();
                        }

                        if (modalId.prop('id') === $(event.target).prop('id')) {
                            if (contrail.checkIfFunction(keyupAction.onKeyupEnter) && code == 13) {
                                keyupAction.onKeyupEnter();
                            } else if (contrail.checkIfFunction(keyupAction.onKeyupEsc) && code == 27) {
                                keyupAction.onKeyupEsc();
                            }
                        }
                    });
            }
        }
    });

    // //Formatting data as an array of strings.
    // function formatData(data, option) {
    //     var formattedData = [];
    //     if (typeof data[0] === 'object') {
    //         if (typeof option.dataValueField !== 'undefined' && typeof option.dataTextField !== 'undefined') {
    //             $.each(data, function (key, val) {
    //                 if ('children' in val){
    //                     formatData(val.children, option);
    //                 }
    //                 data[key][option.dataValueField.apiVar] = val[option.dataValueField.dsVar];
    //                 data[key][option.dataTextField.apiVar] = val[option.dataTextField.dsVar];
    //             });
    //         }
    //     } else {
    //         $.each(data, function (key, val) {
    //             formattedData.push({
    //                 id: val,
    //                 value: String(val),
    //                 text: String(val)
    //             });
    //         });
    //         data = formattedData;
    //     }
    //     return data;
    // };

    function constructSourceMap(data, fieldName) {
        return traverseMap(typeof data != 'undefined' ? data : [],fieldName,'');
    };

    function traverseMap(obj, fieldName, parentKey){
        var returnObj = {};
        $.each(obj, function (key, val) {
            returnObj[val[fieldName]] = parentKey + key;
            if('children' in val){
                returnObj = $.extend(returnObj,traverseMap(val.children, fieldName, parentKey + key + '.'));
            }
        });
        return returnObj;
    };
    function findTextInObj(text, data){
        var found = false;
        for (var i = 0; i < data.length; i++){
            if (data[i].text === text){
                return data[i];
            }
            if('children' in data[i]){
                var found = findTextInObj(text, data[i].children);
                if(found){
                    break;
                }
            }
        }
        return found;
    };

    function  fetchSourceMapData(index, data){
        var arr = index.split("."),
            returnVal = data;

        $.each(arr, function(key, value){
            if('children' in returnVal){
                returnVal = returnVal.children[value];
            } else{
                returnVal = returnVal[value];
            }
        });
        return returnVal;
    };

    function constructSelect2(self, customConfig, args) {
        if(typeof args !== 'undefined') {
            self.select2(customConfig, args);
        } else{
            var dataObject = {
                    cachedValue: null,
                    isRequestInProgress: false
                },
                config = {},
                defaultConfig = {
                    minimumResultsForSearch : 7,
                    dropdownAutoWidth : false,
                    dataTextField: 'text',
                    dataValueField: 'id',
                    data: [],
                    query: function (q) {
                        if(q.term != null){
                            var pageSize = 50;
                            var results = _.filter(this.data,
                                function(e) {
                                    return (q.term == ""  || e.text.toUpperCase().indexOf(q.term.toUpperCase()) >= 0 );
                                });
                            q.callback({results:results.slice((q.page-1)*pageSize, q.page*pageSize),
                                more:results.length >= q.page*pageSize });
                        } else {
                            var t = q.term,filtered = { results: [] }, process;
                            process = function(datum, collection) {
                                var group, attr;
                                datum = datum[0];
                                if (datum.children) {
                                    group = {};
                                    for (attr in datum) {
                                        if (datum.hasOwnProperty(attr)) group[attr]=datum[attr];
                                    }
                                    group.children=[];
                                    $(datum.children).each2(function(i, childDatum) { process(childDatum, group.children); });
                                    if (group.children.length || q.matcher(t, '', datum)) {
                                        collection.push(group);
                                    }
                                } else {
                                    if (q.matcher(t, '', datum)) {
                                        collection.push(datum);
                                    }
                                }
                            };
                            if(t != ""){
                                $(this.data).each2(function(i, datum) { process(datum, filtered.results); })
                            }
                            q.callback({results:this.data});
                        }
                    },
                    formatResultCssClass: function(obj){
                        if(obj.label && 'children' in obj){
                            return 'select2-result-label';
                        }
                    }

                    // Use dropdownCssClass : 'select2-large-width' when initialzing ContrailDropDown
                    // to specify width of dropdown for Contrail Dropdown
                    // Adding a custom CSS class is also possible. Just add a custom class to the contrail.custom.css file
                },
                source = [];

            //To add newly entered text to the option of multiselect.
            if (customConfig.multiple == true && customConfig.tags != null && customConfig.tags == true) {
                customConfig['createSearchChoice'] = function (term,data) {
                    return {
                        id: $.trim(term),
                        text: $.trim(term)
                    };
                }
                customConfig['tags'] = true;
                customConfig['tokenSeparators'] = [","];
                customConfig['initSelection'] = function (element, callback) {
                    var data = [];

                    function splitVal(string, separator) {
                        var val, i, l;
                        if (string === null || string.length < 1) return [];
                        val = string.split(separator);
                        for (i = 0, l = val.length; i < l; i = i + 1) val[i] = $.trim(val[i]);
                        return val;
                    }

                    $(splitVal(element.val(), ",")).each(function () {
                        data.push({
                            id: this,
                            text: this
                        });
                    });

                    callback(data);
                };
            }

            if (customConfig.showParentInSelection){
                customConfig['formatSelection'] = function (object) {
                    var allData = this.data;
                    var parent = '';
                    //find the parent
                    for (var i = 0 ; i < allData.length; i++) {
                        if (allData[i].children && allData[i].children.length > 0){
                            var children = allData[i]['children'];
                            if (object['parent'] != null && object['parent'] == children[0]['parent']) {
                                for (var j = 0 ;j < children.length; j++) {
                                    if (object[this.dataValueField.dsVar] == children[j][this.dataValueField.dsVar]) {
                                        parent = allData[i][this.dataTextField.dsVar];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    return (parent != '')?'<span style="font-weight:600">'+ parent + '</span>' + ' : '  + object.text : object.text;
                }
            }

            if (contrail.checkIfExist(customConfig.dropdownCssClass)) {
                customConfig.dropdownAutoWidth = true;
            }

            $.extend(true, config, defaultConfig, customConfig);
            config.dataTextField = {dsVar: config.dataTextField, apiVar: 'text'};
            config.dataValueField = {dsVar: config.dataValueField, apiVar: 'id'};

            var changeFunction = function(e) {
                if (contrail.checkIfFunction(config.change)) {
                    config.change(e);
                }
            };
            //subcribe to popup open and close events
            var openFunction = function() {
                if (contrail.checkIfFunction(config.open)) {
                    config.open();
                }
            };

            var closeFunction = function() {
                if (contrail.checkIfFunction(config.close)) {
                    config.close();
                }
            };

            var selectingFunction = function(e) {
                if (contrail.checkIfFunction(config.selecting)) {
                    config.selecting(e);
                }
            };

            function initSelect2(option, value, triggerChange) {
                var triggerChange = contrail.checkIfExist(triggerChange) ? triggerChange : false;

                option.data = cowu.formatFormData(option.data, option);

                if (contrail.checkIfExist(self.data('select2'))) {
                    self.select2('destroy');
                }

                self.select2(option)
                    .off("change", changeFunction)
                    .on("change", changeFunction)
                    .off("select2-selecting", selectingFunction)
                    .on("select2-selecting", selectingFunction)
                    .off("select2-open", openFunction)
                    .on("select2-open", openFunction)
                    .off("select2-close", closeFunction)
                    .on("select2-close", closeFunction);

                option.sourceMap = constructSourceMap(option.data, 'id');

                if (option.data.length > 0) {
                    if (contrail.checkIfExist(option.multiple)) {
                        // set value for Multiselect
                        if (contrail.checkIfExist(value)){
                            self.select2('val', value, triggerChange);
                        }
                    } else {

                        // set value for Dropdown
                        if (contrail.checkIfExist(value) && value !== '' && contrail.checkIfExist(option.sourceMap[value])) {
                            self.select2('val', value, triggerChange);
                        } else if (contrail.checkIfExist(option.defaultValueId) &&
                            option.defaultValueId >= 0 && option.data.length > option.defaultValueId) {

                            // set default value
                            var selectedOption = option.data[option.defaultValueId];
                            if (contrail.checkIfExist(option.data[0].children) && option.data[0].children.length > 1) {
                                selectedOption = option.data[0].children[option.defaultValueId];
                            }

                            self.select2('val', selectedOption[option.dataValueField.dsVar], triggerChange);
                        }
                    }
                }

            }

            if(!$.isEmptyObject(config) && contrail.checkIfExist(config.dataSource)) {
                var dataSourceOption = config.dataSource;
                if(dataSourceOption.type == "remote"){
                    var ajaxConfig = {
                        url: dataSourceOption.url,
                        //async: contrail.checkIfExist(dataSourceOption.async) ? dataSourceOption.async : false,
                        dataType: contrail.checkIfExist(dataSourceOption.dataType) ? dataSourceOption.dataType : 'json'
                    };
                    if(dataSourceOption.contentType) {
                        ajaxConfig['contentType'] = dataSourceOption.contentType;
                    }
                    if(dataSourceOption.timeout) {
                        ajaxConfig['timeout'] = dataSourceOption.timeout;
                    }
                    if(dataSourceOption.requestType && (dataSourceOption.requestType).toLowerCase() == 'post') {
                        ajaxConfig['type'] = 'POST';
                        ajaxConfig['data'] = dataSourceOption.postData;
                    }

                    contrail.ajaxHandler(ajaxConfig, function(){
                        dataObject.isRequestInProgress = true
                    }, function(data) {
                        dataObject.isRequestInProgress = false;

                        if(typeof dataSourceOption.parse !== "undefined"){
                            data = dataSourceOption.parse(data);
                        }

                        dataObject.setData(data, dataObject.cachedValue, true);
                    });

                } else if(dataSourceOption.type == "local"){
                    source = cowu.formatFormData(dataSourceOption.data, config);
                }
                config.data = source;
            }
            if (contrail.checkIfExist(config.data)) {
                initSelect2(config);
            }

            $.extend(true, dataObject, {
                getAllData: function(){
                    if(self.data('select2') != null)
                        return self.data('select2').opts.data;
                },
                getSelectedData: function() {
                    var selectedValue = self.select2('val'),
                        selectedObjects = [], index;
                    if (selectedValue == null) {
                        selectedValue = [];
                    } else if (!(selectedValue instanceof Array)) {
                        selectedValue = [selectedValue];
                    }
                    for(var i = 0; i < selectedValue.length; i++) {
                        index = config.sourceMap[selectedValue[i]];
                        selectedObjects.push(fetchSourceMapData(index, config.data));
                    }
                    return selectedObjects;
                },
                text: function(text) {
                    if(typeof text !== 'undefined') {
                        var data = self.data('select2').opts.data;
                        var answer = findTextInObj(text, data);
                        self.select2('val', answer.id);
                    } else {
                        if(self.select2('data') != null && typeof self.select2('data').length !== 'undefined' && self.select2('data').length > 0){
                            var result = [];
                            for(var i=0; i< self.select2('data').length; i++){
                                result.push(self.select2('data')[i].text);
                            }
                            return result;
                        }
                        if (self.select2('data') != null){
                            return (self.select2('data') != null) ? self.select2('data').text : null;
                        }
                    }
                },
                value: function(value, triggerChange) {
                    if (contrail.checkIfExist(value)) {
                        if (dataObject.isRequestInProgress == true) {
                            dataObject.cachedValue = value;
                        }
                        self.select2('val', value, (contrail.checkIfExist(triggerChange) ? triggerChange : false));
                    } else {
                        return self.select2('val');
                    }
                },
                setData: function(data, value, triggerChange) {
                    if(dataObject.isRequestInProgress == true && contrail.checkIfExist(value)) {
                        dataObject.cachedValue = value;
                    }

                    config.data = data;
                    initSelect2(config, value, triggerChange)
                },
                enableOptionList: function (flag, disableItemList) {
                    for (var j = 0; j < disableItemList.length; j++) {
                        for (var i = 0; i < config.data.length; i++) {
                            if(config.data[i].children === undefined) {
                                if (disableItemList[j] === config.data[i][config.dataValueField.dsVar]) {
                                    config.data[i].disabled = !flag;
                                }
                            } else {
                                for(var k = 0;k < config.data[i].children.length; k++) {
                                    if(disableItemList[j] === config.data[i].children[k][config.dataValueField.dsVar]) {
                                        config.data[i].children[k].disabled = !flag;
                                    }
                                }
                            }
                        }
                    }
                    self.select2('destroy');
                    self.select2(config);
                    self.select2('val', "");
                },
                enable: function(flag){
                    self.select2("enable", flag);
                },
                isEnabled: function(){
                    if($(self.selector).prop('disabled')){
                        return false;
                    }else{
                        return true;
                    }
                },
                isEnabledOption: function (optionText) {
                    for (var i = 0; i < config.data.length; i++) {
                        if (config.data[i].text === optionText) {
                            if (config.data[i].disabled) {
                                return false;
                            }
                        }
                    }
                    return true;
                },
                destroy: function(){
                    self.off("change", changeFunction)
                        .select2('destroy');
                },
                hide: function() {
                    self.select2("container").hide();
                },
                show: function() {
                    self.select2("container").show();
                }
            });

            return dataObject;
        }
    }

});
