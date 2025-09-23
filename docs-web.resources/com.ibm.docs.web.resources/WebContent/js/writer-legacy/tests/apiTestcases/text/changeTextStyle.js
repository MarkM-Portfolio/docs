dojo.provide("writer.tests.apiTestcases.text.changeTextStyle");
//dojo.require("writer.tests.Model");
// Verify 
doh.register("changeTextStyle", [ 
	function changeStyle() {
		
		var testFunc = function(){ 
			// 0. Get the test editor and document 
			var editor = testGetEditor();
			var shell = testGetShell();
			var doc = testGetDocument();
			// 1. Select the first paragraph
			var firstP = doc.firstChild();
			var index1 = 1;
			var pos1 = {'obj': firstP, 'index': index1};
			var index2 = 4;
			var pos2 = {'obj': firstP, 'index': index2};
			var selection = shell.getSelection();			
			selection.select(pos1, pos2);			
			// 2. Set font size	
			editor.execCommand("fontsize", 24);
			editor.execCommand("fontname", "Comic Sans MS");
			editor.execCommand("bold");
			editor.execCommand("italic");
			editor.execCommand("underline");
			editor.execCommand("strike");
			editor.execCommand("ForeColor", "#4169e1");
			editor.execCommand("HighlightColor", "#ff0000");			
			// 3. Verify Model
			//var oldText = oldText.substring(0, index) + insertCnt + oldText.substring(index, oldText.length);
			//doh.is(oldText, newText);			 
			 var con = firstP.container;
			 var targetRun;
			  con.forEach(function(run){
				if( run.start == 1 && ( (run.start+ run.length)==4) )
				{
					targetRun = run;
					return false;
				}
			});
			
			var stylelist = targetRun.getStyle();			
			doh.is(stylelist["font-size"],"24pt");
			doh.is(stylelist["font-family"],"Comic Sans MS, cursive");
			doh.is(stylelist["font-weight"],"bold");
			doh.is(stylelist["font-style"],"italic");
			doh.is(stylelist["text-decoration"],"underline line-through");
			doh.is(stylelist["color"],"#4169e1");
			doh.is(stylelist["background-color"],"#ff0000");
			// 4. Verify editor
			//verifyEditor(editor,firstP);
		};		
		startTest("changeTextStyle", "changeStyle", "sampleFiles/textSampleDocx", testFunc, "textSample.docx");
	}
]);
