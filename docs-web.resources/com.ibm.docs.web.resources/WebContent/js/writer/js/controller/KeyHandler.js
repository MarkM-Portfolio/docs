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
    "dojo/has",
    "writer/controller/KeyImpl",
    "writer/controller/KeyImplGecko",
    "writer/controller/KeyImplTrident",
    "writer/controller/KeyImplWebKit"
], function(declare, has, KeyImpl, KeyImplGecko, KeyImplTrident, KeyImplWebKit) {

    var KeyHandler = declare("writer.controller.KeyHandler", null, {
        _impl: null,

        constructor: function(editWin, shell, inputFrame, editorFrame) {
            if (has("ie") || has("trident") || has("edge"))
                this._impl = new KeyImplTrident(editWin, shell, inputFrame, editorFrame);
            else if (has("webkit"))
                this._impl = new KeyImplWebKit(editWin, shell, inputFrame, editorFrame);
            else
                this._impl = new KeyImplGecko(editWin, shell, inputFrame, editorFrame);
        },

        register: function() {
            this._impl.register();
        },

        destroy: function() {
            this._impl.destroy();
        }
    });

    return KeyHandler;
});
