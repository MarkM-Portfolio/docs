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

dojo.provide("websheet.Menubar");
dojo.require("websheet.widget.DropDownButton");
dojo.require("websheet.config.ToolbarConfig");
dojo.require("websheet.config.MenubarConfig");
dojo.require("websheet.i18n.Number");
dojo.require("dojo.i18n");
dojo.require("dojo.aspect");
dojo.require("concord.main.Settings");
dojo.require("concord.main.App");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.browser");
//dojo.require("concord.spellcheck.scaytservice");
dojo.require("concord.editor.PopularFonts");
dojo.require("websheet.Utils");
dojo.require("websheet.Helper");
dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.functions.FormulaTranslate");
dojo.require("websheet.widget.MenuTooltip");
dojo.requireLocalization("concord.widgets","menubar");
dojo.requireLocalization("concord.widgets","toolbar");
dojo.requireLocalization("websheet","base");
createSheetContextMenu = function(editor){
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var menu = new dijit.Menu({targetNodeIds:["websheet_layout_WorksheetContainer_0_tablist"],id:"sheet_context_menu", dir: dirAttr});
	editor.getWorksheetContainer()._supportingWidgets.push(menu);
	dojo.addClass(menu.domNode,"lotusActionMenu");
	var attrs = getSheetCMenuConfig();
	var items = createCMItems(editor, attrs, dirAttr);
	if(items)
	{
		var length = items.length;
		for(var i = 0; i < length; i++)
		{
			menu.addChild(items[i]);
		}
	}
	if(pe.scene.bMobileBrowser) {
	var hideSheetSubMenu = new dijit.Menu({
		id: "S_CSUBM_Show_Sheets",
		dir: dirAttr
	});
	
	var hideSheetsPopMenu = new dijit.PopupMenuItem({
        label: menuStrs.viewMenu_HiddenSheets,
        id: "S_CM_Show_Sheets",
        popup: hideSheetSubMenu,
        dir: dirAttr
    });
	dojo.aspect.before(menu, '_scheduleOpen', function() {
		var sheets = editor.getDocumentObj().getSheets();
    	var enable_hidden_sheets = false;
    	for (var s=0; s<sheets.length; s++){    		
    		var sheetVis = sheets[s].getSheetVisibility();
    		//veryhide sheet should not be taken into account
    		if (sheetVis == "hide") {
    			enable_hidden_sheets = true;
    			break;
    		}    		
    	}	
    	hideSheetsPopMenu.attr('disabled', !enable_hidden_sheets);
	});
	
	if(hideSheetSubMenu.onOpen) {
		dojo.aspect.before(hideSheetSubMenu, 'onOpen', function(){
			hideSheetSubMenu.destroyDescendants();
			var sheets = editor.getDocumentObj().getSheets();
			for( var i = 0; i < sheets.length; i++) {
				var sheet = sheets[i];
				if (!sheet.isSheetVisible()){
					var sheetName = sheet.getSheetName();
					sheetName = websheet.Helper.escapeXml(sheetName, null, true);
					var sheetId = sheet.getId();
					var menuItem = new dijit.MenuItem({
		    			label: sheetName,
		    			dir:(BidiUtils.isBidiOn() ? BidiUtils.getResolvedTextDir(sheetName) : ""),
		    			id: "S_i_HiddenSheet_" + sheetId,
		    			sheet_id: sheetId,
		    			onClick: function(){
		                    editor.execCommand(commandOperate.UNHIDESHEET, [this.sheet_id]);
		    			}
		    		});
					hideSheetSubMenu.addChild(menuItem);
				}
			}
		});
	}
	
    dojo.style(hideSheetsPopMenu.arrowWrapper, 'visibility', '');
    menu.addChild(hideSheetsPopMenu);
	}
    menu.startup();
},

createGridContextMenu = function(editor){
	dojo.require("dojo.parser");
	dojo.require("dijit.Menu");
	dojo.require("dijit.MenuItem");
	
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	var toolbarStrs = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var menu = new dijit.Menu({targetNodeIds:["sheet_tab_container"],id:"grid_context_menu", dir: dirAttr, bindDomNode: function(node){
		// overwrite dojo's bindDomNode, do not stop event if context menu is triggered from InlineEditor,
		// summary:
		//		Attach menu to given node
		node = dojo.byId(node);

		var cn;	// Connect node

		// Support context menus on iframes.   Rather than binding to the iframe itself we need
		// to bind to the <body> node inside the iframe.
		if(node.tagName.toLowerCase() == "iframe"){
			var iframe = node,
				win = this._iframeContentWindow(iframe);
			cn = dojo.withGlobal(win, dojo.body);
		}else{
			// To capture these events at the top level, attach to <html>, not <body>.
			// Otherwise right-click context menu just doesn't work.
			cn = (node == dojo.body() ? dojo.doc.documentElement : node);
		}

		// "binding" is the object to track our connection to the node (ie, the parameter to bindDomNode())
		var binding = {
			node: node,
			iframe: iframe
		};

		// Save info about binding in _bindings[], and make node itself record index(+1) into
		// _bindings[] array.   Prefix w/_dijitMenu to avoid setting an attribute that may
		// start with a number, which fails on FF/safari.
		dojo.attr(node, "_dijitMenu" + this.id, this._bindings.push(binding));

		// Setup the connections to monitor click etc., unless we are connecting to an iframe which hasn't finished
		// loading yet, in which case we need to wait for the onload event first, and then connect
		// On linux Shift-F10 produces the oncontextmenu event, but on Windows it doesn't, so
		// we need to monitor keyboard events in addition to the oncontextmenu event.
		var doConnects = dojo.hitch(this, function(cn){
			return [
				// TODO: when leftClickToOpen is true then shouldn't space/enter key trigger the menu,
				// rather than shift-F10?
				dojo.connect(cn, this.leftClickToOpen ? "onclick" : "oncontextmenu", this, function(evt){
					// Schedule context menu to be opened unless it's already been scheduled from onkeydown handler
					if(!(evt.target && dojo.hasClass(evt.target, 'inline-editor')))
					{
						dojo.stopEvent(evt);
						this._scheduleOpen(evt.target, iframe, {x: evt.pageX, y: evt.pageY});
					}
				}),
				dojo.connect(cn, "onkeydown", this, function(evt){
					if(evt.shiftKey && evt.keyCode == dojo.keys.F10){
						dojo.stopEvent(evt);
						this._scheduleOpen(evt.target, iframe);	// no coords - open near target node
					}
				})
			];
		});
		binding.connects = cn ? doConnects(cn) : [];

		if(iframe){
			// Setup handler to [re]bind to the iframe when the contents are initially loaded,
			// and every time the contents change.
			// Need to do this b/c we are actually binding to the iframe's <body> node.
			// Note: can't use dojo.connect(), see #9609.

			binding.onloadHandler = dojo.hitch(this, function(){
				// want to remove old connections, but IE throws exceptions when trying to
				// access the <body> node because it's already gone, or at least in a state of limbo

				var win = this._iframeContentWindow(iframe);
					cn = dojo.withGlobal(win, dojo.body);
				binding.connects = doConnects(cn);
			});
			if(iframe.addEventListener){
				iframe.addEventListener("load", binding.onloadHandler, false);
			}else{
				iframe.attachEvent("onload", binding.onloadHandler);
			}
		}
	}, _scheduleOpen : function(delegatedTarget, /*DomNode?*/ iframe, /*Object?*/ coords, /*DomNode?*/ target){
		var selectedFrame = editor.getDrawFrameHdl().getSelectedDrawDivInCurrSheet();
		if(selectedFrame)
		{
			if(!pe.scene.bMobileBrowser) {
				selectedFrame.doUpdateContextMenu(null, true);
				if(!coords)	
					target = selectedFrame._drawDiv;
			}
		}else if(editor.stopeContextMenu){
			this._openTimer = null;
			editor.stopeContextMenu = false;
			return;
		}
		else
		{
			var grid = editor.getCurrentGrid();
			var selectRect = grid.selection.selector();
			if(grid.isEditingFormulaCell() || grid.isEditingDialog())
				return;
			grid.modifyContextMenu(null, selectRect.getSelectType());
//			if(!coords && dojo.isIE)
//			{
//				target = grid.getContentView().getCellNode(selectRect.focusRow, selectRect.focusCol);
//			}
		}
		if(!this._openTimer){
			this._openTimer = this.defer(function(){
				delete this._openTimer;
				this._openMyself({
					target: target,
					delegatedTarget: delegatedTarget,
					iframe: iframe,
					coords: coords
				});
				//dojo will first select the first child when open & focus, but then de-select the first child if the menu is not popped up with keyboard.
				//it's a new behavior in dojo 1.9.3 different from the old versions.
				//Strange design, and it sucks with a 'blink' for its "select-then-deselect" routine.
				//NOT acceptable in our product
				var that = this;
				var signal = dojo.aspect.after(this, '_cleanUp', function(){
					signal.remove();
					//we need to make it selected, even by mouse right click.
					var item = that._getFirstFocusableChild();
					if(item){
						item._setSelected(true);
						that._set("selected", item);
					}
				});
			}, dojo.isMac ? 50: 1);//for mac,add more timeout
		}
	}});
	dojo.addClass(menu.domNode,"lotusActionMenu");
	var commomAttrs = getCommonCMenuConfig();
	window["pe"].commonItems = createCMItems(editor, commomAttrs, dirAttr);
	if(window["pe"].commonItems)
	{
		var length = window["pe"].commonItems.length;
		for(var i = 0; i < length; i++)
			menu.addChild(window["pe"].commonItems[i]);
		if (length > 0)
			menu.addChild(new dijit.MenuSeparator());
	}
	var cellAttrs = getCellCMenuConfig();
	window["pe"].cellMenu = createCMItems(editor, cellAttrs, dirAttr);
	var rowAttrs = getRowCMenuConfig();
	window["pe"].rowMenu = createCMItems(editor, rowAttrs, dirAttr);
	var colAttrs = getColCMenuConfig();
	window["pe"].colMenu = createCMItems(editor, colAttrs, dirAttr);
	var chartAttrs = getChartCMenuConfig();
	window["pe"].chartMenu = createCMItems(editor, chartAttrs, dirAttr);
	var imageAttrs = getImageCMenuConfig();
	window["pe"].imageMenu = createCMItems(editor, imageAttrs, dirAttr);
	
	// for memory release
	var sw = editor.getWorksheetContainer()._supportingWidgets;
	sw = sw.concat(window["pe"].cellMenu);
	sw = sw.concat(window["pe"].rowMenu);
	sw = sw.concat(window["pe"].colMenu);
	sw = sw.concat(window["pe"].chartMenu);
	sw = sw.concat(window["pe"].imageMenu);
	sw.push(menu);
	editor.getWorksheetContainer()._supportingWidgets = sw;
	
	menu.startup();
},

