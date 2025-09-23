dojo.provide("concord.util.presToolbarMgr");

concord.util.presToolbarMgr.handleSubscriptionForSetFocusEvent = function(data){
	concord.util.presToolbarMgr.setToolbarFocus();
	concord.util.presToolbarMgr.isKBFocus = false;
};

concord.util.presToolbarMgr.handleSubscriptionForLostFocusEvent = function(data){
	concord.util.presToolbarMgr.isKBFocus = false;
};

concord.util.presToolbarMgr.setKBFocus = function(flag) {
	concord.util.presToolbarMgr.isKBFocus = flag;
};

// returns true if the toolbar has "exclusive" access to keyboard input. This can happen
// when the editor technically still has focus but the user is on the toolbar to enter
// a command. In that case, the editor can check this flag to see if the KB event can be
// ignored.
concord.util.presToolbarMgr.hasKBFocus = function() {
	return concord.util.presToolbarMgr.isKBFocus;
};

concord.util.presToolbarMgr.findActiveTbEditor = function(){
	//return CKEDITOR.instances['editor1'];
	var tbDiv = dojo.byId('toolbar');
	var toolbars = dojo.query('.cke_shared',tbDiv);
	
	var activeToolbar = null;
	for(var i=0; i<toolbars.length; i++){
		if(dojo.style(toolbars[i],'display') != 'none'){
			activeToolbar = toolbars[i];
			break;
		}
	}
	
	var editorName = null;
	if(activeToolbar){
		var childSpan = activeToolbar.firstChild;
		var childClasses = dojo.attr(childSpan,'class');
		var classes = childClasses.split(' ');
		
		for(var i=0; i<classes.length; i++){
			if(classes[i].indexOf('cke_editor_') == 0){
				editorName = classes[i].substr(11);
			}
		}
	}

	if(editorName){
		return CKEDITOR.instances[editorName];
	} else {
		concord.util.presToolbarMgr.setFocusSorterTb();
		return window.pe.scene.slideSorter.getEditor();	
	}
};

concord.util.presToolbarMgr.setToolbarFocus = function() {
	var editor = concord.util.presToolbarMgr.findActiveTbEditor();
	if (editor)
		editor.toolbox.focus();

    dojo.publish(concord.util.events.presToolbarEvents_Focus, null);
};

//
// Ensures that sorter CK toolbar is in focus unless a specific editor name  (editor.name) is passed in
//
concord.util.presToolbarMgr.setFocusSorterTb = function(editorName){	
	if (editorName == undefined && window.pe.scene.slideSorter.getEditor() == null) {
		return;
	}
	var tbDiv = dojo.byId('toolbar');
	var toolbars = dojo.query('.cke_shared',tbDiv);
	var ckInstanceName = (editorName) ? editorName: window.pe.scene.slideSorter.getEditor().name;
	//if editor name is valid then make it's toolbar seen
	if (CKEDITOR.instances[ckInstanceName]) {
		for(var i=0; i<toolbars.length; i++){
			var firstChild = toolbars[i].firstChild;
			if (dojo.hasClass(firstChild,'cke_editor_'+ckInstanceName)){
				toolbars[i].style.display = 'block';  
			} else{
				toolbars[i].style.display = 'none';  
			}	
			firstChild = null;
		}		
	}
};

concord.util.presToolbarMgr.getCmdListEditOnOff = function(){
	var cmdList = [ 'bold', 'italic', 'underline', 'strike', 'presAlignLeft',
			'presAlignCenter', 'presAlignRight', 'numberedlist',
			'bulletedlist', 'indent', 'outdent','increasefont',
			'decreasefont','removeFormat'];
			
	if(BidiUtils.isBidiOn()){
		cmdList = cmdList.concat(['presLeftToRight','presRightToLeft']);
	}
	return cmdList;
};

concord.util.presToolbarMgr.getPanelButtonListEditOnOff = function(){
	var btnList = ['cke_button_textcolor', 'cke_button_bgcolor'];

	return btnList;
};

concord.util.presToolbarMgr.getComboListEditOnOff = function(){
	var comboList = ['cke_font','cke_fontSize'];
	return comboList;
};

concord.util.presToolbarMgr.togglePrevNextSlideButton = function(){
	window.pe.scene.slideSorter.togglePrevNextSlideButtons();
};

/**
 *  D14758 This function maintains consistency across the  toolbar command states. It provides the 
 *  same function as cms.setState() without firing a state event. This function should only be called
 *  from the setStateFromBtnPlugin 
 */
concord.util.presToolbarMgr._setCommandState = function(cmd,newState){	
	// Do nothing if there is no state change.
	if ( cmd.state == newState )
		return false;
	cmd.previousState = cmd.state;
	// Set the new state.
	cmd.state = newState;
	if(cmd.name && concord.util.browser.isMobile())
	{
		var events = [{"name":"state", "params":[cmd.name, newState]}];
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	}
	return true;	
};

