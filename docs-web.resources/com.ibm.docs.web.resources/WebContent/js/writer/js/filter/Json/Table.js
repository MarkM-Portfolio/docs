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

    var Table = declare("writer.filter.Json.Table", Element, {
        toHtml: function() {
            this.startElement("table");
            this.addContent();
            this.endElement();

            return this.htmlString;
        },

        startElement: function(tag) {
            this.tag = tag;
            this.genAttributes();
            this.htmlString = "<" + tag + " " + this.attributes + "><tbody>";
        },

        addContent: function() {
            // Add column group
            var colGrids = this.json.tblGrid;
            var colGroup = "<colgroup>";
            for (var i = 0; i < colGrids.length; i++) {
                colGroup += "<col style='width:" + colGrids[i].w + "' />";
            }
            colGroup += "</colgroup>";
            this.htmlString += colGroup;

            // Add rows
            var filter = new writer.filter.JsonToHtml();
            this.htmlString += filter.toHtml(this.json.trs);
        },

        endElement: function() {
            this.htmlString += "</tbody></" + this.tag + ">";
        },

        genAttributes: function() {
            // TODO Implement it.
            //		this.attributes = "";
        }
    });
    return Table;
});
