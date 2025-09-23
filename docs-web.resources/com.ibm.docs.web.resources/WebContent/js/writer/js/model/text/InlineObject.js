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
    "writer/model/Hints",
    "writer/model/text/Hint",
    "writer/model/text/TextRun",
    "writer/track/trackChange",
    "writer/util/ModelTools"
], function(declare, Hints, Hint, TextRun, trackChange, ModelTools) {

    /*
     * This class is a base class, inherited by 
     * writer.model.text.Field
     * and writer.model.text.Link
     * and writer.model.text.AltContent
     */
    var InlineObject = declare("writer.model.text.InlineObject", [TextRun, Hints], {
        constructor: function(json, owner) {
            this.buildRuns();
        },
        //Model methods

        // overlap writer.model.text.TextRun.prototype.resetSplitChars()
        //	resetSplitChars: function() {
        //		this.splitChars = ['\t', '\r'];
        //		if(this.paragraph.directProperty&&this.paragraph.directProperty.getAlign()=='justified'){
        //			this.splitChars.push('\u0020');
        //		}
        //		this.hints.forEach(function(hint){
        //		   	hint.resetSplitChars && hint.resetSplitChars();
        //		});
        //	},
        /**
         * return if it is rich text
         * @returns {Boolean}
         */
        isTextRun: function() {
            return false;
        },
        createRun: function(reset) {
            if (!this.paragraph)
                return null;
            this.buildRuns();
            return this.container;
        },

        next: function() {
            if (!this.parent) {
                return null;
            }
            if (!this.parent.hints) {
                return null;
            }
            return this.parent.hints.next(this);
        },
        previous: function() {
            if (!this.parent) {
                return null;
            }
            if (!this.parent.hints) {
                return null;
            }
            return this.parent.hints.prev(this);
        },

        markDelete: function() {
            this.hints.forEach(function(hint) {
                hint.markDelete && hint.markDelete();
            });
        },

        markInsert: function() {
            this.hints.forEach(function(hint) {
                hint.markInsert();
            });
            this.buildRuns();
        },
        markDirty: function() {
            this.hints.forEach(function(hint) {
                hint.markDirty();
            });
            this.buildRuns();
        },
        /*
         * get hint inside image
         */
        byIndex: function(index, bSearchChild, bLeftSide) {
            var ret = Hint.prototype.byIndex.apply(this, [index, bSearchChild, bLeftSide]);

            if (ret) {
                var child = Hints.prototype.byIndex.apply(this, [index, bSearchChild, bLeftSide]);
                if (child)
                    ret = child;
                else
                    return null;
            }
            return ret;
        },
        //inherited
        setStart: function(start) {
            this.start = start;
            var first = this.firstChild();
            // update children's start
            first && first.setStart(start);
            this.fixStart(first);

            this.markDirty();
        },
        /*
         * set length for this and children hints
         */
        setLength: function(len) {
            this.length = len;
            var child = this.firstChild(),
                next;
            var max = this.start + len;
            while (child) {
                next = child.next();
                if (child.start >= max) {
                    this.hints.remove(child);
                    child.markDelete();
                }
                child = next;
            }
            var last = this.lastChild();
            if (last) {
                last.setLength(max - last.start);
                last.markDirty();
            }

        },
        /**
         * add text lenghth in the index 
         */
        addTextLength: function(len, index) {
            if (index >= this.start && index <= (this.start + this.length)) {
                Hints.prototype.addTextLength.apply(this, [len, index]);
                this.length += len;
                this.checkStartAndLength(this.start, this.length);
                this.markDirty();
                return true;
            }
            return false;
        },
        /*
         * Set paragraph
         */
        setParagraph: function(paragraph) {
            this.paragraph = paragraph;
            this.hints.forEach(function(hint) {
                hint.setParagraph(paragraph);
            });
        },
        /*
         * change length and related hint ( parent hints, next hint )
         */
        changeLength: function(newLength) {
            var oldLength = this.length;
            if (newLength != oldLength) {
                var offset = newLength - oldLength;
                var hints, hint = this;
                do {
                    hint.offset(offset, true);
                    hint = hint.parent;
                } while (hint != this.paragraph);
            }
        },

        /**
         * no list runs for inline object
         */
        createListRuns: function() {

        },
        /**
         * can merge the hint ?
         */
        canMerge: function(hint) {
            return (hint.id == this.id) && (this.id != null)
        },

        canInsert: function() {
            if ((this.isPageNumber && this.isPageNumber()) || (this.isTotalPageNumber && this.isTotalPageNumber()))
                return false;
            return true;
        },
        /**
         * insert hints container
         * @param index
         * @param hints
         */
        insertHints: function(index, hints) {
            var prop, l, hint, that = this,
                oldIndex = index;
            hints.forEach(function(prop) {
                hint = that.byIndex(index, false, true);
                if (!hint) {
                    hint = that.hints.getLast();
                }
                l = prop.length;
                if (!hint) {
                    that.hints.append(prop);
                    hint = prop;
                } else {
                    hint = hint.insertHint(index, prop);
                }
                prop.markInsert && prop.markInsert();
                that.fixStart(hint);
                index += l;
            });
            this.length += index - oldIndex;
        },
        /**
         * insert hint
         * @param index
         * @param hint
         * @param len
         */
        insertHint: function(index, hint) {
            if ((!this.canInsert()) && (index > this.start && index < (this.start + this.length)))
            //can not insert into page number field
            //append it
                index = this.start + this.length;
            if (index >= this.start && index <= (this.start + this.length) && this.canMerge(hint)) {
                //console.log( JSON.stringify( this.toJson()));
                this.insertHints(index, hint.hints);
                //console.log( JSON.stringify( this.toJson()));
                this.markDirty();
                return this;
            }

            if (index > this.start && index < (this.start + this.length)) {
                var targetHint = this.byIndex(index);
                if (!targetHint) {
                    targetHint = this.hints.getLast();
                }
                var len = hint.length;
                hint = targetHint.insertHint(index, hint);
                this.fixStart(hint);
                this.length += len || 0;
                this.checkStartAndLength(this.start, this.length);

                this.markDirty();
                return this;
            } else if (index == this.start || index == (this.start + this.length)) {
                (index == this.start) ? this.parent.hints.insertBefore(hint, this): this.parent.hints.insertAfter(hint, this);
                hint.setStart(index);
                this.checkStartAndLength(this.start, this.length);

                hint.markInsert();
                return hint;
            }
        },
        /**
         * override method of hint
         * remove len from index 
         * @param index
         * @param len
         * @param container
         */
        removeTextLength: function(index, len, container) {
            var inTrack = trackChange.isOn() && ModelTools.isTrackable(this);

            if (!inTrack) {
                if (index <= this.start && (this.start + this.length) <= (index + len)) {
                    container.remove(this);
                    this.markDelete();
                } else {
                    var children = this.hints;
                    children.forEach(function(curProp) {
                        curProp.removeTextLength(index, len, children);
                    });

                    this.start = children.getFirst().start;

                    var lastChild = children.getLast();
                    this.length = lastChild.start + lastChild.length - this.start;
                    this.checkStartAndLength(this.start, this.length);
                    this.markDirty();
                }
            } else {
                var changesData = [];
                var hint = this.hints.getFirst();
                while (hint) {
                    if (hint.removeTextLength) {
                        var changeData = hint.removeTextLength(index, len, this.hints);
                        if (changeData)
                            changesData.push(changeData)
                    }
                    hint = hint.next();
                }
                return changesData;
            }
        }
    });
    return InlineObject;
});
