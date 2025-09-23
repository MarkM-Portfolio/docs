dojo.provide("writer.tests.apiTestcases.text.chgFontNameInTable");
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
function setFontNameInTable(tableIndex,startCell,endCell,targetFontName,expect){
   
   var pos = selectInFile(tableIndex,startCell,endCell);
	
   var editor = testGetEditor(); 
	 editor.execCommand("fontname", targetFontName);
   var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	 //4. verify model
   verifyRuns(targetRuns,"font-family",expect);
	 // 5. Verify dom
   var table = getTargetTable(tableIndex);
   verifyEditor(editor,table);	
   };

doh.register("chgFontNameInTable", [ 
	
	function chgToComicSansMS() {		
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			setFontNameInTable(1,startCell,endCell,"Comic Sans MS","Comic Sans MS, cursive");
		};		
		startTest("chgFontNameInTable", "chgToComicSansMS", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function chgToArial() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":4,"paraIndex":2,"sIndex":0};
			setFontNameInTable(1,startCell,endCell,"Arial","Arial, Helvetica, sans-serif");
		};
		startTest("chgFontNameInTable", "chgToArial", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	
	function chgToCourierNew() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			setFontNameInTable(1,startCell,endCell,"Courier New","Courier New, Courier, monospace");
		};
		startTest("chgFontNameInTable", "chgToCourierNew", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function chgToCalibri() {
		var testFunc = function(){ 
			var startCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			setFontNameInTable(1,startCell,endCell,"Calibri","Calibri, Arial, sans-serif");
		};
		startTest("chgFontNameInTable", "chgToCalibri", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},

]);