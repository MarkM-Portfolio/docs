beforeAll(function() {
	return deferreds.doc();

});

/*
 * 12  transactions
 */

describe("SetColumnProperty", function() {

	var sheetName = "";
	var racer = new perfutils.ihsrequest();
	var timeout = 60000;

	console.log("sheetName: " + sheetName);

	/*
	 * 4 transactions:EnlargeCol,ShrinkCol,EnlargeRow,ShrinkRow
	 */

	it.asyncly("EnlargeCol,ShrinkCol", function() {

		sheetName = helpers.nameOfCurrentSheet();
		var addr = sheetName + "!a1:a10000";
		return actBy().step(function() {
			racer.start();
			actions.focus(addr).setColumnWidth(150);
		}).step(function() {
			racer.request("EnlargeCol");
			actions.focus(addr).setColumnWidth(25);
		}).repeatUntil(function() {
			racer.request("ShrinkCol");
			return racer.finish();
		});
	}, timeout);

	/*
	 * 4 transactions:EnlargeCol,ShrinkCol,EnlargeRow,ShrinkRow
	 */

	it.asyncly("EnlargeRow,ShrinkRow", function() {
		var rowaddr = sheetName + "!A5:AZ5";
		return actBy().step(function() {
			racer.start();
			actions.focus(rowaddr).setRowHeight(150);
		}).step(function() {
			racer.request("EnlargeRow");
			actions.focus(rowaddr).setRowHeight(25);
		}).repeatUntil(function() {
			racer.request("ShrinkRow");
			return racer.finish();
		});
	}, timeout);

	/*
	 * 4 transactions:
	 */

	it.asyncly("ToggleFontRow", function() {
		var addr = sheetName + '!A9:AZ9';

		return actBy().step(function() {
			racer.start();
			actions.focus(addr).setFontEffect('bold');
		}).step(function() {
			racer.request("RowFontBold");
			actions.undo();
		}).step(function() {
			racer.start();
			actions.focus(addr).setFontEffect('italic');
		}).step(function() {
			racer.request("RowFontItalic");
			actions.undo();
		}).step(function() {
			racer.start();
			actions.focus(addr).setFontEffect('underline');

		}).step(function() {
			racer.request("RowFontUnderline");
			actions.undo();
		}).step(function() {
			racer.start();
			actions.focus(addr).setFontEffect('strikethrough');

		}).step(function() {
			racer.request("RowFontStrike");
			actions.undo();
		}).repeatUntil(function() {
			return racer.finish();
		});
	}, timeout);

});
