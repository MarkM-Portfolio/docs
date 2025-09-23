dojo.provide("mobile.widget.MobileFilesWidget");
dojo.require("mobile.util.MobileScroller");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("concord.beans.Document");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("mobile.util.Constant");
dojo.require("mobile.widget.PreNextPaging");
dojo.requireLocalization("mobile.widget", "MobileFilesScene");
dojo.declare("mobile.widget.MobileFilesWidget",[dijit._Widget,dijit._Templated],{
		templateString: "<div class='lotus_mobile_files'><div class='lotus_newFile' dojoAttachPoint='newFileNode'></div>"+
					"<div class='lotus_filesTitle'><span dojoAttachPoint='titleNode'></span></div>"+
					"<div class='lotus_filesContent'><div class='lotus_paging' dojoAttachPoint='pageTopNode'></div>"+
					"<div class='lotus_filesList' dojoAttachPoint='filesNode'></div>"+
					"<div class='lotus_paging' dojoAttachPoint='pageBottomNode'></div>"+
					"</div></div>",
		resourceBundle: null,
		canNewFile: false,
		filesModel: null,
		title: "",
		_tempConnections: null,
		_preNextPage: null,
		_scene: null,
		_showBottomPaging: false,
		openDocURLTemplate: "",
		_render: function(){
			console.log("_render!");
			this.preRender();
			this.render();
			this.postRender();
		},
		preRender: function(){
			this.titleNode.innerHTML = this.title;
			if(!this.canNewFile){
				this.newFileNode.innerHTML = "";
			}
			this.filesNode.innerHTML = "";
			this.pageTopNode.innerHTML = "";
			this.pageBottomNode.innerHTML = "";
			//enable scroll
			this.mobileScroller = new mobile.util.MobileScroller(true);
			// not scroll by user-defined
			//this.mobileScroller.initMobileScroll(this.filesNode);
			this.mobileScroller.initMobileScrollByCss(this.filesNode);
		},
		
		render: function(){
			var queryObj = {
				pageNum: this._preNextPage.pageNum,
				pageSize: this._preNextPage.pageSize,
				onComplete: function(itemsObj){
					console.log("onComplete!");
					this.buildPaging(itemsObj);
					this.buildFilesList(itemsObj);
				},
				scope: this
			};
			this.filesModel.fetchItems(queryObj);
		},
		resize: function(){
			var filesNode_pos = dojo.position(this.filesNode);
			var mainNode_pos = dojo.position(this._scene._mainNode);
			var newFNode_height = (mainNode_pos.y+mainNode_pos.h-filesNode_pos.y);
			if(this._showBottomPaging && dojo.style(this.pageBottomNode,"display")!="none"){
				newFNode_height -= dojo.marginBox(this.pageBottomNode).h;
			}
			if(newFNode_height > 0){
				dojo.marginBox(this.filesNode,{h: newFNode_height});
			}
			//this.mobileScroller && this.mobileScroller.resize();
			
		},
		buildPaging: function(itemsObj){
			if(this.canBuildPage(itemsObj)){
				dojo.style(this.pageTopNode,"display","");
				this._preNextPage.generatePageNode(this.pageTopNode,"top");
				if(this._showBottomPaging){
					dojo.style(this.pageBottomNode,"display","");
					this._preNextPage.generatePageNode(this.pageBottomNode,"bottom");	
				}else{
					dojo.style(this.pageBottomNode,"display","none");
				}
				this._preNextPage.setCanGo(this._preNextPage.pageNum>1, !itemsObj.isEnd);
			}else{
				dojo.style(this.pageTopNode,"display","none");
				if(this._showBottomPaging){
					dojo.style(this.pageBottomNode,"display","none");
				}
			}
		},
	
		canBuildPage: function(itemsObj){
			return (itemsObj["files"] && itemsObj["files"].length > 0)||this._preNextPage.pageNum > 1;
		},
		OnPageSizeChange: function(){
			this.filesModel.clearCachedPool();
			this._preNextPage.setCanGo(false,false); //because ajax request is not sync,so we have to forbidden the pre/next button
			this.refresh();
		},
		OnPageNumChange: function(node){
			console.log("onPageNumChange happened! ");
			if(dojo.hasClass(node,"next_page_a_disabled") || dojo.hasClass(node,"pre_page_a_disabled")){
				return ;
			}
			this._preNextPage.setCanGo(false,false); //because ajax request is not sync,so we have to forbidden the pre/next button
			this.refresh();
		},
		generate_mtPart: function(item){
			var MimeTypeObj = mobile.Constant.MimeType;
			var result = MimeTypeObj.generate_mtHTML(item.getExtension());
			result[1] = item.getUri();
			return result.join("");
		},
		_buildTableHead: function(){
			var header = ["<thead><tr class='files_header'>"];
			header.push("<td>" + this.resourceBundle.fs_table_index+"</td>");
			header.push("<td>" + this.resourceBundle.fs_table_type+"</td>");
			header.push("<td>" + this.resourceBundle.fs_table_title+"</td>");
			header.push("</tr></thead>");
			return header.join("");
		},
		buildFilesList: function(itemsObj){
			console.log("buildFilesList");
			var items = itemsObj["files"];
			if(!items || items.length == 0){
				dojo.create("div",{"innerHTML": this.resourceBundle.files_norecords},this.filesNode,"only");
				return ;
			}
			var contextPath = FILES_CONTEXT.contextPath,
			staticRootPath = FILES_CONTEXT.staticRootPath;
			var extra_conversion = function(value,key){
				if(key == "author"){
					return "<span class='files_key_value'>"+value+"</span>";
				}
				return value;
			};
			var table = ["<table class='lotus_files_table'  cellspacing='0' cellpadding='0'>"];
			//table.push(this._buildTableHead());
			var row = null;
			table.push("<tbody>");
			//var startIndex = this._preNextPage.pageSize*(this._preNextPage.pageNum-1)+1;
			dojo.forEach(items,function(item,index){
				row = ["<tr class='lotus_files_row "+((index==0?" firstLotus":" ")+(index%2==0?" lotus_evenRow":" lotus_oddRow"))+"' uri='"+item.getUri()+"'>"];
				//row.push("<td class='lotus_files_td indexCell'>"+startIndex+++"</td>");
				row.push("<td style='width: 40px' class='lotus_files_td firstCellLotus'>"+this.generate_mtPart(item)+"</td>");
				row.push("<td style='width: 98%;' class='lotus_files_td'>");
				row.push("<span><a href='javascript: void(0);' uri='"+item.getUri()+"' >"+item.getTitle()+"</a></span>");
				row.push("<div class='lotus_files_extralInfor'>"+dojo.string.substitute(this.resourceBundle.files_file_extral,
								{"author": item.getOwner(),"modified_time":item.getModified()},extra_conversion)+"</div></td>");
				//row.push("<td style='padding-right: 20px' class='lotus_files_td'>"+item.getOwner()+"</td>");
				row.push("<td style='padding-right: 15px' class='lotus_files_td '><div class='lotus_files_td_arrow'><img style='background: transparent' src='"+contextPath+staticRootPath+"/images/lc3/arrow.png' /></div></td>");
				row.push("</tr>");
				table.push(row.join(""));
			},this);
			table.push("</tbody></table>");
			dojo.create("div",{"innerHTML": table.join("")},this.filesNode,"only");
			this._tempConnections.push(dojo.connect(this.filesNode,'ontouchstart',dojo.hitch(this,this.OnTouchstart)));
			this._tempConnections.push(dojo.connect(this.filesNode,'ontouchmove',dojo.hitch(this,this.OnTouchmove)));
			this._tempConnections.push(dojo.connect(this.filesNode,'ontouchend',dojo.hitch(this,this.OnTouchend)));
			this._tempConnections.push(dojo.connect(this.filesNode,'onclick',dojo.hitch(this,this.onFileItemClick)));
		},
		
		postRender: function(){
		
		},
		clearConnections: function(){
			dojo.forEach(this._tempConnections,dojo.disconnect);
			this._tempConnections = [];
		},
		refresh: function(){
			this.clearConnections();
			this.render();
		},
		setNewModel: function(newModel){
			if(newModel){
				this.filesModel = newModel;
				this.refresh();
			}
		},
		getAncestor: function(node,reference){
			var name;
			while ( node )
			{
				if ( node.nodeName){
					name = node.nodeName.toLowerCase();
					if(dojo.isString(reference)? name == reference : name in reference){
						return node;
					}
				}
				node = node.parentNode;
			}
			return null;
			
		},
		highLight: function(e){
			var element = e.target || e.srcElement;
			var element = this.getAncestor(element, "tr"); //get tr elment.
			if(element){
				dojo.addClass(element,"lotus_files_row_highLight");
			}
		},
		OnTouchstart: function(e){
			this.isTouchMoved = false;
			this.highLight(e);
		},
		OnTouchmove: function(e){
			if(this.isTouchMoved == false){
				this.isTouchMoved = true;
				this.removeHighLight(e);
			}
		},
		OnTouchend: function(e){
			this.removeHighLight(e);
			if(this.isTouchMoved){
				e.preventDefault();
			}
		},
		removeHighLight: function(e){
			var element = e.target || e.srcElement;
			var element = this.getAncestor(element, "tr"); //get tr elment.
			if(element){
				dojo.removeClass(element,"lotus_files_row_highLight");
			}
		},
		onFileItemClick: function(e){
			var element = e.target || e.srcElement;
			var element = this.getAncestor(element, "tr"); //get tr elment.
			var uri = element?dojo.attr(element,'uri'):null;
			if(uri){
//				this.removeHighLight(e);
				var realLink = FILES_CONTEXT.contextPath+dojo.string.substitute(this.openDocURLTemplate,{repoId: FILES_CONTEXT.repoId,docUri: uri,action: "edit/content"});
				var item = this.filesModel.getFileItem(uri);
				if(item != null){
					realLink += "?fileType="+mobile.Constant.MimeType.valueOf(item.getExtension());
					realLink += "&fileTitle="+encodeURIComponent(item.getTitle());
				}
				document.location = realLink;
				if(e){
					dojo.stopEvent(e);
				}
			}
		},
		showDataException: function(msg){
			this.filesNode.innerHTML = msg;
		},
		postCreate: function(){
			if(!this.filesModel || !this._scene){
				this.showDataException(this.resourceBundle.files_render_error);
				return ;
			}
			this.openDocURLTemplate = mobile.Constant.FileURL.OPENDOCS;
			this.resourceBundle = dojo.i18n.getLocalization("mobile.widget", "MobileFilesScene");
			this._tempConnections = [];
			this.filesModel.setMobileFilesWidget(this);
			//overwriting OnPageNumChange function
			this._preNextPage = new mobile.widget.PreNextPaging({
				pageNum: 1,
				pageSize: this.calcPageSize(),
				OnPageNumChange: dojo.hitch(this,this.OnPageNumChange),
				OnPageSizeChange: dojo.hitch(this,this.OnPageSizeChange)
			});
			this._render(); 
		},
		orientationChanged: function(){
			console.log("orientationChanged in MobileFilesWidget");
			var newPageSize = this.calcPageSize();
			this._preNextPage._setPageSize(newPageSize);
		},
		calcPageSize: function(){
			var pageSize = 10;
			if(!this.filesModel.canCache){
				pageSize = mobile.Constant.pageSize;
			}else{
				if(typeof(window.orientation)!="undefined"){
					switch(window.orientation){
						case 0:
						case 180:
							//portrait
							pageSize = mobile.Constant.ipad_portraitSize;
							break;
						case -90:
						case 90:
							// landscape
							pageSize = mobile.Constant.ipad_landscapeSize;
						break;
					}
				}
			}
			return pageSize;
		},
		destroy: function(){
			console.log("destroy MobileFilesWidget....");
			this.inherited(arguments);
			this.clearConnections();
			this.filesModel.destroy && this.filesModel.destroy();
			this.filesModel = null;
			this._preNextPage && this._preNextPage.destroy();
			this.mobileScroller && this.mobileScroller.destroy();
			
		},
		startup: function(){
			this.resize(); 
		}
		
});

