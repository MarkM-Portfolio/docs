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
    "writer/filter/Json/Element",
    "writer/filter/Json/Paragraph",
    "writer/global"
], function(declare, Element, Paragraph, g) {

    var Div = declare("writer.filter.Json.Div", Element, {
        toHtml: function() {
            this.startElement("div");
            var contents = [];
            if (this.json.t == "sdt") {
                contents = this.json.sdtContent;
            }
            var c = "";
            for (var i = 0; i < contents.length; i++) {
                var factor = g.copy_json_factory;
                var block = factor.createBlock(contents[i]);
                if (block) {
                    c += block.toHtml();
                }
            }
            this.htmlString += c;

            this.endElement();

            return this.htmlString;
        }

    });
    return Div;
});
