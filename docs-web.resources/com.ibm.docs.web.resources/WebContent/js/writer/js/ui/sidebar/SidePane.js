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
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/topic",
    "dojo/aspect",
    "dojo/on",
    "dijit/_Widget",
    "dijit/_base/wai",
    "concord/util/events",
    "dijit/a11yclick",
    "dijit/a11y"
], function(lang, declare, domC, domAttr, domStyle, domClass, topic, aspect, on, _Widget, wai, events, a11yclick, a11y) {

    return declare("writer.ui.sidebar.SidePane", _Widget, {

        sidePaneMgr: null,
        // dock: false,
        name: "",
        showTitle: true,
        showCloseIcon: true,
        paneTitle: "",

        constructor: function() {
            this.sidePaneMgr = pe.scene.sidePaneMgr;
        },

        _createHeader: function() {
            this._headerNode = domC.create("div", null, this.domNode, "first");
            domClass.add(this._headerNode, "commonSidePaneHeader");

            if (this.showCloseIcon) {
                this._closeBtn = domC.create("div", { tabIndex: 0 }, this._headerNode);
                domClass.add(this._closeBtn, "closePaneBtn");
                var closeDiv = domC.create("div", null, this._closeBtn);
                domClass.add(closeDiv, "closePaneIcon");
                on(this._closeBtn, a11yclick, lang.hitch(this, this.close));
            }
            this._createTitle();
        },

        _createTitle: function() {
            var title = domC.create("span", { innerHTML: this.paneTitle }, this._headerNode);
            domClass.add(title, "title");

            if (this._closeBtn) {
                var closeText = " close button";
                wai.setWaiState(this._closeBtn, "label", this.paneTitle + closeText);
                wai.setWaiRole(this._closeBtn, 'button');
            }
        },

        postCreate: function() {
            this.inherited(arguments);
            this.setupSize();
            events.subscribe(events.doc_data_reload, lang.hitch(this, 'close'));
            if (this.showTitle)
                this._createHeader();
        },

        setupSize: function() {
            var height = this.sidePaneMgr.getHeight();
            var width = this.sidePaneMgr.getWidth() + "px";
            domStyle.set(this.domNode, {
                "display": "none",
                "position": "absolute",
                "left": window.BidiUtils.isGuiRtl() ? "0px" : "auto",
                "right": window.BidiUtils.isGuiRtl() ? "auto" : "0px",
                "background-color": "#F1F1F1",
                "height": height,
                "width": width,
                "overflowY": "auto"
            });
        },

        resizeSidebar: function() {
            var height = this.sidePaneMgr.getHeight();
            var width = this.sidePaneMgr.getWidth() + "px";
            domStyle.set(this.domNode, {
                "height": height,
                "width": width
            });
        },

        isCollapsed: function() {
            return this.domNode.style.display == 'none';
        },

        toggle: function() {
            if (this.isCollapsed())
                this.open();
            else
                this.close();
        },

        open: function() {
            topic.publish(this.sidePaneMgr.openTopic + this.sidePaneMgr.id, {
                sidePane: this
            });
            
            if (pe.scene.sidebar && !pe.scene.sidebar.isCollapsed())
            {
                pe.scene.sidebar.collapse();
            }
            
            this.domNode.style.display = "";
            var curWidth = this.sidePaneMgr.getWidth();
            pe.scene.sidebarResized(curWidth);
            this.resizeSidebar();
            this.onOpen();
        },

        close: function(silent) {
            var orgWidth = this.sidePaneMgr.getWidth();
            if (silent !== true)
            {
                topic.publish(this.sidePaneMgr.closeTopic + this.sidePaneMgr.id, {
                    sidePane: this
                });
            }
            this.domNode.style.display = 'none';
            var curWidth = this.sidePaneMgr.getWidth();
            if (curWidth != orgWidth) {
                pe.scene.sidebarResized(curWidth);
            }
            setTimeout(lang.hitch(pe.scene, pe.scene.setFocus), 0);
            this.onClose();
        },
        
        setSidebarFocus: function()
        {
            var elems = a11y._getTabNavigable(this.domNode);
			var firstFocusItem = elems.lowest || elems.first || this._closeBtn || this.domNode; 
            if (firstFocusItem)
                firstFocusItem.focus();
        },

        onOpen: function() {},
        onClose: function() {}
    });
});
