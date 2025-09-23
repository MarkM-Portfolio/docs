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
    "writer/filter/HtmlParser",
    "writer/filter/htmlParser/JsonWriter"
], function(declare, htmlParser, JsonWriter) {

    var list = declare("writer.filter.htmlParser.list", JsonWriter, {
        level: 0,
        numId: null,
        /**
         * toJson function
         * @returns
         */
        toJson: function() {
            this.fixBlockChildren();

            var defaultMap = {
                "disc": "circle",
                "circle": "circle",
                "square": "square",
                "decimal": "decimal",
                "lower-roman": "lowerRoman",
                "upper-roman": "upperRoman",
                "lower-alpha": "lowerLetter",
                "upper-alpha": "upperLetter"
            };
            var element = this.element;
            if (!this.numId) {
                var msoListId = element.attributes["cke:listId"],
                    firstChild = element.children[0];
                if (!msoListId) {
                    msoListId = firstChild && firstChild.attributes["cke:listId"];
                }
                if (firstChild && firstChild.attributes["cke:indent"]) {
                    this.level = firstChild.attributes["cke:indent"];
                }

                if (msoListId && htmlParser.listIds[msoListId]) {
                    this.numId = htmlParser.listIds[msoListId];
                } else {
                    var list_type = element.getStyle()["list-style-type"];
                    //map first;
                    list_type = list_type && defaultMap[list_type];

                    if (!list_type) {
                        if (element.name == "ul")
                            list_type = "circle";
                        else
                            list_type = "decimal";
                    }
                    var plugin = null;
                    if (pe.lotusEditor.getPlugin)
                        plugin = pe.lotusEditor.getPlugin("list");
                    if (plugin)
                    {
                        this.numId = plugin.createDefaultList(list_type, this.level, (element.name == "ol"));
                        if (msoListId)
                            htmlParser.listIds[msoListId] = this.numId;
                    }
                }

            }
            for (var i = 0; i < element.children.length; i++) {
                if (!element.children[i].writer || !element.children[i].writer.setList)
                //is not li ..
                    continue;
                else
                    element.children[i].writer.setList(this);
            }
            return JsonWriter.prototype.toJson.apply(this, []);
        },
        /**
         * set parent list item
         * "li"
         * @param list
         */
        setList: function(list) {
            this.level = list.level + 1;
        }
    });


    return list;
});