concord.util.presToolbarMgr.getStateFromBtnPlugin = function(buttonClassName){
	if (window.pe.scene.slideEditor.createPackageOnClick 
			&& window.pe.scene.slideEditor.createPackageOnClick.createNewContentBox==true 
			&& window.pe.scene.slideEditor.SINGLE_CK_MODE==false ){
		return CKEDITOR.TRISTATE_DISABLED;
	}
	var editorList = CKEDITOR.instances;

	for( var i in editorList){
		var editor = editorList[i];
		var toolbars  = (editor.toolbox && editor.toolbox.toolbars)? editor.toolbox.toolbars : [];
		for (i=0; i<toolbars.length; i++){
			var toolbar = toolbars[i];
			for (var j=0; j<toolbar.items.length; j++){
				var item = toolbar.items[j];				
				if(item.button){
					if (item.button.className == buttonClassName){
						return item.button._.state;
					}
				}else if (item.combo){
					if (item.combo.className == buttonClassName){
						return item.combo._.state;
					}
				}				
			}
		}				
	}
};

concord.util.presToolbarMgr.setStateFromBtnPlugin = function(state,btn){
	if (window.pe.scene.slideEditor.createPackageOnClick && window.pe.scene.slideEditor.createPackageOnClick.createNewContentBox==true && window.pe.scene.slideEditor.SINGLE_CK_MODE==false ){
		return;
	}
	var editorList = CKEDITOR.instances;
	var fromTbManager = true;
	for( var i in editorList){
		var editor = editorList[i];
		var toolbars  = (editor.toolbox && editor.toolbox.toolbars)? editor.toolbox.toolbars : [];
		for (i=0; i<toolbars.length; i++){
			var toolbar = toolbars[i];
			for (var j=0; j<toolbar.items.length; j++){
				var item = toolbar.items[j];				
				if(item.button){
					if (item.button.className == btn.className){
						item.button.setState(state,fromTbManager);
						//D14758 now that UI is set let's ensure that cmd obj has correct state
						if (btn.command){
							var cmd = editor.getCommand(btn.command);	
							concord.util.presToolbarMgr._setCommandState(cmd,state);
						}
					}
				}else if (item.combo){
					if (item.combo.className == btn.className){
						item.combo.setState(state,fromTbManager);
					}
				}				
			}
		}				
	}
};

concord.util.presToolbarMgr.toggleFontEditButtons = function(state){
	var editor = concord.util.presToolbarMgr.findActiveTbEditor();
	var cmdList = concord.util.presToolbarMgr.getCmdListEditOnOff();
	var buttonComboList = concord.util.presToolbarMgr.getPanelButtonListEditOnOff();
	var comboList = concord.util.presToolbarMgr.getComboListEditOnOff();
	var newState = (state != 'on') ? CKEDITOR.TRISTATE_DISABLED : CKEDITOR.TRISTATE_OFF;
	var i, j, x;
	for (i=0; i<cmdList.length; i++){
		var cmd = editor.getCommand(cmdList[i]);
		cmd.setState(newState);
	}
	
	var toolbars = editor.toolbox.toolbars;
	for (i=0; i<toolbars.length; i++){
		var toolbar = toolbars[i];
		for (j=0; j<toolbar.items.length; j++){
			var item = toolbar.items[j];
			
			if(item.button){
				for(x = 0; x < buttonComboList.length; x++ ){
					if (item.button.className == buttonComboList[x]){
						item.button.setState(newState);
					}
				}
			}else if (item.combo){
				for(x = 0; x < comboList.length; x++ ){
					if (item.combo.className == comboList[x]){
						item.combo.setState(newState);
					}
				}
			}
		}
	}
};

concord.util.presToolbarMgr.toggleCommenttButton = function(state){
	// When clicking existed comments, this function will be called
	// No need to update comment tool button status in view draft mode
	// It should always be disabled
	if (window.pe.scene.isViewDraftMode())
		return;

	var editor = concord.util.presToolbarMgr.findActiveTbEditor();
	var cmd = editor.getCommand('presComments');
	
	if(state != 'on'){
		cmd.setState(CKEDITOR.TRISTATE_DISABLED);
	}else{
		cmd.setState(CKEDITOR.TRISTATE_OFF);
	}
};
concord.util.presToolbarMgr.toggleNewObjButton = function(state){
	var cmdList = [ 'AddTextBox', 'presImages', 'NewSlide'];
	concord.util.presToolbarMgr.setButtonsState(state, cmdList);
};
concord.util.presToolbarMgr.toggleLayoutTemplateButton = function(state){
	var cmdList = [ 'SlideLayout', 'SlideTemplate'];
	concord.util.presToolbarMgr.setButtonsState(state, cmdList);
};
concord.util.presToolbarMgr.toggleSaveButton = function(state){
	var cmdList = ['concordPresSave'];
	concord.util.presToolbarMgr.setButtonsState(state, cmdList);
};
concord.util.presToolbarMgr.toggleUndoRedoButton = function(state){
	var cmdList = ['undo', 'redo'];
	concord.util.presToolbarMgr.setButtonsState(state, cmdList);
};

