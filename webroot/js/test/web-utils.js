module("Web Utils");
test("ifNullOrEmpty", function() {
    equal(ifNullOrEmpty(null,7),7,"ifNullOrEmpty with null should return the second argument");
    deepEqual(ifNullOrEmpty({},6),{},"ifNullOrEmpty with empty object should return the first argument");
    /*Start: Sinon Stub Example
    var stub = sinon.stub(window,'showInfoWindow',function(msg,title) {
        console.info(msg,title);
    });
    showInfoWindow('Test Sinon','Test');
    window.showInfoWindow.restore();
    showInfoWindow('Test Sinon','Test');
    End: Sinon Stub Example */
});

test("diffDates", function() {
    expect(4);
    equal(diffDates(new XDate(1396334194000),new XDate(1396344194000),'rounded'),'2 hour(s)');
    equal(diffDates(new XDate(1396334194000),new XDate(1396344194000)),'2h 46m');
    equal(diffDates(new XDate(1396334194000),new XDate(1399344194000)),'34d 20h 6m');
    equal(diffDates(new XDate(1396334194000),new XDate(1399344194000),'rounded'),'34 day(s)');
});
