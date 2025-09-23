dojo.provide("writer.tests.apiTestcases.table.insertRowTest");


/**
 * tArray = [tRow,tCol]
 */

function insertOneRowAbove(tArray,expectedNeib ){ 
	var editor = testGetEditor(); 
	var tableObj = getTargetTable(1);
	doh.debug("current row num: "+ tableObj.rows.len);
	doh.debug("current col num: "+ tableObj.cols.length);
	editor.execCommand("insertRowAbove");
	//verifyTableNeib(tableObj,expectedNeib);
	var tableObj =  getTargetTable(1);
	// this verify not correct need to considering more and find a valid way.
	verifyTableModel(tableObj,tArray);
	//verifyTableDom(tableObj);	
};
function insertOneRowBelow(tArray,expectedNeib ){ 
	var editor = testGetEditor(); 
	var tableObj = getTargetTable(1);
	doh.debug("current row num: "+ tableObj.rows.len);
	doh.debug("current col num: "+ tableObj.cols.length);
	editor.execCommand("insertRowBelow");
	//verifyTableNeib(tableObj,expectedNeib);
	var tableObj =  getTargetTable(1);
	// this verify not correct need to considering more and find a valid way.
	verifyTableModel(tableObj,tArray);
	//verifyTableDom(tableObj);	
};
 
doh.register("insertRowTest", [ 
	function insertRAbove() {		
		var testFunc = function(){ 
		    var table = getTargetTable(1);
		    var cell = getTargetCell(table,1,2);
			var pos = posInParagraph(cell,1,1,0,0);
			testGetSelection(pos);		
			
			var expectTalbe = [5,5];
			insertOneRowAbove(expectTalbe,"");
			expectTalbe = [6,5];
			insertOneRowBelow(expectTalbe,"");
				
		};		
		startTest("insertRowTest", "insertRAbove", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.docx");
	}

]);
