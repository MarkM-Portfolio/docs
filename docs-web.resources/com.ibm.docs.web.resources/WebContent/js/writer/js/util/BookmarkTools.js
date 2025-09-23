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
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "writer/util/ViewTools"
], function(lang, domAttr, domClass, domConstruct, domStyle, on, ViewTools) {

    var BookmarkTools = {
        imgWidth: null,
        createMarkNode: function(line, bmkModel) {
            var domNode;
            if (!line.bookMarkDomNode || !bmkModel) {
                var srcPath = window.contextPath + window.staticRootPath + "/images/bookmark1appendix.png";
                var page = ViewTools.getPage(line);
                var top = 0; //- line.getTop();// - body.getParent().getContentTop();
                var left = -line.getLeft() - line.getRealPaddingLeft() + page.left - 6;
                domNode = domConstruct.create("img", {
                    "src": srcPath,
                    "z-index": "99",
                    "class": "bookMark",
                    "style": "position:absolute;left:" + left + "px;top:" + top + "px; height:20px"
                });
                if (bmkModel) {
                    domNode.id = bmkModel.name;
                }
                //in a row
                var row = ViewTools.getRow(line);
                if (row) {
                    domAttr.set(domNode, "row_id", row.model.id);
                    domAttr.set(domNode, "line_top", line.getTop());
                }

                //end
                line.domNode.appendChild(domNode);
                if (window.BidiUtils.isGuiRtl()) {
                    if (!this.imgWidth)
                        this.imgWidth = domNode.naturalWidth * 2 / 3;

                    domStyle.set(domNode, 'width', this.imgWidth + 'px');

                    left += domStyle.get(page.domNode, 'width') - this.imgWidth - page.left;
                    domStyle.set(domNode, 'left', left + 'px');
                    domClass.add(domNode, ' rtl');
                }
                on(domNode, "click", function(event) {
                    if (event)
                    {
                        event.preventDefault(), event.stopPropagation();
                    }
                    var plugin = pe.lotusEditor.getPlugin("BookMark");
                    plugin.editBookmark(line);
                });
                on(domNode, "mousedown", function(event) {
                    if (event)
                    {
                        event.preventDefault(), event.stopPropagation();
                    }
                });
                return domNode;
            } else {
                domNode = line.bookMarkDomNode;
                var bmkNames = (domNode.id || "").split(",");
                for (var i = 0; i < bmkNames.length; i++) {
                    if (bmkNames[i] == bmkModel.name) {
                        return domNode;
                    }
                }
                bmkNames.push(bmkModel.name);
                domNode.id = bmkNames.join(",");
            }
            return domNode;
        },
        /**
         * is bookmark name valid
         * @param name
         * @returns {Boolean}
         */
        isBookmarkNameValid: function(name) {
            name = "" + name;

            // Start with number and _, special character and space
            if (name.match(/^[0-9_]/) || name.match(/[\u20ac\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\]\{\}\\\|\;\:\'\"\,\<\>\.\?\/ ]+/))
                return false;

            return name != "";

            //  return name && name.match(/^[a-z, A-Z][a-z|A-Z|0-9]*$/);
        },

        isNeedShow: function(bmk) {
            return bmk.type != "fn" && this.isBookmarkNameValid(bmk.name) && !bmk.isTrackDeleted();
        },
        /**
         * rename bookmark
         * @param newName
         * @param bm
         */
        renameBookmark: function(newName, bm) {
            var oldName = bm.name;
            bm.name = newName;
            if (pe.lotusEditor.paraCache) {
                //check from editor
                for (var id in pe.lotusEditor.paraCache) {
                    if (pe.lotusEditor.paraCache[id].bookMarks)
                        if (pe.lotusEditor.paraCache[id].bookMarks[oldName]) {
                            delete pe.lotusEditor.paraCache[id].bookMarks[oldName];
                            pe.lotusEditor.paraCache[id].bookMarks[newName] = bm;
                        }
                }
            }
        }

    };
    return BookmarkTools;
});
