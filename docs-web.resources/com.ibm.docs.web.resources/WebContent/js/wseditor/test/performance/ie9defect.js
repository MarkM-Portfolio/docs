beforeAll(function() {
	return deferreds.doc();

});

describe("SetColumnProperty", function() {

	var sheetName = "";
	var racer = new perfutils.ihsrequest();
	var timeout = 60000;

	it.asyncly("For one row copy,paste,redo,undo", function() {
		sheetName = helpers.nameOfCurrentSheet();
		var addr = sheetName + "!a7:aZ7";
		return actBy().step(function(d) {
			racer.start();
			actions.focus(addr).copy();
			racer.request("rowcopy");
			d.step();
		}).step(function() {
			racer.start();
			actions.focus(sheetName + '!a15:az15').paste();

		}).step(function() {
			racer.request("rowpaste");
			actions.undo();

		}).repeatUntil(function() {
			racer.request("rowundo");
			return racer.finish();
		});
	}, timeout);



	it.asyncly("For one column copy,paste,redo,undo", function() {
		var addr = sheetName + '!d1:d10000';
		return actBy().step(function(d) {
			racer.start();
			actions.focus(addr).copy();
			racer.request("colcopy");
			d.step();
		}).step(function() {
			racer.start();
			actions.focus(sheetName + '!F1').paste();

		}).step(function() {
			racer.request("colpaste");
			actions.undo();

		}).repeatUntil(function() {
			racer.request("colundo");
			return racer.finish();
		});
	}, timeout);


	/**
	 *IE9 not stable for copy paste
	 */

	xit.asyncly("For one column copy,paste,redo,undo", function() {
		var addr = sheetName + '!d1:d10000';
		return actBy().step(function(d) {
			racer.start();
			actions.focus(addr).copy();
			racer.request("colcopy");
			d.step();
		}).step(function() {
			racer.start();
			actions.focus(sheetName + '!F1').paste();

		}).step(function() {
			racer.request("colpaste");
			actions.undo();

		}).step(function() {
			racer.request("colundo");
			actions.redo();

		}).step(function() {
			racer.request("colredo");
			actions.undo();

		}).repeatUntil(function() {

			return racer.finish();
		});
	}, timeout);

	xit.asyncly("For one row copy,paste,redo,undo", function() {
		var addr = sheetName + "!a7:aZ7";
		return actBy().step(function(d) {
			racer.start();
			actions.focus(addr).copy();
			racer.request("rowcopy");
			d.step();
		}).step(function() {
			racer.start();
			actions.focus(sheetName + '!a15:az15').paste();

		}).step(function() {
			racer.request("rowpaste");
			actions.undo();

		}).step(function() {
			racer.request("rowundo");
			actions.redo();

		}).step(function() {
			racer.request("rowredo");
			actions.undo();

		}).repeatUntil(function() {

			return racer.finish();
		});
	}, timeout);


	/**
	 *IE9 have issue
	 */

	xit.asyncly("B1. Sort one column", function() {
		return actBy().step(function() {
			racer.start();
			actions.focus(sheetName + '!F1:F1000').sort(true, false, 0);

		}).step(function() {
			racer.request("SortOneCol");
			actions.undo();

		}).repeatUntil(function() {
			return racer.finish();
		});
	}, 10000);


	/**
	 *IE9 have issue
	 */
	xit.asyncly("switch sheet", function() {
		var count = helpers.countOfVisibleSheets();
		var num = 1;
		racer = new perfutils.ihsrequest(count - 1);

		return actBy().step(function(d) {
			var switchsheet = helpers.nameOfNextSheet();

			racer.start();
			actions.switchSheet(switchsheet);

		}).step(function(d) {
			racer.request("switchsheet");
			if (num == (count - 1))
				actions.switchSheet(sheetName);
			else
				d.step();

		}).repeatUntil(function() {
			num++;
			return racer.finish();
		});
	}, 10000);

});
