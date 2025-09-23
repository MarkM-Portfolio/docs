dojo.provide("writer.view.selection.AnchorImgResizerView");

dojo.require("writer.view.selection.ImgResizerView");

dojo.declare("writer.view.selection.AnchorImgResizerView",[writer.view.selection.ImgResizerView],
{
	// update after resize
	_resizeUpdate: function(){
		this._ownerView.model.markDirty();
		var paragraph = writer.util.ModelTools.getParagraph( this._ownerView.model );
		//paragraph.updateView();
		paragraph.parent.notifyUpdate([null, paragraph], "update");
		pe.lotusEditor.layoutEngine.rootView.update();
	},
	
	// getViewSize
	_getViewSize: function() {
		return { "offX": this._ownerView.padLeft, "offY": this._ownerView.padBottom,
				"w": this._ownerView.iw,
				"h": this._ownerView.ih };
	},
	
	_beginResize: function() {
		var node = this._ownerView.maskNode;
		dojo.style(node, "overflow", "visible");
	},
	
	_endResize: function() {
		var node = this._ownerView.maskNode;
		dojo.style(node, "overflow", "hidden");
	},
	
	// draw owner node while resizing
	_drawOwner: function(left, bottom, width, height) {
		// base method
		this.inherited(arguments);
		
		if (width < 0) left = left + width;
		if (height < 0) bottom = bottom + height;
		dojo.style(this._imgNode, "left",	(left - this._ownerView.padLeft - this._ownerView.getMaskLeft()) + "px");
		dojo.style(this._imgNode, "bottom",	(bottom - this._ownerView.padBottom - this._ownerView.getMaskBottom()) + "px");
	}
});	// end dojo.declare