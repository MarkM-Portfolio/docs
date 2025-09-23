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
dojo.provide("concord.widgets.sidebar.Comments");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.date");
dojo.require("dojox.uuid");
dojo.require("concord.widgets.sidebar.Reply");

dojo.requireLocalization("concord.widgets.sidebar","Comments");

dojo.declare('concord.widgets.sidebar.Comments', [dijit._Widget,dijit._Templated], {
	nls: null,
	isCollapsed: true,
	comments: null,
	
	profileNode: null,
	resolvedProfileNode: null,
	warningProfileNode: null,
	creatorId: null,
	unReadNum:null,
	
	jawContent: null,
	jawStatus: null,
	jawComment: null,
	
	templateString: dojo.cache("concord", "templates/Comments.html"),
	
	constructor: function(args){
		this.comments = args.comments;
		this.unReadNum = 0;
	},
	
	postCreate: function(){	
		this.inherited(arguments);
		this._initComments();
		this._createContent();	
	},
	
	_initComments: function(){
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","Comments");
		this.isBidi = BidiUtils.isBidiOn();	
	},
	
	_createContent: function(){
		this.replys = [];
		var replyNum =  this.comments.getItemCount() -1;
        for (var commentIndex = 0; commentIndex < this.comments.getItemCount(); commentIndex++) {
            var commentItem = this.comments.getItem(commentIndex);  
            
            var authorname = commentItem.getCreatorName();
            if(authorname == null || authorname == undefined) authorname = "";
            authorname = !this.isBidi ? authorname : BidiUtils.addEmbeddingUCC(authorname);           
            authorname = concord.util.acf.escapeXml(authorname, true);
            var timestamp = concord.widgets.sidebar.Comments.parseDateTime(commentItem.getTimestamp());
            if (this.isBidi) {
            	timestamp = BidiUtils.formatDateTime(timestamp);
            }
            var content = commentItem.getContent();
        
            if(commentIndex === 0){
            	this.creatorId = commentItem.getCreatorId();
                var isWarning = commentItem.getWarning();
                if(isWarning) {
                	authorname = this.nls.warningCommentName;
                }
            	this.updateWidget(commentItem.isResolved(), isWarning);
            	this.nameNode.innerHTML = authorname;
            	this.timeNode.innerHTML = timestamp;
            	this.contentNode.innerHTML = concord.widgets.sidebar.Comments.parseContent(content,commentItem.getMentions());
            	
            	this.jawContent = dojo.string.substitute(this.nls.jawsContentHint, {'content': this.contentNode.innerHTML});
            	this.jawStatus = dojo.string.substitute(this.nls.jawsCommentStatusHint, {'status': commentItem.isResolved() 
            		? this.nls.menuresolved : this.nls.menuactive});
            	this.jawComment = dojo.string.substitute(this.nls.jawsCommentHint, {'authorname': authorname, 'timestamp': timestamp});
            	dijit.setWaiState(this.boxNode,'label', this.jawComment +"\n"+ this.jawContent +"\n"+  this.jawStatus +"\n"+ this.nls.jawsCommentKeyHint);
            	
            	this._createViewButton(replyNum);
            	this.setVisible(commentItem.getVisible());
            } else { 
            	var isHidden = (replyNum == 1 || (replyNum > 1 && commentIndex === replyNum))? false: true ;
            	this._createReply(commentItem, isHidden);
            }
        }
	},
	
	_createViewButton: function(replyNum){
		if(replyNum > 1 ){ 
			dojo.removeClass(this.viewNode,"hidden");
		}else{
			if(!dojo.hasClass(this.viewNode,"hidden")){dojo.addClass(this.viewNode,"hidden");};	
		}
    	this.viewNode.innerHTML = dojo.string.substitute( this.nls.viewCollapsedBtn, [replyNum -1]);
    	dijit.setWaiState(this.viewNode,'expanded', 'false');
	},
	
	_createReply: function(commentItem, isHidden){
		var tmpDiv = dojo.create("div", null, this.boxNode);
		var id = "reply_"+dojox.uuid.generateRandomUuid();
		this.replys.push(new concord.widgets.sidebar.Reply({id:id, reply: commentItem, forPopup: false}, tmpDiv));	
		if(isHidden){this.hideNode(dojo.byId(id));}		
	},
	
	//status, css rendering
	updateWidget: function(resolved, isWarning){
		if(resolved){
			if(!dojo.hasClass(this.commmentsNode,"resolved"))dojo.addClass(this.commmentsNode,"resolved");
			if(!this.resolvedProfileNode){				
				this.resolvedProfileNode = document.createElement('div');
				dojo.addClass(this.resolvedProfileNode,"resolvedContainer");
				var photoNode = dojo.create('div', null, this.resolvedProfileNode);
				dojo.addClass(photoNode, "resolvedPhoto");
				dojo.attr(photoNode,'alt','');
				dojo.attr(photoNode,'title',this.nls.resolveFlag);
				dojo.place(this.resolvedProfileNode, this.nameNode, "before"); 			
			}else {
				dojo.style(this.resolvedProfileNode,"display","block");
			}			
			if(this.profileNode)
				dojo.style(this.profileNode,"display","none");
			if(this.warningProfileNode)
				dojo.style(this.warningProfileNode,"display","none");
		}else{
			dojo.removeClass(this.commmentsNode,"resolved");
			//It is a warning comments for orphaned usage
			if(isWarning){
				if(!this.warningProfileNode){
					this.warningProfileNode = document.createElement('div');
					dojo.addClass(this.warningProfileNode,"resolvedContainer");
					var photoNode = dojo.create('div', null, this.warningProfileNode);
					dojo.addClass(photoNode, "warningPhoto");
					dojo.attr(photoNode,'alt','');
					dojo.attr(photoNode,'title','');
					dojo.place(this.warningProfileNode, this.nameNode, "before"); 					
				}else {
					dojo.style(this.warningProfileNode,"display","block");
				}			
				if(this.profileNode)
					dojo.style(this.profileNode,"display","none");				
			}else{				
				if(!this.profileNode){								
					if(window.conditionRenderer){
						this.profileNode = window.conditionRenderer.getUserTokenByUUID(this.creatorId);
						dojo.place(this.profileNode, this.nameNode, "before");
					}
				}else{
					if(this.profileNode) dojo.style(this.profileNode,"display","block");
				}		
			}
			if(this.resolvedProfileNode) dojo.style(this.resolvedProfileNode,"display","none");
		}
		
    	this.jawStatus = dojo.string.substitute(this.nls.jawsCommentStatusHint, {'status': resolved ? this.nls.menuresolved : this.nls.menuactive});
    	dijit.setWaiState(this.boxNode,'label', this.jawComment +"\n"+ this.jawContent +"\n"+  this.jawStatus +"\n"+ this.nls.jawsCommentKeyHint);		
	},
	//set unread item number. by default all is Read, unread number is 0
	setUnReadCommentsNumber: function(num){
		this.unReadNum = num;
	},
	//get the widget unread items number. 
	getUnReadCommentsNumber: function(){
		return this.unReadNum;
	},
	
	setVisible: function(state){
		switch(state){
			case -2:
			case -1:
			case 0: 
				//dojo.style(this.commmentsNode,"display", "none");
				if(!dojo.hasClass(this.commmentsNode,"hidden")){dojo.addClass(this.commmentsNode,"hidden");};				
				break;
			case 1:
				//dojo.style(this.commmentsNode,"display", "block");
				dojo.removeClass(this.commmentsNode,"hidden");
				break;
			default:
		}
	},
	
	filterComments: function(show){
		dojo.style(this.commmentsNode,"display", show ? "block":"none");
	},
	
	addReply: function(responseItem){
		var tmpDiv = dojo.create("div", null, this.boxNode);
		this.replys.push(new concord.widgets.sidebar.Reply({id:"reply_"+dojox.uuid.generateRandomUuid(),reply: responseItem}, tmpDiv));
		if(dojo.hasClass(this.viewNode,"hidden") && this.replys.length >1 ){
			dojo.removeClass(this.viewNode,"hidden");
			this.viewNode.innerHTML = this.nls.viewExpandedBtn;
			this.isCollapsed = false;
		}
	},
	
	hideNode: function(node){
		if(node && !dojo.hasClass(node,"hidden")){dojo.addClass(node,"hidden");};
	},
	
	showNode: function(node){
		dojo.removeClass(node,"hidden");
	},
	
	getId: function(){
		return this.comments.getId();
	},
	
	destroy: function(){
		if(window.conditionRenderer){			
			dojo.query(".unified_editor", this.commmentsNode).forEach(dojo.hitch(this, function(node){
				window.conditionRenderer.unbindUserTokenBeforeDesctroy(node);
				dojo.destroy(node);
			}));		
		}
		this.replys = null;
		this.inherited(arguments);
	},
	
	_onKeyDown: function(e){
        e = e || window.event;
        var key = (e.keyCode ? e.keyCode : e.which);
        if(key == 115 && (e.ctrlKey || e.metaKey)){
            if (e.preventDefault) 
                e.preventDefault();
            return;
        }            
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.keyCode != dojo.keys.ENTER && e.keyCode != dojo.keys.SPACE) return;         
		this._onclick(e);
	},
	
	_onclick: function(event){
        var key = event.keyCode || event.charCode;        
        var target = event.target;
        if (target == null) 
        	target = event.srcElement; 
        if(target == this.viewNode){
        	if(this.isCollapsed){
        		//To expand
        		this.viewNode.innerHTML = this.nls.viewExpandedBtn;
        		dojo.query(".replies", this.boxNode).forEach(dojo.hitch(this, function(node){
                    this.showNode(node);                
                }));
        		this.isCollapsed = false;
        		dijit.setWaiState(this.viewNode,'expanded', 'true');        		
        	}else{
        		//To collapse
        		var replies = dojo.query(".replies", this.boxNode);
        		if(replies){        			
        			var replyNum = replies.length;
        			this.viewNode.innerHTML =  dojo.string.substitute( this.nls.viewCollapsedBtn, [replyNum -1]);       			
        			for(var i =0; i<replies.length -1; i++){
        				this.hideNode(replies[i]); 
        			}
        		}
        		this.isCollapsed = true;
        		dijit.setWaiState(this.viewNode,'expanded', 'false');        		
        	}
        	dojo.stopEvent(event);
        }else{    
        	// for writer, sometimes it should not show popup. for ex, when focus in header/footer or notes
        	// so need query before sending out comment_selected event
    		if (window.pe.scene.docType == "text") {
	        	var ev = {eventName:"checkforshowcomments", filled:false};
	    		concord.util.events.publish(concord.util.events.comments_queryposition, [ev]);
	    		if (ev.filled && ev.ret===false) return;
        	}
        	concord.util.events.publish(concord.util.events.comments_selected,[this.getId()]);
        }
	},
	
	_onMouseOver: function(e){
		
	},
	
	_onMouseOut: function(e){
		
	}
	
});

