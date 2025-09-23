dojo.provide("writer.view.AnchorView.FLTextBox");
dojo.require("writer.view.AnchorView.AnchorTextBox");
// float textbox
dojo.declare("writer.view.AnchorView.FLTextBox",[writer.view.AnchorView.AnchorTextBox],
{
	className: "FLTextBox",
	calcuSpace:function(line,p,body){
		p = p||pwriter.util.ViewTools.getParagraph(line);
		body = body||writer.util.ViewTools.getTextContent(p);
		var top = this.marginTop + p.top;
		var left = this.marginLeft + p.left;
		var newSpace = new common.Space(this.iw + this.paddingLeft + this.paddingRight, this.ih + this.paddingTop + this.paddingBottom, left, top, this);
		return newSpace;
	},
	isContainedByBodyV: function(body) {
		return true;
	}
}
);

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.FLTXBX]=writer.view.AnchorView.FLTextBox;