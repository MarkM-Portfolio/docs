sample();

var freezeAt = expect.freezeAt = function(/*Number*/rowIndex, /*String or Number*/col){
	var colIndex = 0;
	if (typeof col == "number"){
		colIndex = col;
	} else {
		colIndex = app.websheet.Helper.getColNum(col);
	}
	expect.model().freezeAt(rowIndex, colIndex);
	expect.ui().freezeAt(rowIndex, colIndex);
};

describe("Freeze", function(){
	var sn = "createpane" + new Date().getTime();

	it.asyncly("top row", function(){
		return actBy()
		.step(function() {
			actions.insertSheet(sn);
		}).step(function() {
			//initial status - No freeze panes
			expect.freezeAt(0, 0);
			//freeze row
			actions.freezeRow(1);
		}).step(function() {
			expect.freezeAt(1, 0);
			//PgDn
			actions.pageDown();
		}).step(function() {
			expect.freezeAt(1, 0);
			//PgUp
			actions.pageUp();	
		}).step(function() {
			expect.freezeAt(1, 0);
			//undo
			actions.undo();
		}).step(function() {
			expect.freezeAt(0, 0);
			//redo
			actions.redo();
		}).step(function(d) {
			expect.freezeAt(1, 0);
			d.step();
		}).end();
	});

	it.asyncly("10 rows", function(){
		return actBy()
		.step(function(d) {
			//initial status - freeze 1 row
			expect.freezeAt(1, 0);
			d.step();
		}).step(function() {
			//freeze 10 rows
			actions.freezeRow(10);
		}).step(function() {
			expect.freezeAt(10, 0);
			//undo 
			actions.undo();
		}).step(function() {
			expect.freezeAt(1, 0);
			//redo
			actions.redo();
		}).step(function() {
			expect.freezeAt(10, 0);
			//Scroll down
			actions.scrollToRow(201);
		}).step(function() {
			expect.freezeAt(10, 0);			  
			//Scroll up
			actions.scrollToRow(1);
		}).step(function(d) {  
			expect.freezeAt(10, 0);
			d.step();
		}).end();
	});

	it.asyncly("first column", function(){
		return actBy()
		.step(function(d) {
			//initial status - freeze 10 rows
			expect.freezeAt(10, 0);
			d.step();
		}).step(function() {
			//freeze column A
			actions.freezeColumn(1);
		}).step(function() {
			expect.freezeAt(10, 1);
			//scroll right
			actions.scrollToColumn("Z");
		}).step(function() {  
			expect.freezeAt(10, 1);
			//scroll left
			actions.scrollToColumn("A");
		}).step(function() {
			expect.freezeAt(10, 1);
			//undo
			actions.undo();
		}).step(function() {
			expect.freezeAt(10, 0);
			//redo
			actions.redo();
		}).step(function(d) {
			expect.freezeAt(10, 1);
			d.step();
		}).end();
	});

	it.asyncly("5 columns", function(){
		return actBy()
		.step(function(d) {
			//initial status - freeze 10 rows, 1 column
			expect.freezeAt(10, 1);
			d.step();
		}).step(function() {
			//freeze column A - E
			actions.freezeColumn(5);
		}).step(function() {
			expect.freezeAt(10, 5);
			//scroll right
			actions.scrollToColumn("Z");
		}).step(function() {
			expect.freezeAt(10, 5);
			//scroll left
			actions.scrollToColumn("M");
		}).step(function() {
			expect.freezeAt(10, 5);
			//undo
			actions.undo();
		}).step(function() {
			expect.freezeAt(10, 1);
			//redo
			actions.redo();
		}).step(function(d) {
			expect.freezeAt(10, 5);
			d.step();
		}).end();
	});

	it.asyncly("across merged cells", function(){
		return actBy()
		.step(function(d) {
			//initial status - freeze 10 rows, 5 columns
			expect.freezeAt(10, 5);
			d.step();
		}).step(function() {
			//merge cells across the bar
			actions.focus(sn + "!E1:F1").mergeCell();
		}).step(function() {
			expect.freezeAt(10, 0);
			//undo
			//As design - freeze panes will not be recovered. 
			actions.undo();
		}).step(function() {				 
			expect.freezeAt(10, 0);
			//freeze column&row
			actions.freezeColumn(5);
		}).step(function() {
			expect.freezeAt(10, 5);
			//merge cells in one pane
			actions.focus(sn + "!A10:E10").mergeCell(); 
			actions.focus(sn + "!F10:H10").mergeCell(); 
		}).step(function() {
			expect.freezeAt(10, 5);
			//scroll right and down
			actions.scrollToRow(100).scrollToColumn("H");
		}).step(function() {
			expect.freezeAt(10, 5);
			//paste merged cells across
			actions.focus(sn + "!A10:E10").copy();
			actions.focus(sn + "!C100").paste();
		}).step(function() {
			expect.freezeAt(10, 0);
			//As design - freeze panes will not be recovered. 
			actions.undo();
		}).step(function(d) {
			expect.freezeAt(10, 0);
			//fail, A10:E10, F10:H10 merged
			actions.freezeColumn(3);
			d.step();
		}).step(function() {
			expect.freezeAt(10, 0);
			actions.freezeColumn("I");			  
		}).step(function(d) {				  
			expect.freezeAt(10, "I");
			d.step();
		}).end();
	});	

	it.asyncly("unfreeze", function(){
		return actBy()
		.step(function(d) {	  
			expect.freezeAt(10, "I");
			d.step();
		}).step(function() {				 
			//unfreeze columns
			actions.freezeColumn(0);
		}).step(function() {				  
			expect.freezeAt(10, 0);
			//unfreeze rows 
			actions.freezeRow(0);
		}).step(function() {				  
			expect.freezeAt(0, 0);
			//undo
			actions.undo();
		}).step(function() {				  
			expect.freezeAt(10, 0);
			//undo
			actions.undo();
		}).step(function() {
			expect.freezeAt(10, "I");
			//redo
			actions.redo();
		}).step(function() {
			expect.freezeAt(10, 0);
			//redo
			actions.redo();
		}).step(function(d) {				  
			expect.freezeAt(0, 0);
			d.step();
		}).end();
	});
});	
