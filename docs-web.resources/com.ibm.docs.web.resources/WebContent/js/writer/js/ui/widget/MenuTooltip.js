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
define([
    "dojo/_base/declare",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/has",
    "dijit/Tooltip",
    "dijit/_Templated",
    "dijit/_Widget"
], function(declare, aspect, domClass, domGeometry, has, Tooltip, _Templated, _Widget) {

    var MenuTooltip = declare('writer.ui.widget.MenuTooltip', Tooltip, {

        widget: null,
        position: ["below", "above"],
        connected: {
            c: false
        },
        title: "",
        ack: "",
        buildRendering: function() {
            this.inherited(arguments);
            this.connectId = [this.widget.domNode];
            if (this.widget.dropDown) {
                this.connect(this.widget, "openDropDown", "openDropDown");
            }
            if (this.widget.onClick) {
                this.connect(this.widget, "onClick", "openDropDown");
            }
        },

        escapeXml: function(str, noSingleQuotes, ignoreIE) {
            //summary:
            //	Adds escape sequences for special characters in XML: &<>"'
            //  Optionally skips escapes for single quotes
            str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
            //		str = str.replace(/\ /g,"&nbsp;");
            if (!noSingleQuotes) {
                str = str.replace(/'/gm, "&#39;");
            }

            if ((!ignoreIE) && (has("ie") || has("trident"))) {
                str = str.replace(/ {2,}/gm, " ").replace(/ {0,}\n/gm, "<br/>");
            } else
                str = str.replace(/\n/gm, "<br/>");

            return str; // string
        },

        setTitleAck: function(title, ack) {
            this.title = title;
            this.ack = ack;
            var html = (BidiUtils.isGuiRtl() && ack) ? "<div dir='rtl' >" : "<div>"; //shensis  55532
            html += "<span class='tooltipLabel'>" + this.escapeXml(title) + "</span>";
            if (ack)
                html += "<span class='tooltipAccelKey'>" + this.escapeXml(ack) + "</span>";
            html += "</div>";
            this.set("label", html);
        },

        onShow: function(target, position) {

            try {
                var master = dijit._masterTT;
                var masterDom = master.domNode;
                if (!domClass.contains(masterDom, "menuTooltip"))
                    domClass.add(masterDom, "menuTooltip");
                if (position[0] == "after") {
                    masterDom.style.left = (parseInt(masterDom.style.left) + 8) + "px";
                    masterDom.style.top = (parseInt(masterDom.style.top)) + "px";
                } else {
                    if (this.onHeader) {
                        masterDom.style.top = (parseInt(masterDom.style.top) + 6) + "px";
                        var cordsPos = domGeometry.position(this.widget.domNode);
                        var cordsX = cordsPos.x;
                        var condsW = Math.floor(cordsPos.w / 2) - 4;
                        var tooltipPositionX = domGeometry.position(masterDom).x;
                        var offset = tooltipPositionX - cordsX;
                        if (offset >= 0)
                            master.connectorNode.style.left = "6px";
                        else
                            master.connectorNode.style.left = (condsW - offset) + "px";
                    } else {
                        masterDom.style.top = (parseInt(masterDom.style.top) + 6) + "px";
                        var cordsX = domGeometry.position(this.widget.domNode).x;
                        var tooltipPositionX = domGeometry.position(masterDom).x;
                        var offset = tooltipPositionX - cordsX;
                        if (offset >= 0)
                            master.connectorNode.style.left = "6px";
                        else
                            master.connectorNode.style.left = (6 - offset) + "px";
                    }
                }
            } catch (e) {}

            if (this.connected.c == false && dijit._masterTT) {
                aspect.after(dijit._masterTT, "_onHide", function() {
                    var masterDom = dijit._masterTT.domNode;
                    domClass.remove(masterDom, "menuTooltip");
                }, true);
                this.connected.c = true;
            }
        },

        _onHover: function(e) {
            //remove the role attribute ('alert') for A11Y, restore it in _onUnHover
            try {
                ////for dojo 1.9+, it's _masterTT
                if (dijit._masterTT) {
                    dijit._masterTT.containerNode.removeAttribute('role');
                }
            } catch (e) {}
            if (this.widget.dropDown && this.widget._opened)
                return;
            else {
                if (!this._showTimer) {
                    var target = this.widget.domNode;
                    this._showTimer = this.defer(function() {
                        this.open(target);
                    }, this.showDelay);
                }
            }
        },

        _onUnHover: function() {
            this.inherited(arguments);
            // 51011: [A11Y] JAWS doesn't read the tooltip until exiting the menu item 'Publish Automatically'
            //		try {
            //		//for dojo 1.9+
            //			if (dijit._masterTT) {
            //				dijit._masterTT.containerNode.setAttribute('role', 'alert');
            //			}
            //		} catch(e){}
        },

        openDropDown: function() {
            this._onUnHover();
        }


    });
    return MenuTooltip;
});
