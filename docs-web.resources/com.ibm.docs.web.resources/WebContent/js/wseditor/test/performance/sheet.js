beforeAll(function() {
	return deferreds.doc();
});
/**
 *12 cases
 */
describe("sheet operations", function() {

	var racer = new perfutils.ihsrequest();
	var timeout = 60000;
	var newsheetname = "232r32";
	var sheetName = "";

	it.asyncly("insert,delete,hide,unhide sheet", function() {
		sheetName = helpers.nameOfCurrentSheet();
		return actBy().step(function() {
			racer.start();
			actions.insertSheet(newsheetname);

		}).step(function(d) {
			racer.request("newsheet");
			actions.deleteSheet(newsheetname);
			racer.request("delsheet");
			d.step();
		}).step(function(d) {
			racer.start();
			actions.hideSheet();
			racer.request("hidesheet");
			d.step();
		}).step(function(d) {
			racer.start();
			actions.showSheet(sheetName);
			//d.step();
		}).step(function() {
			racer.request("unhidesheet");
			actions.moveSheet(sheetName, 2);

		}).step(function() {
			racer.request("movesheet");
			actions.moveSheet(sheetName, 1);

		}).repeatUntil(function() {
			racer.request("movesheet");
			return racer.finish();
		});
	}, timeout);

	it.asyncly("PageDown", function() {
		return actBy().step(function() {
			racer.start();
			actions.pageDown();

		}).repeatUntil(function() {
			racer.request("PageDown");

			return racer.finish();
		});
	}, timeout);

	it.asyncly("PageUp", function() {
		return actBy().step(function() {
			racer.start();
			actions.pageUp();
		}).repeatUntil(function() {
			racer.request("PageUp");

			return racer.finish();
		});
	}, timeout);

	it.asyncly("scrollToRow,scrollToCol", function() {
		var i = 0;
		return actBy().step(function() {
			racer.start();
			actions.scrollToRow(100 + i);
		}).step(function(d) {
			racer.request("scrollToRow");
			actions.scrollToColumn(10 + i);
			d.step();
		}).repeatUntil(function() {
			racer.request("scrollToCol");
			i++;
			return racer.finish();
		});
	}, timeout);

});
