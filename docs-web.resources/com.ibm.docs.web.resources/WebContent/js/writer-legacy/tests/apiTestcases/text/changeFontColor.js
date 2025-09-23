dojo.provide("writer.tests.apiTestcases.text.changeFontColor");
dojo.require("writer.tests.apiTestcases.text.getTestObject");
//dojo.require("writer.tests.Model");


/*
 * objIndex: paragraph start to select; valid: 1,2,3,...
 * objNum: how many paragraph selected; valid: 1,2,3,...
 */
function setFontColor(objIndex,objNum,startindex,endIndex,targetFontColor,expect){
	//1. get editor
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	//2. run command
	var editor = testGetEditor(); 
	editor.execCommand("ForeColor", targetFontColor);
	//3. get verify each target object
	var targetRuns = verifyObject(pos,objNum);
	//4. verify model
	 verifyRuns(targetRuns,"color",expect);
	
	// 5. Verify dom
   	verifyEditor(editor,targetRuns);
   };
   
doh.register("changeFontColor", [ 
	function changeToRed() {		
		var testFunc = function(){ 
			setFontColor(1,1,1,4,"#ff0000","#ff0000");
		};		
		startTest("changeFontColor", "changeToRed", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToBlue() {
		
		var testFunc = function(){ 
			setFontColor(1,1,0,100,"#7b68ee","#7b68ee");
		};		
		startTest("changeFontColor", "changeToBlue", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToGreen() {
		
		var testFunc = function(){ 
			setFontColor(1,2,0,7,"#32cd32","#32cd32");
		};		
		startTest("changeFontColor", "changeToGreen", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToPink() {
		
		var testFunc = function(){ 
			setFontColor(1,2,2,7,"#ffc0cb","#ffc0cb");
		};		
		startTest("changeFontColor", "changeToPink", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}
]);
