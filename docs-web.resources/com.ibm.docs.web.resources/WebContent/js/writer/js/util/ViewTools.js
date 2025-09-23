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
    "dojo/dom-construct",
    "dojo/dom-style",
    "writer/common/MeasureText",
    "writer/global"
], function(domConstruct, domStyle, MeasureText, global) {

    var ViewTools = {

        /**
         * Get the occupied object by position
         * @param x The x position
         * @param y The y position
         * @returns The occupied object space
         */
        getOccupiedObjectInSpace: function(space, x, y) {
            var subSpace;
            if(space && space._children)
            {
                for (var i = 0; i < space._children.length; ++i) {
                    subSpace = space._children[i];
                    if (subSpace.owner && (x > subSpace.x && x < subSpace.x + subSpace.w) && (y > subSpace.y && y < subSpace.y + subSpace.h)) {
                        var p = ViewTools.getParagraph(subSpace.owner);
                        if (p && subSpace.owner.ifPointMe(x - p.left, y - p.top))
                            return subSpace.owner;
                    }
                }            	
            }
            else
            	console.warn("there may be some error, space is empty!");

            return null;
        },

        /**
         * used in bookmark dialog and link dialog
         */
        getLineFromSelection: function(selection) {
            var ranges = selection.getRanges();
            var startView = ranges[0].getStartView().obj;
            var line = ViewTools.getLine(startView);
            if (!line) {
                var view = startView;
                while (view) {
                    //get first line
                    var container = view.getContainer && view.getContainer();
                    if (container) {
                        view = container.getFirst();
                        if (ViewTools.isLine(view)) {
                            line = view;
                        } else
                            continue;
                    }
                    view = null;
                }
            }
            return line;
        },

        getCarriageHeight: function() {
            if (!this.CarriageHeight || this.fontSizeState != global.fontResizeState) {
                this.fontSizeState = global.fontResizeState;
                var parentNode = MeasureText.textMeasure;
                domStyle.set(MeasureText.textMeasureFrame, "width", "1000000px");
                parentNode.innerHtml = "";

                var carriageNode = domConstruct.create("div", {
                    "class": "carriageNode",
                    innerHTML: "\u21b2"
                }, parentNode);
                carriageNode.setAttribute("style", "position:relative; font-size:9pt; font-family:Arial;");

                if (parentNode) {
                    parentNode.appendChild(carriageNode);
                }

                var h = carriageNode.getBoundingClientRect().height;
                domStyle.set(MeasureText.textMeasureFrame, "width", "100px");
                this.CarriageHeight = h;
            }
            return this.CarriageHeight;
        },
        _getGuardFunction: function(guard) {
            //      if( dojo.isString( guard )){
            if (guard.charAt) { // String
                var viewType = guard;
                guard = function(item) {
                    return item.getViewType && item.getViewType() == viewType;
                };
            }
            //      if( !dojo.isFunction( guard ) ){
            if (!guard.call) { // Not a function
                guard = function() {
                    return true;
                };
            }
            return guard;
        },

        // only for mobile calling
        getBlueMargin: function() {
            var ret = {
                leftBlueMargin: pe.lotusEditor.layoutEngine.rootView.docLeft,
                topBlueMargin: pe.lotusEditor.padding,
                gapBlueBetweenPages: pe.lotusEditor.layoutEngine.rootView.getContentTop()
            };

            return ret;
        },

        length: function(item) {
            if (!item.getContainer)
                return 0;
            var c = item.getContainer();
            if (item && c) {
                return !c.isEmpty();
            }
            return 0;
        },
        first: function(item) {
            if (item.getFirst) {
                return item.getFirst();
            }
            return null;
        },
        last: function(item) {
            if (item.getLast) {
                return item.getLast();
            }
            return null;
        },
        next: function(item) {
            if (item.next) {
                return item.next();
            }
            return null;
        },
        prev: function(item) {
            if (item.previous) {
                return item.previous();
            }
            return null;
        },
        getDocument: function(item) {
            return ViewTools.getParent(item, ViewTools.isDocument);
        },

        getPage: function(item) {
            var root = ViewTools.getParent(item, function(view) {
                return ViewTools.isBody(view) || ViewTools.isHeader(view) || ViewTools.isFooter(view);
            });
            return root && root.page;
        },

        getHeader: function(item) {
            return ViewTools.getParent(item, ViewTools.isHeader);
        },

        getFooter: function(item) {
            return ViewTools.getParent(item, ViewTools.isFooter);
        },

        getBody: function(item) {
            return ViewTools.getParent(item, ViewTools.isBody);
        },
        getTextContent: function(item) {
            var cell = ViewTools.getParent(item, ViewTools.isCell);
            if (cell)
                return cell;
            return ViewTools.getParent(item, ViewTools.isTextContent);
        },
        getLine: function(item) {
            return ViewTools.getParent(item, ViewTools.isLine);
        },
        getParagraph: function(item) {
            return ViewTools.getParent(item, ViewTools.isParagraph);
        },
        getFootNote: function(item) {
            return ViewTools.getParent(item, ViewTools.isFootNote);
        },
        getEndNote: function(item) {
            return ViewTools.getParent(item, ViewTools.isEndNote);
        },
        getTable: function(item) {
            return ViewTools.getParent(item, ViewTools.isTable);
        },
        getRow: function(item) {
            return ViewTools.getParent(item, ViewTools.isRow);
        },
        getCell: function(item) {
            return ViewTools.getParent(item, ViewTools.isCell);
        },
        getTOC: function(item) {
            return ViewTools.getParent(item, ViewTools.isTOC);
        },
        getTextBox: function(item) {
            return ViewTools.getParent(item, ViewTools.isTextBox);
        },
        getCanvas: function(item) {
            return ViewTools.getParent(item, ViewTools.isCanvas);
        },
        getTableContainer: function(item) {
            if (!item) {
                return null;
            }
            if (ViewTools.isBody(item) || ViewTools.isCell(item) || ViewTools.isTextBox(item) || ViewTools.isHeader(item) || ViewTools.isFooter(item) || ViewTools.isFootNote(item) || ViewTools.isEndNote(item)) {
                return item;
            } else {
                return ViewTools.getTableContainer(item.getParent());
            }
        },
        getAllCells: function(item, start, end) {
            var ret = [];
            var container = item.getContainer();
            if (start == -1) {
                start = 0;
            }
            if (end == -1) {
                end = container.length();
            }
            if (ViewTools.isTable(item)) {

                var firstRow = container.getByIndex(start);
                for (var i = start; i < end; i++) {
                    var temp = ViewTools.getAllCells(firstRow, -1, -1);
                    ret = ret.concat(temp);
                    firstRow = container.next(firstRow);
                }
            }
            if (ViewTools.isRow(item)) {
                var firstCell = container.getByIndex(start);
                for (var i = start; i < end; i++) {
                    ret.push(firstCell);
                    firstCell = container.next(firstCell);
                }
            }
            return ret;
        },
        // get the prev or next non-anchor run. !!! by model order.
        getNeighbourRunByModelOrder: function(anchor, index) {
            var vTools = ViewTools;
            if (!vTools.isAnchor(anchor))
                return {
                    "obj": anchor,
                    "index": index
                };

            var para = vTools.getParagraph(anchor);
            if (!para)
                return {
                    "obj": anchor,
                    "index": index
                };;

            var indexToPara = anchor.start + index;
            var run = para.container.getFirst();
            while (run) {
                if (!vTools.isAnchor(run)) {
                    if (indexToPara >= run.start && indexToPara <= run.start + run.len)
                        return {
                            "obj": run,
                            "index": indexToPara - run.start
                        };
                }
                run = para.container.next(run);
            }

            return {
                "obj": anchor,
                "index": index
            };;
        },
        /**
         * Get the parent view with types.
         * @param item
         * @param viewTypes View types array
         */
        getParentViewByType: function(item, viewTypes, includeSelf) {
            item = includeSelf ? item : item.getParent();
            while (item) {
                var viewType = item.getViewType && item.getViewType();
                for (var i = 0; i < viewTypes.length; i++) {
                    if (viewTypes[i] == viewType)
                        return item;
                }
                item = item.getParent();
            }

            return null;
        },
        getChild: function(item, index) {
            var p = item.getParent();
            if (p && p.getContainer && p.getContainer())
                return p.getContainer().getByIndex(index);
            return null;
        },
        getParent: function(item, guard) {
            guard = ViewTools._getGuardFunction(guard);
            while (item && !guard(item)) {
                if (!item.getParent)
                    return;
                item = item.getParent();
            }
            return item;
        },
        /*
         * get view item's absolute pix position in the document
         */
        getPosition: function(item) {
            if (item.getViewType && item.getViewType() == "text.Line")
                return {
                    'x': item.getContentLeft(),
                    'y': item.getContentTop()
                };
            else
                return {
                    'x': item.getLeft(),
                    'y': item.getTop()
                };
        },
        /*
         * get view item's size 
         */
        getSize: function(item) {
            var w = null;
            if (ViewTools.w) {
                w = ViewTools.w;
            } else if (item.getBoxWidth) {
                w = item.getBoxWidth();
            } else if (item.getWidth) {
                w = item.getWidth();
            }

            var h = null;
            if (item.h) {
                h = item.h;
            } else if (item.getBoxHeight) {
                h = item.getBoxHeight();
            } else if (item.getHeight) {
                h = item.getHeight();
            }
            if (w == null) {
                console.error(' w is null ');
                w = 0;
            }
            if (h == null) {
                console.error(' h is null ');
                h = 0;
            }
            return {
                'w': w,
                'h': h
            };
        },

        isRun: function(item) {
            var viewType = item.getViewType && item.getViewType();
            switch (viewType) {
                case 'text.Run':
                case 'text.trackDeletedObjs':
                case 'text.Tab':
                case 'text.Alignment':
                case 'text.LineBreak':
                case 'text.PageBreak':
                case 'text.ImageView':
                case 'text.InLineTextBox':
                case 'text.InLineCanvas':
                case 'text.PageNumber':
                case 'text.REndNote':
                case 'text.RFootNote':
                    return true;
            }
            return false;
        },

        isTextRun: function(item) {
            var viewType = item.getViewType && item.getViewType();
            if (viewType == 'text.Run')
                return true;
            return false;
        },

        isPageBreak: function(item) {
            var viewType = item.getViewType && item.getViewType();
            if (viewType == 'text.PageBreak')
                return true;
            return false;
        },

        isLineBreak: function(item) {
            var viewType = item.getViewType && item.getViewType();
            if (viewType == 'text.LineBreak')
                return true;
            return false;
        },

        isVisible: function(item) {
            var viewType = item.getViewType && item.getViewType();
            switch (viewType) {
                case 'bookMark':
                    return false;
            }
            if (item.model)
                return item.model.isVisibleInTrack();
            return false;
            //      if( ViewTools.isRun(item) && item.len == 0 )
            //          return false;
            //      return !ViewTools.isWrap(item);
        },

        isImage: function(item) {
            var viewType = item.getViewType && item.getViewType();

            var ret = 'text.ImageView' == viewType ||
                'text.AnchorImageView' == viewType ||
                'text.SquareImage' == viewType ||
                'text.TBImage' == viewType ||
                'text.FloatImage' == viewType ||
                'text.SimpleImageView' == viewType;

            return ret;
        },

        isTextBox: function(item) {
            var viewType = item.getViewType && item.getViewType();

            var ret = 'text.InLineTextBox' == viewType ||
                'text.AnchorTextBox' == viewType ||
                'text.SQTextBox' == viewType ||
                'text.TBTextBox' == viewType ||
                'text.FLTextBox' == viewType ||
                'text.SimpleTextBox' == viewType;

            return ret;
        },

        isCanvas: function(item) {
            var viewType = item.getViewType && item.getViewType();

            var ret = 'text.InLineCanvas' == viewType ||
                'text.AnchorCanvas' == viewType ||
                'text.SQCanvas' == viewType ||
                'text.TBCanvas' == viewType ||
                'text.FLCanvas' == viewType ||
                'text.SimpleCanvas' == viewType;

            return ret;
        },

        isDrawingObj: function(item) {
            return ViewTools.isImage(item) || ViewTools.isTextBox(item) || ViewTools.isCanvas(item);
        },

        isInlineDrawingObj: function(item) {
            var viewType = item.getViewType && item.getViewType();

            var ret = 'text.ImageView' == viewType ||
                'text.InLineTextBox' == viewType ||
                'text.InLineCanvas' == viewType;

            return ret;
        },

        isAnchor: function(item) {
            var viewType = item.getViewType && item.getViewType();

            var ret = 'text.AnchorImageView' == viewType ||
                'text.SquareImage' == viewType ||
                'text.FloatImage' == viewType ||
                'text.TBImage' == viewType ||
                'text.AnchorTextBox' == viewType ||
                'text.FLTextBox' == viewType ||
                'text.SQTextBox' == viewType ||
                'text.TBTextBox' == viewType ||
                'text.AnchorCanvas' == viewType ||
                'text.SQCanvas' == viewType ||
                'text.TBCanvas' == viewType ||
                'text.FLCanvas' == viewType;

            return ret;
        },

        isWrappingAnchor: function(item) {
            var viewType = item.getViewType && item.getViewType();

            var ret = 'text.SquareImage' == viewType ||
                'text.TBImage' == viewType ||
                'text.SQTextBox' == viewType ||
                'text.TBTextBox' == viewType ||
                'text.SQCanvas' == viewType ||
                'text.TBCanvas' == viewType;

            return ret;
        },

        isFloatAnchor: function(item) {
            var viewType = item.getViewType && item.getViewType();

            var ret = 'text.FloatImage' == viewType ||
                'text.FLTextBox' == viewType ||
                'text.FLCanvas' == viewType;

            return ret;
        },

        isTOC: function(item) {
            var viewType = item.getViewType && item.getViewType();

            return "toc" == viewType;
        },

        isInCanvas: function(item) {
            var parent = item.getParent();

            return parent && ViewTools.isCanvas(parent);
        },

        getCurrSelectedImage: function() {
            var selection = pe.lotusEditor.getSelection();
            var range = selection.getRanges()[0];
            if (!range || range.isCollapsed())
                return;

            var imageView = selection._rangeTools.ifContainOnlyOneImage(range);
            if (!imageView)
                return;

            return imageView;
        },

        getCurrSelectedTextbox: function() {
            var selection = pe.lotusEditor.getSelection();
            var range = selection.getRanges()[0];
            if (!range || range.isCollapsed())
                return;

            var textboxView = selection._rangeTools.ifContainOnlyOneTextBox(range);
            if (!textboxView)
                return;

            return textboxView;
        },

        getCurrSelectedDrawingObj: function() {
            var selection = pe.lotusEditor.getSelection();
            var range = selection.getRanges()[0];
            if (!range || range.isCollapsed())
                return;

            var drawingObj = selection._rangeTools.ifContainOnlyOneDrawingObj(range);
            if (!drawingObj)
                return;

            return drawingObj;
        },

        isZeroRun: function(item) {
            vType = item.getViewType && item.getViewType();
            return vType == "bookMark" || (vType == "text.Run" && 0 == item.len) || !item.isVisibleInTrack()
        },

        isLine: function(item) {
            return item.getViewType && item.getViewType() == 'text.Line';
        },
        isTableCell: function(item) {
            return item.getViewType && item.getViewType() == 'table.Cell';
        },
        isBody: function(item) {
            var viewType = item.getViewType && item.getViewType();
            return viewType == 'page.Body';
        },
        isTextContent: function(item) {
            var viewType = item && item.getViewType && item.getViewType();
            return viewType == 'text.content' || viewType == 'page.Header' || viewType == 'page.Footer';
        },
        isPage: function(item) {
            return item.getViewType && item.getViewType() == 'page.Page';
        },
        isDocument: function(item) {
            return item && item.getViewType && (item.getViewType() == 'text.Document' ||
                item.getViewType() == 'note.footnote' || item.getViewType() == 'note.endnote' || item.getViewType() == 'page.HeaderFooter' || item.getViewType() == 'page.Header' || item.getViewType() == 'page.Footer');
        },
        isWrap: function(item) {
            return item.getViewType && item.type == "textWrapping";
        },
        isBookMark: function(item) {
            return item && item.getViewType() == "bookMark";
        },
        isParagraph: function(item) {
            return item.getViewType && item.getViewType() == "text.Paragraph";
        },
        isFootNote: function(item) {
            return item.getViewType && item.getViewType() == "note.footnote";
        },
        isEndNote: function(item) {
            return item.getViewType && item.getViewType() == "note.endnote";
        },
        isHeader: function(item) {
            return item.getViewType && item.getViewType() == "page.Header";
        },
        isFooter: function(item) {
            return item.getViewType && item.getViewType() == "page.Footer";
        },
        isCell: function(item) {
            return item.getViewType && item.getViewType() == "table.Cell";
        },
        isRow: function(item) {
            return item.getViewType && item.getViewType() == "table.Row";
        },
        isTable: function(item) {
            return item.getViewType && item.getViewType() == "table.Table";
        },
        isRFootnote: function(item) {
            return item.getViewType && item.getViewType() == "text.RFootNote";
        },
        isREndnote: function(item) {
            return item.getViewType && item.getViewType() == "text.REndNote";
        },
        getAncestor: function(view, type) {
            if (!view) {
                return null;
            }
            if (view.getViewType() == type) {
                return view;
            } else {
                return ViewTools.getAncestor(view.parent, type);
            }
        },

        // to check if "ancestor" is ancestor of "child"
        isAncestor: function(ancestor, child) {
            var parent = child.getParent();
            while (parent) {
                if (parent == ancestor)
                    return true;

                parent = parent.getParent();
            }

            return false;
        },
        isLastViewOfModel: function(view) {
            var model = view.model;
            var allViews = model.getAllViews();
            for (var ownerId in allViews) {
                var viewers = allViews[ownerId];
                var firstView = viewers.getLast();
                if (firstView == view)
                    return true;
            }

            return false;
        }
    };

    global.viewTools = ViewTools;
    return ViewTools;
});
