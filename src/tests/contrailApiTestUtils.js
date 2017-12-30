var path = require("path");

function initTestConfig ()
{
    var config = require("../../config/config.global");
    config.orchestrationModuleEndPointFromConfig = true;
    process.mainModule.exports.corePath = path.resolve(__dirname, "../..");
    process.mainModule.exports.config = config;
}

exports.initTestConfig = initTestConfig;

