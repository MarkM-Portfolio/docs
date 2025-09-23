sample("ACOSH.xlsx");

coeditors(["Amy", "Bob"]);

describe("Defect 45176", function() {
	it.asyncly("tests undo should restore the formula", function() {
		return actBy(params.actor)
		.step({
			line: function(s) {
				actions.switchSheet("Testroom");
			},
			by: "Amy"
		})
		.step({
			line: function(s) {
				s.reload(deferreds.doc);
			},
			by: "Amy"
		})
		.step({
			line: function(s) {
				actions.switchSheet("Numeric");
			},
			by: "Bob"
		})
		.step({
			line: function(s) {
				s.reload(deferreds.doc);
			},
			by: "Bob"
		})
		.step({
			line: function(s) {
				actions.focus('2:27').deleteRows();
				s.step();
			},
			by: "Bob"
		})
		.step({
			line: function(s) {
				actions.undo();
			},
			by: "Bob"
		})
		.step({
			line: function(s) {
				expect.ui().cell('D15').value('TRUE')
				.cell('D16').value('TRUE');
				s.step();
			},
			by: "Amy"
		})
		.end();
	}, 10*60*1000);
});
