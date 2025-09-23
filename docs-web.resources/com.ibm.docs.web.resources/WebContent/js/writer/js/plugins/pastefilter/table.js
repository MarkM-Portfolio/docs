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
    var table = declare("writer.plugins.pastefilter.table", null, {
        cmd: "createTable",
        /**
         * filter 
         * @param m
         * @returns
         */
        filter: function(m, webClipBoard, pasteBin) {
            return m;
        }
    });
    return table;
});
