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

    var Paragraph = declare("writer.filter.Json.Paragraph", Element, {
        toHtml: function() {
            this.startElement("p");
            if (this.json.c == "")
                this.addContent(" ");
            else
                this.addContent(this.json.c);
            this.endElement();
            return this.htmlString;
        }

    });
    return Paragraph;
});
