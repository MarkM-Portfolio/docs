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
    "dojo/topic",
    "dijit/form/DropDownButton",
    "writer/ui/widget/_HasDropDown"
], function(declare, lang, has, topic, DropDownButton, _HasDropDown) {

    var DropDownButton = declare("writer.ui.toolbar.DropDownButton", [DropDownButton, _HasDropDown], {

        methodName: null,
        focusMethod: null, //when drop down, focusMethod is used to set focus on the drop down widget

        postCreate: function() {
            this.inherited(arguments);
            if (this.focusMethod && this.toolbar) {
                this.toolbar._connectFocusEvent(this, this.dropDown, this.focusMethod);
            }
        },
        _onDropDownMouse: function( /*Event*/ e) {
            // summary:
            //		Callback when the user mouse clicks on the arrow icon, or presses the down
            //		arrow key, to open the drop down.

            // We handle mouse events using onmousedown in order to allow for selecting via
            // a mouseDown --> mouseMove --> mouseUp.  So, our click is already handled, unless
            // we are executed via keypress - in which case, this._seenKeydown
            // will be set to true.
            if (e.type == "click" && !this._seenKeydown) {
                return;
            }
            this._seenKeydown = false;

            //REMOVE ONMOUSEUP CONNECTION
            //does not trigger _onDropDownMouseup here
            //because it will window.setTimeout(dojo.hitch(dropDown, "focus"), 1);
            //for dijit.menu, focus method is used to focus on the first menu item
            // If we are a mouse event, set up the mouseup handler.  See _onDropDownMouse() for
            // details on this handler.
            //		if(e.type == "mousedown"){
            //			this._docHandler = this.connect(dojo.doc, "onmouseup", "_onDropDownMouseup");
            //		}
            if (this.disabled || this.readOnly) {
                return;
            }
            if (this._stopClickEvents) {
                e.preventDefault(), e.stopPropagation();
            }
            this.toggleDropDown();

            // If we are a click, then we'll pretend we did a mouse up
            if (e.type == "click" || e.type == "keypress") {
                this._onDropDownMouseup();
            }
        },

        //just for IE
        destroyDescendants: function() {
            if (lang.isObject(this.dropDown)) {
                this.inherited(arguments);
            }
        },

        getFocusCellColorHexStr: function(dropdown) {
            // get focus cell style information
            //TODO:
            return null;
        },

        toggleDropDown: function() {
            // summary:
            //		Toggle the drop-down widget; if it is up, close it, if not, open it
            // tags:
            //		protected

            if (this.disabled || this.readOnly) {
                return;
            }
            var dropDown = this.dropDown;
            var methodName = this.methodName;
            if (lang.isString(dropDown)) {

            }
            if (!this._opened) {
                // If we aren't loaded, load it first so there isn't a flicker
                if (!this.isLoaded()) {
                    this.loadDropDown(lang.hitch(this, "openDropDown"));
                    var colorValue = this.getFocusCellColorHexStr(dropDown);
                    if (colorValue) {
                        this.dropDown.setSelected(colorValue);
                    }
                    return;
                } else {
                    this.openDropDown();
                    var colorValue = this.getFocusCellColorHexStr(dropDown);
                    if (colorValue) {
                        this.dropDown.setSelected(colorValue);
                    }
                }

                this.focus();
            } else {
                this.closeDropDown();
            }
        },
        _onDropDownMouseUp: function( /*Event?*/ e) {
            this.inherited(arguments);
            if ((has("ie") || has("trident"))) {
                var that = this;
                setTimeout(function() {
                    that.focus();
                }, 100);
            }
        },
        startup: function() {
            if (this._started) {
                return;
            }
        }

    });
    return DropDownButton;
});
