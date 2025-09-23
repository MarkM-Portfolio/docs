dojo.provide("writer.tests.apiTestcases.text.changeFontWeight");
//dojo.require("writer.tests.common.getOperationPosition");
//dojo.require("writer.tests.common.commonOperation");
/*objIndex: paragraph start to select; valid: 1,2,3,...
 * objNum: how many paragraph selected; valid: 1,2,3,...
 * 
 */

function setFontWeight(objIndex,objNum,startindex,endIndex,targetCMD,expect){
	//1. get editor
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	var editor = testGetEditor();
	 editor.execCommand(targetCMD);
	//4. get each target object
	var targetRuns =verifyObject(pos,objNum);
	//5. verify model
	verifyRuns(targetRuns,"font-weight",expect);	 
	// 6. Verify dom
   //verifyEditor(editor,targetRuns);
   };
function setRemoveFontWeight(objIndex,objNum,startindex,endIndex,targetCMD){
		//1. get editor
		var doc = testGetDocument();
		var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
		testGetSelection(pos);
		var editor = testGetEditor();
		//3. run command
		editor.execCommand(targetCMD);
		//4. get each target object
	    var targetRuns = verifyObject(pos,objNum);
		//4. verify model	
		verifyRuns(targetRuns,"font-weight","bold");
		editor.execCommand(targetCMD);	
		var targetRun = verifyObject(pos,objNum);			
		verifyRuns(targetRuns,"font-weight","normal");
		// 5. Verify dom
	   //	verifyEditor(editor,targetRuns);
	   };  
function sRSFontWeight(objIndex,objNum,startindex,endIndex,targetCMD){
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
		verifyRuns(targetRuns,"font-weight","bold");	
		 editor.execCommand(targetCMD);				
		 //remove
		 targetRuns = verifyObject(pos,objNum);
		 verifyRuns(targetRuns,"font-weight","normal");		
		 editor.execCommand(targetCMD);				 
		 //set again
		 targetRuns = verifyObject(pos,objNum);
		 verifyRuns(targetRuns,"font-weight","bold"); 
	     // 5. Verify dom
         //	verifyEditor(editor,targetRuns);
		 };   
doh.register("changeFontWeight", [ 
	function changeSomeText() {		
		var testFunc = function(){ 
			setFontWeight(1,1,1,4,"bold","bold");
		};		
		startTest("changeFontWeight", "changeSomeText", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
    function changeOnePara() {
		
		var testFunc = function(){ 
			setFontWeight(1,1,0,100,"bold","bold");
			// setTimeout(function(){
			    // setFontWeight(1,1,0,100,"bold","normal", true);
			// },5);
			//setFontWeight(1,1,0,100,"bold","bold");
		};		
		startTest("changeFontWeight", "changeOnePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeSomePara() {
		
		var testFunc = function(){ 
			setRemoveFontWeight(1,2,0,7,"bold");
		};		
		startTest("changeFontWeight", "changeSomePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeWhole() {
		
		var testFunc = function(){ 
			sRSFontWeight(1,2,0,9,"bold");
		};		
		startTest("changeFontWeight", "changeWhole", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}

]);
