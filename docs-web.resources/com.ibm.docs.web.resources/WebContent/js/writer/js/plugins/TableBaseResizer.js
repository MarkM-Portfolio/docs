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
    "dojo/on",
    "dojo/dom-style",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "concord/util/browser",
    "writer/constants",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/common/tools"
], function(on, domStyle, dom, domConstruct, declare, lang, topic, browser, constants, Plugin, ModelTools, ViewTools,tools) {

    var BaseResizer = function(owner) {
        this.owner = owner;
        this._handlerWidth = tools.PtToPx(6);
    };
    BaseResizer.prototype = {
        attach: function(target) {
            this.destory();
            this._attach && this._attach(target);
            this._isAttaching = true;
        },
        setResizer: function(x, y) {

        },
        hideResizer: function() {
            if (this._isResizing) {
                return;
            }
            domStyle.set(this.resizer, "display", "none");
        },
        showResizer: function() {
            domStyle.set(this.resizer, "display", "");
            if (this._startResizeEvent) {
                return;
            }
            this._startResizeEvent = on(this.resizer, "mousedown", lang.hitch(this, this.resizeStart));
            //		console.info("binding mousedown!");
        },
        resizeStart: function(event) {
            //		console.info("start resize: "+this._isResizing);
            if (this._isResizing) {
                return;
            }
            this._isResizing = true;
            this._mainNode = browser.getEditAreaDocument().body;
            var docNode = browser.getEditAreaDocument();
            this._resizingEvent = on(docNode, "mousemove", lang.hitch(this, this.resizing));
            this._resizeEndEvent = on(docNode, "mouseup", lang.hitch(this, this.resizeEnd));
            this._resizingEventOut = on(document, "mousemove", lang.hitch(this, this._mouseMoveOut));
            this._resizeEndEventOut = on(document, "mouseup", lang.hitch(this, this._mouseUpOut));
            this._resizeStart && this._resizeStart();
            pe.lotusEditor.isResizing = true;
        },
        
        _mouseMoveOut: function(event)
        {
            var x = event.clientX;
            var y = event.clientY;
            var _editorFrame = dom.byId("editorFrame");
            x -= _editorFrame.offsetLeft;
            y -= _editorFrame.offsetTop;
            this.resizing({clientX: x, clientY: y});
        },
        
        _mouseUpOut: function(event)
        {
            var x = event.clientX;
            var y = event.clientY;
            var _editorFrame = dom.byId("editorFrame");
            x -= _editorFrame.offsetLeft;
            y -= _editorFrame.offsetTop;
            this.resizeEnd({clientX: x, clientY: y});
        },
        
        resizing: function(event) {
            var x = event.clientX;
            var y = event.clientY;
            var point = this._pointToLogin(x, y);
            try {
                if (this.setResizer(point.x, point.y)) {
                    this.movingPoint = point;
                }
            } catch (e) {
                console.error(e);
                this.destory();
                this.resizeEnd();
            }
        },
        _pointToLogin: function(x, y) {
            var shell = pe.lotusEditor.getShell();
            return shell.clientToLogical(shell.screenToClient({
                x: x,
                y: y
            }));
        },
        resizeEnd: function(event) {
            this._resizeEnd && this._resizeEnd();
            this.destory();
            pe.lotusEditor.isResizing = false;
            //		console.info("resizing end!");
        },
        destory: function() {
            this._isAttaching = false;
            this._resizingEvent && this._resizingEvent.remove();
            this._resizeEndEvent && this._resizeEndEvent.remove();
            this._resizingEventOut && this._resizingEventOut.remove();
            this._resizeEndEventOut && this._resizeEndEventOut.remove();
            this._startResizeEvent && this._startResizeEvent.remove();
            delete this._resizingEvent;
            delete this._resizingEventOut;
            delete this._resizeEndEvent;
            delete this._resizeEndEventOut;
            delete this._startResizeEvent;
            delete this._startRect;
            delete this._originalOverflow;
            delete this.movingPoint;
            this._isResizing = false;
            this.hideResizer();
            this._destory && this._destory();
            pe.lotusEditor.isResizing = false;
        },
        isAttach: function() {
            return this._isAttaching;
        },
        isResizing: function() {
            return this._isResizing;
        },
        cancelResize: function() {
            this._cancel && this._cancel();
            this.destory();
        }
    };

    return BaseResizer;
});
