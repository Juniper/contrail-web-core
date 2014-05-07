/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var chai = require('chai'),
	should = chai.should(),
	config = require('../../config/config.global.js'),
	request = require('request');

describe('config', function() {
	describe('.vnconfig-api-server', function() {
		it('should always be configured', function() {
			config.cnfg.server_ip.should.be.a('string');
		});

		it('should get a 200 response', function(done) {
			var url = 'http://' + config.cnfg.server_ip + ':' + config.cnfg.server_port + '/';
			request({url: url, timeout: 1000}, function(error, response, body) {
				should.not.exist(error);
				response.statusCode.should.equal(200);
				done();
			});
		});
	});

	describe('.ops-api-server', function() {
		it('should always be configured', function() {
			config.analytics.server_ip.should.be.a('string');
		});

		it('should get a 200 response', function(done) {
			var url = 'http://' + config.analytics.server_ip + ':' + config.analytics.server_port + '/';
			request({url: url, timeout: 1000}, function(error, response, body) {
				should.not.exist(error);
				response.statusCode.should.equal(200);
				done();
			});
		});
	});

	describe('.identity-server', function() {
		it('should always be configured', function() {
			config.identityManager.ip.should.be.a('string');
		});

		it('should get a 200 response', function(done) {
			var url = 'http://' + config.identityManager.ip + ':' +
            config.identityManager.port + '/v2.0/';
			request({url: url, timeout: 1000}, function(error, response, body) {
				should.not.exist(error);
				response.statusCode.should.equal(200);
				done();
			});
		});
	});
});
