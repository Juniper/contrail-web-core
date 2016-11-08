/*
 * Copyright (c) 2016 Juniper Networks, Inc. All rights reserved.
 */
var Threads = require("webworker-threads");

/* Function: createWorkerThread
 * public function
 *
 * This function is used to create a thread and run the job in that thread
 * context. Once done, notify the caller.
 *
 * @threadCB    : thread to execute function
 * @data        : data to pass to threadCB
 * @callback    : function to call once threadCB is done.
 */

function runInThread (threadCB, data, callback) {
    /* Create thread */
    var newThread = Threads.create();
    /* Load the function into the worker thread */
    newThread.eval(threadCB);
    /* Now call the function */
    newThread.eval(
        threadCB(data, function(error, data) {
            callback(error, data);
        }), function(error, result) { // eslint-disable-line
            newThread.destroy();
        }
    );
}

exports.runInThread = runInThread;

