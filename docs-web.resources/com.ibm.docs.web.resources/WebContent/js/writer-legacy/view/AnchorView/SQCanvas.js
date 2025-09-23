dojo.provide("writer.view.AnchorView.SQCanvas");
dojo.require("writer.view.AnchorView.AnchorCanvas");

dojo.declare("writer.view.AnchorView.SQCanvas", [ writer.view.AnchorView.AnchorCanvas], {
	className: "SQCanvas",
	layout:function(line){
		//layout using parent's layout
		this.inherited(arguments);
		//occpy space
		var p = writer.util.ViewTools.getParagraph(line);
		var body = writer.util.ViewTools.getTextContent(p);
		//update this line 
		var nextSpace = body.bodySpace.getNextSpaceY(body.offsetY);
		line.marginTop = nextSpace.y - body.offsetY;
		
		var newSpace = this.calcuSpace(line, p, body);
		if(this.ownedSpace && !this.ownedSpace.equals(newSpace)){
			body.releaseSpace(this.ownedSpace);
			this.ownedSpace = newSpace;
			body.occupy(this.ownedSpace);
		}
	},
	calcuSpace:function(line,p,body){
		p = p||pwriter.util.ViewTools.getParagraph(line);
		body = body||writer.util.ViewTools.getTextContent(p);
		var top = this.marginTop + p.top;
		var left = this.marginLeft + p.left;
		var marginLeft	= this.marginLeft - this.distant.left - this.padLeft;
		var marginRight = body.getWidth() - this.marginLeft - this.iw - this.distant.right - this.padRight;
		
		var spaceW		= this.iw + this.distant.left + this.distant.right + this.padLeft + this.padRight;
		var spaceH		= this.ih + this.distant.top + this.distant.bottom + this.padTop + this.padBottom;
		var spaceLeft	= left-this.distant.left - this.padLeft;
		var spaceTop	= top-this.distant.top - this.padTop;
		
		if (this.model.wrapSquare && this.model.wrapSquare.wrapText) {
			switch (this.model.wrapSquare.wrapText) {
				case "left":
					spaceW = spaceW + marginRight;
					break;
				case "right":
					spaceLeft = p.left;
					spaceW = spaceW + marginLeft;
					break;
				case "largest":
					if (marginLeft >= marginRight) {
						spaceW = spaceW + marginRight;
					} else {
						spaceLeft = p.left;
						spaceW = spaceW + marginLeft;
					}
					break;
			}
		}
		
		var newSpace = new common.Space(spaceW, spaceH, spaceLeft, spaceTop, this);
		return newSpace;
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.SQCANVAS] = writer.view.AnchorView.SQCanvas;
