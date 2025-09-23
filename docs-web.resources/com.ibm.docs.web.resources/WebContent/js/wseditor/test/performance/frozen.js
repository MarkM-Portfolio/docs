beforeAll(function() {
	return deferreds.doc();

});
describe("SetColumnProperty", function() {

	var sheetName = "";
	var racer = new perfutils.ihsrequest();
	var timeout = 60000;

	it.asyncly("Cells related operations", function() {

		sheetName = helpers.nameOfCurrentSheet();
		var coladdr = sheetName + "!d1:d10000";
		var rowaddr = sheetName + "!a20:aZ10";
		var celladdr = sheetName + "!D6";

		return actBy().step(function(d) {
			racer.start();
			actions.focus(celladdr).editCell("999999");
		}).step(function() {
			racer.request("editcell");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(celladdr).setFontSize("18");
		}).step(function() {
			racer.request("changefontsizecell");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(sheetName + "!A1").editCell('=SUM(B2:B1000)');

		}).step(function() {
			racer.request("funcsum");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(sheetName + "!A2").editCell('=AVERAGE(B2:B1000)');

		}).step(function() {
			racer.request("funcavg");
			actions.undo();

		}).step(function() {
			racer.start();
			actions.focus(sheetName + "!A3").editCell('=COUNTIF(B:F 1:20, \"<50\")');

		}).step(function() {
			racer.request("funccountif");
			actions.undo();

		}).step(function(d) {
			racer.start();
			actions.focus(sheetName + "!A4").editCell('=COUNTA(B:B, (C:D, C4:D20))');
			d.step();
		}).step(function() {
			racer.request("funccounta");
			actions.undo();

		}).repeatUntil(function() {

			return racer.finish();
		});
	}, timeout);

	it.asyncly("Frozen rows,cols", function() {

		return actBy().step(function() {
			racer.start();
			actions.freezeRow(10);
		}).step(function() {
			racer.request("freezerow");
			actions.undo();
		}).step(function() {
			racer.start();
			actions.freezeColumn(8);
		}).step(function() {
			racer.request("freezecol");
			actions.undo();
		}).repeatUntil(function() {
			return racer.finish();
		});
	}, timeout);

	it.asyncly("Hidden rows,cols", function() {

		var coladdr = sheetName + "!d1:d10000";
		var rowaddr = sheetName + "!a15:aZ10";

		return actBy().step(function() {
			racer.start();
			actions.focus(rowaddr).hideRows();
		}).step(function() {
			racer.request("hiderow");
			actions.undo();
		}).step(function() {
			racer.start();
			actions.focus(coladdr).hideColumns();
		}).step(function() {
			racer.request("hidecol");
			actions.undo();
		}).repeatUntil(function() {


			return racer.finish();
		});
	}, timeout);

	xit.asyncly("reloads again", function() {
		racer = new perfutils.ihsrequest(5);
		return actBy().step(function() {
			actions.reset();
		}).repeatUntil(function() {
			racer.request("reload");
			return racer.finish();
		});
	}, timeout);

});
