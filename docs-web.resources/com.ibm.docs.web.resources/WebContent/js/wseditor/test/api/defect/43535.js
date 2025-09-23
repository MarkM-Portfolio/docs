sample("43535.xls");

describe("Formula defect of 43535", function() {
	it.asyncly("deletes a row then undo", function() {
		return actBy().step(function() {
			actions.focus('3:3').deleteRows();
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.ui().cell('A12').value(-51);
			s.step();
		}).end();
	});
});
