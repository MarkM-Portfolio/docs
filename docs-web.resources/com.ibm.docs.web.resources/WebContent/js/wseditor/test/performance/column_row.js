beforeAll(function() {
	return deferreds.doc();

});
/*
 * 19 transactions
 */
describe("SetColumnRowProperty", function() {
	var sheetName = "";
	var racer = new perfutils.ihsrequest();
	var timeout = 60000;
	/*
	 * 4 transactions:InsertColumn,DeleteColumn,InsertRow,DeleteRow
	 */

	it.asyncly("InsertColumn,DeleteColumn,InsertRow,DeleteRow", function() {
		sheetName = helpers.nameOfCurrentSheet();
		var addr = sheetName + "!c1:c10000";
		var rowaddr = sheetName + "!a5:aZ5";

		console.log("InsertColumn,DeleteColumn,InsertRow,DeleteRow start.... ");
		return actBy().step(function() {
			racer.start();
			/*
				 actions.focus(sheetName + "!d1:d10000");
				 racer.request("SelectCol");
				 actions.focus(sheetName + "!a7:aZ7");
				 racer.request("SelectRow");*/
			actions.focus(addr).insertColumnsBefore();

		}).step(function() {
			racer.request("InsertCol");

			actions.focus(addr).deleteColumns();

		}).step(function() {

			racer.request("DeleteCol");
			actions.focus(rowaddr).insertRowsAbove();

		}).step(function() {

			racer.request("InsertRow");
			actions.focus(rowaddr).deleteRows();

		}).repeatUntil(function() {
			racer.request("DeleteRow");
			return racer.finish();
		});
	}, timeout);

	it.asyncly("ColFontBold,ColFontItalic,ColFontUnderline....", function() {
		var addr = sheetName + '!D1:D1000';
		return actBy().step(function() {
			racer.start();
			actions.focus(addr).setFontEffect('bold');
		}).step(function() {
			racer.request("ColFontBold");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setFontEffect('italic');

		}).step(function() {
			racer.request("ColFontItalic");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setFontEffect('underline');

		}).step(function() {
			racer.request("ColFontUnderline");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setFontEffect('strikethrough');

		}).step(function() {
			racer.request("ColFontStrike");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setAlignment('middle');

		}).step(function() {
			racer.request("ColFontMiddle");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setAlignment('center');

		}).repeatUntil(function() {
			racer.request("ColAlignCenter");
			return racer.finish();
		});
	}, timeout);

	it.asyncly("ColBackgroudColor,ColFontColor,ColBorderType...", function() {
		var addr = sheetName + '!B1:B1000';

		return actBy().step(function() {
			racer.start();
			actions.focus(addr).setBackgroundColor('#000000');
		}).step(function() {
			racer.request("ColBackgroudColor");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setFontColor('#3071a9');

		}).step(function() {
			racer.request("ColFontColor");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setBorderType(app.BORDERTYPE.OUTERBORDERS);

		}).step(function() {
			racer.request("ColBorderType");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setBorderStyle(app.BORDERSTYLE.THINSOLID);

		}).step(function() {
			racer.request("ColBorderStyle");
			actions.undo();

		}).repeatUntil(function() {
			return racer.finish();
		});
	}, timeout);

	it.asyncly("ColBorderColor,ColFontSize,ColFontName...", function() {
		var addr = sheetName + '!C1:C1000';

		return actBy().step(function() {
			racer.start();
			actions.focus(addr).setBorderColor('#000000');
		}).step(function() {
			racer.request("ColBorderColor");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(addr).setFontSize(12);

		}).step(function() {
			racer.request("ColFontSize");
			actions.undo();

		}).step(function() {

			racer.start();
			actions.focus(addr).setFontName('Comic Sans MS');

		}).step(function() {
			racer.request("ColFontName");
			actions.undo();

		}).step(function() {

			racer.start();
			actions.focus(addr).autofill('right', 4);

		}).step(function() {
			racer.request("ColAutofillTo");
			actions.undo();

		}).repeatUntil(function() {
			return racer.finish();
		});
	}, timeout);

});
