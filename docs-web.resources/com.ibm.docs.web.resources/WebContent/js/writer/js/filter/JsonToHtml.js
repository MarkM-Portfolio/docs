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
    "writer/filter/Json/Factory"
], function(declare, Factory) {

    var JsonToHtml = declare("writer.filter.JsonToHtml", null, {
        /*
         * convert jsonArray to html string
         */
        toHtml: function(jsonArray) {
            var htmlString = "";
            var clipId = jsonArray && jsonArray[0] && jsonArray[0]._fromClip;
            for (var i = 0; jsonArray && (i < jsonArray.length); i++) {
                if (jsonArray[i] && clipId && jsonArray[i].c != "") {
                    jsonArray[i]._fromClip = clipId;
                    clipId = null;
                }
                htmlString += this.convert(jsonArray[i]);
            }
            return htmlString;
        },
        /*
         * Convert a block element to html string
         */
        convert: function(jsonObject) {
            var block = Factory.createBlock(jsonObject);
            if (block)
                return block.toHtml();
            else {
                console.warn(" unknown json object");
                return "";
            }
        }
    });


    return JsonToHtml;
});
