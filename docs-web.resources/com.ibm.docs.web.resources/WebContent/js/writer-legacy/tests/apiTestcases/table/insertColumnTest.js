dojo.provide("writer.tests.apiTestcases.table.insertColumnTest");
/**
 * author: wu chao feng
 * 
 * modify: wu jing jing
 * date: 2013/09/10
 * change: 
 * 1.add doh.debug()to print current row num and col num before insert new col
 * 2.verify dom still have problem, need chao feng to edit
 * 
 * tArray = [tRow,tCol]
 */

function insertOneColAfter(tableIdx,tArray,expectedNeib){ 
	var editor = testGetEditor(); 	
	//verifyTableNeib(tableObj,expectedNeib);
	var tableObj = getTargetTable(tableIdx);
	doh.debug("current row num: "+ tableObj.rows.len);
	doh.debug("current col num: "+ tableObj.cols.length);
	editor.execCommand("insertColAft");
	// this verify not correct need to considering more and find a valid way.
	
	verifyTableModel(tableObj,tArray);
	//verifyTableDom(tableObj,"rootView");	
};

function insertOneColumnBefore(tableIdx,tArray,expectedNeib ){ 
	var editor = testGetEditor(); 
	editor.execCommand("insertColBfr");
	//verifyTableNeib(tableObj,expectedNeib);
	var tableObj = getTargetTable(tableIdx);
	// this verify not correct need to considering more and find a valid way.
	verifyTableModel(tableObj,tArray);
	//verifyTableDom(tableObj,"rootView");	
};

 
doh.register("insertColumnTest", [ 
	function insertColTwice() {		
		var testFunc = function(){ 
		    var tTable = getTargetTable(1);
		   
		    var cell = getTargetCell(tTable,1,2);
			var pos = posInParagraph(cell,1,1,0,0);
			testGetSelection(pos);		
			
			var expectTable = [tTable.rows.len,tTable.cols.length+1];
			insertOneColAfter(1,expectTable,"");
			expectTalbe = [4,7];
			insertOneColumnBefore(1,expectTalbe,"");
				
		};		
		startTest("insertColumnTest", "insertColTwice", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.docx");
	},
	

]);