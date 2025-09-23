sample("INS_160_011 Cash Flow Projection Sample.xlsx");

describe("Reference", function() {
	it.asyncly("deletes sheet, then deletes rows, then undo *2", function() {
		return actBy().step(function(d) {
			actions.switchSheet('Calculations');
			actions.deleteSheet(helpers.nameOfCurrentSheet());
		}).step(function() {
			actions.focus("41:70").deleteRows();
		}).step(function() {
			actions.undo();
		}).step(function() {
			actions.undo();
		}).step(function() {
			actions.switchSheet('Calculations');
		}).step(function() {
			actions.focus('A1').editCell(1);
			actions.pageDown();
		})
		.step(function(d) {
			 expect.ui().cell('C60').value('50,000').cell('C61').value('#REF!');
			d.step();
		}).end();
	});
});
