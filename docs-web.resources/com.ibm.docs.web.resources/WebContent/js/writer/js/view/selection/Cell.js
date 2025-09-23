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
    "writer/view/selection/Base",
], function(declare, domClass, domConstruct, domStyle, Base) {

    var Cell = declare("writer.view.selection.Cell", Base, {
        constructor: function(createParam) {
            var cell = createParam.viewItem;
            if (cell && cell.domNode) {
                var cellDom = cell.domNode;
                this._domNode = domConstruct.create("div", null, cellDom);
                domClass.add(this._domNode, "cellSelection");
                domStyle.set(this._domNode, "position", "absolute");
                domStyle.set(this._domNode, "zIndex", this._selectLayer);
                domStyle.set(this._domNode, 'left', cell.cellSpacing + 'px');
                domStyle.set(this._domNode, 'width', cell.getBoxWidth() + 'px');
                domStyle.set(this._domNode, 'top', cell.cellSpacing + 'px');
                domStyle.set(this._domNode, 'height', cell.getBoxHeight() + 'px');
                this.highLight();
            }
        }
    });
    return Cell;
});
