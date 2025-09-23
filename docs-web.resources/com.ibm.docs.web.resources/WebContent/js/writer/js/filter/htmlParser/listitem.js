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
    "dojo/has",
    "writer/filter/htmlParser/JsonWriter",
    "writer/global"
], function(declare, has, JsonWriter, global) {

    var listitem = declare("writer.filter.htmlParser.listitem", JsonWriter, {
        list: null,
        level: 0,
        /**
         * list is "ol" or "ul"
         * level is the level of list
         * @param list
         */
        setList: function(list) {
            this.list = list;
            this.level = list.level;
        },
        /**
         * toJson function
         * core function when parsing 
         * @returns
         */
        toJson: function() {
            var inlines = null,
                newChildren = [],
                element = this.element;

            function createParagraph(inlines) {
                if (inlines) {
                    var elementModule = global.filterEle;
                    child = new elementModule("p", element.attributes);
                    child.children = inlines;
                    newChildren.push(child);
                }
            }
            for (var i = 0; i < element.children.length; i++) {
                if (!element.children[i]._.isBlockLike || element.children[i].name == "br") {
                    inlines = inlines || [];
                    inlines.push(element.children[i]);
                } else {
                    createParagraph(inlines);
                    inlines = null;
                    if (element.children[i].writer && element.children[i].writer.setList)
                        element.children[i].writer.setList(this);
                    newChildren.push(element.children[i]);
                }
            }
            createParagraph(inlines);
            element.children = newChildren;
            for (var i = 0; i < element.children.length; i++) {
                if (element.children[i].name == "p" && this.list && element.children[i].writer)
                    element.children[i].writer.setNumId(this.list.numId, this.list.level);
                if ((has("ie") || has("trident")) && element.attributes["style"]) {
                    element.children[i].attributes["style"] = element.attributes["style"];
                }
            }

            return JsonWriter.prototype.toJson.apply(this, []);
        }
    });


    return listitem;
});
