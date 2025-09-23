dojo.provide("writer.model.HeaderFooter");
dojo.require("writer.common.tools");
dojo.require("writer.model.Model");
dojo.require("writer.common.Container");
dojo.require("writer.model.Document");
dojo.declare("writer.model.HeaderFooter",[writer.model.Document],
{
	modelType:writer.MODELTYPE.HEADERFOOTER,
	constructor: function(contentJSON,id,hfType) {
		this.rId = id;
		this.hfType = hfType;
	},
	fromJson:function(content){
		this.isLoading = true;
		if(content){
			var paras = content;
			for(var i=0;i< paras.length;i++){
				var c = paras[i];
				var m = this.createSubModel(c);
				if(!m){
					console.info("unspport object!");
				}else{
					this.loadModel(m);
				}
				
			}
		}
		
		delete this.isLoading;
		this._updateList();
	},
	_contentToJson: function()
	{
		var txtContent = [];
		
		var addToTxtContent = function(para, index)
		{
			var paraJson = para.toJson(null, null, true);
			txtContent.push(paraJson);
		};
		
		this.container.forEach(addToTxtContent);
		
		return txtContent;
	},
	toJson: function()
	{
		var jsonData = {};
		jsonData.t = this.hfType;
		jsonData.content = this._contentToJson();

		return jsonData;
	},
	update:function(forceExecu){
		if(this.delayUpdate&&!forceExecu){
			this.suspendUpdate();
			return;
		}
		this.updateChangeModel();
		var rootViews = this.getAllViews();
		var pageChanged = false;
		try
		{
			for(var ownerId in rootViews){
				var views = rootViews[ownerId];
				var v = views.getFirst();
				pageChanged = v.update()||pageChanged;	
			}
		}
		catch(e)
		{
			console.info("error,header/footer update exception!");
		}

		if(pageChanged){
			layoutEngine.rootView.update();
		}
	}
});

