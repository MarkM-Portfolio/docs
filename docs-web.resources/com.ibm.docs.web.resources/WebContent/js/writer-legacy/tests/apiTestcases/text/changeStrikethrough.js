dojo.provide("writer.tests.apiTestcases.text.changeStrikethrough");
//dojo.require("writer.tests.common.getOperationPosition");
//dojo.require("writer.tests.common.commonOperation");
/*objIndex: paragraph start to select; valid: 1,2,3,...
 * objNum: how many paragraph selected; valid: 1,2,3,...
 * 
 */

function setValueStrike(objIndex,objNum,startindex,endIndex,targetCMD,expect){
	//1. get editor
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	var editor = testGetEditor();
	//3. run command
	editor.execCommand(targetCMD);
	//4. get each target object
	var targetRuns = verifyObject(pos,objNum);			
	//4. verifymodel
    verifyRuns(targetRuns,"text-decoration",expect);		
	// 5. verifydom
    //verifyEditor(editor,targetRuns);
   };
function setRemoveStrike(objIndex,objNum,startindex,endIndex,targetCMD,expect){
	//1. get editor
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);	
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
	//5. verifydom
    //verifyEditor(editor,targetRuns);
	   };  
function sRSValueStrike(objIndex,objNum,startindex,endIndex,targetCMD,expect){
	//1. get editor
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
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
    //verifyEditor(editor,targetRuns);
   };   
doh.register("changeStrikethrough", [ 
	function changeSomeText() {		
		var testFunc = function(){ 
			setValueStrike(1,1,1,4,"strike","line-through");
		};		
		startTest("changeStrikethrough", "changeSomeText", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
    function changeOnePara() {	
		var testFunc = function(){ 
			setValueStrike(1,1,0,9,"strike","line-through");
			setValueStrike(1,1,0,9,"strike","");
			setValueStrike(1,1,0,9,"strike","line-through");
		};		
		startTest("changeStrikethrough", "changeOnePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},	
	function changeSomePara() {		
		var testFunc = function(){ 
			setRemoveStrike(1,2,0,7,"strike","line-through");
			//setValueStrike(1,2,0,7,"strike","line-through");
		};		
		startTest("changeStrikethrough", "changeSomePara", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},	
	function changeWhole() {		
		var testFunc = function(){ 
			sRSValueStrike(1,2,0,9,"strike","line-through");
			//setValueStrike(1,2,0,9,"strike","line-through");
		};		
		startTest("changeStrikethrough", "changeWhole", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}
]);