dojo.provide("mobile.widget.FilesModel");
dojo.declare("mobile.widget.FilesModel",null,{
	filesObj: null,
	_mobileFilesWidget: null,
	canCache: false,  // no used
	loadedFilesObj: null,
	url: "",
	cachedPool: null,
	constructor: function(params){
		this.filesObj = params.filesObj;
		this.url = params.url;
		this.canCache = params.canCache===true?true:false;
		if(this.url && this.url != ""){
			this.url = dojo.string.substitute(this.url,{repoId: FILES_CONTEXT.repoId});
		}
		if(this.canCache){
			/**
			 * this.cachedPool{ cachedPages: Number,startPageNum: Number, 
			 * 			isEnd: Boolean, cachedFiles: Array}
			 */
			this.cachedPool = {};
		}
	},
	setMobileFilesWidget: function(mobileFilesWidget){
		this._mobileFilesWidget = mobileFilesWidget;
	},
	/* not test yet! */
	getAttribute: function(file,attribute){
		if(!file || !attribute){
			return null;
		}
		var tempFn = null;
		return file[attribute] ||  (tempFn = file["get"+attribute.capitalize()])?tempFn.apply(file): null;
	},
	fetchItems: function(queryObj){
		if(!queryObj){
			queryObj.onComplete && queryObj.onComplete.call(queryObj.scope ||queryObj,[]);
		}
		this.loadItems(queryObj);
	},
	
	afterLoaded: function(queryObj,loadedFilesObj){
		var loadedItems = loadedFilesObj["files"];
		dojo.forEach(loadedItems,function(item){
			queryObj.onItem && queryObj.onItem(item);
		});
		queryObj.onComplete && queryObj.onComplete.call(queryObj.scope ||queryObj,loadedFilesObj);
	},
	clearCachedPool: function(){
		if(this.canCache){
			this.cachedPool = null;
		}
	},
	loadFromCachedPool: function(pageNum,pageSize){
		if(!this.canCache)
			return null; // can not use cache
		if(this.cachedPool&&this.cachedPool.cachedFiles){
			var pool = this.cachedPool;
			if(pool.startPageNum > pageNum || (pool.startPageNum+pool.cachedPages<=pageNum && !pool.isEnd) ){
				return null; //not in cache
			}
			var cachedFiles = [],isEnd = false;
			var len = pool.cachedFiles.length;
			for(var i = (pageNum-pool.startPageNum)*pageSize,j=1; (j <= pageSize && i < len); j++,i ++){
				cachedFiles.push(pool.cachedFiles[i]);
			}
			if((pageNum-pool.startPageNum+1)>=pool.cachedPages && pool.isEnd){
				isEnd = true;
			}
			return {isEnd: isEnd,files: cachedFiles};
		}
		return null;
	},
	loadItems: function(queryObj){
		var pageSize = queryObj.pageSize;
		var pageNum = queryObj.pageNum;
		if(!(pageSize>0&&pageNum>0)){
			throw new Error("queryObject is error! ");
			return ;
		}
		this.loadedFilesObj = null;
		if(!(this.filesObj || this.url)){
			throw new Error("can not load items files/url is null! ");
			return ;
		}
		if(this.filesObj){
			this.loadedFilesObj = this.filesObj;
			var selectedItems = [];
			var files = this.loadedFilesObj["files"];
			for(var i = pageSize*(pageNum-1); (i< (pageSize*(pageNum-1)+pageSize) && i < files.length); i++){
				selectedItems.push(files[i]);
			}
			var isEnd = false;
			if(pageNum * pageSize >= files.length){
				isEnd = true;
			}
			this.afterLoaded(queryObj,{"isEnd": isEnd,files: selectedItems});
		}else{
			var scope = this;
			//load from cachePool
			var cachedResult = this.loadFromCachedPool(pageNum,pageSize);
			var wrappedResult = null;
			var xhrDef = null;
			if(cachedResult){
				xhrDef = new dojo.Deferred();
				wrappedResult = xhrDef.then(function(cachedResult){
					return cachedResult;
				});
				setTimeout(function(){xhrDef.callback(cachedResult); }, 100); 
			}else{
				/**
				 * example: 	
				 * 		input:
				 * 			 pageNum = 5, pageSize = 10 ,mobile.Constant.pageSize = 50
				 * 		output:
				 * 			 serverPageSize = 80
				 * 			 count = 8
				 * 			 serverPageNum = (int)(5/9) + 1 = 1
				 */
				var serverPageNum = pageNum,  
					serverPageSize = pageSize;
				var count = 1;
				if(this.canCache){
					var definedPageSize = mobile.Constant.pageSize || 50;
					for(var i = 1; i <= definedPageSize ; i ++){
						if(serverPageSize >= definedPageSize){
							break;
						}
						serverPageSize *= 2;
						count *=2;
					}
					serverPageNum = Math.floor(pageNum/count) +((pageNum%count==0)?0:1);
				}
				
				//get from server!
				 xhrDef = dojo.xhrGet
					({
						url: scope.url+'?pageSize=' + serverPageSize + '&pageNumber=' + serverPageNum,
						handleAs: "json",
						sync: false,
						timeout: 8000
					});
				 
				 wrappedResult = xhrDef.then(function(result){
					 console.log("load items from server!");
						var responseStatus = xhrDef.ioArgs.xhr.status;
						var wrap = [];
						var isEnd = false;
						dojo.forEach(result,function(item){
							wrap.push(new concord.beans.Document(item));
						});
						if((result.length<pageSize)||responseStatus==200){
							isEnd = true;
						}else if(responseStatus == 206){
							isEnd = false;
						}
//						throw new Error("test deferredLst");
						return {isEnd: isEnd,files: wrap};
					},function(err){
						console.error("Achieve data error!");
					});
				 wrappedResult = wrappedResult.then(function(result){
					 if(scope.canCache){
						 /**
						 * this.cachedPool{ cachedPages: Number,startPageNum: Number, 
						 * 			isEnd: Boolean, cachedFiles: Array}
						 */
						 scope.clearCachedPool();
						 scope.cachedPool = {startPageNum: count*(serverPageNum-1)+1,
								 cachedPages: Math.floor(result.files.length/pageSize)+((result.files.length%pageSize==0)?0:1),
								 isEnd: result.isEnd,
								 cachedFiles: result.files};
						 result = scope.loadFromCachedPool(pageNum,pageSize);
					 }
					 return result;
				 },function(err){
					 console.error("Cache result error!");});
			}
			wrappedResult.then(function(result){
							console.log("Handle wrapped result!");
								if(!result){
									return;
								}
								scope.loadedFilesObj = result;
								scope.afterLoaded(queryObj,result);
							},function(err){
								console.error("Handle data error! ");
							});
		}
	},
	getFileItem: function(docUri){
		var item = null;
		var t_item = null;
		if(this.loadedFilesObj && docUri){
			var files = this.loadedFilesObj.files; 
			for(var i = 0; i< files.length; i++){
				t_item = files[i];
				if(docUri == t_item.getUri()){
					item = t_item;
					break;
				}
			}
		}
		return item;
	},
	destroy: function(){
		this.mobileFiles = null;
		this.filesObj = null;
		this.loadedFilesObj = null;
	}
});
