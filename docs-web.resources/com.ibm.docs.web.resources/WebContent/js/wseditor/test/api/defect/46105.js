sample("46105.xls");
coeditors(["Ray", "Mark"]);

describe("Defect of 45105", function() {
	it.asyncly("delete row 7:19 then undo & redo", function() {
		return actBy(params.actor).step({
			line: function() {
				actions.switchSheet("Sheet2");
			},
			by: 'Ray'
		}).step({
			line: function(s) {
				s.reload(deferreds.doc);
			},
			by: 'Ray'
		}).step({
			line: function() {
				actions.switchSheet('Sheet3');
			},
			by: 'Mark'
		}).step({
			line: function(s) {
				s.reload(deferreds.doc);
			},
			by: 'Mark'
		}).step({
			line: function() {
				actions.focus('7:19').deleteRows();
			},
			by: 'Ray'
		}).step({
			line: function() {
				actions.undo();
			},
			by: 'Ray'
		}).step({
			line: function() {
				actions.redo();
			},
			by: 'Ray'
		}).step({
			line: function() {
				actions.undo();
			},
			by: 'Ray'
		}).step({
			line: function(s) {
				expect.ui().cell('AA7').value('A$1');
				s.step();
			},
			by: 'Mark'
		}).end();
	}, 5*60*1000);
});