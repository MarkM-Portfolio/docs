dojo.provide("writer.view.AnchorView.AnchorTextBox");
dojo.require("writer.view.AnchorView.AnchorImageView");
dojo.require("writer.view.selection.AnchorTBResizerView");
dojo.require("writer.view.update.TextBoxViewUpdate");

dojo.declare("writer.view.AnchorView.AnchorTextBox", [ writer.view.AnchorView.AnchorImageView, writer.view.update.TextBoxViewUpdate ], {
	container: null,
	bodyPr: null,
	className: "AnchorTextBox",
	constructor : function(model, ownerId , start, len) {
		this.ownerId = ownerId;
		this.bodyPr = model.bodyPr;
		this.container = new common.Container(this);
		var contents = this.model && this.model.container;
		if (contents){
			var c = contents.getFirst();
			while(c){
				var m = c.preLayout( ownerId );
				this.container.append(m);
				c = contents.next(c);
			}
		}
		
		// create resizer view
		this._createResizer();
		dojo.subscribe(writer.EVENT.RESIZETEXTBOX, this, function(view, incX, incY){
			view.resize(incX, incY);
		});
	},

	_createResizer: function()
	{
		this._resizerView = new writer.view.selection.AnchorTBResizerView(this);
	},

	//override and disable this function to avoid set padding top to 0
	initLineSpace:function(line){
		return;
	},
	
	
	// resize
	resize: function(incX, incY) {
		var sizeX = this.iw + this.paddingLeft + this.paddingRight;
		var sizeY = this.ih + this.paddingTop + this.paddingBottom;
			
		var newSizeX = sizeX + incX;
		var newSizeY = sizeY + incY;

		var minSizeX = this._MINIMIZE_SIZE + this.paddingLeft + this.paddingRight;
		var minSizeY = this._MINIMIZE_SIZE + this.paddingTop + this.paddingBottom;
		
		if (newSizeX < minSizeX) {
			newSizeX = minSizeX;
		}
		
		if (newSizeY < minSizeY) {
			newSizeY = minSizeY;
		}
		
		var oldSz = {"extent": {"cx": this.model.width, "cy": this.model.height}};
		if (this.model.isAutoFit())
			oldSz.spAutoFit = {"ele_pre": "a"};
		else
			delete oldSz.spAutoFit;

		if (this.model.isAutoWrap())
			oldSz.autoWrap = {};
		else
			delete oldSz.autoWrap;
			
		var newSz = {"extent": {"cx": common.tools.PxToCm(newSizeX) + "cm", "cy": common.tools.PxToCm(newSizeY) + "cm"}};
		newSz.autoWrap = {};

		// change size
		this.model.setSize(newSz.extent, false, true);
		
		// send image
		var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute, [WRITER.MSG.createSetAttributeAct( this.model,null,null,{'size':newSz },{'size': oldSz } )] );
		WRITER.MSG.sendMessage( [msg] );
	},
	
	// update after resize
	_resizeUpdate: function(){
		var getPxValue = common.tools.toPxValue;
		var line = writer.util.ViewTools.getLine(this);
		var body = writer.util.ViewTools.getTextContent(line);
		
		this.iw = getPxValue(this.model.width);
		this.ih = getPxValue(this.model.height);
		var positionH = this.model.positionH;
		var positionV = this.model.positionV;
		if(positionH)
		{
			var totalWidth = this.iw;
			if (positionH.relativeFrom == "column" || positionH.relativeFrom == "margin")
				totalWidth = (body.getWidth && body.getWidth())||totalWidth;
			else if (positionH.relativeFrom == "page" )
			{
				var page = writer.util.ViewTools.getPage(body);
				totalWidth = page.getWidth();
			}
		
			switch(positionH.align)
			{
			case "center":
				this.marginLeft = Math.floor((totalWidth - this.iw)/2);
				break;
			case "left":
				this.marginLeft = 0;
				break;
			case "right":
				this.marginLeft = totalWidth - this.iw;
				break;
			}
		}
		if (positionV && positionV.align == "center" ){
			this.marginTop = (body.bodySpace.h - this.ih)/2;
			if (p && p.top){
				this.marginTop = this.marginTop - p.top;
			}
		}
		
		// clear para
		var para = this.container.getFirst();
		while(para){
			if (para.lines && para.lines.length() != 0)
				para.lines.removeAll();
			
			para = this.container.next(para);
		}
		
		this.dirty = true;
		
		var p = writer.util.ViewTools.getParagraph(this);
		p.markRelayout();
		p.parent.notifyUpdate([p]);
		pe.lotusEditor.layoutEngine.rootView.update();
	},
	
//	relayout: function(line)
//	{
//		// Override run's relayout function. Which was used in view.paragraph._appendToLine function. 
//	},
	
	getContainer:function(){
		return this.container;
	},
	
	layout: function(line) {
		//layout using parent's layout
		this.inherited(arguments);
		
		var body = writer.util.ViewTools.getTextContent(line);
		
		var oldP = this.parent;	// Text box in Text box case for Symphony file.
		this.parent = line; 
		
		this._layoutContent(body);
		this._updatePositionH(line);
		this._updatePositionV(line);
		this._occupySpace(body, line);
		
		this.parent = oldP; 
	},

	_occupySpace: function(body, line)
	{
		var vTools = writer.util.ViewTools;
		
		var p = vTools.getParagraph(line);

		// occupy space
		var viewType = this.getViewType();
		if (viewType == "text.AnchorTextBox" || viewType == "text.SQTextBox" || viewType == "text.TBTextBox") {
			this.ownedSpace = this.calcuSpace(line, p, body);
			body.releaseSpace(this.ownedSpace);
			if (this.ifCanOccupy(line))
				body.occupy(this.ownedSpace);
		}
		else if (vTools.isTextBox(this))
		{
			this.ownedSpace = this.calcuSpace(line, p, body);
			body.releaseSpace(this.ownedSpace);
			if (this.ifCanOccupy(line, true))
				body.occupy(this.ownedSpace, true);
		}
	},

	updatePosition:function(body){
		var line = this.parent;
		var p = writer.util.ViewTools.getParagraph(line);
		this._updatePositionV(line);
		var newSpace = this.calcuSpace(line, p, body);
		var viewType = this.getViewType();
		if(!this.ownedSpace || !this.ownedSpace.equals(newSpace)){
			if (this.ownedSpace)
				body.releaseSpace(this.ownedSpace);
				
			this.ownedSpace = newSpace;
			if (viewType == "text.AnchorTextBox" || viewType == "text.SQTextBox" || viewType == "text.TBTextBox") {
				if (this.ifCanOccupy(line))
					body.occupy(this.ownedSpace);
			}
			else
			{
				if (this.ifCanOccupy(line, true))
					body.occupy(this.ownedSpace, true);
			}
		}
		else
		{
			// as the body has released the spaces, here occupy the space again.
			if (viewType == "text.AnchorTextBox" || viewType == "text.SQTextBox" || viewType == "text.TBTextBox") {
				if (this.ifCanOccupy(line))
					body.occupy(this.ownedSpace);
			}
			else
			{
				if (this.ifCanOccupy(line, true))
					body.occupy(this.ownedSpace, true);
			}
		}
	
	},
	getTop:function(asRunInLine){
		if (asRunInLine)
			return this.inherited(arguments);
		else
			return this.parent.getTop() + this.marginTop;
	},
	getLeft:function(asRunInLine){
		if (asRunInLine)
			return this.inherited(arguments);
		else
			return this.parent.getLeft() + this.marginLeft;
	},
	getContentLeft:function(){
		return this.getLeft()+ this.paddingLeft;
	},
	getContentTop:function(){
		return this.getTop() + this.paddingTop + this.contentVOffset;
	},
	getContentWidth: function()
	{
		return this.iw;
	},
	setContentWidth: function(width)
	{
		this.iw = width;
	},
	getContentHeight: function()
	{
		return this.ih;
	},
	setContentHeight: function(height)
	{
		this.ih = height;
	},
	getOffsetToLeftEdge: function()
	{
		var line = this.parent;
		return line.getLeft() + this.marginLeft + 2;	// 2 boder size
	},
	getOffsetToBottomEdge: function()
	{
		var line = this.parent;
		var topToLine = this.marginTop;
		var heightWithBorder = this.ih + this.paddingTop + this.paddingBottom;
		var docView = layoutEngine.rootView;
		var docHeight = docView.getHeight();
		var bottomFromEdge = docHeight - (line.getTop() + topToLine + heightWithBorder + 2);	// 2 border size
		return bottomFromEdge;
	},
	getElementPath:function(x,y,lineHeight,path,options){
		// Check occupied space first for anchored object
		x = x - this.marginLeft - this.paddingLeft;
		y = y - this.marginTop - this.paddingTop - this.contentVOffset;
		
		var tarPara = this.container.select(function(para){
			if(y<=para.h){
				return true;
			}else{
				y=y-para.h;
				return false;
			}
		});
		
		if (!tarPara) {
			// when pos.y is over last paragraph, get the bottom of the paragraph
			tarPara = this.container.getLast();
			y = tarPara.h - 3;	// the 3 is used to compensate y offset so that the line can be selected correctly.
			if (y < 0) y = 0;
		}
		
		// Some text box has no paragraph
		if(tarPara){
			path.push(tarPara);
			tarPara.getElementPath(x,y,path,options);
		}
	},
	inTextZone: function(x, y)
	{
		x = x - this.marginLeft;
		y = y - this.marginTop;

		if (this.model.txContent
			&& x >= this.paddingLeft + 5 && x <= this.paddingLeft - 5 + this.iw
			&& y >= this.paddingTop + 5 + this.contentVOffset
			&& y <= this.paddingTop - 5 + this.ih)
			return true;

		return false;
	},

	getWholeWidth: function()
	{
		return this.iw + this.paddingLeft + this.paddingRight + 2;
	},

	getWholeHeight: function()
	{
		return this.ih + this.paddingTop + this.paddingBottom + 2;
	},

	getWidth:function(asContainer){
		if (asContainer)
			return this.iw;
		else
			return 0;
	},
	_updateVDOM: function()
	{
		if (!this.domNode)
			return;

		dojo.style(this.domNode, { "top": this.marginTop + "px" });
	},
	render : function() {
		if (!this.domNode || this.dirty) {
			delete this.dirty;

			if (isNaN(this.marginLeft)){
				this.marginLeft = 0;
			}
			if (isNaN(this.marginTop)){
				this.marginTop = 0;
			}
			
			var style = "position:absolute;";
			if (this.paddingTop > 0){
				style = style + "padding-top:" + this.paddingTop + "px;";
			}
			if (this.paddingRight > 0){
				style = style + "padding-right:" + this.paddingRight + "px;";
			}
			if (this.paddingLeft > 0){
				style = style + "padding-left:" + this.paddingLeft + "px;";
			}
			if (this.paddingBottom > 0){
				style = style + "padding-bottom:" + this.paddingBottom + "px;";
			}

			// backgound-color
			var bgColor = this.model.bgColor;

			// border size
			// common.tools.toPxValue(this.model.border.width)
			var borderSize = this._noBorder() ? 0 : 1;
			var borderColor = this.model.borderColor;

			// whole size
			var wholeW = this.getWholeWidth();
			var wholeH = this.getWholeHeight();

			// svg node
			if (this.model.svg && this.model.svg != "")
			{
				bgColor = "rgba(1,1,1,0)";
				borderColor = "rgba(1,1,1,0)";

				this.svgNode = dojo.create("div", {
					"class":"textbox_svg",
					"innerHTML": this.model.svg,
					"style": "position:absolute;left:0px;bottom:0px;"
					+ "width:" + wholeW + "px; height:" + wholeH + "px;"
				});
				this.updateSnapShotIdForSVG(this.svgNode);
			}
			else
			{
				if (this.model.bgColor)
					style += ("background-color:" + this.model.bgColor) + ";";
			}
			
			this.domNode = dojo.create("div", {
				"alt" : this.model.description? this.model.description: "",
			    "class" : this.className + this.getCSSStyle(),"style":
				this.getCommonDomStr() + this.model.getSelfStyle()
				+ "background-color:rgba(1,1,1,0);"
				+ "position:absolute;text-indent:0px;width:"+wholeW+"px; height:"+wholeH+"px;"
				+ "left:" + this.marginLeft + "px;"
				+ "top:" + this.marginTop + "px;"});

			// cut textbox when textbox cross page edge
			var maskHidden = "visable";
			if (this._maskLeft > 0 || this._maskRight > 0 || this._maskTop > 0 || this._maskBottom > 0)
				maskHidden = "hidden";
			this.maskNode = dojo.create("div",{"class":"textbox_mask",
				"style": "position:absolute;overflow:" + maskHidden + ";"
				+ "background-color:rgba(1,1,1,0);"
				+ "left:"+this._maskLeft+"px;bottom:"+this._maskBottom+"px;width:"+this._maskWidth+"px;height:"+this._maskHeight+"px;z-index:"+this.zIndex + ";"
				}, this.domNode);

			this.holderNode = dojo.create("div", {"class":"textbox_holder", "style": style
				+ "left:"+(-this._maskLeft)+"px;bottom:"+(-this._maskBottom) + "px;"
				+ "width:"+this.iw+"px; height:"+this.ih+"px;"
				+ "border:" + borderSize + "px solid;"
				+ "border-color:" + borderColor}, this.maskNode);

			if (this.svgNode)
				this.holderNode.appendChild(this.svgNode);
			
			var autoHide = "overflow: hidden;";
			var tbNodeStyleStr = "position:absolute;z-index:3;"
				+ "left:" + this.paddingLeft + "px;top:" + (this.paddingTop + this.contentVOffset) + "px;"
				+ "width:"+this.iw+"px;height:"+(this.ih-this.contentVOffset)+"px;"
				+ autoHide + "border:0px solid;";
			if (bgColor)
				tbNodeStyleStr += ("background-color:rgba(1,1,1,0)") + ";";
			if (this.model.fontColor)
				tbNodeStyleStr += ("color:" + this.model.fontColor) + ";";
			if (this.model.isWaterMarker)
				tbNodeStyleStr+= ("text-align: center;");
			
			this.textboxNode = dojo.create("div", {
				"class":"textbox_content",
				"style" : tbNodeStyleStr
				}, this.holderNode);
			
			var param = this.container.getFirst();
			while(param){
				var childNode = param.render();
				delete param.insertedDOM;
				this.textboxNode.appendChild(childNode);	
				param = this.container.next(param);
			}

			if (this.model.isWaterMarker)
			{
				var parentModelW = common.tools.toPxValue(this.model.width);
				var parentModelH = common.tools.toPxValue(this.model.height);

				this.textboxNode.style.width = wholeW + "px";
				this.textboxNode.style.height = wholeH + "px";
				this.textboxNode.style.overflow = "visible";
				this.textboxNode.style.display = "table";

				var child = this.textboxNode.children[0];
				if (this.model.rot)
				{
					var dom = child;
					var deg = parseFloat(this.model.rot) / 60000; // by spec
					dom.style.transform = "rotate("+deg+"deg)";
					dom.style.msTransform = "rotate("+deg+"deg)";
					dom.style.mozTransform = "rotate("+deg+"deg)";
					dom.style.webkitTransform  = "rotate("+deg+"deg)";
					//dom.style.transformOrigin = wholeW/2 + "px " + wholeH/2 + "px";
				}
				
				// make me vertical align.
				child.style.display = "table-cell";
				child.style.verticalAlign = "middle";
			}

			// this node used to capture mouse event.
			var edge = this._resizerView ? this._resizerView._MIN_FRAME_PIXEL / 2 : 0;
			var captureNode = dojo.create("div", {
				"class":"textbox_capture",
				"style": "position:absolute;z-index:2;left:-" + edge + "px;bottom:-" + edge + "px;"
					+ "width:" + (wholeW + edge*2 )+ "px; height:" + (wholeH + edge*2) + "px;background-color:rgba(1,1,1,0)"
				},this.holderNode);
			
			this._resizerView && this._resizerView.create(this.domNode, captureNode);
		}
		return this.domNode;
	},
	
	listener: function(message,param)
	{
		if(message == "update")
			this.update();
	}
});
