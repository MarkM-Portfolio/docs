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
    "writer/common/tools",
    "writer/constants",
    "writer/util/ViewTools",
    "dojo/i18n!writer/nls/lang",
    "writer/global"
], function(lang, toolsModule, constants, ViewTools, i18nlang, g) {

    var RangeTools = {
        RUNGUARD: function(item) {
            return ViewTools.isRun(item) && ViewTools.isVisible(item);
        },
        PARAGUARD: function(item) {
            return ViewTools.isParagraph(item) && ViewTools.isVisible(item);
        },
        TABLEGUARD: function(item) {
            return ViewTools.isTable(item) && ViewTools.isVisible(item);
        },
        TextBoxGuard: function(item) {
            return ViewTools.isTextBox(item);
        },
        TXBXorCANVASGuard: function(item) {
            return ViewTools.isTextBox(item) ||
                ViewTools.isCanvas(item);
        },
        RUNDrawingobjGuard: function(item) {
            return (ViewTools.isRun(item) ||
                ViewTools.isDrawingObj(item));
        },

        InlineRunGuard: function(item) {
            var viewType = item.getViewType && item.getViewType();
            switch (viewType) {
                case 'text.Run':
                case 'text.Tab':
                case 'text.Alignment':
                case 'text.LineBreak':
                case 'text.PageBreak':
                case 'text.PageNumber':
                case 'text.REndNote':
                case 'text.RFootNote':
                case 'text.ImageView':
                case 'text.InLineTextBox':
                case 'text.InLineCanvas':
                case 'text.trackDeletedObjs':
                    return true;
            }
            return false;
        },

        DrawingobjGuard: function(item) {
            return ViewTools.isDrawingObj(item);
        },
        view: ViewTools,

        _getGuardFunction: function(guard) {
            if (lang.isString(guard)) {
                var viewType = guard;
                guard = function(item) {
                    return item && item.getViewType && item.getViewType() == viewType;
                };
            }
            if (!lang.isFunction(guard)) {
                guard = function() {
                    return true;
                };
            }
            return guard;
        },
        makeViewPosition: function(obj, index) {
            if (this.view.isWrap(obj) && index > 0) {
                var next = this.getNextRun(obj);
                return (next) ? this.makeViewPosition(next, 0) : this.makeViewPosition(obj, 0);
            } else
                return {
                    'obj': obj,
                    'index': index
                };
        },
        /*
         * get next layout item in the document
         */
        getNextItem: function(item, guard, fromChild, parentStopGuard, childStopGuard) {
            guard = this._getGuardFunction(guard);
            if (parentStopGuard)
                parentStopGuard = this._getGuardFunction(parentStopGuard);
            if (childStopGuard)
                childStopGuard = this._getGuardFunction(childStopGuard);

            if (fromChild && (!childStopGuard || !childStopGuard(item))) {
                //find from the child first
                var child = this.view.first(item);;
                if (child) {
                    if (guard(child))
                        return child;
                    else
                        return this.getNextItem(child, guard, true, null, childStopGuard);
                }
            }
            //get next item;
            var current = item,
                next;
            var firstTime = true;
            while (!next && current) {
                if (firstTime) {
                    next = this.view.next(current);
                    if (!next)
                        current = current.getParent && current.getParent();
                } else {
                    if (parentStopGuard && parentStopGuard(current))
                        break;
                    else {
                        next = this.view.next(current);
                        if (!next)
                            current = current.getParent && current.getParent();
                    }
                }
                firstTime = false;
            }

            if (!next || guard(next))
                return next;
            else
                return this.getNextItem(next, guard, true, null, childStopGuard);
        },
        /*
         * get next item by position guard and type
         * posGuard is a function like 
         * 	function( item ) {
         * 		item.left> x0 && x0 < item.right;
         * }
         * guard is function or type string
         */
        getNextItemByPosition: function(item, posGuard, guard, fromChild) {
            posGuard = this._getGuardFunction(posGuard);
            guard = this._getGuardFunction(guard);
            var ret;
            if (fromChild && posGuard(item)) {
                ret = this.getFirstItem(item, function(e) {
                    return posGuard(e) & guard(e);
                });
            }
            var inCell = this.view.getCell(item);
            while (!ret) {
                ret = this.getNextItem(item, posGuard, false, this.TextBoxGuard, this.TXBXorCANVASGuard);
                if (inCell) {
                    var currentCell = this.view.getCell(ret);
                    if (currentCell != inCell) {
                        ret = inCell.nextVertical(true);
                        if (ret) {
                            ret = this.getFirstItem(ret, guard);
                        } else {
                            ret = this.view.getTable(item);
                            ret = this.getNextItem(ret, posGuard, false, this.TextBoxGuard, this.TXBXorCANVASGuard);
                        }
                    }
                }
                item = ret;
                if (guard(ret))
                    return ret;
                else if (ret)
                    ret = this.getFirstItem(ret, guard);
                else
                    break;
            }
            return ret;

        },
        /*
         * get previous layout item in the document
         */
        getPrevItem: function(item, guard, parentStopGuard, childStopGuard) {
            guard = this._getGuardFunction(guard);
            if (parentStopGuard)
                parentStopGuard = this._getGuardFunction(parentStopGuard);

            //get previous item
            var current = item,
                prev;
            var firstTime = true;
            while (!prev && current) {
                if (firstTime) {
                    prev = this.view.prev(current);
                    if (!prev)
                        current = current.getParent && current.getParent();
                } else {
                    if (parentStopGuard && parentStopGuard(current))
                        break;
                    else {
                        prev = this.view.prev(current);
                        if (!prev)
                            current = current.getParent && current.getParent();
                    }
                }
                firstTime = false;
            }
            if (!prev || !guard || guard(prev))
                return prev;
            var lastItem = this.getLastItem(prev, guard, childStopGuard);
            if (!lastItem)
                return this.getPrevItem(prev, guard, parentStopGuard, childStopGuard);
            else
                return lastItem;

        },
        /*
         * get prev item by position guard and type
         * posGuard is a function like 
         * 	function( item ) {
         * 		item.left> x0 && x0 < item.right;
         * }
         * guard is function or type string
         */
        getPrevItemByPosition: function(item, posGuard, guard) {
            posGuard = this._getGuardFunction(posGuard);
            guard = this._getGuardFunction(guard);
            //get previous item
            var ret;
            var inCell = this.view.getCell(item);
            while (!ret) {
                ret = this.getPrevItem(item, posGuard, this.TextBoxGuard, this.TXBXorCANVASGuard);
                if (inCell) {
                    var currentCell = this.view.getCell(ret);
                    if (currentCell != inCell) {
                        ret = inCell.prevCertical(true);
                        if (ret) {
                            ret = this.getLastItem(ret, guard);
                        } else {
                            ret = this.view.getTable(item);
                            ret = this.getPrevItem(ret, posGuard, this.TextBoxGuard, this.TXBXorCANVASGuard);
                        }
                    }
                }
                item = ret;
                if (guard(ret))
                    return ret;
                else if (ret)
                    ret = this.getLastItem(ret, guard);
                else
                    break;
            }
            return ret;
        },
        /*
         * get first layout item in the document
         */
        getFirstItem: function(item, guard) {
            guard = this._getGuardFunction(guard);
            var view = this.view,
                child;
            //if( view.length( item ) >=0 )
            //empty paragraph may have one run
            {
                child = view.first(item);
                while (child) {
                    if (guard(child))
                        return child;
                    else {
                        var firstItem = this.getFirstItem(child, guard);
                        if (firstItem)
                            return firstItem;
                    }
                    child = view.next(child);
                }
            }

            return child;
        },
        /*
         * search item in the child
         */
        /*
         * get last layout item in the document 
         */
        getLastItem: function(item, guard, childStopGuard) {
            guard = this._getGuardFunction(guard);
            if (childStopGuard)
                childStopGuard = this._getGuardFunction(childStopGuard);

            if (childStopGuard && childStopGuard(item))
                return null;

            if (this.view.length(item)) {
                var child = this.view.last(item);
                while (child && (!childStopGuard || !childStopGuard(child))) {
                    if (guard(child)) {
                        return child;
                    } else {
                        var lastitem = this.getLastItem(child, guard);
                        if (lastitem)
                            return lastitem;
                    }
                    child = this.view.prev(child);
                }
                return child;
            }
            if (guard(item))
                return item;
            else
                return null;
        },
        /*
         * get next Para in the document
         */
        getNextPara: function(item) {
            return this.getNextItem(item, this.PARAGUARD);
        },
        /*
         * get previous run in the document
         */
        getPrevPara: function(item) {
            return this.getPrevItem(item, this.PARAGUARD);
        },
        /*
         * get previous table in the document
         */
        getPrevTable: function(item) {
            return this.getPrevItem(item, this.TABLEGUARD);
        },
        /*
         * get next Run in the document
         */
        getNextRun: function(item, parentStopGuard, childStopGuard) {
            return this.getNextItem(item, this.RUNGUARD, false, parentStopGuard, childStopGuard);
        },
        getNextRunOrDrawingObj: function(item) {
            return this.getNextItem(item, this.RUNDrawingobjGuard);
        },
        /*
         * get previous run in the document
         */
        getPrevRun: function(item, parentStopGuard, childStopGuard) {
            return this.getPrevItem(item, this.RUNGUARD, parentStopGuard, childStopGuard);
        },
        /*
         * get next line in the document
         */
        getNextLine: function(item) {
            return this.getNextItem(item, 'text.Line');
        },
        /*
         * get previous line in the document
         */
        getPrevLine: function(item) {
            return this.getPrevItem(item, 'text.Line');
        },
        /*
         * get Next position
         */
        getNextPosition: function(pos, bShift) {
            var obj = pos.obj,
                index = pos.index,
                next;

            if (!this.view.isVisible(obj) || this.view.isAnchor(obj)) {
                //skip bookmark & anchor obj
                next = this.getNextRun(obj, this.TextBoxGuard, this.TXBXorCANVASGuard);
                return next && this.getNextPosition(this.makeViewPosition(next, 0));
            } else if (this.view.isRun(obj)) {
                //index
                var line = obj.parent;
                if (index + 1 == obj.len || index == obj.len) {
                    // end of run 
                    if (next = this.getNextRun(obj, this.TextBoxGuard, this.TXBXorCANVASGuard)) {
                        // when at the end of a run, skip the begin of next run
                        var samepara = (next.parent == line || line.getNextLine());
                        if (samepara) {
                            var tmp = obj.next();
                            if (tmp && tmp.getViewType() == 'text.LineBreak' && tmp.type !== "textWrapping")
                                samepara = false;
                        }
                        if (index == obj.len && samepara) {
                            return this.getNextPosition(this.makeViewPosition(next, 0));
                        } else if (index == obj.len || samepara) {
                            // end or in same line or same paragraph
                            var para = next.model.paragraph;
                            if (!bShift || g.modelTools.isEmptyParagraph(para) || samepara)
                                return this.makeViewPosition(next, 0);
                            else
                                return this.getNextPosition(this.makeViewPosition(next, 0), bShift);
                        } else
                            return this.makeViewPosition(obj, index + 1);
                    } else if (index == obj.len) {
                        //end of document
                        return null;
                    } else {
                        //to end of document
                        return this.makeViewPosition(obj, index + 1);
                    }
                } else if (index > obj.len) {
                    console.error("error happened in index ");
                    return null;
                } else
                    return this.makeViewPosition(obj, index + 1);
            } else {
                next = obj.next();
                if (!next && (ViewTools.isCell(obj) || ViewTools.isRow(obj) || ViewTools.isTable(obj))) {
                    var parent = obj;
                    var nextParent = parent && parent.next();
                    while (parent && !nextParent) {
                        parent = parent.getParent();
                        nextParent = parent && parent.next();
                    }
                    if (ViewTools.isRow(nextParent)) {
                        next = nextParent.getContainer().getLast();
                    } else {
                        next = nextParent;
                    }
                }
                var viewType = obj.getViewType && obj.getViewType();
                if (next && next.getViewType() != viewType) {
                    var run = this.getFirstItem(next, this.RUNGUARD);
                    if (run)
                        return this.makeViewPosition(run, 0);
                    else
                        return this.makeViewPosition(next, 0);
                } else if (next)
                    return this.makeViewPosition(next, next.len);
            }
            return null;
        },
        /*
         * get Previous position
         */
        getPrevPosition: function(pos, bShift) {
            var obj = pos.obj,
                index = pos.index,
                prev;

            if (!this.view.isVisible(obj) || this.view.isAnchor(obj)) {
                //skip bookmark & anchor obj
                var next = obj.next();
                if (next && (next.isVisibleInTrack() || next.domNode || !next._vRun))
                    return this.getPrevPosition(this.makeViewPosition(next, 0));
                else if (prev = obj.previous()){
                    if (!prev.isVisibleInTrack() && !prev.domNode && prev._vRun)
                        prev = prev._vRun;
                    return this.getPrevPosition(this.makeViewPosition(prev, prev.len));
                }
                else {
                    //only one bookmark in the line
                    console.error("can not only one bookmakr in a line!");
                    return null;
                }
            } else if (this.view.isRun(obj)) {
                //index
                if (index == 0) {
                    //start of run;
                    var line = obj.parent;

                    if (prev = this.getPrevRun(obj, this.TextBoxGuard, this.TXBXorCANVASGuard)) {
                        var samepara = prev.parent == line || line.getPreviousLine();
                        if (samepara) {
                            var tmp = prev.next();
                            if (tmp && tmp.getViewType() == 'text.LineBreak' && tmp.type != "textWrapping") {
                                samepara = false;
                            }
                        }
                        if (samepara) {
                            //same paragraph or same line
                            if (this.view.isWrap(prev))
                                return this.makeViewPosition(prev, 0);
                            else
                                return this.getPrevPosition(this.makeViewPosition(prev, prev.len));
                        } else {
                            return this.makeViewPosition(prev, prev.len, true);
                        }
                    } else
                        return null;
                } else if (index < 0) {
                    console.error("error happened!!");
                    return null;
                } else if (index - 1 == 0) {
                    if (bShift) {
                        var line = obj.parent;
                        if (prev = this.getPrevRun(obj, this.TextBoxGuard, this.TXBXorCANVASGuard)) {
                            if (prev.parent != line) {
                                //not same line,and press shift, should move focus to end of previous line
                                return this.makeViewPosition(prev, prev.len);
                            }
                        }
                    } else {
                        var line = obj.parent;
                        if (prev = this.getPrevRun(obj, this.TextBoxGuard, this.TXBXorCANVASGuard)) {
                            if (prev.parent == line) {
                                //not same line,and press shift, should move focus to end of previous line
                                return this.makeViewPosition(prev, prev.len);
                            }
                        }
                    }

                }
                return this.makeViewPosition(obj, index - 1);
            } else {
                prev = obj.previous();
                if (!prev && (ViewTools.isCell(obj) || ViewTools.isRow(obj) || ViewTools.isTable(obj))) {
                    var parent = obj;
                    var prevParent = parent && parent.previous();
                    while (parent && !prevParent) {
                        parent = parent.getParent();
                        prevParent = parent && parent.previous();
                    }
                    if (ViewTools.isRow(prevParent)) {
                        prev = prevParent.getContainer().getFirst();
                    } else {
                        prev = prevParent;
                    }
                }
                var viewType = obj.getViewType && obj.getViewType();

                if (prev && prev.getViewType() != viewType) {
                    var run = this.getLastItem(prev, this.RUNGUARD);
                    if (run)
                        return this.makeViewPosition(run, run.len, true);
                    else
                        return this.makeViewPosition(prev, 0, true);
                } else if (prev)
                    return this.makeViewPosition(prev, 0, true);
            }
        },

        getCommonAscendant: function(c1, c2) {
            var c1 = c1.obj,
                c2 = c2.obj;
            while (c1) {
                var tmp = c2;
                while (tmp) {
                    if (c1 == tmp)
                        return c1;
                    tmp = tmp.getParent();
                }
                c1 = c1.getParent();
            }
            return c1;
        },
        /**
         * compare two position
         * @param startView
         * @param endView
         * @returns
         * return true, big...
         * return false small or less 
         */
        compare: function(startView, endView) {
            if (startView.obj == endView.obj)
                return (startView.index > endView.index);

            var body1 = this.view.getBody(startView.obj),
                body2 = this.view.getBody(endView.obj);
            if (body1 == body2) {
                var startRow = this.view.getRow(startView.obj),
                    endRow = this.view.getRow(endView.obj);
                var startCell = this.view.getCell(startView.obj);
                var endCell = this.view.getCell(endView.obj);
                var inTheSameCell = startCell && endCell && (startCell == endCell);
                if (startRow && endRow && !inTheSameCell) {
                    var startIdx = -1;
                    if (this.view.isRow(startView.obj)) {
                        startIdx = startView.index;
                        startCell = startView.obj.getItemByIndex(startIdx) || startView.obj.cells.getLast();
                        startIdx = startCell.getColIdx();
                    } else {
                        startIdx = startCell.getColIdx();
                    }
                    var endIdx = -1;
                    if (this.view.isRow(endView.obj)) {
                        endIdx = endView.index;
                        endCell = endView.obj.getItemByIndex(endIdx) || endView.obj.cells.getLast();
                        endIdx = endCell.getColIdx();
                    } else {
                        endIdx = endCell.getColIdx();
                    }
                    return startIdx > endIdx;
                }
                var pos1 = this.getDocumentPosition(startView, true);
                var pos2 = this.getDocumentPosition(endView, true);

                if (!pos1 || !pos2)
                    return false;

                var line1 = this.view.getLine(startView.obj);
                var line2 = this.view.getLine(endView.obj);
                if (line1 == line2 && line1) {
                    return pos1.x > pos2.x;
                } else {
                    return pos1.y > pos2.y;
                }

            } else {
                var next = this.getNextItem(body1, this.view.isBody, false);
                while (next && next != body2)
                    next = this.getNextItem(next, this.view.isBody, false);
                return !next;
            }
        },
        /*
         * Check if start is lower than end position 
         */
        isNeedSwap: function(range) {
            if (range.isCollapsed())
                return false;
            var startView = range.getStartView(),
                endView = range.getEndView();

            if (!startView || !endView)
                return false;
            return this.compare(startView, endView);

        },
        /*
         * Swap start and end if need. 
         */
        optimize: function(range, isHighlight) {
            if (!isHighlight && this.isNeedSwap(range)) {
                return new g.RangeClass(range.getEndView(), range.getStartView());
            } else
                return range;
        },
        //	/*
        //	 * get parent which viewType == type
        //	 */
        //	getContainer: function( item, type ){
        //		while( item && ( !item.getViewType || item.getViewType() != type ) ){
        //			item = item.getParent();
        //		}
        //		return item;
        //	},

        /*
         * whether range contains only one view, and return the view
         * @param	range: range
         * @param	isObjFunc: a function that check the type of view.
         * @return	the only one view
         */
        ifContainOnlyOneObject: function(range, isObjFunc) {
            var startView = range.getStartView();
            var endView = range.getEndView();

            if (!startView || !endView) {
                return null;
            }

            // 1.only one image in range
            if (startView.obj == endView.obj && 0 == startView.index && endView.obj.len == endView.index && isObjFunc(startView.obj)) {
                return startView.obj;
            }

            ///////
            var startNextObj = startView.obj.next(true);
            var endPreObj = endView.obj.previous(true);

            if (!startNextObj || !endPreObj) {
                return null;
            }

            if (startNextObj == endView.obj || startView.obj == endPreObj) {
                // 2. start is end of run, end is end of image
                if (isObjFunc(endView.obj)) {
                    if (startView.index == startView.obj.len && endView.index == endView.obj.len) {
                        return endView.obj;
                    }
                }

                // 3. start is start of image, end is start of run
                if (isObjFunc(startView.obj)) {
                    if (0 == startView.index && 0 == endView.index) {
                        return startView.obj;
                    }
                }
            }

            // 4. start is end of run, end is start of run(with image between it)
            if (startNextObj == endPreObj && isObjFunc(startNextObj)) {
                if (startView.index == startView.obj.len && 0 == endView.index) {
                    return startNextObj;
                }
            }
        },

        /*
         * whether range contains only one view, and return the view, espectialy in multi-view of one model.
         * @param	range: range
         * @param	isModelFunc: a function that checks the type of Model.
         * @return	the only one specific view
         */
        ifContainOnlyOneObjectEx: function(range, isModelFunc) {
            var vTools = ViewTools;
            /*
             this function returns the only specific model of the range.
             "isObjFunc" is the function that checks the type of Model.
            */
            var getOnlyOneSpecModel = function(range, isObjFunc) {
                var startModel = range.startModel;
                var endModel = range.endModel;

                if (!startModel || !endModel)
                    return null;

                // 1.only one model in range
                if (startModel.obj == endModel.obj && 0 == startModel.index && endModel.obj.length == endModel.index && isObjFunc(endModel.obj)) {
                    return startModel.obj;
                }

                //////////
                var startNextObj = startModel.obj.next(true);
                var endPreObj = endModel.obj.previous(true);

                if (!startNextObj || !endPreObj) {
                    return null;
                }

                if (startNextObj == endModel.obj || startModel.obj == endPreObj) {
                    // 2. start is end of run, end is end of model
                    if (isObjFunc(endModel.obj)) {
                        if (startModel.index == startModel.obj.len && endModel.index == enendModeldView.obj.len) {
                            return endModel.obj;
                        }
                    }

                    // 3. start is start of model, end is start of run
                    if (isObjFunc(startModel.obj)) {
                        if (0 == startModel.index && 0 == endModel.index) {
                            return startModel.obj;
                        }
                    }
                }

                // 4. start is end of run, end is start of run(with model between it)
                if (startNextObj == endPreObj && isObjFunc(startNextObj)) {
                    if (startModel.index == startModel.obj.len && 0 == endModel.index) {
                        return startNextObj;
                    }
                }
            };

            var objModel = getOnlyOneSpecModel(range, isModelFunc);
            if (objModel) {
                /*
                 in the case:
                 [one model - multi views] (for example: view in header/footer)
                 we have to find the current view of the model.
                */
                var fellowView = range.getStartView() || range.getEndView();
                var txContent = fellowView && fellowView.obj && vTools.getTextContent(fellowView.obj);

                var allViews = objModel.getAllViews();
                for (var ownerId in allViews) {
                    var viewers = allViews[ownerId];
                    var view = viewers.getFirst();
                    if (vTools.getTextContent(view) == txContent)
                        return view;
                }
            }

            return null;
        },

        /*
         * whether range contains only one image, and return the image
         */
        ifContainOnlyOneImage: function(range) {
            return this.ifContainOnlyOneObject(range, ViewTools.isImage) || this.ifContainOnlyOneObjectEx(range, g.modelTools.isImage);
        },

        /*
         * whether range contains only one textbox, and return the textbox
         */
        ifContainOnlyOneTextBox: function(range) {
            return this.ifContainOnlyOneObject(range, ViewTools.isTextBox) || this.ifContainOnlyOneObjectEx(range, g.modelTools.isTextBox);
        },

        /*
         * whether range contains only one canvas, and return the canvas
         */
        ifContainOnlyOneCanvas: function(range) {
            return this.ifContainOnlyOneObject(range, ViewTools.isCanvas) || this.ifContainOnlyOneObjectEx(range, g.modelTools.isCanvas);
        },

        /*
         * whether range contains only one drawing object, and return the object
         */
        ifContainOnlyOneDrawingObj: function(range) {
            return this.ifContainOnlyOneObject(range, ViewTools.isDrawingObj) || this.ifContainOnlyOneObjectEx(range, g.modelTools.isDrawingObj);
        },

        getStyleOperationRange: function(range) {
            if (this.ifContainOnlyOneTextBox(range)) {
                paras = range.startModel.obj.getParagraphs();
                if (paras.length > 0) // Select shape without paragraph.
                    return new g.RangeClass({
                    "obj": paras[0],
                    "index": 0
                }, {
                    "obj": paras[paras.length - 1],
                    "index": paras[paras.length - 1].getLength()
                });
            }
            return range;
        },

        /*
         * get the absolute pix position of a position object \
         * 
         * position: {'line': line,'point': {x:fixedX,y:fixedY}, 'obj': run,'index':sel.index }
         */
        getDocumentPosition: function(position, bNeedLogicalPos) {

            var item = position.obj;
            var index = position.index;
            var container = item.getContainer();
            if (container && container.length() && !this.view.isDrawingObj(item)) {
                if (index == null || item.getViewType && item.getViewType() == "table.Row")
                    return this.view.getPosition(item);
                else {
                    var child = container.getByIndex(index || 0) || container.getLast();
                    var pos = this.view.getPosition(child);

                    //FIXME, is below lines OK?
                    var toCheckNext = false;
                    while (child.isAnchor && child.next()) {
                        child = child.next();
                        toCheckNext = true;
                    }
                    if (toCheckNext && child && !child.isAnchor) {
                        var pos2 = this.view.getPosition(child);
                        if (pos2.x < pos.x || pos2.y < pos.y)
                            return pos2;
                    }

                    return pos;
                }
            } else //Run...
                return item.getChildPosition(index, true, bNeedLogicalPos);
        },
        /*
         * ge the relative position of a object to body
         */
        getBodyPosition: function(position) {

            var pos, item;
            if (position.obj) {
                pos = this.getDocumentPosition(position);
                item = position.obj;
            } else {
                item = position;
                pos = this.view.getPosition(item);
            }

            var body = this.view.getParent(item, 'page.Body');
            if (body) {
                pos.x -= body.getContentLeft();
                pos.y -= body.getContentTop();
            }
            return pos;
        },
        /*
         * get position in view 
         */
        toViewPosition: function(obj, index, rootView) {
            var MODEL = g.modelTools;
            if ((MODEL.isRun(obj) || MODEL.isAnchor(obj) || MODEL.isInlineObject(obj)) && !MODEL.inCanvas(obj)) {
                index = obj.start + index;
                obj = MODEL.getParagraph(obj);
            }

            var viewID = (rootView && rootView.getOwnerId) ? rootView.getOwnerId() : (rootView || "rootView"),
                viewers = obj.getViews(viewID),
                firstView = viewers && viewers.getFirst();
            // The model maybe inserted into document but not layout.
            // Like press enter to insert new paragraph and set range to the new paragraph.
            if (!firstView || !firstView.hasLayouted()) {
                //			console.error("view has not layouted");
                return null;
            }

            if (obj.modelType == 'paragraph') {
                if (index < 0 || !index)
                    index = 0;
                if (index > obj.getLength())
                    index = obj.getLength();
                var para = firstView;

                if (para && index > 0) {
                    //check the para's first run's start, to make sure the index is in the para
                    var next = para;
                    while (next && next.getEndIndex && next.getEndIndex() < index) {
                        next = viewers.next(next);
                        next && (para = next);
                    }
                }

                // search run view
                var tools = this;
                var run = para && tools.getFirstItem(para, tools.RUNDrawingobjGuard);
                while (run) {
                    var len = run.len || 0;
                    if ((index <= run.start + len) && tools.InlineRunGuard(run)) // In OT case, the run.start has not been fixed.
                        break;
                    else
                        run = tools.getNextRunOrDrawingObj(run);
                }
                // ----search run view end

                if (run) {
                    if (run.getViewType() == 'text.PageBreak' && index == (run.start + run.len))
                    //if in the end of page break run
                    //move to beginning of next run;
                        run = tools.getNextRunOrDrawingObj(run) || run;
                    index -= run.start;
                    if (index < 0) index = 0;
                    return this.makeViewPosition(run, index);
                } else {
                    // console.error("Wrong index in range.setStartModel");
                    return null;
                }
            } else if (viewers) {
                var start = 0,
                    viewObj;

                if (!index)
                    viewObj = firstView;
                else {
                    viewers.forEach(function(viewItem) {
                        var con = viewItem.getContainer && viewItem.getContainer();
                        if (con) {
                            if (start <= index && index <= (start + con.length())) {
                                viewObj = viewItem;
                                start = index - start;
                                return false;
                            } else
                                start += con.length();
                        }

                    });
                }

                if (!viewObj)
                    return {
                        "obj": viewers.getLast(),
                        "index": index
                    };
                else
                    return {
                        "obj": viewObj,
                        "index": start
                    };
            }
        },
        selectToEnd: function(range, view, setStart) {
            var lastRun = this.getLastItem(view, this.RUNGUARD);
            if (lastRun) {
                if (!setStart) {
                    range.setEndView(lastRun, lastRun.len);
                } else {
                    range.setStartView(lastRun, lastRun.len);
                }

            }
            return;
        },
        selectFromStart: function(range, view, setEnd) {
            var firstRun = this.getFirstItem(view, this.RUNGUARD);
            if (firstRun) {
                if (!setEnd) {
                    range.setStartView(firstRun, 0);
                } else {
                    range.setEndView(firstRun, 0);
                }

            }
        },
        selectToEditStart: function(range, model) {
            var p;
            if (g.modelTools.isParagraph(model))
                p = model;
            else
                p = g.modelTools.getFirstChild(model, g.modelTools.isParagraph, true);
            if (p) {
                range.setStart(p, 0);
            }
        },
        selectToEditEnd: function(range, model) {
            var p;
            if (g.modelTools.isParagraph(model))
                p = model;
            else
                p = g.modelTools.getLastChild(model, g.modelTools.isParagraph, true);
            if (p) {
                range.setEnd(p, g.modelTools.getLength(p));
            }
        },
        canDo: function(ranges, noMessage) {
            var rootModel = null;
            if (!(pe.lotusEditor.isFootnoteEditing() || pe.lotusEditor.isEndnoteEditing())) {
                return true;
            }
            for (var i = ranges.length - 1; i > -1; i--) {
                if (ranges[i].rootView && !rootModel) {
                    rootModel = ranges[i].rootView.model;
                }
                var startNote = g.modelTools.getParent(ranges[i].getStartModel().obj, g.modelTools.isNotes);
                var endNote = g.modelTools.getParent(ranges[i].getEndModel().obj, g.modelTools.isNotes);
                if ((startNote || endNote) && startNote != endNote || rootModel != ranges[i].rootView.model) {
                    if (!noMessage) {
                        var str = "";
                        if (startNote.modelType == constants.MODELTYPE.FOOTNOTE) {
                            str = i18nlang.NOTE_INVALIDACTION_FOOTNOTE;
                        } else {
                            str = i18nlang.NOTE_INVALIDACTION_ENDNOTE;
                        }
                        pe.scene.showWarningMessage(str, 3000);
                    }
                    return false;
                }
            }
            return true;
        },
        getFirstParaInRanges: function(ranges) {
            var range = ranges[0];
            var start = range.getStartParaPos();
            if (ranges.length > 1) {
                var lastStartPara = ranges[ranges.length - 1].getStartParaPos();
                var path1 = g.modelTools.getParagraphPath(start.obj);
                var path2 = g.modelTools.getParagraphPath(lastStartPara.obj);
                var compareResult = toolsModule.arrayCompare(path1, path2);
                if (compareResult > 0) {
                    start = lastStartPara;
                }
            }
            return start;
        },
        /** merge ranges in same table cross page cell */
        mergeRangesInCrossPageCell: function(ranges) {
            //check ranges in same table cell and split in different page
            var result = ranges;
            if (ranges.length > 1) {
                var firstRange = ranges[0], lastRange = ranges[ranges.length - 1];
                var start = firstRange.getStartModel();
                var end = lastRange.getEndModel();
                var startCell = g.modelTools.getParent(start.obj, constants.MODELTYPE.CELL);
                var endCell = g.modelTools.getParent(end.obj, constants.MODELTYPE.CELL);
                if (startCell && startCell == endCell) {
                    // To fix Defect 54891
                    try {
                        if (RangeTools.compare(firstRange.getStartView(), lastRange.getEndView())) {
                            result = [new g.RangeClass(lastRange.getStartModel(), firstRange.getEndModel())];
                        } else {
                            result = [new g.RangeClass(start, end)];
                        }
                    } catch(e) {
                        result = [new g.RangeClass(start, end)];
                    }
                }
            }
            return result;
        },

        fixTCMergedOfRanges: function(ranges) {
            if (lang.isArray(ranges)) {
                for (var i = 0; i < ranges.length; i++) {
                    this.fixTCMergedOfRange(ranges[i]);
                }
            } else 
                return this.fixTCMergedOfRange(ranges);
        },

        fixTCMergedOfRange: function(range) {
            range.toVirtualModel();
        }

    };
    //return RangeTools;

   // for (var x in RangeTools)
    //    exports[x] = RangeTools[x];

    g.rangeTools = RangeTools;

    return RangeTools;
});
