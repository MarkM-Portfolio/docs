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

dojo.provide("pres.editor.BoxPosMixin");
dojo.require("dijit._Widget");
dojo.require("pres.editor.Resizable");

/*
 * This mixin provides resize function for box.
 */

dojo.declare("pres.editor.BoxPosMixin", pres.editor.Resizable, {

	getContentDataWidthLimitation: function()
	{
		var tbl = this.contentBoxDataNode;
		var numRows = tbl.rows ? tbl.rows.length : 0;
		var numCols = numRows > 0 ? tbl.rows[0].childNodes.length : 1;
		tbl = null;

		var pixelWidthLimit = numCols * 20;
		return pixelWidthLimit;
	},

	getHeight_adjust: function(node, includeMargin)
	{
		return 0;
	},

	getDataMargin: function()
	{
		var margin = 0;
		var marginTop = 0;
		var marginBottom = 0;

		if (this.element.family != "graphic")
		{
			marginTop = (this.contentBoxDataNode.firstElementChild) ? dojo.style(this.contentBoxDataNode.firstElementChild, 'marginTop') : 0;
			marginBottom = (this.contentBoxDataNode.lastElementChild) ? dojo.style(this.contentBoxDataNode.lastElementChild, 'marginBottom') : 0;
			margin = marginTop + marginBottom;
		}
		else
		{
			margin = 0;
		}
		// console.log("contentBox : getDataMargin","marginTop + marginBottom = margin "+marginTop +" + "+ marginBottom +" = "+ margin);

		if (isNaN(margin))
			margin = 0;
		return margin;
	},

	getDataTotalHeight: function()
	{
		if (this.element.family == "table")
		{
			return this.contentBoxDataNode.offsetHeight;
		}
		else if (this.element.family == "group")
		{
			var dataMargin = this.getDataMargin();
			var totalDataHeight = 0;
			var totalDataHeight = 0;
			var dataNode = dojo.query('.draw_text-box', this.contentBoxDataNode);
			if (dataNode.length > 0)
			{
				totalDataHeight += dataNode[0].firstElementChild.offsetHeight;
			}
			else
			{
				totalDataHeight += this.contentBoxDataNode.offsetHeight;
			}
			totalDataHeight += dataMargin;
			return totalDataHeight;
		}
		else
		{
			var dataMargin = this.getDataMargin();
			// var totalDataHeight = this.getFirstContentDataChild().offsetHeight + dataMargin + PresConstants.HEIGHT_ADJUST;
			var totalDataHeight = 0;
			var children = this.contentBoxDataNode.children;
			for ( var i = 0; i < children.length; i++)
			{
				// for D17087,[IE9] The title textbox of first slide will truncate if change master style
				// if the real size is more than the size of 10%*frame height,use the real height
				totalDataHeight += children[i].offsetHeight;
			}
			totalDataHeight += dataMargin;
			return totalDataHeight;
		}
	},

	/**
	 * When resize connector shape, get the not moved point
	 * 
	 * @param type:
	 *            start or end
	 * @returns
	 */
	_getNotMovedPoint: function(type)
	{
		var svg = this.element.svg;
		var dir = svg.dir; // 0 ~ 7
		var frm = svg.frm;
		var ptToEMU = pres.constants.PT_TO_EMU_FACTOR;
		var point = {};
		var h = pres.utils.helper;
		switch (dir)
		{
			case 0:
			case 1:
				if (type == 'start')
				{
					point.x = h.emuToPx(frm.l);
					point.y = h.emuToPx(frm.t);
				}
				else if (type == 'end')
				{
					point.x = h.emuToPx(frm.l + frm.w);
					point.y = h.emuToPx(frm.t + frm.h);
				}
				break;
			case 2:
			case 3:
				if (type == 'start')
				{
					point.x = h.emuToPx(frm.l + frm.w);
					point.y = h.emuToPx(frm.t);
				}
				else if (type == 'end')
				{
					point.x = h.emuToPx(frm.l);
					point.y = h.emuToPx(frm.t + frm.h);
				}
				break;
			case 4:
			case 5:
				if (type == 'start')
				{
					point.x = h.emuToPx(frm.l + frm.w);
					point.y = h.emuToPx(frm.t + frm.h);
				}
				else if (type == 'end')
				{
					point.x = h.emuToPx(frm.l);
					point.y = h.emuToPx(frm.t);
				}
				break;
			case 6:
			case 7:
				if (type == 'start')
				{
					point.x = h.emuToPx(frm.l);
					point.y = h.emuToPx(frm.t + frm.h);
				}
				else if (type == 'end')
				{
					point.x = h.emuToPx(frm.l + frm.w);
					point.y = h.emuToPx(frm.t);
				}
				break;
			default:
				return null;
		}
		return point;
	},

	/**
	 * For connector shape, get real dir as seen in flipped coordinate system
	 * 
	 * @param relativeDir
	 * @returns
	 */
	_getRealDir: function(relativeDir)
	{
		var flipH = false, flipV = false;
		// svg.dir still the one before resize
		switch (this.element.svg.dir)
		{
			case 3:
			case 4:
				flipH = true;
				break;
			case 5:
				flipH = true;
				flipV = true;
				break;
			case 6:
			case 7:
				flipV = true;
				break;
			default:
				break;
		}

		// Dir in flip coordinate system
		switch (relativeDir)
		{
			case 0:
				if (flipH && flipV)
				{
					return 4;
				}
				else if (flipH)
				{
					return 4;
				}
				else if (flipV)
				{
					return 0;
				}
				else
					return relativeDir;
				break;
			case 1:
				if (flipH && flipV)
				{
					return 5;
				}
				else if (flipH)
				{
					return 3;
				}
				else if (flipV)
				{
					return 7;
				}
				else
					return relativeDir;
				break;
			case 2:
				if (flipH && flipV)
				{
					return 6;
				}
				else if (flipH)
				{
					return 2;
				}
				else if (flipV)
				{
					return 6;
				}
				else
					return relativeDir;
				break;
			case 3:
				if (flipH && flipV)
				{
					return 7;
				}
				else if (flipH)
				{
					return 1;
				}
				else if (flipV)
				{
					return 5;
				}
				else
					return relativeDir;
				break;
			case 4:
				if (flipH && flipV)
				{
					return 0;
				}
				else if (flipH)
				{
					return 0;
				}
				else if (flipV)
				{
					return 4;
				}
				else
					return relativeDir;
				break;
			case 5:
				if (flipH && flipV)
				{
					return 1;
				}
				else if (flipH)
				{
					return 7;
				}
				else if (flipV)
				{
					return 3;
				}
				else
					return relativeDir;
				break;
			case 6:
				if (flipH && flipV)
				{
					return 2;
				}
				else if (flipH)
				{
					return 6;
				}
				else if (flipV)
				{
					return 2;
				}
				else
					return relativeDir;
				break;
			case 7:
				if (flipH && flipV)
				{
					return 3;
				}
				else if (flipH)
				{
					return 5;
				}
				else if (flipV)
				{
					return 1;
				}
				else
					return relativeDir;
				break;
		}
	},

	/**
	 * When resize connector shape, get the real time frame rect
	 * 
	 * @returns
	 */
	_getSvgRect: function()
	{
		// Get line dir from position
		// +x axis, 1st quadrant, +Y axis, 2nd quadrant
		// -x axis, 3rd quadrant, -Y axis, 4th quadrant
		// Origin point
		var pos = this.sePoint;
		var rect = {
			w: Math.abs(pos.startX - pos.endX),
			h: Math.abs(pos.startY - pos.endY)
		};
		if (pos.endX > pos.startX && pos.endY == pos.startY)
		{
			rect.l = pos.startX;
			rect.t = pos.startY;
			rect.dir = 0;
		}
		else if (pos.endX > pos.startX && pos.endY > pos.startY)
		{
			rect.l = pos.startX;
			rect.t = pos.startY;
			rect.dir = 1;
		}
		else if (pos.endX == pos.startX && pos.endY > pos.startY)
		{
			rect.l = pos.endX;
			rect.t = pos.startY;
			rect.dir = 2;
		}
		else if (pos.endX < pos.startX && pos.endY > pos.startY)
		{
			rect.l = pos.endX;
			rect.t = pos.startY;
			rect.dir = 3;
		}
		else if (pos.endX < pos.startX && pos.endY == pos.startY)
		{
			rect.l = pos.endX;
			rect.t = pos.endY;
			rect.dir = 4;
		}
		else if (pos.endX < pos.startX && pos.endY < pos.startY)
		{
			rect.l = pos.endX;
			rect.t = pos.endY;
			rect.dir = 5;
		}
		else if (pos.endX == pos.startX && pos.endY < pos.startY)
		{
			rect.l = pos.startX;
			rect.t = pos.endY;
			rect.dir = 6;
		}
		else if (pos.endX > pos.startX && pos.endY < pos.startY)
		{
			rect.l = pos.startX;
			rect.t = pos.endY;
			rect.dir = 7;
		}
		return rect;
	},

	/**
	 * For connector shape, get start and end handler class
	 * @param rectDir: the dir in flip coordinate system
	 * @returns {___anonymous10682_10738}
	 */
	_getSeClass: function(rectDir)
	{
		var startClass, endClass;
		switch (rectDir)
		{
			case 0:
				startClass = 'resize-handler-w';
				endClass = 'resize-handler-e';
				break;
			case 1:
				startClass = 'resize-handler-nw';
				endClass = 'resize-handler-se';
				break;
			case 2:
				startClass = 'resize-handler-n';
				endClass = 'resize-handler-s';
				break;
			case 3:
				startClass = 'resize-handler-ne';
				endClass = 'resize-handler-sw';
				break;
			case 4:
				startClass = 'resize-handler-e';
				endClass = 'resize-handler-w';
				break;
			case 5:
				startClass = 'resize-handler-se';
				endClass = 'resize-handler-nw';
				break;
			case 6:
				startClass = 'resize-handler-s';
				endClass = 'resize-handler-n';
				break;
			case 7:
				startClass = 'resize-handler-sw';
				endClass = 'resize-handler-ne';
				break;
			default:
				break;
		}

		return {
			startClass: startClass,
			endClass: endClass
		};
	},

	/**
	 * For connector shape, need transform start and end point as 
	 * ones in flip coordinate system
	 * @param flag: true means start and false means end
	 */
	_updateSePoint: function(flag)
	{
		var svg = this.element.svg;
		var svgCenterX = pres.utils.helper.emuToPx(svg.frm.l + (svg.frm.w / 2)), svgCenterY = pres.utils.helper.emuToPx(svg.frm.t + (svg.frm.h / 2));
		switch (svg.dir)
		{
			case 3:
			case 4:
				if (flag)
					this.sePoint.startX = 2 * svgCenterX - this.sePoint.startX;
				else
					this.sePoint.endX = 2 * svgCenterX - this.sePoint.endX;
				break;
			case 5:
				if (flag)
					this.sePoint.startX = 2 * svgCenterX - this.sePoint.startX;
				else
					this.sePoint.endX = 2 * svgCenterX - this.sePoint.endX;
				if (flag)
					this.sePoint.startY = 2 * svgCenterY - this.sePoint.startY;
				else
					this.sePoint.endY = 2 * svgCenterY - this.sePoint.endY;
				break;
			case 6:
			case 7:
				if (flag)
					this.sePoint.startY = 2 * svgCenterY - this.sePoint.startY;
				else
					this.sePoint.endY = 2 * svgCenterY - this.sePoint.endY;
				break;
			default:
				break;
		}
	},
		
	resizeConnectorShape: function(coords, offsetX, offsetY, type)
	{
		if (!this.sePoint)
			this.sePoint = {};
		switch (type)
		{
			case 'start':
				var point = this._getNotMovedPoint('start');
				this.sePoint.startX = point.x + offsetX;
				this.sePoint.startY = point.y + offsetY;
				this._updateSePoint(true);
				if (this.sePoint.endX == undefined && this.sePoint.endY == undefined)
				{
					var point = this._getNotMovedPoint('end');
					this.sePoint.endX = point.x;
					this.sePoint.endY = point.y;
					this._updateSePoint(false);
				}
				break;
			case 'end':
				var point = this._getNotMovedPoint('end');
				this.sePoint.endX = point.x + offsetX;
				this.sePoint.endY = point.y + offsetY;
				this._updateSePoint(false);
				if (this.sePoint.startX == undefined && this.sePoint.startY == undefined)
				{
					var point = this._getNotMovedPoint('start');
					this.sePoint.startX = point.x;
					this.sePoint.startY = point.y;
					this._updateSePoint(true);
				}
				break;
			default:
				break;
		}

		// Shape element position
		// Even with flip effect, the coords are still ones without flip
		var boxL = coords.l;
		var boxT = coords.t;
		var boxW = coords.w;
		var boxH = coords.h;

		var svgRect = this._getSvgRect();

		// SVG relative l and t
		var svgRelL = svgRect.l - boxL;
		var svgRelT = svgRect.t - boxT;

		var wrapperNode = dojo.query('.resize-wrapper', this.mainNode)[0];
		if (wrapperNode)
		{
			dojo.style(wrapperNode, {
				position: 'absolute',
				left: svgRelL * 100 / boxW + '%',
				top: svgRelT * 100 / boxH + '%',
				width: svgRect.w * 100 / boxW + '%',
				height: svgRect.h * 100 / boxH + '%'
			});

			// Set handler css per line dir
			var obj = this._getSeClass(svgRect.dir);
			dojo.forEach(wrapperNode.childNodes, function(node)
			{
				if (dojo.hasClass(node, 'start'))
				{
					dojo.removeAttr(node, 'class');
					dojo.addClass(node, 'start resize-handler ' + obj.startClass);
				}
				else if (dojo.hasClass(node, 'end'))
				{
					dojo.removeAttr(node, 'class');
					dojo.addClass(node, 'end resize-handler ' + obj.endClass);
				}
			});

			// Update line shape tmp dir in model
			// Do not update dir(the final value) in model now
			// Because it will impact rn msg delete ract
			// Do not update model before rn msg is generated
			this.element.svg.tmpDir = this._getRealDir(svgRect.dir);
		}
	},

	/**
	 * Check to see if the width of the table has reached the size limit during a resize. Row height is preserved by the browser during resizing and won't shrink to a single line but width is not.
	 * 
	 * @param posL --
	 *            Position of the left of cotentbox object
	 * @param posT --
	 *            Position of the top of cotentbox object
	 * @param posH --
	 *            Position of the height of cotentbox object
	 * @param posW --
	 *            Position of the width of cotentbox object
	 * @param x --
	 *            The x value of the cotentbox object
	 * @param y --
	 *            The y value of the cotentbox object
	 * @param e --
	 *            The event client x,y value of cotentbox object
	 * @param hdlName --
	 *            The handle move being made.
	 */
	resizeMe: function(coords, offsetX, offsetY, hdlName, shift)
	{
		if (this.isRotatedPPTODPGroupBox())
		{
			pe.scene.slideEditor.showWarningMsgForRotatedObject();
			return;
		}
		// posH, posW from dojo.coords, is box's inner width and height value as the border and margin is the same.
		this.unfixBoxHeight();
				
		var ratio;
		if(shift)
			ratio = coords.w/coords.h;
		
		var isShape = pres.utils.shapeUtil.isNormalShape(this.element);
		
		var updateNode, refNode;
		if (isShape)
		{
			updateNode = dojo.query('.resize-wrapper', this.domNode)[0];
			refNode = this.mainNode;
		}
		else
		{
			updateNode = this.mainNode;
		}
		
		hdlName = hdlName.toLowerCase();
		var fixedPos;
		var boxWidth, boxHeight;
		switch(hdlName)
		{
			case "tl":
				if(!coords.fixedPos)
					coords.fixedPos = dojo.position(dojo.query(".br", updateNode)[0]);
				boxWidth = coords.w - offsetX;
				boxHeight = coords.h - offsetY;
				break;
			case "tm":
				if(!coords.fixedPos)
					coords.fixedPos = dojo.position(dojo.query(".bl", updateNode)[0]);
				boxHeight = coords.h - offsetY;
				break;
			case "tr":
				if(!coords.fixedPos)
					coords.fixedPos = dojo.position(dojo.query(".bl", updateNode)[0]);
				boxWidth = coords.w + offsetX;
				boxHeight = coords.h - offsetY;
				break;
			case "ml":
				if(!coords.fixedPos)
					coords.fixedPos = dojo.position(dojo.query(".tr", updateNode)[0]);
				boxWidth = coords.w - offsetX;
				break;
			case "bl":
				if(!coords.fixedPos)
					coords.fixedPos = dojo.position(dojo.query(".tr", updateNode)[0]);
				boxWidth = coords.w - offsetX;
				boxHeight = coords.h + offsetY;
				break;
			case "mr":
				if(!coords.fixedPos)
					coords.fixedPos = dojo.position(dojo.query(".tl", updateNode)[0]);
				boxWidth = coords.w + offsetX;
				break;
			case "bm":
				if(!coords.fixedPos)
					coords.fixedPos = dojo.position(dojo.query(".tl", updateNode)[0]);
				boxHeight = coords.h + offsetY;
				break;
			case "br":
				if(!coords.fixedPos)
					coords.fixedPos = dojo.position(dojo.query(".tl", updateNode)[0]);
				boxWidth = coords.w + offsetX;
				boxHeight = coords.h + offsetY;
				break;
			case "large":
				if(!coords.fixedPos)
				{
					coords.fixedPos = {};
					coords.fixedPos.x = coords.l + coords.w/2, coords.fixedPos.y = coords.t + coords.h/2; 					
				}
				boxWidth = coords.w * 1.1;
				boxHeight = coords.h * 1.1;
				break;
			case "small":
				if(!coords.fixedPos)
				{
					coords.fixedPos = {};
					coords.fixedPos.x = coords.l + coords.w/2, coords.fixedPos.y = coords.t + coords.h/2;
				}
				boxWidth = coords.w / 1.1;
				boxHeight = coords.h / 1.1;
				break;
		}
			
		var sizeLimit = 20;
		if(boxWidth < sizeLimit)
			boxWidth = sizeLimit;
		if(boxHeight < sizeLimit)
			boxHeight = sizeLimit;
		
		if(ratio)
		{
			var temp = boxHeight*ratio;
			if(temp > boxWidth)
				boxWidth = temp;
			temp = boxWidth/ratio;
			if(temp > boxHeight)
				boxHeight = temp;
		}

		var helper = pres.utils.helper;
		dojo.style(updateNode, {
			'width': helper.pxToPercent(boxWidth, refNode, true) + "%",
			'height': helper.pxToPercent(boxHeight, refNode, false) + "%"
		});
		
		if (hdlName != 'large' && (this.element.family == "text" || this.element.family == "table"))
		{
			var dataW = this.contentBoxDataNode.children[0].children[0].offsetWidth;
			if(dataW > boxWidth)
			{
				if(ratio)
					dojo.style(updateNode, {
						'width': helper.pxToPercent(dataW, refNode, true) + "%",
						'height': helper.pxToPercent(dataW/ratio, refNode, false) + "%"
					});
				else
					dojo.style(updateNode, {
						'width': helper.pxToPercent(dataW, refNode, true) + "%"
					});
			}
			
			//var dataH = this.getDataTotalHeight();
			var dataH = this.contentBoxDataNode.children[0].children[0].offsetHeight;
			if(dataH > dojo.coords(updateNode).h)
			{
				if(ratio)
					dojo.style(updateNode, {
						'width': helper.pxToPercent(dataH*ratio, refNode, true) + "%",
						'height': helper.pxToPercent(dataH, refNode, false) + "%"
					});
				else
					dojo.style(updateNode, {
						'height': helper.pxToPercent(dataH, refNode, false) + "%"
					});			
			}
		}
		
		var fixX = 0, fixY = 0;
		if(isShape)
		{
			switch(hdlName)
			{
				case "tl":
					fixX = coords.w + coords.l - boxWidth;
					fixY = coords.h + coords.t - boxHeight;
					break;
				case "tm":
				case "tr":
					fixX = coords.l;
					fixY = coords.h + coords.t - boxHeight;
					break;
				case "ml":
				case "bl":
					fixX = coords.w + coords.l - boxWidth;
					fixY = coords.t;
					break;
				case "mr":
				case "bm":
				case "br":
					fixX = coords.l;
					fixY = coords.t;
					break;
				//will fix in updateShapeSize
				case "large":
				case "small":
					fixX = 0;
					fixY = 0;
					break;
			}
		}
		else
		{
			switch(hdlName)
			{
				case "tl":
					var tmpPos = dojo.position(dojo.query(".br", updateNode)[0]);
					break;
				case "tm":
				case "tr":
					var tmpPos = dojo.position(dojo.query(".bl", updateNode)[0]);
					break;
				case "ml":
				case "bl":
					var tmpPos = dojo.position(dojo.query(".tr", updateNode)[0]);
					break;
				case "mr":
				case "bm":
				case "br":
					var tmpPos = dojo.position(dojo.query(".tl", updateNode)[0]);
					break;
				case "large":
				case "small":
					var tempCoords = dojo.coords(updateNode);
					var tmpPos = {};
					tmpPos.x = tempCoords.l + tempCoords.w/2, tmpPos.y = tempCoords.t + tempCoords.h/2;
					break;
			}
			var tempCoords = dojo.coords(updateNode);
			fixX = tempCoords.l - tmpPos.x + coords.fixedPos.x;
			fixY = tempCoords.t - tmpPos.y + coords.fixedPos.y;
		}
		
		var tempCoords = dojo.coords(updateNode);		
		dojo.style(updateNode, {
			'left': helper.pxToPercent(fixX, refNode, true) + "%",
			'top': helper.pxToPercent(fixY, refNode, false) + "%"
		});
		
		if (this.element.family == "table")
		{
			this.rebuildRowColResizer()
		}
		
		PresCKUtil.updateRelativeValue(this.mainNode, [PresConstants.ABS_STYLES.TEXTINDENT, PresConstants.ABS_STYLES.MARGINLEFT]);
	},
	
	rotateMe: function(deg, isStep)
	{
		var resultDeg = "";
		var isNormalShape = pres.utils.shapeUtil.isNormalShape(this.element);
		var updateNode = isNormalShape ? dojo.query('.resize-wrapper', this.domNode)[0] : this.mainNode;
				
		var t = this.domNode.style.transform||this.domNode.style.webkitTransform||this.domNode.style.ieTransform;			
			
		var xScale = 1, yScale = 1, bVerse = 1, transScaleStr = "", currentdeg=0;
		if(t)
		{
			if(t.indexOf("scaleX(-1)") >= 0)
			{
				xScale = -1;
			}
			if(t.indexOf("scaleY(-1)") >= 0)
			{
				yScale = -1;
			}
			
			t = t.replace(/ /g, ""); 
			var scaleResult1 = /scale\((-?1),(-?1)\)/.exec(t);
			var scaleResult2 = /scale\((-?1)\)/.exec(t);
			if(scaleResult1)
			{
				xScale = parseInt(scaleResult1[1]);
				yScale = parseInt(scaleResult1[2]);				
			}
			else if(scaleResult2)
			{
				xScale = parseInt(scaleResult2[1]);
				yScale = parseInt(scaleResult2[1]);				
			}
			
			if(!(xScale == 1 && yScale ==1))
				transScaleStr = "scale(" + xScale + "," + yScale + ")";

			bVerse = xScale * yScale;
		}
			
		var transStr = "";
		if (isNormalShape)
		{
			var olddeg = this.element.svg.frm.rot || 0;
			olddeg = Math.round(olddeg);
			
			if(isStep)
				deg = Math.round((olddeg+deg)/15)*15-olddeg;
			else
				deg = Math.round(olddeg+deg)-olddeg;
			
			transStr = "rotate("+(deg*bVerse)+"deg)";
			resultDeg = olddeg+deg;
		}
		else
		{
			var t = pres.utils.htmlHelper.extractStyle(this.element.attrs.style)["transform"] || "";
			var degResult = /rotate\((-?[\d\.]+)deg\)/.exec(t);
			if(degResult)
				currentdeg = parseFloat(degResult[1]);	
			
			deg = ((deg+currentdeg)%360);
			if(isStep)
				deg = Math.round(deg/15)*15;
			else
				deg = Math.round(deg);
			
			if(deg)
				transStr = "rotate("+deg+"deg)" + transScaleStr;
			else
				transStr = transScaleStr;
			resultDeg = deg;
		}
		
		dojo.style(updateNode, 'transform', transStr);
		dojo.style(updateNode, '-webkit-transform', transStr);
		dojo.style(updateNode, '-ms-transform', transStr);
		dojo.style(updateNode, '-moz-transform', transStr);
		
		return resultDeg;
	}

});