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

dojo.provide("concord.widgets.sidebar.Reply");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.date");

dojo.requireLocalization("concord.widgets.sidebar","Comments");

dojo.declare('concord.widgets.sidebar.Reply', [dijit._Widget,dijit._Templated], {
	nls: null,
	responseItem: null,
	forPopup: false,
	
	templateString: "<div class='replies' tabindex='0' role='region' dojoAttachPoint='repliesNode'><div class='meta' dojoAttachPoint='rMetaNode'>" +
			"<div class='name' dojoAttachPoint='rNameNode'></div><div class='time' dojoAttachPoint='rTimeNode'></div></div>" +
			"<p style='white-space: pre-line;' dojoAttachPoint='contentNode'></p></div>",
			
	constructor: function(args){
		this.responseItem = args.reply;	
		this.forPopup = args.forPopup;
	},		
	
	postCreate: function(){	
		this.inherited(arguments);
		this._createContent();
	},
	
	_createContent: function(){
		var isBidi = BidiUtils.isBidiOn();
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","Comments");		
		if(window.conditionRenderer){
			var profileNode = window.conditionRenderer.getUserTokenByUUID(this.responseItem.getCreatorId());
			dojo.place(profileNode, this.rNameNode, "before");           		
		}
		var authorname = this.responseItem.getCreatorName();
		authorname = !isBidi ? authorname : BidiUtils.addEmbeddingUCC(authorname);
		var timestamp = concord.widgets.sidebar.Comments.parseDateTime(this.responseItem.getTimestamp());
		timestamp = !BidiUtils.isGuiRtl ? timestamp : BidiUtils.formatDateTime(timestamp);
		var content = this.responseItem.getContent();
          	
		this.rNameNode.innerHTML = authorname;           	            	
		this.rTimeNode.innerHTML = timestamp;
		this.contentNode.innerHTML = concord.widgets.sidebar.Comments.parseContent(content,this.responseItem.getMentions());
		
		var jawContent = dojo.string.substitute(this.nls.jawsContentHint, {'content': this.contentNode.innerHTML});
		var jawReply = dojo.string.substitute(this.nls.jawsReplyHint, {'authorname': authorname, 'timestamp': timestamp});
		if(this.forPopup){
			dijit.setWaiState(this.repliesNode,'label', jawReply +"\n"+ jawContent);
		}else{    		
			dijit.setWaiState(this.repliesNode,'label', jawReply +"\n"+ jawContent +"\n"+ this.nls.jawsCommentKeyHint);
		}
	}
});