dojo.provide("writer.view.selection.AnchorTBResizerView");

dojo.require("writer.view.selection.TextBoxResizerView");

dojo.declare("writer.view.selection.AnchorTBResizerView",[writer.view.selection.TextBoxResizerView],
{
	// getViewSize
	_getViewSize: function() {
		var w = this._ownerView.iw + this._ownerView.paddingLeft + this._ownerView.paddingRight;
		var h = this._ownerView.ih + this._ownerView.paddingTop + this._ownerView.paddingBottom;
	
		return { "offX": 0, "offY": 0, "w": w, "h": h };
	}
});	// end dojo.declare