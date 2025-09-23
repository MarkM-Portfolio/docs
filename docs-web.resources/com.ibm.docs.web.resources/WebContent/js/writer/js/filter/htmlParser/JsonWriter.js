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
    "dojo/_base/lang",
    "writer/global"
], function(lang, global) {

    var JsonWriter = function(element) {
        this.element = element;
    };

    /**
     * jsonWriter base class
     */
    JsonWriter.prototype = {
        toJson: function() {
            var element = this.element;
            if (element._.isBlockLike) {
                return this.writeBlockContentsJson();
            } else
                return element.getText();
        },

        getText: function() {
            if (this.element.name == "br")
                return "\r";
            var text = "",
                children = this.element.children;
            for (var i = 0; i < children.length; i++)
                text += children[i].getText();

            if (text)
                text = text.replace(/[\r\n|\n]/g, "\r");

            return text;
        },
        /*
         * fix inline elements
         * if this element's children must be block element
         */
        fixBlockChildren: function(element) {
            var Ele = global.filterEle;
            element = element || this.element;
            var children = [],
                createP;
            for (var i = 0; i < element.children.length; i++) {
                if (!element.children[i]._.isBlockLike || element.children[i].name == "br") {
                    if (!createP) createP = new Ele("p");
                    createP.children.push(element.children[i]);
                    element.children[i].parent = createP;
                } else {
                    if (createP) {
                        children.push(createP);
                        createP = null;
                    }
                    children.push(element.children[i]);
                }
            }
            if (createP) {
                children.push(createP);
            }
            element.children = children;
        },
        writeBlockContentsJson: function(element, root) {
            var Ele = global.filterEle;
            element = element || this.element;
            var retVal = [],
                createP, json;
            for (var i = 0; i < element.children.length; i++) {
                if (!element.children[i]._.isBlockLike || element.children[i].name == "br") {
                    if (!createP) createP = new Ele("p");
                    createP.children.push(element.children[i]);
                    element.children[i].parent = createP;
                } else {
                    if (createP) {
                        retVal.push(createP.writeJson());
                        createP = null;
                    }
                    json = element.children[i].writeJson();
                    if (json && lang.isArray(json))
                        retVal = retVal.concat(json);
                    else
                        json && retVal.push(json);
                }
            }
            if (createP) {
                var jsonObj = createP.writeJson();
                if (root)
                    jsonObj = {
                        "c": jsonObj.c,
                        "fmt": jsonObj.fmt
                    };
                retVal.push(jsonObj);
            }
            return retVal;
        }
    };

    return JsonWriter;
});
