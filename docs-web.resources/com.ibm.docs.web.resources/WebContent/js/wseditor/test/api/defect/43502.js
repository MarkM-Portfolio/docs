sample("43502.xlsx");

describe("Formula", function() {
	it.asyncly("deletes columns, then deletes rows, then undo *2", function() {
		return actBy().step(function(d) {
			actions.switchSheet('Sheet1');
			d.reload(deferreds.doc);
		}).step(function() {
			actions.focus("C:C").deleteColumns()
			.focus("5:9").deleteRows();
		}).step(function() {
			actions.switchSheet('4');
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.ui().cell('A8').value('Sheet4s1a8');

			actions.undo();
		}).step(function(d) {
			expect.ui().cell('c4').value('Sheet4');
			d.step();
		}).end();
	});
});
