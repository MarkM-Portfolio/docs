dojo.provide("writer.tests.apiTestcases.text.chgFontWeightInTable");
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
function setFontWeightInTable(tableIndex,startCell,endCell,targetCMD,expect){
   
    var pos = selectInFile(tableIndex,startCell,endCell);
    var editor = testGetEditor();
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	 var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	 setTimeout(function(){			
			//4. verify model
		 verifyRuns(targetRuns,"font-weight",expect);
			},1);
	 
	// 5. Verify dom
    //	verifyEditor(editor,targetRuns);
    };
function setRemoveFontWeightInTable(tableIndex,startCell,endCell,targetCMD){
		//1. get editor		
	var pos = selectInFile(tableIndex,startCell,endCell);
	var editor = testGetEditor();
	
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	
	verifyRuns(targetRuns,"font-weight","bold");
		
	editor.execCommand(targetCMD);
	targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
		 
	
    setTimeout(function(){				
		verifyRuns(targetRuns,"font-weight","normal");
				},1); 

		
	// 5. Verify dom
	//	verifyEditor(editor,targetRuns);
    };  
  
function sRSFontWeightInTable(tableIndex,startCell,endCell,targetCMD){
	//1. get editor
	var pos = selectInFile(tableIndex,startCell,endCell);
	
	var editor = testGetEditor();
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	//4. verify model
	
	 verifyRuns(targetRuns,"font-weight","bold");
	 
	 editor.execCommand(targetCMD);
	 //remove
	 targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	 setTimeout(function(){				
			verifyRuns(targetRuns,"font-weight","normal");
				},1);
	 
	 editor.execCommand(targetCMD);
	 //set again
	 targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	
	 setTimeout(function(){			
			//4. verify model
		 verifyRuns(targetRuns,"font-weight","bold");
			},1);
	// 5. Verify dom
   //	verifyEditor(editor,targetRuns);
   };   

doh.register("chgFontWeightInTable", [ 
	
	function changeInOneCell() {		
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			setFontWeightInTable(1,startCell,endCell,"bold","bold");
		};		
		startTest("chgFontWeightInTable", "changeInOneCell", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneCol() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			setFontWeightInTable(1,startCell,endCell,"bold","bold");
			setFontWeightInTable(1,startCell,endCell,"bold","normal");
			setFontWeightInTable(1,startCell,endCell,"bold","bold");
		};
		startTest("chgFontWeightInTable", "changeInOneCol", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneRow() {
		var testFunc = function(){ 
			var startCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":1,"paraIndex":1,"sIndex":0};
			setRemoveFontWeightInTable(1,startCell,endCell,"bold");
		};
		startTest("chgFontWeightInTable", "changeInOneRow", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInSomeCells() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":1,"paraIndex":1,"sIndex":0};
			var endCell = {"row":1,"col":4,"paraIndex":1,"sIndex":0};
			sRSFontWeightInTable(1,startCell,endCell,"bold");
		};
		startTest("chgFontWeightInTable", "changeInSomeCells", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInWholeTable() {
		var testFunc = function(){ 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			setFontWeightInTable(1,startCell,endCell,"bold","bold");
		};
		startTest("chgFontWeightInTable", "changeInWholeTable", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},

]);