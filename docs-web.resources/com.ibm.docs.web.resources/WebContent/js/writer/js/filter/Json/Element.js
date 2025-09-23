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
    "writer/filter/Json/BaseObject"
], function(declare, BaseObject) {

    var Element = declare("writer.filter.Json.Element", BaseObject, {
        tag: null,
        attributes: "",
        styles: "",
        constructor: function(json) {
            if (json._fromClip)
                this.attributes = "_fromClip=" + json._fromClip;
        },
        startElement: function(tag) {
            this.genAttributes();
            this.htmlString = "<" + tag + " " + this.attributes + ">";
            this.tag = tag;
        },

        addContent: function(text) {
            text = text.replace(/&/g, "&amp;").replace(/  /g, " &nbsp;").replace(/ $/g, "&nbsp;").replace(/^ /g, "&nbsp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            this.htmlString += text;
        },

        endElement: function() {
            this.htmlString += "</" + this.tag + ">";
        },

        genAttributes: function() {

        }

    });
    return Element;
});
