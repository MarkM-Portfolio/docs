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
    "dojo/dom-style",
    "dojo/topic",
    "concord/util/browser",
    "writer/common/tools",
    "writer/constants",
    "writer/util/ModelTools",
    "writer/view/update/BlockContainerView",
    "writer/view/update/BlockView"
], function(declare, domStyle, topic, browser, tools, constants, ModelTools, BlockContainerView, BlockView) {

    var TableViewUpdate = declare("writer.view.update.TableViewUpdate", null, {
    	constructor: function() {}

    });

    TableViewUpdate.prototype = {
        update: function() {
            if (this.isReseted()) {
                this.reset(true);
                return;
            }
            if (!this.changedView || this.changedView.len == 0) {
                return;
            }

            var headChanged = false;
            if (this.changedView && this.changedView.forEach) {
                this.changedView.forEach(function(node) {
                    if (node.model && (node.model.isTblHeaderRepeat() == true) && ModelTools.isInDocTable(node.model)) {
                        headChanged = true;
                        return;
                    }
                });
            }
             delete this.changedView;
            if(this.rows.length() == 0)
            {
            	this.visible = false;
                this.marginTop = 0;
                this.marginBottom = 0;
                this.marginLeft = 0;
                this.h = 0;
                this._h = 0;
                this.w = 0;

                if (this.isDirtyDOM() || toNotify || headChanged)
                    this.getParent().notifyUpdate([this]);
            }
            else
            {
            	this.visible = true;
                this.getTableMatrix();
                var h = this.getBoxHeight();
                var w = this.w;
                var top = 0;
                var rowWidth = 0;
                var row = this.rows.getFirst();
                var toNotify = false;
                while (row) {
                    if (row.isResized()) {
                        toNotify = true;
                    }
                    row.setContentTop(top);
                    if (!row.hasLayouted()) {
                        row.layout(this);
                    } else if (row.changeCSSStyle()) {
                        row.updateRowCSSStyle();
                    } else {
                        row.update();
                    }
                    top += row.getBoxHeight();
                    rowWidth = Math.max(rowWidth, row.getBoxWidth());
                    row = this.rows.next(row);
                }
                this.h = top + ((this.getTopEdge() + this.getBottomEdge() + this.marginTop + this.marginBottom));
                this._h = top;
                var h1 = this.getBoxHeight();
                this.w = rowWidth;
                if ((this.w != w || h != h1) && !this.isDirtyDOM()) {
                    this.updateDOMSize();
                }
                if (this.isDirtyDOM() || h != h1 || toNotify || headChanged) {
                    this.getParent().notifyUpdate([this]);
                }
            }
            
            var mobileUtil = concord.util.mobileUtil;
            if (mobileUtil && browser.isMobile() && mobileUtil.tableResize.tableInfo && mobileUtil.tableResize.tableInfo.tableView.model == this.model) {
                mobileUtil.tableResize.viewUpdated();
            }
        },
        updateDOMSize: function() {
            this.adjustAlign();
            var node = this.getMainNode();
            if (!node) return;
            domStyle.set(node, {
                "height": this.getContentHeight() + "px",
                "width": this.w + "px",
                "margin-left": this.marginLeft + "px"
            });
            //		this.updateTaskNode();
            topic.publish(constants.EVENT.TBLDOMCHG, this);
        },
        updateTaskNode: function() {
            if (pe.lotusEditor.getTaskHdl())
                pe.lotusEditor.getTaskHdl().updateTaskNode(this);
        },
        deleteView: function(view) {
            if (this.isReseted())
            	//defect 54977, reseted view will rebuild it's rows container 
                return;
            this.rows.remove(view);
            if (this.rows.length() == 0 && this.model.rows.length() == 0) {
                this.deleteSel();
            }
        },
        updatePosition: function(body) {
            this.parent = body;
            if(this.visible)
            {
	            var oldMarginTop = this.marginTop;
	            this.calculateMarginTop();
	            if (oldMarginTop != this.marginTop) {
	                this.h = this.h - oldMarginTop + this.marginTop;
	                this._dirtyDOM = true;
	            }
            }
        }
    };
    tools.extend(TableViewUpdate.prototype, new BlockView());
    tools.extend(TableViewUpdate.prototype, new BlockContainerView());
    return TableViewUpdate;
});
