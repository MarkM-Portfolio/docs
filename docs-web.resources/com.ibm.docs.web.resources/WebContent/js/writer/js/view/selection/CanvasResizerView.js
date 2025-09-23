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
    "dojo/dom-style",
    "dojo/on",
    "dojo/topic",
    "writer/controller/EditShell",
    "writer/controller/Editor",
    "writer/controller/Selection",
    "writer/view/selection/ResizerView"
], function(declare, lang, domStyle, on, topic, EditShell, Editor, Selection, ResizerView) {

    var CanvasResizerView = declare("writer.view.selection.CanvasResizerView", ResizerView, {
        _imgNode: null, // node of img

        // event registion handle
        _imgDownConnects: null, // image mouse down events
        _imgMoveUpConnects: null, // Image mouse move/up events

        // constructor
        constructor: function(ownerView) {
            this._imgDownConnects = [];
            this._imgMoveUpConnects = [];
        },

        // getViewSize, note: the view original size, not contain border width
        _getViewSize: function() {
            return {
                "offX": this._ownerView.padLeft,
                "offY": this._ownerView.padBottom,
                "w": this._ownerView.w,
                "h": this._ownerView.h
            };
        },

        _beginResize: function() {
            var node = this._imgNode;
            domStyle.set(node, "zIndex", 10000);
        },

        _endResize: function() {
            var node = this._imgNode;
            domStyle.set(node, "zIndex", 0);
        },

        // UI event handler
        _onImgMouseDown: function(event) {
            if (!this._isInCorrectEditMode())
                return;

            this._imgMoveUpConnects.push(on(this._imgNode, "mousemove", lang.hitch(this, "_onImgMouseMove")));
            this._imgMoveUpConnects.push(on(this._imgNode, "mouseup", lang.hitch(this, "_onImgMouseUp")));

            event.preventDefault(), event.stopPropagation();
        },

        _onImgMouseMove: function(event) {
            event.preventDefault(), event.stopPropagation();
        },

        _onImgMouseUp: function(event) {
            // select the image
            if (!this._selectImg(event))
                return;

            // close context menu
            pe.lotusEditor.getShell().dismissContextMenu();

            event.preventDefault(), event.stopPropagation();

            // unregister mouse move and up on imgNode
            for (var i = 0; i < this._imgMoveUpConnects.length; i++) {
                this._imgMoveUpConnects[i].remove();
            }

            this._imgMoveUpConnects = [];
        },

        _selectImg: function(event) {
            if (!this._isInCorrectEditMode() || this._static.selectedModelID == this._ownerView.model.id)
                return false;

            // select the range
            var selection = pe.lotusEditor.getSelection();
            var start = {
                "obj": this._ownerView,
                "line": this._ownerView.parent,
                "index": 0
            };
            var end = {
                "obj": this._ownerView,
                "line": this._ownerView.parent,
                "index": 1
            };
            /*
            selection.beginSelect(start);
            selection.endSelect(end);
            */
            selection.blur();
            selection.select(start, end);
            return true;
        },

        // create
        create: function(parentNode, ownerNode) {
            // unregister image mouse down event
            for (var i = 0; i < this._imgDownConnects.length; i++) {
                this._imgDownConnects[i].remove();
            }
            this._imgDownConnects = [];

            // save current node reference
            this._imgNode = ownerNode;

            // register image node event
            this._imgDownConnects.push(on(this._imgNode, "mousedown", lang.hitch(this, "_onImgMouseDown")));

            // base method
            this.inherited(arguments);
        }
    }); // end dojo.declare
    return CanvasResizerView;
});
