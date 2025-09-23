dojo.provide("writer.view.selection.CanvasResizerView");

dojo.require("writer.view.selection.ResizerView");
dojo.require("writer.controller.EditShell");
dojo.require("writer.controller.Editor");
dojo.require("writer.controller.Selection");

dojo.declare("writer.view.selection.CanvasResizerView",[writer.view.selection.ResizerView],
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
		return { "offX": this._ownerView.padLeft, "offY": this._ownerView.padBottom,
			"w": this._ownerView.w, "h": this._ownerView.h };
	},
	
	_beginResize: function() {
		var node = this._imgNode;
		dojo.style(node, "zIndex", 10000);
	},
	
	_endResize: function() {
		var node = this._imgNode;
		dojo.style(node, "zIndex", 0);
	},
	
	// UI event handler
	_onImgMouseDown: function(event) {
		if (!this._isInCorrectEditMode())
			return;

		this._imgMoveUpConnects.push( dojo.connect(this._imgNode, "onmousemove", this, "_onImgMouseMove") );
		this._imgMoveUpConnects.push( dojo.connect(this._imgNode, "onmouseup", this, "_onImgMouseUp") );

		dojo.stopEvent(event);
	},
	
	_onImgMouseMove: function(event) {
		dojo.stopEvent(event);
	},

	_onImgMouseUp: function(event) {
		// select the image
		if (!this._selectImg(event))
			return;

		// close context menu
		pe.lotusEditor.getShell().dismissContextMenu();
		
		dojo.stopEvent(event);
		
		// unregister mouse move and up on imgNode
		for(var i = 0; i < this._imgMoveUpConnects.length; i++)
		{
			dojo.disconnect(this._imgMoveUpConnects[i]);
		}
		
		this._imgMoveUpConnects = [];
	},
	
	_selectImg: function(event) {
		if (!this._isInCorrectEditMode() || this._static.selectedModelID == this._ownerView.model.id)
			return false;
	
		// select the range
		var selection = pe.lotusEditor.getSelection();
		var start = {"obj": this._ownerView, "line": this._ownerView.parent, "index": 0};
		var end = {"obj": this._ownerView, "line": this._ownerView.parent, "index": 1};
		/*
		selection.beginSelect(start);
		selection.endSelect(end);
		*/
		selection.blur();
		selection.select(start, end);
		return true;
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
		
		// register image node event
		this._imgDownConnects.push( dojo.connect(this._imgNode, "onmousedown", this, "_onImgMouseDown") );
		
		// base method
		this.inherited(arguments);
	}
});	// end dojo.declare