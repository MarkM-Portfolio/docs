dojo.provide("writer.tests.apiTestcases.Number&Bullet.multilevelBullet");
function multilevelBullet(objIndex,objNum,targetSym, expect, expectBullet){
	//1. get document
	var doc = testGetDocument();
	//2. select paras and get their pos
	var pos = posInDoc(doc,objIndex,objNum);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	editor.execCommand(targetSym);
	var targetObjs = getTargetParas(doc, objIndex, objNum);
	testUpdateDom();
	verifyMultilevelBullet(targetObjs, expect, expectBullet);	
	verifyBulletDom(targetObjs, "rootView");
};
function setMultilevelBullet(objIndex,objNum,targetSym, expect, expectBullet){
	//1. get document
	var doc = testGetDocument();
	//2. select paras and get their pos
	var pos = posInDoc(doc,objIndex,objNum);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	editor.execCommand(targetSym);
	editor.execCommand("outdent");
	testUpdateDom();
	var targetObjs = getTargetParas(doc, objIndex, objNum);
	verifyMultilevelBullet(targetObjs, expect, expectBullet);	
	verifyBulletDom(targetObjs, "rootView");
}
doh.register("multilevelBullet", [
  	function multilevelIndent() {
  		var testFunc = function() {
  			var expect = 1;
  			var expectBullet = ["a.", "b."];
  			multilevelBullet(2,2,"indent", expect, expectBullet);
  		};
  		startTest("multilevelBullet","multilevelIndent","sampleFiles/multiBulletSampleDocx", testFunc,"multiBulletSample.Docx");
  	},
  	function multilevelOutdent(){
  		var testFunc = function() {
  			var expect = 0;
  			var expectBullet = ["2.", "3."];
  			setMultilevelBullet(2,2,"indent", expect, expectBullet);
  		};
  		startTest("setMultilevelBullet","multilevelOutdent","sampleFiles/multiBulletSampleDocx", testFunc,"multiBulletSample.Docx");
  	}
  ]);