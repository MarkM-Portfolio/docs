dojo.provide("writer.tests.apiTestcases.text.changeHighlightColor");
//dojo.require("writer.tests.Model");
/*objIndex: paragraph start to select; valid: 1,2,3,...
 * objNum: how many paragraph selected; valid: 1,2,3,...
 * 
 */

function setHighlightColor(objIndex,objNum,startindex,endIndex,targetFontColor,expect){
	//1. get editor
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);	
	//3. run command	
	var editor = testGetEditor();
	editor.execCommand("HighlightColor", targetFontColor);
	//4. get verify each target object
	var targetRuns = verifyObject(pos,objNum);			
	//4. verify model
    verifyRuns(targetRuns,"background-color",expect);
	// 5. Verify dom
   //	verifyEditor(editor,targetRuns);
   };
   
doh.register("changeHighlightColor", [ 
	function changeToRed() {		
		var testFunc = function(){ 
			setHighlightColor(1,1,1,4,"#ff0000","#ff0000");
		};		
		startTest("changeHighlightColor", "changeToRed", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToBlue() {		
		var testFunc = function(){ 
			setHighlightColor(1,1,0,100,"#7b68ee","#7b68ee");
		};		
		startTest("changeHighlightColor", "changeToBlue", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToGreen() {		
		var testFunc = function(){ 			
			setHighlightColor(1,2,0,7,"#32cd32","#32cd32");
		};		
		startTest("changeHighlightColor", "changeToGreen", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToPink() {		
		var testFunc = function(){ 			
			setHighlightColor(1,2,0,100,"#ffc0cb","#ffc0cb");
		};		
		startTest("changeHighlightColor", "changeToPink", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}
]);
