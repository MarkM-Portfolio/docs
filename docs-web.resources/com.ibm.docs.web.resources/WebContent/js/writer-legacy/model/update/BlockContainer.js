dojo.provide("writer.model.update.BlockContainer");
writer.model.update.BlockContainer = function(){
	
};
writer.model.update.BlockContainer.prototype={
	container: null,
	initContent: function( content ){
		this.container = new common.Container(this);
		if (content){
			for(var i=0;i< content.length;i++){
				var m = this.createSubModel(content[i]);
				if(!m){
					console.info("unspport object!");
				}
				else
				{
					if( m.isContainer)
						this.container.appendAll(m);
					else
						this.container.append(m);
				}
			}
		}
	},
	/**
	 * check if its content empty
	 */
	isContentEmpty: function()
	{
		if (this.container.isEmpty())
			return true;

		if (this.container.length() == 1)
		{
			// check if the text of the only one paragraph is ""
			var p = this.container.getFirst();
			if (p && writer.MODELTYPE.PARAGRAPH == p.modelType)
			{
				if (p.getLength() == 0)
					return true;
			}
		}

		return false;
	},
	/**
	 * Get the message target by id
	 * @param id
	 */
	byId: function(id)
	{
		if(!id || id == 'body')
			return this;
		
		var retModel = null;
		retModel = window._IDCache.getById(id);
		if(retModel){
			return retModel;
		}
//		retModel = this.container.getById(id);
		!retModel&&this.container&&this.container.forEach(function(child){
			if( child.id == id)
			{
				retModel = child;
				return false;
			}
			else
			{
				var ret = child.byId(id);
				if(ret)
				{
					retModel = ret;
					return false;
				}
			}	
		}); 
		// only paragraph need cache
		if (retModel && retModel.modelType == writer.MODELTYPE.PARAGRAPH)
			window._IDCache.addCache(id,retModel);
		return retModel;
	},
	getByIndex:function(index)
	{
		return this.container.getByIndex(index);
	},
	indexOf: function(sub)
	{
		return this.container.indexOf(sub);
	},
	insertBefore:function( para, tar ){
		if( tar )
			this.container.insertBefore(para,tar);
		else
			this.container.append(para );
		para.parent = this;
		if(para.modelType == writer.MODELTYPE.PARAGRAPH)
			para.markNextToBorderDirty && para.markNextToBorderDirty();
		para.markInsert && para.markInsert();
	},
	insertAfter: function( para, tar ){
		if( tar )
			this.container.insertAfter(para,tar);
		else
			this.container.append(para );
		para.parent = this;
		if(para.modelType == writer.MODELTYPE.PARAGRAPH)
			para.markNextToBorderDirty && para.markNextToBorderDirty();
		para.markInsert && para.markInsert();
	},
	remove:function(para)
	{
		if(this.container.contains(para)){
			if(para.modelType == writer.MODELTYPE.PARAGRAPH)
			{
				para.markNextToBorderDirty && para.markNextToBorderDirty();
				writer.util.ModelTools.releaseParagraphCache( para );
			}
			this.container.remove(para);
			para.markDelete && para.markDelete();
			if( para.changedModels )
				 para.changedModels.removeAll();
		}
	},
	update:function(forceExecu){
		if(this.delayUpdate&&!forceExecu){
			this.suspendUpdate();
			return;
		}
		this.updateChangeModel();
		var rootViews = this.getAllViews();
		for(var ownerId in rootViews){
			var views = rootViews[ownerId];
			var v = views.getFirst();
			while(v){
				try{
					v.update&&v.update();
					v = views.next(v);
				}catch(e){
					console.log('update error : '+e);
					v = views.next(v);
				}
			}			
		}
		
	},
	suspendUpdate:function(){
		var parent = this.parent||(this.getUpdateTrigger&&this.getUpdateTrigger());
		if(parent && parent.addSuspendedChild){
			parent.addSuspendedChild(this);
		}else{
			pe.lotusEditor.updateManager.addChangedBlock(this);
		}
	},
	addSuspendedChild:function(child){
		if(!this.suspendedChild){
			this.suspendedChild = new common.Container(this);
		}
		if(!this.suspendedChild.contains(child)){
			this.suspendedChild.append(child);
			this.suspendUpdate();
		}
	},
	getSuspendedChildren:function(){
		return this.suspendedChild;
	},
	clearSuspendChildren:function(){
		this.suspendedChild.removeAll();
	},
	addChangeModel:function(model){
		if(!this.changedModels){
			this.changedModels = new common.Container(this);
		}
		if(!this.changedModels.contains(model)){
			this.changedModels.append(model);
		}
	},
	updateChangeModel:function(){		
		if(this.changedModels&&!this.changedModels.isEmpty()){
			if( this.changedModels.length() > 1 ){
				// TODO The sort function has big performance problem.
				var temp = this.getContainer().sort(this.changedModels);
				delete this.changedModels;
				this.changedModels = temp;
			}
			this.changedModels.forEach(function(m){
				m.update(true);
			});
			this.changedModels.removeAll();
			return true;
		}
		return false;
	},
	clearChangeModel:function(){
		this.changedModels&&this.changedModels.removeAll();
	},
	getContainer:function(){
		return this.container;
	},
	getStyleId: function()
	{
		return this.styleId;
	},
	getAllParaOrTable:function(){
		var paras = [];
		var modelTools = writer.util.ModelTools;
		this.container.forEach(function(curObj){
			if(modelTools.isParaOrTable(curObj))
			{
				paras.push(curObj);
			}

		});
		
		return paras;
	},
	/**
	 * Get all paragraphs in this document/table/Row/Cell/TOC.
	 * Will be used in find/replace or spell check.
	 * @returns Array
	 */
	getParagraphs:function(){
		var paras = [];
		var modelTools = writer.util.ModelTools;
		this.container.forEach(function(curObj){
			if(modelTools.isParagraph(curObj))
			{
				paras.push(curObj);
				if(curObj.AnchorObjCount > 0)
				{
					curObj.container.forEach(function(run){
						if(writer.util.ModelTools.isAnchor(run)&&run.getParagraphs)
							paras = paras.concat(run.getParagraphs());
					});
				}
			}
			else
				paras = paras.concat(curObj.getParagraphs());
		});
		
		return paras;
	}
};
window._IDCache = {
		_cache:{},
		_size:0,
		_cnt:0,
		addCache:function(id,element){
			if(this._size<10){
				var e = {};
				e.cnt = this._cnt++;
				e.e = element;
				this._cache[id] = e;
				this._size++;
			}else{
				var popId = null;
				var min = Number.MAX_VALUE;
				for(var e in this._cache){
					if(this._cache[e].cnt < min){
						popId = e;
						min = this._cache[e].cnt;
					}
				}
				delete this._cache[popId];
				var e = {};
				e.cnt = this._cnt++;
				e.e = element;
				this._cache[id] = e;
			}
		},
		cleanCache: function(){
			this._cache = {};
			this._size = 0;
			this._cnt = 0;
		},
		removeId:function(id){
			if(id)
				delete this._cache[id];
		},
		getById:function(id){
			if(this._cache[id]){
				this._cache[id].cnt = this._cnt++;
				return this._cache[id].e;
			}
		}
};