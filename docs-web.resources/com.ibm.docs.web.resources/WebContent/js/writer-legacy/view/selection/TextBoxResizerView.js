dojo.provide("writer.view.selection.TextBoxResizerView");

dojo.require("writer.view.selection.ResizerView");
dojo.require("writer.view.ImageView");
dojo.require("writer.controller.EditShell");
dojo.require("writer.controller.Editor");
dojo.require("writer.controller.Selection");

dojo.declare("writer.view.selection.TextBoxResizerView",[writer.view.selection.ResizerView],
{
	_MIN_FRAME_PIXEL:			4,		// min px of textbox selected border

	_textboxNode:				null,	// node of textbox
	
	// event registion handle
	_textboxDownMoveConnects:	null,	// mouse down/move events
	_textboxUpConnects:			null,	// mouse up events
	
	_isSelecting:				false,
	
	// constructor
	constructor: function(ownerView) {
		this._textboxDownMoveConnects	= [];
		this._textboxUpConnects	= [];
	},
	
	// resize
	_resize: function(incX, incY) {
		var sizeX = common.tools.toPxValue(this._ownerView.model.width);
		var sizeY = common.tools.toPxValue(this._ownerView.model.height);
			
		var newSizeX = sizeX + incX;
		var newSizeY = sizeY + incY;
		
		if (newSizeX <= 0) {
			newSizeX = this._MINIMIZE_SIZE;
		}
		
		if (newSizeY <= 0) {
			newSizeY = this._MINIMIZE_SIZE;
		}
		
		var oldSz = {"extent": {"cx": this._ownerView.model.width, "cy": this._ownerView.model.height}};
		if (this._ownerView.model.isAutoFit())
			oldSz.spAutoFit = {"ele_pre": "a"};
			
		var newSz = {"extent": {"cx": common.tools.PxToCm(newSizeX) + "cm", "cy": common.tools.PxToCm(newSizeY) + "cm"}};
		
		var modelTb 		= this._ownerView.model;
		modelTb.setAutoFit(false);
		modelTb.width		= newSz.extent.cx;
		modelTb.height		= newSz.extent.cy;
		
		this._ownerView.iw = newSizeX;
		this._ownerView.ih = newSizeY;
		
		// update
		this._resizeUpdate();
		
		// send image
		var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute, [WRITER.MSG.createSetAttributeAct( modelTb,null,null,{'size':newSz },{'size': oldSz } )] );
		WRITER.MSG.sendMessage( [msg] );
	},
	
	// update after resize
	_resizeUpdate: function(){
		this._ownerView.model.markDirty();
		var paragraph = writer.util.ModelTools.getParagraph( this._ownerView.model );
		paragraph.updateView();
		paragraph.parent.update();
	},
	
	// getViewSize
	_getViewSize: function() {
		var w = this._ownerView.w + this._ownerView.paddingLeft + this._ownerView.paddingRight;
		var h = this._ownerView.h + this._ownerView.paddingTop + this._ownerView.paddingBottom;
	
		return { "offX": 0, "offY": 0, "w": w, "h": h };
	},
	
	// has mouse click only box frame?
	_isValidClick: function(target, clickX, clickY) {
		if (this._textboxNode != target)
			return false;

		return true;
	
		var minPx = 4;
		
		var viewSize = this._getViewSize();

		if (clickX <= this._MIN_FRAME_PIXEL
			|| clickX >= viewSize.w - this._MIN_FRAME_PIXEL
			|| clickY <= this._MIN_FRAME_PIXEL
			|| clickY >= viewSize.h - this._MIN_FRAME_PIXEL) {
			return true;
		}
		
		return false;
	},
	
	// UI event handler
	_onImgMouseDown: function(event) {
		var target = event.target || event.srcElement;
		
		var clickX = event.offsetX || event.layerX;
		var clickY = event.offsetY || event.layerY;
	
		if (this._isInCorrectEditMode() && this._isValidClick(target, clickX, clickY)) {
		
			this._isSelecting = true;
	
			this._textboxUpConnects.push( dojo.connect(this._textboxNode, "onmouseup", this, "_onImgMouseUp") );

			dojo.stopEvent(event);
		}
	},
	
	_onImgMouseMove: function(event) {
		var target = event.target || event.srcElement;
		
		var clickX = event.offsetX || event.layerX;
		var clickY = event.offsetY || event.layerY;
	
		if (this._isValidClick(target, clickX, clickY)) {
			dojo.style( this._textboxNode, "cursor", "move");
		}
		else {
			dojo.style( this._textboxNode, "cursor", "");
		}
	
		if (this._isSelecting)
			dojo.stopEvent(event);
	},

	_onImgMouseUp: function(event) {
		// select the textbox
		if (!this._selectTextBox())
			return;

		// close context menu
		pe.lotusEditor.getShell().dismissContextMenu();
		
		dojo.stopEvent(event);
		
		this._isSelecting = false;
		
		// unregister mouse move and up on imgNode
		for(var i = 0; i < this._textboxUpConnects.length; i++)
		{
			dojo.disconnect(this._textboxUpConnects[i]);
		}
		
		this._textboxUpConnects = [];
	},
	
	_selectTextBox: function(event) {
		if (!this._isInCorrectEditMode() || this._static.selectedModelID == this._ownerView.model.id)
			return false;
	
		// select the range
		var selection = pe.lotusEditor.getSelection();
		var start = {"obj": this._ownerView, "line": this._ownerView.parent, "index": 0};
		var end = {"obj": this._ownerView, "line": this._ownerView.parent, "index": 1};
		selection.beginSelect(start);
		selection.endSelect(end);
		
		return true;
	},
	
	// create
	create: function(parentNode, ownerNode) {
		// base method
		this.inherited(arguments);
		
		// unregister image mouse down event
		for(var i = 0; i < this._textboxDownMoveConnects.length; i++)
		{
			dojo.disconnect(this._textboxDownMoveConnects[i]);
		}
		this._textboxDownMoveConnects = [];
		
		// save current node reference
		this._textboxNode		= ownerNode;
		
		// register image node event
		this._textboxDownMoveConnects.push( dojo.connect(this._textboxNode, "onmousedown", this, "_onImgMouseDown") );
		this._textboxDownMoveConnects.push( dojo.connect(this._textboxNode, "onmousemove", this, "_onImgMouseMove") );
	},
});	// end dojo.declare