/**
 * verify if the toolbar button/menu item should show in current mode, return true means should show the button
 */
_showInCurrMode = function(scene, widget, isSheetProtected, isDocumentProtected){
	//protectMODE has defined, it is only allow return false if the configuration is disable 
	if((isSheetProtected || isDocumentProtected) && widget.protectMODE != undefined){
		if(isSheetProtected && (widget.protectMODE & websheet.Constant.ProtectVisible.SHEETPROTECTINVISIBLE)){
			return false;
		}	
		if(isDocumentProtected && (widget.protectMODE & websheet.Constant.ProtectVisible.WORKBOOKPROTECTINVISIBLE)){
			return false;
		}
	}
	if(widget.showMODE ==undefined) return true;
	var MODE = websheet.Constant.ModeVisible;
	if(scene.isObserverMode())
		return (widget.showMODE & MODE.OBSERVERMODEVISIBLE) == MODE.OBSERVERMODEVISIBLE;	
	
	if(scene.isViewDraftMode())
		return (widget.showMODE & MODE.VIEWDRAFTMODEVISIBLE) == MODE.VIEWDRAFTMODEVISIBLE;
	
	if(scene.isHTMLViewMode()) {
		var invisible = widget.showMODE & MODE.HTMLVIEWINVISIBLE;
		if (invisible == MODE.HTMLVIEWINVISIBLE) return false;
		return (widget.showMODE & MODE.VIEWDRAFTMODEVISIBLE) == MODE.VIEWDRAFTMODEVISIBLE;
	}

	// Edit mode
	return (widget.showMODE & MODE.EDITMODEVISIBLE) ==  MODE.EDITMODEVISIBLE;
},

customizeSheetContextMenu = function(editor, sheetName) {
	if(editor.hasACLHandler())
	{
		var bhChecker = editor.getACLHandler()._behaviorCheckHandler;
		var canEditSheet = bhChecker.canEditSheet(sheetName);

		var configs = getSheetCMenuConfig();
		var len = configs.length;
		for(var i = 0; i < len; i++)
		{
			var widget = configs[i];
			var menuitem = dijit.registry.byId(widget.id);	
			if(menuitem)
			{
				if(!canEditSheet && !widget.aclMODE)
					menuitem.set('disabled',true);
			}
		}
	}	
	
	// if sheet is protected, then disable protect sheet menuItem
	var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
	if(isSheetProtected)
	{
		var menuitem = dijit.registry.byId("S_CM_ACL_Sheet");
		if(menuitem)
			menuitem.set('disabled',true);
	}
},


customizeContextMenu = function(scene){
	var config = new Array();
	config = config.concat(getSheetCMenuConfig());
	config = config.concat(getCommonCMenuConfig());
	config = config.concat(getCellCMenuConfig());
	config = config.concat(getRowCMenuConfig());
	config = config.concat(getColCMenuConfig());
	config = config.concat(getImageCMenuConfig());

	var isDocumentProtected = websheet.model.ModelHelper.isDocumentProtected();
	var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
	var length = config.length;
	for(var i = 0; i < length; i++){
		var widget = config[i];
		var menuitem = dijit.registry.byId(widget.id);	
		if(menuitem){
			var disable = widget.disabled || !_showInCurrMode(scene, widget, isSheetProtected, isDocumentProtected);
			menuitem.set('disabled',disable);
		}
	}
},

customizeToolbar = function(scene, mode, toolbar) {	
 	if (mode == null && mode == undefined) {
		mode = websheet.Constant.ToolbarMode.ALL;
	}
	var preGroup = null;
	var widgets = getToolbarConfig();
	var tb = toolbar;
	if (!tb) return;
	var isDocumentProtected = websheet.model.ModelHelper.isDocumentProtected();
	var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
	dojo.forEach(widgets, function(widget) {
		if(widget.mode & mode) {
			var btn = dijit.registry.byId(widget.id);	
			if(btn){
				if(_showInCurrMode(scene, widget, isSheetProtected, isDocumentProtected)){
					tb.disableToolbarById(widget.id, false);
					// btn.set('disabled', false);
				}else{
					tb.disableToolbarById(widget.id, true);
					// btn.set('disabled', true);					
				}
			}
		}
	});
},

