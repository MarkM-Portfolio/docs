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
    "dojo/dom-construct",
    "dojo/dom-style",
    "writer/view/selection/Base"
], function(declare, domClass, domConstruct, domStyle, Base) {

    var Anchor = declare("writer.view.selection.Anchor", Base, {

        constructor: function(createParam) {
            this._selectLayer = 2001;

            var anchor = createParam.viewItem;
            if (anchor) {
                var anchorDom = anchor.domNode;
                if (anchorDom) {
                    this._domNode = domConstruct.create("div", null, anchorDom);
                    domStyle.set(this._domNode, "position", "absolute");
                    domStyle.set(this._domNode, "zIndex", this._selectLayer);
                    domStyle.set(this._domNode, 'left', '0px');
                    domStyle.set(this._domNode, 'width', domStyle.getComputedStyle(anchorDom)["width"]);
                    domStyle.set(this._domNode, 'top', '0px');
                    domStyle.set(this._domNode, 'height', domStyle.getComputedStyle(anchorDom)["height"]);
                    this.highLight();
                }
            }
        }
    });
    return Anchor;
});
