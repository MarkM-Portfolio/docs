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
    "dojo/has",
    "dojo/topic",
    "writer/constants",
    "writer/model/Model",
    "writer/util/ViewTools",
    "writer/view/Run"
], function(declare, lang, has, topic, constants, Model, ViewTools, Run) {

    //This run only exist in Header/footer
    var PageNumber = declare("writer.view.PageNumber", Run, {
        constructor: function(model, ownerId, start, len) {
            this.init(start, len);
            topic.subscribe(constants.EVENT.PAGE_NUMBER_CHANGED, lang.hitch(this, this._onPageChanged));
        },

        getViewType: function() {
            return "text.PageNumber";
        },

        _onPageChanged: function() {
            if (this.domNode) {
                var text = this._getText();
                if (text != this.text) {
                    if (text.length == this.text.length) {
                        if (has("ie") && has("ie") < 9) {
                            this.domNode.innerText = text;
                        } else {
                            this.domNode.textContent = text;
                        }
                    } else {
                        this.model.markDirty();
                        var para = ViewTools.getParagraph(this);
                        this.model.paragraph.markDirty();
                        this.model.paragraph.parent.update();
                        pe.lotusEditor.updateManager.update();
                    }
                    this.text = text;
                }
            }
        },
        /**
         * intern function
         * calculate page number text
         * @returns {String}
         */
        _getText: function() {
            var text = "###"; // for the non-autofit textbox has min size so that not overlap the pagenumber.
            var field = this.model.parent;

            var vTools = ViewTools;
            var page = vTools.getPage(this);
            if (!page && this._layoutLine)
                page = vTools.getPage(this._layoutLine);
            if (page) {
                if (field.isTotalPageNumber()) {
                    var totalNumber = page.parent.pages.length();
                    text = totalNumber + "";
                } else if (field.isPageNumber()) {
                    var pageNumber = page.pageNumber;
                    text = pageNumber + "";
                }
            }
            if (BidiUtils.isArabicLocale())
            	text = BidiUtils.convertArabicToHindi(text + "");

            return text;
        },
        /**
         * get text for render
         */
        getText: function() {
            this.text = this._getText();
            return this.text;
        },

        layout: function(line) {
            this._layoutLine = line;
            this.inherited(arguments);
        },

        _offsetToIndex: function(offset, forceFit) {
            var text = this.getText();
            if (!text) {
                return -1;
            }

            if (offset < 0) {
                //click before head of line
                if (offset > -20) {
                    return 0;
                } else {
                    //click too far from head of line
                    return -1;
                }
            }
            var index;

            var currentWidth = this.w;
            if (offset <= currentWidth / 2)
                return 0;
            else
                return 1;

        },
        getElementPath: function(x, y, h, path, options) {
            var index;
            var fixedX;
            if (x > this.w / 2) {
                index = 1;
                fixedX = this.w;
            } else {
                index = 0;
                fixedX = 0;
            }
            var run = {
                "delX": fixedX - x,
                "delY": this._getDOMOffsetTop() - y,
                "index": index,
                "offsetX": fixedX,
                "lineH": h,
                "h": this.h
            };
            path.push(run);
        },

        getChildPosition: function(idx) {

            var x = this.getLeft();
            var y = this.getTop();
            if (idx == 0) {
                return {
                    'x': x,
                    'y': y
                };
            } else {
                return {
                    'x': x + this.w,
                    'y': y
                };
            }

        },
        // Can't get text so override it to do nothing.
        preMeasure: function() {

        },
        canSplit: function() {
            return false;
        },
        canFit: function(w, h) {
            if (this.w > w) {
                return false;
            }
            return true;
        }
    });
    Model.prototype.viewConstructors[constants.MODELTYPE.PAGENUMBER] = PageNumber;
    return PageNumber;
});
