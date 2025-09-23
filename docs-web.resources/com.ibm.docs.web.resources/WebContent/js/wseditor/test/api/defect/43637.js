sample("43637.xlsx");

describe("Formula", function() {
	it.asyncly("deletes a sheet then undo", function() {
		return actBy().step(function(s) {
			// in the first sheet
			actions.deleteSheet(helpers.nameOfCurrentSheet());
			s.step();
		}).step(function() {
			actions.undo();
		}).step(function(s) {
			expect.ui().cell('C1').value('A1')
			.cell('E1').value('A1')
			.cell('G1').value(5);
			s.step();
		}).end();
	});
});