createToolbar = function(scene, node, _toolbar, mode,toolbarId) {
	var toolbar;
	var widgets;
	if(toolbarId == "S_t_border"){
		toolbar = new dijit.Toolbar({ id: "S_t_border" });
		dijit.setWaiState(toolbar.domNode, "label", dojo.i18n.getLocalization("websheet","base").ACC_BORDER_TYPE);
		widgets = getCellBorderToolbarConfig();
	} else if(toolbarId == "S_t_BorderStyle"){
		toolbar = new dijit.Toolbar({ id: "S_t_BorderStyle" });
		dijit.setWaiState(toolbar.domNode, "label", dojo.i18n.getLocalization("websheet","base").ACC_BORDER_STYLE);
		widgets = getCellBorderStyleToolbarConfig();
	}else{
		toolbar = new dijit.Toolbar({ id: "S_t" });
		dijit.setWaiState(toolbar.domNode, "label", dojo.i18n.getLocalization("websheet","base").acc_toolbarLabel);
		widgets = getToolbarConfig();
	}
	
 	if (mode == null && mode == undefined) {
		mode = websheet.Constant.ToolbarMode.ALL;
	}
	var preGroup = null;	 
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	dojo.forEach(widgets, function(widget) {
		if(widget.mode & mode) {
			if(_showInCurrMode(scene, widget)){
				var curGroup = widget.group;
				if (!preGroup) {
					preGroup = curGroup;	
				}
				if (preGroup != curGroup) {
					toolbar.addChild(new dijit.ToolbarSeparator());
					preGroup = curGroup;
				}
				if(widget.type == websheet.Constant.ToolbarType.BUTTON) {
					var isShow = true;
					if(dojo.hasClass(dojo.body(), "dijit_a11y")){
						if(widget.showUnderHighContrast !== undefined)
						isShow = widget.showUnderHighContrast;			
					}
					if(isShow){
						var label = widget.label ? widget.label : "";
						var showLabel = widget.showLabel ? widget.showLabel : false;
						var title = widget.title ? widget.title : "";
						var icon = widget.iconClass ? widget.iconClass : "";
						toolbar.addChild(new dijit.form.Button({
							id:widget.id,
							title:title,
							accelKey: widget.accelKey,
							iconClass: icon,
						    label:label,
						    showLabel:showLabel,
						    value:title,
					        disabled: widget.disabled || false
					    }));
					}
				}
				else if(widget.type == websheet.Constant.ToolbarType.TOGGLEBUTTON) {
					var isShow = true;
					if(dojo.hasClass(dojo.body(), "dijit_a11y")){
						if(widget.showUnderHighContrast !== undefined)
						isShow = widget.showUnderHighContrast;			
					}
					if(isShow){
						var label = widget.label ? widget.label : "";
						var showLabel = widget.showLabel ? widget.showLabel : false;
						var title = widget.title ? widget.title : "";
						var icon = widget.iconClass ? widget.iconClass : "";
						toolbar.addChild(new dijit.form.ToggleButton({
							id:widget.id,
							accelKey: widget.accelKey,
							title:widget.title,
					        iconClass: icon,
					        label:label,
					        showLabel:showLabel,
					        value:title,
					        disabled: widget.disabled || false
					    }));
					}
				}
				else if(widget.type == websheet.Constant.ToolbarType.DROPDOWNBUTTON) {
					var isShow = true;
					if(dojo.hasClass(dojo.body(), "dijit_a11y")){
						if(widget.showUnderHighContrast !== undefined)
						isShow = widget.showUnderHighContrast;			
					}
					if(isShow){
						var dropDownWidget = widget.dropDown;
						if (!widget.dropDown) {
							dropDownWidget = this.createDropDown(scene, widget.id);
						}
						var label = widget.label ? widget.label : "";
						var showLabel = widget.showLabel ? widget.showLabel : false;
						var title = widget.title ? widget.title : "";
						var icon = widget.iconClass ? widget.iconClass : "", dbwidget = null;
						//with dropDown as string, rather than a menu or other widget
						toolbar.addChild(dbwidget = new websheet.widget.DropDownButton({
					    	id:widget.id,
							iconClass:icon,
							accelKey: widget.accelKey,
					    	title:title,
					    	label:label,
					    	showLabel:showLabel,
					    	value:title,
					        dropDown:dropDownWidget,
					        methodName:widget.methodName,
					        focusMethod:widget.focusMethod,
					        toolbar: _toolbar,
					        dir: dirAttr
					    }));
						//JAWS will read out the given label, otherwise the "labelledby" element text nodes and 
						//title will be read out, which will be unintelligible.
						//defect:15754 [A11Y][Web 4.1b][JAWS] Reading issues on tool bar.
						dijit.removeWaiState(dbwidget.focusNode, "labelledby");
						dijit.setWaiState(dbwidget.focusNode, "label", title);
					}
				}
			}
		}
	});
	
    _toolbar.postCreate();
    toolbar.placeAt(node);
    toolbar.startup();
    var settings = window["pe"].settings;
    if (settings && settings.getToolbar() == settings.TOOLBAR_NONE) {
    	_toolbar.toggle(true);
    }else if(scene.isViewMode() || scene.compactEditMode){//hide Toolbar under view mode or compactedit mode 
    	_toolbar.toggle(true);
    }
    
	if(toolbar.id == "S_t")
	{
		dojo.forEach(toolbar.getChildren(), function(w){
			dojo.connect(w, "focus", function(){
				// #30610
				var tb = dijit.getEnclosingWidget(this.domNode.parentNode);
				if(tb) 
					tb._set("focusedChild", this);
			});
			if(w && w.titleNode)
			{
				var title = w.titleNode.title;
				if(title)
				{
					w.tooltip = new websheet.widget.MenuTooltip({
						widget: w
					});
					w._setTitleAttr = function(/*Boolean*/ value){
						this._set("title", value);
					},
					w.tooltip.setTitleAck(title, w.accelKey);
					w.titleNode.title = "";
					w.title = "";
					w.watch("title", function(name, oldValue, value){
						if(this.tooltip && value)
						{
							this.tooltip.setTitleAck(value, this.accelKey);
						}
						setTimeout(dojo.hitch(this, function(){
							this.titleNode.title = "";
						}), 10);
					});
				}
			}
		});
	}
},

_createSubMenu = function(scene, node, sub, dirAttr){
	if(!node._focusFirstUpdated)
	{
		var focusFirstChildMethod = node.focusFirstChild;
		node.focusFirstChild = function()
		{
			dojo.forEach(this.getChildren(), function(c){
				c && c._setSelected && c._setSelected(false);
			});
			focusFirstChildMethod.apply(this, arguments);
		};
		node._focusFirstUpdated = true;
	}
	dojo.forEach(sub, function(widget) {
		var isShow = widget.isShow  != undefined ? widget.isShow: true;
		if(!BidiUtils.isBidiOn() && (widget.id === 'S_m_Direction' || widget.id === 'S_m_MirrorSheet')) {
			isShow = false;
		}
		var _mItem = null;
		if(isShow && _showInCurrMode(scene, widget)){
			if(widget.type == websheet.Constant.MenuBarType.POPUPMENU) {
				var popupMenu;
				if(widget.popupMethod){
					var param = {id:widget.id};
					if(widget.label)
						param.label = widget.label;
					if(widget.templateString)
						param.templateString = widget.templateString;
					popupMenu = widget.popupMethod(param);
				}else{
					popupMenu = new dijit.Menu({ id: widget.id, dir: dirAttr});
					dojo.addClass(popupMenu.domNode,"lotusActionMenu");
				    dijit.setWaiState(popupMenu.domNode, "label", widget.label);
				    dojo.addClass(popupMenu.domNode,widget.cssClass);
				    _createSubMenu(scene, popupMenu, widget.sub, dirAttr);
				}
				var popupMenuItem = new dijit.PopupMenuItem({
						label: widget.label,
						id: widget.pid,
						popup: popupMenu,
						dir: dirAttr
				    });
				if(widget.variable){
					if(widget.varIsMenu){
						pe[widget.variable] = popupMenu;
					}else{
						pe[widget.variable] = popupMenuItem;
					}
				}
				if(widget.event){
					dojo.forEach(widget.event, function(e){
						 dojo.connect(popupMenu, e.eventName, dojo.hitch(this, e.eventFunc));
					});
				}
				dijit.setWaiState(popupMenuItem.domNode, "label", widget.accLabel? widget.accLabel: widget.label);
				dojo.style(popupMenuItem.arrowWrapper, 'visibility', '');
				node.addChild(popupMenuItem);
			}
			else if(widget.type == websheet.Constant.MenuBarType.MENUITEM) {
				var param={
					    label: widget.label,
						disabled: widget.disable? widget.disable: false,
						id:  widget.id,
					    onClick: function(){
					    	if(widget.privatecommand)
					    		widget.privatecommand();
					        else
					        	scene.editor.execCommand(widget.command);
					    },
					    dir: dirAttr
				};
				if(widget.accelKey)
					param.accelKey = widget.accelKey;
				if(widget.iconClass)
					param.iconClass = widget.iconClass;
				if(widget.variable){
					if(widget.checkedMenuItem){
						param.checked = widget.checked? true:false;
						node.addChild(_mItem = pe[widget.variable] = new dijit.CheckedMenuItem(param));
					}
					else{
						node.addChild(_mItem = pe[widget.variable] = new dijit.MenuItem(param));
						if(widget.accLabel){
							dijit.removeWaiState(pe[widget.variable].domNode, "labelledby");
						    dijit.setWaiState(pe[widget.variable].domNode, "label",widget.accLabel);	     
						}else
							dijit.setWaiState(pe[widget.variable].domNode, "labelledby", pe[widget.variable].containerNode.id);
					}
				}else{
					if(widget.checkedMenuItem){							
						param.checked = widget.checked? true:false;							
						node.addChild(_mItem = new dijit.CheckedMenuItem(param));
					}
					else
						node.addChild(_mItem = new dijit.MenuItem(param) );
					if(widget.accLabel){
						dijit.removeWaiState(_mItem.domNode, "labelledby");
					    dijit.setWaiState(_mItem.domNode, "label",widget.accLabel);
					}else
						dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
				}
				if(widget.style)
				{
					var children = node.getChildren();
					var addedMenuItem = children[children.length - 1];
					dojo.style(addedMenuItem.containerNode, widget.style);
				}
//				if(_mItem && widget.id == "S_i_ACL")
//				{
//					_mItem.accelKeyNode.style.display = "";
//					var betaDiv = dojo.create("span",{innerHTML:"BETA"},_mItem.accelKeyNode);
//					dojo.addClass(betaDiv,"aclBetaLabel");
//					_mItem.domNode.lastElementChild.style.display = "none";
//				}
				if(widget.tooltip && _mItem) {
					//
					var w = _mItem;
					w.tooltip = new websheet.widget.MenuTooltip({
				        widget: w,
				        ownerDocument: this.ownerDocument,
				        _focusManager: this._focusManager,
				        position: [widget.tooltip.pos]
					});
					w.connect(w, "uninitialize", function() {
						this.tooltip && this.tooltip.destroy();
					});
					w.tooltip.setTitleAck(widget.tooltip.tip, "");
				}
			}
			else if(widget.type == websheet.Constant.MenuBarType.MENUSEPORATOR) {
				node.addChild(new dijit.MenuSeparator());
			}
		}
	});
},