concord.widgets.sidebar.Comments.parseDateTime = function(datestamp){
	var theTime = concord.util.date.parseTime(datestamp, "short");
	var nls = dojo.i18n.getLocalization("concord.widgets.sidebar","Comments");
	var theDate = concord.util.date.parseDate(datestamp);
	if (concord.util.date.isToday(theDate)){
		return dojo.string.substitute( nls.todayAt, {'time': theTime}); 
	}else if (concord.util.date.isYesterday(theDate)){
		return dojo.string.substitute( nls.yesterdayAt, {'time': theTime}); 
	}else{
		return dojo.string.substitute( nls.dateAt, {'date': theDate, 'time': theTime}); 
	}
};

concord.widgets.sidebar.Comments.parseContent =  function(content, mentions, highlights){
	var isBidi = BidiUtils.isBidiOn();
	if(!content) return "";
	content = concord.util.acf.escapeXml(content, true);
	if(mentions){
		try {
			var editorArray = concord.widgets.sidebar.Comments.getPrefixEditors(mentions);
			for(var i=0; i< mentions.length; i++){
				var name = mentions[i].name;							
				var matchedName = null;
				
				if(editorArray.length != 0){
					for(var k =0 ; k<editorArray.length; k++){
						if(name === editorArray[k].shortName){
							matchedName = editorArray[k].longName;
							break;
						}
					}
					if(matchedName)
						content = concord.widgets.sidebar.Comments.styleMentioned(content, name, matchedName);
				}				
				if(!matchedName){	
					var key ="@"+name+" ";						
					if(content.indexOf(key) != -1){
						if (isBidi)
							content = content.replace(new RegExp(key,"gm"),"<b>"+BidiUtils.addOverrideUCC("@" + BidiUtils.addEmbeddingUCC(name), "ltr")+"</b>");
						else
							content = content.replace(new RegExp(key,"gm"),"<b>"+key+"</b>"); 						
					}
				}
				//Deal with the last mentioned
				key = "@"+name;
				var lIndex = content.lastIndexOf(key);
				var lastContent = content.substring(lIndex,content.length);
				lastContent = lastContent.replace(/[\n\r]/g,"");
				lastContent = lastContent.replace(new RegExp("<br/>","gm"),"");
				if(lastContent == key){
					if (isBidi)
						key = BidiUtils.addOverrideUCC("@" + BidiUtils.addEmbeddingUCC(name), "ltr");
					content = content.substring(0,lIndex) + "<b>"+key+"</b>";
				}
			}
		} catch(e) {
			console.log('Comments.js: Cannnot get mention user list!');
		}
	}
	if(highlights){
		content = pe.scene.sidebar.filterUtil._doHighLights(content, highlights);
	}
	if (isBidi){
		var contentLines = content.split('\n');
		//remove user names, remove any html tags
		var textDir = BidiUtils.getResolvedTextDir(
			contentLines[0].replace(new RegExp("<b>.*</b>","gm"),"").replace(/(<([^>]+)>)/ig,""));
		var textAlign = (textDir == "rtl") ? "right" : "left";
		var cssStyle = "display: block; direction: " + textDir + "; text-align: " + textAlign + ";";
		for (var i=0; i<contentLines.length; i++){
			var line = contentLines[i];
			contentLines[i] = "<span style = '" + cssStyle + "'>" + line + "</span>";
		}
		content = contentLines.join('\n');
		content = content.replace(new RegExp("<b>","gm"),"&nbsp;<b>");
		content = content.replace(new RegExp("</b>","gm"),"</b>&nbsp;");
	}
	content = content.replace(new RegExp("<b>","gm"),"<span class='mention'>");
	content = content.replace(new RegExp("</b>","gm"),"</span>");
	return content;
};

