sample("column.insert.xlsx");

describe("insertColumns", function() {
	var sheetName, addr;

	it.asyncly("selects first 3 columns in the sheet then insert 3 columns before", function() {
		return actBy()
		.step(function(){
			sheetName = helpers.nameOfCurrentSheet();
			addr = sheetName + "!a1:c10000";

			actions.focus(addr).insertColumnsBefore();
			expect.model().rowAtIndex(3).hasCoverInfos(1).coverInfoAtIndex(5).repeats(4);
		})
		.step(function(){
			actions.undo(); 
		})
		.step(function(d){
			expect.model().rowAtIndex(6).hasValueCells(3).valueCellAtIndex(1).value('=SUM(A3:A5)');
			expect.ui().rowAtIndex(6).cellAtIndex(1).value(24);
			d.step();
		})
		.step(function(){
			actions.redo(); 
		})
		.step(function(d){
			expect.model().rowAtIndex(6).hasValueCells(3).valueCellAtIndex(4).value('=SUM(D3:D5)');
			expect.ui().rowAtIndex(6).cellAtIndex(4).value(24);
			d.step();
		})
		.end();
	});


	it.asyncly("selects first D and E column in the sheet then insert 2 columns after", function() {
		var addr = sheetName + "!D1:E10000";
		return actBy()
		.step(function(){
			actions.focus(addr).insertColumnsAfter();
			expect.model().rowAtIndex(3).hasCoverInfos(1).coverInfoAtIndex(5).repeats(6);
		})
		.step(function(){
			actions.undo(); 
		})
		.step(function(d){
			expect.model().rowAtIndex(6).hasValueCells(3).valueCellAtIndex(6).value(2);
			d.step();
		})
		.step(function(){
			actions.redo(); 
		})
		.step(function(d){
			expect.model().rowAtIndex(6).hasValueCells(3).valueCellAtIndex(8).value(2);
			d.step();
		})
		.end();
	});

	it.asyncly("insert columns with preset Frozen Panes", function() {

		return actBy()
		.step(function(){
			actions.freezeColumn(1);//failed due to merged cells
			expect.model().freezeAt(2, 1);
		})
		.step(function(){
			var addr = sheetName + "!A1:A10000";
			actions.focus(addr).insertColumnsAfter();
			expect.model().rowAtIndex(6).hasValueCells(3).valueCellAtIndex(5).value('=SUM(E3:E5)');
		})
		.step(function(){
			expect.ui().rowAtIndex(6).cellAtIndex(5).value(24);

			actions.undo(); 
		})
		.step(function(d){
			expect.model().rowAtIndex(6).hasValueCells(3).valueCellAtIndex(4).value('=SUM(D3:D5)');
			expect.ui().rowAtIndex(6).cellAtIndex(4).value(24);
			d.step();
		})
		.step(function(){
			actions.redo(); 
		})
		.step(function(d){
			expect.model().rowAtIndex(6).hasValueCells(3).valueCellAtIndex(5).value('=SUM(E3:E5)');
			expect.ui().rowAtIndex(6).cellAtIndex(5).value(24);
			d.step();
		})
		.end();
	});

});
