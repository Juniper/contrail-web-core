/*
 * Copyright (c) 2017 Juniper Networks, Inc. All rights reserved.
 */
define([],
    function() {
    var contrailUtils = function() {
        var self = this;
        self.currentDomainProjectData = {domain: {}, project: {}};

        /* Start - Domain */
        self.setCurrentDomain = function(name) {
            self.currentDomainProjectData.domain.name = name;
        };
        self.getCurrentDomain = function() {
            return self.currentDomainProjectData.domain.name;
        };
        self.setCurrentDomainId = function(id) {
            if (null == id) {
                return;
            }
            self.currentDomainProjectData.domain.uuid = id;
        };
        self.getCurrentDomainId = function() {
            return self.currentDomainProjectData.domain.uuid;
        };
        self.setCurrentDomainDisplayName = function(name) {
            self.currentDomainProjectData.domain.display_name = name;
        };
        self.getCurrentDomainDisplayName = function() {
            return self.currentDomainProjectData.domain.display_name;
        };
        self.setCurrentDomainData = function(domainData) {
            if (null == domainData) {
                return;
            }
            var domId = getValueByJsonPath(domainData, "value", null);
            var domDisplayName = getValueByJsonPath(domainData, "name", null);
            var domain = getValueByJsonPath(domainData, "fq_name", null);
            self.setCurrentDomain(domain);
            self.setCurrentDomainId(domId);
            self.setCurrentDomainDisplayName(domDisplayName);
        };
        /* End - Domain */

        /* Start - Project */
        self.setCurrentProject = function(name) {
            self.currentDomainProjectData.project.name = name;
        };
        self.getCurrentProject = function() {
            return self.currentDomainProjectData.project.name;
        };
        self.setCurrentProjectId = function(id) {
            if (null == id) {
                return;
            }
            self.currentDomainProjectData.project.uuid = id;
        };
        self.getCurrentProjectId = function() {
            return self.currentDomainProjectData.project.uuid;
        };
        self.setCurrentProjectDisplayName = function(name) {
            self.currentDomainProjectData.project.display_name = name;
        };
        self.getCurrentProjectDisplayName = function() {
            return self.currentDomainProjectData.project.display_name;
        };
        self.getCurrentProjectFQN = function() {
            return [self.getCurrentDomain(), self.getCurrentProject()];
        };
        self.setCurrentProjectData = function(projectData) {
            if (null == projectData) {
                return;
            }
            var projId = getValueByJsonPath(projectData, "value", null);
            var projDisplayName = getValueByJsonPath(projectData, "name", null);
            var project = getValueByJsonPath(projectData, "fq_name", null);
            if (null != project) {
                project = project.split(":")[1];
            }
            self.setCurrentProject(project);
            self.setCurrentProjectId(projId);
            self.setCurrentProjectDisplayName(projDisplayName);
        };
        /* End - project */
    }
    return new contrailUtils();
});

