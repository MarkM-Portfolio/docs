dojo.provide("writer.tests.apiTestcases.table.createTable");


/**
 * tArray = [tRow,tCol]
 */

function createTable(tArray,expectedNeib ){ 
	var doc = testGetDocument();
	var pos = posInParagraph(doc,1,1,2,2);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	editor.execCommand("onTableCreate", tArray);
	//verifyTableNeib(tableObj,expectedNeib);
	var tableObj =  getTargetTable(1);
	// this verify not correct need to considering more and find a valid way.
	testUpdateDom();
	verifyTableModel(tableObj,tArray);
    
    verifyTableDom(tableObj,"rootView");
    
};
 
doh.register("createTable", [ 
                             
	function createTableOnTop() {		
		var testFunc = function(){ 
			//var expectedNeib = getTableNeighbours(pos);	
			var tableArray = [1,2];
			
			createTable(tableArray,"");		
		};		
		startTest("createTable", "createTableOnTop", "sampleFiles/createTableDocx", testFunc, "createTable.docx");
	},
	
	/*
	function createTableWithTwoRows() {		
		var testFunc = function(){ 
			//var expectedNeib = getTableNeighbours(pos);	
			var talbeArray = [2,4];
			createTable(talbeArray,"");		
		};		
		startTest("createTable", "createTableWithTwoRows", "sampleFiles/createTableDocx", testFunc, "createTable.docx");
	},
	*/

]);
