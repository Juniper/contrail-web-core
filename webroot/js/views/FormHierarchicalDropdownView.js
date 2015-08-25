/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view'
], function (_, ContrailView) {
    var self;
    var FormHierarchicalDropdownView = ContrailView.extend({
        render: function () {
            self = this;
            var viewConfig = this.attributes.viewConfig,
                dropdownTemplate =
                    contrail.getTemplate4Id((viewConfig.templateId) ?
                    viewConfig.templateId: cowc.TMPL_DROPDOWN_VIEW),
                label = this.attributes.label,
                elId = this.attributes.elementId,
                app = this.attributes.app,
                visible =  this.attributes.visible,
                path = viewConfig[cowc.KEY_PATH],
                lockEditingByDefault = this.attributes.lockEditingByDefault,
                labelValue = (label != null)? label :((elId != null) ?
                    cowl.get(elId, app) : cowl.get(path, app)),
                tmplParameters;
                self.elementConfig = viewConfig[cowc.KEY_ELEMENT_CONFIG];
                self.dsSrcDest = self.elementConfig.data;
                /*Merge hierarchical opts with defaults*/
                 $.extend(self.elementConfig, self.hierarchicalOptions());
            if (!(contrail.checkIfExist(lockEditingByDefault) &&
                lockEditingByDefault)) {
                lockEditingByDefault = false;
            }
            this.model.initLockAttr(path, lockEditingByDefault);

            tmplParameters = {
                label: labelValue, id: elId + '_dropdown', name: elId,
                viewConfig: viewConfig,
                lockAttr: lockEditingByDefault,
                class: "span12"
            };

            /* Save the elementConfig for the dropdown in elementConfigMap in
               the model 'key' is the name of the element and 'value is
               the actual element config' */

            // get the current elementConfigMap
            var currentElementConfigMap =
                this.model.model().get('elementConfigMap');
            if(!contrail.checkIfExist(currentElementConfigMap)){
                currentElementConfigMap = {};
                this.model.model().set('elementConfigMap',
                    currentElementConfigMap);
            }
            /* Update the existing elementConfigMap by adding the the new
                element elementConfig will get updated in the model also*/
            currentElementConfigMap[elId] = self.elementConfig;

            this.$el.html(dropdownTemplate(tmplParameters));
            this.$el.find('#' + elId + '_dropdown').data("elementConfig",
                self.elementConfig);
            if (contrail.checkIfFunction(self.elementConfig.onInit)) {
                self.elementConfig.onInit(this.model.model());
            }
        },
        hierarchicalOptions : function() {
            var opts = {};
            opts.query = self.select2Query;
            opts.formatResult = self.select2ResultFormat;
            opts.formatSelection = self.select2Format;
            opts.selectOnBlur =  true;
            opts.close = self.loadSelect2CloseActions;
            opts.open = self.loadSelect2OpenActions;
            return opts;
        },
        loadSelect2CloseActions : function() {
            var map = self.elementConfig.queryMap;
            //show inbuilt select2 search results for custom term
            $('.select2-results >\
            .select2-results-dept-0.select2-result-selectable').
            attr('style','display:block');
            if($(".select2-search") &&  $(".select2-search").length > 0) {
                self.setSelectedGroupIcon(map[0].grpName);
            }
            $('.select2-results').removeAttr('style');
            $('.res-icon').remove();
        },
        loadSelect2OpenActions : function() {
            var map = self.elementConfig.queryMap;
            $('.select2-results').attr('style','max-height:400px;');
            $('.res-icon').remove();
            $(".select2-search").
                prepend('<i class="'+ map[0].iconClass +' res-icon"> </i>');
        },
        select2Format : function(state) {
            var originalOption = state.element != null ? state.element : state;
            var fomattedTxt = state.text;
            if(state.parent != undefined){
                fomattedTxt = self.choiceSelection(state);
            }
            return "<div style='text-overflow:ellipsis;overflow:hidden;'\
                title ='" + state.text + "'>" + fomattedTxt + "</div>";
        },
        choiceSelection : function(state){
            var map = self.elementConfig.queryMap;
            var fomattedTxt;
            var txt = state.parent != undefined ? state.parent : state.text
            for(var i=0; i < map.length; i++) {
                if(txt === map[i].grpName) {
                    fomattedTxt = '<i class="' + map[i].iconClass + '"></i>' +
                        ' ' + state.text;
                    break;
                }
            }
            return fomattedTxt;
        },
        select2ResultFormat : function(state){
            var originalOption = state.element != null ? state.element : state;
            var fomattedTxt = state.text;
            if(state.id == undefined){
                fomattedTxt = self.choiceSelection(state);
            }
            return fomattedTxt;
        },
        getSelectedGroupName : function(selector) {
            var map = self.elementConfig.queryMap;
            var grpName = map[0].grpName;
            var element = selector ? selector : $(".res-icon");
            for(var i = 0; i < map.length; i++) {
                 if(element.hasClass(map[i].iconClass)){
                     grpName = map[i].grpName;
                     break;
                 }
            }
            return grpName;
        },
        setFocusSelectedItem: function(grpName, term, data) {
            for(var i = 0; i < data.length ; i++) {
                if(data[i].text === grpName &&  data[i].children.length === 2) {
                    $($('div:contains('+ term +')').parent()).
                        addClass('select2-highlighted');
                    break;
                }
            }
        },
        addNewTermDataSource : function(grpName, term, data) {
            var newItem = {id : term, text : term, parent : grpName};
            for(var i = 0; i < data.length ; i++) {
                if(data[i].text === grpName &&  data[i].children.length === 1) {
                    data[i].children.push(newItem);
                    break;
                }
            }
        },
        setSelectedGroupIcon : function(grpName){
            var map = self.elementConfig.queryMap;
            var currentIcon = map[0].iconClass;
            for(var i=0; i < map.length; i++) {
                if(grpName === map[i].grpName) {
                    currentIcon = map[i].iconClass;
                    break;
                }
            }
            $(".res-icon").remove();
            $(".select2-search").prepend('<i class="'+
                currentIcon +' res-icon"> </i>');
        },
        retainExpandedGroup : function() {
            var map = self.elementConfig.queryMap;
            var subEleArry = $(".select2-result-sub");
            if(subEleArry && subEleArry.length > 0) {
                subEleArry.addClass('hide');
                var grpName = self.getSelectedGroupName();
                for(var i = 0; i < map.length; i++) {
                   if(map[i].grpName === grpName) {
                       var subEle = $(subEleArry[i]);
                       subEle.removeClass('hide');
                       break;
                   }
                }
            }
        },
        select2Query : function(query) {
            //using predefined process method to make work select2 selection
            var t = query.term,filtered = { results: [] }, process;
            var data = {results: []};
            var grpName = self.getSelectedGroupName();

            if(query.term != undefined) {
                data.results.push(
                    { id : query.term, text : query.term, parent : grpName}
                );
                this.data = [];
                var filteredResults = [];
                for(var i = 0; i < self.dsSrcDest.length;i++) {
                    var children = self.dsSrcDest[i]['children'];
                    filteredResults[i] = {
                        text: self.dsSrcDest[i]['text'],
                        children: []
                    };
                    for(var j = 0; j < children.length; j++) {
                        if(children[j].text.indexOf(query.term) != -1 ||
                            children[j].disabled == true) {
                            filteredResults[i].children.push(
                                self.dsSrcDest[i].children[j]);
                        }
                    }
                    data.results.push(filteredResults[i]);
                }
                if(query.term != '') {
                    self.addNewTermDataSource(grpName, query.term,
                        data.results);
                }
                var pageSize = 200;
                for(var i=1 ; i < data.results.length ; i++){
                    var more = false;
                    if (data.results[i]['children'].length >=
                        query.page*pageSize) {
                        more = true;
                    }
                    data.results[i]['children'] =
                        data.results[i]['children'].
                        slice((query.page-1) * pageSize,query.page * pageSize);
                    if (more) {
                        data.results[i]['children'].push({id:"search" + i,
                        text:"Search to find more entries", disabled : true});
                    }
                }
            } else {
                process = function(datum, collection) {
                    var group, attr;
                    datum = datum[0];
                    if (datum.children) {
                        group = {};
                        for (attr in datum) {
                            if (datum.hasOwnProperty(attr)){
                                group[attr]=datum[attr];
                            }
                        }
                        group.children=[];
                        $(datum.children).each2(
                            function(i, childDatum) {
                                process(childDatum, group.children);
                            }
                        );
                        if (group.children.length ||
                            query.matcher(t, '', datum)) {
                            collection.push(group);
                        }
                    } else {
                        if (query.matcher(t, '', datum)) {
                            collection.push(datum);
                        }
                    }
                };
                if(t != ""){
                    $(self.dsSrcDest).each2(
                        function(i, datum) {
                            process(datum, filtered.results);
                        }
                    )
                }
                data.results = self.dsSrcDest;

            }
            query.callback(data);
            //set focus for a searched item
            self.setFocusSelectedItem(grpName, query.term, data.results);

            //hide inbuilt select2 search results for custom term
            $('.select2-results >\
            .select2-results-dept-0.select2-result-selectable').
            attr('style','display:none');

            var subEleArry = $(".select2-result-sub");
            if(subEleArry && subEleArry.length > 0) {
               for(var i = 0; i < subEleArry.length; i++) {
                    $(subEleArry[i]).attr('style',
                        'max-height:150px;overflow:auto;');
               }
            }
            self.retainExpandedGroup();

            if($(".select2-result-label") &&
                $(".select2-result-label").length > 0) {
                //set background color for groups
                for(var i = 0; i < $(".select2-result-label").length; i++) {
                    if($($('.select2-result-label')[i]).find('i') &&
                        $($('.select2-result-label')[i]).find('i').length > 0) {
                        $($('.select2-result-label')[i]).
                        attr('style','background-color:#E2E2E2;margin-top:2px;')
                        $($('.select2-result-label')[i]).
                        attr('style','background-color:#E2E2E2;margin-top:2px;')
                    }
                }
                $(".select2-result-label").on('click', function() {
                    if($(this).parent().hasClass('select2-disabled')) {
                        return;
                    }
                    $('.select2-result-sub').addClass('hide');
                    $(this).parent().find('.select2-result-sub').
                        removeClass('hide');

                    $(".res-icon").remove();
                    self.setSelectedGroupIcon(this.textContent.trim());
                });
            }
            if($(".select2-search") &&  $(".select2-search").length > 0) {
                var grpName = self.getSelectedGroupName();
                self.setSelectedGroupIcon(grpName);
            }
        }
    });

    return FormHierarchicalDropdownView;
});

