dojo.provide("writer.view.Page");
dojo.require("writer.view.Body");
dojo.require("writer.view.Header");
dojo.require("writer.view.Footer");
dojo.require("writer.util.SectionTools");
dojo.require("writer.model.Settings");
writer.view.Page=function(doc,section, previousPage){
	var secTools = writer.util.SectionTools;
	var setting = pe.lotusEditor.setting;
	this.section = section;
	this._pageSize = section.pageSize;
	this._pageMargin = section.pageMargin;
	//define this page's left position to make the page at the center of document
	this.updateLeftAttr(doc);
	
	this.parent = doc;
	this.container = new common.Container(this);
	var left = this._pageMargin.left;
	var bodywidth = this._pageSize.w - this._pageMargin.left - this._pageMargin.right;
	this.bodywidth = bodywidth;
	this.pageNumber = 1;
	
	// is first page?
	this.isFirstPage = !(previousPage && (previousPage.section==this.section));
	this.isDiffFirstPage = section.firstDifferent && this.isFirstPage;
	
	// is even page?
	this.isEvenPage = false;
	this.isOddPage = false;
	
	if ( previousPage && !isNaN(previousPage.pageNumber)){
		this.pageNumber = parseInt(previousPage.pageNumber) + 1;
	}
	
	if (setting.isDiffOddEvenPages()){
		this.isEvenPage = (this.pageNumber%2 ==0);
		this.isOddPage = (this.pageNumber%2 ==1); 
	}
	
	// get linked header/footer section
	var linkedSecOfFirstPageHeader	= section;
	var linkedSecOfFirstPageFooter 	= section;
	var linkedSecOfDefaultHeader	= section;
	var linkedSecOfDefaultFooter	= section;
	var linkedSecOfEvenHeader		= section;
	var linkedSecOfEvenFooter		= section;

	// get first page header/footer section
	if (this.isDiffFirstPage)
	{
		linkedSecOfFirstPageHeader = secTools.getHFSectionLinkedTo(section, writer.HF_TYPE.FIRST_HEADER);
		linkedSecOfFirstPageFooter = secTools.getHFSectionLinkedTo(section, writer.HF_TYPE.FIRST_FOOTER);
	}
	
	// get default page header/footer section
	linkedSecOfDefaultHeader = secTools.getHFSectionLinkedTo(section, writer.HF_TYPE.DEFAULT_HEADER);
	linkedSecOfDefaultFooter = secTools.getHFSectionLinkedTo(section, writer.HF_TYPE.DEFAULT_FOOTER);
	
	// get even header/footer section
	if (this.isEvenPage)
	{
		linkedSecOfEvenHeader = secTools.getHFSectionLinkedTo(section, writer.HF_TYPE.EVEN_HEADER);
		linkedSecOfEvenFooter = secTools.getHFSectionLinkedTo(section, writer.HF_TYPE.EVEN_FOOTER);
	}
	
	// get right header/footer
	var thisHeader, thisFooter;
	if (this.isDiffFirstPage){
		thisHeader = linkedSecOfFirstPageHeader.firstHeader;
		thisFooter = linkedSecOfFirstPageFooter.firstFooter;
	}else if (this.isEvenPage){
		thisHeader = linkedSecOfEvenHeader.evenHeader;
		thisFooter = linkedSecOfEvenFooter.evenFooter;
	}else{
		thisHeader = linkedSecOfDefaultHeader.defaultHeader;
		thisFooter = linkedSecOfDefaultFooter.defaultFooter;
	}
	
	if (pe.scene.isNote())
	{
		thisHeader = thisFooter = null;
	}
	
	// create header/footer
	if (thisHeader){
		var headerModel = doc.relations.getHeaderFooterById(thisHeader);
		if (headerModel){
			var headerMinH = section.getHeaderMinH();
			var headerSpace = new common.Space(bodywidth, headerMinH);
			this._header = new writer.view.Header(this, headerModel, headerSpace, left);
			this._header.layout();
		}
	}
	if (thisFooter){
		var footerModel = doc.relations.getHeaderFooterById(thisFooter);
		if (footerModel){
			var footerMinH  = section.getFooterMinH();
			var footerSpace = new common.Space(bodywidth, footerMinH);
			this._footer = new writer.view.Footer(this, footerModel, footerSpace, left);
			this._footer.layout();
		}
		
	}

	if (this._footer)
	{
		if (this._header)
			this._header._updateAnchor();
	}

	var top;
	if (this._header){
		top = Math.max(this._pageMargin.header + this._header.getHeight(),this._pageMargin.top);
	}else{
		top = this._pageMargin.top;
	}
	var bodyheight;
	if (this._footer){
		bodyheight =  this._pageSize.h - top - Math.max(this._footer.getHeight(),this._pageMargin.bottom);
	}else{
		bodyheight =  this._pageSize.h - top - this._pageMargin.bottom;
	}
	
	if (section.cols && section.cols.num>1){
		var colarray = section.cols.col;
		var defaultspace = common.tools.toPxValue(section.cols.space);
		bodywidth =( bodywidth  - (section.cols.num-1) * defaultspace)/section.cols.num;
		
		for (var i=0;i<section.cols.num;i++){
			var width,currentSpace;
			if (colarray && colarray[i]){
				width = common.tools.toPxValue(colarray[i].w);
				currentSpace = common.tools.toPxValue(colarray[i].space);
			}
			if (section.cols.equalWidth == "1" || !width || width == 0){
				width =bodywidth;
			}
			
			if (!currentSpace || currentSpace == 0){
				currentSpace = defaultspace;
			}
			var space = new common.Space(width, bodyheight);
			var body = new writer.view.Body(this, space, left, top);
			left = left + width + currentSpace;
			this.container.append(body);
		}
		
	}else{
		var space = new common.Space(bodywidth, bodyheight);
		var body = new writer.view.Body(this, space, left, top);
		this.container.append(body);
	}
	
};

