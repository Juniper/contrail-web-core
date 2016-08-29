/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

define([], function () {
    var UISchemaModel = function(defaultSchema, stSchema, customSchema){
        var self = this;
        this.copyObj = function(obj){
            return JSON.parse(JSON.stringify(obj));
        };
        this.schema = self.copyObj(defaultSchema);
        this.schemas = {
            defaultSchema : defaultSchema,
            stSchema : stSchema,
            customSchema : customSchema
        };

        this.addGettersAndSetters = function(path, schema){
            var keys = Object.keys(schema);
            var temp_path;
            if((schema.type == 'object') && (typeof schema.properties == 'object'))
            {
                (path == "") ? endPoint = keys[i] : endPoint = path + "." + keys[i];

                //pass path instead of endPoint b/c it's an object and doesn't have an end point
                self.addGetSetMethods(path, schema);
                (path == "") ? temp_path = "properties" : temp_path = path + ".properties";
                if(typeof schema['properties'] == 'undefined')
                {

                    self.addGettersAndSetters(temp_path, schema);
                }
                else
                {
                    self.addGettersAndSetters(temp_path, schema['properties']);
                }

            }
            else{
                for(var i = 0; i < keys.length; i++)
                {
                    if(schema[keys[i]].type == 'object')
                    {
                        (path == "") ? endPoint = path : endPoint = path + "." + keys[i];
                        self.addGettersAndSetters(endPoint, schema[keys[i]]);
                    }
                    else
                    {
                        var getterAndSetter = {};
                        (path == "") ? endPoint = path : endPoint = path + "." + keys[i];
                        self.addGetSetMethods(endPoint, getterAndSetter)
                        schema[keys[i]] = getterAndSetter;
                    }
                }
            }
        };

        this.addGetSetMethods = function(path, schema){
            if(typeof path == 'undefined')
            {
                console.warn("[WARNING] : Path specified as 'undefined' is set to ''.");
                path = '';
            }
            schema.get = function(key){
                if(typeof self.getObject(path, self.schemas.customSchema) != 'undefined')
                {
                    if(typeof self.getObject(path, self.schemas.customSchema)[key] != 'undefined')
                    {
                        return self.getObject(path, self.schemas.customSchema)[key];
                    }
                }
                if(typeof self.getObject(path, self.schemas.stSchema) != 'undefined')
                {
                    if(typeof self.getObject(path, self.schemas.stSchema)[key] != 'undefined')
                    {
                        return self.getObject(path, self.schemas.stSchema)[key];
                    }
                }
                if(typeof self.getObject(path, self.schemas.defaultSchema) != 'undefined')
                {
                    return self.getObject(path, self.schemas.defaultSchema)[key];
                }
            };

            schema.set = function(key, value, schemaType){
                (typeof schemaType == 'undefined') ? schemaType = 'customSchema' : schemaType = schemaType;

                self.getObject(path, self.schemas[schemaType])[key] = value;
            };
        }

        this.getObject = function (path, schema) {
            if(path == '') { return schema; }
            var keys = path.split('.');
            var object = schema[keys[0]];

            for (var i = 1; i < keys.length; i++) {
                try {
                    object = object[keys[i]];
                }
                catch (e) {
                    return 'undefined';
                }
            }
            return object;
        }

        this.addGettersAndSetters("", self.schema);
    };

    return UISchemaModel;
});