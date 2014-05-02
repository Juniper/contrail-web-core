function Utils() {
    var NULL = null;
    var NULL_STRING = "null";
    var EMPTY_STRING = "";
    var EMPTY_ARRAY = [];
    var EMPTY_OBJECT = {};
    var ALPHA_NUMERIC = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    var DEFAULT_DOMAIN = "default-domain";
    var PROJECT_ADMIN = "admin";
    var PROJECT_DEMO = "demo";
    
    this.getNull = function() {
        return NULL;
    }
    
    this.getNullString = function () {
        return NULL_STRING;
    }
    
    this.getEmptyString = function() {
        return EMPTY_STRING;
    }
    
    this.getEmptyArray = function() {
        return EMPTY_ARRAY;
    }

    this.getEmptyObject = function() {
        return EMPTY_OBJECT;
    }

    this.getRandomString = function(length) {
        var result = '';
    	if(isNaN(length)) {
    		length = 5;
    	}

        for (var i = length; i > 0; --i) 
        	result += ALPHA_NUMERIC[Math.round(Math.random() * (ALPHA_NUMERIC.length - 1))];
        
        return result;
    }
    
    this.getDefaultDomain = function() {
    	return DEFAULT_DOMAIN;
    }

    this.getProjectAdmin = function() {
    	return PROJECT_ADMIN;
    }

    this.getProjectDemo = function() {
    	return PROJECT_DEMO;
    }
    
    this.loadDom = function(domString) {
    	if(document.getElementById("test_container") === null) {
    		var test_container = document.createElement("div");
    		test_container.id = "test_container";
    		document.body.appendChild(test_container);
    	}
    	$("#test_container")[0].innerHTML = domString;
    }
    
    this.clearDom = function() {
    	$("#test_container")[0].innerHTML = "";
    	var infoWindow = $("#infoWindow"); 
    	if(infoWindow.hasOwnProperty("length") && infoWindow.length > 0) {
    		infoWindow.remove();
    		infoWindow = $();
    	}
    	var backdrop = $(".modal-backdrop"); 
    	if(backdrop.hasOwnProperty("length") && backdrop.length > 0) {
    		backdrop.remove();
    		backdrop = $();
    	}
    }
}
var u = new Utils();
var configObj = {};