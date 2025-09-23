dojo.require("writer.view.AnchorView.AnchorCanvas");
dojo.provide("writer.view.AnchorView.FLCanvas");

dojo.declare("writer.view.AnchorView.FLCanvas", [ writer.view.AnchorView.AnchorCanvas], {
	className: "FLCanvas",
	calcuSpace:function(line,p,body){
		p = p||pwriter.util.ViewTools.getParagraph(line);
		body = body||writer.util.ViewTools.getTextContent(p);
		var top = this.marginTop + p.top;
		var left = this.marginLeft + p.left;
		var newSpace = new common.Space(this.iw + this.padLeft + this.padRight, this.ih + this.padTop + this.padBottom, left, top, this);
		return newSpace;
	},
	isContainedByBodyV: function(body) {
		return true;
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.FLCANVAS] = writer.view.AnchorView.FLCanvas;
