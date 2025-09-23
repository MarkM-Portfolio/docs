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
    "writer/plugins/pastefilter/anchor"
], function(declare, anchor) {

    var canvas = declare("writer.plugins.pastefilter.canvas", anchor, {
        /**
         * filter 
         * @param m
         * @returns
         */
        filter: function(m, webClipBoard, pasteBin) {
            if (this.isSmartArt(m))
                return null;

            if (webClipBoard && !webClipBoard.isSameFile) {
                //paste across document
                if (m.anchor && m.anchor.graphicData && m.anchor.graphicData.odfshapeid)
                    return null;
            }
            return this.inherited(arguments);
        },

        isSmartArt: function(m) {
            if (m.rt == "smartart")
                return true;
            return false;
        }
    });
    return canvas;
});
