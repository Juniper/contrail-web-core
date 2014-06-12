/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */
(function($) {
    $.ui.tabs.prototype._tabKeydown = function(event){
        return;
    }
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
                self.data('contrailDateTimePicker').option.minTime = moment(minDateTime).format('hh:mm:ss A');;

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
        var self = this, formattedData = [];

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
                    $.ajax({
                        url: option.dataSource.url,
                        dataType: "json",
                        async: false,
                        success: function( data ) {
                            if(typeof option.dataSource.parse !== "undefined"){
                                var parsedData = option.dataSource.parse(data);
                                formattedData = formatData(parsedData, option);
                            }else {
                                formattedData = formatData(data, option);
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
        var defaultOptions = {
            dataTextField: "label",
            dataValueField: "value",
            leftTitle: "Left",
            rightTitle: "Right",
            sizeLeft: 8,
            sizeRight: 8,
        };
        var options = $.extend({}, defaultOptions, givenOptions);
        constructContrail2WayMultiselect(this, options);

        options = (typeof options === "undefined") ? {} : options;
        options.left = $(this).find('#multiselect_from');
        options.leftAll = $(this).find('#left_All');
        options.leftSelected = $(this).find('#left_Selected');
        options.right = $(this).find('#multiselect_to');
        options.rightAll = $(this).find('#right_All');
        options.rightSelected = $(this).find('#right_Selected');

        var self = this,
            multiselect = self.find('#multiselect_from').multiselect(options);

        self.data('contrail2WayMultiselect', {
            getLeftData: function () {
                var result = [];
                $.each(multiselect.left.find('option'), function (key, value) {
                    result[key] = {};
                    result[key][options.dataValueField] = $(value).val();
                    result[key][options.dataTextField] = $(value).text();
                });
                return result;
            },
            getRightData: function () {
                var result = [];
                $.each(multiselect.right.find('option'), function (key, value) {
                    result[key] = {};
                    result[key][options.dataValueField] = $(value).val(),
                    result[key][options.dataTextField] = $(value).text()
                });
                return result;
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
                for (var i = 0; i < data.length; i++) {
                    $(multiselect.left).append('<option value=' + data[i][options.dataValueField] + '>' + data[i][options.dataTextField] + '</option>');
                }
            },
            updateRightData: function (data) {
                for (var i = 0; i < data.length; i++) {
                    $(multiselect.right).append('<option value=' + data[i][options.dataValueField] + '>' + data[i][options.dataTextField] + '</option>');
                }
            },
            getLeftSelectedData: function () {
                var result = [];
                $.each(multiselect.left.find('option:selected'), function (key, value) {
                    result[key] = {};
                    result[key][options.dataValueField] = $(value).val(),
                    result[key][options.dataTextField] = $(value).text()
                });
                return result;
            },
            getRightSelectedData: function () {
                var result = [];
                $.each(multiselect.right.find('option:selected'), function (key, value) {
                    result[key] = {};
                    result[key][options.dataValueField] = $(value).val(),
                    result[key][options.dataTextField] = $(value).text()
                });
                return result;
            },
            deleteLeftData: function (value) {
                for(var i= 0; i< value.length; i++){
                    multiselect.left.find('option[value='+value[i]+']').remove();
                }
            },
            deleteLeftAllData: function () {
                multiselect.left.find('option').remove();
            },
            deleteRightData: function (value) {
                for(var i= 0; i< value.length; i++){
                    multiselect.right.find('option[value='+value[i]+']').remove();
                }
            },
            deleteRightAllData: function () {
                multiselect.right.find('option').remove();
            },
            show: function () {
                $(multiselect.left).show();
                $(multiselect.right).show();
                $.each(multiselect.actions, function (key, value) {
                    $(value).show();
                });
            },
            hide: function () {
                $(multiselect.left).hide();
                $(multiselect.right).hide();
                $.each(multiselect.actions, function (key, value) {
                    $(value).hide();
                });
            },
            disable: function () {
                $(multiselect.left).prop("disabled", true);
                $(multiselect.right).prop("disabled", true);
                $.each(multiselect.actions, function (key, value) {
                    $(value).prop("disabled", true);
                });
            },
            enable: function () {
                $(multiselect.left).prop("disabled", false);
                $(multiselect.right).prop("disabled", false);
                $.each(multiselect.actions, function (key, value) {
                    $(value).prop("disabled", false);
                });
            }
        });
        function constructContrail2WayMultiselect(self, options){
            self.html('<div class="row-fluid">\
                <div class="span5">\
                    <label>'+options.leftTitle+'</label>\
                    <select name="from" id="multiselect_from" class="span'+options.sizeLeft+'" size="8" multiple="multiple"></select>\
                </div>\
                <div class="span1">\
                    <br><br><br>\
                    <div class="span12 offset3"><button type="button" id="right_Selected" class=" btn btn-mini btn-primary"><i class="icon-chevron-right"></i></button></div>\
                    <div class="span12 offset3"><button type="button" id="left_Selected"  class=" btn btn-mini btn-primary"><i class="icon-chevron-left"></i></button></div>\
                </div>\
                <div class="span5">\
                     <label>'+options.rightTitle+'</label>\
                     <select name="to" id="multiselect_to" class="span'+options.sizeRight+'" size="8" multiple="multiple"></select>\
                </div>\
          </div>');
        };
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

            $.each(options.footer, function (key, footerButton) {
                var btnId = (footerButton.id != undefined && footerButton.id != '') ? footerButton.id : options.id + 'btn' + key,
                    btn = '<button id="' + btnId + '" class="btn btn-mini ' + ((footerButton.className != undefined && footerButton.className != '') ? footerButton.className : '') + '"'
                        + ((footerButton.onclick === 'close') ? ' data-dismiss="modal" aria-hidden="true"' : '') + '>'
                        + ((footerButton.title != undefined) ? footerButton.title : '') + '</button>';

                modalId.find('.modal-footer').append(btn);
                $('#' + btnId).on('click', function() {
                    if (typeof footerButton.onclick === 'function') {
                        footerButton.onclick(footerButton.onClickParams);
                    }
                    else if(footerButton.onclick != 'close' && typeof footerButton.onclick === 'string'){
                        window[footerButton.onclick](footerButton.onClickParams);
                    }
                });

            });

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
        if(typeof option.data != "undefined" && option.data.length > 0 ) {
            option.data = formatData(option.data,option);
            self.select2(option)
                .on("change", function(e) {
                    if (typeof option.change !== 'undefined' && typeof option.change === 'function') {
                        option.change(e);
                    }
                });
            if (option.data.length !=0) {
                self.select2('val', option.data[0].text);
            }
        }

        if(typeof option.data != "undefined") {
            option.sourceMap = constructSourceMap(option.data, 'id');
        }
        
        return {
            getAllData: function(){
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
                    if (self.select2('data') != null)
                        return (self.select2('data') != null) ? self.select2('data').text : null;
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
                    .on("change", function(e) {
                        if (typeof option.change !== 'undefined' && typeof option.change === 'function') {
                            option.change(e);
                        }
                    });

                if(option.data.length > 0){
                    self.select2('val', option.data[0].text);
                }
            },
            enableOptionList: function (flag, disableItemList) {
                for (var j = 0; j < disableItemList.length; j++) {
                    for (var i = 0; i < option.data.length; i++) {
                        if (disableItemList[j] === option.data[i][option.dataTextField.dsVar]) {
                            option.data[i].disabled = !flag;
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
                self.select2('destroy');
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
