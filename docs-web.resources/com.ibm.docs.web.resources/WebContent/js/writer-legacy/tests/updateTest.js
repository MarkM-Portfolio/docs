dojo.provide("writer.tests.updateTest");
//dojo.require("writer.tests.Model");

doh.register("updateTest", [ 
	function paragraphUpdate() {
		
		var testFunc = function(){ 
			// 0. Get the test editor and document 
			var editor = window.testDoc1.pe.lotusEditor; 
			var shell = editor._shell;
			var doc = editor.document;

			// 1. Select the first paragraph
			var firstP = doc.firstChild();
			var index = 2;
			var pos = {'obj': firstP, 'index': index};			
			var selection = shell.getSelection();
			selection.select(pos, pos);
			
			// 2. Insert text
			var oldText = firstP.text;
			var insertCnt = 'hello';
			shell.insertText(insertCnt);
			var newText = firstP.text;
			
			// 3. Verify Model
			var oldText = oldText.substring(0, index) + insertCnt + oldText.substring(index, oldText.length);
			doh.is(oldText, newText);
			
			// 4. Verify editor
			verifyEditor(editor);
		};
		
		startTest("updateTest", "paragraphUpdate", "sample", testFunc);
	}
]);
