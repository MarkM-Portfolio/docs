dojo.provide("mobile.widget.FileMenuContent");
dojo.require("dijit._Widget");
dojo.require("mobile.bean.FileMIConfig");
dojo.require("mobile.util.Constant");
dojo.requireLocalization("mobile.widget", "MobileFilesScene");
dojo.declare("mobile.widget.FileMenuContent",dijit._Widget,{
	resourceBundle: null,
	_itemConfig: null,
	_scene: null,
	_selectedMenuNode: null,
	postCreate: function(){
		if(!this._scene){
			return ;
		}
		this.resourceBundle = dojo.i18n.getLocalization("mobile.widget", "MobileFilesScene");
		this._itemConfig = this.createConfig();
		this.drawMenuByConfig(this._itemConfig);
		this.resize();
	},
	destroy: function(){
		this.inherited(arguments);
		this.resourceBundle = null;
	},
	
	createConfig: function(){
		var config = [
		              	new mobile.bean.FileMIConfig({
		              		type: mobile.Constant.FileItemType.SINGITEM,
		        			id: "D_fs_recent",
		        			title: this.resourceBundle.D_fs_recent_title,
		        			label: this.resourceBundle.D_fs_recent_label}),
		              	new mobile.bean.FileMIConfig({
		              		type: mobile.Constant.FileItemType.SINGITEM,
		        			id: "D_fs_shareme",
		        			title: this.resourceBundle.D_fs_shareme_title,
		        			label: this.resourceBundle.D_fs_shareme_label
		              	}),
		              	new mobile.bean.FileMIConfig({
		              		type: mobile.Constant.FileItemType.SINGITEM,
		        			id: "D_fs_my",
		        			title: this.resourceBundle.D_fs_mine_title,
		        			label: this.resourceBundle.D_fs_mine_label,
		        			selected: true
		              	})
		             ];
		return config;
	},
	_operateMenu: function(node,event){
		if(this._selectedMenuNode == node){
			return ;
		}
		if(this._selectedMenuNode){
			dojo.removeClass(this._selectedMenuNode.parentNode,"lotusSelected");
		}
		if(this._selectedMenuNode = node){
			dojo.addClass(node.parentNode,"lotusSelected");
		}
		this._scene.execOperate(node.id,node.id);
		if(event){
			dojo.stopEvent(event);
		}
	},
	addMenuItem: function(menuItem){
		if(!(menuItem instanceof mobile.bean.FileMIConfig)){
			return;
		}
		var hasItem = dojo.some(this._itemConfig,function(item){
			return item["id"]==menuItem["id"];
		});
		if(!hasItem){
			this._itemConfig.push(menuItem);
			this.drawItem(menuItem);
		}
	},
	drawMenuByConfig: function(menuConfig){
		var div = dojo.create("div");
		var ul = dojo.create("ul",{"class": "lotusui_leftUL"},div);
		dojo.forEach(menuConfig,function(menuItem){
			var node = this.drawItem(menuItem);
			if(node){
				var li = dojo.create("li",null,ul);
				dojo.place(node,li,"last");
			};
		},this);
		dojo.place(div,this.domNode);
		dojo.forEach(menuConfig,function(menuItem){
			if(menuItem.selected){
				this.selectItem(menuItem);
			}
		},this);
	},
	
	selectItem: function(menuItem){
		dojo.query((menuItem.htmltag || "a")+"#"+menuItem.id,this.domNode).forEach(function(node){
			this._operateMenu(node);
		},this);
	},
	drawItem: function(/*mobile.bean.FileMIConfig*/menuItem){
		if(!menuItem)
			return null;
		var node = null;	
		switch(menuItem.type){
			case mobile.Constant.FileItemType.TREEITEM:
				
			break;
			case mobile.Constant.FileItemType.SINGITEM:
			default:
				node = (menuItem.htmltag && menuItem.htmltag=="a")?this.createLinkNode(menuItem):this.createButtonNode(menuItem);
		}
		this.connect(node,"onclick",dojo.hitch(this,this._operateMenu,node));
		this._scene.addOperate(menuItem.id,{
			operate: this._scene._operateMenu
		});
		return node;
	},
	createLinkNode: function(menuItem){
		var node = dojo.create("a",{"id": menuItem.id});
		node.href = "javascript: void(0);";
		node.title = menuItem.title?menuItem.title:"";
		node.innerHTML = menuItem.label;
		return node;
	},
	createButtonNode: function(menuItem){
		var node = dojo.create("input",{"id": menuItem.id,"class": "lotusBtn"});
		node.type = "button";
		node.value = menuItem.label || menuItem.title || "unknow label";
		return node;
	},
	resize: function(){
		
	}
});
