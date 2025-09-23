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
    "dijit/_HasDropDown",
    "dijit/_base/wai"
], function(declare, _HasDropDown, wai) {

    var _HasDropDown = declare("writer.ui.widget._HasDropDown", _HasDropDown, {
        closeDropDown: function( /*Boolean*/ focus) {
            this.inherited(arguments);
            wai.removeWaiState(this.domNode, "expanded");
        },
        openDropDown: function() {
            this.inherited(arguments);
            wai.removeWaiState(this.domNode, "expanded");
        }
    });
    return _HasDropDown;
});
