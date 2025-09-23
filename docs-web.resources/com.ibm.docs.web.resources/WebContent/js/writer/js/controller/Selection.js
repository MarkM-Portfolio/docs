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
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/has",
    "dojo/topic",
    "dojo/string",
    "writer/constants",
    "writer/core/Range",
    "writer/util/ViewTools",
    "writer/core/Event",
    "concord/util/browser",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "writer/util/HtmlTools",
    "writer/controller/Cursor",
    "writer/view/selection/Factory",
    "writer/common/RangeIterator",
    "writer/msg/msgCenter",
    "writer/global",
    "dojo/i18n!writer/nls/lang",
    "writer/controller/MobileIndicatorManager",
], function(declare, array, lang, has, topic, string, constants, Range, ViewTools, Event, browser, ModelTools, RangeTools, HtmlTools, Cursor, Factory, RangeIterator, msgCenter, g, i18nlang, MobileIndicatorManager) {

    var Selection = declare("writer.controller.Selection", null, {

        _shell: null,
        _view: null,
        _cursor: null,
        _coEditIndicator: false,
        _coEditUserId: null,
        _coEditColor: null,

        _start: null,
        _end: null,
        _isSelecting: false,
        _isBeginSel: true,

        _ranges: null,
        _highlightRanges: null,
        _rangeTools: RangeTools,
        _viewTools: ViewTools,

        _selections: null,
        _highlightSelections: null,
        _selectionFactory: null,
        _rangesMap: null,
        _highlightWaitingList: null,

        _HeaderFooterSelectList: null,
        _mobileIndicatorManager: null,
        /**
         * contructor function
         * @param createParam
         */
        constructor: function(createParam) {
            this._ranges = [];
            this._highlightRanges = [];
            this._selections = [];
            this._highlightSelections = [];
            this._highlightWaitingList = [];
            this._shell = createParam.shell;
            this._coEditIndicator = createParam.coEditIndicator;
            this._coEditUserId = createParam.userId;
            this._coEditColor = createParam.color;
            if (browser.isMobileBrowser() &&!this._coEditIndicator && !pe.lotusEditor.isReadOnly()) {
                this._mobileIndicatorManager = new MobileIndicatorManager();
            }   
            this._cursor = new Cursor({
                shell: this._shell,
                blinkable: !this._coEditIndicator && !this._shell.getEditor().isReadOnly(),
                color: this._shell.getEditor().isReadOnly() ? "#888888" : this._coEditColor,
                userId: this._coEditUserId,
                mobileIndicatorManager: this._mobileIndicatorManager
            });
            //init selectionFactory
            this._selectionFactory = new Factory();
            this._view = this._shell.view();

            topic.subscribe(constants.EVENT.PAGECREATED, lang.hitch(this, this._onPageRendered));
            topic.subscribe(constants.EVENT.BEFORE_SELECT, lang.hitch(this, this._onBeforeSelected));

            if (!this._coEditIndicator) {
                var _that = this;
                var events = [constants.EVENT.COEDIT_STARTED, constants.EVENT.COEDIT_USER_JOINED];
                array.forEach(events, function(event) {
                    topic.subscribe(event, lang.hitch(_that, function() {
                        setTimeout(function() {
                            _that._sendSelectionMsg(true);
                        }, 2000);
                    }));
                });
                
            }
        },
        
        _onBeforeSelected: function(ranges)
        {
            if (has("trackGroup"))
                return;
            array.forEach(ranges, function(range, raIndex){
                var start = range.getStartModel();
                var commonAncestor = range.getCommonAncestor();
                if (start && start.obj)
                {
                    var startPara = start.obj;
                    if (startPara.modelType != constants.MODELTYPE.PARAGRAPH)
                    {
                        startPara = g.modelTools.getParagraph(startPara);
                    }
                    if (startPara && startPara.isRightClosure())
                    {
                        // console.info("Adjust start");
                        var nextPara = g.modelTools.getNext(startPara, g.modelTools.isNormalPara);
                        if (range.isCollapsed()) {
                            if (nextPara)
                                range.setStartModel(nextPara, 0);
                            else
                            {
                                var prevPara = g.modelTools.getPrev(startPara, g.modelTools.isNormalPara); 
                                if (prevPara)
                                    range.setStartModel(prevPara, prevPara.getLength());  
                            }
                            range.collapse(true);
                            return;
                        }
                        while (nextPara && nextPara.parent != commonAncestor)
                            nextPara = nextPara.parent;
                        if (nextPara) {
                            range.setStartModel(nextPara, 0);
                        }
                        else
                        {
                            var prevPara = g.modelTools.getPrev(startPara, g.modelTools.isNormalPara);
                            while (prevPara && prevPara.parent != commonAncestor)
                                prevPara = prevPara.parent;
                            if (prevPara)
                                range.setStartModel(prevPara, prevPara.getLength ? getLength() : 0);
                        }
                    }
                }
                if (range.isCollapsed())
                    return;
                var end = range.getEndModel();
                if (end && end.obj)
                {
                    var endPara = end.obj;
                    if (endPara.modelType != constants.MODELTYPE.PARAGRAPH)
                    {
                        endPara = g.modelTools.getParagraph(endPara);
                    }
                    if (endPara && endPara.isRightClosure())
                    {
                        // console.info("Adjust end");
                        var prevPara = g.modelTools.getPrev(endPara, g.modelTools.isNormalPara);
                        while (prevPara && prevPara.parent != commonAncestor)
                            prevPara = prevPara.parent;
                        if (prevPara)
                            range.setEndModel(prevPara, prevPara.getLength ? getLength() : 0);
                        else
                        {
                            var nextPara = g.modelTools.getNext(endPara, g.modelTools.isNormalPara);
                            while (nextPara && nextPara.parent != commonAncestor) {
                                nextPara = nextPara.parent;
                            }
                            if (nextPara)
                                range.setEndModel(nextPara, 0);  
                        }
                    }
                }
            });
        },

        addHeaderFooterSelection: function(scrollValue, isHeader, pageNumber) {
            this._HeaderFooterSelectList = {};
            this._HeaderFooterSelectList.scrollValue = scrollValue;
            this._HeaderFooterSelectList.isHeader = isHeader;
            this._HeaderFooterSelectList.pageNumber = pageNumber;
        },
        updateHeaderFooter: function() {
            if (!this._HeaderFooterSelectList)
                return;

            var shell = pe.lotusEditor._shell;
            var scrollTop = this._HeaderFooterSelectList.scrollValue;
            var page = null;
            // Get from recored page number first.
            if (this._HeaderFooterSelectList.pageNumber) {
                page = pe.lotusEditor.layoutEngine.rootView.getPage(this._HeaderFooterSelectList.pageNumber);
            }
            page = page || pe.lotusEditor.layoutEngine.rootView.getScrollPage(scrollTop);
            if (page) {
                if (this._HeaderFooterSelectList.isHeader) {
                    var header = page.getHeader();
                    if (header) {
                        shell.moveToHeaderFooter(header, true);
                    }
                } else {
                    var footer = page.getFooter();
                    if (footer) {
                        shell.moveToHeaderFooter(footer, true);
                    }
                }
            }

            this._HeaderFooterSelectList = null;
        },
        /**
         * when one page was rendered
         */
        _onPageRendered: function(page) {
            var ranges = this._ranges,
                params = this._renderParam,
                sel = this;
            if (params && params.shell && array.some(params.shell.selectedPath, function(path){
                return path._deleted;
            }))
                return;
            setTimeout(function() {
                for (var i = 0; i < ranges.length; i++)
                    sel._renderSelectionInPage(ranges[i], page, params);
                sel._checkCursor();
            }, 10);
        },
        _checkCursor: function() {
            if (RangeTools.fixTCMergedOfRanges) {
                // when ranges is in a block in trackBlockGroup, should change ranges to group
                RangeTools.fixTCMergedOfRanges(this._ranges);
            }
            var isCoedit = this._coEditIndicator;
            var moved = false;
            if (this.isEmpty() && this._start) {
                moved = this._cursor.moveTo(this._start.obj, this._start.index);
                if (this._start.obj.domNode || this._start.obj._vRun) {
                    this._cursor.show();
                } else
                    this._cursor.hide();
            } else {
                if (!isCoedit) {
                    if (this._start)
                        moved = this._cursor.moveTo(this._start.obj, this._start.index);
                    this._cursor.hide();
                    var length = this._selections.length;
                    if (this._mobileIndicatorManager && length > 0) 
                        this._mobileIndicatorManager.showIndicator(this._selections[0], this._selections[length - 1]);
        
                } else {
                    var obj = this._end || this._start;
                    if (obj)
                        moved = this._cursor.moveTo(obj.obj, obj.index);
                }
            }

            if (isCoedit && moved)
                this._cursor.posCoEditIndicator();
        },

        /**
         * remember start/end position for next operation, 
         * before optimize range
         * @param range
         */
        _setStartEnd: function(range) {
            if (this._ranges.length == 0 || !this._start) {
                this._start = range.getStartView();
            }
            this._end = range.getEndView();
        },
        /**
         * render selection
         * @param range
         * @param startPageNumber
         * @param endPageNumber
         * @param renderParams
         */
        _renderSelectionInPage: function(range, page, params) {
            if (range.getStartModel() == null || range.getStartModel().obj == null) {
                console.error('wrong range');
                return;
            }

            var doc = ViewTools.getDocument(range.rootView);
            var nPageIndex, pages = doc.getPages();

            if (lang.isObject(page)) {
                nPageIndex = pages.indexOf(page);
                if (nPageIndex == null) {
                    console.error("wrong page");
                    return;
                }
            } else {
                nPageIndex = page;
                page = pages.getByIndex(nPageIndex);
                if (page == null) {
                    console.error("wrong page number");
                    return;
                }
            }
            if (!page.domNode || !page.domNode.firstChild)
            //page is not rendered
                return;

            var start = range.getStartView(),
                end = range.getEndView();
            if (!start)
                return;
            var startPage = ViewTools.getPage(start.obj),
                endPage = ViewTools.getPage(end.obj),
                startPageIndex = pages.indexOf(startPage);
            endPageIndex = pages.indexOf(endPage);
            if (startPageIndex > nPageIndex || nPageIndex > endPageIndex)
                return;

            var startObj, endObj, startIndex, endIndex, body;
            if (startPageIndex == nPageIndex) {
                startObj = start.obj;
                startIndex = start.index;
            } else {
                body = this._rangeTools.getNextItem(page, 'page.Body', true);
                startObj = body.getContainer().getFirst();
                startIndex = 0;
            }
            if (endPageIndex == nPageIndex) {
                endObj = end.obj;
                endIndex = end.index;
            } else {
                body = this._rangeTools.getLastItem(page, 'page.Body');
                while (body && !endObj) {
                    endObj = body && body.getContainer().getLast();
                    endIndex = endObj && endObj.getContainer && endObj.getContainer().length();
                    body = body.previous(true);
                }
            }
            startObj && endObj && this._renderSelection(startObj, startIndex, endObj, endIndex, params);
        },
        /*
         * create selection dom nodes when the selection is in table.
         */
        _renderTableSelection: function(target, start, end, params, isHighlight) {
            var cells = this._viewTools.getAllCells(target, start, end);
            for (var i = 0; i < cells.length; i++) {
                params.viewItem = cells[i];
                params.coEditColor = this._coEditColor;
                var select = this._selectionFactory.createSelection(params);
                if (select) {
                    this.addSelections(select, isHighlight);
                } else {
                    console.error("something is error!");
                }
            }
        },
        /**
         * create selection dom nodes
         * @param startObj
         * @param startIndex
         * @param endObj
         * @param endIndex
         * @param params
         */
        _renderSelection: function(startObj, startIndex, endObj, endIndex, params) {
            var viewItem = startObj;
            var sel = this,
                endLine, startLine,
                isHighlight = params.highlightType != null;

            var view = this._viewTools;
            if (!(view.isTable(startObj) || view.isRow(startObj) || view.isCell(startObj))) {
                if (view.isRun(startObj) || view.isBookMark(startObj) || view.isDrawingObj(startObj)) {
                    startLine = startObj.getParent();
                    viewItem = startLine;
                } else if (startIndex != null) {
                    startObj = startObj.getContainer().getByIndex(startIndex);
                    startIndex = 0;
                }

            }

            if (!(view.isTable(endObj) || view.isRow(endObj) || view.isCell(endObj))) {
                if (view.isRun(endObj) || view.isDrawingObj(endObj))
                    endLine = endObj.getParent();
                else if (endIndex != null && endObj.getContainer()) {
                    if (endIndex < endObj.getContainer().length()) {
                        endObj = endObj.getContainer().getByIndex(endIndex);
                        endIndex = endObj.getContainer() ? endObj.getContainer().length() : endObj.getEnd();
                    }
                    if (endObj.getContainer() && endIndex >= endObj.getContainer().length()) {
                        while (endIndex && view.getParent(startObj, function(parent) {
                                return parent == endObj;
                            })) {
                            endObj = endObj.getContainer().getLast();
                            if (view.isLine(endObj) || !endObj.getContainer()) {
                                endLine = endObj;
                                endObj = endObj.getLast() || endObj;
                                endIndex = endObj.getEnd();
                                break;
                            } else
                                endIndex = endObj.getContainer().length();
                        }
                    }
                }

            }
            params = params || {};
            params.coEditColor = this._coEditColor;

            var range = new Range({
                "obj": startObj,
                "index": startIndex
            }, {
                "obj": endObj,
                "index": endIndex
            });
            //render from next run
            if (view.isDrawingObj(startObj)) {
                startObj = sel._rangeTools.getNextRun(startObj);
                startIndex = 0;
            }

            if (view.isDrawingObj(endObj) && (ModelTools.isAnchor(endObj) || endIndex == 0)) {
                endObj = sel._rangeTools.getPrevRun(endObj);
                endIndex = endObj && endObj.getEnd();
            }

            while (viewItem && endObj) {
                var select, startLineIdx = null,
                    endLineIdx = null,
                    isBidiLine = viewItem.isBidiLine && viewItem.isBidiLine();
                if (viewItem == startLine) {
                    if (isBidiLine)
                        startLineIdx = startIndex + startObj.start - viewItem.container.getFirst().start;
                    else
                        params.start = startObj.getChildPosition(startIndex).x; //sel._rangeTools.getRelative( startObj, startIndex, viewItem ).x;
                } else
                    delete params.start;
                if (viewItem == endLine) {
                    if (isBidiLine)
                        endLineIdx = endIndex + endObj.start - viewItem.container.getFirst().start;
                    else
                        params.end = endObj.getChildPosition(endIndex).x; //sel._rangeTools.getRelative( endObj, endIndex, viewItem ).x;
                } else
                    delete params.end;

                params.viewItem = viewItem;
                if (sel._viewTools.isTable(viewItem) || sel._viewTools.isRow(viewItem)) {
                    var start = -1;
                    var end = -1;
                    var isStart = false;
                    var isEnd = false;
                    if (startObj == viewItem) 
                        start = startIndex;
                    if (endObj == viewItem) 
                        end = endIndex;
                    sel._renderTableSelection(viewItem, start, end, params, isHighlight);
                    if (endObj == viewItem) {
                        viewItem = null;
                    } else {
                        viewItem = sel._rangeTools.getNextItem(viewItem);
                    }
                    continue;
                } else {
                    if (isBidiLine) {
                        var selBoundaries = viewItem.getSelectionBoundaries(startLineIdx, endLineIdx);
                        select = [];
                        for (var i = 0; i < selBoundaries.length;) {
                            params.start = selBoundaries[i++];
                            params.end = selBoundaries[i++];
                            if (params.start != params.end)
                                select.push(sel._selectionFactory.createSelection(params));
                        }
                    } else
                        select = sel._selectionFactory.createSelection(params);
                }

                if (select) {
                    sel.addSelections(select, isHighlight, select instanceof Array);

                    if (viewItem == endObj || viewItem == endLine)
                        viewItem = null;
                    else
                        viewItem = sel._rangeTools.getNextItem(viewItem);
                } else {
                    if (viewItem == endLine)
                        viewItem = null;
                    else if (viewItem == endObj && !endIndex)
                        viewItem = null;
                    else {
                        if (viewItem == endObj && endIndex) {
                            viewItem = endObj.getContainer().getFirst();

                            var child = endObj.getContainer().getByIndex(endIndex - 1);
                            if (child) { //end postiton move to child
                                endObj = child;
                                if (view.isLine(endObj)) {
                                    endLine = endObj;
                                    endObj = child.getLast();
                                    endIndex = endObj.getEnd();
                                } else
                                    endIndex = child.getContainer && child.getContainer().length();
                            } else { //move to next positon
                                endObj = sel._rangeTools.getNextItem(endObj);
                                endIndex = 0;
                            }
                        } else
                            viewItem = sel._rangeTools.getNextItem(viewItem, null, true);
                    }
                }
            }
            //render anchor selections
            var iterator = new RangeIterator(range);
            var tools = ModelTools;
            var fn = function(model) {
                return tools.isRun(model) || tools.isAnchor(model);
            };
            var run, sel = this;
            while (run = iterator.next(fn)) {
                if (tools.isAnchor(run)) {
                    //				console.log("!!!!!Anchor");

                    views = run.getRelativeViews("rootView");
                    if (!views)
                        continue;

                    var anchorView = views.getFirst();
                    if (!anchorView)
                        continue;

                    params.viewItem = anchorView;
                    var select = sel._selectionFactory.createSelection(params);
                    if (select)
                        sel._selections.push(select);
                }
            }
        },

        _addSelect: function(range, isHighlight, effect) {
            if (range.getStartModel() == null || range.getStartModel().obj == null) {
                console.error('wrong range added');
                return;
            }
            this._setStartEnd(range);
            if (!this._shell.getEditor().isReadOnly()) {
                var drawingObj = this._rangeTools.ifContainOnlyOneDrawingObj(range);
                if (drawingObj) {
                    if (this._coEditIndicator)
                        return;
                    this.addRanges(range, isHighlight);
                    drawingObj.select();
                    return;
                } 
            }
            range = this._rangeTools.optimize(range, isHighlight);
            this.addRanges(range, isHighlight);

            if (range.isCollapsed())
                return;

            var start = range.getStartView(),
                end = range.getEndView(),
                params = {};
            //for hightlight
            if (isHighlight)
                params.highlightType = 'find';
            params.effect = effect;
            params.shell = this._shell;
            params.coEditColor = this._coEditColor;

            if (range.rootView != pe.lotusEditor.layoutEngine.rootView || isHighlight)
                this._renderSelection(start.obj, start.index, end.obj, end.index, params);
            else {
                var pages = range.rootView.pages;
                var start = range.getStartView(),
                    end = range.getEndView();
                if (start && end) {
                    var startPage = ViewTools.getPage(start.obj),
                        endPage = ViewTools.getPage(end.obj),
                        startPageIndex = pages.indexOf(startPage);
                    endPageIndex = pages.indexOf(endPage);
                    for (var i = startPageIndex; i <= endPageIndex; i++) {
                        try {
                            this._renderSelectionInPage(range, i, params);
                        } catch (e) {
                            console.error("render page " + i + " error !!");
                            console.error(e.message);
                        }
                    }
                }
            }

        },
        /**
         * get current edit view
         * @returns
         */
        getEditView: function() {
            var range = this._ranges[0];
            if (!range)
                return this._view;
            else
                return range.rootView;
        },
        /*
         * Events
         */
        focus: function(highlight) {
            if (this.isEmpty())
                this._cursor.show(false, highlight);
            else
                this._cursor.hide();

            if (!this._firstAcc && this._ranges && this._ranges.length) {
                this.AnnounceSelection("down", false);
                this._firstAcc = true;
            }
        },
        blur: function() {
            this._cursor.hide();
        },
        /*
         * functions to provide to EditShell track selection by mouse or key
         */
        beginSelect: function(pos, onBoundary) {
            if (pe.lotusEditor.isResizing) {
                return;
            }
            this.cancel();
            if (onBoundary === true) {
                // make sure the pos is a char boundary
                if (this._viewTools.isTextRun(pos.obj)) {
                    var modelpos = {
                        obj: ModelTools.getParagraph(pos.obj.model),
                        index: pos.obj.start + pos.index
                    };
                    var cbs = ModelTools.getCharBoundaries(modelpos);
                    if (modelpos.index > cbs.start && cbs.end > modelpos.index) {
                        var nOffset = cbs.end - modelpos.index;
                        while (nOffset > 0) {
                            pos = this._rangeTools.getNextPosition(pos);
                            nOffset--;
                        }
                    }
                }
            }
            if (pos) {
                this._start = pos;
                this._end = pos;
            }
            this._isSelecting = true;

            this.moveTo(this._start.obj, this._start.index);
        },

        setSelecting: function(b) {
            this._isSelecting = true;
        },


        isSelecting: function() {
            return this._isSelecting;
        },

        endSelect: function(pos, onBoundary) {
            this._isSelecting = false;

            if (onBoundary === true) {
                // make sure the pos is a char boundary
                if (this._viewTools.isTextRun(pos.obj)) {
                    var modelpos = {
                        obj: ModelTools.getParagraph(pos.obj.model),
                        index: pos.obj.start + pos.index
                    };
                    var cbs = ModelTools.getCharBoundaries(modelpos);
                    if (modelpos.index > cbs.start && cbs.end > modelpos.index) {
                        var nOffset = cbs.end - modelpos.index;
                        while (nOffset > 0) {
                            pos = this._rangeTools.getNextPosition(pos);
                            nOffset--;
                        }
                    }
                }
            }

            if (pos)
                this._end = pos;

            if (this.isEmpty()) {
                this.moveTo(this._start.obj, this._start.index);
            } else if (pos)
                this.selectTo(pos);


        },
        /*
         * Interface provide to other application
         */
        isEmpty: function() {
            if (!this._start && !this._end)
                return true;
            else if (!this._start || !this._end)
                return false;

            return (this._start == this._end) || (this._start.obj == this._end.obj && this._start.index == this._end.index);
        },

        cancel: function() {
            this.destroy();
            this._end = this._start = null;
        },
        destroy: function() {
            if (this._mobileIndicatorManager) 
                this._mobileIndicatorManager.destroy();
            var select;
            while (this._selections.length > 0) {
                select = this._selections.pop();
                select.destroy();
            }
            if (this._ranges && this._ranges.length > 0) {
                try {
                    if (!this._coEditIndicator)
                        topic.publish(constants.EVENT.REMOVE_SELECT, this._ranges);
                } catch (e) {
                    console.error("error when publish writer.constants.EVENT.REMOVE_SELECT:" + e);
                }
            }
            this._ranges = [];
        },
        addRanges: function(range, isHighlight) {
            if (!isHighlight)
                this._ranges.push(range);
            else
                this._highlightRanges.push(range);
        },
        addSelections: function(select, isHighlight, isArray) {
            if (!isHighlight) {
                if (isArray)
                    this._selections = this._selections.concat(select);
                else
                    this._selections.push(select);
            } else {
                if (isArray)
                    this._highlightSelections = this._highlightSelections.concat(select);
                else
                    this._highlightSelections.push(select);
            }
        },
        /*
         * store ranges...
         */
        store: function(msg) {
            for (var i = 0; i < this._ranges.length; i++) {
                this._ranges[i].store(msg);
            }
        },
        /*
         * restore ranges..
         */
        restore: function() {
            var changed = false;
            for (var i = 0; i < this._ranges.length; i++) {
                if (this._ranges[i].isSaved()) {
                    this._ranges[i].restore();
                    changed = true;
                }
            }
            if (changed) {
                var rangeclones = [];
                for (var i = 0; i < this._ranges.length; i++) {
                    rangeclones.push(this._ranges[i].clone());
                }
                this.selectRanges(rangeclones);
            }
            if (changed && !this._coEditIndicator) {
                pe.lotusEditor.indicatorManager.drawUserSelections();
            }

            return changed;
        },

        restoreBeforeUpdate: function(style) {
            var changed = false;
            for (var i = 0; i < this._ranges.length; i++) {
                if (this._ranges[i].isSaved()) {
                    this._ranges[i].restore();
                    changed = true;
                }
            }
            if (changed) {
                var rangeclones = [];
                for (var i = 0; i < this._ranges.length; i++) {
                    rangeclones.push(this._ranges[i].clone());
                }
                this.selectRangesBeforeUpdate(rangeclones);
            }
            if (style && changed && !this._coEditIndicator) {
                pe.lotusEditor.indicatorManager.drawUserSelectionsDelayed();
            }
            return changed;
        },
        /*
         * return [ writer.core.Range ]
         */
        getRanges: function() {
            return this._ranges;
        },
        getHighlightWaitingList: function() {
            return this._highlightWaitingList;
        },
        _selectionChangeTimer: null,

        //for performance reason, we do not fire selection change event if next selection change event comes in next 200 ms
        _selectionChange: function() {
            if (this._coEditIndicator)
                return;

            if (this._selectionChangeTimer) {
                clearTimeout(this._selectionChangeTimer);
            }
            var sel = this;
            delete this._msgData;
            
            this._selectionChangeTimer = setTimeout(function() {
                if (sel._isSelecting) // In selecting.
                    return;

                topic.publish(constants.EVENT.SELECTION_CHANGE);
            }, 50);

            if (this._selectionMsgTimer) {
                clearTimeout(this._selectionMsgTimer);
            }

            this._selectionMsgTimer = setTimeout(function() {
                if (pe.scene.coedit) {
                    sel._sendSelectionMsg();
                }
            }, 1500);
        },

        _getSelectionMsg: function(force) {
            if (pe.lotusEditor.undoManager.isIMEing()) {
                // do not send selection change event if in IME input
                return null;
            }

            var ranges = RangeTools.mergeRangesInCrossPageCell(this._ranges);
            var data = [];
            if (ranges.length) {
                var m = ModelTools;
                array.forEach(ranges, function(range) {
                    var startModel = range.startModel;
                    var endModel = range.endModel;
                    var collapsed = range.isCollapsed();
                    var obj = {
                        collapsed: collapsed
                    };

                    if (m.isTable(startModel.obj) || m.isRow(startModel.obj) || m.isCell(startModel.obj)) {
                        obj.startParaId = range.startModel.obj.id;
                        obj.startParaIndex = range.startModel.index;
                    } else {
                        var start = range.getStartParaPos();
                        obj.startParaId = start.obj.id;
                        obj.startParaIndex = start.index;
                    }

                    if (collapsed) {
                        obj.endParaId = obj.startParaId;
                        obj.endParaIndex = obj.startParaIndex;
                    } else {
                        if (m.isTable(endModel.obj) || m.isRow(endModel.obj) || m.isCell(endModel.obj)) {
                            obj.endParaId = range.endModel.obj.id;
                            obj.endParaIndex = range.endModel.index;
                        } else {
                            var end = range.getEndParaPos();
                            obj.endParaId = end.obj.id;
                            obj.endParaIndex = end.index;
                        }
                    }

                    var rootView = range.rootView;
                    if (rootView.model == pe.lotusEditor.document || !rootView) {
                        // ignore;
                    } else {
                        var model = rootView.model;
                        obj.rId = model.rId;
                        if (rootView.page)
                            obj.pageNumber = rootView.page.pageNumber;
                    }
                    data.push(obj);
                });
            }

            if (!data.length) {
                // console.warn("no range");
                return null;
            }

            if (force || !this._msgData || !this._compareSelectionData(data, this._msgData)) {

                this._msgData = data;
                return msgCenter.createSelectionMsg(data);
            }

            return null;
        },

        _compareSelectionData: function(current, before) {
            if (current.length != before.length)
                return false;
            for (var i = 0; i < current.length; i++) {
                var c = current[i];
                var b = before[i];
                if (c.startParaId != b.startParaId || c.endParaId != b.endParaId || c.startParaIndex != b.startParaIndex || c.endParaIndex != b.endParaIndex || c.rId != b.rId || c.pageNumber != b.pageNumber)
                    return false;
            }
            return true;
        },

        _sendSelectionMsg: function(force) {
            var msg = this._getSelectionMsg(force);
            if (msg) {
                // console.warn("Real send selection changed");
                pe.scene.session.sendMessage(msg);
            }
        },
        /**
         * clear selection change timer
         */
        clearSelectionChangeTimer: function() {
            if (this._selectionChangeTimer) {
                clearTimeout(this._selectionChangeTimer);
            }
        },
        /*
         * fore selection change immediately
         */
        selectionChange: function() {
            if (!this._coEditIndicator)
                topic.publish(constants.EVENT.SELECTION_CHANGE);
        },
        /**
         * set ranges
         */
        selectRanges: function(ranges, effect) {
            this.destroy();
            // if (!this._coEditIndicator)
            topic.publish(constants.EVENT.BEFORE_SELECT, ranges);


            var isCollapsed = true;
            //for hightlight
            this._renderParam = {};
            this._renderParam.effect = effect;
            this._renderParam.shell = this._shell;

            for (var i = 0; i < ranges.length; i++) {
                if (i > 0)
                    isCollapsed = false;
                else if (!ranges[i].isCollapsed())
                    isCollapsed = false;
                this._addSelect(ranges[i], false, effect);
            }
            this._checkCursor();
            if (!isCollapsed) {
                this._cursor.hide();
            }                 

            //fire selection change
            this._selectionChange();
        },
        getHighlightRanges: function(ranges, currentRange) {
            if (ranges.length <= 200)
                return ranges;
            else {
                var currRange = currentRange ? currentRange : this.getRanges()[0];

                var view = currRange.getStartView();
                if (!view)
                    return;
                var currPage = this._viewTools.getPage(view.obj);
                var currPageNum = currPage.pageNumber;
                var index = ranges.indexOf(currRange);
                var partRanges = ranges.splice(index);
                var queryRanges, highlights = [],
                    pageNum, tmpPage;
                if (ranges.length > 0) {
                    queryRanges = ranges;
                    view = queryRanges[queryRanges.length - 1].getStartView();
                    if (!view)
                        return;
                    tmpPage = this._viewTools.getPage(view.obj);
                    pageNum = tmpPage.pageNumber;
                    while (pageNum >= (currPageNum - 2) && pageNum <= (currPageNum + 2)) {
                        highlights.push(queryRanges.pop());
                        if (queryRanges.length > 0) {
                            view = queryRanges[queryRanges.length - 1].getStartView();
                            if (!view)
                                return;
                            tmpPage = this._viewTools.getPage(view.obj);
                            pageNum = tmpPage.pageNumber;
                        } else
                            break;
                    }
                }
                pageNum = currPageNum;
                while (pageNum <= (currPageNum + 2) && partRanges.length > 0) {
                    highlights.push(partRanges.shift());
                    if (partRanges.length > 0) {
                        view = partRanges[0].getStartView();
                        if (!view)
                            return;
                        tmpPage = this._viewTools.getPage(view.obj);
                        pageNum = tmpPage.pageNumber;
                    } else
                        break;
                }

                pageNum = currPageNum;
                while (pageNum >= (currPageNum - 2) && partRanges.length > 0) {
                    highlights.push(partRanges.pop());
                    if (partRanges.length > 0) {
                        view = partRanges[partRanges.length - 1].getStartView();
                        if (!view)
                            return;
                        tmpPage = this._viewTools.getPage(view.obj);
                        pageNum = tmpPage.pageNumber;
                    } else
                        break;
                }
                this._highlightWaitingList = ranges.concat(partRanges);
                return highlights;
            }
        },
        /*
         * set ranges 
         */
        highlightRanges: function(ranges, currentRange) {
            this.removeHighlight();
            var isCollapsed = true;
            ranges = this.getHighlightRanges(ranges, currentRange);
            for (var i = 0; i < ranges.length; i++) {
                //	console.log( 'start_'+ (i+1) + " " + ranges[i].getStartView().obj.getViewType() );
                if (i > 0)
                    isCollapsed = false;
                else if (!ranges[i].isCollapsed())
                    isCollapsed = false;

                try {
                    this._addSelect(ranges[i], true);
                } catch (e) {
                    console.log('highlight has error, e : ' + e);
                }
            }
        },

        /*
         * add ranges into highlight list 
         */
        registerHighlightRanges: function(ranges, currentRange) {
            this.removeHighlight();
            var isCollapsed = true;
            ranges = this.getHighlightRanges(ranges, currentRange);
            for (var i = 0; i < ranges.length; i++) {
                //	console.log( 'start_'+ (i+1) + " " + ranges[i].getStartView().obj.getViewType() );
                if (i > 0)
                    isCollapsed = false;
                else if (!ranges[i].isCollapsed())
                    isCollapsed = false;
                var range = ranges[i];
                try {
                    if (range.getStartModel() == null || range.getStartModel().obj == null) {
                        console.error('wrong range added');
                        return;
                    }
                    this._setStartEnd(range);
                    if (!this._shell.getEditor().isReadOnly()) {
                        var drawingObj = this._rangeTools.ifContainOnlyOneDrawingObj(range);
                        if (drawingObj) {
                            this.addRanges(range, true);
                            return;
                        }
                    }
                    range = this._rangeTools.optimize(range, true);
                    this.addRanges(range, true);
                } catch (e) {
                    console.log('highlight has error, e : ' + e);
                }
            }
        },

        /**
         * search the ranges in current pages which needed to be highlight, this search function is forward to search the array from index 0.
         * @param queryRanges
         * @param pageNum
         * @param highlights
         * @returns
         */
        _getRangesForScroll2: function(queryRanges, pageNum, highlights) {
            if (queryRanges[0]) {
                var rangePageNum = ViewTools.getPage(queryRanges[0].getStartParaPos().obj.getAllViews().rootView.getFirst()).pageNumber;
                if (rangePageNum >= (pageNum - 2) && rangePageNum <= (pageNum + 2)) {
                    highlights.push(queryRanges.shift());
                    return this._getRangesForScroll2(queryRanges, pageNum, highlights);
                } else
                    return highlights;
            } else
                return highlights;
        },
        /**
         * search the ranges in current pages which need to be highlight, it will search the array by reverse from the last index of the array at first
         * and then forward to search in the array from index 0  
         * @param queryRanges
         * @param pageNum
         * @returns {Array}
         */
        _getRangesForScroll: function(queryRanges, pageNum) {
            var highlights = [];
            var rangePageNum = ViewTools.getPage(queryRanges[queryRanges.length - 1].getStartParaPos().obj.getAllViews().rootView.getFirst()).pageNumber;
            while (rangePageNum >= (pageNum - 2) && rangePageNum <= (pageNum + 2)) {
                highlights.push(queryRanges.pop());
                if (queryRanges[queryRanges.length - 1])
                    rangePageNum = ViewTools.getPage(queryRanges[queryRanges.length - 1].getStartParaPos().obj.getAllViews().rootView.getFirst()).pageNumber;
                else
                    break;
            }
            highlights = this._getRangesForScroll2(queryRanges, pageNum, highlights);
            return highlights;
        },
        /**
         * Get the append highlight ranges from _highlightWaitingList by on scroll from EditWindow
         * @param pageNum
         * @returns {Array}
         */
        getAppendRangesForScroll: function(pageNum) {
            var rangePageNum = -1,
                queryRanges = [],
                highlights = [],
                index = Math.round(this._highlightWaitingList.length / 2),
                half = index,
                startNum = ViewTools.getPage(this._highlightWaitingList[0].getStartParaPos().obj.getAllViews().rootView.getFirst()).pageNumber;
            while ((rangePageNum < 0 || rangePageNum < pageNum - 2) || (rangePageNum > pageNum + 2)) {
                if (rangePageNum >= 0) {
                    if (rangePageNum > pageNum && pageNum > startNum)
                        index -= half;
                    else
                        index += half;
                }
                var range = this._highlightWaitingList[index];
                if (range) {
                    rangePageNum = ViewTools.getPage(range.getStartParaPos().obj.getAllViews().rootView.getFirst()).pageNumber;
                    half = Math.round(half / 2);
                } else
                    break;
            }
            var partRanges = this._highlightWaitingList.splice(index);
            if (partRanges.length > 0)
                highlights = highlights.concat(this._getRangesForScroll(partRanges, pageNum));
            if (this._highlightWaitingList.length > 0)
                highlights = highlights.concat(this._getRangesForScroll(this._highlightWaitingList, pageNum));

            this._highlightWaitingList = this._highlightWaitingList.concat(partRanges);
            return highlights;
        },
        /**
         * Get the append highlight ranges from _highlightWaitingList by navigate from find/replace dialog
         * @param pageNum
         * @returns {Array}
         */
        getAppendRangesForNavigate: function(pageNum) {
            var rangePageNum = -1,
                ranges = [],
                index = 0;
            while (this._highlightWaitingList.length > 0) {
                rangePageNum = ViewTools.getPage(this._highlightWaitingList[0].getStartParaPos().obj.getAllViews().rootView.getFirst()).pageNumber;
                if (rangePageNum == pageNum)
                    ranges.push(this._highlightWaitingList.shift());
                else {
                    rangePageNum = ViewTools.getPage(this._highlightWaitingList[this._highlightWaitingList.length - 1].getStartParaPos().obj.getAllViews().rootView.getFirst()).pageNumber;
                    if (rangePageNum == pageNum)
                        ranges.push(this._highlightWaitingList.pop());
                    else
                        break;
                }
            }
            return ranges;
        },
        appendHighlights: function(pageNum, type) {
            if (this._highlightWaitingList.length == 0) return;
            var ranges = [];
            switch (type) {
                case "navigate":
                    ranges = this.getAppendRangesForNavigate(pageNum);
                    break;
                case "scroll":
                    ranges = this.getAppendRangesForScroll(pageNum);
                    break;
                default:
                    break;
            }
            setTimeout(lang.hitch(this, function() {
                for (var i = 0; i < ranges.length; i++) {
                    //	console.log( 'start_'+ (i+1) + " " + ranges[i].getStartView().obj.getViewType() );
                    if (i > 0)
                        isCollapsed = false;
                    else if (!ranges[i].isCollapsed())
                        isCollapsed = false;

                    this._addSelect(ranges[i], true);
                }
            }), 10);
        },
        removeHighlight: function() {
            var select;
            while (this._highlightSelections.length > 0) {
                select = this._highlightSelections.pop();
                select.destroy();
            }
            this._highlightRanges = [];
            this._highlightWaitingList = [];
        },
        /**
         * After update paragraph view the selection internal _start and _end object releated view will be invalid. 
         */
        resetStartEndObj: function() {
            this._start = null;
            this._setStartEnd(this._ranges[0]);
            if (this._ranges.length > 1)
                this._setStartEnd(this._ranges[this._ranges.length - 1]);
        },
        /**
         * Update the selection in model but not render cursor/selection to user.
         * It's used the model was changed but view was not updated.
         * When user change model and change the selection, then update cursor position after view updated.  
         */
        selectRangesBeforeUpdate: function(ranges) {
            if (this._ranges && this._ranges.length > 0) {
                try {
                    var beforeUpdate = true;
                    if (!this._coEditIndicator)
                        topic.publish(constants.EVENT.REMOVE_SELECT, this._ranges, beforeUpdate);
                } catch (e) {
                    console.error("error when publish writer.constants.EVENT.REMOVE_SELECT:" + e);
                }
            }
            this._ranges = [];

            for (var i = 0; i < ranges.length; i++) {
                this._ranges.push(ranges[i]);
            }
        },

        /**
         * Reselect the current ranges to after window resized.
         * No selection changed
         */
        updateSelection: function(notScrollView) {
            if (pe.lotusEditor.updateManager.isUpdating())
                return;

            if(this._start && this._start.obj && this._start.obj.domNode){
            	var selRoot = HtmlTools.getRootNode(this._start.obj.domNode);
            	if(selRoot && selRoot.nodeType == 1){
                    var range = this._ranges[0];
                    var startV = range.getStartView();
                    var startDom = startV && startV.obj && startV.obj.domNode;
                    if(startDom){
                        selRoot = HtmlTools.getRootNode(startDom);
                        if(selRoot && selRoot.nodeType == 1){//document has been reloaded
    	                    var startParaPos = range.getStartParaPos();
    	                    var startObj = startParaPos.obj;
    	                    if(startObj && startObj.id){
    	                    	 var sModel = ModelTools.getModelById(startObj.id);
    	                    	 var sParaPos = {
    	                                 obj: sModel,
    	                                 index: startParaPos.index
    	                             };

    	                    	 var eParaPos = {obj: sModel, index: startParaPos.index};
    	                    	 var endParaPos = range.getEndParaPos();
    	                    	 var endObj = endParaPos.obj;
    	                    	 if(endObj && endObj.id) {
    	                    		 if(endObj.id != startObj.id) {
    	                    			 var eModel = ModelTools.getModelById(endObj.id);
    	                    			 if(eModel) {
    	                    				 eParaPos.obj = eModel;
    	                    				 eParaPos.index = endParaPos.index;
    	                    			 }
    	                    		 } else {
        	                    		 eParaPos.index = endParaPos.index;
    	                    		 }
    	                    	 }
    	                    	 if(!sParaPos.obj && !eParaPos.obj)
    	                    		 return;

    	                         var nRange = new Range(sParaPos, eParaPos, range.rootView);
    	                         this.selectRanges([nRange]);
    	                         this.scrollIntoView();
    	                    }
    	                    return;
                        }
                    }
            	}
            }

            var ranges = RangeTools.mergeRangesInCrossPageCell(this._ranges);
            var highlights = this._highlightRanges;
            var highlightWaitingList = this._highlightWaitingList;
            for (var i = 0; i < ranges.length; i++) {
                // Clone the range will get the view from Model.
                // Because of the view has been changed.
                ranges[i] = ranges[i].clone();
            }
            for (var i = 0; i < highlights.length; i++) {
                // Clone the range will get the view from Model.
                // Because of the view has been changed.
                highlights[i] = highlights[i].clone();
            }
            // Update field and table selection.
            // if (!this._coEditIndicator)
            topic.publish(constants.EVENT.BEFORE_SELECT, ranges);

            this.destroy();
            this.removeHighlight();
            this._highlightWaitingList = highlightWaitingList;
            for (var i = 0; i < ranges.length; i++) {
                var rstartView = ranges[i].getStartView();
                if (rstartView) {
                    // reset range rootview
                    var vTools = ViewTools;
                    if (rstartView.obj.getViewType)
                        ranges[i].rootView = vTools.getTextBox(rstartView.obj) || vTools.getDocument(rstartView.obj);
                    else
                        ranges[i].rootView = pe.lotusEditor.layoutEngine.rootView;
                }

                this._addSelect(ranges[i]);
            }
            this._checkCursor();
            for (var j = 0; j < highlights.length; j++) {
                this._addSelect(highlights[j], true);
            }
            this._selectionChange();

            if (!notScrollView)
                this.scrollIntoView();
        },

        /* start and end should be {'obj': obj, 'index': index}
         */
        select: function(start, end) {
            this.selectRanges([new Range(start, end)]);
        },
        /*
         * Select from current start to new pos
         */
        selectTo: function(pos, onBoundary, dir) {
            this._cursor.hide();
            if (onBoundary === true) {
                // make sure the pos is a char boundary
                if (this._viewTools.isTextRun(pos.obj)) {
                    var modelpos = {
                        obj: ModelTools.getParagraph(pos.obj.model),
                        index: pos.obj.start + pos.index
                    };
                    var cbs = ModelTools.getCharBoundaries(modelpos);
                    if (modelpos.index > cbs.start && cbs.end > modelpos.index) {
                        var nOffset = cbs.end - modelpos.index;
                        while (nOffset > 0) {
                            pos = this._rangeTools.getNextPosition(pos);
                            nOffset--;
                        }
                    }
                }
            }
            this.select(this._start, pos);

            // do not scroll when select only one anchor object
            var range = new Range(this._start, pos);
            if (!this._rangeTools.ifContainOnlyOneDrawingObj(range))
            {
                var up = false;
                var down = false;
                if (dir && dir == "up")
                    up = true;
                if (dir && dir != "up")
                    down = true;
                this.scrollIntoView(up, down, new Range(pos, pos));
            }
        },

        /*
         * Move and set range to a position
         */
        moveTo: function(run, index) {
            var viewTools = this._viewTools;
            if (!viewTools.isRun(run) && !viewTools.isImage(run) && !viewTools.isTextBox(run) &&
                !viewTools.isCanvas(run)) {
                run = this._rangeTools.getFirstItem(run, this._rangeTools.RUNGUARD);
                index = 0;
            }

            if (run && index >= 0 && index <= run.len) {
                var pos = {
                    'obj': run,
                    'index': index
                };
                this.select(pos, pos);
                return true;
            }
            return false;
        },

        _getPosition: function(range, bEnd) {
            var needSwap = this._rangeTools.isNeedSwap(range);
            if (needSwap && bEnd || (!needSwap && !bEnd))
                return range.getStartView();
            else
                return range.getEndView();
        },

        /*
         * Move left if is collpased
         * or collapsed
         */
        moveLeft: function(bShift, bCtrl, nOffset) {
            if (nOffset == 0)
                return;

            var range = this._ranges[this._ranges.length - 1];
            var pos = (bShift) ? this._end : this._getPosition(range, false);
            var modelpos = range._viewToModel(pos);
            if (bCtrl && nOffset == null) {
                var prevwb = ModelTools.getPreviousWordPosition(modelpos);
                if (prevwb >= 0)
                    nOffset = modelpos.index + modelpos.obj.start - prevwb;
            }
            if (nOffset == null) {
                var prevcb = ModelTools.getPrevCharBoundary(modelpos);
                if (prevcb >= 0)
                    nOffset = modelpos.obj.start + modelpos.index - prevcb;
            }
            if (!nOffset || nOffset < 1)
                nOffset = 1;

            if ((this._viewTools.isRow(this._end.obj) || this._viewTools.isTable(this._end.obj))) {
                var target = this._end.obj;
                if (this._end == range.getEndView()) {
                    target = target.getItemByIndex(this._end.index - 1);
                } else {
                    target = target.getItemByIndex(this._end.index);
                }
                pos = {};
                pos.obj = target;
            }
            if (!this.isEmpty() && pos && !bShift) {
                if (this._viewTools.isRow(pos.obj) || this._viewTools.isCell(pos.obj)) {
                    var range = new Range({
                        obj: {}
                    }, {
                        obj: {}
                    });
                    range.moveToEditStart(pos.obj.model);
                    this.selectRanges([range]);
                } else {
                    this.select(pos, pos);;
                }

            } else if (pos) {
                while (nOffset && pos) {
                    pos = this._rangeTools.getPrevPosition(pos, bShift);
                    nOffset--;
                }
                if (pos) {
                    if (bShift) {
                        this.selectTo(pos);
                    } else {
                        this.select(pos, pos);
                    }
                }
            }
        },
        /*
         * Move right if collpased
         * or collapsed
         */
        moveRight: function(bShift, bCtrl, nOffset) {
            if (nOffset == 0)
                return;

            var range = this._ranges[this._ranges.length - 1];
            var pos = (bShift) ? this._end : this._getPosition(range, true);
            var modelpos = range._viewToModel(pos);
            if (bCtrl && nOffset == null) {
                var nextwb = ModelTools.getNextWordPosition(modelpos);
                if (nextwb >= 0)
                    nOffset = nextwb - modelpos.index - modelpos.obj.start;
            }
            if (nOffset == null) {
                var nextcb = ModelTools.getNextCharBoundary(modelpos);
                if (nextcb >= 0)
                    nOffset = nextcb - modelpos.obj.start - modelpos.index;
            }
            if (!nOffset || nOffset < 1)
                nOffset = 1;

            if ((this._viewTools.isRow(this._end.obj) || this._viewTools.isTable(this._end.obj))) {
                var target = this._end.obj;
                if (this._end == range.getEndView()) {
                    target = target.getItemByIndex(this._end.index - 1);
                } else {
                    target = target.getItemByIndex(this._end.index);
                }
                pos = {};
                pos.obj = target;
            }
            if (!this.isEmpty() && pos && !bShift) {
                if (this._viewTools.isRow(pos.obj) || this._viewTools.isCell(pos.obj)) {
                    var range = new Range({
                        obj: {}
                    }, {
                        obj: {}
                    });
                    range.moveToEditEnd(pos.obj.model);
                    this.selectRanges([range]);
                } else {
                    this.select(pos, pos);;
                }
                //			this.select(pos, pos);
            } else if (pos) {
                while (nOffset && pos) {
                    pos = this._rangeTools.getNextPosition(pos, bShift);
                    nOffset--;
                }
                if (pos) {
                    if (bShift) {
                        this.selectTo(pos);
                    } else {
                        this.select(pos, pos);
                    }
                }
            }
        },

        getSelectedText: function(nls, separator, maxbytes) {
            // get all paragraphs's text
            var text = "";
            var sep = separator || " ";
            var ranges = this._ranges;
            var bytsLen = 0;
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                var start = range.getStartParaPos();
                var end = range.getEndParaPos();
                var startModel = start.obj;
                var endModel = end.obj;
                var startIndex = start.index;
                var endIndex = end.index;

                var iterator = new RangeIterator(range);
                var para = null;
                while (para = iterator.nextParagraph()) {
                    if (para) {
                    	if (text)
                    		text += sep;
                    	var paraTxt = "";
                        if (startModel == para && endModel == para) {
                        	paraTxt = para.text.substring(startIndex, endIndex);
                            break;
                        } else if (startModel == para) {
                        	paraTxt = para.text.substring(startIndex);
                        } else if (endModel == para) {
                        	paraTxt = para.text.substring(0, endIndex);
                            break;
                        } else {
                        	paraTxt = para.text;
                        }

                        text += paraTxt;
                        bytsLen += paraTxt.getBytesLength();
                        if(maxbytes && (bytsLen>maxbytes))
                        	break;
                    }
                }

                if(maxbytes && (bytsLen>maxbytes))
                	break;

                if (nls)
                {
	                if (text.trim() == "")
	                    text = nls.acc_blank;
	                else
	                    text += nls.acc_selected;
                }
            }
            return text;
        },

        getRunInfo: function(runView, nls, endIndex) {
            var tools = ModelTools;
            if (runView.start + runView.len <= endIndex)
                return {
                    text: "",
                    endIndex: endIndex
                };
            endIndex = runView.start + runView.len;
            var text = "";

            var link = tools.getLink(runView.model);
            if (link) {
                if (link.start + link.length > endIndex)
                    endIndex = link.start + link.length;
                text = nls.acc_link;
            }


            var field = tools.getField(runView.model);
            if (field) {
                if (field.start + field.length > endIndex)
                    endIndex = field.start + field.length;
                text = nls.acc_field + " " + text;
            }

            var styleId = runView.model.textProperty && runView.model.textProperty.styleId;
            if (styleId) {
                if (styleId == "EndnoteReference") {
                    text = text + " " + nls.acc_endnote;
                } else if (styleId == "FootnoteReference") {
                    text = text + " " + nls.acc_footnote;
                }
            }

            if (text.trim() != "")
                text = " " + text + " ";
            return {
                text: text,
                endIndex: endIndex
            };
        },
        getRunCharInfo: function(viewPos, nls) {
            // verify if the text in link
            var tools = ModelTools;
            var text = " ";
            var link = tools.getLink(viewPos.obj.model);
            if (link) {
                text = nls.acc_link;
            }


            var field = tools.getField(viewPos.obj.model);
            if (field) {
                text = nls.acc_field + " " + text;
            }
            if (viewPos.index == 0) {
                var styleId = viewPos.obj.model.textProperty && viewPos.obj.model.textProperty.styleId;
                if (styleId) {
                    if (styleId == "EndnoteReference") {
                        text = text + " " + nls.acc_endnote;
                    } else if (styleId == "FootnoteReference") {
                        text = text + " " + nls.acc_footnote;
                    }
                }
            }


            text = this.getCommonInfo(viewPos.obj, nls) + " " + text;
            return " " + text + " ";;

        },
        getCommonInfo: function(runView, nls) {
            // verify if the line in table
            var cell = this._viewTools.getCell(runView);
            var row;
            if (cell)
                row = this._viewTools.getRow(cell);
            if (cell && row) {
                return " " + string.substitute(nls.acc_inTable, [row.getRowIdx() + 1, cell.getColIdx() + 1]) + " ";
            }
            return "";
        },

        getRunText: function(modelPara, runView, nls) {
            if (typeof window.spellcheckerManager == 'undefined' ||
                !window.spellcheckerManager.isScServiceAvialable() ||
                !window.spellcheckerManager.isAutoScaytEnabled()) { // if not enable spell check
                return runView.getText();
            }

            // get the paragraph's misWords info
            if (!modelPara.scdata || !modelPara.scdata.misWords || !modelPara.scdata.misWords.length) // this paragraph does not misword
                return runView.getText();


            var sIndex = runView.start;
            var eIndex = runView.start + runView.len;
            var text = runView.getText();
            for (var i = modelPara.scdata.misWords.length - 1; i >= 0; i--) {
                var mis_item = modelPara.scdata.misWords[i];
                if (mis_item.index >= sIndex && mis_item.index <= eIndex) { // if the start of misword includes in the run
                    // add acc string into run
                    if (mis_item.index == sIndex) {
                        text = nls.acc_spellWarn + " " + text;
                    } else if (mis_item.index == eIndex) {
                        text = text + nls.acc_spellWarn + " ";
                    } else {
                        var firstpart = text.slice(0, mis_item.index - sIndex);
                        var secondpart = text.slice(mis_item.index - sIndex);
                        text = firstpart + " " + nls.acc_spellWarn + " " + secondpart;
                    }

                }
            }
            return text;
        },

        getEditModeText: function(mode, nls) {
            if (constants.EDITMODE.HEADER_FOOTER_MODE == mode)
                return nls.ACC_headerFooterMode;
            if (constants.EDITMODE.EDITOR_MODE == mode)
                return nls.ACC_EditorMode;
            if (constants.EDITMODE.FOOTNOTE_MODE == mode)
                return nls.ACC_FootnotesMode;
            if (constants.EDITMODE.ENDNOTE_MODE == mode)
                return nls.ACC_EndnotesMode;
        },

        /**
         * this funciton get the text should read out, and announce the string, so the JAWS can read it out
         * @param opt: what key is pressed
         * @param bShift: if the shift key is pressed
         */
        AnnounceSelection: function(opt, bShift) {
            if (has("ff")) {
                if (ViewTools.getCurrSelectedImage()) {
                    return;
                }
                var text = "";
                var nls = i18nlang;
                if (bShift || opt == "all") {
                    text = this.getSelectedText(nls);
                } else {
                    if (this._ranges && this._ranges.length > 0) {
                        var view = this._ranges[0].getStartView();
                        ///
                        var posText = "";
                        var newMode = pe.lotusEditor.getShell().getEditMode();
                        var newBody = this._viewTools.getBody(view.obj);
                        var newPage = this._viewTools.getPage(newBody);
                        var newSectionIndex = pe.lotusEditor.setting.getSectionIndex(newPage.getSection().getId());
                        var modeChange = false,
                            pageChange = false,
                            sectionChange = false,
                            bodyChange = false;
                        if (!this.posInfo) {
                            this.posInfo = {};
                            modeChange = true, pageChange = true, sectionChange = true, bodyChange = true;
                        } else {
                            if (newMode != this.posInfo.editMode) {
                                modeChange = true
                                this.posInfo.editMode = newMode;
                            }
                            if (newPage.pageNumber != this.posInfo.pageNumber) {
                                pageChange = true;
                            }
                            if (this.posInfo.sectionIndex != newSectionIndex) {
                                sectionChange = true;
                            }
                            if (this.posInfo.body != newBody) {
                                bodyChange = true;
                            }
                        }

                        if (modeChange) {
                            posText = this.getEditModeText(newMode, nls) + " ";
                            this.posInfo.editMode = newMode;
                        }
                        if (pageChange) {
                            this.posInfo.pageNumber = newPage.pageNumber;
                            posText += string.substitute(nls.acc_page, [newPage.pageNumber]) + " ";
                        }
                        if (sectionChange) {
                            this.posInfo.sectionIndex = newSectionIndex;
                            posText += string.substitute(nls.acc_section, [newSectionIndex + 1]) + " ";
                        }
                        if (bodyChange) {
                            this.posInfo.body = newBody;
                            var body = newPage.getFirst();
                            var index = 1;
                            while (body) {
                                if (body == newBody) {
                                    posText += string.substitute(nls.Acc_column, [index]) + " ";
                                    break;
                                }
                                body = body.next(true);
                                index++;
                            }
                        }


                        ///

                        if (opt == "up" || opt == "down" || opt == "link") {
                            if (!this._viewTools.getTOC(view.obj)) { //if not in TOC read the line contents out
                                var line = this._viewTools.isLine(view.obj) ? view.obj : this._viewTools.getLine(view.obj);
                                var endIndex = 0;
                                if (line && line.container) {
                                    var para = line.parent.model;
                                    var run = line.container.getFirst();
                                    var info = this.getRunInfo(run, nls, endIndex);
                                    text += info.text;
                                    endIndex = info.endIndex;
                                    text += this.getRunText(para, run, nls);
                                    run = line.container.next(run);
                                    while (run) {
                                        var info = this.getRunInfo(run, nls, endIndex);
                                        text += info.text;
                                        endIndex = info.endIndex;
                                        text += this.getRunText(para, run, nls);
                                        run = line.container.next(run);
                                    }
                                }
                                if (text.trim() == "")
                                    text = nls.acc_blank;

                                // get paragraph style
                                if (line && line.parent) {
                                    var pModel = line.parent.model;
                                    if (line.isFirstLine() && pModel.isHeading()) {
                                        var paraStyle = pModel.getStyleId();
                                        text = paraStyle + " " + text;
                                    }
                                    if (pModel.isList()) {
                                        text = pModel.listSymbols.txt + " " + text;
                                    }

                                }
                                text = this.getCommonInfo(view.obj, nls) + " " + text;
                            } else {
                                // read out all the paragraph
                                var line = this._viewTools.isLine(view.obj) ? view.obj : this._viewTools.getLine(view.obj);
                                var pModel = line.parent.model;
                                text = pModel.text;
                            }
                        } else {
                            //read the char current selected
                            var tmp = view.obj.getText();
                            if (view.index == tmp.length)
                                text = nls.acc_blank;
                            else {
                                text = tmp.substring(view.index, view.index + 1);
                                if (text.trim() == "")
                                    text = nls.acc_space;
                            }

                            text = this.getRunCharInfo(view, nls) + " " + text;
                        }

                        text = posText + text;

                    }
                }
                this._shell._editWindow.announce(text);
            }
        },

        /*
         * select a word under pos
         */
        selectOneWord: function(pos) {
            if (pos.obj && this._viewTools.isRun(pos.obj) && this._viewTools.isLine(pos.obj.getParent())) {
                var range = this._ranges[this._ranges.length - 1];
                var modelpos = range._viewToModel(pos);
                var first = pos.obj.getParent().getContainer().getFirst();
                if (pos.index == 0 && first == pos.obj) {
                    var nextboundary = ModelTools.getNextWordPosition(modelpos);
                    if (nextboundary > 0)
                        this.select(pos, {
                            index: nextboundary,
                            obj: modelpos.obj
                        });
                } else {
                    var wordrange = this.getWordRange(modelpos);
                    if (wordrange) { // start and end have a same obj, must not an empty range
                        this.selectRanges([wordrange]);
                    }
                }
            }
            var that = this;
            setTimeout(function(){
                var shell = that._shell;
                if (shell)                                       
                    shell.dismissMobileMenu();               
            },0);
        },

        getWordRange: function(modelpos) {
            var range = this._ranges[this._ranges.length - 1];
            if (!modelpos)
                modelpos = range.getStartModel();

            var wordse = ModelTools.getCurrentWordRange(modelpos);
            var wordrange = new Range(wordse.start, wordse.end, range.getRootView())
            if (!wordrange.isCollapsed()) { // start and end have a same obj, must not an empty range
                wordrange.getStartView();
                wordrange.getEndView();
                // when it is end of a view, move to next view head 
                if (wordrange._start && wordrange._end && wordrange._start.obj != wordrange._end.obj &&
                    wordrange._start.index == wordrange._start.obj.len) {
                    wordrange._start.index = 0;
                    wordrange._start.obj = this._rangeTools.getNextRun(wordrange._start.obj);
                }
                return wordrange;
            }
        },
        /*
         * Select line
         */
        _moveToLine: function(line, offset, bShift) {
            var index = line.first().getIndex() + offset;
            var run = line.select(function(item) {
                return item.getIndex() <= index && index <= item.getEndView();
            });
            if (!run) {
                run = line.last();
                index = run.getEndView();
            }
            if (run) {
                if (bShift) {
                    this.selectTo({
                        'obj': run,
                        'index': index
                    });
                } else {
                    this.moveTo(run, index);
                }
            }

        },
        /*
         * Offset height
         */
        _offsetHeight: function(pos, offset, bShift) {
            var pt = this._getViewPos(pos);
            var y = pt.y + offset;
            if (y < 0) y = 0;
            pt.y = y;
            var ret = this._shell
                .pickAnything(this._shell.logicalToClient(pt));
            if (ret && ret.obj == pos.obj)
                return false;

            if (offset > 0 && ret.obj.isAnchor)
                return false;

            if (ret) {
                if (bShift)
                    this.selectTo(ret);
                else
                    this.select(ret, ret);
                return true;
            }
        },
        nextParagraph: function(bShift) {
            var pos = (bShift) ? this._end : this._start;
            var obj = pos.obj,
                index = pos.index,
                nextPos;
            var tools = this._rangeTools,
                viewTools = this._viewTools;

            function getlastPos(para) {
                if (para) {
                    var last = tools.getLastItem(para, tools.RUNGUARD);
                    if (!last) {
                        console.error("paragraph error");
                        return;
                    }
                    return {
                        "obj": last,
                        "index": last.len
                    };
                }
            }

            if (viewTools.isRow(obj) || viewTools.isTable(obj)) {
                nextPos = getlastPos(tools.getNextPara(obj.getItemByIndex(index) || obj));

            } else {
                var para = this._viewTools.getParagraph(obj);
                var last = para && tools.getLastItem(para, tools.RUNGUARD);
                if (last) {
                    if (index == last.len && obj == last)
                    //last position
                        nextPos = getlastPos(tools.getNextPara(para));
                    else
                        nextPos = {
                            "obj": last,
                            "index": last.len
                        };
                }
            }


            if (nextPos) {
                if (bShift) {
                    this.selectTo(nextPos);
                } else {
                    this.select(nextPos, nextPos);
                }
            }
        },

        prevParagraph: function(bShift) {
            var pos = (bShift) ? this._end : this._start;

            var obj = pos.obj;
            var index = pos.index;
            var prevPos;
            var tools = this._rangeTools,
                viewTools = this._viewTools;

            function getFirstPos(para) {
                var firstRun = para && tools.getFirstItem(para, tools.RUNGUARD);
                return firstRun && {
                    "obj": firstRun,
                    "index": 0
                };
            }
            if (viewTools.isRow(obj) || viewTools.isTable(obj)) {
                prevPos = getFirstPos(tools.getPrevPara(obj.getItemByIndex(index) || obj));
            } else {
                var para = this._viewTools.getParagraph(obj);
                var firstRun = para && tools.getFirstItem(para, tools.RUNGUARD);
                if (!firstRun) {
                    console.error("paragraph error");
                    return;
                }
                if (index == 0 && obj == firstRun)
                    prevPos = getFirstPos(tools.getPrevPara(para));
                else
                    prevPos = {
                        "obj": firstRun,
                        "index": 0
                    };
            }


            if (prevPos) {
                if (bShift) {
                    this.selectTo(prevPos);
                } else {
                    this.select(prevPos, prevPos);
                }
            }
        },
        /**
         * prevAnchorObj
         * @param bShift
         */
        prevAnchorObj: function(bShift) {
            var range = this._ranges[this._ranges.length - 1];
            var pos = (bShift) ? this._end : (this._rangeTools.compare(this._start, this._end) ? this._end : this._start);
            var modelpos = range._viewToModel(pos);

            var prevAnchor = ModelTools.getPrev(modelpos.obj, ModelTools.isAnchor);
            if (prevAnchor) {
                var drawingStart = {
                    "obj": prevAnchor,
                    "index": 0
                };
                var drawingEnd = {
                    "obj": prevAnchor,
                    "index": 1
                };
                this.select(drawingStart, drawingEnd);
            }
        },


        nextAnchorObj: function(bShift) {
            var range = this._ranges[this._ranges.length - 1];
            var pos = (bShift) ? this._end : (this._rangeTools.compare(this._start, this._end) ? this._start : this._end);
            var modelpos = range._viewToModel(pos);

            var nextAnchor = ModelTools.getNext(modelpos.obj, ModelTools.isAnchor);
            if (nextAnchor) {
                var drawingStart = {
                    "obj": nextAnchor,
                    "index": 0
                };
                var drawingEnd = {
                    "obj": nextAnchor,
                    "index": 1
                };
                this.select(drawingStart, drawingEnd);
            }
        },
        /*
         * Move up 
         */
        lineUp: function(bShift, bCtrl, bAlt) {
            if (bCtrl && !bAlt)
                return this.prevParagraph(bShift);
            if (bCtrl && bAlt)
                return this.prevAnchorObj(bShift);

            var pos = (bShift) ? this._end : (this._rangeTools.compare(this._start, this._end) ? this._end : this._start);
            if (bShift && (this._viewTools.isTable(this._end.obj) || this._viewTools.isRow(this._end.obj))) {
                var target = this._end.obj;
                var range = this._ranges[this._ranges.length - 1];
                if (this._end == range.getEndView()) {
                    target = target.getItemByIndex(this._end.index - 1);
                } else {
                    target = target.getItemByIndex(this._end.index);
                }
                pos = {};
                pos.obj = target;

            }
            var tools = this._rangeTools,
                viewTools = this._viewTools;
            var posPt = tools.getBodyPosition(pos);
            var pt = {
                "x": posPt.x,
                "y": posPt.y
            };
            if (viewTools.isRun(pos.obj) || viewTools.isDrawingObj(pos.obj)) {
                var target = pos.obj.getParent();
            } else {
                var target = pos.obj;
            }
            var inCell = viewTools.getCell(pos.obj);
            var prev = tools.getPrevItemByPosition(target, function(item) {
                return true;
            }, 'text.Line');
            if (!bShift && !viewTools.getTextBox(target)) {
                var ret = this.toPrevEditArea(target, prev);
                if (ret) {
                    prev = ret;
                }
            }


            if (!prev && !bShift) {
                var range = this._ranges[this._ranges.length - 1];
                range.collapse(true);
                this.selectRanges([range]);
            } else if (!prev) {
                this.lineStart(true, false);
            }
            while (prev) {
                if (inCell) {
                    var preCell = viewTools.getCell(prev);
                    if (preCell && inCell != preCell) {
                        var delX = pt.x - tools.getBodyPosition({
                            obj: inCell
                        }).x - inCell.getLeftEdge();
                        pt = tools.getBodyPosition({
                            obj: prev
                        });
                        pt.x += delX;
                    }
                }
                var body = viewTools.getParent(prev, 'page.Body');
                if (body)
                    pt.x = posPt.x + body.getContentLeft() + 1;
                var pos = viewTools.getPosition(prev);
                var size = viewTools.getSize(prev);
                pt.y = pos.y + size.h / 2;
                //var pos = this._shell.pickAnything( this._shell.logicalToClient( pt ) );
                pos = this._getTextItemByPosition(pt, viewTools.getTextBox(prev));

                if (pos) {
                    var txbx = viewTools.getTextBox(pos.obj);
                    if ((txbx && !viewTools.isAncestor(txbx, prev) ||
                            viewTools.isDrawingObj(pos.obj)) && !bShift) {
                        var drawingObj = txbx || pos.obj;
                        if (viewTools.isInlineDrawingObj(drawingObj)) {
                            // directly select the inline drawing obj.
                            var drawingStart = {
                                "obj": drawingObj,
                                "index": 0
                            };
                            var drawingEnd = {
                                "obj": drawingObj,
                                "index": 1
                            };
                            this.select(drawingStart, drawingEnd);
                            break;
                        } else {
                            // skip this textbox & anchor obj
                            prev = tools.getPrevItemByPosition(prev, function(item) {
                                return true;
                            }, 'text.Line');
                            continue;
                        }
                    }

                    // make sure ths pos is a char boundary
                    var range = this._ranges[this._ranges.length - 1];
                    var modelpos = range._viewToModel(pos);
                    var cbs = ModelTools.getCharBoundaries(modelpos);
                    if (modelpos.index > cbs.start && cbs.end > modelpos.index) {
                        var nOffset = cbs.end - modelpos.index;
                        while (nOffset > 0) {
                            pos = this._rangeTools.getNextPosition(pos);
                            nOffset--;
                        }
                    }

                    if (bShift) {
                        this._checkBoundary(this._start, pos, true);
                        this.selectTo(pos);
                    } else
                        this.select(pos, pos);
                }

                break;
            }
        },
        /**
         * check boundaray of selection objects
         * 
         */
        _checkBoundary: function(start, end, bUp) {
            var startObj = start.obj,
                endObj = end.obj,
                obj, block;
            var swapped = this._rangeTools.compare(start, end);

            if (!swapped) {
                if (this._viewTools.isRun(endObj) && !endObj.previous() && end.index == 0) {
                    var line = endObj.parent;
                    if (!line.previous()) {
                        end.index = (endObj.len > 0) ? 1 : 0;
                    }
                }
            }

            if ((!swapped && bUp) || (swapped && !bUp)) {
                //check endObj
                obj = endObj;
                if (bUp) {
                    while (obj && !obj.next()) {
                        obj = obj.getParent();
                    }
                } else {
                    while (obj && !obj.previous()) {
                        obj = obj.getParent();
                    }
                }


                block = obj && this._viewTools.getTOC(obj);
                if (block && block != obj) {
                    var temp = this._viewTools.getParent(startObj, function(item) {
                        return item.model == block.model;
                    });
                    if (!temp) {
                        if (endObj = (bUp) ? block.previous() : block.next()) {
                            end.obj = endObj;
                            end.index = (bUp) ? this._viewTools.length(block) : 0;
                            return this._checkBoundary(start, end, bUp);
                        }
                    }
                }
            }

        },
        _getTextItemByPosition: function(pt, txbx) {
            var path;
            var options = {
                "notAnchor": !this._viewTools.isDrawingObj(this.getEditView())
            }
            if (txbx) {
                pt.x -= txbx.parent.getLeft();
                pt.y -= txbx.parent.getTop();
                path = [];
                txbx.getElementPath(pt.x, pt.y, txbx.parent.getBoxHeight(), path, options);
            } else {
                var rootView = window.layoutEngine.rootView,
                    pos;
                path = rootView.getElementPath(pt.x, pt.y, options);
            }

            if (path && path.length >= 2) {
                pos = {};
                pos.index = path[path.length - 1].index || 0;
                pos.obj = path[path.length - 2];
            }
            return pos;
        },
        /*
         * Move down
         */
        lineDown: function(bShift, bCtrl, bAlt) {
            if (bCtrl && !bAlt)
                return this.nextParagraph(bShift);
            if (bCtrl && bAlt)
                return this.nextAnchorObj(bShift);

            var pos = (bShift) ? this._end : (this._rangeTools.compare(this._start, this._end) ? this._start : this._end);

            if (bShift && (this._viewTools.isTable(this._end.obj) || this._viewTools.isRow(this._end.obj))) {
                var target = this._end.obj;
                var range = this._ranges[this._ranges.length - 1];
                if (this._end == range.getEndView()) {
                    target = target.getItemByIndex(this._end.index - 1);
                } else {
                    target = target.getItemByIndex(this._end.index);
                }
                pos = {};
                pos.obj = target;

            }
            var tools = this._rangeTools,
                viewTools = this._viewTools;

            var posPt = tools.getBodyPosition(pos);
            var pt = {
                "x": posPt.x,
                "y": posPt.y
            };
            if (viewTools.isRun(pos.obj) || viewTools.isDrawingObj(pos.obj)) {
                var target = pos.obj.getParent();
            } else {
                var target = pos.obj;
            }
            var inCell = viewTools.getCell(pos.obj);
            var next = tools.getNextItemByPosition(target, function(item) {
                return true;
            }, 'text.Line', false);
            if (!bShift && !viewTools.getTextBox(target)) {
                var ret = this.toNextEditArea(target, next);
                if (ret) {
                    next = ret;
                }
            }
            if (!next && !bShift) {
                var range = this._ranges[this._ranges.length - 1];
                range.collapse();
                this.selectRanges([range]);
            }
            if (!next && bShift) { // fix issue 44700. if selection end on the start of line and pres shift+arrow down, should select last paragraph			
                this.lineEnd(bShift, false);
                return;
            }

            while (next) {
                if (inCell) {
                    var nextCell = viewTools.getCell(next);
                    if (nextCell && inCell != nextCell) {
                        var delX = pt.x - tools.getBodyPosition({
                            obj: inCell
                        }).x - inCell.getLeftEdge();
                        pt = tools.getBodyPosition({
                            obj: next
                        });
                        pt.x += delX;
                    }
                }
                var body = viewTools.getParent(next, 'page.Body');
                if (body) {
                    pt.x = posPt.x + body.getContentLeft();
                    if (viewTools.isRun(pos.obj) && pos.index == 0 && !pos.obj.previous())
                        pt.x++;
                }

                var pos = viewTools.getPosition(next);
                var size = viewTools.getSize(next);
                pt.y = pos.y + size.h / 2;
                //	var pos = this._shell.pickAnything( this._shell.logicalToClient( pt ) );
                pos = this._getTextItemByPosition(pt, viewTools.getTextBox(next));

                if (pos) {
                    if (!bShift) {
                        var txbx = viewTools.getTextBox(pos.obj);
                        var drawingObj = null;
                        if (txbx && !viewTools.isAncestor(txbx, next))
                            drawingObj = txbx;
                        else if (viewTools.isImage(pos.obj) || viewTools.isCanvas(pos.obj))
                            drawingObj = pos.obj;

                        // select the inline drawing obj.
                        if (drawingObj && viewTools.isInlineDrawingObj(drawingObj)) {
                            // directly select the inline drawing obj.
                            var drawingStart = {
                                "obj": drawingObj,
                                "index": 0
                            };
                            var drawingEnd = {
                                "obj": drawingObj,
                                "index": 1
                            };
                            this.select(drawingStart, drawingEnd);
                            break;
                        }
                    }

                    // make sure ths pos is a char boundary
                    var range = this._ranges[this._ranges.length - 1];
                    var modelpos = range._viewToModel(pos);
                    var cbs = ModelTools.getCharBoundaries(modelpos);
                    if (modelpos.index > cbs.start && cbs.end > modelpos.index) {
                        var nOffset = cbs.end - modelpos.index;
                        while (nOffset > 0) {
                            pos = this._rangeTools.getNextPosition(pos);
                            nOffset--;
                        }
                    }

                    if (bShift) {
                        this._checkBoundary(this._start, pos);
                        this.selectTo(pos);
                    } else {
                        this.select(pos, pos);
                    }
                }

                break;
            }
        },
        /*
         * Home
         */
        lineStart: function(bShift, bCtrl) {
            var newPos;
            if (bCtrl) {
                var run = this._rangeTools.getFirstItem(this.getEditView(), this._rangeTools.RUNGUARD);
                newPos = {
                    'obj': run,
                    'index': 0
                };
            } else {
                var pos = this._getPosition(this._ranges[0], false);
                if (pos) {
                    var line = pos.obj.getParent();

                    var viewTools = ViewTools;
                    var firstRun = viewTools.first(line);
                    while (firstRun && viewTools.isAnchor(firstRun)) {
                        firstRun = firstRun.next();
                    }
                    newPos = {
                        'obj': firstRun,
                        'index': 0
                    };
                }
            }
            if (bShift)
                this.selectTo(newPos);
            else
                this.select(newPos, newPos);
        },
        /*
         * End
         */
        lineEnd: function(bShift, bCtrl) {
            var newPos;
            if (bCtrl) {
                var run = this._rangeTools.getLastItem(this.getEditView(), this._rangeTools.RUNGUARD);
                newPos = {
                    'obj': run,
                    'index': run.len
                };
            } else {
                var pos = this._getPosition(this._ranges[0], true);
                if (pos) {
                    var line = pos.obj.getParent();
                    var lastRun = ViewTools.last(line),
                        index = lastRun.len;
                    if (lastRun.getViewType && lastRun.getViewType() == 'text.LineBreak') {
                        index--;
                    }
                    newPos = {
                        'obj': lastRun,
                        'index': index
                    };
                }
            }
            if (bShift)
                this.selectTo(newPos);
            else
                this.select(newPos, newPos);
        },
        /*
         * Make the selection to be visible
         * tovwtype:0-toBottom, 1-tovwcenter, 2-toTop
         */
        scrollIntoView: function(toTop, toEnd, range, tovwtype, bcheckonly) {
            range = range || this._ranges[0];
            if (!range) {
                return false;
            }

            // if drawing obj?
            var drawingObj = ViewTools.getCurrSelectedDrawingObj();
            if (drawingObj)
                return;

            var pos;
            if (this._start && this._end && this._rangeTools.compare(this._start, this._end))
                pos = range.getStartView();
            else
                pos = range.getEndView();

            if (pos) {
                var page = ViewTools.getPage(pos.obj);

                if (!pos.obj.domNode) { //render
                    page && pe.lotusEditor.layoutEngine.rootView.render(page.getTop());
                    this._checkCursor();
                }
                var editor = this._shell.getEditor();
                var scale = editor.getScale();
                var pt = this._getViewPos(pos);
                var scrollTo = (pt.y + 20) * scale;
                var viewHeight = editor.getViewHeight();
                var scrollTop = editor.getScrollPosition();
                var offset = 0;

                var docLeft = editor.layoutEngine.rootView.docLeft;
                var scrollH = (pt.x + 20) * scale + docLeft;
                var viewW = editor.getViewWidth();
                var scrollLeft = editor.getScrollPositionH();
                var offsetH = 0;

                var line = this._viewTools.getLine(pos.obj);
                var lineHeight = line ? line.getBoxHeight() : 70;
                if (scrollH < scrollLeft)
                    offsetH = scrollH - (20 * scale) - scrollLeft;
                else if (scrollH >= (scrollLeft + viewW))
                    offsetH = scrollH + (70 * scale) - (scrollLeft + viewW);

                if (scrollTo < scrollTop) { //before the top
                    offset = scrollTo - (10 * scale) - scrollTop;
                } else if ((scrollTo + pos.obj.h) >= (scrollTop + viewHeight)) { //in the bottom
                    offset = scrollTo + lineHeight * scale - (scrollTop + viewHeight);
                } else { //visible in the view
                    //				return false;
                }

                if (!bcheckonly && (offset != 0 || offsetH != 0)) {
                    // handle ctrl+pageUp and ctrl+pageDown
                    var wnd = browser.isMobile() ? window : editor.getWindow();
                    if (toTop) {
                        wnd.scrollBy(offsetH, -scrollTop);
                    } else if (toEnd) {
                        var bottom = page && page.getBottom();
                        if (bottom)
                            wnd.scrollBy(offsetH, bottom - scrollTop);
                        else
                            wnd.scrollBy(offsetH, offset);
                    }
                    if (tovwtype) {
                    	if(tovwtype == 1){
                            if (offset < 0)
                                offset -= viewHeight / 2;
                            else
                                offset += viewHeight / 2;
                    	} else {
                            if (offset < 0){
                                offset -= ((lineHeight + 70) * scale);
                            } else {
                            	offset += viewHeight;
                            	offset -= ((lineHeight + 70) * scale);
                            }
                    	}
                        wnd.scrollBy(0, offset);
                    } else {
                        wnd.scrollBy(offsetH, offset);
                    }
                }
                return true;
            }
            return false;
        },
        /*
         * for line down/up, change mouse to the footnote/endnote eara.
         */

        toNextEditArea: function(currentLine, nextLine) {
            var getArea = function(body, type) {
                var ret = null;
                switch (type) {
                    case "text.content":
                        ret = body.textArea;
                        break;
                    case "text.endnotes":
                        ret = body.endNodeArea;
                        break;
                    case "text.footnotes":
                        ret = body.footNodeArea;
                        break;
                    default:
                        return null;
                }
                if (ret && !ret.container.isEmpty()) {
                    return ret;
                }
            };
            var areas = ["text.content", "text.endnotes", "text.footnotes"];
            var tarArea = null;
            var currentBody = this._viewTools.getBody(currentLine);
            var nextBody = nextLine && this._viewTools.getBody(nextLine);
            if (nextBody != currentBody) {
                var area = this._viewTools.getParent(currentLine, function(item) {
                    var viewType = item.getViewType && item.getViewType();
                    return viewType == "text.content" || viewType == "text.endnotes" || viewType == "text.footnotes";
                });
                var idx = areas.indexOf(area.getViewType());
                if (idx > -1) {
                    tarArea = getArea(currentBody, areas[idx + 1]);
                    tarArea = tarArea || getArea(currentBody, areas[idx + 2]);
                }
                nextBody = currentBody.next();
                if (!tarArea && nextBody) {
                    tarArea = getArea(nextBody, areas[0]);
                    tarArea = tarArea || getArea(nextBody, areas[1]);
                    tarArea = tarArea || getArea(nextBody, areas[2]);
                }
            }
            if (tarArea) {
                var line = this._rangeTools.getFirstItem(tarArea, this._viewTools.isLine);
                var firstObj = tarArea.getFirst();
                if (this._viewTools.isFootNote(firstObj)) {
                    pe.lotusEditor.getShell().enterFootnotesMode();
                } else if (this._viewTools.isEndNote(firstObj)) {
                    pe.lotusEditor.getShell().enterEndnotesMode();
                } else {
                    pe.lotusEditor.getShell().enterEditorMode();
                }
                return line;
            }
            return null;
        },
        toPrevEditArea: function(currentLine, preLine) {
            var getArea = function(body, type) {
                var ret = null;
                switch (type) {
                    case "text.content":
                        ret = body.textArea;
                        break;
                    case "text.endnotes":
                        ret = body.endNodeArea;
                        break;
                    case "text.footnotes":
                        ret = body.footNodeArea;
                        break;
                    default:
                        return null;
                }
                if (ret && !ret.container.isEmpty()) {
                    return ret;
                }
            };
            var areas = ["text.content", "text.endnotes", "text.footnotes"];
            var tarArea = null;
            var currentBody = this._viewTools.getBody(currentLine);
            var preBody = preLine && this._viewTools.getBody(preLine);
            if (preBody != currentBody) {
                var area = this._viewTools.getParent(currentLine, function(item) {
                    var viewType = item.getViewType && item.getViewType();
                    return viewType == "text.content" || viewType == "text.endnotes" || viewType == "text.footnotes";
                });
                var idx = areas.indexOf(area.getViewType());
                if (idx > -1) {
                    tarArea = getArea(currentBody, areas[idx - 1]);
                    tarArea = tarArea || getArea(currentBody, areas[idx - 2]);
                }
                preBody = currentBody.previous();
                if (!tarArea && preBody) {
                    tarArea = getArea(preBody, areas[2]);
                    tarArea = tarArea || getArea(preBody, areas[1]);
                    tarArea = tarArea || getArea(preBody, areas[0]);
                }
            }
            if (tarArea) {
                var line = this._rangeTools.getLastItem(tarArea, this._viewTools.isLine);
                var firstObj = tarArea.getFirst();
                if (this._viewTools.isFootNote(firstObj)) {
                    pe.lotusEditor.getShell().enterFootnotesMode();
                } else if (this._viewTools.isEndNote(firstObj)) {
                    pe.lotusEditor.getShell().enterEndnotesMode();
                } else {
                    pe.lotusEditor.getShell().enterEditorMode();
                }
                return line;
            }
            return null;
        },
        /*
         * Page down
         */
        pageDown: function(bShift) {
            if (!this._page(bShift, false))
                this.lineDown(bShift);
        },
        /*
         * Page up
         */
        pageUp: function(bShift) {
            if (!this._page(bShift, true))
                this.lineUp(bShift);
        },
        /**
         * Select All
         * @param pos
         * @returns
         */
        selectAll: function() {
            //		var firstRun = this._rangeTools.getFirstItem( this.getEditView(),this._rangeTools.RUNGUARD),
            //			lastRun  = this._rangeTools.getLastItem(  this.getEditView(),this._rangeTools.RUNGUARD);
            //		this.select( {'obj':firstRun, 'index': 0 },{'obj':lastRun, 'index':lastRun.len });

            var editView = this.getEditView();
            var container = editView.getContainer();
            var firstObj = container.getFirst();
            if (this._viewTools.isParagraph(firstObj)) {
                firstObj = firstObj.getFirst();
            }

            var lastObj = container.getLast(),
                lastIndex;
            if (this._viewTools.isParagraph(lastObj)) {
                lastObj = lastObj.getLast().getLast();
                lastIndex = lastObj.getEnd();
            } else
                lastIndex = (lastObj.getContainer) ? lastObj.getContainer().length() : 0;

            this.select({
                'obj': firstObj,
                'index': 0
            }, {
                'obj': lastObj,
                'index': lastIndex
            });
        },

        _getViewPos: function(pos) {
            return this._rangeTools.getDocumentPosition(pos);
        },

        _page: function(bShift, bUp) {
            var editor = pe.lotusEditor;
            var viewHeight = editor.getViewHeight();
            if (bUp)
                viewHeight = -viewHeight;
            var ret = true;
            var pos = (bShift) ? this._ranges[0].getEndView() : this._getPosition(this._ranges[0], false);

            if (pos)
                ret = this._offsetHeight(pos, viewHeight, bShift);
            else
                ret = false;
            ret && editor.getWindow().scrollBy(0, viewHeight);
            return ret;
        },
        /*
         * Get text input position
         */
        getInputPos: function() {
            return this._cursor._context;
        },
        getCursor: function() {
            return this._cursor;
        },
        setOriginalStart: function(start) {
            this._isBeginSel = false;
            this._startOriginal = start;
        },
        isBegignSel: function() {
            return this._isBeginSel;
        },
        isPositionInSelection: function(offsetX, offsetY) {
            for (var i = 0; i < this._selections.length; i++) {
                if (this._selections[i].isPointInSelection && this._selections[i].isPointInSelection({
                        x: offsetX,
                        y: offsetY
                    }))
                    return true;
            }

            return false;
        },
        /**
         * Get the selections's selected table information.
         * @returns
         */
        getSelectedTable: function() {
            var ranges = this.getRanges();

            var sTable, sTableStartRowIndex, sTableEndRowIndex, sTableStartColumnIndex, sTableEndColumnIndex;
            var eTable, eTableStartRowIndex, eTableEndRowIndex, eTableStartColumnIndex, eTableEndColumnIndex;
            for (var i = 0; i < ranges.length; i++) {
                var range = ranges[i];
                var startSelectTable = range.getStartRowColumn();
                var endSelectTable = range.getEndRowColumn();

                if (startSelectTable) {
                    if (sTable) {
                        if (sTable == startSelectTable.selTable) {
                            // Merge start row/column, end row/column.
                            sTableStartRowIndex = Math.min(sTableStartRowIndex, startSelectTable.rowIndex);
                            sTableStartColumnIndex = Math.min(sTableStartColumnIndex, startSelectTable.columnIndex);
                        } else {
                            // This range is select another table
                            // Like select table 1 + paragraph + table 2.
                            if (eTable) {
                                eTableStartRowIndex = Math.min(eTableStartRowIndex, startSelectTable.rowIndex);
                                eTableStartColumnIndex = Math.min(eTableStartColumnIndex, startSelectTable.columnIndex);
                            } else {
                                eTable = startSelectTable.selTable;
                                eTableStartRowIndex = startSelectTable.rowIndex;
                                eTableStartColumnIndex = startSelectTable.columnIndex;
                            }
                        }
                    } else {
                        if (i == 0) {
                            // The first range select table.
                            sTable = startSelectTable.selTable;
                            sTableStartRowIndex = startSelectTable.rowIndex;
                            sTableStartColumnIndex = startSelectTable.columnIndex;
                        } else {
                            // Other range select other table
                            // Like select paragraph + table.
                            if (eTable) {
                                eTableStartRowIndex = Math.min(eTableStartRowIndex, startSelectTable.rowIndex);
                                eTableStartColumnIndex = Math.min(eTableStartColumnIndex, startSelectTable.columnIndex);
                            } else {
                                eTable = startSelectTable.selTable;
                                eTableStartRowIndex = startSelectTable.rowIndex;
                                eTableStartColumnIndex = startSelectTable.columnIndex;
                            }
                        }
                    }
                }

                if (endSelectTable) {
                    if (sTable == endSelectTable.selTable) {
                        sTableEndRowIndex = Math.max((sTableEndRowIndex || 0), endSelectTable.rowIndex);
                        sTableEndColumnIndex = Math.max((sTableEndColumnIndex || 0), endSelectTable.columnIndex);
                    } else if (eTable == endSelectTable.selTable) {
                        eTableEndRowIndex = Math.max((eTableEndRowIndex || 0), endSelectTable.rowIndex);
                        eTableEndColumnIndex = Math.max((eTableEndColumnIndex || 0), endSelectTable.columnIndex);
                    } else {
                        console.error("Wrong selection.");
                    }
                }
            }

            var sTable, sTableStartRowIndex, sTableEndRowIndex, sTableStartColumnIndex, sTableEndColumnIndex;
            var eTable, eTableStartRowIndex, eTableEndRowIndex, eTableStartColumnIndex, eTableEndColumnIndex;
            var ret = {};
            ret["startTable"] = sTable;
            ret["startTableStartRow"] = sTableStartRowIndex;
            ret["startTableEndRow"] = sTableEndRowIndex;
            ret["startTableStartColumn"] = sTableStartColumnIndex;
            ret["startTableEndColumn"] = sTableEndColumnIndex;

            ret["endTable"] = eTable;
            ret["endTableStartRow"] = eTableStartRowIndex;
            ret["endTableEndRow"] = eTableEndRowIndex;
            ret["endTableStartColumn"] = eTableStartColumnIndex;
            ret["endTableEndColumn"] = eTableEndColumnIndex;

            return ret;
        },
        getSelectedPageNum: function() {
        	var currRange = this._ranges[0];
        	if(currRange){
                var startV = currRange.getStartView();
                var endV = currRange.getEndView();
                if (startV && endV) {
                	var startP = this._viewTools.getPage(startV.obj);
                	var endP = this._viewTools.getPage(endV.obj);
                	return (endP.pageNumber - startP.pageNumber);
                }
        	}
        	return 0;
        }
        
    });
    return Selection;
});
