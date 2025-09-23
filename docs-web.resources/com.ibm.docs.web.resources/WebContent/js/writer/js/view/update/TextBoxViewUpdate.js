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
    "writer/common/Space",
    "writer/common/tools",
    "writer/util/ViewTools",
    "writer/view/update/BlockContainerView",
    "writer/view/update/tools"
], function(declare, Space, tools, ViewTools, BlockContainerView, viewUpdateTools) {

    var TextBoxViewUpdate = declare("writer.view.update.TextBoxViewUpdate", BlockContainerView, {

        constructor: function() {},

        update: function() {
            var oldWidth = this.getContentWidth();
            var oldHeight = this.getContentHeight();
            var oldContentVOffset = this.contentVOffset;

            // height not changed, width may changed
            if (!this.changedView || this.changedView.len == 0) {
                if (!this.model.isAutoWrap()) {
                    this._alignParagraph();
                    this._updateLayout(oldWidth, oldHeight, oldContentVOffset);
                }
                return;
            }

            delete this.changedView;

            // width & height may changed
            this._updateContent();
            this._alignParagraph();
            this._setAlignmentV();
            if (this._updateLayout(oldWidth, oldHeight, oldContentVOffset))
                return;

            viewUpdateTools.updateDOM(this.getContainer(), this.textboxNode);
        },

        _isAutoAdaptation: function() {
            return this.model.isAutoFit() || !this.model.isAutoWrap();
        },

        _layoutContent: function(body) {
            if (this.bodyPr) {
                var toPx = tools.toPxValue;
                this.effExtTop = toPx(this.bodyPr.tIns);
                this.effExtLeft = toPx(this.bodyPr.lIns);
                this.effExtRight = toPx(this.bodyPr.rIns);
                this.effExtBottom = toPx(this.bodyPr.bIns);

                this.effExtTop_n = this.bodyPr.tIns_n ? toPx(this.bodyPr.tIns_n) : 0;
                this.effExtLeft_n = this.bodyPr.lIns_n ? toPx(this.bodyPr.lIns_n) : 0;
                this.effExtRight_n = this.bodyPr.rIns_n ? toPx(this.bodyPr.rIns_n) : 0;
                this.effExtBottom_n = this.bodyPr.bIns_n ? toPx(this.bodyPr.bIns_n) : 0;

                this.paddingTop = this.effExtTop + this.effExtTop_n;
                this.paddingLeft = Math.ceil(this.effExtLeft + this.effExtLeft_n);
                this.paddingRight = this.effExtRight + this.effExtRight_n;
                this.paddingBottom = this.effExtBottom + this.effExtBottom_n;

                if (this.model.isWaterMarker)
                    this.paddingTop = this.paddingLeft = this.paddingRight = this.paddingBottom = 0;

                if (this.paddingTop < 0) this.paddingTop = 0;
                if (this.paddingLeft < 0) this.paddingLeft = 0;
                if (this.paddingRight < 0) this.paddingRight = 0;
                if (this.paddingBottom < 0) this.paddingBottom = 0;

                var cttW = this.getContentWidth();
                var cttH = this.getContentHeight();
                if (cttW < this.paddingLeft + this.paddingRight) {
                    this.paddingLeft = 0;
                    this.paddingRight = 0;
                }
                if (cttH < this.paddingTop + this.paddingBottom) {
                    this.paddingTop = 0;
                    this.paddingBottom = 0;
                }

                this.setContentWidth(cttW - this.paddingLeft - this.paddingRight);
                this.setContentHeight(cttH - this.paddingTop - this.paddingBottom);

                if (!this.model.isAutoWrap()) {
                    //width is determined by the text
                    var bodyW = (body.getWidth && body.getWidth()) || 0;
                    this.setContentWidth(bodyW - this.paddingLeft - this.paddingRight);
                }
                
                 this._layoutContentInside(cttW, cttH);
            }
        },
        
        _layoutContentInside: function(cttW, cttH)
        {
            // layout paragraph & calculate paragraph's height
            // The space was used for layout paragraph
            this.bodySpace = new Space(cttW, cttH);
            var para = this.container.getFirst();
            while (para) {
                if (!para.hasLayouted())
                    para.layout(this);

                para = this.container.next(para);
            }
            this._alignParagraph();
            this._setAlignmentV();
        },

        _updateLayout: function(oldW, oldH, oldContentVOffset) {
            currWidth = this.getContentWidth();
            currHeight = this.getContentHeight();

            // only when the width or height changed need to be relayout
            if (oldW != currWidth || oldH != currHeight || oldContentVOffset != this.contentVOffset) {

                var vTools = ViewTools;
                if (vTools.getCell(this) || vTools.getHeader(this) || vTools.getFooter(this))
                    this.model.updateAll();
                else {
                    // clear para
                    var para = this.container.getFirst();
                    while (para) {
                        if (para.lines && para.lines.length() != 0)
                            para.releaseLayout();

                        para = this.container.next(para);
                    }

                    this.dirty = true;

                    // When the text box in group, press enter will not update.
                    if (vTools.isCanvas(this.parent)) {
                        this.parent.dirty = true;
                    }


                    var p = ViewTools.getParagraph(this);
                    p.markRelayout();
                    p.parent.notifyUpdate([p]);
                    pe.lotusEditor.layoutEngine.rootView.update();
                }

                return true;
            }

            return false;
        },

        _alignParagraph: function() {
            var vTools = ViewTools;
            var para = this.container.getFirst();
            this.paraHeightSum = 0;
            var maxParaWidth = 0;
            var maxLineCount = 0;
            while (para) {
                para.parent = this;
                para.left = 0;
                para.top = this.paraHeightSum;
                this.paraHeightSum += para.h;

                var curParaWidth = vTools.isParagraph(para) ? para.getTextContentWidth() : para.getWidth();
                maxParaWidth = Math.max(maxParaWidth, curParaWidth);
                if (vTools.isParagraph(para))
                    maxLineCount = Math.max(maxLineCount, para.lines.length());

                para = this.container.next(para);
            }

            // auto wrap
            if (!this.model.isAutoWrap() && maxLineCount == 1)
                this.setContentWidth(maxParaWidth);

            // auto fit
            if (this.model.isAutoFit())
                this.setContentHeight(this.paraHeightSum);
        },

        _setAlignmentV: function() {
            // vertical-align
            this.contentVOffset = 0;
            if (this.model.bodyPr) {
                var off = this.getContentHeight() - this.paraHeightSum;
                if (off > 0) {
                    if (this.model.bodyPr.anchor == "ctr")
                        this.contentVOffset = off * 0.5;
                    else if (this.model.bodyPr.anchor == "b")
                        this.contentVOffset = off;
                }
            }
        },

        _updateContent: function() {
            var vTools = ViewTools;

            if (!this.model.isAutoWrap()) {
                //width is determined by the text
                var body = vTools.getTextContent(this.parent);
                var bodyW = (body.getWidth && body.getWidth()) || 0;
                this.setContentWidth(bodyW - this.paddingLeft - this.paddingRight);
                this.bodySpace.w = this.getContentWidth();
            }

            var view = this.container.getFirst();
            while (view) {
                if (view.isDeleted()) {
                    var t = this.container.next(view);
                    this.container.remove(view);
                    view = t;
                    continue;
                }
                if (!view.hasLayouted() || !this.model.isAutoWrap())
                    view.layout(this);

                view = this.container.next(view);
            }
        }
    });
    return TextBoxViewUpdate;
});
