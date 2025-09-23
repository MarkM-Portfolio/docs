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

/**
 * This class is obsolete, the new implement is: concord.widgets.revision.revisionPanel
 */

dojo.provide("concord.widgets.revisionPanel");

dojo.require("dijit.MenuBar");
dojo.require("dijit.PopupMenuBarItem");
dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dojo.i18n");
//dojo.require("dojox.html.ellipsis");

dojo.requireLocalization("concord.widgets","revisionPanel");

dojo.declare("concord.widgets.revisionPanel", null, {	
	_revList: null,		// Array of all revision list
	_styleList: null,	// Array of style list
	_authors: null,     // Array of All authors
	_revSeq: null,	    // Array of revision sequence in panel
	_revItemRoot: null, // Revision Item root node
	_prevBtn: null,     // Previous page button
	_nextBtn: null,		// Next page button
	_res: null,			// Revision panel resource		
	_curSeq: null,		// Selected revision sequence
	_showAll: null,		// Show Major only?
	_restoreMenu: null,	// Restore menu item
	_btnWidth: 40,		// Button width left padding + right padding + width(15 + 15 + 16)
	panelNode: null,	// Revision panel root node
	scene: null,		// Document scene
//	_revModel: null,		// The document revision model
	
	constructor: function(docScene) {						

		this.scene = docScene;
		this.panelNode = dojo.create("div", {id: "lotus_revision_panel", style: "display:none"}, null);
		
		this._showAll = false;
		this._revSeq = [];		
		this._authors = null;
		this._styleList = ["red", "blue", "brown", "green"];
		
		this._res = dojo.i18n.getLocalization("concord.widgets","revisionPanel");
		concord.util.uri.injectCSS(document, window.contextPath + window.staticRootPath + "/styles/css/revision/revision.css", false);
		dojo.connect(window, "onresize", this, "_resize");
	},
	
	render: function()
	{							
		this._retrieveRevList();
		if(this._revList == null || this._revList.length == 0)
			return;			
		
		// Render common node at the first time
		if(this._revItemRoot == null)
			this._renderCommon();
		
		this._buildRevItem();
		
		this._retrieveContent();		
		
		this.scene.displayRev(true);
	},
	
	_retrieveRevList: function()
	{
		var url = concord.util.uri.getDocRevUri() + '/revlist';
//		url = url;		
		var resp = dojo.xhrGet({
			url: url,
			handleAs: "json",
			sync: true,			
			timeout: 5000,
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
		this._authors = null;
	},
		
	_renderCommon: function()
	{
		var menuNode = dojo.create("div", {id: "menu"}, this.panelNode);
				
		// Cancel button
		var btn = dojo.create("span", null, menuNode);
		btn.className = "r_close";
		var img = dojo.create("img", {title: this._res.quit, src: window.contextPath + window.staticRootPath + "/images/revision/ico_cancel.gif"}, btn);
		dojo.connect(img, "onclick", this, "_close");
		
		// Menu
		var menuBar = new dijit.MenuBar( {} );
		var revMenu = new dijit.Menu( {} );
		
		revMenu.addChild( new dijit.MenuItem(
			{
				label: this._res.showChange,
				onClick: dojo.hitch(this, "_toggleChange")
			}));

		revMenu.addChild( new dijit.MenuItem(
				{
					label: this._res.showRevision,
					onClick: dojo.hitch(this, "_toggleRev")
				}));
		
		revMenu.addChild( new dijit.MenuSeparator() );
		
		this._restoreMenu = new dijit.MenuItem(
				{
					label: this._res.restore,
					onClick: dojo.hitch(this, "_restore")
				})
		revMenu.addChild( this._restoreMenu);
		
		revMenu.addChild( new dijit.MenuSeparator() );
		
		revMenu.addChild( new dijit.MenuItem(
				{
					label: this._res.quit,
					onClick: dojo.hitch(this, "_close")
				}));
		
		menuBar.addChild( new dijit.PopupMenuBarItem(
				{
				    label: this._res.rev,
				    popup: revMenu
				}));
		
		menuBar.placeAt( menuNode );
		menuBar.startup();
		
		//revision panel
		var revNode = dojo.create("div", {id: "revision"}, this.panelNode);
		
		// previous button
		btn = dojo.create("span", {id: "pre"}, revNode);
		this._prevBtn = dojo.create("img", {title: this._res.pre, src: window.contextPath + window.staticRootPath + "/images/revision/ico_pre.gif"}, btn);
		dojo.connect(this._prevBtn, "onclick", dojo.hitch(this, "_navItem", false));
		
		// next button
		btn = dojo.create("span", {id: "next"}, revNode);
		this._nextBtn = dojo.create("img", {title: this._res.pre, src: window.contextPath + window.staticRootPath + "/images/revision/ico_next.gif"}, btn);
		dojo.connect(this._nextBtn, "onclick", dojo.hitch(this, "_navItem", true));
		
		this._revItemRoot = dojo.create("div", { style: "cursor: default" }, revNode);
	},
		
	_buildAuthors: function(rev)
	{
		if(this._authors == null)
		{
			this._authors = [];
			
			for(var i = 0; i < rev.authors.length; i++)
				this._authors.push(rev.authors[i]);
			
			return;
		}
		
		var allAu = this._authors;
		var allLen = allAu.length;		
		
		var revAu = rev.authors;
		var len = revAu.length;
		for (var i = 0; i < len; i++ )
		{
			var find = false;
				
			for(var j = 0; j < allLen; j++)
			{
				if( revAu[i] == allAu[j] )
				{	
					find = true;
					break;
				}	
			}	
			if( !find )
				allAu.push(revAu[i]);
		}
	},
	
	// Find Add class and remove class method in dojo.
	_buildRevItem: function()
	{
		dojo.empty(this._revItemRoot);
		this._revSeq = [];		
		
		var t = dojo.create("table", {id:"innerTable", border:"0", cellpadding:"0", cellspacing:"0"}, this._revItemRoot);
		t.className = "revisionTable";		
		var row = dojo.create("tr",null,t); 			
		
		var seq = 0;
		var as = this._authors;
				
		for( var i = 0; i < this._revList.length; i++ )
		{			
			var revItem = this._revList[i];
			
			// The authors is null
			if( as == null )
				this._buildAuthors(revItem);
			
			if( this._showAll || revItem.major )	// Show Major and details
			{
				var col = dojo.create("td", null, row);
				var item = dojo.create("div",null,col);
				item.className = "r1";
				dojo.connect(item, "onclick", dojo.hitch(this, "_clickRev", seq));
				
				var date = dojo.create("div", {innerHTML: revItem.date, style: "cursor: pointer"}, item);
				date.className = "r1_date";	// should define revDate and selected css.				
				
				var au = dojo.create("div", null, item);
				au.className = "r_a";
				var len = revItem.authors.length;
				var isMore = false;
				// Show more button
				if(len > 2)
				{					
					len = 2;	// Just add two author 
					isMore = true;
				}
				
				//To do add ellipsis support
//				var auDiv = dojo.create("div", null, au);
//				auDiv.className = "r_au";	// Set the width										
				for(var j = 0; j < len; j++)
				{
					var a = this._createAuthorItem(revItem.authors[j], au);
					if( j > 0)
						a.style.width  = "105px";
				}	
				if (isMore)
				{
					var moreBtn = dojo.create("span", null, au);
					moreBtn.className = "r_a_more";
					var n = dojo.create("img", {title: this._res.more, src: window.contextPath + window.staticRootPath + "/images/revision/ico_more.gif"}, moreBtn);
					dojo.connect(n, "onclick", dojo.hitch(this, "_moreAuthor", seq));
					dojo.connect(n, "mouseover", dojo.hitch(this, "_onHover", n));
					dojo.connect(n, "mouseout", dojo.hitch(this, "_onUnhover", n));
				}
				
				this._revSeq.push( { revItem: revItem, node: item, seq: seq } );
				this._curSeq = seq;		// Current revision is the latest revision.
				seq ++;
			}
		}
				
		this._leftItem = 0;
		this._prevBtn.disabled = true;
		this._prevBtn.src = window.contextPath + window.staticRootPath + "/images/revision/ico_pre_d.gif";
		if( this._revSeq.length > 1 )
		{
			this._nextBtn.disabled = false;
			this._nextBtn.src = window.contextPath + window.staticRootPath + "/images/revision/ico_next.gif";
		}
		else
		{
			this._nextBtn.disabled = true;
			this._nextBtn.src = window.contextPath + window.staticRootPath + "/images/revision/ico_next_d.gif";
		}			
		this._createRestoreItem();
	},
	
	_createRestoreItem: function()
	{
		var seq = this._curSeq;
		var revNode = this._revSeq[seq].node;
		revNode.className = "r3";
		revNode.firstChild.className = "r3_date";
		
		if(seq > 0)
			this._revSeq[seq - 1].node.className = "r2";
		
		// Can't restore the latest revision
		if (seq == (this._revSeq.length - 1 ))
		{
			this._restoreMenu.attr("disabled", true);
			return;
		}
		this._restoreMenu.attr("disabled", false);
		
		// Check the revNod if contains span which classname is "r_a_resotre"
		var ret = dojo.query(".restoreBtn", revNode);
		if(ret.length > 0)		
		{
			// find it then display it
			var rBtn = ret[0].style.display = "";;				
		}
		else
		{
			var rBtn = dojo.create("span", null, null);		
			rBtn.className = "r_a_more";					
				
			var n = dojo.create("img", {title: this._res.restore, src: window.contextPath + window.staticRootPath + "/images/revision/ico_restore.gif"}, rBtn);
			n.className = "restoreBtn";
			dojo.connect(n, "onclick", this, "_restore");
			dojo.connect(n, "mouseover", dojo.hitch( this, "_onHover", n));
			dojo.connect(n, "mouseout", dojo.hitch( this, "_onUnhover", n));
			
			//To do add ellipsis support
			//var auN = dojo.query(".r_au", revNode);
			//dojo.place(rBtn, auN, "before");
			var moreBtns = dojo.query(".r_a_more", revNode);
			if(moreBtns.length > 0)
			{
				dojo.place(rBtn, moreBtns[0], "before");
			}
			else
			{
				var aus = dojo.query(".r_a", revNode);
				if(aus.length > 0)
				{
					aus[0].appendChild(rBtn);
				}
			}	
		}
	},
	
	_createAuthorItem: function(author, parent)
	{
//		To do add ellipsis support		
//		var eli = dojo.create("div", null, null);
//		eli.className = "dojoxEllipsis";	// dojox ellipsis	
//		var a = dojo.create("li", null, eli);		
		
		var a = dojo.create("div", null, parent);
		a.className = this._getAuthorStyle(author);
		var name = dojo.create("div", {innerHTML: author}, parent);
		name.className = "r_author";
		
		//return eli;
		return name;
	},
	
	_getAuthorStyle: function(author)
	{
		var styleCount = this._styleList.length; // Need define;
		var order = 0;
		for( ; order < this._authors.length; order++ )
		{
			if (author == this._authors[order])
				return this._styleList[ order%styleCount ];
		}
		
		return this._styleList[0];
	},
	
	_clickRev: function( seq )
	{				
		if (seq != this._curSeq)
		{	
			var node = this._revSeq[this._curSeq].node;
			node.className = "r1";
			node.firstChild.className = "r1_date";
			
			var n = dojo.query( ".restoreBtn", node);			
			if(n.length > 0)
				n[0].style.display = "none";
			
			if (this._curSeq > 0)
				this._revSeq[this._curSeq - 1].node.className = "r1";
			
			this._curSeq = seq;
			this._createRestoreItem();						
			this._retrieveContent();
		}	
	},
	
	_retrieveContent: function()
	{			
		var cId = this._revSeq[this._curSeq].revItem.rev;
		var pId = null;
		if(this._curSeq > 0)
			pId = this._revSeq[this._curSeq - 1].revItem.rev;
		else
			pId = 0;
				
		var model;
		var url = concord.util.uri.getDocRevUri() + '/revcont';
//		url = url;
		url = url + "&cRev=" + cId;	// Append revision ID.		
		url = url + "&pRev=" + pId;
		
		var resp = dojo.xhrGet({
			url: url,
			handleAs: "json",
			sync: true,			
			timeout: 5000,
			load: function(response, ioArgs) {
			
			},
			error: function(response, ioArgs) {
			
			}
		});
		if (resp.ioArgs.xhr.status == 200) {
			
			model = resp.results[0];
		} else {
			console.log(" #### Load revision content error: current revision ID is " + cID + " previous revision ID is " + pId + " #####");
			model = null;
		}
		
		//if(model != null)		
		this.scene.updateRev(model);
	},
	
	_animateNext: function(n)
	{		
		var w = n.offsetWidth;	
		w -= 20; // step
		if(w < 0)
		{
			n.style.width = 0 + 'px';
			n.style.display = "none";
			clearInterval(this._interval);
			this._interval = null;
		}
		else
		{
			n.style.width = w + 'px';
		}
	},
	
	_animatePrev: function(n)
	{
		var w = n.offsetWidth;
		var maxW = 170;	
		
		w += 20; // step
		if(w >= maxW)
		{
			n.style.width = maxW + 'px';
			clearInterval(this._interval);
			this._interval = null;
		}
		else
		{
			n.style.display = '';
			n.style.overflow = 'hidden';
			n.style.width = w + 'px';
		}
	},
	
	_navItem: function(next)
	{
		if(this._interval)
			return;
		
		if(next)
		{
			if(this._nextBtn.disabled)
				return;
			
			if ( this._prevBtn.disabled )
			{
				this._prevBtn.disabled = false;
				this._prevBtn.src = window.contextPath + window.staticRootPath + "/images/revision/ico_pre.gif";
			}
			
			//this._revSeq[this._leftItem].node.style.display = "none";			
			
			this._interval = setInterval(dojo.hitch(this, "_animateNext", this._revSeq[this._leftItem].node), 2);
			
			this._leftItem += 1;
			if(this._revSeq.length == (this._leftItem + 1))
			{
				this._nextBtn.disabled = true;
				this._nextBtn.src = window.contextPath + window.staticRootPath + "/images/revision/ico_next_d.gif";
			}
		}
		else
		{
			if(this._prevBtn.disabled)
				return;
			
			if ( this._nextBtn.disabled )
			{
				this._nextBtn.disabled = false;
				this._nextBtn.src = window.contextPath + window.staticRootPath + "/images/revision/ico_next.gif";
			}
			
			//this._revSeq[this._leftItem -1].node.style.display = "";
			
			this._interval = setInterval(dojo.hitch(this, "_animatePrev", this._revSeq[this._leftItem - 1].node), 2);
			
			this._leftItem -= 1;
			if( this._leftItem == 0 )
			{
				this._prevBtn.disabled = true;
				this._prevBtn.src = window.contextPath + window.staticRootPath + "/images/revision/ico_pre_d.gif";
			}					
		}	
	},
	
	_resize: function()
	{
		//this._revItemRoot.style.width = document.body.clientWidth - this._btnWidth * 2 + 'px';
		/*this._pages = [];		
		
		var itemWidth = 170;	// the revision item width is 170
		var w = document.body.clientWidth - this._btnWidth * 2;
		var pageCnt = Math.ceil(w/itemWidth);
		var items = Math.floor(w/itemWidth);
		var len = this._revSeq.length;
		for(var i = 0; i < pageCnt; i++)
		{
			var end = (i+1)*items;
			end = Math.min(end, len);
			this._pages[i] = this._revSeq.slice(i*items, end);
		}
		
		this._curPage = 0;*/		
	},
	
	_onHover: function(rBtn)
	{
		dojo.addClass(rBtn, "r_hover");
	},
	
	_onUnhover:function(rBtn)
	{
		dojo.removeClass(rBtn, "r_hover");
	},
		
	_clickDoc: function(doc, node, e)
	{
		doc.body.removeChild(node);
		dojo.disconnect(this._handle1);
		if(this._handle2)
			dojo.disconnect(this._handle2);
		
		e.cancelBubble = true;
		if( e.stopPropagation )
			e.stopPropagation();
	},
	
	_getLeft: function(e)
	{
		var offset = e.offsetLeft;
		if(e.offsetParent != null)
			offset += this._getLeft(e.offsetParent);
		return offset;
	},
	
	_getTop: function(e)
	{
		var offset = e.offsetTop;
		if(e.offsetParent != null)
			offset += this._getTop(e.offsetParent);
		return offset;
	},
	
	_moreAuthor: function(seq, e)
	{		
		var aPanel = dojo.create("div", null, document.body);
		aPanel.className = "popup";
		var height = 0;
		var as = this._revSeq[seq].revItem.authors;		
		for(var i = 0; i < as.length; i++)					
		{
			this._createAuthorItem(as[i], aPanel);
			height += 15;
		}		
		aPanel.style.height = height + 'px';
		
		var node = this._revSeq[seq].node;
		aPanel.style.left = this._getLeft(node) + 'px';
		aPanel.style.top = this._getTop(node) + 23 + 'px';
		
		// node.style.display = 'none'; 
				
		this._handle1 = dojo.connect(document,"onclick", dojo.hitch(this, "_clickDoc", document, aPanel));
		var rFrame = this.scene.revFrameNode;
		if(rFrame)
		{
			var doc = rFrame.document;
			 if(rFrame.contentDocument)
				 doc = rFrame.contentDocument; // For NS6
			 else if(rFrame.contentWindow)
				 doc = rFrame.contentWindow.document; // For IE5.5 and IE6
			this._handle2 = dojo.connect(doc, "onclick", dojo.hitch(this, "_clickDoc", document, aPanel));
		}
		
		e.cancelBubble = true;
		if( e.stopPropagation )
			e.stopPropagation();
		
	},
	
	_toggleChange: function()
	{
		this.scene.toggleChange();
	},
	
	_toggleRev: function()
	{
		this._showAll = !this._showAll;
		this._buildRevItem();
	},
	
	_close: function()
	{
		this.scene.displayRev(false);
	},
	
	_resHandler: function(response, ioArgs)
	{		
		// Give a chance to process reset content message before close
		setTimeout( dojo.hitch(this, "_close"), 0);
	},
	
	_restore: function()
	{			
		// Don't restore the latest revision
		if (this._curSeq == (this._revSeq.length - 1 ))
			return;
		
		var url = concord.util.uri.getDocRevUri() + '/restore';
//		url = concord.main.App.appendSecureToken(url);
		url = url + "&id=" + this._revSeq[this._curSeq].revItem.rev;	// Append revision ID.
	
		dojo.xhrPost({
			url: url,
			handle: dojo.hitch(this, "_resHandler"),
			sync: true,
			contentType: "text/plain"			
		});	
	}
	
});


