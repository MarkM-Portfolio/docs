dojo.provide("writer.tests.apiTestcases.text.chgHighlightInTable");
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
function setHighlightColorInTable(tableIndex,startCell,endCell,targetFontColor,expect){
   
   var pos = selectInFile(tableIndex,startCell,endCell);
	
   var editor = testGetEditor(); 
   editor.execCommand("HighlightColor", targetFontColor);
   var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	 //4. verify model
   verifyRuns(targetRuns,"background-color",expect);
	 // 5. Verify dom
   var table = getTargetTable(tableIndex);
   verifyEditor(editor,table);	
   };
/**
 * select more than one cell, the highlight will set to the cells, and the text's style doesn't have the highlight.
 * Need to tell the dev, after they update, then re-test.
 */
doh.register("chgHighlightInTable", [ 
	
	function changeToRed() {		
		var testFunc = function(){ 
		var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
		var endCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
		setHighlightColorInTable(1,startCell,endCell,"#ff0000","#ff0000");
		};		
		startTest("chgHighlightInTable", "changeToRed", "sampleFiles/tableSample1Docx", testFunc, "tableSample1.Docx");
	},
	function changeToBlue() {
		var testFunc = function(){ 
		var startCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
		var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
		setHighlightColorInTable(1,startCell,endCell,"#7b68ee","#7b68ee");
		};
		startTest("chgHighlightInTable", "changeToBlue", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeToGreen() {
		var testFunc = function(){ 
		var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
		var endCell = {"row":0,"col":4,"paraIndex":1,"sIndex":0};
		setHighlightColorInTable(1,startCell,endCell,"#32cd32","#32cd32");
		};
		startTest("chgHighlightInTable", "changeToGreen", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeToPink() {
		var testFunc = function(){ 
		var startCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
		var endCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
		setHighlightColorInTable(1,startCell,endCell,"#ffc0cb","#ffc0cb");
		};
		startTest("chgHighlightInTable", "changeToPink", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	/**
    function changeToDiff() {
	},
	*/
]);