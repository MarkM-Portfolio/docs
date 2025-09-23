sample("row.insert.xlsx");

describe("insertrows", function() {
	var sheetName, addr;
	it.asyncly("selects row5 in the sheet1 then insert 1 row above", function() {
		var addr;
		return actBy()
		.step(function(){
			sheetName = helpers.nameOfCurrentSheet();
			addr = sheetName + "!A5:AZ5";
			actions.focus(addr).insertRowsAbove();				
		})
		.step(function(d){
			expect.model().rowAtIndex(7).hasValueCells(2).valueCellAtIndex(3).value('=C2+C3+C4+C6');
			expect.ui().rowAtIndex(7).cellAtIndex(3).value(21673);
			d.step();
		})
		.end();
	});

	it.asyncly("selects row4 and row 5 in the sheet1 then insert 2 rows below", function() {
		return actBy()
		.step(function(){
			addr = sheetName + "!A4:AZ5";
			actions.focus(addr).insertRowsBelow();				
		})
		.step(function(d){
			expect.model().rowAtIndex(9).hasValueCells(2).valueCellAtIndex(3).value('=C2+C3+C4+C8');
			expect.ui().rowAtIndex(9).cellAtIndex(3).value(21673);
			//check inserted row's background
			expect.ui().rowAtIndex(6).cellAtIndex(1).backgroundColor(builders.posToColor(4, 3)).repeats(51);
			expect.ui().rowAtIndex(7).cellAtIndex(1).backgroundColor(builders.posToColor(4, 3)).repeats(51);

			d.step();
		})
		.end();
	});

	it.asyncly("switch sheet, insert rows below of row3 and row4 at the sheet2", function() {
		var addr;
		var sheet2Name;
		return actBy()
		.step(function(){
			sheet2Name = helpers.nameOfNextSheet();
			actions.switchSheet(sheet2Name);
		})
		.step(function(){
			//sheet name has the blank
			addr = "'S h e e t 2'"+ "!A3:AZ4";
			actions.focus(addr).insertRowsBelow();
		})
		.step(function(d){
			expect.model().rowAtIndex(7).hasValueCells(6).valueCellAtIndex(7).value(123);
			d.step();
		})
		.end();
	});

	it.asyncly(" switch sheet back and check according reference update in Sheet1", function() {
		return actBy()
		.step(function(){
			addr=sheetName+"!A3:AZ3";
			actions.switchSheet(sheetName);
			actions.focus(addr).insertRowsBelow();
		})
		.step(function(d){
			//the 1st undo is the undo of  insert rows in current sheet
			actions.undo(); 
			// sheet name includes the blank
			expect.model().rowAtIndex(2).hasValueCells(4).valueCellAtIndex(3).value("=SUM('S h e e t 2'.B3:G13)");
		})
		.step(function(){
			//the 2nd undo is the undo  of inserting rows in the next sheet
			actions.undo(); 
		})
		.step(function(d){
			// the reference is changed back
			expect.model().rowAtIndex(2).hasValueCells(4).valueCellAtIndex(3).value("=SUM('S h e e t 2'.B3:G11)");
			d.step();
		})
		.end();
	});
});