_customizeSubMenu = function(scene, sub, disable){
	dojo.forEach(sub, function(widget) {
		var isShow = widget.isShow != undefined ? widget.isShow: true;
		var isDocumentProtected = websheet.model.ModelHelper.isDocumentProtected();
		var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
		if(isShow){			
			if(widget.type == websheet.Constant.MenuBarType.POPUPMENU) {
				popupMenu = dijit.registry.byId(widget.id);
				if(popupMenu){
					var d = disable ? disable : !_showInCurrMode(scene, widget, isSheetProtected, isDocumentProtected);						
					_customizeSubMenu(scene, widget.sub, d);
				}						
			}
			else if(widget.type == websheet.Constant.MenuBarType.MENUITEM) {				
				var menuitem = dijit.registry.byId(widget.id);	
				var dis = disable || widget.disabled;
				if(menuitem){
					if(dis)
						window["pe"].menuItemDisabled(menuitem, true);
					else
						window["pe"].menuItemDisabled(menuitem, _showInCurrMode (scene, widget, isSheetProtected, isDocumentProtected)? false : true);
				}
			}
		}		
	});
},

customizeMenubar = function(scene){	
	    var widgets = getMenubarConfig(scene);
	    var isDocumentProtected = websheet.model.ModelHelper.isDocumentProtected();
		var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
		dojo.forEach(widgets, function(widget) {			
			var popupmenubar = dijit.registry.byId(widget.id);	
			if(popupmenubar){
				if(!_showInCurrMode(scene, widget, isSheetProtected, isDocumentProtected)){
					_customizeSubMenu(scene, widget.sub, true);	
				}else
					_customizeSubMenu(scene, widget.sub);	
			}
		}); 
		// the menus below is not in menu configuration, need solve them seperately
		customizeNumberFormatMenuItems(scene, isSheetProtected);
		customizeFontsMenu(scene, isSheetProtected);
		customizeSpellCheckDics(scene, isSheetProtected);
},

createMenubar = function(scene, node){
	dojo.require('dijit.MenuBar');
    dojo.require('dijit.MenuBarItem');
    dojo.require('dijit.PopupMenuBarItem');
    dojo.require('dijit.Menu');
    dojo.require('dijit.MenuItem');
    dojo.require('dijit.PopupMenuItem');
    var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
    var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
	window["pe"].quickFormulas = quickFormulas;
    // cache menu item state for performance improvement,
    // don't use attr to change menu item status if its status keeps unchanged.
    // recommend to use this method to change menu item status.
    window["pe"].menuItemState = {};
	window["pe"].menuItemDisabled = function(menuitem, disabled ){
		if(!menuitem) return;
		if(window["pe"].menuItemState[menuitem.id] === disabled)
			return;
		
		window["pe"].menuItemState[menuitem.id]= disabled;
		//menuitem.setDisabled(bDisabled);
		menuitem.attr('disabled',disabled);
	};

    var menubar = new dijit.MenuBar({ id: "S_m", dir: dirAttr, _onContainerFocus: function(){
    	this.domNode.focus();
    	if(this.focusedChild)
    	{
    		try{
	    		if(this.focusedChild.popup)
	    			dijit.popup.close(this.focusedChild.popup);
	    		this.focusedChild._setSelected(false);
	    		this.focusedChild = null;
    		}catch(e){}
    	}
    }});
    menubar.domNode.style.outline = "none";
    dojo.addClass(menubar.domNode,"lotusActionMenu");
    websheet.Utils.setSelectable(dojo.byId(node), false);
    var widgets = getMenubarConfig(scene);
	dojo.forEach(widgets, function(widget) {
		var isShow = widget.isShow  != undefined ? widget.isShow: true;
		if(isShow && _showInCurrMode(scene, widget)){			
			if(widget.type == websheet.Constant.MenuBarType.POPUPMENUBAR) {				
				var popupmenubar = new dijit.Menu({ id:  widget.id, dir: dirAttr });
				dojo.addClass(popupmenubar.domNode,"lotusActionMenu");					
				dojo.addClass(popupmenubar.domNode,widget.cssClass);				
				dijit.setWaiState(popupmenubar.domNode, "label", widget.accLabel? widget.accLabel: widget.label);			
				
				_createSubMenu(scene, popupmenubar, widget.sub, dirAttr);
				menubar.addChild(new dijit.PopupMenuBarItem({
			        label: widget.label,
			        id: widget.pid,
			        popup: popupmenubar
			    }));
			  
			  if(widget.event){
					dojo.forEach(widget.event, function(e){
						 dojo.connect(popupmenubar, e.eventName, dojo.hitch(this, e.eventFunc,e.eventArgs));
					});
			  }
			}			
		}
	}); 
	
	// init Menubar according to global settings.    
	var bSocialAssignment = websheet.Utils.isSocialEnabled();
	var settings = window["pe"].settings;
    if(settings)    
    {
    	 if (bSocialAssignment && settings.getAssignment() && window["pe"].assignmentsMenuItem)
    	 {
	    	 window["pe"].assignmentsMenuItem.attr("checked", true);
    	 }
    	 
    	 if( settings.getSidebar() == settings.SIDEBAR_COLLAPSE && window["pe"].sidebarMenuItem )
    	 {    	 
    	   window["pe"].sidebarMenuItem.attr("checked", false);
    	 }
    	 
    	 if (settings.getFormula() == false && window["pe"].FormulaBarMenuItem) {
    	 	window["pe"].FormulaBarMenuItem.attr("checked", false);
    	 }
    	 
    	 if (settings.getToolbar() == settings.TOOLBAR_NONE && window["pe"].toolbarMenuItem) {
    	 	window["pe"].toolbarMenuItem.attr("checked", false);
    	 }
    }    
	
	menubar.placeAt(node);
	menubar.startup();

    if( settings && !settings.getMenubar() )
    	menubar.domNode.style.display = "none";
};

var formatItem = {		
		NumberFormat2 : {
			cat: "number",
			code: "#,##0",
			clr: ""
		},
		NumberFormat3 : {
			cat: "number",
			code: "#,##0.00",
			clr: ""
		},
		CurrencyFormat1 : {
			cat: "currency",
			code: "#,##0",
			clr: ""
		},
		CurrencyFormat2 : {
			cat: "currency",
			code: "#,##0.00",
			clr: ""
		},
		PercentFormat1 : {
			cat: "percent",
			code: "0%",
			clr: ""
		},
		PercentFormat2 : {
			cat: "percent",
			code: "0.00%",
			clr: ""
		},
		DateFormat1 : {
			cat: "date",
			code: "short",
			clr: ""
		},
		DateFormat2 : {
			cat: "date",
			code: "medium",
			clr: ""
		},
		TimeFormat1 : {
			cat: "date",
			code: "dateTimeShort",
			clr: ""
		},
		TimeFormat2 : {
			cat: "time",
			code: "short",
			clr: ""
		},
		TimeFormat4 : {
			cat: "time",
			code: "Hm",
			clr: ""
		},
		Text : {
			cat: "text",
			code: "@",
			clr: ""
		}
};

