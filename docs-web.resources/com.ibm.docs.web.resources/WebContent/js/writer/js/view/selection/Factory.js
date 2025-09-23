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
    "dojo/_base/lang",
    "writer/util/ViewTools",
    "writer/view/selection/Anchor",
    "writer/view/selection/Base",
    "writer/view/selection/Cell",
    "writer/view/selection/Text"
], function(declare, lang, ViewTools, Anchor, Base, Cell, Text) {

    var facSelections = {
        "text.Line": Text,
        "table.Cell": Cell
    };
    var Factory = declare("writer.view.selection.Factory", null, {
        getSelectionClass: function (type) {
            return facSelections[type];
        },

        createSelection: function (params) {
            var viewItem = params.viewItem;
            var viewType = viewItem.getViewType && viewItem.getViewType();
            var selectionClass = this.getSelectionClass(viewType);
            if (selectionClass)
                return new selectionClass(params);
            else if (ViewTools.isAnchor(viewItem))
                return new Anchor(params);
            else
                return null;
        }

    });
    return Factory;
});
