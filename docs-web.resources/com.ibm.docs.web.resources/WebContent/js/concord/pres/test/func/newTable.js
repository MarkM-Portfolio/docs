dojo.provide("concord.pres.test.func.newTable");

/**
 * summary:  table operations
 * cases:
 * 		1, new plain/style/custom table;
 * 		2, insert row/col;
 * 		3, delete row/col;
 * 		4, clear cell content;
 * check points:
 * 		1, correct content box type and table type;
 * 		2, new row follow correct style and correct row height;
 * 		3, table height;
 * 		4, table height;
 * ref defects:
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("test new delete over new table", [
		{
			name: "testTableFromMenu",
			timeout: 20000,
			runTest: function(){
				/**
				 * steps: 
				 * 1, new table from menu to slide 1
				 * 2, into edit mode
				 * 3, switch to slide 2
				 * 4, switch back to slide 1
				 * 5, undo, redo, undo
				 */
				var tblContentBox = null;
				var t_id = null;
				var ckEditor = null;
				var tblInEdit = null;
				
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
					//click slide #2 from sorter
					var ret = _actions.mockClickOnSorterEvent(2);
					doh.t(ret);
					
				};
				var step4 = function(){
					//click slide #1 from sorter
					ret = _actions.mockClickOnSorterEvent(1);
					doh.t(ret);
					doh.existInSorter(t_id);
					doh.existInSlideEditor(t_id);
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
				}).doTest(function(deferred, doh){
					_actions.undoByCommand();
					doh.notExistInSorter(t_id);
					doh.notExistInSlideEditor(t_id);
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					_actions.redoByCommand();
					doh.existInSorter(t_id);
					doh.existInSlideEditor(t_id);
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					_actions.undoByCommand();
					doh.notExistInSorter(t_id);
					doh.notExistInSlideEditor(t_id);
					deferred.callback(true);
				}).end();
			}
		},
		{
			name: "testNewStyleTable - all 20 tables",
			timeout: 20000,
			runTest: function(){
				/**
				 * steps:
				 * 1, create 20 tables from toolbar
				 * 2, select all of them
				 * 3, delete
				 */
				
				var tblList = _utils.TABLE_STYLES;
				var objNum = -1;
				
				var step = function(){
					var contentBoxList = pe.scene.slideEditor.CONTENT_BOX_ARRAY;
					objNum = contentBoxList.length;
					var newTblContentBox = null;
					for(var i = 0, len = tblList.length; i < len; i++){
						var type = tblList[i];
						_actions.createStyleTable(type);
						newTblContentBox = contentBoxList[contentBoxList.length - 1];
						doh.notNull(newTblContentBox);
						doh.is(PresConstants.CONTENTBOX_TABLE_TYPE, newTblContentBox.contentBoxType);
						doh.t(_actions.checkTableType(newTblContentBox, type));
						var t_id = dojo.attr(newTblContentBox.mainNode, "id");
						doh.existInSorter(t_id);
						newTblContentBox.deSelectThisBox();
						
					}
				};
				
				return _utils.asyncTest().doTest(function(deferred, doh){
					// switch to a new slide to run this case
					_actions.mockClickOnSorterEvent(3);
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					//create style table of each type
					step();
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					var contentBoxList = pe.scene.slideEditor.CONTENT_BOX_ARRAY;
					doh.is(tblList.length, (contentBoxList.length - objNum));
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					_actions.selectAllInSlideEditor();
					var contentBoxList = pe.scene.slideEditor.CONTENT_BOX_ARRAY;
					doh.is(21, contentBoxList.length);
					deferred.callback(true);
				}).doTest(function(deferred, doh){
					_actions.deleteAllInSlideEditor();
					var contentBoxList = pe.scene.slideEditor.CONTENT_BOX_ARRAY;
					doh.is(1, contentBoxList.length);
					deferred.callback(true);
				}).end();
			}
		},
		{
			name: "testNewCustomTable",
			runTest: function(){
				
			}
		},
		{
			name: "testInsertRowForImportedTable",
			runTest: function(){
				//prework: prepare an imported in a specific slide, similate click that slide
				
				
			}
		}
		
			 
	], null);
	
	doh.run();
});