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
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/text!writer/templates/CoEditIndicator.html",
    "dijit/Tooltip",
    "dijit/_Templated",
    "dijit/_Widget",
    "dojo/_base/html",
    "dojo/_base/window"
], function(declare, domClass, domStyle, template, Tooltip, _Templated, _Widget, dojoHtml, dojoWin) {

    var CoEditIndicator = declare('writer.ui.widget.CoEditIndicator', [_Widget, _Templated], {

        userId: null,
        label: null,
        forCursor: true,

        templateString: template,

        postCreate: function() {
            this.inherited(arguments);
            this.domNode.style.display = "none";
            this.ownerDocumentBody.appendChild(this.domNode);
            if (!this.forCursor)
                domClass.add(this.domNode, "forLine");
            else
                domClass.add(this.domNode, "forCursor");
        },

        show: function(target, line) {

            if (!target || domStyle.get(target, "display") == "none" || !target.parentNode) {
                return;
            }

            dojoWin.withDoc(this.ownerDocument, function() {
                var pos = dojoHtml.coords(target, true);
                this.domNode.style.position = "absolute";
                this.domNode.style.visibility = "hidden";
                this.domNode.style.display = "";
                var myHalfHeight = 10;
                if (this.forCursor) {
                    this.domNode.style.left = (pos.l + 3) + "px";
                    this.domNode.style.top = pos.t + pos.h / 2 - myHalfHeight + "px";
                } else {
                    var scale = pe.lotusEditor.getScale() || 1;
                    var pos2 = dojoHtml.coords(line, true);
                    var padding = 10;
                    if (scale != 1) {
                        pos.x = (pos.x - padding) / scale + padding;
                        pos2.y = (pos2.y - padding) / scale + padding;
                    }
                    if (domClass.contains(line, "rtl")) {
                    	domClass.add(this.domNode, "rtl");

                    	var offset = pos2.x + pos.w + 10;
                    	var nextSibling = target.nextSibling;
                    	while (nextSibling && (nextSibling.tagName.toLowerCase() == "span")) {
                    		offset += nextSibling.offsetWidth;
                    		nextSibling = nextSibling.nextSibling;
                    	}
                    	this.domNode.style.left = offset + "px";
                    } else {
                    	this.domNode.style.left = (pos.x - this.domNode.offsetWidth - 20) + "px";
                    }
                    this.domNode.style.top = pos2.y + pos2.h / 2 - myHalfHeight + "px";
                }
                this.domNode.style.visibility = "visible";
            }, this);
        },

        hide: function(aroundNode) {
            this.domNode.style.display = "none";
        }

    });

    return CoEditIndicator;
});
