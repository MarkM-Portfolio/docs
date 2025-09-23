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
    "dojo/has",
    "writer/filter/dtd",
    "writer/filter/HtmlParser",
    "writer/filter/htmlParser/text",
    "writer/filter/tools",
    "writer/filter/constants",
    "writer/filter/htmlParser/JsonWriter",
    "writer/msg/msgCenter"
], function(declare, lang, has, dtd, HtmlParser, textModule, tools, constants, JsonWriter, msgCenter) {

    var fragmentClazz = declare("writer.filter.htmlParser.fragment", null, {
        constructor: function() {
            /**
             * The nodes contained in the root of this fragment.
             * 
             * @type Array
             * @example var fragment = writer.filter.htmlParser.fragment.fromHtml( '<b>Sample</b>
             *          Text' ); alert( fragment.children.length ); "2"
             */
            this.children = [];

            /**
             * Get the fragment parent. Should always be null.
             * 
             * @type Object
             * @default null
             * @example
             */
            this.parent = null;

            /** @private */
            this._ = {
                isBlockLike: true,
                hasInlineStarted: false
            };
        }
    });


    fragmentClazz.prototype = {
        /**
         * Adds a node to this fragment.
         * 
         * @param {Object}
         *            node The node to be added. It can be any of of the
         *            following types: {@link writer.filter.htmlParser.element},
         *            {@link writer.filter.htmlParser.text} and
         *            {@link writer.filter.htmlParser.comment}.
         * @param {Number}
         *            [index] From where the insertion happens.
         * @example
         */
        add: function(node, index) {
            isNaN(index) && (index = this.children.length);

            var previous = index > 0 ? this.children[index - 1] : null;
            if (previous) {
                // If the block to be appended is following text, trim spaces at
                // the right of it.
                if (node._.isBlockLike && previous.type == constants.NODE_TEXT) {
                    previous.value = tools.rtrim(previous.value);

                    // If we have completely cleared the previous node.
                    if (previous.value && previous.value.length === 0) {
                        // Remove it from the list and add the node again.
                        this.children.pop();
                        this.add(node);
                        return;
                    }
                }

                previous.next = node;
            }

            node.previous = previous;
            node.parent = this;

            this.children.splice(index, 0, node);

            this._.hasInlineStarted = node.type == constants.NODE_TEXT || (node.type == constants.NODE_ELEMENT && !node._.isBlockLike);
        },

        /**
         * Writer json
         */
        writeJson: function(filter) {
            var jsonArray = [];
            var jsonObj;

            var isChildrenFiltered;
            this.filterChildren = function() {
                if (!isChildrenFiltered) {
                    var children = [],
                        child;
                    for (var i = 0; i < this.children.length; i++) {
                        child = this.children[i].filter(filter);
                        if (child) {
                            if (lang.isArray(child))
                                children = children.concat(child);
                            else
                                children.push(child);
                        }
                    }
                    this.children = children;
                    isChildrenFiltered = 1;
                }
            };

            !this.name && filter && filter.onFragment(this);

            /**
             * create all numbering list and 
             * create map for 
             * list id <-- > mso list id
             * only effect when paste from word
             */
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

            var msgs = [];
            for (var mso_id in HtmlParser.listTypes) {
                var list = HtmlParser.listTypes[mso_id];
                var plugin = pe.lotusEditor.getPlugin("list");
                plugin._initTemplate();

                var firstLevl = list[1],
                    isNumbering = false;
                if (list[1] && list[1].listType == 'ol') {
                    isNumbering = true;
                }
                var templateStr = plugin.templatePrefix;
                var templateLvl = isNumbering ? plugin.templateNumLevel : plugin.templateBulletLevel;

                for (var i = 0; i < templateLvl.length; i++) {
                    if (i != 0)
                        templateStr += ",";
                    if (list[i + 1] && list[i + 1].listType) {
                        //have level data
                        isNumbering = list[i + 1].listType == 'ol';
                        var numType = defaultMap[list[i + 1].listStyleType] ||
                            (isNumbering ? "decimal" : "circle");
                        if (isNumbering) {
                            setType = plugin.defaultNumberings[numType];
                            setType = setType.replace("%1", "%" + (i + 1));
                        } else
                            setType = plugin.defaultBullets[numType];
                        templateStr += plugin.lvlPrefix + '"' + i + '",' + setType + ',' + plugin.templateIndent[i];
                    } else
                        templateStr += plugin.lvlPrefix + '"' + i + '",' + templateLvl[i] + ',' + plugin.templateIndent[i];
                }
                templateStr += plugin.tempatePostfix;

                var numJson = JSON.parse(templateStr);

                for (var level in list) {
                    var l = list[level];
                    var levelData = numJson.lvl[level - 1];
                    var indent = levelData.pPr.indent;
                    if (l.left)
                        indent.left = l.left;
                    if (l.hanging)
                        indent.hanging = l.hanging;
                    else
                        indent.hanging = "0pt";

                    if (l.startNum && l.startNum != 1)
                        levelData.start.val = "" + l.startNum;
                    //                  if( l.tabPos ){
                    //                      levelData.pPr.tabs = [{
                    //                          "t": "tab",
                    //                          "val": "num",
                    //                          "pos": l.tabPos
                    //                      }];
                    //                  }
                }
                var numId = plugin._createList(numJson, msgs);
                HtmlParser.listIds[mso_id] = numId;
            }
            if (msgs.length > 0)
                msgCenter.sendMessage(msgs);

            var jsonArray = JsonWriter.prototype.writeBlockContentsJson.apply(null, [this, true]);

            return jsonArray;
        },
        /**
         * Get Json
         */
        getText: function() {
            var text = "";
            for (var i = 0; i < this.children.length; i++) {
                text += this.children[i].getText();
            }
            return text;
        }
    };

    return fragmentClazz;
});
