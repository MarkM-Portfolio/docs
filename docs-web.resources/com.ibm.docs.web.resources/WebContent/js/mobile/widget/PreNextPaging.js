dojo.provide("mobile.widget.PreNextPaging");
dojo.require("dijit._Widget");
dojo.declare("mobile.widget.PreNextPaging",dijit._Widget,{
	pageNode:null,
	pageNum: 1,
	pageSize: 50,
	canGoPre: true,
	canGoNext: true,
	pagingMap: null,
	_connections: null,
	generatePageNode: function(/*HTML Node*/pageNode,/*String*/region,/*Boolean*/isRedraw){
		if(!pageNode || !dojo.isString(region)){
			return ;
		}
		var resourceBundle = FILES_CONTEXT.resourceBundle;
		var ul = dojo.query("ul",pageNode);
		if(ul.length == 0 || isRedraw){
			this.pageNode = pageNode;
			this._resetPaging(pageNode);
			
			var arr = ["<ul class='page_ctl'>"];
			arr.push("<li class='firstLotus pre_page_ctl'><a class='pre_page_a' href='javascript: void(0);' action='-1'>");
			arr.push(resourceBundle.files_pre_label);	
			arr.push("</a></li><li class='next_page_ctrl'><a class='next_page_a' href='javascript: void(0);' action='1'>");
			arr.push(resourceBundle.files_next_label);
			arr.push("</a></li></ul>");
			dojo.create("div",{"style":{"float":"left"},"class": "fs_paging_info",
				"innerHTML": dojo.string.substitute(resourceBundle.files_paging_info,[this.pageNum])},pageNode);
			dojo.create("div",{"style":{"float":"left"},"innerHTML":arr.join("")},pageNode);
			
			var regionConns = this._connections[region] || (this._connections[region] = []);
			var pagingMap = this.pagingMap || (this.pagingMap = {});
			var r_map = pagingMap[region]||(pagingMap[region]={});
			var preNode = dojo.query("a.pre_page_a",pageNode)[0];
			var nextNode = dojo.query("a.next_page_a",pageNode)[0];
			if(preNode){
				regionConns.push(dojo.connect(preNode,"onclick",dojo.hitch(this,this._OnPageNumChange)));
				r_map["preNode"] = preNode;
			}
			if(nextNode){
				regionConns.push(dojo.connect(nextNode,"onclick",dojo.hitch(this,this._OnPageNumChange)));
				r_map["nextNode"] = nextNode;
			}
		}
	},
	_resetPaging: function(pageNode){
		pageNode.innerHTML = "";
		this._clearConnections();
	},
	_updateCurPage: function(newPage){
		this.pageNum = newPage;
		if(this.pageNode){
			dojo.query("div.fs_paging_info",this.pageNode).forEach(function(info_node){
				info_node.innerHTML = info_node.innerHTML.replace(/\d/,this.pageNum);
			},this);
		}
	},
	_setPageSize: function(newPageSize){
		if(this.pageSize == newPageSize){
			return ;
		}
		this.pageNum = 1;
		this.pageSize = newPageSize;
		this._updateCurPage(1);
		this.OnPageSizeChange();
	},
	_OnPageNumChange: function(e){
		var node = e.target;
		if(dojo.attr(node,"pageNum") || dojo.attr(node,"action")){
			var action = dojo.attr(node,"action");
			var goPage = 0;
			if(action){
				var goDirection = parseInt(action);
				if(((goDirection == -1) && !this.canGoPre)||((goDirection == 1)&&!this.canGoNext)){
					return ;
				}
				goPage = this.pageNum + goDirection;
			}else{
				goPage = parseInt(dojo.attr(node,"pageNum"));
			}
			if(goPage >= 1){
				this._updateCurPage(goPage);
				this.OnPageNumChange(node);
			}
		}
		dojo.stopEvent(e);
	},
	/**
	 * overwriting by user
	 * @param pageNum
	 * @param pageSize
	 */
	OnPageNumChange: function(node){
		
	},
	OnPageSizeChange: function(){
		
	},
	getCurrentPage: function(){
		return this.pageNum;
	},
	setCanGo: function(canGoPre,canGoNext){
		this.setCanGoPre(canGoPre);
		this.setCanGoNext(canGoNext);
	},
	setCanGoPre: function(canGoPre){
		if(this.canGoPre == canGoPre){
			return false;
		}
		this.canGoPre = canGoPre;
		var preNode = null;
		if(this.pagingMap){
			for(var region in this.pagingMap){
				if(!region)
					continue;
				preNode = this.pagingMap[region]["preNode"];
				if(preNode){
					if(this.canGoPre){
						dojo.removeClass(preNode,"pre_page_a_disabled");
					}else{
						//forbidden previous
						dojo.addClass(preNode,"pre_page_a_disabled");
					}
				}
			}
		}
		return this.canGoPre;
	},
	setCanGoNext: function(canGoNext){
		if(this.canGoNext == canGoNext){
			return false;
		}
		this.canGoNext = canGoNext;
		var nextNode = null;
		if(this.pagingMap){
			for(var region in this.pagingMap){
				if(!region)
					continue;
				nextNode = this.pagingMap[region]["nextNode"];
				if(nextNode){
					if(this.canGoNext){
						dojo.removeClass(nextNode,"next_page_a_disabled");
					}else{
						//forbidden next
						dojo.addClass(nextNode,"next_page_a_disabled");
					}	
				}
			}
		}
		return this.canGoNext;
	},
	_clearConnections: function(){
		for(var i in this._connections){
			dojo.forEach(this._connections[i],dojo.disconnect);
			delete this._connections[i];
		}
		this._connections = {};
	},
	destroy: function(){
		this.pagingMap = null;
		this.pageNode = null;
		this._clearConnections();
		this.inherited(arguments);
	},
	postCreate: function(){
		this.pagingMap = {};
		this._connections = {};
	}
});
