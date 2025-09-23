dojo.provide("writer.tests.apiTestcases.text.changeFontName");
//dojo.require("writer.tests.Model");
/*objIndex: paragraph start to select; valid: 1,2,3,...
 * objNum: how many paragraph selected; valid: 1,2,3,...
 * 
 */

function setFontName(objIndex,objNum,startindex,endIndex,targetFontName,expect){
	//1. get editor
	//var pos = OperationSelection(objIndex,objNum,startindex,endIndex);
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	
	//var editor = window.testDoc1.pe.lotusEditor; 
	var editor = testGetEditor();
	
	//3. run command
	editor.execCommand("fontname", targetFontName);
	//4. get verify each target object
	var targetRuns = verifyObject(pos,objNum);

	//4. verify model
	verifyRuns(targetRuns,"font-family",expect);

	// 5. Verify dom
   //	verifyEditor(editor,targetRuns);
   };
   
doh.register("changeFontName", [ 
	function changeToComicSansMS() {		
		var testFunc = function(){ 
			setFontName(1,1,1,4,"Comic Sans MS","Comic Sans MS, cursive");
		};		
		startTest("changeFontName", "changeToComicSansMS", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToArial() {
		
		var testFunc = function(){ 
			setFontName(1,1,0,50,"Arial","Arial, Helvetica, sans-serif");
		};		
		startTest("changeFontName", "changeToArial", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToCourierNew() {
		
		var testFunc = function(){ 
			setFontName(1,2,2,7,"Courier New","Courier New, Courier, monospace");
		};		
		startTest("changeFontName", "changeToCourierNew", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	},
	function changeToCalibri() {
		
		var testFunc = function(){ 
			setFontName(1,2,100,100,"Calibri","Calibri, Arial, sans-serif");
		};		
		startTest("changeFontName", "changeToCalibri", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}
]);
