dojo.provide("writer.tests.apiTestcases.text.changeUnderline");
//dojo.require("writer.tests.text.getTestObject");
/*objIndex: paragraph start to select; valid: 1,2,3,...
 * objNum: how many paragraph selected; valid: 1,2,3,...
 * testing
 */

function setValueUnderline(objIndex,objNum,startindex,endIndex,targetCMD,expect){
	//1. get editor
	//var pos = OperationSelection(objIndex,objNum,startindex,endIndex);
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	
	//var editor = window.testDoc1.pe.lotusEditor; 
	var editor = testGetEditor();
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	 var targetRuns = verifyObject(pos,objNum);
	//4. verifymodel

			//4. verifymodel
	verifyRuns(targetRuns,"text-decoration",expect);
	
	// 5. verifydom
   //	verifyEditor(editor,targetRuns);
   };
function setRemoveValueUnderline(objIndex,objNum,startindex,endIndex,targetCMD,expect){
		//1. get editor
		//var pos = OperationSelection(objIndex,objNum,startindex,endIndex);
		var doc = testGetDocument();
		var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
		testGetSelection(pos);
		//var editor = window.testDoc1.pe.lotusEditor; 
		var editor = testGetEditor();
		//3. run command
		editor.execCommand(targetCMD);
		//4. get each target object
		 var targetRuns = verifyObject(pos,objNum);
		//4. verifymodel
	
		 verifyRuns(targetRuns,"text-decoration",expect);
		
		 editor.execCommand(targetCMD);
		 targetRuns = verifyObject(pos,objNum);
		 verifyRuns(targetRuns,"text-decoration","");
		

		
		// 5. verifydom
	   //	verifyEditor(editor,targetRuns);
	   };  
function sRSValueUnderline(objIndex,objNum,startindex,endIndex,targetCMD,expect){
			//1. get editor
			//var pos = OperationSelection(objIndex,objNum,startindex,endIndex);
			var doc = testGetDocument();
			var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
			testGetSelection(pos);
			//var editor = window.testDoc1.pe.lotusEditor; 
			var editor = testGetEditor();
			//3. run command
			editor.execCommand(targetCMD);
			//4. get each target object
			 var targetRuns = verifyObject(pos,objNum);
			//4. verifymodel
			
			 verifyRuns(targetRuns,"text-decoration",expect);
			 
			 editor.execCommand(targetCMD);
			 //remove
			 targetRuns = verifyObject(pos,objNum);
			verifyRuns(targetRuns,"text-decoration","");
						
			 editor.execCommand(targetCMD);
			 //set again
			 targetRuns = verifyObject(pos,objNum);
			verifyRuns(targetRuns,"text-decoration",expect);
			// 5. verifydom
		   //	verifyEditor(editor,targetRuns);
		   };   
doh.register("changeUnderline", [ 
	function changeSomeText() {		
		var testFunc = function(){ 
			setValueUnderline(1,1,1,4,"underline","underline");
		};		
		startTest("changeUnderline", "changeSomeText", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
    function changeOnePara() {
		
		var testFunc = function(){ 
			setValueUnderline(1,1,0,10,"underline","underline");
			setValueUnderline(1,1,0,10,"underline","");
			setValueUnderline(1,1,0,10,"underline","underline");
		};		
		startTest("changeUnderline", "changeOnePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeSomePara() {
		
		var testFunc = function(){ 
			setRemoveValueUnderline(1,2,0,7,"underline","underline");
		};		
		startTest("changeUnderline", "changeSomePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeWhole() {
		
		var testFunc = function(){ 
			sRSValueUnderline(1,2,0,9,"underline","underline");
		};		
		startTest("changeUnderline", "changeSomePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}

]);
