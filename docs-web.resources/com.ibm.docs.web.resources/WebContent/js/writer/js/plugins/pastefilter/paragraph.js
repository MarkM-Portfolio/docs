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
    var paragraph = declare("writer.plugins.pastefilter.paragraph", null, {
        /**
         * filter 
         * @param m
         * @returns
         */
        filter: function(m, webClipBoard, pasteBin) {
            //		if(m instanceof writer.model.Paragraph) {
            //			if(!writer.util.ModelTools.inTable())
            //				m.setTask(writer.util.HelperTools.getSelectedTaskId());
            //		}
            return m;
        }
    });
    return paragraph;
});
