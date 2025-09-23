dojo.provide("writer.tests.apiTestcases.text.chgFontStyleItalicInTable");
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
function setValueItalicIInTable(tableIndex,startCell,endCell,targetCMD,expect){
   
    var pos = selectInFile(tableIndex,startCell,endCell);
    var editor = testGetEditor();
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	 var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	 setTimeout(function(){			
			//4. verify model
		 verifyRuns(targetRuns,"font-style",expect);
			},1);
	 
	// 5. Verify dom
    //	verifyEditor(editor,targetRuns);
    };
function setRemoveValueItalicInTable(tableIndex,startCell,endCell,targetCMD){
		//1. get editor		
	var pos = selectInFile(tableIndex,startCell,endCell);
	var editor = testGetEditor();
	
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	
	verifyRuns(targetRuns,"font-style","italic");
		
	editor.execCommand(targetCMD);
	targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
		 
	
    setTimeout(function(){				
		verifyRuns(targetRuns,"font-style","normal");
				},1); 

		
	// 5. Verify dom
	//	verifyEditor(editor,targetRuns);
    };  
  
function sRSValueItalicInTable(tableIndex,startCell,endCell,targetCMD){
	//1. get editor
	var pos = selectInFile(tableIndex,startCell,endCell);
	
	var editor = testGetEditor();
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	
	 verifyRuns(targetRuns,"font-style","italic");
	 
	 editor.execCommand(targetCMD);
	 //remove
	 targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	 setTimeout(function(){				
			verifyRuns(targetRuns,"font-style","normal");
				},1);
	 
	 editor.execCommand(targetCMD);
	 //set again
	 targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	
	 setTimeout(function(){			
			//4. verify model
		 verifyRuns(targetRuns,"font-style","italic");
			},1);
	// 5. Verify dom
   //	verifyEditor(editor,targetRuns);
   };   

doh.register("chgFontStyleItalicInTable", [ 
	
	function changeInOneCell() {		
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			setValueItalicIInTable(1,startCell,endCell,"italic","italic");
		};		
		startTest("chgFontStyleItalicInTable", "changeInOneCell", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneCol() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			setValueItalicIInTable(1,startCell,endCell,"italic","italic");
			setValueItalicIInTable(1,startCell,endCell,"italic","normal");
			setValueItalicIInTable(1,startCell,endCell,"italic","italic");
		};
		startTest("chgFontStyleItalicInTable", "changeInOneCol", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneRow() {
		var testFunc = function(){ 
			var startCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":1,"paraIndex":1,"sIndex":0};
			setRemoveValueItalicInTable(1,startCell,endCell,"italic");
		};
		startTest("chgFontStyleItalicInTable", "changeInOneRow", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInSomeCells() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":1,"paraIndex":1,"sIndex":0};
			var endCell = {"row":1,"col":4,"paraIndex":1,"sIndex":0};
			sRSValueItalicInTable(1,startCell,endCell,"italic");
		};
		startTest("chgFontStyleItalicInTable", "changeInSomeCells", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	/**
	function changeInWholeTable() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			setValueItalicInTable(1,startCell,endCell,"italic","italic");
		};
		startTest("chgFontStyleItalicInTable", "changeInWholeTable", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	*/

]);