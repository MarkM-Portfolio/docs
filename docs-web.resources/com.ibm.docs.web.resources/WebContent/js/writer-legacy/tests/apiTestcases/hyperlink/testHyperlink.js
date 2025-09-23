dojo.provide("writer.tests.apiTestcases.hyperlink.testHyperlink");
/**
 * author: wu jing jing 
 * date: 2013/09
 * tests: 
 * 1. test insert url link
 * 2. test insert email
 * 3. test open link
 * 4. test remove link
 * @param parentObject: document    
 * @param objIndex: object start to select,valid 1,2,3,4,..
 * @param objNum: how many objects have been selected, valid 1,2,3,4...
 * @param startindex: start selection, valid 0,1,2,3...
 * @param endIndex: end selection, valid 0,1,2,3...
 * @param targetAddr: target url, eg: http://www.baidu.com
 * @param hyIdx: which link is the target link, valid 1,2,3...
 * @param expect: expect link's style and src
 */
function insertHylk(parentObject,objIndex,objNum,startindex,endIndex,targetAddr,hyIdx,expect){
	//var doc = testGetDocument();
	var pos = posInParagraph(parentObject,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	editor.execCommand("link",[targetAddr]);
	var targetO = getTargetParagraph(parentObject,objIndex);
	var hylkObj = getTargetHyperlink(targetO,hyIdx);
	//4. verify model
	verifyHylkModel(hylkObj,expect);
	//verify DOM
	verifyEditor(editor, hylkObj);
}
function openHylk(parentObject,objIndex,objNum,startindex,endIndex,targetCMD,hyIdx,expect){
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	editor.execCommand(targetCMD);
	var targetO = getTargetParagraph(parentObject,objIndex);
	var hylkObj = getTargetHyperlink(targetO,hyIdx);
	verifyHylkModel(hylkObj,expect);
	//verify DOM
	verifyEditor(editor, hylkObj);	
}
function removeHylk(parentObject,objIndex,objNum,startindex,endIndex,targetCMD,hyIdx,expect){
	var doc = testGetDocument();
	var pos = posInParagraph(doc,objIndex,objNum,startindex,endIndex);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	var targetO = getTargetParagraph(parentObject,objIndex);
	var hylkObj = getTargetHyperlink(targetO,hyIdx);
	verifyHylkModel(hylkObj,expect);
	editor.execCommand(targetCMD);
	var runText = targetO.firstChild();
	var i = 1;
	while(runText){
		if(runText.modelType== "run.hyperlink"){
			doh.debug("The" + i + "hyperlink's src is " + runText.src);
			i++;
			runText = runText.next();
		}
		else {
			doh.debug("The run type is " + runText.modelType);
			runText = runText.next();
		}
	}	
	//verify DOM
	//verifyEditor(editor, textObj);	
}
doh.register("testHyperlink", 
		[ 
		    function insertHylkURL() {
		    	 var testFunc = function(){
		    		 var doc = testGetDocument();
		    		 var targetAddr = "http://www.baidu.com";
		    		 var expect = {"Forecolor":"#0000FF","textDecoration":"underline","src":targetAddr};
		    		 insertHylk(doc,1,1,0,7,targetAddr,1,expect);
		    		 
		    	 };
		 	startTest("testHyperlink", "insertHylkURL", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.docx");
		 	},
		
		 	function openHylkURL() {
		    	 var testFunc = function(){
		    		 var doc = testGetDocument();
		    		 var expect = {"Forecolor":"#0000FF","textDecoration":"underline","src":"http://www.baidu.com/"};
		    		 openHylk(doc,1,1,1,5,"openlink",1,expect);
		    		 
		    	 };
		 	startTest("testHyperlink", "openHylkURL", "sampleFiles/linkSampleDocx", testFunc,"linkSample.docx");
		 	},
		 
		 	function insertHylkEmail() {
		    	 var testFunc = function(){
		    		 var doc = testGetDocument();
		    		 var targetAddr = "mailto:jjwubj@cn.ibm.com?subject=test%20the%20e-mail%20link";
		    		 var expect = {"Forecolor":"#0000FF","textDecoration":"underline","src":targetAddr};
		    		 insertHylk(doc,1,1,0,9,targetAddr,1,expect);
		    		 
		    	 };
		 	startTest("testHyperlink", "insertHylkEmail", "sampleFiles/tableSample1Docx", testFunc,"tableSample1.docx");
		 	},
		 	
		 	function removeHylkURL() {
		    	 var testFunc = function(){
		    		 var doc = testGetDocument();
		    		 var expect = {"Forecolor":"#0000FF","textDecoration":"underline","src":"http://www.baidu.com/"}; 
		    		 removeHylk(doc,1,1,0,5,"unlink",1,expect);		    		 
		    	 };
		 	startTest("testHyperlink", "removeHylkURL", "sampleFiles/linkSampleDocx", testFunc,"linkSample.docx");
		 	},	
		 		
		]);
