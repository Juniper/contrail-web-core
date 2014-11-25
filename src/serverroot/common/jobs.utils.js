/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var jobTaskDataChanges = {};
var jobTaskDataRequiresFields = {};
function registerForJobTaskDataChange (jobData, field)
{
    if ((null == field) || (null == jobData)) {
        return;
    }
    field = field.toString();
    var jobName = jobData['title'];
    if ((null != jobName) && (null != jobData.taskData) &&
        (null != jobData.taskData[field])) {
        if (null == jobTaskDataChanges[jobName]) {
            jobTaskDataChanges[jobName] = [];
        }
        jobTaskDataChanges[jobName].push(
            {'field': field, 'data':
            JSON.parse(JSON.stringify(jobData.taskData[field]))});
        if (null == jobTaskDataRequiresFields[field]) {
            jobTaskDataRequiresFields[field] = field;
        }
    }
}

function updateJobDataRequiresField (jobData, taskData)
{
    if ((null == jobData) || (null == jobData.taskData)) {
        for (key in jobTaskDataRequiresFields) {
            if ((null == taskData[key]) &&
                (null != jobData.taskData[key])) {
                taskData[key] = jobData.taskData[key];
            }
        }
    }
    return taskData;
}

function getChangedJobTaskData (jobName)
{
    return jobTaskDataChanges[jobName];
}

function getAndUpdateChangedJobTaskData (jobName, jobTaskData)
{
    var taskDataChanges = getChangedJobTaskData(jobName);
    if (null == taskDataChanges) {
        return jobTaskData;
    }
    var taskDataChangesCnt = taskDataChanges.length;
    for (var i = 0; i < taskDataChangesCnt; i++) {
        jobTaskData[taskDataChanges[i]['field'].toString()] =
            taskDataChanges[i]['data'];
    }
    return jobTaskData;
}

function deleteChangedJobTaskData (jobName)
{
    delete jobTaskDataChanges[jobName];
}

exports.registerForJobTaskDataChange = registerForJobTaskDataChange;
exports.getChangedJobTaskData = getChangedJobTaskData;
exports.deleteChangedJobTaskData = deleteChangedJobTaskData;
exports.getAndUpdateChangedJobTaskData = getAndUpdateChangedJobTaskData;
exports.updateJobDataRequiresField = updateJobDataRequiresField;

