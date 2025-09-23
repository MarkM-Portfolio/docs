dojo.provide("mobile.scene.MobileFilesScene");
dojo.require("mobile.widget.FileMenuContent");
dojo.require("mobile.widget.MobileFilesWidget");
dojo.require("mobile.OperateController");
dojo.require("mobile.Operate");
dojo.require("concord.beans.Document");
dojo.require("mobile.util.Constant");
dojo.requireLocalization("mobile.widget", "MobileFilesScene");
dojo.declare("mobile.scene.MobileFilesScene",mobile.OperateController,{
	_leftCntNode: null,
	_fileCntNode: null,
	_bannerNode: null,
	_footerNode: null,
	_mainNode: null,
	_fileMenuContent: null,
	_mobileFilesWidget: null,
	resourceBundle: null,
	isRedrawAtOtChanged: false, //Ipad orientation changed switch
	canCache: false, // Cache-use switch 
	contextPath: "",
	constructor: function(contextPath){
		console.log(contextPath);
		this._leftCntNode = dojo.byId("lotus_leftc");
		this._fileCntNode = dojo.byId("lotus_filesCnt");
		this._mainNode = dojo.byId("files_main_node");
		this._bannerNode = dojo.byId("files_banner_node");
		this._footerNode = dojo.byId("files_footer_node");
		this.contextPath = contextPath;
		this.resourceBundle = dojo.i18n.getLocalization("mobile.widget", "MobileFilesScene");
	},
	orientationChanged: function(){
		this.resize();
		if(this.isRedrawAtOtChanged){
			if(this._mobileFilesWidget&&this.canCache){
				this._mobileFilesWidget.orientationChanged();
			}
		}
	},
	resize: function(){
		console.log("MobileFilesScene do resize!");
		var banner_height = this._bannerNode?dojo.marginBox(this._bannerNode).h:0;
		var footer_height = this._footerNode?dojo.marginBox(this._footerNode).h:0;
		var browser_height = dojo.contentBox(dojo.doc.body).h;
		var main_height = browser_height-banner_height-footer_height;
		if(main_height > 0){
			dojo.marginBox(this._mainNode,{h:main_height});
		}
		try{
			this._fileMenuContent && this._fileMenuContent.resize();
			this._mobileFilesWidget && this._mobileFilesWidget.resize();
		}catch(e){
			
		}
	},
	destroy: function(){
		this._fileMenuContent && this._fileMenuContent.destroyRecursive();
		this._mobileFilesWidget && this._mobileFilesWidget.destroyRecursive();
		this._fileMenuContent = null;
		this._mobileFilesWidget = null;
		this._leftCntNode = null;
		this._bannerNode =null;
		this._fileCntNode = null;
		this._footerNode = null;
		this.resourceBundle = null;
		this.inherited(arguments);
	},
	_operateMenu: function(menuId){
		if(!menuId)
			return ;
		if(this._mobileFilesWidget){
			this._mobileFilesWidget.destroyRecursive();
			this._mobileFilesWidget = null;
		}
		var model = null;
		switch(menuId){
			case "D_fs_recent":
				model = new mobile.widget.FilesModel({filesObj: this.loadEmptyFilesForTest() /* null*/});
			break;
			case "D_fs_my":
				model = new mobile.widget.FilesModel({filesObj: /*this.loadOwnedFilesForTest("MyFiles")*/ null,
						url: this.contextPath+mobile.Constant.FileURL.MYFILES});
			break;
			case "D_fs_shareme":
				model = new mobile.widget.FilesModel({filesObj: /*this.loadOwnedFilesForTest("ShareFiles")*/null,
						url: this.contextPath+mobile.Constant.FileURL.SHAREME});
			break;
		}
		if(model){
			model.canCache = this.canCache; // using cache, so we will not need to scroll on the page.
			var div = dojo.create("div",null,dojo.byId("lotus_filesCnt"),"only");
			this._mobileFilesWidget = new mobile.widget.MobileFilesWidget({_scene: this,
							filesModel: model},div);
			this._mobileFilesWidget.startup();
		}
	},
	loadEmptyFilesForTest: function(){
		return {isEnd: true,files: []};
	},
	loadOwnedFilesForTest: function(prefix,count){
		var files = [];	
		count = count || 100;
		for(var i = 0; i < count; i++){
			var el = {};
			el.title = " IBM_Market_Center_Specification "+ (prefix?prefix:"") +" test_"+i;
			el.mimetype = 1;
			el.extension = "extension_"+i;
			el.owner = "owner_"+i;
			el.repo_id = "repo_id_"+i;
			el.doc_uri = "doc_uri_"+i;
			el.modified = "modified_"+i;
			el.sharable = true;
			el.iscommunityfile = "communityFiles";
			files.push(new concord.beans.Document(el));
		}
		return {isEnd: true, files: files};
	},
	_buildBanner: function(){
		if(!this._bannerNode)
			return ;
		var date = new Date();
		var localDate = date.toLocaleDateString();
		var user = FILES_CONTEXT&&FILES_CONTEXT.user;
		var userName = user&&user.userName || "";
		var div = dojo.create("div",{"class": "lotusui_banner_userSection"},this._bannerNode);
		dojo.create("span",{innerHTML:localDate},div);
		dojo.create("span",{innerHTML: userName},div);
		dojo.create("span",{innerHTML: "<a href='javascript: void(0);'>"+this.resourceBundle.files_help+"</a>"},div);
	},
	startup: function(){
		//this._buildBanner();
		if(this._leftCntNode){
			this._fileMenuContent = new mobile.widget.FileMenuContent({_scene: this},this._leftCntNode);
		}
		this.resize(); 
	}
});
