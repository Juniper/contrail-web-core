/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    var JsonValidator = function (prefixId, model) {
        var self = this;
        self.prefixId = prefixId;
        self.viewConfigs = [];
        self.rootViewPath = '';

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

        this.util = {
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
    return JsonValidator;
});
