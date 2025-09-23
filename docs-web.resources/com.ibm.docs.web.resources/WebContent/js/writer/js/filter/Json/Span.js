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

    var Span = declare("writer.filter.Json.Span", Element, {
        /*
         * json: 
         * {
         *  'c': ....
         *  'fmt': ....
         * }
         */
        toHtml: function() {
            this.startElement("span");
            this.addContent(this.json.c);
            this.endElement();
            return this.htmlString;
        }

    });
    return Span;
});
