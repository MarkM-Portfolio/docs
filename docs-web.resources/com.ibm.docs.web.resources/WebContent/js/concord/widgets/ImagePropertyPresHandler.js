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

dojo.provide("concord.widgets.ImagePropertyPresHandler");
dojo.require("concord.widgets.ImagePropertyDialog");
dojo.requireLocalization("concord.widgets","ImagePropHandler");

dojo.declare("concord.widgets.ImagePropertyPresHandler", null, {
	editor : null,
	dlg : null,
	dialogtitle:null,	
	
	constructor: function(parent){	
		this.editor = parent;
		var nls = dojo.i18n.getLocalization("concord.widgets","ImagePropHandler");	
		this.dialogtitle = nls.dialogtitle;
	},	
	
	showDlg : function(){		
		if( !this.dlg ){	
			this.dlg = new concord.widgets.ImagePropertyDialog(this, this.dialogtitle, null, null);
		}	
		this.dlg.show();	
	},

	
	getImageInfo:function(){
		// get the current image
	    for (var i=0; i<this.editor.CONTENT_BOX_ARRAY.length; i++){
	    	var type = this.editor.CONTENT_BOX_ARRAY[i].contentBoxType;
            if (this.editor.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(type == PresConstants.CONTENTBOX_IMAGE_TYPE ||
            		type == PresConstants.CONTENTBOX_GROUP_TYPE ||
            		type == PresConstants.CONTENTBOX_SHAPE_TYPE)){
            	this.currentImage = this.editor.CONTENT_BOX_ARRAY[i];
            	break;
            }
        }
        // get image information
		var currentWidth = dojo.style(this.currentImage.mainNode, 'width');
		var currentHeight = dojo.style(this.currentImage.mainNode, 'height');

		var altText="";
		if (this.currentImage.contentBoxType == PresConstants.CONTENTBOX_GROUP_TYPE ||
			this.currentImage.contentBoxType == PresConstants.CONTENTBOX_SHAPE_TYPE) {
			altText = this.currentImage.getAltText();
		} else {
			var images = dojo.query("img", this.currentImage.mainNode);
			if (images && images.length > 0) {
				altText = dojo.attr(images[0], 'alt');
			}
		}

//		var maxW = dojo.style(this.currentImage.mainNode.parentNode,'width') - 2*8;//CONTENT_BOX_BORDER_WIDTH
//		var maxH = dojo.style(this.currentImage.mainNode.parentNode,'height') - 2*8;//this.CONTENT_BOX_BORDER_WIDTH		
	
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs'}];
		concord.util.events.publish(concord.util.events.presentationFocus, eventData);
				
		return {width:currentWidth, height:currentHeight, isSupportAlt:true, Alt:altText, isSupportRatio:true, checkRatio:true}; 
	},
	
	setImageInfo: function(width, height,border, alt){
		var acts=[];
		var imageContentBox = null;
		// get the current image
        for (var i=0; i<this.editor.CONTENT_BOX_ARRAY.length; i++){
            var type = this.editor.CONTENT_BOX_ARRAY[i].contentBoxType;
            if (this.editor.CONTENT_BOX_ARRAY[i].boxSelected && 
            		(type == PresConstants.CONTENTBOX_IMAGE_TYPE ||
            		type == PresConstants.CONTENTBOX_GROUP_TYPE ||
            		type == PresConstants.CONTENTBOX_SHAPE_TYPE)){
            	imageContentBox = this.editor.CONTENT_BOX_ARRAY[i];
            	break;
            }
        }
    	if (imageContentBox.isRotated()){
    		pe.scene.slideEditor.showWarningMsgForRotatedObject();
    		return;
    	}
		var newWidth = imageContentBox.PxToPercent(width)+"%";
		var newHeight = imageContentBox.PxToPercent(height, 'height')+"%";
		var oldStyle = dojo.attr(imageContentBox.mainNode, 'style');
		dojo.style(imageContentBox.mainNode, 'width', newWidth);
		dojo.style(imageContentBox.mainNode, 'height', newHeight);
		
		if (PresCKUtil.isConnectorShape(imageContentBox.mainNode)) {
			// When size is changed, update draw frame size and line/arrow position
			var slideEditor = pe.scene.slideEditor;
			var linePos = slideEditor.getConnectorShapePxPos(imageContentBox.mainNode);
			var pos = {
				startX: linePos.x1,
				startY: linePos.y1,
				endX: linePos.x2,
				endY: linePos.y2
			};
			slideEditor.resizeConnectorShape(imageContentBox.mainNode, pos);
			imageContentBox.updateHandlePositions(false);
			// Those message can be sent not together with alt text
			var msgActs = [];
			msgActs = slideEditor.createConnectorPosMsg(
				imageContentBox.contentBoxDataNode, msgActs );
			imageContentBox.publishBoxStyleResizingEnd(msgActs);
		} else {
			imageContentBox.updateHandlePositions(false);
			// Fix issue with IE resizing the contentBoxDataNode on adjustContentDataSize events.
			if (dojo.isIE) {
				dojo.attr(imageContentBox.contentBoxDataNode,"style","POSITION: relative; WIDTH: 100%; HEIGHT: 100%; CURSOR: pointer");
				imageContentBox.adjustContentDataSize();
			}
			var newStyle = dojo.attr(imageContentBox.mainNode, 'style');
			var act1 =SYNCMSG.createAttributeAct(imageContentBox.mainNode.id,{'style':newStyle}, null, {'style':oldStyle}, null);
			acts.push(act1);
		}
		
		var images = dojo.query("img", imageContentBox.mainNode);
		if (images && images.length > 0) {
			var oldAlt = dojo.attr(images[0], 'alt');
			dojo.attr(images[0], 'alt', alt);
			var newAlt = dojo.attr(images[0], 'alt');
			var act =SYNCMSG.createAttributeAct(images[0].id, {'alt':newAlt}, null, {'alt':oldAlt}, null);
			acts.push(act);
		}
		
		// After change shape alt text, send coeditng message
		var shapes = dojo.query("svg", imageContentBox.mainNode);
		if (shapes && shapes.length > 0) {
			var oldAlt = dojo.attr(shapes[0], 'alt');
			// together update aria-label
			var oldAriaLabel = dojo.attr(shapes[0], 'aria-label');
			dojo.attr(shapes[0], 'alt', alt);
			dojo.attr(shapes[0], 'aria-label', alt);
			var newAlt = dojo.attr(shapes[0], 'alt');
			var newAriaLabel = dojo.attr(shapes[0], 'aria-label');
			var act =SYNCMSG.createAttributeAct(shapes[0].id,
				{'alt':newAlt, 'aria-label':newAriaLabel}, null, {'alt':oldAlt, 'aria-label':oldAriaLabel}, null);
			acts.push(act);
		}
		
		var msg =SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,acts);
		SYNCMSG.sendMessage([msg]);
	}
});
