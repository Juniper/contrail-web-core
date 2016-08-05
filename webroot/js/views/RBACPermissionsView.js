/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'knockback'
], function (_, ContrailView, Knockback) {
    var rbacPermissionsView = ContrailView.extend({
        render: function(options) {
            var self = this;
            self.renderView4Config($("#" + "permission_tab"),
                self.model,
                self.permissionsViewConfig()
            );
        },

        permissionsViewConfig: function() {
            return {
                elementId: "permissions_id",
                view: 'SectionView',
                viewConfig: {
                    rows: [
                        {
                            columns: [
                                {
                                    elementId: 'owner',
                                    view: 'FormInputView',
                                    viewConfig: {
                                        visible: "owner_visible",
                                        disabled: true,
                                        label: "Owner",
                                        path: 'perms2.owner',
                                        dataBindValue: 'perms2().owner',
                                        class: 'span6'
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'owner_access',
                                    view: 'FormMultiselectView',
                                    viewConfig: {
                                        label: "Owner Permissions",
                                        path: 'perms2.owner_access',
                                        dataBindValue: 'perms2().owner_access',
                                        class: 'span6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Permissions",
                                            data: cowc.RBAC_ACCESS_TYPE_LIST
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns: [
                                {
                                    elementId: 'global_access',
                                    view: 'FormMultiselectView',
                                    viewConfig: {
                                        label: "Global Share Permissions",
                                        path: 'perms2.global_access',
                                        dataBindValue: 'perms2().global_access',
                                        class: 'span6',
                                        elementConfig: {
                                            dataTextField: "text",
                                            dataValueField: "value",
                                            placeholder:
                                                "Select Permissions",
                                            data: cowc.RBAC_ACCESS_TYPE_LIST
                                        }
                                    }
                                }
                            ]
                        },
                        {
                            columns:[{
                                elementId: "share_accordion",
                                view: "AccordianView",
                                viewConfig:[{
                                   elementId: "share_section",
                                   view:  "SectionView",
                                   title: "Share List",
                                   viewConfig:{
                                       rows: [{
                                           columns:
                                              this.shareViewConfig()
                                        }]
                                    }
                                }]
                            }]
                         }

                    ]
                }
            }
        },

        shareViewConfig: function() {
            var projectPostData = JSON.stringify({data: [{type: "projects",
                parent_type: "domain",
                parent_fq_name_str:
                    contrail.getCookie(cowc.COOKIE_DOMAIN)}]})
            return  [{
                elementId: 'share_list',
                view: "FormEditableGridView",
                viewConfig: {
                    path : 'share_list',
                    validation:
                   'rbacPermsShareValidations',
                   templateId: cowc.TMP_EDITABLE_GRID_ACTION_VIEW,
                    collection:
                        'share_list',
                    columns: [
                        {
                            elementId: "tenant",
                            name: "Project",
                            view: 'FormDropdownView',
                            viewConfig: {
                                path : "tenant",
                                width: 250,
                                dataBindValue : "tenant()",
                                templateId:
                                    cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                                elementConfig: {
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    placeholder: "Select Project",
                                    dataSource: {
                                        type: "remote",
                                        url:
                                         "/api/tenants/config/get-config-list",
                                        requestType: "POST",
                                        postData: projectPostData,
                                        parse: function(result){
                                            var dataSource = [],
                                               projects =
                                               getValueByJsonPath(result,
                                                   "0;projects", []);
                                            _.each(projects, function(project){
                                                var projName =
                                                    getValueByJsonPath(project,
                                                    "fq_name;1", "", false);
                                                if(projName &&
                                                    projName !==
                                                        "default-project") {
                                                    dataSource.push({
                                                        text: projName,
                                                        value: projName
                                                    });
                                                }
                                            });
                                            return dataSource
                                        }
                                    }
                                }
                           }
                        },
                        {
                            elementId: "tenant_access",
                            name: 'Permissions',
                            view: "FormMultiselectView",
                            viewConfig: {
                                templateId: cowc.
                                    TMPL_EDITABLE_GRID_MULTISELECT_VIEW,
                                width: 250,
                                path: "tenant_access",
                                dataBindValue: "tenant_access()",
                                elementConfig:{
                                    dataTextField: "text",
                                    dataValueField: "value",
                                    placeholder: "Select Permissions",
                                    data: cowc.RBAC_ACCESS_TYPE_LIST
                                }
                            }
                        }
                     ],
                    rowActions: [
                        {onClick: "function() {" +
                            "$root.addShare();" +
                            "}",
                         iconClass: 'icon-plus'},
                        {onClick: "function() {" +
                            "$root.deleteShare($data, this);" +
                           "}",
                         iconClass: 'icon-minus'}
                    ],
                    gridActions: [
                        {onClick: "function() {" +
                            "addShare();" +
                            "}",
                         buttonTitle: ""}
                    ]
                }
            }];
        }
    });

    return rbacPermissionsView;
});

