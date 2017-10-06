/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([
    'underscore',
    'lodash',
    'contrail-view',
    'jdorn-jsoneditor',
    'jquery-linedtextarea',
    'js/models/ConfigEditorModel'
    ],
    function(_, lodash, ContrailView, JsonEditor, JqueryLinedTextArea, ConfigEditorModel) {
        var configData = [], self;
        var configEditorModel = new ConfigEditorModel();
        var configEditorModalView = ContrailView.extend({
        el: $(contentContainer),
        render: function() {
        self = this;
        self.previousObj = [];
            self.deletedKeyStack = [];
            self.formRadioFlag = true;
            self.oldFormData = undefined;
            self.textAreaModel = undefined;
            self.oldAreaModel = undefined;
            self.ObjModel = {};
            var refs = [], oldJson;
            self.jsoneditor = undefined;
            self.keep_value = undefined;
            self.resetTextAreaModel = undefined;
            self.isDirty = false;
            window.optionsList = [];
            var viewConfig = this.attributes.viewConfig;
            var getschema = JSON.parse(cowu.deSanitize(JSON.stringify(viewConfig.schema)));
            var schema = $.extend(true, {}, getschema);
            if(viewConfig.json != undefined){
               oldJson = JSON.parse(cowu.deSanitize(JSON.stringify(viewConfig.json)));
            }else{
               oldJson = viewConfig.json;
            }
            var objConfig = {};
            if(schema != undefined){
            var objKey = Object.keys(schema.properties)[0];
            objConfig.objName = objKey;

            if(oldJson != undefined){
                var uuid = oldJson[Object.keys(oldJson)[0]]['uuid'];
                objConfig.uuid = uuid;
                var enumKeys = [];

                var option = {type: objConfig.objName + '/' + objConfig.uuid + '?exclude_back_refs=true&exclude_children=true' };
                    var objAjaxConfig = {
                            url: ctwc.URL_GET_CONFIG_DETAILS,
                            type:'POST',
                            data: self.getPostDataForGet(option)
                        };
                    contrail.ajaxHandler(objAjaxConfig, null, function(model){
                    var refsOrder = 50, refList = [], callCount = 0;
                    self.ObjModel = JSON.parse(cowu.deSanitize(JSON.stringify(model[0])));
                            var obj = self.ObjModel[Object.keys(self.ObjModel)[0]];
                            var schemaProperties = getValueByJsonPath(schema,'properties;'+ Object.keys(schema.properties)[0] +';properties');
                            for(var k in obj){
                                if(k.substring(k.length-5,k.length) === '_refs'){
                                    refs.push(k);
                                        if(schemaProperties[k].items == null || (k == 'network_policy_refs' && Object.keys(schema.properties)[0] !== 'security-logging-object')){
                                          refs.push(obj[k]);
                                        }else{
                                          refs.push(undefined);
                                        }
                                }
                            }
                            for(var j in schemaProperties){
                                if(j.substring(j.length-5,j.length) === '_refs'){
                                refList.push(j+':'+schemaProperties[j].url);
                                }
                                if(j == 'parent_type'){
                                    delete schemaProperties[j].enum;
                                    schema.properties[Object.keys(schema.properties)[0]].properties[j] = schemaProperties[j];
                                }
                            }
                            var hrefCount = refList.length;
                            $.each(refList, function (i, item) {
                                var url = item.split(':');
                                var options = {type:url[1].substring(1, url[1].length)};
                                var ajaxConfig = {
                                        url: ctwc.URL_GET_CONFIG_LIST,
                                        type:'POST',
                                        data: self.getPostDataForGet(options)
                                     };
                                contrail.ajaxHandler(ajaxConfig, null, function(model) {
                                    var optionsList = [];
                                    callCount++;
                                    refsOrder++;
                                    var objList = model[0][Object.keys(model[0])[0]];
                                    for(var k = 0; k < objList.length; k++){
                                        optionsList.push(objList[k].fq_name.join(':'));
                                    }
                                    var objKey = Object.keys(model[0])[0].split('-').join('_');
                                    var updatedKey = objKey.substring(0,objKey.length - 1) + '_refs';
                                    var schemaObj = Object.keys(schema.properties)[0];
                                    if(schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey].items != undefined && updatedKey != 'network_policy_refs'){
                                        schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey].items.properties.to = {
                                                "type": "string",
                                                "enum": optionsList
                                        }
                                    }else if(cowc.NETWORK_POLICY_INCLUDING_OBJ_LIST.indexOf(schemaObj) != -1 && updatedKey === 'network_policy_refs'){
                                        schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey].items.properties.to = {
                                                "type": "string",
                                                "enum": optionsList
                                        }
                                    }else{
                                        var sortedList = [];
                                        if(obj[updatedKey] !== undefined){
                                            if(obj[updatedKey][0].attr != undefined){
                                                var byMajor = obj[updatedKey].slice(0);
                                                byMajor.sort(function(a,b) {
                                                    return a.attr.sequence.major - b.attr.sequence.major;
                                                });
                                                obj[updatedKey] = byMajor;
                                            }
                                            for(var m = 0; m < obj[updatedKey].length; m++){
                                                sortedList.push(obj[updatedKey][m].to.join(':'));
                                            }
                                        }
                                        var orderedList = _.union(sortedList, optionsList);
                                        schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey]= {
                                                "type": "array",
                                                "format": "select",
                                                "propertyOrder": refsOrder,
                                                "uniqueItems": true,
                                                "items": {
                                                   "type": "string",
                                                   "enum": orderedList
                                                 }
                                        }
                                    }
                                    if(hrefCount == callCount){
                                    self.loadSchemaObject(schema, viewConfig, cowc.EDIT_DISABLE_KEYS, refs, oldJson, enumKeys, objConfig);
                                    }
                                },function(error){
                                    contrail.showErrorMsg(error.responseText);
                                });
                            });
                     },function(error){
                            contrail.showErrorMsg(error.responseText);
                     });
                }else{
                schema = self.setSchemaOrderForNewObj(schema)[0];
                var enumKeys = self.setSchemaOrderForNewObj(schema)[1];
                var urlParm = {}, count = 0;
                    var parentType = schema.properties[Object.keys(schema.properties)[0]].properties.parent_type.enum;
                    var objCount = parentType.length;
                    if(parentType.length > 0){
                        for(var z = 0; z < parentType.length; z++){
                        urlParm.objName = parentType[z]+ 's';
                            contrail.ajaxHandler(self.getParentObjUrl(urlParm), null, function(model) {
                                count++;
                                var options =[];
                                var modelKeys = Object.keys(model[0])[0];
                                options.push(modelKeys.substring(0,modelKeys.length-1));
                                var key = modelKeys.substring(0,modelKeys.length-1).split('-').join('_');
                                var fq_list= [], domainList = [], projectList = [];
                                for(var x = 0; x < model[0][Object.keys(model[0])].length; x++){
                                    var fq_name = model[0][Object.keys(model[0])][x]['fq_name'].join(':');
                                    fq_list.push(fq_name);
                                }
                                if(fq_list.length === 1){
                                    fq_list.push("");
                                }
                                options.push(key);
                                enumKeys.push(key);
                                schema.properties[Object.keys(schema.properties)[0]].properties[key] = {
                                        "required": "required",
                                        "type": "string",
                                        "enum": fq_list,
                                        "propertyOrder": 2,
                                        "display":'none'
                                };
                                window.optionsList.push(options);
                                if(count == objCount){
                                    schema.properties[Object.keys(schema.properties)[0]].properties.name = {
                                            "required": "required",
                                            "type": "string",
                                            "propertyOrder": 3,
                                    };
                                    if(schema.properties[Object.keys(schema.properties)[0]].properties.parent_type.enum.length === 1){
                                       schema.properties[Object.keys(schema.properties)[0]].properties.parent_type.enum.push("");
                                       schema.properties[Object.keys(schema.properties)[0]].properties.parent_type['parentKey'] = 'parentKey';
                                    }
                                    self.setNewHrefConfigObject(schema, viewConfig, cowc.ADD_DISABLE_KEYS, refs, oldJson, enumKeys, objConfig);
                                }
                            },function(error){
                                contrail.showErrorMsg(error.responseText);
                            });
                        }
                    }else{
                        schema.properties[Object.keys(schema.properties)[0]].properties.name = {
                                "required": "required",
                                "type": "string",
                                "propertyOrder": 3,
                        };
                        self.setNewHrefConfigObject(schema, viewConfig, cowc.ADD_DISABLE_KEYS, refs, oldJson, enumKeys, objConfig);
                    }
                }


            }else{
            console.log(cowc.EMPTY_SCHEMA);
            }
        },
        setNewHrefConfigObject:function(schema, viewConfig, disableKeys, refs, oldJson, enumKeys, objConfig){
        var self = this;
        var refsOrder = 100, refList = [], callCount = 0;
            requiredFields = [];
            schemaProperties = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
            for(var j in schemaProperties){
                if(schemaProperties[j].required == 'required'){
                    if(schemaProperties[j].type == 'object' && schemaProperties[j].properties != undefined){
                        var objStack = {};
                        objStack[j] = {};
                        var objProp = schemaProperties[j].properties;
                        for(var k in objProp){
                            if(objProp[k].required == 'required' || objProp[k].required == 'true'){
                                objStack[j][k]= objProp[k];
                            }
                        }
                        requiredFields.push(objStack);
                    }else{
                        requiredFields.push(j);
                    }
                 }
                if(j.substring(j.length-5,j.length) === '_refs'){
                refList.push(j+':'+schemaProperties[j].url);
                }
            }
            var hrefCount = refList.length;
            $.each(refList, function (i, item) {
                var url = item.split(':');
                var options = {type:url[1].substring(1, url[1].length)};
                var ajaxConfig = {
                        url: ctwc.URL_GET_CONFIG_LIST,
                        type:'POST',
                        data: self.getPostDataForGet(options)
                     };
                contrail.ajaxHandler(ajaxConfig, null, function(model) {
                    var optionsList = [];
                    refsOrder++;
                    callCount++;
                    var objList = model[0][Object.keys(model[0])[0]];
                    for(var k = 0; k < objList.length; k++){
                        optionsList.push(objList[k].fq_name.join(':'));
                    }
                    var objKey = Object.keys(model[0])[0].split('-').join('_');
                    var updatedKey = objKey.substring(0,objKey.length - 1) + '_refs';
                    var schemaObj = Object.keys(schema.properties)[0];
                    if(schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey].items != undefined && updatedKey != 'network_policy_refs'){
                        schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey].items.properties.to = {
                                "type": "string",
                                "enum": optionsList
                        }
                    }else if(cowc.NETWORK_POLICY_INCLUDING_OBJ_LIST.indexOf(schemaObj) != -1 && updatedKey === 'network_policy_refs'){
                        schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey].items.properties.to = {
                                "type": "string",
                                "enum": optionsList
                        }
                    }else{
                        schema.properties[Object.keys(schema.properties)[0]].properties[updatedKey]= {
                                "type": "array",
                                "format": "select",
                                "propertyOrder": refsOrder,
                                "uniqueItems": true,
                                "items": {
                                   "type": "string",
                                   "enum": optionsList
                                 }
                        }
                    }
                    if(hrefCount == callCount){
                    self.loadSchemaObject(schema, viewConfig, disableKeys, refs, oldJson, enumKeys, objConfig);
                    }
                },function(error){
                    contrail.showErrorMsg(error.responseText);
                });
            });
        },
        loadSchemaObject:function(schema, viewConfig, disableKeys, refs, oldJson, enumKeys, objConfig){
        var self = this;
        var schemaProp = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
            var updatedProp = self.setEmptyForChildEnum(schemaProp, schemaProp);
            schema.properties[Object.keys(schema.properties)[0]].properties = updatedProp;
            if(Object.keys(self.ObjModel).length == 0){
                var modelTitle = self.parseParentKeyLowerToUpper(Object.keys(schema.properties)[0]);
                self.generateConfigModal(modelTitle, viewConfig, oldJson, enumKeys, refs, disableKeys, schema, objConfig);
                self.loadSchemaBasedForm(self.ObjModel, schema, true, disableKeys);
                self.oldFormData = $.extend(true, {}, jsoneditor.getValue()[0]);
                var rawJson = $.extend(true, {}, jsoneditor.getValue()[0]);
                document.getElementById('rawJsonTextArea').value = '';
                self.resetTextAreaModel = rawJson;
                self.oldAreaModel = rawJson;
                document.getElementById('rawJsonTextArea').value = JSON.stringify(rawJson,null,2);
            }else{
                var parentKey = Object.keys(schema.properties)[0];
                var property = self.setOrderOfModifedSchema(self.modifiedExistingSchema(schema, self.ObjModel));
                var childProperty = self.changeExistingOrder(property);
                var schema = {};
                schema.type = 'object';
                schema.properties = {};
                schema.properties[parentKey] = {};
                schema.properties[parentKey]['type'] = 'object';
                schema.properties[parentKey]['collapse'] = true;
                schema.properties[parentKey]['properties'] = {};
                schema.properties[parentKey].properties = childProperty;
                var areaModel = $.extend(true,{},self.ObjModel);
                var oldModel = $.extend(true,{},self.ObjModel);
                var modelTitle = self.parseParentKeyLowerToUpper(Object.keys(self.ObjModel)[0]);
                self.generateConfigModal(modelTitle, viewConfig, oldJson, enumKeys, refs, disableKeys, schema, objConfig);
                self.ObjModel = self.updateModelForSchema(self.ObjModel, false, schema);
                self.loadSchemaBasedForm(self.ObjModel, schema, false, disableKeys);
                self.oldFormData = $.extend(true, self.ObjModel, jsoneditor.getValue()[0]);
                var oldCopy = self.updateModelForSchema(jsoneditor.getValue()[0], true, schema);
                self.resetTextAreaModel = $.extend(true,{},oldCopy);
                var newFormData = $.extend(true,{},self.ObjModel);
                document.getElementById('rawJsonTextArea').value = '';
                var rawJson = self.updateRefForTextArea(newFormData, refs);
                self.oldAreaModel = rawJson;
                document.getElementById('rawJsonTextArea').value = JSON.stringify(rawJson ,null,2);
            }
            $("input:radio[id=configJsonMode]").change(function() {
                var textAreaHeight = $('.modal-body').height() - 57 +'px';
                if(jsoneditor.getValue()[1].length > 0){
                    for(var i = 0; i < jsoneditor.getValue()[1].length; i++){
                        if(self.deletedKeyStack.indexOf(jsoneditor.getValue()[1][i]) == -1){
                            self.deletedKeyStack.push(jsoneditor.getValue()[1][i]);
                        }
                    }
                }
                var updatedData = self.removeDeletedItem(jsoneditor.getValue()[0], self.deletedKeyStack);
                var resetToFiled = self.resetToField(updatedData[Object.keys(updatedData)[0]], schema);
                updatedData[Object.keys(updatedData)[0]] = resetToFiled;
                var updatedModel = self.updateRefForTextArea(updatedData, refs);
                var prop = schema.properties[Object.keys(schema.properties)[0]].properties;
                if(Object.keys(self.ObjModel).length == 0){
                    var model = updatedModel[Object.keys(updatedModel)[0]];
                    if(model['parent_type'] === undefined){
                        model['parent_type'] = prop['parent_type'].enum[0];
                        if(model['parent_type'] !== undefined){
                            var child = model['parent_type'].split('-').join('_');
                            model[child] = prop[child].enum[0];
                            var parentStack = prop['parent_type'].enum;
                            for(var i = 0; i < parentStack.length; i++){
                                if(parentStack[i] != "" && parentStack[i] != model['parent_type']){
                                    var key = parentStack[i].split('-').join('_');
                                    delete model[key];
                                }
                            }
                        }
                   }else {
                        var child = model['parent_type'].split('-').join('_');
                        if(model[child] === undefined){
                            model[child] = prop[child].enum[0];
                            var parentStack = prop['parent_type'].enum;
                            for(var i = 0; i < parentStack.length; i++){
                                if(parentStack[i] != "" && parentStack[i] != model['parent_type']){
                                    var key = parentStack[i].split('-').join('_');
                                    delete model[key];
                                }
                            }
                        }else{
                            var parentStack = prop['parent_type'].enum;
                            for(var i = 0; i < parentStack.length; i++){
                                if(parentStack[i] != "" && parentStack[i] != model['parent_type']){
                                    var key = parentStack[i].split('-').join('_');
                                    delete model[key];
                                }
                            }
                        }
                    }
                    updatedModel[Object.keys(updatedModel)[0]] = model;
                }
                self.textAreaModel = updatedModel;
                document.getElementById('rawJsonTextArea').value = '';
                document.getElementById('rawJsonTextArea').value = JSON.stringify(self.textAreaModel, null, 2);
                $("#rawJsonEdit").css({"display": "block"});
                $("#jsonEditorContainer").css("display", "none");
                self.hideErrorPopup();
                self.formRadioFlag = false;
                if($('#rawJsonTextArea').closest('.linedtextarea').length == 0) {
                    $("#rawJsonTextArea").css({"height": textAreaHeight,"resize":"none"});
                    $('#rawJsonTextArea').linedtextarea();
                }
             });
             $("input:radio[id=configFormMode]").change(function() {
              try{
                  var json = JSON.parse(document.getElementById('rawJsonTextArea').value);
                  var fieldHide = false;
                  var model = self.updateRefForForm(json, schema);
                  var prop = schema.properties[Object.keys(schema.properties)[0]].properties;
                  if(Object.keys(self.ObjModel).length == 0){
                      if(model[Object.keys(model)[0]]['parent_type'] == ""){
                          model[Object.keys(model)[0]]['parent_type'] = prop['parent_type'].enum[0];
                          var child = model[Object.keys(model)[0]]['parent_type'].split('-').join('_');
                          model[Object.keys(model)[0]][child] = prop[child].enum[0];
                      }else if(model[Object.keys(model)[0]]['parent_type'] !== undefined){
                          var child = model[Object.keys(model)[0]]['parent_type'].split('-').join('_');
                          if(model[Object.keys(model)[0]][child] == ""){
                              model[Object.keys(model)[0]][child] = prop[child].enum[0];
                          }
                      }
                      self.loadSchemaBasedForm(model, schema, true, disableKeys);
                  }else{
                      self.loadSchemaBasedForm(model, schema, false, disableKeys);
                  }
                  $("#jsonEditorContainer").css("display", "block");
                  $("#rawJsonEdit").css("display", "none");
                  self.formRadioFlag = true;
                  self.hideErrorPopup();
              }catch(err){
                  document.getElementById('configJsonMode').checked = true;
                  self.showConfigErrorMsg(err);
              }
             });
        },
        parseJsonKeyLowerToUpper:function(key){
        var self = this;
            var splitedKey = key.split('_'); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toUpperCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join(' ');
        },
        getPostDataForGet:function (options) {
            var type = options.type;
            var fields = options.fields;
            var parent_id = options.parentId;
            var postData = {
               "data" : [ {
                   "type" : type
               } ]
            }
            if(fields != null && fields.length > 0) {
                postData['data'][0]['fields'] = fields;
            }
            if(parent_id != null && parent_id.length > 0) {
                postData['data'][0]['parent_id'] = parent_id;
            }
            return JSON.stringify(postData);
        },
        parseParentKeyLowerToUpper:function(key){
        var self = this;
            var splitedKey = key.split('-'); var strStack = [];
            for(var i = 0; i < splitedKey.length; i++){
                var captilizeStr = splitedKey[i].charAt(0).toUpperCase() + splitedKey[i].slice(1);
                strStack.push(captilizeStr);
            }
            return strStack.join(' ');
        },

        showConfigErrorMsg:function(msg){
        var self = this;
            var errorHolder = $("#config-error-msg-container");
            errorHolder.empty();
            errorHolder.text(msg);
            $('.modal-body').scrollTop(0);
            var errorContainer = $("#config-error-container");
            errorContainer.fadeIn(500);
            $("#remove-error-popup").on('click',function(){
                $("#config-error-container").css('display','none');
            });
        },

        hideErrorPopup:function(){
            $("#config-error-container").css('display','none');
        },

        dirtyCheckForObj:function(model){
            var self = this;
            for(var i in model){
                if(typeof model[i] === 'number' || typeof model[i] === 'string' || typeof model[i] === 'boolean'){
                        if(model[i] !== '' && model[i] !== 0 && model[i] !== false){
                            self.isDirty = true;
                        }
                    }else if(typeof model[i] === 'object'){
                        if(model[i].constructor !== Array){
                            self.dirtyCheckForObj(model[i]);
                        }else{
                            if(typeof self.checkArrayContainsObject(model[i]) === 'object'){
                                for(var j = 0; j < model[i].length; j++){
                                    self.dirtyCheckForObj(model[i][j]);
                                }
                            }else if(typeof self.checkArrayContainsString(model[i]) === 'string'){
                                for(var k = 0; k < model[i].length; k++){
                                    if(model[i][k] !== '' || model[i][k] !== 0){
                                        self.isDirty = true;
                                    }
                                }
                            }
                        }
                    }
            }
            return model;
        },

        checkArrayContainsObject:function(array){
            var obj;
            for(var i = 0; i < array.length; i++){
                if(typeof array[i] == 'object' && array[i].constructor !== Array){
                    obj = array[i];
                    break;
                }
            }
           return obj;
        },

        checkArrayContainsString:function(array){
            var str;
            for(var i = 0; i < array.length; i++){
                if(typeof array[i] == 'string' || typeof array[i] == 'number'){
                    str = array[i];
                    break;
                }
            }
           return str;
        },

        removeSelectedKeys:function(model, keyInfo){
            var self = this;
            for (var i in model) {
                 if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                        currentObj = i;
                        if(i == keyInfo.deletedItem){
                            if(keyInfo.directChild){
                                self.dirtyCheckForObj(model[i]);
                                if(!self.isDirty){
                                   model[i] = null;
                                }
                                self.isDirty = false;
                                keyInfo.directChild = false;
                            }else{
                                delete model[i];
                            }
                        }else{
                            self.removeSelectedKeys(model[i], keyInfo);
                        }
                 }else if(model[i] !== undefined && model[i] !== null){
                        if(model[i].constructor === Array){
                           if(model[i].length == 0 && i == keyInfo.deletedItem){
                               if(keyInfo.directChild){
                                   model[i] = [];
                                   keyInfo.directChild = false;
                               }else{
                                   delete model[i];
                               }
                           }else if(typeof self.checkArrayContainsObject(model[i]) === 'object' && i == keyInfo.parentKey){
                                if(keyInfo.keys.length == 0){
                                    delete model[i][keyInfo.deletedItem];
                                }else{
                                    for(var k = 0; k < model[i].length; k++){
                                       for(var c = 0; c < keyInfo.keys.length; c++){
                                            if(isNumber(keyInfo.keys[c])){
                                               var  key = parseInt(keyInfo.keys[c]);
                                               break;
                                            }
                                        }
                                        if(key == k){
                                            self.removeSelectedKeys(model[i][k], keyInfo);
                                        }
                                    }
                                }
                             }else if(keyInfo.keys.length == 0 && i == keyInfo.deletedItem && keyInfo.directChild){
                                 self.dirtyCheckForObj(model[i]);
                                 if(!self.isDirty){
                                     model[i] = [];
                                 }
                                 self.isDirty = false;
                                 keyInfo.directChild = false;
                             }else if(typeof self.checkArrayContainsObject(model[i]) !== 'object'){
                                if(isNumber(keyInfo.deletedItem) && i === keyInfo.adjecentParentKey){
                                     delete  model[i][keyInfo.deletedItem];
                                }
                            }else if(typeof self.checkArrayContainsObject(model[i]) === 'object' && isNumber(keyInfo.deletedItem) && i === keyInfo.adjecentParentKey){
                                delete  model[i][keyInfo.deletedItem];
                            }else if((typeof self.checkArrayContainsObject(model[i]) === 'object' && (isNumber(keyInfo.deletedItem) || !isNumber(keyInfo.deletedItem))) && (keyInfo.keys.indexOf(keyInfo.adjecentParentKey) != -1)){
                                for(var m = 0; m < model[i].length; m++){
                                    if(keyInfo.keys.indexOf(i) != -1){
                                        var index = keyInfo.keys.indexOf(i) + 1;
                                        var indexData = keyInfo.keys[index];
                                        if(m == parseInt(indexData)){
                                            self.removeSelectedKeys(model[i][m], keyInfo);
                                        }
                                    }
                                }
                            }
                        }else if(currentObj === keyInfo.adjecentParentKey || isNumber(keyInfo.adjecentParentKey)){
                            if(i === keyInfo.deletedItem){
                                if(model[i] === '' || model[i] === false){
                                    delete model[i];
                                }
                            }
                        }else if(i == keyInfo.deletedItem && keyInfo.directChild){
                            if(model[i] === '' || model[i] === false){
                                model[i] = null;
                            }
                            keyInfo.directChild = false;
                        }
                   }
             }
            return model;
        },

        removeUndefinedFromModel:function(model){
            var self = this;
            for (var i in model) {
                 if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                        self.removeUndefinedFromModel(model[i]);
                 }else if(model[i] !== undefined && model[i] !== null){
                        if(model[i].constructor === Array){
                            model[i] = model[i].filter(function(n){ return n != undefined });
                            if(model[i].length > 0){
                                if(typeof self.checkArrayContainsObject(model[i]) == 'object'){
                                    for(var j = 0; j < model[i].length; j++){
                                        self.removeUndefinedFromModel(model[i][j]);
                                    }
                                }
                            }
                        }
                  }
             }
            return model;
        },

        removeDeletedItem:function(model, deletedKeyPath){
        var self = this;
            var directChild = false;
            for(var i = 0; i < deletedKeyPath.length; i++){
                var keyInfo = {};
                var keys = deletedKeyPath[i].split(';');
                if(keys.length == 2){
                    directChild = true;
                }
                var lastKeys = keys[keys.length - 1];
                var delItem = keys.splice(keys.length - 1, 1);
                keyInfo.deletedItem = delItem[0]
                    keyInfo.adjecentParentKey = keys[keys.length - 1];
                    keyInfo.parentKey = keys[1];
                    keys.shift();
                    keys.shift();
                    keyInfo.keys = keys;
                    keyInfo.directChild = directChild;
                    model = self.removeSelectedKeys(model, keyInfo);
           }
           self.changeIndexOfDeletedKey(model);
           var newModel = self.removeUndefinedFromModel(model);
          return newModel;
        },

        changeIndexOfDeletedKey:function(updatedModel){
        var self = this;
            var deletedKeys = [];
            for(var i = 0;i < self.deletedKeyStack.length; i++){
                var keys = self.deletedKeyStack[i].split(';');
                var lastKeys = keys.pop();
                var path = keys.join(';');
                if(isNumber(lastKeys[0])){
                    if(getValueByJsonPath(updatedModel, path).length != 0){
                        deletedKeys.push(self.deletedKeyStack[i]);
                        delete self.deletedKeyStack[i];
                    }
                }
            }
            self.deletedKeyStack = self.deletedKeyStack.filter(function(n){ return n != undefined });
            deletedKeys.sort();
            for(var j = 0; j < deletedKeys.length; j++){
                var keys = [];
                var deletedKey  = deletedKeys[j].split(';');
                var lastItem = deletedKey.pop();
                var str = deletedKey.join(';');
                for(var k = 0; k < self.deletedKeyStack.length; k++){
                    if(self.deletedKeyStack[k].search(str) != -1){
                        var subStr = self.deletedKeyStack[k].substring(str.length+1);
                        var intKey = subStr.split(';')[0];
                        if(parseInt(lastItem) < parseInt(intKey)){
                            var keyIndex = parseInt(lastItem) + (parseInt(intKey) - parseInt(lastItem)) - 1;
                            var strArr = subStr.split(';');
                           strArr[0] = keyIndex;
                           var newStr = str +';'+ strArr.join(';');
                           self.deletedKeyStack[k] = newStr;
                        }
                    }
                }
            }
          return deletedKeys;
        },

        resetToField:function(model, schema){
        var self = this;
            var schemaProp = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
            for(var i in model){
                if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format == undefined){
                    for(var m = 0; m < model[i].length; m++){
                        if(model[i][m].to != undefined && typeof model[i][m].to != 'string'){
                            model[i][m].to = model[i][m].to.join(':');
                        }
                    }
                }
            }
            return model;
        },

        // ToDo Move into the stack and compare
        changeExistingOrder:function(schema){
            for(var i in schema){
                if(i == 'display_name'){
                    schema[i].propertyOrder = 1;
                }
                if(i == 'name'){
                    schema[i].propertyOrder = 2;
                }
                if(i == 'fq_name'){
                    schema[i].propertyOrder = 3;
                }
                if(i == 'uuid'){
                    schema[i].propertyOrder = 4;
                }
                if(i == 'parent_uuid'){
                    schema[i].propertyOrder = 5;
                }
            }
          return schema;
        },

        setOrderOfModifedSchema:function(updatedSchema){
        var self = this;
            var proOrder = 220, stringOrder = 5, booleanOrder = 150, arrayOrder = 200;
            for(var j in updatedSchema){
                if(j.substring(j.length-5,j.length) === '_refs' && updatedSchema[j].format == 'select'){}
                else if(updatedSchema[j].type === 'number' || updatedSchema[j].type === 'string'){
                    stringOrder++;
                    updatedSchema[j] = self.addEmptyValueForEnum(updatedSchema[j]);
                    updatedSchema[j].propertyOrder = stringOrder;
                }else if(updatedSchema[j].type === 'boolean'){
                    booleanOrder++;
                    updatedSchema[j].propertyOrder = booleanOrder;
                }else if(updatedSchema[j].type === 'object'){
                    proOrder++;
                    updatedSchema[j].propertyOrder = proOrder;
                }else if(updatedSchema[j].type === 'array'){
                    arrayOrder++;
                    updatedSchema[j].propertyOrder = arrayOrder;
                }
            }
            return updatedSchema;
        },

        setEmptyForChildEnum:function(properties, oldProperties){
            var self = this;
            for(var i in properties){
                if(properties[i].type == 'object'){
                    if(properties[i].properties !== undefined){
                        self.setEmptyForChildEnum(properties[i].properties, oldProperties);
                    }
                }else if(properties[i].type == 'array'){
                    if(properties[i].items !== undefined && properties[i].format === undefined){
                        if(properties[i].items.properties !== undefined){
                            self.setEmptyForChildEnum(properties[i].items.properties, oldProperties);
                        }else if(properties[i].items.type === 'string' && properties[i].items.enum !== undefined){
                              if(properties[i].items.enum[0] != ''){
                                  properties[i].items.enum.unshift('');
                              }
                        }
                    }
                }else if(properties[i].type == 'string' && properties[i].enum !== undefined){
                    if(!oldProperties.hasOwnProperty(i)){
                        if(properties[i].enum[0] != ''){
                            properties[i].enum.unshift('');
                        }
                    }
                }
            }
            return properties;
        },

        modifiedExistingSchema:function(schema, ObjModel){
        var self = this;
            var json = getValueByJsonPath(ObjModel,Object.keys(ObjModel)[0]);
            var schema = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
            for (var i in json) {
                 for(var j in schema){
                      if(!schema.hasOwnProperty(i)){
                          if(typeof json[i] === 'number' || typeof json[i] === 'string'){
                              schema[i] = {type: typeof json[i]};
                          }else if(json[i] !== null){
                              if(json[i].constructor === Array){
                                  if(typeof json[i][0] !== 'object'){
                                      if(i=== 'fq_name'){
                                           schema[i] = {type: 'string'}
                                       }else{
                                           schema[i] = {type: 'array'}
                                       }
                                    }
                              }
                          }else if(typeof json[i] === 'boolean') {
                              schema[i] = {type: typeof json[i],format: 'checkbox'};
                          }
                        }
                   }
             }
            return schema;
        },

        addEmptyValueForEnum:function(schemaProp){
            if(schemaProp.enum !== undefined){
                if(typeof schemaProp.enum[0] == 'object'){
                    delete schemaProp.enum;
                }else{
                    if(schemaProp.enum[0] != ""){
                        schemaProp.enum.unshift("");
                    }
                }
            }
          return schemaProp;
        },

        generateConfigModal:function(title, viewConfig, oldJson, enumKeys, refs, disableKeys, schema, objConfig){
        var self = this;
            cowu.createModal({
                'modalId': ctwc.MODAL_CONFIG_EDITOR_CONTAINER,
                'className': 'modal-980',
                'title': title,
                'body': cowc.CONFIG_EDITOR_MODAL_LAYOUT,
                'onSave': function(){
                    self.deletedKeyStack = [];
                    if(self.formRadioFlag){
                        var editedJson = jsoneditor.getValue()[0];
                        var oldKeys = self.oldFormData[Object.keys(self.oldFormData)[0]];
                        var updatedKeys = editedJson[Object.keys(editedJson)[0]];
                        if(updatedKeys.fq_name != undefined){
                            if(typeof updatedKeys.fq_name != 'string'){
                                var fqName = updatedKeys.fq_name.join(':');
                                updatedKeys.fq_name = fqName;
                            }
                        }
                        var objDiff = lodash.diff(oldKeys, updatedKeys, false, oldJson, enumKeys);
                        var schemaProp = schema.properties[Object.keys(editedJson)[0]].properties;
                        var updatedRefs = self.updateModelRefsForForm(objDiff, schemaProp, refs);
                        var updatedObj = {};
                        updatedObj[Object.keys(editedJson)[0]] = updatedRefs;
                        if(oldKeys.uuid !== undefined){
                            updatedObj[Object.keys(updatedObj)[0]].uuid = oldKeys.uuid;
                            self.saveConfigObject(updatedObj, viewConfig, objConfig);
                        }else{
                            self.saveNewObject(updatedObj, viewConfig);
                        }
                    }else{
                        try{
                            var json = JSON.parse(document.getElementById('rawJsonTextArea').value);
                            var diff = lodash.diff(self.oldAreaModel[Object.keys(self.oldAreaModel)[0]], json[Object.keys(json)[0]], false, oldJson, enumKeys);
                            var schemaProp = schema.properties[Object.keys(json)[0]].properties;
                            diff = self.updatedRefsForTextArea(diff, schemaProp);
                            var areaObj = {};
                            areaObj[Object.keys(self.oldAreaModel)[0]] = diff;
                            if(self.oldAreaModel[Object.keys(self.oldAreaModel)[0]].uuid !== undefined){
                                areaObj[Object.keys(areaObj)[0]].uuid = self.oldAreaModel[Object.keys(self.oldAreaModel)[0]].uuid;
                                self.saveConfigObject(areaObj, viewConfig, objConfig);
                            }else{
                                self.saveNewObject(areaObj, viewConfig);
                            }
                        }catch(err){
                            self.showConfigErrorMsg(err);
                        }
                    }
                 },
                'onCancel': function() {
                    self.deletedKeyStack = [];
                    $("#json-editor-form-view").modal('hide');
                },
                'onReset': function() {
                    self.deletedKeyStack = [];
                    if(self.formRadioFlag){
                        self.hideErrorPopup();
                        if(Object.keys(self.ObjModel).length == 0){
                            self.loadSchemaBasedForm({}, schema, true, disableKeys);
                        }else{
                            self.loadSchemaBasedForm(self.ObjModel, schema, false, disableKeys);
                        }
                    }else{
                        self.resetTextArea();
                    }
                }
            });
        },

        saveConfigObject: function(data, viewConfig, objConfig){
            var reqUrlHash;
            var self = this;
            if (objConfig.objName[objConfig.objName.length - 1] == 's') {
                reqUrlHash = objConfig.objName.slice(0, -1);
            } else {
                reqUrlHash = objConfig.objName;
            }
            configEditorModel.addEditConfigData (data,
                    '/'+reqUrlHash+'/'+data[Object.keys(data)[0]]['uuid'] ,
                    true,
                    {
                        init: function () {
                        },
                        success: function () {
                            $("#json-editor-form-view").modal('hide');
                            if(viewConfig.onSaveCB != undefined){
                             viewConfig.onSaveCB();
                            }
                        },
                        error: function (error) {
                        self.showConfigErrorMsg(error.responseText);
                        }
                    }
            );
         },

         saveNewObject: function(model, viewConfig){
             var self = this;
             if(model[Object.keys(model)[0]]['parent_type'] != '' && model[Object.keys(model)[0]]['parent_type'] != undefined){
                 for(var i = 0; i < optionsList.length; i++){
                     if(optionsList[i][0] === model[Object.keys(model)[0]]['parent_type']){
                         var key = optionsList[i][1];
                         if(model[Object.keys(model)[0]][key] != undefined && model[Object.keys(model)[0]]['name'] != undefined){
                             var fqName = model[Object.keys(model)[0]][key].split(':');
                             fqName.push(model[Object.keys(model)[0]]['name']);
                             model[Object.keys(model)[0]].fq_name = fqName;
                             delete model[Object.keys(model)[0]][key];
                         }else if(model[Object.keys(model)[0]]['name'] != undefined){
                             var fqName = [];
                             fqName.push(model[Object.keys(model)[0]]['name']);
                             model[Object.keys(model)[0]].fq_name = fqName;
                             delete model[Object.keys(model)[0]][key];
                         }
                     }else {
                         var remainKey = optionsList[i][0].split('-').join('_');
                         if(model[Object.keys(model)[0]].hasOwnProperty(remainKey)){
                             delete model[Object.keys(model)[0]][remainKey];
                         }
                     }
                 }
             }else if(model[Object.keys(model)[0]]['parent_type'] === undefined){
                 var fqName = [];
                 fqName.push(model[Object.keys(model)[0]]['name']);
                 model[Object.keys(model)[0]].fq_name = fqName;
             }
             try{
             configEditorModel.addEditConfigData (model, '/'+ Object.keys(model)[0]+'s', false,
                         {
                             init: function () {
                             },
                             success: function () {
                                 $("#json-editor-form-view").modal('hide');
                                 if(viewConfig.onSaveCB != undefined){
                                  viewConfig.onSaveCB();
                                 }
                             },
                             error: function (error) {
                             self.showConfigErrorMsg(error.responseText);
                             }
                         }
                 );
              }catch(err){
              self.showConfigErrorMsg(err);
              }
        },

        updateModelForSchema:function(model, isString, schema){
        var self = this;
            var schemaProp = schema.properties[Object.keys(schema.properties)[0]].properties;
            for (var i in model) {
                if (typeof model[i] === 'object' && model[i] !== null && model[i].constructor !== Array) {
                       self.updateModelForSchema(model[i], isString, schema);
                }else if( model[i] !== null && model[i] !== undefined){
                    if(model[i].constructor === Array){
                        if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format !== undefined){
                            model[i] = self.checkExistingRefs(model[i]);
                        }else if(typeof model[i][0] === 'object'){
                            for(var j = 0; j < model[i].length; j++){
                                self.updateModelForSchema(model[i][j], isString, schema);
                            }
                        }else if(i === 'fq_name' || i === 'to'){
                            var item = model[i].join(':');
                            model[i] = item;
                        }
                    }else if((i === 'fq_name' || i === 'to') && typeof model[i] == 'string'){
                        if(isString){
                            var item = model[i].split(':');
                            model[i] = item;
                        }
                    }
                }
            }
          return model;
        },

        updateModelRefsForForm:function(diffObj, schemaProp, refs){
        var self = this;
            var oldRefs = [];
            for(var i in diffObj){
                if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format !== undefined){
                    var arr = [], refCount = -1;
                    if(refs.indexOf(i) != -1){
                        var oldVal = refs[refs.indexOf(i)+1];
                    }
                    if(oldVal !== undefined){
                        for(var l = 0; l < oldVal.length; l++){
                            var toData = oldVal[l].to.join(':');
                            oldRefs.push(toData);
                            oldRefs.push(oldVal[l]);
                        }
                    }
                    for(var j=0; j < diffObj[i].length; j++){
                        if(i == 'network_policy_refs'){
                            var obj={},attrObj = {},sequenceObj = {};
                            if(oldRefs.indexOf(diffObj[i][j]) != -1){
                                refCount++;
                                var refObj = oldRefs[oldRefs.indexOf(diffObj[i][j])+1];
                                refObj.attr.sequence.major = refCount;
                                arr.push(oldRefs[oldRefs.indexOf(diffObj[i][j])+1]);
                            }else{
                                refCount++;
                                var splitStr = diffObj[i][j].split(':');
                                obj.to = splitStr;
                                attrObj.timer = null;
                                sequenceObj.major = refCount;
                                sequenceObj.minor = 0;
                                attrObj.sequence = sequenceObj;
                                obj.attr = attrObj;
                                arr.push(obj);
                            }
                         }else{
                            var obj={};
                            var splitStr = diffObj[i][j].split(':');
                            obj.to = splitStr;
                            arr.push(obj);
                        }
                    }
                    diffObj[i] = arr;
                }else if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format == undefined){
                    for(var m = 0; m < diffObj[i].length; m++){
                        if(typeof diffObj[i][m].to == 'string'){
                            diffObj[i][m].to = diffObj[i][m].to.split(':');
                        }
                    }
                }
            }
            return diffObj;
        },

        updatedRefsForTextArea:function(diffObj, schemaProp){
        var self = this;
            var refCount = -1;
            for(var i in diffObj){
                if(i == 'network_policy_refs'){
                    for(var j = 0; j < diffObj[i].length; j++){
                        if(diffObj[i][j].attr == undefined){
                            var attrObj = {},sequenceObj = {};
                            refCount++;
                            attrObj.timer = null;
                            sequenceObj.major = refCount;
                            sequenceObj.minor = 0;
                            attrObj.sequence = sequenceObj;
                            diffObj[i][j].attr = attrObj;
                        }else{
                            refCount++;
                            diffObj[i][j].attr.sequence.major  = refCount;
                        }
                    }
                }else if(i.substring(i.length-5,i.length) === '_refs' && schemaProp[i].format == undefined){
                    for(var m = 0; m < diffObj[i].length; m++){
                        diffObj[i][m].to = diffObj[i][m].to.split(':');
                    }
                }
            }
            return diffObj;
        },

        resetTextArea:function(){
        var self = this;
            document.getElementById('rawJsonTextArea').value = '';
            document.getElementById('rawJsonTextArea').value = JSON.stringify(self.resetTextAreaModel , null, 2);
            self.hideErrorPopup();
        },

        checkExistingRefs:function(model){
            var toList =[];
            for(var i = 0; i< model.length; i++){
                if(model[i].to !== undefined){
                    var to = model[i].to.join(':');
                    toList.push(to);
                }
            }
            if(toList.length == 0){
                return model;
            }else{
                return toList;
            }
        },

        loadSchemaBasedForm:function(ObjModel, schema, hideFlag, disableKeys){
        var self = this;
            var startval;
            if(self.jsoneditor !== undefined){
                startval = (self.jsoneditor && self.keep_value)? self.jsoneditor.getValue()[0] : ObjModel;
            }else{
                startval = (self.jsoneditor && self.keep_value)? self.jsoneditor.getValue() : ObjModel;
            }
            var rowJsonContainer = $('.object-json-view');
            var formContainer = document.getElementById('jsonEditorContainer');
            if(self.jsoneditor) self.jsoneditor.destroy();
            JSONEditor.defaults.options.theme = 'bootstrap2';
            self.jsoneditor = new JSONEditor(formContainer,{
                schema: schema,
                startval: startval,
                theme: 'bootstrap2',
                iconlib: 'fontawesome3',
                disable_edit_json: true,
                disable_properties: false,
                no_additional_properties :false,
                required_by_default : false,
                disable_array_delete:true,
                disable_array_delete_all_rows: true,
                disable_array_delete_last_row : true,
                disable_array_reorder:true,
                remove_empty_properties: false,
                unDeletableProperty : self.upperCaseUnEditableProp(disableKeys),
                fieldHide : hideFlag
             });
            window.jsoneditor = self.jsoneditor;
            rowJsonContainer.value = '';
        },

        upperCaseUnEditableProp:function(prop){
        var self = this;
            var upperCaseProp = [];
            for(var i = 0; i < prop.length; i++){
                var updatedText = self.parseJsonKeyLowerToUpper(prop[i]);
                upperCaseProp.push(updatedText);
            }
            return upperCaseProp;
        },

        updateRefForTextArea:function(newModel, refs){
        var self = this;
            var formModel = newModel[Object.keys(newModel)[0]];
            var fileds, lastIndex, toFields;
            for(var j in formModel){
                if(j.substring(j.length-5,j.length) === '_refs'){
                    var refStack = [];
                    if(refs.indexOf(j) != -1 && refs[refs.indexOf(j) + 1] !== undefined){
                        var refVal = refs[refs.indexOf(j) + 1];
                        var preRefs = [];
                        for(var k =0; k < formModel[j].length; k++){
                            fileds = formModel[j][k].split(':');
                            lastIndex = fileds[fileds.length - 1];
                            for(var l = 0; l < refVal.length; l++){
                                toFields = refVal[l].to;
                                if(lastIndex === toFields[toFields.length - 1]){
                                    preRefs.push(toFields[toFields.length - 1]);
                                    refStack.push(refVal[l]);
                                }
                            }
                        }
                        for(var m = 0; m < formModel[j].length; m++){
                            fileds = formModel[j][m].split(':');
                            lastIndex = fileds[fileds.length - 1];
                            if(preRefs.indexOf(lastIndex) == -1){
                                var obj={};
                                obj.to = fileds;
                                refStack.push(obj);
                            }
                        }
                    }else if(formModel[j].length > 0 && refs.indexOf(j) == -1){
                        for(var n = 0; n < formModel[j].length; n++){
                            var obj={};
                            if(typeof formModel[j][n] =='string'){
                                obj.to = formModel[j][n].split(':');
                                refStack.push(obj);
                            }else{
                                refStack.push(formModel[j][n]);
                            }
                        }
                    }
                    if(refs[refs.indexOf(j) + 1] === undefined && refs[refs.indexOf(j)] == j){
                        formModel[j] = formModel[j];
                    }else{
                        formModel[j] = refStack;
                    }
                }
             }
            if(formModel['fq_name'] !== undefined){
                if(formModel['fq_name'].constructor !== Array){
                    var fqName = formModel['fq_name'].split(':');
                    formModel['fq_name'] = fqName;
                }
            }
            newModel[Object.keys(newModel)[0]] = formModel;
         return newModel;
        },

        updateRefForForm:function(json, schema){
        var self = this;
            var data = json[Object.keys(json)[0]];
            var schemaProp = schema.properties[Object.keys(schema.properties)[0]].properties;
            var refStack = [];
            for(var i in data){
                if(i.substring(i.length-5,i.length) === '_refs'){
                  if(schemaProp[i].format !== undefined){
                      for(var j = 0; j < data[i].length; j++){
                          var toFields = data[i][j].to.join(':');
                          refStack.push(toFields);
                      }
                      data[i] = refStack;
                  }
                }
            }
            if(data['fq_name'] !== undefined){
                if(data['fq_name'].constructor === Array){
                    var fqName = data['fq_name'].join(':');
                    data['fq_name'] = fqName;
                }
            }
            json[Object.keys(json)[0]] = data;
            return json;
        },

        getParentObjUrl:function(objParam) {
        var self = this;
            var options = {type: objParam.objName};
            var ajaxConfig = {
                    url: ctwc.URL_GET_CONFIG_LIST,
                    type:'POST',
                    data:self.getPostDataForGet(options)
                 };
           return ajaxConfig;
         },

         setSchemaOrderForNewObj: function(schema){
             var schemaProperties = getValueByJsonPath(schema,'properties;'+Object.keys(schema.properties)[0]+';properties');
             var proOrder = 220, stringOrder = 5, booleanOrder = 150, arrayOrder = 200, secondOption = undefined,
             enumKeys = [], objStack = [];
             for(var j in schemaProperties){
                 if(schemaProperties[j].type === 'number' || schemaProperties[j].type === 'string'){
                     stringOrder++;
                     if(schemaProperties[j].enum != undefined){
                         enumKeys.push(j);
                     }
                     //Only for Alarms Object
                     if(j === 'alarm_severity'){
                         enumKeys.push(j);
                     }
                     if(j == 'parent_type'){
                             schemaProperties[j].propertyOrder = 1;
                     }else{
                             schemaProperties[j].propertyOrder = stringOrder;
                     }
                  }else if(schemaProperties[j].type === 'boolean'){
                     booleanOrder++;
                     schemaProperties[j].propertyOrder = booleanOrder;
                 }else if(schemaProperties[j].type === 'array'){
                     arrayOrder++;
                     schemaProperties[j].propertyOrder = arrayOrder;
                 }else if(schemaProperties[j].type === 'object'){
                     proOrder++;
                     schemaProperties[j].propertyOrder = proOrder;
                 }
             }
             schema.properties[Object.keys(schema.properties)[0]].properties = schemaProperties;
             objStack.push(schema);
             objStack.push(enumKeys);
             return objStack;
         }
    });
    return configEditorModalView;
});