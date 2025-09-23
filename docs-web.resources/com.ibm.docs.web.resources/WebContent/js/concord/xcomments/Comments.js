/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.xcomments.Comments");
dojo.provide("concord.xcomments.CommentItem");

dojo.require("dojox.uuid.generateRandomUuid");

dojo.require("concord.editor.CharEquivalence");
dojo.require("concord.editor.CJKWidthCharMap");

dojo.declare("concord.xcomments.Comments", null, {
	id: null,
	items: null,
	
	generateUUID: function ()
	{
 		return dojox.uuid.generateRandomUuid(); 		
	},
	
	constructor: function (e)
	{
		if(e)
		{
		  this.id = e.id;		  
		  this.items = [];
		  var list = e.items;
		  if(list)
		  {//construct from a comments list
		    for (var i = 0; i < list.length; i++)
		    {
			    this.items.push(new concord.xcomments.CommentItem(list[i]));
		    }
		  }
		  else
			{// construct from a comments item, should have an ID already.
				this.items.push(new concord.xcomments.CommentItem(e));
			}
		}
	  else
		{// construct an empty comments instance
			this.id = this.generateUUID();
			this.items = [];
		}
	},	
 		

	getId: function ()
	{
		return this.id;
	},
	
	getItemCount: function ()
	{
		return this.items.length;
	},
	
	getLastTimestamp: function ()
	{
		var last = 0;
		for (var i = 0; i < this.items.length; i++)
		{
			var time = this.items[i].getTimestamp();
			last = last > time ? last : time;
		}
		return last;
	},
	
	getUnreadNumberByLastTime: function (time)
	{
		var unread = 0;
		for (var i = 0; i < this.items.length; i++)
		{
			var t = this.items[i].getTimestamp();
			if(t > time) unread ++;
		}
		return unread;
	},
	
	getItem: function (i)
	{
		return this.items[i];
	},

	getItembyId: function(id)
	{
		for (var i = 0; i < this.items.length; i++)
		{
			var item = this.items[i];
			var cid = item && item.getId();
			if(cid && cid == id)
				return item;
		}
		return;
	},

	appendItem: function (item)
	{
		this.items.push(item);
	},
	
	updateItem: function (index, item)
	{
		for (var i = 0; i < this.items.length; i++)
		{
			if(i == index)
			{
				this.items[i] = item;
			}
		}
		
		return this.items[index];
	},
	
	toJSObj: function ()
	{
		var e = new Object();
		e.id = this.id;
		e.items = new Array();
		for (var i = 0; i < this.items.length; i++)
		{
			e.items.push(this.items[i].toJSObj());
		}
		return e;
	},
	
	match: function(filterOption)
	{
		
		filterOption.isResolved = this.items[0].isResolved();
		for(var i=0; i<this.items.length; i++)
		{
			if( this.items[i].match(filterOption) ){
				return true;
			}
		}
		return false;
	}	
});

