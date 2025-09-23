dojo.provide("writer.tests.apiTestcases.paragraph.paragraphHeading");


function selectFirstParagraph(){
		editor = window.testDoc1.pe.lotusEditor; 
		var shell = editor._shell;
		var doc = editor.document;
		firstP = doc.firstChild();
		var index = 0;
		var pos = {'obj': firstP, 'index': index};
		var selection = shell.getSelection();
		selection.select(pos, pos);
};

doh.register("paragraphHeading", 
		[ 
         	function setHeading() {
         		
         		var testFunc = function(){ 
         			selectFirstParagraph();
         			editor.execCommand('heading','Heading1');
         			verifyTrue("Verify the paraghraph is Heading.", firstP.directProperty.paragraph.isHeading());
         			verifyEquals("The style: ", "Heading1", firstP.directProperty.paragraph.getStyleId());
         			//Verify editor
         			verifyEditor(editor);
         		}; 		
         	startTest("paragraphHeading", "setHeading", "sampleFiles/paraAlignmentDocx", testFunc, "paraAlignment.docx");
 	},
 	
 			function removeHeading() {
		 		var testFunc = function(){ 
		 			selectFirstParagraph();
		 			editor.execCommand('heading','Heading2');
		 			verifyEquals("the paragraph style is: ", "Heading2", firstP.directProperty.paragraph.getStyleId());
		 			editor.execCommand('heading','Normal');
		 			verifyFalse("The paragraph remove heading style. ", firstP.directProperty.paragraph.isHeading());
		 			//Verify editor
		 			verifyEditor(editor);
		 		}; 		
			startTest("paragraphHeading", "removeHeading", "sampleFiles/paraAlignmentDocx", testFunc, "paraAlignment.docx");
 	}
         	]);