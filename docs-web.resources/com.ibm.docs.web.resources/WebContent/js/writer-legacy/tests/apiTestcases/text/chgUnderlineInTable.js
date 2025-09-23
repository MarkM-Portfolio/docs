dojo.provide("writer.tests.apiTestcases.text.chgUnderlineInTable");
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
function setValueUnderlineInTable(tableIndex,startCell,endCell,targetCMD,expect){
   
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
function setRemoveValueUnderlineInTable(tableIndex,startCell,endCell,targetCMD,expect){
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
  
function sRSValueUnderlineInTable(tableIndex,startCell,endCell,targetCMD,expect){
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

doh.register("chgUnderlineInTable", [ 
	
	function changeInOneCell() {		
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			setValueUnderlineInTable(1,startCell,endCell,"underline","underline");
		};		
		startTest("chgUnderlineInTable", "changeInOneCell", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneCol() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			setValueUnderlineInTable(1,startCell,endCell,"underline","underline");
			setValueUnderlineInTable(1,startCell,endCell,"underline","underline");
			setValueUnderlineInTable(1,startCell,endCell,"underline","underline");
		};
		startTest("chgUnderlineInTable", "changeInOneCol", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneRow() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":4,"paraIndex":1,"sIndex":0};
			setRemoveValueUnderlineInTable(1,startCell,endCell,"underline","underline");
		};
		startTest("chgUnderlineInTable", "changeInOneRow", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInSomeCells() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":1,"paraIndex":1,"sIndex":0};
			var endCell = {"row":1,"col":4,"paraIndex":1,"sIndex":0};
			sRSValueUnderlineInTable(1,startCell,endCell,"underline","underline");
		};
		startTest("chgUnderlineInTable", "changeInSomeCells", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	/**
	function changeInWholeTable() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			setValueUnderlineInTable(1,startCell,endCell,"underline","underline");
		};
		startTest("chgUnderlineInTable", "changeInWholeTable", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	*/

]);