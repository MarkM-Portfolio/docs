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

dojo.provide("concord.widgets.revision.revisionPanel");

dojo.require("dijit.form.CheckBox");
dojo.require("dojo.i18n");
dojo.require("concord.util.date");

dojo.requireLocalization("concord.widgets.revision","revisionPanel");

dojo.declare("concord.widgets.revision.revisionPanel", null, {	
	_revList: null,		// Array of all revision list
	_styleList: null,	// Array of style list
	_authors: null,     // Array of All authors
	_revSeq: null,	    // Array of revision sequence in panel
	_revItemRoot: null, // Revision Item root node
	_prevBtn: null,     // Previous page button
	_nextBtn: null,		// Next page button	
	_curSeq: null,		// Selected revision sequence
	_showAll: null,		// Show Major only?
	_restoreMenu: null,	// Restore menu item
	_btnWidth: 40,		// Button width left padding + right padding + width(15 + 15 + 16)
	panelNode: null,	// Revision panel root node
	itemsRootNode: null,// Items root node
	scene: null,		// Document scene
	nls: null,			// Revision panel resource	
	_showMinorsByDefault: true,
	prefix_restore: "revision_restore_",
	prefix_item: "div_revision_item_root4_",
	prefix_item_btn: "revision_item_title_btn_",
	id_pane: "revision_pane_node",	
	id_items_root: "div_revision_items_root",
	clz_pane: "revisionPane",
	clz_author: "revisionAuthor",
	clz_hl_item: "revisionItemHighLight",
	clz_item_clickable: "revisionItemClickable",
	clz_hl_title: "revisionItemTitleHighLight",
	btn_type_close: "closeBtn",
	btn_type_title: "titleBtn",
	btn_type_more: "moreBtn",
	btn_type_restore: "restoreBtn",
	btn_type_compare: "compareBtn",
	rev_current: "current",
	minorItems: [],
	itemsConnectArray: [],
	staticConnectArray: [],
	
	constructor: function(parentNode) {								
		this.nls = dojo.i18n.getLocalization("concord.widgets.revision","revisionPanel");		
		this.panelNode = dojo.create("div", null, parentNode);
		this.panelNode.id = this.id_pane;		
		dojo.addClass(this.panelNode, this.clz_pane);
		this._buildHeader();
		this._buildContents();
		this._buildFooter();
		
		setTimeout(function() {
			concord.widgets.revision.revisionPanel.resizeRevisionPanel();
		},0);	
		
		this.focus();
	},
	
	focus: function() {
    	setTimeout(dojo.hitch(this, function(){	
    		var titleBtns = dojo.query("[id*=" + this.prefix_item_btn + "]", this.panelNode);
    		if(titleBtns) {
        		for(var i=0; i<titleBtns.length; i++) {
        			var btn = titleBtns[i];
        			if(btn && btn.style.display != "none") {
        				btn.focus();
        				break;
        			}        			
        		}    			
    		}
  	   }), 200);		
	},
	
	show: function() {
		this._buildContents();
		this.panelNode.style.display = "";
		setTimeout(function() {
			concord.widgets.revision.revisionPanel.resizeRevisionPanel();
		},0);		
		
		this.focus();
	},
	
	hide: function() {
		this.panelNode.style.display = "none";
	},
	
	isShown: function() {
		if(this.panelNode.style.display == "none")
			return false;
		
		return true;
	},
	
	_clearContents: function() {
		for(var i=0; i<this.itemsConnectArray.length;i++) {
			dojo.disconnect(this.itemsConnectArray[i]);	
		}
		this.itemsConnectArray = [];
		if(this._revList) {
			this._revList.revisionList = [];
			this._revList = null
		}
		this.minorItems = [];
		
		var itemsRoot = dojo.byId(this.id_items_root);
		var length = 0;
		if(itemsRoot) {
			length = itemsRoot.childNodes ? itemsRoot.childNodes.length : 0;
		} 
		if(length > 0) {						
			for(var i=length-1; i>=0; i--) {
				itemsRoot.removeChild(itemsRoot.childNodes[i]);
			}			
		}
	},	
	
	_buildContents: function() {
		this._clearContents();
		this._retrieveRevList();
		this._buildRevItems();
	},
	
	_retrieveRevList: function()
	{
		var url = concord.util.uri.getDocRevUri() + "/revisions" + "?includeMinors=true";
		var resp = dojo.xhrGet({
			url: url,
			handleAs: "json",
			sync: true,			
			timeout: 5000,
			preventCache: true,
			load: function(response, ioArgs) {
			},
			error: function(response, ioArgs) {			
			}
		});
		if (resp.ioArgs.xhr.status == 200) {	
			this._revList = resp.results[0];	
		} else {
			this._revList = null;			
		}		
	},
	
	_buildRevItems: function() {
		if(!this._revList)
			return;
		
		var revList = this._revList.revisionList;
		
		// current draft is on the top
		var modifiers = this._revList.currentModifiers ? this._revList.currentModifiers : [];
		if(modifiers.length == 0) {
			if(pe && pe.scene && pe.scene.session && pe.scene.session.isDirty()) {
				modifiers.push(pe.authenticatedUser.getId());
			}
		}
		var currentItem = {date: this._revList.currentTime, label: this.rev_current, isMajor: false, modifiers: modifiers};
		this._buildRevItem(currentItem, true);				
		
		// revisions
		if(revList && revList.length) {			
			for( var i = 0; i < revList.length; i++ ) {
				var revItem = revList[i];
				this._buildRevItem(revItem, false);										
			}
		}
	},
	
	_buildRevItem: function(item, bLastDraft) {
		if(!this.itemsRootNode) {
			this.itemsRootNode = dojo.create("div", null, this.panelNode);
			this.itemsRootNode.id = this.id_items_root;
			dijit.setWaiRole(this.itemsRootNode,'presentation');
			var styleValue = "height:90%;top:2.1em;position:relative;margin:2px 1px;overflow:auto;";
			this.itemsRootNode.style.cssText = styleValue;
		}		
		
		var revNo = item.label;
		if(bLastDraft) {
			revNo = this.rev_current;
		}
		var itemRoot = dojo.create("div", null, this.itemsRootNode);		
		itemRoot.id = this.prefix_item + revNo;
		dijit.setWaiRole(itemRoot,'presentation');
		dojo.addClass(itemRoot, "revisionItem");
		dojo.addClass(itemRoot, this.clz_item_clickable);
		
		// special for minor revision item
		if(!item.isMajor)	{
			this.minorItems.push(itemRoot);	
			if(!this._showMinorsByDefault) {
				itemRoot.style.display = "none";
			}			
		}
		
		this.itemsConnectArray.push(dojo.connect(itemRoot, "mouseover", dojo.hitch(this, "_onItemHover", revNo, itemRoot)));
		this.itemsConnectArray.push(dojo.connect(itemRoot, "mouseout", dojo.hitch(this, "_onItemUnhover", revNo, itemRoot)));	
		
		var t = dojo.create("table", null, itemRoot);
		dijit.setWaiRole(t,'presentation');
		
		var tr1 = dojo.create("tr",null,t); 		
		var td1 = dojo.create("td",null,tr1);
		var revTitle = this.nls.draftRev;		
		if(item.isMajor && !bLastDraft) {
			revTitle = dojo.string.substitute(this.nls.publishedRev, [revNo]);
		}
		var revBtn = dojo.create("span", {innerHTML: revTitle, title: this.nls.tipsTitle}, td1);
		revBtn.id = this.prefix_item_btn + revNo;
		dojo.addClass(revBtn, "revisionItemTitle");
		dojo.addClass(revBtn, this.clz_hl_title);
		this.itemsConnectArray.push(dojo.connect(itemRoot, "onclick", dojo.hitch(this, "_onItemClick", revNo, revBtn, itemRoot, false)));
		this.itemsConnectArray.push(dojo.connect(revBtn, "onkeypress", dojo.hitch(this, this._onKeyPress,{type: this.btn_type_title, revNo: revNo, titleBtn: revBtn, itemDiv: itemRoot})));
		dijit.setWaiRole(revBtn, 'button');
		dojo.attr(revBtn,'tabindex','0');

		var tr2 = dojo.create("tr",null,t); 		
		var td2 = dojo.create("td",null,tr2);
		//var date = concord.util.date.parseDateTime(new Number(item.date));
		var date = concord.util.date.parseDateTime(item.date);
		var revDateSpan = dojo.create("span", {innerHTML: date}, td2);		
		dojo.addClass(revDateSpan, "revisionDate");			
 
		
		var tr3 = dojo.create("tr",null,t); 		
		var td3 = dojo.create("td",null,tr3);		
		var revAuthorDiv = dojo.create("div", null, td3);
		var authorT = dojo.create("table", null, revAuthorDiv);		
		this._buildAuthors(item, authorT);
		
		if(!bLastDraft) { // for current draft, no restore button 
			var restoreDiv = dojo.create("div", null, itemRoot);
			restoreDiv.id = this.prefix_restore + revNo;
			dojo.addClass(restoreDiv, "revisionRestoreDiv");	
			this._createRestoreBtn(restoreDiv, revNo);
			restoreDiv.style.display = "none";
		}		
		
		if(bLastDraft) { // select last draft after show pane
			setTimeout(dojo.hitch(this, function(){	
				this._onItemClick(revNo, revBtn, itemRoot, true);
			}), 100);
		}
	},
	
	_buildAuthors: function(item, t) {
		//var authors = item.authors;
		var authors = item.modifiers;
		var haveMore = false;
		for(var i = 0; i< authors.length; i++) {
			if(i < 2)
			{	
				var tr = dojo.create("tr",null,t);
				var tdName = dojo.create("td",null,tr);
				var name = this._getAuthorName(authors[i]);
				var authorName = dojo.create("span", {innerHTML: name}, tdName);
				dojo.addClass(authorName, this.clz_author);
			}
			else{
				haveMore = true;
				break;
			}
		}				
		if(haveMore) {
			var moreBtn = dojo.create("span", {innerHTML: this.nls.more, title: this.nls.tipsMore}, t.parentNode);
			dojo.addClass(moreBtn, "revisionMoreBtn");							
			this.itemsConnectArray.push(dojo.connect(moreBtn, "onclick", dojo.hitch(this, "_moreAuthor", item, t)));
			this.itemsConnectArray.push(dojo.connect(moreBtn, "onkeypress", dojo.hitch(this, this._onKeyPress, {type: this.btn_type_more, item: item, t: t})));
			dijit.setWaiRole(moreBtn, 'button');
			dojo.attr(moreBtn,'tabindex','0');
		}
	},
		
	_getAuthorName: function(id) {		
		var editorStore = (pe && pe.scene)? pe.scene.getEditorStore() : null;
		if(editorStore) {
			var editor = editorStore.getEditorById(id);			
			if(editor) {
				return editor.getName();
			} 
		}
		return "fake name " + id;
	},
	
	_moreAuthor: function(item, t) {		
		var btn = t.nextSibling;
		var length = t.childNodes? t.childNodes.length : 0;
		if(length > 2) {			
			for(var i=length-1; i>1; i--) {
				t.removeChild(t.childNodes[i]);
			}
			if(btn) {
				btn.innerHTML = this.nls.more;
				btn.title = this.nls.tipsMore;
			}		
		}
		else {
			
			var authors = item.authors;
			for(var i = 2; i< authors.length; i++) {
				var tr = dojo.create("tr",null,t);
				var tdName = dojo.create("td",null,tr);
				var name = this._getAuthorName(authors[i]);
				var authorName = dojo.create("span", {innerHTML: name}, tdName);
				dojo.addClass(authorName, this.clz_author);
			}
			
			if(btn) {
				btn.innerHTML = this.nls.less;
				btn.title = this.nls.tipsLess;
				btn.scrollIntoView(false);
			}
		}
			
	},	
	
	_closePane: function() {
		this._clearStatus();
		setTimeout( function(){
			if(pe && pe.scene) {
				pe.scene.getSidebar().hideRevisionPane();
				pe.scene.viewRevision(true); // exit viewRevision
			}				
		 }, 0 );	 
	},
	
	_buildHeader: function() {
		var id = "div_revision_header";
		var headerDiv = dojo.create("div", {id: id}, this.panelNode);
		dojo.addClass(headerDiv, "revisionHeader");	
		
		var span = dojo.create("span", {innerHTML: this.nls.title}, headerDiv);
		dojo.addClass(span, "revisionTitle");
		
		
		var n = dojo.create("img", {alt: '',title: this.nls.close, src: window.contextPath + window.staticRootPath + "/styles/css/images/sidebar/x.png"}, headerDiv);
		dojo.addClass(n, "revisionCloseBtn");
		this.staticConnectArray.push(dojo.connect(n, "onclick", dojo.hitch(this, "_closePane")));
		this.staticConnectArray.push(dojo.connect(n, "onkeypress", dojo.hitch(this, this._onKeyPress, {type: this.btn_type_close})));
		dijit.setWaiRole(n, 'button');
		dojo.attr(n,'tabindex','0');
	},
	
	_buildFooter: function() {		
		var footerDiv = dojo.create("div", {id: "div_revision_footer"}, this.panelNode);
		dojo.addClass(footerDiv, "revisionFooter");
		
		var id = "div_revision_checkbox";
		this.minorCheckBox = new dijit.form.CheckBox({
			        id: id,
			        checked: this._showMinorsByDefault,
					onChange: dojo.hitch(this,"_showMinors")
					});
		
		footerDiv.appendChild(this.minorCheckBox.domNode);
		
		var label = dojo.create('label', null, footerDiv);
		dojo.addClass(label, "revisionFooterLabel");
		label.appendChild(dojo.doc.createTextNode(this.nls.showRevision));
		dojo.attr(label, "for", id);		
	},
	
	_showMinors: function() {
		for(var i=0; i<this.minorItems.length; i++)	{
			var minorItem = this.minorItems[i];
			if(this.minorCheckBox && this.minorCheckBox.attr('checked')) {
				minorItem.style.display = "";
				dijit.setWaiState(this.minorCheckBox.domNode, "checked", true);
			}
			else {
				minorItem.style.display = "none";
				dijit.setWaiState(this.minorCheckBox.domNode, "checked", false);
			}
		}
	},
	
	_onMoreHover: function(n) {
		dojo.addClass(n, "revisionMoreHover");
	},
	
	_onMoreUnhover: function(n) {
		dojo.removeClass(n, "revisionMoreHover");
	},
	
	_createRestoreBtn: function(node, rev) {
		var restoreBtn = dojo.create("span", {innerHTML: this.nls.restore, title: this.nls.tipsRestore}, node);		
		this.itemsConnectArray.push(dojo.connect(restoreBtn, "onclick", dojo.hitch(this, this._onRestoreBtn, rev)));
		this.itemsConnectArray.push(dojo.connect(restoreBtn, "onkeypress", dojo.hitch(this, this._onKeyPress, {type: this.btn_type_restore, revNo: rev})));
		dijit.setWaiRole(restoreBtn, 'button');
		dojo.attr(restoreBtn,'tabindex','0');
		
		
//		var sepSpan = dojo.create("span", {innerHTML: '  |  '}, node);
//		
//		var compareBtn = dojo.create("span", {innerHTML: this.nls.compare, title: this.nls.compare}, node);		
//		this.itemsConnectArray.push(dojo.connect(compareBtn, "onclick", dojo.hitch(this, this._onCompareBtn, rev)));
//		this.itemsConnectArray.push(dojo.connect(compareBtn, "onkeypress", dojo.hitch(this, this._onKeyPress, {type: this.btn_type_compare, revNo: rev})));
//		dijit.setWaiRole(compareBtn, 'button');
//		dojo.attr(compareBtn,'tabindex','0');
	},
	
	_onRestoreBtn: function(revNo) {
		if(pe && pe.scene) {
			pe.scene.restoreVersion(revNo);	
		}		
	},
	
//	_onCompareBtn: function(revNo) {
//		//TODO: compare draft
//		alert("TODO: compare button: " + revNo); 		
//	},
	
	_onItemHover: function(rev, n) {
		dojo.addClass(n, "revisionItemHover");
	},
	
	_onItemUnhover: function(rev, n) {
		dojo.removeClass(n, "revisionItemHover");
	},
	
	_onItemClick: function(rev, titleBtn, itemDiv, bInit) {
		if(pe.scene.getRev() == rev) { // do nothing if click again 
			return;	
		}			
		
		if(titleBtn && itemDiv) {
			this._clearStatus();
			
			dojo.removeClass(titleBtn, this.clz_hl_title);
			dojo.removeClass(itemDiv, this.clz_item_clickable);
			dojo.addClass(itemDiv, this.clz_hl_item);
			var id = this.prefix_restore + rev;
			var btnDiv = dojo.byId(id);
			this._showRestoreBtn(btnDiv, true);
		}	
		if(pe.scene && !bInit) { // need not load content if open revision pane first time.			
				pe.scene.loadVersion(rev);	
		}			
	},
	
	_showRestoreBtn: function(btnDiv, show) {
		if(btnDiv) {
			if(show) {
				btnDiv.style.display = "";
				btnDiv.scrollIntoView(false);
			}				
			else {
				btnDiv.style.display = "none";
			}		
		}		
	},	
	
	_clearStatus: function() {
		dojo.query("[id*=" + this.prefix_item + "]", this.panelNode).forEach(dojo.hitch(this, function(node){
			dojo.removeClass(node, this.clz_hl_item);
			dojo.addClass(node, this.clz_item_clickable);
		}));
				
		dojo.query("[id*=" + this.prefix_restore + "]", this.panelNode).forEach(dojo.hitch(this, function(node){
			this._showRestoreBtn(node, false);
		}));
		
		dojo.query("[id*=" + this.prefix_item_btn + "]", this.panelNode).forEach(dojo.hitch(this, function(node){
			dojo.addClass(node, this.clz_hl_title);
		}));		
	},
	
	_onKeyPress: function(options, evt) {
		evt = evt || window.event;
		var key = (evt.keyCode ? evt.keyCode : evt.which);
		if(key == dojo.keys.ENTER){
			setTimeout(dojo.hitch(this, function(){	
				var type = options.type;
				switch (type) {
				case this.btn_type_close:
					this._closePane();
					break;
				case this.btn_type_title:
					this._onItemClick(options.revNo, options.titleBtn, options.itemDiv, false);
					break;
				case this.btn_type_more:
					this._moreAuthor(options.item, options.t);
					break;
				case this.btn_type_restore:
					this._onRestoreBtn(options.revNo);
					break;
//				case this.btn_type_compare:
//					this._onCompareBtn(options.revNo);
//					break;
				default:
					break;
				}
			}), 0);
			dojo.stopEvent(evt);
		}					
	},
	
	destroy: function() {
		this._clearContents();
		for(var i=0; i<this.staticConnectArray.length;i++) {
			dojo.disconnect(this.staticConnectArray[i]);	
		}		
	}
		
});

concord.widgets.revision.revisionPanel.resizeRevisionPanel = function() {
	var sidebar = null;
	if(pe && pe.scene.getSidebar())
		sidebar = pe.scene.getSidebar();
	
	if(sidebar) {
		var pane = dojo.byId("revision_pane_node");
		var header = dojo.byId("div_revision_header");
		var footer = dojo.byId("div_revision_footer");
		var root = dojo.byId("div_revision_items_root");
		if(pane && header && footer && root) {
			var height = pane.offsetHeight - header.offsetHeight - footer.offsetHeight;
			var styleValue = "height:" + height + "px;top:2.1em;position:relative;margin:2px 1px;overflow:auto;";
			root.style.cssText = styleValue;			
		}
	}
};
