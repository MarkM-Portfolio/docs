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
    "dojo/_base/lang"
], function(declare, lang) {

    var Space = declare("writer.common.Space", null, {
        _INFINITE: 4294967295,

        constructor: function(w, h, x, y, spaceOwner) {
            this._occupied = null;
            this.init(w, h, x, y, spaceOwner);
        },

        init: function(w, h, x, y, spaceOwner) {
            this._occupied = []; // sort by y
            this._occupiedSortX = []; // sort by x
            this._contained = []; // only for space track, it would not occupy real space
            this._children = []; // contain all spaces reference.
            this.w = w;
            this.h = h;
            this.x = x || 0;
            this.y = y || 0;
            this.owner = spaceOwner || null; // The space owner object
        },
        toString: function() {
            var str = "x=" + this.x.toFixed(2) + ", y=" + this.y.toFixed(2) + ", w=" + this.w.toFixed(2) + ", h=" + this.h.toFixed(2);

            var id = this.owner && this.owner.model && this.owner.model.id;
            str += ", ownerId=" + (id ? id : "null");

            return str;
        },
        printLog: function(title) {
            var prefix1 = "| ";
            var prefix2 = "|-------- ";

            console.log("=====================" + title + "========================");
            console.log(prefix1 + this.toString());

            var done = false;
            for (var i in this._occupied) {
                if (!done) {
                    console.log(prefix1 + "occupied children");
                    done = true;
                }
                console.log(prefix2 + this._occupied[i].toString());
            }

            done = false;
            for (var i in this._contained) {
                if (!done) {
                    console.log(prefix1 + "contained children");
                    done = true;
                }
                console.log(prefix2 + this._contained[i].toString());
            }

            console.log("=====================================================");
        },
        forEachOccupied: function(callback, param) {
            for (var i in this._occupied) {
                callback(this._occupied[i], i, param);
            }
        },
        forEachContained: function(callback, param) {
            for (var i in this._contained) {
                callback(this._contained[i], i, param);
            }
        },
        clone: function() {
            var newSpace = new Space(this.w, this.h, this.x, this.y, this.owner);
            for (var i in this._occupied) {
                var o = this._occupied[i];
                var rect = new Space(o.w, o.h, o.x, o.y);
                newSpace.occupyBySpace(rect);
            }
            return newSpace;
        },
        _numberEqual: function(n1, n2) {
            return Math.abs(n1 - n2) <= 1;
        },
        equals: function(space) {
            if (!this._numberEqual(this.x, this.x) || !this._numberEqual(this.y, space.y) || !this._numberEqual(this.w, space.w) || !this._numberEqual(this.h, space.h) || this._occupied.length != space._occupied.length) {
                return false;
            }
            for (var i in this._occupied) {
                var o = this._occupied[i];
                if (space.indexOfOccupied(o) < 0) {
                    return false;
                }
            }
            return true;
        },
        equals2: function(space, h) {
            if (this.h < h || space.h < h) {
                return false;
            }
            if (this._occupied.length != space._occupied.length) {
                return false;
            }
            for (var i = 0; i < this._occupied.length; i++) {
                var o1 = this._occupied[i];
                var o2 = space._occupied[i];
                if (!o1.equals(o2)) {
                    return false;
                }
                if (o1.h + o1.y - this.y < h) {
                    return false;
                }
            }
            return true;
        },
        equals3: function(space) {
            if (!space) {
                return false;
            }

            if (this._occupied.length == 0 && space._occupied.length == 0) {
                return true;
            }

            if (!this._numberEqual(this.h, space.h) || !this._numberEqual(this.w, space.w) || this._occupied.length != space._occupied.length) {
                return false;
            }
            for (var i = 0; i < this._occupied.length; i++) {
                var o1 = this._occupied[i];
                var o2 = space._occupied[i];
                if (!o1.equals(o2)) {
                    return false;
                }
            }
            return true;
        },
        occupy: function(w, h, x, y) {
            var newSpace = new Space(w, h, x, y);
            this._occupied.push(newSpace);
            this._occupiedSortX.push(newSpace);
            this._sortOccupied();
            return newSpace;
        },
        occupyBySpace: function(space, notAffectSpace) {
            this._insertChildren(space);

            if (notAffectSpace) {
                this._contained.push(space);
            } else {
                this._occupied.push(space);
                this._occupiedSortX.push(space);
                this._sortOccupied();
            }

        },

        release: function(w, h, x, y) {
            var index = this.indexOfOccupied({
                x: x,
                y: y,
                w: w,
                h: h
            });

            if (index >= 0) {
                this._occupied.splice(index, 1);
            }
        },
        releaseSpace: function(space) {
            /*
            var index = this.indexOfOccupied(space);
            while (index >= 0) {
                this._occupied.splice(index, 1);
                index = this.indexOfOccupied(space);
            }
            */

            // clear obj space uncleared before
            if (space.getOwner && space.getOwner()) {
                var id = space.getOwner().model.id;
                this.releaseSpaceByModelId(id);
            }
        },
        releaseSpaceByModelId: function(id) {
            index = this.indexOfOccupiedByModelID(id);
            while (index >= 0) {
                this._occupied.splice(index, 1);
                index = this.indexOfOccupiedByModelID(id);
            }

            index = this.indexOfOccupiedSortXByModelID(id);
            while (index >= 0) {
                this._occupiedSortX.splice(index, 1);
                index = this.indexOfOccupiedSortXByModelID(id);
            }

            index = this.indexOfContainedByModelID(id);
            while (index >= 0) {
                this._contained.splice(index, 1);
                index = this.indexOfContainedByModelID(id);
            }

            index = this.indexOfChildrenByModelID(id);
            while (index >= 0) {
                this._children.splice(index, 1);
                index = this.indexOfChildrenByModelID(id);
            }
        },
        releaseAll: function() {
            this._occupied = [];
            this._occupiedSortX = [];
            this._contained = [];
            this._children = [];
        },
        indexOfOccupied: function(rect) {
            var index = -1;
            for (var i in this._occupied) {
                var o = this._occupied[i];
                if (this._numberEqual(o.x, rect.x) && this._numberEqual(o.y, rect.y) && this._numberEqual(o.w, rect.w) && this._numberEqual(o.h, rect.h)) {
                    index = i;
                    break;
                }
            }

            return index;
        },
        indexOfOccupiedByModelID: function(id) {
            var index = -1;
            for (var i in this._occupied) {
                var o = this._occupied[i];
                if (id == o.getOwner().model.id) {
                    index = i;
                    break;
                }
            }

            return index;
        },
        indexOfOccupiedSortXByModelID: function(id) {
            var index = -1;
            for (var i in this._occupiedSortX) {
                var o = this._occupiedSortX[i];
                if (id == o.getOwner().model.id) {
                    index = i;
                    break;
                }
            }

            return index;
        },
        indexOfContainedByModelID: function(id) {
            var index = -1;
            for (var i in this._contained) {
                var o = this._contained[i];
                if (id == o.getOwner().model.id) {
                    index = i;
                    break;
                }
            }

            return index;
        },
        indexOfChildrenByModelID: function(id) {
            var index = -1;
            for (var i in this._children) {
                var o = this._children[i];
                if (id == o.getOwner().model.id) {
                    index = i;
                    break;
                }
            }

            return index;
        },

        // TODO: x and width
        subSpace: function(subParam) {
            var newSpace = null;
            var spaceWidth = this.w;
            var spaceHeight = this.h;

            if (subParam && !isNaN(subParam.y) && subParam.y > 0 && (subParam.y < spaceHeight || spaceHeight < 0)) {
                var rects = this._selectOccupiedY(subParam.y);
                var newSpaceHeight = spaceHeight > 0 ? spaceHeight - subParam.y : spaceHeight;
                newSpace = new Space({
                    w: spaceWidth,
                    h: newSpaceHeight
                });
                spaceHeight = newSpaceHeight;

                for (var i in rects.below) {
                    var rect = lang.clone(rects.below[i]);
                    rect.y = recty - subParam.y;
                    newSpace.occupy(rect);
                }

                for (var i in rects.cross) {
                    var rect = lang.clone(rects.cross[i]);
                    rect.h = rect.h + rect.top() - subParam.y;
                    rect.y = 0;
                    newSpace.occupy(rect);
                }
            } else {
                newSpace = this.clone();
            }

            if (subParam && subParam.x > 0 && (subParam.x < spaceWidth || spaceWidth < 0)) {
                var rects = newSpace._selectOccupiedX(subParam.x);
                var newSpaceWidth = spaceWidth > 0 ? spaceWidth - subParam.x : spaceWidth;
                newSpace = new Space(newSpaceWidth, spaceHeight);
                spaceWidth = newSpaceWidth;
                for (var i in rects.right) {
                    var rect = lang.clone(rects.right[i]);
                    rect.x = rect.x - subParam.x;
                    newSpace.occupy(rect);
                }

                for (var i in rects.cross) {
                    var rect = lang.clone(rects.cross[i]);
                    rect.w = rect.w + (rect.left - subParam.x);
                    rect.x = 0;
                    newSpace.occupy(rect);
                }
            }

            if (subParam && subParam.h > 0 && subParam.h < newSpace.h) {
                var rects = newSpace._selectOccupiedY(subParam.h);
                newSpace = new Space(this.getWidth(), subParam.h);

                for (var i in rects.above) {
                    var rect = lang.clone(rects.above[i]);
                    newSpace.occupy(rect);
                }
                for (var i in rects.cross) {
                    var rect = lang.clone(rects.cross[i]);
                    rect.h = rect.h + (subParam.h - rect.bottom());
                    newSpace.occupy(rect);
                }
            }
            return newSpace;
        },

        _selectOccupiedX: function(x) {
            var left = [];
            var cross = [];
            var right = [];
            var result = {
                left: left,
                cross: cross,
                right: right
            };

            for (var i in this._occupied) {
                var rect = this._occupied[i];
                if (rect.w > 0 && rect.h > 0) {
                    if (rect.x <= x) {
                        if (rect.x + rect.w <= x) {
                            left.push(rect);
                        } else {
                            cross.push(rect);
                        }
                    } else {
                        right.push(rect);
                    }
                }
            }

            return result;
        },

        _sortOccupied: function() {
            var that = this;

            // sort by y
            var _sortByY = function(oa, ob) {
                if (that._numberEqual(oa.y, ob.y)) {
                    return oa.x - ob.x;
                }
                return oa.y - ob.y;
            };
            this._occupied.sort(_sortByY);

            // sort by x
            var _sortByX = function(oa, ob) {
                if (that._numberEqual(oa.x, ob.x)) {
                    return oa.y - ob.y;
                }
                return oa.x - ob.x;
            };
            this._occupiedSortX.sort(_sortByX);

        },

        getOwnerRelHeight: function() {
            if (!this.owner)
                return 1000;

            return this.owner.getRelativeHeight();
        },

        isOwnerBehindDoc: function() {
            if (!this.owner)
                return false;

            return this.owner.isBehindDoc();
        },

        setOwnerZIndex: function(z) {
            if (!this.owner)
                return;

            return this.owner.setZIndex(z);
        },

        // if A.z-index < B.z-index, then return < 0
        _compSpaceByIndex: function(spaceA, spaceB) {
            var isBehindDocA = spaceA.isOwnerBehindDoc();
            var isBehindDocB = spaceB.isOwnerBehindDoc();

            if (isBehindDocA != isBehindDocB)
                return isBehindDocA ? -1 : 1;
            else
                return spaceA.getOwnerRelHeight() - spaceB.getOwnerRelHeight();
        },

        _insertChildren: function(space) {
            if (!space.owner) {
                this._children.splice(0, 0, space);
                return;
            }

            // insert to sorted array by z-index
            var k = this._children.length;
            for (var i = 0; i < this._children.length; ++i) {
                if (this._compSpaceByIndex(space, this._children[i]) > 0) {
                    k = i;
                    break;
                }
            }

            this._children.splice(k, 0, space);

            // partial add zindex
            zPre = k > 0 ? this._children[k - 1].owner.getZIndex() : null;
            zNxt = k < this._children.length - 1 ? this._children[k + 1].owner.getZIndex() : null;

            var zStart;
            if (!space.isOwnerBehindDoc()) {
                if (!zNxt || zNxt < 0)
                    zStart = 1000;
                else
                    zStart = zNxt + 5;

                for (var j = k; j >= 0; --j) {
                    this._children[j].setOwnerZIndex(zStart);
                    zStart += 5;
                }
            } else {
                if (!zPre || zPre > 0)
                    zStart = -1000;
                else
                    zStart = zPre - 5;

                for (var j = k; j < this._children.length; ++j) {
                    this._children[j].setOwnerZIndex(zStart);
                    zStart -= 5;
                }
            }
        },

        shrink: function(w, h) {
            if (w > this.w || h > this.h) {
                console.error("something error!");
                return null;
            }
            var ret = this.mallocSpace(this.x, this.y, w, h);
            for (var i = 0; i < ret._occupied.length; i++) {
                var o = ret._occupied[i];
                o.x = o.x + this.x;
                o.y = o.y + this.y;
            }

        },
        mallocSpace: function(x, y, w, h) {
            if (x < this.x || y < this.y) {
                console.error("something error!");
                return null;
            }
            if (!w) {
                w = this.w - (x - this.x);
            }
            if (!h) {
                //h = this.h - (y-this.y);
                h = this._INFINITE;
            }
            if (w <= 0 || h <= 0) {
                console.log("no space available");
                return null;
            }
            var ret = new Space(w, h, x, y);
            for (var i = 0; i < this._occupied.length; i++) {
                var o = this._occupied[i];
                var o1 = ret._getIntersection(o);
                if (o1) {
                    ret.occupyBySpace(o1);
                }
            }
            return ret;
        },
        _getIntersection: function(space) {
            var x = Math.max(this.x, space.x);
            var y = Math.max(this.y, space.y);
            var w = 0;
            var h = 0;
            if (this.x + this.w < space.x + space.w) {
                w = this.x + this.w - x;
            } else if (this.x < space.x + space.w) {
                w = space.x + space.w - x;
            }
            if (w <= 0) {
                return null;
            }

            if (this.y + this.h < space.y + space.h) {
                h = this.y + this.h - y;
            } else if (this.y < space.y + space.h) {
                h = space.y + space.h - y;
            }
            if (h <= 0) {
                return null;
            }
            return new Space(w, h, x - this.x, y - this.y);
        },

        /**
         * 
         * @param y the top value, 
         * @param h the height of required space
         * @returns the next y value
         */
        getNextSpaceY: function(y, h) {

            if (!h) {
                h = 0;
            }
            if (!y) {
                y = 0;
            }

            var tempSpace = new Space(this.w, h, 0, y);
            for (var i in this._occupied) {
                var rect = this._occupied[i];
                if (rect.w > 0 && rect.h > 0) {
                    if (rect.x > 1 || rect.x + rect.w + 1 < this.w) {
                        /* first case
                          +-------------------+
                          |       this        |
                          |    +---------+    |
                          |    |occupied |    |
                          |    +---------+    |
                        +--------+            |
                        |occupied|            |
                        +--------+          +--------+
                          |                 |occupied|
                          |                 +--------+
                          +-------------------+
                        */

                        //this is a square area
                        tempSpace.occupy(rect.w, rect.h, rect.x, rect.y);
                    } else {
                        /* second case
                          +----------+
                          |   this   |
                        +---------------+
                        |   occupied    |
                        +---------------+
                          |          |
                        +---------------+
                        |   occupied    |
                        +---------------+
                          |          |
                          |          |
                          +----------+
                        */
                        if (y < rect.y + rect.h) {
                            if (rect.y > tempSpace.y + tempSpace.h) {
                                tempSpace.h = rect.y - tempSpace.y;
                                return tempSpace;
                            } else if (tempSpace.y >= rect.y) {
                                //top-bottom area
                                tempSpace.y = rect.y + rect.h;
                            } else if (rect.y - tempSpace.y < tempSpace.h) {
                                // space not enough
                                tempSpace.y = rect.y + rect.h;
                            }
                        }
                    }
                }
            }
            tempSpace.h = this.h - tempSpace.y;
            return tempSpace;
        },

        getNextSpaceX: function(x, height) {
            var tempSpace = new Space(this.w - x, this.h, x, this.y);
            var nextX = x;
            for (var i in this._occupiedSortX) {
                var rect = this._occupiedSortX[i];
                var bNotInYRange = rect.y + rect.h <= this.y || this.y + height <= rect.y
                if (rect.w > 0 && !bNotInYRange) {
                    if (rect.x > nextX) {
                        tempSpace.x = nextX;
                        tempSpace.w = rect.x - nextX;
                        return tempSpace;
                    }

                    if (rect.x + rect.w > nextX) {
                        nextX = rect.x + rect.w;
                    }
                }
            }
            tempSpace.x = nextX;
            tempSpace.w = this.w - tempSpace.x;
            return tempSpace;
        },


        /* 
          +-------------------+
          |       this        |
          |    +---------+    |
          |    |occupied |    |
          |    +---------+    |
        +--------+            |
        |occupied|            |
        +--------+          +--------+
          |                 |occupied|
          |                 +--------+  ---------BottomFlatY
          +-------------------+
        */
        getBottomFlatY: function() {
            if (0 == this._occupied.length)
                return this.y;

            lastOccupied = this._occupied[this._occupied.length - 1];
            return lastOccupied.y + lastOccupied.h;
        },
        _selectOccupiedY: function(y) {
            var above = [];
            var cross = [];
            var below = [];
            var result = {
                above: above,
                cross: cross,
                below: below
            };

            for (var i in this._occupied) {
                var rect = this._occupied[i];
                if (rect.w > 0 && rect.h > 0) {
                    if (rect.y <= y) {
                        if (rect.y + rect.h <= y) {
                            above.push(rect);
                        } else {
                            cross.push(rect);
                        }
                    } else {
                        below.push(rect);
                    }
                }
            }

            return result;
        },

        checkRect: function(rect) {
            var result = [];

            for (var i in this._occupied) {
                if (this.intersects(rect)) {
                    result.push(this._occupied[i]);
                }
            }

            return result;
        },
        getWidth: function() {
            return this.w;
        },
        getHeight: function() {
            return this.h;
        },
        setWidth: function(w) {
            this.w = w;
        },
        setHeight: function(h) {
            this.h = h;
        },
        intersects: function(rect) {
            if (rect.x >= (this.x + this.w) || (rect.x + rect.w) <= this.x || rect.y >= (this.y + this.h) || (rect.y + rect.h) <= this.y) {
                return false;
            }

            return true;
        },
        containV: function(rect) {
            // Defect 42615, the anchored object y is negative value.
            return (rect.y < 0 || rect.y >= this.y) && rect.y + rect.h <= this.y + this.h;
        },
        setOwner: function(spaceOwner) {
            this.owner = spaceOwner;
        },
        getOwner: function() {
            return this.owner;
        }
    });

    return Space;
});
