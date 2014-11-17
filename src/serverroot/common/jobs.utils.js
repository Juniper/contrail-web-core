/*
 * Copyright (c) 2014 Juniper Networks, Inc. All rights reserved.
 */

var jobTaskDataChanges = {};
function registerForJobTaskDataChange (jobData, fields)
{
    var jobName = jobData['title'];
    if ((null != jobName) && (null != jobData.taskData)) {
        jobTaskDataChanges[jobName] = [];
        var fieldsCnt = fields.length;
        for (var i = 0; i < fieldsCnt; i++) {
            if (null == jobData.taskData[fields[i].toString()]) {
                continue;
            }
            jobTaskDataChanges[jobName].push(
                {'field': fields[i], 'data':
                JSON.parse(JSON.stringify(jobData.taskData[fields[i].toString()]))});
        }
    }
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
        jobTaskData[taskDataChanges[i]['field'].toString()] = taskDataChanges[i]['data'];
    }
    deleteChangedJobTaskData(jobName);
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