concord.util.presToolbarMgr.toggleSlideShowButton = function(state){
	var cmdList = ['SlideShow'];	
	concord.util.presToolbarMgr.setButtonsState(state, cmdList);
};

concord.util.presToolbarMgr.setButtonsState = function(state, cmdList){
	var editor = concord.util.presToolbarMgr.findActiveTbEditor();
	var newState = (state != 'on') ? CKEDITOR.TRISTATE_DISABLED : CKEDITOR.TRISTATE_OFF;
	
	for (var i=0; i<cmdList.length; i++){
	    editor.getCommand(cmdList[i]).setState( newState );
	}
};

concord.util.presToolbarMgr.toggleBGFillColorButton = function(state){
	concord.util.presToolbarMgr.toggleToolbarButtonState( 'cke_button_concordbgfill', state);
};

concord.util.presToolbarMgr.toggleBorderColorButton = function(state){
	concord.util.presToolbarMgr.toggleToolbarButtonState( 'cke_button_concordbordercolor', state);
};

concord.util.presToolbarMgr.toggleRemoveFormatButton = function(state){
	concord.util.presToolbarMgr.toggleToolbarButtonState( 'cke_button_removeFormat', state);
};
concord.util.presToolbarMgr.toggleTextColorButton = function(state){
	concord.util.presToolbarMgr.toggleToolbarButtonState( 'cke_button_textcolor', state);
};

concord.util.presToolbarMgr.togglePrevSlideButton = function(state){
	concord.util.presToolbarMgr.toggleToolbarButtonState( BidiUtils.isGuiRtl() ? 'cke_button_nextslide' : 'cke_button_prevslide', state);
};

concord.util.presToolbarMgr.toggleNextSlideButton = function(state){	
	concord.util.presToolbarMgr.toggleToolbarButtonState(BidiUtils.isGuiRtl() ? 'cke_button_prevslide' : 'cke_button_nextslide', state);
};

concord.util.presToolbarMgr.toggleVerticalAlignButton = function(state){
	concord.util.presToolbarMgr.toggleToolbarButtonState( 'cke_button_verticalalign', state);
};

concord.util.presToolbarMgr.toggleInsertMoveRowButton = function(state){
	concord.util.presToolbarMgr.toggleToolbarButtonState( 'cke_button_moverowdown', state);
};

concord.util.presToolbarMgr.toggleInsertMoveColButton = function(state){
	concord.util.presToolbarMgr.toggleToolbarButtonState( 'cke_button_addcolumnbefore', state);
};

concord.util.presToolbarMgr.toggleToolbarButtonState = function(buttonClassName, state){
	var editor = concord.util.presToolbarMgr.findActiveTbEditor();
	var toolbars = editor.toolbox.toolbars;
	var newState = (state != 'on') ? CKEDITOR.TRISTATE_DISABLED : CKEDITOR.TRISTATE_OFF;
    for (var i=0; i<toolbars.length; i++){
		var toolbar = toolbars[i];
		for (var j=0; j<toolbar.items.length; j++){
			var item = toolbar.items[j];
			
			if(item.button){
				if (item.button.className == buttonClassName){
						item.button.setState(newState);
				}
			}
		}
	}
};

concord.util.presToolbarMgr.toggleAllEditModeButton = function(state){
	concord.util.presToolbarMgr.toggleSaveButton(state);
	concord.util.presToolbarMgr.toggleUndoRedoButton(state);
	concord.util.presToolbarMgr.toggleFontEditButtons(state);
	concord.util.presToolbarMgr.toggleNewObjButton(state);
	concord.util.presToolbarMgr.toggleLayoutTemplateButton(state);
};

/**
 * This is meant to be called whenever the selection changes within a particular
 * editor. The editor, and whether the editor is in edit mode, are passed in as
 * parameters.
 * 
 * Notes:
 * - This is being added because the alignment buttons aren't otherwise hooked into
 *   the other font editing toolbar buttons for the editor.
 * - The only known place this function is called is within the contentBox.js code
 *   in which the box is becoming editable. It hooks into the selectionChange
 *   event within the box.
 */
concord.util.presToolbarMgr.toggleAlignmentButtons = function( editor, editMode ) {
  if ( !editor )
    return;
  
  // make sure alignment buttons are enabled if in edit mode
  // (presToolbarMgr code isn't called automatically to toggle them on)
  var newState =  editMode ? CKEDITOR.STATE_OFF : CKEDITOR.STATE_DISABLED;
  editor.getCommand( 'presAlignLeft' ).setState( newState );
  editor.getCommand( 'presAlignCenter' ).setState( newState );
  editor.getCommand( 'presAlignRight' ).setState( newState );
};
