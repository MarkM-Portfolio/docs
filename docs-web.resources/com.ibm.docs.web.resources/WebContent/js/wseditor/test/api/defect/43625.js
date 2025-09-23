sample("43625.xlsx");

coeditors(["A", "B"]);

describe("Formula with a large sample", function() {
	it.asyncly("delete columns referred in another sheet, then undo", function() {
		var repeat = 1;
		return actBy(params.actor).step({
			line: function() {
				actions.switchSheet('Calculations');
			},
			by: "B"
		}).step({
			line: function() {
				actions.focus('B:S').deleteColumns();
			},
			by: "A"
		}).step({
			line: function() {
				actions.undo();
			},
			by: "A"
		}).step({
			line: function(s) {
				expect.ui().cell('C10').value("17,000")
//				.cell('C58').value('25,000'); // for defect 43416
				s.step();
			},
			by: "B"
		}).repeatUntil(function() {
			return repeat++ === 3;
		});
	}, 10*60*1000);
});
