dojo.provide("concord.pres.test.func.setStyleInTextBox");

/**
 * summary: set style in text box or inside one cell
 * cases:
 * check points:
 * ref defects:
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("test setting styles for text in new text box", [
		{
			name: "testSetStylesOverNewTextbox - basic test for callapsed range",
			timeout: 50000,
			runTest: function(){
				/**
				 * steps: 
				 * 1. create a text box from menu to slide 1
				 * 2. check whether synced to sorter
				 * 3. set styles for cursor ranged
				 * 4. verify cursor span styles
				 * 5. verify tool bar and menu status
				 */
				var textBox = null;
				var textBoxId = null;
				var ckEditor = null;
				var textBoxInEdit = null;
				var step1 = function(){
					textBoxInEdit = _actions.createTextBoxFromMenuUT();
				};
				
				var step2 = function(){
					doh.notNull(textBoxInEdit);
					ckEditor = textBoxInEdit.editor;
					doh.notNull(ckEditor);
					doh.is(PresConstants.CONTENTBOX_TEXT_TYPE, textBoxInEdit.contentBoxType);
					t_id = dojo.attr(textBoxInEdit.mainNode, "id");
					doh.existInSorter(t_id);
				};
				
				var step3 = function(){
					_utils.mockSpanEndCallapsedRange(ckEditor);
					doh.t(ckEditor.execCommand("bold"));
					doh.t(ckEditor.execCommand("italic"));
					doh.t(ckEditor.execCommand("underline"));
					doh.t(ckEditor.execCommand("strike"));
					doh.t(ckEditor.execCommand("increasefont"));
					doh.t(ckEditor.execCommand("superscript"));
				};
				
				var step4 = function() {
					doh.t(PresCKUtil.adjustToolBarForStyle("BOLD"));
					doh.t(PresCKUtil.adjustToolBarForStyle("ITALIC"));
					doh.t(PresCKUtil.adjustToolBarForStyle("UNDERLINE"));
					doh.t(PresCKUtil.adjustToolBarForStyle("LINETHROUGH"));
					doh.t(PresCKUtil.adjustToolBarForStyle("SUPERSCRIPT"));
					doh.t(PresCKUtil.adjustToolBarForStyle("FONTSIZE") == 12);
				};
				
				var step5 = function() {
					setTimeout(function () {
						var toolbarCmdItem = ['bold', 'italic', 'underline'];
						var editor = pe.lotusEditor;
						if (editor) {
							for (var i=0; i < toolbarCmdItem.length; i++) {
								var cmdItem = editor.getCommand(toolbarCmdItem[i]);
								doh.notNull(cmdItem);
								doh.t(cmdItem.state == CKEDITOR.TRISTATE_ON);
							}
						}
						var menuItems = ['P_i_Bold', 'P_i_Italic', 'P_i_Underline', 'P_i_Strikethrough', 'P_i_Superscript'];
						dojo.forEach(menuItems, function(menuItem) {
							var dijitMenuItem = dijit.byId(menuItem);
							doh.notNull(dijitMenuItem);
							doh.t(dijitMenuItem.attr("checked"));
						});
					}, 1000);
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
					step5();
					deferred.callback(true);
				}).end();
				
			}
		},
		{
			name: "",
			runTest: function(){
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