var MoreCurrency = {
	/*Argentina (Pesos)                                              */  ARS: { cat: "currency", code: "#,##0.00", cur: "ARS", clr: "" },
	/*Australia (Dollars)                                            */  AUD: { cat: "currency", code: "#,##0.00", cur: "AUD", clr: "" },
	/*Austria, Belgium, Finland, France, ..., Slovenia, Spain (Euro) */  EUR: { cat: "currency", code: "#,##0.00", cur: "EUR", clr: "" },
	/*Bulgaria (Leva)                                                */  BGN: { cat: "currency", code: "#,##0.00", cur: "BGN", clr: "" },
	/*Bolivia (Bolivianos)                                           */  BOB: { cat: "currency", code: "#,##0.00", cur: "BOB", clr: "" },
	/*Brazil (Reais)                                                 */  BRL: { cat: "currency", code: "#,##0.00", cur: "BRL", clr: "" },
	/*Canada (Dollars)                                               */  CAD: { cat: "currency", code: "#,##0.00", cur: "CAD", clr: "" },
	/*China (Yuan Renminbi)                                          */  CNY: { cat: "currency", code: "#,##0.00", cur: "CNY", clr: "" },
	/*Chile (Pesos)                                                  */  CLP: { cat: "currency", code: "#,##0.00", cur: "CLP", clr: "" },
	/*Costa Rica (Colon)                                             */  CRC: { cat: "currency", code: "#,##0.00", cur: "CRC", clr: "" },
	/*Colombia (Pesos)                                               */  COP: { cat: "currency", code: "#,##0.00", cur: "COP", clr: "" },
	/*Croatia (Kuna)                                                 */  HRK: { cat: "currency", code: "#,##0.00", cur: "HRK", clr: "" },
	/*Czech Republic (Koruny)                                        */  CZK: { cat: "currency", code: "#,##0.00", cur: "CZK", clr: "" },
	/*Denmark (Kroner)                                               */  DKK: { cat: "currency", code: "#,##0.00", cur: "DKK", clr: "" },
	/*Dominican Republic (Pesos)                                     */  DOP: { cat: "currency", code: "#,##0.00", cur: "DOP", clr: "" },
	/*Ecuador, Puerto Rico,  United States of America (U.S. Dollars) */  USD: { cat: "currency", code: "#,##0.00", cur: "USD", clr: "" },
	/*Egypt (Pounds)                                                 */  EGP: { cat: "currency", code: "#,##0.00", cur: "EGP", clr: "" },
	/*El Salvador (Colones)                                          */  SVC: { cat: "currency", code: "#,##0.00", cur: "SVC", clr: "" },
	/*England, United Kingdom (Pounds)                               */  GBP: { cat: "currency", code: "#,##0.00", cur: "GBP", clr: "" },
	/*Hong Kong (Dollars)                                            */  HKD: { cat: "currency", code: "#,##0.00", cur: "HKD", clr: "" },
	/*HuUngary (Forint)                                              */  HUF: { cat: "currency", code: "#,##0.00", cur: "HUF", clr: "" },
	/*India (Rupees)                                                 */  INR: { cat: "currency", code: "#,##0.00", cur: "INR", clr: "" },
	/*Indonesia (Rupiahs)                                            */  IDR: { cat: "currency", code: "#,##0.00", cur: "IDR", clr: "" },
	/*Israel (New Shekels)                                           */  ILS: { cat: "currency", code: "#,##0.00", cur: "ILS", clr: "" },
	/*Japan (Yen)                                                    */  JPY: { cat: "currency", code: "#,##0.00", cur: "JPY", clr: "" },
	/*Korea, South (Won)                                             */  KRW: { cat: "currency", code: "#,##0.00", cur: "KRW", clr: "" },
	/*Kazakhstan (Tenges)                                            */  KZT: { cat: "currency", code: "#,##0.00", cur: "KZT", clr: "" },
	/*Malaysia (Ringgits)                                            */  MYR: { cat: "currency", code: "#,##0.00", cur: "MYR", clr: "" },
	/*Mexico (Pesos)                                                 */  MXN: { cat: "currency", code: "#,##0.00", cur: "MXN", clr: "" },
	/*Morocco (dirham)                                               */  MAD: { cat: "currency", code: "#,##0.00", cur: "MAD", clr: "" },
	/*New Zealand (Dollars)                                          */  NZD: { cat: "currency", code: "#,##0.00", cur: "NZD", clr: "" },
	/*Norway (Krone)                                                 */  NOK: { cat: "currency", code: "#,##0.00", cur: "NOK", clr: "" },
	/*Panama (Balboa)                                                */  PAB: { cat: "currency", code: "#,##0.00", cur: "PAB", clr: "" },
	/*Pakistan (Rupees)                                              */  PKR: { cat: "currency", code: "#,##0.00", cur: "PKR", clr: "" },
	/*Paraguay (Guarani)                                             */  PYG: { cat: "currency", code: "#,##0.00", cur: "PYG", clr: "" },
	/*Peru (Nuevos Soles)                                            */  PEN: { cat: "currency", code: "#,##0.00", cur: "PEN", clr: "" },
	/*Philippines (Pesos)                                            */  PHP: { cat: "currency", code: "#,##0.00", cur: "PHP", clr: "" },
	/*Poland (Zlotych)                                               */  PLN: { cat: "currency", code: "#,##0.00", cur: "PLN", clr: "" },
	/*Romania (New Lei)                                              */  RON: { cat: "currency", code: "#,##0.00", cur: "RON", clr: "" },
	/*Russia (Rubles)                                                */  RUB: { cat: "currency", code: "#,##0.00", cur: "RUB", clr: "" },
	/*Serbian (Cyrillic),  Serbian (Latin)							 */  RSD: { cat: "currency", code: "#,##0.00", cur: "RSD", clr: "" },
	/*Saudi Arabia (Riyals)                                          */  SAR: { cat: "currency", code: "#,##0.00", cur: "SAR", clr: "" },
	/*Singapore (Dollars)                                            */  SGD: { cat: "currency", code: "#,##0.00", cur: "SGD", clr: "" },
	/*South Africa (Rand)                                            */  ZAR: { cat: "currency", code: "#,##0.00", cur: "ZAR", clr: "" },
	/*Switzerland (Francs)                                           */  CHF: { cat: "currency", code: "#,##0.00", cur: "CHF", clr: "" },
	/*Sweden (Kronor)                                                */  SEK: { cat: "currency", code: "#,##0.00", cur: "SEK", clr: "" },
	/*Taiwan (New Dollars)                                           */  TWD: { cat: "currency", code: "#,##0.00", cur: "TWD", clr: "" },
	/*Thailand (Baht)                                                */  THB: { cat: "currency", code: "#,##0.00", cur: "THB", clr: "" },
	/*Turkey (Lira)                                                  */  TRY: { cat: "currency", code: "#,##0.00", cur: "TRY", clr: "" },
	/*United Arab Emirates (Dirham)                                  */  AED: { cat: "currency", code: "#,##0.00", cur: "AED", clr: "" },
	/*Uruguay (Pesos)                                                */  UYU: { cat: "currency", code: "#,##0.00", cur: "UYU", clr: "" },
	/*Venezuela (Bolivares Fuertes)                                  */  VEF: { cat: "currency", code: "#,##0.00", cur: "VEF", clr: "" },
	/*Vietnam (Dong)                                                 */  VND: { cat: "currency", code: "#,##0.00", cur: "VND", clr: "" }
};

var MoreDate = {
		DateFull : {
			cat: "date",
			code: "full",
			clr: ""
		},
		DateyMMM : {
			cat: "date",
			code: "yMMM",
			clr: ""
		},
		DateMMMd : {
			cat: "date",
			code: "MMMd",
			clr: ""
		},
		TimeMedium : {
			cat: "time",
			code: "medium",
			clr: ""
		},
		TimeHms: {
			cat: "time",
			code: "Hms",
			clr: ""
		},
		TimeLong : {
			cat: "time",
			code: "long",
			clr: ""
		}
};

var numberItem = [];
var currencyItem = [];
var percentItem = [];
var dateItem = [];
var timeItem = [];
var textItem = [];
var moreDateItem = [];
var numberFormatArray = [];

window["bNumberFormatted"] = false;
//Create the number format Item such as 1,000 1,000.00 $1,000 $1,000.00 10% 10.12% 9/26/2008 15:59:00...
createFormatItem = function(){	
	var showString = "1234";
	var percentShowString = "0.1234";
	var dateShowString = "36667.5627";
	var uniqueDateMap={};
	var formatter = websheet.i18n.Number;
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	for(var format in formatItem){
		var formatIt = formatItem[format];
		var formatType = formatter.getFormatType(formatIt[websheet.Constant.Style.FORMATTYPE]);
		switch (formatType)
		{
		case formatter.FormatType["NUMBER"]:
			var item = { label:formatter.formatNumber(showString, formatIt), key:format };
			numberItem.push(item);
			break;
		case formatter.FormatType["CURRENCY"]:
			var item = { label:formatter.formatCurrency(showString, formatIt, true), key:format };
			currencyItem.push(item);
			break;
		case formatter.FormatType["PERCENT"]:
			var item = { label:formatter.formatPercent(percentShowString, formatIt), key:format };
			percentItem.push(item);
			break;
		case formatter.FormatType["DATE"]:
		var formatDateStr=formatter.formatDate(dateShowString, formatIt);
			if (BidiUtils.isGuiRtl())
				formatDateStr = BidiUtils.removeUCC(formatDateStr);
			if(!uniqueDateMap[formatDateStr]){
				var item = { label:formatDateStr, key:format };
				dateItem.push(item);
				uniqueDateMap[formatDateStr]=true;			
			}
			break;
		case formatter.FormatType["TIME"]:
		var formatDateStr=formatter.formatTime(dateShowString, formatIt);
			if(!uniqueDateMap[formatDateStr]){
				var item = { label:formatDateStr, key:format };
				timeItem.push(item);
				uniqueDateMap[formatDateStr]=true;			
			}
			break;
		case formatter.FormatType["TEXT"]:
			var item = { label:nls.TEXT, key:format };
			textItem.push(item);
			break;
		default:
			break;
		}
	}
};

createDateItem = function(scene){
	var showString = "36667.5627";
	var uniqueDateMap={};
	var formatter = websheet.i18n.Number;
	var wcs = websheet.Constant.Style;
	for(var date in MoreDate){
		var dateIt = MoreDate[date];
		if(dateIt[wcs.FORMATCODE] == "yMMM"){ //for defect 14115, remove "yMMM" date format for Russian
			var locale = scene.getLocale();
			if(locale && ((locale.indexOf("ru") >= 0) || (locale.indexOf("kk") >= 0)))
				continue;
		}
		if(dateIt[wcs.FORMATCODE] == "MMMd"){
			var locale = scene.getLocale();
			if(locale && (locale.indexOf("kk") >= 0))
				continue;
		}
		var formatDateStr=(dateIt[wcs.FORMATTYPE] == "date")?formatter.formatDate(showString, dateIt):formatter.formatTime(showString, dateIt);
		if(!uniqueDateMap[formatDateStr]){
			var item = { label: formatDateStr, key:date, tip:dateIt[wcs.FORMATTYPE].toUpperCase() };
			moreDateItem.push(item);			
			uniqueDateMap[formatDateStr]=true;
		}
	}
};