concord.widgets.sidebar.Comments.getPrefixEditors = function(list){
	var editorArray = new Array();
	if (list && list.length > 0){ // n < 30 ,probably n< 10
		for (var i=0; i<list.length-1; i++) {
			var name = list[i].name;
			for(var j=i+1; j<list.length;j++){
				var matchedName = list[j].name;
				if(matchedName.indexOf(name) == 0 || name.indexOf(matchedName) == 0){
					var nameMap = {};
					nameMap.shortName = (matchedName > name) ? name: matchedName;
					nameMap.longName = (matchedName > name) ? matchedName: name;					
					editorArray.push(nameMap);
				}
			} 
		}
	}
	return editorArray;
};


concord.widgets.sidebar.Comments.styleMentioned = function(content, name, matchedName){
	var key ="@"+name+" ";
	var pos = content.indexOf(key);
	if(pos == -1) return content;
	
	var contentArray = content.split('@');
	var isLastMatched = contentArray[contentArray.length -1] == matchedName;
	var theContent = contentArray[0];
	var index = 0;
	for(var i=1; i< contentArray.length; i++){
		index++;
		var seg = contentArray[i];
		var key1 = name+" ";
		var pos1 = seg.indexOf(key1);
		var key2 = (isLastMatched && index == contentArray.length -1) ? matchedName : matchedName+" ";
		var pos2 = seg.indexOf(key2);
		if(pos1 === 0 && pos2 !== 0){
			var others = seg.substring(key1.length, seg.length);
			if (BidiUtils.isBidiOn())
				theContent += "<b>"+BidiUtils.addOverrideUCC("@" + BidiUtils.addEmbeddingUCC(key1), "ltr")+"</b>"+others;
			else
				theContent += "<b>@"+key1+"</b>"+others;
		}else{
			theContent += "@"+seg;
		}		
	}
	content = content.replace(new RegExp("<b>","gm"),"<span class='mention'>");
	content = content.replace(new RegExp("</b>","gm"),"</span>");	
	return theContent;
};

concord.widgets.sidebar.Comments.isMentioned = function(content, name, matchedName){
	var key ="@"+name+" ";
	var pos = content.indexOf(key);
	if(pos == -1) return;	
	
	var key2 = "@"+matchedName+" ";
	var key3 = "@"+matchedName;
	var theContent = content;
	while(pos != -1){
		var lIndex = theContent.lastIndexOf(key3);
		var sIndex = theContent.indexOf(key3);
		if(lIndex === sIndex && theContent.substring(lIndex,theContent.length) == key3){
			key2 = key3;
		}
		if(theContent.indexOf(key2) == pos){
			theContent = theContent.substring(pos+key2.length, theContent.length);
			if(!theContent || theContent === "") break;
		}else{
			return true;			
		}					
		pos = theContent.indexOf(key);
	}
	return false;
};