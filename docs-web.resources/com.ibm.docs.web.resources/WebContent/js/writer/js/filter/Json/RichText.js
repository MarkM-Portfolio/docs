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
    "dojo/_base/lang",
    "writer/filter/Json/BaseObject",
    "writer/filter/Json/Span"
], function(declare, lang, BaseObject, Span) {

    var RichText = declare("writer.filter.Json.RichText", BaseObject, {
        tag: null,
        attributes: "",
        constructor: function(json) {},

        toHtml: function() {
            var fmts = this.json.fmt;
            var c, start = 0,
                text = this.json.c,
                span, l;
            this.htmlString = "";
            for (var i = 0; i < fmts.length; i++) {
                l = parseInt(fmts[i].l);
                c = text.substr(start, l);
                start += l;

                if (c == "\r") {
                    //enter 
                    if (this.json._fromClip && i == 0)
                        this.htmlString += "<br " + "_fromClip=" + this.json._fromClip + "></br>";
                    else
                        this.htmlString += "<br/>";
                } else if (l != 0) {
                    if (c.length == 1) {
                        var rt = fmts[i].rt || fmts[i].t;
                        switch (rt) {
                            case "txbx":
                            case "wgp":
                            case "wpc":
                            case "grpSp":
                                c = " ";
                                break;
                        }
                    }
                    var spanJson = {
                        'c': c,
                        'fmt': lang.clone(fmts[i])
                    };
                    //first element
                    if (this.json._fromClip && (start - l) == 0)
                        spanJson._fromClip = this.json._fromClip;

                    span = new Span(spanJson);
                    this.htmlString += span.toHtml();
                }
            }
            return this.htmlString;
        }
    });
    return RichText;
});
