dojo.provide("writer.tests.apiTestcases.image.testInsertImage");
function tInsertImage(parentObject,objIndex,objNum,startindex,endIndex, imageNum ,expect){
	var pos = posInParagraph(parentObject,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	editor.execCommand("insertImage", ["Pictures/image1.gif",null]);
	var imageObj = getTargetImage(parentObject,imageNum);
	//4. verify model
	testUpdateDom();
	verifyImageModel(imageObj,expect);
	
	// 5. Verify dom
   	//verifyEditor(editor,imageObj);
	verifyImageDom(imageObj,"rootView");
	
}
doh.register("testInsertImage", 
		[ 
		    function insertTo1stParagraph() {
		    	 var testFunc = function(){
		    	     var doc = testGetDocument();
		    	     var expect = {"height":"2.64cm","width":"2.25cm"};
		    		 tInsertImage(doc,1,1,0,0,1,expect);
		    		 
		    	 };
		 	startTest("testInsertImage", "insertTo1stParagraph", "sampleFiles/imageSampleDocx", testFunc,"imageSample.docx");
		 	}
		
		]
);