var quickFormulas = ["SUM","AVERAGE","COUNT","MAX","MIN"];
createDropDown = function(scene, id)
{
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	if("S_t_FontName" == id)
	{
		var fontNameMenu = new dijit.Menu({
			id: "S_m_FontName_toolbar",
			dir: dirAttr
		});
		dojo.addClass(fontNameMenu.domNode,"lotusActionMenu toolbarMenu");
		var fonts = concord.editor.PopularFonts.getLangSpecFontArray();
		var _mItem = null;
		for (var i = 0; i < fonts.length; ++i) {
			var label = fonts[i];
			var id = "S_i_FONT_" + label.replace(/ /g,"_") + "_toolbar";	
			fontNameMenu.addChild(_mItem = new dijit.CheckedMenuItem({
		    	id: id,
		        label: label,
		        style: {fontFamily: label},
		        onClick: function()
		        {
		        	scene.editor.execCommand(commandOperate.FONT, [this.label]);
		        },
		        dir: dirAttr
		    }));
			dijit.setWaiState(_mItem.domNode, "labelledby", _mItem.containerNode.id);
		}
	    return fontNameMenu;
	}
	if("S_t_FontSize" == id)
	{
		var fontSizeMenu = new dijit.Menu({
			id: "S_m_FontSize",
			dir: dirAttr
		});
		dojo.addClass(fontSizeMenu.domNode,"lotusActionMenu toolbarMenu");
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Eight",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("8") : "8"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Nine",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("9") : "9"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Ten",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("10") : "10"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Eleven",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("11") : "11"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Twelve",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("12") : "12"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Fourteen",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("14") : "14"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Sixteen",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("16") : "16"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Eighteen",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("18") : "18"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_Twenty",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("20") : "20"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_TwentyTwo",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("22") : "22"
	    }));
	    fontSizeMenu.addChild(new dijit.CheckedMenuItem({
	    	id:"S_i_TwentyFour",
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("24") : "24"
	    }));
	    return fontSizeMenu;
	}
	else if("S_m_NumberDropDown" == id)
	{
		var menu = dijit.byId("S_m_NumberDropDown");
		if(menu)
		{
			menu.destroyRecursive();
		}	
		menu = new dijit.Menu({ id: "S_m_NumberDropDown", dir: dirAttr });
		dojo.addClass(menu.domNode,"lotusActionMenu toolbarMenu");
		var items = populateNumberFormatMenuItems(scene, /* use for dropdown menu */ true, menu);
		dojo.forEach(items, function(item) {
			this.addChild(item);
		}, menu);
	    
	    return menu;
	}
	else if("S_m_QuickFormula" == id)
	{
		var quickFormulaMenu = new dijit.Menu({ id:"S_m_QuickFormula", dir: dirAttr });
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		dojo.addClass(quickFormulaMenu.domNode,"lotusActionMenu toolbarMenu");
		window["pe"].quickFormulaSum = new dijit.MenuItem({
	    		id:"S_i_QuickFormula" + window["pe"].quickFormulas[0],
	        	label: websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[0]).toUpperCase(),
	        	dir: dirAttr
			});
		quickFormulaMenu.addChild(window["pe"].quickFormulaSum);
		window["pe"].quickFormulaAvg = new dijit.MenuItem({
	    		id:"S_i_QuickFormula" + window["pe"].quickFormulas[1],
	        	label:websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[1]).toUpperCase(),
	        	dir: dirAttr
			});
		quickFormulaMenu.addChild(window["pe"].quickFormulaAvg);
		
		window["pe"].quickFormulaCount = new dijit.MenuItem({
    		id:"S_i_QuickFormula" + window["pe"].quickFormulas[2],
    	 	label:websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[2]).toUpperCase(),
    	 	dir: dirAttr
		});
		quickFormulaMenu.addChild(window["pe"].quickFormulaCount);
		
		window["pe"].quickFormulaMax = new dijit.MenuItem({
    		id:"S_i_QuickFormula" + window["pe"].quickFormulas[3],
        	label :websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[3]).toUpperCase(),
        	dir: dirAttr
		});
		quickFormulaMenu.addChild(window["pe"].quickFormulaMax);
		
		window["pe"].quickFormulaMin = new dijit.MenuItem({
    		id:"S_i_QuickFormula" + window["pe"].quickFormulas[4],
    		label :websheet.functions.FormulaTranslate.transFuncNameEn2Locale(window["pe"].quickFormulas[4]).toUpperCase(),
    		dir: dirAttr
		});
		quickFormulaMenu.addChild(window["pe"].quickFormulaMin);
		quickFormulaMenu.addChild(new dijit.MenuItem({
			label: menuStrs.insertMenu_FunctionMore,
			id: "S_m_QuickFormulaMore",
			onClick: function() {
				scene.editor.execCommand(commandOperate.ALLFORMULAS);
			},
			dir: dirAttr
		}));
	    return quickFormulaMenu;
	}
	else if ("S_t_InsertDeleteRow" == id)
	{
		var menu = new dijit.Menu({
			id: "S_m_InsertDeleteRowDropDown",
			dir: dirAttr
		});
		dojo.addClass(menu.domNode,"lotusActionMenu toolbarMenu");
		window["pe"].insertRowDropDown = new dijit.MenuItem({
	        label: nls.insertOrMoveRow_InsertAbove,
	        id: "S_i_InsertRowAboveDropDown",
	        onClick: function(){
	            scene.editor.execCommand(commandOperate.INSERTROW);
	        },
	        dir: dirAttr
		});
		menu.addChild(window["pe"].insertRowDropDown);
		
		window["pe"].insertRowBelowDropDown = new dijit.MenuItem({
	        label: nls.insertOrMoveRow_InsertBelow,
	        id: "S_i_InsertRowBelowDropDown",
	        onClick: function(){
	        	scene.editor.execCommand(commandOperate.INSERTROWBELOW);
	        },
	        dir: dirAttr
	    });
		menu.addChild(window["pe"].insertRowBelowDropDown);

	    window["pe"].deleteRowDropDown = new dijit.MenuItem({
	        label: nls.insertOrDelete_Delete,
	        id: "S_i_DeleteRowDropDown",
	        onClick: function(){
	            scene.editor.execCommand(commandOperate.DELETEROW);
	        },
	        dir: dirAttr
	    });
	    
	    menu.addChild(window["pe"].deleteRowDropDown);
	    
		return menu;
	}
	else if ("S_t_InsertDeleteCol" == id)
	{
		var menu = new dijit.Menu({
			id: "S_m_InsertDeleteColDropDown",
			dir: dirAttr
		});
		dojo.addClass(menu.domNode,"lotusActionMenu toolbarMenu");
		window["pe"].insertColumnDropDown = new dijit.MenuItem({
	        label: nls.insertOrMoveCol_InsertBefore,
	        id: "S_i_InsertColumnBeforeDropDown",
	        onClick: function(){
	            scene.editor.execCommand(commandOperate.INSERTCOLUMN);
	        },
	        dir: dirAttr
		});
		menu.addChild(window["pe"].insertColumnDropDown);
		
		window["pe"].insertColumnAfterDropDown = new dijit.MenuItem({
	        label: nls.insertOrMoveCol_InsertAfter,
	        id: "S_i_InsertColumnAfterDropDown",
	        onClick: function(){
	        	scene.editor.execCommand(commandOperate.INSERTCOLUMNAFTER);
	        },
	        dir: dirAttr
	    });
		menu.addChild(window["pe"].insertColumnAfterDropDown);

		window["pe"].deleteColumnDropDown = new dijit.MenuItem({
	        label: nls.insertOrDelete_Delete,
	        id: "S_i_DeleteColumnDropDown",
	        onClick: function(){
	            scene.editor.execCommand(commandOperate.DELETECOLUMN);
	        },
	        dir: dirAttr
	    });
	    menu.addChild(window["pe"].deleteColumnDropDown);		
		
		return menu;
	}
	else if("S_t_Direction" == id)
	{
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		var directionMenu = new dijit.Menu({
			id: "S_m_Direction_toolbar",
			dir: dirAttr
		});
		dojo.addClass(directionMenu.domNode,"lotusActionMenu toolbarMenu");
		directionMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_LtrDirection",
		    	label: menuStrs.formatMenu_Ltr,
		        iconClass: "ltrDirectionIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.LTRDIRECTION); },
		        dir: dirAttr
		}));
		directionMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_RtlDirection",
		    	label: menuStrs.formatMenu_Rtl,
		        iconClass: "rtlDirectionIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.RTLDIRECTION); },
		        dir: dirAttr
		}));
		directionMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_AutoDirection",
		    	label: menuStrs.formatMenu_Auto,
		        iconClass: "autoDirectionIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.AUTODIRECTION); },
		        dir: dirAttr
		}));				
		return directionMenu;
	}
	else if("S_t_MirrorSheet" == id)
	{
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		var toggleSheetMenu = new dijit.Menu({
			id: "S_m_MirrorSheet_toolbar",
			dir: dirAttr
		});
		dojo.addClass(toggleSheetMenu.domNode,"lotusActionMenu toolbarMenu");
		toggleSheetMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_LtrSheetDirection",
		    	label: nls.setSheetDirectionLTR,
		        iconClass: "sheetLtrDirectionIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.LTRSHEETDIRECTION); },
		        dir: dirAttr
		}));
		toggleSheetMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_RtlSheetDirection",
		    	label: nls.setSheetDirectionRTL,
		        iconClass: "sheetRtlDirectionIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.RTLSHEETDIRECTION); },
		        dir: dirAttr
		}));				
		return toggleSheetMenu;
	}
	else if("S_t_Align" == id)
	{
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		var alignMenu = new dijit.Menu({
			id: "S_m_Align_toolbar",
			dir: dirAttr
		});
		dojo.addClass(alignMenu.domNode,"lotusActionMenu toolbarMenu");
		alignMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_LeftAlign",
		    	title:nls.leftAlignTip,
				label:nls.leftAlignTip,
	        	iconClass: "websheetToolbarIcon alignLeftIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.ALIGNLEFT); },
		        dir: dirAttr
		}));
		alignMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_CenterAlign",
		    	title:nls.centerTip,
				label:nls.centerTip,
	        	iconClass: "websheetToolbarIcon alignCenterIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.ALIGNCENTER); },
		        dir: dirAttr
		}));
		alignMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_RightAlign",
		    	title:nls.rightAlignTip,
				label:nls.rightAlignTip,
	        	iconClass: "websheetToolbarIcon alignRightIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.ALIGNRIGHT); },
		        dir: dirAttr
		}));				
		return alignMenu;
	}
	else if("S_t_VAlign" == id)
	{
		var menuStrs = dojo.i18n.getLocalization("concord.widgets","menubar");
		var valignMenu = new dijit.Menu({
			id: "S_m_VAlign_toolbar",
			dir: dirAttr
		});
		dojo.addClass(valignMenu.domNode,"lotusActionMenu toolbarMenu");
		valignMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_TopAlign",
		    	title:nls.topAlignTip,
				label:nls.topAlignTip,
	        	iconClass: "websheetToolbarIcon alignTopIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.ALIGNTOP); },
		        dir: dirAttr
		}));
		valignMenu.addChild(new dijit.MenuItem({
	    	id: "S_t_MiddleAlign",
	    	title:nls.middleAlignTip,
			label:nls.middleAlignTip,
        	iconClass: "websheetToolbarIcon alignMiddleIcon",
	        onClick: function(){ scene.editor.execCommand(commandOperate.ALIGNMIDDLE); },
	        dir: dirAttr
		}));
		valignMenu.addChild(new dijit.MenuItem({
		    	id: "S_t_BottomAlign",
		    	title:nls.bottomAlignTip,
				label:nls.bottomAlignTip,
	        	iconClass: "websheetToolbarIcon alignBottomIcon",
		        onClick: function(){ scene.editor.execCommand(commandOperate.ALIGNBOTTOM); },
		        dir: dirAttr
		}));
		return valignMenu;
	}
	
	return null;
},

