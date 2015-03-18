/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
(function($) {
    $.ui.tabs.prototype._tabKeydown = function(event){
        return;
    };

    $.fn.contrailAutoComplete = function(option){
        var self = this;
        option = (typeof option === "undefined") ? {} : option;
        self.autocomplete(option);
        return self;
    };
    
    $.fn.contrailMultiselect = function(option,option2){
        var self = this;
        option.multiple = true;
        self.data('contrailMultiselect', constructSelect2(self, option, option2));
        return self;
    };
    
    $.fn.contrailTabs = function(option) {
        var self = this;
        option = (typeof option === "undefined") ? {} : option;
        self.tabs(option);
        self.data('contrailTabs', {
        	startLoading: function(selectedTabLinkId){
        		$(selectedTabLinkId).prepend('<i class="icon-spinner icon-spin contrail-tabs-loading"></i>');
        	},
        	endLoading: function(selectedTabLinkId){
        		$(selectedTabLinkId).find('.contrail-tabs-loading').remove();
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
            }
        });
        return self;
    };
    
    $.fn.contrailDateTimePicker = function(option) {
        var self = this;
        option = (typeof option === "undefined") ? {} : option;

        option.formatDate = 'M d, Y';
        option.formatTime = 'h:i:s A';
        option.format = 'M d, Y h:i:s A';
        option.step = 10;

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
                self.val(moment(dateTime).format('MMM DD, YYYY hh:mm:ss A'));
            }
        });
        return self;
    };
    
    $.fn.contrailDropdown = function(defaultOption, args) {
        var self = this;
        self.data('contrailDropdown', constructSelect2(self, defaultOption, args));
        return self;
    };
    
    $.fn.contrailCombobox = function(option) {
        var self = this, formattedData = [],
            asyncVal = false;

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
                if(option.dataSource.type == "remote"){
                    if(contrail.checkIfExist(option.dataSource.async)){
                        asyncVal =  option.dataSource.async;
                    }
                    $.ajax({
                        url: option.dataSource.url,
                        dataType: "json",
                        async: asyncVal,
                        success: function( data ) {
                            if(typeof option.dataSource.parse !== "undefined"){
                                var parsedData = option.dataSource.parse(data);
                                formattedData = formatData(parsedData, option);
                            }else {
                                formattedData = formatData(data, option);
                            }
                            if(contrail.checkIfExist(option.dataSource.async) && option.dataSource.async == true ){
                                self.data('contrailCombobox').setData(parsedData);
                            }
                        }
                    });
                } else if(option.dataSource.type == "local"){
                    formattedData = formatData(option.dataSource.data, option);
                }
            } else if (self.is('select')) {
                self.children("option").each(function (key, val) {
                    formattedData.push({
                        id: val.value,
                        value: val.innerHTML });
                });
            }

            constructCombobox(self, option, formattedData);

            self.data('contrailCombobox', {
                value: function (value) {
                    var text, sourceValue, item4Value;
                    if (typeof value === 'undefined') {
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
                    formattedData = formatData(data, self.option);
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
        }
        return self;

        function getComboboxOption(givenOptions) {
            var option = {
                delay: 0,
                minLength: 0,
                placeholder: "Select...",
                dataTextField: "value",
                dataValueField: "id",
                select: function (e, ui) {
                    self.globalSelect = ui.item;
                }
            };
            $.extend(true, option, givenOptions);
            return option;
        }

        function constructCombobox(dis, givenOptions, formattedData){
            var wrapper, input, option = getComboboxOption(givenOptions);
            option.source = formattedData;
            dis.option = option;
            dis.globalSelect = {};
            dis.globalDisableList = [];
            dis.hide();
            dis.next('.custom-combobox').find('input').autocomplete('destroy');
            dis.next('.custom-combobox').remove();

            wrapper = $('<div>')
                .addClass( 'custom-combobox input-append ' + dis.attr('class'))
                .insertAfter( dis );

            input = $( "<input>" )
                .addClass('custom-combobox-input span12')
                .appendTo( wrapper )
                .autocomplete(option)
                .attr('placeholder', option.placeholder);

            if(contrail.checkIfExist(option.defaultValue)){
                    input.val(option.defaultValue);
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

            $("<span>")
                .addClass('add-on')
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
                .append('<i class="icon-caret-down"></i>');
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
                <div class="span5">\
                    <label>'+options.leftTitle+'</label>\
                    <ol class="row-fluid multiselect-left multiselect-list" style="height:'+(options.sizeLeft * 30).toString()+'px;"></ol>\
                </div>\
                <div class="span2 multiselect-controls">\
                    ' + ((options.controls.single) ? '<div class="row-fluid multiselect-control"><i title="Move to Left" class="multiselect-control-left-selected icon-angle-right"></i></div>\
                    <div class="row-fluid multiselect-control"><i title="Move to Right" class="multiselect-control-right-selected icon-angle-left"></i></div>' : '') + '\
                    ' + ((options.controls.all) ? '<div class="row-fluid multiselect-control"><i title="Move to Left" class="multiselect-control-left-all icon-double-angle-right"></i></div>\
                    <div class="row-fluid multiselect-control"><i title="Move to Right" class="multiselect-control-right-all icon-double-angle-left"></i></div>' : '') + '\
                </div>\
                <div class="span5">\
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
            $.each(steps, function(stepKey, stepValue){
                if(contrail.checkIfFunction(stepValue.onInitWizard)) {
                    stepValue.onInitWizard(config.params);
                    stepsInitFlag[stepKey] = true;
                }
            });

            if(!stepsInitFlag[currentIndex]){
                if(contrail.checkIfFunction(steps[currentIndex].onInitFromPrevious)) {
                    steps[currentIndex].onInitFromPrevious(config.params);
                }
                if(contrail.checkIfFunction(steps[currentIndex].onInitFromNext)) {
                    steps[currentIndex].onInitFromNext(config.params);
                }
                stepsInitFlag[currentIndex] = true;
            }

            if(contrail.checkIfFunction(steps[currentIndex].onLoadFromPrevious)) {
                steps[currentIndex].onLoadFromPrevious(config.params);
            }
            if(contrail.checkIfFunction(steps[currentIndex].onLoadFromNext)) {
                steps[currentIndex].onLoadFromNext(config.params);
            }
            configureButton(steps[currentIndex].buttons);
        };

        config.onStepChanged = function(event, currentIndex, priorIndex) {
            var currentStepLiElement = self.find('.steps').find('li:eq(' + currentIndex + ')');
            if(currentIndex < priorIndex) {
                self.find('.steps').find('li:eq(' + priorIndex + ')').removeClass('done');
                currentStepLiElement.removeClass('completed');
            }
            else if(currentIndex > priorIndex) {

                if(!currentStepLiElement.hasClass('subStep')) {
                    currentStepLiElement = self.find('.steps').find('li.done').addClass('completed')
                }
            }

            if(!stepsInitFlag[currentIndex]) {
                if(currentIndex > priorIndex && contrail.checkIfFunction(steps[currentIndex].onInitFromNext)) {
                    steps[currentIndex].onInitFromNext(config.params);
                }
                else if(currentIndex < priorIndex && contrail.checkIfFunction(steps[currentIndex].onInitFromPrevious)) {
                    steps[currentIndex].onInitFromPrevious(config.params);
                }
                stepsInitFlag[currentIndex] = true;
            }

            if(currentIndex > priorIndex && contrail.checkIfFunction(steps[currentIndex].onLoadFromNext)) {
                steps[currentIndex].onLoadFromNext(config.params);
            }
            else if(currentIndex < priorIndex && contrail.checkIfFunction(steps[currentIndex].onLoadFromPrevious)) {
                steps[currentIndex].onLoadFromPrevious(config.params);
            }
            configureButton(steps[currentIndex].buttons);
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
        }

        self.steps(config);

        self.find('.actions').find('a').addClass('btn btn-mini')
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
        })

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

        self.data('contrailWizard', $.extend(true, {}, getDefaultStepsMethods(), {}));

        function getDefaultStepsMethods() {
            var methodObj = {},
                defaultMethods = ['next', 'previous', 'finish', 'destroy', 'skip'];

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
                emptyOptionText: 'No option found.'
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
                })

                multiSelectMenu.append(msControls);
            }

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
                    config.data = formatData(parsedData, config);
                    constructCheckedMultiselect(config, defaultFilterConfig);
                });
            } else {
                constructCheckedMultiselect(config, defaultFilterConfig);
            }
        }

        if (contrail.checkIfExist(config.data)) {
            config.data = formatData((contrail.checkIfFunction(parse)) ? parse(config.data) : config.data, config);
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
            options.id = options.id != undefined ? options.id : '';
            var className = (options.className == null) ? '' : options.className;

            var modalHTML = '<div id="' + options.id + '" class="' + className + ' modal hide" tabindex="-1" role="dialog" aria-hidden="true"> \
        		<div class="modal-header"> \
        	    	<button id="modal-header-close" type="button" class="close"><i class="icon-remove"></i></button> \
        			<h6 class="modal-header-title"></h6> \
        		</div> \
	        	<div class="modal-body"></div> \
	        	<div class="modal-footer"></div> \
        	</div>';

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
                    var btnId = (footerButton.id != undefined && footerButton.id != '') ? footerButton.id : options.id + 'btn' + key,
                        btn = '<button id="' + btnId + '" class="btn btn-mini ' + ((footerButton.className != undefined && footerButton.className != '') ? footerButton.className : '') + '"'
                            + ((footerButton.onclick === 'close') ? ' data-dismiss="modal" aria-hidden="true"' : '') + '>'
                            + ((footerButton.title != undefined) ? footerButton.title : '') + '</button>';

                    modalId.find('.modal-footer').append(btn);
                    $('#' + btnId).on('click', function () {
                        if (typeof footerButton.onclick === 'function') {
                            footerButton.onclick(footerButton.onClickParams);
                        }
                        else if (footerButton.onclick != 'close' && typeof footerButton.onclick === 'string') {
                            window[footerButton.onclick](footerButton.onClickParams);
                        }
                    });

                });
            }
            else {
                modalId.find('.modal-footer').remove();
            }
            modalId.modal({backdrop:'static', keyboard:false});
        }
    });
})(jQuery);

