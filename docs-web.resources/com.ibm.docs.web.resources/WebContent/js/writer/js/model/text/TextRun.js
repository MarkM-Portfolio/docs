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
    "dojo/has",
    "dojo/_base/lang",
    "writer/common/tools",
    "writer/constants",
    "writer/model/Model",
    "writer/model/prop/TextProperty",
    "writer/model/text/Hint",
    "writer/util/FontTools",
    "writer/util/ModelTools",
    "writer/view/Break",
    "writer/view/Tab"
], function(has, lang, tools, constants, Model, TextProperty, Hint, FontTools, ModelTools, Break, Tab) {

    var TextRun = function(json, owner, text) {

        if (text) {
            this.text = text;
            this.start = 0;
            this.length = text.length;
        } else {
            this.start = -1;
            this.length = -1;
        }

        if (!owner) {
            //console.error("The text run must have a parent!");
            this.textProperty = new TextProperty(json && json.style);
            return;
        }
        this.paragraph = owner.paragraph || owner;

        if (this.paragraph && this.paragraph.isTrackBlockGroup) {
            this.rParagraph = this.paragraph.getCurrentPara();
        } else {
            this.rParagraph = this.paragraph;
        }
        this.parent = owner;
        this.revision = false;
        this.comment_selected = false;
        this.clist = [];
        // use Style should removed after import change attributes into style object.
        this.fromJson(json);
        var rTxt = text;
        if(!rTxt && this.length > 0) {
        	rTxt = this.paragraph.getText().substr(this.start, this.length);
        }

        this.txtUnType = (rTxt ? FontTools.getFontTypeByCode(rTxt) : "ascii" );
        this.textProperty = new TextProperty(json && json.style, this.txtUnType && {"txtUnType": this.txtUnType, "owner": this.paragraph});        

        //	this.resetSplitChars();

        // only for debug
        //this._text = this.getText();
    };

    TextRun.prototype = {
        modelType: constants.MODELTYPE.TEXT,
        splitChars: ['\t', '\r'],
        addViewerCallBack: function(view) {

        },
        //	resetSplitChars: function() {
        //		this.splitChars = ['\t', '\r'];
        //		if(this.paragraph.directProperty&&this.paragraph.directProperty.getAlign()=='justified'){
        ////			this.splitChars.push('\u0020');
        //		}
        //	},
        /**
         * return if it is rich text
         * @returns {Boolean}
         */
        isTextRun: function() {
            if (this.br)
                return false;
            else
                return true;
        },
        isPageBreak: function() {
            if (this.br && this.br.type == "page")
                return true;
            else
                return false;
        },
        fromJson: function(jsonSrc) {
            if (jsonSrc) {
                if (this.start < 0) this.start = (jsonSrc.s && parseInt(jsonSrc.s)) || 0; // TODO remove the parseInt after conversion changed.
                if (this.length < 0) this.length = (jsonSrc.l && parseInt(jsonSrc.l)) || 0;

                if (jsonSrc.br) {
                    //for break
                    this.br = jsonSrc.br;
                }
                if (jsonSrc.tab) {
                    // for tab
                    this.tab = jsonSrc.tab;
                }
                if (jsonSrc.ptab) {
                    // for absolute positional tab
                    this.ptab = jsonSrc.ptab;
                }
                this.author = jsonSrc.e_a;
                //defect 40937
                if (jsonSrc.sym) {
                    this._sym = jsonSrc.sym;
                }
                if (jsonSrc.cl) {
                    var cs = pe.lotusEditor.relations.commentService;
                    cs.trySetComment(this, jsonSrc, false);
                }
                this.ch = jsonSrc.ch;
                if (jsonSrc.placeHolder)
                    this.placeHolder = jsonSrc.placeHolder;
            }
        },
        toJson: function(index, length) {
            var jsonData = {};
            if (this.ch && this.ch.length)
                jsonData["ch"] = lang.clone(this.ch);
            if (this.rParagraph && this.rParagraph.ch && this.rParagraph != this.paragraph) {
                // run in block group, should append ch from real paragraph
                jsonData["ch"] = jsonData["ch"] ? jsonData["ch"].concat(this.rParagraph.ch) : lang.clone(this.rParagraph.ch);
            }
            jsonData.style = this.textProperty.toJson();
            if (!jsonData.style) {
                delete jsonData.style;
            } else if (jsonData.style["ime"]) {
                delete jsonData.style["ime"];
            }
            jsonData.rt = constants.RUNMODEL.TEXT_Run;
            jsonData.s = "" + (index == undefined ? this.start : index);
            jsonData.l = "" + (length == undefined ? this.length : length);
            if (this.author)
                jsonData.e_a = this.author;
            if (this.br) {
                jsonData.br = this.br;
            }
            if (this.tab) {
                jsonData.tab = this.tab;
            }
            if (this.ptab) {
                // for absolute positional tab
                jsonData.ptab = this.ptab;
            }
            if (this.clist && this.clist.length > 0) {
                jsonData.cl = [];
                jsonData.cl = this.clist.concat();
                jsonData.cselected = this.comment_selected;
            }
            //defect 40937
            if (this._sym) {
                jsonData.sym = this._sym;
            }
            return jsonData;
        },
        mark: function(tag) {
            if (tag == "inserted")
                delete this.deleted;
            this[tag] = true;
        },
        markDelete: function() {
            this.deleted = true;
        },
        markDirty: function() {
            this.clearCache();
            this.dirty = true;
        },
        markInsert: function() {
            delete this.deleted;
            this.inserted = true;
        },
        createRun: function(reset) {
            if (!this.paragraph)
                return null;

            return this;
        },
        setStyle: function(styleDef, bRemove) {
        	if(ModelTools.isInToc(this) && styleDef.u)
        		styleDef.u = {"val":"none"};
        	this.textProperty.setStyle(styleDef, bRemove);
        	this.textProperty.filterStyle(styleDef, this.paragraph.getMergedTextProperty());
            this.markDirty();
        },
        getStyle: function() {
            return this.textProperty.getStyle();
        },
        //	getComputedStyle:function(){
        //		if(!this.paragraph){
        //			return null;;
        //		}
        //		var parentTextProperty = this.paragraph.getMergedTextProperty();
        //		return this.textProperty.getComputedStyle(parentTextProperty);
        //	},
        /**
         * Need override function.
         */
        equalStyle: function(destProp) {
            if (this.modelType != destProp.modelType)
                return false;

            if (this.br && !destProp.br || !this.br && destProp.br)
                return false;

            if (this.br && destProp.br && this.br.type != destProp.br.type)
                return false;

            return this.textProperty.equalStyle(destProp.textProperty);
        },
        equalChange: function(destProp) {
            if (this.modelType != destProp.modelType)
                return false;

            if (this.ch && !destProp.ch || !this.ch && destProp.ch)
                return false;

            if (!this.ch && !destProp.ch)
                return true;

            if (this.ch.length != destProp.ch.length)
                return false;

            for (var i = 0; i < this.ch.length; i++) {
                if (this.ch[i].t == destProp.ch[i].t && this.ch[i].u == destProp.ch[i].u && this.ch[i].d == destProp.ch[i].d)
                {
                    // continue;
                }
                else
                    return false;
            }
            return true;
        },


        equalComment: function(destProp) {
            if (this.clist.length != destProp.clist.length)
                return false;
            for (var i = 0; i < this.clist.length; i++) {
                var find = false;
                for (var j = 0; j < destProp.clist.length; j++) {
                    if (this.clist[i] == destProp.clist[j]) {
                        find = true;
                        break;
                    }
                }
                if (find == false)
                    return false;
            }
            return true;
        },

        /**
         * split a text run in idx position.
         * return the right run of split result
         * own is the left part.
         *  @param idx
         *  @param len
         *  @returns right text run of split result
         */

        split: function(idx, len) {
            if (len <= 0 || len == null) {
                if (idx == this.start)
                    return this;

                if (idx >= (this.start + this.length))
                    return null;

                var cloneTextRun = this.clone();

                if (this.text) {
                    cloneTextRun.text = this.text.substr(idx - this.start, this.length - 1);
                }
                cloneTextRun.start = idx;
                cloneTextRun.length = this.start + this.length - idx;

                this.parent.hints.insertAfter(cloneTextRun, this);
                cloneTextRun.markInsert();

                if (this.text) {
                    this.text = this.text.substr(0, idx - this.start);
                }
                this.length = idx - this.start;
                this.markDirty();

                return cloneTextRun;
            } else {
                var right = this.split(idx);
                if (right)
                    right = right.split(idx + len);

                return right;
            }

        },
        clone: function() {
            var cloneTextRun = new TextRun();
            cloneTextRun.paragraph = this.paragraph;
            cloneTextRun.parent = this.parent;
            cloneTextRun.rParagraph = this.rParagraph;
            //		cloneTextRun.splitChars = this.splitChars.concat();
            cloneTextRun.author = this.author;
            cloneTextRun.start = this.start;
            cloneTextRun.length = this.length;
            cloneTextRun.textProperty = this.textProperty.clone();
            if(this.textProperty.preserve)
            	cloneTextRun.textProperty.preserve = this.textProperty.preserve;
            cloneTextRun.revision = this.revision;
            cloneTextRun.comment_selected = this.comment_selected;
            if (this.clist.length > 0) {
                cloneTextRun.clist = this.clist.concat();
                pe.lotusEditor.relations.commentService.insertCmtTextRun(cloneTextRun);

            } else
                cloneTextRun.clist = [];
            cloneTextRun.ch = lang.clone(this.ch);

            return cloneTextRun;
        },

        //override preLayout method
        //One text property run may contains more than 1 tabs, split it 
        preLayout: function(ownerId) {
            this._initView(ownerId);
            var text = null;
            if (this.text) {
                text = this.text;
            } else {
                text = this.paragraph.text;
            }
            if (!text) {
                text = "";
            }
            var startIndex = this.start;
            var constructor = this.viewConstructors[this.modelType];

            var run, splitRun /*splitRun includes tab,shift+enter,Alignment */ ;
            var split = this.splitViewByChar(text, startIndex);
            if (split == null) {
                var viewer = new constructor(this, ownerId);
                viewer.preMeasure && viewer.preMeasure();
                this.addViewer(viewer, ownerId);
                return viewer;
            } else {
                var newviews = [];
                var endIndex = split.index;
                var mark_splitted = false;
                while (endIndex >= 0 && endIndex < this.start + this.length) {
                    if (endIndex > startIndex) {
                        run = new constructor(this, ownerId, startIndex, endIndex - startIndex);
                        run.preMeasure && run.preMeasure();
                        this.addViewer(run, ownerId);
                        newviews.push(run);
                        if (mark_splitted) {
                            run.markSplittedFlag && run.markSplittedFlag();
                            mark_splitted = false;
                        }
                    }

                    if (split.constructor) {
                        splitRun = new split.constructor(this, ownerId, endIndex, 1);
                        splitRun.preMeasure && splitRun.preMeasure();
                        this.addViewer(splitRun, ownerId);
                        newviews.push(splitRun);
                        startIndex = endIndex + 1;
                    } else {
                        mark_splitted = true;
                        if (run && run.markSplittedFlag) run.markSplittedFlag();
                        startIndex = endIndex;
                    }
                    split = this.splitViewByChar(text, startIndex);
                    if (!split) {
                        endIndex = -1;
                    } else {
                        endIndex = split.index;
                    }
                }
                if (startIndex < this.start + this.length || (!this.length && startIndex == this.start)) {
                    run = new constructor(this, ownerId, startIndex, this.start + this.length - startIndex);
                    run.preMeasure && run.preMeasure();
                    this.addViewer(run, ownerId);
                    if (mark_splitted) {
                        run.markSplittedFlag && run.markSplittedFlag();
                        mark_splitted = false;
                    }
                    newviews.push(run);
                }
            }
            return newviews;

        },
        // TODO Remove Alignment object
        splitViewByChar: function(text, start) {
            var min = -1;
            var index = text.length;
            for (var i = 0; i < this.splitChars.length; i++) {
                var splitChar = this.splitChars[i];
                var tmp = text.indexOf(splitChar, start);
                if (tmp >= start && tmp < index) {
                    index = tmp;
                    min = i;
                }
            }
            if (min == -1) {
                return null;
            }
            var viewType = null;
            switch (this.splitChars[min]) {
                case '\t':
                    viewType = Tab;
                    break;
                case '\r':
                    viewType = Break;
                    break;
            }

            // undefined constructor is acceptable
            var ret = {
                'constructor': viewType,
                'index': index
            };
            return ret;
        },
        getStyleId: function() {
            return this.textProperty.getStyleId();
        },
        getCSSStyle: function() {
            var str = Model.prototype.getCSSStyle.call(this);
            if (this.clist)
            {
	            var cmtLen = this.clist.length;
	            if (cmtLen > 0) {
	                var commentService = pe.lotusEditor.relations.commentService;
	                str += commentService.getCSSString(this.clist);
	            }
            }
            str += pe.lotusEditor.indicatorManager.getIndicatorClass(this);

            return str;
        },
        /**
         * @returns Docuemnt's default character style
         */
        getDefaultStyle: function() {
            if (this.getStyleId())
                return null;
            return pe.lotusEditor.getDefaultTextStyle();
        },
        deleteSel: function() {
            this.markDelete();
            //delete the comment
            //	if(this.clist.length>0) {
            //pe.lotusEditor.relations.commentService.removeCommentRef(this);
            //	}
        },
        getBorder: function() {
            if (this.textProperty) {
                var border = this.textProperty.getBorder();
                return border;
            }
        },
        /**
         * can merge
         */
        canMerge: function(run) {
            // defect 43367
            if (this.tab || this.ptab || run.tab || run.ptab) {
                return false;
            }
            if (this.rParagraph && run.rParagraph && this.rParagraph != run.rParagraph)
                return false;
            var r = (run.isTextRun && run.isTextRun() && this.isTextRun() && this.equalStyle(run) && this.equalComment(run) && this.equalChange(run));
            // author same or it is empty text run
            if (r && (run.author == this.author || this.length == 0))
                return true;
            return false;
        },
        /**
         * add text length
         * @param len
         * @param index
         */
        addTextLength: function(len, index) {
            if (this.isTextRun() && index >= this.start && index <= (this.start + this.length)) {
                this.length += len;
                this.markDirty();
                return true;
            }
            return false;
        },
        /**
         * Model function
         * override this function to avoid merging blue color and underline properties of hyper link 
         * in table of contents model.
         * @returns
         */
        getMergedTextProperty: function() {
            Model.prototype.getMergedTextProperty.apply(this);
            if (this.mergedTextProperty && ModelTools.isInToc(this)) {
                if (!this.textProperty._decoration.u)
                    this.mergedTextProperty.setStyle({
                        "u": "none"
                    }, true);
                if (!this.textProperty.style["color"])
                    this.mergedTextProperty.setStyle({
                        "color": ""
                    }, true);
            }
            return this.mergedTextProperty;
        },
        getCh: function() {
            if (!has("trackGroup"))
                return Model.prototype.getCh.apply(this);
            if (!this.rParagraph || !this.rParagraph.ch || this.rParagraph.ch.length == 0)
                return this.ch;
            var realCh = this.ch || [];
            realCh = realCh.concat(this.rParagraph.ch);
            return realCh;
        }
    };
    tools.extend(TextRun.prototype, new Model());
    tools.extend(TextRun.prototype, new Hint());
    return TextRun;
});
