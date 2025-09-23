dojo.provide("writer.view.selection.ImgResizerView");

dojo.require("writer.view.selection.ResizerView");
dojo.require("writer.view.ImageView");
dojo.require("writer.controller.EditShell");
dojo.require("writer.controller.Editor");
dojo.require("writer.controller.Selection");

dojo.declare("writer.view.selection.ImgResizerView",[writer.view.selection.ResizerView],
{
	_imgNode:		null,		// node of img
	
	// event registion handle
	_imgDownConnects:	null,	// image mouse down events
	_imgMoveUpConnects:	null,	// Image mouse move/up events
	
	// constructor
	constructor: function(ownerView) {
		this._imgDownConnects	= [];
		this._imgMoveUpConnects	= [];
	},
	
	// getViewSize, note: the view original size, not contain border width
	_getViewSize: function() {
		return { "offX": this._ownerView.padLeft, "offY": this._ownerView.padBottom, "w": this._ownerView.w, "h": this._ownerView.h };
	},
	
	// draw owner node while resizing
	_drawOwner: function(left, bottom, width, height) {
		var node = this._imgNode;
		var scaleX = 1;
		var scaleY = 1;
	
		if (width < 0)
		{
			left	= left + width;
			width	= -width;
			
			scaleX	= -1;
		}
		
		if (height < 0)
		{
			bottom	= bottom + height;
			height	= -height;
			
			scaleY	= -1;
		}
		
		var transform = "transform";
		if (dojo.isWebKit)
			transform = "-webkit-transform";
		else if (dojo.isIE)
			transform = "-ms-transform";
		else if (dojo.isOpera)
			transform = "-o-transform";

		var borderWidth = this._ownerView.borderWidth;
			
		dojo.style(node, transform, "scale(" + scaleX + ", " + scaleY + ")");
		dojo.style(node, "left",	left - this._ownerView.padLeft + "px");
		dojo.style(node, "bottom",	bottom - this._ownerView.padBottom + "px");
		dojo.style(node, "width",	width + "px");
		dojo.style(node, "height",	height + "px");
	},
	
	_beginResize: function() {
		var node = this._imgNode;
		dojo.style(node, "zIndex", 10000);
	},
	
	_endResize: function() {
		var node = this._imgNode;
		dojo.style(node, "zIndex", 0);
	},
	
	// create
	create: function(parentNode, ownerNode) {
		// unregister image mouse down event
		for(var i = 0; i < this._imgDownConnects.length; i++)
		{
			dojo.disconnect(this._imgDownConnects[i]);
		}
		this._imgDownConnects = [];
		
		// save current node reference
		this._imgNode		= ownerNode;

		// base method
		this.inherited(arguments);
	}
});	// end dojo.declare