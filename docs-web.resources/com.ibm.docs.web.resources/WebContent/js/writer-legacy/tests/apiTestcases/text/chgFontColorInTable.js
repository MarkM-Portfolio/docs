dojo.provide("writer.tests.apiTestcases.text.chgFontColorInTable");
/**
* @param tableIndex
*        table to operate. valid: 1,2,3....
* @param startCell
*       valid: 0,1,2...
*       {"row":1,"col":2,"paraIndex":1,"sIndex":0}
* @param endCell
* 		 valid: 0,1,2...
*        {"row":1,"col":2,"paraIndex":2,"eIndex":4}
*/
function setFontColorInTable(tableIndex,startCell,endCell,targetFontColor,expect){
	 var pos = selectInFile(tableIndex,startCell,endCell);	
	 var editor = testGetEditor(); 
	 editor.execCommand("ForeColor", targetFontColor);
	 var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	 //4. verify model
	 verifyRuns(targetRuns,"color",expect);
	 // 5. Verify dom
	 var table = getTargetTable(tableIndex);
	 verifyEditor(editor,table);	
   };
   
doh.register("chgFontColorInTable", [ 
	
	function changeToRed() {		
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":1,"paraIndex":1,"sIndex":0};
			setFontColorInTable(1,startCell,endCell,"#ff0000","#ff0000");
		};		
		startTest("chgFontColorInTable", "changeToRed", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.docx");
	},
	function changeToBule() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			setFontColorInTable(1,startCell,endCell,"#7b68ee","#7b68ee");
		};
		startTest("chgFontColorInTable", "changeToBule", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.docx");
	},
	function changeToGreen() {
		var testFunc = function(){ 
			var startCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":1,"paraIndex":1,"sIndex":0};
			setFontColorInTable(1,startCell,endCell,"#00FF00","#00FF00");
		};
		startTest("chgFontColorInTable", "changeToGreen", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.docx");
	},
	/**
	 * select the blank cell, the case failed. 
	 * The dev has some problem, just hold on this, after dev modify their code then verify.
	 * chao feng--dev bug-- add color action should add style for blank span, but not insert a new blank span which with color style
	 * 
	 */
	function changeToPink() {
		var testFunc = function(){ 
			var startCell = {"row":2,"col":1,"paraIndex":1,"sIndex":0};
			var endCell = {"row":2,"col":1,"paraIndex":1,"sIndex":0};
			setFontColorInTable(1,startCell,endCell,"#ffc0cb","#ffc0cb");
		};
		startTest("chgFontColorInTable", "changeToPink", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.docx");
	},
	

]);
