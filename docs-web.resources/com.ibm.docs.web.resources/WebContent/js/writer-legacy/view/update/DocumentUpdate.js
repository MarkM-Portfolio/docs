dojo.provide("writer.view.update.DocumentUpdate");
writer.view.update.DocumentUpdate=function(){
	
};
writer.view.update.DocumentUpdate.prototype={
	insertSection:function(view,sectId,forceExe){
		if(!forceExe){
			var args = [view,sectId,true];
			this.preUpdate(this.insertSection,args);
			return;
		}

		// check the view is last view of paragraph model?
		var nView = this.container.next(view);
		while (nView && nView.model == view.model)
		{
			view = nView;
			nView = this.container.next(view);
		}

		var nextSecStartBlock = this.container.next(view);
		
		// get current page
		var newSection = this.settings.getSection(sectId);
		var body = writer.util.ViewTools.getBody(view);
		var currentPage = body.getParent();

		var firstPageInSection, lastPageInSection = null;
		
		// search first page in this section
		var prevPage = currentPage;
		while(prevPage){
			firstPageInSection = prevPage;
			prevPage = this.prePage(prevPage, true);
		}
		
		// search last page in this section
		var nextPage = currentPage;
		while(nextPage){
			lastPageInSection = nextPage;
			nextPage = this.nextPage(nextPage, true);
		}
		
		//var isNeedAddNewPageInNextSection = (currentPage == lastPageInSection);
		
		// delete all pages before current page, and add a new page to rebuild new section.
		var newPage = this.addPage(newSection, this.prePage(firstPageInSection));
		var startBlock = firstPageInSection.getFirstBody().getTextAreaContainter().getFirst();
		if (!startBlock)
			console.error("startBlock is null!!!");
		this.removePages(firstPageInSection, lastPageInSection, true);
		var startBody = newPage.getFirstBody();
		startBody.releaseLayout();
		this._updateBody({cn:startBlock},startBody, true);
		
		// re search lastPageInSection
		var nextPage = newPage;
		while(nextPage){
			lastPageInSection = nextPage;
			nextPage = this.nextPage(nextPage, true);
		}
		
		// update next section page
		var setting = pe.lotusEditor.setting;
		var nextSec = setting.getNextSection(sectId);
		var nextSectionFirstPage = this.addPage(nextSec, lastPageInSection);
		
		startBlock = nextSecStartBlock;
		if (!startBlock)
			console.error("startBlock is null!!!!");
		startBody = nextSectionFirstPage.getFirstBody();
		startBody.releaseLayout();
		this._updateBody({cn:startBlock}, startBody);
		
		// align pages
		this._alignPages(newPage);
		this._updatePageNumber(this.pages.next(newPage));
	},
	deleteSection:function(view,sectId,forceExe){
		if(!forceExe){
			var args = [view,sectId,true];
			this.preUpdate(this.deleteSection,args);
			return;
		}
		var body = writer.util.ViewTools.getBody(view);
		var page = body.getParent();
		var startBlock = null;
		var firstPageInSection = page;
		var firstPageInNextSection = this.pages.next(page);
		if(!firstPageInNextSection){
			console.info("some special section case need to be handled!!");
			layoutEngine.editor.reset();
			return ;
		}
		var nextView = this.container.next(view);
		if(view&&view.isDeleted()){
			this.container.remove(view);
		}
		var prevPage = this.pages.prev(firstPageInSection);
		while(prevPage&&prevPage.section.id==sectId){
			firstPageInSection = prevPage;
			prevPage = this.pages.prev(prevPage);
		}		
		if(!firstPageInSection){
			startBlock = this.container.getFirst();
		}else{
			var firstBody = firstPageInSection.getFirstBody();
			startBlock   = firstBody.getTextAreaContainter().getFirst();
			if (startBlock.isDeleted())
			{
				if (nextView)
					startBlock = nextView;
			}
		}
		this.removePages(firstPageInSection, firstPageInNextSection);
		var startBody = firstPageInNextSection.getFirstBody();
		startBody.releaseLayout();
		this._updateBody({cn:startBlock}, startBody,true);
		
		var preFirstPage = this.prePage(firstPageInNextSection);
		this._alignPages(preFirstPage);
		this._updatePageNumber(preFirstPage);

		// update linked sections
		var setting = pe.lotusEditor.setting;
		for (var i = 0; i < setting.getSectionLength(); ++i)
		{
			var changedSec = setting.getSectionByIndex(i);
			this.updateSection(changedSec, false);
		}
	},
	updateSection : function(section, relayoutBlock){
		var page = this.pages.getFirst();
		while(page && page.section!= section){
			page = this.pages.next(page);
		}
		if (!page){
			console.log("ERROR: section not found in document");
			return;
		}
		dojo.publish(writer.EVENT.UPDATECHANGESECTION);
		var startPage = page;
		var endPage = page;
		
		while(page && page.section == section)
		{
			endPage = page;
			page = this.pages.next(page);
		}
		var startPageInNextSection = page;
		
		// relayout/re-append this section
		var newPage = this.addPage(section, this.prePage(startPage));
		var startBlock = startPage.getFirstBody().getStartBlock();
		this.removePages(startPage, endPage, true);
		var startBody = newPage.getFirstBody();
		startBody.releaseLayout();
		this._updateBody({cn:startBlock}, startBody, relayoutBlock);
		
		// align pages
		this._alignPages(newPage);
		this._updatePageNumber(this.pages.next(newPage));
		
		// render
		this.render(pe.lotusEditor.getScrollPosition());
	},
	partialLayout:function(startModel,endModel){
		if(!startModel){
			console.error("the start model can not be null");
			return;
		}
		var doc = this.model;
		startModel = doc.container.next(startModel); 
		var startView = this.container.getLast();
		while(startModel!=endModel){
			var view = startModel.preLayout(this.getOwnerId());
			 this.container.append(view);
			 startModel = doc.container.next(startModel); 
		}
		this.layout(startView,null,endModel==null);
		this._exePosUpdate();
	},
	update:function(){
		try
		{
			this._exePreUpdate();
		}
		catch(e)
		{
			console.error("error occurred in DocumentUpdate._exePreUpdate():" + e);
		}
		if(this.changedView&&this.changedView.length()>0){
			var firstBody = this.changedView.getFirst();
			while(firstBody){
				this.changedView.remove(firstBody);
				if(!this.bodyExist(firstBody)){
					firstBody=this.changedView.getFirst();
					continue;
				}
				var preBody = this.preBody(firstBody, true)||firstBody;
				var startView = firstBody.getFirstAppendView();
				if(!startView.cn){
					var nextBody = this.nextBody(firstBody,true);
					while(nextBody){
						var nextStartView = nextBody.getFirstAppendView();
						if(nextStartView.fn){
							startView.fn.appendAll(nextStartView.fn);
						}
						if(nextStartView.cn){
							startView.cn = nextStartView.cn;
							break;
						}else{
							nextBody = this.nextBody(nextBody,true);
						}
					}
				}

				var currSection = preBody.page.getSection();
				firstBody.releaseLayout();
				this._updateBody(startView, preBody);

				// update next sections,only odd/even change should update next section
				var setting = pe.lotusEditor.setting;
				if (setting.isDiffOddEvenPages())
				{
					var nextSection =  this.settings.getNextSection(currSection.getId());
					while (nextSection)
					{
						var ralayoutBlock = false;
						this.updateSection(nextSection, ralayoutBlock);
						nextSection =  this.settings.getNextSection(nextSection.getId());
					}
				}

				firstBody=this.changedView.getFirst();
			}			
		}
		this._exePosUpdate();
		this.updateNoteReferId();
	},	
	
	// note, this update method only affect the section that the view be in.
	_updateBody:function(startView,startBody,relayoutBlock){
		var footnote = startView.fn;
		var startBlock = startView.cn;
		while(startBlock||footnote){
			if(startBlock&&startBlock.isDeleted()){
				var t = this.container.next(startBlock);
				this.container.remove(startBlock);
				startBlock = t;
				continue;
			}
			var canMergeBlock = startBody.mergeContentView(startBlock);
			if(canMergeBlock){
				canMergeBlock.merge(startBlock);
				var nextBody = this.nextBody(startBody, true);
				if(nextBody){
					var container = nextBody.textArea.container;
					if(container.getFirst()==startBlock){
						nextBody.releaseLayout();
					}
				}
				this.container.remove(startBlock);
				startBlock = canMergeBlock;
			}
			if(footnote&&footnote.length()>0){
				startBody.markDirtyDOM();
				var firstNote = footnote.getFirst();
				var canMergeFootnote = startBody.mergeFootnoteView(firstNote);
				if(canMergeFootnote){
					canMergeFootnote.merge(firstNote);
					var nextNote =  footnote.next(firstNote);
					footnote.insertBefore(canMergeFootnote,firstNote);
					footnote.remove(firstNote);
					firstNote = nextNote ;
					while(firstNote && firstNote.model== canMergeFootnote.model){
						nextNote =  footnote.next(firstNote);
						canMergeFootnote.merge(firstNote);
						footnote.remove(firstNote);
						firstNote = nextNote ;
					}
				}
								
			}
			if(relayoutBlock){
				startBlock.releaseLayout&&startBlock.releaseLayout();
				footnote&&footnote.releaseLayout&&footnote.releaseLayout();
			}
			var breakView = startBody.append(startBlock,footnote); 
			if(!breakView){
				// append view to the body continuely;
				footnote = null;
				startBlock = this.nextBlockView(startBlock, true);
				startBody.markDirtyDOM();
			}else{
				if(breakView.cn != startBlock )
					startBody.markDirtyDOM();
				var nextBody = this.nextBody(startBody, true);
				if(!nextBody){
					var prePage = startBody.getParent();
					var page = this.addPage(prePage.section, prePage);
					nextBody = page.getFirstBody();
					startBody = nextBody;
				}else{
					// the next body donot need to change.
					if(!nextBody.toRelayout(breakView.cn,breakView.fn)){
						return;
					}
					nextBody.releaseLayout();
					startBody = nextBody;
					if(this.changedView && this.changedView.contains(startBody)){
						this.changedView.remove(startBody);
					}						
				}										
				footnote = breakView.fn;
				if(breakView.cn&&!this.container.contains(breakView.cn)){
					this.container.insertAfter(breakView.cn,startBlock);
				}
				if(breakView.cn){
					startBlock = breakView.cn;
				}else{
					startBlock = this.nextBlockView(startBlock, true);
				}
				
			}
		}
		var page = startBody.page;
		var lastPage = page;
		page = this.nextPage(page, true);
		while(page){
			var nextPage = this.nextPage(page, true);
				this.removeEmptyPage(page);
			page = nextPage;
		}
		var firstBody = lastPage.getFirstBody();
		while(firstBody){
			firstBody.releaseEndNoteLayout();
			firstBody = lastPage.getNextBody(firstBody);
		}
		var endnotePr = this.settings.getEndnotePr();
		var currentSect = lastPage.getSection();
		if(endnotePr&&endnotePr.isEndSect()){
			this._appendEndNotesInSect(currentSect);
		}else{
			if(this.relations.notesManager.endNoteChange||currentSect== this.settings.getLastSection()){
				var endnotes = this.relations.notesManager.getAllEndNoteView();
				this._appendEndNotesInSect();
				delete this.relations.notesManager.endNoteChange;
			}
		}
	},
	preUpdate:function(callFunc,args){
		this.preUpdateCall = this.preUpdateCall||[];
		this.preUpdateCall.push({call:callFunc,args:args});
	},
	_exePreUpdate:function(){
		if(this.preUpdateCall&&this.preUpdateCall.length>0){
			for(var i=0;i< this.preUpdateCall.length;i++){
				var callee = this.preUpdateCall[i];
				callee.call.apply(this,callee.args);
			}
		}
		delete this.preUpdateCall;
	},
	_exePosUpdate:function(){
		delete this.changedView;
		this.render(pe.lotusEditor.getScrollPosition());
	},
	removePages:function(start,end,includeEndPage){
		if(!start||(!end&&includeEndPage)){
			console.error("the start and the end can not be empty!");
		}
		var toDelPage = start;
		var toStopDel = includeEndPage?this.nextPage(end):end;
		while(toDelPage&&toDelPage!=toStopDel){
			var np = this.pages.next(toDelPage);	
			//remove this page
			this.pages.remove(toDelPage);
			toDelPage.destroy();
			if (toDelPage.domNode){
				if(toDelPage.domNode.parentNode == this.domNode)
					this.domNode.removeChild(toDelPage.domNode);
				//dojo.destroy(toDelPage.domNode);
				toDelPage.releaseDom();
			}
			toDelPage= np;
		}

		this._updatePageNumber(toDelPage);
	},
	bodyExist:function(body){
		var page = body.getParent();
		return page&&this.pages.contains(page);
	},
	updateNoteReferId:function(){
		this.relations.notesManager.updateChangedNotes();
	}
};
common.tools.extend(writer.view.update.DocumentUpdate.prototype,new writer.view.update.BlockContainerView());