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
    "writer/util/ViewTools"
], function(declare, ViewTools) {

    var anchor = declare("writer.plugins.pastefilter.anchor", null, {
        constructor: function() {

        },
        /**
         * get image positionH if anchor image
         * @param m
         * @returns
         */
        getPositionH: function(m) {
            if (m.modelType)
                return m.positionH;
            else
                return m.anchor && m.anchor.positionH;

        },
        /**
         * get image positionV if anchor image
         * @param m
         * @returns
         */
        getPositionV: function(m) {
            if (m.modelType)
                return m.positionV;
            else
                return m.anchor && m.anchor.positionV;
        },
        /**
         * check if anchor position is same with current anchors
         * @param m
         */
        checkAnchorPosition: function(m, positionH, positionV) {
            positionH = positionH || this.getPositionH(m);
            positionV = positionV || this.getPositionV(m);
            if (positionH && positionV) {
                var sel = pe.lotusEditor.getSelection();
                var startViewObj = sel.getRanges()[0].getStartView().obj;
                var currentPara = ViewTools.getParagraph(startViewObj);
                var currentBody = ViewTools.getBody(startViewObj) || ViewTools.getTextContent(startViewObj);

                function equail(pos1, pos2, item) {
                    if (pos1.relativeFrom == "paragraph" || pos1.relativeFrom == "column") {
                        //relative from paragraph 
                        var para = item && ViewTools.getParagraph(item);
                        if (para != currentPara)
                            return false;
                    }
                    return pos1 && pos2 && pos1.relativeFrom == pos2.relativeFrom &&
                        pos1.posOffset == pos2.posOffset && !(pos1.align || pos2.align);
                }

                function addOffset(pos) {
                    // pos.align and posOffset cannot exist at same time in exported file.
                    if (pos.align)
                        return;

                    var s = pos.posOffset;
                    var r = s.toLowerCase().match(/^(-?[\d|\.]*)(pc|px|pt|em|cm|in|mm|emu)$/i);
                    if (r && r.length == 3) {
                        var n = parseInt(r[1]);
                        var unit = r[2];
                        switch (unit) {
                            case 'px':
                                n += 15;
                                break;
                            case 'em':
                            case 'pt':
                            case 'pc':
                            case 'in':
                                n += 2;
                                break;
                            case 'mm':
                                n += 15;
                                break;
                            case 'cm':
                                n += 1;
                                break;
                            case 'emu':
                                n += 360000;
                                break;
                        }
                        pos.posOffset = "" + n + unit;
                    }
                }

                var container = currentBody.getContainer(),
                    dirty = false;
                container.forEach(function(blockView) {
                    if (ViewTools.isParagraph(blockView)) {
                        blockView.container.forEach(function(item) {
                            if (ViewTools.isAnchor(item) && equail(item.model.positionH, positionH, item) && equail(item.model.positionV, positionV, item)) {
                                addOffset(positionH);
                                addOffset(positionV);
                                var order = item.model.relativeHeight;
                                if (order && m.anchor && m.anchor.relativeHeight) {
                                    m.anchor.relativeHeight = "" + (parseInt(order) + 2000);
                                }
                                dirty = true;
                                return false;
                            }
                        });
                    }
                });
                if (dirty)
                    return this.checkAnchorPosition(m, positionH, positionV)
            }
            return m;
        },
        /**
         * filter 
         * @param m
         * @returns
         */
        filter: function(m, webClipBoard, pasteBin) {
            var plugin = pe.lotusEditor.getPlugin("Field");
            if (plugin && plugin.ifInField()) {
                //do not paste into field.	
                return null;
            }
            var viewTools = ViewTools;
            var selection = pe.lotusEditor.getSelection();
            if (selection) {
                var range = selection.getRanges()[0];
                if (range) {
                    var startView = range.getStartView();
                    var startViewObj = startView && startView.obj;

                    if (startViewObj &&
                        (viewTools.getFootNote(startViewObj) || viewTools.getEndNote(startViewObj)))
                        return null;
                    if (startViewObj) {
                        //paste in text box or canvas
                        if (viewTools.getParent(startViewObj, function(item) {
                                return viewTools.isTextBox(item) || viewTools.isCanvas(item);
                            }))
                            return null;
                    }
                }
            }
            return this.checkAnchorPosition(m);
        }
    });
    return anchor;
});
