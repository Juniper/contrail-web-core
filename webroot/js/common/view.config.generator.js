/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    var ViewConfigGenerator = function (prefixId, model) {
        var self = this;
        self.prefixId = prefixId;
        self.viewConfigs = [];
        self.rootViewPath = '';

        this.generateViewConfig = function(options, uiSchemaModel, view, type){
            var views = ['default'];
            var types = ['form'];
            if((types.indexOf(type) != -1) && (views.indexOf(view) != -1))
            {
                return self.generate[view][type](options, uiSchemaModel);
            }
            else{
                if((types.indexOf(type) != -1) && (views.indexOf(view) != -1))
                {
                    console.error("[ViewConfig Generator] Couldn't find specified rendering view and type.");
                    return {};
                }
                else if(types.indexOf(type) != -1)
                {
                    console.error("[ViewConfig Generator] Couldn't find, " + type + ", rendering type.");
                    return {};
                }
                else if(views.indexOf(view) != -1)
                {
                    console.error("[ViewConfig Generator] Couldn't find, " + view + ", rendering view.");
                    return {};
                }
            }
        };

        /*
         * @param: uiSchemaModel {Object}
         * @param: options {Object}
         *   element : Required, server, cluster, images ...
         *   path : Optional, Default : ""
         *   page : Optional, Default : 1
         *   group : required if page is specified
         *   type : form, grid ...
         *   formType: 'edit' OR 'add'
         * @Return {Object}
         * */
        this.generateDefaultFormVC = function (options, uiSchemaModel) {
            if(typeof options.formType == 'undefined'){
                console.warn('[View Config Generator] Form type is not defined. Edit type of form will be rendered');
            }

            var numberOfSections = self.util.getNumberOfSections(self.util.getObject(options.path, uiSchemaModel, true));
            var accordianViewConfig = {
                dataRootViewPath: options.rootViewPath,
                dataPath: options.path,
                elementId: cowu.formatElementId([self.prefixId, options.element]),
                view: 'AccordianView',
                viewConfig: []
            };

            var defaultSchema = self.util.getObject(options.path, uiSchemaModel, true);

            //build noGroup sectionView
            var noGroup = self.util.abstractNoGroup(defaultSchema);
            var path_components = options.path.split('.');
            var noGroupElementId = self.util.getIdFromPath(options.path) || 'details';
            var groupWrapperObject = self.util.getObject(options.path, uiSchemaModel, false);
            var noGroupTitle = groupWrapperObject.get('label') || self.util.capitalizeSentence(options.element) || '';
            var noGroupSectionView = self.util.getSectionViewConfig();
            noGroupSectionView.dataPath = options.path;
            noGroupSectionView.dataRootViewPath = options.dataRootViewPath;

            noGroupSectionView.elementId = cowu.formatElementId([self.prefixId, noGroupElementId]);
            noGroupSectionView.title = noGroupTitle;
            noGroupSectionView.viewConfig.rows = self.util.buildRows(options.formType, options.path, noGroup, uiSchemaModel);
            noGroupSectionView = self.util.removeEmptyRows(noGroupSectionView);

            if (noGroupSectionView.viewConfig.rows.length > 0) {
                accordianViewConfig.viewConfig.push(noGroupSectionView);
            }

            // build group sections
            var groups = self.util.abstractGroups(defaultSchema);
            var groupKeys = Object.keys(groups);
            for (var i = 0; i < groupKeys.length; i++) {
                var group = groups[groupKeys[i]]['properties'];
                var endPoint = options.path;
                var _path = endPoint;
                (endPoint == "") ? endPoint = "properties." + groupKeys[i] : endPoint = endPoint + ".properties." + groupKeys[i];

                if (JSON.stringify(groups[groupKeys[i]]['properties']) != '{}') {
                    var groupElementId = self.util.getIdFromPath(endPoint);
                    var groupWrapperObject = self.util.getObject(endPoint, uiSchemaModel, false);
                    var groupTitle = groupWrapperObject.get('label') || self.util.capitalizeSentence(groupKeys[i]) || '';

                    var groupSectionView = self.util.getSectionViewConfig();
                    groupSectionView.dataPath = options.path;
                    groupSectionView.dataRootViewPath = options.dataRootViewPath;
                    groupSectionView.elementId = cowu.formatElementId([self.prefixId, groupElementId]);
                    groupSectionView.title = groupTitle;
                    groupSectionView.viewConfig.rows = self.util.buildRows(options.formType, endPoint, groups[groupKeys[i]]['properties'], uiSchemaModel);

                    //build and add links on groupSectionView
                    var linkColumns = [];
                    var linkGroups = self.util.abstractGroups(group);
                    var linkKeys = Object.keys(linkGroups);

                    for (var k = 0; k < linkKeys.length; k++) {
                        //display links if there is atleast one key in the subGroup
                        if(JSON.stringify(self.util.getObject(linkKeys[k], linkGroups, true)) != '{}')
                        {
                            var label = group[linkKeys[k]].get('label');
                            (typeof label == 'undefined' || label == '') ? label = self.util.capitalizeSentence(linkKeys[k]) : label = label;

                            var linkConfig = self.util.getLinkConfig();
                            linkConfig.elementId = linkKeys[k];
                            linkConfig.view = "FormButtonView";
                            linkConfig.viewConfig.label = label;
                            var groupLinkPath = endPoint + ".properties." + linkKeys[k];
                            linkConfig.viewConfig.elementConfig.onClick = "function(){$root.goForward('" + options.rootViewPath + "' , '" + groupLinkPath + "', '" + prefixId + "', " + options.rowIndex + ")}";
                            options.path = groupLinkPath;
                            options.element = linkKeys[k];

                            options.path = _path;
                            linkColumns.push(linkConfig);
                        }
                    }

                    if (linkColumns.length > 0) {
                        groupSectionView.viewConfig.rows.push({columns: linkColumns});
                        linkColumns = [];
                    };
                    accordianViewConfig.viewConfig.push(groupSectionView);
                }
                else {
                    numberOfSections--;
                }
            }

            return accordianViewConfig;
        };

        this.addValidation = function (uiSchemaModel, validations) {
            var schema = self.util.getObject("", uiSchemaModel, true);
            for (var key in schema) {
                if ((schema[key].get('type') != 'object') && (schema[key].get('type') != 'array')) {
                    var path = self.util.parsePath(schema[key].get('path'));

                    //if not required, add empty object
                    if (typeof validations[path] == 'undefined') {
                        validations[path] = {}
                    }

                    //special case: set pattern on keys that has the word "email" as "email"
                    if(key.indexOf("email") != -1){
                        validations[path]['pattern'] = "email";
                        validations[path]['msg'] = smwm.getInvalidErrorMessage(key);
                        validations[path]['required'] = false;
                    }

                    if ((typeof schema[key].get('pattern') != 'undefined')) {
                        validations[path]['pattern'] = schema[key].get('pattern');
                        validations[path]['msg'] = smwm.getInvalidErrorMessage(key);
                        validations[path]['required'] = false;
                    }

                    //remove empty objects
                    if (Object.keys(validations[path]).length == 0) delete validations[path];
                } else {
                    self.addValidation(schema[key], validations);
                }
            }

            if (typeof uiSchemaModel.required != 'undefined') {
                //add message for each required key
                for (var i = 0; i < uiSchemaModel.required.length; i++) {
                    var path = self.util.parsePath(schema[uiSchemaModel.required[i]].get('path'));
                    validations[path] = {};
                    validations[path]['required'] = true;
                    (typeof validations[path]['msg'] == 'undefined') ? validations[path]['msg'] = smwm.getRequiredMessage(uiSchemaModel.required[i]) : validations[path]['msg'] = validations[path]['msg'];
                }
            }
        };

        this.generate = {
            default : {
                form : self.generateDefaultFormVC
            }
        };

        this.util = {
            viewMap: {
                "object": cowc.VIEW_SECTION_VIEW,
                "boolean": cowc.VIEW_FORM_DROPDOWN_VIEW,
                "array": cowc.VIEW_FORM_EDITABLE_GRID_VIEW,
                "string": cowc.VIEW_FORM_INPUT_VIEW,
                "null": cowc.VIEW_FORM_INPUT_VIEW,
                "integer": cowc.VIEW_FORM_INPUT_VIEW
            },
            templateIdMap: {
                "boolean": cowc.TMPL_EDITABLE_GRID_CHECKBOX_VIEW,
                "array": cowc.TMPL_EDITABLE_GRID_DROPDOWN_VIEW,
                "string": cowc.TMPL_EDITABLE_GRID_INPUT_VIEW,
                "null": cowc.TMPL_EDITABLE_GRID_INPUT_VIEW
            },
            /*
             * for a given path, removes replaces the dots with underscore sign
             * @param: path{String}
             * @Return: {String}
             * */
            getIdFromPath: function(path){
                return path.split('.').join('_');
            },
            /*
             * removes empty rows from a given SectionView
             * @param: sectionViewConfig {Object}
             * @Return: {Object}
             * */
            removeEmptyRows: function (sectionViewConfig) {
                //on if statement, sectionViewConfig.viewConfig.rows might be empty
                try {
                    //if there is only one row and that row doesn't have any column return
                    if ((sectionViewConfig.viewConfig.rows.length == 1) && (sectionViewConfig.viewConfig.rows[0].columns.length == 0)) {
                        return {};
                    }
                    //if there is at least one row remove all empty columns within it
                    for (var i = 0; i < sectionViewConfig.viewConfig.rows.length; i++) {
                        if (sectionViewConfig.viewConfig.rows[i].columns.length == 0) {
                            sectionViewConfig.viewConfig.rows.splice(i, 1);
                        }
                    }
                    return sectionViewConfig;
                } catch (e) {
                    //if there is at least one row remove all empty columns within it
                    for (var i = 0; i < sectionViewConfig.viewConfig.rows.length; i++) {
                        if (sectionViewConfig.viewConfig.rows[i].columns.length == 0) {
                            sectionViewConfig.viewConfig.rows.splice(i, 1);
                        }
                    }
                    return sectionViewConfig;
                }
            },
            getLinkConfig: function () {
                return {
                    elementId: '',
                    view: '',
                    viewConfig: {
                        id: 'goToBtn',
                        className: 'btn-primary',
                        title: '',
                        label: '',
                        onKeyupEsc: false,
                        elementConfig: {
                            onClick: function () {
                            }
                        }
                    }
                };
            },
            getSectionViewConfig: function () {
                return {
                    elementId: '',
                    title: '',
                    dataPath: '',
                    dataRootViewPath: '',
                    view: "SectionView",
                    viewConfig: {}
                };
            },
            /*
             * returns number of sections for a given schemaModel
             * @param: uiSchemaModel {Object}
             * @Return {Integer}
             * */
            getNumberOfSections: function (uiSchemaModel) {
                //needed on generating links. If already abstracted properties, skip. else, get uiSchemaModel['properties']
                var tempModel;
                (typeof uiSchemaModel['properties'] == 'undefined') ? tempModel = uiSchemaModel : tempModel = self.util.getObject("properties", uiSchemaModel);

                var noGroup = self.util.abstractNoGroup(tempModel);
                var groups = self.util.abstractGroups(tempModel);

                var total = 0;

                if (Object.keys(noGroup).length > 1) {
                    total++;
                }
                total += Object.keys(groups).length;
                return total;
            },
            /*
             * gets all keys whose type is Object or Array
             * @param: schema {Object}
             * @Return {Object}
             * */
            abstractGroups: function (schema) {
                var keys = Object.keys(schema);
                var groups = {};
                for (var i = 0; i < keys.length; i++) {
                    if ((schema[keys[i]].get('type') == "object")) {
                        groups[keys[i]] = schema[keys[i]];
                    }
                    else if (schema[keys[i]].get('type') == "array") {
                        if (schema[keys[i]].get('items').type == "object") {
                            groups[keys[i]] = schema[keys[i]];
                        }
                    }
                }
                return groups;
            },
            /*
             * gets all key:value pairs which are of type, string, boolean, integer and null
             * @param: schema {Object}
             * @Return {Object}
             * */
            abstractNoGroup: function (schema) {
                var keys = Object.keys(schema);
                var noGroup = {};
                for (var i = 0; i < keys.length; i++) {
                    if ((schema[keys[i]].get('type') != "object")) {
                        if (schema[keys[i]].get('type') == "array") {
                            if (schema[keys[i]].get('items').type != "object") {
                                noGroup[keys[i]] = schema[keys[i]];
                            }
                        }
                        else {
                            noGroup[keys[i]] = schema[keys[i]];
                        }
                    }
                }
                return noGroup;
            },
            /*
             * builds Rows and Columns viewConfiguration for a given group
             * @param: path {String} path of group
             * @param: group {Object} group to build rows and columns for
             * @param: uiSchemaModel {Object}
             * @Return {Array}
             * */
            buildRows: function (formType, path, group, uiSchemaModel) {
                var rows = [];
                var keys = Object.keys(self.util.abstractNoGroup(group));
                var columns = [];
                var oddElement = {
                    "columns": []
                };

                if (((keys.length % 2) != 0) && (keys.length > 0)) {
                    var lastKey = keys[keys.length - 1];
                    //build dataBindValue
                    var endPoint;
                    (path == "") ? endPoint = lastKey : endPoint = path + "." + lastKey;
                    endPoint = self.util.parsePath(endPoint);

                    var dataBindValue = endPoint.split('.');
                    dataBindValue[0] = dataBindValue[0] + "()";
                    dataBindValue = dataBindValue.join('.');

                    var view = self.util.viewMap[group[lastKey].get('type')];
                    var label = group[lastKey].get('label');
                    (!label) ? label = self.util.capitalizeSentence(lastKey) : label = label;
                    var visible = group[lastKey].get('viewable') || true;
                    if(typeof visible == 'undefined') visible = true;

                    if((formType == 'edit') || (typeof formType == 'undefined')){
                        var disabled = !(group[lastKey].get('editable') || false);
                    }
                    else if(formType == 'add'){
                        var disabled = false;
                    }

                    var element = {
                        "elementId": lastKey,
                        "view": view,
                        "viewConfig": {
                            "path": endPoint,
                            "dataBindValue": dataBindValue,
                            "class": "col-xs-6",
                            "label": label,
                            "disabled": disabled,
                            "visible" : visible
                        }
                    };

                    //override view
                    if ((typeof group[lastKey].get('view') != 'undefined') && (typeof group[lastKey].get('elementConfig') != 'undefined')) {
                        element.view = group[keys[i]].get('view');
                        element.viewConfig.elementConfig = group[keys[i]].get('elementConfig');
                        element.viewConfig.elementConfig.dataValueField = "id";
                        if ((typeof group[keys[i]].get('elementConfig').dataSource != 'undefined') && typeof group[keys[i]].get('elementConfig').data == 'undefined') {
                            element.viewConfig.elementConfig.dataTextField = "id";
                        }
                        else {
                            element.viewConfig.elementConfig.dataTextField = "text";
                        }
                    }
                    else {
                        //add password type
                        if (element.view == self.util.viewMap.string) {
                            if (lastKey.toLowerCase().indexOf('password') != -1) {
                                element.viewConfig.type = 'password';
                            }
                        }

                        //add elementConfig with static true/false on boolean types
                        if (element.view == self.util.viewMap.boolean) {
                            element.viewConfig.elementConfig = {
                                dataTextField: "text",
                                dataValueField: "id",
                                data: smwc.FLAGS_TRUE_FALSE_BOOLEAN_TYPE
                            }
                        }

                        //special handling for FormEditableGridView
                        if (element.view == 'FormEditableGridView') {
                            element.viewConfig.validation = group[keys[i]].get('validation');
                            element.viewConfig.collection = group[keys[i]].get('collection');
                            element.viewConfig.rowActions = group[keys[i]].get('rowActions');
                            element.viewConfig.gridActions = group[keys[i]].get('gridActions');
                            element.viewConfig.columns = [
                                {
                                    elementId: group[keys[i]].get('elementId'),
                                    name: group[keys[i]].get('name'),
                                    view: self.util.viewMap[group[keys[i]].get('items').type],
                                    viewConfig: {
                                        templateId: group[keys[i]].get('templateId') || self.util.templateIdMap[group[keys[i]].get('items').type],
                                        path: group[keys[i]].get('_path') || group[keys[i]].get('path'),
                                        dataBindValue: group[keys[i]].get('_path') + '()' || group[keys[i]].get('path') + '()'
                                    }
                                }
                            ];
                        }
                    }

                    if(visible != false){
                        //append odd element on columns
                        oddElement.columns.push(element);
                        var visible;
                    }

                    //remove odd element from keys
                    keys.pop();
                };

                for (var i = 0; i < keys.length; i++) {
                    if (group[keys[i]].property == 'object') return;
                    //build dataBindValue
                    var endPoint;
                    (path == "") ? endPoint = "properties." + keys[i] : endPoint = path + ".properties." + keys[i];
                    parsedEndPoint = self.util.parsePath(endPoint);

                    var dataBindValue = parsedEndPoint.split('.');

                    if (dataBindValue.length > 1) {
                        dataBindValue[0] = dataBindValue[0] + "()";
                    }

                    dataBindValue = dataBindValue.join('.');

                    var label = group[keys[i]].get('label');
                    (!label) ? label = self.util.capitalizeSentence(keys[i]) : label = label;

                    if((formType == 'edit') || (typeof formType == 'undefined')){
                        var disabled = !(group[keys[i]].get('editable') || false);
                    }
                    else if(formType == 'add'){
                        var disabled = false;
                    }

                    var visible = group[keys[i]].get('viewable');
                    if(typeof visible == 'undefined') visible = true;

                    var view = self.util.viewMap[group[keys[i]].get('type')];
                    var element = {
                        "elementId": keys[i],
                        "view": view,
                        "viewConfig": {
                            "path": parsedEndPoint,
                            "dataBindValue": dataBindValue,
                            "class": "col-xs-6",
                            "label": label,
                            "disabled": disabled,
                            "visible": visible
                        }
                    };

                    if ((typeof group[keys[i]].get('view') != 'undefined') && (typeof group[keys[i]].get('elementConfig') != 'undefined')) {
                        element.view = group[keys[i]].get('view');
                        element.viewConfig.elementConfig = group[keys[i]].get('elementConfig');
                        element.viewConfig.elementConfig.dataValueField = "id";
                        if ((typeof group[keys[i]].get('elementConfig').dataSource != 'undefined') && typeof group[keys[i]].get('elementConfig').data == 'undefined') {
                            element.viewConfig.elementConfig.dataTextField = "id";
                        }
                        else {
                            element.viewConfig.elementConfig.dataTextField = "text";
                        }
                    }
                    else {
                        //add password type
                        if (element.view == self.util.viewMap.string) {
                            if (keys[i].toLowerCase().indexOf('password') != -1) {
                                element.viewConfig.type = 'password';
                            }
                        }

                        //add elementConfig with static true/false on boolean types
                        if (element.view == self.util.viewMap.boolean) {
                            element.viewConfig.elementConfig = {
                                dataTextField: "text",
                                dataValueField: "id",
                                data: smwc.FLAGS_TRUE_FALSE_BOOLEAN_TYPE
                            }
                        }

                        //special handling for FormEditableGridView
                        if (element.view == 'FormEditableGridView') {
                            element.viewConfig.validation = group[keys[i]].get('validation');
                            element.viewConfig.collection = group[keys[i]].get('collection');
                            element.viewConfig.rowActions = group[keys[i]].get('rowActions');
                            element.viewConfig.gridActions = group[keys[i]].get('gridActions');
                            element.viewConfig.columns = [
                                {
                                    elementId: group[keys[i]].get('elementId'),
                                    name: group[keys[i]].get('name'),
                                    view: self.util.viewMap[group[keys[i]].get('items').type],
                                    viewConfig: {
                                        templateId: group[keys[i]].get('templateId') || self.util.templateIdMap[group[keys[i]].get('items').type],
                                        path: group[keys[i]].get('_path') || group[keys[i]].get('path'),
                                        dataBindValue: group[keys[i]].get('_path') + '()' || group[keys[i]].get('path') + '()'
                                    }
                                }
                            ];
                        }
                    }

                    //add element to viewConfig if visible is true
                    if(visible != false)
                    {
                        columns.push(element);
                    }

                    //push columns to rows if there are excatly 2 columns or if current key is the last element
                    if ((columns.length == 2) || (i == keys.length - 1)){
                        rows.push({"columns": columns});
                        columns = [];
                    }
                }

                //check there is an element in the key
                if (oddElement.columns.length > 0) {
                    //append oddElement on Schema to the previous row, if the previous row has only one element
                    if(rows[rows.length - 1].columns == 1){
                        rows[rows.length - 1].columns.push(oddElement);
                    }
                    else{
                        rows.push(oddElement);
                    }
                }

                return rows;
            },
            /*
             * Gets an object at a given path from a given schema
             * @param: path {String} path of a schema
             * @param: schema {Object}
             * @param: properties {Boolean} true, if you want to get the object @path. false if you want to get the object @path+".properties"
             * @Return {Object}
             * */
            getObject: function (path, schema, properties) {
                if (properties) {
                    //pre-process path
                    (path == "") ? path = "properties" : path += ".properties";
                } else {
                    if (path == "") {
                        return schema;
                    }
                }

                var keys = path.split('.');
                var object = schema[keys[0]];

                for (var i = 1; i < keys.length; i++) {
                    try {
                        object = object[keys[i]];
                    }
                    catch (e) {
                        console.warn("[util.getObject] returned 'undefined' on path ", path);
                        return 'undefined';
                    }
                }
                return object;
            },
            capitalizeSentence: function (sentence) {
                var word = sentence.split(" ");
                for (var i = 0; i < word.length; i++) {
                    word[i] = word[i].charAt(0).toUpperCase() + word[i].slice(1);
                }
                return word.join(" ");
            },
            /*
             * removes '.properties' from a given path
             * @Path: path of a schema
             * @Return {String}
             * */
            parsePath: function (path) {
                var path_components = path.split('.');
                for (var i = 0; i < path_components.length; i++) {
                    if (path_components[i] == 'properties') {
                        path_components.splice(i, 1);
                    }
                }
                return path_components.join('.');
            }
        };
    }
    return ViewConfigGenerator;
});