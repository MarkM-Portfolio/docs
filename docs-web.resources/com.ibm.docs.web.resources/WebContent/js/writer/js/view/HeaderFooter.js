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
    "dojo/dom-construct",
    "dojo/dom-style",
    "concord/util/BidiUtils",
    "writer/common/Container",
    "writer/util/ViewTools",
    "writer/view/AbstractView",
    "writer/view/SpaceBlock",
    "writer/view/update/tools",
    "dojo/i18n!writer/nls/lang"
], function(declare, domConstruct, domStyle, BidiUtils, Container, ViewTools, AbstractView, SpaceBlock, viewUpdateTools, i18nlang) {

    var HeaderFooter = declare("writer.view.HeaderFooter", [AbstractView, SpaceBlock], {
        _MAX_PERCENT_OF_BODY_HEIGHT: 2 / 5,

        constructor: function(page, model, space, left) {
            this.generateUUID();
            this.model = model;
            this.bodySpace = space;
            this.page = page;
            this.left = left;
            this.top = 0;
            this.offsetY = 0;
            this.container = new Container(this);
            if (this.model && this.model.container) {
                var contents = this.model.container;
                var c = contents.getFirst();
                while (c) {
                    var m = c.preLayout(this.getOwnerId());
                    this.container.append(m);
                    c = contents.next(c);
                }
            }
            model.addViewer(this, this.getOwnerId());
            this._origianSetting = this.bodySpace.clone();
        },
        destroy: function() {
            this.model.removeViewer(this);
            var obj = this.container.getFirst();
            while (obj) {
                obj.destory && obj.destory();
                obj = this.container.next(obj);
            }
        },
        left: 0,
        top: 0,
        getViewType: function() {
            return 'page.HeaderFooter';
        },
        getContainer: function() {
            return this.container;
        },

        getLeft: function() {
            return this.left;
        },

        getTop: function() {
            return this.top;
        },
        _getContentNode: function() {
            return this.contentNode;
        },
        /*
         * if offsetY is over max percent of body height, then cut it
         * @param offsetY
         */
        _checkHeight: function(offsetY) {
            var maxBodyHeight = this.page.getHeight() - this.page.section.pageMargin.top - this.page.section.pageMargin.bottom;

            var maxHeight = maxBodyHeight * this._MAX_PERCENT_OF_BODY_HEIGHT + 0.5;

            if (offsetY - this.page.section.getHeaderMinH() > maxHeight) {
                offsetY = maxHeight;
            }

            return offsetY;
        },

        //TODO: update body after header/footer size changed
        update: function(view) {
            var para = this.container.getFirst();
            while (para) {
                if (!para.hasLayouted()) {
                    para.layout(this);
                    this._changeDOM = true;
                }
                if (para.isDirtyDOM()) {
                    this._changeDOM = true;
                }
                para = this.container.next(para);
            }

            var offsetY = 0;
            //no need to layout again, since header/footer doesn't change page
            //align paragraph tops
            para = this.container.getFirst();
            while (para) {
                para.top = offsetY;
                para.left = 0;
                offsetY = offsetY + para.h;
                para = this.container.next(para);
            }

            this.contentHeight = offsetY;

            // if offsetY is over max percent of body height, then cut it
            offsetY = this._checkHeight(offsetY);
            var updated = false;
            if (this.bodySpace.h < offsetY) {
                var delH = offsetY - this.bodySpace.h;
                this.bodySpace.h = offsetY;
                this._updateHeaderFooterHeight(delH, offsetY);
                updated = true;
            } else if (this.bodySpace.h > offsetY) {
                var t = Math.max(this._origianSetting.h, offsetY);
                var delH = t - this.bodySpace.h;
                this.bodySpace.h = t;
                this._updateHeaderFooterHeight(delH, offsetY);
                updated = true;
            }

            if (this._changeDOM && this.domNode) {
                viewUpdateTools.updateDOM(this.getContainer(), this._getContentNode());
                delete this._changeDOM;
            }

            return updated;
        },
        getPage: function() {
            return this.page;
        },
        getPages: function() {
            var doc = ViewTools.getDocument(this.page);
            return doc.getPages();
        },
        getParent: function() {
            return null;
        },
        notifyUpdate: function(args, type) {
            if (!args instanceof Array) {
                console.error("the arg must be array");
            }
            if (type) {
                switch (type) {
                    case "update":
                        this.addChangedView(args[0]);
                        break;
                    case "insertBefore":
                        this.insertBefore(args[0], args[1]);
                        args[0].layout(this);
                        this._changeDOM = true;
                        break;
                    case "insertAfter":
                        this.insertAfter(args[0], args[1]);
                        args[0].layout(this);
                        this._changeDOM = true;
                        break;
                    case "delete":
                        this.container.remove(args[0]);
                        this._changeDOM = true;
                        break;
                    case "append":
                        this.container.append(args[0]);
                        args[0].parent = this;
                        this._changeDOM = true;
                        break;
                }
            } else {
                this.addChangedView(args[0]);
            }

        },
        insertBefore: function(para, tar) {
            this.container.insertBefore(para, tar);
            para.parent = this;
            this.addChangedView(para);
            para.inserted = true;
        },
        insertAfter: function(para, tar) {
            this.container.insertAfter(para, tar);
            para.parent = this;
            this.addChangedView(para);
            para.inserted = true;
        },
        addChangedView: function(view) {

        },
        getHeight: function() {
            return this.bodySpace.h;
        },
        getWidth: function() {
            return this.bodySpace.w;
        },
        _updateAnchor: function() {
            var para = this.container.getFirst();
            while (para) {
                para.updateAnchor && para.updateAnchor(this);
                para = this.container.next(para);
            }
        },
        /**
         * @abstract layout
         */
        layout: function() {
            return;
        },
        _createDOM: function() {
            var className = "header";
            if (this.getViewType() == "page.Footer") {
                className = "footer";
            }
            var pageNode = domConstruct.create("div", {
                "class": "headerArea",
                "style": ("position:absolute;left:0px;padding-left:" + this.left + "px;padding-right:" + this.left + "px;top:" + this.top + "px;width:" + this.bodySpace.w + "px;height:" + this.bodySpace.h + "px;overflow:visible;z-index:-20001")
            });
            var nls = i18nlang;
            var page = this.getPage();
            var title = nls.headerTitle;
            if (page.isDiffFirstPage)
                title = nls.firstheaderTitle;
            else if (page.isOddPage)
                title = nls.oddheaderTitle;
            else if (page.isEvenPage)
                title = nls.evenheaderTitle;
            this.bottomNode = domConstruct.create("div", {
                "class": className,
                "style": ("position:absolute;left:0px; top:" + this.bodySpace.h + "px;width:" + page.getWidth() + "px;height:5px;overflow:visible;z-index:-19999")
            }, pageNode);
            var left = window.BidiUtils.isGuiRtl() ? 666.3 : 112;
            this.titleNode = domConstruct.create("div", {
                "class": "headerTitle",
                "style": ("position:absolute; top:" + this.bodySpace.h + "px;left:" + left + "px; overflow:visible;z-index:-19999")
            }, pageNode);
            this.titleTextLeftNode = domConstruct.create("div", {
                "class": "headerTitleLeft",
                "style": ("position:relative; top:0px;height:31px; overflow:visible;z-index:-19999")
            }, this.titleNode);
            this.titleTextNode = domConstruct.create("div", {
                innerHTML: title,
                "class": "headerTitleContent",
                "style": ("position:relative; top:0px; overflow:visible;z-index:-19999")
            }, this.titleNode);
            this.titleTextRightNode = domConstruct.create("div", {
                "class": "headerTitleRight",
                "style": ("position:relative; top:0px;height:31px; overflow:visible;z-index:-19999")
            }, this.titleNode);
            this.titleTextBottomNode = domConstruct.create("div", {
                "class": "headerTitleBottom",
                "style": ("position:relative; top:0px;height:31px; overflow:visible;z-index:-19999")
            }, this.titleNode);
            var param = this.container.getFirst();
            this.contentNode = domConstruct.create("div", {
                "style": ("position:absolute;left:0px;padding-left:" + this.left + "px;padding-right:" + this.left + "px;top:" + this.contentTop + "px;width:" + this.bodySpace.w + "px;height:" + this.bodySpace.h + "px")
            }, pageNode);
            while (param) {
                var childNode = param.render();
                delete param.insertedDOM;
                this.contentNode.appendChild(childNode);
                param = this.container.next(param);
            }
            return pageNode;
        },
        render: function() {
            if (!this.domNode) {
                this.domNode = this._createDOM();
            }

            this.drawSpace();

            return this.domNode;
        },
        alignItem: function() {
            var left = 0,
                top = 0;
            this.container.forEach(function(para) {
                para.left = left;
                para.top = top;
                top = top + para.h;
            });
        },
        getContentLeft: function() {
            return this.getPage().getContentLeft() + this.left;
        },
        getContentTop: function() {
            return this.getPage().getContentTop() + this.contentTop + this.top;
        },
        getContentTopToPage: function() {
            return this.contentTop + this.top;
        },
        getElementPath: function(x, y, path, options) {
            return this.getSpaceElementPath(x, y, path, options);
        },
        listener: function(message, param) {
            // temp, disable hidden
            return;

            if (message == "editModeChange") {
                if (this.domNode) {
                    var isHFEditing = param;
                    domStyle.set(this.domNode, {
                        "overflow": isHFEditing ? "visible" : "hidden"
                    });
                }
            }
        }

    });
    return HeaderFooter;
});
