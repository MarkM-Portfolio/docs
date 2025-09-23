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
    "writer/filter/htmlParser/JsonWriter"
], function(declare, JsonWriter) {

    var textportion = declare("writer.filter.htmlParser.textportion", JsonWriter, {
        constructor: function(element) {
            var that = this;
            this.element.getTextFormats = function() {
                var styles = this.cssStyleToJson(this.attributes.style);
                //own format
                var fmt = {};
                fmt.rt = this.getRunType();
                fmt.l = this.getText().length;
                fmt.s = 0;
                if (this.attributes["cke_tab"] || (this.attributes["class"] && this.attributes["class"].toLowerCase() == "apple-tab-span")) {
                    fmt.tab = {
                        "t": "tab"
                    };
                }
                var supported = ["font-size", "font-weight", "font-style", "font-family", "background-color", "text-decoration", "color"];
                fmt.style = {};
                for (var i = 0; i < supported.length; i++) {
                    //only set supported styles
                    var styleName = supported[i];
                    if (styles[styleName]) {
                        if (styleName == "font-size") {
                            var v = styles[styleName].toLowerCase();
                            if (v.indexOf("pt") == -1 || v.indexOf("px") == -1) {
                                if (v.indexOf("em") > 0)
                                    v = parseFloat(v) * 10 + "pt";
                                else
                                    v = parseFloat(v) + "pt";
                                fmt.style[styleName] = v;
                            } else
                                fmt.style[styleName] = styles[styleName];
                        } else
                            fmt.style[styleName] = styles[styleName];
                    }
                }
                if (fmt.rt == "hyperlink") {
                    var href = this.attributes.href;
                    if (href && (href.indexOf("javascript:")) == 0)
                    {
                        fmt.rt = "rPr";
                    }
                    else
                        fmt.src = href || "";
                }
                return that._mergeChildrenFormats(fmt);
            };

            this.element.getRunType = function() {
                switch (this.name) {
                    case "a":
                        return "hyperlink";
                        break;
                    default:
                        return "rPr";
                        break;
                }
            };
        },
        /**
         * to json 
         * rich text runs
         */
        toJson: function() {
            return {
                'c': this.element.getText(),
                'fmt': this.element.getTextFormats()
            };
        },

        /**
         * get children formats
         */
        _getChildrenFormats: function() {

            var fmts = [],
                childFormats, i, children = this.element.children;
            for (i = 0; i < children.length; i++) { //add children fmts
                if (children[i].getTextFormats)
                    fmts = fmts.concat(children[i].getTextFormats());
                else if (children[i].name == "br") {
                    fmts.push({
                        "rt": "rPr",
                        "s": 0,
                        "l": 1,
                        "br": {
                            "t": "br"
                        }
                    });
                } else
                    console.error("wrong parser??");
            }
            return fmts;
        },
        
        _setParentStyleToChild: function(parentStyle, fmt)
        {
            if (fmt.rt == "hyperlink")
            {
                if (fmt.fmt && fmt.fmt.length)
                {
                    for (var i = 0; i < fmt.fmt.length; i++) {
                        var fmt2 = fmt.fmt[i];
                        this._setParentStyleToChild(parentStyle, fmt2);
                    }
                }
            }  
            else
            {
                if (!fmt.style)
                   fmt.style = parentStyle;
                else {
                    for (styleName in parentStyle) {
                        if (!fmt.style[styleName])
                            fmt.style[styleName] = parentStyle[styleName];
                    }
                }
            }
        },
        /**
         * merge children formats
         */
        _mergeChildrenFormats: function(ownFmt) {
            if (ownFmt.tab)
                return [ownFmt];

            var fmts = this._getChildrenFormats();
            var parentStyle = ownFmt.style;

            for (i = 0; i < fmts.length; i++) {
                var fmt = fmts[i];
                this._setParentStyleToChild(parentStyle, fmt);
            }
            if (this.element.name == "a") {
                ownFmt.fmt = fmts;
                delete ownFmt.style;
                return [ownFmt];
            }
            return fmts;
        }
    });


    return textportion;
});
