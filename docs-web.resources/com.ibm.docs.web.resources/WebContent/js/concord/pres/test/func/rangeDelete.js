dojo.provide("concord.pres.test.func.rangeDelete");

/**
 * summary:
 * cases:
 * 		1, select 3 paragraphs then delete/backspace
 * 		2, ctrlA in textbox/table then delete/backspace
 * 		3, select cell A1 and B1, hit enter. Then one cell got deleted and sorter not updated. defect 36376
 * check points:
 * 
 * ref defects:
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	var tblInEdit = null;
	var ckEditor = null;
	doh.register("test delete range over new text box", [
		{
			name: "testDelRangeOverNewTextbox1",
			timeout: 50000,
			runTest: function(){
				/**
				 * steps:
				 *  1, create a new table from menu and into edit mode;
				 *  2, mock range select with text "test"
				 *  3, mock delete event
				 *  4, undo/redo by shortcut key
				 *  5, select all objects and delete
				 */
				return _utils.asyncTest().doTest(function(deferred, doh){
					var tblContentBox = _actions.createTableFromMenuUT();
					doh.notNull(tblContentBox);
					tblInEdit = _actions.enterEditMode(tblContentBox);
					doh.notNull(tblInEdit);
					ckEditor = tblInEdit.editor;
					doh.notNull(ckEditor);
					 _utils.mockSelectWholeSpanWithText(ckEditor);
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					var checkDelete = function(){
						var actuallText = _utils.getTextFromFirstSpan(ckEditor);
						doh.is(1, actuallText.length);
						doh.is(_utils.PRES_8203, actuallText);
					};
					var ckDoc = tblInEdit.editor.document.$;
					doh.t(_actions.mockEventInEditMode(ckDoc, 'delete', checkDelete, null, deferred));
					tblInEdit.synchAllData();
					
//					if you want to test undo in view mode, then comment out below line code
//					tblInEdit.toggleEditMode(false);
				}).doTest(function(deferred, doh){
					var checkUndo = function(){
						var actuallText = _utils.getTextFromFirstSpan(ckEditor);
						doh.is(_utils.PRES_NORMAL_TEXT, actuallText);
					};
//					1: by command
//					_actions.undoByCommand();
//					checkUndo();
//					deferred.callback(true);
//					2: by event fire
					_actions.undoByCtrlZ(checkUndo, deferred);
				}).doTest(function(deferred, doh){
					var checkRedo = function(){
						var actuallText = _utils.getTextFromFirstSpan(ckEditor);
						doh.is(1, actuallText.length);
						doh.is(_utils.PRES_8203, actuallText);
					};
//					1: by command
//					_actions.redoByCommand();
//					checkRedo();
//					deferred.callback(true);
//					2: by event fire
					_actions.redoByCtrlY(checkRedo, deferred);
				}).doTest(function(deferred, doh){
					_actions.selectAllInSlideEditor();
					_actions.deleteAllInSlideEditor();
					deferred.callback(true);
				}).end();
			}
		},
		{
			name: "testDelRangeOverNewTextbox2",
			runTest: function(){
				//mock a different range for tblInEdit 
				//provide the run case
				
			}
		},
		{
			name: "",
			runTest: function(){
				 
			}
		}
			 
	], null);
	
	doh.run();
});