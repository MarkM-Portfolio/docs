dojo.provide("writer.tests.apiTestcases.text.changeFontSize");
//dojo.require("writer.tests.Model");
/*objIndex: paragraph start to select; valid: 1,2,3,...
 * objNum: how many paragraph selected; valid: 1,2,3,...
 * 
 */

function setFontSize(objIndex,objNum,startindex,endIndex,targetFontSize,expect){
	//1. get editor
	//var pos = OperationSelection(objIndex,objNum,startindex,endIndex);
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	
	//var editor = window.testDoc1.pe.lotusEditor; 
	var editor = testGetEditor();
	
	//3. run command
	editor.execCommand("fontsize", targetFontSize);
	//4. get verify each target object
	var targetRuns = verifyObject(pos,objNum);

	//4. verify model
	verifyRuns(targetRuns,"font-size",expect);

	// 5. Verify dom
   //	verifyEditor(editor,targetRuns);
   };
   
doh.register("changeFontSize", [ 
	function changeTo8() {		
		var testFunc = function(){ 
			setFontSize(1,1,0,6,"8","8pt");
		};		
		startTest("changeFontSize", "changeTo8", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeTo12() {
		
		var testFunc = function(){ 
			setFontSize(1,1,2,8,"12","12pt");
		};		
		startTest("changeFontSize", "changeTo12", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeTo24() {
		
		var testFunc = function(){ 
			setFontSize(1,2,0,7,"24","24pt");
		};		
		startTest("changeFontSize", "changeTo24", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeTo48() {
		
		var testFunc = function(){ 
			setFontSize(1,2,0,9,"48","48pt");
		};		
		startTest("changeFontSize", "changeTo48", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}
]);
