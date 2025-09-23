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
    "dojo/has",
    "writer/constants",
    "writer/model/Model",
    "writer/util/BookmarkTools",
    "writer/view/Run"
], function(declare, has, constants, Model, BookmarkTools, Run) {

    //This run only exist in Header/footer
    var BookMark = declare("writer.view.BookMark", Run, {
        constructor: function(model, ownerId, start, len) {
            this.w = 0;
            this.h = 0;
            this.init();
        },

        getViewType: function() {
            return "bookMark";
        },

        getText: function() {
            return "";
        },

        canSplit: function() {
            return false;
        },
        canFit: function(w, h) {
            return true;
        },

        render: function(parentChange) {
            if (!this.domNode || this._updateDOM) {
                delete this._updateDOM;
                this.domNode = this._createRunDOM();
                this.domNode.innerHTML = "";
                this._domLeftMargin = this._leftMargin;
            } else if (parentChange) {
                this._updateLeftMarginDom();
                var updated = this._updateDOMWidth();

                // for IE, we should re assing text content to node. if parent node was released of deattached
                // the text contents will lost.
                if (!updated && (has("ie") || has("trident"))) {
                    this.domNode.innerHTML = "";
                }
            }
            delete this._offsetTop;
            return this.domNode;
        },
        
        checkTrackClass: function()
        {
            return;  
        },

        //render mark node before line
        renderLineMark: function(line) {
            if (!this.isNeedShow())
                return null;

            if (line.domNode) {
                return BookmarkTools.createMarkNode(line, this.model);
            }
        },
        /**
         * check if need show mark node
         * @returns
         */
        isNeedShow: function() {
            return BookmarkTools.isNeedShow(this.model);
        }
    });
    Model.prototype.viewConstructors[constants.MODELTYPE.BOOKMARK] = BookMark;
    return BookMark;
});
