dojo.provide("writer.view.AnchorView.SquareImageView");
dojo.require("writer.view.AnchorView.AnchorImageView");

dojo.declare("writer.view.AnchorView.SquareImageView",[writer.view.AnchorView.AnchorImageView],
{
	className: "SquareImage",
	layout:function(line){
		this.inherited(arguments);
		var p = writer.util.ViewTools.getParagraph(line);
		var body = writer.util.ViewTools.getTextContent(p);
		//update this line 
		var nextSpace = body.bodySpace.getNextSpaceY(body.offsetY);
		line.marginTop = nextSpace.y - body.offsetY;
		//this.ownedSpace = this.calcuSpace(line, p, body);
		// The parent has occupied space already.
//		if (this.ifCanOccupy(body))
//			body.occupy(this.ownedSpace);
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

		var bodyWidth = body.getWidth();
		if (spaceLeft > 0 && spaceLeft < this._MIN_SPACE_MARGIN)
		{
			spaceLeft = 0;
			spaceW = spaceW + (this._MIN_SPACE_MARGIN - spaceLeft);
		}
		if (bodyWidth > spaceLeft + spaceW && bodyWidth - (spaceLeft + spaceW) < this._MIN_SPACE_MARGIN)
		{
			spaceW = bodyWidth - spaceLeft;
		}
		
		var newSpace = new common.Space(spaceW, spaceH, spaceLeft, spaceTop, this);
		return newSpace;
	},
	
	modifyWrapText: function(wrapText)
	{
		// generate value
		var oldWrapText = this.model.wrapSquare.wrapText;
		var newWrapText = wrapText;
		
		// set wrapText
		this.model.setWrapText(wrapText);
		
		// send message
		var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute, [WRITER.MSG.createSetAttributeAct( this.model,null,null,{'wrapText':newWrapText },{'wrapText': oldWrapText } )] );
		WRITER.MSG.sendMessage( [msg] );
	}
});

writer.model.Model.prototype.viewConstructors[writer.MODELTYPE.SQIMAGE]=writer.view.AnchorView.SquareImageView;