customizeNumberFormatMenuItems = function(scene, isSheetProtected){
	if(window.bNumberFormatted){
		var isViewMode = scene.isViewMode();
		for(var i = 0; i < numberFormatArray.length; i++){			
			var menuitem = dijit.registry.byId(numberFormatArray[i]);	
			if(menuitem){
				if(isViewMode || isSheetProtected){
					menuitem.set('disabled', true);
				}else{
					menuitem.set('disabled', false);
				}
			}
		}
	}
};

var _getNumberItems = function() {
	numberFormatArray = [];
	numberItem = [];
	currencyItem = [];
	percentItem = [];
	dateItem = [];
	timeItem = [];
	moreDateItem = [];
	window['pe'].MoreDate = MoreDate;
	window['pe'].MoreCurrency = MoreCurrency;
	window['pe'].formatItem = formatItem;
	var localeIso = websheet.i18n.Number.getLocaleIso();
	formatItem["CurrencyFormat1"][websheet.Constant.Style.FORMATCURRENCY] = localeIso;
	formatItem["CurrencyFormat2"][websheet.Constant.Style.FORMATCURRENCY] = localeIso;
	createFormatItem();
	createDateItem(pe.scene);
};

createNumberFormatItems = function(scene) {
	_getNumberItems();
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var array = [];
	var numberArray = [];
	array.push({type:nls.NUMBER,items:numberArray});
	for(var i = 0; i < numberItem.length; i++){	
		var item = numberItem[i];
		numberArray.push({label:item.label, value:item.key, format:formatItem[item.key]});
	}
	var currencyArray = [];
	array.push({type:nls.CURRENCY,items:currencyArray});
	for(var i = 0; i<currencyItem.length; i++){
		var item = currencyItem[i];
		currencyArray.push({label:item.label, value:item.key, format:formatItem[item.key]});
	}
	var moreCurrencyArray = [];
	currencyArray.push({label:nls.MORECURRENCY, value:[{type:nls.MORECURRENCY, items:moreCurrencyArray}]});
	for(var cur in MoreCurrency){
		var symbol = websheet.i18n.Number.getCurrencySymbol(cur);
		if(BidiUtils.isGuiRtl())
			symbol = BidiUtils.LRE + symbol;
		moreCurrencyArray.push({label:symbol, value: cur, accelKey: nls.CURRENCY_CODE[cur], format:MoreCurrency[cur]});
	}
	
	var moreCurrencyCodeArray = [];
	currencyArray.push({label:nls.MORECURRENCYCODE, value:[{type:nls.MORECURRENCYCODE, items:moreCurrencyCodeArray}]});
	var currList = [];
	for (var cur in MoreCurrency)
		currList.push(cur);
	currList = currList.sort();
	for (var index = 0; index < currList.length; index++) {
		var cur = currList[index];
		moreCurrencyCodeArray.push({label:cur, value: cur, accelkey: nls.CURRENCY_CODE[cur], format:MoreCurrency[cur]});
	}
	var percentArray = [];
	array.push({type:nls.PERCENT,items:percentArray});
	for(var i = 0; i < percentItem.length; i++){	
		var item = percentItem[i];
		percentArray.push({label:item.label, value:item.key, format:formatItem[item.key]});
	}
	
	var timeArray = [];
	array.push({type:nls.TIME,items: timeArray});
	for(var i = 0; i < dateItem.length; i++){	
		var item = dateItem[i];
		timeArray.push({label:item.label, value:item.key, format:formatItem[item.key]});
	}
	
	for(var i = 0; i < timeItem.length; i++){	
		var item = timeItem[i];
		timeArray.push({label:item.label, value:item.key, format:formatItem[item.key]});
	}
	
	var moreDateTimeArray = [];
	timeArray.push({label:nls.MOREDATE, value:[{type:nls.MOREDATE, items:moreDateTimeArray}]});
	for(var i =0;i<moreDateItem.length;i++){	
		var item = moreDateItem[i];
		moreDateTimeArray.push({label: item.label, value: item.key, accelKey:[item.tip], format:MoreDate[item.key]});
	}
	
	array.push({type:nls.TEXT, items:[{label:textItem[0].label, value:textItem[0].key, format:formatItem[nls.TEXT]}]});
	return array;
},

