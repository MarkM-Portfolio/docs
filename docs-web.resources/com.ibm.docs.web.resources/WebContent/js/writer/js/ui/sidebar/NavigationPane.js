/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
define([
    "writer/ui/sidebar/SidePane",
    "dijit/_Templated",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/on",
    "dojo/topic",
    "writer/constants",
    "writer/global",
    "writer/core/Range",
    "writer/common/tools",
    "dojo/text!writer/templates/NavigationPane.html",
    "dojo/i18n!writer/nls/navigationPane",
    "concord/util/browser",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/model/Paragraph"
],
    function (SidePane, _Templated, array, lang, declare, dom, domConstruct, domStyle, domClass, on, topic, constants, g, Range, tools, template, nls, browser, modelTools, viewTools, Paragraph) {

        var NavigationPane = declare("writer.ui.sidebar.NavigationPane", [SidePane, _Templated], {

            templateString: template,
            name: "NavigationPane",

            showTitle: true,
        	cminW: 0,
        	cmaxW: 270,

            buildRendering: function () {
            	if(!pe.scene.naviMgr)
            		pe.scene.naviMgr = this.sidePaneMgr = new writer.ui.sidebar.SidePaneManager("Navi",true);
                this.nls = nls;
                this.paneTitle = nls.title;
                this.inherited(arguments);
            },

            postCreate: function () {
                this.inherited(arguments);
                this.adjustStyle();
                if (window.BidiUtils.isGuiRtl())
                    this.enableHorizontalScrollbar();

                topic.subscribe(constants.EVENT.LOAD_READY, lang.hitch(this, this.reload));
                topic.subscribe(constants.EVENT.PAGEONSCROLL, lang.hitch(this, this.editorScrollHandler));
                topic.subscribe("/navigation/update", lang.hitch(this, this.reload));
                on(this.naviList, "click", lang.hitch(this, this.onClickLst));
                on(this.naviList, "keydown", lang.hitch(this, this.onKeydown));
                on(this.domNode, "mouseenter", lang.hitch(this, this.onMouseEnter));
                on(this.domNode, "mouseleave", lang.hitch(this, this.onMouseLeave));
                on(this._closeBtn, "click", lang.hitch(this, this.disbleNavi));
            },

            adjustStyle: function() {
            	domClass.remove(this._headerNode, "commonSidePaneHeader");
            	domClass.add(this._headerNode, "naviPaneHeader");
                if (this.showCloseIcon) {
                	var closeIconDiv = this._closeBtn.firstChild;
                	domClass.remove(closeIconDiv, "closePaneIcon");
                	domClass.add(closeIconDiv, "closeNaviPaneIcon");
                }
                domStyle.set(this.domNode, {
                    "left": window.BidiUtils.isGuiRtl() ? "auto" : "0px",
                    "right": window.BidiUtils.isGuiRtl() ? "1px" : "auto",
                    "overflow":"hidden",
                    "background-color": window.BidiUtils.isGuiRtl() ? "#F1F1F1" : "rgba(224, 224, 224, 0)"
                });
            },

            onKeydown: function (e) {
            	var e = e || window.event;
         		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE)    	
         			this.onClickLst(e);
         		else if (e.keyCode == dojo.keys.DOWN_ARROW || e.keyCode == dojo.keys.UP_ARROW)
         			this.changeSelect(e.target, e.keyCode)
            },

            onMouseEnter: function (e) {
         		if (this.domNode && this.domNode.style.overflowY == 'hidden'){
         			if(this.domNode.clientHeight < this.domNode.scrollHeight)
         				this.domNode.style.overflowY = 'scroll';
         		}
            },

            onMouseLeave: function (e) {
         		if (this.domNode && this.domNode.style.overflowY == 'scroll')
         			this.domNode.style.overflowY = 'hidden';
            },

            onClickLst: function(e) {
            	var lst = this.getLstItemDom(e.target);
            	if(lst)
                	this.gotoLink(this.navItems[lst.id]);
            },
 
            enableHorizontalScrollbar: function () {
                var body = dojo.byId("editorFrame").contentWindow.document.body;
                if (body)
                    body.style.direction = "rtl";
            },

            onOpen: function () {
            	this.reload();
            	if (window.BidiUtils.isGuiRtl()) {
            	    this.enableHorizontalScrollbar();

            	}
            },

            onClose: function () {
                topic.publish(this.sidePaneMgr.closeTopic + this.sidePaneMgr.id, {
                    sidePane: this
                });
                pe.scene.sidebarResized(0);
                this.updateEditor();
            	var body = dojo.byId("editorFrame").contentWindow.document.body;
            	if (window.BidiUtils.isGuiRtl() && body)
                    body.style.direction = "";
            },

            editorScrollHandler: function(){
            	if(this.naviPanelRoot && this.naviPanelRoot.style){
            		if(!window.BidiUtils.isGuiRtl()) {
                	//	var curLeft = this.naviPanelRoot.style.left;
                        var scrollLeft = (0 - pe.lotusEditor.getScrollPositionH());
                        this.naviPanelRoot.style.left = scrollLeft + "px";
            		}
            	}
            },

            disbleNavi: function(){
                if(pe.scene.isShowNaviPanel()){
                	pe.scene.setShowNaviPanel(false);
                	this.setNavigationMenuItem(false);
                }
            },

            updateEditor: function(){
            	var updated = pe.scene.updateEditor();
            	if(updated){
            		 pe.lotusEditor.getSelection()._checkCursor();
            		 topic.publish(constants.EVENT.PAGELEFTCHANGED, {
                         lch: updated
                     });
            	}
            	if(!updated) {
            		var sel = pe.lotusEditor.getSelection();
            		var curCursor = sel && sel.getCursor();
            		var cInfo = curCursor && curCursor.getContext();
            		var cPage = cInfo && cInfo._run && viewTools.getPage(cInfo._run);

            		var docView = pe.lotusEditor.layoutEngine.rootView;
                    var page = docView.pages.getFirst();
                    var pgUpdated = false, cUpdated = false;;
                    while (page) {
                    	if(page.updateLeftAttr(docView)){
                    		pgUpdated = true;
                    		if(cPage && cPage == page)
                    			cUpdated = true;
                    	}
                        page = docView.pages.next(page);
                    }
                    if(pgUpdated){
                    	docView.render(pe.lotusEditor.getScrollPosition());
                    	if(cUpdated)
                    	    pe.lotusEditor.getSelection()._checkCursor();
                    }
            	}
            },

            reload: function() {
                clearTimeout(this._uiRefreshTimer);
                var me = this;
                this._uiRefreshTimer = setTimeout(function(){
                	me.clearList();
                    me.buildList();
                }, 100);
            },

            setNavigationMenuItem: function(enabled){
            	if(pe.navigationMenuItem) {
            		var isEnabled = (pe.navigationMenuItem.domNode.style.display == "");
            		if(enabled != isEnabled){
            			if(enabled)
                        	pe.navigationMenuItem.set("checked", true);
            			else
            				pe.navigationMenuItem.set("checked", false);
            		}
            	}
            },

            clearList: function(){
            	if(!this.naviList.firstChild)
            		return;
            	
            	this.navItems = [];
            	var next = this.naviList.firstChild;
            	if(!next) return;
            	do{
            		this.naviList.removeChild(next);
            		next = this.naviList.firstChild;
            	}while(next)
            },

            open: function() {
                topic.publish(this.sidePaneMgr.openTopic + this.sidePaneMgr.id, {
                    sidePane: this
                });
                
                this.domNode.style.display = "";
                this.resizeSidebar();
                this.onOpen();
            },

            close: function() {
                this.inherited(arguments);
            },

            buildList: function() {
                var headings = modelTools.getOutlineParagraphs(10, 0, false);
                var navItems = this.navItems = [];
                this.topLvl = 0;
                for (var i = 0; i < headings.length; i++) { //build heading list 
                	var hItem = headings[i];
                	if(modelTools.isInToc(hItem))
                		continue;

                	var hJson = this.createNavItemJson(hItem);
                	hJson && navItems.push(hJson);
                }
                if(navItems.length > 0) {
                	this.showEmptyWarning(false);
                	this.createListDoms();
                } else
                	this.showEmptyWarning(true);
                clearTimeout(this._uiRefreshTimer);                
            },

            createNavItemJson: function(hItem){
            	var lJson = {};
                var text = hItem.getVisibleText();
                text = ( text ? text.trim() : "");
//                if (hItem.listSymbols)
//                    text = hItem.listSymbols.txt.trim() + text;
                var hLvl = hItem.getOutlineLvl();
                if(this.topLvl){
                	if(this.topLvl > hLvl)
                		this.topLvl = hLvl;
                } else {
                	this.topLvl = hLvl;
                }
                lJson.id = hItem.id;
                lJson.txt = text;
                lJson.lvl = hLvl;
                lJson.para = hItem;
                return lJson;
            },

            createListDoms: function() {
            	var len = this.navItems ? this.navItems.length : 0;
            	for(var i = 0; i< len; i++){
            		var lst = this.navItems[i];
            		var lstClassName = "listLvl";

                    var inHtml = "<span class='naviLstSymbol'>\u25CF</span>";
                    inHtml += "<span class='naviLstContent'>"+lst.txt+"</span>";

                    var lstDom = domConstruct.create("div", {
                        className: lstClassName,
                        id: i,
                        tabindex: 0,
                        innerHTML: inHtml
                    });

                    lstDom.lastChild.title = lst.txt;
                    var actLvl = lst.lvl - this.topLvl;
                    if(actLvl < 0){
                    	this.topLvl = lst.lvl;
                    	actLvl = 0;
                    }

                    var marginLeft = 20 * actLvl + "px";
                    var isRtl = false;
                    var dirProp = lst.para.directProperty;
                    if (dirProp && dirProp.getDirection()) {
                        isRtl = dirProp.getDirection() == "rtl";
                    }
                    domStyle.set(lstDom, {
                        "margin-left": isRtl ? "auto" : marginLeft,
                        "margin-right": isRtl ? marginLeft : "auto",
                        "direction": isRtl ? "rtl" : ""
                    });

            		this.naviList.appendChild(lstDom);
            	}
            },
            
            showEmptyWarning: function(isShow) {
            	if(isShow)
            		this.naviWarnText.style.display = '';
            	else
            		this.naviWarnText.style.display = 'none';
            },

            findPara: function(pid) {
            	var idx = -1;
            	if(this.navItems) {
            		return this.navItems.some(function(item, curIdx){
            			if(item.id == pid){
            				idx = curIdx;
            				return true;
            			}
            		});	
            	}
            	return idx;
            },

            changeSelect: function(target, keyCode){
            	var curLst = this.getLstItemDom(target);
            	if(curLst){
            		var next = curLst.nextSibling;
            		if(keyCode == dojo.keys.UP_ARROW)
            			next = curLst.previousSibling;

            		if(!next) return;

            		this.unhighlightLst(curLst);
            		this.hightlightLst(next);
            	}
            },

            getLstItemDom: function(target){
            	var isLst = false;
            	while(target){
            		if(target.classList && target.classList.contains("listLvl")){
            			isLst = true;
            			break;
            		}

            		target = target.parentNode;
            	}

            	if(isLst) return target;
            	return;
            },            

            gotoLink: function(item) {
            	if(!item)
            		return;

                var next = item.para.firstChild();
                while (next && (!modelTools.isRun(next) || modelTools.isBookMark(next) || next.br)) {
                    next = next.next();
                }
                var index = next ? next.start : 0;

                var pos = {
                    "obj": item.para,
                    "index": index
                   };
                var r1 = new Range(pos, pos);
                var sel = pe.lotusEditor.getSelection();
                sel.selectRanges([r1]);
                sel.scrollIntoView(false, false, r1, 2);
                pe.lotusEditor.focus();
            },

            hightlightLst: function(lstDom){
            	//console.log("hightlight:" + lstDom.id);
            	lstDom.focus();
            },

            unhighlightLst: function(lstDom){
            	//console.log("unhightlight:" + lstDom.id);
            },

            getPanelClientWidth: function()
            {
            	var cRect = this.domNode && this.domNode.getBoundingClientRect();
            	return cRect && cRect.width;
            },

            resizeSidebar: function() {
                var height = this.sidePaneMgr.getHeight();
                height = height ? height.replace("px", ""): 0;
                var width = this.sidePaneMgr.getWidth(this);

                var paddingTop = this.getPaddingVal("paddingTop");
                var paddingBottom = this.getPaddingVal("paddingBottom");

                domStyle.set(this.domNode, {
                    "height": (height - paddingTop - paddingBottom) + "px",
                    "width": width + "px"
                });

                this.naviPaneResized(width);

                var sbh = (pe.lotusEditor.hasScrollBar('w') ? tools.getScrollbarWidth() : 0);
                if(sbh > 0)
                    domStyle.set(this.domNode, {
                        "height": (height - paddingTop - paddingBottom - sbh) + "px"
                    });
            },

        	getMinWidth: function(){
        		return this.cminW;
        	},
        	
        	getMaxWidth: function(){
        		return this.cmaxW;
        	},

            checkMaxWidth: function()
        	{
        		var maxWidth = concord.util.browser.getBrowserWidth();
    			var pageWidth = pe.lotusEditor._shell.view().getPage(1).getWidth();
    			var sbw = pe.scene && pe.scene.sidePaneMgr && pe.scene.sidePaneMgr.getWidth(null, true) || 0;
    			pageWidth += sbw;

    			if(maxWidth > pageWidth + 300){
    				this.cmaxW = 270;
    				this._setSidebarPadding("20px");
    			}else if(maxWidth > pageWidth + 200){
    				this.cmaxW = maxWidth - pageWidth - 20;
    				this._setSidebarPadding("20px 2px");
    			}else{
    				this.cmaxW = 180;
    				this._setSidebarPadding("20px 2px");
    			}
        	},

        	_setSidebarPadding: function(pxValue){
        		dojo.style(this.naviPanelRoot,"padding",pxValue);
        	},
        	
        	getPaddingVal: function(side){
        		var ret = this.domNode && this.domNode.style && this.domNode.style[side];
        		ret && (ret = ret.replace("px", ""));
        		return (ret || 0);
        	},

        	naviPaneResized: function(w)
        	{
        		if(w == 0 && this.sidePaneMgr.hasOpenedSidebar())
        		{
        			return;
        		}
        		var editCell = dojo.byId('editorFrame'); 				
        		//var leftCell = dojo.byId('left_sidebar');
        		var sideBar = dojo.byId("navigation_pane_div");    
        		var bW = concord.util.browser.getBrowserWidth(true);
        		if(BidiUtils.isGuiRtl())
        			dojo.style(editCell, "float", "right");
          
        		//percentage width in IE just simply round up so it may hide the border a little
        		if(dojo.isIE) 
        		{
        			if(sideBar)
        				dojo.style(sideBar, "width", w+"px");
        			this.sidePaneMgr.updateWidth(w + "px");
        		}
        		else
        		{
        			var lW = 100*w/bW + "%";
        			if(sideBar)
        				dojo.style(sideBar, "width", lW);
        			this.sidePaneMgr.updateWidth(lW);
        		}
        		this.updateEditor();
        	}            

        });

        return NavigationPane;
    });