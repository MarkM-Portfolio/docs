dojo.provide("concord.pres.test.func.indentTest");

/**
 * summary: set indent/outdent in text box/table
 * cases:
 * 		1, Can't indent/outdent in title place holder;
 * 		2, Only can indent/outdent 8 times in other objects; 
 * 		3, In place holder, each indent/outdent would make font size smaller; 
 * 		4, In text box, check toolbar status before and after indent, font size no change, left margin changed, text indent no change;
 * 		5, In outline place holder
 * 		6, sample with master style
 * check points:
 * 		1, 
 * 		2,
 * ref defects:
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("test indent/outdent", [
		{
			name: "TestIndentInTextBox",
			timeout: 10000,
			runTest: function(){
				/**
				 * steps: 
				 * 1, new a text box from menu
				 * 2, check the textbox is text type
				 * 3, mock select whole span with text, check indent level, margin left, text indent and toolbar status
				 * 4, indent and check
				 * 5, outdent and check
				 * 6, indent 8 times and check
				 */
				var textBoxInEdit = null;
				var ckEditor = null;
				var dijitMenuItem = null;
				var cmdItem = null;
				var selectedLines = null;
				var selectedLine = null;
				var marginLeftOfLevel1 = null;
				var marginLeftOfLevel2 = null;
				var textIndentOfLevel1 = null;
				var textIndentOfLevel2 = null;
				var fontSizeOfLevel1 = null;
				var fontSizeOfLevel2 = null;
				
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
					_utils.mockSelectWholeSpanWithText(ckEditor);
					
					cmdItem = ckEditor.getCommand("indent");
					doh.is(CKEDITOR.TRISTATE_OFF, cmdItem.state);
					cmdItem = ckEditor.getCommand("outdent");
					doh.is(CKEDITOR.TRISTATE_DISABLED, cmdItem.state);
					
					dijitMenuItem = dijit.byId("P_i_Indent");
					doh.is(false, dijitMenuItem.attr("disabled"));
					dijitMenuItem = dijit.byId("P_i_DecreaseIndent");
					doh.is(true, dijitMenuItem.attr("disabled"));
					
					selectedLines = PresCKUtil.getLinesSelected().selectLines;
					selectedLine = selectedLines[0];
					doh.is(1, dojo.attr(selectedLine.$, "level"));
					marginLeftOfLevel1 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.MARGINLEFT);
					if(!marginLeftOfLevel1 || marginLeftOfLevel1 == "null") marginLeftOfLevel1 = 0;
					textIndentOfLevel1 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.TEXTINDENT);
					if(!textIndentOfLevel1 || textIndentOfLevel1 == "null") textIndentOfLevel1 = 0;
					fontSizeOfLevel1 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.FONTSIZE);
				};
				
				var step4 = function(){
					doh.t(ckEditor.execCommand("indent"));
					
					cmdItem = ckEditor.getCommand("indent");
					doh.is(CKEDITOR.TRISTATE_OFF, cmdItem.state);
					cmdItem = ckEditor.getCommand("outdent");
					doh.is(CKEDITOR.TRISTATE_OFF, cmdItem.state);
					
					dijitMenuItem = dijit.byId("P_i_Indent");
					doh.is(false, dijitMenuItem.attr("disabled"));
					dijitMenuItem = dijit.byId("P_i_DecreaseIndent");
					doh.is(false, dijitMenuItem.attr("disabled"));
					
					
					doh.is(2, dojo.attr(selectedLine.$, "level"));
					marginLeftOfLevel2 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.MARGINLEFT);
					doh.is(parseInt(marginLeftOfLevel1) + CKEDITOR.config.indentOffset, parseInt(marginLeftOfLevel2));
					textIndentOfLevel2 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.TEXTINDENT);
					if(!textIndentOfLevel2 || textIndentOfLevel2 == "null") textIndentOfLevel2 = 0;
					doh.is(parseInt(textIndentOfLevel1), parseInt(textIndentOfLevel2));
					fontSizeOfLevel2 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.FONTSIZE);
					doh.is(fontSizeOfLevel1, fontSizeOfLevel2);			
					
				};
				
				var step5 = function(){
					doh.t(ckEditor.execCommand("outdent"));
					
					cmdItem = ckEditor.getCommand("indent");
					doh.is(CKEDITOR.TRISTATE_OFF, cmdItem.state);
					cmdItem = ckEditor.getCommand("outdent");
					doh.is(CKEDITOR.TRISTATE_DISABLED, cmdItem.state);
					
					dijitMenuItem = dijit.byId("P_i_Indent");
					doh.is(false, dijitMenuItem.attr("disabled"));
					dijitMenuItem = dijit.byId("P_i_DecreaseIndent");
					doh.is(true, dijitMenuItem.attr("disabled"));
					
					
					doh.is(1, dojo.attr(selectedLine.$, "level"));
					marginLeftOfLevel1 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.MARGINLEFT);
					doh.is(parseInt(marginLeftOfLevel2), parseInt(marginLeftOfLevel1) + CKEDITOR.config.indentOffset);
					textIndentOfLevel1 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.TEXTINDENT);
					if(!textIndentOfLevel1 || textIndentOfLevel1 == "null") textIndentOfLevel1 = 0;
					doh.is(textIndentOfLevel2, parseInt(textIndentOfLevel1));
					fontSizeOfLevel1 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.FONTSIZE);
					doh.is(fontSizeOfLevel2, fontSizeOfLevel1);
				};
				
				var step6 = function(){
					for(var i = 0;i<8;i++){
						doh.t(ckEditor.execCommand("indent"));						
					}
					doh.is(9, dojo.attr(selectedLine.$, "level"));
					var marginLeftOfLevel9 = PresCKUtil.getAbsoluteValue(selectedLine,PresConstants.ABS_STYLES.MARGINLEFT);
					doh.is(parseInt(marginLeftOfLevel1) + 8*CKEDITOR.config.indentOffset, parseInt(marginLeftOfLevel9));
					
					cmdItem = ckEditor.getCommand("indent");
					doh.is(CKEDITOR.TRISTATE_DISABLED, cmdItem.state);
					cmdItem = ckEditor.getCommand("outdent");
					doh.is(cmdItem.state, cmdItem.state);
					
					dijitMenuItem = dijit.byId("P_i_Indent");
					doh.is(true, dijitMenuItem.attr("disabled"));
					dijitMenuItem = dijit.byId("P_i_DecreaseIndent");
					doh.is(false, dijitMenuItem.attr("disabled"));
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
				}).doTest(function(deferred, doh){
					step6();
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