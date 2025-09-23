dojo.provide("concord.pres.test2.Util");


function loadSampleDocument() {
	return loadTestDocument('sample');
}


function assembleContent(folder) {
	
};

function loadTestDocument(folder) {
	
	return pe.lotusEditor.document;
}

/**
 * @param caseGroupName
 *            The test case group name.
 * @param caseName
 *            The test case name.
 * @param folder
 *            The test sample folder.
 * @param testFunc
 *            The test function.
 * @param sampleFileName
 *            The sample file name, exp: 'test.docx'.           
 * 
 * Sample doh.register("ImageTest",[
 * 
 * function testCase1() { var testFunc = function(){ var doc1 = window.testDoc1;
 * var doc2 = window.testDoc2; doh.t(false); };
 * 
 * startTest("ImageTest", "testCase1", "sample", testFunc); } ])
 * 
 * 
 */
var _testGroup = [];
var _inTesting = false;
var _scheduleTimer = null;

function startTest(caseGroupName, caseName, folder, testFunc,sampleFileName)
{
	_testGroup.push({"caseGroup": caseGroupName, "caseName":caseName, "folder": folder, "func": testFunc, "fileName": sampleFileName });

	var caseScheduler = function()
	{
		_scheduleTimer = null;
		if(_inTesting)
		{
			_scheduleTimer = setTimeout(caseScheduler, 1000);
			return;
		}	
		
		if(window.stopTest)
		{
			window.stopTest = false;
			_testGroup = [];
			return;
		}
		
		_implTest(_testGroup.shift());
		
		if(_testGroup.length > 0)
			_scheduleTimer = setTimeout(caseScheduler, 1000);
	};
	
	if(!_scheduleTimer)
		caseScheduler();
};

function _implTest(caseArg) {
	if(!caseArg)
		return;
	
	var caseGroupName = caseArg.caseGroup;
	var caseName = caseArg.caseName;
	var folder = caseArg.folder;
	var testFunc = caseArg.func;
	var fileName = caseArg.fileName;
	
	console.info("<<<<" + caseName + " :case started.");
	
	_inTesting = true;
	if (fileName == null||fileName == "") fileName = "listlevel.ppt";
	
	var doc1 = document.location.protocol+"//"+document.location.host+'/docs/app/doc/concord.storage/'+fileName+'/edit/content'; // Dummy
	if(document.location.host.indexOf("localhost") == -1)
		doc1 = document.location.protocol+"//"+document.location.host+'/docs/app/doc/lcfiles/591892cf-eef5-4294-8842-d3687ed868b3/edit/content';
	
	// URL
	var testDoc = (folder != "")? "?testDoc=" + folder : "";
	doc1 += testDoc;

//	setTimeout(function() {
//		if (window.testDoc1 && !window.testDoc1.closed) {
////			window.testDoc1.close();
//			alert("The test document already opened.");
//			 return;
//		}
//		window.testDoc1 = window.open(doc1);
//		console.log("open doc:"+window.testDoc1);		
//	}, 1000);
	
//	window.subDocloadFinished = function() // Call back function from child
//	// window.
//	{
////		setTimeout(function() {
////			dojo.publish("subDocLoadFinished");
////		}, 5000);
//		setTimeout(function() {
//			publishLoadFinished(window.testDoc1);
//		}, 1000);
//	};
	
	var handle = null;
	var testCase = function() {
		console.log("enter testCase");
		handle && dojo.unsubscribe(handle);
		
		var fixture = {};
		fixture.name = caseName; // Test Function name

		var runTest = function() {
			var exception = null;
			try {
				// block send message to server
//				if (window.testDoc1.pe) {
//					var session1 = window.testDoc1.pe.scene.session;
//					session1._sendMessage = session1.sendMessage;
//					session1.sendMessage = function() {
//					};
//				}
				console.info(caseName + " :next line is testFunc()!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!. >>>>");
				testFunc();
	
			} catch (ex) {
				exception = ex;
			}

//			window.testDoc1.close();
//			console.info(caseName + " :case ended. >>>>");
//			_inTesting = false;
			
			if (exception != null)
			{
				setTimeout( function(){ doh.updateReport(); }, 30000 );
				throw exception;
			}
		};

		fixture.runTest = runTest;
		doh._runFixture(caseGroupName, fixture); // Test case name
		doh._paused = false;
	};

//	handle = dojo.subscribe("subDocLoadFinished", null, testCase);
	
	setTimeout(function() {
		if (window.testDoc1 && !window.testDoc1.closed) {
//			window.testDoc1.close();
			alert("The test document already opened.");
			 return;
		}
		window.testDoc1 = window.open(doc1);
		console.log("open doc:"+window.testDoc1);	
		checkLoadFinished(window.testDoc1, testCase);
	}, 2000);
	
}

function endTest(window, caseName){
	window.close();
	setTimeout(function(){
		console.info(caseName + " :case ended. >>>>");
		_inTesting = false;
	}, 1000);	
}

function verifyTrue(message, condition){
	doh.debug("Test case VP: " + message + " Expected: true. Actual:" + condition);
	doh.assertTrue(condition);
}

function verifyEquals(message, expected, actual){
	doh.debug("Test case VP: " + message + " Expected: "+ expected + ". Actual:" + actual);
	doh.is(expected, actual);
}

function verifyFalse(message, condition){
	doh.debug("Test case VP: " + message + " Expected: false. Actual:" + condition);
	doh.assertFalse(condition);
}

function verifyNotEquals(message, notExpected, actual){
	doh.debug("Test case VP: " + message + " Not Expected: "+ notExpected + ". Actual:" + actual);
	doh.isNot(notExpected, actual);
}

window.doh.existInSorter = function(id){
	var sorterDoc = pe.scene.slideSorter.editor.document.$;
	var sorterNode = dojo.byId(id, sorterDoc);
	if(sorterNode)
		return true;
	
	throw new doh._AssertFailure("assert node with id " + id + " in sorter failed.");
};
