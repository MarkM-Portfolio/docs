sample(null);

describe("A sheet", function() {
	var sn = "Moving" + new Date().getTime(),
	count = 1;
	it.asyncly("should be able to move to a given index", function() {
		var index;
		return actBy()
		.step(function() {
			count = helpers.countOfVisibleSheets();
			index = helpers.indexOfCurrentSheet() || count;
			actions.insertSheet(sn);
		}).step(function() {
			expect.ui().sheet(sn).toBeAtIndex(index + 1);
			actions.moveSheet(sn, 1); // move to first
			expect.ui().sheet(sn).toBeAtIndex(1);
			actions.moveSheet(sn, count + 1); // move to last
			expect.ui().sheet(sn).toBeAtIndex(count + 1);
			actions.undo();
		}).step(function() {
			expect.ui().sheet(sn).toBeAtIndex(1);
			actions.redo();
		}).step(function(deferred) {
			expect.ui().sheet(sn).toBeAtIndex(count + 1);
			deferred.step();
		}).end();
	});

	it.asyncly("should ignore hidden sheets when it moves to a given index", function() {
		var hSheet;
		return actBy()
		.step(function() {
			hSheet = helpers.nameOfSheetAtIndex(1);
			expect.ui().sheet(hSheet).toBeAtIndex(1).sheet(sn).toBeAtIndex(count + 1);
			actions.switchSheet(hSheet);
		}).step(function(){
			actions.hideSheet();
			expect.ui().sheet(sn).toBeAtIndex(count).sheet(hSheet).not().toBeVisible();
			actions.moveSheet(sn, 1);  //move to first
			expect.ui().sheet(sn).toBeAtIndex(1).sheet(hSheet).not().toBeVisible();
			actions.showSheet(hSheet);
		}).step(function() {
			expect.ui().sheet(sn).toBeAtIndex(2).sheet(hSheet).toBeAtIndex(1);
			hSheet = helpers.nameOfSheetAtIndex(count + 1);
			actions.switchSheet(hSheet);
		}).step(function(){
			actions.hideSheet();
			actions.moveSheet(sn, count); //move to last
			expect.ui().sheet(sn).toBeAtIndex(count).sheet(hSheet).not().toBeVisible();
			actions.showSheet(hSheet);
		}).step(function(deferred) {
			expect.ui().sheet(sn).toBeAtIndex(count).sheet(hSheet).toBeAtIndex(count + 1);
			deferred.step();
		}).end();
	});
});
