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

    var textbox = declare("writer.plugins.pastefilter.textbox", anchor, {
        /**
         * filter 
         * @param m
         * @returns
         */
        filter: function(m, webClipBoard, pasteBin) {
            if (webClipBoard && !webClipBoard.isSameFile) {
                //paste across document
                var shapeData = m.anchor || m.inline;
                if (shapeData && shapeData.graphicData && shapeData.graphicData.txbx && shapeData.graphicData.txbx.odfshapeid)
                    return null;
            }
            return this.inherited(arguments);
        }
    });
    return textbox;
});
