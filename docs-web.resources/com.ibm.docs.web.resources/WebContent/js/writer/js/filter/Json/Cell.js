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

    var Cell = declare("writer.filter.Json.Cell", Element, {
        toHtml: function() {
            // Vertical merged cell
            if (this.json.tcPr && this.json.tcPr.vMerge && this.json.tcPr.vMerge.val != "restart")
                return "";

            this.startElement("td"); //TH.
            this.addContent(this.json.c);
            this.endElement();

            return this.htmlString;
        },

        addContent: function() {
            // Add Paragraphs
            var filter = new writer.filter.JsonToHtml();
            this.htmlString += filter.toHtml(this.json.ps);
        },

        genAttributes: function() {
            // TODO Implement it .
            return "";
        }

    });
    return Cell;
});
