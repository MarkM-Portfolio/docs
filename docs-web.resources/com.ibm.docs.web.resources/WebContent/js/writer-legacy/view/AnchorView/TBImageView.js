dojo.provide("writer.view.AnchorView.TBImageView");
dojo.require("writer.view.AnchorView.AnchorImageView");

dojo.declare("writer.view.AnchorView.TBImageView",[writer.view.AnchorView.AnchorImageView],
{
	className: "TBImage",
	layout:function(line){
		this.inherited(arguments);
		var p = writer.util.ViewTools.getParagraph(line);
		var body = writer.util.ViewTools.getTextContent(p);
		//update this line 
		var nextSpace = body.bodySpace.getNextSpaceY(body.offsetY);
		line.marginTop = nextSpace.y - body.offsetY;
		//this.ownedSpace = this.calcuSpace(line, p, body);
		
		//if (this.ifCanOccupy(body))
			//body.occupy(this.ownedSpace);
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
		var spaceH = this.ih + this.distant.top + this.distant.bottom;
		var newSpace = new common.Space(spaceW, spaceH, left, top-this.distant.top, this);
		return newSpace;
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.TBIMAGE]=writer.view.AnchorView.TBImageView;