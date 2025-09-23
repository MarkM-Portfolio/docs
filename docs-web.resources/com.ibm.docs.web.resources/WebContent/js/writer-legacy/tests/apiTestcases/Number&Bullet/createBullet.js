dojo.provide("writer.tests.apiTestcases.Number&Bullet.createBullet");
function createBullet(objIndex,objNum,targetSym, expectBullet){
	//1. get document
	var doc = testGetDocument();
	//2. select paras and get their pos
	var pos = posInDoc(doc,objIndex,objNum);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	//3. command to set/remove number/bullet
	editor.execCommand("bullet", {"numbering":targetSym, "onOff":false});
	var targetObjs = getTargetParas(doc, objIndex, objNum);
	//4. verify model
	var expect = "Symbol";
	verifyBullets(targetObjs,expect, expectBullet);
	testUpdateDom();
	//5. verify view
	verifyBulletDom(targetObjs, "rootView");
};
function removeBullet(objIndex,objNum,targetSym, expectBullet){
	//1. get document
	var doc = testGetDocument();
	//2. select paras and get their pos
	var pos = posInDoc(doc,objIndex,objNum);
	testGetSelection(pos);
	var editor = testGetEditor(); 
	//3. command to set/remove number/bullet
	editor.execCommand("bullet", {"numbering":targetSym, "onOff":false});
    testUpdateDom();
    var targetObjs = getTargetParas(doc, objIndex, objNum);
	verifyBulletDom(targetObjs, "rootView");
	editor.execCommand("bullet", {"numbering":targetSym, "onOff":true});
	var targetObjs = getTargetParas(doc, objIndex, objNum);
	//4. verify model
	expect = "";
	verifyBullets(targetObjs,expect, expectBullet);
	//5. verify view
	verifyEditor(editor);
};
doh.register("createBullet", [
	function createDiamond() {
		var testFunc = function() {		
			var expectBullet = ["♦", "♦"];
			createBullet(1,2,"diamond", expectBullet);			
		};
		startTest("createBullet","createDiamond","sampleFiles/sampleForBulletDocx", testFunc,"sampleForBullet.Docx");
	},
	function removeDiamond() {
		var testFunc = function() {
			var expectBullet = ["", ""];
			removeBullet(1,2,"diamond",expectBullet);		
		};
		startTest("createBullet","removeDiamond","sampleFiles/sampleForBulletDocx", testFunc,"sampleForBullet.Docx");
	},
]);
