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
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/query",
    "writer/common/SubContainer",
    "writer/common/Container",
    "writer/util/ModelTools",
    "writer/common/tools",
    "writer/util/ViewTools",
    "writer/constants",
    "writer/view/AbstractView",
    "writer/model/Paragraph",
    "writer/model/Model",
    "concord/util/acf",
    "writer/view/Line",
    "writer/view/RunCollection",
    "writer/view/update/BlockView"
], function(array, declare, lang, domAttr, domConstruct, domStyle, query, SubContainer, Container, ModelTools, tools, ViewTools, constants, AbstractView, Paragraph, Model, acf, Line, RunCollection, BlockView) {

    var ParagraphView = declare("writer.view.Paragraph", null, {
    	constructor: function(model, ownerId, splited) {
	        this.model = model;
	        this.directProperty = model.getDirectProperty();
	        this.left = 0;
	        this.top = 0;
	        this.ownerId = ownerId;
	        this.height = 0;
	        this.h = 0;
	        this.taskNode = new Object();
	        this.tpNode = null;
	        this.needRelayout = null;
	        this.initBorder();
	        !splited && this.init(ownerId);
	        if (this.model.isRightClosure())
	            this._isVisibleInTrack = false;
    	}
    });

    ParagraphView.prototype = {
        initContainer: function(ownerId) {
            // var hasDom = !this.model.isVirtualNotDominate();
            // if (hasDom) {
                var para = this.model;
                var runs = para.getRuns();
                var run = runs.getFirst();

                var that = this;
                var curPageBreak = null;

                var appendNewRun = function(newRun) {
                    if (newRun.isAnchor) // for anchor, should be layouted first but after pagebreak.
                    {
                        if (curPageBreak)
                            that._container.insertAfter(newRun, curPageBreak);
                        else
                            that._container.appendFront(newRun);
                    } else if (ViewTools.isPageBreak(newRun)) {
                        if (newRun.isVisibleInTrack()){
                            that._container.append(newRun);
                            curPageBreak = newRun;
                        } else
                            that._container.append(newRun);
                    } else {
                        that._container.append(newRun);
                    }
                };

                while (run) {
                    
                    var r = run.preLayout(ownerId);
                    if (r.isContainer) {
                        r.forEach(function(newR, i) {
                            appendNewRun(newR);
                        });
                    } else if (r instanceof Array) {
                        for (var i = 0; i < r.length; ++i) {
                            appendNewRun(r[i]);
                        }
                    } else {
                        appendNewRun(r);
                    }
                    if (run.modelType == constants.MODELTYPE.RFOOTNOTE) {
                        // TODO Track
                        if (!ModelTools.isInNotes(this.model)) {
                            if (!this.referredFootNote)
                                this.referredFootNote = new Container(this);
                            pe.lotusEditor.relations.notesManager.bindingRefer(r, ViewTools.isRFootnote);
                            this.referredFootNote.append(r);
                        }
                    }
                    if (run.modelType == constants.MODELTYPE.RENDNOTE) {
                        // TODO Track
                        if (!ModelTools.isInNotes(this.model)) {
                            if (!this.referredEndNote)
                                this.referredEndNote = new Container(this);
                            pe.lotusEditor.relations.notesManager.bindingRefer(r, ViewTools.isREndnote);
                            this.referredEndNote.append(r);
                        }
                    }
                    run = runs.next(run);
                }
            // }
            this.container = new SubContainer(this._container, this._container.getFirst(), this._container.getLast());
        },

        init: function(ownerId) {
            /**
             *  The _container is all children view of this paragraph's model.
             *  Only the first paragraph's view have it, other paragraph's sibling view will 
             *     be generated by split. The split constructor will not invoke this function. 
             */
            this._container = new Container(this);
            this.lines = new Container(this);

            this._createListSymbol();
            this.initContainer(ownerId);


            this.bottomBorderSize = 0;
            this.bottomBorderSpace = 0;
            this.topBorderSize = 0;
            this.topBorderSpace = 0;

            this.initBorder();
        },
        initBorder: function() {
            this.bottomBorderSize = 0;
            this.bottomBorderSpace = 0;
            this.topBorderSize = 0;
            this.topBorderSpace = 0;

            // if (this.model.isVirtualNotDominate())
            //     return;

            // var para = this.model.getVirtualParaOrMe();
            var para = this.model;
            var border = para.getBorder();

            if (border) {
                //merge nextBorder
                if (!para.canMergeBorder(false) && border["bottom"]) {
                    this.bottomBorderSize = Math.ceil(tools.toPxValue(border["bottom"].sz || 0));
                    this.bottomBorderSpace = this.bottomBorderSize > 0 ? Math.ceil(tools.PtToPx(border["bottom"].space || 0)) : 0;
                }
                //merge preBorder
                if (!para.canMergeBorder(true) && border["top"]) {
                    this.topBorderSize = Math.ceil(tools.toPxValue(border["top"].sz || 0));
                    this.topBorderSpace = this.topBorderSize > 0 ? Math.ceil(tools.PtToPx(border["top"].space || 0)) : 0;
                }
                //css don't support between-border,so use bottom to replace between
                var nextModel = para.next();
                if (border["between"] && nextModel && nextModel.getBorder && nextModel.getBorder() && nextModel.getBorder()["between"]) {
                    this.bottomBorderSize = Math.ceil(tools.toPxValue(border["between"].sz || 0));
                    this.bottomBorderSpace = this.bottomBorderSize > 0 ? Math.ceil(tools.PtToPx(border["between"].space || 0)) : 0;
                }
            }
        },
        destory: function() {
            this.model.removeViewer(this);
        },
	/* In right-to-left paragraph, list symbol alignment is treated in mirrored way */
        _isListSymbolAlignRight: function() {
            var lvlJc = this.model.listSymbols && this.model.listSymbols.lvlJc;
            var isRtl = this.model.directProperty && (this.model.directProperty.getDirection() == "rtl");
            return ( (lvlJc == "right" && !isRtl) || (lvlJc == "left" && isRtl));
        },

        _createListSymbol: function() {
            var listRuns = this.model.listRuns;

            if (listRuns && listRuns.txt) {
                this.listSymbol = new Container();
                var tRun = listRuns.txt.preLayout(this.getOwnerId());
                if (listRuns.img) {
                    var iRun = listRuns.img.preLayout(this.getOwnerId());
                    this.listSymbol.append(iRun);
                    // Ugly code, just append the last run, Tab run to the image bullet.
                    tRun = [tRun[tRun.length - 1]];
                }
                this.listSymbol.appendAll(tRun);
            } else {
                delete this.listSymbol;
            }
        },
        releaseBodySpace: function(body) {
            var first = this.container && this.container.getFirst();
            while (first && first.isAnchor) {
                if (first.ownedSpace)
                    body.releaseSpace(first.ownedSpace);
                else
                    body.releaseSpaceByModelId(first.model.id);

                first = this.container.next(first);
            }
            return first;
        },
        getWidth: function() {
            return this._getLineWidth();
        },
        getTextContentWidth: function() {
            var w = 0;
            this.lines.forEach(function(line, i) {
                w = Math.max(w, line.getTextWidth());
            });
            return w;
        },
        getViewType: function() {
            return 'text.Paragraph';
        },
        getContainer: function() {
            return this.lines;
        },
        getReferredFootNote: function() {
            return this.referredFootNote;
        },
        getContentLeft: function() {
            var left = this.getLeft();
            var marginleft = this.getStyle()["margin-left"];
            marginleft = tools.toPxValue(marginleft);
            return left + marginleft;
        },
        getContentTop: function() {
            return this.getTop();
        },
        getChildPosition: function(idx) {
            var line = idx && this.lines.getByIndex(idx);
            if (!line) {
                line = this.lines.getLast();
                return {
                    'x': line.w + this.getLeft(),
                    'y': line.getTop()
                };
            } else {
                return {
                    'x': line.getLeft(),
                    'y': line.getTop()
                };
            }
        },
        taskRender: function() {
            if (pe.lotusEditor.getTaskHdl())
                pe.lotusEditor.getTaskHdl().taskRender(this);
        },

        //	updateTaskNode : function() {
        //		if (pe.lotusEditor.getTaskHdl())
        //			pe.lotusEditor.getTaskHdl().updateTaskNode(this);
        //	},
        // Only used for render anchor indicator.
        getDomNode: function() {
            return this.domNode;
        },
        render: function() {
            if (this.domNode && this.domNode.childNodes.length == 0 && this.lines.length() > 0) {
                this.releaseDom();
                if (this.isVisibleInTrack())
                    console.error("Paragraph render wrong!!!");
            }

            if (!this.domNode || this.isDirtyDOM()) {
                delete this._dirtyDOM;

                var marginLeft = 0;
                if (this.parent && this.parent.getViewType() == "toc") {
                    marginLeft = -this.parent.marginLeft + this.parent.padding;
                }
                var atts = {
                    "class": "Paragraph" + this.getCSSStyle(),
                    "style": this.getStyleStr()
                };
                if (window.g_concordInDebugMode)
                    atts["id"] = this.model.id;
                this.domNode = domConstruct.create("div", atts);
                //			this.tpNode = this.domNode;	// Unsupport task to remove it.
                var line = this.lines.getFirst();
                this.height = 0;
                
                if (!line || !this.isVisibleInTrack()) {
                    this.h = 0;
                    this.domNode.style.display = "none";
                    return this.domNode;
                }
                
                this.domNode.style.display = "";

                var lineNode = null;
                while (line) {
                    lineNode = line.render();
                    this.height = this.height + line.getBoxHeight();
                    this.onLineRendering && this.onLineRendering(lineNode, line, this.lines);
                    this.domNode.appendChild(lineNode);
                    line = this.lines.next(line);
                }

                if (lineNode && this.parent && this.parent.model && this.parent.model.isWaterMarker) {
                    var runDom = query("span[realh]", lineNode)[0];
                    var height = domAttr.get(runDom, "realh");
                    var width = domAttr.get(runDom, "realw");
                    if (height) {
                        var w = parseFloat(width);
                        // push to the center, and make rotation ok.
                        if (this.parent.iw < w)
                            this.domNode.style.left = (this.parent.iw - w) / 2 + "px"

                        var h = parseFloat(height);
                        var myh = this.height;
                        if (!myh || myh > this.parent.ih)
                            myh = this.parent.ih;
                        if (h && myh) {
                            array.forEach(query(".run", lineNode), function(c, index) {
                                if (c.style.display != "none")
                                    c.style.display = "inline-block";
                                var origin = myh / h > 1 ? "center" : "top";
                                c.style.transformOrigin = origin;
                                c.style.webkitTransformOrigin = origin;
                                c.style.mozTransformOrigin = origin;
                                c.style.msTransformOrigin = origin;
                                c.style.transform = "scale(1," + myh / h + ")";
                                c.style.webkitTransform = "scale(1," + myh / h + ")";
                                c.style.mozTransform = "scale(1," + myh / h + ")";
                                c.style.msTransform = "scale(1," + myh / h + ")";
                            });
                        }
                    }
                }

                if (marginLeft)
                    domStyle.set(this.domNode, "marginLeft", marginLeft + "px");

                delete this._dirtyDOM;
                //			this.taskRender();  // Unsupport task to remove it.
            }
            return this.domNode;
        },
        onLineRendering: null,
        /**
         * internal function, you should use render()
         * when  
         */
        _updateDOM: function() {
            if (this.model.getBorder() && this.domNode) {
                domAttr.set(this.domNode, "style", this.getStyleStr());
            }

            var line = this.lines.getFirst();
            this.height = 0;
            while (line) {
                if (line.dirty && this.domNode) {
                    line.render(this.domNode);
                    delete line.dirty;
                }
                this.height = this.height + line.getBoxHeight();
                line = this.lines.next(line);

            }
            delete this._dirtyDOM;
            //		this.updateTaskNode();
        },
        _updateRunsFromModel: function(textModelContainer, paragraphViews) {
            var mTools = ModelTools;
            var vTools = ViewTools;
            // put anchor ahead of the container temperory
            var reOrderContainer = function(con) {
                var newContainer = new Container(this);

                var pagebreakRun = null;
                var it = con.getFirst();
                while (it) {
                    if (mTools.isAnchor(it)) {
                        var behindDoc = it.behindDoc && it.behindDoc != "0";
                        // render background anchors before "pageBreak"
                        if (pagebreakRun && !behindDoc)
                            newContainer.insertAfter(it, pagebreakRun);
                        else
                            newContainer.appendFront(it);
                    } else if (mTools.isPageBreak(it)) {
                        newContainer.append(it);
                    	if (it.isVisibleInTrack()) {
                            pagebreakRun = it;
                        }
                    } else {
                        newContainer.append(it);
                    }

                    it = con.next(it);
                }

                return newContainer;
            };

            var _insertView = function(newView, runView) {
                if (newView instanceof Array) {
                    for (var i = 0; i < newView.length; i++) {
                        newView[i].markRelayout();
                        if (runView) {
                            allRuns.insertBefore(newView[i], runView);
                        } else {
                            allRuns.append(newView[i]);
                        }
                    }
                } else {
                    newView.markRelayout();
                    if (runView) {
                        allRuns.insertBefore(newView, runView);
                    } else {
                        allRuns.append(newView);
                    }
                }
            };
            var nextParagraph = this;
            var allRuns = this.container._container;
            var runView = allRuns.getFirst();
            textModelContainer = reOrderContainer(textModelContainer);
            var textModel = textModelContainer.getFirst();
            while (runView && textModel) {
                if (runView.model != textModel) {
                    if (textModel && textModel.inserted) {
                        var insertedView = textModel.preLayout(this.getOwnerId());
                        _insertView(insertedView, runView);
                        if (mTools.isWrappingAnchor(textModel))
                            this._hasAnchorWrappingChanged = true;
                        textModel = textModelContainer.next(textModel);
                    } else {
                        var relativedViews = this._getRelativeRunView(runView, allRuns);
                        runView = allRuns.next(relativedViews[relativedViews.length - 1]);
                        for (var i = 0; i < relativedViews.length; i++) {
                            relativedViews[i].markDelete();
                            if (vTools.isWrappingAnchor(relativedViews[i]))
                                this._hasAnchorWrappingChanged = true;
                        }
                    }
                } else {
                    var relativedViews = this._getRelativeRunView(runView, allRuns);
                    runView = allRuns.next(relativedViews[relativedViews.length - 1]);
                    if (textModel.dirty) {

                        for (var i = 0; i < relativedViews.length; i++) {
                            allRuns.remove(relativedViews[i]);
                            if (vTools.isWrappingAnchor(relativedViews[i]))
                                this._hasAnchorWrappingChanged = true;
                        }
							// defect 56489 even we do not render, we need add it into container so it could display when track
                            var newViews = textModel.preLayout(this.getOwnerId());
                            _insertView(newViews, runView);
                    } else {
                        relativedViews[0].updateProperty(relativedViews);
                    }
                    textModel = textModelContainer.next(textModel);
                }
            }
            if (runView) {
                while (runView) {
                    var t = allRuns.next(runView);
                    runView.markDelete();
                    runView = t;
                }
            } else if (textModel) {
                while (textModel) {
                	// defect 56489 even we do not render, we need add it in container so it could display when track
                     var insertedView = textModel.preLayout(this.getOwnerId());
                     _insertView(insertedView, runView);
                    textModel = textModelContainer.next(textModel);
                }
            }
            return allRuns;
        },

        /**
         * !!!this function needs refactor when border feature is ready!!!
         * return boolean value that if this paragraph has border
         */
        _hasBorder: function() {},
        _updateLayout: function(runs, start, paragraphViews) {
            var vTools = ViewTools;
            var that = this;
            var _resetContainer = function(run) {
                that.container.reset();
                if (start.isDeleted())
                    that.container.setStart(runs.getFirst());
                else
                    that.container.setStart(start);
                var last = run && runs.prev(run) || runs.getLast();
                that.container.setEnd(last);
            };
            var _resetReferrednotes = function() {
                if (ModelTools.isInNotes(that.model)) {
                    return;
                }
                var resetnotes = function(oldRefer, guard) {
                    var newRefer = new Container(that);
                    that.container.forEach(function(run) {
                        if (guard(run)) {
                            newRefer.append(run);
                            if (!run.getReferFn()) {
                                pe.lotusEditor.relations.notesManager.bindingRefer(run, guard);
                            }
                        }
                    });
                    if (!oldRefer && newRefer.isEmpty()) {
                        return;
                    }
                    var referChanage = false;
                    if (!oldRefer && !newRefer.isEmpty()) {
                        referChanage = true;
                    } else {
                        if (oldRefer.length() != newRefer.length()) {
                            referChanage = true;
                        } else {
                            var f1 = oldRefer.getFirst();
                            var f2 = newRefer.getFirst();
                            while (f1 && f2) {
                                if (f1.getReferFn() != f2.getReferFn()) {
                                    referChanage = true;
                                    break;
                                }
                                f1 = oldRefer.next(f1);
                                f2 = newRefer.next(f2);
                            }
                        }
                    }
                    if (referChanage == true) {
                        return {
                            changed: true,
                            newRNotes: newRefer
                        };
                    }
                    return {
                        newRNotes: newRefer
                    };
                };
                var oldfnRefer = that.referredFootNote;
                var newFNRefer = resetnotes(oldfnRefer, vTools.isRFootnote);
                var oldenRefer = that.referredEndNote;
                var newENRefer = resetnotes(oldenRefer, vTools.isREndnote);

                if (newFNRefer || newENRefer) {
                    if (newFNRefer && newFNRefer.changed || newENRefer && newENRefer.changed) {
                        var textAera = that.getParent();
                        // footnote layout has been changed, 
                        while (textAera && !vTools.isTextContent(textAera)) {
                            textAera = textAera.getParent();
                        }
                        textAera.notifyUpdate([that]);
                    }
                    if (newFNRefer && newFNRefer.newRNotes) {
                        oldfnRefer && oldfnRefer.removeAll();
                        if (!newFNRefer.newRNotes.isEmpty()) {
                            that.referredFootNote = newFNRefer.newRNotes;
                        } else {
                            delete that.referredFootNote;
                        }
                    }
                    if (newENRefer && newENRefer.newRNotes) {
                        oldenRefer && oldenRefer.removeAll();
                        if (!newENRefer.newRNotes.isEmpty()) {
                            that.referredEndNote = newENRefer.newRNotes;
                        } else {
                            delete that.referredEndNote;
                        }
                    }
                }
            };
            var run = start;
            var line = this.lines.getFirst();
            var offsetY = 0;
            var runInLine = line.container.getFirst();
            var firstRunInline = run;

            var _reAppendline = function() {
                line.releaseAll(space);
                delete line.needReAppend;
                line.dirty = true;
                run = that.updateLine(line, firstRunInline, runs, space, pspace);
                runInLine = line.container.getLast();
                if (!run) {
                    var deleteLine = null;
                    if (runInLine) {
                        deleteLine = that.lines.next(line);
                    } else {
                        deleteLine = line;
                    }
                    var lastLine = null;
                    if (deleteLine) {
                        lastLine = that.lines.prev(deleteLine);
                    }

                    while (deleteLine) {
                        that.domNode && deleteLine.domNode && that.domNode.removeChild(deleteLine.domNode);
                        var nextdeleteLine = that.lines.next(deleteLine);
                        that.lines.remove(deleteLine);
                        deleteLine = nextdeleteLine;
                    }
                    if (lastLine) {
                        lastLine.setPaddingBottom(lastLine, that.directProperty);
                    }
                    return true;
                }
                return false;
            };

            var pspace = this.getSpace(this.top);
            var space = pspace && pspace.getNextSpaceY(offsetY);
            while (run) {
                var nextRun = runs.next(run);

                var isRunDirty = run.isDirty();
                var isRunDeleted = run.isDeleted();
                var isNextRunDirty = nextRun && nextRun.isDirty();
                var isDiffLine = run.parent != line;
                var isDiffRun = run != runInLine;
                var isNotParaEnd = paragraphViews.next(this) && !line.container.next(runInLine);

                if (line.needReAppend || isRunDirty || isNextRunDirty || isRunDeleted || isDiffLine || isDiffRun || isNotParaEnd) { // paragraph cross body. be splitted into two view. the last run of first view should be reAppend to line.
                    //re-layou the whole line
                    if (_reAppendline()) {
                        break;
                    }
                } else {
                    run = nextRun;
                }
                runInLine = line.container.next(runInLine);
                if (!runInLine) {
                    firstRunInline = run;

                    var nextLine = this.lines.next(line);
                    if (nextLine) {
                        var lineInc = line.getBoxHeight() - line.paddingBottom;
                        if (lineInc <= 0) {
                            line.h = firstRunInline.getBoxHeight();
                            lineInc = line.getBoxHeight() - line.paddingBottom;

                            if (lineInc <= 0)
                                lineInc = 5;
                        }

                        offsetY += lineInc;
                        space = pspace && pspace.getNextSpaceY(offsetY);
                    }
                    line = nextLine;

                    if (line) {
                        runInLine = line.container.getFirst();
                        if (offsetY != line.top) {
                            var space2 = pspace && pspace.getNextSpaceY(line.top);
                            if (!(space && space2) || !space.equals2(space2, line.getBoxHeight())) {
                                if (_reAppendline()) {
                                    break;
                                } else {
                                    continue;
                                }
                            }
                        }
                    } else {
                        break;
                    }

                }
            }
            if (run && !paragraphViews.next(this)) {
                var lineWidth = this._getLineWidth();
                while (run) {
                    var breakRun = this._appendToLine(this.lines.getLast(), run, runs, space);
                    if (breakRun) {
                        if (run != breakRun) {
                            this.lines.getLast().dirty = true;
                        }

                        // get next available space
                        offsetY += this.lines.getLast().getBoxHeight();
                        space = pspace && pspace.getNextSpaceY(offsetY);

                        this.addLine(lineWidth);
                    }
                    this.lines.getLast().dirty = true;
                    run = breakRun;
                }
            }
            _resetContainer(run);
            _resetReferrednotes();
            this.initBorder();

            // height changed?
            var delH = this.h;
            this.alignLine(pspace);
            delH = this.h - delH;

            // wrapping changed?
            var textContent = vTools.getTextContent(this);
            var isInTable = textContent && vTools.isCell(textContent);
            var tableInDoc = ModelTools.isInDocTable(this.model);
            var isRowRepeat = false;
            if (isInTable && tableInDoc) {
                var row = ModelTools.getRow(this.model);
                isRowRepeat = row && row.isTblHeaderRepeat() == true;
            }
            var isInHeaderFooter = textContent && (textContent.isHeader || textContent.isFooter);
            var wrapChanged = !isInTable && !isInHeaderFooter && this._hasAnchorWrappingChanged;
            if (wrapChanged || delH != 0 || this.hasPageBreak() || this.model.deletedPbr || isRowRepeat) {
                // update
                this.getParent().notifyUpdate([this]);
            }

            // clear tag
            this._hasAnchorWrappingChanged = false;
            if (this.model.deletedPbr)
                delete this.model.deletedPbr;

            this._updateDOM();
            return run;
        },

        /*
         * if there's all zero run from 'viewFrome' to end of paragraph.
         */
        ifEndWithZeroRun: function(viewFrom) {
            if (!viewFrom)
                return false;

            var vTools = ViewTools;
            var nextR = this._container.next(viewFrom);
            if (!nextR)
                return false;

            while (nextR && vTools.isZeroRun(nextR)) {
                nextR = this._container.next(nextR);
            }

            return nextR ? false : true;
        },
        update: function(textModel, textModelContainer, paragraphViews) {
            var allRuns = this._updateRunsFromModel(textModelContainer, paragraphViews);
            //if the paragraph is justified, the aligament runs need to be restore the realwidth;
            var isJustify = this.model.directProperty && this.model.directProperty.isJustified();
            if (isJustify) {
                allRuns.forEach(function(run) {
                    //				if(run.getViewType()=="text.Alignment"){
                    if (run.getViewType() == "text.Run")
                        run.restoreWidth();
                });
            }

            var firstRun = allRuns.getFirst();
            var nextParagraph = this;
            var lastExistParagraph = this;
            while (firstRun) {
                firstRun = nextParagraph._updateLayout(allRuns, firstRun, paragraphViews);
                lastExistParagraph = nextParagraph;
                nextParagraph = paragraphViews.next(nextParagraph);
            }

            if (isJustify) {
                allRuns.forEach(function(run) {
                    if (run.getViewType() == "text.Run")
                        run.updateWidth();
                });
            }


            if (nextParagraph) {
                while (nextParagraph) {
                    var p = paragraphViews.next(nextParagraph);
                    if (nextParagraph.sectId && lastExistParagraph)
                        lastExistParagraph.sectId = nextParagraph.sectId;
                    nextParagraph.deleteSel();
                    nextParagraph = p;
                }
            }
            var lastLine = this.lines.getLast();
            if (lastLine) {
                if (!lastLine.hasCarriage()) {
                    lastLine.appendCarriage();
                } else
                    lastLine.checkTrackClass();
            }
        },
        updateListSymbol: function() {
            // Create new list symbol
            this._createListSymbol();

            //		var firstLine = this.lines.getFirst();
            //		if(!firstLine){
            //			return;
            //		}
            //		
            //		firstLine.removeListSymbol();
            //		this.listSymbol && firstLine.initListSymbol(this.listSymbol);
            //		firstLine.updateListDOM();
        },
        _getRelativeRunView: function(runView, allRuns) {
            var ret = [];
            var v = runView;
            while (v && v.model == runView.model) {
                ret.push(v);
                v = allRuns.next(v);
            }
            return ret;
        },
        updateLine: function(line, run, runs, space, pspace) {
            if (line.container.isEmpty()) {
                var preLine = this.lines.prev(line);
                if (preLine && !preLine.dirty) {
                    var preSpace = pspace && pspace.getNextSpaceY(preLine.top);
                    var run2 = this._appendToLine(preLine, run, runs, preSpace);
                    if (run2 != run) {
                        preLine.dirty = true;
                    }
                    run = run2;
                }
                if (!run) {
                    return null;
                }
            }
            return this._appendToLine(line, run, runs, space);

        },
        _appendToLine: function(line, run, runs, space) {
            var runCllct = this._getNextRunCollection(runs, run);
            while (runCllct && !runCllct.empty()) {

                /*
                var mergedRun = line.mergeRun(run);
                if(mergedRun){
                	mergedRun.merge(run);
                	runs.remove(run);
                	run=mergedRun;
                }
                */

                var breakRunCllct = line.append(runCllct, space);
                if (breakRunCllct && !breakRunCllct.empty()) {
                    var breakCllctFirst = breakRunCllct.getFirst();
                    if (!runs.contains(breakCllctFirst)) {
                        var tar = line.container.getLast();
                        runs.insertAfter(breakCllctFirst, tar);
                    }
                    if (line.canContinues) {
                        runCllct = breakRunCllct;
                        delete line.canContinues;
                        continue;
                    } else {
                        /*
                        	if the line has no height, means that the line is empty, and run cannot fit to
                        	the line, we have to keep this line's height not zero to avoid dead loop.
                        */
                        var lineInc = line.getBoxHeight();
                        if (lineInc <= 0) {
                            line.h = runCllct.getBoxHeight();
                        }
                        if (lineInc <= 0)
                            lineInc = 5;
                    }

                    return breakCllctFirst;
                }
                var lastRun = line.container.getLast();
                run = this.container._container.next(lastRun);

                // trim the empty run at the end of paragraph
                if (lastRun.getViewType() == "text.PageBreak" && lastRun.isVisibleInTrack() && run) {
                    if (this.ifEndWithZeroRun(lastRun))
                        run = null;
                } else {
                    run = this.container._container.next(lastRun);
                }



                runCllct = this._getNextRunCollection(runs, run);
            }
            return null;
        },

        _getLineWidth: function() {
            var marginleft = this.getStyle()["margin-left"];
            if (marginleft) {
                marginleft = tools.toPxValue(marginleft);
            } else {
                marginleft = 0;
            }
            var w = (this.parent.getWidth && this.parent.getWidth(true)) || 0;
            w -= marginleft;
            return w;
        },

        _genSingleRunCllct: function(run) {
            var runArray = [];
            runArray.push(run);
            var ret = new RunCollection(runArray);
            return ret;
        },

        // generate next run collection, this collection contains several continuous run
        _getNextRunCollection: function(runs, startRun) {
            var vTools = ViewTools;
            var runArray = [];
            while (startRun) {
                if (startRun.isDeleted && startRun.isDeleted()) {
                    var r = startRun;
                    startRun = runs.next(startRun);
                    r.parent && (r.parent.needReAppend = true);
                    runs.remove(r);
                    continue;
                }
                //TODO:
                //if(startRun.getViewType()== "bookMark"){
                //	var r = startRun;
                //	startRun = runs.next(startRun);
                //	runs.remove(r);
                //	continue;
                //}
                //end

                // append
                if (vTools.isTextRun(startRun) || vTools.isInlineDrawingObj(startRun)) {
                    // only text run & inline drawing object should be collected.
                    runArray.push(startRun);
                } else {
                    // the other run will be alone in a collection.
                    if (0 == runArray.length)
                        runArray.push(startRun);

                    break;
                }

                // get next run
                startRun = runs.next(startRun);
            }

            var runCllct = new RunCollection(runArray);
            return runCllct;
        },

        layout: function(body) {
            //		the tag isSplited is not necessary now. there is something need to change.
            //		if(this.isSplited){
            //			delete this.isSplited;
            //			
            //			if (!this.preSplitedPara || !this.preSplitedPara.ifBeginWithPageBreak())
            //				return;
            //				
            //			delete this.preSplitedPara;
            //		}
            this.markDirtyDOM();
            this.parent = body;
            var w = this._getLineWidth();
            if (w <= 0) {
                this.h = 0;
                return;
            }

            var lastLine = this.lines.getLast();
            if (lastLine) {
                //clean lines before layout
                this.releaseLayout();
            }
            this.addLine(w);
            var startRun = this._layoutPageBreak(w); // Layout page break first
            lastLine = this.lines.getLast();
            //		this.markDirtyDOM();
            var run = this._layoutAnchor(startRun);
            var offsetY = 0;
            var pspace = body.getSpace && body.getSpace(body.offsetY);
            var space = pspace && pspace.getNextSpaceY(offsetY);
            var lastSpace = space;
            var isOutSpace = this.listSymbol ? lastLine.initListSymbol(this.listSymbol, body, space, this._isListSymbolAlignRight()) : false;
            // When the list item is the first line of new page,
            // The list symbol was aligned in separate line
            var listLine = isOutSpace ? lastLine : null;

            // build run collection, this collection contains runs that are continuous.
            var runCllct = this._getNextRunCollection(this.container, run);
            while (runCllct && !runCllct.empty()) {
                var currentLine = lastLine;
                var breakRunCllct = lastLine.append(runCllct, space);
                if (breakRunCllct && !breakRunCllct.empty()) {
                    var breakCllctFirst = breakRunCllct.getFirst();
                    if (!this.container.contains(breakCllctFirst)) {
                        var insertPos = lastLine.container.getLast();
                        this.container.insertAfter(breakCllctFirst, insertPos);
                    }
                    if (!lastLine.canContinues) {
                        // for this is not last line, so sub the spaceafter
                        var lineInc = lastLine.getBoxHeight() - lastLine.paddingBottom;

                        if (lineInc <= 0) {
                            lastLine.h = runCllct.getBoxHeight();
                            lineInc = lastLine.getBoxHeight() - lastLine.paddingBottom;

                            if (lineInc <= 0)
                                lineInc = 5;
                        }

                        offsetY = offsetY + lineInc;
                        lastSpace = space;
                        space = pspace && pspace.getNextSpaceY(offsetY);
                        if (listLine == null) {
                            // Don't add line first time
                            lastLine = this.addLine(w);
                            //						lastLine = this.lines.getLast();
                        }
                    }
                    //temp code;need to refactor. when the width for the lines can not append any one runs, the run need to be append forcibly
                    // this issue need to be handled when line append the run.

                    if (breakRunCllct.equalTo(runCllct) && !currentLine.canContinues && currentLine.container.isEmpty() && currentLine.w == lastLine.w) {
                        // TODO Temp code only do it in table, Dead loop in table.
                        // Sample file BTC_ExternalCodeListDescription_16June09-xj.docx, Testbericht.docx , Sampling and Analysis Plan.docx
                        if (listLine != null)
                            runCllct = breakRunCllct;
                        else if (space && lastSpace && space.h > lastSpace.h)
                            runCllct = breakRunCllct;
                        else if (currentLine.h != lastLine.h && currentLine.w >= 0 && !ModelTools.getParent(this.model, constants.MODELTYPE.CELL)) {
                            runCllct = breakRunCllct;
                        } else {
                            // force append
                            breakRunCllct.forEach(function(breakR, k) {
                                currentLine.container.append(breakR);
                                breakR.parent = currentLine;
                            });

                            currentLine.offsetX = currentLine.paddingLeft + currentLine.w;

                            if (breakRunCllct.getBoxHeight() > currentLine.h) {
                                currentLine.h = breakRunCllct.getBoxHeight();
                            }

                            // next run collection
                            run = this.container.next(breakRunCllct.getLast());
                            runCllct = this._getNextRunCollection(this.container, run);

                            // Remove dummy last line
                            if (lastLine != currentLine) {
                                this.lines.remove(lastLine);
                                lastLine = currentLine;
                            }
                        }
                    } else {
                        runCllct = breakRunCllct;
                    }
                    //run = breakRunCllct;
                } else {
                    var lastRun = lastLine.container.getLast();
                    run = this.container.next(lastRun);

                    // trim the empty run at the end of paragraph
                    if (lastRun.getViewType() == "text.PageBreak" && run) {
                        if (this.ifEndWithZeroRun(lastRun))
                            run = null;
                    }

                    runCllct = this._getNextRunCollection(this.container, run);
                }
                listLine = null;
                delete lastLine.canContinues;
            }
            this.alignLine(pspace);
        },
        _layoutAnchor: function(startRun) {
            var first = startRun;
            var lastLine = this.lines.getLast();
            while (first && first.isAnchor) {
                var firstCllct = this._genSingleRunCllct(first);
                var breakRunCllct = lastLine.append(firstCllct);

                if (breakRunCllct && breakRunCllct.equalTo(firstCllct)) {
                    var w = this._getLineWidth();
                    this.addLine(w);
                    lastLine = this.lines.getLast();
                    lastLine.append(firstCllct);
                }

                first = this.container.next(first);
            }
            return first;
        },
        /**
         * The function will return the start layout run
         */
        _layoutPageBreak: function(lineWidth) {
            var pageBreaks = [],
                viewType; // Get continuous page brea
            var firstContentRun = this.container.getFirst(); // Not bookmark and page break run
            while (firstContentRun) {
                viewType = firstContentRun.getViewType();
                //			if( viewType== "bookMark")
                //				firstContentRun = this.container.next(firstContentRun);
                //			else 
                if (viewType == "text.PageBreak") {
                    if (firstContentRun.isVisibleInTrack())
                        pageBreaks.push(firstContentRun);
                    firstContentRun = this.container.next(firstContentRun);
                } else
                    break;
            }

            for (var i = 0; i < pageBreaks.length; i++) {
                var lastLine = this.lines.getLast();
                lastLine.append(this._genSingleRunCllct(pageBreaks[i]));
            }
            // Append a line for list, if the para includes other runs except pagebreak
            if (pageBreaks.length > 0 && this.listSymbol) {
                var vTools = ViewTools;
                var bEmptyPageBreakPara = true;
                var r = this.container.getFirst();
                while (r) {
                    if (!vTools.isZeroRun(r) && !vTools.isPageBreak(r)) {
                        bEmptyPageBreakPara = false;
                        break;
                    }
                    r = this.container.next(r);
                }

                if (!bEmptyPageBreakPara)
                    this.addLine(lineWidth);
                else
                    delete this.listSymbol;
            }

            return firstContentRun;
        },
        getSpace: function(offsetY, w, h) {
            return this.parent.getSpace && this.parent.getSpace(offsetY, w, h);
        },
        updateAnchor: function(body) {
            var first = this.container.getFirst();
            while (first && first.isAnchor) {
                first.updatePosition(body);
                first = this.container.next(first);
            }
            return first;
        },
        updatePosition: function(body) {
            var oldParent = this.parent;
            this.parent = body; // Set parent when this paragraph view has been splitted.

            // check need relayout
            if (this.isDirty()) {
                this.releaseLayout();
                this.layout(body);
                return;
            }

            // if the origin parent's width is not equal with the new parent after splitted.
            // the paragraph shoud be relayout.
            if (!oldParent || oldParent != body && oldParent.getWidth() != body.getWidth()) {
                this.releaseLayout();
                this.layout(body);
                return;
            }
            // irregular columns exist
            if(this.needRelayout){
                this.releaseLayout();
                this.layout(body);
                delete this.needRelayout;
                return;
            }

            // check space changed to relayout
            this.updateAnchor(body);
            var tempSpace = body.getSpace(body.offsetY, this.getWidth(), this.h);
            if (tempSpace && this._space && !tempSpace.equals3(this._space)) {
                this.releaseLayout();
                this.layout(body);
            }
        },
        setSpace: function(offsetY) {
            this._space = this.getSpace(offsetY, this.getWidth(), this.h);
            //		console.info(this._space);
        },
        alignLine: function(space) {
            var left = 0,
                h = this.topBorderSize + this.topBorderSpace;
            this.lines.forEach(function(line) {
                line.left = left;
                line.top = h;
                var height = line.getBoxHeight();
                if (height <= 0) {
                    line.alignitem(true);
                }
                var oldH = line.h;
                if (line.bHasScript) {
                    var tmp = line.calcScriptLineHeight();
                    //fix 41140, if it is empty line, do not change line height to 0
                    if (tmp != 0 && tmp > oldH)
                        line.h = tmp;
                }

                if (line.h != oldH) {
                    // update the line height style if the line dom already exist
                    line.updateHeight();
                }
                line.bHasScript = false;
                if (space) {
                    var nextY = space.getNextSpaceY(h, height).y;
                    line.marginTop = nextY - h;
                    if (isNaN(line.marginTop) || line.marginTop < 0) {
                        line.marginTop = 0;
                    }
                }
                height = line.getBoxHeight();
                h = h + height;
            });
            this.h = h + this.bottomBorderSize + this.bottomBorderSpace;
        },

        addLine: function(w) {
            var newLine = new Line(w, 0, this);
            this.lines.append(newLine);
            newLine.initProperty();
            return newLine;
        },
        hasAnchorOutOfBody: function(body) {
            var first = this.container.getFirst();
            while (first) {
                if (first.isAnchor && !first.isContainedByBodyV(body))
                    return true;

                first = this.container.next(first);
            }
            return false;
        },
        ifCanOccuppy: function(body) {
            if (body.getContainer().isEmpty())
                return true;

            return !this.hasAnchorOutOfBody(body);
        },
        canFit: function(w, h, body) {
            var page = ViewTools.getPage(body);
            // try to put the first line of paragraph to the start of body, always can fit despite the line's height is more than body.h
            // is the max body
            if (body && body.getContainer().isEmpty() && this.lines.length() == 1 && body.getHeight() == page.initHeight()) {
                return true;
            }
            var line = this.lines.getLast();
            if (!line)
                return true;
            var paraBottom = line.getBoxHeight() + line.top + this.bottomBorderSize + this.bottomBorderSpace;
            if (h < paraBottom) {
                return false;
            }
            var preLine = this.lines.prev(line);
            while (preLine) {
                if (preLine.isPagebreakLine && preLine.isPagebreakLine()) {
                    return false;
                }
                preLine = this.lines.prev(preLine);
            }

            return true;
        },
        canMerge: function(w, h) {
            var line = this.lines.getFirst();
            if (!line) {
                console.log("Paragraph.not merge, line's empty!!!");
                return false;
            }

            if (ModelTools.isInDocPara(this.model) && this.model.isWidowControl && this.model.isWidowControl()) {
                return true;
            }

            return this.canSplit(w, h);
        },

        canSplit: function(w, h, body) {
            var line = this.lines.getFirst();
            if (!line) {
                console.log("Paragraph.canSplit, lines empty!!!");
                return false;
            }

            if (ModelTools.isInDocPara(this.model) && this.model.isKeepLines && this.model.isKeepLines()) {

                if (body && body.getContainer().isEmpty())
                    return true;
                else {
                    //if there is page break line we must support split even isWiodw()
                    var tempLine = this.lines.getLast();
                    var preLine = this.lines.prev(tempLine);
                    while (preLine) {
                        if (preLine.isPagebreakLine && preLine.isPagebreakLine()) {
                            return true;
                        }
                        preLine = this.lines.prev(preLine);
                    }
                }
                return false;
            }
            var linesCount = this.lines.length();
            var borderSize = linesCount == 1 ? (this.bottomBorderSize + this.bottomBorderSpace) : 0;

            if (h < line.getBoxHeight() + line.top + borderSize) {
                if (body && body.getContainer().isEmpty())
                    return true;
                return false;
            }

            return true;
        },
        split: function(w, h, body) {
            var first = this.lines.getFirst();
            var change = false;
            while (first && first.isEmpty()) {
                var t = this.lines.next(first);
                this.lines.remove(first);
                first = t;
                change = true;
            }
            if (change) {
                this.alignLine();
            }
            if(h< first.getBoxHeight()){
                return this;
            }
            var preLine = null;
            var devideAt = this.lines.select(function(line) {
                var found = (line.getBoxHeight() + line.top > h);
                if (found) {
                    return true;
                }
                if (preLine && preLine.isPagebreakLine()) {
                    return true;
                }
                preLine = line;
            });

            //if devideAt second  it means it will divide the whole para to 0-1 and 1-end
            if (ModelTools.isInDocPara(this.model) && this.model.isWidowControl && this.model.isWidowControl()) {
                //always break if there is a pagebreakline

                if (devideAt && preLine && preLine.isPagebreakLine()) {
                    var newPara = this.splitAtLine(devideAt);
                    return newPara;
                }
                //get firstView and LastView
                var allViews = this.model.getAllViews();
                var viewers, firstView, lastView, linesNum = 0;
                for (var ownerId in allViews) {
                    viewers = allViews[ownerId];
                    firstView = viewers.getFirst();
                    lastView = viewers.getLast();
                }

                var view = firstView;
                while (view) {
                    linesNum += view.lines.length();
                    view = viewers.next(view);
                }
                
                var toForceFix = body && body._forceFix && body._forceFix();

                //you can't split the para if user want to widow control and there are only three lines in one para
                if (linesNum == 3 && !toForceFix)
                    return this;

                //split at second line of current para
                if (firstView && firstView == this && firstView.lines) {
                    var secondLine = firstView.lines.next(firstView.lines.getFirst());
                    //if the first line is devidied from the para, then keep the whole para unsplit
                    if (secondLine && secondLine == devideAt && !toForceFix) {
                        return this;
                    }
                }

                //lastline of current para
                if (lastView && lastView == this && lastView.lines && linesNum != 3) {
                    var lastLine = lastView.lines.getLast();
                    if (lastLine && lastLine == devideAt) {
                        // if it's lastline, we need to divide para at its previous line
                        var devideAt2 = lastView.lines.prev(lastLine);
                        if (devideAt2 == lastView.lines.getFirst())
                        {
                            if (toForceFix)
                            {
                                // ignore.   
                            } 
                            else
                            {
                                devideAt = devideAt2;
                            }
                        }
                        else
                        {
                            devideAt = devideAt2;
                        }
                    }
                }
            }

            if (this.lines.getFirst() == devideAt) {
                // the first line'height is more than the body's height, when the line will be put into the start of body, it should be split.
                if (body && body.getContainer().isEmpty())
                    devideAt = this.lines.next(devideAt);
                else
                    return this;
            }
            if (devideAt) {
                var newPara = this.splitAtLine(devideAt);
                this.markDirtyDOM();
                //			newPara.render();
                return newPara;
            }
            return null;
        },
        _getLinesFirstRun: function(lines) {
            var first = lines.getFirst();
            while (first) {
                var run = first.container.getFirst();
                if (run)
                    return run;

                first = lines.next(first);
            }
        },
        splitAtLine: function(devideAt) {
            if (!devideAt) {
                return null;
            }
            var newPara = new ParagraphView(this.model, this.ownerId, true);
            var newLines = this.lines.divide(devideAt);
            newLines.forEach(function(line) {
                line.parent = newPara;
            });
            newPara.parent = this.parent;
            //var run = newLines.getFirst().container.getFirst();
            var run = this._getLinesFirstRun(newLines);
            if (run) {
                var newRuns = this.container.divide(run);
                newPara._container = this.container._container;
                newPara.container = newRuns;
            } else {
                newPara._container = new Container(newPara);
                newPara.container = new SubContainer(newPara._container, newPara._container.getFirst(), newPara._container.getLast());
            }
            newPara.lines = newLines;
            this.alignLine();
            newPara.alignLine();

            // if the first run of this paragraph is PageBreak, then display list symbol in the new splited paragraph.
            //		if (this.ifBeginWithPageBreak())
            //		{
            //			newPara._createListSymbol();
            //			newPara.preSplitedPara = this;
            //		}

            this.model.addViewer(newPara, this.getOwnerId());
            // devide the footnote record 

            if (this.referredFootNote && !this.referredFootNote.isEmpty()) {
                var divideAtFn = this.referredFootNote.getFirst();
                while (divideAtFn && this.container.inRange(divideAtFn)) {
                    divideAtFn = this.referredFootNote.next(divideAtFn);
                }
                if (divideAtFn) {
                    var newReferredFootNotes = this.referredFootNote.divide(divideAtFn);
                    newPara.referredFootNote = newReferredFootNotes;
                }
            }
            if (this.referredEndNote && !this.referredEndNote.isEmpty()) {
                var divideAtFn = this.referredEndNote.getFirst();
                while (divideAtFn && this.container.inRange(divideAtFn)) {
                    divideAtFn = this.referredEndNote.next(divideAtFn);
                }
                if (divideAtFn) {
                    var newReferredEndNotes = this.referredEndNote.divide(divideAtFn);
                    newPara.referredEndNote = newReferredEndNotes;
                }
            }
            return newPara;

        },

        ifBeginWithPageBreak: function() {
            var run = this.container.getFirst();
            if (!run)
                return false;
            var notBookMarkRun = run;
            // Can't open Story32534_Symbol Bullet.docx file
            while (notBookMarkRun) {
                if (notBookMarkRun.getViewType() == "bookMark")
                    notBookMarkRun = this.container.next(notBookMarkRun);
                //				notBookMarkRun = notBookMarkRun.next();
                else
                    break;
            }

            return notBookMarkRun && notBookMarkRun.getViewType() == "text.PageBreak";
        },

        merge: function(para) {
            // remove the last empty line
            var last = this.lines.getLast();
            while (last && !last.canSelected()) {
                var t = last;
                last = this.lines.prev(last);
                this.lines.remove(t);
            }
            var firstLine = para.lines.getFirst();
            while (firstLine) {
                var next = para.lines.next(firstLine);
                para.lines.remove(firstLine);
                this.lines.append(firstLine);
                firstLine.parent = this;
                firstLine = next;
            }
            this.container.setEnd(this.lines.getLast().container.getLast());
            var fns = para.getReferredFootNote();
            if (fns && !fns.isEmpty()) {
                if (this.referredFootNote && this.referredFootNote !== fns) {
                    this.referredFootNote.appendAll(fns);
                } else {
                    this.referredFootNote = fns;
                }
            }
            if(para.sectId) this.sectId = para.sectId;
            // when merge two paraviews layouted in body with diffrent width 
            if(para.parent != this.parent && para.parent.getWidth() != this.parent.getWidth()){
                this.needRelayout = true ;
            }
            this.markDirtyDOM();
            para.destory();
            this.alignLine();
        },
        mergeTextContent: function() {
            if (this.referredFootNote) {
                this.referredFootNote.removeAll();
                delete this.referredFootNote;
            }
            if (this.referredEndNote) {
                this.referredEndNote.removeAll();
                delete this.referredEndNote;
            }

            this.init(this.getOwnerId());
        },
        reset: function() {
            var parent = this.getParent();
            if (parent) {
                this.mergeTextContent();
                this.releaseLayout();
                this.markDirtyDOM();
                parent.notifyUpdate([this]);
                this.container.forEach(function(run) {
                    run.markRelayout();
                });
            }
        },
        getCSSStyle: function() {
            return this.model.getCSSStyle();
        },
        getStyle: function() {
            return this.model.getStyle();
        },
        getStyleStr: function() {
            if (this.model.ifOnlyContianPageBreak())
                return ""; // Defect 35402

            var style = this.getStyle();
            var str = "position:relative;";
            for (var n in style) {
                str += n + ":" + style[n] + ";";
            }

            var backGround = this.model.getBackgroundColor();
            var backGroundStr = "";

            var border = this.model.getBorder();
            var borderStr = "";
            var paddingStr = "";
            var borderShadowStr = "";

            // calculate width
            var first = this.getFirst();
            if (first)
            //			str += "width:" + (this.getWidth()-first.rightIndent) + "px;";
                str += "width:" + this.getWidth() + "px;"; // Defect 45631
            else
                str += "width:1px;";
            var textProp = this.model.getMergedTextProperty();
            if (!backGround && textProp.getBackgroundColor && textProp.getBackgroundColor())
                backGroundStr = "background: none;";
            else if (backGround) {
                if (backGround.fill == "FFFFFF" && backGround.val == "pct15") //character shading, only have one style,to color:D9D9D9
                    backGroundStr = "background-color:#D9D9D9;";
                else //shading
                    backGroundStr = "background-color:#" + backGround.fill + ";";
            }
            this.initBorder();

            var nextPara = this.model.next();
            var nextBorder = null;
            if (nextPara && nextPara.modelType == this.model.modelType)
                nextBorder = nextPara.getBorder();
            var nextHasShadow = false;

            if (border) {
                var borderClone = lang.clone(border);
                if (this.topBorderSize == 0) delete borderClone["top"];
                if (this.bottomBorderSize == 0)
                    delete borderClone["bottom"];
                else if (borderClone["between"] && !borderClone["bottom"])
                    borderClone["bottom"] = borderClone["between"];
                //between-border --> bottom border
                if (borderClone["between"]) delete borderClone["between"];

                var bdrStyles = this.borderStyles;

                for (var item in borderClone) {
                    var borderType = bdrStyles[borderClone[item].val || "single"];
                    var borderColor = borderClone[item].color || "auto";
                    if (borderColor == "auto")
                        borderColor = "000000";

                    var borderSize = borderClone[item].sz || 0;
                    borderSize = Math.ceil(tools.toPxValue(borderSize));
                    if (borderSize > 0 && borderSize < 1)
                        borderSize = 1; // Border size is 1px;

                    var borderSpace = borderClone[item].space || 0;
                    borderSpace = Math.ceil(tools.PtToPx(borderSpace));

                    var borderShadow = borderClone[item].shadow || 0;
                    if (borderShadow)
                        borderShadowStr = "box-shadow:" + borderSize + "px " + borderSize + "px " + borderSize + "px " + "#000000";
                    if (nextBorder && nextBorder[item] && nextBorder[item].shadow)
                        nextHasShadow = true;

                    borderStr += "border-" + item + ":" + borderSize + "px " + borderType + " #" + borderColor + ";";
                    if (item == "left") {
                        var marginLeft = 0 - borderSpace - borderSize;
                        paddingStr += "margin-left:" + marginLeft + "px;" + "padding-left:" + borderSpace + "px;";
                    } else if (item == "right")
                    ; //paddingStr += "padding-"+item+":"+this.getFirst().rightIndent+"px;";
                    else
                        paddingStr += "padding-" + item + ":" + borderSpace + "px;";
                }

            }
            if (nextHasShadow)
                borderShadowStr = "";
            str += (backGroundStr + borderStr + paddingStr + borderShadowStr);
            str = acf.escapeXml(str, true);
            return str;
        },

        canBePenetrated: function(x, y) {
            if (this.h == 0)
                return false;

            var marginleft = this.getStyle()["margin-left"];
            marginleft = tools.toPxValue(marginleft);
            if (!isNaN(marginleft)) {
                x = x - marginleft;
            }
            var topDelta = this.topBorderSize + this.topBorderSpace;
            y -= topDelta;
            var tarLine = this.lines.select(function(line) {
                if (y <= line.getBoxHeight()) {
                    return true;
                } else {
                    y = y - line.getBoxHeight();
                    return false;
                }
            });
            if (tarLine) {
                return tarLine.canBePenetrated(x, y);
            }

            return true;
        },

        getElementPath: function(x, y, path, options) {
            var marginleft = this.getStyle()["margin-left"];
            marginleft = tools.toPxValue(marginleft);
            if (!isNaN(marginleft)) {
                x = x - marginleft;
            }
            var topDelta = this.topBorderSize + this.topBorderSpace;
            y -= topDelta;
            var tarLine = this.lines.select(function(line) {
                if (y <= line.getBoxHeight() && !line.hasNoTextrun()) {
                    return true;
                } else {
                    y = y - line.getBoxHeight();
                    return false;
                }
            });
            if (tarLine) {
                path.push(tarLine);
                if (!tarLine.getElementPath(x, y, path, options)) {
                    var preLine = this.lines.prev(tarLine);
                    if (preLine) {
                        path.pop();
                        path.push(preLine);
                        preLine.getElementPath(x, y, path, options, true);
                    }
                }
            }
        },
        /*
         * split text
         */
        //	splitParagraph: function( run, index ){
        //		var idx = run.start+index,
        //			newPara = this.model.split( idx );
        //		var doc = this.model.parent;
        //			doc.insertParaAfter( newPara, this.model );
        //	},
        checkBoundary: function(index) {
            var lastrun = this.container.getLast();
            if (!lastrun && index > 0) {
                return false;
            }
            if (lastrun && lastrun.start + lastrun.len < index) {
                return false;
            }
            return true;
        },
        listener: function(message, param) {
            if (message == "update" && this.needUpdate) {
                this.update();
                delete this.needUpdate;
                return;
            }
        },
        releaseLayout: function() {
            //		if (dojo.isIE)
            this.markDirtyDOM();
            //		else
            //			this.domNode && (this.domNode.innerHTML = "");
            this.lines.removeAll();

            // Reset justify run's width
            //if the paragraph is justified, the aligament runs need to be restore the realwidth;
            var isJustify = this.model.directProperty && this.model.directProperty.isJustified();
            if (this._container && isJustify) {
                var allRuns = this._container;
                allRuns.forEach(function(run) {
                    if (run.getViewType() == "text.Run")
                        run.restoreWidth();
                });
            }
        },
        releaseAll: function () {
            this.markDirtyDOM();
            this.lines.removeAll();
            if (this.container) {
                var allRuns = this.container;
                var current = this.container.getFirst();
                var next;
                while (current) {
                    next = this.container.next(current);
                    if (next && next.model == current.model && current.getViewType() == next.getViewType()) {
                        var text = current.getText();
                        // console.info(text)
                        current.merge(next);
                        var text = current.getText();
                        // console.info(text)
                        this.container.remove(next);
                    } else {
                        if (next == null)
                            this.container.setEnd(current);
                        current = next;
                    }
                }
                allRuns.forEach(function (run) {
                    //if (run.getViewType() == "text.Run")
                    run.markRelayout();
                });
            }
            if (this.referredFootNote) this.referredFootNote.forEach(function (fn) {
                fn.releaseAll && fn.releaseAll()
            });
        },
        hasLayouted: function() {
            if (this.lines.length() == 0 && !this.container.isEmpty()) {
                return false;
            }
            return true;
        },

        /**
         * determine whether this paragraph must be at the head of page
         * IMPORTANT: convertion and editor should make sure that the page break is always at the first element in this paragraph
         * 
         */
        hasPageBreak: function() {
            var current = this.container.getFirst();
            while (current) {
                if (current && current.getViewType() == "text.PageBreak" && current.isVisibleInTrack()) {
                    return true;
                }
                current = this.container.next(current);
            }
            return false;
        },
        endsWithPageBreak: function() {
            var container = this.lines;
            var lineBreak = container && container.getLast();
            if (lineBreak && lineBreak.isPagebreakLine()) {
                return true;
            }
            return false;
        },
        getPage: function() {
            var par = this;
            while (par) {
                if (par.getViewType && par.getViewType() == "page.Page") {
                    return par;
                }
                par = par.getParent();
            }
            return null;
        },
        /**
         * when one paragraph is splitted, we should know the endIndex of this paragraph
         */
        getEndIndex: function() {
            var lastrun = this.container.getLast();
            if (lastrun && lastrun.getEnd) {
                return lastrun.getEnd();
            }
            return 0;
        },
        getStartIndex: function() {
            var firstrun = this.container.getFirst();
            if (firstrun && firstrun.getIndex) {
                return firstrun.getIndex();
            }
            return 0;
        },
        //	// check wether the paragraph can be fit with the new size; 
        //	canFitWidth:function(w){
        //		if(this.getContainer().length()>1){
        //			return false;
        //		}else{
        //			var firstLine = this.getContainer().getFirst();
        //			if(firstLine.offsetX>1){
        //				return true;
        //			}
        //		}
        //		return false;
        //	},
        resetLayout: function() {

        },

        getHtmlContent: function() {
        	var content = "";
            this.lines.forEach(function(line) {
            	content += line.domNode.innerHTML;
            });
            return content;
        }
    };
    Model.prototype.viewConstructors[Paragraph.prototype.modelType] = ParagraphView;
    tools.extend(ParagraphView.prototype, new AbstractView());
    tools.extend(ParagraphView.prototype, new BlockView());

    return ParagraphView;
});