populateNumberFormatMenuItems = function(scene, bDropDown, menu) {
	var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
	var _mItem;
	if (!window.bNumberFormatted) {
		numberFormatArray = [];
		_getNumberItems();
		window.bNumberFormatted = true;
	}
	//The ISO of currency such as USD,CNY...
	var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';	
	var dropdown = bDropDown ? "DropDown" : "";
	for(var i = 0; i < numberItem.length; i++){		
		menu.addChild(_mItem = new dijit.MenuItem({
	    	id: "S_i_Number" + numberItem[i].key + dropdown,
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(numberItem[i].label, dojo.isIE) : numberItem[i].label,
	        accelKey:nls.NUMBER,   
	        //TODO this and the follow accelKey is not the real meaning,just to align the label 
	        iconClass:"websheetToolbarIcon g41firstButtonIcon",
	        value:numberItem[i].key,
	        dir: dirAttr
	    }));
		numberFormatArray.push("S_i_Number" + numberItem[i].key + dropdown);
		dijit.removeWaiState(_mItem.domNode, "labelledby");
	    dijit.setWaiState(_mItem.domNode, "label",numberItem[i].label + " " + nls.NUMBER);
	}
	
	menu.addChild(new dijit.MenuSeparator());
	for(var i = 0; i<currencyItem.length; i++){			
		menu.addChild(_mItem = new dijit.MenuItem({
	    	id:"S_i_Currency" + currencyItem[i].key + dropdown,
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(currencyItem[i].label, dojo.isIE) : currencyItem[i].label,
	        accelKey:nls.CURRENCY,
	        iconClass:"websheetToolbarIcon g41secondButtonIcon",
	        value:currencyItem[i].key,
	        dir: dirAttr
	    }));
		numberFormatArray.push("S_i_Currency" + currencyItem[i].key + dropdown);
		dijit.removeWaiState(_mItem.domNode, "labelledby");
	    dijit.setWaiState(_mItem.domNode, "label",currencyItem[i].label + " " + nls.CURRENCY);
	}
	
//	var scrollableMenuTpl = "<div style='height: 300px; padding-right:12px;overflow-x: hidden; overflow-y: auto;'>"
//		+ dojo.cache("dijit", "templates/Menu.html") + "</div>";
	
	var moreCurrencySubMenu = new dijit.Menu({
		baseClass: "moreCurrencies",
		id: "S_m_MoreCurrencies" + dropdown,
//		templateString: scrollableMenuTpl,
		dir: dirAttr
	});
	dojo.addClass(moreCurrencySubMenu.domNode,"lotusActionMenu");
	dojo.toggleClass(moreCurrencySubMenu.domNode, "toolbarMenu", bDropDown);
	var nlsCurrencyDesc = nls.CURRENCY_CODE;
	for(var cur in MoreCurrency){
		var symbol = websheet.i18n.Number.getCurrencySymbol(cur);
		if(BidiUtils.isGuiRtl())
			symbol = BidiUtils.LRE + symbol;

		moreCurrencySubMenu.addChild(_mItem = new dijit.MenuItem({
	        label: symbol,
	        id: "S_i_MoreCurrencies" + cur + dropdown,
	        accelKey: nlsCurrencyDesc[cur],
	        value: cur,
	        dir: dirAttr
	    }));
		if(BidiUtils.isGuiRtl())
			_mItem.accelKeyNode.style.cssText = 'text-align: left !important';

		numberFormatArray.push("S_i_MoreCurrencies" + cur + dropdown);
		dijit.removeWaiState(_mItem.domNode, "labelledby");
	    dijit.setWaiState(_mItem.domNode, "label", symbol + " " + nlsCurrencyDesc[cur]);
	}

	var moreCurrencyByCodeSubMenu = new dijit.Menu({
		baseClass: "moreCurrencies",
		id: "S_m_MoreCurrenciesByCode" + dropdown,
//		templateString: scrollableMenuTpl,
		dir: dirAttr
	});
	dojo.addClass(moreCurrencyByCodeSubMenu.domNode,"lotusActionMenu");
	dojo.toggleClass(moreCurrencyByCodeSubMenu.domNode, "toolbarMenu", bDropDown);
	var currList = [];
	for (var cur in MoreCurrency)
		currList.push(cur);
	currList = currList.sort();
	for (var index = 0; index < currList.length; index++) {
		var cur = currList[index];
		moreCurrencyByCodeSubMenu.addChild(_mItem = new dijit.MenuItem({
	        label: cur,
	        id: "S_i_MoreCurrenciesByCode" + cur + dropdown,
	        accelKey: nlsCurrencyDesc[cur],
	        value: cur,
	        dir: dirAttr
	    }));
		if(BidiUtils.isGuiRtl())
			_mItem.accelKeyNode.style.cssText = 'text-align: left !important';
	
		numberFormatArray.push("S_i_MoreCurrenciesByCode" + cur + dropdown);
		dijit.removeWaiState(_mItem.domNode, "labelledby");
	    dijit.setWaiState(_mItem.domNode, "label", cur + " " + nlsCurrencyDesc[cur]);
	}
	
	var moreCurrencies = new dijit.PopupMenuItem({
        label: nls.MORECURRENCY,
        id: "S_i_MoreCurrencies" + dropdown,
        popup: moreCurrencySubMenu,
        value: "CurrencyPopup",
        dir: dirAttr
    });
    dojo.style(moreCurrencies.arrowWrapper, 'visibility', '');
    menu.addChild(moreCurrencies);

	var moreCurrenciesByCode = new dijit.PopupMenuItem({
        label: nls.MORECURRENCYCODE,
        id: "S_i_MoreCurrenciesByCode" + dropdown,
        popup: moreCurrencyByCodeSubMenu,
        value: "CurrencyByCodePopup",
        dir: dirAttr
    });
    dojo.style(moreCurrenciesByCode.arrowWrapper, 'visibility', '');
    menu.addChild(moreCurrenciesByCode);
    
	menu.addChild(new dijit.MenuSeparator());
	
	for(var i = 0; i<percentItem.length; i++){
		menu.addChild(_mItem = new dijit.MenuItem({
	    	id:"S_i_Percent"+ percentItem[i].key + dropdown,
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(percentItem[i].label, dojo.isIE) : percentItem[i].label,
	        accelKey:nls.PERCENT,
	        iconClass:"websheetToolbarIcon g41thirdButtonIcon",
	        value:percentItem[i].key,
	        dir: dirAttr
	    }));
		numberFormatArray.push("S_i_Percent"+ percentItem[i].key + dropdown);
		dijit.removeWaiState(_mItem.domNode, "labelledby");
	    dijit.setWaiState(_mItem.domNode, "label", percentItem[i].label + " " + nls.PERCENT);
	}
	menu.addChild(new dijit.MenuSeparator());
	
	for(var i = 0; i<dateItem.length; i++){
		menu.addChild(_mItem = new dijit.MenuItem({
	    	id:"S_i_Date" + dateItem[i].key + dropdown,
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(dateItem[i].label, dojo.isIE) : dateItem[i].label,
	        accelKey:nls.DATE,
	        iconClass:"websheetToolbarIcon g41fourthButtonIcon",
	        value:dateItem[i].key,
	        dir: dirAttr
	    }));
		numberFormatArray.push("S_i_Date" + dateItem[i].key + dropdown);
		dijit.removeWaiState(_mItem.domNode, "labelledby");
	    dijit.setWaiState(_mItem.domNode, "label", dateItem[i].label + " " + nls.DATE);
	}
	
	for(var i = 0; i<timeItem.length; i++){
		menu.addChild(_mItem = new dijit.MenuItem({
	    	id:"S_i_Time" + timeItem[i].key + dropdown,
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(timeItem[i].label, dojo.isIE) : timeItem[i].label,
	        accelKey:nls.TIME,
	        iconClass:"websheetToolbarIcon g41fifthButtonIcon",
	        value:timeItem[i].key,
	        dir: dirAttr
	    }));
		numberFormatArray.push("S_i_Time" + timeItem[i].key + dropdown);
		dijit.removeWaiState(_mItem.domNode, "labelledby");
	    dijit.setWaiState(_mItem.domNode, "label", timeItem[i].label + " " + nls.TIME);
	}
	
	var moreDateSubMenu = new dijit.Menu({ id: "S_m_MoreTimeDateFormats" + dropdown, dir: dirAttr });
	dojo.addClass(moreDateSubMenu.domNode,"lotusActionMenu");
	dojo.toggleClass(moreDateSubMenu.domNode, "toolbarMenu", bDropDown);
	var length=moreDateItem.length;
	for(var i =0;i<length;i++){	
		var tmp=moreDateItem[i];
		moreDateSubMenu.addChild(_mItem = new dijit.MenuItem({
	        label: BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi(tmp.label, dojo.isIE) : tmp.label,
	        id: "S_i_MoreDateTime" + tmp.key + dropdown,
	        accelKey:nls[tmp.tip],
	        value: tmp.key,
	        dir: dirAttr
	    }));
		if(BidiUtils.isGuiRtl())
			_mItem.accelKeyNode.style.cssText = 'text-align: left !important';
			
		numberFormatArray.push("S_i_MoreDateTime" + tmp.key + dropdown);
		dijit.removeWaiState(_mItem.domNode, "labelledby");
	    dijit.setWaiState(_mItem.domNode, "label", tmp.label + " " + nls[tmp.tip]); 
	}
	
	var moreDate = new dijit.PopupMenuItem({
        label: nls.MOREDATE,
        id: "S_i_MoreTimeDateFormates" + dropdown,
        popup: moreDateSubMenu,
        value: "DatePopup",
        dir: dirAttr
    });
    dojo.style(moreDate.arrowWrapper, 'visibility', '');
    menu.addChild(moreDate);
    
    menu.addChild(new dijit.MenuSeparator());
    menu.addChild(new dijit.MenuItem({
        label: textItem[0].label,
        id: "S_i_Text" + dropdown,
        value: textItem[0].key,
        dir: dirAttr
    }));
    numberFormatArray.push("S_i_Text" + dropdown);
    var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
    customizeNumberFormatMenuItems(scene, isSheetProtected);
    return menu;
};