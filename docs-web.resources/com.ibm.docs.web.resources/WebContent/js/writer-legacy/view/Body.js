dojo.provide("writer.view.Body");

writer.view.Body=function(page,space,left,top){
	this.bodySpace = space;
	space.setOwner( this );
	this.offsetY =0;
	this.page = page;
	this.left = left;
	this.top = top;
	this._reservedHeight=0;
	this.textArea = new writer.view.text.TextArea(this,space.clone(),{parentContainer:writer.util.ViewTools.getDocument(this).getBlockViews(),name:"content",viewType:"text.content"});
};
writer.view.Body.prototype = {
	left:0,
	top: 0,
	textArea:null,
	getViewType:function(){
		return 'page.Body';
	},
	getContainer:function(){
//		return this.container;
		var textArea = this.getSelectedArea();
		if(!textArea){
			// this body may be has no footnote/endnote area
			textArea = this.textArea;
		}
		return textArea.getContainer();
	},
	getTextAreaContainter:function(){
		return this.textArea.getContainer();
	},
	getStartBlock:function(){
		return this.textArea.getContainer().getFirst();
	},
	/**
	 * 
	 * @param isSamePage  true for returning the next body in same page only
	 * @returns
	 */
	next:function(isSamePage){
		var page = this.page;
		var nextbody = page.getNextBody(this);
		if (nextbody){
			return nextbody;
		}
		if (isSamePage){
			return null;
		}
		var nextpage = this.page.next();
		if (!nextpage){
			return null;
		}
		return nextpage.getFirstBody();
	},
	previous:function(isSamePage){
		var page = this.page;
		var prevbody = page.getPreviousBody(this);
		if (prevbody){
			return prevbody;
		}
		if (isSamePage){
			return null;
		}
		var prevPage = this.page.previous();
		if (!prevPage){
			return null;
		}
		return prevPage.getLastBody();
	},
	_endsWithPageBreak: function(){
		/*
		 * check if a paragraph end with pagebreak
		 * return boolean
		 * @param p:paragraph view
		*/
		var endWithPageBreak = function(p)
		{
			var lineBreak = p && p.lines && p.lines.getLast && p.lines.getLast();
			if (lineBreak&& lineBreak.isPagebreakLine()){
				return true;
			}
			return false;
		};

		var vTools = writer.util.ViewTools;
		var container  = this.textArea.getContainer();
		var lastView = container && container.getLast();
		if (lastView)
		{
			if (vTools.isParagraph(lastView))
				return endWithPageBreak(lastView);
			else if (vTools.isTOC(lastView))
			{
				var tocContainer = lastView.getContainer();
				var lastPinToc = tocContainer && tocContainer.getLast();
				if (lastPinToc)
					return endWithPageBreak(lastPinToc);
			}
		}

		return false;
	},
	shouldPageBreak: function(view){
		var previousBody = this;
		while(previousBody){
			if (previousBody._endsWithPageBreak()){
				return true;
			}
			previousBody = previousBody.previous(true);
		}
		
		// Check if the paragraph if start of Page.(Page break before in Word)
		// Only check the paragraph in body.
		var container  = this.textArea.getContainer();
		if(container.length() != 0 && view.model.parent 
				&& view.model.parent.modelType == writer.MODELTYPE.DOCUMENT 
				&& view.model.isPageBreakBefore && view.model.isPageBreakBefore())
			return true;
		
		return false;
	},
	
	getWidth: function(){
		return this.bodySpace.w;
	},
	
	getHeight: function(){
		return this.bodySpace.h;
	},
	
	getParent: function(){
		return this.page;
	},
	getDoc:function(){
		return this.page.parent;
	},
	
	updateBodySpace:function(delT,delH,delW){
		var change = {};
		if(delT){
			this.top+=delT;
			change.top = this.top+"px";
		}
		if(delH){
			this.bodySpace.h+=delH;
			change.height = this.bodySpace.h+"px";
		}
		if(delW){
			this.bodySpace.w+=delW;
			change.width = this.bodySpace.w+"px";
		}
		if (this.domNode)
		{
			dojo.style(this.domNode,change);
			if (pe.scene.isNote())
				this.domNode.style.height = "auto";
		}
	},
	setDomZ:function(z_index)
	{
		if (this.domNode)
			dojo.style(this.domNode, "zIndex", z_index);
	},
	_appendEndnoteDOM:function(){
		this.endnodeDOM = dojo.create("div");
		var endNodeSeparator = dojo.create("div",{"class":"endnote-separator","style":"border-top:1px solid #333;width:"+Math.min(this.getWidth(),200)+"px;"});
		this.endnodeDOM.appendChild(endNodeSeparator);
		this.endnodeDOM.appendChild(this.endNodeArea.render());
		if(this.footnodeDOM){
			this.domNode.insertBefore(this.endnodeDOM,this.footnodeDOM)
		}else{
			this.domNode.appendChild(this.endnodeDOM);
		}		
	},
	_appendFootnoteDOM:function(){
		this.footnodeDOM = dojo.create("div");
		var footNodeSeparator = dojo.create("div",{"class":"footnote-separator","style":"border-top:1px solid #333;width:"+Math.min(this.getWidth(),200)+"px;"});
		this.footnodeDOM.appendChild(footNodeSeparator);
		this.footnodeDOM.appendChild(this.footNodeArea.render());
		this.domNode.appendChild(this.footnodeDOM);
	},
	render:function(){
		if(!this.domNode){
			this._spaceNode = null;
			var pageNode = dojo.create("div", {
				"class": "body",
				"style":("position:absolute;left:"+ this.left+"px;top:"+this.top+"px;width:"+this.bodySpace.w+"px;height:"+this.bodySpace.h+"px;z-index:-20001")
			});
//			this.setContentAreaHeight();
			this.setAreasHeight();
			var contentNode = this.textArea.render();
			/*TODO: render the footnode 
			 * 
			 */
			this.domNode = pageNode;
			pageNode.appendChild(contentNode);
			if(this.endNodeArea&&!this.endNodeArea.isEmpty()){
				this._appendEndnoteDOM();
			}
			if(this.footNodeArea&&!this.footNodeArea.isEmpty()){
				this._appendFootnoteDOM();
			}
		}else if(this.isDirtyDOM()){
			if (this._spaceNode)
			{
				this.domNode.removeChild(this._spaceNode);
				this._spaceNode = null;
			}
			this.setAreasHeight();
			this.textArea.updateDOM();
			if(this.footNodeArea){
				if(!this.footNodeArea.isEmpty()){
					if(this.footnodeDOM){
						this.footNodeArea.updateDOM();
					}else{
						this._appendFootnoteDOM();
					}
				}else{
					this.footnodeDOM&&this.domNode.removeChild(this.footnodeDOM);
					delete this.footnodeDOM;
					delete this.footNodeArea;
				}		
			}
			if(this.endNodeArea){
				if(!this.endNodeArea.isEmpty()){
					if(this.endnodeDOM){
						this.endNodeArea.updateDOM();
					}else{
						this._appendEndnoteDOM();
					}
				}else{
					this.endnodeDOM&&this.domNode.removeChild(this.endnodeDOM);
					delete this.endnodeDOM;
					delete this.endNodeArea;
				}								
			}			
		}
		
		// only for space debug, the switcher is in writer.view.SpaceBlock
		this.textArea && this.textArea.drawSpace();
		this._fixNotesTop();
		delete this._dirtyDOM;
		if (pe.scene.isNote())
			this.domNode.style.height = "auto";
		return this.domNode;
	},
	_fixNotesTop:function(){
		// the footnote/endnote separator has the top border and its width is 1px;
		var delH = 0;
		if(this.endNodeArea&&!this.endNodeArea.isEmpty()){
			delH ++;
			this.endNodeArea.top += delH;
		}
		if(this.footNodeArea&&!this.footNodeArea.isEmpty()){
			delH ++;
			this.footNodeArea.top += delH;
		}
	},
	appendEndNote:function(endNodeView){
		return this._appendEndNotes(endNodeView);
	},
	updateDOM4Endnote:function(){
		if(this.endNodeArea&&!this.endNodeArea.isEmpty()){
			this.markDirtyDOM();
			this.render();
		}	
	},
	/*1. append the text run to the text area,
	 *2. append the footNode to the footnote area;
	 * 
	 * 
	 * 
	 */
	append:function(contentView,footNoteView, _cache){
		if(footNoteView){
			if(footNoteView){
				footNoteView = this._appendFootNotes(footNoteView); 
			}
			if(footNoteView){
				return {cn:contentView,fn:footNoteView};
			}
			this.setContentAreaHeight();
		}
		if(!contentView){
			return;
		}
		if (this.shouldPageBreak(contentView)){
			return {cn:contentView,fn:footNoteView};
		}
		if (this.textArea.getOffsetY() >= this.textArea.bodySpace.h){
			return {cn:contentView,fn:footNoteView};
		}
		// try to layout
		if(!contentView.hasLayouted()){
			contentView.top = this.textArea.offsetY;	// calculating anchor occupied space needs paragraph.top
			contentView.layout(this.textArea);
		}else{
			contentView.top = this.textArea.offsetY;
			contentView.updatePosition(this.textArea);
		}
		// if the height of anchor of this paragraph cannot be contained by its body textArea, put the whole paragraph to the next page
		if (contentView.getViewType()=="text.Paragraph"&& !contentView.ifCanOccuppy(this.textArea)) {
			contentView.releaseLayout();
			return {cn:contentView,fn:footNoteView};
		}
		
		var referredFn =contentView.getReferredFootNote(_cache);
		if(!referredFn || referredFn.length() === 0){
			var breakView = this._appendContent(contentView);	
			if(breakView){
				return {cn:breakView};
			}else{
				return null;
			}
		}else{
			// handle the footnote
			if(writer.util.ViewTools.isParagraph(contentView)){
				var h = this.getUnUsedHeight();
				var devideAt = contentView.getContainer().getFirst();
				var firstReferredNote = referredFn.getFirst();
				var isKeeplinesPara = contentView.model.isKeepLines && contentView.model.isKeepLines();
				while(h>0&&devideAt){
					var contentH = 0;
					while(firstReferredNote && devideAt&&!devideAt.getContainer().inRange(firstReferredNote)){
						contentH+= devideAt.getBoxHeight();
						devideAt = contentView.getContainer().next(devideAt);
					}
					if(isKeeplinesPara) 
						contentH = contentView.h - devideAt.getBoxHeight();
					if(!devideAt||h<=contentH+devideAt.getBoxHeight()){
						if(!devideAt){
							console.info("devideAt should not be null!");
						}
						var breakView = this._appendContent(contentView);	
						if(breakView){
							return {cn:breakView};
						}else{
							return null;
						}
					}else{
						this._setReservedHeight(devideAt.getBoxHeight()+devideAt.top);
						var fnAtTheSameLine = new common.Container();
						while(firstReferredNote && devideAt.getContainer().inRange(firstReferredNote)){
							var footNode = pe.lotusEditor.relations.notesManager.getFootNoteById(firstReferredNote.getId());
							if(!footNode){
								console.error("can not find the footNote id: "+firstReferredNote.getId());
								firstReferredNote = referredFn.next(firstReferredNote);
								continue;
							}
							footNode = footNode.getMergedView();
							fnAtTheSameLine.append(footNode);
							firstReferredNote = referredFn.next(firstReferredNote);
						}
						var breakFns = this._appendFootNotes(fnAtTheSameLine);
						if(breakFns){
							// the footnotes can not be appended to this body. 
							devideAt = contentView.getContainer().next(devideAt);
							if(!devideAt){
								var newContentView = null;
							}else{
								var newContentView = contentView.splitAtLine(devideAt);
							}
							this._restReservedHeight();	
							var temp = this._appendContent(contentView);
							if(temp){
								console.warn("the area should be enough for the conten");
								newContentView = temp;
							}
							return {cn:newContentView,fn:breakFns};
						}					
						devideAt = contentView.getContainer().next(devideAt);
						h = this.getUnUsedHeight();
						this._restReservedHeight();	
					}			
				}
				var breakView = this._appendContent(contentView);	
				if(breakView){
					return {cn:breakView};
				}else{
					return null;
				}
			}else{
				var breakView = this._appendContent(contentView);
				if(breakView){
					if(breakView == contentView){
						referredFn = null;
					}else{
						referredFn =contentView.getReferredFootNote(_cache);	
					}									
				}
				var firstRefer =referredFn&&referredFn.getFirst();
				var footnotes = new common.Container();
				while(firstRefer){
					var footNode = pe.lotusEditor.relations.notesManager.getFootNoteById(firstRefer.getId());
					if(!footNode){
						console.error("can not find the footNote id: "+firstRefer.getId());
					}else{
						footNode = footNode.getMergedView();
						footNode && footnotes.append(footNode);
					}					
					firstRefer = referredFn.next(firstRefer);
				}
				var breakFns = this._appendFootNotes(footnotes); 			
				var ret = null;
				if(breakView){
					ret = ret||{};
					ret.cn = breakView;
				}
				if(breakFns){
					ret = ret||{};
					ret.fn = breakFns;
				}
				return ret;
			}			
		}
	},
	_appendContent:function(contentView){
		this.setContentAreaHeight();
		return this.textArea.append(contentView);
	},
	_appendFootNotes:function(footnotes){		
		var  firstReferredNote = footnotes.getFirst();
		var footnoteArea = this.getFootNoteArea();
		this.setFootnoteAreaHeight();
		while(firstReferredNote){
			if(firstReferredNote.hasLayouted && !firstReferredNote.hasLayouted()){
				firstReferredNote.layout(footnoteArea);
			}
			var breakFN = footnoteArea.append(firstReferredNote); 
			if(breakFN){
				// the footNode can not be append the this body, and it will be append to next body;
				if(breakFN!=firstReferredNote){
					footnotes.insertAfter(breakFN,firstReferredNote);
					footnotes.remove(firstReferredNote);
				}
				return  footnotes;
			}else{
				// the footnote can be append to this body;
				var temp = footnotes.next(firstReferredNote);
				footnotes.remove(firstReferredNote);
				firstReferredNote = temp;
			}
		}
		return null;
	},
	_appendEndNotes:function(endnotes){
		var  firstReferredNote = endnotes.getFirst();
		var endnoteArea = this.getEndNoteArea();
		this.setEndnoteAreaHeight();
		while(firstReferredNote){
			if(!firstReferredNote.hasLayouted()){
				firstReferredNote.layout(endnoteArea);
			}
			var breakFN = endnoteArea.append(firstReferredNote); 
			if(breakFN){
				// the footNode can not be append the this body, and it will be append to next body;
				if(breakFN!=firstReferredNote){
					endnotes.insertAfter(breakFN,firstReferredNote);
					endnotes.remove(firstReferredNote);
				}
				return  endnotes;
			}else{
				// the footnote can be append to this body;
				var temp = endnotes.next(firstReferredNote);
				endnotes.remove(firstReferredNote);
				firstReferredNote = temp;
			}
		}
		return null;
	},
	getUnUsedHeight:function(){
		var h1 = this.textArea.getOffsetY();
		if(this.footNodeArea){
			h1+=this.footNodeArea.getOffsetY();
		}
		return parseInt(this.bodySpace.h - h1-this._reservedHeight);
	},
	setContentAreaHeight:function(){
		var h =0;
		if(this.footNodeArea){
			h += (Math.ceil(this.footNodeArea.getOffsetY()));
			this.footNodeArea.setHeight(h);
			this.footNodeArea.top = this.bodySpace.h-h;
		}
		this.textArea.setHeight(this.bodySpace.h-h);
	},
	setFootnoteAreaHeight:function(){
		var h = this.textArea.getOffsetY();
		if(h==0){
			h+=4;
		}
		if(this.endNodeArea){
			h+= this.endNodeArea.getOffsetY();
		}
		if(this._reservedHeight){
			h+= this._reservedHeight;
		}
		this.footNodeArea.setHeight(this.bodySpace.h-h);
	},
	setEndnoteAreaHeight:function(){
		this.setContentAreaHeight();
		var h =  this.textArea.getHeight();
		var h1 = this.textArea.getOffsetY();
		if(h1==0){
			h1+=4;
		}
		this.endNodeArea.setHeight(h-h1);
		this.endNodeArea.top = h1;
		this.textArea.setHeight(h1);
	},
	setAreasHeight:function(){
		if(this.endNodeArea && !this.endNodeArea.isEmpty()){
			this.setEndnoteAreaHeight();
		}else{
			this.setContentAreaHeight();
		}
	},
	_restReservedHeight:function(){
		this._reservedHeight=0;
	},
	_setReservedHeight:function(h){
		this._reservedHeight=h;
	},
	releaseLayout:function(){
		this.markDirtyDOM();
		if(this.isEmpty()){
			return ;
		}
		this.textArea.releaseAll();
		if(this.footNodeArea){
			this.footNodeArea.releaseAll();
		}
		if(this.endNodeArea){
			this.endNodeArea.releaseAll();
		}
	},
	releaseEndNoteLayout:function(){
		if(this.endNodeArea){
			this.endNodeArea.releaseAll();
		}
		this.setContentAreaHeight();
	},
	getContentContainer:function(){
		return this.textArea.container;
	},
	getFirstAppendView:function(){
		var ret = {};
		var fnc = this.footNodeArea&&this.footNodeArea.getContainer();
		if(fnc&&!fnc.isEmpty()){
			var fns = new common.Container();
			var cnc = this.textArea.getContainer();
			var fn = fnc.getFirst();
			var refer = fn.getReferer();
			var referPara = refer&&writer.util.ViewTools.getParagraph(refer);
			while(referPara){
				while(referPara&&!writer.util.ViewTools.isTextContent(referPara.getParent())){
					referPara = referPara.getParent();
				}
				if(!referPara){
					console.error("the fnRefer should has parent!");
					break;
				}
				if(!cnc.inRange(referPara)){
					fns.append(fn);
					fn = fnc.next(fn);
					refer = fn&&fn.getReferer();
					referPara = refer&&writer.util.ViewTools.getParagraph(refer);
				}else{
					break;
				}
			}
			if(!fns.isEmpty()){
				ret.fn = fns;
			}
		}
		ret.cn = this.textArea.getContainer().getFirst();
		return ret;
	},
	toRelayout:function(cn,fn){
		var firstCn = this.textArea.container.getFirst();
		if(firstCn!=cn || cn&&!cn.hasLayouted()){
			return true;
		}
		
		// Defect 39955. The next page's first view's parent will be changed by previous page updatePosition function.
		if(firstCn&&firstCn.parent != this.textArea){
			firstCn.updatePosition && firstCn.updatePosition(this.textArea);
			firstCn.top = 0;
			return true;
		}
		
		var fnc = this.footNodeArea&&this.footNodeArea.container;
		var f2 = fnc&&fnc.getFirst();
		if(fn&&fn.length()>0){
			var f1 = fn.getFirst();
			while(f1&&f2){
				if(f1!=f2){
					return true;
				}
				f1 = fn.next(f1);
				f2 = fnc.next(f2);
			}
			if(f1){
				return true;
			}
		}
		if(f2){
			var refer = f2.getReferer();
			var referPara = refer&&writer.util.ViewTools.getParagraph(refer);
			if(!referPara||!this.textArea.container.inRange(referPara)){
				return true;
			}			
		}
		return false;
	},
	
	isEmpty:function(){
		return !(!this.textArea.isEmpty()||(this.footNodeArea&&!this.footNodeArea.isEmpty())||(this.endNodeArea&&!this.endNodeArea.isEmpty()))
	},
	mergeContentView:function(view){
		var toMergedView = this.textArea.mergeView(view);
		var referredFn = toMergedView&&toMergedView.getReferredFootNote();
		if(referredFn && referredFn.length()>0 ){
			var firstReferredNote  = referredFn.getFirst();
			while(firstReferredNote){
				var footNode = pe.lotusEditor.relations.notesManager.getFootNoteById(firstReferredNote.getId());
				var fnc = this.footNodeArea && this.footNodeArea.container;
				var firstFnView = fnc && fnc.getFirst();
				while(firstFnView){
					var next = fnc.next(firstFnView);
					if(firstFnView.model==footNode){
						fnc.remove(firstFnView,true);
						this.footNodeArea.offsetY-=firstFnView.h;
					}
					firstFnView = next;					
				}
				firstReferredNote = referredFn.next(referredFn);
			}
		}
		return toMergedView;
	},
	mergeFootnoteView:function(view){
		var mergetTar ;
		if(this.footNodeArea){
			this.setFootnoteAreaHeight();
			mergetTar = this.footNodeArea.mergeView(view);
			this.setAreasHeight();
		}
		return mergetTar;
	},
	markDirtyDOM:function(){
		this._dirtyDOM =true;
	},
	isDirtyDOM:function(){
		return this._dirtyDOM==true;
	},
	getAnchorObject: function(x, y) {
		return this.textArea.getAnchorObject(x, y);
	},
	getElementPath:function(x,y,path,options){
		// check the which text area is selected
		var selArea = null;
		if(this.textArea.inArea(x, y)){
			var selArea = this.textArea;
		}else if(this.endNodeArea&&this.endNodeArea.inArea(x,y)){
			y -= this.endNodeArea.top;
			var selArea = this.endNodeArea;
		}else if(this.footNodeArea && this.footNodeArea.inArea(x, y)){
			y-=this.footNodeArea.top;
			var selArea = this.footNodeArea;
		}
		if(!selArea){
			var selArea = this.getSelectedArea();
		}
		path.push(selArea);
		selArea.getElementPath(x, y, path, options);
		
	},
	getEditorArea:function(x,y){
		if(this.textArea.inArea(x, y)){
			return this.textArea;
		}else if(this.endNodeArea&&this.endNodeArea.inArea(x,y)){
			return this.endNodeArea;
		}else if(this.footNodeArea && this.footNodeArea.inArea(x, y)){
			return this.footNodeArea;
		}
	},
	getSelectedArea:function(){
		if(pe.lotusEditor.isFootnoteEditing()){
			return 	this.footNodeArea;
		}else if(pe.lotusEditor.isEndnoteEditing()){
			return  this.endNodeArea;
		}else{
			return this.textArea;
		}	
	},
	getFootNoteArea:function(){
		this.footNodeArea = this.footNodeArea||new writer.view.text.TextArea(this,new common.Space(this.bodySpace.w,0,0,0,this),{name:"footnote",viewType:"text.footnotes"});
		return this.footNodeArea;
	},
	getEndNoteArea:function(){
		this.endNodeArea = this.endNodeArea||new writer.view.text.TextArea(this,new common.Space(this.bodySpace.w,0,0,0,this),{name:"endnote",viewType:"text.endnotes"});
		return this.endNodeArea;
	},
	getLeft: function( ){
		return this.left;
	},
	getTop: function(){
		return this.top;
	},
	getContentLeft:function(){
		return this.getParent().getContentLeft() + this.left;
	},
	getContentTop:function(){
		return this.getParent().getContentTop() + this.top;
	},
	getChildPosition:function(idx){
		var para = this.getContainer().getByIndex(idx);
		if(!para){
			para = this.getContainer().getLast();
			return {'x':para.w,'y':para.getTop()+para.h};
		}else{
			return {'x':para.getLeft(),'y':para.getTop()};
		}
	},
	notifyUpdate:function(view){
		this.page.notifyUpdate([this]);
	},
	// release dom node
	releaseDom: function() {
		this.footNodeArea && this.footNodeArea.releaseDom();
		this.endNodeArea && this.endNodeArea.releaseDom();
		this.textArea && this.textArea.releaseDom();
		
		this.domNode = null;
	}
};
common.tools.extend(writer.view.Body.prototype,new writer.view.AbstractView());