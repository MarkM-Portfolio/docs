dojo.provide("writer.view.Footer");
dojo.require("concord.util.BidiUtils");
dojo.require("writer.view.HeaderFooter");

dojo.declare("writer.view.Footer",
[writer.view.HeaderFooter], {

	isFooter: true,

	getViewType:function(){
		return 'page.Footer';
	},
	layout: function(init){
		var offsetY = 0;
		this.contentTop = 0;
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
		offsetY = this._checkHeight(offsetY);
		this.contentHeight = offsetY;
		this.top = this.page.getHeight()- this.page._pageMargin.footer- Math.max(offsetY,this.bodySpace.h);

		var delH = 0;
		if (this.bodySpace.h<offsetY){
			delH = offsetY - this.bodySpace.h;
			this.bodySpace.h = offsetY;
		}
		else{
			var t = Math.max(this._origianSetting.h,offsetY);
			var delH = t - this.bodySpace.h;
			this.bodySpace.h = t;
			this.contentTop = this.bodySpace.h - offsetY;
		}
		
		// the footer top changed, need update anchor's position
		this._updateAnchor();

		if(init){
			this.getPage().notifyUpdate([this.getPage(),{height:delH},"fromFooter"],"changePageSetup");		
		}
			
	},
	_getContentNode: function(){
		return this.contentNode;
	},
	_createDOM:function(){
		var className = "footer";
		var pageNode = dojo.create("div", {
			   "class":"footerArea",
				"style":("position:absolute;left:0px;padding-left:"+ this.left+"px;padding-right:"+ this.left+"px;top:"+this.top+"px;width:"+this.bodySpace.w+"px;height:"+this.bodySpace.h+"px;z-index:-20001")
		});
		var nls = dojo.i18n.getLocalization("writer","lang");
		var page = this.getPage();
		var title = nls.footerTitle;
		if(page.isDiffFirstPage)
			title = nls.firstfooterTitle;
		else if(page.isOddPage)
			title = nls.oddfooterTitle;
		else if(page.isEvenPage)
			title = nls.evenfooterTitle;
		this.topNode = dojo.create("div", {
			"class":  className,
			"style":("position:absolute;left:0px;top:-6px;width:"+page.getWidth()+"px;height:6px;z-index:-19999")
		}, pageNode);
		var left = BidiUtils.isGuiRtl() ? 666.3 : 112;
		this.titleNode = dojo.create("div", {
			"class":   "footerTitle",
			"style":("position:absolute; top:-31px;left:"+left+"px; overflow:visible;z-index:-19999")
		}, pageNode);
		this.titleTextLeftNode = dojo.create("div", {		
			"class":   "footerTitleLeft",
			"style":("position:relative; top:0px;height:31px; overflow:visible;z-index:-19999")
		}, this.titleNode);
		this.titleTextNode = dojo.create("div", {
			innerHTML: title,
			"class":   "footerTitleContent",
			"style":("position:relative; top:0px; overflow:visible;z-index:-19999")
		}, this.titleNode);
		this.titleTextRightNode = dojo.create("div", {		
			"class":   "footerTitleRight",
			"style":("position:relative; top:0px;height:31px; overflow:visible;z-index:-19999")
		}, this.titleNode);
		this.titleTextTopNode = dojo.create("div", {		
			"class":   "footerTitleTop",
			"style":("position:relative; top:-1px;height:31px; overflow:visible;z-index:-19999")
		}, this.titleNode);		
		
		this.contentNode = dojo.create("div", {
			"style": ("position:absolute;left:0px;padding-left:"+ this.left+"px;padding-right:"+ this.left+"px;top:" + this.contentTop + "px;width:" + this.bodySpace.w + "px;height:0px")
		}, pageNode);
		
		var param = this.container.getFirst();
		while(param){
			var childNode = param.render();
			delete param.insertedDOM;
			this.contentNode.appendChild(childNode);
			param = this.container.next(param);
		}
		return pageNode;
	},
	getHeight:function(){
		return this.page.getHeight() - this.top;
	},
	getContentTop:function(){
		return this.getPage().getContentTop() + this.top + this.contentTop;
	},
	_updateHeaderFooterHeight:function(delH, offsetY){
		if(delH == 0)
			return;
		
		delH = Math.ceil(delH);
		this.top -= delH;
		this.contentTop = this.page.getHeight() - offsetY - this.page._pageMargin.footer - this.top;

		if (this.domNode)
			dojo.style(this.domNode,{height:this.bodySpace.h+"px",top:this.top+"px"});
		if (this.contentNode)
			dojo.style(this.contentNode, {top:this.contentTop + "px"});

		this._updateAnchor();

		this.getPage().notifyUpdate([this.getPage(),{height:delH},"fromFooter"],"changePageSetup");			
	}
});

