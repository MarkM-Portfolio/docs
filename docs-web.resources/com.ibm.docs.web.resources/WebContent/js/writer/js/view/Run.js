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
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/has",
    "dojo/query",
    "dojo/topic",
    "concord/util/BidiUtils",
    "concord/util/acf",
    "concord/util/browser",
    "concord/i18n/LineBreak",
    "writer/common/MeasureText",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Model",
    "writer/util/FontTools",
    "writer/util/HelperTools",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/util/ViewTools",
    "writer/view/AbstractView",
    "writer/track/trackChange",
    "writer/util/HtmlTools"
], function(lang, array, declare, domAttr, domClass, domStyle, domConstruct, has, query, topic, BidiUtils, acf, browser, LineBreak, MeasureText, tools, constants, Model, FontTools, HelperTools, ModelTools, RangeTools, ViewTools, AbstractView, trackChange, HtmlTools) {
    
    var Run = declare("writer.view.Run", null, {
    	constructor: function(model, ownerId, start, len) {
	        if (!model) {
	            return;
	        }
	        this.model = model;
	        this.ownerId = ownerId;
	        this.init(start, len);
    	}
    });
    Run.prototype = {
        init: function(start, len) {
            this.start = start || this.model.start || 0;
            this.len = len || this.model.length || this.model.len || 0;
            this.paddingTop = 0;
            this.paddingBottom = 0;
            this.left = 0;
            this._leftMargin = 0;
            this.leftBorderWidth = 0;
            this.rightBorderWidth = 0;
            this.borderHeight = 0;
            this.realWidth = 0;
            this._isVisibleInTrack = this.model.isVisibleInTrack();
            // for debug use
            // this._text = this.getText();
        },

        getViewType: function() {
            return 'text.Run';
        },
        getIndex: function() {
            return this.start;
        },
        getEnd: function() {
            return this.start + this.len;
        },
        /**
         * @param crossLine boolean True will get next sibling cross line.
         * @returns Return next sibling view element.
         */
        next: function(crossLine) {
            var container = this.getParent().container;
            if (!container) // Return null for text box object.
                return null;
            var next = container.next(this);
            if (crossLine && !next) {
                //			var parentSibling = this.getParent().next();
                //			next = parentSibling && parentSibling.container.getFirst();
                var line = ViewTools.getLine(this);
                var nextLine = line.getNextLine();
                next = nextLine && nextLine.getFirst();
            }
            return next ? next.canSelected() ? next : next.next(crossLine) : null;
        },
        /**
         * @param crossLine boolean True will get previous sibling cross line.
         * @returns Return previous sibling view element.
         */
        previous: function(crossLine) {
            var container = this.getParent().container;
            if (!container) // Return null for text box object.
                return null;
            var prev = container.prev(this);
            if (crossLine && !prev) {
                //			var parentSibling = this.getParent().previous();
                //			prev = parentSibling && parentSibling.container.getLast();
                var line = ViewTools.getLine(this);
                var preLine = line.getPreviousLine();
                prev = preLine && preLine.getLast();
            }
            return prev ? prev.canSelected() ? prev : prev.previous(crossLine) : null;
        },
        /**
         * get only previous inline textrun.
         */
        previousRun: function() {
            var pre = this.previous();
            if (pre && pre._vRun)
                pre = pre._vRun;
            while (pre && (pre.isAnchor || pre.getViewType() == "bookMark")) {
                pre = pre.previous();
                if(pre &&pre._vRun)
                    pre = pre._vRun;
            }
            return pre;
        },

        /**
         * The the text border size.
         */
        _getBorderSize: function() {
            var border = this.model.getBorder();
            if (border) {
                var borderSize = 0;
                if (border.sz)
                    borderSize = border.sz;
                else {
                    for (var item in border) {
                        borderSize = border[item].sz;
                        break;
                    }
                }

                var bdrSize = Math.ceil(tools.toPxValue(borderSize));

                var borderType = this.borderStyles[border.val || "single"];
                //if text border style is double and bordersize < 3,it displays as single
                //so double border style bordersize at least 3px    
                if (borderType == "double" && bdrSize < 3)
                    bdrSize = 3;

                return bdrSize;
            }
            return 0;
        },

        getTop: function() {
            var top = this.getParent().getTop();
            var delH = this._getDOMOffsetTop();
            if (delH == 0 && (this.len == 0 || this.getViewType() == "text.LineBreak")) {
                // Empty run, get previous/next run top.
                // TODO Need add predefined value for empty paragraph

                // Avoid dead loop if continued empty run occurred, add a flag to record it.
                var sibling = this.previous() || this.next();
                if (sibling && !sibling._inCalcTop) {
                    this._inCalcTop = true;
                    var ret = sibling.getTop();
                    delete this._inCalcTop;
                    return ret;
                }
            }
            return top + delH;
        },
        getChildPosition: function(idx, placeholderArg, bNeedLogicalPos) {
            var line = ViewTools.getLine(this);
            if (line && !line.bidiMap)
                line.initBidiMap();
            if (idx == 0 && !(line && line.isBidiLine())) {
                var prev = RangeTools.getPrevRun(this);
                if (prev && prev.parent == line && ViewTools.isTextRun(prev)) {
                    //same line and prev run is text run
                    return prev.getChildPosition(prev.len, placeholderArg, bNeedLogicalPos);

                }

            }

            var bCalcCursoColor = true;
            var mTools = ModelTools;
            var bColor = this.getComputedStyle()["background-color"];
            // do not Calculate Cursor color if it is empty paragraph, and its parent has no background style
            if (idx == 0 && mTools.isEmptyParagraph(this.model.paragraph)) {
                // if parent has bg color, use parent's color to calculate cursor color		    
                bCalcCursoColor = this.model.ParentBGColor ? true : false;
                bColor = this.model.ParentBGColor ? this.model.ParentBGColor : bColor;
            }
            var x = (!bNeedLogicalPos && line && line.isBidiLine()) ?
                this._logicalIndexToOffset(idx, line) : this.getLeft() + this._indexToOffset(idx);

            var y = this.getTop();
            var isItalic = this.getComputedStyle()["font-style"] == "italic";
            return {
                'x': Math.ceil(x),
                'y': y,
                "italic": isItalic,
                "bColor": HelperTools.getCursorColor(bColor, bCalcCursoColor),
                "h": this.getHeight()
            };
        },
        /**
         * If the run has no height, it's dummy.
         */
        _isDummyRun: function() {
            return (this.len == 0 || this.getViewType() == "text.LineBreak" || this.getComputedStyle()["display"] == "none" || !this.isVisibleInTrack());
        },
        getHeight: function() {
            // Empty paragraph or list and the paragraph or list have big font size.
            if (this._isDummyRun()) {
                var sibling = this.previous(true);
                while (sibling) {
                    if (sibling._isDummyRun())
                        sibling = sibling.previous(true);
                    else
                        break;
                }

                if (!sibling) {
                    sibling = this.next(true);
                    while (sibling) {
                        if (sibling._isDummyRun())
                            sibling = sibling.next(true);
                        else
                            break;
                    }
                }
                var vTools = ViewTools;
                if (sibling && !sibling._inCalcHeight && sibling.getParent() == this.getParent() && !vTools.isAnchor(sibling) && !vTools.isImage(sibling)) {
                    this._inCalcHeight = true;
                    var ret = sibling.getHeight();
                    delete this._inCalcHeight;
                    return ret;
                } else
                {
                    var line = this.getParent();
                    var lineH = line.h;
                    if (lineH == 0)
                        return line.getHeight();
                    return lineH; //fix issue 41076, not use method getHeight
                }
            }
            return this.h;
        },
        getContentHeight: function() {
            return this.h;
        },
        getBoxHeight: function() {
            return this.getContentHeight() + this.paddingTop;
        },
        getBoxWidth: function() {
            return this.getWidth() + this.getLeftMargin();
        },
        restoreWidth: function() {
            this.w = this.realWidth;
        },
        getLeftMargin: function() {
            return this._leftMargin;
        },
        initLineSpace: function(line) {
            this.paddingTop = 0;
//            if (line.fixHeight > 0 && line.fixHeight > this.h) {
//                this.paddingTop = line.fixHeight - this.h;
//            }
        },
        /**
         * Get last line break position.
         * 
         * @returns -1 if the run can't be splitted;
         *          0, the view start point is a line break pos, then this run can be put on next line(tab); 
         *          text.length, the tail of the view is a line break pos, then the run can be put on this
         *          line and next run should be next line(alignment " ");
         *          otherwise, return the last line break point
         */
        getLastBreakPoint: function() {
            // TODO(zhangjf), to query the whole paragraph text 
            var txtOriginal = this.getParaText();
            var brkPos = LineBreak.findLineBreak(txtOriginal, txtOriginal.length > this.len ? this.len : txtOriginal.length);
            if (brkPos <= 0)
                return -1;
            return brkPos;
        },
        /**
         * The function will collect word in this run and then measure them at one time.
         */
        preMeasure: function() {
            if (this.isVisibleInTrack())
                MeasureText.preMeasureText(this.getText(), this.getCSSStr());
        },
        _cleanCache: function() {
            this._isVisibleInTrack = this.model.isVisibleInTrack();
            this._sizeIndexCache = {};
            this._sizeIndexLineHead = {}; // 1
            this._sizeIndexForce = {}; // 2
            this._sizeIndexForceWithoutDist = {}; // 3
            this._cacheCSSStr = null;
            this._cacheComputedStyle = null;
            this._cacheComputedStyleFontFallbacked = false;
            this._cacheDelta = null;
            this._vRun = null;
        },
        layout: function(line) {
            delete this._relayout;
            if (this._layouted) {
                return;
            }
            this._cleanCache();
            
            if (!this.isVisibleInTrack())
            {
                this.realWidth = this.w = this.h = 0;
                this._emptyRun = true;
                this._layouted = true;
                return;
            }
            
            var text = this.getText(line);
            var size;

            var cssStr = this.getCSSStr();
            var computedStyle = this.getComputedStyle();

            // The text length is 1, just for Bullet
            if (this.model.isListRun && text.length == 1) {
                var symbolFont = "symbol";
                if (browser.isMobile() || (has("mac") && computedStyle["font-family"] && computedStyle["font-family"].toLowerCase() == symbolFont)) {
                    var fontfamily = computedStyle["font-family"].toLowerCase();
                    var fallback = concord.util.mobileUtil && concord.util.mobileUtil.getFallbackFont(text, fontfamily);
                    if(fallback) {
                        text = fallback.newText;
                        cssStr = cssStr.replace(computedStyle["font-family"], fallback.newFont);                    	
                    }
                }
            }

            if (text == "" || !text || computedStyle['display'] == "none") {
                size = MeasureText.measureTextRun("Q", cssStr);
                this.w = 0;
                this.h = size.h;

                this._emptyRun = true;
            } else {
                size = MeasureText.measureTextRun(text, cssStr);
                this.w = size.w;
                this.h = size.h;
                if (this.model.parent.parent.isWaterMarker) {
                    // make watermarker in one line, special case.
                    var fontSize = 20;
                    cssStr += "font-size:" + fontSize + "pt;display:inline-block;";
                    this.mw = this.w;
                    var size20 = MeasureText.measureTextRun(text, cssStr);
                    this.mw_20 = size20.w;
                    this.mh_20 = size20.h;

                    var parentModelW = tools.toPxValue(this.model.parent.parent.width);
                    var parentModelH = tools.toPxValue(this.model.parent.parent.height);

                    // use correct full w/h without padding.
                    this.w = parentModelW;
                    this.h = parentModelH;

                    this.realFontSize = Math.floor(fontSize / this.mw_20 * this.w);

                    cssStr += "font-size:" + this.realFontSize + "pt;display:inline-block;";
                    size20 = MeasureText._getRunSize(text, cssStr);
                    this.mw_realh = size20.h;
                    this.mw_realw = size20.w;
                }
            }
            this._layouted = true;
            this.realWidth = this.w;
        },

        clearJustifier: function() {
            this.restoreWidth();
            this.justifyCnt = 0;
            this.justifiesArray = null;
            this.markUpdateDOM();
        },

        _zoomChangedImpl: function() {
            // 1. Update this run's width and height
            this._layouted = false; // Force layout
            this.layout();

            // Defect 42611. If the run has been recalculated width. Should recalculate it again.
            if (this._appendLeftMargin != undefined && this._appendLeftMargin != 0)
                this.recalcWidth();

            // 2. Update this run's left
            var line = ViewTools.getLine(this);
            line && line.zoomChanged();
        },
        /**
         * The function only was used for layout right alignment list symbol.
         * Set the list symbol width to 1px and add left margin when render it.
         */
        recalcWidth: function() {
            this._appendLeftMargin = (this.parent && this.parent.isRtlDir) ? 5 : 5 - this.w;
            this.w = 5;
        },
        //	relayout:function(line){
        //		if(this._relayout){
        //			this.layout(line);
        //		}
        //	},
        splitInLine: function(w, forceFit) {
            var breakRun = this._splitBySize(w, forceFit);
            breakRun && breakRun != this && (breakRun._splitedInLine = true);
            return breakRun;
        },
        isSpliptedInLine: function() {
            return this._splitedInLine;
        },
        merge: function(run) {
            this.len += run.len;
            this.markRelayout();
            this.model.removeViewer(run, this.getOwnerId());
        },
        // relativedRuns: the runs have the same model. 
        updateProperty: function(relativedRuns) {
            var delIndex = this.model.start - relativedRuns[0].start;
            if (delIndex == 0) {
                return;
            } else {
                for (var i = 0; i < relativedRuns.length; i++) {
                    relativedRuns[i].start += delIndex;
                }
            }
        },
        offsetToIndexCache: function(offset, forceFit) {
            var cache;
            if (1 == forceFit) {
                cache = this._sizeIndexLineHead;
            } else if (2 == forceFit) {
                cache = this._sizeIndexForce;
            } else if (3 == forceFit) {
                cache = this._sizeIndexForceWithoutDist;
            } else {
                cache = this._sizeIndexCache;
            }
            if (cache[offset]) {
                return cache[offset];
            }

            cache[offset] = this._offsetToIndex(offset, forceFit);
            return cache[offset];
        },
        /**
         * The Function provide a delta value to reduce the measureText times.
         * 
         */
        getMeasureDelta: function() {
            if (!this._cacheDelta) {
                var size = this.getComputedStyle()['font-size'];

                if (!size) {
                    console.log("run font-size not exist");
                    return 2;
                }

                // Reduce unit PT
                var unitIndex = size.indexOf("pt");
                if (unitIndex > 0)
                    size = size.substring(0, unitIndex);
                size = parseFloat(size) || 1;
                var delta = 1;
                // The value was calculated by text "1 , . ` '"
                if (size > 30)
                    delta = 5;
                else if (size > 25)
                    delta = 4;
                else if (size > 20)
                    delta = 3;
                else if (size > 15)
                    delta = 2.4;
                else if (size > 10)
                    delta = 2;
                else if (size >= 8)
                    delta = 2;

                this._cacheDelta = delta;
            }
            return this._cacheDelta || 2;
        },

        /**
         * Get the justify postion from this index.
         * @param index
         */
        _getJustifierPosition: function(index) {
            // Can cache or record map {idx, width}
            var pos = -1;
            var text = this.getText();
            var justifyChar = '\u00a0';
            for (var i = 0; i <= index; i++) {
                if (text.charAt(i) == justifyChar)
                    pos++;
            }
            return pos;
        },

        _getTextWidth: function(text, style) {
            // Defect 45521 
            if (this.justifyCnt > 0 && (has("safari") || has("ie") <= 9)) {
                var innerHTML = "";

                var justifyChar = '\u00a0';
                var pos = 0,
                    wordIdx = 0,
                    word;
                for (var i = 0; i <= text.length - 1; i++) {
                    if (text.charAt(i) == justifyChar) {
                        if (wordIdx < i) {
                            word = text.substring(wordIdx, i);
                            innerHTML += word.replace(/&/g, "&amp;").replace(/</gi, "&lt;").replace(/>/gi, "&gt;"); // Same with me MeasureText._getWordArraySize()
                        }

                        var justifyWidth = this._justifierWidth + this.justifiesArray[pos];
                        innerHTML += "<span style='width:" + justifyWidth + "px;display:inline-block;'>" + justifyChar + "</span>";

                        pos++;
                        wordIdx = i + 1;
                    }
                }

                if (wordIdx < text.length) {
                    word = text.substring(wordIdx, text.length);
                    innerHTML += word.replace(/&/g, "&amp;").replace(/</gi, "&lt;").replace(/>/gi, "&gt;");
                }

                return MeasureText.measureHTMLWidth(innerHTML, style);
            } else {
                var tm = MeasureText.measureTextRun(text, style);
                var width = tm.w;
                if (this.justifyCnt > 0) {
                    var justifierPos = this._getJustifierPosition(text.length - 1);
                    for (var i = 0; i <= justifierPos; i++)
                        width += this.justifiesArray[i];
                }

                return width;
            }
        },

        //forceFit == 1 or true, the word is at head of line, so, split the text if the text is one word and longer than 1 line
        //forceFit == 2, force splitting word
        //forcefit == 3, force splitting word, ignore the "distance" value.
        //forceFit == 0, the word is not at head of line, so, if the text is one word, not split the text
        _offsetToIndex: function(offset, forceFit) {
            if (!this.isVisibleInTrack())
                return -1;
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

            var delta = this.getMeasureDelta();
            var currentWidth = this.w;
            var distance = 0;
            index = parseInt(text.length * offset / currentWidth);
            if (index >= 0) {
                var sub = text.substring(0, index);
                var computedStyle = this.getCSSStr();
                var measureTools = MeasureText;
                //			var tm = measureTools.measureTextRun(sub, computedStyle);
                //			var width = tm.w;
                var width = this._getTextWidth(sub, computedStyle);
                var subSize = 0;
                if (width < offset) {
                    while (width < offset && index <= text.length) {
                        if ((offset - width) <= delta) {
                            index++;
                            subSize = 0;
                            break;
                        }
                        sub = text.charAt(index);
                        if (this.justifyCnt > 0 && sub == '\u00a0') {
                            var justPos = this._getJustifierPosition(index);
                            subSize = this.justifiesArray[justPos];
                        } else
                            subSize = measureTools.measureTextRun(sub, computedStyle).w;

                        index++;
                        width += subSize;
                    }

                    if (width > offset && (width - offset) <= delta) {
                        subSize = 0;
                    } else {
                        index--;
                    }

                    if (subSize > 0) {
                        distance = (subSize + offset - width) / subSize;
                    }
                } else if (width > offset) {
                    while (width > offset && index >= 0) {
                        if ((width - offset) <= delta) {
                            subSize = 0;
                            break;
                        }
                        index--;
                        sub = text.charAt(index);
                        //					subSize = measureTools.measureTextRun(sub, computedStyle).w;
                        if (this.justifyCnt > 0 && sub == '\u00a0') {
                            var justPos = this._getJustifierPosition(index);
                            subSize = this.justifiesArray[justPos];
                        } else
                            subSize = measureTools.measureTextRun(sub, computedStyle).w;
                        width -= subSize;
                    }

                    if (offset > width && (offset - width) <= delta) {
                        subSize = 0;
                    }

                    if (subSize > 0) {
                        distance = (offset - width) / subSize;
                    }
                }
                //			obj["e"] = text.substring(0, Math.min(index, text.length));
            }
            if (index > 0) {

                // text[currentIndex] will be included in LATER run
                if (!forceFit || forceFit == 1) {
                    var currentIndex = index;

                    while (this.isSpace(text, currentIndex) && currentIndex < text.length) {
                        currentIndex++;
                    }
                    if (currentIndex == text.length) // if there's all word break from index to text end. force split in index.
                        currentIndex = index;

                    //				if (currentIndex > index) {
                    //					return currentIndex;
                    //				} else {
                    // use Unicode compliant line breaking algorithm
                    ///*
                    // don't replace SP with NBSP
                    var txtOriginal = this.getTextOriginal();
                    var brkPos = LineBreak.findLineBreak(txtOriginal, currentIndex);
                    if (brkPos <= 0) {
                        if (forceFit == 1) {
                            return index;
                        } else {
                            return -1;
                        }
                    }
                    return brkPos;
                    //*/
                    /*
                    if (this.isWordBreak(text, currentIndex)) {
                    	return currentIndex;
                    } else {
                    	currentIndex = index - 1;
                    	var canStop = !this.isWordSuffixChar(text, currentIndex);
                    	do {
                    		currentIndex--;
                    		if (currentIndex < 0) {
                    			if (forceFit == 1) {
                    				return index;
                    			} else {
                    				return currentIndex;
                    			}
                    		}
                    		if (!canStop) canStop = !this.isWordSuffixChar(text, currentIndex);
                    	} while (!this.isWordBreak(text, currentIndex) && canStop);
                    	return currentIndex + 1;
                    }
                    */
                    //////////////////////////
                    //			}
                }
            }
            //		var sizechar = writer.common.MeasureText.measureTextRun(sub, this.getComputedStyle())
            //when clicking after middle of a char, the cursor shold be after the char. But, if click at beginning of the char, cursor should be before the char
            if (forceFit == 2 && index >= 0 && distance > 0.45) {
                return index + 1;
            } else if (forceFit == 3 && index >= 0) {
                return index + 1;
            }
            return index;

        },
        _indexToOffset: function(index, byWord) {
            if (!this.isVisibleInTrack())
                return 0;
            if (index == this.len && !this.isZoomed())
                return this.w;
            else if (index > 0) {
                var text = this.getText().substring(0, index);
                //			var tm = writer.common.MeasureText.measureTextRun(text, this.getCSSStr(),byWord);
                //			return tm.w + this.leftBorderWidth;
                var width = this._getTextWidth(text, this.getCSSStr());
                return width + this.leftBorderWidth;
            } else {
                return 0;
            }

        },
        /* measure offset of logical index visually on per line basis
           caret before Bidi character should be displayed to it's right, 
           so its offset should be tweaked accordingly */
        _logicalIndexToOffset: function(logicalIndex, line) {
            var i, offset = 0,
                lineVisualIdx, charWidths = line.bidiMap.visualCharWidths,
                lineLogicalIdx = logicalIndex,
                run = this.previous();
            while (run) {
                if (run.getViewType() == 'text.Run')
                    lineLogicalIdx += run.len;
                else if (run.len == 1)
                    lineLogicalIdx += 1;
                run = run.previous();
            }
            if (lineLogicalIdx == 0) {
                lineVisualIdx = line.bidiMap.visualfromLogical[0];
                if (line.bidiMap.visualCharWidths[lineVisualIdx] < 0) //Bidi character
                    lineVisualIdx++;

                for (i = 0; i < lineVisualIdx; i++) {
                    offset += Math.abs(charWidths[i]);
                    offset += line.bidiMap.bordersWidths[i] || 0;
                }
            } else { //compute offset of previous character and add width of current
                lineVisualIdx = line.bidiMap.visualfromLogical[lineLogicalIdx - 1];
                for (i = 0; i < lineVisualIdx; i++) {
                    offset += Math.abs(charWidths[i]);
                    offset += line.bidiMap.bordersWidths[i] || 0;
                }
                if (line.bidiMap.visualCharWidths[lineVisualIdx] > 0) { //None Bidi character
                    offset += charWidths[lineVisualIdx];
                    offset += line.bidiMap.bordersWidths[lineVisualIdx] || 0;
                }
            }
            if (i == 0)
                offset += line.bidiMap.bordersWidths[i] || 0;

            offset = offset / window.BidiUtils.RATIO;
            if (line.isRtlDir) {
                var carriageNode = query(".carriageNode", line.domNode);
                if (carriageNode.length > 0)
                    offset += carriageNode[0].offsetWidth;
            }
            run = line.container.getFirst();
            while(run){
            	if(run.getViewType() == 'text.Run') {	
            		offset += run.getLeft();
					break;
            	}
			run = run.next();				
            }

            return offset;
        },
        /* @ Override
         * Test if this text run can be splitted to fit in given size
         * Returns true or false
         */
        canSplit: function(w, h, forceFit) {
            if (h > 0) {
                if (h < this.h) {
                    //				return false;
                }
            }
            if (w <= 0) {
                return false;
            }
            if (w > 0) {
                if (this.w > w && this.offsetToIndexCache(w, forceFit) <= 0) {
                    return false;
                }
            }
            return true;
        },

        canFit: function(w, h) {
            // 1 px offset
            if (this.model.parent.parent.isWaterMarker)
                return true;
            if (Math.abs(this.w - w) > 1 && this.w > w) {
                return false;
            }
            return true;
        },
        split: function(w, forceFit) {
            return this._splitBySize(w, forceFit);
        },
        _splitBySize: function(w, forceFit) {
            var newRun = null;
            var index = this.offsetToIndexCache(w, forceFit);
            if (index >= 0) {
                newRun = this.splitByIndex(index);
            }
            return newRun;
        },
        splitByIndex: function(index) {
            if (index <= 0 || index > this.len) {
                return null;
            } else if (index == this.len) {
                // Defect 38987. Like the view size is 190px, the line remaining size is 189.9px.
                // In this case breakView was null means the view was placed in this line, not broke it.
                return this;
            }

            this.markRelayout();
            var newRun = new Run(this.model, this.getOwnerId(), this.start + index, this.len - index);
            this._sizeIndexCache = {};
            this._sizeIndexLineHead = {};
            this._sizeIndexForce = {};
            this.len = index;
            this.justifyCnt = 0;
            this.justifiesArray = null;
            this.layout();
            this.model.addViewer(newRun, this.getOwnerId(), this);
            newRun.markRelayout();
            newRun.layout();
            this.markUpdateDOM();
            return newRun;
        },
        getText: function() {
            if (this.isVisibleInTrack && !this.isVisibleInTrack())
                return "";
            var text = this.model.getText(this.start, this.len);
            // TODO Need convert all space to 00a0 in conversion.
            if (text) {
                text = text.replace(/\u0020/g, '\u00a0');
            }
            return text;
        },
        getTextOriginal: function() {
            var text = this.model.getText(this.start, this.len);
            return text;
        },
        getParaText: function() {
            // get extra 16 chars
            // note that the request len may exceed the para text length
            var text = this.model.getText(this.start, this.len + 16);
            return text;
        },
        isWordSuffixChar: function(text, index) {
            //space, punctuation, number,  except a-z and A-Z
            var code = text.charCodeAt(index);
            return code < 0x41 || (code > 0x5A && code < 0x61) || (code > 0x7A && code < 0x7F);
        },
        isSpace: function(text, index) {
            var code = text.charCodeAt(index);
            if (code == 160 || code == 32) {
                return true;
            }
            return false;
        },
        isWordBreak: function(text, index) {
            return tools.isWordBreak(text, index);
        },
        //	_createRunDOM:function(){
        //		var strPadding = "";
        //		if(this.paddingTop>0){
        //			strPadding="padding-top:"+this.paddingTop+"px;";
        //		}
        //		
        //		this._calculateLeftMargin();
        //		var leftMargin = this._leftMargin + (this._appendLeftMargin || 0 );
        //		if(leftMargin!=0)
        //			strPadding = strPadding + "margin-left:"+ leftMargin + "px;";
        //		
        //		var node = document.createElement("span");
        //		node.className = "run " + this.getCSSStyle();
        //
        //		var str = (this.getStyleStr()+strPadding);
        //		if(str.length > 0)
        //			node.setAttribute("style", str);
        //		return node;
        //	},
        _checkAndSetSpellcheckMisword: function() {
            // do nothing when spell check is not enabled 
            if (!window.spellcheckerManager ||
                !window.spellcheckerManager.isAutoScaytEnabled())
                return;
            var para = this.model.paragraph;
            var scdata = para.scdata;
            if (!scdata) return;
            var miswords = scdata.misWords;
            // skip symbol list text run
            if (typeof this.model.text == 'undefined' && lang.isArray(miswords) && miswords.length > 0) {
                for (var i = 0; i < miswords.length; i++) {
                    var misword_start = miswords[i].index;
                    var misword_len = miswords[i].word.length;
                    // if in misword range, set spell check flag
                    if (!(this.start >= para.getFullIndex(misword_start + misword_len)) &&
                        !((this.start + this.len) < (para.getFullIndex(misword_start) + 1))) {
                        var cls = domAttr.get(this.domNode, "class");
                        domAttr.set(this.domNode, "class", cls + " misspellWord");
                        domAttr.set(this.domNode, "misword", miswords[i].word);
                    }
                }
            }
        },
        _calculateLeftMargin: function() {
            var line = ViewTools.getLine(this);
            this._leftMargin = 0;

            if (ViewTools.isBookMark(this))
                return this._leftMargin;

            if (!line) {
                console.log("line not exist in Run._calculateLeftMargin");
                return this._leftMargin;
            }

            if (line.listSymbol) {
                var listSymbol = line.listSymbol.getFirst();
                if (listSymbol == this && this.left > 0) {
                    // first list symbol
                    this._leftMargin = this.left - line.paddingLeft;
                    return this._leftMargin;
                }
            }

            var pre = this.previousRun();
            if (pre && (pre.left + pre.getWidth() + 1) < this.left) {
                this._leftMargin = this.left - pre.left - pre.getWidth();
            } else if (!pre && this.left > 0) {
                if (!line.listSymbol) {
                    //FIX: a line is a list, then the first run needn't margin-left
                    //a line is not a list, the first run need a margin left
                    this._leftMargin = this.left - line.paddingLeft;
                } else {
                    var lstSmb = line.listSymbol.getFirst();
                    this._leftMargin = this.left - (lstSmb.left + line.listOffset);
                }
            }

            return this._leftMargin;
        },
        _wrapSpanForSuperSub: function() {
            var style = this.getStyle();
            var verticalAlign = style['vertical-align'];

            var tc = trackChange;
            
            if (!this.isVisibleInTrack())
            {
                delete this.wrapDomNode;
                this.checkTrackClass(this.domNode);
                return this.domNode;
            }
            
            this.checkTrackClass(this.domNode);

            if (verticalAlign == "super" || verticalAlign == "sub") {
                var wrapSpan = this._createRunDOM(true);
                var marginLeft = wrapSpan.style.marginLeft;

                domAttr.remove(wrapSpan, 'style');
                if (marginLeft) {
                    domStyle.set(wrapSpan, "marginLeft", marginLeft);
                    domStyle.set(this.domNode, "marginLeft", '0px');
                }

                if (verticalAlign == "super" || verticalAlign == "sub") {
                    domStyle.set(wrapSpan, "fontSize", style['font-size']);
                    if (has("ff"))
                        domStyle.set(wrapSpan, "verticalAlign", 'baseline');
                    else
                        domStyle.set(wrapSpan, "vertical-align", 'baseline');

                    var indicator = pe.lotusEditor.indicatorManager.getIndicatorClass(this.model);
                    if (indicator) {
                        indicator = indicator.trim();
                        if (indicator.length > 0)
                            domClass.remove(this.domNode, indicator);
                    }
                }

                wrapSpan.appendChild(this.domNode);
                this.checkTrackClass(this.domNode);
                this.wrapDomNode = wrapSpan;
                return wrapSpan;
            } else {
                delete this.wrapDomNode;
                this.checkTrackClass(this.domNode);
            }
            return this.domNode;
        },

        /**
         * this method is used when render line in measureFrmame for scipt line to get real line height
         * @param domNode
         * @returns
         */
        _wrapSpan4ScriptCalc: function(domNode) {
            var style = this.getStyle();
            var verticalAlign = style['vertical-align'];
            if (verticalAlign == "super" || verticalAlign == "sub") {
                var wrapSpan = this._createRunDOM(true);
                domStyle.set(wrapSpan, "fontSize", style['font-size']);
                if (has("ff"))
                    domStyle.set(wrapSpan, "verticalAlign", 'baseline');
                else
                    domStyle.set(wrapSpan, "vertical-align", 'baseline');
                wrapSpan.appendChild(domNode);
                return wrapSpan;
            }
            return domNode;
        },
        /**
         * this method is used when render line in measureFrmame for scipt line to get real line height
         * @returns
         */
        render4Script: function() {
            var text = this.getText();
            var domNode = this._createRunDOM(true);
            if (has("ie") && has("ie") < 9) {
                domNode.innerText = text;
            } else {
                domNode.textContent = text;
            }
            return this._wrapSpan4ScriptCalc(domNode);
        },
        /**
         * Set the justifiers width in this run
         * @param Array widthArray
         */
        setJustifiesWidth: function(widthArray) {
            this.justifiesArray = widthArray;
            this.updateWidth();
        },

        /**
         * Return the justifiers total appendix width
         * @returns {Number}
         */
        updateWidth: function() {
            if (this.justifyCnt > 0) {
                this.w = this.realWidth;
                for (var i = 0; i < this.justifiesArray.length; i++)
                    this.w += this.justifiesArray[i];
            }
        },

        /**
         * Calculate the justifier width
         */
        _calcJustifyWidth: function() {
            var justifyChar = '\u00a0';
            var size = MeasureText.measureTextRun(justifyChar, this.getCSSStr());
            this._justifierWidth = size.w;
        },

        // Update width for Alignment
        _updateDOMWidth: function() {
            var updated = false;
            if (this.justifyCnt > 0) {
                if (this.domNode) {

                    this.domNode.innerHTML = "";
                    this._createChildrenDom(this.domNode);
                    updated = true;
                } else {
                    this.domeNode = this._createRunDOM();
                }

                this.updateWidth();
            }
            return updated;
        },

        _createChildrenDomImpl: function(parentNode) {
            var node;
            var para = this.model.paragraph;
            var scdata = para.scdata;
            var miswords = scdata.misWords;
            var text = this.getText(),
                start = this.start,
                len = this.len;

            for (var i = 0; len > 0 && i < miswords.length; i++) {
                var misword_visible_start = miswords[i].index;
                var misword_visible_len = miswords[i].word.length;
                var misword_start = para.getFullIndex(misword_visible_start);
                var misword_len = para.getFullIndex(misword_visible_start + misword_visible_len) - misword_start;

                // if in misword range, set spell check flag
                if (start >= (misword_start + misword_len))
                    continue;

                if ((start + len) <= misword_start) // Assume the misword array is sorted.
                    break;

                // split word for spell check
                if (misword_start > start) {
                    var splitLen = misword_start - start;
                    var word = text.substr(start - this.start, splitLen);
                    node = document.createTextNode(word);
                    parentNode.appendChild(node);

                    len -= splitLen;
                    start += splitLen;
                }

                var miswordLen = Math.min(misword_len + misword_start - start, len);

                node = document.createElement("span");
                node.textContent = text.substr(start - this.start, miswordLen);
                node.className = "misspellWord";
                domAttr.set(node, "misword", miswords[i].word);

                parentNode.appendChild(node);

                len -= miswordLen;
                start += miswordLen;
            }

            if (len > 0) {
                var word = text.substr(start - this.start, len);
                node = document.createTextNode(word);
                parentNode.appendChild(node);
            }
        },

        /**
         * Check if the content is misword from start position.
         * @param misWordIndex is an Object to record last iterate position.
         * @param start Begin with the run's start.
         * @param len
         */
        _createMisWordNode: function(misWordIndex, start, len, text) {
            start += this.start;

            var para = this.model.paragraph;
            var scdata = para.scdata;
            var miswords = scdata.misWords;

            for (var i = misWordIndex.idx; i < miswords.length; i++) {
                var misword_visible_start = miswords[i].index;
                var misword_visible_len = miswords[i].word.length;
                var misword_start = para.getFullIndex(misword_visible_start);
                var misword_len = para.getFullIndex(misword_visible_start + misword_visible_len) - misword_start;

                // if in misword range, set spell check flag
                if (start >= (misword_start + misword_len))
                    continue;

                misWordIndex.idx = i;

                if ((start + len) <= misword_start)
                    return document.createTextNode(text);

                var node = document.createElement("span");
                node.textContent = text;
                node.className = "misspellWord";
                domAttr.set(node, "misword", miswords[i].word);
                return node;
            }
            return document.createTextNode(text);
        },

        /**
         * Create child dom
         */
        _createChildrenDom: function(parentNode) {
            var hasMisWord = true;
            // do nothing when spell check is not enabled 
            if (!window.spellcheckerManager || !window.spellcheckerManager.isAutoScaytEnabled())
                hasMisWord = false;
            var scdata = this.model.paragraph.scdata;
            if (!scdata)
                hasMisWord = false;
            var miswords = scdata && scdata.misWords;
            // skip symbol list text run
            if (hasMisWord && !(typeof this.model.text == 'undefined' && lang.isArray(miswords) && miswords.length > 0))
                hasMisWord = false;

            var node;
            var text = this.getText();

            var line = ViewTools.getLine(this);
            if (window.BidiUtils.isArabicLocale() && window.BidiUtils.isBidiOn() && line && line._isTocLine() && line.container.length() > 1) {
                if (line.container.getLast() == this && RangeTools.getPrevRun(this).getViewType() == "text.Tab")
                    text = window.BidiUtils.convertArabicToHindi(text);
            }

            if (this.justifyCnt > 0) {
                var justifyChar = '\u00a0';
                // Calculate Jusifier width, then add delta width
                this._calcJustifyWidth();
                var misWordIndex = {
                    "idx": 0
                };
                var start = 0,
                    pos, alignmentNode;
                var subText;
                for (var i = 0; i < this.justifyCnt; i++) {
                    pos = text.indexOf(justifyChar, start);
                    subText = text.substr(start, pos - start);

                    if (hasMisWord)
                        node = this._createMisWordNode(misWordIndex, start, pos - start, subText);
                    else
                        node = document.createTextNode(subText);

                    alignmentNode = document.createElement("span");
                    var style = "width:" + (this._justifierWidth + this.justifiesArray[i]) + "px;display:inline-block;";
                    alignmentNode.setAttribute("style", style);
                    alignmentNode.innerHTML = justifyChar;

                    parentNode.appendChild(node);
                    parentNode.appendChild(alignmentNode);

                    start = pos + 1;
                }
                // Last part
                if (start < text.length) {
                    subText = text.substr(start, text.length - start);
                    if (hasMisWord)
                        node = this._createMisWordNode(misWordIndex, start, text.length - start, subText);
                    else
                        node = document.createTextNode(subText);

                    parentNode.appendChild(node);
                }
            } else {
                if (hasMisWord)
                    this._createChildrenDomImpl(parentNode);
                else {
                    node = document.createTextNode(text);
                    parentNode.appendChild(node);
                }
            }
        },
        _calLeftMarginCssStyle: function() {
            var strPadding = "";
            this._calculateLeftMargin();
            var leftMargin = this._leftMargin + (this._appendLeftMargin || 0);
            if (leftMargin != 0)
                strPadding = "margin-left:" + leftMargin + "px;";

            return strPadding;
        },
        _createRunDOM: function(noContent) {

            var node = document.createElement("span");
            node.className = "run";
            this._calculateLeftMargin();
            
            if (!this.isVisibleInTrack()) {
                node.style.display = "inline-block";
                
                var leftMargin = this._leftMargin + (this._appendLeftMargin || 0);
                if (leftMargin != 0)
                {
                    node.style.marginLeft = leftMargin + "px";
                }
                return node;
            }

            var strPadding = "";
            if (this.paddingTop > 0) {
                strPadding = "padding-top:" + this.paddingTop + "px;";
            }
            var leftMargin = this._leftMargin + (this._appendLeftMargin || 0);
            if (leftMargin != 0)
                strPadding = strPadding + "margin-left:" + leftMargin + "px;";


            node.className = "run " + this.getCSSStyle();

            var str = (this.getStyleStr() + strPadding);

            if (this.mw_20) {
                node.setAttribute("realh", this.mw_realh);
                node.setAttribute("realw", this.mw_realw);
                if (this.realFontSize)
                    str += "font-size:" + this.realFontSize + "pt";
            }

            if (str.length > 0)
                node.setAttribute("style", str);
                
            if (this.model.textProperty && this.model.textProperty.style.ime)
            {
                node.style.visibility = "hidden";
            }

            !noContent && this._createChildrenDom(node);

            if (!this.getText() || !this.isVisibleInTrack())
                node.style.display = "inline-block";

            return node;
        },

        handleLinkField: function() {
            if (!this.domNode)
                return;
            var p = this.model.parent;
            var linkObj = ModelTools.getLink(this.model.parent);
            if (!linkObj && p && p.modelType == constants.MODELTYPE.FIELD && p.isPageRef())
                linkObj = p;
            else if (!linkObj && ModelTools.isImage(this.model) && this.model.src && this.model.src != "")
                linkObj = this.model;
            var fieldObj = ModelTools.getField(p);
            if (linkObj || fieldObj || ModelTools.hasComments(this.model))
                topic.publish(constants.EVENT.DOMCREATED, this.model, this.domNode, this, {
                    "linkObj": linkObj,
                    "fieldObj": fieldObj
                });
        },

        render: function(parentChange) {
            if (!this.domNode || this._updateDOM) {
                delete this._updateDOM;
                this.domNode = this._createRunDOM();
                this._domLeftMargin = this._leftMargin;

                this.handleLinkField();

                pe.lotusEditor.relations.commentService.handleCommentByView(this);
            } else if (parentChange) {
                this._updateLeftMarginDom();
                var updated = this._updateDOMWidth();

                // for IE, we should re assing text content to node. if parent node was released of deattached
                // the text contents will lost.
                if (!updated && (has("ie") || has("trident"))) {
                    this.domNode.innerHTML = "";
                    if (this.isVisibleInTrack()) 
                    {
                    	this._createChildrenDom(this.domNode);
                    }
                }
            }
            this.updateWidth(); // Update for justify

            //		this._checkAndSetSpellcheckMisword();
            delete this._offsetTop;
            return this._wrapSpanForSuperSub();
        },
        _updateLeftMarginDom: function() {
            var oldV = this._domLeftMargin;
            this._calculateLeftMargin();

            var leftMargin = this._leftMargin + (this._appendLeftMargin || 0);

            if (leftMargin != oldV) {
                if (leftMargin > 0) {
                    domStyle.set(this.domNode, {
                        "marginLeft": leftMargin + "px"
                    });
                } else {
                    var line = ViewTools.getLine(this);
                    var lstSmb = line.listSymbol && line.listSymbol.getFirst();
                    if (this == lstSmb)
                        domStyle.set(this.domNode, {
                            "marginLeft": leftMargin + "px"
                        });
                    else
                        domStyle.set(this.domNode, {
                            "marginLeft": null
                        });
                }

                this._domLeftMargin = leftMargin;
            }
        },
        getCSSStyle: function() {
            return this.model.getCSSStyle();
        },
        getComputedStyle: function() {
            if (!this._cacheComputedStyle) {
                this._cacheComputedStyle = lang.clone(this.model.getComputedStyle());
                if (!this.isVisibleInTrack()) {
                    this._cacheComputedStyle["display"] = "none";
                }

                this._cacheComputedStyleFontFallbacked = false;
            }
            if (this._cacheComputedStyle && this._cacheComputedStyle["font-family"] && !this._cacheComputedStyleFontFallbacked) {
                var orig = this._cacheComputedStyle["font-family"];
                var fontFamily = FontTools.fallbackFonts(orig);
                if (fontFamily != orig) {
                    this._cacheComputedStyle = lang.clone(this._cacheComputedStyle);
                    this._cacheComputedStyle["font-family"] = fontFamily;
                    this._cacheComputedStyleFontFallbacked = true;
                }
            }
            return this._cacheComputedStyle;
        },
        /**
         * Use it for measure text.
         */
        getCSSStr: function() {
            if (!this._cacheCSSStr) {
                var computedStyle = this.getComputedStyle();
                this._cacheCSSStr = MeasureText.getCSSStr(computedStyle);
            }
            return this._cacheCSSStr;
        },
        getStyle: function() {
            return this.model.getStyle();
        },
        getStyleStr: function() {
            var style = this.getStyle();
            var fontsize;
            // #33722 For underline style which defined in parent style, will generated to inline.
            // Because of the underline style can't be override, so we create it as inline.
            var computedStyle = this.getComputedStyle();

            var verticalAlign = style['vertical-align'] ? style['vertical-align'] : computedStyle['vertical-align'];
            if (verticalAlign == "super" || verticalAlign == "sub") {
                style = lang.clone(style);
                if (!style['font-size'])
                    style['font-size'] = computedStyle['font-size'];
                if (!style['vertical-align'])
                    style['vertical-align'] = verticalAlign;
                fontsize = tools.transformFontSize(style);
            }
            if (computedStyle['text-decoration'])
                style['text-decoration'] = computedStyle['text-decoration'];
            //		if(!style['background-color'] && computedStyle['background-color'] ) 
            //			style['background-color'] = computedStyle['background-color'];

            if (computedStyle['color'] && (computedStyle['color'] == 'autoColor' || computedStyle['color'] == 'auto'))
                style['color'] = 'black';
            if (computedStyle['color'] && this.isTOCLink()) {
                var hardStyle = this.model.textProperty && this.model.textProperty.style;
                style = lang.clone(style);
                if (!hardStyle['color'])
                    style['color'] = 'black';
                if (!hardStyle['text-decoration'])
                    style['text-decoration'] && (delete style['text-decoration']);
                else
                    style['text-decoration'] = hardStyle['text-decoration'];
            }
            
            if(style['rFonts'] && !style['font-family'] && computedStyle['font-family'])
            	style['font-family'] = computedStyle['font-family'];
            	
            // if the run has background color
            var backgroundColor = computedStyle['background-color'];
            if (!backgroundColor) {
                // fix issue 43354
                var textboxParent = ViewTools.getTextBox(this);
                if (textboxParent)
                    backgroundColor = textboxParent.model.bgColor;
            }
            if (backgroundColor && HelperTools.isNeedChangeColor(backgroundColor))
                style['color'] = 'white';

            var str = "";
            for (var n in style) {
                if (n == "t" || n == "bdr" || n == "styleId" || n == "rFonts" || !style[n]) continue; // Ignore t:rPr; bdr, styleId
                if (n == "font-family" && this._cacheComputedStyleFontFallbacked)
                    str += n + ":" + FontTools.fallbackFonts(style[n]) + ";";
                else if (n == "font-size" && fontsize)
                    str += n + ":" + fontsize + ";";
                else if ((n == "color" || n == "background-color") && style[n] != "black" && !isNaN(parseInt(style[n], 16)))
                    str += n + ":#" + style[n] + ";";
                else
                    str += n + ":" + style[n] + ";";
            }

            var textBorder = this.model.getBorder && this.model.getBorder();
            if (textBorder && !this._isDummyRun()) {
                var borderType = this.borderStyles[textBorder.val || "single"];
                var bdrSize = this.borderHeight;

                var borderColor = textBorder.color || "auto";
                if (borderColor == "auto")
                    borderColor = "000000";

                //because the border for text only one style:outside border
                //the border from json doesn't have detailed border object like:top{}, bottom{}...
                str += "border-top:" + bdrSize + "px " + borderType + " #" + borderColor + ";" + "border-bottom:" + bdrSize + "px " + borderType + " #" + borderColor + ";";
                if (this.leftBorderWidth != 0)
                    str += "border-left:" + bdrSize + "px " + borderType + " #" + borderColor + ";";
                if (this.rightBorderWidth != 0)
                    str += "border-right:" + bdrSize + "px " + borderType + " #" + borderColor + ";";
            }
            if (has("safari"))
                str += "display: inline-block;";
            //		if(this.model.comments)
            //			str += "background-color:rgba(255,255,0,0.5);";

            str = acf.escapeXml(str, true);
            return str;
        },
        isTOCLink: function() {
        	var isTOCLink = (this.model.getStyleId() == "Hyperlink" && ModelTools.isInToc(this.model));
        	if(!isTOCLink) {
        		var linkP = ModelTools.getLink(this.model);
        		isTOCLink = (linkP && linkP.anchor && linkP.anchor.indexOf("_Toc")==0);
        	}
        	return isTOCLink;
        },
        getElementPath: function(x, y, h, path, options) {
            var index;
            var fixedX;
            if (x > this._leftMargin) {
                x -= this._leftMargin;
            } else {
                if (x < this._leftMargin / 2) {
                    var prev = this.previous();
                    if (prev) {
                        x = prev.getBoxWidth() + 1;
                        path.pop();
                        path.push(prev);
                        prev.getElementPath(x, y, h, path, options);
                        return;
                    }
                } else {
                    x = 0;
                }
            }
            if (x >= this.w) {
                index = this.len;
                fixedX = this.w;
            } else {
                index = this.offsetToIndexCache(x, 2);
                fixedX = this._indexToOffset(index, true);
            }
            var run = {
                "delX": fixedX - x,
                "delY": this._getDOMOffsetTop() - y,
                "index": index,
                "h": this.getContentHeight()
            };
            path.push(run);

        },
        _getDOMOffsetTop: function() {
            var page = ViewTools.getPage(this);
            if (!this._offsetTop && (!page || !page.domNode))
                return this.borderHeight;
                
            if (!this._offsetTop && ((this.isVisibleInTrack() && !this.domNode)))
                return this.borderHeight;

            if (this._offsetTop == undefined) {
                if (!this.isVisibleInTrack())
                {
                    if (this.domNode)
                    {
                        /*
                    	var pos = domStyle.get(this.domNode, "position");
                    	this.domNode.style.position = "relative";
                        this.domNode.style.width = "0px";
                        this.domNode.style.display = "";
                        var html = this.domNode.innerHTML;
                        this.domNode.innerHTML = "A";
                        this._offsetTop = this.domNode.offsetTop;
                        this.domNode.innerHTML = html;
                        this.domNode.style.display = "inline-block";
                        this.domNode.style.position = pos;
                        */
                        this._offsetTop = this.parent ? this.parent.paddingTop + this.parent.marginTop + this.parent.runBorderPadding + 2 : 2;
                        // console.warn("FIXME, check deleted text' position " + this._offsetTop)
                    }
                    else
                    {
                        if (this._vRun)
                        {
                            this._offsetTop = this._vRun._getDOMOffsetTop();
                        }
                        else
                        {
                            this._offsetTop = this.parent ? this.parent.paddingTop + this.parent.marginTop + this.parent.runBorderPadding + 2 : 2;
                        }
                    }
                }
                else if (this._emptyRun) {
                    // the 2px is approximate value compensate the height between font base-line and line bottom
                    this._offsetTop = this.parent ? this.parent.paddingTop + this.parent.marginTop + this.parent.runBorderPadding + 2 : 2;
                } else if (Math.abs(this.parent.getHeight() - this.h) <= 1 && this.parent.getPaddingTop() == 0) {
                    this._offsetTop = 0;
                } else {
                    // Defect 43851, in IE10 if the line only has one word, the run's offsetTop will be wrong.
                    // Change the mis word class to run direclty
                    // <span class='line'> <span class='run'> <span class='misword'>helllo</span></span></span>
                    if ((has("ie") || has("trident")) && !ViewTools.isTextBox(this)) // Defect 44280 for text box.
                    {
                        var style = this.getStyle();
                        var verticalAlign = style['vertical-align'];
                        if (verticalAlign == "super" || verticalAlign == "sub") {
                            // Defect 37759 
                            if (verticalAlign == "super")
                            {
                                // Defect 55746
                                // IE's own problem, image in line, this is wrong. 3 is a magic number, looks good..
                                this._offsetTop = this.domNode.offsetTop - this.domNode.offsetHeight + 3;
                                if (this._offsetTop < 0)
                                    this._offsetTop = 0;
                                // TODO, maybe we need refactor this, not use vertical-align to do the styling, but use own algorithm to calculate.
                            }
                            else
                                this._offsetTop = this.domNode.offsetTop;
                        } else if (this.domNode.childNodes.length == 1 && this.domNode.firstChild.nodeType == 3) // Text node
                            this._offsetTop = this.domNode.offsetTop;
                        else {
                            this._offsetTop = this.domNode.firstChild.offsetTop || 0;
                            // Defect 43938, in this case first text node's offset top is 0, but misword(span node)'s offset top is not 0.
                            if (this.domNode.childNodes.length > 1) {
                                var secondChild = this.domNode.firstChild.nextSibling;
                                this._offsetTop = Math.max(this._offsetTop, (secondChild.offsetTop || 0));
                            }
                        }
                    } else
                        this._offsetTop = this.domNode.offsetTop;
                }
            }
            return this._offsetTop + this.borderHeight;
        },
        getBody: function() {
            var par = this.getParent();
            while (par) {
                if (par.getViewType && par.getViewType() == "page.Body") {
                    return par;
                }
                par = par.getParent();
            }
            return null;
        },
        // this run need to be relayout.
        markRelayout: function() {
            this._relayout = true;
            delete this._layouted;
            this.markUpdateDOM();
        },
        markDelete: function() {
            this._delete = true;
        },
        isDirty: function() {
            return this._relayout == true;
        },
        isDeleted: function() {
            return this._delete == true;
        },
        markUpdateDOM: function() {
            this._updateDOM = true;
        },
        markSplittedFlag: function() {
            this._splitedInLine = true;
        },
        /**
         * avoid warning in abstractview
         * @returns
         */
        getContainer: function() {
            return null;
        },
        //	fontSytle:["font-size","font-family","color","background-color","font-weight","font-style","font-variant","text-decoration",
        //	           "vertical-align","letter-spacing","text-transform"]

        setParent: function(parentLine) {
            // todo, need more strict check here
            this.parent = parentLine;
        },
        checkTrackClass: function(dom) {
            this.checkTrackClassAbs(dom);
            
            if (this._delegateParas)
            {
                var tc = trackChange;
                array.forEach(this._delegateParas, function(prevRealPara){
                    var chs = prevRealPara.getRPrCh();
                    var trackDeletedUser = prevRealPara.getTrackDeletedUserInTime(chs, tc.start, tc.end);
                    domClass.add(dom, "track-deleted-rpr-" + prevRealPara.id);
                    trackDeletedUser && domClass.add(dom, "track-deleted-" + trackDeletedUser);
                    if (trackDeletedUser && tc.sum)
                    {
                        var acts = tc.sum.getActsByModel(prevRealPara, true);
                        var actsIds = array.map(acts, function(act){return "track-id-" + act.id;});
                        if (actsIds && actsIds.length)
                        {
                            var arr = ["track-id-listed"].concat(actsIds);
                            domClass.add(dom, arr);
                        }
                    }
                })
                
            }
            
        }

    };
    Model.prototype.viewConstructors[constants.MODELTYPE.TEXT] = Run;
    tools.extend(Run.prototype, new AbstractView());


    return Run;
});
