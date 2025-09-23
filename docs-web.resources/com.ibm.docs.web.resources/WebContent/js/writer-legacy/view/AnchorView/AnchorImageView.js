dojo.provide("writer.view.AnchorView.AnchorImageView");
dojo.require("writer.view.Run");
dojo.require("writer.view.selection.AnchorImgResizerView");
/**
 * Abstract view, used by squareImageView, TBImageView or FloatImageView
 */
dojo.declare("writer.view.AnchorView.AnchorImageView",[writer.view.ImageView],
{
	className: "AnchorImageView",
	getViewType : function() {
		return "text."+this.className;
	},
	isAnchor:true,
	_MIN_SPACE_MARGIN: 10,
	// the anchor view can be selected by cursor moved, 
	canSelected:function(){
		 return true;  
	 },
	constructor: function(model,ownerId, start,len) {
		this.marginLeft = 0;
		this.marginTop = 0;
		this.marginRight = 0;
		this.marginBottom = 0;

		this._maskLeft = 0;
		this._maskRight = 0;
		this._maskTop = 0;
		this._maskBottom = 0;

		this.distant = {
				left:0,
				right: 0,
				top:0,
				bottom:0
		};
		
		// create resizer view
		this._createResizer();
	},

	_createResizer: function()
	{
		this._resizerView = new writer.view.selection.AnchorImgResizerView(this);
	},
	
	// update after resize
	_resizeUpdate: function(){
		// release body space
		this.model.broadcast("releaseBodySpace");

		// update
		this.model.markDirty();
		var paragraph = writer.util.ModelTools.getParagraph(this.model);
		if (paragraph)
		{
			paragraph.markReset();
			paragraph.parent.update();
		}
//		pe.lotusEditor.layoutEngine.rootView.update();
	},

	getWholeWidth: function()
	{
		return this.iw + this.padLeft + this.padRight;
	},

	getWholeHeight: function()
	{
		return this.ih + this.padTop + this.padBottom;
	},
	
	getWidth: function() {
		return 0;
	},

	ifPointMe: function(x, y)
	{
		ret = x >= this.marginLeft && x <= this.marginLeft + this.getWholeWidth()
			&& y >= this.marginTop && y <= this.marginTop + this.getWholeHeight()

		return ret;
	},

	isBehindDoc: function()
	{
		return this.model.behindDoc && this.model.behindDoc != "0";
	},

	getRelativeHeight: function()
	{
		return this.model.relativeHeight;
	},

	//! set zIndex only for render
	setZIndex: function(z)
	{
		this.zIndex = z;
	},

	getZIndex: function()
	{
		return this.zIndex;
	},

	layout:function(line){
		delete this._relayout;
		if(this._layouted){
			return;
		}
		
		var vTools = writer.util.ViewTools;
		var getPxValue = common.tools.toPxValue;

		var p = vTools.getParagraph(line);
		var textContent = vTools.getTextContent(line);
		var isInHeaderFooter = textContent.isHeader || textContent.isFooter;
		var body = !isInHeaderFooter ? vTools.getBody(textContent) : textContent;
		this.bodyW = textContent.getWidth();
		
		var distant = this.model.distant;
		if (distant){
			this.distant.left = getPxValue(distant.left || "0emu");
			this.distant.right = getPxValue(distant.right || "0emu");
			this.distant.top = getPxValue(distant.top || "0emu");
			this.distant.bottom = getPxValue(distant.bottom || "0emu");
		}

		this._calculateSize(line);
		this._updatePositionH(line);
		this._updatePositionV(line);
		
		var effectExtent = this.model.effectExtent;
		this.padLeft = getPxValue(effectExtent.left);
		this.padTop = getPxValue(effectExtent.top);
		this.padRight = getPxValue(effectExtent.right);
		this.padBottom = getPxValue(effectExtent.bottom);
		
		this.borderWidth = this.model.border ? getPxValue(this.model.border.width) : 0;
		
		// release space of textContent
		if (this.ownedSpace)
			textContent.releaseSpace(this.ownedSpace);
		else
			textContent.releaseSpaceByModelId(this.model.id);

		// release last & next area textContent space of this model
		var bodyParent = textContent.getParent();	// When the textContent is header/footer. bodyParent is null
		if (bodyParent && vTools.isBody(bodyParent))
		{
			var page = vTools.getPage(textContent);
			if (page)
			{
				var doc = page.getParent();
				var lastPage = doc.getContainer().prev(page);
				var nextPage = doc.getContainer().next(page);
				lastPage && lastPage.getLastBody().textArea.releaseSpaceByModelId(this.model.id);
				nextPage && nextPage.getFirstBody().textArea.releaseSpaceByModelId(this.model.id);
			}
		}

		
		var viewType = this.getViewType();
		if (viewType == "text.AnchorImageView" || viewType == "text.SquareImage" || viewType == "text.TBImage") {
			this.ownedSpace = this.calcuSpace(line, p, textContent);
			if (this.ifCanOccupy(line))
				textContent.occupy(this.ownedSpace);
		}
		else if (vTools.isImage(this))
		{
			this.ownedSpace = this.calcuSpace(line, p, textContent);
			if (this.ifCanOccupy(line, true))
				textContent.occupy(this.ownedSpace, true);
		}
	},
	_getPrevNeighbourRun: function(crossLine)
	{
		var vTools = writer.util.ViewTools;
		fitRun = this.previous(crossLine);
		while(fitRun)
		{
			if(!vTools.isAnchor(fitRun))
				return {"runView": fitRun, "index": fitRun.len};
			else 
				fitRun = fitRun.previous(crossLine);
		}

		return null;
	},

	_getNextNeighbourRun: function(crossLine)
	{
		var vTools = writer.util.ViewTools;
		var fitRun = this.next(crossLine);
		while(fitRun)
		{
			if(!vTools.isAnchor(fitRun))
				return {"runView": fitRun, "index": 0};
			else 
				fitRun = fitRun.next(crossLine);
		}
	},

	_getNeighbourRun: function()
	{
		return this._getNextNeighbourRun(false)
			|| this._getPrevNeighbourRun(false)
			|| this._getNextNeighbourRun(true)
			|| this._getPrevNeighbourRun(true);
	},
	getLeft: function(asRunInLine)
	{
		if (asRunInLine)
		{
			var ret = this._getNeighbourRun();
			if (ret)
			{
				if (ret.index == 0)
					return ret.runView.getLeft();
				else
					return ret.runView.getLeft() + ret.runView.getWidth();
			}
			else
			{
				// there only anchor in the paragraph
				return this.getParent().getContentLeft();
			}
		}
		else
		{
			//return this.inherited(arguments);
			return result = this.getParent().getContentLeft()+(this.marginLeft || 0);
		}
	},
	getTop: function(asRunInLine)
	{
		if (asRunInLine)
		{
			var ret = this._getNeighbourRun();
			if (ret)
				return ret.runView.getTop();
			else
				console.error("can not find neighbour run!");
		}
		else
		{
			//return this.inherited(arguments);
			return result = this.getParent().getContentTop()+(this.marginTop || 0);
		}
	},
	getChildPosition:function(idx, placeholderArg, bNeedLogicalPos, asRunInLine){
		if (asRunInLine)
		{
			var ret = this._getNeighbourRun();
			if (ret)
				return ret.runView.getChildPosition(ret.index);
		}
		else
		{
			return this.inherited(arguments);
		}
	},
	getBoxWidth:function(){
		// When the text box is the first run, click before the paragraph will move focus into the text box
		// Return -1 will avoid this happened.
		return -1;
	},
	getBoxHeight:function(){
		return 0;
	},
	getElementPath:function(x,y,lineHeight,path,options){
		path.push(this);
	},
	getMobileImageInfo: function(){
		var line = this.parent;
		var docLeft = pe.lotusEditor.layoutEngine.rootView.docLeft;
		var docTop = pe.lotusEditor.padding;
		var imageInfo = {};
		imageInfo.left = docLeft + line.getLeft() + this.marginLeft - this.padLeft;
		imageInfo.top = docTop + line.getTop() + this.marginTop - this.padTop;
		var viewSize = this._resizerView._getViewSize();
		imageInfo.width = viewSize.w;
		imageInfo.height = viewSize.h;
		
		return imageInfo;
	},
	inTextZone: function(x, y)
	{
		return false;
	},
	getOffsetToLeftEdge: function()
	{
		var line = this.parent;
		return line.getLeft() + this.marginLeft - this.padLeft;
	},
	getOffsetToBottomEdge: function()
	{
		var line = this.parent;
		var topToLine = this.marginTop-this.padTop;
		var heightWithBorder = this.ih + this.padTop + this.padBottom;
		var docView = layoutEngine.rootView;
		var docHeight = docView.getHeight();
		var bottomFromEdge = docHeight - (line.getTop() + topToLine + heightWithBorder);
		return bottomFromEdge;
	},
	_calculateSize: function(line)
	{
		var vTools = writer.util.ViewTools;
		var getPxValue = common.tools.toPxValue;

		this.iw = getPxValue(this.model.width) + getPxValue(this.model.extX_off);
		this.ih = getPxValue(this.model.height) + getPxValue(this.model.extY_off);
		this.w = 0;
		this.h = 0;

		// percentage horizonal size
		if (this.model.sizeRelH)
		{
			var pctWidth = this.model.sizeRelH.pctWidth && this.model.sizeRelH.pctWidth.ele_text;
			pctWidth = parseInt(pctWidth);
			if (pctWidth)
			{
				pctWidth = pctWidth / 100000;

				var page = vTools.getPage(line);
				var pageSize = page.section.pageSize;
				var pageMargin = page.section.pageMargin;

				var relFrom = this.model.sizeRelH.relativeFrom;
				if ("page" == relFrom)
				{
					this.iw = pageSize.w * pctWidth;
				}
				else if ("margin" == relFrom)
				{
					this.iw = (pageSize.w - pageMargin.left - pageMargin.right) * pctWidth;
				}
				else if ("leftMargin" == relFrom)
				{
					this.iw = pageMargin.left * pctWidth;
				}
				else if ("rightMargin" == relFrom)
				{
					this.iw = pageMargin.right * pctWidth;
				}
				else if ("insideMargin" == relFrom)
				{
					this.iw = pageMargin.left * pctWidth;
				}
				else if ("outsideMargin" == relFrom)
				{
					this.iw = pageMargin.right * pctWidth;
				}
			}
		}

		// percentage vertical size
		if (this.model.sizeRelV)
		{
			var pctHeight = this.model.sizeRelV.pctHeight && this.model.sizeRelV.pctHeight.ele_text;
			pctHeight = parseInt(pctHeight);
			if (pctHeight)
			{
				pctHeight = pctHeight / 100000;

				var page = vTools.getPage(line);
				var pageSize = page.section.pageSize;
				var pageMargin = page.section.pageMargin;

				var relFrom = this.model.sizeRelV.relativeFrom;
				if ("page" == relFrom)
				{
					this.ih = pageSize.h * pctHeight;
				}
				else if ("margin" == relFrom)
				{
					this.ih = (pageSize.h - pageMargin.top - pageMargin.bottom) * pctHeight;
				}
				else if ("topMargin" == relFrom)
				{
					this.ih = pageMargin.top * pctHeight;
				}
				else if ("bottomMargin" == relFrom)
				{
					this.ih = pageMargin.bottom * pctHeight;
				}
				else if ("insideMargin" == relFrom)
				{
					this.ih = pageMargin.top * pctHeight;
				}
				else if ("outsideMargin" == relFrom)
				{
					this.ih = pageMargin.bottom * pctHeight;
				}
			}
		}
	},
	_calculateAbsolutePosH: function(line)
	{
		var vTools = writer.util.ViewTools;
		var p = vTools.getParagraph(line);
		var textContent = vTools.getTextContent(line);
		var isInHeaderFooter = textContent.isHeader || textContent.isFooter;
		var inCell = vTools.isCell(textContent);
		var table = inCell ? textContent.getTable() : null;
		var islayoutInCell = this.model.islayoutInCell();
		var cellLeftToTable = 0;
		if (inCell && !islayoutInCell)
		{
			cellLeftToTable = textContent.getLeft() - table.getLeft();
		}

		var body = !isInHeaderFooter ? vTools.getBody(textContent) : textContent;

		// get x offset
		var getPxValue = common.tools.toPxValue;
		var positionH = this.model.positionH;

		if (!positionH)
			return;

		var offX = positionH? positionH.posOffset: "0emu";
		offX =  getPxValue(offX) + getPxValue(this.model.offX_off);
		this.marginLeft = offX;

		if (positionH.relativeFrom == "column" || positionH.relativeFrom == "margin")
		{
			//relative is from column
			if (p && p.left){
				this.marginLeft = offX - p.left;
			}
		}
		else if (positionH.relativeFrom == "leftMargin")
		{
			if (body && body.left)
				this.marginLeft = offX - body.getLeft();
		}
		else if (positionH.relativeFrom == "rightMargin")
		{
			if (body)
				this.marginLeft = body.getWidth() + offX;
		}
		else if (positionH.relativeFrom == "page" ){
			if (body && body.left){
				this.marginLeft = offX - body.left;
			}
		}

		var boxWidth = this.getWholeWidth();

		var page = vTools.getPage(textContent);
		var bodyWidth = page.getBodyWidth();
		var pageWidth = page.getWidth();

		var totalWidth = boxWidth;
		if (positionH.relativeFrom == "column")
		{
			if (inCell && !islayoutInCell)
				totalWidth = (table && table.getWidth && table.getWidth()) || totalWidth;
			else
				totalWidth = (textContent.getWidth && textContent.getWidth())||totalWidth;
		}
		else if (positionH.relativeFrom == "margin")
		{
			totalWidth = bodyWidth;
		}
		else if (positionH.relativeFrom == "page" )
		{
			totalWidth = pageWidth;
		}
		
		switch(positionH.align)
		{
		case "center":
			this.marginLeft = Math.floor((totalWidth - boxWidth)/2) - cellLeftToTable;
			if (body && positionH.relativeFrom == "page")
				this.marginLeft = this.marginLeft - body.getLeft();
			break;
		case "left":
		case "inside":
			this.marginLeft = 0;
			if (body && positionH.relativeFrom == "page")
				this.marginLeft = this.marginLeft - body.getLeft();
			else if (body && positionH.relativeFrom == "rightMargin")
				this.marginLeft = bodyWidth;
			break;
		case "right":
		case "outside":
			this.marginLeft = totalWidth - boxWidth;
			if (body && positionH.relativeFrom == "page")
				this.marginLeft = this.marginLeft - body.getLeft();
			else if (body && positionH.relativeFrom == "leftMargin")
				this.marginLeft = 0 - boxWidth;
			break;
		}
	},

	_calculatePercentagePosH: function(pct, line)
	{
		var vTools = writer.util.ViewTools;
		var textContent = vTools.getTextContent(line);
		var isInHeaderFooter = textContent.isHeader || textContent.isFooter;
		var body = !isInHeaderFooter ? vTools.getBody(textContent) : textContent;

		var page = vTools.getPage(line);
		var pageSize = page.section.pageSize;
		var pageMargin = page.section.pageMargin;

		var relFrom = this.model.pctPositionH.relativeFrom;
		if ("page" == relFrom)
		{
			off = pageSize.w * pct;
			this.marginLeft = off - body.getLeft();
		}
		else if ("margin" == relFrom)
		{
			off = (pageSize.w - pageMargin.left - pageMargin.right) * pct;
			this.marginLeft = off;
		}
		else if ("leftMargin" == relFrom)
		{
			off = pageMargin.left * pct;
			this.marginLeft = off - body.getLeft();
		}
		else if ("rightMargin" == relFrom)
		{
			off = pageMargin.right * pct;
			this.marginLeft = body.getWidth() + off;
		}
		else if ("insideMargin" == relFrom)
		{
			off = pageMargin.left * pct;
			this.marginLeft = off - body.getLeft();
		}
		else if ("outsideMargin" == relFrom)
		{
			off = pageMargin.right * pct;
			this.marginLeft = body.getWidth() + off;
		}
	},

	_updatePositionH: function(line)
	{
		var vTools = writer.util.ViewTools;
		var p = vTools.getParagraph(line);
		var textContent = vTools.getTextContent(line);

		var pct = this.model.getPctPositionH();
		if (this.model.positionH)
			this._calculateAbsolutePosH(line);
		else
			this._calculatePercentagePosH(pct, line);

		// anchor in table, special case, the anchor should not move out of table cell.
		if (vTools.isCell(textContent) && vTools.isWrappingAnchor(this))
		{
			var boxWidth = this.getWholeWidth();
			var cellWidth = textContent.getBoxWidth();
			if (this.marginLeft < 0)
				this.marginLeft = 0;
			else if (this.marginLeft + boxWidth > cellWidth)
				this.marginLeft = cellWidth - boxWidth;
		}

		this._calMaskMarginH(line);

		// the position changed, update the dom.
		this.dirty = true;
		line.dirty = true;
		p.markDirtyDOM();
	},

	_calculateAbsolutePosV: function(line)
	{
		var vTools = writer.util.ViewTools;
		var p = vTools.getParagraph(line);
		var textContent = vTools.getTextContent(line);
		var isInHeaderFooter = textContent.isHeader || textContent.isFooter;
		var inCell = vTools.isCell(textContent);
		var table = inCell ? textContent.getTable() : null;
		var islayoutInCell = this.model.islayoutInCell();
		var isCell = inCell && islayoutInCell;
		var page = vTools.getPage(line);
		var body = !isInHeaderFooter ? vTools.getBody(textContent) : textContent;
		// each the main body or header or footer.

		var pageSize = page.section.pageSize;
		var pageMargin = page.section.pageMargin; 

		// get x offset
		var getPxValue = common.tools.toPxValue;
		var positionV = this.model.positionV;

		if (!positionV)
			return;

		var offY =  positionV? positionV.posOffset: "0emu";
		offY = getPxValue(offY) + getPxValue(this.model.offY_off);

		var header = page.getHeader();
		var footer = page.getFooter();

		var pTop = p && p.top ? p.top : 0;
		var top = offY - pTop;

		var rf = positionV.relativeFrom;
		var pa = positionV.align;
		var isSupported = rf && (rf == "page" || rf == "column" || rf == "margin" || rf == "topMargin" || rf == "bottomMargin");

		if (!isSupported)
			top = offY;

		this.marginTop = top;
		
		//if (this.model.isWaterMarker)
		//	this.marginTop = top = offY = 0;

		if (isSupported)
		{
			var boxHeight = this.getWholeHeight();
			var pageHeight = page.getHeight();
			var pm = pageMargin;
			var bodyHeight = (textContent.getHeight && textContent.getHeight()) || boxHeight;

			var centerPoint = 0;
			var topPoint = 0;
			var bottomPoint = 0;
			
			var headerHeight = header && header.getHeight ? Math.max(header.getHeight() + header.top, pm.top) : pm.top;
			var footerHeight = footer && footer.getHeight ? Math.max(footer.getHeight(), pm.bottom) : pm.bottom;

			var centerHeight = pageHeight - headerHeight - footerHeight;
			if (rf == "page")
			{
				centerPoint = pageHeight / 2;
				topPoint = 0;
				bottomPoint = pageHeight;
			}
			else if (rf == "margin" || rf == "column")
			{
				centerPoint = centerHeight / 2 + headerHeight;
				topPoint = headerHeight;
				bottomPoint = centerHeight + headerHeight;
			}
			else if (rf == "topMargin")
			{
				centerPoint = headerHeight / 2;
				topPoint = 0;
				bottomPoint = headerHeight;
			}
			else if (rf == "bottomMargin")
			{
				centerPoint = headerHeight + centerHeight + footerHeight / 2;
				topPoint = headerHeight + centerHeight;
				bottomPoint = pageHeight;
			}

			// coords transform.
			var virtualTopOffset = 0 - (body && body.getTop() ? body.getTop() : pm.top);
			virtualTopOffset -= (body.contentTop || 0);

			if (!pa)
			{
				// no alignment
				this.marginTop = topPoint + offY;
			}
			else if ("center" == pa)
			{
				this.marginTop = centerPoint - boxHeight / 2;
	 		}
			else if ("bottom" == pa)
			{
				this.marginTop = bottomPoint - boxHeight;
			}
			else if ("top" == pa || !pa)
			{
				this.marginTop = topPoint;
			}
		}
		
		if (isSupported)
		{
			if (!(inCell && islayoutInCell))
			{
				this.marginTop += virtualTopOffset;
				if (pTop)
					this.marginTop = this.marginTop - pTop;
			}
		}
	},

	_calculatePercentagePosV: function(pct, line)
	{
		var vTools = writer.util.ViewTools;
		var p = vTools.getParagraph(line);
		var textContent = vTools.getTextContent(line);
		var isInHeaderFooter = textContent.isHeader || textContent.isFooter;
		var body = !isInHeaderFooter ? vTools.getBody(textContent) : textContent;

		var page = vTools.getPage(line);
		var pageSize = page.section.pageSize;
		var pageMargin = page.section.pageMargin;

		var relFrom = this.model.pctPositionV.relativeFrom;
		if ("page" == relFrom)
		{
			off = pageSize.h * pct;
			this.marginTop = off - p.top - body.getTop();
		}
		else if ("margin" == relFrom)
		{
			off = (pageSize.h - pageMargin.top - pageMargin.bottom) * pct;
			this.marginTop = off - p.top ;
		}
		else if ("topMargin" == relFrom)
		{
			off = pageMargin.top * pct;
			this.marginTop = off - p.top - body.getTop();
		}
		else if ("bottomMargin" == relFrom)
		{
			if (body.isFooter)
			{
				off = (page.getHeight() - body.getTop()) * pct;
				this.marginTop = off - body.contentTop - p.top;
			}
			else
			{
				off = pageMargin.bottom * pct;
				this.marginTop = page.getHeight() - body.getTop() - p.top - pageMargin.bottom + off;
			}
		}
		else if ("insideMargin" == relFrom)
		{
			off = pageMargin.top * pct;
			this.marginTop = off - p.top - body.getTop();
		}
		else if ("outsideMargin" == relFrom)
		{
			off = pageMargin.bottom * pct;
			this.marginTop = off - p.top + body.getHeight();
		}
	},

	_updatePositionV: function(line)
	{
		var oldMarginTop = this.marginTop;

		var vTools = writer.util.ViewTools;
		var p = vTools.getParagraph(line);
		var textContent = vTools.getTextContent(line);

		var pct = this.model.getPctPositionV();
		if (this.model.positionV)
			this._calculateAbsolutePosV(line);
		else
			this._calculatePercentagePosV(pct, line);

		/*
		 * in header/footer & table, the anchor does not affected wrapt in header/footer
		 * so keep the position relatived to paragraph.
		 * so does float anchor.
		*/
		var headerfooter = vTools.getHeader(line) || vTools.getFooter(line);
		if (this.marginTop < 0 && !headerfooter && !vTools.isFloatAnchor(this) && !vTools.isCell(textContent))
			this.marginTop = 0;

		// anchor in table, special case, the anchor should not move out of table cell.
		if (vTools.isCell(textContent) && vTools.isWrappingAnchor(this))
		{
			if (this.marginTop + p.top < 0)
				this.marginTop = 0 - p.top;
		}

		this._calMaskMarginV(line);

		// the position changed, update the dom.
		if (Math.abs(oldMarginTop - this.marginTop) > 0.5)
			this._updateVDOM();
	},

	updatePosition:function(body){
		var line = this.parent;
		var p = writer.util.ViewTools.getParagraph(line);

		// update positionV
		this._updatePositionV(line);

		// update space
		var newSpace = this.calcuSpace(line, p, body);
		if(!this.ownedSpace || !this.ownedSpace.equals(newSpace)){
			if (this.ownedSpace)
				body.releaseSpace(this.ownedSpace);
				
			this.ownedSpace = newSpace;
			if (this.ifCanOccupy(line))
				body.occupy(this.ownedSpace);
		}
		else
		{
			// as the body has released the spaces, here occupy the space again.
			if (this.ifCanOccupy(line))
				body.occupy(this.ownedSpace);
		}
	
	},
	isContainedByBodyV: function(body) {
		if (!this.ownedSpace)
			return;
		
		return body.bodySpace.containV(this.ownedSpace);
	},
	ifCanOccupy: function(line, noWrapping) {
		var vTools = writer.util.ViewTools;

		var p = vTools.getParagraph(line);
		var body = vTools.getTextContent(line);

		// for header/footer, always can fill
		var viewType = body.getViewType();
		if (viewType == 'table.Cell' ||  viewType == 'page.Header' || viewType == 'page.Footer')
			return true;

		// previous run is pagebreak, cannot occupy
		var lastview = line.container.prev(this) || line.container.getLast();
		if (lastview && vTools.isPageBreak(lastview))
		{
			return false;
		}
	
		// if the paragraph the anchor belonging to is the first obj in textarea, it should always can be occupied.
		if (!noWrapping)
		{
			if (body.getContainer().isEmpty())
				return true;
			else
			{
				var firstView = body.getContainer().getFirst();
				var p = writer.util.ViewTools.getParagraph(this);
				if (firstView == p)
					return true;
			}

			return this.isContainedByBodyV(body);
		}

		return true;
	},

	getCommonDomStr: function(){
		var style = "";

		// correct line margin-left
		var line = this.parent;
		if (line && line.getRealPaddingLeft)
			style = "margin-left:" + (-line.getRealPaddingLeft()) + "px;";

		return style;
	},

	releaseBodySpace: function()
	{
		var body = writer.util.ViewTools.getTextContent(this);
		if (body && this.ownedSpace)
			body.releaseSpace(this.ownedSpace);
	},

	_updateVDOM: function()
	{
		if (!this.domNode)
			return;

		dojo.style(this.domNode, { "top": (this.marginTop-this.padTop) + "px" });
	},

	// when image cross page edge, we should cut the image
	_calMaskMarginH: function(line)
	{
		var vTools = writer.util.ViewTools;
		var p = vTools.getParagraph(line);
		var textContent = vTools.getTextContent(line);
		var isInHeaderFooter = textContent.isHeader || textContent.isFooter;
		var body = !isInHeaderFooter ? vTools.getBody(textContent) : textContent;
		var page = vTools.getPage(line);
		var pageSize = page.section.pageSize;

		if (!vTools.isCell(textContent))
		{
			var leftToPage = this.marginLeft + p.left + body.left;
			this._maskLeft = leftToPage < 0 ? -leftToPage : 0;

			var rightToPage = pageSize.w - (leftToPage + this.getWholeWidth());
			this._maskRight = rightToPage < 0 ? -rightToPage : 0;
		}
		else
		{
			this._maskLeft = 0;
			this._maskRight = 0;
		}

		this._maskWidth = this.getWholeWidth() - this._maskLeft - this._maskRight;
	},

	_calMaskMarginV: function(line)
	{
		var vTools = writer.util.ViewTools;
		var p = vTools.getParagraph(line);
		var textContent = vTools.getTextContent(line);
		var isInHeaderFooter = textContent.isHeader || textContent.isFooter;
		var body = !isInHeaderFooter ? vTools.getBody(textContent) : textContent;
		var page = vTools.getPage(line);
		var pageSize = page.section.pageSize;

		if (!vTools.isCell(textContent))
		{
			var topToPage = this.marginTop + p.top + body.top;
			this._maskTop = topToPage < 0 ? -topToPage : 0;

			var bottomToPage = pageSize.h - (topToPage + this.getWholeHeight());
			this._maskBottom = bottomToPage < 0 ? -bottomToPage : 0;
		}
		else
		{
			this._maskLeft = 0;
			this._maskRight = 0;
		}

		this._maskHeight = this.getWholeHeight() - this._maskTop - this._maskBottom;
	},

	getMaskLeft: function()
	{
		return this._maskLeft;
	},

	getMaskBottom: function()
	{
		return this._maskBottom;
	},

	render:function(){
		
		if(!this.domNode ||this.dirty){
			delete this.dirty;
			var style = "position:absolute;";
			
			if (isNaN(this.marginLeft)){
				this.marginLeft = 0;
			}
			if (isNaN(this.marginTop)){
				this.marginTop = 0;
			}
			
			var widthWithBorder		= this.getWholeWidth();
			var heightWithBorder	= this.getWholeHeight();
			
			style = style+"left:"+(this.marginLeft-this.padLeft)+"px;";
			style = style+"top:"+(this.marginTop-this.padTop)+"px;";
			style = style+"width:"+widthWithBorder+"px;";
			style = style+"height:"+heightWithBorder+"px;";
			
			var class_style = this.className + " " + this.getCSSStyle();
			this.domNode = dojo.create("div",{"class":class_style, "style":style + this.getCommonDomStr()});
			
			// cut image when image cross page edge
			this.maskNode = dojo.create("div",{"class":"img_mask", "style": "position:absolute;overflow:hidden;" +
				"left:"+this._maskLeft+"px;bottom:"+this._maskBottom+"px;width:"+this._maskWidth+"px;height:"+this._maskHeight+"px;z-index:"+this.zIndex + ";"
				}, this.domNode);
			
			var borderStyle = this._noBorder() ? "" : "border:" + "solid " + this.borderWidth + "px;"
				+ "border-color:" + this.model.borderColor;
			
			var srcPath = this.model.url;
			if(pe.scene.isHTMLViewMode())
			{
				var prefix = DOC_SCENE.version ? DOC_SCENE.version + '/' : "";
				srcPath = prefix + srcPath + '?sid=' + DOC_SCENE.snapshotId; 
			}	
			var imgNode = dojo.create("img", {
				"alt":this.model.description? this.model.description: "",
				"class":"img_pic",
				"src": srcPath,
				"style": "position:absolute;left:"+(-this._maskLeft)+"px;bottom:"+(-this._maskBottom)
					+ "px;width:"+ this.iw  +"px;height:"+ this.ih +"px;" + borderStyle
			}, this.maskNode);
			
			// resizer node
			this._resizerView && this._resizerView.create(this.domNode, imgNode);
			
			this.handleLinkField();
		}
		return this.domNode;
	}
});