writer.view.Page.prototype = {
	pageNumber:0,
	section: null,
	_pageSize: null,
	_pageMargin: null,
	_header: null,
	_footer: null,
	_topLeftBorderDom : null,
	_topRightBorderDom : null,
	_bottomLeftBorderDom : null,
	_bottomRightBorderDom : null,
	_borderWidth: 24,
	left:0,
	top:0,
	updatePageNumber: function()
	{
		var previousPage = this.previous();
		if (previousPage)
			this.pageNumber = parseInt(previousPage.pageNumber) + 1;
		else
			this.pageNumber = 1;
	},
	getBottom: function(){
		return this.top+ this._pageSize.h;
	},
	getWidth: function()
	{
		return this._pageSize.w;
	},
	getHeight: function(){
		return this._pageSize.h;
	},
	getBodyWidth: function(){
		return this.bodywidth;
	},
	getViewType:function(){
		return 'page.Page';
	},
	getLastBody: function(){
		return this.container.getLast();
	},
	getFirstBody: function(){
		return this.container.getFirst();
	},
	getPreviousBody: function(currentbody){
		return this.container.prev(currentbody);
	},
	getNextBody: function(currentbody){
		return this.container.next(currentbody);
	},
	isDeleted: function()
	{
		return this._deleted;
	},
	destroy: function()
	{
		this._deleted = true;
		this.destroyHeaderFooter();
	},
	destroyHeaderFooter: function()
	{
		// release header/footer
		this._header && this._header.destroy();
		this._footer && this._footer.destroy();
	},
	isEmpty:function(){
		var firstBody = this.getFirstBody();
		while(firstBody){
			if(!firstBody.isEmpty()){
				return false;
			}
			firstBody = this.getNextBody(firstBody);
		}
		return true;
	},
	getContainer:function(){
		return this.container;
	},
	getContentLeft:function(){
		return this.left;
	},
	getContentTop:function(){
		return this.top;
	},
	/**
	 * 
	 * @param x
	 * @param y
	 * @returns header,footer or body
	 */
	getEditorArea: function(x,y){
		var body = this.container.getFirst();
		var nextbody = body;
		while(nextbody){
			var anchor = nextbody.getAnchorObject(x - body.left, y - body.top);
			if (anchor && writer.util.ViewTools.isTextBox(anchor))
				return anchor;
			nextbody = this.container.next(nextbody);
		}
		nextbody = this.container.next(body);
		while(nextbody && nextbody.left<x){
			body = nextbody;
			nextbody = this.container.next(body);
		}
		if (!body){
			return null;
		}
		if(pe.lotusEditor.isHeaderFooterEditing()){
			var inHeader = false;
			if(this._header&&(this._header.contentHeight+this._header.top>=y||body.top>y)){
				inHeader = true;
			}
			if(inHeader){
				//select from header
				return this._header;
			}else if (this._footer && y>(body.top + body.getHeight())){
				//select from footer
				return this._footer;
			}
		}
		return body.getEditorArea(x-body.left,y-body.top);
	
	},
	isPointInHeaderFooter: function(x, y)
	{
		var body = this.container.getFirst();
		var nextbody = body;
		while(nextbody){
			var anchor = nextbody.getAnchorObject(x - body.left, y - body.top);
			if (anchor && writer.util.ViewTools.isTextBox(anchor))
				return null;
			nextbody = this.container.next(nextbody);
		}
		nextbody = this.container.next(body);
		while(nextbody && nextbody.left<x){
			body = nextbody;
			nextbody = this.container.next(nextbody);
		}
		if (!body){
			return null;
		}
		var ret = {};
		ret.page = this;
		if(y<body.top){
			//select from header
			ret.bHeader			= true;
			ret.headerfooter	= this._header;
			return ret;
		}else if (y>(body.top + body.getHeight())){
			//select from footer
			ret.bHeader			= false;
			ret.headerfooter	= this._footer;
			return ret;
		}
		return null;
	},
	getElementPath: function(x,y,path, options ){
		var body = this.container.getFirst();
		var nextbody = this.container.next(body);
		while(nextbody && nextbody.left<x){
			body = nextbody;
			nextbody = this.container.next(body);
		}
		if (!body){
			return null;
		}
		if (pe.lotusEditor.isHeaderFooterEditing()){
			var inHeader = true;
			if (this._header && !this._footer)
				inHeader = true;
			else if (!this._header && this._footer)
				inHeader = false;
			else
			{
				if (y <= this.getHeight() * 0.5)
					inHeader = true;
				else
					inHeader = false;
			}
			
			if(inHeader){
				//select from header
			    return this._header.getElementPath(x- this._header.left, y- this._header.getContentTopToPage(), path, options);
			}else{
				//select from footer
				return this._footer.getElementPath(x- this._footer.left, y- this._footer.getContentTopToPage(), path, options);
			}
			return null;
		}
		
		return body.getElementPath(x- body.left, y- body.top, path, options);
		
	},
	getHeaderType: function(){
		if (this.isDiffFirstPage)
			return writer.HF_TYPE.FIRST_HEADER;
		else if (this.isEvenPage)
			return writer.HF_TYPE.EVEN_HEADER;
		else
			return writer.HF_TYPE.DEFAULT_HEADER;
	},
	getFooterType: function(){
		if (this.isDiffFirstPage)
			return writer.HF_TYPE.FIRST_FOOTER;
		else if (this.isEvenPage)
			return writer.HF_TYPE.EVEN_FOOTER;
		else
			return writer.HF_TYPE.DEFAULT_FOOTER;
	},
	getHeader: function(){
		return this._header;
	},
	getFooter: function(){
		return this._footer;
	},
	getSection: function(){
		return this.section;
	},
	notifyUpdate:function(view,type){
		if(!this.getParent().notifyUpdate){
			console.error("notifyUpdate is need");
			return;
		}
		this.getParent().notifyUpdate(view,type);
	},
	
	_updatePageBorder: function()
	{
		if(!this._topLeftBorderDom)
		{
			var baseStyle = "position:absolute; z-index:-20001; width:" + this._borderWidth + "px;";
			var heightStyle = " height:" + this._borderWidth + "px;";
			
			var borderStyle = "1px solid #ADADAD;";
			var topBorder = "border-top:" + borderStyle;
			var leftBorder = "border-left:" + borderStyle;
			var rightBorder = "border-right:" + borderStyle;
			var bottomBorder = "border-bottom:" + borderStyle;
			
			var topPos = "top:" + (this._pageMargin.top - this._borderWidth) + "px;";
			var leftPos = "left:" + (this._pageMargin.left - this._borderWidth)+"px;";
			var rightPos = "left:" + (this._pageSize.w - this._pageMargin.right) + "px;";
			var bottomPos = "top:" + (this._pageSize.h - this._pageMargin.bottom) + "px;";
			
			var height = Math.min(this._borderWidth, this._pageMargin.bottom);
			this._topLeftBorderDom = dojo.create("div",
					{"style":baseStyle + heightStyle + topPos + leftPos + rightBorder + bottomBorder}, 
					this.domNode);
			this._topRightBorderDom = dojo.create("div",
					{"style":baseStyle + heightStyle + topPos + rightPos + leftBorder + bottomBorder},
					this.domNode);
			this._bottomLeftBorderDom = dojo.create("div",
					{"style":baseStyle + "height:" + height + "px;" + leftPos + bottomPos + topBorder + rightBorder}, 
					this.domNode);
			this._bottomRightBorderDom = dojo.create("div",
					{"style":baseStyle + "height:" + height + "px;" + rightPos + bottomPos + topBorder + leftBorder},
					this.domNode);
		}
		
//		var displayTop = this._header ? "none": "";
//		this._topLeftBorderDom.style.display = displayTop;
//		this._topRightBorderDom.style.display = displayTop;
//		
//		var displayBottom = this._footer ? "none": "";
//		this._bottomLeftBorderDom.style.display = displayBottom;
//		this._bottomRightBorderDom.style.display = displayBottom;
	},
	
	// Defect 43776, IE browser's problem. 
	refreshImageDom: function(){
		if(!this.domNode)
			return;
		if(!this.domNode.firstChild)	// Empty dom. It's a page frame.
			return;
		
		var zIndex, img;
		var imgs = this.domNode.getElementsByTagName("img");
		for(var i = 0; i < imgs.length; i++)
		{
			img = imgs.item(i);
			zIndex = dojo.style(img, "zIndex");
			if(zIndex == "auto")
				zIndex = dojo.style(img.parentElement, "zIndex");
			
			if(zIndex == "auto" || isNaN(zIndex))
				continue;
			
			dojo.style(img, "zIndex", zIndex + 1);
			dojo.style(img, "zIndex", zIndex);
		}
	},
	renderFrame: function(){
		if(dojo.isIE == 9)
			return null;
		
		var cssStyle = "left:"+this.left+"px; top:"+this.top+"px;width:"+this._pageSize.w+"px;height:"+this._pageSize.h+"px;  position: absolute;";
		if(this.domNode){
			this.domNode.style.cssText = cssStyle;
			return;
		}
		
		var pageNode = dojo.create("div", {
			"class":"paging",
			"style":cssStyle
		});
		this.domNode = pageNode;
		if (pe.scene.isNote())
			this.domNode.style.height = "auto";
		return this.domNode;
	},
	
	//TODO: update header/footer or update page size
	render:function(){
		var bNote = pe.scene.isNote();
		var cssStyle = "left:"+this.left+"px; top:"+this.top+"px;width:"+this._pageSize.w+"px;height:"+this._pageSize.h+"px;  position: absolute;";
		if (this.domNode){
			//page is already there, so we update the style value
			this.domNode.style.cssText = cssStyle;
			
		}else{
			var pageNode = dojo.create("div", {
				"class":"paging",
				"style":cssStyle
			});
			this.domNode = pageNode;
		}
		
		if (this._header && !this._header.domNode){
			if (!bNote)
				this.domNode.appendChild(this._header.render());
		}
		if (this._footer && !this._footer.domNode){
			if (!bNote)
				this.domNode.appendChild(this._footer.render());
		}
		
		if (!bNote)
			this._updatePageBorder();
		
		var param = this.container.getFirst();
		while(param){
			if (param.isDirtyDOM() || !param.domNode){
				var childNode = param.render();
				if (!childNode.parentNode || childNode.parentNode!=this.domNode){
					this.domNode.appendChild(childNode);
				}
			}
			param = this.container.next(param);
		}
		if (bNote)
			this.domNode.style.height = "auto";
		return this.domNode;
	},

	// release dom node
	releaseDom: function() {
		if (this.domNode)
		{
			this._header && this._header.releaseDom();
			this._footer && this._footer.releaseDom();

			var param = this.container.getFirst();
			while(param){
				param.releaseDom();
				param = this.container.next(param);
			}
			this.domNode.innerHTML = "";
		}

//		if (this.parentNode)
//		{
//			this.parentNode.removeChild(this.domNode);
//			this.parentNode = null;
//		}
//		
		this.domNode = null;
	},
	
	/**
	 * insertHeaderFooter, and then layout
	 * @returns the header/footer view item
	 */
	insertHeaderFooter: function(msgList, headerFooterID, isHeader){
		var setting = pe.lotusEditor.setting;
		var section = this.section;
		var oldSectJson = section.toJson();
		var insertFirstPage = this.isDiffFirstPage && section.firstDifferent;
		var insertEvenPage = setting.isDiffOddEvenPages() && this.isEvenPage;
		if (insertFirstPage){
			if (isHeader){
				section.firstHeader = headerFooterID;
			}else{
				section.firstFooter = headerFooterID;
			}
		}else if (insertEvenPage){
			if (isHeader){
				section.evenHeader = headerFooterID;
			}else{
				section.evenFooter = headerFooterID;
			}
			
		}else{
			if (isHeader){
				section.defaultHeader = headerFooterID;
			}else{
				section.defaultFooter = headerFooterID;
			}
		}
		var actPair = WRITER.MSG.createReplaceKeyAct(section.getId(), oldSectJson, section.toJson(), WRITER.KEYPATH.Section);
		var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [actPair], WRITER.MSGCATEGORY.Setting);
		msgList.push(msg);
		var doc = this.parent;
		var model = doc.relations.getHeaderFooterById(headerFooterID);
		var bodywidth = this._pageSize.w - this._pageMargin.left - this._pageMargin.right;
		var left = this._pageMargin.left;
		var insert = function(currPage){
			if (isHeader){
				if (currPage._header){
					console.log("already has a header!!!");
					return;
				}
				var headerSpace = new common.Space(bodywidth, currPage._pageMargin.top - currPage._pageMargin.header);
				currPage._header = new writer.view.Header(currPage, model, headerSpace, left);
				currPage._header.layout(true);
				return currPage._header;
			}else{
				if (currPage._footer){
					console.log("already has a footer!!!");
					return;
				}
				var footerSpace = new common.Space(bodywidth, currPage._pageMargin.bottom - currPage._pageMargin.footer);
				currPage._footer = new writer.view.Footer(currPage, model, footerSpace, left);
				currPage._footer.layout(true);
				return currPage._footer ;
			}
		};
		
		var processPage = function(currPage){
			
			if (insertEvenPage){
				if (currPage.isEvenPage){
					//insert header or footer for this even page
					return insert(currPage);
				}
			}else{
				//insert default header/footer
				if (setting.isDiffOddEvenPages() && currPage.isEventPage || section.firstDifferent && currPage.isDiffFirstPage){
					//do nothing
				}else{
					return insert(currPage);
				}
			}
		};
		
		
		// create header/footer from first page to last in this section
		var firstPageInSection = this;
		var pageIt = firstPageInSection;
		var docView = pe.lotusEditor.layoutEngine.rootView;
		while(pageIt){
			firstPageInSection = pageIt;
			pageIt = docView.prePage(pageIt, true);
		}

		var ret = null;

		if (!insertFirstPage){
			pageIt = firstPageInSection;
			while(pageIt)
			{
				var newHD = processPage(pageIt);

				if (pageIt === this)
					ret = newHD;

				pageIt = docView.nextPage(pageIt, true);
			}
		}
		else
		{
			ret = insert(this);
		}
		
		return ret;
	},
	endWithPageBreak:function(){
		var firstBody = this.getFirstBody();
		while(firstBody){
			if(firstBody._endsWithPageBreak()){
				return true;
			}
			firstBody = this.getNextBody(firstBody);			
		}
		return false;
	},
	updateLeftAttr: function(doc){
		var scale = pe.lotusEditor.getScale();
		this.left =  Math.ceil( scale * (doc.docCenter - (this._pageSize.w / 2)) );
		var editorLeft = pe.scene.getEditorLeft(true);
		if(this.left + editorLeft < 0){
			this.left = -editorLeft;
		}
	}
	
};
common.tools.extend(writer.view.Page.prototype,new writer.view.AbstractView());