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
    "dojo/_base/declare",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/aspect",
    "dojo/on",
    "concord/util/browser",
    "dojo/dom"
], function(declare, domAttr, domStyle, domClass, lang, topic, aspect, on, browser, dom) {
    return declare("writer.ui.sidebar.SidePaneManager", null, {

        _beginZIndex: 100, // Z-index of the first sidePane
        _enabled: true, // sidePane button status

        cminW: 0,
        cmaxW: 300,

        openTopic: "sidePaneOpen",
        closeTopic: "sidePaneClose",

        constructor: function(id, ignoreHeader) {
        	this.id = id || '';
        	this.ignoreHeader = ignoreHeader || false;
            this._stack = [];
            topic.subscribe(this.openTopic + this.id, lang.hitch(this, this._addSidePane));
            topic.subscribe(this.closeTopic + this.id, lang.hitch(this, this._removeSidePane));
            on(window, "resize", lang.hitch(this, "resize"));
        },

        resize: function() {
            clearTimeout(this._resizerTimer);
            this._resizerTimer = setTimeout(dojo.hitch(this, this._resize), 100);
        },

        _resize: function() {
            for (var i = 0, len = this._stack.length; i < len; i++) {
                var sidePane = this._stack[i];
                sidePane.resizeSidebar && sidePane.resizeSidebar();
            }
        },

        updateHeight: function(h) {
            for (var i = 0, len = this._stack.length; i < len; i++) {
                var sidePane = this._stack[i];
                if (sidePane && sidePane.domNode)
                    sidePane.domNode.style.height = h;
            }
        },

        updateWidth: function(w) {
            for (var i = 0, len = this._stack.length; i < len; i++) {
                var sidePane = this._stack[i];
                if (sidePane && sidePane.domNode)
                    sidePane.domNode.style.width = w;
            }
        },

        hasOpenedSidebar: function() {
            return this._stack.length > 0;
        },

        getWidth: function(pane, noUpdate) {
            if (!this.hasOpenedSidebar())
                return this.cminW;

            if(!noUpdate)
            	this.updateMaxWidth(pane);

            return this.cmaxW;
        },

        getHeight: function() {
            return pe.scene.getSidebarHeight();
        },

        updateMaxWidth: function(pane) {
        	if(!pane)
        		pane = pe.scene.sidebar;
        	pane.checkMaxWidth();
            this.cmaxW = pane.getMaxWidth();
        },

        _addSidePane: function(args) {
            var sidePane = args.sidePane;
            if (!sidePane || !sidePane.domNode) return;
            for (var len = this._stack.length - 1, i = len; i >= 0; i--) {
                if (this._stack[i] == sidePane)
                    return;
            }
            var zIndex = (++this._beginZIndex) + this._stack.length;
            domStyle.set(sidePane.domNode, "zIndex", zIndex);
            this._stack.push(sidePane);
            for (var len = this._stack.length - 1, i = len; i >= 0; i--) {
                if (this._stack[i] != sidePane && this._stack[i] !== pe.scene.sidebar) {
                    this._stack[i].close(true);
                    this._stack.splice(i, 1);
                }
            }
            this.checkHeaderBtns(sidePane);
            //if (sidePane.dock)
            //    this.disableSidebarBtns();
        },
        
        _removeSidePane: function(args) {
            var sidePane = args.sidePane;
            if (!sidePane || !sidePane.domNode) return;
            var pos = -1;
            for (var i = this._stack.length - 1; i >= 0; i--) {
                if (this._stack[i] === sidePane)
                    pos = i;
            }
            if (pos >= 0) {
                this._stack.splice(pos, 1);
                //if (sidePane.dock)
                //    this.enableSidebarBtns();
            }
            this.checkHeaderBtns(this.getCurrentOpenPane());
        },

        getCurrentOpenPane: function() {
            if (this._stack.length == 0)
                return null;
            else
                for (var i = this._stack.length - 1; i >= 0; i--) {
                    var pane = this._stack[i];
                    if (!pane.isCollapsed())
                        return pane;
                }
        },

        checkHeaderBtns: function(openSidePane)
    	{
        	if(this.ignoreHeader)
        		return;
        	var tcButton = dojo.byId("track_change_header_button");
        	var sidebarButton = dojo.byId("concord_sidebar_btn");
        	var sidebar = pe.scene.sidebar;
        	if (!openSidePane)
        	{
        		if (tcButton) tcButton.title = sidebar.nls.showChanges;
        		if (sidebarButton) sidebarButton.title = sidebar.nls.showComments;
        	}
        	else if (openSidePane == pe.scene.sidebar)
            {
        		if (tcButton) tcButton.title = sidebar.nls.showChanges;
        		if (sidebarButton) sidebarButton.title = sidebar.nls.hideComments;
            }
        	else if (openSidePane.name == "TrackChangeSidePane")
            {
        		if (tcButton) tcButton.title = sidebar.nls.hideChanges;
        		if (sidebarButton) sidebarButton.title = sidebar.nls.showComments;
            }
            else 
            {
            	if (tcButton) tcButton.title = sidebar.nls.showChanges;
        		if (sidebarButton) sidebarButton.title = sidebar.nls.showComments;
            }
    	}

    });


});
