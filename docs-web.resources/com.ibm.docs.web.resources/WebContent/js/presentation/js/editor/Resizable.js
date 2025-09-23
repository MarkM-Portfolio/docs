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

dojo.provide("pres.editor.Resizable");
dojo.require("concord.pres.PresConstants");
dojo.declare("pres.editor.Resizable", null, {

	resizeAttached: false,

	rebuildRowColResizer: function()
	{
		var node = dojo.query(".resize-wrapper", this.domNode)[0];
		if (node)
		{
			dojo.query(".rowColResizer", node).forEach(dojo.destroy);
			if (this._rowColResizerEvents)
				dojo.forEach(this._rowColResizerEvents, dojo.disconnect);
			this._rowColResizerEvents = [];
			this.buildRowColResizer(node);
		}
	},
	
	removeResizeable: function(node)
	{
		dojo.query(".rowColResizer", node).forEach(dojo.destroy);
		if (this._rowColResizerEvents)
			dojo.forEach(this._rowColResizerEvents, dojo.disconnect);
		this._rowColResizerEvents = [];
		dojo.forEach(dojo.query(".resize-wrapper", node), dojo.destroy);
		this.resizeAttached = false;
	},
	
	isEnableRotate: function()
	{
		if(DOC_SCENE.extension !== "pptx" || (DOC_SCENE.extension == "pptx" && DOC_SCENE.isOdfDraft))
			return false;
		
		if((this.element.family == "group" && pres.utils.shapeUtil.isNormalShape(this.element)) ||
				(this.element.family == "group" && !this.element.svg) ||
				this.element.family == "graphic" ||
				this.element.family == "text")
			return true;

		return false;
	},

	onMouseMoveResizer: function(e){
		dojo.stopEvent(e);

		if (!this.resizeStart || !this.resizer)
			return;

		var resizer = this.resizer;

		var shift = this.resizeStartCol ? e.clientX - this.startX : e.clientY - this.startY;

		if (Math.abs(shift) < 3)
			return false;

		if (this.resizeStartCol && e.clientX > this.boundaries.minX && e.clientX < this.boundaries.maxX)
		{
			dojo.style(resizer, "left", this.startLeft + shift + "px");
			
			var targetIndex = dojo.attr(resizer, "index");
			var line = dojo.query(".col-resizer-line-" + targetIndex, this.domNode)[0];
			
			dojo.style(line, "left", this.startLeftLine + shift + "px");
		}

		else if (this.resizeStartRow && e.clientY > this.boundaries.minY)
		{
			dojo.style(resizer, "top", this.startTop + shift + "px");
			
			var targetIndex = dojo.attr(resizer, "index");
			var line = dojo.query(".row-resizer-line-" + targetIndex, this.domNode)[0];
			
			dojo.style(line, "top", this.startTopLine + shift + "px");
		}
	},

	onMouseUpResizer: function(e){
		dojo.stopEvent(e);
		if (!this.resizeStart || !this.resizer)
			return;

		var resizer = this.resizer;
		var index = parseInt(resizer.getAttribute("index"));

		this.endTop = parseFloat(dojo.style(resizer, "top"));
		this.endLeft = parseFloat(dojo.style(resizer, "left"));
		
		var forRow =  this.resizeStartRow;
		var shift = forRow ? this.endTop - this.startTop : this.endLeft - this.startLeft;
		this.resizeStart = this.resizeStartRow = this.resizeStartCol = false;

		if (Math.abs(shift) < 3)
		{
			this.rebuildRowColResizer();
			return false;
		}

		var cm = pres.utils.helper.px2cm(shift);

		if (forRow)
		{
			var currentRow = dojo.query("tr", this.domNode)[index];
			if (currentRow)
				dojo.publish("/table/to/resize/row", [currentRow.id, cm]);
		}
		else
		{
			dojo.publish("/table/to/resize/col", [index, cm]);
		}
	},

	onMouseDownRowResizer: function(e){
		dojo.stopEvent(e);

		this.resizeStart = true;
		this.resizeStartRow = true;
		this.startY = e.clientY;

		var target = e.target;
		var rowIndex = parseInt(target.getAttribute("index"));
		var currentRow = dojo.query("tr", this.domNode)[rowIndex];
		this.resizer = target;
		this.startTop = parseFloat(dojo.style(target, "top"));
		
		var targetIndex = dojo.attr(target, "index");
		var line = dojo.query(".row-resizer-line-" + targetIndex, this.domNode)[0];
		
		this.startTopLine = parseFloat(dojo.style(line, "top")) || 0;

		var height = currentRow.style.height;
		currentRow.style.height = "1px";

		var tr = dojo.create("tr", {
			style: {
				height: "100%"
			}
		}, currentRow.parentNode);

		var h = currentRow.offsetHeight;
		currentRow.style.height = height;
		dojo.destroy(tr);

		var pos = dojo.coords(currentRow);

		this.boundaries.minY = pos.y + h;
	},

	onMouseDownColResizer: function(e){
		dojo.stopEvent(e);
		this.resizeStart = true;
		this.resizeStartCol = true;
		this.startX = e.clientX;

		var target = e.target;
		this.resizer = target;
		var cellIndex = parseInt(target.getAttribute("index"));
		var tableNode = dojo.query("table", this.domNode)[0];
		var total = 0, widths = pres.utils.helper.getColWidthsFromDOM(tableNode);

		for ( var i = 0; i < cellIndex; i++)
		{
			total += widths[i];
		}

		var tblPos = dojo.coords(tableNode.parentNode);
		var offset = 14;

		this.boundaries.minX = tblPos.x + total + offset + 8;
		this.boundaries.maxX = this.boundaries.minX + widths[cellIndex + 1] + widths[cellIndex] - offset * 2 - 4;

		
		var targetIndex = dojo.attr(target, "index");
		var line = dojo.query(".col-resizer-line-" + targetIndex, this.domNode)[0];
		
		this.startLeft = parseFloat(dojo.style(target, "left")) || 0;
		this.startLeftLine = parseFloat(dojo.style(line, "left")) || 0;
	},

	buildRowColResizer: function(node)
	{
		if (!pe.scene.isMobileBrowser())
			return;

		if (!this.boundaries)
			this.boundaries = {
				minX: -1,
				maxX: -1,
				minY: -1,
				maxY: -1
			};
		dojo.query(".rowColResizer", node).forEach(dojo.destroy);
		dojo.forEach(this._rowColResizerEvents, dojo.disconnect);

		this._rowColResizerEvents = [];

		var tableNode = dojo.query("table", this.domNode)[0];
		var widths = pres.utils.helper.getColWidthsFromDOM(tableNode);
		var heights = dojo.map(dojo.query("tr", tableNode), function(tr){
			return tr.offsetHeight;
		});

		var accumulatedW = 0;
		var accumulatedH = 0;

		this._rowColResizerEvents.push(dojo.connect(document.body, "ontouchmove", this, this.onMouseMoveResizer));
		this._rowColResizerEvents.push(dojo.connect(document.body, "ontouchend", this, this.onMouseUpResizer));

		var me = this;
		dojo.forEach(widths, function(w, index){
			if (index == widths.length -1)
				return;
			var x = accumulatedW + w;
			accumulatedW += w;
			var dot = dojo.create("div", {
				tabIndex: -1,
				style: {
					top: "-50px"
				},
				className: 'rh resize-handler resize-handler-rh rowColResizer col-resizer col-resizer-dot-' + index,
			}, node);
			dot.setAttribute("index", index);
			dot.style.cursor = "col-resize"
			dot.style.left = x + "px";

			me._rowColResizerEvents.push(dojo.connect(dot, "ontouchstart", me, me.onMouseDownColResizer));

			var line = dojo.create("div", {
				tabIndex: -1,
				style: {
					position: "absolute",
					background: "gray",
					top: "-48px",
					left: x + "px",
					width: "1px",
					height: "48px"
				},
				className: 'resize-box-out-rot-connector rowColResizer col-resizer-line-' + index,
			}, node);
		});

		dojo.forEach(heights, function(h, index){
			if (index == heights.length -1)
				return;
			var y = accumulatedH + h;
			accumulatedH += h;

			var dot = dojo.create("div", {
				tabIndex: -1,
				className: 'rh resize-handler resize-handler-rh rowColResizer row-resizer row-resizer-dot-' + index,
			}, node);
			dot.setAttribute("index", index);
			dot.style.cursor = "row-resize"
			dot.style.top = y - 8 + "px"
			dot.style.left = "-52px"
			me._rowColResizerEvents.push(dojo.connect(dot, "ontouchstart", me, me.onMouseDownRowResizer));
			var line = dojo.create("div", {
				tabIndex: -1,
				className: 'resize-box-out-rot-connector rowColResizer row-resizer row-resizer-line-' + index,
				style: {
					position: "absolute",
					background: "gray",
					left: "-48px",
					top: y + "px",
					width: "48px",
					height: "1px"
				},
			}, node);
		});
	},

	makeResizeable: function(node)
	{
		if (pe.scene.isMobile)
			return;
		// console.log("contentBox:makeResizeable","Entry");
		// Show border and handles on click

		// Let's add resizeable squares Total 8

		var twrapper = document.createElement('div');
		twrapper.tabIndex = -1;
		twrapper.contentEditable = false;
		dojo.addClass(twrapper, 'resize-wrapper');
		node.appendChild(twrapper);
		var boxNode = node;

		this.resizeWrapper = twrapper;
		this.setWrapperRotateClass();
		var node = twrapper;

		if (this.element.svg && pres.utils.shapeUtil.isConnectorShape(this.element))
		{
			var startClass, endClass, startStyle, endStyle;
			// px = pt*4/3
			var cssOffset = -4;
			var ptToEMU = pres.constants.PT_TO_EMU_FACTOR;
			var gap = this.element.svg.gap;
			switch (this.element.svg.dir)
			{
				case 0:
				case 4:
					startClass = 'resize-handler-w';
					endClass = 'resize-handler-e';
					break;
				case 1:
				case 3:
				case 5:
				case 7:
					startClass = 'resize-handler-nw';
					endClass = 'resize-handler-se';
					break;
				case 2:
				case 6:
					startClass = 'resize-handler-n';
					endClass = 'resize-handler-s';
					break;
				default:
					break;
			}

			// Frame pos
			var frm = this.element.svg.frm;
			var divWidth = frm.w + gap.l + gap.r;
			var divHeight = frm.h + gap.t + gap.b;
			dojo.style(node, {
				position: 'absolute',
				left: (gap.l * 100 / divWidth).toFixed(2) + '%',
				top: (gap.t * 100 / divHeight).toFixed(2) + '%',
				width: (frm.w * 100 / divWidth).toFixed(2) + '%',
				height: (frm.h * 100 / divHeight).toFixed(2) + '%'
			});

			// start handler refers to frame other than outer div
			// Or the not moved handler will be moved a little when line shape resize
			var start = document.createElement('div');
			start.id = 'start_' + this.id;
			start.tabIndex = -1;
			dojo.addClass(start, 'start resize-handler ' + startClass);
			node.appendChild(start);

			// end handler refers to frame other than outer div
			var end = document.createElement('div');
			end.id = 'end_' + this.id;
			end.tabIndex = -1;
			dojo.addClass(end, 'end resize-handler ' + endClass);
			node.appendChild(end);
		}
		else
		{
			// Frame pos
			if (this.element.svg && pres.utils.shapeUtil.isNormalShape(this.element))
			{
				var frm = this.element.svg.frm;
				var gap = this.element.svg.gap;
				var divWidth = frm.w + gap.l + gap.r;
				var divHeight = frm.h + gap.t + gap.b;
				dojo.style(node, {
					position: 'absolute',
					left: (gap.l * 100 / divWidth).toFixed(2) + '%',
					top: (gap.t * 100 / divHeight).toFixed(2) + '%',
					width: (frm.w * 100 / divWidth).toFixed(2) + '%',
					height: (frm.h * 100 / divHeight).toFixed(2) + '%'
				});
			}

			var borderTop = dojo.style(boxNode, "borderTopWidth") || 0;

			var borderBottom = borderTop;
			var borderLeft = borderTop;
			var borderRight = borderTop;

			/*
			 * for simplicity, we assume the border is the same var borderBottom = dojo.style(boxNode, "borderBottomWidth"); var borderLeft = dojo.style(boxNode, "borderLeftWidth"); var borderRight = dojo.style(boxNode, "borderRightWidth");
			 */

			//rotate handler
			if(this.isEnableRotate())
			{
				var rh = document.createElement('div');
				rh.id = 'rh_' + this.id;
				rh.tabIndex = -1;
				dojo.addClass(rh, 'rh resize-handler resize-handler-rh');
				node.appendChild(rh);
				if (borderTop)
				{
					rh.style.top = (0 - 14 - borderTop / 2) + "px";
				}
				
				var conn = document.createElement('div');
				dojo.addClass(conn, 'resize-box-out-rot-connector');
				conn.tabIndex = -1;
				node.appendChild(conn);
				
				var cursorURL = contextPath + window.staticRootPath + "/styles/css/presentation2/images/rotate-cursor.cur";
				rh.style.cursor = "url(" + cursorURL + "), pointer"
			}

			if (this.element.family == "table")
				this.buildRowColResizer(node)
			
			
			var hasBigBorder = borderTop > 8 || borderBottom > 8 || borderLeft > 8 || borderRight > 8;
			var hasBorder = borderTop || borderBottom || borderLeft || borderRight;
			this.hasBorder = hasBorder;
			var boxOut = document.createElement('div');
			boxOut.tabIndex = -1;
			dojo.addClass(boxOut, 'resize-box-out-top');
			if (hasBigBorder)
			{
				var top = (0 - (borderTop || 8)) + "px";
				var height = (borderTop || 8) + "px";
				dojo.style(boxOut, {
					top: top,
					height: height
				});
			}
			if (!hasBorder)
			{
				var topBorder = dojo.create('div', {
					className: 'resize-box-out-top-border resize-box-out-border'
				}, boxOut);
				node.appendChild(boxOut);
			}

			var boxOut = document.createElement('div');
			boxOut.tabIndex = -1;
			dojo.addClass(boxOut, 'resize-box-out-bottom');
			node.appendChild(boxOut);
			if (hasBigBorder)
			{
				var bottom = (0 - (borderBottom || 8)) + "px";
				var height = (borderBottom || 8) + "px";
				dojo.style(boxOut, {
					bottom: bottom,
					height: height
				});
			}
			if (!hasBorder)
			{
				var bottomBorder = dojo.create('div', {
					className: 'resize-box-out-bottom-border resize-box-out-border'
				}, boxOut);
			}
			var boxOut = document.createElement('div');
			boxOut.tabIndex = -1;
			dojo.addClass(boxOut, 'resize-box-out-left');
			node.appendChild(boxOut);
			if (hasBigBorder)
			{
				var left = (0 - (borderLeft || 8)) + "px";
				var width = (borderLeft || 8) + "px";
				dojo.style(boxOut, {
					left: left,
					width: width
				});
			}
			if (!hasBorder)
			{
				var leftBorder = dojo.create('div', {
					className: 'resize-box-out-left-border resize-box-out-border'
				}, boxOut);
			}
			var boxOut = document.createElement('div');
			boxOut.tabIndex = -1;
			dojo.addClass(boxOut, 'resize-box-out-right');
			node.appendChild(boxOut);
			if (hasBigBorder)
			{
				var right = (0 - (borderRight || 8)) + "px";
				var width = (borderRight || 8) + "px";
				dojo.style(boxOut, {
					right: right,
					width: width
				});
			}
			if (!hasBorder)
			{
				var rightBorder = dojo.create('div', {
					className: 'resize-box-out-right-border resize-box-out-border'
				}, boxOut);
			}
			// Top Left corner
			var tl = document.createElement('div');
			tl.id = 'tl_' + this.id;
			tl.tabIndex = -1;
			dojo.addClass(tl, 'tl resize-handler resize-handler-nw');
			node.appendChild(tl);
			if (borderTop)
			{
				tl.style.top = (0 - 4 - borderTop / 2) + "px";
			}
			if (borderLeft)
			{
				tl.style.left = (0 - 4 - borderLeft / 2) + "px";
			}

			// Top Right corner
			var tr = document.createElement('div');
			tr.id = 'tr_' + this.id;
			tr.tabIndex = -1;
			dojo.addClass(tr, 'tr resize-handler resize-handler-ne');
			node.appendChild(tr);
			if (borderTop)
			{
				tr.style.top = (0 - 4 - borderTop / 2) + "px";
			}
			if (borderRight)
			{
				tr.style.right = (0 - 4 - borderRight / 2) + "px";
			}

			// Top middle
			var tm = document.createElement('div');
			tm.id = 'tm_' + this.id;
			tm.tabIndex = -1;
			dojo.addClass(tm, 'tm resize-handler resize-handler-n');
			node.appendChild(tm);
			if (borderTop)
			{
				tm.style.top = (0 - 4 - borderTop / 2) + "px";
			}

			// Middle Left
			var ml = document.createElement('div');
			ml.id = 'ml_' + this.id;
			ml.tabIndex = -1;
			dojo.addClass(ml, 'ml resize-handler resize-handler-w');
			node.appendChild(ml);
			if (borderLeft)
			{
				ml.style.left = (0 - 4 - borderLeft / 2) + "px";
			}

			// Middle Right
			var mr = document.createElement('div');
			mr.id = 'mr_' + this.id;
			mr.tabIndex = -1;
			dojo.addClass(mr, 'mr resize-handler resize-handler-e');
			node.appendChild(mr);
			if (borderRight)
			{
				mr.style.right = (0 - 4 - borderRight / 2) + "px";
			}

			// Bottom Left corner
			var bl = document.createElement('div');
			bl.id = 'bl_' + this.id;
			bl.tabIndex = -1;
			dojo.addClass(bl, 'bl resize-handler resize-handler-sw');
			node.appendChild(bl);
			if (borderBottom)
			{
				bl.style.bottom = (0 - 4 - borderBottom / 2) + "px";
			}
			if (borderLeft)
			{
				bl.style.left = (0 - 4 - borderLeft / 2) + "px";
			}

			// Bottom Right corner
			var br = document.createElement('div');
			br.id = 'br_' + this.id;
			br.tabIndex = -1;
			dojo.addClass(br, 'br resize-handler resize-handler-se');
			node.appendChild(br);
			if (borderBottom)
			{
				br.style.bottom = (0 - 4 - borderBottom / 2) + "px";
			}
			if (borderRight)
			{
				br.style.right = (0 - 4 - borderRight / 2) + "px";
			}

			// Bottom middle
			var bm = document.createElement('div');
			bm.id = 'bm_' + this.id;
			bm.tabIndex = -1;
			dojo.addClass(bm, 'bm resize-handler resize-handler-s');
			node.appendChild(bm);
			if (borderBottom)
			{
				bm.style.bottom = (0 - 4 - borderBottom / 2) + "px";
			}
		}

		if (this.element.svg && parseFloat(this.element.svg.shapeVersion) > 1.5 && pres.utils.shapeUtil.isNormalShape(this.element))
		{
			this._drawAdjustHandler(this.element, node);
		}
		
		var resizeContent = false;

		var handles = dojo.query('*', node);
		for ( var i = 0; i < handles.length; i++)
		{
			var handle = handles[i];
			this.connect(handle, "ondragstart", function(e)
			{
				dojo.stopEvent(e);
			});
		}
		this.hideHandles();
		
		this.connect(node, "onmouseout", function(event)
				{
					var target = event.target;
			        if (target == null) 
			        	target = event.srcElement; 
			        
			        var widget = dijit.getEnclosingWidget(dojo.byId(target.id));
			        //if(widget && widget.resizeWrapper)
			        //	console.log(target)
				});
	},

	showHandles: function()
	{
		if (pe.scene.isMobile)
			return;

		var node = this.domNode;
		var resizeWrappList = dojo.query('.resize-wrapper', node);
		if (!this.resizeAttached || resizeWrappList.length == 0)
			this.makeResizeable(node);
		this.resizeAttached = true;
		dojo.addClass(node, "boxSelected");
		dojo.removeClass(this.domNode, "boxPreSelected");
		// Add a specific class for connector shape
		// to avoid show blue border
		if (pres.utils.shapeUtil.isShape(this.element))
		{
			dojo.addClass(node, "shapeSelected");

			if (pres.utils.shapeUtil.isNormalShape(this.element))
				dojo.addClass(dojo.query('.resize-wrapper', node)[0], "normalShapeSelected");
		}
	},
	
	_drawAdjustHandler: function()
	{
		var poses = this.element.getAhHandlersPos();
		if(!poses)
			return;
		
		var node = 	this.resizeWrapper;
		if(!node)
			return;
		
		for(var i=0; i<poses.length; i++)
		{
			var h = document.createElement('div');
			h.id = 'ah-' + i + "_" + this.id;
			h.tabIndex = -1;
			dojo.addClass(h, 'ah resize-handler resize-handler-ah');
			node.appendChild(h);

			h.style.left = poses[i].x;
			h.style.top = poses[i].y;
			
			var cursorURL = contextPath + window.staticRootPath + "/styles/css/presentation2/images/ah-cursor.cur";
			h.style.cursor = "url(" + cursorURL + "), pointer";
		}
	},
	
	/**
	 * If parameter index is set, then only update the specificed adj handler position
	 * if not, update all adj handler position
	 */
	updateAdjustHandlerPos: function(index)
	{
		var poses = this.element.getAhHandlersPos();
		if(!poses)
			return;
		
		var wrapper = this.resizeWrapper;
		if(!wrapper)
			return;
	
		if(index)
		{
			var id = 'ah-' + index + "_" + this.id;
			var h = dojo.byId(id);
			if(h)
			{
				h.style.left = poses[index].x;
				h.style.top = poses[index].y;				
			}			
		}
		else
		{
			for(var i=0; i<poses.length; i++)
			{
				var id = 'ah-' + i + "_" + this.id;
				var h = dojo.byId(id);
				if(h)
				{
					h.style.left = poses[i].x;
					h.style.top = poses[i].y;					
				}
			}
		}
	},

	hideHandles: function()
	{
		if (pe.scene.isMobile)
			return;
		dojo.removeClass(this.domNode, "boxSelected");
		dojo.removeClass(this.domNode, "boxPreSelected");
		if (pres.utils.shapeUtil.isShape(this.element))
		{
			dojo.removeClass(this.domNode, "shapeSelected");

			if (pres.utils.shapeUtil.isNormalShape(this.element))
			{
				var wrapperNode = dojo.query('.resize-wrapper', this.domNode);
				if (wrapperNode.length == 1)
					dojo.removeClass(wrapperNode[0], "normalShapeSelected");
			}
		}

	},
	
	setWrapperRotateClass: function()
	{
		var wrapper = this.resizeWrapper;
		if(!wrapper)
			return;
		var trans = pres.utils.shapeUtil.parseTransformStyle(this.domNode.style.transform||this.domNode.style.webkitTransform||this.domNode.style.ieTransform);
		var pos = Math.round(trans.rot/45);
		var dirMap = ['dn', 'dne', 'de', 'dse', 'ds', 'dsw', 'dw', 'dnw', 'dn'];
		
		dojo.removeClass(wrapper, ['dn', 'dne', 'de', 'dse', 'ds', 'dsw', 'dw', 'dnw']);
		dojo.addClass(wrapper, dirMap[pos]);
		
		if(trans.scaleX == -1)
			dojo.addClass(wrapper, "flipx");
		else
			dojo.removeClass(wrapper, "flipx");
		
		if(trans.scaleY == -1)
			dojo.addClass(wrapper, "flipy");
		else
			dojo.removeClass(wrapper, "flipy");
	}

});