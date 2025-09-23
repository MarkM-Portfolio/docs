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

dojo.provide("concord.widgets.shapeContentBox");
dojo.require("concord.util.browser");
dojo.require("concord.widgets.mContentBox");
dojo.require("concord.widgets.presentationDialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","imgContentBox");

dojo.declare("concord.widgets.shapeContentBox", [concord.util.browser.isMobile() ? concord.widgets.mContentBox : concord.widgets.contentBox], {
	
	constructor: function(opts) {
		//console.log("shapeContentBox:constructor","Entry");	
		this.isEditable = false; 		
		this.init();
		//console.log("shapeContentBox:constructor","Exit");	
	},
    
    
	init: function(){
		//console.log("shapeContentBox:init","Entry");
		if (dojo.attr(this.contentBoxDataNode,"isnewshape") == "true") {
			this.setNewShapeDefaults();
		}
		this.contentBoxType = PresConstants.CONTENTBOX_SHAPE_TYPE;
		this.inherited(arguments);
		/**
		 * Defect:32071: [FF][IE] Convert odp image and text position error.
		 * Can't set the draw_img's position to 'relative' and convert service set it to 'absolute' as default. 
		 */
		dojo.style(this.contentBoxDataNode,{'position':'relative'});
		dojo.attr(this.contentBoxDataNode,'draw_layer','layout'); //set draw_layer to layout to indicate that this content box is not a background objects
		//console.log("shapeContentBox:init","Exit");					
	},	
	
	setNewShapeDefaults: function() {
		//need to check if it is spare...
		var isToSendMessage = true;
		//13550
		if(dojo.hasClass(this.mainNode, "isSpare")){
			isToSendMessage = false;
		}
		// this.setSvgShapePropeties(isToSendMessage);
		dojo.removeAttr(this.contentBoxDataNode,"isnewshape");
	},
	
	getDefaultProperties: function(svgNode){
		var nls = dojo.i18n.getLocalization("concord.widgets","shapeGallery");
    	var shapesJSONObject =
		{
			properties: 
			[
				{
					shapeType: PresShapeTemplates.SHAPETYPES.RECTANGULAR,
					viewBox: '0 0 100 100',
					path: 'M 0 0 L 100 0 100 100 0 100 0 0 Z',
					top: '0%',
					left: '2%',
					width: '96%',
					height: '100%',
					altText: nls.rectangle
				},
				{	
					shapeType: PresShapeTemplates.SHAPETYPES.TRIANGLE,
					viewBox: '0 0 100 100',
					path: 'M 50 0 L 100 100 0 100 Z',
					top: '33.3%',
					left: '33.3%',
					width: '33.3%',
					height: '66.7%',
					altText: nls.isoscelestriangle
				},
				{	
					shapeType: PresShapeTemplates.SHAPETYPES.ELLIPSE,
					viewBox: '0 0 100 100',
					path: 'M 100 50 A 50 50 0 0 0 0 50 A 50 50 0 0 0 100 50 Z',
					top: '14.6%',
					left: '14.6%',
					width: '70.7%',
					height: '70.7%',
					altText: nls.ellipse
				},
				{	
					shapeType: PresShapeTemplates.SHAPETYPES.DIAMOND,
					viewBox: '0 0 100 100',
					path: 'M 50 0 L 100 50 50 100 0 50 50 0 Z',
					top: '25%',
					left: '25%',
					width: '50%',
					height: '50%',
					altText: nls.diamond
				},
				{	
					shapeType: PresShapeTemplates.SHAPETYPES.FIVEPOINTEDSTAR,
					viewBox: '0 0 100 100',
					path: 'M 49.98611111111111 0 L 38.32407407407407 38.22222222222222 0 38.22222222222222 31.12037037037037 62.06018518518519 19.435185185185187 100 49.98611111111111 76.75925925925927 80.56018518518519 100 68.87962962962963 62.06018518518519 100 38.22222222222222 61.6712962962963 38.22222222222222 49.98611111111111 0 Z',
					top: '38.2%',
					left: '31.1%',
					width: '37.8%',
					height: '33.4%',
					altText: nls.fivepointedstar
				},
				{	
					shapeType: PresShapeTemplates.SHAPETYPES.ROUNDRECT,
					viewBox: '0 0 100 100',
					path: 'M 16.666666666666664 0 A 16.666666666666664 16.666666666666664 0 0 0 0 16.666666666666664 L 0 83.33333333333334 A 16.666666666666664 16.666666666666664 0 0 0 16.666666666666664 100 L 83.33333333333334 100 A 16.666666666666664 16.666666666666664 0 0 0 100 83.33333333333334 L 100 16.666666666666664 A 16.666666666666664 16.666666666666664 0 0 0 83.33333333333334 0 Z',
					top: '0%',
					left: '2%',
					width: '96%',
					height: '100%',
					altText: nls.roundedrectangle
				},
				{	
					shapeType: PresShapeTemplates.SHAPETYPES.WEDGERECTCALLOUT,
					viewBox: '0 0 100 100',
					path: 'M 0 0 L 0 8.205714285714286 0 14.354285714285714 0 20.502857142857142 0 28.86857142857143 0 35.01714285714286 0 41.16571428571429 0 49.371428571428574 16.62037037037037 49.371428571428574 9.398148148148149 100 41.52777777777778 49.371428571428574 58.47222222222222 49.371428571428574 70.92592592592592 49.371428571428574 83.37962962962963 49.371428571428574 100 49.371428571428574 100 41.16571428571429 100 35.01714285714286 100 28.86857142857143 100 20.502857142857142 100 14.354285714285714 100 8.205714285714286 100 0 83.37962962962963 0 70.92592592592592 0 58.47222222222222 0 41.52777777777778 0 29.074074074074073 0 16.62037037037037 0 0 0 Z',
					top: '0%',
					left: '2%',
					width: '96%',
					height: '50%',
					altText: nls.rectangularcallout
				},
				{	
					shapeType: PresShapeTemplates.SHAPETYPES.HEXAGON,
					viewBox: '0 0 100 100',
					path: 'M 25 0 L 75 0 100 50 75 100 25 100 0 50 Z',
					top: '18.6%',
					left: '18.6%',
					width: '62.9%',
					height: '62.9%',
					altText: nls.hexagon
				}
			]
		}
		var shapeType = dojo.attr(svgNode.parentNode.parentNode.parentNode,"draw_type");
		for ( var i = 0; i < shapesJSONObject.properties.length ; i++ )
		{
    		if (shapeType == shapesJSONObject.properties[i].shapeType ) {
    			return shapesJSONObject.properties[i];
    		}
		}
	},
		
	setDefaultViewPath: function(svgNode){
		var properties = this.getDefaultProperties(svgNode);
		if(properties){
			dojo.attr(svgNode,"viewBox",properties.viewBox);
			dojo.attr(svgNode.firstChild.firstChild,"d",properties.path);
		}
	},
	
	refreshSvgShape: function(sendMessage) {
		var svgNode = this.contentBoxDataNode;
		
		// only set SVG properties for new shape
		if (dojo.attr(svgNode,"isnewshape") != "true") {
			// change id, refresh ref
			concord.util.HtmlContent.refreshIdForSVGElement(svgNode);
		}
	},
	
	setSvgShapePropeties: function(sendMessage){
		var svgNode = this.contentBoxDataNode;
		
		// only set SVG properties for new shape
		if (dojo.attr(svgNode,"isnewshape") != "true") {
			concord.util.HtmlContent.checkIdRefForSVGElement(svgNode);
			return;
		}
		
		
		if (sendMessage) {
			var oldViewBox = dojo.attr(svgNode,"viewBox");
			var oldPath = dojo.attr(svgNode.firstChild.firstChild,"d");
			var oldStrokeWidth = dojo.attr(svgNode.firstChild,"stroke-width");
		}
		var oldStrokeDashArray = dojo.attr(svgNode.firstChild,"stroke-dasharray");
		this.setDefaultViewPath(svgNode);
		shapeStroke = dojo.attr(svgNode.firstChild,"docs_border_thickness");
    	if (shapeStroke == "thin") {
    		shapeStroke = 2;
    	} else if (shapeStroke == "medium") {
    		shapeStroke = 4;
    	} else if (shapeStroke == "thick") {
    		shapeStroke = 6;
    	} else {
    		shapeStroke = 0;
    	}	
    	var shapeWidth = Number(dojo.style(svgNode.parentNode,"width"));
		var shapeHeight = Number(dojo.style(svgNode.parentNode,"height"));
		shapeStroke =  Number(shapeStroke);
		var viewBoxArray = dojo.attr(svgNode,"viewBox").split(" ");
		var adjustY = false;
		var viewPortRatio = 0;
		if (shapeHeight > shapeWidth)
		{
			adjustY = false;
			viewPortRatio = shapeWidth / shapeHeight;
		}
		else
		{
			adjustY = true;
			viewPortRatio = shapeHeight / shapeWidth;
		}
				
		var viewBoxStrokeX = (shapeStroke/shapeWidth)*100;
		var viewBoxStrokeY = (shapeStroke/shapeHeight)*100;
		viewBoxArray[0] = 0 - (viewBoxStrokeX/2);
		viewBoxArray[1] = 0 - (viewBoxStrokeY/2);
		viewBoxArray[2] = Number(viewBoxArray[2]) + viewBoxStrokeX;
		viewBoxArray[3] = Number(viewBoxArray[3]) + viewBoxStrokeY;	
				
		if (adjustY)
		{
			viewBoxArray[1] = viewBoxArray[1] * viewPortRatio;
			viewBoxArray[3] = viewBoxArray[3] * viewPortRatio;
		} else {
			viewBoxArray[0] = viewBoxArray[0] * viewPortRatio;
			viewBoxArray[2] = viewBoxArray[2] * viewPortRatio;
		}

		dojo.attr(svgNode,"viewBox",viewBoxArray.join(' '));
		if (shapeHeight > shapeWidth) {
			dojo.attr(svgNode.firstChild,"stroke-width",viewBoxStrokeY);
		} else {
			dojo.attr(svgNode.firstChild,"stroke-width",viewBoxStrokeX);
		}
		
		if (oldStrokeDashArray && oldStrokeDashArray != "" && oldStrokeDashArray != "none") {
			var dashArrayToUse = 0;
			if (shapeHeight > shapeWidth) {
				dashArrayToUse = viewBoxStrokeY;
			} else {
				dashArrayToUse = viewBoxStrokeX;
			}
			if (dojo.attr(svgNode.firstChild,"docs_border_thickness") == "thin") {
				dashArrayToUse = dashArrayToUse*5;
			} else if (dojo.attr(svgNode.firstChild,"docs_border_thickness") == "medium"){
				dashArrayToUse = dashArrayToUse*3;
			} else if (dojo.attr(svgNode.firstChild,"docs_border_thickness") == "thick"){
				dashArrayToUse = dashArrayToUse*2;
			}
			dojo.attr(svgNode.firstChild,"stroke-dasharray",""+dashArrayToUse+" "+dashArrayToUse+"");
		}
				
		var path = dojo.attr(svgNode.firstChild.firstChild,"d");
		var pathArray = path.split(" ");
		var newPath = "";
		for ( var i = 0; i < pathArray.length ; i++ ) {
			if (isNaN(pathArray[i])) {
				var svgCommand = pathArray[i].charAt(0);
				if (svgCommand == "M" || svgCommand == "L") {
					newPath = newPath + svgCommand + " ";
					var j = i + 1;
					var counter = 0;
					for (; j < pathArray.length && !isNaN(pathArray[j]); j++)
					{
						counter += 1;
						if (counter%2 == 0) {
							if (adjustY) {
								pathArray[j] = pathArray[j] * viewPortRatio;
								newPath = newPath + pathArray[j] + " ";
							} else {
								newPath = newPath + pathArray[j] + " ";
							}
						} else {
							if (adjustY) {
								newPath = newPath + pathArray[j] + " ";
							} else {
								pathArray[j] = pathArray[j] * viewPortRatio;
								newPath = newPath + pathArray[j] + " ";
							}
						}	
					}
				} else if (svgCommand == "A") {
					newPath = newPath + svgCommand + " ";
					var j = i + 1;
					var k = 0;
					for (; (j + k) < pathArray.length && !isNaN(pathArray[j + k]); k++)
					{
						var r = k % 7;
						if (adjustY)
						{
							if (r == 1 || r == 6)
							{
								pathArray[j + k] = pathArray[j + k] * viewPortRatio;
								newPath = newPath + pathArray[j + k] + " ";
							} else {
								newPath = newPath + pathArray[j + k] + " ";
							}
						} else {
							if (r == 0 || r == 5)
							{
								pathArray[j + k] = pathArray[j + k] * viewPortRatio;
								newPath = newPath + pathArray[j + k] + " ";
							} else {
								newPath = newPath + pathArray[j + k] + " ";
							}
						}
					}
				} else if (svgCommand == "Z") {
					newPath = newPath + svgCommand;
				}
			}
		}
		dojo.attr(svgNode.firstChild.firstChild,"d",newPath);
		var acts=[];
		var actList=[];
		if (sendMessage) {
			var newViewBox = dojo.attr(svgNode,"viewBox");
			var newPath = dojo.attr(svgNode.firstChild.firstChild,"d");
			var newStrokeWidth = dojo.attr(svgNode.firstChild,"stroke-width");
			//check for differences and add messages
			var newViewBox = dojo.attr(svgNode, 'viewBox');
			if (oldViewBox != newViewBox) {
			    var actViewBox =SYNCMSG.createAttributeAct(svgNode.id, {'viewBox':newViewBox}, null, {'viewBox':oldViewBox}, null);
			    acts.push(actViewBox);
			}
			var newPath = dojo.attr(svgNode.firstChild.firstChild, 'd');
			if (oldPath != newPath) {
			    var actpath =SYNCMSG.createAttributeAct(svgNode.firstChild.firstChild.id, {'d':newPath}, null, {'d':oldPath}, null);
			    acts.push(actpath);
			}
			var newStrokeWidth = dojo.attr(svgNode.firstChild, 'stroke-width');
			if (oldStrokeWidth != newStrokeWidth) {
			    var actStrokeWidth =SYNCMSG.createAttributeAct(svgNode.firstChild.id, {'stroke-width':newStrokeWidth}, null, {'stroke-width':oldStrokeWidth}, null);
			    acts.push(actStrokeWidth);
			}
			for(var i=0;i< acts.length;i++){
				actList.push(acts[i]);
			}
			actList= actList.concat(acts);
		}
		
		if (oldStrokeDashArray && oldStrokeDashArray != "") {
			var newStrokeDashArray = dojo.attr(svgNode.firstChild,"stroke-dasharray");
			if (oldStrokeDashArray != newStrokeDashArray) {
			    var actStrokeDashArray =SYNCMSG.createAttributeAct(svgNode.firstChild.id, {'stroke-dasharray':newStrokeDashArray}, null, {'stroke-dasharray':oldStrokeDashArray}, null);
			    acts.push(actStrokeDashArray);
			    actList = actList.concat(acts);
			}
		}
		
		if (actList.length > 0) {
			var msg =SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,actList);
			//21168
			msg = SYNCMSG.addUndoFlag(msg,false);
			SYNCMSG.sendMessage([msg]);
		}
	}

});
