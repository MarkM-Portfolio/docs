sample("VAR.xlsx");

describe("The complicated formula sample for `VAR`", function() {
	it.asyncly('checks B347 in `Testroom`', function() {
		return actBy()
		.step({
			line: function() {
				actions.switchSheet('Testroom');
			},
			wait: deferreds.loadDocument
		})
		.step({
			line: function() {
				actions.scrollToRow(347);
			},
			wait: deferreds.endScroll
		})
		.step(function(s) {
			expect.ui().cell('B347').value(261.1522383);
			s.step();
		})
		.end();
	});

	it.asyncly('checks B270 in `Testroom`', function() {
		return actBy()
		.step(function() {
			actions.switchSheet('Testroom');
		})
		.step(function() {
			actions.scrollToRow(270);
		})
		.step(function(s) {
			expect.ui().cell('B270').value(666.7064455);
			s.step();
		})
		.end();
	});

	// very low priority defect
	xit.asyncly('checks B917 in `Testroom`', function() {
		return actBy()
		.step(function() {
			actions.switchSheet('Testroom');
		})
		.step(function() {
			actions.scrollToRow(917);
		})
		.step(function(s) {
			expect.ui().cell('B917').value('#DIV/0!');
			s.step();
		})
		.end();
	});

	it.asyncly('inserts a row above row 1, then check the D365 in `Testroom`', function() {
		return actBy()
		.step(function() {
			actions.switchSheet("Numeric");
		})
		.step(function() {
			actions.focus('1:1').insertRowsAbove();
		})
		.step(function() {
			actions.switchSheet("Testroom");
		})
		.step(function() {
			actions.scrollToRow(365);
		})
		.step(function(s) {
			expect.ui()
			.cell('B365').value(150.0625)
			.cell('D365').value('FALSE');
			s.step();
		})
		.step(function() {
			actions.switchSheet("Numeric");
			actions.focus('1:1').deleteRows();
		})
		.step(function() {
			actions.switchSheet('Testroom').scrollToRow(365);
		})
		.step(function(s) {
			expect.ui().cell("B365").value(90.25)
			.cellAtIndex('D').value('TRUE');
			s.step();
		})
		.end();
	}, 10 * 60 * 1000);
});
