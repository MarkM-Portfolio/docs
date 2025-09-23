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
    "dojo/on",
    "dijit/form/ToggleButton"
], function(declare, lang, on, ToggleButton) {

    var ToggleButtonEx = declare("writer.ui.widget.ToggleButtonEx", ToggleButton, {
        baseClass: "dijitToggleButton",
        enableToggle: false,
        clickCount: 0,

        postCreate: function() {
            this.inherited(arguments);
            //dojo.connect(this.domNode, "ondblclick", this, "_onDblClick" );
            on(this.domNode, "mouseup", lang.hitch(this, "_checkClick"));
        },

        _checkClick: function(evt) {
            clearTimeout(this.clickRepeat);
            this.clickCount++;
            if (this.clickCount == 1) {
                var that = this;
                this.clickRepeat = setTimeout(function() {
                    that.enableToggle = false;
                    that._doClick(evt);
                    that.clickCount = 0;
                }, 300);
            } else {
                this._doDblClick(evt);
                this.clickCount = 0;
            }

        },

        _doDblClick: function(e) {
            if (!this.enableToggle || !this.checked) {
                this.enableToggle = true;
                this._set('checked', false);
                this.set('checked', false);
                this._doClick(e);
            } else {
                this.enableToggle = false;
                this._set('checked', true);
                this.set('checked', true);
                this._doClick(e);
            }
        },

        _onClick: function(evt) {
            return;
        },

        _doClick: function(e) {
            var original = this.checked;
            this._set('checked', !original); // partially set the toggled value, assuming the toggle will work, so it can be overridden in the onclick handler
            var ret = this.onClick(e, this.enableToggle);
            this.set('checked', ret ? this.checked : original); // officially set the toggled or user value, or reset it back
        }
    });

    return ToggleButtonEx;
});
