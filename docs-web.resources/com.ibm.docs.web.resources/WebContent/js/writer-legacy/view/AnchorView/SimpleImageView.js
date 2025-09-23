dojo.provide("writer.view.AnchorView.SimpleImageView");
dojo.require("writer.view.AnchorView.AnchorImageView");
/* simple textbox
 * this sturcture of textbox only has "txbx" attribute, and this type of textbox can only be
 * in canvas/group, and has no wrap calculation.
*/
dojo.declare("writer.view.AnchorView.SimpleImageView",[writer.view.AnchorView.AnchorImageView],
{
	className: "SimpleImageView",

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

	getChildPosition:function(idx){
	},

	ifPointMe: function(x, y)
	{
		return false;
	},

	layout: function(parent) {
		var getPxValue = common.tools.toPxValue;

		// position
		var originPoint = parent.getChildOriginPoint ? parent.getChildOriginPoint() : {x: 0, y: 0};
		this.marginLeft = getPxValue(this.model.offX) - originPoint.x;
		this.marginTop  = getPxValue(this.model.offY) - originPoint.y;

		var scale = parent.getChildScale();
		this.marginLeft *= scale.x;
		this.marginTop *= scale.y;

		// size
		if(this.parent.model.isLockedCanvas)
			this.iw = this.parent.w;
		else
			this.iw = getPxValue(this.model.extX) * scale.x;
		this.ih = getPxValue(this.model.extY) * scale.y;

		this.padLeft 	= 0;
		this.padTop 	= 0;
		this.padRight 	= 0;
		this.padBottom 	= 0;

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
	hasLayouted:function(){
		return this._hasLayout;
	},
	releaseLayout:function(){
		this._hasLayout = false;
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.SIMPLEIMAGE] = writer.view.AnchorView.SimpleImageView;