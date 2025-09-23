sample("column.resize.xlsx");

describe("Columns-resizing", function() {
	var addr = "a1:az10000";
	it.asyncly("selects all the columns in the sheet then resize", function() {
		return actBy()
		.step(function(d){
			actions.focus(addr).setColumnWidth(170);
		})
		.step(function(d) {
			expect.model().hasColumns(3).colAtIndex(1).width(170).repeats(0);
			expect.ui().rowAtIndex(2).cellAtIndex(1).value(2);
			expect.model().rowAtIndex(16).hasCoverInfos(1)
			.coverInfoAtIndex(1).repeats(7);

			actions.undo(); // it breaks the sheet into 52 columns!
		})
		.step(function(d){
			expect.model().colAtIndex(1).width(136);
			actions.redo();
		})
		.step(function(d){
			expect.model().colAtIndex(1).width(170);
			actions.focus(addr).setColumnWidth(1);
		})
		.step(function() {
			expect.model().hasColumns(52).colAtIndex(1).width(1);
			actions.focus("z1").setColumnWidth(100);
		})
		.step(function() {
			expect.model().hasColumns(52).colAtIndex(26).width(100);
			actions.focus(addr).setColumnWidth(170);
		})
		.step(function() {
			expect.model().hasColumns(52).colAtIndex(1).width(170)
			.colAtIndex(26).width(170)
			.colAtIndex(27).width(170);
			actions.focus(addr).hideColumns();
			actions.focus(addr).setColumnWidth(2000);
		})
		.step(function(d) {
			expect.model().colAtIndex(1).width(2000);
			d.step();
		})
		.end();
	});

	it.asyncly("resizes columns with preset Frozen Panes", function(){
		return actBy()
		.step(function(){
			actions.focus(addr).setColumnWidth(200);
			actions.freezeColumn(1);//failed due to merged cells
		})
		.step(function(){
			expect.ui().freezeAt(7, 0);
			expect.model().freezeAt(7, 0);
			actions.focus(addr).setColumnWidth(100);
			actions.focus(addr).showColumns();
		})
		.step(function(){
			expect.model().freezeAt(7, 0)
			.colAtIndex(1).width(100)
			.colAtIndex(26).width(100);

			actions.focus("b7").hideColumns();
			actions.focus("a1:c3").setColumnWidth(23);
		})
		.step(function(){
			expect.model().colAtIndex(2).colIsHidden();

			actions.freezeColumn(10);
			actions.focus("c1:j1").setColumnWidth(50);
		})
		.step(function(){
			expect.ui().freezeAt(7, 10);
			expect.model().freezeAt(7, 10);

			actions.focus("A1").deleteColumns();
			actions.scrollToRow(16);
		})
		.step(function(d){
			expect.ui().freezeAt(7, 9);
			expect.model().rowAtIndex(16).hasCoverInfos(0);

			actions.undo();
		})
		.step(function(d){
			expect.model().rowAtIndex(16).hasCoverInfos(1)
			.coverInfoAtIndex(1).repeats(7);
			d.step();
		})
		.end();
	});

	it.asyncly("tests the merged cells", function(){
		return actBy()
		.step(function(d){
			expect.model().rowAtIndex(16)
			.hasCoverInfos(1)
			.coverInfoAtIndex(1)
			.repeats(7);
			d.step();
		})
		.step(function(){
			actions.focus("b1:x3").hideColumns();
			actions.focus("c2:q2").setColumnWidth(50);
		})
		.step(function(s){
			expect.model().rowAtIndex(16)
			.hasCoverInfos(1)
			.coverInfoAtIndex(1)
			.repeats(7);
			s.step();
		})
		.end();
	});
});
