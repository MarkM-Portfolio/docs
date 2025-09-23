/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

define([
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/has",
    "writer/controller/EditShell",
    "writer/controller/Editor",
    "writer/controller/Selection",
    "writer/view/ImageView",
    "writer/view/selection/ResizerView"
], function(declare, domStyle, has, EditShell, Editor, Selection, ImageView, ResizerView) {

    var ImgResizerView = declare("writer.view.selection.ImgResizerView", ResizerView, {
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

        // draw owner node while resizing
        _drawOwner: function(left, bottom, width, height) {
            var node = this._imgNode;
            var scaleX = 1;
            var scaleY = 1;

            if (width < 0) {
                left = left + width;
                width = -width;

                scaleX = -1;
            }

            if (height < 0) {
                bottom = bottom + height;
                height = -height;

                scaleY = -1;
            }

            var transform = "transform";
            if (has("webkit"))
                transform = "-webkit-transform";
            else if ((has("ie") || has("trident")))
                transform = "-ms-transform";
            else if (has("opera"))
                transform = "-o-transform";

            domStyle.set(node, transform, "scale(" + scaleX + ", " + scaleY + ")");
            domStyle.set(node, "left", left - this._ownerView.padLeft + "px");
            domStyle.set(node, "bottom", bottom - this._ownerView.padBottom + "px");

            if(this._ownerView.borderWidth && this._ownerView.borderWidth > 0)
            	width = width - 2 * this._ownerView.borderWidth ;
            domStyle.set(node, "width", width + "px");
            domStyle.set(node, "height", height + "px");
        },

        _beginResize: function() {
            var node = this._imgNode;
            domStyle.set(node, "zIndex", 10000);
        },

        _endResize: function() {
            var node = this._imgNode;
            domStyle.set(node, "zIndex", 0);
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

            // base method
            this.inherited(arguments);
        },

        _addIndicator: function() {
            var parentNode = this._ownerView.getResizeViewParentDomNode();
            if(parentNode && parentNode.getAttribute("needreloc")) {
            	var viewRect = this._ownerView.getResizerRect();
                if(this._ownerView.updateFixHight)
                	this._ownerView.updateFixHight(viewRect.h, true);

            	if(viewRect) {
                	parentNode.setAttribute("style", "position:absolute;z-index:auto" +
                            ";width:" + viewRect.w + "px" +
                            ";height:" + viewRect.h + "px" +
                            ";top:" + viewRect.t+ "px" +
                            ";left:" + viewRect.l + "px");           		
            	}
            }

            // base method
            this.inherited(arguments);
        },
        // remove indicator
        _removeIndicator: function() {
            var parentNode = this._ownerView.getResizeViewParentDomNode();
            if(parentNode && parentNode.getAttribute("needreloc")) {
                if(this._ownerView.updateFixHight)
                	this._ownerView.updateFixHight();
            }
            
            // base method
            this.inherited(arguments);            
        }
    }); // end dojo.declare
    return ImgResizerView;
});
