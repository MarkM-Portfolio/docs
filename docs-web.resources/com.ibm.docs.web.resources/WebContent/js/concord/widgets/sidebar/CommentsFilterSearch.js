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

dojo.provide("concord.widgets.sidebar.CommentsFilterSearch");
dojo.require("dijit.Menu");
dojo.require("dijit.Tooltip");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.widgets.sidebar.CommentAlertDlg");
dojo.declare("concord.widgets.sidebar.CommentsFilterSearch", null, {
	// Filter Search
	FILTER_ALL: 1,
	FILTER_TOME: 2,
	FILTER_BYME: 3,
	FILTER_ACTIVE: 4,
	FILTER_RESOLVED: 5,
	curFilterType: 1,
	filter_user_id: null,
	filter_user_org_id: null,
	filter_user_name: null,
	nls: null,
	sidebar: null,
	newcommentswidth: 100,
	defaultScrollbarSize: 16,
	connectArray: [],
	constructor: function(sideBar)
	{
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar", "Comments");
		this.sidebar = sideBar;
		this.streamHeader = this.sidebar.streamHeader;
		this.tome_label = this.nls.menutome;
		if (BidiUtils.isBidiOn() && BidiUtils.isGuiRtl() && this.tome_label.charAt(0) == '@')
		{
			this.tome_label = BidiUtils.addOverrideUCC(this.tome_label.charAt(0) + BidiUtils.addEmbeddingUCC(this.tome_label.substring(1)), "ltr");
		}
		this.filter_user_id = pe.authenticatedUser.getId();
		this.filter_user_org_id = pe.authenticatedUser.getOrgId();
		this.filter_user_name = pe.authenticatedUser.getName();
		this.lang = g_locale || navigator.userLanguage || navigator.language;
		this.charEQ = new concord.editor.CharEquivalence;
		if (this.lang.indexOf('zh') != -1 || this.lang.indexOf('ko') != -1 || this.lang.indexOf('ja') != -1)
		{
			this.CJK_map = new concord.editor.CJKWidthCharMap;
		}
		this.streamHeader.onkeydown = this._streamHeaderOnKeyDown;
		this.streamHeader.onclick = this._streamHeaderOnClick;
		this.bidiTextDir = BidiUtils.getTextDir();
	},
	_createFilterWidgets: function()
	{
		var commentfilter = dojo.create('div', {
			id: 'commentfilter'
		}, this.streamHeader);
		this._createFilterContextMenu();
		this.filterActionBtn = new dijit.form.DropDownButton({
			label: this.nls.menuallcomments,
			disabled: false,
			style: 'border: 0px,font-size:13px',
			id: 'commentfilter_Action',
			dropDown: this.pMenu,
			dir: BidiUtils.isGuiRtl() ? 'rtl' : 'ltr'
		});

		commentfilter.appendChild(this.filterActionBtn.domNode);
		dojo.addClass(this.filterActionBtn.domNode, 'commentfilter');
		new dijit.Tooltip({
	        connectId: ["commentfilter_Action"],
	        label: this.nls.filterDesc,
	        position: ["below"]
	    });	
		dojo.removeClass(this.filterActionBtn.domNode.firstChild, 'dijitButtonNode');

		var spanButton = dojo.byId('commentfilter_Action');
		var commentSearchButton = this.commentSearchButton = dojo.create('div', {
			id: 'commentsearchbutton'
		}, commentfilter);
		dojo.addClass(commentSearchButton, 'search');
		this.iconSearch = dojo.create('span', null, commentSearchButton);
		dojo.addClass(this.iconSearch, 'icon-search');
		dojo.attr(this.iconSearch, 'tabindex', '0');
		dijit.setWaiState(this.iconSearch, 'label', this.nls.searchDesc);
		new dijit.Tooltip({
	        connectId: ["commentsearchbutton"],
	        label: this.nls.searchDesc,
	        position: ["below"]
	    });	
		dijit.setWaiRole(this.iconSearch, 'button');

		this.connectArray.push(dojo.connect(this.iconSearch, 'onclick', dojo.hitch(this, this._searchOnClick)));
		this.connectArray.push(dojo.connect(this.iconSearch, 'onkeydown', dojo.hitch(this, this._searchOnClick)));

		var commentSearchDiv = this.commentSearchDiv = dojo.create('div', {
			id: 'commentsearchcontent'
		}, commentfilter);
		dojo.addClass(commentSearchDiv, 'inputdiv');
		this.commentSearchInput = dojo.create('input', {
			id: 'commentsearchinput'
		}, commentSearchDiv);
		dojo.addClass(this.commentSearchInput, 'input');
		dojo.attr(this.commentSearchInput, 'placeholder', this.nls.search);
		this.commentSearchInput.style.outline = 'none';
		this.commentSearchInput.style.cssFloat = (BidiUtils.isGuiRtl() ? 'right' : 'left');
		if (BidiUtils.isBidiOn() && (this.bidiTextDir != 'contextual'))
				dojo.attr(this.commentSearchInput, 'dir', this.bidiTextDir);

		this.connectArray.push(dojo.connect(this.commentSearchInput, 'onkeydown', dojo.hitch(this, this._commentSearchInputOnkeydown)));
		this.connectArray.push(dojo.connect(this.commentSearchInput, 'onkeyup', dojo.hitch(this, this._commentSearchInputOnkeyup)));

		var commentSearchClearDiv = dojo.create('div', {
			id: 'commentsearchclear'
		}, commentSearchDiv);
		dojo.addClass(commentSearchClearDiv, 'clear');
		if (BidiUtils.isGuiRtl())
			dojo.addClass(commentSearchClearDiv, 'clearRTL');
		this.commentSearchClear = dojo.create('span', null, commentSearchClearDiv);
		this.commentSearchClear.innerHTML = this.nls.clear;
		dojo.attr(this.commentSearchClear, 'tabindex', '0');
		// dojo.attr(this.commentSearchClear, 'title', this.nls.clear);
		dijit.setWaiState(this.commentSearchClear, 'label', this.nls.clear);
		dijit.setWaiRole(this.commentSearchClear, 'button');
		this.connectArray.push(dojo.connect(this.commentSearchClear, 'onclick', dojo.hitch(this, this.clearSearchResult)));
		this.connectArray.push(dojo.connect(this.commentSearchClear, 'onkeydown', dojo.hitch(this, this.clearSearchResult)));

		this.emptyInfoDiv = dojo.create('div', {
			id: 'commentfilterinfo'
		}, commentfilter);
		dojo.addClass(this.emptyInfoDiv, 'infodiv');
		this.emptyInfoDiv.style.display = 'none';
		dojo.attr(this.emptyInfoDiv, 'tabIndex', '-1');

		this.newCommentsBannerDiv = dojo.create('div', {
			id: 'newcommentsbanner'
		}, commentfilter);
		dojo.addClass(this.newCommentsBannerDiv, 'newcomments');
		this.newCommentsBannerDiv.style.display = 'none';
		this.newCommentsBannerDiv.innerHTML = this.nls.newComments + '<span style="font-size: 0.7em;">&nbsp;&#x25B2;</span>';
		this.connectArray.push(dojo.connect(this.newCommentsBannerDiv, 'onclick', dojo.hitch(this, this._refreshAllComments)));
		this.connectArray.push(dojo.connect(this.newCommentsBannerDiv, 'onkeydown', dojo.hitch(this, this._refreshAllComments)));
		dojo.attr(this.newCommentsBannerDiv, 'tabIndex', '-1');
		dijit.setWaiRole(this.newCommentsBannerDiv, 'alert');

		this.newCommentsToMeDiv = dojo.create('div', {
			id: 'newcommentstomebanner'
		}, document.body);
		dojo.addClass(this.newCommentsToMeDiv, 'newcommentstome');
		this.newCommentsToMeDiv.style.display = 'none';
		this.newCommentsToMeDiv.innerHTML = '';
		this.connectArray.push(dojo.connect(this.newCommentsToMeDiv, 'onmouseover', dojo.hitch(this, this._hideNewCommentsToMeDiv)));
		dojo.attr(this.newCommentsToMeDiv, 'tabIndex', '-1');
		dijit.setWaiRole(this.newCommentsToMeDiv, 'alert');
	},
	_streamHeaderOnClick: function(e)
	{
		dojo.addClass(pe.scene.sidebar.streamHeader, 'nooutline');
	},
	_showNewCommentsToMeDiv: function(who)
	{
		this.closeTimeOut && clearTimeout(this.closeTimeOut);
		this._hideNewCommentsToMeDiv();
		setTimeout(dojo.hitch(this, function()
		{
			if (!who)
				who = this.nls.mentiontomesomebody;
			else
				who = '<b>' + who + '</b>';
			var maxWidth = concord.util.browser.getBrowserWidth();
			var left = maxWidth - 200;
			dojo.style(this.newCommentsToMeDiv, "left", left + 'px');
			var value = dojo.string.substitute(this.nls.mentiontome, [who]);
			this.newCommentsToMeDiv.innerHTML = value;
			this.newCommentsToMeDiv.style.display = '';
			dojo.attr(this.newCommentsToMeDiv, 'tabIndex', '0');
			this.closeTimeOut = setTimeout(dojo.hitch(this, function()
			{
				this._hideNewCommentsToMeDiv();
				this.closeTimeOut = null;
			}), 20000);
		}), 100);
	},
	_hideNewCommentsToMeDiv: function(e)
	{
		this.newCommentsToMeDiv.innerHTML = '';
		this.newCommentsToMeDiv.style.display = 'none';
		dojo.attr(this.newCommentsToMeDiv, 'tabIndex', '-1');
	},
	_showNewCommentsDiv: function(e)
	{
		var left = (this.streamHeader.clientWidth - this.defaultScrollbarSize - this.newcommentswidth) / 2;
		dojo.style(this.newCommentsBannerDiv, 'left', left + 'px');
		dojo.attr(this.newCommentsBannerDiv, 'tabIndex', '0');
		this.newCommentsBannerDiv.style.display = '';
		this.newCommentsBannerShown = true;
	},
	_hideNewCommentsDiv: function(e)
	{
		this.commentsController.showNewCommentBanner = false;
		this.newCommentsBannerDiv.style.display = 'none';
		dojo.attr(this.newCommentsBannerDiv, 'tabIndex', '-1');
		this.newCommentsBannerShown = false;
	},
	_refreshAllComments: function(e)
	{
		var keycode = e.keyCode;
		if (!(keycode == dojo.keys.ENTER || dojo.keys.SPACE))
		{
			return;
		}
		this.commentsController._showWaitingWidgets();
		this.sidebar.widgetStore.updateUIbySortResult();
		this.filterStreamContentByType();
		this.sidebar.streamContent.scrollTop = 0;
	},

	// only for tab, control the outline. useing mouse no outline,using tab need outline.
	_streamHeaderOnKeyDown: function(e)
	{
		if (window.pe.scene.docType == "pres")
		{
			pe.scene.focusMgr && pe.scene.focusMgr.setFocusComponent(concord.util.events.SLIDE_SORTER_COMPONENT);
		}
		dojo.removeClass(pe.scene.sidebar.streamHeader, 'nooutline');
	},

	_commentSearchInputOnkeyup: function(e)
	{
		var searchWord = this.commentSearchInput.value;
		var len = searchWord.length;
		if (len > 0)
		{
			this.commentSearchClear.style.color = 'black';
			this.commentSearchClear.style.cursor = 'pointer';
		}
		else
		{
			this.commentSearchClear.style.color = '';
			this.commentSearchClear.style.cursor = '';
		}
		if (BidiUtils.isBidiOn())
			if (this.commentSearchInput.value.length == 0)
				this.commentSearchInput.dir = (BidiUtils.isGuiRtl() ? 'rtl' : 'ltr');
			else if (this.bidiTextDir == 'contextual'){
				this.commentSearchInput.dir = BidiUtils.calculateDirForContextual(this.commentSearchInput.value);
			} else {
				this.commentSearchInput.dir = this.bidiTextDir;
			}
		
	},
	_commentSearchInputOnkeydown: function(e)
	{
		var searchWord = this.commentSearchInput.value;
		var len = searchWord.length;
		if (len > 0)
		{
			this.commentSearchClear.style.color = 'black';
			this.commentSearchClear.style.cursor = 'pointer';
		}

		var keycode = e.keyCode;
		if (keycode == dojo.keys.ESCAPE)
		{
			this.commentSearchClear.style.color = '';
			this.commentSearchClear.style.cursor = '';
			this._searchOnClick(e);
			dojo.stopEvent(e);
			this.iconSearch.focus();
			return;
		}
		else if (keycode == dojo.keys.ENTER)
		{
			if (len == 0)
			{
				this._showSearchAlert();
				if (!this.hasSearchResult)
					return;
			}
			this.filterStreamContentByType(this.curFilterType);
		}
	},
	clearSearchResult: function(e)
	{
		var isESC = false;
		if (e)
		{
			var keycode = e.keyCode;
			if (keycode)
			{
				if (keycode == dojo.keys.ESCAPE)
					isESC = true;
				if (!(keycode == dojo.keys.ENTER || keycode == dojo.keys.SPACE || isESC))
				{
					return;
				}
				e.stopPropagation();
				e.preventDefault();
			}
		}
		this.commentSearchClear.style.color = '';
		this.commentSearchClear.style.cursor = '';
		this.commentSearchInput.value = '';
		this.filterStreamContentByType(this.curFilterType);
		this.hasSearchResult = false;
		if (isESC)
		{
			this._searchOnClick(e);
			this.iconSearch.focus();
			return;
		}

		this.commentSearchInput.focus();
		if (!BidiUtils.isBidiOn() || 
			(BidiUtils.isBidiOn() && (this.bidiTextDir != 'contextual')))
			this.commentSearchInput.dir = (BidiUtils.isGuiRtl() ? 'rtl' : 'ltr');
		else
			this.commentSearchInput.dir = this.bidiTextDir;
	},
	_searchOnClick: function(e)
	{
		var isESC = false;
		var keycode = e.keyCode;
		if (keycode)
		{
			if (keycode == dojo.keys.ESCAPE)
				isESC = true;
			if (!(keycode == dojo.keys.ENTER || keycode == dojo.keys.SPACE || isESC))
			{
				return;
			}
			e.stopPropagation();
			e.preventDefault();
		}
		this.commentsController._showWaitingWidgets();
		if (dojo.hasClass(this.streamHeader, 'hide'))
		{
			if (isESC)
				return;
			dojo.removeClass(this.streamHeader, 'hide');
			dojo.removeClass(this.iconSearch, 'icon-search');
			dojo.addClass(this.iconSearch, 'icon-cancel');
			dijit.setWaiState(this.iconSearch, 'label', this.nls.closeDesc);
			dojo.attr(this.iconSearch, 'title', this.nls.closeDesc);
			this.clearSearchResult();
			this.commentSearchInput.focus();
		}
		else
		{
			dojo.addClass(this.streamHeader, 'hide');
			dojo.removeClass(this.iconSearch, 'icon-cancel');
			dojo.addClass(this.iconSearch, 'icon-search');
			dijit.setWaiState(this.iconSearch, 'label', this.nls.searchDesc);
			dojo.attr(this.iconSearch, 'title', this.nls.searchDesc);
			this.filterStreamContentByType(this.curFilterType);
		}
	},
	setFilterMenuNum: function(type, num)
	{
		if (type)
		{
			if (!num)
				num = '';

			if (BidiUtils.isArabicLocale())
				num = BidiUtils.convertArabicToHindi(num + "");

			switch (type)
			{
				case this.FILTER_ALL:
					this.cfm_al_num.innerHTML = num;
					return;
				case this.FILTER_TOME:
					this.cfm_me_num.innerHTML = num;
					var trnode = this.cfm_me_num.parentElement.parentElement.parentElement;
					dijit.setWaiState(trnode, 'label', this.nls.menutome + '. ' + this.nls.jawsnactivecommentsnumber + num);
					return;
				case this.FILTER_BYME:
					this.cfm_by_num.innerHTML = num;
					var trnode = this.cfm_by_num.parentElement.parentElement.parentElement;
					dijit.setWaiState(trnode, 'label', this.nls.menubyme + '. ' + this.nls.jawsnactivecommentsnumber + num);
					return;
				case this.FILTER_ACTIVE:
					this.cfm_ac_num.innerHTML = num;
					return;
				case this.FILTER_RESOLVED:
					this.cfm_re_num.innerHTML = num;
					return;
			}
		}
	},
	onFilterClicked: function(type)
	{
		if (type)
		{
			this.curFilterType = type;
			this.commentsController.curFilterType = type;
			this.commentsController._showWaitingWidgets();
			this.streamContent.scrollTop = 0;
			switch (type)
			{
				case this.FILTER_ALL:
					this.filterActionBtn.setLabel(this.nls.menuallcomments);
					this.filterStreamContentByType(this.FILTER_ALL);
					return;
				case this.FILTER_TOME:
					this.filterActionBtn.setLabel(this.tome_label);
					this.filterStreamContentByType(this.FILTER_TOME);
					return;
				case this.FILTER_BYME:
					this.filterActionBtn.setLabel(this.nls.menubyme);
					this.filterStreamContentByType(this.FILTER_BYME);
					return;
				case this.FILTER_ACTIVE:
					this.filterActionBtn.setLabel(this.nls.menuactive);
					this.filterStreamContentByType(this.FILTER_ACTIVE);
					return;
				case this.FILTER_RESOLVED:
					this.filterActionBtn.setLabel(this.nls.menuresolved);
					this.filterStreamContentByType(this.FILTER_RESOLVED);
					return;
			}
		}
	},
	filterStreamContentByType: function(filterType)
	{
		try
		{
			if (!filterType)
				filterType = this.curFilterType;

			this._showEmptyInfo(false);
			var inputContent = '';
			if (!dojo.hasClass(this.streamHeader, 'hide'))
			{
				inputContent = this.commentSearchInput.value || '';
			}
			var filterOption = {
				id: this.filter_user_id,
				org: this.filter_user_org_id,
				name: this.filter_user_name,
				filterType: filterType,
				searchWord: inputContent
			};
			var notEmpty = this.commentsController._filterStreamContentByType(filterOption);
			this._showEmptyInfo(!notEmpty, inputContent);
			this.hasSearchResult = notEmpty && inputContent.length > 0;
			if (this.hasSearchResult)
			{
				dojo.style(this.streamContent, 'marginTop', '35px');
			}
			else
			{
				dojo.style(this.streamContent, 'marginTop', '');
			}
			concord.widgets.sidebar.SideBar.resizeSidebar();
		}
		catch (e)
		{
			console.info('filterStreamContentByType error:' + e);
		}
	},
	_createFilterMenuNumDiv: function(domNode)
	{
		var num_td = dojo.query('.dijitMenuArrowCell', domNode)[0];
		dojo.destroy(num_td.firstElementChild);
		var num_td_div = dojo.create('div', null, num_td);
		dojo.addClass(num_td_div, 'filternumber');
		return dojo.create('span', null, num_td_div);
	},
	_createFilterContextMenu: function()
	{
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var _parent = this;
		var pMenu = this.pMenu = new dijit.Menu({
			id: 'commentfiltermenu',
			leftClickToOpen: true,
			dir: dirAttr
		});
		dojo.addClass(pMenu.domNode, 'lotusActionMenu');
		pMenu.domNode.style.display = 'none';
		document.body.appendChild(pMenu.domNode);

		var cfm_al = new dijit.MenuItem({
			dir: dirAttr,
			label: this.nls.menuallcomments,
			onClick: function()
			{
				_parent.onFilterClicked(_parent.FILTER_ALL);
			}
		});
		this.cfm_al_num = this._createFilterMenuNumDiv(cfm_al.domNode);
		this.setFilterMenuNum(_parent.FILTER_ALL);
		pMenu.addChild(cfm_al);
		pMenu.addChild(new dijit.MenuSeparator());
		var cfm_me = new dijit.MenuItem({
			dir: dirAttr,
			label: this.tome_label,
			onClick: function()
			{
				_parent.onFilterClicked(_parent.FILTER_TOME);
			}
		});
		this.cfm_me_num = this._createFilterMenuNumDiv(cfm_me.domNode);
		dojo.attr(this.cfm_me_num, 'title', this.nls.activenum);
		this.setFilterMenuNum(_parent.FILTER_TOME);
		pMenu.addChild(cfm_me);
		pMenu.addChild(new dijit.MenuSeparator());
		var cfm_by = new dijit.MenuItem({
			dir: dirAttr,
			label: this.nls.menubyme,
			onClick: function()
			{
				_parent.onFilterClicked(_parent.FILTER_BYME);
			}
		});
		this.cfm_by_num = this._createFilterMenuNumDiv(cfm_by.domNode);
		dojo.attr(this.cfm_by_num, 'title', this.nls.activenum);
		this.setFilterMenuNum(_parent.FILTER_BYME);
		pMenu.addChild(cfm_by);
		pMenu.addChild(new dijit.MenuSeparator());
		var cfm_ac = new dijit.MenuItem({
			dir: dirAttr,
			label: this.nls.menuactive,
			onClick: function()
			{
				_parent.onFilterClicked(_parent.FILTER_ACTIVE);
			}
		});
		this.cfm_ac_num = this._createFilterMenuNumDiv(cfm_ac.domNode);
		this.setFilterMenuNum(_parent.FILTER_ACTIVE);
		pMenu.addChild(cfm_ac);
		pMenu.addChild(new dijit.MenuSeparator());
		var cfm_re = new dijit.MenuItem({
			dir: dirAttr,
			label: this.nls.menuresolved,
			onClick: function()
			{
				_parent.onFilterClicked(_parent.FILTER_RESOLVED);
			}
		});
		this.cfm_re_num = this._createFilterMenuNumDiv(cfm_re.domNode);
		this.setFilterMenuNum(_parent.FILTER_RESOLVED);
		pMenu.addChild(cfm_re);
		this.firstMenuStyle = true;
		this.connectArray.push(dojo.connect(pMenu, 'onOpen', dojo.hitch(this, function()
		{
			if (window.pe.scene.docType == "pres")
			{
				pe.scene.focusMgr && pe.scene.focusMgr.setFocusComponent(concord.util.events.SIDE_BAR_COMPONENT);
			}
			var pDom = this.pMenu.domNode;
			if (this.firstMenuStyle)
			{
				this.firstMenuStyle = false;
				pDom.style.setProperty('border', '1px solid #aaa', 'important');
				dojo.query('.dijitMenuItemIconCell', pDom).forEach(function(item)
				{
					item.style.setProperty('width', '0px', 'important');
					item.style.setProperty('padding', '2px', 'important');
				});
				dojo.query('.dijitMenuItemLabel', pDom).forEach(function(item)
				{
					item.style.setProperty('wdith', '0', 'important');
					item.style.setProperty('padding', '6px 4px', 'important');
					item.style.setProperty('font-size', '13px', 'important');					
				});
				dojo.query('.dijitMenuArrowCell', pDom).forEach(function(item)
				{
					item.style.setProperty('padding', '4px', 'important');
					item.style.setProperty('font-size', '13px', 'important');
				});
				dojo.query('.dijitMenuSeparatorIconCell', pDom).forEach(function(item)
				{
					item.style.setProperty('padding', '0px 0px 0px 6px', 'important');
				});
				dojo.query('.dijitMenuSeparatorLabelCell', pDom).forEach(function(item)
				{
					item.style.setProperty('padding', '0px 6px 0px 0px', 'important');
				});
			}
			var top = dojo.style(this.pMenu.domNode.parentElement, 'top') + 6;
			this.pMenu.domNode.parentElement.style.top = top + 'px';
		})));
	},
	_setSidebarPadding: function(pxValue)
	{
		dojo.style(this.streamHeader, 'paddingLeft', pxValue);
		dojo.style(this.streamHeader, 'paddingRight', pxValue);
		dojo.style(this.commentSearchDiv, 'left', pxValue);
		dojo.style(this.commentSearchDiv, 'right', pxValue);
		dojo.style(this.emptyInfoDiv, 'left', pxValue);
		dojo.style(this.emptyInfoDiv, 'right', pxValue);
		dojo.style(this.commentSearchButton, BidiUtils.isGuiRtl() ? 'left' : 'right', pxValue);

		dojo.style(this.newCommentsBannerDiv, 'paddingLeft', pxValue);
		dojo.style(this.newCommentsBannerDiv, 'paddingRight', pxValue);
		var left = (this.streamHeader.clientWidth - this.defaultScrollbarSize - this.newcommentswidth) / 2;
		dojo.style(this.newCommentsBannerDiv, 'left', left + 'px');

	},
	_showSearchAlert: function()
	{
		var msg = this.nls.warnEnterKeywords;
		var focused = dojo.hitch(this, function()
		{
			setTimeout(dojo.hitch(this, function()
			{
				this.commentSearchInput.focus();
			}), 0);
		});
		var dlg = new concord.widgets.sidebar.CommentAlertDlg(null, null, null, false, {
			message: msg,
			callback: focused
		});
		dlg.show();
	},
	_showEmptyInfo: function(show, keyword)
	{
		dojo.removeAttr(this.emptyInfoDiv, 'role');
		if (show && pe.scene.bean)
		{
			keyword = keyword ? keyword : '';
			var value = null;
			var docTitle = pe.scene.bean.getTitle();
			var filterName = '';
			switch (this.curFilterType)
			{
				case this.FILTER_ALL:
					filterName = this.nls.menuallcomments;
					break;
				case this.FILTER_TOME:
					filterName = this.nls.menutome;
					break;
				case this.FILTER_BYME:
					filterName = this.nls.menubyme;
					break;
				case this.FILTER_ACTIVE:
					filterName = this.nls.menuactive;
					break;
				case this.FILTER_RESOLVED:
					filterName = this.nls.menuresolved;
					break;
			}
			if (BidiUtils.isBidiOn())
			{
				filterName = BidiUtils.addEmbeddingUCC(filterName);
				docTitle = BidiUtils.addEmbeddingUCC(docTitle);
			}
			if (keyword.length > 0)
			{
				if (BidiUtils.isBidiOn())
				{
					keyword = BidiUtils.addEmbeddingUCC(keyword);
				}
				value = dojo.string.substitute(this.nls.nosearchedcomments, [keyword, filterName, docTitle]);
			}
			else
			{
				switch (this.curFilterType)
				{
					case this.FILTER_ALL:
						value = dojo.string.substitute(this.nls.nocomments, [docTitle]);
						break;
					case this.FILTER_TOME:
						value = dojo.string.substitute(this.nls.nocommentstome, [docTitle]);
						break;
					case this.FILTER_BYME:
						value = dojo.string.substitute(this.nls.nocommentsbyme, [docTitle]);
						break;
					case this.FILTER_ACTIVE:
						value = dojo.string.substitute(this.nls.nocommentsar, [filterName, docTitle]);
						break;
					case this.FILTER_RESOLVED:
						value = dojo.string.substitute(this.nls.nocommentsar, [filterName, docTitle]);
						break;
				}
			}

			dijit.setWaiRole(this.emptyInfoDiv, 'alert');
			this.emptyInfoDiv.innerHTML = value;
			this.emptyInfoDiv.style.display = '';
			dojo.attr(this.emptyInfoDiv, 'tabIndex', '0');
		}
		else
		{
			this.emptyInfoDiv.innerHTML = '';
			this.emptyInfoDiv.style.display = 'none';
			dojo.attr(this.emptyInfoDiv, 'tabIndex', '-1');
		}
	},
	_rePosNormalize: function(s, pos, comFunc)
	{
		s = s.toLowerCase();
		var arr_l = comFunc.call(this.charEQ, s);
		if (pos >= arr_l.length)
			return pos;
		var newpos = 0;
		for ( var i = 0; i < pos; i++)
			newpos += arr_l[i];
		return newpos;
	},

	_reLenNormalize: function(s, pos, len, comFunc)
	{
		s = s.toLowerCase();
		var arr_l = comFunc.call(this.charEQ, s);
		if (pos >= arr_l.length)
			return len;
		var newlen = 0;
		var end = pos + len;
		for ( var i = pos; i < end; i++)
			newlen += arr_l[i];
		return newlen;
	},
	_doHighLights: function(contents, highlights)
	{
		var result = contents;
		if (!highlights)
			return result;
		var cnt = contents;
		var ptn = highlights;
		var hL = ptn.length;
		if (hL > 0)
		{
			result = '';
			cnt = cnt.toLowerCase();
			cnt = this.charEQ.normalize_latin(cnt);
			ptn = ptn.toLowerCase();
			ptn = this.charEQ.normalize_latin(ptn);
			hL = ptn.length;
			if (this.lang.indexOf('ja') != -1)
			{
				cnt = this.CJK_map.strToHarf(cnt);
				cnt = this.charEQ.normalize_ja(cnt);
				ptn = this.CJK_map.strToHarf(ptn);
				ptn = this.charEQ.normalize_ja(ptn);
				hL = ptn.length;
			}
			if (this.lang.indexOf('zh') != -1 || this.lang.indexOf('ko') != -1)
			{
				cnt = this.CJK_map.strToHarf(cnt);
				ptn = this.CJK_map.strToHarf(ptn);
			}
			var pos = cnt.toLowerCase().indexOf(ptn.toLowerCase());
			if (pos >= 0)
			{
				if (this.lang.indexOf('ja') != -1)
				{
					hL = this._reLenNormalize(contents, pos, hL, this.charEQ.mark_compose_ja);
					pos = this._rePosNormalize(contents, pos, this.charEQ.mark_compose_ja);
				}
				hL = this._reLenNormalize(contents, pos, hL, this.charEQ.mark_compose_latin);
				pos = this._rePosNormalize(contents, pos, this.charEQ.mark_compose_latin);
				var beginStr = (pos == 0) ? null : contents.substr(0, pos);
				var lights = contents.substr(pos, hL);
				var endStr = contents.substr(pos + hL);
				if (beginStr)
					result += beginStr;
				result += '<span class = "filterhightlight">' + lights + '</span>';
				result += this._doHighLights(endStr, highlights);
			}
			else
			{
				result = contents;
			}
		}
		result = result.replace(new RegExp('<<span class = "filterhightlight">b</span>>', "gm"), "<b>");
		result = result.replace(new RegExp('</<span class = "filterhightlight">b</span>>', "gm"), "</b>");
		return result;
	},
	destroy: function()
	{
		// 1- remove DOJO connections
		for ( var i = 0; i < this.connectArray.length; i++)
		{
			dojo.disconnect(this.connectArray[i]);
		}
		// 2- nullify variables
		this.nullifyVariables();
	},
	nullifyVariables: function()
	{
		this.nls = null;
		this.connectArray = null;
		this.pMenu = null;
		this.cfm_al_num = null;
		this.cfm_me_num = null;
		this.cfm_by_num = null;
		this.cfm_ac_num = null;
		this.cfm_re_num = null;
		this.commentSearchInput = null;
		this.commentsController = null;
		this.streamHeader = null;
		this.streamContent = null;
	}
});