//Formatting data as an array of strings.
function formatData(data, option) {
    var formattedData = [];
    if (typeof data[0] === 'object') {
        if (typeof option.dataValueField !== 'undefined' && typeof option.dataTextField !== 'undefined') {
            $.each(data, function (key, val) {
                if ('children' in val){
                    formatData(val.children, option);
                }
                data[key][option.dataValueField.apiVar] = val[option.dataValueField.dsVar];
                data[key][option.dataTextField.apiVar] = val[option.dataTextField.dsVar];
            });
        }
    } else {
        $.each(data, function (key, val) {
            formattedData.push({
                id: val,
                value: String(val),
                text: String(val)
            });
        });
        data = formattedData;
    }
    return data;
};

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

function constructSelect2(self, defaultOption, args) {
    if(typeof args !== 'undefined') {
        self.select2(defaultOption, args);
    } else{
        var option = {
            minimumResultsForSearch : 7,
            dropdownAutoWidth : true,
            dataTextField: 'text',
            dataValueField: 'id',
            data: [],
            formatResultCssClass: function(obj){
            	if(obj.label && 'children' in obj){
            		return 'select2-result-label';
            	}
            }
            // Use dropdownCssClass : 'select2-large-width' when initialzing ContrailDropDown
            // to specify width of dropdown for Contrail Dropdown
            // Adding a custom CSS class is also possible. Just add a custom class to the contrail.custom.css file
        }, source = [];
        $.extend(true, option, defaultOption);
        option.dataTextField = {dsVar: option.dataTextField, apiVar: 'text'};
        option.dataValueField = {dsVar: option.dataValueField, apiVar: 'id'};

        var changeFunction = function(e) {
            if (contrail.checkIfFunction(option.change)) {
                option.change(e);
            }
        };

        var selectingFunction = function(e) {
            if (contrail.checkIfFunction(option.selecting)) {
                option.selecting(e);
            }
        };

        if(!$.isEmptyObject(option) && typeof option.dataSource !== 'undefined') {
            if(option.dataSource.type == "remote"){
                $.ajax({
                    url: option.dataSource.url,
                    dataType: "json",
                    async: false,
                    success: function(data) {
                        if(typeof option.dataSource.parse !== "undefined"){
                            var parsedData = option.dataSource.parse(data);
                            source = formatData(parsedData, option);
                        } else{
                            source = formatData(data, option);
                        }
                    }
                });
            } else if(option.dataSource.type == "local"){
                source = formatData(option, option.dataSource.data);
            }
            option.data = source;
        }
        if(typeof option.data != "undefined") {
            option.data = formatData(option.data,option);

            if (contrail.checkIfExist(self.data('contrailDropdown'))) {
                self.data('contrailDropdown').destroy();
            }

            if (contrail.checkIfExist(self.data('contrailMultiselect'))) {
                self.data('contrailMultiselect').destroy();
            }

            self.select2(option)
                .on("change", changeFunction)
                .on("select2-selecting", selectingFunction);
            if (option.data.length !=0) {
                self.select2('val', option.data[0].text);
            }
        }

        if(typeof option.data != "undefined") {
            option.sourceMap = constructSourceMap(option.data, 'id');
        }
        
        return {
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
                    index = option.sourceMap[selectedValue[i]];
                    selectedObjects.push(fetchSourceMapData(index, option.data));
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
            value: function(value) {
                if(typeof value === 'undefined'){
                    return self.select2('val');
                }
                else{
                    self.select2('val', value);
                }
            },
            setData: function(data) {
                self.select2('destroy');
                option.data = formatData(data,option);
                if(typeof option.data != "undefined") {
                    option.sourceMap = constructSourceMap(option.data, 'id');
                }

                self.select2(option)
                    .off("change", changeFunction)
                    .on("change", changeFunction);

                if(option.data.length > 0){
                    if(option.data[0].children != undefined && option.data[0].children.length > 0) {
                        if(option.data[1] != null && option.data[1].children != null && option.data[1].children.length > 0)
                            self.select2('val', option.data[1].children[0].value);
                    } else {
                        self.select2('val', option.data[0].value);                    
                    }
                }
            },
            enableOptionList: function (flag, disableItemList) {
                for (var j = 0; j < disableItemList.length; j++) {
                    for (var i = 0; i < option.data.length; i++) {
                        if(option.data[i].children === undefined) {
                            if (disableItemList[j] === option.data[i][option.dataValueField.dsVar]) {
                                option.data[i].disabled = !flag;
                            }
                        } else {
                            for(var k = 0;k < option.data[i].children.length; k++) {
                                if(disableItemList[j] === option.data[i].children[k][option.dataValueField.dsVar]) {
                                     option.data[i].children[k].disabled = !flag;
                                }
                            }
                        }
                    }
                }
                self.select2('destroy');
                self.select2(option);
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
                for (var i = 0; i < option.data.length; i++) {
                    if (option.data[i].text === optionText) {
                        if (option.data[i].disabled) {
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
        };
    }
}
