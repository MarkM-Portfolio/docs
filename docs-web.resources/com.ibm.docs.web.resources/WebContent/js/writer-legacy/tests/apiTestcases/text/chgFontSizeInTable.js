dojo.provide("writer.tests.apiTestcases.text.chgFontSizeInTable");
/**
* @param tableIndex
*        table to operate. valid: 1,2,3....
* @param startCell
*        valid: 0,1,2...
*        {"row":1,"col":2,"paraIndex":1,"sIndex":0}
* @param endCell
* 		 valid: 0,1,2...
*        {"row":1,"col":2,"paraIndex":2,"eIndex":4}
*/
function setFontSizeInTable(tableIndex,startCell,endCell,targetFontName,expect){
   
   var pos = selectInFile(tableIndex,startCell,endCell);
	
   var editor = testGetEditor(); 
	 editor.execCommand("fontsize", targetFontName);
   var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	 //4. verify model
   verifyRuns(targetRuns,"font-size",expect);
	 // 5. Verify dom
   var table = getTargetTable(tableIndex);
   verifyEditor(editor,table);	
   };

doh.register("chgFontSizeInTable", [ 
	
	function changeTo8() {		
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":1,"col":4,"paraIndex":1,"sIndex":0};
			setFontSizeInTable(1,startCell,endCell,"8","8pt");
		};		
		startTest("chgFontSizeInTable", "changeTo8", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeTo12() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			setFontSizeInTable(1,startCell,endCell,"12","12pt");
		};
		startTest("chgFontSizeInTable", "changeTo12", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeTo24() {
		var testFunc = function(){ 
			var startCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":1,"paraIndex":1,"sIndex":0};
			setFontSizeInTable(1,startCell,endCell,"24","24pt");
		};
		startTest("chgFontSizeInTable", "changeTo24", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeTo48() {
		var testFunc = function(){ 
			var startCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			setFontSizeInTable(1,startCell,endCell,"48","48pt");
		};
		startTest("chgFontSizeInTable", "changeTo48", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	

]);