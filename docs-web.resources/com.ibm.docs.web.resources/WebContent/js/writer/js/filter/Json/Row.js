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
    "writer/filter/Json/Element"
], function(declare, Element) {

    var Row = declare("writer.filter.Json.Row", Element, {
        toHtml: function() {
            this.isMergedRow = false;
            this.startElement("tr");
            this.addContent();
            this.endElement();

            if (this.isMergedRow)
                return "";

            return this.htmlString;
        },

        addContent: function() {
            // Add Cells
            var filter = new writer.filter.JsonToHtml();
            var cellStr = filter.toHtml(this.json.tcs);
            if (cellStr == "") // The row is merged
                this.isMergedRow = true;
            else
                this.htmlString += cellStr;
        },

        genAttributes: function() {
            // TODO Implement it .
            return "";
        }

    });
    return Row;
});
