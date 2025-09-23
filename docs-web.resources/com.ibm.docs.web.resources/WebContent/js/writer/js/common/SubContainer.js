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
    "dojo/_base/declare"
], function(declare) {

    var SubContainer = declare("writer.common.SubContainer", null, {
        constructor: function(container, start, end) {
            this._container = container;
            this._start = start;
            this._end = end;
        },
        isContainer: true,
        append: function(obj) {
            if (!this._start) {
                this._start = obj;
            }
            //		 this.len ++;
            if (!this._container.contains(obj)) {
                this._container.insertAfter(obj, this._end);
            }
            this._end = obj;
            //		 if (!this._container.contains(obj)){
            //			 throw "Exception, the parent container should contain this obj!!!";
            //		 }
        },
        appendAll: function(container) {
            console.warn("unsupported method!");
        },
        merge: function(container) {
            console.warn("unsupported method!");
        },
        insertAfter: function(obj, target) {
            this._container.insertAfter(obj, target);
            if (target == this._end) {
                this._end = obj;
            }
            //		 this.len ++;
        },
        insertBefore: function(obj, target) {
            this._container.insertBefore(obj, target);
            if (this._start == target) {
                this._start = obj;
            }
            //		this.len ++;
        },
        insertAllAfter: function(container, target) {
            console.warn("unsupported method!");
        },
        insertAllBefore: function(container, target) {
            console.warn("unsupported method!");
        },
        removeAll: function() {
            console.warn("unsupported method!");
        },
        remove: function(obj, noDelete) {
            if (this._start == this._end && obj == this._start) {
                this._start = null;
                this._end = null;
            } else {
                if (this._start == obj) {
                    this._start = this.next(obj);
                }
                if (this._end == obj) {
                    this._end = this.prev(obj);
                }
            }

            !noDelete && this._container.remove(obj);
        },
        replace: function(obj, target) {
            console.warn("unsupported method!");
        },
        divide: function(obj) {
            var s = this.prev(obj);
            if (s) {
                var ret = new SubContainer(this._container, obj, this._end);
                this._end = s;
                return ret;
            } else if (this._start == obj) {
                return this;
            } else {
                return null;
            }
            //		 this.len  = this._container.indexOf(this._end) - this._container.indexOf(this._start)+1;
        },
        setStart: function(start) {
            this._start = start;
            if (!this._end) {
                this._end = this._start;
            }
        },
        setEnd: function(end) {
            this._end = end;
            if (!this._start) {
                this._start = this._end;
            }
        },
        setContainer: function(container) {
            this._container = container;
        },
        moveFoward: function() {
            var s = this._container.prev(this._start);
            if (s) {
                this._start = s;
                //			this.len ++;
            } else {
                console.warn("can not move foward!");
            }
        },
        moveBack: function() {
            var s = this._container.next(this._end);
            if (s) {
                this._end = s;
                //			this.len ++;
            } else {
                console.warn("can not move back!");
            }
        },
        removeFirst: function() {
            if (this._start) {
                this._start = this.next(this._start);
                //			this.len --;
            }
        },
        removeEnd: function() {
            if (this._end) {
                this._end = this.prev(this._end);
                //			this.len --;
            }
        },
        indexOf: function(obj) {
            return this._container.indexOf(obj) - this._container.indexOf(this._start);
        },
        next: function(obj) {
            if (obj == this._end) {
                return null;
            }
            var next = this._container.next(obj);
            return next;
        },
        prev: function(obj) {
            if (obj == this._start) {
                return null;
            }
            return this._container.prev(obj);
        },
        getFirst: function() {
            if (this._start) {
                return this._start;
            }
            return null;
        },
        getLast: function() {
            if (this._end) {
                return this._end;
            }
            return null;
        },
        contains: function(obj) {
            return this._container.contains(obj);
        },
        inRange: function(obj) {
            if (!this.contains(obj)) {
                return false;
            }
            if (this._end == obj) {
                return true;
            }
            var t = this._start;
            while (t) {
                if (t == obj) {
                    return true;
                }
                t = this.next(t);
            }
        },
        isEmpty: function() {
            return this._start == null || this._end == null;
        },
        length: function() {
            if (this.isEmpty()) {
                return 0;
            }
            return this._container.stepLength(this._start, this._end);
        },
        stepLength: function(start, end) {
            if (this.isEmpty()) {
                return 0;
            }
            return this._container.stepLength(this._start, this._end);
        },
        forEach: function(callback) {
            var node = this._start;
            while (node) {
                var obj = this.next(node);
                var ret = callback(node);
                if (ret === false)
                    break;
                if (obj) {
                    node = obj;
                } else {
                    break;
                }
            }
        },
        select: function(callback) {
            var node = this._start;
            while (node) {
                if (callback(node)) {
                    return node;
                }
                var obj = this.next(node);
                if (obj) {
                    node = obj;
                } else {
                    break;
                }
            }
            return null;
        },
        getByIndex: function(idx) {
            var node = this._start;
            for (var i = 0; i < idx; i++) {
                node = this.next(node);
                if (node == null) {
                    return null;
                }
            }
            return node;
        },
        reset: function() {
            this._start = null;
            this._end = null;
            //		this.len=0;
        },
        isValid: function() {
            return this.contains(this._start) || this.contains(this._end);
        }



    })

    return SubContainer;
});
