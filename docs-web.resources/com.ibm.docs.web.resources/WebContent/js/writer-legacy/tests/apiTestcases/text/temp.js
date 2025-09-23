dojo.provide("writer.tests.apiTestcases.text.temp");

function testAlignment(command, attribute){ 
		// 0. Get the test editor and document 
		var editor = window.testDoc1.pe.lotusEditor; 
		var shell = editor._shell;
		var doc = editor.document;
		var firstP = doc.firstChild();
		var index = 0;
		var pos = {'obj': firstP, 'index': index};
		var selection = shell.getSelection();
		selection.select(pos, pos);
		editor.execCommand(command);
		editor.execCommand("indent",21);
		doh.assertEqual(firstP.directProperty.getAlign(), attribute);
		//Verify editor
		//verifyEditor(editor,firstP);
		setTimeout(function(){
		verifyParagrphAlignment(firstP);
		},0);
	
	}; 
	
	
doh.register("temp", 
		[ 
		    function paragraphAlignCenter() {
		    	 var testFunc = function(){
		    		 testAlignment("AlignCenter", "centered");
		    		 
		    	 };
		 	startTest("temp", "paragraphAlignCenter", "sample", testFunc);
		 	}			
		]
);