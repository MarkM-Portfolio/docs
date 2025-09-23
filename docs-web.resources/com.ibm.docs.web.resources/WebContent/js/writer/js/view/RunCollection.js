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
    "dojo/_base/lang",
    "concord/i18n/LineBreak",
    "writer/util/ViewTools",
    "writer/global"
], function(declare, lang, LineBreak, ViewTools, global) {

    //--------------------------------------------------
    //! \class  writer.view.RunCollection
    //! \brief  a collection of several continuous runs. this behaviour is like a single run.
    //          which is used to be append to a line as a runs collection.
    //
    //! \author	Hao Yu
    //! \date	4/11/2014
    //! \update note:
    //--------------------------------------------------

    var RunCollection = declare("writer.view.RunCollection", null, {


        //--------------------------------------------------
        // members
        //--------------------------------------------------
        isRunCollection: function() {
            return true;
        },

        _DEBUG: false, //!< only for debug

        _collection: null, //!< collection of runs

        start: 0, //!< text start of whole collection
        len: 0, //!< text len of whole collection

        _boxHeight: 0, //!< max box height of all runs
        w: 0, //!< sum of width of all runs
        h: 0, //!< max height of all runs

        _layouted: false, //!< layouted flag


        //--------------------------------------------------
        //! \brief constructor, runsArray is a dojo array.
        //! \param runsArray: a dojo array of runs
        //--------------------------------------------------
        constructor: function(runsArray) {
            if (!lang.isArray(runsArray)) {
                console.error("runs collection constructor error!");
                return;
            }

            this._collection = runsArray;
        },

        //--------------------------------------------------
        //! \brief	cach some local calculated value
        //! \detail	note: init() must called after layout()
        //--------------------------------------------------
        init: function() {
            this.start = 0;
            this.len = 0;

            this._boxHeight = 0;
            this.w = 0;

            for (var i = 0; i < this._collection.length; ++i) {
                var run = this._collection[i];

                // text start
                if (0 == i)
                    this.start = run.start;

                // text len
                this.len += run.len;

                // boxHeight
                this._boxHeight = Math.max(this._boxHeight, run.getBoxHeight());

                // width
                this.w += run.getWidth();

                // height
                this.h = Math.max(this.h, run.h);
            }

            if (this._DEBUG)
                this._text = this.getText();
        },

        getLength: function() {
            return this._collection.length;
        },

        //--------------------------------------------------
        //! \brief	layout each run in the collection
        //--------------------------------------------------
        layout: function(line) {
            for (var i = 0; i < this._collection.length; ++i) {
                var run = this._collection[i];
                run.layout(line);
            }

            if (this._layouted)
                return;

            this.init();

            this._layouted = true;
        },

        //--------------------------------------------------
        //! \brief get the whole text of the collection
        //--------------------------------------------------
        getText: function() {
            if (this.empty())
                return "";

            var run = this.getFirst();
            var vTools = ViewTools;
            if (!vTools.isTextRun(run) && !vTools.isInlineDrawingObj(run))
                return "";

            var text = run.model.getText(this.start, this.len);
            // TODO Need convert all space to 00a0 in conversion.
            if (text) {
                text = text.replace(/\u0020/g, '\u00a0');
            }
            return text;
        },

        //--------------------------------------------------
        //! \brief	canFit this width?
        //--------------------------------------------------
        canFit: function(w, h, isLinehead) {
            if (1 == this._collection.length) {
                return this._collection[0].canFit(w, h, isLinehead);
            }

            // 1 px offset
            if (Math.abs(this.w - w) > 1 && this.w > w) {
                return false;
            }
            return true;
        },
        
        getRunWidth: function(run)
        {
            // not clear about differece between getWidth and w. 
            // only use getWidth for inline canvas/textbox/image with this for this time.
            if (run.getWidth && global.modelTools.isDrawingObj(run.model) && !global.modelTools.isAnchor(run.model))
                return run.getWidth();
            return run.w;
        },

        //--------------------------------------------------
        //! \brief	set left of all runs
        //--------------------------------------------------
        setLeft: function(left) {
            for (var i = 0; i < this._collection.length; ++i) {
                var run = this._collection[i];
                run.left = left;
                var runW = this.getRunWidth(run);
                left += runW;
            }
        },

        //--------------------------------------------------
        //! \brief	find out which run/where to split
        //--------------------------------------------------
        _findRunFromOffsetW: function(w, forceFit) {
            var tagPos = {
                index: -1,
                runView: null,
                textIndex: -1
            };
            
            var first = this._collection[0];
            for (var i = 0; i < this._collection.length; ++i) {
                var run = this._collection[i];
                var runW = this.getRunWidth(run);
                if (w > runW) {
                    w -= runW;
                } else {
                    tagPos.index = i;
                    tagPos.runView = run;

                    if (ViewTools.isInlineDrawingObj(run)) {
                        var ff = 1 == forceFit || 2 == forceFit || 3 == forceFit;
                        if (ff && (0 == i || (1 == i && (first.len == 0 && first.w == 0))))
                            tagPos.textIndex = 1;
                        else
                            tagPos.textIndex = 0;
                    } else
                        tagPos.textIndex = run.offsetToIndexCache(w, forceFit);

                    return tagPos;
                } 
            }

            return tagPos;
        },

        //--------------------------------------------------
        //! \brief	backward search word break
        //--------------------------------------------------
        _backWardSearchWordBreak: function(indexFrom) {
            var tagPos = {};

            for (var i = indexFrom; i >= 0; --i) {
                var run = this._collection[i];

                if (ViewTools.isInlineDrawingObj(run)) {
                    tagPos.index = i;
                    tagPos.runView = run;
                    tagPos.textIndex = 1;
                    return tagPos;
                }

                var breakPos = run.getLastBreakPoint();
                if (breakPos >= 0) {
                    tagPos.index = i;
                    tagPos.runView = run;
                    tagPos.textIndex = breakPos;
                    return tagPos;
                }
            }

            return null;
        },

        //--------------------------------------------------
        //! \param w: 			width
        //! \param forceFit: 	refer run.js
        //! \return 			tagPos =
        //						{
        //							index,			// index in collection
        //							runView,		// index in collection
        //							textIndex		// index in the run
        //						}
        //--------------------------------------------------
        _getSplitPos: function(w, forceFit) {
            var tagPos = {
                index: -1,
                runView: null,
                textIndex: -1
            };

            if (w <= 0) {
                tagPos.index = -1;
                tagPos.runView = null;
                return tagPos;
            }

            // find run that should be split in the position
            tagPos = this._findRunFromOffsetW(w, forceFit);

            if (!tagPos.runView) {
                // not find run should split, the search previous word break from end.
                var ret = this._backWardSearchWordBreak(this._collection.length - 1);
                if (ret)
                    return ret;
            } else if (ViewTools.isInlineDrawingObj(tagPos.runView)) {
                // no need to find word break
                return tagPos;
            } else if (tagPos.textIndex <= 0) {
                // cannot split at this run, then search previous word break from curretn run
                var ret = this._backWardSearchWordBreak(tagPos.index - 1);
                if (ret)
                    return ret;
                else if (forceFit != 1 && forceFit != 2 && forceFit != 3)
                    tagPos.textIndex = -1;
            } else {
                // in textIndex pos, is a wordbreak?
                var txt = tagPos.runView.getTextOriginal().substr(tagPos.textIndex - 1, 2);
                var pos = LineBreak.findLineBreak(txt, txt.length);
                if (pos > 0)
                    return tagPos;
                else {
                    var ret = this._backWardSearchWordBreak(tagPos.index - 1);
                    if (ret)
                        return ret;
                }
                //		 	1. Find line break in text
                //			var txtOriginal = "";
                //			for(var i = 0; i < tagPos.index; i++)
                //				txtOriginal += this._collection[i].getTextOriginal();
                //			
                //			var curRunText = this._collection[tagPos.index].getTextOriginal();
                //			txtOriginal += curRunText.substr(0, tagPos.textIndex);
                //			
                //			var brkPos = concord.i18n.LineBreak.findLineBreak(txtOriginal, txtOriginal.length);
                //			if (brkPos <= 0)
                //				brkPos = 1;
                //			
                //			// 2. Get view from text position
                //			for(var i = 0; i < this._collection.length; i++)
                //			{
                //				var run = this._collection[i];
                //				if(run.len >= brkPos)
                //				{
                //					tagPos.index = i;
                //					tagPos.runView = run;
                //					tagPos.textIndex = brkPos;
                //					break;
                //				}	
                //				else
                //					brkPos -= run.len;
                //			}	
                //			
                //			return tagPos;
            }

            return tagPos;
        },

        //--------------------------------------------------
        //! \brief	can split?
        //--------------------------------------------------
        canSplit: function(w, h, forceFit) {
            if (1 == this._collection.length) {
                return this._collection[0].canSplit(w, h, forceFit);
            }

            if (w <= 0)
                return false;

            var tagPos = this._getSplitPos(w, forceFit);

            if (w > 0 && this.w > w) {
                if (0 == tagPos.index && tagPos.textIndex <= 0)
                    return false;
                else if (tagPos.textIndex < 0)
                    return false;
            }
            return true;
        },

        //--------------------------------------------------
        //! \brief				split the collection
        //! \param w: 			width
        //! \param forceFit: 	refer to _offsetToIndex() in Run.js
        //--------------------------------------------------
        split: function(w, forceFit) {
            if (w <= 0)
                return null;

            var tagPos = this._getSplitPos(w, forceFit);
            if (tagPos.runView) {
                return this._splitAt(tagPos.index, tagPos.textIndex);
            }
        },

        //--------------------------------------------------
        //! \brief 					do splitting
        //! \param i: 			 	the index of run in collection
        //! \param indexInRun: 		the split offset in run
        //--------------------------------------------------
        _splitAt: function(i, indexInRun) {
            var run = this._collection[i];

            var newRun = run.splitByIndex(indexInRun);
            if (!newRun) {
                if (0 == i)
                    return null;

                // split from here
                var newArray = this._collection.splice(i, this._collection.length - i);
                var newCllct = new RunCollection(newArray);
                this.init();
                newCllct.init();
                return newCllct;
            } else if (newRun == run) {
                if (i == this._collection.length - 1)
                    return this;

                // split at next
                var newArray = this._collection.splice(i + 1, this._collection.length - i - 1);
                var newCllct = new RunCollection(newArray);
                this.init();
                newCllct.init();
                return newCllct;
            } else {
                // split here
                var newArray = [];
                newArray.push(newRun);
                for (var k = i + 1; k < this._collection.length; ++k)
                    newArray.push(this._collection[k]);

                this._collection.splice(i + 1, this._collection.length - i - 1);

                var newCllct = new RunCollection(newArray);
                this.init();
                newCllct.init();
                return newCllct;
            }
        },

        //--------------------------------------------------
        //! \brief 					split by index
        //! \param index: 			the index of run in collection, start with 0
        //--------------------------------------------------
        splitByIndex: function(index) {
            if (index <= 0 || index > this.len) {
                return null;
            } else if (index == this.len) {
                return this;
            }

            // find index in which run
            for (var i = 0; i < this._collection.length; ++i) {
                var run = this._collection[i];
                var startInRun = run.start - this.start;
                if (index >= startInRun && index < startInRun + run.len) {
                    var indexInRun = index - startInRun;
                    return this._splitAt(i, indexInRun);
                }
            }
        },

        //--------------------------------------------------
        //! \brief 	get max boxheight of runs
        //--------------------------------------------------
        getBoxHeight: function() {
            return this._boxHeight;
        },

        //--------------------------------------------------
        //! \brief 	
        //--------------------------------------------------
        initLineSpace: function(line) {
            for (var i = 0; i < this._collection.length; ++i) {
                var run = this._collection[i];
                run.initLineSpace(line);
            }
        },

        forEach: function(callBack) {
            for (var i = 0; i < this._collection.length; ++i) {
                var run = this._collection[i];
                callBack(run, i);
            }
        },

        getCollect: function() {
            return this._collection;
        },

        getCollectNum: function() {
            return this._collection.length;
        },

        getRun: function(index) {
            return this._collection[index];
        },

        getFirst: function() {
            if (!this.empty())
                return this._collection[0];

            return null;
        },

        getLast: function() {
            if (!this.empty())
                return this._collection[this.getCollectNum() - 1];

            return null;
        },

        empty: function() {
            return 0 == this._collection.length;
        },

        // is Equal
        equalTo: function(runCollect) {
            if (this.getCollectNum() != runCollect.getCollectNum())
                return false;

            for (var i = 0; i < this._collection.length; ++i) {
                if (this._collection[i] != runCollect.getRun(i))
                    return false;
            }

            return true;
        }
    });
    return RunCollection;
});
