dojo.provide("writer.view.AnchorView.SimpleCanvas");

/* simple canvas
 * this sturcture of canvas only has "wpc" or "wgp" attribute, and this type of canvas/group can only be
 * in canvas/group, and has no wrap calculation.
*/

dojo.declare("writer.view.AnchorView.SimpleCanvas", [ writer.view.AnchorView.AnchorImageView, writer.view.AbstractCanvas], {
	
	className: "SimpleCanvas",

	_createResizer: function()
	{
		// to do
	},

	layout: function(parent)
	{
		var getPxValue = common.tools.toPxValue;

		var originPoint = parent.getChildOriginPoint ? parent.getChildOriginPoint() : {x: 0, y: 0};

		this.left = getPxValue(this.model.offX) - originPoint.x;
		this.top  = getPxValue(this.model.offY) - originPoint.y;

		var scale = parent.getChildScale();

		this.left *= scale.x;
		this.top *= scale.y;

		this.w = getPxValue(this.model.extX) * scale.x;
		this.h = getPxValue(this.model.extY) * scale.y;

		this._calMaskMarginH(parent);
		this._calMaskMarginV(parent);

		// layout children canvas/group/shape
		this.layoutChildren();

		this._hasLayout = true;
	},

	hasLayouted:function(){
		return this._hasLayout;
	},
	releaseLayout:function(){
		this._hasLayout = false;
	},

	ifPointMe: function(x, y)
	{
		ret = x >= this.left && x <= this.left + this.w
			&& y >= this.top && y <= this.top + this.h;

		return ret;
	},


	getTop:function(){
		return this.parent.getContentTop() + this.top;
	},
	getLeft:function(){
		return this.parent.getContentLeft() + this.left;
	},
	getContentLeft:function(){
		return this.getLeft() + this.padLeft;
	},
	getContentTop:function(){
		return this.getTop() + this.padTop;
	}, 

	getElementPath:function(x,y,lineHeight,path,options){
		// check children
		x = x - this.left;
		y = y - this.top;

		var tarChild = this._childViews.select(function(view)
		{
			return view.ifPointMe(x, y);
		});

		if (tarChild)
		{
			path.push(tarChild);
			tarChild.getElementPath(x,y,lineHeight,path,options);
		}
	},
	inTextZone: function(x, y)
	{
		x = x - this.left;
		y = y - this.top;

		var tarChild = this._childViews.selectReverse(function(view) {
			return view.ifPointMe(x, y);
		});

		if (tarChild)
			return tarChild.inTextZone(x, y);

		return false;
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
	render: function()
	{
		if(!this.domNode ||this.dirty){
			// clear flag
			delete this.dirty;

			var style = "position:absolute;";
			style = style + "left:"+this.left+"px;";
			style = style + "top:"+this.top+"px;";
			style = style + "width:"+this.w+"px;";
			style = style + "height:"+this.h+"px;";
			
			this.domNode = dojo.create("div",{"style":style});

			this.borderNode = dojo.create("div", {
				"style": "position:absolute;left:" + this.padLeft + "px;bottom:" + this.padBottom + "px;"
					+ "width:" + this.w + "px; height:" + this.h + "px;background-color:rgba(1,1,1,0)"
				},this.domNode);
			
			// render children canvas/grou/shape
			this.createChilderDOM(this.domNode);
		}
		return this.domNode;
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.SIMPLECANVAS] = writer.view.AnchorView.SimpleCanvas;
