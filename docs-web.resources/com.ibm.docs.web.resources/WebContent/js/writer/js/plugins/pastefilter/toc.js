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
    "dojo/_base/declare"
], function(declare) {

    var toc = declare("writer.plugins.pastefilter.toc", null, {
        cmd: "createTOC",
        /**
         * filter 
         * @param m
         * @returns
         */
        filter: function(jsonData, webClipBoard, pasteBin) {
            return jsonData;
        }
    });
    return toc;
});
