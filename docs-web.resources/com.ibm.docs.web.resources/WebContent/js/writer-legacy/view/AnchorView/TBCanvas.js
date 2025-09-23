dojo.require("writer.view.AnchorView.AnchorCanvas");
dojo.provide("writer.view.AnchorView.TBCanvas");

dojo.declare("writer.view.AnchorView.TBCanvas", [ writer.view.AnchorView.AnchorCanvas], {
	className: "TBCanvas",
	layout:function(line){
		//layout using parent's layout
		this.inherited(arguments);
		//occpy space
		var p = writer.util.ViewTools.getParagraph(line);
		var body = writer.util.ViewTools.getTextContent(p);
		this.ownedSpace = this.calcuSpace(line, p, body);
		body.occupy(this.ownedSpace);
		
	},
	calcuSpace:function(line,p,body){
		p = p||pwriter.util.ViewTools.getParagraph(line);
		body = body||writer.util.ViewTools.getTextContent(p);
		var left = this.marginLeft + p.left;
		var right = left + this.getWholeWidth();
		if (left > 0) left = 0;
		var top = this.marginTop + p.top;
		var spaceW = body.bodySpace.w;
		if (right > spaceW) spaceW = right;
		spaceW -= left;
		var spaceH = this.ih + this.distant.top + this.distant.bottom + this.padTop + this.padBottom;
		var newSpace = new common.Space(spaceW, spaceH, left, top, this);
		return newSpace;
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.TBCANVAS] = writer.view.AnchorView.TBCanvas;
