dojo.provide("writer.tests.apiTestcases.text.chgStrikethroughInTable");
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
function setValueStrikeInTable(tableIndex,startCell,endCell,targetCMD,expect){
   
    var pos = selectInFile(tableIndex,startCell,endCell);
    var editor = testGetEditor();
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	 var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	 setTimeout(function(){			
			//4. verify model
		 verifyRuns(targetRuns,"text-decoration",expect);
			},1);
	 
	// 5. Verify dom
    //	verifyEditor(editor,targetRuns);
    };
function setRemoveValueStrikeInTable(tableIndex,startCell,endCell,targetCMD,expect){
		//1. get editor		
	var pos = selectInFile(tableIndex,startCell,endCell);
	var editor = testGetEditor();
	
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	
	verifyRuns(targetRuns,"text-decoration", expect);
		
	editor.execCommand(targetCMD);
	targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
		 
	
    setTimeout(function(){				
		verifyRuns(targetRuns,"text-decoration","undefined");
				},1); 

		
	// 5. Verify dom
	//	verifyEditor(editor,targetRuns);
    };  
  
function sRSValueStrikeInTable(tableIndex,startCell,endCell,targetCMD,expect){
	//1. get editor
	var pos = selectInFile(tableIndex,startCell,endCell);
	
	var editor = testGetEditor();
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	
	 verifyRuns(targetRuns,"text-decoration", expect);
	 
	 editor.execCommand(targetCMD);
	 //remove
	 targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	 setTimeout(function(){				
			verifyRuns(targetRuns,"text-decoration","undefined");
				},1);
	 
	 editor.execCommand(targetCMD);
	 //set again
	 targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	
	 setTimeout(function(){			
			//4. verify model
		 verifyRuns(targetRuns,"text-decoration", expect);
			},1);
	// 5. Verify dom
   //	verifyEditor(editor,targetRuns);
   };   

doh.register("chgStrikethroughInTable", [ 
	
	function changeInOneCell() {		
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			setValueStrikeInTable(1,startCell,endCell,"strike","line-through");
		};		
		startTest("chgStrikethroughInTable", "changeInOneCell", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneCol() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			setValueStrikeInTable(1,startCell,endCell,"strike","line-through");
			setValueStrikeInTable(1,startCell,endCell,"strike","undefined");
			setValueStrikeInTable(1,startCell,endCell,"strike","line-through");
		};
		startTest("chgStrikethroughInTable", "changeInOneCol", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneRow() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":4,"paraIndex":1,"sIndex":0};
			setRemoveValueStrikeInTable(1,startCell,endCell,"strike","line-through");
		};
		startTest("chgStrikethroughInTable", "changeInOneRow", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInSomeCells() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":1,"paraIndex":1,"sIndex":0};
			var endCell = {"row":1,"col":4,"paraIndex":1,"sIndex":0};
			sRSValueStrikeInTable(1,startCell,endCell,"strike","line-through");
		};
		startTest("chgStrikethroughInTable", "changeInSomeCells", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	/**
	function changeInWholeTable() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			setValueStrikeInTable(1,startCell,endCell,"strike","line-through");
		};
		startTest("chgStrikethroughInTable", "changeInWholeTable", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	*/

]);