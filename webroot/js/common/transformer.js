/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var fs = require('fs');

var Transformer = function(){
    var self = this;

    this.run = function(){
        var currentDir = process.argv[1];
        var rootIndex = currentDir.indexOf('contrail-web-core');
        var smBaseDir = currentDir.substr(0,rootIndex) + 'contrail-web-server-manager/webroot/setting/sm/ui/js/schemas/';
        var views = ['cluster', 'image', 'package'/*, 'server'*/];

        views.forEach(function(view, i){
            var defaultSchemaPath = view + '.json';
            var customSchemaPath = view + '.custom.json';

            var defaultSchema = JSON.parse(JSON.stringify(require(smBaseDir + defaultSchemaPath)));
            var uiSchema = JSON.parse(JSON.stringify(defaultSchema));
            var customSchema = JSON.parse(JSON.stringify(require(smBaseDir + customSchemaPath)));

            console.log('Transforming ' + defaultSchemaPath + ' ...');
            self.transform('', defaultSchema, customSchema, uiSchema);

            var copyRightComment = "/* \n* Copyright (c) 2014 Juniper Networks, Inc. All rights reserved. \n*/\n\n";
            fs.writeFile(smBaseDir + view + '.ui.js', copyRightComment + "define([], function(){ return " + JSON.stringify(uiSchema, null, 4) + "});", function(error){
                if(error){
                    console.log("Error on Transforming " + smBaseDir + view + '.ui.js');
                    console.log(new Error(error));
                }
                else{
                    console.log('Generated ' + smBaseDir + view + '.ui.js');
                }
            });
        });
    }

    this.transform = function(path, defaultSchema, customSchema, uiSchema){

        //delete all properties except 'properties'
        self.cleanUpUISchema(uiSchema);

        //add default keys on root of current scope //excluding path
        uiSchema['viewable'] = true;

        //override default keys with custom keys
        if(typeof customSchema != 'undefined'){
            self.overrideWithCustomKeys(uiSchema, customSchema);
        }

        //add path
        uiSchema['path'] = path;

        //go to schemas ['properties']
        var _path; //path for recursion
        if(defaultSchema['type'] == 'array'){
            (path == "") ? _path = 'items' : _path = path + '.items';
            defaultSchema = defaultSchema['items'];
            uiSchema = uiSchema['items'];
            if(typeof customSchema != 'undefined'){
                customSchema = customSchema['items'];
            }
        }
        //go to schemas ['items']
        else if(defaultSchema['type'] == 'object'){
            (path == "") ? _path = 'properties' : _path = path + '.properties';
            uiSchema = uiSchema['properties'];
            defaultSchema = defaultSchema['properties']
            if(typeof customSchema != 'undefined'){
                customSchema = customSchema['properties'];
            }
        }

        var keys = Object.keys(uiSchema);
        for(var i = 0; i< keys.length; i++){
            //add properties to leaf nodes
            if((defaultSchema[keys[i]].type != 'object') && (defaultSchema[keys[i]].type != 'array')){
                if(typeof uiSchema[keys[i]] == 'object'){
                    self.cleanUpUISchema(uiSchema[keys[i]]);
                    uiSchema[keys[i]]['viewable'] = true;
                    uiSchema[keys[i]]['editable'] = true;

                    if(typeof customSchema != 'undefined') {
                        self.addDefaultProperties(uiSchema[keys[i]], defaultSchema[keys[i]]);
                        self.overrideWithCustomKeys(uiSchema[keys[i]], customSchema[keys[i]]);
                    }

                    //add path
                    uiSchema[keys[i]]['path'] = _path + '.' + keys[i];
                }
            }
            //recurse through the object and arrays
            else{
                var _customSchema,
                    _defaultSchema = defaultSchema[keys[i]],
                    _uiSchema = uiSchema[keys[i]];
                if(typeof customSchema != 'undefined') {
                    _customSchema = customSchema[keys[i]];
                }
                self.transform(_path + '.' + keys[i], _defaultSchema, _customSchema, _uiSchema);
            }
        }

    }

    this.cleanUpUISchema = function(uiSchema){
        var keys = Object.keys(uiSchema);
        for(var i = 0; i < keys.length; i++)
        {
            if((keys[i] != 'properties') && (keys[i] != 'items'))
            {
                delete uiSchema[keys[i]];
            }
        }
    }

    this.overrideWithCustomKeys = function(uiSchema, customSchema){
        var keys = Object.keys(customSchema)
        for(var i = 0; i < keys.length; i++){
            //don't override, if key is 'property' or 'items'
            if((keys[i] != 'properties') && (keys[i] != 'items') && (keys[i] != '_copyright')){
                uiSchema[keys[i]] = customSchema[keys[i]];
            }
        }
    }

    this.addDefaultProperties = function(uiSchema, defaultSchema){
        var keys = Object.keys(defaultSchema)
        for(var i = 0; i < keys.length; i++){
            //don't override, if key is 'property' or 'items'
            if((keys[i] != 'default') && (keys[i] != 'type') && (keys[i] != '_copyright')){
                uiSchema[keys[i]] = defaultSchema[keys[i]];
            }
        }
    }
}

new Transformer().run();