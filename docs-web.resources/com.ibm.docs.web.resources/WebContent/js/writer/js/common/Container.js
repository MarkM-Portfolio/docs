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
    "dojo/has",
    "writer/constants"
], function(declare, lang, has, constants) {

    var Container = declare("writer.common.Container", null, {
        isContainer: true,
        constructor: function(owner) {
            this.owner = owner;
            if (!has("chrome")) {
                this.first = null;
                this.last = null;
                this.len = 0;
                this.adapteLen = 0;
                this.nodes = {};
            } else {
                this.nodes = [];
            }
        }
    });

    var _$baseId = 1;

    // for some legacy reason, the container have differnt implement for different browsers.
    if (!has("chrome")) {
        lang.extend(Container, {
            createNode: function(obj) {
                if (!obj.refId) {
                    //			var id = obj.getId&&obj.getId()||obj.id;
                    //			if(id){
                    //				obj.refId = "a"+ id;
                    //				if(!isNaN(id))
                    //					_$baseId = Math.max(_$baseId, id);
                    //				if(this.nodes[obj.refId]){
                    //					obj.refId = "a"+(++_$baseId);
                    //				}
                    //			}else{
                    obj.refId = "a" + (++_$baseId); // For performance reason, use unique number to replace UUID.
                    //			}
                }
                return {
                    "next": null,
                    "pre": null,
                    "content": obj
                };
            },
            //	getById:function(id){
            //		var refId = "a"+id;
            //		if(this.nodes[refId]){
            //			return this.nodes[refId].content;
            //		}
            //		return null;
            //	},
            append: function(obj) {
                //		if (this.contains(obj)){
                //			console.log("WARNING: obj is already in container when append");
                //			return;
                //		}
                //if (!obj){
                //	console.log("WARNING: obj is null when append");
                //}
                var node = this.createNode(obj);
                this.len++;
                this.adapteLen += (obj && obj.getModelLen && obj.getModelLen()) || 1;
                if (this.last) {
                    this.last.next = node;
                    node.pre = this.last;
                } else {
                    this.first = node;
                }
                this.nodes[obj.refId] = node;
                this.last = node;
            },
            appendFront: function(obj) {
                var first = this.getFirst();

                if (first)
                    this.insertBefore(obj, first);
                else
                    this.append(obj);
            },
            appendAll: function(container) {
                if (container.isContainer && container.len > 0) {
                    var obj = container.first;
                    while (obj) {
                        this.append(obj.content);
                        obj = obj.next;
                    }

                } else {
                    for (var i = 0; i < container.length; i++) {
                        this.append(container[i]);
                    }
                }
            },
            appendAllFront: function(container) {
                var first = this.getFirst();

                if (first)
                    this.insertAllBefore(container, first);
                else
                    this.appendAll(container);
            },
            merge: function(container) {
                if (this.len == 0) {
                    this.first = container.first;
                    this.last = container.last;
                    this.len = container.len;
                    this.adapteLen = container.adapteLen;
                    this.nodes = container.nodes;

                } else {
                    this.len += container.len;
                    this.adapteLen += container.adapteLen;
                    this.last.next = container.first;
                    container.first.pre = this.last;
                    this.last = container.last;
                    var node = container.first;
                    while (node) {
                        this.nodes[node.content.refId] = node;
                        node = node.next;
                    }
                }
                container.removeAll();
            },
            insertAfter: function(obj, target) {
                if (!obj) {
                    console.log("WARNING: obj is null when insertAfter");
                }
                if (!target) {
                    console.log("WARNING: no target in insert after");
                    this.append(obj);
                    return;
                }
                this.len++;
                this.adapteLen += (obj && obj.getModelLen && obj.getModelLen()) || 1;
                var node = this.createNode(obj);

                if (target.refId) target = this.nodes[target.refId];

                node.pre = target;
                node.next = target.next;
                if (!target.next) {
                    this.last = node;
                } else {
                    target.next.pre = node;
                }
                target.next = node;
                this.nodes[obj.refId] = node;
            },
            insertBefore: function(obj, target) {
                if (!obj) {
                    console.log("WARNING: obj is null when insertBefore");
                }
                var node = this.createNode(obj);
                if (target && target.refId) target = this.nodes[target.refId];
                if (!target) {
                    console.log("WARNING: no target in insert before");
                    this.len++;
                    this.adapteLen += (obj && obj.getModelLen && obj.getModelLen()) || 1;
                    node.next = this.first;
                    if (this.first) {
                        this.first.pre = node;
                    }
                    this.first = node;
                } else if (target.pre) {
                    target = target.pre;
                    this.insertAfter(obj, target);
                    return;
                } else {
                    this.len++;
                    this.adapteLen += (obj && obj.getModelLen && obj.getModelLen()) || 1;
                    this.first = node;
                    node.next = target;
                    target.pre = node;
                }
                this.nodes[obj.refId] = node;
            },
            insertAllAfter: function(container, target) {
                if (target.refId) target = this.nodes[target.refId];
                if (!target.next) {
                    this.last = container.last;
                } else {
                    target.next.pre = container.last;
                }
                var next = target.next;
                target.next = container.first;
                container.first.pre = target;

                this.len += container.len;
                this.adapteLen += container.adapteLen;
                var node = container.first;
                while (node) {
                    this.nodes[node.content.refId] = node;
                    node = node.next;
                }
                container.last.next = next;
            },
            insertAllBefore: function(container, target) {
                if (target.refId) target = this.nodes[target.refId];
                if (target.pre) {
                    this.insertAllAfter(container, target.pre);
                } else {
                    this.len += container.len;
                    this.adapteLen += container.adapteLen;
                    this.first = container.first;
                    container.last.next = target;
                    target.pre = this.last;
                    var node = container.first;
                    while (node) {
                        node.link = this;
                        this.nodes[node.content.refId] = node;
                        node = node.next;
                    }
                }
            },
            insertAt: function(obj, index) {
                if (index == this.length()) {
                    this.append(obj);
                    return;
                }
                var target = this.getByIndex(index);
                if (!target) {
                    console.error("incorrect index ");
                    return;
                }
                this.insertBefore(obj, target);
            },
            insertAtAdapte: function(obj, adpateIdx){
                if (!has("trackGroup"))
                    return this.insertAt(obj, adpateIdx);
                if (adpateIdx == this.adatpeLength()) {
                    this.append(obj);
                    return;
                }
                var target = this.getByAdapteIndex(index, true);
                if (!target) {
                    console.error("incorrect index ");
                    return;
                }
                this.insertBefore(obj, target);
            },
            removeAll: function() {
                this.first = null;
                this.last = null;
                this.len = 0;
                this.adapteLen = 0;
                this.nodes = {};
            },
            remove: function(obj) {
                var node = obj;
                if (obj.refId) node = this.nodes[obj.refId];
                if (!node) {
                    console.warn("the target is not in the container");
                    return;
                }
                if (obj.modelType == constants.MODELTYPE.PARAGRAPH) {
                    obj.mc = obj.getMessageCategory();
                    obj.root = obj.getRoot();
                }
                var pre = null;
                this.len--;
                this.adapteLen -= (obj && obj.getModelLen && obj.getModelLen()) || 1;
                if (node.pre) {
                    pre = node.pre;
                    node.pre.next = node.next;
                } else {
                    this.first = node.next;
                }
                if (node.next) {
                    node.next.pre = node.pre;
                } else {
                    this.last = node.pre;
                }
                delete this.nodes[node.content.refId];
                obj.prevObj = pre && pre.content;
            },
            replace: function(obj, target) {
                var node = this.createNode(obj);
                if (target.refId) target = this.nodes[target.refId];
                node.link = this;
                node.next = target.next;
                node.pre = target.pre;
                this.adapteLen -= (target && target.getModelLen && target.getModelLen()) || 1;
                this.adapteLen += (obj && obj.getModelLen && obj.getModelLen()) || 1;
                if (target.pre) {
                    target.pre.next = node;
                } else {
                    this.first = node;
                }
                if (target.next) {
                    target.next.pre = node;
                } else {
                    this.last = node;
                }
                if (obj.refId) this.nodes[obj.refId] = node;
            },
            divide: function(obj) {
                var node = obj;
                if (obj.refId) node = this.nodes[obj.refId];
                if (this.first == node) {
                    return this;
                } else {
                    var newLink = new Container(this.owner);
                    newLink.first = node;
                    newLink.last = this.last;
                    this.last = node.pre;
                    var i = 0, j = 0;
                    node.pre.next = null;
                    node.pre = null;
                    while (node) {
                        newLink.nodes[node.content.refId] = node;
                        delete this.nodes[node.content.refId];
                        j += (node.content && node.content.getModelLen && node.content.getModelLen()) || 1;
                        node = node.next;
                        i++;
                    }
                    this.len -= i;
                    this.adapteLen -= j;
                    newLink.len = i;
                    newLink.adapteLen = j;

                    return newLink;
                }
            },
            indexOf: function(obj) {
                var node = obj;
                if (obj.refId) {
                    node = this.nodes[obj.refId];
                }
                var i = 0;
                while (node) {
                    i++;
                    node = node.pre;
                }
                return i - 1;
            },
            /** 
             * some node (trackBlockGroup) will container multiple nodes
             * this method will get the real index of obj
             */
            adapteIndexOf: function(obj){
                if (!has("trackGroup"))
                    return this.indexOf(obj);
                var node = obj;
                if (obj.refId) {
                    node = this.nodes[obj.refId];
                }
                if (!node)
                    return -1;
                var i = 0;
                node = node.pre;
                while (node) {
                    i += (node.content && node.content.getModelLen && node.content.getModelLen()) || 1;
                    node = node.pre;
                }
                return i;
            },
            next: function(obj) {
                if (obj && obj.refId) obj = this.nodes[obj.refId];
                if (obj && obj.next) {
                    return obj.next.content;
                }
                return null;
            },
            prev: function(obj) {
                if (obj && obj.refId) obj = this.nodes[obj.refId];
                if (obj && obj.pre) {
                    return obj.pre.content;
                }
                return null;
            },
            getFirst: function() {
                if (this.first) {
                    return this.first.content;
                }
                return null;
            },
            getLast: function() {
                if (this.last) {
                    return this.last.content;
                }
                return null;
            },
            contains: function(obj) {
                if (obj && obj.refId) {
                    obj = this.nodes[obj.refId];
                    return obj;
                }
                return false;
            },
            // For performance reason, change function call to inline
            isEmpty: function() {
                return this.first == null && this.last == null;
            },
            length: function() {
                return this.len;
            },
            adatpeLength: function(){
                return this.adapteLen;
            },
            stepLength: function(start, end) {
                if (start === end) return 1;

                var i = 1;
                if (start.refId)
                    start = this.nodes[start.refId];
                if (end.refId)
                    end = this.nodes[end.refId];
                while (start != end) {
                    start = start.next;
                    i++;
                }
                return i;
            },
            forEach: function(callback) {
                var node = this.first,
                    i = 0;
                while (node) {
                    var ret = callback(node.content, i++);
                    if (ret === false)
                        break;
                    node = node.next;
                }
            },
            select: function(callback) {
                var node = this.first;
                while (node) {
                    if (callback(node.content)) {
                        return node.content;
                    }
                    node = node.next;
                }
                return null;
            },
            selectReverse: function(callback) {
                var node = this.last;
                while (node) {
                    if (callback(node.content)) {
                        return node.content;
                    }
                    node = node.pre;
                }
                return null;
            },
            getByIndex: function(idx) {
                var node = this.first;
                for (var i = 0; i < idx; i++) {
                    node = node.next;
                    if (node == null) {
                        return null;
                    }
                }
                return node && node.content;
            },
            /** 
             * some node (trackBlockGroup) will container multiple nodes
             * this method will get obj from real index
             */
            getByAdapteIndex: function(adapteIndex) {
                if (!has("trackGroup"))
                    return this.getByIndex(adapteIndex);
                var node = this.first;
                var idx= 0,lastIdx = 0;
                for (idx = 0; idx < adapteIndex; ) {
                    lastIdx = idx;
                    idx += (node.content && node.content.getModelLen && node.content.getModelLen()) || 1;
                    if (idx <= adapteIndex) {
                        node = node.next;
                        if ( node == null) {
                            return null;
                        } 
                    }
                }
                var content = node && node.content;
                if(content && content.getByAdapteIndex){
                    return content.getByAdapteIndex(adapteIndex - lastIdx);
                }
                return content;
            },
            reset: function() {

            },
            sort: function(subContainer) {
                var t = new Container(subContainer.owner);
                if (!(subContainer.first == null && subContainer.last == null)) {
                    var first = this.getFirst();
                    while (first) {
                        if (subContainer.contains(first)) {
                            t.append(first);
                            subContainer.remove(first);
                        }
                        if (subContainer.first == null && subContainer.last == null) {
                            break;
                        }
                        first = this.next(first);
                    }
                    t.appendAll(subContainer);
                }
                return t;
            },
            /* sort this container by compare func,
              A < B        return <0
              A == B       return =0
              A > B        return >0
            */
            sortByFunc: function(comp) {
                if (this.isEmpty()) return;
                var sortFunc = function(node1, node2) {
                    return comp(node1.content, node2.content);
                };
                var arr = [];
                var node = this.first;
                while (node) {
                    arr.push(node);
                    node = node.next;
                }
                arr.sort(sortFunc);
                this.first = arr[0];
                this.last = arr[arr.length - 1];
                for (var i = 0; i < arr.length; ++i) {
                    var preIndex = i - 1;
                    var nextIndex = i + 1;

                    arr[i].pre = preIndex >= 0 ? arr[preIndex] : null;
                    arr[i].next = nextIndex < arr.length ? arr[nextIndex] : null;
                }
            },
            toArray: function() {
                var arr = [];
                this.forEach(function(c) {
                    arr.push(c);
                });
                return arr;
            }
        });


    } else {
        lang.extend(Container, {
            append: function(item) {
                if (this.nodes.indexOf(item) < 0)
                    this.nodes.push(item);
            },
            getById: function(id) {
                return null;
            },
            appendFront: function(obj) {
                if (this.nodes.length > 0)
                    this.insertBefore(obj, this.getFirst());
                else
                    this.append(obj);
            },
            appendAll: function(container) {
                if (container.isContainer && container.nodes.length > 0) {
                    this.nodes = this.nodes.concat(container.nodes);
                } else {
                    for (var i = 0; i < container.length; i++) {
                        this.append(container[i]);
                    }
                }
            },
            appendAllFront: function(container) {
                if (this.nodes.length > 0)
                    this.nodes = container.nodes.concat(this.nodes);
                else
                    this.appendAll(container);
            },
            merge: function(container) {
                this.appendAll(container);
                container.removeAll();
            },
            insertAfter: function(item, itemRef) {
                if (this.indexOf(item) > 0)
                    console.log("already there!!");
                if (itemRef == undefined || itemRef == null || itemRef == this.getLast()) {
                    this.append(item);
                } else {
                    var indexRef = this.nodes.indexOf(itemRef);

                    if (indexRef >= 0) {
                        this.nodes.splice(indexRef + 1, 0, item);
                    }
                }
            },
            insertBefore: function(item, itemRef) {
                var indexRef = this.nodes.indexOf(itemRef);

                if (indexRef >= 0)
                    this.nodes.splice(indexRef, 0, item);
            },
            insertAllAfter: function(container, itemRef) {
                if (itemRef == undefined || itemRef == null || itemRef == this.getLast()) {
                    this.nodes.concat(container.nodes);
                } else {
                    var indexRef = this.nodes.indexOf(itemRef);
                    if (indexRef >= 0) {
                        var thisPart = this.nodes.slice(0, indexRef + 1);
                        var nextPart = this.nodes.slice(indexRef + 1);

                        this.nodes = thisPart.concat(container.nodes, nextPart);
                    }
                }
            },
            insertAllBefore: function(container, itemRef) {
                if (itemRef == undefined || itemRef == null || itemRef == this.getLast()) {
                    this.nodes.concat(container.nodes);
                } else {
                    var indexRef = this.nodes.indexOf(itemRef);
                    if (indexRef >= 0) {
                        var thisPart = this.nodes.slice(0, indexRef);
                        var nextPart = this.nodes.slice(indexRef);
                        this.nodes = thisPart.concat(container.nodes, nextPart);
                    }
                }
            },
            insertAt: function(item, index) {
                if (index >= 0)
                    this.nodes.splice(index, 0, item);
            },
            insertAtAdapte: function(item, index) {
                if (!has("trackGroup"))
                    return this.insertAt(item, index);
                if(index < 0)
                    return;
                var idx;
                for (var i = 0; i < this.nodes.length; i++) {
                    var node = this.nodes[i];
                    if(index == idx)
                        return this.insertAt(item, i);
                    else if(adpateIdx - idx < ((node && node.getModelLen && node.getModelLen()) || 1))
                        return this.insertAt(item, i);
                    idx += (node && node.getModelLen && node.getModelLen()) || 1;
                }
                this.insertAt(item, this.nodes.length);
            },
            remove: function(item) {
                if (item.modelType == constants.MODELTYPE.PARAGRAPH) {
                    item.mc = item.getMessageCategory();
                    item.root = item.getRoot();
                }

                var index = this.nodes.indexOf(item);

                if (index >= 0) {
                    this.nodes.splice(index, 1);
                }
                if (index > 0) {
                    item.prevObj = this.nodes[index - 1];
                }
            },
            removeAll: function() {
                this.nodes = [];
            },
            replace: function(obj, target) {
                var index = this.nodes.indexOf(target);
                if (index >= 0) this.nodes[index] = obj;
            },
            divide: function(item, createParam) {
                var i = this.nodes.indexOf(item);

                if (i == 0) {
                    return this;
                } else if (i > 0) {
                    var thisPart = this.nodes.slice(0, i);
                    var nextPart = this.nodes.slice(i);

                    var newContainer = new Container(this.owner);

                    newContainer.nodes = nextPart;

                    this.nodes = thisPart;

                    return newContainer;
                }

                return null;
            },

            indexOf: function(item) {
                return this.nodes.indexOf(item);
            },

            /** 
             * some node (trackBlockGroup) will container multiple nodes
             * this method will get the real index of obj
             */
            adapteIndexOf: function(item) {
                if (!has("trackGroup"))
                    return this.indexOf(item);
                var index = this.nodes.indexOf(item);
                var adpateIdx = 0;
                for(var i = 0; i < index; i++){
                    var node = this.nodes[i];
                    adpateIdx += (node && node.getModelLen && node.getModelLen()) || 1;
                }
                return adpateIdx;
            },

            length: function() {
                return this.nodes.length;
            },

            adatpeLength: function() {
                return this.adatpeLength;
            },

            stepLength: function(start, end) {
                var index_s = this.nodes.indexOf(start),
                    index_e = this.nodes.indexOf(end);

                if (index_s < 0 || index_e < 0)
                    return 0;

                return index_e - index_s + 1;
            },

            forEach: function(callback) {
                var nodes_ = this.nodes.slice();
                var len = nodes_.length;
                for (var i = 0; i < len; i++) {
                    var ret = callback(nodes_[i], i);
                    if (ret === false)
                        break;
                }
            },

            asyncForEach: function(callbacks, countInTimer) {
                if (this.nodes.length > 0) {
                    this._forEachWorker(callbacks, 0, countInTimer);
                }
            },

            _forEachWorker: function(callbacks, index, countInTimer) {
                var currentCount = 0;
                var container = this;
                var items = this.nodes;
                /*
                for (var i = 0; i < items.length; i++) {
                	callbacks.worker(items[i]);
                }
                //*/
                ///*
                setTimeout(function() {
                        while (true) {
                            callbacks.worker(items[index]);
                            index++;
                            if (index >= items.length) {
                                return callbacks.onFinish();
                            }

                            currentCount++;
                            if (!countInTimer || currentCount >= countInTimer) break;
                        }
                        callbacks.onProgress();
                        container._forEachWorker(callbacks, index, countInTimer);
                    },
                    0);
                //*/
            },

            select: function(callback) {
                for (var i = 0; i < this.length(); i++) {
                    if (callback(this.nodes[i])) {
                        return this.nodes[i];
                    }
                }

                return null;
            },

            selectReverse: function(callback) {
                for (var i = this.length() - 1; i >= 0; i--) {
                    if (callback(this.nodes[i])) {
                        return this.nodes[i];
                    }
                }
                return null;
            },

            next: function(item) {
                var index = this.nodes.indexOf(item);

                if (index >= 0 && (index < this.length() - 1)) {
                    return this.nodes[index + 1];
                }

                return null;
            },

            prev: function(item) {
                var index = this.nodes.indexOf(item)

                if (index > 0) {
                    return this.nodes[index - 1];
                }

                return null;
            },
            getFirst: function() {
                if (this.nodes.length > 0) {
                    return this.nodes[0];
                }
                return null;
            },
            getLast: function() {
                var len = this.nodes.length;
                if (len > 0) {
                    return this.nodes[len - 1];
                }
                return null;
            },
            contains: function(obj) {
                var index = this.nodes.indexOf(obj);
                if (index >= 0) {
                    return true;
                }
                return false;
            },
            // For performance reason, change function call to inline
            isEmpty: function() {
                return this.nodes.length <= 0;
            },
            getByIndex: function(idx) {
                if (idx < 0 || idx > this.nodes.length)
                    return null;
                else
                    return this.nodes[idx];
            },
            /** 
             * some node (trackBlockGroup) will container multiple nodes
             * this method will get obj from real index
             */
            getByAdapteIndex: function(adpateIdx) {
                if (!has("trackGroup"))
                    return this.getByIndex(adpateIdx);
                var idx = 0;
                for(var i = 0; i < this.nodes.length; i++){
                    var node = this.nodes[i];
                    if(adpateIdx == idx) {
                        if (node && node.getModelLen)
                            return node.getByAdapteIndex(0);
                        return node;
                    }
                    else if(adpateIdx - idx < ((node && node.getModelLen && node.getModelLen()) || 1))
                        return (node.getByAdapteIndex && node.getByAdapteIndex(adpateIdx - idx)) || node;
                    idx += (node && node.getModelLen && node.getModelLen()) || 1;
                }
                return null;
            },
            sort: function(subContainer) {
                var t = new Container(subContainer.owner);
                if (subContainer.nodes.length > 0) {
                    var first = this.getFirst();
                    while (first) {
                        if (subContainer.contains(first)) {
                            t.append(first);
                            subContainer.remove(first);
                        }
                        if (subContainer.nodes.length == 0) {
                            break;
                        }
                        first = this.next(first);
                    }
                    t.appendAll(subContainer);
                }
                return t;
            },
            /* sort this container by compare func,
              A < B        return <0
              A == B       return =0
              A > B        return >0
            */
            sortByFunc: function(comp) {
                this.nodes.sort(comp);
            },
            toArray: function() {
                return this.nodes.slice();
            },
            reset: function() {

            }
        });
    }
    return Container;
});
