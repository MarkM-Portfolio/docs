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

dojo.provide("pres.Hub");
dojo.require("pres.model.Document");
dojo.require("pres.model.Commands");
dojo.require("pres.loader.PartialLoader");
dojo.require("pres.loader.MasterLoader");
dojo.require("pres.utils.cssHelper");
dojo.require("pres.msg.Publisher");
dojo.require("pres.constants");
dojo.require("pres.widget.LayoutGallery");
dojo.require("concord.widgets.layoutGallery");
dojo.require("concord.widgets.layoutGallery.galleryLayoutIndex");

dojo.require("pres.handler.SlideHandler");
dojo.require("pres.handler.ElementHandler");
dojo.require("pres.handler.CommandHandler");
dojo.require("pres.handler.TableElementHandler");
dojo.require("pres.handler.CommentsHandler");
dojo.require("pres.config.toolbar");
dojo.require("pres.config.menuBar");
dojo.require("pres.FocusManager");
dojo.require("concord.util.uri");

dojo.declare("pres.Hub", null, {

	app: null,
	document: null,
	toolbarModel: null,
	slideHandler: null,
	elementHandler: null,
	monitorCss: false,
	formatpainterStyles: null,

	constructor: function()
	{
		this.monitorCss = pe.scene.isMobile;
		
		this.toolbarModel = new pres.model.Commands(pres.config.toolbar.init());
		this.menuBarModel = new pres.model.Commands(pres.config.menuBar.init());

		this.commandsModel = this.menuBarModel;

		this.app = new pres.widget.App({
			toolbarModel: this.toolbarModel,
			menuBarModel: this.menuBarModel
		});
		dojo.place(this.app.domNode, dojo.byId("mainNode"));
		this.app.startup();

		dojo.subscribe("/data/loaded", this, this.onDataLoaded);
		dojo.subscribe("/data/reset", this, this.onDataReset);
		dojo.subscribe("/scene/user/joined", this, this.onUserJoined);

		this.focusMgr = new pres.FocusManager();
		this.commandHandler = new pres.handler.CommandHandler();

		this.slideHandler = new pres.handler.SlideHandler();
		this.elementHandler = new pres.handler.ElementHandler();
		this.commentsHandler = new pres.handler.CommentsHandler();

		this.layoutHtmlDivId = "layoutHtmlDiv";
		this.masterHtmlDivId = "masterHtmlDiv";
	},

	onDataLoaded: function(isFull)
	{
		if (isFull)
		{
			pe.scene.setLoadFinished(true);
			
			setTimeout(dojo.hitch(this, this.startMasterLoad), 0);
			
			var store = pe.scene.getEditorStore();
			if (store)
			{			
				var editors = store.getContainer();
				if (editors)
				{
					for (var i = 0; i < editors.getEditorCount();i++)
					{
						var editor = editors.getEditor(i);
						if (editor)
						{
							var editorId = editor.getEditorId();
							this.updateUserCss(editorId);
						}
					}
				}
			}
			pe.scene.slideEditor.initEditor();
		}
		else
		{
			setTimeout(dojo.hitch(this, this.startPartialLoad), 0);
		}
	},

	onUserJoined: function(user)
	{
		this.updateUserCss(user.getId ? user.getId(): user.id);
	},

	updateUserCss: function(userID)
	{
		if (!this._activeUsers)
			this._activeUsers = {};
		
		if (this._activeUsers["__" + userID])
			return;
		
		this._activeUsers["__" + userID] = 1;
		
		var cssTemplate = " .slide_marker_user_USERID, .locker_tooltip_USERID .dijitTooltipContainer {background-color:COLOR !important} .locker_USERID {border: 3px solid COLOR !important; margin: -3px !important} .user_indicator .SHOW_USER_USERID .CSS_USERID {border-bottom:2px dotted COLOR}";
		cssTemplate += " .dijitContentPane.notes .notes-box .locker_USERID {border: 3px solid COLOR !important; box-sizing: border-box}"
		cssTemplate += " .slide_marker_user_USERID::before, .locker_tooltip_USERID .dijitTooltipContents::before {background-color:COLOR} .user_indicator .SHOW_USER_USERID .CSS_USERID::before {border-bottom:2px dotted COLOR}";
		var color = pe.scene.getEditorStore().getUserCoeditColor(userID);
		var css = cssTemplate.replace(/USERID/g, userID).replace(/COLOR/g, color);
		var cssHelper = pres.utils.cssHelper;
		var styleName = "user_style_" + userID;
		var sheet = cssHelper.findCssSheet(styleName);
		if (!sheet)
			cssHelper.insertCssStyle(css, styleName, true);
		var div = dojo.byId("userIndicators");
		if (!div)
		{
			div = dojo.create("div", {
				id: "userIndicators"
			}, dojo.body());
		}
		if (!dojo.byId("coid_" + userID))
		{
			var u = pe.scene.getEditorStore().getEditorById(userID);
			var name = u.getName();
			dojo.create("span", {
				id: "coid_" + userID,
				innerHTML: "Edit by " + name
			}, div);
		}
	},

	onSideBarResized: function(w)
	{
		pe.scene.hideComments();
		this.app.onSideBarResized(w);
	},

	startPartialLoad: function()
	{
		if (!this.document.chunkId)
			return;
		var dfd = pres.loader.PartialLoader.start(this.document.chunkId);
		dfd.then(dojo.hitch(this, function(result)
		{
			pres.perf.mark("data_loaded_full");
			this.document.appendPartial(result[0], result[1]);

		}), dojo.hitch(this, function()
		{
			this.document.appendPartial("");
		}));
	},

	startMasterLoad: function()
	{
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
		{
			dojo.publish("/data/master/loaded", [""]);
			return;
		}
		var dfd = pres.loader.MasterLoader.start();
		dfd.then(dojo.hitch(this, function(data)
		{
			pe.scene.master = data;
			this.masterHtmlDiv = data.masterHtmlDiv;
			this.initPageLayout();
			dojo.publish("/data/master/loaded", [data]);
		}), function()
		{
		});
	},

	initPageLayout: function()
	{
		var html = pres.widget.LayoutGallery.prototype.templateString;
		this.layoutHtmlDiv = dojo.create("div", {
			innerHTML: html,
			id: "layoutHtmlDiv",
			style: {
				visibility: "hidden",
				display: "none",
				position: "absolute",
				opacity: "0",
				top: "-10000px",
				left: "-10000px"
			}
		}, dojo.body());
		this.getSupportedLayout();
	},

	getSupportedLayout: function()
	{
		this.supportedLayoutArray = [];
		var galleryLayoutIndex = new concord.widgets.layoutGallery.galleryLayoutIndex();
		if (galleryLayoutIndex.templates != null)
		{
			for ( var i = 0; i < galleryLayoutIndex.templates.length; i++)
			{
				if (galleryLayoutIndex.templates[i].template != null)
				{
					var layoutId = galleryLayoutIndex.templates[i].template.id;
					// 15496 - layout Id from galleryLayoutIndex template has sufffix "_layout_id"
					// need to strip it out
					var idx = layoutId.indexOf("_layout_id");
					var trueId = layoutId;
					if (idx >= 0)
					{
						trueId = layoutId.substring(0, idx);
					}
					this.supportedLayoutArray[trueId] = true;
				}
			}
		}
	},

	isSupportedLayout: function(layoutName)
	{
		var result = false;
		if (layoutName != null && this.supportedLayoutArray != null)
		{
			result = this.supportedLayoutArray[layoutName];
			if (result != true)
			{
				result = false;
			}
		}
		return result;
	},

	setDocument: function(doc)
	{
		this.document = doc;
		
		if (pe.scene.isHTMLViewMode() && DOC_SCENE.snapshotId && DOC_SCENE.snapshotId != 'null')
		{
			// addSidToContentImage removed to thumbnail and slideeditor, after shown.
			if (doc.styles)
			{
				dojo.forEach(doc.styles, function(s)
				{
					if (s.src)
						s.src = DOC_SCENE.version + "/" + s.src + (s.src.indexOf("?") > 0 ? "&" : "?") + "sid=" + DOC_SCENE.snapshotId;
					else if (s.text)
						s.text = concord.util.uri.addSidToStyleImage(s.text);
				});
			}
		}
		
		this.attachStyles();
		this.attachCustomValues();
		this.getContentLang();
		
		var isFull = !this.document.chunkId;
		dojo.publish("/data/loaded", [isFull]);
		
		var masterDiv = dojo.byId("masterHtmlDiv");
		var layoutDiv = dojo.byId("layoutHtmlDiv");
		
		if (masterDiv)
			dojo.destroy(masterDiv);
			
		if (layoutDiv)
			dojo.destroy(layoutDiv);
		
		this.listenEvents();
	},

	getContentLang: function()
	{
		var classname = new concord.i18n.ClassName();
		var bodyClass = this.document.bodyClass;
		if (classname && bodyClass)
		{
			var allPossibleClassNames = classname.getAllLangClass();
			for ( var z = 0; z < allPossibleClassNames.length; z++)
			{
				var cn = allPossibleClassNames[z];
				if (cn && bodyClass.indexOf(cn) >= 0)
				{
					this.contentLangClassName = cn;
				}
			}
		}
		if (this.contentLangClassName == "lotusJapanese")
		{
			pe.scene.defaultFonts = "MS PMincho, MS PGothic, Apple Gothic, Arial, Verdana, sans-serif";
		}
		else if (this.contentLangClassName == "lotusKorean")
		{
			pe.scene.defaultFonts = "'Gulim','GulimChe',Arial, Helvetica, sans-serif";
		}

		this.app.editor.domNode.style.fontFamily = pe.scene.defaultFonts;
		this.app.sorter.domNode.style.fontFamily = pe.scene.defaultFonts;
	},

	listenEvents: function()
	{
		if (pe.scene.isHTMLViewMode() || pe.scene.isMobile)
			return;
		
		if(!this._events)
			this._events = [];
		
		dojo.forEach(this._events, dojo.unsubscribe);
		
		this._events = [];
		
		this._events.push(dojo.subscribe("/sorter/selection/changed", this.slideHandler, "selectionChanged"));
		this._events.push(dojo.subscribe("/sorter/to/move", this.slideHandler, "moveSlides"));
		this._events.push(dojo.subscribe("/sorter/to/duplicate", this.slideHandler, "duplicateSlides"));
		this._events.push(dojo.subscribe("/sorter/to/delete", this.slideHandler, "deleteSlides"));
		this._events.push(dojo.subscribe("/sorter/to/create", this.slideHandler, "createSlide"));
		this._events.push(dojo.subscribe("/sorter/to/paste", this.slideHandler, "pasteSlides"));
		this._events.push(dojo.subscribe("/sorter/update/layout", this.slideHandler, "openLayoutDialog"));
		this._events.push(dojo.subscribe("/sorter/update/transition", this.slideHandler, "openTransitionDialog"));

		this._events.push(dojo.subscribe("/box/content/updated", this.elementHandler, "boxContentUpdated"));
		this._events.push(dojo.subscribe("/box/lock", this.elementHandler, "boxToLock"));
		this._events.push(dojo.subscribe("/box/unlock", this.elementHandler, "boxToUnlock"));
		this._events.push(dojo.subscribe("/box/to/create", this.elementHandler, "boxToCreate"));
		this._events.push(dojo.subscribe("/box/to/paste", this.elementHandler, "boxToPaste"));
		this._events.push(dojo.subscribe("/box/to/delete", this.elementHandler, "boxToDelete"));
		this._events.push(dojo.subscribe("/box/to/replace", this.elementHandler, "boxToReplace"));
		this._events.push(dojo.subscribe("/box/size/changed", this.elementHandler, "boxSizeChanged"));
		this._events.push(dojo.subscribe("/box/pos/changed", this.elementHandler, "boxPosChanged"));
		this._events.push(dojo.subscribe("/box/trans/changed", this.elementHandler, "boxTransChanged"));
		this._events.push(dojo.subscribe("/box/adjhandler/changed", this.elementHandler, "adjHandlerChanged"));
		this._events.push(dojo.subscribe("/box/set/color", this.elementHandler, "boxSetColor"));
		this._events.push(dojo.subscribe("/box/set/opacity", this.elementHandler, "boxSetOpacity"));
		this._events.push(dojo.subscribe("/shape/set/bgcolor", this.elementHandler, "shapeSetBGColor"));
		this._events.push(dojo.subscribe("/shape/set/bordercolor", this.elementHandler, "shapeSetBorderColor"));
		this._events.push(dojo.subscribe("/shape/set/opacity", this.elementHandler, "shapeSetOpacity"));
		this._events.push(dojo.subscribe("/img/set/opacity", this.elementHandler, "imageSetOpacity"));

		this._events.push(dojo.subscribe("/shape/set/linestyle", this.elementHandler, "shapeSetLineStyle"));
		this._events.push(dojo.subscribe("/table/to/resize/row", this.elementHandler, "rowToResize"));
		this._events.push(dojo.subscribe("/table/to/insert/row", this.elementHandler, "rowToInsert"));
		this._events.push(dojo.subscribe("/table/to/move/row", this.elementHandler, "rowToMove"));
		this._events.push(dojo.subscribe("/table/to/delete/row", this.elementHandler, "rowToDelete"));
		this._events.push(dojo.subscribe("/table/to/set/row/header", this.elementHandler, "rowToSetHeader"));
		this._events.push(dojo.subscribe("/table/to/remove/row/header", this.elementHandler, "rowToRemoveHeader"));

		this._events.push(dojo.subscribe("/table/to/resize/col", this.elementHandler, "colToResize"));
		this._events.push(dojo.subscribe("/table/to/insert/col", this.elementHandler, "colToInsert"));
		this._events.push(dojo.subscribe("/table/to/move/col", this.elementHandler, "colToMove"));
		this._events.push(dojo.subscribe("/table/to/delete/col", this.elementHandler, "colToDelete"));
		this._events.push(dojo.subscribe("/table/to/set/col/header", this.elementHandler, "colToSetHeader"));
		this._events.push(dojo.subscribe("/table/to/remove/col/header", this.elementHandler, "colToRemoveHeader"));

		this._events.push(dojo.subscribe("/table/to/clear/cell", this.elementHandler, "cellToClear"));
		this._events.push(dojo.subscribe("/table/to/paste/cell", this.elementHandler, "tableToCell"));
		this._events.push(dojo.subscribe("/table/to/color/cell", this.elementHandler, "cellToColor"));

		this._events.push(dojo.subscribe("/table/to/update/template", this.elementHandler, "tableToUpdateTemplate"));
		this._events.push(dojo.subscribe("/comments/to/created", this.commentsHandler, "commentsCreated"));
		this._events.push(dojo.subscribe("/comments/to/appended", this.commentsHandler, "commentsAppended"));
		this._events.push(dojo.subscribe("/comments/to/deleted", this.commentsHandler, "commentsDeleted"));
		this._events.push(dojo.subscribe("/comments/to/updated", this.commentsHandler, "commentsUpdated"));
		this._events.push(dojo.subscribe("/comments/to/selected", this.commentsHandler, "commentsSelected"));
		this._events.push(dojo.subscribe("/comments/to/unselected", this.commentsHandler, "commentsUnSelected"));
		this._events.push(dojo.subscribe("/comments/to/show", this.commentsHandler, "showComment"));
		this._events.push(dojo.subscribe("/comments/to/hide", this.commentsHandler, "hideComment"));

		this._events.push(dojo.subscribe("/comments/element/deleted", this.commentsHandler, "deleteElementComments"));
		this._events.push(dojo.subscribe("/comments/element/undodeleted", this.commentsHandler, "undoDeleteElementComments"));
	},

	attachCustomValues: function()
	{
		var id = "custom_style_mode_value";
		var div = dojo.byId(id);
		if (div)
			dojo.destroy(div);
		var div = dojo.create("div", {
			id: id,
			innerHTML: this.document.customValues,
			style: {
				display: "none"
			}
		});
		dojo.body().appendChild(div);
	},
	_cssloaded: function(stylecssStr, styleName, theDoc)
	{
		if (pe.scene.isHTMLViewMode() && DOC_SCENE.snapshotId && DOC_SCENE.snapshotId != 'null')
		{
			stylecssStr = concord.util.uri.addSidToStyleImage(stylecssStr);
		}
		var h = pres.utils.cssHelper;
		var sheet = h.insertCssStyle(stylecssStr, styleName, true, theDoc);
		if (sheet)
			dojo.attr(sheet, "docspres", "true");
	},
	attachStyles: function(doc)
	{
		var needMonitor = this.monitorCss && this.externalCss === undefined;
		if (needMonitor)
		{
			this.externalCss = 0;
			this.externalCssLoaded = 0;
			this.timestamp = new Date().valueOf();
		}
		
		var h = pres.utils.cssHelper;
		var theDoc = doc || document;
		var head = theDoc.getElementsByTagName('head')[0];
		
		var disabledLinks = [];
		
		dojo.forEach(dojo.query("[docspres]", head), function(link){
			if (dojo.isIE)
			{
				dojo.attr(link, "disabled", true);
				disabledLinks.push(link);
			}
			else
				dojo.destroy(link);
		});
		
		if (disabledLinks.length)
		{
			setTimeout(function(){
				dojo.forEach(disabledLinks, dojo.destroy);
			}, 100);
		}
		
		if (this.document.styles)
		{
			if (needMonitor)
			{
				dojo.forEach(this.document.styles, dojo.hitch(this, function(s)
				{
					if (s.src)
						this.externalCss ++;
				}));
			}
			dojo.forEach(this.document.styles, dojo.hitch(this, function(s)
			{
				var id = s.id;
				var name = s.name;
				var src = s.src;
				var text = s.text;
				if (src)
				{	
					if(src.indexOf('office_styles.css') >= 0 || src.indexOf('office_automatic_styles.css') >= 0) {
						var sheet = h.insertCssStyle(".jTemp{font-size:1em;}", src, false, theDoc);
						if (sheet)
							dojo.attr(sheet, "docspres", "true");
						this.dfd = new dojo.Deferred();
						dojo.xhrGet({
							url: src,
							handleAs: "text",
							preventCache: true
						}).then(dojo.hitch(this, function(data)
						{
							this._cssloaded(data, src, theDoc);
							if (needMonitor)
							{
								this.externalCssLoaded ++;
								if (this.externalCss == this.externalCssLoaded)
								{
									setTimeout(function(){
										dojo.publish("/data/css/loaded", []);
									}, 0);
								}
							}
						}), function(err)
						{
							this.dfd.reject();
						});
					} else {
						var link = theDoc.createElement('link');
						link.type = 'text/css';
						link.href = src;
						link.rel = 'stylesheet';
						link.id = id;
						if (name)
						{
							link.name = link.styleName = link.title = name;
						}
						dojo.attr(link, "docspres", "true");
						if (needMonitor)
						{
							dojo.attr(link, "timestamp", this.timestamp);
							dojo.connect(link, "onload", this, function(e){
								var l = e.target;
								if (l && dojo.attr(l, "timestamp") == this.timestamp)
								{
									this.externalCssLoaded ++;
									if (this.externalCss == this.externalCssLoaded)
									{
										setTimeout(function(){
											dojo.publish("/data/css/loaded", []);
										}, 0);
									}
								}
							});
						}
						head.appendChild(link);
					}
				}
				else
				{
					var sheet = h.insertCssStyle(text, null, false, theDoc);
					if (sheet)
						dojo.attr(sheet, "docspres", "true");
				}
			}));
		}
		var link = theDoc.createElement('link');
		link.type = 'text/css';
		link.href = contextPath + staticRootPath + "/styles/css/presentation2/listbeforepredefine.css";
		if (pe.scene.isHTMLViewMode() && staticRootPath.indexOf('/js/html')<0){
			link.href = contextPath + staticRootPath + "/js/html/styles/css/presentation2/listbeforepredefine.css";
		}
		link.rel = 'stylesheet';
		dojo.attr(link, "docspres", "true");
		head.appendChild(link);
	},
	
	onDataReset: function()
	{
		delete this.externalCss;
	},

	toggleNotes: function(show)
	{
		pe.scene.hideComments();
		this.app.editor.toggleNotes(show);
	},

	toggleToolbar: function(show)
	{
		pe.scene.hideComments();
		this.app.toggleToolbar(show);
	},

	toggleSorter: function(show)
	{
		pe.scene.hideComments();
		this.app.toggleSorter(show);
	}

});