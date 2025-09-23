dojo.provide("writer.tests.apiTestcases.text.changeFontStyleItalic");
dojo.require("writer.tests.common.getOperationPosition");
dojo.require("writer.tests.common.commonOperation");
		
/*
 * author: wu chao feng
 * 
 * modify: wu jing jing
 * date:2013/09
 * change: delete setTimeout()
 * 
 * objIndex: paragraph start to select; valid: 1,2,3,...
 * objNum: how many paragraph selected; valid: 1,2,3,...
 * 
 */

function setValueItalic(objIndex,objNum,startindex,endIndex,targetCMD,expect){
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
	//5. verify model
	verifyRuns(targetRuns,"font-style",expect);
	 
	// 5. Verify dom
   //	verifyEditor(editor,targetRuns);
   };
function setRemoveValueItalic(objIndex,objNum,startindex,endIndex,targetCMD){
		//1. get editor
		var doc = testGetDocument();
		var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
		testGetSelection(pos);		
		var editor = testGetEditor();
		 //3. run command
		editor.execCommand(targetCMD);
		 //4. get each target object
		 var targetRuns = verifyObject(pos,objNum);
		 //5. verify model
	
		 verifyRuns(targetRuns,"font-style","italic");
		
		 editor.execCommand(targetCMD);
		 targetRuns = verifyObject(pos,objNum);					
		 verifyRuns(targetRuns,"font-style","normal");
				

		
		// 5. Verify dom
	   //	verifyEditor(editor,targetRuns);
	   };  
function sRSValueItalic(objIndex,objNum,startindex,endIndex,targetCMD){
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
			//4. verify model
			
			verifyRuns(targetRuns,"font-style","italic");			 
			editor.execCommand(targetCMD);
			 //remove
			targetRuns = verifyObject(pos,objNum);			 				
			verifyRuns(targetRuns,"font-style","normal");			 
			 editor.execCommand(targetCMD);
			 //set again
			targetRuns = verifyObject(pos,objNum);				
			//4. verify model
			verifyRuns(targetRuns,"font-style","italic");					
			// 5. Verify dom
		   //	verifyEditor(editor,targetRuns);
		   };   
doh.register("changeFontStyleItalic", [ 
	function changeSomeText() {		
		var testFunc = function(){ 
			setValueItalic(1,1,1,4,"italic","italic");
		};		
		startTest("changeFontStyleItalic", "changeSomeText", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
    function changeOnePara() {
		
		var testFunc = function(){ 
			setValueItalic(1,1,0,100,"italic","italic");
			setValueItalic(1,1,0,100,"italic","normal");
			setValueItalic(1,1,0,100,"italic","italic");
		};		
		startTest("changeFontStyleItalic", "changeOnePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeSomePara() {
		
		var testFunc = function(){ 
			setRemoveValueItalic(1,2,0,7,"italic");
		};		
		startTest("changeFontStyleItalic", "changeSomePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeWhole() {
		
		var testFunc = function(){ 
			sRSValueItalic(1,2,0,9,"italic");
		};		
		startTest("changeFontStyleItalic", "changeWhole", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}

]);
