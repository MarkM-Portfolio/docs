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
    "dojo/has",
    "writer/common/MeasureText",
    "writer/util/ViewTools",
    "writer/view/Run"
], function(declare, domConstruct, has, MeasureText, ViewTools, Run) {

    var Tab = declare("writer.view.Tab", Run, {
        MIN_TAB: 1,
        w: 0,
        h: 0,
        globalDTS: null,

        LEADER_TYPE: {
            dot: '.',
            hyphen: '-',
            underscore: null,
            middleDot: '.'
        },

        constructor: function(model, ownerId, start, len) {
            this.model = model;
            this.ownerId = ownerId;
            this.init(start, len);
        },

        getViewType: function() {
            return 'text.Tab';
        },
        getLastBreakPoint: function() {
            return 0;
        },
        getChildPosition: function(idx, placeholderArg, bNeedLogicalPos) {
            var line = ViewTools.getLine(this);
            if (line && !line.bidiMap)
                line.initBidiMap();

            var x = (!bNeedLogicalPos && line && line.isBidiLine()) ?
                this._logicalIndexToOffset(idx, line) : this.getLeft() + (idx == 0 ? 0 : this.w);

            var y = this.getTop();
            var isItalic = this.getComputedStyle()["font-style"] == "italic";
            if (idx == 0) {
                return {
                    'x': x,
                    'y': y,
                    "italic": isItalic
                };
            } else {
                return {
                    'x': x,
                    'y': y,
                    "italic": isItalic
                };
            }

        },

        layout: function(line, fromList) {
            var viewTools = ViewTools;

            var oldw = this.w;
            var paragraph = line.getParent();
            var left = line.offsetX;
            var indentLeft = line.indentLeft || 0;
            if (indentLeft <= left)
                indentLeft = 0;

            this._cleanCache();

            var computedStyle = this.getComputedStyle();
            var size = MeasureText.measureTextRun("Q", computedStyle);
            var tabProperty = paragraph.directProperty.getTabs();
            var tabToUse = null;
            if (tabProperty && tabProperty != "none") {
                tabToUse = tabProperty.getTab(left);
            }
            if (!tabToUse) {
                var styleParaProperty = paragraph.directProperty.styleParaProperty
                var tabs = styleParaProperty && styleParaProperty.getTabs && styleParaProperty.getTabs();
                tabToUse = tabs && tabs.getTab && tabs.getTab(left);
            }
            var that = this;
            var _calTab = function(tabtype, tabpos, leader) {
                if (indentLeft > 0 && tabpos > indentLeft) {
                    that.w = indentLeft - left;
                    // Not Tab leading
                    return;
                } else if (tabtype == "center" || tabtype == "right" || tabtype == "decimal") {
                    //find the text between this tab and next tab, and measure the length	
                    var length = 0;
                    var current = that;
                    var nextIsFirst = false;
                    while (true) {
                        var next = paragraph.container._container.next(current);
                        if (!next && fromList) {
                            next = paragraph.container.getFirst();
                            nextIsFirst = true;
                        }
                        if (!next || next.getViewType() == "text.Tab") {
                            break;
                        }
                        next.layout(line);
                        length = length + next.w + 1;
                        if (length > line.w + line.paddingLeft - line.offsetX) {
                            // Next text can't be fit in this line.
                            // Tab will be combined with next run at next line. Like MS word.
                            that.w = length;
                            that.h = size.h;
                            return;

                        }

                        // to avoid dead loop.
                        if (nextIsFirst)
                            break;

                        current = next;
                    }
                    if (tabtype == "center") {
                        that.w = tabpos - left - length / 2;
                    } else {
                        var width = tabpos;
                        if (width > line.w + line.paddingLeft)
                            width = line.w + line.paddingLeft;
                        that.w = width - left - length;
                    }

                } else {
                    //left tab layout
                    that.w = tabpos - left;
                }
                that.leader = leader;
            };

            if (this.model.ptab) {
                // ptab
                var ptab = this.model.ptab;

                var pRelativeTo = ptab.relativeTo;
                var pLeader = ptab.leader;
                var pAlign = ptab.alignment;

                var textBlockContainer = viewTools.getTextContent(line);
                if (!textBlockContainer)
                    console.error("ptab: cannot find text area!");

                var textContentWidth = textBlockContainer.getWidth();

                // calculate pos
                var pTabPos = 0;
                if ("indent" == pRelativeTo) {
                    if ("center" == pAlign) {
                        pTabPos = Math.floor((textContentWidth - line.paddingLeft - line.alignPaddingLeft - line.rightIndent) / 2);
                    } else if ("right" == pAlign || "decimal" == pAlign) {
                        pTabPos = Math.floor(textContentWidth - line.rightIndent);
                    }
                } else if ("margin" == pRelativeTo) {
                    if ("center" == pAlign) {
                        pTabPos = Math.floor(textContentWidth / 2);
                    } else if ("right" == pAlign || "decimal" == pAlign) {
                        pTabPos = textContentWidth;
                    }
                }

                // cal tab
                _calTab(pAlign, pTabPos, pLeader);
            } else if (tabToUse) {
                // get tab from paragraph property
                _calTab(tabToUse.val, tabToUse.pos, tabToUse.leader);
            } else {
                //get global setup for tab
                if (fromList) {
                    this.h = size.h;
                    return;
                }
                if (indentLeft > 0) {
                    this.w = indentLeft - left;
                } else {
                    if (!this.globalDTS) {
                        this.globalDTS = pe.lotusEditor.setting.getDts();
                    }
                    //dummy layout
                    this.w = this.globalDTS * (Math.floor(left / this.globalDTS) + 1) - left;
                }
            }
            if (this.w != oldw) {
                this.dirty = true;
            }
            if (this.w < this.MIN_TAB) {
                this.w = this.MIN_TAB;
            }
            this.w = Math.ceil(this.w);
            this.h = size.h;
            
            if (!this.isVisibleInTrack()) 
            {
            	 this.w = this.h = 0;
            }
        },

        _zoomChangedImpl: function() {
            // Update this run's left
            var line = this.parent;
            line && line.zoomChanged();
            if (this.domNode) {
                var text = this._generateText();
                this.domNode.innerHTML = text;
            }
        },

        canSplit: function() {
            return false;
        },
        canFit: function(w, h) {
            if (this.w > w) {
                return false;
            }
            return true;
        },
        isSpace: function() {
            return true;
        },
        getText: function() {
            return "";
        },

        _generateText: function() {
            var text = (has("ie") || has("trident")) ? "&#8203;" : "\ufeff"; //zero-width char
            //var text = "\u2192"; // Right arrow, The length can't change is a problem.

            var leaderText = this.LEADER_TYPE[this.leader];
            if (leaderText) {
                text = "";
                var computedStyle = this.getComputedStyle();
                var size = MeasureText.measureTextRun(leaderText, computedStyle);
                var number = this.w / size.w;
                while (number > 0) {
                    text += leaderText;
                    number--;
                }
                if (has("ie") <= 9 || has("safari")) {
                    var totalSize = MeasureText.measureTextRun(text, computedStyle);
                    while (totalSize.w < this.w && totalSize.w + size.w < this.w) {
                        number = (this.w - totalSize.w) / size.w;
                        if (number == 0) {
                            break;
                        }
                        while (number > 0) {
                            text += leaderText;
                            number--;
                        }
                        totalSize = MeasureText.measureTextRun(text, computedStyle);
                    }
                }
            }

            return text;
        },

        render: function() {
            if (!this.domNode || this.dirty) {
                delete this.dirty;
                var w = this.w;

                var strStyle = "";
                if (this.leader == "underscore") {
                    strStyle += "border-bottom:1px solid;";
                } else if (this.leader == "middleDot") {
                    var leaderTop = -this.h * 0.3;
                    strStyle += "position:relative;top:" + leaderTop + "px";
                }

                var tabStyle = "";
                var text = this._generateText();
                var leaderText = this.LEADER_TYPE[this.leader];

                var strPadding = "";
                if (!this.model.isListRun) {
                    this._calculateLeftMargin();
                    var leftMargin = this._leftMargin + (this._appendLeftMargin || 0);
                    if (leftMargin != 0)
                        strPadding = "margin-left:" + leftMargin + "px;";
                }

                // defect 45881, shrink the height.
                var h;
                if (!this.LEADER_TYPE[this.leader]) {
                    h = Math.floor(this.parent.h * 0.8);
                    if (this.h <= h)
                        h = this.h;
                } else {
                    h = this.h;
                }

                // To fix 36878 [FF][Safari][Tab] Place cursor in the middle of paragraph, click Tab to indent, the cursor will move to upper place automatically.
                // need set style even the text is not exist
                if (leaderText || !(has("ie") || has("trident"))) // 38413, not set style to empty tab
                    tabStyle = this.getStyleStr();
                var display = (this.LEADER_TYPE[this.leader]) ? "display:inline-block;" : "display:inline-block;";
                
                if (!this.isVisibleInTrack())
                {
                    tabStyle = "";
                    strStyle = "";
                }
                
                this.domNode = domConstruct.create("span", {
                    "class": "Tab",
                    "style": tabStyle + "width:" + w + "px;height:" + h + "px;" + display + "overflow:hidden;" + strStyle + strPadding
                });

                this.domNode.innerHTML = text;

                this.handleLinkField();

                delete this._offsetTopl;
            } else {
                if ((has("ie") || has("trident"))) {
                    // for IE, we should re assing text content to node. if parent node was released of deattached
                    // the text contents will lost.
                    var text = this._generateText();
                    this.domNode.innerHTML = text;
                }
                this._updateLeftMarginDom();
            }
            
            if (!this.isVisibleInTrack()) 
            {
            	 this.domNode.innerHTML = "";
            	 this.domNode.style.overflow = ""
                 this.domNode.style.height = "";
                 this.domNode.style.width = "0px";
            }
            this.checkTrackClass(this.domNode);
            return this.domNode;
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
        }
    });
    return Tab;
});
