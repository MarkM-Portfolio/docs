dojo.provide("writer.model.Document");
dojo.require("writer.model.update.BlockContainer");
dojo.require("writer.model.update.Block_Container");
dojo.require("concord.util.browser");
dojo.requireLocalization("writer","lang");
writer.model.Document = function(content,layoutEngine){
//	this.source = content;
	
	this.layoutEngine = layoutEngine;
	this.id = "body";
	this._listsPendingUpdate = {};
	this.container = new common.Container(this);

	// Do partial loading for document, not for header/footer and footnote
	if(concord.util.browser.isMobile())
	{
		this.FIRSTPART = 50;
		this.LOADNUM = 300;	// 50 paragraphs
	}	
	else
	{
		// First time load count
		this.FIRSTPART = 100;
		this.LOADNUM =500;
	}	
	this._src = null;
	this.nls = dojo.i18n.getLocalization("writer","lang");

	this.fromJson(content);
};
writer.model.Document.prototype={
	modelType:writer.MODELTYPE.DOCUMENT,
	isEnablePartial: function()
	{
		// Can add configure for this.
		// Only partial load the document content.
//		return false;
		if(this.modelType == writer.MODELTYPE.DOCUMENT)
			return true;
	},
	
	_partialLoad: function()
	{
		if(this._firstLoadHandler)
		{
			dojo.unsubscribe(this._firstLoadHandler);
			this._firstLoadHandler = null;
		}	
		
//		console.info("Current time for Partial loading: " + ((new Date()) - this._startTime) + ". Remaining paragraph count is: " + (this._src && this._src.length));
//		console.profile("Partial loading");
		this.isLoading = true;
		if(this._src){
//			var loadCnt = this._src.length;
			var loadCnt = this.LOADNUM;
			// Desktop will load remained content.
			// Mobile load configured paragraphs.
//			if(loadCnt > this.LOADNUM)
//			{
//				loadCnt = this.LOADNUM;
//				setTimeout(dojo.hitch(this, this._partialLoad),10);
//			}
			
			var c, m;
			var start = this.container.getLast();
			for(var i=0;i< loadCnt&&this._src.length > 0;i++){
				c = this._src.shift();
				m = this.createSubModel(c);
				if(!m){
					console.info("unspport object!");
				}else{
					this.loadModel(m);
					if(writer.util.ModelTools.isTable(m)){
						i= i+ m.rows.length()*4;
					}
				}
			}
			var end = null;
		}
		
		if(pe.lotusEditor.inPartialLoading)
		{
			delete this.isLoading;
			this._updateList();
			dojo.publish(writer.EVENT.PREMEASURE);
			this.partialLayout(start,end);
		}
		
		if(!this._src || this._src.length == 0){
			// Not in partial loading will publish writer.EVENT.LOAD_READY event in layout engine.
//			if(pe.lotusEditor.inPartialLoading)
			{	
				var str = this.nls.LOAD_FINISHED;
				setTimeout(function(){
					pe.scene.showInfoMessage(str, 3000);
					dojo.publish(writer.EVENT.LOAD_READY);
				},0);
				
				var curTime = new Date();
//				console.info("Total time for Partial loading: " + (curTime - this._startTime));
			}
			delete this.isLoading;
			delete this._startTime;
			delete pe.lotusEditor.inPartialLoading;
			delete this._src;
		}else{
			setTimeout(dojo.hitch(this, this._partialLoad),10);
		}
		
//		console.profileEnd();
	},

	fromJson:function(content){
		this.isLoading = true;
		if(content)
		{
			var loadCnt = content.length;
			if(this.isEnablePartial())
			{
				var loadCnt = this.FIRSTPART;
//				pe.scene.showWarningMessage(this.nls.LOADING);
				// TODO Disable Command in partial loading
				// Block Apply message
				pe.lotusEditor.inPartialLoading = true;
				this._src = content;
			}
			if(this.modelType == writer.MODELTYPE.DOCUMENT)
			{
//				console.info("Document paragraph count is:" + content.length);
				this._startTime = new Date();
				this._firstLoadHandler = dojo.subscribe(writer.EVENT.FIRSTTIME_RENDERED, this, this._partialLoad);
			}
			
			var c, m;
			for(var i=0;i< loadCnt && content.length > 0;i++){
				c = content.shift();
				m = this.createSubModel(c);
				if(!m){
					console.info("unspport object!");
				}else{
					this.loadModel(m);
					if(writer.util.ModelTools.isTable(m)&&this.isEnablePartial()){
						i= i+ m.rows.length()*4;
					}
				}
			}
			if(content.length == 0)
				pe.lotusEditor.inPartialLoading = false;
		}
		delete this.isLoading;
		this._updateList();
	},
	append:function(jsonArray){
		this.broadcast("append",{"models":jsonArray});
	},
	changeStyle:function(styleId, style){
		
	},
	/**
	 * Default document style
	 * @returns
	 */
	getDefaultStyle:function(){
		return pe.lotusEditor.getRefStyle(writer.model.defaultStyle);
	},
	addPendingUpdateList: function(numId, list)
	{
		if(this.modelType != writer.MODELTYPE.DOCUMENT || pe.lotusEditor.inPartialLoading || this.isLoading)
			this._listsPendingUpdate[numId] = list;
	},
	_updateList: function()
	{
		for(var it in this._listsPendingUpdate)
		{
			var list = this._listsPendingUpdate[it];
			list.updateListValueNow();
		}	
		this._listsPendingUpdate = {};
	},
	loadModel:function(model){
		if( model.isContainer )
		{
			this.container.appendAll(model);
			model.forEach( function(m){
				m.notifyInsertToModel();
			});
		}
		else
		{
			this.container.append(model);
			model.notifyInsertToModel();
		}
	},
	partialLayout: function(start,end){
		var rootView = layoutEngine.rootView;
		rootView.partialLayout(start,end);
	},
	delayUpdate:true,
	/*
	 * forceExecu if the value is true the document view will be updated
	 * 
	 * 
	 */
	update:function(forceExecu){
		if(this.delayUpdate&&!forceExecu){
			this.suspendUpdate();
			return;
		}
//		dojo.publish(writer.EVENT.BEGINUPDATEDOCMODEL);
		var updateModel = this.updateChangeModel();
		if(updateModel&&this.changeNotes){
			var firstNote = this.changeNotes.getFirst();
			while(firstNote){
				firstNote.toBeUpdate();
				firstNote = this.changeNotes.next(firstNote);
			}
			this.changeNotes.removeAll();
		}
//		dojo.publish(writer.EVENT.ENDUPDATEDOCMODEL);
		if(this.changeNotes&&!updateModel){
			var executeUpdate= function(model){
				var suspendChildren = model.getSuspendedChildren();
				suspendChildren&&suspendChildren.forEach(function(subModel){
					executeUpdate(subModel);
				});
				model.update(forceExecu);
				suspendChildren&&model.clearSuspendChildren();
			};
			var firstNote = this.changeNotes.getFirst();
			while(firstNote){
				executeUpdate(firstNote);
				firstNote = this.changeNotes.next(firstNote);
			}
			this.changeNotes.removeAll();
		}
		if (layoutEngine.rootView)
			layoutEngine.rootView.update();
	},
	addSuspendedChild:function(child){
		if(child.modelType==writer.MODELTYPE.FOOTNOTE||child.modelType==writer.MODELTYPE.ENDNOTE){
			this.changeNotes = this.changeNotes||new common.Container(this);
			if(!this.changeNotes.contains(child)){
				this.changeNotes.append(child);
			}
			this.suspendUpdate();
			return;
		}
		if(!this.suspendedChild){
			this.suspendedChild = new common.Container(this);
		}
		if(!this.suspendedChild.contains(child)){
			this.suspendedChild.append(child);
			this.suspendUpdate();
		}
	}
};
common.tools.extend(writer.model.Document.prototype,new writer.model.update.BlockContainer());
common.tools.extend(writer.model.Document.prototype,new writer.model.update.Block_Container());
common.tools.extend(writer.model.Document.prototype,new writer.model.Model());