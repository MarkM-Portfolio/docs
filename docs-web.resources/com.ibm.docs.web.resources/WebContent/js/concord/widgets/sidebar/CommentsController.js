/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.sidebar.CommentsController");
dojo.require("concord.xcomments.CommentsStore");
dojo.require("concord.xcomments.CommentsStoreListener");
dojo.require("concord.xcomments.TextCommentsProxy");
dojo.require("concord.xcomments.SheetCommentsProxy");
dojo.require("concord.widgets.sidebar.Comments");
dojo.require("concord.widgets.sidebar.WidgetStore");
dojo.require("concord.widgets.sidebar.PopupCommentsCacher");
dojo.require("dojox.uuid");

dojo.requireLocalization("concord.widgets.sidebar","Comments");

dojo.declare('concord.widgets.sidebar.CommentsController', null, {
	nls: null,
	container:null,
	listener:null,
	store: null,
	widgetStore: null,
	waitingCommentsIdList:[],
	waitingCommentsReplyList:[],
	curFilterType:1,
	showNewCommentBanner:false,
	isReady:false,
	constructor: function(container, widgetStore){
		this.container = container;
		this.widgetStore = widgetStore;
		
		this.listener = pe.scene;
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","Comments");	
		this._buildStore();
		this._regEvent(); 		
	},
	
    _buildStore: function(){
        var session = pe.scene.getSession();
        var url = session ? session.url + "/parts/comments" : "";
        var e = session && session.bean ? false : true;
        try {
        	if(pe.scene.docType == "text")
        	{
        		var proxy = new concord.xcomments.TextCommentsProxy(url);
        		this.store = new concord.xcomments.CommentsStore(url, e, proxy, this);        		
        	}
        	else if(pe.scene.docType == "sheet")
        	{
        		var proxy = new concord.xcomments.SheetCommentsProxy(url);
        		this.store = new concord.xcomments.CommentsStore(url, false, proxy, this);   
        	}
        	else //pres
        		this.store = new concord.xcomments.CommentsStore(url, e);
        	if (session)
        		session.registerCommentsProxy(this.store.proxy);
            this.store.registerListener(this);
        } 
        catch (e) {
            console.info(e);
        }
    },
    
    _regEvent: function(){
    	concord.util.events.subscribe(concord.util.events.doc_data_reload, this, 'documentReloaded');
    	concord.util.events.subscribe(concord.util.events.comments_reload, this, 'documentReloaded');
    	concord.util.events.subscribe(concord.util.events.commentingEvents, this,'_handleCommentingEvents');
    	concord.util.events.subscribe(concord.util.events.comments_selected, this,'_handleShowComments');
    	concord.util.events.subscribe(concord.util.events.comments_deselected, this,'_handleHideComments');
    	concord.util.events.subscribe(concord.util.events.commentBoxReLocation, this,'_handleCommentBoxReLocation');
    },
    
    _loadComments: function(){
		//update Comments Unread Count at Header, here we got all comments from server.
		//final unread number = pe.basetUnreadCommentsNum + the number of new created comments after pe.basetUnreadCommentsTime
    	var allunreadnum = pe.basetUnreadCommentsNum;
		var update = false;
		if (pe.settings)
		{
			var bar = pe.settings.getSidebar();
			if (bar == pe.settings.SIDEBAR_COLLAPSE)
			{
				update = true;
			}
		}
		var cCount = this.store.getCount();
		for ( var commentGroupindex = 0; commentGroupindex < cCount; commentGroupindex++)
		{
			var comments = this.store.getFromIndex(commentGroupindex);
			var tl = comments.getLastTimestamp();
			pe.lastCommentsItemTimestamp = pe.lastCommentsItemTimestamp > tl ? pe.lastCommentsItemTimestamp : tl;
			var tmpDiv = document.createElement("div");
			dojo.place(tmpDiv, this.container, "first");
			var id = comments.getId();
			var widget = new concord.widgets.sidebar.Comments({
				id: "comment_" + id,
				comments: comments
			}, tmpDiv);
			this.widgetStore.addSection(widget, {}); // info = {},
			if (update)
			{
				var unReadItems = comments.getUnreadNumberByLastTime(pe.basetUnreadCommentsTime);
				if (unReadItems > 0)
				{
					allunreadnum = Math.abs(allunreadnum) + Math.abs(unReadItems);
				}
			}
		}
		if (update)
		{
			var allWidgets = this.widgetStore.getAllWidgets();
			var orgUnreadnum = allunreadnum;
			for ( var i = (cCount - 1); i >=0; i--)
			{
				var widget = allWidgets[i];
				if(widget.getUnReadCommentsNumber()==0){
					var comments = this.store.getFromIndex(i);
					var itemsLength = comments.items.length;
					if (orgUnreadnum > 0)
					{
						this.waitingCommentsIdList.push(comments.getId());
						if(orgUnreadnum >= itemsLength){
							widget.setUnReadCommentsNumber(itemsLength);
							orgUnreadnum -= itemsLength;
						} else {
							widget.setUnReadCommentsNumber(orgUnreadnum);
							break;
						}
					}
				}
			}
			var unread = dojo.byId('sidebar_unread_div');
			if (unread)
			{
				unread.innerHTML = allunreadnum;
				this._updateUnreadStatus();
			}
		}
		this.widgetStore.updateUIbySortResult();
    	this._updateFilterMenu();
    	pe.scene.sidebar.filterUtil._showEmptyInfo(false);
    	if(this.store.getVisibleCount() == 0)
    		pe.scene.sidebar.filterUtil._showEmptyInfo(true);	
    },
    
    storeReady: function()
    {
    	this.widgetStore.destroy();
    	// hide the loading gif first
    	var imgContainer = dojo.byId("ll_comments_init_imgid");
    	if(imgContainer) 
          imgContainer.style.display = 'none';
    	
    	this._loadComments();
    	concord.widgets.sidebar.SideBar.resizeSidebar();
    	// 15079 show slide level comments on desktop
       	//if (window.pe.scene.docType == "pres" && !window.pe.scene.slideComments)
		//	window.pe.scene.slideComments = new concord.widgets.mSlideComments(this.store, window.pe.scene.slideSorter, window.pe.scene.slideEditor);
    	this.isReady = true;
    },
    
    refresh: function(height){    		
    	  var mt = this.container.style.marginTop;//if the search input is open and there are some search result.
		  var styleValue = "height:" + height + "px;" + "width:100%" + "position:absolute;overflow-y:auto;overflow-x:hidden;";
		  if(mt)
			  styleValue = "margin-top:"+ mt +";"+ styleValue;
		  this.container.style.cssText = styleValue;      	
    },
    
    getComment: function(commentId){
    	return this.store.get(commentId);
    },
    
    documentReloaded: function(e){
    	this.store.proxy.getAll();
    },
    
    _handleCommentingEvents: function(data){
    	 if(data.eventName == concord.util.events.commenting_addComment){
 			 this._createComments(data.commentingData);
         } else if (data.eventName == concord.util.events.commenting_removeComment){
        	 this._deleteComments(data.widgetId);
         } else if (data.eventName == concord.util.events.commenting_resolved){
        	 this._updateComments(true, data.widgetId);
         } else if (data.eventName == concord.util.events.commenting_reopen){
        	 this._updateComments(false, data.widgetId);
         } else if (data.eventName == concord.util.events.commenting_addReply){
        	 this._createReply(data.commentingData,data.widgetId);
         } else if (data.eventName == concord.util.events.commenting_hide){
        	 this._handleVisibleStatus(data.widgetId, concord.util.events.commenting_hide);
         }else if (data.eventName == concord.util.events.commenting_delete){
        	 this._handleVisibleStatus(data.widgetId, concord.util.events.commenting_delete);
         }else if (data.eventName == concord.util.events.commenting_undoDelete){
        	 this._handleVisibleStatus(data.widgetId, concord.util.events.commenting_undoDelete);
         }else if( data.eventName == concord.util.events.commenting_show){
        	 this._handleVisibleStatus(data.widgetId, concord.util.events.commenting_show);
         }
    },
    
    _handleVisibleStatus: function(widgetId, eventName){
    	var comments = this.widgetStore.getWidget(widgetId);
    	if(comments){
        	var items = this.store.get(widgetId);
        	var item = items.getItem(0);
        	var prestatus = item.getVisible();
        	var state = 1; //by default, to show
        	// 1: display normally; 0: hide comments;  -1: delete, not permanently, -2 undo delete ,hide
        	if(eventName == concord.util.events.commenting_show){
        		state = 1;
        	}else if(eventName == concord.util.events.commenting_hide){
        		state = 0;
        	}else if(eventName == concord.util.events.commenting_delete){
        		state = (prestatus == 0) ? -2 : -1;
        		this._showDeletedMsg(comments.getId());
            	this._markCommentWidgetRead(comments);  		
        	}else if(eventName == concord.util.events.commenting_undoDelete){ 
        		state = (prestatus == -2) ? 0 : 1;      		
        	}   	
        	comments.setVisible(state);
        	item.setVisible(state);        	
        	var updatedItem = items.updateItem(0, item);
        	if(this.listener.docType == "pres" || item.getWarning())
        	{
        		setTimeout(dojo.hitch(this.listener,this.listener.commentsUpdated, widgetId ,0,updatedItem) ,30);
        	}
        	this._updateFilteredStreamContent();
        	this._checkEmpty();
        	this._updateFilterMenu();
    	}    	
    },
    
    //The param noFocus is for spreadsheet, if it is true, comments box is triggered by cell mouse over.
    _handleShowComments: function(commentId, noFocus){
      if(commentId instanceof Array){
    		var commentsArray = new Array();
    		for(var i = 0; i< commentId.length; i++){
    			var aWidget = this.widgetStore.getWidget(commentId[i]);
    			if(aWidget){
    				this._markCommentWidgetRead(aWidget);
    				commentsArray.push(aWidget.comments);
    			}
    		}
    		if(commentsArray.length === 0) return;
    		this.listener.commentsSelected(commentId, noFocus); 
    		var widgetArray = concord.widgets.sidebar.PopupCommentsCacher.getCachedPCommentsArray(commentsArray);
    		for(var j=0; j< widgetArray.length; j++){
        		var pWidget = widgetArray[j].widget;
        		var cached = widgetArray[j].cached;
        		pWidget.setOverlapIndex(j);
        		if(cached){
        			pWidget.updateComments(widgetArray[j].comments);
        		}else{
        			pWidget.show();
        		}     			
    		}
    	}else{    		
    		var widget = this.widgetStore.getWidget(commentId);
    		if(!widget) return;
    		this._markCommentWidgetRead(widget);
    		if(!noFocus || window.pe.scene.docType == "text"){
    			var inVisible = this.listener.commentsSelected(commentId, noFocus);
    			if(inVisible && window.pe.scene.docType == "sheet")
    				return;
    		}
    		var pWidgetObj =  concord.widgets.sidebar.PopupCommentsCacher.getCachedPComments(widget.comments);
    		var pWidget = pWidgetObj.widget;
    		var cached = pWidgetObj.cached;
    		if(cached){	
    			pWidget.updateComments(widget.comments);
    		}else{
    			pWidget.show();
    		}    	
    	}
    },
    
  //The param noFocus is for spreadsheet, if it is true, comments box is hide by mouse out.
    _handleHideComments: function(commentId, noFocus){
    	if (!commentId || commentId < 0) { // to hide create comment pane
    		var pWidget= concord.widgets.sidebar.PopupCommentsCacher.getCachedWidget();
    		if (pWidget && pWidget.isShown()) pWidget.hide(noFocus);
    		return;    		
    	}
    	var widgets = concord.widgets.sidebar.PopupCommentsCacher.getCachedWidgets();
    	for(var i=0; i<widgets.length; i++){
    		if(widgets[i].isShown()){
    			widgets[i].hide(noFocus);
    		}
    	} 
    },
    
    _updateComments: function(resolved, widgetId){
    	var comments = this.widgetStore.getWidget(widgetId);
    	if(comments){    		    		
        	var items = this.store.get(widgetId);
        	var item = items.getItem(0);
        	var isWarning = item.getWarning();
        	comments.updateWidget(resolved, isWarning);
        	
        	item.setResolved(resolved);        	
        	var updatedItem = items.updateItem(0, item);      	
        	setTimeout(dojo.hitch(this.listener,this.listener.commentsUpdated, widgetId ,0,updatedItem) ,30);    		
        	this._updateFilteredStreamContent();
        	this._updateFilterMenu();
    	}
    },
    
    _handleCommentBoxReLocation: function(commentId){
        if(commentId && commentId instanceof Array){
    		var commentsArray = new Array();
    		for(var i = 0; i< commentId.length; i++){
    			var aWidget = this.widgetStore.getWidget(commentId[i]);
    			if(aWidget){
    				commentsArray.push(aWidget.comments);
    			}
    		}
    		if(commentsArray.length === 0) return;
    		var widgetArray = concord.widgets.sidebar.PopupCommentsCacher.getCachedPCommentsArray(commentsArray);
    		for(var j=0; j< widgetArray.length; j++){
        		var pWidget = widgetArray[j].widget;
        		var cached = widgetArray[j].cached;
        		pWidget.setOverlapIndex(j);
        		if(cached){
        			pWidget.reLocate();
        		}else {
        			pWidget.show();
        		}
    		}
        } else {
	    	var pWidgetObj;
	    	if(!commentId){
	    		pWidgetObj =  concord.widgets.sidebar.PopupCommentsCacher.getCachedPComments();
	    	}else{
		    	var widget = this.widgetStore.getWidget(commentId);
		      	if(!widget) return;
		        pWidgetObj =  concord.widgets.sidebar.PopupCommentsCacher.getCachedPComments(widget.comments);
	    	}
	    	var pWidget = pWidgetObj.widget;
	    	var cached = pWidgetObj.cached;
			if(cached){	
				pWidget.reLocate();
			}else{
				pWidget.show();
			}
        }
    },
    
    _createComments: function(item){
    	//we need to check and make sure there are content boxes on the page in a presentation
    	if(this.listener.docType == "pres") {
    		if(this.listener.checkForEmptyPageWhenAddingComments())
    			return;    		
    	}
        
    	if (!item) {
            console.warn("warning! the item was empty");
            return;
        }
    	//No warning comments, then create one
    	if(item.getWarning()){
    		if(this._getWarningCommentId() != null) 
    			return;   		
    	}
          
    	var noReply = true;
        var actID = this.listener.getCommentsIdInActRange(noReply);
        if (!actID) {//create new comments
            var comments = this.store.add(item);
            if (comments) {
            	//this._showEmptyInfo(false, null, null);
            	var tmpDiv = document.createElement("div");
            	dojo.place(tmpDiv, this.container,"first");       		
        		var id = comments.getId();
        		var isCommentExternal = window.g_isCommentExternal;
        		if(isCommentExternal){        			
        			this._ayncSend3rdMentionRequest(item, id);
        		}
        		var widget = new concord.widgets.sidebar.Comments({id:"comment_"+ id,comments:comments},tmpDiv);
        		this.widgetStore.addSection(widget, {});            	 
		        setTimeout(dojo.hitch(this.listener,this.listener.commentsCreated,comments) ,30);	  
		        this._updateUnreadStausForAddAppend(widget,null,'byme');
            }
        }
    },
    
    _createReply: function(item, commentId){
        var responseItem = this.store.appendItem(commentId, item);
        if (responseItem) {
        	var comments = this.widgetStore.getWidget(commentId);
        	comments.addReply(responseItem);        	
			setTimeout(dojo.hitch(this.listener,this.listener.commentsAppended,commentId,responseItem) ,30);	  
			this._updateUnreadStausForAddAppend(comments,responseItem,'byme');
        }
    },
    
    _deleteComments: function(commentsId){
    	var widget = this.widgetStore.getWidget(commentsId);
    	if(widget){
    		this._markCommentWidgetRead(widget);
    		widget.destroy();
    	} 
    	var comments = dojo.byId("comment_"+commentsId);
    	if(comments)
    		dojo.destroy(comments); 
        
        this.widgetStore.deleteSection(commentsId);  	
        this.store.remove(commentsId);
        this.listener.commentsDeleted(commentsId); 
        this._checkEmpty();
        this._updateFilterMenu();
    },
    
    _showDeletedMsg: function(commentsId){
        if(!commentsId) return;
        var pWidget =  concord.widgets.sidebar.PopupCommentsCacher.getCachedSpecificWidget(commentsId);
        if(pWidget && pWidget.isShown()){
        	pWidget.hide();
        	pe.scene.showWarningMessage(this.nls.commentDeletedMsg, 5000);
        }     	
    },
    
    _getWarningCommentId: function(){
    	  var allWidgets = this.widgetStore.getAllWidgets();
    	  for ( var i in allWidgets){
    	  	var widget = allWidgets[i];
    	  	var comments = widget.comments;
    	  	var isWaring = comments.items[0].getWarning();
    	  	if(isWaring){
    	  		return comments.getId();
    	  	}
    	 }
    	 return null;
    },
    
    _ayncSend3rdMentionRequest: function(item, commentsid){
    	setTimeout(dojo.hitch(this, function(){	
    		var url = concord.util.uri.getAtNotificationUri();
    		if(url == undefined || url == "" ) return; //problem happened on 3rd setting in concord-config.json			
    		var idArray = new Array();
    		var mentions = item.getMentions();
    		if(mentions != null)
    		{				
    			for(var i=0; i< mentions.length; i++){
    				var id = mentions[i].userid;
    				idArray.push(id);
    			}
    		}	
    		var data = {};
    		data.type = "create";
    		data.author = item.getCreatorId();
    		if(idArray.length != 0){
    			data.mentionList = idArray;
    		}			
    		data.owner = item.getCreatorId();
    		data.commentsid = commentsid;			
    		data.link = window.location.href;
    		data.content = item.getContent();	
    		data.fileid = DOC_SCENE.uri;
    		data.filename = DOC_SCENE.title;
    		var sData = dojo.toJson(data);
    		var response, ioArgs;
    		dojo.xhrPost({
    			url: url,
    			handleAs: "json",
    			handle: function(r, io) {response = r; ioArgs = io;},
    			sync: false,
    			contentType: "text/plain",
    			postData: sData
    		});			
    	}), 500);		
    },
    
    _checkEmpty: function()
    {
        if(this.store.getVisibleCount() <= 0)
        {
      	  this._updateFilteredStreamContent();
      	  this._updateUnreadStatus(0);
      	  pe.scene.sidebar.filterUtil._showEmptyInfo(true);
        }	    	
    },
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //  implement of concord.xcomments.CommentsStoreListener, other clients    //////////////////////////////////
      commentsAdded: function(comments){
    	  var id = comments.getId();
    	  var cmtid = "comment_"+ id;
    	  var widget = dijit.byId(cmtid);
    	  if (!widget) { // assume the request is from undo, no need to recreate in sidebar
    	  	if(comments.items[0].getWarning()){
    	  	var cId = this._getWarningCommentId();
    	  		if(cId != null){//delete the local warning comment
    	  			this._deleteComments(cId);
    	  		}
    	  	}
    	  var tmpDiv = document.createElement("div");
    	  dojo.place(tmpDiv, this.container,"first");  
    	  widget = new concord.widgets.sidebar.Comments({id:cmtid,comments:comments},tmpDiv);
    	  this.widgetStore.addSection(widget, {});
    	  this._updateUnreadStausForAddAppend(widget,null,null);
    	 }
      },
      
      commentItemAppended: function(commentsId, item){
          if(item) {
              var comments = this.widgetStore.getWidget(commentsId);
              if(comments){  	  
            	  comments.addReply(item);    
            	  this._updateUnreadStausForAddAppend(comments,item,null);
            	  this.refreshPopupCommentDlg(commentsId);
              }
          }
      },
      
      commentItemUpdated: function(commentsId, index, item){
          if(item) {
              var comments = this.widgetStore.getWidget(commentsId);
              if(comments){
	              var isResolved = item.isResolved();
	              var isWarning = item.getWarning();
	              comments.updateWidget(isResolved, isWarning);
	              if(isWarning){            	  
	            	  var visible = item.getVisible();
	            	  comments.setVisible(visible);
	              }
	              this._updateUnreadStausForAddAppend(comments,null,null,true);
	              this.refreshPopupCommentDlg(commentsId, isResolved);
	              this.listener.commentsIconRefresh && this.listener.commentsIconRefresh(commentsId);
              } 
          }    	  
      },
      
      commentsRemoved: function(commentsId){   
    	  var widget = this.widgetStore.getWidget(commentsId); 
    	  if(widget)
    	  {
    		  this._markCommentWidgetRead(widget);
    	  } 
          var comments = dijit.byId("comment_"+commentsId);
          if(!comments) return;
          comments.destroy();
          this.widgetStore.deleteSection(commentsId);
          this.store.remove(commentsId);
          this._showDeletedMsg(commentsId);
          this._checkEmpty();
          this._updateFilterMenu();
      },
      
      refreshPopupCommentDlg: function(commentsId, isResolved){
	    	if(!commentsId) return; 
	    	var widget = this.widgetStore.getWidget(commentsId);
	    	if(!widget) return;	    	
	    	var pWidget =  concord.widgets.sidebar.PopupCommentsCacher.getCachedSpecificWidget(commentsId);
	    	if(pWidget && pWidget.isShown()){
	    		if(isResolved){
	    			pWidget.hide();
	    			pe.scene.showWarningMessage(this.nls.commentResolvedMsg, 5000);
	    			concord.util.events.publish(concord.util.events.commenting_closeCommentPopupDlg, null);
	    		}else{
	    			pWidget.updateComments(widget.comments, true);	    		    			
	    		}
	    	}
      },
    ////////////////////////////////////////////////////////////////////////////
    //  used by filter & search function.    //////////////////////////////////   
    ///////////////////////////////////////////////////////////////////////////
    

	// byme is not null mean from local. is null mean from others client
	// item is not null mean from append reply, is null mean create new comments
	_updateUnreadStausForAddAppend: function(widget, item, byme,isResolved)
	{
		var fu = pe.scene.sidebar.filterUtil;
		var cftype = this.curFilterType;
		var creatorName = null;
		var comments = widget.comments;
		var tl = comments.getLastTimestamp();
		pe.lastCommentsItemTimestamp = pe.lastCommentsItemTimestamp > tl ? pe.lastCommentsItemTimestamp : tl;
		var bar = pe.settings.getSidebar();
		var needKeep = bar == 2 || pe.scene.sidebar._isKeepScrollPosition();
		if (!item)
		{// this is for add comments
			var inCurType = this._isCommentsMatchType(comments, cftype);
			if (byme)
			{// from local,by me
				this._updateUnreadStatus();
				dojo.window.scrollIntoView(widget.domNode);
				this._updateFilteredStreamContent();
			}
			else if (needKeep || !inCurType)
			{// from others
				if(isResolved){//Update Comments status
					if(this.waitingCommentsIdList.indexOf(comments.id)>-1){
						(bar == 1 && inCurType) && (this.showNewCommentBanner = true);
					}
				}
				else
				{
					this.waitingCommentsIdList.push(comments.id);
					widget.filterComments(false);
					this._updateUnreadStatus(1);
					(bar == 1 && inCurType) && (this.showNewCommentBanner = true);
					widget.setUnReadCommentsNumber(1);
				}
				creatorName = comments.items[0].getCreatorName();
			}
			else
			{
				this._updateFilteredStreamContent();
			}
		}
		else
		{// this is for append comment item,reply item
			var inCurType = this._isCommentsMatchType(item, cftype);
			var replyDom = widget.replys[widget.replys.length - 1].domNode;
			if (byme)
			{// from local,by me
				this._updateUnreadStatus();
				dojo.window.scrollIntoView(replyDom);
				this._updateFilteredStreamContent();
			}
			else if (needKeep || !inCurType)
			{// from others
				dojo.style(replyDom, "display", "none");
				var replyNode = {item:item,replyDom:replyDom};
				this.waitingCommentsReplyList.push(replyNode);
				this._updateUnreadStatus(1);
				(bar == 1 && inCurType) && (this.showNewCommentBanner = true);
				var unReadNum = widget.getUnReadCommentsNumber();
				unReadNum++;
				widget.setUnReadCommentsNumber(unReadNum);
				creatorName = item.getCreatorName();
				comments = item;
			}
			else
			{
				this.widgetStore.updateUIbySortResult();
				this._updateFilteredStreamContent();
			}
		}
		if (this.showNewCommentBanner)
			this._showNewCommentsBanner();
		else if (!byme && bar == 2 && this._isCommentsMatchType(comments, fu.FILTER_TOME))
		{
			this._showNewCommentsToMeBanner(creatorName);
		}
		this._updateFilterMenu();
	},
	_isCommentsMatchType: function(comments, type)
	{
		var fu = pe.scene.sidebar.filterUtil;
		var filterOption = {
			id: fu.filter_user_id,
			org: fu.filter_user_org_id,
			name: fu.filter_user_name,
			filterType: type,
			searchWord: ''
		};
		if (comments.match(filterOption))
		{
			return true;
		}
		return false;
	},
	// Update Active Comments Number in Filter contextmenu @me & byme
	_updateFilterMenu: function()
	{
		var fu = pe.scene.sidebar.filterUtil;
		var unResolvedTome = this._getUnResolvedNumByType(fu.FILTER_TOME);
		var unResolvedByme = this._getUnResolvedNumByType(fu.FILTER_BYME);
		fu.setFilterMenuNum(fu.FILTER_BYME, unResolvedByme);
		fu.setFilterMenuNum(fu.FILTER_TOME, unResolvedTome);
	},
	// For filter contextmenu @me & byme.,return the acitve comments number by type
	_getUnResolvedNumByType: function(type)
	{
		var fu = pe.scene.sidebar.filterUtil;
		var filterOption = {
			id: fu.filter_user_id,
			org: fu.filter_user_org_id,
			name: fu.filter_user_name,
			filterType: type,
			searchWord: ''
		};
		var num = 0;
		var allWidgets = this.widgetStore.getAllWidgets();
		for ( var i in allWidgets)
		{
			var widget = allWidgets[i];
			var comments = widget.comments;
			var visible = comments.items[0].getVisible();
			if (visible < 1)
				continue;
			if (comments.match(filterOption))
			{
				if (!comments.items[0].isResolved())
					num++;
			}
		}
		return num;
	},
	// Make all Widgets in the waiting list visiable.
	_showWaitingWidgets: function(fromScrollbar)
	{
		var cftype = this.curFilterType;
		var newCommentsIdList = [];
		var newCommentsReplyList = [];
		var oldCLength = this.waitingCommentsIdList.length;
		var oldRLength = this.waitingCommentsReplyList.length;
		if (fromScrollbar && !this.showNewCommentBanner)
		{
			return;
		}

		for ( var i in this.waitingCommentsIdList)
		{
			var id = this.waitingCommentsIdList[i];
			var widget = this.widgetStore.getWidget(id);
			if (widget){
				widget.filterComments(true);
				var inCurType = this._isCommentsMatchType(widget.comments, cftype);
				if(!inCurType){
					newCommentsIdList.push(id);
				}
			}
		}
		for ( var i in this.waitingCommentsReplyList)
		{
			var replyNode = this.waitingCommentsReplyList[i];
			var inCurType = this._isCommentsMatchType(replyNode.item, cftype);
			if(!inCurType){
				newCommentsReplyList.push(replyNode);
			}
			dojo.style(replyNode.replyDom, "display", "");
		}
		var reduceNumber = (oldRLength + oldCLength) - (newCommentsReplyList.length + newCommentsIdList.length);
		this.waitingCommentsIdList = newCommentsIdList;
		this.waitingCommentsReplyList = newCommentsReplyList;
		if(cftype == 1)
			this._updateUnreadStatus(0);
		else 
			this._updateUnreadStatus(2,reduceNumber);
		pe.scene.sidebar.filterUtil._hideNewCommentsDiv();
	},
	// Update Comments Unread count Status, just in View Mode
	// type 0 clean unread = 0, type 1 unread+1, type 2 unread -num,
	// null,null mean update time.
	_updateUnreadStatus: function(type, num)
	{
		num && (num = Math.abs(num));
		var n = 0;
		var unread = dojo.byId('sidebar_unread_div');
		if (unread)
			n = unread.innerHTML || 0;
		n = isNaN(n) ? 0 : n;
		n = Math.abs(n);
		switch (type)
		{
			case 0:
				n = 0;
				break;
			case 1:
				n++;
				break;
			case 2:
				n -= num;
				break;
			default:
		}
		if (n < 0)
			n = 0;
		if (unread) {
		unread.innerHTML = n;

		if (n > 0)
		{
			dojo.attr(unread, "tabIndex", "0");
			dojo.style(unread, "display", "");
			dijit.setWaiState(unread, "label", this.nls.jawsnewcommentsnumber);
			dijit.setWaiRole(unread, "alert");
			dojo.attr(unread,"title", this.nls.newcommentsnumber);
			dojo.attr(unread,"alt", this.nls.newcommentsnumber);
		}
		else
		{
			dojo.attr(unread, "tabIndex", "-1");
			dojo.style(unread, "display", "none");
			dijit.setWaiRole(unread, '');
			dijit.setWaiState(unread, "label", "");
			dojo.attr(unread,"title", "");
			dojo.attr(unread,"alt", "");
			this._markAllCommentsRead();
		}
		}
		var status = {
			time: pe.lastCommentsItemTimestamp,
			number: n
		};
		pe.curUser && pe.curUser.setUnreadCommentsStatus(status);
	},
	// mark the comment widget as read and update the Comments Unread count in Head
	_markCommentWidgetRead: function(widget)
	{
		var unReadNum = widget.getUnReadCommentsNumber();
		if (unReadNum > 0)
		{
			this._updateUnreadStatus(2, unReadNum);
			widget.setUnReadCommentsNumber(0);
		}
	},
	// mark all comment widgets as read
	_markAllCommentsRead: function()
	{
		var allWidgets = this.widgetStore.getAllWidgets();
		for ( var i in allWidgets)
		{
			var widget = allWidgets[i];
			var comments = widget.comments;
			var visible = comments.items[0].getVisible();
			if (visible < 1)
				continue;
			if(widget.commmentsNode && (widget.commmentsNode.style.display == 'none' || !widget.commmentsNode.style.display))
				widget.filterComments(true);
			widget.setUnReadCommentsNumber(0);
		}
	},
	_showNewCommentsToMeBanner: function(who)
	{
		pe.scene.sidebar.filterUtil._showNewCommentsToMeDiv(who);
	},
	_showNewCommentsBanner: function()
	{
		pe.scene.sidebar.filterUtil._showNewCommentsDiv();
	},
	_updateFilteredStreamContent: function()
	{
		pe.scene.sidebar.filterUtil.filterStreamContentByType(this.curFilterType);
	},
	_filterStreamContentByType: function(filterOption)
	{
		if (!filterOption)
			return;
		this.curFilterType = filterOption.filterType;
		var notEmpty = false;
		var allWidgets = this.widgetStore.getAllWidgets();
		for ( var i in allWidgets)
		{
			var widget = allWidgets[i];
			var comments = widget.comments;
			var visible = comments.items[0].getVisible();
			if (visible < 1)
				continue;
			var show = false;
			if (comments.match(filterOption))
			{
				notEmpty = true;
				show = true;
			}
			else
			{
				show = false;
			}
			this._updateCommentsWidgetUIforSearch(widget, show, filterOption.searchWord);
		}
		return notEmpty;
	},
	_updateCommentsWidgetUIforSearch: function(widget, show, keyWords)
	{
		if (show)
		{
			var commentItem = widget.comments.items[0];
			var creatorName = commentItem.getCreatorName();
			if(commentItem.getWarning()){
				creatorName = this.nls.warningCommentName;
			}
			creatorName = !widget.isBidi ? creatorName : BidiUtils.addEmbeddingUCC(creatorName);
			creatorName = pe.scene.sidebar.filterUtil._doHighLights(creatorName, keyWords);
			widget.nameNode.innerHTML = creatorName;
			
			var commentContent = commentItem.getContent();
			var result = concord.widgets.sidebar.Comments.parseContent(commentContent,commentItem.getMentions(),keyWords);
			widget.contentNode.innerHTML = result;

			var replys = widget.replys;
			for ( var i in replys)
			{
				var reply =  replys[i];
				commentItem = reply.responseItem;
				creatorName = commentItem.getCreatorName();
				creatorName = !widget.isBidi ? creatorName : BidiUtils.addEmbeddingUCC(creatorName);
				creatorName = pe.scene.sidebar.filterUtil._doHighLights(creatorName, keyWords);
				reply.rNameNode.innerHTML = creatorName;
				commentContent = commentItem.getContent();
				var result = concord.widgets.sidebar.Comments.parseContent(commentContent,commentItem.getMentions(),keyWords);
				reply.contentNode.innerHTML = result;
			}
			
			widget.filterComments(true);
		}
		else
		{
			widget.filterComments(false);
		}
	}
//	_doHighLights: function(contents, highlights)
//	{
//		return pe.scene.sidebar.filterUtil._doHighLights(contents, highlights);
//	}
  // ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
});

concord.widgets.sidebar.CommentsController.publishHideEvent = function (commentId){
	var eventData = [{eventName: concord.util.events.commenting_hide, widgetId: commentId}];
	concord.util.events.publish(concord.util.events.commentingEvents, eventData);	
};
concord.widgets.sidebar.CommentsController.publishShowEvent = function (commentId){
	var eventData = [{eventName: concord.util.events.commenting_show, widgetId: commentId}];
	concord.util.events.publish(concord.util.events.commentingEvents, eventData);	
};
concord.widgets.sidebar.CommentsController.publishDeleteEvent = function (commentId){
	var eventData = [{eventName: concord.util.events.commenting_delete, widgetId: commentId}];
	concord.util.events.publish(concord.util.events.commentingEvents, eventData);	
};
concord.widgets.sidebar.CommentsController.publishUndoDeleteEvent = function (commentId){
	var eventData = [{eventName: concord.util.events.commenting_undoDelete, widgetId: commentId}];
	concord.util.events.publish(concord.util.events.commentingEvents, eventData);	
};