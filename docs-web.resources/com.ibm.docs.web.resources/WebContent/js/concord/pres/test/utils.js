dojo.provide("concord.pres.test.utils");

(function(){
	var _utils = window.testUtils.utils = {};
	
	//from websheet.test.utils
	_utils.asyncTest = function() {
		// summary: helper for async test, users can write
		// 		asyncTest().doTest( ... ).
		//			doTest( ... ).
		//			repeatUntil( ... );
		//		to perform a DOH async test.
		//		Test calls need to finish with an end() or a repeatUntil(). Both functions return a doh.Deferred() for DOH to check 
		//			whole test results.
		var deferred = new doh.Deferred();
		
		var doList = [];
		
		var index = 0;
		
		var fRepeat = null;
		
		var _call = function() {
			var f = doList[index++];
			var interval = doList[index];
			if (interval != null && typeof(interval) == "number") {
				index++;
			} else {
				interval = null;
			}
			var d = new doh.Deferred();
			d.addCallback(function() {
				if (index < doList.length) {
					// test function finishes, try to call next
					_call();
				} else {
					// the chain finishes, check if need to repeat
					if (fRepeat == null) {
						// no repeat, callback main deferred to finishes the test
						deferred.callback(true);
					} else {
						// check if need to repeat
						if (fRepeat()) {
							// finishes the test
							deferred.callback(true);
						} else {
							// repeats
							index = 0;
							_call();
						}
					}
				}
			});
			d.addErrback(function(err) {
				// pass err to main deferred, end the test
				deferred.errback(err);
			});
			setTimeout(function () {
				try {
					f(d, doh);
				} catch (e) {
					d.errback(e);
				}
			}, interval);
		};
		
		var _self = {
			doTest: function(f, interval) {
				// summary: perform a test in function f after provided interval. Interval default to 0.
				//		f is called in arguments:
				//			deferred: the deferred for the test to report its result
				//			doh: the global doh object
				//		f is called in a setTimeout() timer, f must report its test result by the provided deferred, use callback() for pass,
				//			errback() for failure, also f can just throw any exceptions including assert exceptions. The exceptions will be marked
				//			as errback() for the provided deferred
				doList.push(f);
				if (interval != null) {
					doList.push(interval);
				}
				
				return _self;
			},
				
			end: function() {
				// summary: perform all tests that mentioned in previous doTest(), returns a deferred as the whole test's result
				_call();
				return deferred;
			},
			
			repeatUntil: function(f) {
				// summary: perform all tests that mentioned in previous doTest(), check provided f, if f retuns true, repeat the whole test,
				//		finishes the test otherwise. returns a deferred as the whole test's result
				fRepeat = f;
				_call();
				return deferred;
			}
		};
		
		return _self;
	};
		
	
	
	/*-----------------Constants for auto test----------------------*/
	_utils.PRES_NORMAL_TEXT = "test";
	_utils.PRES_8203 = "\u200B"; //equals to "&#8203;"
	_utils.PRES_BS160 = "\u00A0"; //equals to "&nbsp;"
	_utils.PRES_BS32 = "\u0032";
	
	//Table types:
	_utils.TABLE_STYLES = [
		PresConstants.TABLE_PLAIN,
		PresConstants.TABLE_BLUE,
		PresConstants.TABLE_RED_TINT,
		PresConstants.TABLE_BLUE_HEADER,
		PresConstants.TABLE_DARK_GRAY_HEADER_FOOTER,
		PresConstants.TABLE_LIGHT_GRAY_ROWS,
		PresConstants.TABLE_DARK_GRAY,
		PresConstants.TABLE_BLUE_TINT,
		PresConstants.TABLE_RED_HEADER,
		PresConstants.TABLE_GREEN_HEADER_FOOTER,
		PresConstants.TABLE_PLAINT_ROWS,
		PresConstants.TABLE_GRAY_TINT,
		PresConstants.TABLE_GREEN_TINT,
		PresConstants.TABLE_GREEN_HEADER,
		PresConstants.TABLE_RED_HEADER_FOOTER,
		PresConstants.TABLE_GREEN_STYLE,
		PresConstants.TABLE_PURPLE_TINT,
		PresConstants.TABLE_BLACK_HEADER,
		PresConstants.TABLE_PURPLE_HEADER,
		PresConstants.TABLE_LIGHT_BLUE_HEADER_FOOTER
	];
	
	//Custom table types:
	_utils.CUSTOM_TABLE_STYLES = [
/*1*/		PresConstants.TABLE_CUSTOM_PLAIN,
/*2*/		PresConstants.TABLE_CUSTOM_TOP_HEADER,
/*3*/		PresConstants.TABLE_CUSTOM_FIRST_COL_HEADER,
/*4*/		PresConstants.TABLE_CUSTOM_FIRST_COL_HEADER + ' ' + PresConstants.TABLE_CUSTOM_TOP_HEADER,
/*5*/		PresConstants.TABLE_CUSTOM_BOTTOM_SUMMARY,
/*6*/		PresConstants.TABLE_CUSTOM_TOP_HEADER + ' ' + PresConstants.TABLE_CUSTOM_BOTTOM_SUMMARY,
/*7*/		PresConstants.TABLE_CUSTOM_FIRST_COL_HEADER + ' ' + PresConstants.TABLE_CUSTOM_LAST_COL_SUMMARY,
/*8*/		PresConstants.TABLE_CUSTOM_TOP_HEADER + ' ' + PresConstants.TABLE_CUSTOM_FIRST_COL_HEADER
				+ ' ' + PresConstants.TABLE_CUSTOM_BOTTOM_SUMMARY + ' ' + PresConstants.TABLE_CUSTOM_LAST_COL_SUMMARY
	];
	
	/*-----------------util API----------------------*/

	/**
	 * @param slideNum: page number of one slide
	 * @return dpNode: draw page node
	 */
	_utils.getSlideNodeByNum = function(slideNum){
		var wrapperList = pe.scene.slideSorter.slides;
		if(isNaN(slideNum) || (slideNum > wrapperList.length))
			return null;
		
		
		var dpNode = wrapperList[slideNum - 1];
		return dpNode;
	};
	
	_utils.getFirstSpan = function(editor){
		var dfNode = PresCKUtil.getDFCNode(editor);
		var spanNode = new CKEDITOR.dom.node(PresCKUtil.getFirstSpan(dfNode));
		return spanNode;
	};
	
	_utils.getTextFromFirstSpan = function(editor){
		var span = _utils.getFirstSpan(editor);
		return span.getText();
	};
	
	/*-----------mock range--------------*/
	/**
	 * <span>^test^</span>
	 * first span of text box or table
	 */
	_utils.mockSelectWholeSpanWithText = function(editor){
		
		var spanNode = _utils.getFirstSpan(editor);
		spanNode.setText(_utils.PRES_NORMAL_TEXT);
		editor.contentBox.synchAllData();
		
		var ckRange = new CKEDITOR.dom.range(editor.document);
		ckRange.setStart(spanNode, 0);
		ckRange.setEnd(spanNode, 1);
		ckRange.select();
		return ckRange;
	};
	
	_utils.mockSelectTheFirstSpan = function(editor){
		
		var spanNode = _utils.getFirstSpan(editor);
		var ckRange = new CKEDITOR.dom.range(editor.document);
		ckRange.setStart(spanNode, 0);
		ckRange.setEnd(spanNode, 1);
		ckRange.select();
		return ckRange;
	};
	
	/**
	 * <span>^&#8203;^</span>
	 * @param editor
	 */
	_utils.mockSelectWholeSpanWith8203 = function(editor){
		var spanNode = _utils.getFirstSpan(editor);
		spanNode.setText(_utils.PRES_8203);
		editor.contentBox.synchAllData();
		
		var ckRange = new CKEDITOR.dom.range(editor.document);
		ckRange.setStart(spanNode, 0);
		ckRange.setEnd(spanNode, 1);
		ckRange.select();
		return ckRange;
	};
	
	/**
	 * <span>^ ^</span>
	 * @param editor
	 */
	_utils.mockSelectWholeSpanWithNBSP = function(editor){
		var spanNode = _utils.getFirstSpan(editor);
		spanNode.setText(_utils.PRES_BS160);
		editor.contentBox.synchAllData();
		
		var ckRange = new CKEDITOR.dom.range(editor.document);
		ckRange.setStart(spanNode, 0);
		ckRange.setEnd(spanNode, 1);
		ckRange.select();
		return ckRange;
	};
	
	/**
	 * <span>^ ^</span>
	 * @param editor
	 */
	_utils.mockSelectWholeSpanWithBS32 = function(editor){
		var spanNode = _utils.getFirstSpan(editor);
		spanNode.setText(_utils.PRES_BS32);
		editor.contentBox.synchAllData();
		
		var ckRange = new CKEDITOR.dom.range(editor.document);
		ckRange.setStart(spanNode, 0);
		ckRange.setEnd(spanNode, 1);
		ckRange.select();
		return ckRange;
	};
	
	_utils.mockSpanEndCallapsedRange = function(editor){
		var spanNode = _utils.getFirstSpan(editor);
		spanNode.setText(_utils.PRES_NORMAL_TEXT);

		var ckRange = new CKEDITOR.dom.range(editor.document);
		ckRange.moveToElementEditEnd(spanNode);
		ckRange.select();
		editor.contentBox.synchAllData();
		return ckRange;
	};
	
	/**
	 * <span>^&#8203;&#nbsp; ^</span>
	 * @param editor
	 */
	_utils.mockSelectWholeSpanWithMix = function(editor){
		
	};
	
	/**
	 * <span>&#nbsp;^&#8203; ^</span>
	 * @param editor
	 */
	_utils.mockSelectWholeSpanWithMix1 = function(editor){
		
	};
	
	/**
	 * * testTEST
	 * <span>test</span><span>TEST</span><br>
	 * @param editor
	 */
	_utils.mockSelectWholeSpanWithMix1 = function(editor){
		
	};
	
	/*-----------mock cursor--------------*/
	//
	_utils.mockCursorInEmptySpan = function(editor){
		
	};
	
	_utils.mockCursorInSpanBefore8203 = function(editor){
		var spanNode = _utils.getFirstSpan(editor);
		spanNode.setText(_utils.PRES_8203);
		editor.contentBox.synchAllData();
		
		var ckRange = new CKEDITOR.dom.range(editor.document);
		ckRange.setStart(spanNode, 0);
		ckRange.setEnd(spanNode, 0);
		ckRange.select();
		return ckRange;
	};
	
	/**
	 * simulate mouse down to cell, then get the range
	 * @param editor
	 * @returns {CKEDITOR.dom.range}
	 */
	_utils.mockCursorInSpanAfter8203 = function(editor){
		var spanNode = _utils.getFirstSpan(editor);
		spanNode.setText(_utils.PRES_8203);
		editor.contentBox.synchAllData();
		
		var ckRange = new CKEDITOR.dom.range(editor.document);
		ckRange.setStart(spanNode, 1);
		ckRange.setEnd(spanNode, 1);
		ckRange.select();
		return ckRange;
	};
	
	
	// *. ^aaabbb
	//<li>^<span>rrrrrr</span><br></li>
	_utils.mockCursorAfterBulletText = function(editor){
		
	};
	
	//<li><span>^rrrrrr</span><br></li>
	_utils.mockCursorAfterBulletBeforeText = function(editor){
		
	};
	
	// *. aaabbb^
	_utils.mockCursorAtEndOfList = function(editor){
		
	};
	
	//
	_utils.mockCursorAtBeginOfFirstEmptyPara = function(editor){
		
	};
	
/*-------------------Pres assertions------------------*/
	
	window.doh.notNull = function(object){
		if(object)
			return true;
		throw new doh._AssertFailure("assertisNull(" + object + ") failed.");
	};
	
	window.doh.existInSorter = function(id){
		var sorterDoc = pe.scene.slideSorter.editor.document.$;
		var sorterNode = dojo.byId(id, sorterDoc);
		if(sorterNode)
			return true;
		
		throw new doh._AssertFailure("assert node with id " + id + " in sorter failed.");
	};
	
	window.doh.notExistInSorter = function(id){
		var sorterDoc = pe.scene.slideSorter.editor.document.$;
		var sorterNode = dojo.byId(id, sorterDoc);
		if(!sorterNode)
			return true;
		
		throw new doh._AssertFailure("assert node with id " + id + "NOT in sorter failed.");
	};
	
	window.doh.existInSlideEditor = function(id){
		if(dojo.byId(id))
			return true;
		
		throw new doh._AssertFailure("assert node with id " + id + " in slide editor failed.");;
	};
	
	window.doh.notExistInSlideEditor = function(id){
		if(!dojo.byId(id))
			return true;
		
		throw new doh._AssertFailure("assert node with id " + id + "NOT in slide editor failed.");;
	};
	
	//so far, only check cursor inside a span
	window.doh.checkCursorInSpan = function(content){
		
	};
	
	
	//----------------------------------------------//
	var _deferrals = _utils.deferrals = {};
	var _d = window.doh;
	var _a = window.aspect;
	
	_deferrals.initialLoad = function(deferred){
		deferred = deferred || new _d.Deferred();
		
		_a.after(concord.main.App, "onLoad", function(){
			_a.after(pe, "load", function(){
//				_a.after(pe.scene, "loaded", function(){
					_deferrals.documentLoad(deferred);
//				});
			});
		});
		
		return deferred;
	};
	
	_deferrals.documentLoad = function(deferred){
		var slidesorter = pe.scene.slideSorter;
		if(slidesorter){
			 _a.after(slidesorter, "postContentLoaded", function() {	
				 var slideEditor = pe.scene.slideEditor;
				 slideEditor && slideEditor.createSpareTableContentBox();
				 setTimeout(function(){
					 deferred.callback();
				 }, 5000);
			}, true);			
		}else{
			setTimeout(function() {_deferrals.documentLoad(deferred);}, 1000);
		}
		
	};
})();