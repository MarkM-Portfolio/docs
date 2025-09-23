sample("43735.xlsx");

describe('defect with sample', function() {
	it.asyncly('deletes columns and undoes', function() {
		return actBy().step(function() {
			actions.switchSheet('Sheet3');
		}).step(function() {
			actions.focus('C:E').deleteColumns();
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.ui().cell('F3').value(0)
			.cell('G5').value(0);
			s.step();
		}).end();
	});
});
