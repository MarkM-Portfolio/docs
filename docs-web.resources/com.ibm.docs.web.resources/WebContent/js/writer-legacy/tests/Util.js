dojo.provide("writer.tests.Util");
dojo.require("writer.model.style.Styles");
dojo.require("writer.model.Settings");
dojo.require("writer.model.Relations");

function loadSampleDocument() {
	return loadTestDocument('sample');
}


function assembleContent(folder) {
	var prepath = "/docs/js/writer/tests/" + folder + "/";
	if(document.location.host.indexOf('localhost') == -1)
		prepath = "/docs" + window.staticRootPath + "/js/writer/tests/" + folder + "/";
	
	var content, styles, numbering, settings, relations;
	eval("content = " + dojo._getText(prepath + "content.json"));
	eval("styles = " + dojo._getText(prepath + "styles.json"));
	eval("numbering = " + dojo._getText(prepath + "numbering.json"));
	eval("settings = " + dojo._getText(prepath + "settings.json"));
	eval("relations = " + dojo._getText(prepath + "relations.json"));

	var jsonCnt = {};
	jsonCnt.content = content.body;
	jsonCnt.style = styles;
	jsonCnt.setting = settings;
	jsonCnt.numbering = numbering;
	jsonCnt.relations = relations;

	return jsonCnt;
};

function loadTestDocument(folder) {
	dojo.publish(writer.EVENT.BEFORE_LOAD);

	var jsonCnt = assembleContent(folder);
//	var rel = new writer.model.Relations(jsonCnt.relations);
//	pe.lotusEditor.layoutEngine.relations = rel;
//	var styles = new writer.model.style.Styles(jsonCnt.style);
//	styles.initcreateCSSStyle();
//	var document = new writer.model.Document(jsonCnt.content,
//			styles,jsonCnt.numbering,
//			new writer.model.Settings(jsonCnt.setting), rel);
//	pe.lotusEditor.document = document;
//	dojo.publish(writer.EVENT.LOAD_READY);
//	return document;
	
	pe.lotusEditor.relations = new writer.model.Relations(jsonCnt.relations);
	pe.lotusEditor.number = new writer.model.Numbering(jsonCnt.numbering);
	pe.lotusEditor.styles = new writer.model.style.Styles(jsonCnt.style);
	pe.lotusEditor.styles.createCSSStyle();
	pe.lotusEditor.setting = new writer.model.Settings(jsonCnt.setting);
	pe.lotusEditor.relations.loadContent();
	pe.lotusEditor.document = new writer.model.Document(jsonCnt.content, pe.lotusEditor.layoutEngine);
	
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
	_testGroup.push({"caseGroup": caseGroupName, "caseName":caseName, "folder": folder, "func": testFunc, "fileName":"test2.docx" });

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
	if (fileName == null||fileName == "") fileName = "test2.docx";
	
	var doc1 = document.location.protocol+"//"+document.location.host+'/docs/app/doc/concord.storage/test2.docx/edit/content'; // Dummy
	if(document.location.host.indexOf("localhost") == -1)
		doc1 = document.location.protocol+"//"+document.location.host+'/docs/app/doc/lcfiles/591892cf-eef5-4294-8842-d3687ed868b3/edit/content';
	
	// URL
	var testDoc = (folder != "")? "?testDoc=" + folder : "";
	doc1 += testDoc;
	setTimeout(function() {
		if (window.testDoc1 && !window.testDoc1.closed) {
//			window.testDoc1.close();
			alert("The test document already opened.");
			 return;
		}
		window.testDoc1 = window.open(doc1);
	}, 5000);

	
	window.subDocloadFinished = function() // Call back function from child
	// window.
	{
		setTimeout(function() {
			dojo.publish("subDocLoadFinished");
		}, 1000);
	};

	var handle = null;
	var testCase = function() {
		handle && dojo.unsubscribe(handle);
		
		var fixture = {};
		fixture.name = caseName; // Test Function name

		var runTest = function() {
			var exception = null;
			try {
				// block send message to server
				if (window.testDoc1.pe) {
					var session1 = window.testDoc1.pe.scene.session;
					session1._sendMessage = session1.sendMessage;
					session1.sendMessage = function() {
					};
				}

				testFunc();
			} catch (ex) {
				exception = ex;
			}

			window.testDoc1.close();
			console.info(caseName + " :case ended. >>>>");
			_inTesting = false;
			
			if (exception != null)
			{
				setTimeout( function(){ doh.updateReport(); }, 100 );
				throw exception;
			}
		};

		fixture.runTest = runTest;
		doh._runFixture(caseGroupName, fixture); // Test case name
		doh._paused = false;
	};

	handle = dojo.subscribe("subDocLoadFinished", null, testCase);
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

