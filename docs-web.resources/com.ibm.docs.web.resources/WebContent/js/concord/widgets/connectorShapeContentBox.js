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

/*
 * @imgContentBox.js CAEditor component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.connectorShapeContentBox");
dojo.require("concord.widgets.shapeContentBox");
dojo.require("concord.util.browser");
dojo.require("concord.widgets.presentationDialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","imgContentBox");

dojo.declare("concord.widgets.connectorShapeContentBox", [concord.widgets.shapeContentBox], {
	
	constructor: function(opts) {
	},
	
	// Add two image handler children for new created connector shape
	makeResizeable: function() {
		// Define a default size for image
		var styleForHandleImage = {
			'position':'absolute',
			'width':PresConstants.HANDLE_IMAGE_SIZE + 'px',
			'height':PresConstants.HANDLE_IMAGE_SIZE + 'px',
			'border':'none'
		};
		
		//Top Left corner
		var start = document.createElement('img');
		start.id = 'start_'+this.boxUID;
		dojo.addClass(start,'start handle');
		start.src=PresConstants.HANDLE_IMAGE_SRC;
		start.setAttribute('alt', '');
		this.mainNode.appendChild(start);
		dojo.style(start, styleForHandleImage);
		dojo.style(start,{
			'cursor':'nw-resize'
		});

		//Bottom Right corner
		var end = document.createElement('img');
		end.id = 'end_'+this.boxUID;
		dojo.addClass(end,'end handle');
		end.src=PresConstants.HANDLE_IMAGE_SRC;
		end.setAttribute('alt', '');
		this.mainNode.appendChild(end);
		dojo.style(end, styleForHandleImage);
		dojo.style(end,{
			'cursor':'se-resize'
		});

		this.updateHandlePositions(false);
		this.hideHandles();
		start = null;
		end = null;
	},
	
	// Update the two handler position
	updateHandlePositions: function(resizeContent, node) {
		if (!node) node = this.mainNode;
		var handles = dojo.query('.handle', node);
		var halfImgSize=PresConstants.HANDLE_IMAGE_SIZE/2; // size of image
		
		var boxId = dojo.attr(node,"boxid");
		boxId = boxId.substring(boxId.indexOf('_')+1, boxId.length);
		var boxWidth = (dojo.isIE) ? node.clientWidth : dojo.style(node,'width');
		var boxHeight =(dojo.isIE) ? node.clientHeight :dojo.style(node,'height');
		
		var lineArray = node.getElementsByTagName('line');
		if (lineArray && lineArray.length > 0) {
			var lineNode = lineArray[0];
			var x1 = parseFloat(dojo.attr(lineNode, 'x1'))/100;
			var y1 = parseFloat(dojo.attr(lineNode, 'y1'))/100;
			var x2 = parseFloat(dojo.attr(lineNode, 'x2'))/100;
			var y2 = parseFloat(dojo.attr(lineNode, 'y2'))/100;
			// Always put the image center coordinate as start or end coordinate
			for (var i=0; i<handles.length; i++){
				var handle = handles[i];
				if (handle.id=='start_'+boxId) {
					dojo.style(handle,{
						'position':'absolute',
						'left':(x1 * boxWidth - halfImgSize)+'px',
						'top':(y1 * boxHeight - halfImgSize)+'px'
					});
					
					
				} else if (handle.id=='end_'+boxId){
					dojo.style(handle,{
						'position':'absolute',
						'left':(x2 * boxWidth - halfImgSize)+'px',
						'top':(y2 * boxHeight - halfImgSize)+'px'
					});
					
				}
				handle = null;
			}
		}
		// Let's update comment icon
		if(this.hasComments()){
			this.updateCommentIconPosition();
		}
		
		container = null;
		node = null;
		handles = null;
	},
	
	// Get svg shape title content
	_getSvgTitle: function(svgNode) {
		if (svgNode && svgNode.tagName.toLowerCase() == 'svg') {
			// deal with svg node : find for children 'title'
			var titleNodeList = dojo.query("title", svgNode);
			if (titleNodeList.length > 0) {
				var titleNode = titleNodeList[0];
				var altText = titleNode.textContent;
				if (!altText || altText.length == 0)
					return titleNode.innerHTML;
				else
					return altText;
			}
		}
		return null;
	},
	
	// Set alt text
	setAriaLabels:function(drawFrame){
		if(!drawFrame) return;
		var svgNode = drawFrame.firstChild;
		if (!svgNode) return;
		
		var labelledby = '';
		// have JAWS tell user its a "shape" object
		if (dojo.hasClass(drawFrame,"draw_custom-shape"))
			labelledby = 'P_arialabel_Shape ' + labelledby;
		labelledby = labelledby + svgNode.id + ' ';
		if (labelledby) {
			// Give a role to indicate its function
			dijit.setWaiRole(drawFrame, 'shape');
			// Focus will be on draw frame. But need read aria-label
			// in svg node, so refer to it.
			dijit.setWaiState(drawFrame,'labelledby', dojo.string.trim(labelledby));
		}
		
		var altText = dojo.attr(svgNode,'alt');
		if (!altText) {
			// JAWS doesn't appear to like it when the alt tag is empty or missing (it won't announce anything)
			// so lets put in a dummy alt tag text
			var a11yStrings = dojo.i18n.getLocalization("concord.util", "a11y");
			if (dojo.hasClass(drawFrame,"draw_custom-shape")){
				// there is no need to add 'alt' for svg node
				if (svgNode.tagName.toLowerCase() == 'svg') {
					var title = this._getSvgTitle(svgNode);
					// For new created shape, use its title as alt text
					// The title has been localized
					if (title && title !== 'shape')
						altText = title;
					else
						altText = a11yStrings.aria_shape;
					dojo.attr(svgNode, 'alt', altText);
				}
			}
		}
		// Add aria-label for shape if it has not
		if (dojo.hasClass(drawFrame,"draw_custom-shape")){
			// when a shape has alt text, make sure it has aria-label so JAWS announces the alt text
			if (!dojo.hasAttr(svgNode,'aria-label')){
				dijit.setWaiState(svgNode,'label',altText);
			}
		}
	},
	
	// Get alt text
	getAltText: function() {
		return dojo.attr(this.contentBoxDataNode, 'alt');
	}

});
