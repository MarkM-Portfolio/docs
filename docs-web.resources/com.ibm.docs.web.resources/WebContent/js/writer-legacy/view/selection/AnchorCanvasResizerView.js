dojo.provide("writer.view.selection.AnchorCanvasResizerView");

dojo.require("writer.view.selection.CanvasResizerView");

dojo.declare("writer.view.selection.AnchorCanvasResizerView",[writer.view.selection.CanvasResizerView],
{
	// getViewSize
	_getViewSize: function() {
		return { "offX": this._ownerView.padLeft, "offY": this._ownerView.padBottom,
				"w": this._ownerView.iw,
				"h": this._ownerView.ih };
	},
	
	_beginResize: function() {
	},
	
	_endResize: function() {
	},
	
	// draw owner node while resizing
	_drawOwner: function(left, bottom, width, height) {
		// todo
	}
});	// end dojo.declare