dojo.provide("writer.view.AnchorView.FloatImageView");
dojo.require("writer.view.AnchorView.AnchorImageView");

dojo.declare("writer.view.AnchorView.FloatImageView",[writer.view.AnchorView.AnchorImageView],
{
	className: "FloatImage",
	calcuSpace:function(line,p,body){
		p = p||pwriter.util.ViewTools.getParagraph(line);
		body = body||writer.util.ViewTools.getTextContent(p);
		var top = this.marginTop - this.padLeft + p.top;
		var left = this.marginLeft - this.padTop + p.left;
		var newSpace = new common.Space(this.iw + this.padLeft + this.padRight, this.ih + this.padTop + this.padBottom, left, top, this);
		return newSpace;
	},
	isContainedByBodyV: function(body) {
		return true;
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.FLIMAGE]=writer.view.AnchorView.FloatImageView;