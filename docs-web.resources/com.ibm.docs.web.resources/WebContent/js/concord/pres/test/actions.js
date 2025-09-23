dojo.provide("concord.pres.test.actions");

(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions = {};
	
	_actions.deleteRangeTest = function(mockRange, contentBox){
		var ckEditor = contentBox.editor;
		PresListUtil.HandleDelete(mockRange, false, ckEditor);
		contentBox.synchAllData();
	};
	
	_actions.createTextBoxFromMenuUT = function(){
		window.pe.scene.lockPark = true;
		var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_createDefaultTextBox}];
		concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);
		var txtContentBox = pe.scene.getContentBoxCurrentlyInEditMode();
		return txtContentBox;
 	};
 	
 	_actions.createTextBoxFromToolbarUT = function(){
 		var ckEditor = pe.scene.slideSorter;
 		ckEditor.execCommand("AddTextBox");
		var txtContentBox = pe.scene.getContentBoxCurrentlyInEditMode();
		return txtContentBox;
 	};
 	
 	_actions.createTableFromMenuUT = function(){
 		var slideEditor = pe.scene.slideEditor;
 		var tblCB = PresTableUtil.createTableFromMenu(slideEditor, true);
 		return tblCB;
 	};
 	
 	_actions.createStyleTable = function(type){
 		var slideEditor = pe.scene.slideEditor;
 		var removeAllInlineCustomStyles = PresTableUtil.removeAllInlineCustomStyles, 
 			applyNonEditModeStyle = PresTableUtil.applyNonEditModeStyle;
 		PresTableUtil.createTableAndWidgtize(type, removeAllInlineCustomStyles, applyNonEditModeStyle);
 	};
 	
 	_actions.createCustomTable = function(type){
 		var slideEditor = pe.scene.slideEditor;
 		var applyNonEditModeCustomStyling = PresTableUtil.applyNonEditModeCustomStyling;
 		PresTableUtil.createTableAndWidgtize(type, applyNonEditModeCustomStyling);
 	};
 	
 	_actions.enterEditMode = function(contentBox){
 		contentBox.handleContentOnDblClick_isEitable();
		var tblInEdit = pe.scene.getContentBoxCurrentlyInEditMode();
 		return tblInEdit;
 	};
 	
 	//select all the objects from slide editor
 	_actions.selectAllInSlideEditor = function(){
// 		var slideEditor = pe.scene.slideEditor;
//		slideEditor.selectAll();
		if (window.pe.scene.getFocusComponent(true) == concord.util.events.SLIDE_EDITOR_COMPONENT) {
			var eventData = [ {
	            eventName: concord.util.events.keypressHandlerEvents_eventName_keypressEvent,
	            eventAction: concord.util.events.keypressHandlerEvents_eventAction_CTRL_A
	        } ];
	        concord.util.events.publish(concord.util.events.keypressHandlerEvents, eventData);
	    } 
 	};
 	
 	_actions.deleteAllInSlideEditor = function(){
 		var slideEditor = pe.scene.slideEditor;
		slideEditor.deleteSelectedContentBoxes();
 	};
 	
 	_actions.setFontFamilyInEdit = function(contentBoxInEdit, fontName){
 		var ckEditor = contentBoxInEdit.editor;
 		var style = PresConstants.FONT_STYLES[value];
		style.apply(ckEditor);	
 	};
 	
	// mock click one slide from sorter 
	_actions.mockClickOnSorterEvent = function(slideNum){
		var fireOnSlideNode = _utils.getSlideNodeByNum(slideNum); //get draw page node
		if(!fireOnSlideNode)
			return false;
		
		var sorter = pe.scene.slideSorter;
		sorter.simulateSlideClick(fireOnSlideNode);
		return true;
	};
	
	_actions.mockCtrlAInEditMode = function(contentBoxInEdit){
		var doc = contentBoxInEdit.editor.document.$;
		PresCKUtil.simulateCtrlA(doc);
	};
	
	_actions.mockEnterFromSorter = function(){
		var sorterDoc = pe.scene.slideSorter.editor.document.$;
		var mockEnterEvent = _actions._mockKeyEvent(sorterDoc, "enter", {keyCode: 13});
		pe.scene.keyHandler.handleKeypress(mockEnterEvent);
	};
	
	/**
	 * usage: _actions.mockEventInEditMode(contentBoxInEdit, "enter", callback)
	 * @param contentBoxInEdit
	 * @param actionName
	 * @param callback
	 */
	_actions.mockEventInEditMode = function(ckDoc, actionName, callback, param, deferred){
		var delData = {};
		var actionName = actionName.toLowerCase();
		
		switch(actionName){
			case 'delete':
				delData.keyCode = 46;
				break;
			case 'backspace':
				delData.keyCode = 8;
				break;
			case 'editorenter':
				delData.keyCode = 13;
				break;
			case 'ctrlz':
				delData.keyCode = 90;
				delData.ctrlKey = true;
				delData.srcElement = param.srcElement;
				delData.target = param.target;
				break;
			case 'ctrly':
				delData.keyCode = 89;
				delData.ctrlKey = true;
				delData.srcElement = param.srcElement;
				delData.target = param.target;
				break;
			default:
				return false;
		};
		
		_actions._mockKeyEvent(ckDoc, "keydown", delData);
		
		setTimeout(function(){
			_actions._mockKeyEvent(ckDoc, "keyup", delData);
			callback && callback();
			deferred && deferred.callback(true);
		}, 500);
		
		return true;
	};
	
	_actions._mockKeyEvent = function(ckDoc, eventName, customP){
		var keyEvent = null;
		var altKey = false,
			bubbles = true,
			cancelBubble = false,
			cancelable = true,
			view = window,
			charCode = 0,
			ctrlKey = customP.ctrlKey || false,
			currentTarget = ckDoc,
			detail = 0,
			eventPhase = 3,
			keyCode = customP.keyCode || '65',
			metaKey = customP.metaKey || false,
			shiftKey = customP.shiftKey || false,
			srcElement = customP.srcElement || null,
			target = customP.target || null,
			type = customP.type || 'keydown',
			nativeFire = (window.document == ckDoc) ? true : false;
			
		if(dojo.isIE){
			keyEvent = ckDoc.createEventObject(); 
			keyEvent.altKey = altKey;
			keyEvent.bubbles = bubbles;
			keyEvent.cancelBubble = cancelBubble;
			keyEvent.view = window;
			keyEvent.ctrlKey = ctrlKey;
			keyEvent.currentTarget = ckDoc;
			keyEvent.detail = detail;
			keyEvent.eventPhase = eventPhase;
			keyEvent.keyCode = keyCode;
			keyEvent.metaKey = metaKey;
			keyEvent.shiftKey = shiftKey;
			keyEvent.srcElement = srcElement;
			keyEvent.target = target;
			nativeFire && target.fireEvent('on' + eventName, keyEvent);
			
		}else if(dojo.isFF){
			keyEvent = ckDoc.createEvent("KeyboardEvent");
			keyEvent.initKeyEvent(eventName, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
			nativeFire && ckDoc.body.dispatchEvent(keyEvent);
		}else{
			keyEvent = ckDoc.createEvent("Events");
			keyEvent.initEvent(eventName, bubbles, cancelable);
			keyEvent.view = view;
			keyEvent.ctrlKey = ctrlKey;
			keyEvent.altKey = altKey;
			keyEvent.shiftKey = shiftKey;
			keyEvent.metaKey = metaKey;
			keyEvent.keyCode = keyCode;
			keyEvent.charCode = charCode;
			nativeFire && ckDoc.body.dispatchEvent(keyEvent);
		}
		
		if(!nativeFire){
			ckDoc = new CKEDITOR.dom.domObject(ckDoc);
			if(typeof CKEDITOR != 'undefined')
				ckDoc.fire(eventName, new CKEDITOR.dom.event(keyEvent));
		}
	};
	
	_actions.checkTableType = function(contentBox, type){
		type = type.split(" ");
		var cbDN = contentBox.contentBoxDataNode;
		for(var i = 0, len = type.length; i < len; i++){
			if(!dojo.hasClass(cbDN, type[i]))
				return false;
		}
		return true;
	};
	
	_actions.undoByCommand = function(){
		var ckEditor = pe.scene.getEditor();
		ckEditor.execCommand("undo");
	};
	
	_actions.undoByCtrlZ = function(callback, deferred){
		var ckEditor = pe.scene.getEditor();
		var ckDoc = ckEditor.document.$;
		var targetNode = dojo.byId("slideEditorContainer");
		_actions.mockEventInEditMode(ckDoc, 'ctrlz', callback, {srcElement: ckDoc.body, target: ckDoc.body}, deferred);
	};
	
	_actions.redoByCommand = function(editor){
		var ckEditor = pe.scene.getEditor();
		ckEditor.execCommand("redo");
	};
	
	_actions.redoByCtrlY = function(callback, deferred){
		var ckEditor = pe.scene.getEditor();
		var ckDoc = ckEditor.document.$;
		var targetNode = dojo.byId("slideEditorContainer");
		_actions.mockEventInEditMode(ckDoc, 'ctrly', callback, {srcElement: ckDoc.body, target: ckDoc.body}, deferred);
	};
	
 	//add more....
 	
})();