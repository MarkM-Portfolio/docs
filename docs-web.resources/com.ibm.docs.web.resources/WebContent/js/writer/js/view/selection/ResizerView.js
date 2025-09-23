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
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "writer/controller/EditShell",
    "writer/common/tools",
    "writer/constants",
    "concord/util/browser",
    "writer/controller/Editor",
    "writer/controller/Selection",
    "writer/util/ViewTools",
    "writer/view/ImageView"
], function(lang, declare, dom, domConstruct, domStyle, on, topic, EditShell, tools, constants, browser, Editor, Selection, ViewTools, ImageView) {

    var ResizerView = declare("writer.view.selection.ResizerView", null, {
        // DOM nodes of the resizer
        //
        //     []    []    []
        //     []   view   []
        //     []    []    []
        //
        //     index
        //
        //     0     1     2
        //     3           4  
        //     5     6     7

        _RESIZER_BORDER_SIZE: 6, // border size of each of resizer selector(include border 1px + 1px)

        _MINIMIZE_SIZE: 4,

        _CURSOR_STYLE: { // css cursor style for resizing
            0: "nw-resize",
            1: "n-resize",
            2: "ne-resize",
            3: "w-resize",
            4: "e-resize",
            5: "sw-resize",
            6: "s-resize",
            7: "se-resize"
        },

        _ownerView: null, // owner

        _moveNodeIndex: null,
        _moveInitX: null,
        _moveInitY: null,

        // event registion handle
        _connects: null, // indicator mouse down
        _docConnects: null, // Document mouse up/move events
        _listeners: null, // Dojo events

        // static variable
        _static: {
            selectedModelID: null
        }, // this static variable contains current selected model id

        // tools
        _getPxValue: tools.toPxValue,

        // constructor
        constructor: function(ownerView) {
            this._connects = [];
            this._docConnects = [];
            this._listeners = [];

            this._ownerView = ownerView;
            if (browser.isMobileBrowser()) {
            	this._RESIZER_BORDER_SIZE = 20;
            }
        },

        // get view size, note: the view original size, not contain border width
        _getViewSize: function() {},

        // the ownerview is in the correct edit mode.
        _isInCorrectEditMode: function() {
            var shell = pe.lotusEditor.getShell();
            if (shell) {
                var editorMode = shell.getEditMode();
                var header = ViewTools.getHeader(this._ownerView);
                var footer = ViewTools.getFooter(this._ownerView);
                if (editorMode == constants.EDITMODE.HEADER_FOOTER_MODE) {
                    if (!header && !footer)
                        return false;
                } else if (editorMode == constants.EDITMODE.EDITOR_MODE) {
                    if (header || footer)
                        return false;
                }
            }

            return true;
        },

        _onIndicatorDown: function(event) {
            // disable context menu
            pe.lotusEditor.getShell().dismissContextMenu();

            this._beginResize();

            var target = event.target || event.srcElement;

            this._moveNodeIndex = this._getTargetIndex(target);
            this._moveInitX = event.clientX;
            this._moveInitY = event.clientY;

            // register doc event
            var editorFrame = dom.byId("editorFrame");
            var mainNode = browser.getEditAreaDocument();
            if (browser.isMobileBrowser()) {
            	this._docConnects.push(on(mainNode, "touchmove", lang.hitch(this, "_onIndicatorMove")));
                this._docConnects.push(on(mainNode, "touchend", lang.hitch(this, "_onIndicatorUp")));
                this._docConnects.push(on(document, "touchend", lang.hitch(this, "_onIndicatorUpOut")));
            }else {
            	this._docConnects.push(on(mainNode, "mousemove", lang.hitch(this, "_onIndicatorMove")));
                this._docConnects.push(on(mainNode, "mouseup", lang.hitch(this, "_onIndicatorUp")));
                this._docConnects.push(on(document, "mouseup", lang.hitch(this, "_onIndicatorUpOut")));
            }
             event.preventDefault(), event.stopPropagation();
        },

        _onIndicatorMove: function(event) {
            var left = 0;
            var bottom = 0;

            var obj = this._getInc(event.clientX, event.clientY);
            var incX = obj.incX;
            var incY = obj.incY;

            /*
            console.log("----img resize inc----");
            console.log("incX:" + incX);
            console.log("incY:" + incY);
            console.log("----------------------");
            */

            switch (this._moveNodeIndex) {
                case 0:
                    left = left - incX;
                    break;
                case 3:
                    left = left - incX;
                    break;
                case 5:
                    left = left - incX;
                    bottom = bottom - incY;
                    break;
                case 6:
                    bottom = bottom - incY;
                    break;
                case 7:
                    bottom = bottom - incY;
                    break;
            }

            var viewSize = this._getViewSize();
            var width = viewSize.w + incX;
            var height = viewSize.h + incY;
            this._drawResizer(left + viewSize.offX, bottom + viewSize.offY, width, height);
        },
        
        _onIndicatorUpOut: function(event)
        {
            var x = event.clientX;
            var y = event.clientY;
            var _editorFrame = dom.byId("editorFrame");
            x -= _editorFrame.offsetLeft;
            y -= _editorFrame.offsetTop;
            this._onIndicatorUp({clientX: x, clientY: y});
        },

        _onIndicatorUp: function(event) {
            this._endResize();

            var obj = this._getInc(event.clientX, event.clientY);

            // save
            var viewSize = this._getViewSize();
            var width = viewSize.w + obj.incX;
            var height = viewSize.h + obj.incY;
            if (width < 0) width = -width;
            if (height < 0) height = -height;
            if (width < this._MINIMIZE_SIZE) width = this._MINIMIZE_SIZE;
            if (height < this._MINIMIZE_SIZE) height = this._MINIMIZE_SIZE;

            this._ownerView.resize(width - viewSize.w, height - viewSize.h);

            // unregister document move event
            for (var i = 0; i < this._docConnects.length; i++) {
                this._docConnects[i].remove();
            }

            this._docConnects = [];
        },

        _onPageShift: function() {
            var parentNode = this._ownerView.getResizeViewParentDomNode();
            if(parentNode && parentNode.getAttribute("needreloc")) {
            	var viewRect = this._ownerView.getResizerRect();
            	if(viewRect)
            		parentNode.style.left = viewRect.l + "px";
            }     	
        },

        _beginResize: function() {},

        _endResize: function() {},

        // draw owner node while resizing
        _drawOwner: function(left, bottom, width, height) {},

        // draw resizer
        _drawResizer: function(left, bottom, width, height) {
            /*
            console.log("----draw resize indicator----");
            console.log("left:" + left);
            console.log("bottom:" + bottom);
            console.log("width:" + width);
            console.log("height:" + height);
            console.log("-----------------------------");
            */
            if (browser.isMobile())
                return;
            // update owner node
            this._drawOwner(left, bottom, width, height);

            // top-left
            var node = this._domNodes0;
            // In coediting mode other client insert text will trigger update to remove the indicator;
            if (!node)
                return;
            domStyle.set(node, "left", (left - this._RESIZER_BORDER_SIZE) + "px");
            domStyle.set(node, "bottom", (bottom + height) + "px");

            // top-right
            node = this._domNodes2;
            domStyle.set(node, "left", (left + width) + "px");
            domStyle.set(node, "bottom", (bottom + height) + "px");

            // bottom-left
            node = this._domNodes5;
            domStyle.set(node, "left", (left - this._RESIZER_BORDER_SIZE) + "px");
            domStyle.set(node, "bottom", (bottom - this._RESIZER_BORDER_SIZE) + "px");

            // bottom-right
            node = this._domNodes7;
            domStyle.set(node, "left", (left + width) + "px");
            domStyle.set(node, "bottom", (bottom - this._RESIZER_BORDER_SIZE) + "px");

            // left
            node = this._domNodes3;
            domStyle.set(node, "left", (left - this._RESIZER_BORDER_SIZE) + "px");
            domStyle.set(node, "bottom", (bottom + (height - this._RESIZER_BORDER_SIZE) * 0.5 + 0.5) + "px");

            // right
            node = this._domNodes4;
            domStyle.set(node, "left", (left + width) + "px");
            domStyle.set(node, "bottom", (bottom + (height - this._RESIZER_BORDER_SIZE) * 0.5 + 0.5) + "px");

            // top
            node = this._domNodes1;
            domStyle.set(node, "left", (left + (width - this._RESIZER_BORDER_SIZE) * 0.5 + 0.5) + "px");
            domStyle.set(node, "bottom", (bottom + height) + "px");

            // bottom
            node = this._domNodes6;
            domStyle.set(node, "left", (left + (width - this._RESIZER_BORDER_SIZE) * 0.5 + 0.5) + "px");
            domStyle.set(node, "bottom", (bottom - this._RESIZER_BORDER_SIZE) + "px");
        },

        // get target increasing size
        _getInc: function(offsetX, offsetY) {
            var obj = {
                incX: 0,
                incY: 0
            };

            switch (this._moveNodeIndex) {
                case 0:
                    obj.incX = this._moveInitX - offsetX;
                    obj.incY = this._moveInitY - offsetY;
                    break;
                case 1:
                    obj.incY = this._moveInitY - offsetY;
                    break;
                case 2:
                    obj.incX = offsetX - this._moveInitX;
                    obj.incY = this._moveInitY - offsetY;
                    break;
                case 3:
                    obj.incX = this._moveInitX - offsetX;
                    break;
                case 4:
                    obj.incX = offsetX - this._moveInitX;
                    break;
                case 5:
                    obj.incX = this._moveInitX - offsetX;
                    obj.incY = offsetY - this._moveInitY;
                    break;
                case 6:
                    obj.incY = offsetY - this._moveInitY;
                    break;
                case 7:
                    obj.incX = offsetX - this._moveInitX;
                    obj.incY = offsetY - this._moveInitY;
                    break;
            }

            // lock aspect
            if ((0 == this._moveNodeIndex || 2 == this._moveNodeIndex || 5 == this._moveNodeIndex || 7 == this._moveNodeIndex) && this._ownerView.isAspectLocked && this._ownerView.isAspectLocked()) {
                var viewSize = this._getViewSize();
                if (viewSize.w != 0 && viewSize.h != 0) {
                    var newW = viewSize.w + obj.incX;
                    var newH = viewSize.h + obj.incY;

                    if (newH != 0 && Math.abs(newW / newH) >= viewSize.w / viewSize.h) {
                        newH = newW * viewSize.h / viewSize.w;
                        obj.incY = newH - viewSize.h;
                    } else {
                        newW = newH * viewSize.w / viewSize.h;
                        obj.incX = newW - viewSize.w;
                    }
                }
            }

            return obj;
        },

        // create indicator node
        create: function(parentNode, ownerNode) {
            // if this is still selecting, then set visible
            if (this._static.selectedModelID == this._ownerView.model.id) {
                this.select();
            } else
                this.unSelect();
        },

        // clear indicator registered event
        _clearIndicatorConnects: function() {
            for (var i = 0; i < this._connects.length; i++) {
                this._connects[i].remove();
            }
            this._connects = [];
        },

        _displayAnchor: function(isDisplay) {
            var vTools = ViewTools;

            if (this._anchorIndicatorDom) {
                var parentNode = this._anchorIndicatorDom.parentNode;
                parentNode && parentNode.removeChild(this._anchorIndicatorDom);
                this._anchorIndicatorDom = null;
            }

            if (vTools.isInlineDrawingObj(this._ownerView))
                return;

            var anchorClass = "anchorIndicator";
            // 1. Find Anchored paragraph
            var para = vTools.getParagraph(this._ownerView);
            var cell = para && vTools.getCell(para);

            if (cell)
                anchorClass += " anchorIndicatorInTable";
            else {
                var upperPara = vTools.getParagraph(para.getParent());
                para = upperPara || para;
            }

            // 2. Show/Hide anchor
            var domNode = para && para.getDomNode();
            if (domNode && isDisplay) {
                this._anchorIndicatorDom = domConstruct.create("div", {
                    "class": anchorClass
                });
                domNode.appendChild(this._anchorIndicatorDom);
            }
        },

        // add indicator
        _addIndicator: function() {
            if (browser.isMobile())
                return;
            // unregister indicator ui event
            this._clearIndicatorConnects();

            this._displayAnchor(true);

            var parentNode = this._ownerView.getResizeViewParentDomNode();
            var node = null;
            for (var i = 0; i < 8; ++i) {
                node = domConstruct.create("div", {
                        "style": "position:absolute" +
                            ";opacity:1;" +
                            ";z-index:50000" +
                            ";background-color:#FFFFFF" +
                            ";font-size:0" +
                            ";border:1px solid #000000" +
                            ";cursor:" + this._CURSOR_STYLE[i] +
                            ";width:" + (this._RESIZER_BORDER_SIZE - 2) + "px" +
                            ";height:" + (this._RESIZER_BORDER_SIZE - 2) + "px"
                    },
                    parentNode);
                if (browser.isMobileBrowser()) {
                	this._connects.push(on(node, "touchstart", lang.hitch(this, "_onIndicatorDown")));
                }else {
                	this._connects.push(on(node, "mousedown", lang.hitch(this, "_onIndicatorDown")));
                }
                this["_domNodes" + i] = node;
            }
        },

        // remove indicator
        _removeIndicator: function() {
            if (!this["_domNodes0"])
                return;

            // unregister indicator ui event
            this._clearIndicatorConnects();

            this._displayAnchor(false);

            var parentNode = this._ownerView.getResizeViewParentDomNode();
            var node = null;
            for (var i = 0; i < 8; ++i) {
                node = this["_domNodes" + i];
                try {
                    if (node) {
                        node.parentNode.removeChild(node);
                    }
                } catch (e) {}
                this["_domNodes" + i] = null;
            }
        },

        // get target indicator node index
        _getTargetIndex: function(target) {
            for (var i = 0; i < 8; ++i) {
                if (this["_domNodes" + i] == target) {
                    return i;
                }
            }
        },

        select: function() {
            if (!this["_domNodes0"])
                this._addIndicator();

            // render
            var viewSize = this._getViewSize();
            this._drawResizer(viewSize.offX, viewSize.offY, viewSize.w, viewSize.h);

            this._static.selectedModelID = this._ownerView.model.id;
            this._listeners.push(topic.subscribe(constants.EVENT.REMOVE_SELECT, lang.hitch(this, this.unSelect)));

            //reset page body deep value so that resizing indicator can be always on top
            var viewTools = ViewTools;
            var myBody = viewTools.getBody(this._ownerView);
            if (!myBody) return;
            var page = myBody.getParent();
            if (!page) return;
            var body = page.getFirstBody();
            while (body) {
                if (body != myBody)
                    body.setDomZ(-20001);
                else
                    body.setDomZ(-20000);
                body = page.getNextBody(body);
            }

            // notify owner view
            this._ownerView.onSelect && this._ownerView.onSelect();
        },

        unSelect: function(ranges, beforeUpdate) {
            if (beforeUpdate) // Defect 39881. The indicator will not removed until update selection.
                return;

            // remove indicator
            this._removeIndicator();

            this._static.selectedModelID = null;

            for (var i = 0; i < this._listeners.length; i++) {
                this._listeners[i].remove();
            }

            this._listeners = [];

            // notify owner view
            this._ownerView.onUnSelect && this._ownerView.onUnSelect();
        }
    }); // end dojo.declare
    return ResizerView;
});
