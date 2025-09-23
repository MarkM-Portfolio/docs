dojo.provide("writer.view.Header");

dojo.require("writer.view.HeaderFooter");

dojo.declare("writer.view.Header",
[writer.view.HeaderFooter], {

	isHeader: true,

	getViewType:function(){
		return 'page.Header';
	},
	layout: function(init){
		var offsetY = 0;
		this.contentTop = 0;
		//TODO: not good to use internal var
		this.top = this.page._pageMargin.header;
		var para = this.container.getFirst();
		while(para){
			para.parent = this;
			para.left = 0;
			para.top = offsetY;
			para.layout(this);
			offsetY = offsetY+ para.h;
			para = this.container.next(para);
		}
		
		// if offsetY is over max percent of body height, then cut it
		this.contentHeight = offsetY;
		offsetY = this._checkHeight(offsetY);
		var delH = offsetY - this.bodySpace.h;
		if (this.bodySpace.h<offsetY){
			this.bodySpace.h = offsetY;
		}

		this._updateAnchor();

		if(init){
			if (delH > 0)
				this.getPage().notifyUpdate([this.getPage(),{height:delH},"fromHeader"],"changePageSetup");
		}
	},
	_updateHeaderFooterHeight:function(delH){
		if(delH == 0)
			return;

		this.contentTop = 0;

		if (this.domNode)
			dojo.style(this.domNode,{height:this.bodySpace.h+"px"});
		if(this.titleNode)
			dojo.style(this.titleNode,{top:this.bodySpace.h+"px"});
		if(this.bottomNode) {
			dojo.style(this.bottomNode,{top:this.bodySpace.h+"px"});
		}

		this._updateAnchor();

		this.getPage().notifyUpdate([this.getPage(),{height:delH},"fromHeader"],"changePageSetup");		
	}

});

