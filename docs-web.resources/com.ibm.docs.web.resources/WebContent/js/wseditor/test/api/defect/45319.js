sample(null);

coeditors(['Amy', 'Bob']);

describe("defect 45319", function() {
	it.asyncly("renames the sheet then deletes, undoes", function() {
		return actBy(params.actor).step({
			line: function() {
				actions.switchSheet('Sheet1')
				.focus('A1').editCell('=SUM(Sheet2!A1)');
			},
			by: 'Amy'
		}).step({
			line: function() {
				actions.switchSheet('Sheet2');
			},
			by: 'Bob'
		}).step({
			line: function(s) {
				actions.renameSheet('Sheet2', 'Sheet2a');
				s.step();
			},
			by: 'Bob'
		}).step({
			line: function(s) {
				actions.deleteSheet('Sheet2a');
				s.step();
			},
			by: 'Bob'
		}).step({
			line: function() {
				actions.undo();
			},
			by: 'Bob'
		}).step({
			line: function(s) {
				expect.ui().cell('A1').value(0);
				s.step();
			},
			by: 'Amy'
		}).end();
	}, 60*1000);
});
