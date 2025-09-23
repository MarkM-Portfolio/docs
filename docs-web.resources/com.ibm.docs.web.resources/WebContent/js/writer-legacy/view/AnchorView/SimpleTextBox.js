dojo.provide("writer.view.AnchorView.SimpleTextBox");
dojo.require("writer.view.AnchorView.AnchorTextBox");
/* simple textbox
 * this sturcture of textbox only has "txbx" attribute, and this type of textbox can only be
 * in canvas/group, and has no wrap calculation.
*/
dojo.declare("writer.view.AnchorView.SimpleTextBox",[writer.view.AnchorView.AnchorTextBox],
{
	className: "SimpleTextBox",

	_mouseDownConnect: null,

	_createResizer: function()
	{
		// to do
	},

	// overwrite base method
	calcuSpace:function(line,p,body){
	},

	// overwrite base method
	isContainedByBodyV: function(body) {
		return true;
	},

	layout: function(parent) {
		var getPxValue = common.tools.toPxValue;

		// position
		var originPoint = parent.getChildOriginPoint ? parent.getChildOriginPoint() : {x: 0, y: 0};
		this.marginLeft = getPxValue(this.model.offX) + getPxValue(this.model.offX_off) - originPoint.x;
		this.marginTop  = getPxValue(this.model.offY) + getPxValue(this.model.offY_off) - originPoint.y;

		var scale = parent.getChildScale();
		this.marginLeft *= scale.x;
		this.marginTop *= scale.y;

		// size
		this.iw = (getPxValue(this.model.extX) + getPxValue(this.model.extX_off)) * scale.x;
		this.ih = (getPxValue(this.model.extY) + getPxValue(this.model.extY_off)) * scale.y;

		var realWidth = this.iw;
		var realHeight = 0;
		this.contentVOffset = 0;
		if (this.bodyPr){
			var toPx = common.tools.toPxValue;
			this.effExtTop = toPx(this.bodyPr.tIns);
			this.effExtLeft = toPx(this.bodyPr.lIns);
			this.effExtRight = toPx(this.bodyPr.rIns);
			this.effExtBottom = toPx(this.bodyPr.bIns);

			this.effExtTop_n = this.bodyPr.tIns_n ? toPx(this.bodyPr.tIns_n) : 0;
			this.effExtLeft_n = this.bodyPr.lIns_n ? toPx(this.bodyPr.lIns_n) : 0;
			this.effExtRight_n = this.bodyPr.rIns_n ? toPx(this.bodyPr.rIns_n) : 0;
			this.effExtBottom_n = this.bodyPr.bIns_n ? toPx(this.bodyPr.bIns_n) : 0;

			this.paddingTop = this.effExtTop + this.effExtTop_n;
			this.paddingLeft = Math.ceil(this.effExtLeft + this.effExtLeft_n);
			this.paddingRight = this.effExtRight + this.effExtRight_n;
			this.paddingBottom = this.effExtBottom + this.effExtBottom_n;

			if (this.paddingTop < 0) this.paddingTop = 0;
			if (this.paddingLeft < 0) this.paddingLeft = 0;
			if (this.paddingRight < 0) this.paddingRight = 0;
			if (this.paddingBottom < 0) this.paddingBottom = 0;
			
			if (this.iw < this.paddingLeft + this.paddingRight)
			{
				this.paddingLeft = 0;
				this.paddingRight = 0;
			}
			if (this.ih < this.paddingTop + this.paddingBottom)
			{
				this.paddingTop = 0;
				this.paddingBottom = 0;
			}

			this.iw = this.iw - this.paddingLeft - this.paddingRight;
			this.ih = this.ih - this.paddingTop - this.paddingBottom;
		}

		// content
		var para = this.container.getFirst();
		while(para){
			if (para.getViewType() != "text.Paragraph" || para.lines && para.lines.length() == 0)
				para.layout(this);

			para.parent = this;
			para.left = 0;
			para.top = realHeight;
			realHeight += para.h;
			para = this.container.next(para);
		}
		
		if (this.model.isAutoFit()){
			this.ih = realHeight;// - this.marginTop;
		}
		else {
			// vertical-align
			if (this.model.bodyPr)
			{
				var off = this.ih - realHeight;
				if (off > 0) {
					if (this.model.bodyPr.anchor == "ctr")
						this.contentVOffset = off * 0.5;
					else if (this.model.bodyPr.anchor == "b")
						this.contentVOffset = off;
				}
			}
		}

		this._calMaskMarginH(parent);
		this._calMaskMarginV(parent);

		this._hasLayout = true;
	},

	_calMaskMarginH: function(parent)
	{
		this._maskLeft = 0;
		this._maskRight = 0;
		this._maskWidth = this.getWholeWidth() - this._maskLeft - this._maskRight;
	},

	_calMaskMarginV: function(parent)
	{
		this._maskTop = 0;
		this._maskBottom = 0;
		this._maskHeight = this.getWholeHeight() - this._maskTop - this._maskBottom;
	},

	render: function(){
		if (!this.domNode || this.dirty)
		{
			if (this._mouseDownConnect)
				dojo.disconnect(this._mouseDownConnect);

			var domNode = this.inherited(arguments);
			this._mouseDownConnect = dojo.connect(this.textboxNode, "onmousedown", this, "_onContentMouseDown");
		}

		return this.domNode;
	},

	ifPointMe: function(x, y)
	{
		ret = x >= this.marginLeft && x <= this.marginLeft + this.iw + this.paddingLeft + this.paddingRight
			&& y >= this.marginTop && y <= this.marginTop + this.ih + this.paddingTop + this.paddingBottom

		return ret;
	},

	getTop:function(){
		return this.parent.getContentTop() + this.marginTop;
	},
	getLeft:function(){
		return this.parent.getContentLeft() + this.marginLeft;
	},
	getContentLeft:function(){
		return this.getLeft() + this.paddingLeft;
	},
	getContentTop:function(){
		return this.getTop() + this.paddingTop + this.contentVOffset;
	}, 

	_onContentMouseDown: function(event){
		dojo.stopEvent(event);

		var editWindow = pe.lotusEditor.getShell().getEditWindow();
		editWindow._onMouseDown(false, event);
	},

	hasLayouted:function(){
		return this._hasLayout;
	},
	releaseLayout:function(){
		this._hasLayout = false;
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.SIMPLETXBX] = writer.view.AnchorView.SimpleTextBox;