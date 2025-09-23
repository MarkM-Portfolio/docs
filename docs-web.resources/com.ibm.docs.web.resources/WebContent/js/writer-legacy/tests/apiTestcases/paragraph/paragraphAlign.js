dojo.provide("writer.tests.apiTestcases.paragraph.paragraphAlign");

function testAlignment(command, attribute){ 
		// 0. Get the test editor and document 
		//var editor = window.testDoc1.pe.lotusEditor; 
		//var shell = editor._shell;
		//var doc = editor.document;
	    var doc = testGetDocument();
	    var editor = testGetEditor();
	    var shell = testGetShell();
		var firstP = doc.firstChild();
		var index = 0;
		var pos = {'obj': firstP, 'index': index};
		var selection = shell.getSelection();
		selection.select(pos, pos);
		editor.execCommand(command);
		doh.assertEqual(firstP.directProperty.getAlign(), attribute);
		//Verify editor
		verifyEditor(editor);
	
	}; 
	
	
doh.register("paragraphAlign", 
		[ 
		    function paragraphAlignCenter() {
		    	 var testFunc = function(){
		    		 testAlignment("AlignCenter", "centered");
		    		 
		    	 };
		 	startTest("paragraphAlign", "paragraphAlignCenter", "sampleFiles/paraAlignmentDocx", testFunc, "paraAlignment.docx");
		 	},
		 	
		 	function paragraphAlignLeft() {
		 		var testFunc = function(){
		 			testAlignment("AlignLeft", "left");
		 		};
		 	startTest("paragraphAlign", "paragraphAlignLeft", "sampleFiles/paraAlignmentDocx", testFunc, "paraAlignment.docx");
			},
			
			function paragraphAlignRight() {
				var testFunc = function(){
					testAlignment("AlignRight", "right");
					};
		 		startTest("paragraphAlign", "paragraphAlignRight", "sampleFiles/paraAlignmentDocx", testFunc, "paraAlignment.docx");
			},
			
			function paragraphAlignJustify() {
				var testFunc = function(){
					testAlignment("Justify", "justified");
				};
		 		startTest("paragraphAlign", "paragraphAlignJustify", "sampleFiles/paraAlignmentDocx", testFunc, "paraAlignment.docx");
			}
		]
);