/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var tagsView = ContrailView.extend({
        render: function(options) {
            var self = this;
            var tagsDetails,actValue,textValue;
            self.renderView4Config($("#" + "tags_tab"),
                self.model,
                self.tagsViewConfig()
            );
        },
        tagsViewConfig: function() {
            return {
                elementId: "tags_id",
                view: 'SectionView',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'Application',
                                    view: 'FormDropdownView',
                                    viewConfig: {
                                        label: "Application",
                                        path: 'Application',
                                        dataBindValue: 'Application',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Application Tag",
                                                dataSource : getDataSourceForDropdown('application')
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'Deployment',
                                    view: 'FormDropdownView',
                                    viewConfig: {
                                        label: "Deployment",
                                        path: 'Deployment',
                                        dataBindValue: 'Deployment',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Deployment Tag",
                                                dataSource : getDataSourceForDropdown('deployment')
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'Site',
                                    view: 'FormDropdownView',
                                    viewConfig: {
                                        label: "Site",
                                        path: 'Site',
                                        dataBindValue: 'Site',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Site Tag",
                                                dataSource : getDataSourceForDropdown('site')
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'Tier',
                                    view: 'FormDropdownView',
                                    viewConfig: {
                                        label: "Tier",
                                        path: 'Tier',
                                        dataBindValue: 'Tier',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Tier Tag",
                                                dataSource : getDataSourceForDropdown('tier')
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'Labels',
                                    view: 'FormMultiselectView',
                                    viewConfig: {
                                        label: "Labels",
                                        path: 'Labels',
                                        dataBindValue: 'Labels',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Labels",
                                                dataSource : getDataSourceForDropdown('label')
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'Custom',
                                    view: 'FormMultiselectView',
                                    viewConfig: {
                                        label: "Custom",
                                        path: 'Custom',
                                        dataBindValue: 'Custom',
                                        class: 'col-xs-6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Custom Tags",
                                                dataSource : getDataSourceForDropdown('custom')
                                        }
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        }
    });
    function tagsParser(result, tagName) {
        var textValue, actValue, tagsArray = [];
        if($.inArray(tagName, ctwc.FW_PREDEFINED_TAGS) !== -1){
            tagsArray.push({'text':"None","value":"None"});
        }
        var pHashParam = getValueByJsonPath(layoutHandler.getURLHashObj(),"p");
        var isGlobal = false;
        if (pHashParam != null) {
            var parts = pHashParam.split('_');
            if(parts[0] != null && parts[0] == 'config' &&
                    parts[1] != null && parts[1] == 'infra'){
                isGlobal = true;
            }
        }
        for(var i=0; i<result.length; i++){
          tagsDetails = result[i].tags;
          for(var j= 0; j < tagsDetails.length; j++){
              //If its a global page and if the tags are from project then continue
              //If not global and not from same project then continue
              if (isGlobal && tagsDetails[j]['tag'].fq_name.length > 1) {
                  continue;
              } else if (!isGlobal && tagsDetails[j]['tag'].fq_name.length > 1) {
                  var domain = contrail.getCookie(cowc.COOKIE_DOMAIN_DISPLAY_NAME);
                  var project = contrail.getCookie(cowc.COOKIE_PROJECT_DISPLAY_NAME);
                  if (domain != tagsDetails[j]['tag'].fq_name[0] ||
                          project != tagsDetails[j]['tag'].fq_name[1]) {
                      continue;
                  }
              }
              if(tagsDetails[j].tag.fq_name &&
                      tagsDetails[j].tag.fq_name.length === 1) {
                  actValue = tagsDetails[j].tag.fq_name[0];
              }
              else{
                  actValue =  tagsDetails[j].tag.fq_name[0] +
                  ":" + tagsDetails[j].tag.fq_name[1] +
                  ":" + tagsDetails[j].tag.fq_name[2];
              }
              data = {
                      "text": (tagsDetails[j]['tag'].fq_name.length == 1)?
                                  "global:" + tagsDetails[j].tag.name :
                                   tagsDetails[j].tag.name,
                      "value":actValue
                 };
              if (tagsDetails[j].tag.tag_type_name === tagName) {
                  tagsArray.push(data);
              } else if (tagName === 'custom' &&
                      $.inArray(tagsDetails[j].tag.tag_type_name, ctwc.FW_PREDEFINED_TAGS) === -1){
                  tagsArray.push(data);
              }
          }
        }
        return tagsArray;
    }

    function getDataSourceForDropdown (tagName) {
        return {
            type: 'remote',
            requestType: 'post',
            postData: JSON.stringify(
                  {data: [{type: 'tags'}]}),
            url:'/api/tenants/config/get-config-details',
            parse: function(result) {
                return tagsParser(result,tagName);
            }
        }
    }
    return tagsView;
});
