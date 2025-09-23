dojo.provide("writer.view.Document");
dojo.require("writer.view.update.BlockContainerView");
dojo.require("concord.util.BidiUtils");
dojo.require("writer.view.update.DocumentUpdate");
writer.view.Document=function(model){
	this.model = model;
	this.layoutEngine = model.layoutEngine;
	this.domNode = null;
	this.pages= new common.Container(this);
	this.renderedPages = [];
	// this used to put some pages that need update dom.
	// will be empty after this.render()
	this._pageUpdateFrom = null;
	this.settings = pe.lotusEditor.setting;
	this.relations = pe.lotusEditor.relations;
	this.init();
};
writer.view.Document.prototype = {
		ownerId:"rootView",
		needReleaseDom: false,
		model: null,
		layoutEngine: null,
		domNode: null,
		pages: null,
		_topMargin: 20,
		//define the document's left position
		docLeft: null,//300,
		//define the document's center position, if the page's width is 768px, then the page's left is : 384 - 768/2 = 0
		docCenter: 384,
		//partial render, the number of pages to be shown one time
		NUM_PRE_PAGES: 3,
		NUM_NEXT_PAGES: 4,
		height: 0,
		settings: null,
		relations: null, 
	init:function(){
		if (pe.scene.isNote())
		{
			this.docCenter = 0;
			this._topMargin = 0;
		}
		if(concord.util.browser.isMobile())
			this.needReleaseDom = true;
		else if(dojo.isIE == 9)
		{
			this.needReleaseDom = true;
		}	
		else if(dojo.isIE)
		{
			this.needReleaseDom = true;
			this.NUM_PRE_PAGES = 2 * this.NUM_PRE_PAGES;
			this.NUM_NEXT_PAGES = 2 * this.NUM_NEXT_PAGES;
		}	
		
		var that = this;
		this._handler = dojo.subscribe(writer.EVENT.LOAD_READY, function(){
			that._loadFinished = true;
			that._loadedPageCount = that.pages.length();
			dojo.publish(writer.EVENT.PAGE_NUMBER_CHANGED);
			if(that._handler != null)
			{
				dojo.unsubscribe(that._handler);
				that._handler = null;
			}
		});

		if(this.relations){
			var fnote = this.relations._relations["footnotes"];
			if(fnote){
				this.model.fnote = fnote;
				this.footNote = new common.Container(this);
			}
		}
		this.container = new common.Container(this);
		var contents = this.model.container;
		var c = contents.getFirst();
		while(c){
			var m = c.preLayout(this.getOwnerId());
			this.container.append(m);
			c = contents.next(c);
		}
		//transfer in to px
		if (this.sects){
			for (var i=0;i<this.sects.length;i++){
				//TODO:
			}
		}
		
		this.docLeft = pe.scene.getEditorLeft();
		if(this.model.modelType == writer.MODELTYPE.DOCUMENT)
		{
			pe.scene.addResizeListener(dojo.hitch(this,this.onEditorResized));
			var that = this;
			var handler = dojo.subscribe(writer.EVENT.LOAD_READY, function(){
				that._loadReady = true;
				dojo.unsubscribe(handler);
			});
		}
		if(!this._layoutEndnoteEachSect()){
			dojo.subscribe(writer.EVENT.LOAD_READY,this,this._appendEndNotesInSect);
		}		
	},
	onEditorResized:function(left){
		this.docLeft=left;
		var page = this.pages.getFirst();
		while(page)
		{
			page.updateLeftAttr(this);
			page = this.pages.next(page);
		}
//		this.render(pe.lotusEditor._shell._mainNode.scrollTop);
		this.render(pe.lotusEditor.getScrollPosition());
	},
	getViewType: function(){
		return 'text.Document';
	},
	/**
	 * Get the page number when the document has no change.
	 * Return -1 means the document has not load finished.
	 * @returns {Boolean}
	 */
	getOriginalPageCount:function()
	{
		if(this._loadedPageCount)
			return this._loadedPageCount;
		else
			return -1;
	},
	getPageCount:function(){
		return this.pages.length();
	},
	getPages: function(){
		return this.pages;
	},
	/**
	 * Page number start from 1.
	 * @param pageNumber
	 */
	getPage: function(pageNumber){
		return this.pages.getByIndex(pageNumber - 1);
	},
	getContainer:function(){
		return this.pages;
	},
	getBlockViews:function(){
		return this.container;
	},
	getParent: function(){},
	
	getContentLeft:function(){
		return 0;
	},
	getContentTop:function(){
		return this._topMargin;
	},
	
	getChildPosition:function(idx){
		var page = this.pages.getByIndex(idx);
		if(!page){
			page = this.container.getLast();
			return page.getChildPosition();
		}else{
			return page.getChildPosition(0);
		}
	},
	getScrollPage: function(startPosition)
	{
		if (!startPosition){
			startPosition = 0;
		}
		
		var page = this.pages.select(function(page){
			if (page.getBottom()>startPosition){
				return true;
			}
		});
		
		return page;
	},
	render:function(startPosition){
		if(!this.domNode){
			this.domNode = this.createDomNode();
			this.layoutEngine.editor.getEditorDIV().appendChild(this.domNode);
		}else{
			//update the editor area's height
			var trans = (this._loadReady && !pe.lotusEditor.inZoom )? "transition: all 0.3s ease 0s;" : "";
			this.domNode.style.cssText = "position: absolute; left: "+this.docLeft+"px; height:"+ this.height+ "px;"+this.getStyleStr() + trans;
		}
		if (!startPosition){
			startPosition = 0;
		}else
			startPosition = startPosition / pe.lotusEditor.getScale();
		var page = this.pages.select(function(page){
			if (page.getBottom()>startPosition){
				pe.lotusEditor.currFocusePage = page;
				return true;
			}
		});
		if (!page){
			// if not page, it should be the current pages smaller than previous pages, 
			// for sample before change style, the document includes 2 pages, when change font size smaller, the document may includes one page
			var page = this.pages.getLast();
		}
		
		/*
		 * partial render: find previous pages
		*/
		var scale = pe.lotusEditor.getScale();
		var preNum = this.NUM_PRE_PAGES, nextNum = this.NUM_NEXT_PAGES ;
		if(scale <= 0.5)
		{
			preNum *= 2;
			nextNum *= 2;
		}
		else if(scale <= 0.75)
		{
			preNum = Math.ceil( preNum/0.75 );
			nextNum = Math.ceil( nextNum/0.75 );
		}	
					
		var preCount = 0;
		var prePage = page;
		while(prePage && preCount < preNum)
		{
			var prePage = this.pages.prev(prePage);
			if (prePage)
			{
				++preCount;
				page = prePage;
			}
		}
		
		// Render Page frame.
		while(prePage)
		{
			var pageNode = prePage.renderFrame();
			if (pageNode && (!pageNode.parentNode || pageNode.parentNode!=this.domNode))
				this.domNode.appendChild(pageNode);
				
			prePage = this.pages.prev(prePage);
		}
		
		/*
		 * find render needed all previous & next pages
		*/
		var count = 0;
		var needRenderPages = [];
		while(page && count++ < nextNum + preCount){
			needRenderPages.push(page);
			page = this.pages.next(page);
		}
		
		// Render Page frame.
		while(page)
		{
			var pageNode = page.renderFrame();
			if (pageNode && (!pageNode.parentNode || pageNode.parentNode!=this.domNode) )
				this.domNode.appendChild(pageNode);
			page = this.pages.next(page);
		}

		// in mobile, release rendered page
		if (this.needReleaseDom && ((this.renderedPages.length + needRenderPages.length )> (preNum + nextNum)))
		{
			var ifCon = function(item, con)
			{
				for (var j = 0; j < con.length; ++j)
				{
					if (con[j] == item)
						return true;
				}

				return false;
			};
			for (var i = 0 ; i < this.renderedPages.length; ++i)
			{
				var rPage = this.renderedPages[i];
				// defect 45832, here we have to check if the rPage has been removed.
				// if the rPage has been removed, its children node may be reused by new pages, so
				// here we should not release the deleted page's dom.
				if (!ifCon(rPage, needRenderPages) && !rPage.isDeleted())
				{
					var pNode = rPage.getDomNode();
					if (pNode && pNode.parentNode == this.domNode)
						this.domNode.removeChild(pNode);

					rPage.releaseDom();
				}
			}
		}

		if (this.needReleaseDom)
			this.renderedPages = [];

		// partial render
		for (var i = 0; i < needRenderPages.length; ++i)
		{
			var nrPage = needRenderPages[i];
			var pageDomNode = nrPage.getDomNode();
			var isPageFrame = (pageDomNode && !pageDomNode.firstChild);
			var pageNode = nrPage.render();
			if (!pageNode.parentNode || pageNode.parentNode!=this.domNode){
				this.domNode.appendChild(pageNode);
				dojo.publish(writer.EVENT.PAGECREATED,[nrPage]);
			}else if(isPageFrame)
				dojo.publish(writer.EVENT.PAGECREATED,[nrPage]);
		}
		if (this.needReleaseDom)
			this.renderedPages = needRenderPages;

		// update dom if the page from here has been rendered.
		if (this._pageUpdateFrom && !this._pageUpdateFrom.isDeleted())
		{
			var updatePage = this._pageUpdateFrom;
			while (updatePage)
			{
				if (updatePage.domNode)
				{
					if (updatePage.domNode.firstChild)
						updatePage.render();
					else
						updatePage.renderFrame();
				}	
				updatePage = this.pages.next(updatePage);
			}
		}
		this._pageUpdateFrom = null;
		
		if (pe.scene.isNote())
			this.domNode.style.height = "auto";
		return this.domNode;
	},
	createDomNode:function(){
		var div = dojo.create("div", {
			"class": "document editingBody"+this.getCSSStyle(),
			"style":"position: absolute; left: "+this.docLeft+"px; height:"+ this.height+ "px;"+this.getStyleStr()
		});
		if (pe.scene.isNote())
			div.style.height = "auto";
		return div;
	},
	getStyle:function(){
		return this.model.getStyle();
	},
	getCSSStyle:function(){
		return this.model.getCSSStyle();
	},
	getStyleStr:function(){
		var style = this.getStyle();
		var str = "";
		for(var n in style){
			str += n+":"+style[n]+";";
		}
		str = concord.util.acf.escapeXml(str, true);
		return str;
	},
	removeEmptyPage: function(page){
		if (!page){
			console.log("ERROR: argument page can not bu null");
			return;
		}
		var next = this.pages.next(page);
		this.pages.remove(page);
		page.destroy();
		if (page.domNode && page.domNode.parentNode == this.domNode){
			this.domNode.removeChild(page.domNode);
			page.domNode = null;
			/*
			try{
				setTimeout(function(){
					dojo.destroy(page.domNode );
				}, 100);	
			}catch(e){
				console.error(e);
			}*/
		}
		
		if (next){
			this._alignPages(next);
		}
		this._updatePageNumber(next);
		this.height = this.pages.getLast().getBottom();
	},
	
	/**
	 * 
	 * @param section optional, if null, use the same section as previuos page
	 * @param previousPage, optional, if null, add the first page
	 * @returns {___page0}
	 */
	addPage:function(section, previousPage){
		if (!section){
			if (previousPage){
				console.log("WARNING: section argument is not used, so use the same section with previous page");
				section = previousPage.section;
			}else{
				console.log("WARNING: section argument is not used, so use the first section");
				section = this.settings.getFirstSection();
			}
		}
		if (pe.scene.isNote())
		{
			pe.scene.noteSection = section;
			pe.scene.checkNoteSection(section);
		}
		
		
		if (!section){
			console.log("ERROR: no section, don't know how to create page");
		}
		var page = new writer.view.Page(this, section,previousPage  );
//		page.parent= this;
		if (previousPage){
			this.pages.insertAfter(page, previousPage);
		}else{
			//create the first page
			var first = this.pages.getFirst();
			if (first){
				this.pages.insertBefore(page,first );
			}else{
				this.pages.append(page);
			}
			
		}
		this._alignPages(page);
		this._updatePageNumber(this.pages.next(page));

		// the old pages after the new page, must be imediatly updated the old dom
		// to avoid old page will overlap with new rendered pages.
		if (!this._pageUpdateFrom)
			this._pageUpdateFrom = this.pages.next(page);
		
		this.height = this.pages.getLast().getBottom();
		return page;
	},
	// update the page number from startPage, if startPage == null, nothing to do.
	_updatePageNumber: function(startPage)
	{
		if(!this._loadFinished)
			return;
		
		if (!this.pages){
			console.log("ERROR: no page is found!");
			return;
		}

		var current = startPage;
		while (current)
		{
			current.updatePageNumber();
			current = this.pages.next(current);
		}

		dojo.publish(writer.EVENT.PAGE_NUMBER_CHANGED);
	},
	_alignPages: function(startPage){
		if (!this.pages){
			console.log("ERROR: no page is found!");
			return;
		}
		var previous, current;
		if (!startPage){
			//startpage is not used, so I align all pages;
			previous = this.pages.getFirst();
			previous.top =0;
		}else{
			previous = this.pages.prev(startPage);
		}
		if (!previous){
			previous = startPage;
		}
		while(true){
			current = this.pages.next(previous);
			if (!current){
				break;
			}
			current.top = previous.getBottom() +this._topMargin;
			previous = current;
		}
		this.height = this.pages.getLast().getBottom();
	},
	_layoutEndnoteEachSect:function(){
		var endnotePr = this.settings.getEndnotePr();
		if(endnotePr&&endnotePr.isEndSect()&& this.settings.getSectionLength()>1){
			return true;
		}else{
			return false;
		}
	},
	/**
	 * 
	 * @param prevPara, the paragraph before the starting paragraph to be layed out, if null, layout from the first paragraph
	 * @param nextPara, the paragraph after the ending paragraph to be layed out, if null, layout till the last paragraph
	 */
	layout:function(prevPara,nextPara,isLastBlock){
		var currentSection,  para, prevPage;
		var currentPage,body;
		var sectionRecord=[];
		if (prevPara){
			prevPage = writer.util.ViewTools.getPage(prevPara);
			para = this.container.next(prevPara);
			if(prevPara.directProperty && prevPara.directProperty.getSectId()){
				currentSection = this.settings.getNextSection(prevPara.directProperty.getSectId());
			}else{
				body = writer.util.ViewTools.getBody(prevPara);
				var toMarkDirty = body;				
				currentPage = body && body.getParent();
				while(toMarkDirty){
					toMarkDirty.markDirtyDOM();
					toMarkDirty = currentPage.getNextBody(toMarkDirty)
				}
				currentSection = currentPage && currentPage.section;
			}			
		}else{
			prevPage = null;
			currentSection = this.settings.getFirstSection();
			para = this.container.getFirst();
		}
		if(!body){
			currentPage = this.addPage(currentSection,prevPage);
			body = currentPage.getFirstBody();
		}	
		
		var breakFn = null, noBidiWarning = true;
		var _cache = {};
		while(para && para != nextPara){
			if(!BidiUtils.isBidiOn() && noBidiWarning &&
				para.directProperty && para.directProperty.getDirection() == "rtl")
					noBidiWarning = false;

			// need to release the para's layout result
			var breakRet = body.append(para,breakFn, _cache);
			if(breakRet){
				if(breakRet.cn){
					if(breakRet.cn!=para){
						this.container.insertAfter(breakRet.cn,para);
					}else{
						para = this.container.prev(para);
					}
				}
				breakFn = breakRet.fn;
				var samepage = (nextPara!=null);
				body = body.next(samepage);
				if (!body){
					currentPage = this.addPage(currentSection, currentPage);
					body = currentPage.getFirstBody();
				}
			}
			// if this para is the last para for the currentSection, it is the time to layout the endnote for the current section
			if(this.isLastBlockInsect(para) ||isLastBlock ){
				sectionRecord.push(currentSection);
			}
			if(!breakRet){
				var sectId = para && para.directProperty && para.directProperty.getSectId();
				var tempPara = para ? this.container.next(para) : null;
				if (sectId &&sectId!=""&& tempPara && nextPara!= tempPara){
					//start a new section
					currentSection = this.settings.getNextSection(sectId);
					currentPage = this.addPage(currentSection, currentPage);
					body = currentPage.getFirstBody();
				}
			}			
			para = para ? this.container.next(para) : null;;
			
		}
		if(!noBidiWarning && !pe.scene.isHTMLViewMode())
			pe.scene.showTextMessage(dojo.i18n.getLocalization("writer","lang").BIDI_CONTENT_EDITING, 8000);

		while(breakFn){
			var breakRet = body.append(null,breakFn);
			if(breakRet){
				breakFn = breakRet.fn;
				body = body.next(false);
				if (!body){
					currentPage = this.addPage(currentSection, currentPage);
					body = currentPage.getFirstBody();
				}
			}else{
				breakFn = null;
			}
		}
	/*	this.appendEndNote();*/
		if(sectionRecord&&sectionRecord.length>0 &&this._layoutEndnoteEachSect()){
			for(var i=0;i<sectionRecord.length;i++){
				this._appendEndNotesInSect(sectionRecord[i]);
			}
			
		}
		if (nextPara){
			this._alignPages(currentPage);
		}
		
		this.height = this.pages.getLast().getBottom();
	},
	appendEndNote:function(){
		var endnotePr = this.settings.getEndnotePr();
		if(endnotePr&&endnotePr.isEndSect()&& this.settings.getSectionLength()>1){
			var firstSection = this.settings.getFirstSection();
			while(firstSection){
				this._appendEndNotesInSect(firstSection);
				firstSection =  this.settings.getNextSection(firstSection);
			}		
		}else{
			this._appendEndNotesInSect();
		}
	},
	_appendEndNotesInSect:function(currentSection,endnotes){
		if(!currentSection){
			currentSection = this.settings.getLastSection();
			endnotes = this.relations.notesManager.getAllEndNoteView();
		}		
		var page = currentSection&&this.getLastPageInSect(currentSection);
		if(!page){
			return;
		}
		if(!endnotes){
			endnotes = this.relations.notesManager.getEndNoteViewInSect(currentSection);
		}
		if(endnotes){
			var lastBody = page.getLastBody();
			var preBody = this.preBody(lastBody, true);
			while(preBody&&preBody.isEmpty()){
				lastBody = preBody;
				preBody = this.preBody(lastBody, true);
			}
			lastBody.releaseEndNoteLayout();
			endnotes = lastBody.appendEndNote(endnotes);
			if(lastBody.domNode&&!lastBody.isDirtyDOM()){
				lastBody.updateDOM4Endnote();
			}
			while(endnotes){
				var nextBody = this.nextBody(lastBody, true);
				if(!nextBody){
					page = this.addPage(currentSection, page);
					nextBody = this.nextBody(lastBody, true);
				}
				if(!nextBody){
					console.error("next body should be exist!");
					return 
				}
				lastBody = nextBody;
				lastBody.releaseEndNoteLayout();
				endnotes = lastBody.appendEndNote(endnotes);
				if(lastBody.domNode&&!lastBody.isDirtyDOM()){
					lastBody.updateDOM4Endnote();
				}
			}
		}
	},
	createBlankPage:function(){
		
	},
	listener:function(message,param){
		if(message=="append"){
			var models = param.models;
			this.append(models);
		}
	},
	
	markHeaderFooterEditing: function(isEditing){
		if (!this.domNode){
			return;
		}
		var removedClass = isEditing ? "editingBody" : "editingHF";
		var addedClass = isEditing ? "editingHF" : "editingBody" ;
		
		dojo.removeClass(this.domNode, removedClass);
		dojo.addClass(this.domNode, addedClass);
	},

	/**
	 * 
	 * @param x
	 * @param y
	 * @returns header,footer or body
	 */
	getEditorArea: function(x,y){
		var pages = this.pages;
		var firstPage = pages.getFirst();
		var h = firstPage.getHeight()+this._topMargin;
		//not each page is the same
		while(firstPage){
			if (firstPage.getBottom()>y){
				break;
			}
			firstPage = pages.next(firstPage);
		}
		if(firstPage){
			return firstPage.getEditorArea(x,y - firstPage.top);
		}else{
			return null;
		}
	},
	isPointInHeaderFooter: function(x,y)
	{
		var pages = this.pages;
		var firstPage = pages.getFirst();
		var h = firstPage.getHeight()+this._topMargin;
		//not each page is the same
		while(firstPage){
			if (firstPage.getBottom()>y){
				break;
			}
			firstPage = pages.next(firstPage);
		}
		if(firstPage){
			return firstPage.isPointInHeaderFooter(x,y - firstPage.top);
		}else{
			return null;
		}
	},
	getElementPath:function(x,y, options ){
		var pages = this.pages;
		var firstPage = pages.getFirst();
		var h = firstPage.getHeight()+this._topMargin;
		//not each page is the same
		while(firstPage){
			if (firstPage.getBottom()>y){
				break;
			}
			firstPage = pages.next(firstPage);
		}

		if (!firstPage)
		{
			// get last page
			firstPage = pages.getLast();
		}

		if(firstPage){
			var ret = [];
			ret.push(this);
			ret.push(firstPage);
			firstPage.getElementPath(x - firstPage.left,y - firstPage.top, ret, options );
			return ret;
		}else{
			return [];
		}
	},
	getHeight: function()
	{
		var lastPage = this.pages.getLast();
		if (lastPage)
		{
			return lastPage.getTop() + lastPage.getHeight() - this._topMargin;
		}

		return 0;
	},
	itemByPoint:function(x,y){
		return layoutEngine.shell.itemByPoint(x,y);
	},
	changePageSetup:function(page,del,from){
		var that = this;
		page.container.forEach(function(body){
			that.addChangedView(body);
			if(from=="fromHeader"){
				body.updateBodySpace(del.height,-del.height,0);
			}else{
				body.updateBodySpace(0,-del.height,0);
			}
		});
	},
	_getRelativeBody:function(view){
		return view.getParent();
	},
	getFristConteArea:function(){
		return this.pages.getFirst().getFirstBody().textArea;
	},
	getLastConteArea:function(){
		return this.pages.getLast().getLastBody().textArea;
	},
	notifyUpdate:function(args,type){
		if(!args instanceof Array){
			console.error("the arg must be array");
		}
		if(type){
			switch (type)
			{
				case "update":
					this.addChangedView(args[1]);
					break;
				case "changePageSetup":
					this.changePageSetup(args[0],args[1],args[2]);
					break;
				case "append":
					this.getLastConteArea().notifyUpdate(args,type);
					break;
				default:
					console.info("can not handle the update type: "+type);
			}
			
		}else{
			this.addChangedView(args[0]);
		}
		
	},
	preBody:function(body,theSameSec){
		var page = body.getParent();
		var prevBody = page.getContainer().prev(body);
		if(!prevBody){
			var prevPage = this.getContainer().prev(page);
			if(!prevPage){
				return null;
			}
			if(theSameSec&&prevPage.section!=page.section){
				page = null;
			}else{
				page = prevPage;
			}
			if(page){
				prevBody = page.getContainer().getLast();
			}
		}
		return prevBody;
	},
	nextBody:function(body,theSameSec){
		var page = body.getParent();
		var nextBody = page.getContainer().next(body);
		if(!nextBody){
			var nextPage = this.getContainer().next(page);
			if(!nextPage){
				return null;
			}
			if(theSameSec&&nextPage.section!=page.section){
				page = null;
			}else{
				page = nextPage;
			}
			if(page){
				nextBody= page.getContainer().getFirst();
			}
		}
		return nextBody;
	},
	nextBlockView:function(blockView,theSameSec){
		if(!blockView){
			return null;
		}
		if(theSameSec){
			var secId = blockView.directProperty && blockView.directProperty.getSectId();
			if(secId){
				// only the last view of model with section property will split the page.
				var nBlockView = this.container.next(blockView);
				if (!nBlockView || nBlockView.model != blockView.model)
					return null;
				else
					return nBlockView;
			}
//			if(blockView.endsWithPageBreak&& blockView.endsWithPageBreak()){
//				return null;
//			}
		}
		return this.container.next(blockView);
	},
	isLastBlockInsect:function(block){
		if(this.nextBlockView(block,true)){
			return false;
		}
		var secId = block.directProperty && block.directProperty.getSectId();
		return secId;
	},
	nextPage:function(currentPage,theSameSec){
		var page = this.pages.next(currentPage);
		if(theSameSec &&page&& page.section!=currentPage.section){
			return null;
		}
		return page;
	},
	prePage:function(currentPage,theSameSec){
		var page = this.pages.prev(currentPage);
		if(theSameSec &&page&& page.section!=currentPage.section){
			return null;
		}
		return page;
	},
	getLastPageInSect:function(sect){
		var pangeInSect = null;
		var firstPage = this.pages.getFirst();
		while(firstPage){
			if(firstPage.section==sect){
				pangeInSect = firstPage;
			}
			var nextPage = this.pages.next(firstPage);
			if((!nextPage||nextPage.section!=sect)&&pangeInSect){
				return pangeInSect;
			}
			firstPage = nextPage;
		}
	},
	hasLayouted:function(){
		return true;
	}
};
writer.model.Model.prototype.viewConstructors[writer.model.Document.prototype.modelType]=writer.view.Document;
common.tools.extend(writer.view.Document.prototype,new writer.view.AbstractView());
common.tools.extend(writer.view.Document.prototype,new writer.view.update.DocumentUpdate());