sample("row.hide.xlsx");

describe("Hide rows", function() {
	var sheetName, addr; 
	it.asyncly("selects row 1 to 3 in the sheet1 to hide -- across freeze pane ", function() {
		return actBy()
		.step(function(){
			sheetName = helpers.nameOfCurrentSheet();
			actions.freezeRow(2);
		})
		.step(function(d){
			expect.ui().freezeAt(2, 0);
			//across freeze pane
			addr = "'Pro-Forma Cash Flow'"+ "!A1:AZ3";
			actions.focus(addr).hideRows(3);
		})
		.step(function(d){
			expect.ui().hiddenAtIndex(1)
			.hiddenAtIndex(2)
			.hiddenAtIndex(3);
			actions.undo(); 
		})    
		.end();
	});

	it.asyncly("undoes above hidding actions then hide the 1st row within frozen panes", function() {
		var addr ;
		return actBy()
		.step(function(){
			//hide within frozen panes
			addr = "'Pro-Forma Cash Flow'"+ "!A1:AZ1";
			actions.focus(addr).hideRows(1);
		})    
		.step(function(d){
			expect.ui().hiddenAtIndex(1);
			//show row
			actions.focus(addr).showRows(); 
			actions.undo();
		})    	
		.end();
	});

	it.asyncly("undoes above hidding actions then hide rows  within (un)frozen panes", function() {
		var addr ;
		return actBy()
		.step(function(){
			//hide within frozen panes
			addr = "'Pro-Forma Cash Flow'"+ "!A3:AZ4";
			actions.focus(addr).hideRows(2);
		})    
		.step(function(d){
			expect.ui().hiddenAtIndex(3)
			.hiddenAtIndex(4);
			//show rows
			actions.focus(addr).showRows(); 
			actions.undo();
		})    	
		.end();
	});

	it.asyncly("clears hidden rows' content", function() {
		var addr ;
		return actBy()
		.step(function(){
			//hide within frozen panes
			addr = "'Pro-Forma Cash Flow'"+ "!A2:AZ7";
			actions.focus(addr).clearCell();
			addr = "'Pro-Forma Cash Flow'"+ "!A3:AZ4";
			actions.focus(addr).showRows();
		})    
		.step(function(d){
			expect.model().rowAtIndex(3).hasValueCells(0);
			expect.ui().rowAtIndex(3).cellAtIndex(1).backgroundColor('#ffff00');
			d.step();
		})    	
		.end();
	});
});
