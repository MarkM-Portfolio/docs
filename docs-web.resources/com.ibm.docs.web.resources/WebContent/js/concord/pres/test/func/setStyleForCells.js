dojo.provide("concord.pres.test.func.setStyleForCells");

/**
 * summary: set style to cross cell selection
 * cases:
 * 		1.set style in one cell
 * 		2.set style in one row.
 * 		3.set style cross row.
 * check points:
 * 		1.style be set correctly.
 * 		2.structure of content is correctly. 
 * ref defects:
 */

window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("test set styles over new table", [
		{
			name: "testSetStylesOverNewTable - inside one cell",
			timeout: 5000,
			runTest: function(){
				/**
				 * steps: 
				 * 1, new table from menu to slide 1
				 * 2, into edit mode
				 * 3, set style Bold,Italic,Underline
				 * 4, verify
				 */
				var tblContentBox = null;
				var t_id = null;
				var ckEditor = null;
				var tblInEdit = null;
				var selection = null;
				var currCell = null;
				var step1 = function(){
					tblContentBox = _actions.createTableFromMenuUT();
					doh.notNull(tblContentBox);
				};
				
				var step2 = function(){
					tblInEdit = _actions.enterEditMode(tblContentBox);
					doh.notNull(tblInEdit);
					ckEditor = tblInEdit.editor;
					doh.notNull(ckEditor);
					doh.is(PresConstants.CONTENTBOX_TABLE_TYPE, tblContentBox.contentBoxType);
					t_id = dojo.attr(tblInEdit.mainNode, "id");
					doh.existInSorter(t_id);
				};
				var step3 = function(){
					var ckRange = _utils.mockSelectWholeSpanWithText(ckEditor);
					doh.t(ckEditor.execCommand("bold"));
					doh.t(ckEditor.execCommand("italic"));
					doh.t(ckEditor.execCommand("underline"));
				};
				
				var step4 = function(){
					doh.t(PresCKUtil.adjustToolBarForStyle("BOLD"));
					doh.t(PresCKUtil.adjustToolBarForStyle("ITALIC"));
					doh.t(PresCKUtil.adjustToolBarForStyle("UNDERLINE"));
				};
				
				return _utils.asyncTest().doTest(function(deferred, doh){
					step1();
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					step2();
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					step3();
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					step4();
					deferred.callback(true);
				}).end();
				
			}
		},
		{
			name: "testSetStylesOverNewTable - range inside one cell",
			runTest: function(){
				 
			}
		},
		{
			name: "testSetStylesOverNewTable - range cross cells",
			runTest: function(){
				 
			}
		}
			 
			 
	], null);
	
	doh.run();
});