dojo.declare("concord.xcomments.CommentItem", null, {
	e: null,
	charEQ: null,
	CJK_map: null,
	lang: null,
	
	constructor: function (e)
	{
		if (e)
			this.e = e;
		else
			this.e = new Object();
		//Unicode normalization before search and sorting
        this.lang = g_locale || navigator.userLanguage || navigator.language;
        this.charEQ = new concord.editor.CharEquivalence;
        if(this.lang.indexOf('zh') != -1 || this.lang.indexOf('ko') != -1 || this.lang.indexOf('ja') != -1){
        	this.CJK_map = new concord.editor.CJKWidthCharMap;
        }    
	},
	
	getId: function ()
	{
		return this.e.id;
	},
	
	getImgUrl: function()
	{
		return this.e.img;
	},
	
	getContent: function ()
	{
		return this.e.content;
	},
	
	getCreatorId: function ()
	{
		return this.e.uid;
	},
	
	// obsolete
	getCreatorEmail: function ()
	{
		return this.e.email;
	},
	
	getCreatorName: function ()
	{
		return this.e.name;
	},
	
	getTimestamp: function ()
	{
		return this.e.time;
	},
	
	// obsolete
	getType: function()
	{
		return this.type;
	},
	
	//obsolete
	getAssignee: function ()
	{
		return this.e.assignee;
	},	
	
	getOrg: function ()
	{
		return this.e.org;
	},
	
	getAssigneeId: function ()
	{
		return this.e.assigneeId;
	},
	
	getAssigneeOrg: function ()
	{
		return this.e.assigneeOrg;
	},
	
	setStrike: function(bS)
	{
		this.e.strike = bS;
	},
	
	isStrike: function()
	{
		return this.e.strike;
	},
	
	setResolved: function(resolved)
	{
		this.e.resolved = resolved;
	},
	
	isResolved: function()
	{
		return this.e.resolved;
	},
	
	getOrphaned: function()
	{
		return this.e.isOrphan;
	},
	
	setWarning: function (isWarning)
	{
		this.e.isWarning = isWarning;
	},
	
	getWarning: function()
	{
		return this.e.isWarning;
	},
	
	setMentions: function(mentions)
	{
		this.e.mentions = mentions;
	},
	
	getMentions: function()
	{
		var mentions = this.e.mentions;
		//For legacy comment
		if(!this.e.mentions && this.getAssigneeId()){
			mentions = new Array();
			var obj = {};
			obj.userid = this.getAssigneeId();
			obj.name = this.getAssignee();
			mentions.push(obj);
		}
		return mentions;
	},
	
	getVisible: function(){
		if(this.e.visible === undefined) return 1;
		return this.e.visible;
	},
	
	/*
	 * switch(state){
	 * 	case -2: // delete in hide status
	 * 	case -1: // delete, not permanently 
	 * 	case 0: // hide , don't show in client
	 * 	case 1: // visible is true, normal status
	 * }
	 */
	setVisible: function (state){
		this.e.visible = state;
	},
	
	isAnnotator: function()
	{
		if(this.e.img)
			return true;
		return false;
	},
	
	toJSObj: function()
	{
		return this.e;
	},
	_matchWord: function(content,ptn){
		content = content.toLowerCase();
		ptn = ptn.toLowerCase();
		content = this.charEQ.normalize_latin(content);
		ptn = this.charEQ.normalize_latin(ptn);
		if(this.lang.indexOf('ja') != -1) {
			content = this.CJK_map.strToHarf(content);
			content = this.charEQ.normalize_ja(content);
			ptn = this.CJK_map.strToHarf(ptn);
			ptn = this.charEQ.normalize_ja(ptn);
		}
		if( this.lang.indexOf('zh') != -1 || this.lang.indexOf('ko') != -1) {
			content = this.CJK_map.strToHarf(content);
			ptn = this.CJK_map.strToHarf(ptn);
		}
		var pos = content ? content.toLowerCase().indexOf( ptn.toLowerCase() ) : -1;			  
		return (pos >= 0);
	},
	match: function(filterOption)
	{
		var doSearchWord = false;
		var show = false;
		var ptn = filterOption.searchWord;
		if(ptn.length > 0){
			doSearchWord = true;
			var content = this.getContent();
			var name = this.getCreatorName();
			show = this._matchWord(content,ptn)||this._matchWord(name,ptn);
		}
		switch(filterOption.filterType)
		{
			case 1: //FILTER_ALL
				return doSearchWord?(show && true):true;
			case 2: //FILTER_TOME
				return doSearchWord?(show && this._isDirectedTo(filterOption)):this._isDirectedTo(filterOption);
			case 3: //FILTER_BYME
				return doSearchWord?(show && this._isWrittenBy(filterOption)):this._isWrittenBy(filterOption);
			case 4: //FILTER_ACTIVE
				return doSearchWord?(show && !filterOption.isResolved):!filterOption.isResolved;
			case 5: //FILTER_RESOLVED
				return doSearchWord?(show && filterOption.isResolved):filterOption.isResolved;
			default:
				return false;
		}
	},
		
	_isWrittenBy: function(filter)
	{
			  if( this.getOrg() )
			    return ( this.getCreatorId() == filter.id && this.getOrg() == filter.org );
			  else
					return ( this.getCreatorId() == filter.id);					
	},
		
	_isDirectedTo: function(filter)
	{
//			  if( this.getOrg() )			
//			    return ( this.getAssigneeId() == filter.id && this.getAssigneeOrg() == filter.org );
//		    else
//		    	return ( this.getAssigneeId() == filter.id );
		var mentions = this.getMentions();
		if(mentions){
			for(var k in mentions){
				//TODO need change to object just like this.getCreatorId() == filter.id && this.getOrg() == filter.org
				var mention = mentions[k];
				if(mention.userid == filter.id){
					return true;
				}
			}
		}
		return false;
	}
});

/**
 * content: content strings
 * user:  {org: "orgId", uid: "userId", name: "displayName"}
 * assignee: {id: "userId", org: "orgId"}
 * img: link to an extermal image
 */

concord.xcomments.CommentItem.createItem = function (content, user, assignee, img, mentions)
{
	var e = new Object();
	e.type = "comments"; 
	e.content = content;
	e.email = null; //obsolete
	e.org = user? user.org : null; // overwrite on server side 
	e.uid = user? user.uid : null;	// overwrite on server side
	e.name = user? user.name : null; // overwrite on server side
	e.assigneeOrg = assignee? assignee.org : null;
	e.assigneeId = assignee ? assignee.id : null;	
	
	e.assignee = e.assigneeId; //obsolete	
	e.mentions = mentions ? mentions : null;
	e.time = (new Date()).getTime();
	e.img = img? img : null;
	
	return new concord.xcomments.CommentItem(e);
};