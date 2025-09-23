dojo.provide("writer.tests.apiTestcases.text.chgTextStyleInTable");
//dojo.require("writer.tests.Model");
// Verify 
function setTextStyleInTable(tableIndex,startCell,endCell,styleList,expect){
   
    var pos = selectInFile(tableIndex,startCell,endCell);
    var editor = testGetEditor();
	//3. run command
    editor.execCommand("fontsize", 24);
	editor.execCommand("fontname", "Comic Sans MS");
	editor.execCommand("bold");
	editor.execCommand("italic");
	editor.execCommand("underline");
	editor.execCommand("strike");
	editor.execCommand("ForeColor", "#4169e1");
	editor.execCommand("HighlightColor", "#ff0000");
	//4. get each target object
    var targetRuns = getAllRunsInCellRange(pos,tableIndex,startCell,endCell);
	
	for (var id = 0; id<=styleList.length-1; id++){
		verifyRuns(targetRuns,styleList[id],expect[id]);
	}
	
	// 5. Verify dom
    //	verifyEditor(editor,targetRuns);
 };
doh.register("chgTextStyleInTable", [ 
	function changeInOneCell() {
		var testFunc = function(){ 			 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var styleList = new Array("font-size","font-family","font-weight","font-style","text-decoration","color","background-color");
			var expect = new Array("24pt","Comic Sans MS, cursive","bold","italic","underline line-through","#4169e1","#ff0000");
			setTextStyleInTable(1,startCell,endCell,styleList,expect);
		};
		startTest("chgTextStyleInTable", "changeInOneCell", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneRow() {
		var testFunc = function(){ 		 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":0,"col":4,"paraIndex":1,"sIndex":0};
			//this case, I don't verify last style "background-color"
			var styleList = new Array("font-size","font-family","font-weight","font-style","text-decoration","color");
			var expect = new Array("24pt","Comic Sans MS, cursive","bold","italic","underline line-through","#4169e1");
			setTextStyleInTable(1,startCell,endCell,styleList,expect);
		};
		startTest("chgTextStyleInTable", "changeInOneRow", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	function changeInOneCol() {
		var testFunc = function(){ 		 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":0,"paraIndex":1,"sIndex":0};
			//this case, I don't verify last style "background-color"
			var styleList = new Array("font-size","font-family","font-weight","font-style","text-decoration","color");
			var expect = new Array("24pt","Comic Sans MS, cursive","bold","italic","underline line-through","#4169e1");
			setTextStyleInTable(1,startCell,endCell,styleList,expect);
		};
		startTest("chgTextStyleInTable", "changeInOneCol", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	//failed in changewhole cause blank cell.
	function changeWhole() {
		var testFunc = function(){ 		 
			var startCell = {"row":0,"col":0,"paraIndex":1,"sIndex":0};
			var endCell = {"row":3,"col":4,"paraIndex":1,"sIndex":0};
			//this case, I don't verify last style "background-color"
			var styleList = new Array("font-size","font-family","font-weight","font-style","text-decoration","color");
			var expect = new Array("24pt","Comic Sans MS, cursive","bold","italic","underline line-through","#4169e1");
			setTextStyleInTable(1,startCell,endCell,styleList,expect);
		};
		startTest("chgTextStyleInTable", "changeWhole", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.Docx");
	},
	
]);