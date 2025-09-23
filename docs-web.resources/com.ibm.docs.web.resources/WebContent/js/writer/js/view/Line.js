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
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/has",
    "dojo/json",
    "dojo/query",
    "concord/util/BidiUtils",
    "concord/util/browser",
    "writer/common/Container",
    "writer/common/MeasureText",
    "writer/common/SubContainer",
    "writer/common/tools",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/view/AbstractView",
    "writer/global",
    "dojo/i18n!writer/nls/lang",
    "writer/track/trackChange"
], function(array, declare, domClass, domConstruct, domStyle, has, JSON, query, BidiUtilsModule, browser, Container, MeasureText, SubContainer, tools, ModelTools, ViewTools, AbstractView, g, i18nLang, trackChange) {

    var Line = declare("writer.view.Line", null, {
    	constructor: function(w, h, para) {
	        this.parent = para;
	        this.init(w, h);
        	if (para.model.isRightClosure())
            	this._isVisibleInTrack = false;
    	}
    });

    Line.prototype = {
        OFFSET_HEIGHT: 4, // The 4px value from compare render same content with word.  
        isLine: function() {
            return true;
        },
        init: function(w, h) {
            this.marginTop = 0;
            this.w = w; // note! this.w does not contain this.paddingLeft!!!
            this.h = h || 0;
            this.pureH = h || 0;
            this.container = new SubContainer(this.parent.container);
            this.initAlignment();
            this.bidiMap = null;
            // If the line include same height runs, the rendered DOM include some offset, reference the run's _getDOMOffsetTop.
            // So add the offset for it. 
            this._offsetH = this.OFFSET_HEIGHT;
            this.bHasScript = false; //this variable used to indicator if the line include script(superscript or subscript)
            //bookmark node 
            this.bookMarkDomNode = null;
        },
        initAlignment: function() {
            this.offsetX = 0; // note! start with 0, contain this.paddingLeft!!!
            this.paddingLeft = 0;
            this.alignPaddingLeft = 0; // contained by this.paddingLeft after layout before render.
            this.paddingRight = 0;
            this.paddingTop = 0;
            this.paddingBottom = 0;
            this.justified = false; // this flag only added to justified line.
            // For example, the last line in a Justified paragraph has not this flag.
            this.heightRatios = -1;
            this.fixHeight = -1;
            this.rightIndent = 0;
            this.runBorderPadding = 0; // If the run has border should add the border height to line's padding
            this.listOffset = 0;
        },
        _initXSpaces: function() {
            this._XSpaces = [];
        },
        _addXSpace: function(space) {
            if (!space)
                return;

            if (space.w <= 0)
                return;

            if (0 == this._XSpaces.length) {
                var xSpace = {};
                xSpace.x = space.x;
                xSpace.w = space.w;
                this._XSpaces.push(xSpace);
            } else {
                var lastXSpace = this._XSpaces[this._XSpaces.length - 1];
                var lastXEnd = lastXSpace.x + lastXSpace.w;
                if (lastXEnd == space.x) {
                    lastXSpace.w += space.w;
                } else if (lastXEnd < space.x) {
                    var newXSpace = {};
                    newXSpace.x = space.x;
                    newXSpace.w = space.w;
                    this._XSpaces.push(newXSpace);
                } else {
                    // do nothing
                }
            }
        },
        /**
         * 
         * @param listSymbol
         * @param space
         * @param isAlignRight Boolean The bullet symbol is layout as alignment right.
         * @returns {Boolean} Return true when the line with list symbol CAN NOT fit in the space.
         */
        initListSymbol: function(listSymbol, body, space, isAlignRight) {
            var isInTableCell = ViewTools.isCell(body);
            if (isInTableCell)
                space = null;

            this.listSymbol = new Container();
            if (listSymbol.isContainer || listSymbol instanceof Array) {
                this.listSymbol.appendAll(listSymbol);
            } else {
                this.listSymbol.append(listSymbol);
            }
            var that = this;
            this.listOffset = 0;

            var layoutSymbol = function(t) {
                t.parent = that;
                if (t.getViewType() == "text.Tab") return;
                t.layout(that, true);

                var tabH = 0;
                if (t.getViewType() == "text.ImageView") {
                    var tabRun = that.listSymbol.getLast();
                    var computedStyle = tabRun.getComputedStyle();
                    var size = MeasureText.measureTextRun("Q", computedStyle);
                    tabH = size.h;
                    t.calcSize(size.h);
                } else if (isAlignRight && t.recalcWidth)
                    t.recalcWidth();

                that.listOffset += t.getWidth();
                that.h = Math.max(that.h, t.getBoxHeight());
                if (tabH)
                    that.h = Math.max(that.h, tabH);
            };

            this.listSymbol.forEach(function(l) {
                if (l instanceof Array)
                    l.forEach(layoutSymbol);
                else
                    layoutSymbol(l);
            });
            var paraProperty = this.parent && this.parent.directProperty;
            var specialType = paraProperty.getIndentSpecialType();
            var tab = this.listSymbol.getLast();
            tab.setWidth(0);
            if (paraProperty && specialType == "hanging") {
                var hangingValue = tools.toPxValue(paraProperty.getIndentSpecialValue() + "pt");
                tab.layout(that, true);
                var curTabW = tab.getWidth();
                if (curTabW > hangingValue || curTabW < this.listOffset) {
                    if (hangingValue > this.listOffset) {
                        var tabW = Math.ceil(hangingValue - this.listOffset);
                        tab.setWidth(tabW);
                        this.listOffset += tabW;
                    } else {
                        tab.layout(that);
                        this.listOffset += tab.getWidth();
                    }
                } else if (Math.abs(curTabW + this.listOffset - hangingValue) < 1) // Defect 44004
                {
                    this.listOffset += tab.getWidth();
                } else {
                    //				if(hangingValue > this.listOffset && (curTabW - this.listOffset) <= 1 ){
                    //					// For sample Bank_Enabling_Instrument_Template--CA.doc.
                    //					// List can't be aligned.
                    //					var tabW = Math.ceil(hangingValue-this.listOffset);
                    //					tab.setWidth(tabW);
                    //					this.listOffset += tabW;
                    //				}
                    //				else
                    {
                        var t = this.listOffset;
                        this.listOffset = curTabW;
                        tab.setWidth(Math.ceil(curTabW - t));
                    }
                }
            } else {
                tab.layout(that);
                if (tab.getWidth() > this.listOffset) {
                    var t = this.listOffset;
                    this.listOffset = tab.getWidth();
                    tab.setWidth(Math.ceil(tab.getWidth() - t));
                } else {
                    this.listOffset += tab.getWidth();
                }
            }

            if (space) {
                if (!this._isParaAlignLeft && !this.isRtlDir)
                    this.initBidiMap(true);

                var nextSpace = space.getNextSpaceX(that.offsetX, tab.h + this.paddingTop);
                if (!this._isParaAlignLeft && !this.isBidiLine())
                    this._addXSpace(nextSpace);
                while (nextSpace && nextSpace.w > 0 && nextSpace.w < this.listOffset) {
                    //this list symbol can not be put at the head of this line
                    nextSpace = space.getNextSpaceX(nextSpace.x + nextSpace.w + 1, tab.h + this.paddingTop);
                    if (!this._isParaAlignLeft && !this.isBidiLine())
                        this._addXSpace(nextSpace);
                }
                var lstLeft = 0;
                if (nextSpace && nextSpace.x > this.offsetX) {
                    lstLeft = nextSpace.x;
                    that.offsetX = nextSpace.x + this.listOffset;
                } else {
                    lstLeft = that.offsetX;
                    that.offsetX += this.listOffset;
                }

                var left = lstLeft;
                var curSym = this.listSymbol.getFirst();
                while (curSym) {
                    curSym.left = left;
                    left += curSym.getWidth();
                    curSym = this.listSymbol.next(curSym);
                }

                if (this.h > space.h) {
                    return true;
                }
            } else {
                var left = that.offsetX;
                var curSym = this.listSymbol.getFirst();
                while (curSym) {
                    curSym.left = left;
                    left += curSym.getWidth();
                    curSym = this.listSymbol.next(curSym);
                }

                that.offsetX += this.listOffset;
            }

            return false;
        },
        removeListSymbol: function() {
            delete this.listSymbol;
            delete this.listOffset;
        },
        /**
         * When the paragraph was split into two page. Check if the line has previous line in split paragraph.
         */
        isFirstLine: function() {
            // Defect 36857
            var views = this.parent.model.getViews(this.parent.ownerId);
            var preParentView = views && views.prev(this.parent);
            
            return (preParentView == null);
        },
        /**
         * From update will recalculate the line's width.
         */
        initProperty: function() {
            var paraProperty = this.parent && this.parent.directProperty;
            this.isRtlDir = false;
            this._isBorderDirty = null;
            if (paraProperty) {
                var paraAlignment = paraProperty.getAlign();
                this._isParaAlignLeft = !paraAlignment || "" == paraAlignment || "left" == paraAlignment;
                this._isParaAlignRight = paraAlignment == 'right';
                this._isParaAlignCenter = paraAlignment == 'centered';
                this._isParaAlignJustified = paraAlignment == 'justified';

                var isContextualSpacing = paraProperty.isContextualSpacing();
                var indLeft = Math.ceil(tools.toPxValue(paraProperty.getIndentLeft() + "pt"));
                this.indentLeft = indLeft; // this.indentLeft is used for calculate Tab position.
                this.paddingLeft = indLeft;
                this.w -= indLeft;
                var indRight = tools.toPxValue(paraProperty.getIndentRight() + "pt");
                this.w -= indRight;
                this.rightIndent = indRight;
                var specialType = paraProperty.getIndentSpecialType();
                var specialIndentVal = Math.ceil(tools.toPxValue(paraProperty.getIndentSpecialValue() + "pt"));
                var pLine = this.previous();
                var isFirstLine = this.isFirstLine();
                // Revise the real first line's padding by the first line or hanging. 
                if ((!pLine && isFirstLine) || (pLine && pLine.isFirstPrePageBreakLine())) {
                    if (specialType == "firstLine")
                        specialIndentVal = specialIndentVal;
                    else if (specialType == "hanging")
                        specialIndentVal = 0 - specialIndentVal;
                    else
                        specialIndentVal = 0; // Default

                    this.paddingLeft += specialIndentVal;
                    this.w -= specialIndentVal;

                    // First line
                    var spaceBefore = tools.toPxValue(paraProperty.getSpaceBefore() + "pt");
                    if (spaceBefore > 0) {
                        var prePara = this.parent.model.previous();
                        var preParaProperty = prePara && prePara.getDirectProperty && prePara.getDirectProperty();
                        if (preParaProperty) {

                            var isPreContextualSpacing = preParaProperty.isContextualSpacing();
                            if (preParaProperty.styleId == paraProperty.styleId && isContextualSpacing && isPreContextualSpacing) {
                                spaceBefore = 0;
                            } else {
                                /*
                                 * the real gap value between line is min(firstLineSpaceAfter, secondLineSpaceBefore)
                                 * so get previous paragraph line space after.
                                 */
                                var preSpaceAfter = tools.toPxValue(preParaProperty.getSpaceAfter() + "pt");
                                if (preSpaceAfter > 0) {
                                    var spaceOffset = spaceBefore - preSpaceAfter;
                                    if (spaceOffset > 0)
                                        spaceBefore = spaceOffset;
                                    else
                                        spaceBefore = 0;
                                }
                            }
                        }

                        this.paddingTop += Math.ceil(spaceBefore);
                    }
                }
                this.setPaddingBottom(this, paraProperty);

                var lineSpaceType = paraProperty.getLineSpaceType();
                if (lineSpaceType == "relative") {
                    this.heightRatios = paraProperty.getLineSpaceValue();
                } else if (lineSpaceType == "absolute") {
                    var lineSpacingValue = paraProperty.getLineSpaceValue();
                    if (!isNaN(lineSpacingValue))
                        lineSpacingValue += "pt";
                    // Defect 39563
                    // The root cause is line spacing and paragraph before/after algorithm was wrong.
                    // Should move them from first/last line to paragraph.
                    // Defect 58142
                    // correct solution, fixHeight should be set to padding, and para border also should be set to line
                    // and space before/after should be set as margin
                    // Currently the space after/before are incorrectly set to padding
                    // Since more risks to change it , so add fix Height to padding both with space before
                    if(!this.parent.model.isInHeaderFooter())
                    	this.fixHeight=writer.common.tools.toPxValue( lineSpacingValue);
                } else if (lineSpaceType == "atLeast") {
                    var lineSpacingValue = tools.toPxValue(paraProperty.getLineSpaceValue());
                    if (!isNaN(lineSpacingValue))
                    {
                        this.h = this.minHeight = lineSpacingValue;
                        if (this.parent.model.isRightClosure())
                            this.h = 0;
                    }
                } else {
                    this.heightRatios = 1;
                }
                this.isRtlDir = paraProperty.getDirection() == "rtl";
                if (this._isTocLine() && this.isRtlDir && paraProperty.getAlign() == "right")
                    this.paddingLeft = 0;
            }

            this.offsetX += this.paddingLeft;

            if (!this._isParaAlignLeft)
                this._initXSpaces();
        },

        updateFixHeight: function() {
            if (this.fixHeight > 0  && this.h>0 && this.fixHeight > this.h) {
                if(!isNaN(this.prevH)){
              	  if(this.h > this.prevH){
              		  var dv = this.h - this.prevH;
              		  this.paddingTop = this.paddingTop - dv;
              	  }
                } else {
                    var fixVal = this.fixHeight - this.h;
                    if(!this.paddingTop) this.paddingTop = 0;
                    this.paddingTop += fixVal;
                    this.fixHeight = this.paddingTop + this.h;            	  
                }
                this.prevH = this.h;
             }
        },

        setPaddingBottom: function(line, paraProperty) {
            var isContextualSpacing = paraProperty.isContextualSpacing();
            var spaceAfter = tools.toPxValue(paraProperty.getSpaceAfter() + "pt");
            if (spaceAfter > 0 && !line.next()) {
                line.paddingBottom = 0;
                var nextPara = line.parent.model.next();
                var nextParaProperty = nextPara && nextPara.getDirectProperty && nextPara.getDirectProperty();
                if (nextParaProperty) {
                    var isNextContextualSpacing = nextParaProperty.isContextualSpacing();
                    if (nextParaProperty.styleId == paraProperty.styleId && isContextualSpacing && isNextContextualSpacing) {
                        line.paddingBottom = 0;
                    } else
                        line.paddingBottom += spaceAfter;
                } else if (ModelTools.isNotes(line.parent.model.parent)) { // Defect 49230
                    line.paddingBottom += spaceAfter;
                }

                var preLine = line.previousEx();
                if (preLine) {
                    preLine.paddingBottom -= spaceAfter;
                    if (preLine.paddingBottom < 0)
                        preLine.paddingBottom = 0;
                    else
                        preLine.paddingBottom = Math.ceil(preLine.paddingBottom);
                }
                line.paddingBottom = Math.ceil(line.paddingBottom);
            }
        },
        getContainer: function() {
            return this.container;
        },
        canSelected: function() {
            if (this.parent.model.isRightClosure())
                return false;
            var run = this.container.select(function(run) {
                if (run.canSelected) {
                    return true;
                } else {
                    return false;
                }
            });
            return run != null;
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
        //
        getViewType: function() {
            return 'text.Line';
        },
        getContentLeft: function() {
            var left = this.getLeft() + this.alignPaddingLeft;
            if (this.listOffset && this.isRtlDir)
                left -= this.listOffset;

            return left;
        },
        // only for selection call
        getSelectionTop: function() {
            // last line of paragraph will add a offsetH
            //if (!this.next())
            //	return this.getTop() + this.OFFSET_HEIGHT;
            //else
            return this.getTop();
        },
        getContentTop: function() {
            return this.getTop() + this.paddingTop;
        },
        getHeight: function() {
            if (this.parent.model.isRightClosure())
                return 0;
            if (this.heightRatios > 0) {
                var height = Math.ceil(this.h + this.pureH * (this.heightRatios - 1));
                if (height < this.minHeight)
                    return this.minHeight;
                return height;
            } else if (this.fixHeight > 0) {
                return this.fixHeight - this.paddingTop;
            } else {
               if (this.h < this.minHeight)
                    return this.minHeight;
               return this.h;
            }
        },
        // this method return the pure text px width from line head.
        getTextWidth: function() {
            return this.offsetX;
        },
        getContentHeight: function() {
            return this.getHeight();
        },
        getBoxHeight: function() {
            return this.getContentHeight() + this.paddingBottom + this.paddingTop + this.marginTop + this.runBorderPadding;
        },
        isBidiLine: function() {
            return BidiUtils.isBidiOn() && (this.isRtlDir || (this.bidiMap && this.bidiMap.visualCharWidths));
        },
        getPaddingTop: function() {
            return (this.paddingTop + this.marginTop + this.runBorderPadding);
        },
        getPadding: function() {
            var paraProperty = this.parent && this.parent.directProperty;
            var align = paraProperty && paraProperty.getAlign();
            if (paraProperty && this.isBidiLine() && (align=='right' || (align=='justified' && this.isRtlDir)))
                this.alignPaddingLeft = this.w - this.offsetX;
            else if (paraProperty && align == 'centered' && this.isBidiLine())
                this.alignPaddingLeft = Math.round((this.w - this.offsetX) / 2) + this.paddingLeft;
            else if (paraProperty && align == 'justified') {
                if (!this._isLastLine()) {
                    var lastRun = this.container.getLast();
                    if (lastRun && lastRun.getViewType() == "text.LineBreak")
                        this.justified = false; // Not justify for the line with line break.
                    else
                        this.justified = true;
                } else
                    this.justified = false; //no need to apply justify property for last line
            }

            /* offset line to left on 'width' of would to be append carriage, carriage node should appear on left of RTL line */
            if (this.isRtlDir && !this._isTocLine() && pe.scene.isCarriageReturn() && this._isLastLine() && ViewTools.isLastViewOfModel(this.parent))
                this.alignPaddingLeft -= MeasureText.measureTextRun("\u21b2", "font-size:9pt;font-family:Arial").w;

            //		if(this.paddingLeft < 0)
            //			this.paddingLeft = 0;

            var paddingStr = "";
            var realPaddingLeft = this.getRealPaddingLeft();
            paddingStr = "margin-left:" + realPaddingLeft + "px;"; // Defect 41145
            //		if(realPaddingLeft>=0){
            //			paddingStr=  "padding-left:"+realPaddingLeft+"px;";
            //		}
            //		else{
            //			paddingStr=  "text-indent:"+realPaddingLeft+"px;";
            //		}

            if (this.paddingTop > 0 || this.marginTop > 0 || this.runBorderPadding > 0) {
                paddingStr += "padding-top:" + this.getPaddingTop() + "px;";
            }
            if (this.paddingBottom > 0) {
                paddingStr += "padding-bottom:" + this.paddingBottom + "px;";
            }
            return paddingStr;
        },
        getRealPaddingLeft: function() {
            return this.paddingLeft + this.alignPaddingLeft;
        },

        _getRunsWidth: function(runs) {
            var runsWidth = 0;
            for (var i = 0; i < runs.length; ++i)
                runsWidth += runs[i].getWidth();

            return runsWidth;
        },

        _alignRuns: function(xSpace, runs, offset, needClearJustify) {
            var left = xSpace.x + offset;
            for (var i = 0; i < runs.length; ++i) {
                var run = runs[i];
                if (needClearJustify && run.getViewType() == "text.Run")
                    run.clearJustifier();
                run.left = left;
                if(run._appendLeftMargin)
                	left += run._appendLeftMargin;
                left += run.getWidth();
            }
        },

        // restore to left alignment
        _restoreLeftAlignment: function(xSpace, runs) {
            this._alignRuns(xSpace, runs, 0, true);
        },

        // right alignment the text in seperated spaces
        _rightAlignment: function(xSpace, runs) {
            var runsWidth = this._getRunsWidth(runs);
            var offset = Math.round(xSpace.w - runsWidth);
            if (offset > 0) this._alignRuns(xSpace, runs, offset);
        },

        // center the text in seperated spaces
        _centerAlignment: function(xSpace, runs) {
            var runsWidth = this._getRunsWidth(runs);
            var offset = Math.round((xSpace.w - runsWidth) / 2);
            if (offset > 0) this._alignRuns(xSpace, runs, offset);
        },

        /**
         * The updateDom is true when the function was invoked from browser zoom change.
         * @param updateDom boolean
         */
        _justify: function(updateDom, xSpace, runs) {
            if (0 == runs.length)
                return;

            var justifyChar = '\u00a0';
            var justCnt = 0;

            // 1. Calculate justifier count
            var run = runs[0];
            for (var j = 0; j < runs.length; ++j) {
                run = runs[j];
                if (run.getViewType() == "text.Run") {
                    var text = run.getText();
                    var cnt = 0;
                    for (var i = 0; i < text.length; i++) {
                        if (text.charAt(i) == justifyChar)
                            cnt++;
                    }
                    if (cnt > 0) {
                        run.justifyCnt = cnt;
                        justCnt += cnt;
                    }
                }
            }

            if (justCnt == 0)
                return;

            // 2. Remove unused justifier from end of line. 
            //    Check if last characters is lots space in this line.
            var index = runs.length - 1;
            var lastRun = runs[index];
            var foundNormalText = false;
            while (!foundNormalText && lastRun && lastRun.getViewType() == "text.Run") {
                var text = lastRun.getText();
                var noJustifyCnt = 0;
                for (var i = text.length - 1; i >= 0; i--) {
                    if (text.charAt(i) == justifyChar)
                        noJustifyCnt++;
                    else {
                        foundNormalText = true;
                        break;
                    }
                }

                if (noJustifyCnt > 0) {
                    lastRun.justifyCnt -= noJustifyCnt;
                    justCnt -= noJustifyCnt;
                }

                --index;
                lastRun = index >= 0 ? runs[index] : null;
            }

            if (justCnt == 0)
                return;

            // 3. Calculate justifier delta width
            //var blankSpace = this.w + this.paddingLeft - this.offsetX;
            var runsWidth = this._getRunsWidth(runs);
            blankSpace = xSpace.w - runsWidth;
            var deltaW = Math.ceil(blankSpace / justCnt) - 1;
            var remainSpace = blankSpace - deltaW * justCnt;

            // 4. Set justifier space to run
            for (var j = 0; j < runs.length; ++j) {
                run = runs[j];
                if (run.getViewType() == "text.Run" && run.justifyCnt > 0) {
                    var justifyArray = [];
                    for (var i = 0; i < run.justifyCnt; i++) {
                        if (justCnt > remainSpace)
                            justifyArray.push(deltaW);
                        else
                            justifyArray.push(deltaW + 1);
                        justCnt--;
                    }
                    run.setJustifiesWidth(justifyArray);
                    run.dirty = true;

                    // 5. Update Dom when browser zoom changed.
                    if (updateDom)
                        run._updateDOMWidth();

                    if (justCnt == 0)
                        break;
                }
            }

            // 6. calculate run position based on justify
            this._alignRuns(xSpace, runs, 0);
        },

        _justify2: function(updateDom) {
            if (this.justified) {
                var justfiers = [];
                var run = this.container.getFirst();
                this.container.forEach(function(run) {
                    if (run.getViewType() == "text.Alignment") {
                        justfiers.push(run);
                    }
                });
                if (justfiers.length == 0) {
                    return;
                }
                var lastOne = justfiers[justfiers.length - 1];
                if (!this.container.next(lastOne)) {
                    justfiers.splice(justfiers.length - 1, 1);
                    while (justfiers.length > 0 && this.container.next(justfiers[justfiers.length - 1]) == lastOne) {
                        lastOne = justfiers[justfiers.length - 1];
                        justfiers.splice(justfiers.length - 1, 1);
                    }
                }
                var blankSpace = this.w + this.paddingLeft - this.offsetX;
                var delW = Math.ceil(blankSpace / justfiers.length) - 1;
                var k = blankSpace - delW * justfiers.length;
                for (var i = 0; i < justfiers.length; i++) {
                    justfiers[i].restoreWidth();
                    justfiers[i].setWidth(justfiers[i].getWidth() + delW);
                    if (i < k) {
                        justfiers[i].setWidth(justfiers[i].getWidth() + 1);
                    }
                    justfiers[i].dirty = true;
                }

                this.alignitem(false);

                if (updateDom) {
                    for (var i = 0; i < justfiers.length; i++) {
                        justfiers[i]._updateDOMWidth();
                    }
                }
            }
        },

        // deal with center/right/justify alignment before rendering
        _PostProcess: function() {
            var vTools = ViewTools;

            // for in textbox/footnote, need add default xSpace
            if (!this._isParaAlignLeft && 0 == this._XSpaces.length) {
                var txbx = vTools.getTextBox(this.parent);
                if (txbx) {
                    var xSpace = {};
                    xSpace.x = this.getRealPaddingLeft();
                    xSpace.w = txbx.getContentWidth() - this.getRealPaddingLeft();
                    this._XSpaces.push(xSpace);
                } else {
                    var noteArea = vTools.getFootNote(this.parent) || vTools.getEndNote(this.parent);
                    if (noteArea) {
                        var xSpace = {};
                        xSpace.x = this.getRealPaddingLeft();
                        xSpace.w = noteArea.getWidth() - this.getRealPaddingLeft();
                        this._XSpaces.push(xSpace);
                    }
                }
            }

            var curRun = this.listSymbol && !this.listSymbol.isEmpty() ? this.listSymbol.getFirst() : this.container.getFirst();

            var isInCell = ViewTools.isCell(this.parent.parent); // defect 48933
            for (var i = 0; i < this._XSpaces.length; ++i) {
                var xSpace = this._XSpaces[i];
                var xBegin = xSpace.x;
                var xEnd = xSpace.x + xSpace.w;
                var runs = [];

                while (curRun) {
                    if (!vTools.isAnchor(curRun)) {
                        if (isInCell || (curRun.left >= xBegin && curRun.left < xEnd))
                            runs.push(curRun);
                        else
                            break;
                    }

                    if (this.listSymbol && this.listSymbol.contains(curRun))
                        curRun = this.listSymbol.next(curRun) || this.container.getFirst();
                    else
                        curRun = this.container.next(curRun);
                }
                
                var lastPageBreak;
                
                if ((this._isParaAlignCenter || this._isParaAlignRight || this._isParaAlignJustified) && runs.length)
                {
                    var lastRun = runs[runs.length - 1];
                    if (lastRun && lastRun.model && ModelTools.isPageBreak(lastRun.model))
                    {
                        lastPageBreak = lastRun;
                        // temp set w to 0 to make alignment firstly.
                        lastRun.w = 0;
                    }
                }

                if (this._isParaAlignCenter)
                    this._centerAlignment(xSpace, runs);
                else if (this._isParaAlignRight)
                    this._rightAlignment(xSpace, runs);
                else if (this._isParaAlignJustified) {
                    if (this.justified)
                        this._justify(false, xSpace, runs);
                    else
                        this._restoreLeftAlignment(xSpace, runs);
                }
                
                if (lastPageBreak && lastPageBreak.calcW)
                {
                    lastPageBreak.calcW(this);
                }
            }
        },

        /**
         * is the line is pre layouted page break line.
         */
        isFirstPrePageBreakLine: function() {
            var empty = true;
            var hasPageBreak = false;
            var run = this.container.getFirst();
            while (run) {
                var vTools = ViewTools;

                if (vTools.isPageBreak(run))
                    hasPageBreak = true;
                else if (!vTools.isAnchor(run) && !vTools.isBookMark(run))
                    return false;
                //empty = false;

                run = this.container.next(run);
            }

            return hasPageBreak && empty;
        },
        /**
         * Check if this line is the paragraph's last line.
         */
        _isLastLine: function() {
            var next = this.next();
            while (next) {
                if (!next.deleted)
                    break;
                next = next.next();
            }
            if (!next)
                return true;
            var paraAllViews = this.parent.getViews();
            var lastParaView = paraAllViews && paraAllViews.getLast();
            while (lastParaView) {
                var lastLine = lastParaView.lines.getLast();
                while (lastLine) {
                    if (this == lastLine)
                        return true;
                    else
                        return false;
                }
                lastParaView = paraAllViews.prev(lastParaView);
            }
            return false;
        },
        /**
         * The function will get previous line of current model, not the view.
         */
        getPreviousLine: function() {
            var preLine = this.previous();
            if (!preLine) {
                var paraAllViews = this.parent.getViews();
                if (paraAllViews)
                {
                	var preParaView = paraAllViews.prev(this.parent);
                	preLine = preParaView && preParaView.lines.getLast();
                }
            }

            return preLine;
        },
        /**
         * The function will get next line of current model, not the view.
         */
        getNextLine: function() {
            var nextLine = this.next();
            if (!nextLine) {
                var paraAllViews = this.parent.getViews();
                if (paraAllViews)
                {
                	var nextParaView = paraAllViews.next(this.parent);
                	nextLine = nextParaView && nextParaView.lines.getFirst();
                }
            }

            return nextLine;
        },
        _createLineDOM: function() {
            var divClass = "line";
            var paraProperty = this.parent && this.parent.directProperty;
            if (paraProperty && paraProperty.getDirection() == 'rtl')
                divClass = divClass + " rtl";

            var padding = this.getPadding();

            // deal with center/right alignment/justify
            if (!this._isParaAlignLeft && !this.isBidiLine())
                this._PostProcess();

            //		 return dojo.create("div", {
            //				"class": divClass,
            //				"style":"position:relative;height:"+this.getHeight()+"px;"+padding
            //		});
            var node = document.createElement("div");
            node.className = divClass;
            node.setAttribute("style", "position:relative;height:" + this.getHeight() + "px;" + padding);
            return node;
        },

        _createScriptLineDOM: function() {
            var padding = this.getPadding();
            //		if (!this._isParaAlignLeft)
            //			this._PostProcess();
            return domConstruct.create("div", {
                "class": "line",
                "style": "position:relative; font-size: 10.0pt"
            });
        },
        updateHeight: function() {
            this.domNode && domStyle.set(this.domNode, 'height', this.getHeight() + "px");
        },

        calcScriptLineHeight: function() {
            var parentNode = MeasureText.textMeasure;

            var oldW = domStyle.get(parentNode).width;
            domStyle.set(MeasureText.textMeasureFrame, "width", "1000000px");
            domStyle.set(parentNode, "width", "1000000px"); // Mobile fix.

            parentNode.innerHtml = "";
            var newDOM = this._createScriptLineDOM();

            this._renderListSymbol(newDOM, true);
            var run = this.container.getFirst();
            while (run) {
                var runNode = run.render4Script();
                newDOM.appendChild(runNode);
                run = this.container.next(run);
            }
            if (parentNode) {
                parentNode.appendChild(newDOM);
            }

            var h = newDOM.getBoundingClientRect().height;
            domStyle.set(MeasureText.textMeasureFrame, "width", "100px");
            oldW && domStyle.set(parentNode, "width", oldW);
            return h;
        },

        hasCarriage: function() {
            //		return dojo.query(".carriageNode", this.domNode).length > 0 ? true: false;
            return this._hasCarriage;
        },

        checkTrackClass: function() {
            var tc = trackChange;
            var run = this.container.getFirst();
            var carriage = query(".pureCarriageNode", this.domNode)[0];
            if (carriage) {
                this.filterTrackClass(carriage);
            }
            if (run && carriage) {
                var para = run.model.paragraph;
                var rPrCh = para.getRPrCh();
                var ch = para.getCh();
                var chs = [].concat(rPrCh || []) .concat(ch || []);

                var trackDeletedUser = para.getTrackDeletedUserInTime(chs, tc.start, tc.end);
                var trackInsertedUser = para.getTrackInsertedUserInTime(chs, tc.start, tc.end);

                trackDeletedUser && domClass.add(carriage, "track track-deleted track-deleted-" + trackDeletedUser);
                trackInsertedUser && domClass.add(carriage, "track track-inserted track-inserted-" + trackInsertedUser);
                
                if ((trackDeletedUser || trackInsertedUser) && tc.sum)
                {
                    var acts = tc.sum.getActsByModel(para);
                    var actsIds = array.map(acts, function(act){return "track-id-" + act.id;});
                    if (actsIds && actsIds.length)
                    {
                        var arr = ["track-id-listed"].concat(actsIds);
                        domClass.add(carriage, arr);
                    }
                }
            }
            if (run && has("trackGroup"))
            {
                var vPara = run.model.paragraph;
                if (vPara._blocks)
                {
                    var me = this;
                    var rprs = query(".track-deleted-rpr", this.domNode);
                    rprs.forEach(function(rpr){
                        me.filterTrackClass(rpr);
                        domClass.add(rpr, "track-deleted-rpr");
                        var paraId = rpr.getAttribute("name");
                        vPara._blocks.forEach(function(para) {
                            if (para.id == paraId) {
                                var chs = para.getRPrCh();
                                var trackDeletedUser = para.getTrackDeletedUserInTime(chs, tc.start, tc.end);
                                trackDeletedUser && domClass.add(rpr, "track track-deleted track-deleted-" + trackDeletedUser);
                                if (trackDeletedUser && tc.sum)
                                {
                                    var acts = tc.sum.getActsByModel(para, true);
                                    var actsIds = array.map(acts, function(act){return "track-id-" + act.id;});
                                    if (actsIds && actsIds.length)
                                    {
                                        var arr = ["track-id-listed"].concat(actsIds);
                                        domClass.add(rpr, arr);
                                    }
                                }
                            }
                        });
                    });
                }
            }
        },


        appendCarriage: function() {
            if (pe.scene.isNote() || !this.domNode || (this.isRtlDir && this._isTocLine()))
                return;

            if (this.parent.model.isRightClosure())
                return;

            // if the last node is anchor image, this is incorrect.
            var vTools = ViewTools;
            var lastView = this.container.getLast();
            if (lastView && !vTools.isPageBreak(lastView) && !vTools.isDrawingObj(lastView)) {
                //defect35410, to generate a blank span for carriageNode if the line is blank
                var lineText = lastView.getTextOriginal && lastView.getTextOriginal();
                if (lineText == "" || lineText.length == 0) {
                    if (has("ie") && has("ie") < 9) {
                        lineText = this.domNode.innerText;
                    } else {
                        lineText = this.domNode.textContent;
                    }
                    if ((lineText == "" || lineText.length == 0) && lastView.domNode && !domClass.contains(lastView.domNode, "track-deleted"))
                        this.domNode.lastChild.innerHTML = "&#8203;";
                }
            }
            var ch = ViewTools.getCarriageHeight();
            // carriage node
            //		var carriageNode = dojo.create("div", {"class":"carriageNode", innerHTML: "\u21b2" },	this.domNode );
            var carriageNode = document.createElement("div");
            var styleStr = "position:relative;";
            if (this.h < ch) {
                styleStr += " height:" + this.h + "px;";
                if (this.h < 15)
                    styleStr += "font-size:7pt";
            }
            carriageNode.innerHTML = "\u21b2";
            carriageNode.className = "carriageNode pureCarriageNode";
            carriageNode.setAttribute("style", styleStr);
            this.domNode.appendChild(carriageNode);
            this._hasCarriage = true;
            this.checkTrackClass();

        },
        /* assemble line text */
        _getText: function() {
            var text = "",
                run = this.container.getFirst();
            while (run) {
                if (run.getViewType() == 'text.Run')
                    text += run.getText();
                else if (run.len == 1) {
                    if (this._isTocLine()) {
                        text += this.isRtlDir ? "\u05d1" : "a";
                    } else {
                        text += "\ufeff"; //placeholder for run having Bidi level as Tab, Image
                    }
                }
                run = this.container.next(run);
            }
            return text;
        },
        _measureCharWidths: function(run, charWidths) {
            var runNext, runPrev, widthsArray, text = run.getText(),
                len = text.length,
                shift = 0,
                cssStr = run.getCSSStr(),
                textMeasure = MeasureText.textMeasure;
            if (BidiUtils.isArabicText(text)) {
                runNext = this.container.next(run);
                runPrev = this.container.prev(run);
                if (runPrev && runPrev.getViewType() == 'text.Run' && runPrev.len > 0) {
                    text = runPrev.getText().charAt(runPrev.len - 1) + text;
                    shift = 1;
                }
                if (runNext && runNext.getViewType() == 'text.Run' && runNext.len > 0)
                    text += runNext.getText().charAt(0);

                widthsArray = MeasureText._getCharArraySize(text, cssStr);

            } else {
                widthsArray = MeasureText.measureCharsWidth(text, cssStr);
            }

            for (var i = 0; i < len; i++) {
                charWidths[i] = Math.round(BidiUtils.RATIO * widthsArray[i + shift].w);
            }
        },
        /* initialize line's Bidi properties if it contains Bidi characters or has RTL direction */
        initBidiMap: function(isRenderStage) {
            if (!BidiUtils.isBidiOn()) {
                this.bidiMap = [];
                return;
            }
            var text = this._getText(), paragraphText = this.parent.model.text;
            if (isRenderStage) {
                if(BidiUtils.hasBidiChar(paragraphText))
                    this.bidiMap = {
                        'visualCharWidths': true
                    };
                return;
            }
            /* initialize logical<->visual map and array of character widths */
            if(BidiUtils.hasBidiChar(paragraphText) || this.isRtlDir) {
                this.bidiMap = BidiUtils.doBidiReorder(text, this.isRtlDir);
                this.bidiMap.bordersWidths = {};
                var logicalToVisualMap = this.bidiMap.visualfromLogical,
                    inRunIdx, visualIdx, inLineIdx = 0,
                    run = this.container.getFirst();
                while (run) {
                    if (run.getViewType() == 'text.Run') {
                        var maxIdx = 0,
                            minIdx = this.bidiMap.levels.length,
                            charWidths = [];
                        this._measureCharWidths(run, charWidths);
                        /* fill up character's width array across the entire line,
                           round up values after multiplying by BidiUtils.RATIO to save precison
                           since width Array optimally have 2 byte capacity in order to conserve memory,
                           make width values of Bidi characters negative, thus storing info to be used later to
                           decide where caret to be positioned: to the right of Bidi character, to the left of regular one */
                        for (inRunIdx = 0; inRunIdx < run.len; inRunIdx++, inLineIdx++) {
                            if (this.bidiMap.levels[inLineIdx] % 2 != 0)
                                charWidths[inRunIdx] *= -1;

                            visualIdx = logicalToVisualMap[inLineIdx];
                            this.bidiMap.visualCharWidths[visualIdx] = charWidths[inRunIdx];

                            if (run.leftBorderWidth)
                                minIdx = Math.min(minIdx, visualIdx);
                            if (run.rightBorderWidth)
                                maxIdx = Math.max(maxIdx, visualIdx);
                        }
                        if (run.leftBorderWidth)
                            this.bidiMap.bordersWidths[minIdx] = run.leftBorderWidth * BidiUtils.RATIO;
                        if (run.rightBorderWidth)
                            this.bidiMap.bordersWidths[maxIdx + 1] = run.rightBorderWidth * BidiUtils.RATIO;
                    } else if (run.len == 1) {
                        var charWidth = Math.round(run.getWidth() * window.BidiUtils.RATIO);
                        if (this.bidiMap.levels[inLineIdx] % 2 != 0)
                            charWidth *= -1;

                        this.bidiMap.visualCharWidths[logicalToVisualMap[inLineIdx]] = charWidth;
                        inLineIdx += 1;
                    }
                    run = this.container.next(run);
                }
                delete this.bidiMap.levels;
                this.bidiMap.visualCharWidths[logicalToVisualMap[inLineIdx]] = 0;
            } else {
                this.bidiMap = [];
            }
        },
        
        updateTrackClassIdForVRuns: function()
        {
         	/*
            var vRuns = [];
            var ids = [];
            var me = this;
            this.container.forEach(function(view){
                if (!view.domNode)
                {
                    if (view._vRun)
                    {
                        var trackIds = view.getTrackClassIds();
                        if (trackIds)
                        {
                            if (vRuns.length == 0 || vRuns[vRuns.length -1 ] != view._vRun)
                            {
                                vRuns.push(view._vRun);
                                ids.push([]);
                            }
                            var vRunIds = ids[ids.length - 1];
                            array.forEach(trackIds, function(id){
                                if (vRunIds.indexOf(id) < 0)
                                    vRunIds.push(id);
                            })
                        }
                    }
                }
            });
           
            array.forEach(vRuns, function(vRun, index){
                var d = vRun.domNode;
                var vRunIds = ids[index];
                
                var trackIds = vRun.getTrackClassIds();
                array.forEach(trackIds, function(id){
                    if (vRunIds.indexOf(id) < 0)
                        vRunIds.push(id);
                })
                
                me.filterTrackIdClass(d);
                if (vRunIds.length)
                {
                    vRunIds.push("track-id-listed");
                    domClass.add(d, vRunIds);
                }
            });
            */
        },
        
        render: function(parentNode) {
            if (!this.domNode || this.dirty || parentNode) {
                var newDOM = this._createLineDOM();
                this._renderListSymbol(newDOM);
                this.destoryBookmarkNode();

                var run = this.container.getFirst(),
                    backgroundColor, unicodeBidi;
                var bookmarkRun = null;

                if (run) {
                    var txtProp = run.model.paragraph.getMergedTextProperty();
                    backgroundColor = txtProp.getBackgroundColor && txtProp.getBackgroundColor();
                    if (window.BidiUtils.isBidiOn() && !this.isRtlDir && this._isTocLine())
                        unicodeBidi = 'embed';
                }
                var bookmarkRuns = [];
                var prevDeletedBuiltRun = null;
                var prevRealPara;
                while (run) {
                    if (run.getViewType() == "bookMark" && run.isNeedShow())
                        bookmarkRuns.push(run);
                        
                    var curRealPara = run.model.rParagraph || run.model.paragraph;
                    if (!prevRealPara)
                        prevRealPara = curRealPara;
                    
                    // below if would never happen in trackGroup is off.
                    if (prevRealPara != curRealPara)
                    {
                        var rPrDom = null;
                        if (prevDeletedBuiltRun)
                        {
                            if (!prevDeletedBuiltRun._delegateParas)
                                prevDeletedBuiltRun._delegateParas = [];
                            prevDeletedBuiltRun._delegateParas.push(prevRealPara);
                            rPrDom = prevDeletedBuiltRun.domNode;
                        }
                        else
                        {
                            rPrDom = domConstruct.create("span", {className: "track-deleted track-deleted-rpr", name: prevRealPara.id});
                            rPrDom.style.display = "inline-block";
                            rPrDom.style.width = "0px";
                            domConstruct.create("span", {className: "delete-text", innerHTML : "&#8203;"}, rPrDom);
                            domConstruct.create("span", {className: "delete-triangle"}, rPrDom);
                            newDOM.appendChild(rPrDom);
                            prevDeletedBuiltRun = null;
                        }
                        
                        var tc = trackChange;
                        var chs = prevRealPara.getRPrCh();
                        var trackDeletedUser = prevRealPara.getTrackDeletedUserInTime(chs, tc.start, tc.end);
                        domClass.add(rPrDom, "track-deleted-rpr-" + prevRealPara.id);
                        trackDeletedUser && domClass.add(rPrDom, "track-deleted-" + trackDeletedUser);
                        if (trackDeletedUser && tc.sum)
                        {
                            var acts = tc.sum.getActsByModel(prevRealPara, true);
                            var actsIds = array.map(acts, function(act){return "track-id-" + act.id;});
                            if (actsIds && actsIds.length)
                            {
                                var arr = ["track-id-listed"].concat(actsIds);
                                domClass.add(rPrDom, arr);
                            }
                        }
                        
                        prevRealPara = curRealPara;
                    }   
                        
                    var visible = run.isVisibleInTrack();
                    if (!visible && prevDeletedBuiltRun && ((ViewTools.isAnchor(prevDeletedBuiltRun) && ViewTools.isAnchor(run)) || (!ViewTools.isAnchor(prevDeletedBuiltRun) && !ViewTools.isBookMark(prevDeletedBuiltRun) && !ViewTools.isAnchor(run) && !ViewTools.isBookMark(run))))
                    {
                        // console.info("not render the view dom, but add track id in it.");
                        run._vRun = prevDeletedBuiltRun;
                    }
                    else
                    {
                        var runNode = run.render(true);
                        if (backgroundColor && !domStyle.get(runNode, "backgroundColor")) {
                            domStyle.set(runNode, "backgroundColor", backgroundColor);
                        }

                        if(this.fixHeight > 0 && run.updateFixHight)
                        	run.updateFixHight(this.fixHeight);

                        newDOM.appendChild(runNode);
                        if (!visible)
                            prevDeletedBuiltRun = run;
                        else
                            prevDeletedBuiltRun = null;
                    }
                    
                    if (visible)
                         prevDeletedBuiltRun = null;
                         
                    run = this.container.next(run);
                    if (unicodeBidi && run && run.getViewType() == "text.Tab" && runNode)
                        runNode.style.unicodeBidi = unicodeBidi;
                }
                this.bidiMap = null;
                if (parentNode) {
                    if (this.domNode) {
                        parentNode.insertBefore(newDOM, this.domNode);
                        parentNode.removeChild(this.domNode);
                    } else {
                        parentNode.appendChild(newDOM);
                    }
                }
                this.domNode = newDOM;
                delete this.dirty;
                // Append Enter character to the last line.
                if (this._isLastLine()) {
                    var paraView = this.parent;
                    if (ViewTools.isLastViewOfModel(this.parent)) {
                        // section node
                        if (paraView.directProperty.getSectId()) {
                            var sectNode = this.renderSectionBreak();
                            sectNode && this.domNode.appendChild(sectNode);
                        }
                        this.appendCarriage();
                    }
                }

                run = this.container.getFirst();

                for (var i = 0; i < bookmarkRuns.length; i++)
                    this.bookMarkDomNode = bookmarkRuns[i].renderLineMark(this);
                    
                this.updateTrackClassIdForVRuns();
            }
            return this.domNode;

        },
        
        measureSectionText: function()
        {
            if (g.sectionBreakWidth)
                return g.sectionBreakWidth;
            var div = pe.lotusEditor.getEditorDIV();
            var textDom = domConstruct.create("div", {"class": 'breaktext', "innerHTML": i18nLang.SECTION_BREAK_TEXT}, div);
            g.sectionBreakWidth = textDom.offsetWidth;
            textDom.parentNode.removeChild(textDom);
            return g.sectionBreakWidth;
        },
        
        renderSectionBreak: function()
        {
            var run = this.container.getLast();
            var width = 200;
            if (run)
            {
                var x = run.left + run.getWidth();
                width = this.isRtlDir ? this.w : this.w + this.getRealPaddingLeft() - x;
            }
            
            if (width < 3)
                return null;
                
            var textWidth = this.measureSectionText();
            var showText = width > textWidth + 4;
            
            var sectNode = domConstruct.create("div", {
                "class": 'sectionbreak',
                "style": "width:" + width + "px;"
            });
            if (this.isRtlDir)
            	dojo.style(sectNode, "float", "right");
            
            var dot = domConstruct.create("div", {"class": 'breakdot'}, sectNode);
            if (showText)
                domConstruct.create("div", {"class": 'breaktext', "innerHTML": i18nLang.SECTION_BREAK_TEXT}, sectNode);
            return sectNode;
        },

        destoryBookmarkNode: function() {
            if (this.bookMarkDomNode) {
                domConstruct.destroy(this.bookMarkDomNode);
                this.bookMarkDomNode = null;
            }
        },
        _renderListSymbol: function(dom, isCalcHeight) {
            if (this.listSymbol) {
                var run = this.container.getFirst(),
                    backgroundColor;
                if (run) {
                    var txtProp = run.model.paragraph.getMergedTextProperty();
                    backgroundColor = txtProp.getBackgroundColor && txtProp.getBackgroundColor();
                }
                this.listSymbol.forEach(function(l) {
                    l.leader = null;
                    // Defect 42006. Add the condition < dojo.isIE <= 10 && this.domNode.innerHTML == "" >
                    // The paragraph.releaseLayout() function to set paragraph's domNode.innerHTML = "" will
                    //     set all children domNode.innerHTML = "" in IE
                    // Need render(true) to force create domNode.
                    var runNode = isCalcHeight ? l.render4Script() : l.render(true);
                    domClass.add(runNode, "listSymbol");
                    var fallbackNode = runNode;
                    if (!runNode.style["fontFamily"]) {
                        fallbackNode = runNode.firstChild;
                    }
                    if (fallbackNode && fallbackNode.style && fallbackNode.style["fontFamily"]) { // No fallbackNode for image list
                        if (browser.isMobile() ||
                            (has("mac") && fallbackNode.style["fontFamily"].toLowerCase() == "symbol")) {
                        	concord.util.mobileUtil && concord.util.mobileUtil.fallbackListSymbol(fallbackNode);
                        }
                    }
                    if (backgroundColor && !domStyle.get(runNode, "background-color")) {
                        domStyle.set(runNode, "background-color", backgroundColor);
                    }
                    dom.appendChild(runNode);
                });
            }
        },
        updateListDOM: function() {
            var firstNode = this.domNode.childNodes.item(0);
            while (firstNode && domClass.contains(firstNode, "listSymbol")) {
                this.domNode.removeChild(firstNode);
                firstNode = this.domNode.childNodes.item(0);
            }
            var that = this;
            if (this.listSymbol) {
                this.listSymbol.forEach(function(l) {
                    l.leader = null;
                    var runNode = l.render();
                    domClass.add(runNode, "listSymbol");
                    that.domNode.insertBefore(runNode, firstNode);
                });
            }
            // TODO Need a mechanism to update Line when remove list. 
            // Wrong result when getPadding twice.
            // Need rebuild the line
            //		if(!this.listSymbol)
            //		{
            //			var oldPadding = this.getPadding();
            //			this.initProperty();
            //			var newPadding = this.getPadding();
            //			if(oldPadding != newPadding)
            //			{
            //				var newStyle = "position:relative;height:"+this.getHeight()+"px;"+newPadding;
            //				dojo.attr(this.domNode, "style", newStyle);
            //			}
            //		}	
        },
        /*
         * release the list dom node for the line;
         */
        _releaseDom: function() {
            if (this.listSymbol) {
                this.listSymbol.forEach(function(l) {
                    l.releaseDom && l.releaseDom();
                });
            }
            if (this.bookMarkDomNode)
                domConstruct.destroy(this.bookMarkDomNode);
        },
        isPagebreakLine: function() {
            var content = this.container.getLast();
            return content && content.isVisibleInTrack() && content.getViewType() == "text.PageBreak";
        },
        _mergeBordersBidi: function(view, preView, bdrSize) {
            preView.leftBorderWidth = 0;
            view.rightBorderWidth = 0;
            if (this.isRtlDir && !this._isBorderDirty)
                this._isBorderDirty = view;
            else if (this._isBorderDirty) {
                this._isBorderDirty = null;
                if (preView.rightBorderWidth) {
                    preView.rightBorderWidth = 0;
                    preView.w = preView.w - bdrSize;
                    this.offsetX -= bdrSize;
                }
            }
        },
        layoutBorderView: function(view, remainingText) {
            view.leftBorderWidth = 0;
            view.rightBorderWidth = 0;
            view.borderHeight = 0;
            if (view.len < 1)
                return;
            var bdrSize = view._getBorderSize && view._getBorderSize();
            if (bdrSize > 0) {
                view.leftBorderWidth = view.rightBorderWidth = view.borderHeight = bdrSize;
                var preView = view.previous();
                while (preView && preView.getViewType() != "text.Run") {
                    preView = preView.previous();
                }
                // Merge left border
                if (preView && preView.model.getBorder && preView.model.getBorder()) {
                    /* previous and current runs placment on display may differ from thier respective buffer
                     placment for Bidi (or mixed Bidi && None-Bidi) text or in case of RTL text direction */
                    if (window.BidiUtils.isMergeBordersBidi(view, preView, remainingText, this.isRtlDir)) {
                        this._mergeBordersBidi(view, preView, bdrSize);
                    } else {
                        view.leftBorderWidth = 0;
                        preView.rightBorderWidth = 0;
                    }

                    if (this._isBorderDirty && !remainingText) { //last run
                        this._isBorderDirty = null;
                        view.rightBorderWidth = 0;
                    }
                    preView.w = preView.w - bdrSize;
                    this.offsetX -= bdrSize;
                }
                view.markRelayout();
            } else
                this._isBorderDirty = null;

            view.w = view.w + view.leftBorderWidth + view.rightBorderWidth;
            view.h = view.h + view.borderHeight;
        },
        _appendViewCllct: function(viewCllct) {
            var that = this;
            viewCllct.forEach(function(view, k) {
                that._appendView(view, viewCllct.getText().substring(view.start + view.len));
            });
            this.updateFixHeight();
        },
        _appendView: function(view, remainingText) {
            this.container.append(view);
            view.parent = this;
            if (view.getViewType() == "text.Run")
                this.layoutBorderView(view, remainingText);
            view.left = this.offsetX;
            this.offsetX += view.getWidth();
            if (view.borderHeight && view.borderHeight > this.runBorderPadding)
                this.runBorderPadding = view.borderHeight;

            var vH = view.getBoxHeight();
            if (!this.bHasScript) {
                var style = view.getStyle();
                var verticalAlign = style && style['vertical-align'];
                if (verticalAlign == "super" || verticalAlign == "sub") {
                    this.bHasScript = true;
                }
            }
            var skipEmpty = false;
            if (view.len == 0 && this.parent.model.hasInlineContent()) {
                skipEmpty = true;
                // 46236: line spacing is not calculated correctly after press Shift+Enter
                var prev = view.model.previous && view.model.previous();
                if (prev && prev.br) {
                    skipEmpty = false;
                }
            }

            if (vH != this.h && !skipEmpty) {
                if (this.h != 0)
                    this._offsetH = 0; // Different run height, set the line's offset to 0
                this.h = Math.ceil(Math.max(this.h, vH));
            }
            if (!view.doNotCalLineSpaceHeight && vH != this.pureH && !skipEmpty) {
                this.pureH = Math.max(this.pureH, vH);
            }
        },

        _isLineHead: function() {
            var run = this.container.getLast();
            while (run) {
                if (!run.isAnchor && run.getViewType() != "bookMark")
                    return false;

                run = this.container.prev(run);
            }

            return 1;
        },

        /**
         * 
         * @param viewCllct, the runs collection to be appended
         * @param space, the left space for the viewCllct
         * @returns null, the paragraph's container will be changed in this function. So, needn't change paragraph's container out of here
         */
        append: function(viewCllct, space) {
            if (!this._isParaAlignLeft && !this.isRtlDir)
                this.initBidiMap(true);
            // layout runs
            viewCllct.layout(this);

            /* for debug using, to trace run in sea consists of runs.
            var txt = viewCllct.getText();
            var txtToTrace = "";	// type your text of run you wish to debug.
            if (txt && txt.indexOf(txtToTrace) >= 0)
            {
            	console.log("hit debug text!");
            }
            */

            // check last run is break?
            // if last end with break and zero run, then return.
            var lastview = this.container.getLast();
            if (lastview && lastview.isVisibleInTrack && lastview.isVisibleInTrack()) {
                var lastViewType = lastview.getViewType();
                if (lastViewType == "text.LineBreak") {
                    return viewCllct;
                } else if (lastViewType == "text.PageBreak") {
                    if (this.parent && this.parent.ifEndWithZeroRun(lastview))
                        return null;
                    else
                        return viewCllct;
                }
            }

            // init space
            viewCllct.initLineSpace(this);

            // check if line head from this run
            var isLinehead = this._isLineHead();

            // to do, any problem here?
            //defect 36950, when the width < 0,
            // it means the content is out of the page,so we only append one char each line.
            var width = this.w + this.paddingLeft - this.offsetX;
            if (width <= 0) {
                // Add alignment to this line end
                if (this.w > 0 && !(viewCllct.getLength() == 1 && viewCllct.getFirst().getViewType() == "text.Alignment"))
                    return viewCllct;
                var breakViewCllct = viewCllct.splitByIndex(1);
                this._appendViewCllct(viewCllct);
                return breakViewCllct && breakViewCllct.equalTo(viewCllct) ? null : breakViewCllct;
            }

            // check space
            if (space) {
                // When the padingLeft is less than 0, the space should be bigger.
                var delta = 0;
                if (this.rightIndent < 0)
                    delta += this.rightIndent;

                var nextSpace = space.getNextSpaceX(this.offsetX + delta, viewCllct.getBoxHeight() + this.paddingTop);
                if (!this._isParaAlignLeft && !this.isBidiLine())
                    this._addXSpace(nextSpace);
                width = Math.min(width, nextSpace.w); // The minimize of space width and line's width
                if (nextSpace.x > this.offsetX) {
                    this.offsetX = nextSpace.x;
                }

                // check height space enough?
                if (viewCllct.h > space.h && space.h > 0) {
                    //this viewCllct should be put in next line, and if the line has not text run the width should 0
                    if (this.h < space.h) {
                        this.h = space.h;
                    }
                    return viewCllct;
                }
            }

            // from here, we begin to
            // append to line
            if (viewCllct.canFit(width, this.h)) {
                // can fit this run collection, directly append to line.
                this._appendViewCllct(viewCllct);
            } else {
                // check if there will be next space.
                nextSpace = space && space.getNextSpaceX(this.offsetX + width, viewCllct.getBoxHeight() + this.paddingTop);
                if (!this._isParaAlignLeft && !this.isBidiLine())
                    this._addXSpace(nextSpace);
                var rightDelta = this.rightIndent > 0 ? this.rightIndent : 0;
                if (nextSpace && nextSpace.w - rightDelta > 1) {
                    // there's next space
                    this.canContinues = true;

                    // split by no force
                    if (viewCllct.canSplit(width, this.h)) {
                        // can split
                        var breakViewCllct = viewCllct.split(width);
                        if (breakViewCllct && !breakViewCllct.empty()) {
                            this._appendViewCllct(viewCllct);
                            if (breakViewCllct && breakViewCllct.equalTo(viewCllct))
                                return null;
                            else
                                this.offsetX = nextSpace.x;
                            return breakViewCllct;
                        }
                    } else {
                        // can not split, try next space
                        this.offsetX = nextSpace.x;
                        return viewCllct;
                    }

                } else {
                    // there isn't next space
                    if (viewCllct.canSplit(width, this.h, isLinehead)) {
                        var breakViewCllct = viewCllct.split(width, isLinehead);
                        this._appendViewCllct(viewCllct);
                        return breakViewCllct && breakViewCllct.equalTo(viewCllct) ? null : breakViewCllct;
                    } else {
                        // put to next line
                        if (!isLinehead) {
                            return viewCllct;
                        } else {
                            // if this viewCllct cannot be splited and it is the head of the line, 
                            // first, try to force fit.
                            if (viewCllct.canSplit(width, this.h, 3)) {
                                var breakViewCllct = viewCllct.split(width, 3);
                                this._appendViewCllct(viewCllct);
                                return breakViewCllct && breakViewCllct.equalTo(viewCllct) ? null : breakViewCllct;
                            } else {
                                // second, we have to forcely put it in this line
                                if (width > 0)
                                    this._appendViewCllct(viewCllct);
                                else
                                    return viewCllct;
                            }
                        }
                    }
                }
            }
        },
        _needToRelayout: function(view) {
            var isTab = (view.getViewType() == "text.Tab");
            var isAlign = (view.getViewType() == "text.Alignment");
            var isPageBreak = (view.getViewType() == "text.PageBreak");
            if (isTab || isAlign || isPageBreak || view.dirty) {
                return true;
            }
            if (view.isDirty()) {
                return true;
            }
            return false;
        },
        //	mergeRun:function(run){
        //		if(run.isSpliptedInLine()){
        //			return null;
        //		}
        //		var last = this.container.getLast();
        //		if(last&&last.model==run.model && run.canSplit(this.w-this.offsetX,this.h) && last.getViewType() == run.getViewType()){
        //			this.offsetX-=last.getWidth();
        //			this.container.removeEnd(last);
        //			if(this.container.isEmpty()){
        //				// reset the offsetX, sometime,after layout, the offsetX for the line is not correnct.
        //				this.releaseAll();
        //			}
        //			return last;
        //		}
        //		return null;
        //	},
        reset: function() {
            this.h = 0;
            this.pureH = 0;
            this.offsetX = 0;
            this.container.reset();
        },
        release: function(run) {
            if (!run) {
                return;
            }
            this.offsetX = this.paddingLeft;
            if (this.listSymbol) {
                this.offsetX += this.listOffset;
            }
            this.h = 0;
            this.pureH = 0;
            var r = this.container.getFirst();
            while (r && r != run) {
                this.offsetX += r.getWidth();
                if (r.h > this.h) {
                    this.h = r.h;
                }
                if (!r.doNotCalLineSpaceHeight && r.h > this.pureH) {
                    this.pureH = r.h;
                }
                r = this.container.next(r);
            }
            if (r) {
                var end = this.container.prev(r);
                this.container.setEnd(end);
            }
            run.left = 0;
        },
        releaseAll: function(space) {
            this.offsetX = this.paddingLeft;
            this.h = 0;
            this.pureH = 0;
            delete this.prevH;
            var tabH = 0;
            if(this.fixHeight > 0)  this.paddingTop = 0;
            this._hasCarriage = false;
            this.container.reset();
            if (this.listSymbol) {
                var that = this;
                this.offsetX += this.listOffset;
                this.listSymbol.forEach(function(l) {
                    tabH = l.getBoxHeight();
                    if (tabH > that.h) {
                        that.h = tabH;
                    }
                });

                // Defect 44886, Copy from initListSymbol function
                if (space) {
                    var nextSpace = space.getNextSpaceX(this.offsetX, tabH + this.paddingTop);
                    while (nextSpace && nextSpace.w > 0 && nextSpace.w < this.listOffset) {
                        //this list symbol can not be put at the head of this line
                        nextSpace = space.getNextSpaceX(nextSpace.x + nextSpace.w + 1, tabH + this.paddingTop);
                    }
                    if (nextSpace && nextSpace.x > this.offsetX) {
                        this.offsetX = nextSpace.x + this.listOffset;
                    }
                }
            }
            if (this.bookMarkDomNode)
                domConstruct.destroy(this.bookMarkDomNode);
            this.destoryBookmarkNode();
        },
        alignitem: function(bCalcHeight) {
            var h = 0;
            var pureH = 0;
            var left = 0;
            if (this.listSymbol) {
                this.listSymbol.forEach(function(l) {
                    if (bCalcHeight && l.getBoxHeight() > h) {
                        h = l.getBoxHeight();
                    }
                    l.left = left;
                    left += l.getWidth();
                });
            }

            left += this.paddingLeft;

            var that = this;
            this.container.forEach(function(run) {
                if (bCalcHeight && run.getBoxHeight() > h) {
                    h = run.getBoxHeight();
                }
                run.left = left;
                left += run.getWidth();

                // TODO Remove the test code. Sometimes the run moved to next line but still calcluate in this line
                // Check if the run in this line.
                if (run.parent && run.parent != that) {
                    console.error("The run layout result was wrong: " + JSON.stringify(run.model.toJson()));
                    var cnt = (run.getText && run.getText()) || "";
                    throw "<" + cnt + "> layout in prevous line but rendered in this run.";
                }
            });
            if (bCalcHeight) {
                this.h = h;
                this.container.forEach(function(run) {
                    if (!run.doNotCalLineSpaceHeight && run.getBoxHeight() > pureH) {
                        pureH = run.getBoxHeight();
                    }
                });
                this.pureH = pureH;
            }

        },
        _zoomChangedImpl: function() {
            if (this.justified) {
                var updateDom = true;
                this._justify(updateDom);
            } else
                this.alignitem();
        },

        getChildPosition: function(idx, placeholderArg, bNeedLogicalPos, asRunInLine) {
            var run = this.container.getByIndex(idx);
            if (!run)
                console.warn("no run in this line");

            if (run && !run.canSelected()) {
                run = run.next() || run.previous();
            }
            if (!run) {
                return {
                    'x': this.w + this.getLeft(asRunInLine),
                    'y': this.getTop(asRunInLine)
                };
            } else {
                return {
                    'x': run.getLeft(asRunInLine),
                    'y': run.getTop(asRunInLine)
                };
            }
        },
        canBePenetrated: function(x, y) {
            if (this.parent.model.isRightClosure())
                return false;

            var that = this;
            x = x - (this.paddingLeft + this.alignPaddingLeft);
            if (this.listSymbol) {
                x = x - this.listOffset;
            }
            if (x < 0)
                return true;

            x = Math.max(x, 0);
            var tarRun = this.container.select(function(run) {
                // filter bookMark
                if (run.getViewType && (run.isAnchor || run.getViewType() == "bookMark"))
                    return false;

                // If the position is the run's start position, revise it to previous run's last position.
                var delta = (run.getMeasureDelta && run.getMeasureDelta()) || 0;
                var textboxwidth = run.getBoxWidth();
                if (x <= (textboxwidth + 2 * delta)) {
                    if (x < run.getLeftMargin()) {
                        x = x - textboxwidth;
                        return false;
                    }

                    if (run.getViewType && run.getViewType() == 'text.Run' && x > (textboxwidth - delta)) {
                        var nextrun = that.container.next(run);
                        if (nextrun && nextrun.getViewType && nextrun.getViewType() == "text.Run" && nextrun.getBoxWidth() === 0)
                            return false;
                    }
                    return true;
                } else {
                    x = x - textboxwidth;
                    return false;
                }
            });
            if (tarRun) {
                return false;
            }

            return true;
        },
        /* Segement end: for None-Bidi->Bidi boundary measure up to previous index, including previous
           Segement end: for Bidi->None-Bidi boundary measure up to previous index, not including previous
           Segement start: for None-Bidi->Bidi boundary measure up to current index, including current
           Segement start: for Bidi->None-Bidi boundary measure up to current index, not including current */
        _getVisualOffset: function(lineLogicalIdx, isSegmentStart, logicalToVisualMap) {
            var lineVisualIdx = logicalToVisualMap ? logicalToVisualMap[lineLogicalIdx] : lineLogicalIdx,
                offset = 0,
                charWidths = this.bidiMap.visualCharWidths;

            for (var i = 0; i < lineVisualIdx; i++) {
                offset += Math.abs(this.bidiMap.visualCharWidths[i]);
                offset += this.bidiMap.bordersWidths[i] || 0;
            }
            if (i == 0)
                offset += this.bidiMap.bordersWidths[i] || 0;

            if ((isSegmentStart && charWidths[lineVisualIdx] < 0) || (!isSegmentStart && charWidths[lineVisualIdx] > 0)) {
                offset += Math.abs(charWidths[lineVisualIdx]);
                offset += this.bidiMap.bordersWidths[lineVisualIdx] || 0;
            }
            return (offset / window.BidiUtils.RATIO);
        },
        /* returns array of x-boundary positions representing start & end of selection segments on per line basis */
        getSelectionBoundaries: function(startLogicalIdx, endLogicalIdx) {
            var lineOffset = 0, run = this.container.getFirst(),
                carriageWidth = 0, selBoundaries = [];

            !this.bidiMap && this.initBidiMap();
            while (run){
                if (run.getViewType() == 'text.Run') {	
                    lineOffset += run.getLeft();
                    break;
                }
                run = run.next();				
            }

            if (this.isRtlDir) {
                var carriageNode = query(".carriageNode", this.domNode);
                if (carriageNode.length > 0)
                    carriageWidth += carriageNode[0].offsetWidth;
            }

            if (startLogicalIdx == endLogicalIdx) {
                if (startLogicalIdx == null && endLogicalIdx == null) {
                    selBoundaries.push(lineOffset + carriageWidth);
                    var lastRun = this.container.getLast();
                    selBoundaries.push(lastRun.getLeft() + lastRun.w + carriageWidth);
                }
                return selBoundaries;
            }

            startLogicalIdx = startLogicalIdx || 0;
            if (endLogicalIdx == null || endLogicalIdx >= this.bidiMap.visualCharWidths.length)
                endLogicalIdx = this.bidiMap.visualCharWidths.length - 1;

            var charWidths = this.bidiMap.visualCharWidths,
                offsetX,
                startVisualIdx = this.bidiMap.visualfromLogical[startLogicalIdx],
                endVisualIdx = this.bidiMap.visualfromLogical[endLogicalIdx - 1],
                isStartCharBidi = charWidths[startVisualIdx] < 0,
                isEndCharBidi = charWidths[endVisualIdx] < 0;

            lineOffset += carriageWidth;
            offsetX = this._getVisualOffset(startVisualIdx, true, null) + lineOffset;
            selBoundaries.push(offsetX);

            /* Skip unnecessary processing, there is only one selection segment if:
             - for LTR line if selection start and end are at none bidi text
             - for RTL line if selection start and end are at bidi text */
            if ((!this.isRtlDir && (isStartCharBidi || isEndCharBidi)) || (this.isRtlDir && (!isStartCharBidi || !isEndCharBidi))) {

                var logicalToVisualMap = this.bidiMap.visualfromLogical;
                /* traverse logical selection from start to end, store x-boundaries of adjacent Bidi & None-Bidi segments */
                for (var logIdx = startLogicalIdx; logIdx < endLogicalIdx - 1; logIdx++) {
                    /* process segment boundary */
                    if ((charWidths[logicalToVisualMap[logIdx]] > 0) ^ (charWidths[logicalToVisualMap[logIdx + 1]] >= 0)) {
                        offsetX = this._getVisualOffset(logIdx, false, logicalToVisualMap) + lineOffset;
                        selBoundaries.push(offsetX); //end of previous segment
                        offsetX = this._getVisualOffset(logIdx + 1, true, logicalToVisualMap) + lineOffset;
                        selBoundaries.push(offsetX); //start of next segment
                    }
                }
            }
            offsetX = this._getVisualOffset(endVisualIdx, false, null) + lineOffset;
            selBoundaries.push(offsetX);
            return selBoundaries;
        },
        _isTocLine: function() {
            return (this.parent && this.parent.getParent() && this.parent.getParent().getViewType() == "toc");
        },
        /* look for Line and Run element path visually on per line basis */
        getElementPathVisual: function(x, y, h, path, options) {
            /* find index in line */
            if (this.isRtlDir) {
                var carriageNode = query(".carriageNode", this.domNode);
                if (carriageNode.length > 0)
                    x -= carriageNode[0].offsetWidth;
            }
            x = x * BidiUtils.RATIO;
            var logIdx, visIdx = 0,
                offset = 0,
                len = this.bidiMap.visualCharWidths.length,
                charWidth = Math.abs(this.bidiMap.visualCharWidths[visIdx]);
            /* skip if we stay before leftmost Bidi character */
            if (!(charWidth == 0 && x < Math.abs(this.bidiMap.visualCharWidths[1]) / 2)) {
                while (x > offset + charWidth / 2) {
                    offset += charWidth;
                    if (visIdx == len - 1) {
                        /* quit when we on the right of the last character, flag this by charWidth = 0 */
                        charWidth = 0;
                        break;
                    }

                    offset += this.bidiMap.bordersWidths[visIdx] || 0;
                    charWidth = Math.abs(this.bidiMap.visualCharWidths[++visIdx]);
                }
            }
            if (visIdx > 0 && this.bidiMap.visualCharWidths[visIdx - 1] < 0 && this.bidiMap.visualCharWidths[visIdx] > 0) {
                /* Bidi character on the left and None Bidi character on the right */
                if (x < offset) {
                    visIdx--;
                }
                logIdx = this.bidiMap.logicalFromVisual[visIdx];
            } else if (visIdx > 0 && this.bidiMap.visualCharWidths[visIdx - 1] >= 0 && this.bidiMap.visualCharWidths[visIdx] <= 0) {
                /* None Bidi character on the left and Bidi character on the right */
                logIdx = 1 + ((x > offset) ? this.bidiMap.logicalFromVisual[visIdx] : this.bidiMap.logicalFromVisual[visIdx - 1]);
            } else if ((this.isRtlDir && visIdx == len - 1 && charWidth == 0 && this.bidiMap.visualCharWidths[visIdx - 1] > 0) || (!this.isRtlDir && visIdx == 0 && this.bidiMap.visualCharWidths[visIdx] < 0)) {
                /* To the right of last character, which is None Bidi, in RTL direction or */
                /* to the left of first Bidi character, in LTR direction, if next logical char is None Bidi */
                logIdx = 1 + this.bidiMap.logicalFromVisual[visIdx];
            } else {
                /* Tweak visual position when Bidi character on the left in order to map it to corresponding logical position */
                if (visIdx > 0 && this.bidiMap.visualCharWidths[visIdx - 1] < 0 && charWidth != 0)
                    visIdx--;
                /* Regular case */
                logIdx = this.bidiMap.logicalFromVisual[visIdx];
            }
            /* find run and index in run */
            var run = this.container.getFirst(),
                len = run.len;
            while (run && logIdx > len) {
                if (run == this.container.getLast()) {
                    if (len == 0) //bookmark
                        run = this.container.prev(run);
                    else if (logIdx > run.len)
                        logIdx = run.len;
                    break;
                }
                if (run.getViewType() == 'text.Run' || len == 1)
                    logIdx -= len;

                run = this.container.next(run);
                len = run.len;
            }
            path.push(run);
            if (run.getViewType() === "text.ImageView") {
	            run.getElementPath(x / window.BidiUtils.RATIO, y, h, path, options);
            } else {
	            var ret = {
	                "delX": (offset - x) / window.BidiUtils.RATIO,
	                "delY": run._getDOMOffsetTop() - y,
	                "index": logIdx,
	                "h": run.getContentHeight()
	            };
	            path.push(ret);
            }
            return true;
        },

        hasNoTextrun: function() {
            var tarRun = this.container.getLast();
            while (tarRun) {
                if (!tarRun.isAnchor && tarRun.getViewType() != "bookMark")
                    return false;

                tarRun = this.container.prev(tarRun);
            }

            return true;
        },

        getElementPath: function(x, y, path, options, fromException) {
            if (!this.bidiMap)
                this.initBidiMap();

            var that = this;
            var realPaddingLeft = this.getRealPaddingLeft();
            x = x - realPaddingLeft;
            if (this.listSymbol && !this.isRtlDir) {
                var lastSym = this.listSymbol.getLast();
                if (!this._isParaAlignLeft && this.isBidiLine())
                    x = x + this.paddingLeft - (lastSym.left + lastSym.getWidth());
                else
                    x = x + realPaddingLeft - (lastSym.left + lastSym.getWidth());
            }
            x = Math.max(x, 0);

            if (this.isBidiLine())
                return this.getElementPathVisual(x, y, this.getBoxHeight(), path, options);

            var tarRun = this.container.select(function(run) {
                // filter bookMark
                if (run.getViewType && (run.isAnchor || run.getViewType() == "bookMark"))
                    return false;

                // If the position is the run's start position, revise it to previous run's last position.
                var delta = (run.getMeasureDelta && run.getMeasureDelta()) || 0;
                var textboxwidth = run.getBoxWidth();
                if (x <= (textboxwidth + 2 * delta)) {
                    if (run.getViewType && run.getViewType() == 'text.Run' && x > (textboxwidth - delta)) {
                        var nextrun = that.container.next(run);
                        if (nextrun && nextrun.getViewType && nextrun.getViewType() == "text.Run" && nextrun.getBoxWidth() === 0)
                        {
                        	// TODO double check Bob, ask JianFang
                            x = x - textboxwidth;
                            return false;
                        }
                    }
                    return true;
                } else {
                    x = x - textboxwidth;
                    return false;
                }
            });
            if (!tarRun) {
                tarRun = this.container.getLast();
                while (tarRun && (tarRun.isAnchor || tarRun.getViewType() == "bookMark" || tarRun.getViewType() == "text.trackDeletedObjs")) {
                    tarRun = this.container.prev(tarRun);
                }

                tarRun && (x = x + tarRun.getBoxWidth());
            }
            if (tarRun) {
                path.push(tarRun);
                tarRun.getElementPath(x, y, this.getBoxHeight(), path, options);
                return true;
            } else {
                if (fromException) {
                    console.error("can not find a textrun for the cursor");
                    throw "can not find a textrun for the cursor";
                }
                return false;
            }
        },
        
        getFirstViewForCursor: function()
        {
            // override abstractView;
            var paths = [];
            this.getElementPath(this.getRealPaddingLeft(), this.getContentTop(), paths, {});
            var run = paths[0];
            if (run && run.model)
                return run;
            return AbstractView.prototype.getFirstViewForCursor.apply(this, arguments);
        }
    };
    tools.extend(Line.prototype, new AbstractView());
    return Line;
});
