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
    "writer/constants",
    "writer/model/text/InlineObject"
], function(declare, constants, InlineObject) {

    var AltContent = declare("writer.model.text.AltContent", InlineObject, {
        modelType: constants.MODELTYPE.ALTCONTENT,

        fromJson: function(json) {
            this.start = json.s ? Number(json.s) : 0;
            this.length = json.l ? Number(json.l) : 0;
            var fmt = json.AlternateContent && json.AlternateContent.Choice.fmt;
            if (fmt) {
                /*
                	there will be only one run in the content now.
                */
                if (fmt.length != 1) {
                    console.error("!!!!!!!!!alternate content fmt error:fmt.length!=1");
                }

                fmt[0].s = this.start;
                fmt[0].l = this.length;

                this.createHints(fmt);
            }
        },
        toJson: function(index, length) {
            var retVal = {};
            retVal.rt = constants.RUNMODEL.TEXT_Run;
            index = (index == null) ? this.start : index;
            length = (length == null) ? this.length : length;

            retVal.AlternateContent = {};
            retVal.AlternateContent.Choice = {};
            retVal.AlternateContent.Choice.fmt = this.hintsToJson(index, length);
            retVal.s = "" + index;
            retVal.l = "" + length;

            return retVal;
        }
    });

    return AltContent;
});
