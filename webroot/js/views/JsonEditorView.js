/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([
    'underscore',
    'contrail-view',
    'json-editor',
    'ajv'
], function (_, ContrailView, JSONEditor, Ajv) {
    var JSONEditorView = ContrailView.extend({
        render: function () {

            var self = this;
            var onError = false;
            var ajv = Ajv({ allErrors: true, verbose: true, removeAdditional: true  });
            var validate = ajv.compile(self.model.schema());

            var editorTempl = contrail.getTemplate4Id(cowc.TMPL_JSON_EDITOR_VIEW),
                viewConfig = this.attributes.viewConfig,
                elId = this.attributes.elementId;

            this.$el.html(editorTempl({viewConfig: viewConfig, elementId: elId}));
            var jsonContainer = document.getElementById(cowc.ID_JSON_EDITOR);
            var jsonOptions = {
                schema : self.model.schema(),
                ajv : ajv,
                modes: [ cowc.JSON_EDITOR_MODE_TREE,cowc.JSON_EDITOR_MODE_CODE,cowc.JSON_EDITOR_MODE_TEXT,cowc.JSON_EDITOR_MODE_FORM ],
                onChange: function () {
                    try{
                        var valid = validate(jsonEditor.get());
                        self.model.model().attributes = jsonEditor.get();

                        //if error button on UI is on, disable save button
                        var isValidJSON = validate(jsonEditor.get()) && keysValid(self.model.model().attributes, self.model.schema());
                        toggleSaveButton(isValidJSON);
                    }catch(e){
                        toggleSaveButton(false);
                    }

                }
            };
            var jsonEditor = new JSONEditor(jsonContainer, jsonOptions);

            jsonEditor.setMode(cowc.JSON_EDITOR_MODE_TREE);
            jsonEditor.set(self.model.model()._originalAttributes.json);
            jsonEditor.expandAll();

            var isValidJSON = validate(jsonEditor.get());
            toggleSaveButton(isValidJSON);
        }
    });

    /*
    * @Return
    *   True : if keys of the json matchs the keys specified by the json schema
    *   False: if not
    * @Params
    *   json : json data
    *   schema : json schema
    * */
    function keysValid(json, schema) {
        var jsonKeys = Object.keys(json);
        var schemaKeys = Object.keys(schema["properties"]);
        var tempSchemaKeys = Object.keys(schema["properties"]);
        var valid;
        if(!arraysItemsEqual(jsonKeys, tempSchemaKeys))
        {
            return false;
        }
        schemaKeys.forEach(function (key, i) {
            if(schema["properties"][key]["type"] == "object")
            {
                keysValid(json[key], schema["properties"][key]);
            }
        });
        return true;
    };

    /*
     * @Return
     *   True : if items in array1 equals items array2
     *   False: if not
     * @Params
     *   array1 : first array
     *   array2 : second array
     * */
    function arraysItemsEqual(array1, array2) {
        if(array1.length != array2.length)
        {
            return false;
        }
        for(var i = 0; i < array1.length; i++)
        {
            if(array2.indexOf(array1[i]) != -1)
            {
                array2.splice(array2.indexOf(array1[i]), 1);
            }
            else
            {
                return false;
            }
        }
        return true;
    };

    /*
     * @Params
     *   isValidJSON : Boolean
     * */
    function toggleSaveButton(isValidJSON) {
        if(!isValidJSON) {
            $(".btnSave").prop('disabled', true);
        } else {
            $(".btnSave").removeAttr('disabled');
        }
    };

    return JSONEditorView;
});