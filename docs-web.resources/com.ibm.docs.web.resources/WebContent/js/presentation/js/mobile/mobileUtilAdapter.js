/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("pres.mobile.mobileUtilAdapter");
dojo.require("concord.util.mobileUtil");

// Override the old mobile util functions.
concord.util.mobileUtil.disablePresEditing = true;
concord.util.mobileUtil.snapPreStart = function(){
	var events = [];
	events.push({"name":"snapPreStart","params":[]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.totalSlide = function(num){
	if(num <= 0)
		return;
	var events = [];
	events.push({"name":"totalSlide","params":[num]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};
concord.util.mobileUtil.delSlide = function(idx){
	return;
	if(idx >= 0){
		var events = [];
		events.push({"name":"delSlide","params":[idx]});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);	
	}
};
concord.util.mobileUtil.insSlide = function(idx){
	return;
	if(idx >= 0){
		var events = [];
		events.push({"name":"insSlide","params":[idx]});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);	
	}
};
concord.util.mobileUtil.changeSlide = function(id, nativeClick){
	if(id == undefined || id == null)return;
	var events = [];
	var info = concord.util.mobileUtil.presObject.getSlideInfo();
	info['nativeClick'] = nativeClick?1:0;
	events.push({"name":"presSlideChange","params":[id,info]});
	concord.util.mobileUtil.jsObjCBridge.postEvents(events);
};

concord.util.mobileUtil.clickCurrentSlide = function(thumb)
{
	return;
	var sorter = thumb.getParent();
	var rect = thumb.domNode.getBoundingClientRect();
	var param = {
		"x": rect.left + rect.width - 26,
		"y": rect.top + rect.height * 0.5
	};
	// TODO, BOB
	// if (!window.pe.scene.checkClipboardFromOtherDoc())
	// param["hasPaste"] = 1;

	var totalLength = pe.scene.doc.slides.length;
	var slideNumber = dojo.indexOf(pe.scene.doc.slides, sorter.getCurrentThumb().slide) + 1;
	var selectAll = sorter.selectedThumbs.length === totalLength;
	if (!selectAll && sorter.selectedThumbs.length === 1 && !sorter.isSelectionLocked())
	{
		if (slideNumber != 1)
			param["hasMoveUp"] = 1;
		if (slideNumber != totalLength)
			param["hasMoveDown"] = 1;
	}
	concord.util.mobileUtil.jsObjCBridge.postEvents([{
		"name": "presSlideMenu",
		"params": [param]
	}]);
};

concord.util.mobileUtil.contextMenuShow = function(isShow)
{
	return;
	if (isShow)
	{
		pe.scene.isContextMenuShow = true;
		// TODO, BOB
		// concord.util.browser.hideImageIndicator(window.document);
	}
};

concord.util.mobileUtil.presObject = {
	contextMenu: function(contentBox, menuItems)
	{
		return;
		console.warn("------- context menu ----------");
		if (pe.scene.slideShowInProgress())
			return;
		if (!contentBox || !contentBox.mainNode)
			return;
		var events = [];
		var param = {};
		if (menuItems && menuItems.length)
		{
			param["items"] = menuItems;
			var slideEditor = window.pe.scene.slideEditor;
			var editorTop = slideEditor.mainNode.offsetTop;
			var editorLeft = slideEditor.mainNode.offsetLeft;
			var delta = 3;
			param["t"] = contentBox.mainNode.offsetTop + editorTop - delta;
			param["l"] = contentBox.mainNode.offsetLeft + editorLeft;
			param["w"] = contentBox.mainNode.offsetWidth;
			param["h"] = contentBox.mainNode.offsetHeight + 2 * delta;
			contentBox.isMenuShow = true;
		}
		else
			contentBox.isMenuShow = false;
		events.push({
			"name": "objectContextMenu",
			"params": [param]
		});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	},

	deleteCurrentObject: function()
	{
		return;
		pe.scene.slideEditor.deleteBox();
	},

	getSlideInfo: function()
	{
		return window.pe.scene.slideEditor.getSlideInfo();
	},

	selectObject: function(id)
	{
		var box = dijit.byId(id);
		if (box)
		{
			if (!pe.scene.locker.isLockedByOther(id))
			{
				box.domNode.style.webkitTapHighlightColor = "rgba(0, 0, 0, 0)";
				box.enterEdit();
			}
		}
	},

	moveObjectStart: function(id)
	{
		var box = dijit.byId(id);
		if (box && box.domNode)
		{
			box.domNode.style.display = "none";
			/*
			 * TODO BOB if (contentObj.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE && contentObj.boxRep && contentObj.boxRep.mainNode) contentObj.boxRep.mainNode.style.display = "none";
			 */
		}
	},

	moveObjectEnd: function(id, offsetX, offsetY)
	{
		var contentObj = dijit.byId(id);
		if (contentObj && contentObj.domNode)
		{
			contentObj.domNode.style.display = "";
			if (offsetX == 0 && offsetY == 0)
				return;
			var editor = contentObj.getParent();
			var coords = dojo.coords(contentObj.domNode);
			var posT = coords.t;
			var posL = coords.l;
			var newTop = editor.pxToPercent(posT + offsetY, false) + "%";
			var newLeft = editor.pxToPercent(posL + offsetX, true) + "%";
			dojo.style(contentObj.domNode, {
				'top': newTop,
				'left': newLeft
			});

			editor.afterMoved([contentObj]);

			// update the native view after the resize.
			concord.util.mobileUtil.presObject.processMessage(id, MSGUTIL.actType.setAttributes);

			/*
			 * // reset the z-index var edtingZIndex = dojo.style(contentObj.mainNode, 'zIndex'); if (contentObj.mainNode.origZ != null && dojo.hasClass(contentObj.mainNode, 'draw_frame')) { dojo.style(contentObj.mainNode, 'zIndex', contentObj.mainNode.origZ); }
			 * 
			 * var objArray = pe.scene.slideEditor.buildDataList(objArray, contentObj, 'Resizing'); var eventData = [{ 'eventName': concord.util.events.LocalSync_eventName_multiBoxAttributeChange, 'ObjList': objArray }]; concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
			 * 
			 * if (edtingZIndex) { dojo.style(contentObj.mainNode, 'zIndex', edtingZIndex); }
			 * 
			 * if (contentObj.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE && contentObj.boxRep && contentObj.boxRep.mainNode) { contentObj.boxRep.mainNode.style.display = ""; contentObj.boxRep.mainNode.style.top = contentObj.mainNode.style.top; contentObj.boxRep.mainNode.style.left = contentObj.mainNode.style.left; }
			 */
		}
	},

	resizeObject: function(id, handleType, offsetX, offsetY)
	{
		var box = dijit.byId(id);
		if (box && box.domNode)
		{
			var coords = dojo.coords(box.domNode);
			box.resizeMe(coords, offsetX, offsetY, handleType);
			var editor = box.getParent();
			editor.afterMoved([box]);
			concord.util.mobileUtil.presObject.processMessage(id, MSGUTIL.actType.setAttributes);
		}
		// update the native view after the resize.

		/*
		 * if (contentObj.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE && contentObj.boxRep && contentObj.boxRep.mainNode) { contentObj.boxRep.mainNode.style.top = contentObj.mainNode.style.top; contentObj.boxRep.mainNode.style.left = contentObj.mainNode.style.left; contentObj.boxRep.mainNode.style.width = contentObj.mainNode.style.width; contentObj.boxRep.mainNode.style.height = contentObj.mainNode.style.height; }
		 */
	},

	processMessage: function(id, type)
	{
		return;
		var element = pe.scene.doc.find(id);
		if (!element)
			return;

		var param = {
			"id": id,
			"type": type
		};
		switch (type)
		{
			case "lock":
			case "unlock":
			case MSGUTIL.actType.deleteElement:
				break;
			case MSGUTIL.actType.insertElement:
			{
				var contentBoxType = 1;
				// TODO, BOB
				// var contentBoxType = pe.scene.slideEditor.contentBoxTypeMap[contentBox.contentBoxType];
				if (contentBoxType)
					param["boxtype"] = contentBoxType;
			}
			case MSGUTIL.actType.setAttributes:
			{
				var box = dijit.byId(id);
				if (box && box.domNode)
				{
					var coords = dojo.coords(box.domNode);
					dojo.mixin(param, coords);
					param["z"] = dojo.style(box.domNode, 'zIndex');
				}
				/*
				 * TODO BOB if (contentBox.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE && contentBox.boxRep && contentBox.boxRep.mainNode) { contentBox.boxRep.mainNode.style.top = contentBox.mainNode.style.top; contentBox.boxRep.mainNode.style.left = contentBox.mainNode.style.left; contentBox.boxRep.mainNode.style.width = contentBox.mainNode.style.width; contentBox.boxRep.mainNode.style.height = contentBox.mainNode.style.height; }
				 */
				break;
			}
			default:
				return;
		}
		concord.util.mobileUtil.jsObjCBridge.postEvents([{
			"name": "presObjectChange",
			"params": [param]
		}]);
	}
};
