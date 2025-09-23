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
    "writer/filter/dtd",
    "writer/filter/constants",
    "writer/filter/HtmlParser",
    "writer/filter/htmlParser/cell",
    "writer/filter/htmlParser/fragment",
    "writer/filter/htmlParser/fragmentClz",
    "writer/filter/htmlParser/image",
    "writer/filter/htmlParser/list",
    "writer/filter/htmlParser/listitem",
    "writer/filter/htmlParser/paragraph",
    "writer/filter/htmlParser/row",
    "writer/filter/htmlParser/table",
    "writer/filter/htmlParser/textportion",
    "writer/filter/htmlParser/JsonWriter",
    "writer/global"
], function(lang, dtd, constants, HtmlParser, cell, fragment, fragmentClz, image, list, listitem, paragraph, row, table, textportion, JsonWriter, global) {

    /**
     * A lightweight representation of an HTML element.
     * @param {String} name The element name.
     * @param {Object} attributes And object holding all attributes defined for this element.
     * @constructor
     * @example
     */
    var ele = function(name, attributes) {
        /**
         * The element name.
         * @type String
         * @example
         */
        this.name = name;
        this.attributes = attributes || (attributes = {});

        /**
         * The nodes that are direct children of this element.
         * @type Array
         * @example
         */
        this.children = [];

        var tagName = attributes['data-cke-real-element-type'] || name || '';

        // Reveal the real semantic of our internal custom tag name (#6639).
        var internalTag = tagName.match(/^cke:(.*)/);
        internalTag && (tagName = internalTag[1]);

        var isBlockLike = !!(dtd.$nonBodyContent[tagName] || dtd.$block[tagName] || dtd.$listItem[tagName] || dtd.$tableContent[tagName] || dtd.$nonEditable[tagName] || tagName == 'br'),
            isEmpty = !!dtd.$empty[name];

        this.isEmpty = isEmpty;
        this.isUnknown = !dtd[name];

        /** @private */
        this._ = {
            isBlockLike: isBlockLike,
            hasInlineStarted: isEmpty || !isBlockLike
        };

        this.writer = this.createJsonWriter(name, this);
    };



    // Used to sort attribute entries in an array, where the first element of
    // each object is the attribute name.
    var sortAttribs = function(a, b) {
        a = a[0];
        b = b[0];
        return a < b ? -1 : a > b ? 1 : 0;
    };

    ele.prototype = {
        /**
         * The node type. This is a constant value set to {@link writer.filter.NODE_ELEMENT}.
         * @type Number
         * @example
         */
        type: constants.NODE_ELEMENT,

        /**
         * Adds a node to the element children list.
         * @param {Object} node The node to be added. It can be any of of the
         *      following types: {@link writer.filter.htmlParser.element},
         *      {@link writer.filter.htmlParser.text} and
         *      {@link writer.filter.htmlParser.comment}.
         * @function
         * @example
         */
        add: fragmentClz.prototype.add,

        /**
         * Clone this element.
         * @returns {writer.filter.htmlParser.element} The element clone.
         * @example
         */
        clone: function() {
            return new ele(this.name, this.attributes);
        },

        filter: function(filter) {
            var element = this;
            if (filter) {
                var isChildrenFiltered;
                /**
                 * Providing an option for bottom-up filtering order ( element
                 * children to be pre-filtered before the element itself ).
                 */
                this.filterChildren = function() {
                    if (!isChildrenFiltered) {
                        var children = [],
                            child;
                        for (var i = 0; i < this.children.length; i++) {
                            child = this.children[i].filter(filter);
                            if (child && lang.isArray(child)) {
                                children = children.concat(child);
                            } else
                                child && children.push(child);
                        }
                        this.children = children;
                        isChildrenFiltered = 1;
                    }
                };


                var writeName = element.name;
                if (!(writeName = filter.onElementName(writeName)))
                    return null;

                if (element.name != writeName && writeName) {
                    //rename
                    element.reName(wrteName);
                } else
                    element.name = writeName;


                if (!(element = filter.onElement(element)))
                    return null;

                element.parent = this.parent;

                if (element.name == writeName)
                    return element;

                // If the element has been replaced with something of a
                // different type, then make the replacement write itself.
                if (element.type != constants.NODE_ELEMENT) {
                    return element;
                }

                writeName = element.name;

                // This indicate that the element has been dropped by
                // filter but not the children.
                if (!writeName) {
                    this.filterChildren();
                    // Fix broken parent refs.
                    for (var c = 0, length = this.children.length; c < length; c++)
                        this.children[c].parent = element.parent;
                    return this.children;
                }

            }

            return element;
        },
        //for json writer
        createJsonWriter: function(tagName, element) {
            switch (tagName) {
                case 'p':
                case 'br': //to empty paragraph
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                case 'h6':
                    return new paragraph(element);
                    break;
                case 'li':
                    return new listitem(element);
                    break;
                case 'img':
                    return new image(element);
                    break;
                case 'ol':
                case 'ul':
                    return new list(element);
                    break;
                case 'table':
                    return new table(element);
                    break;
                case 'tr':
                    return new row(element);
                    break;
                case 'td':
                case 'th':
                    return new cell(element);
                    break;
                    //          case 'span':
                    //          case 'em':
                    //          case 'u':
                    //          case 'b':
                    //          case 'i':
                    //          case "strong":
                    //          case "strike":
                    //          case "s":
                    //          case "sup":
                    //          case "sub":
                    //          case "a":
                    //              
                    //              break;
                case "style":
                case "link":
                case "script":
                    return null;
                case "div":
                    if (HtmlParser.isPasteFromWord && (/shape/).test(element.attributes['class'] || ""))
                        return null;
                    else
                        return new JsonWriter(element);
                default:
                    if (!element._.isBlockLike)
                        return new textportion(element);
                    else
                        return new JsonWriter(element);
                    break;
            }
        },
        /**
         * new name
         */
        reName: function(newName) {
            this.name = newName;
            this.writer = this.createJsonWriter(newName, this);
        },

        writeJson: function() {
            if (this.getStyle().display == "none")
                return null;

            if (!this.writer)
                return null;
            else
                return this.writer.toJson.apply(this.writer, arguments);
        },

        /**
         * get style from name
         */
        addStyleFromName: function(styles) {
            switch (this.name) {
                case "u":
                    styles['u'] = {
                        'val': 'single'
                    };
                    break;
                case "i":
                case "em":
                    styles['font-style'] = "italic";
                    break;
                case "strong":
                case "b":
                    styles["font-weight"] = "bold";
                    break;
                case "strike":
                case "s":
                    styles["strike"] = "1";
                    break;
                case "sup":
                    styles["vertical-align"] = "super";
                    break;
                case "sub":
                    styles["vertical-align"] = "sub";
                    break;
                case "a":
                    styles["styleId"] = "Hyperlink";
                    break;
            };
        },
        /**
         * add styles 
         */
        addStylesFromAttibutes: function(styles) {

            var attsMap = {
                "color": "color",
                "face": "font-family",
                "align": "text-align"
            };
            for (var attr in attsMap) {
                if (this.attributes[attr])
                    styles[attsMap[attr]] = this.attributes[attr];
            }
            var value;
            if (value = this.attributes["size"]) {
                var fontSizeTransfer = {
                    '7': '36pt',
                    '6': '24pt',
                    '5': '18pt',
                    '4': '14pt',
                    '3': '12pt',
                    '2': '10pt',
                    '1': '7pt'
                };
                if (fontSizeTransfer[value])
                    styles["font-size"] = fontSizeTransfer[value];
                else {
                    styles["font-size"] = parseInt(value) + "px";
                }
            }
        },
        /**
         * merge children formats
         */
        _mergeChildrenFormats: function(ownFmt) {
            return [ownFmt];
        },
        /**
         * convert css style text to object
         */
        cssStyleToJson: function(cssStyle) {
            var rules = {};
            (cssStyle || '')
            .replace(/&quot;/g, '"')
                .replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
                    function(match, name, value) {
                        name == 'font-family' && (value = value.replace(/["']/g, ''));
                        rules[name.toLowerCase()] = value;
                    });
            this.addStylesFromAttibutes(rules);
            this.addStyleFromName(rules);
            //remove line-height style
            rules["line-height"] && (delete rules["line-height"]);
            rules["letter-spacing"] && (delete rules["letter-spacing"]);

            for (var s in rules) {
                if ((/^mso-/).test(s))
                    delete rules[s];
                if (s == "background" || s == "background-color") {
                    var v = rules[s].replace(/,\s+/g, ',').split(/\s+/)[0];
                    var value = this.toColorValue(v);
                    if (value == "white" || value == "#ffffff" || value == "#FFFFFF")
                    {
                    	// ignore white background
                    }
                	else
                    	rules['background-color'] = value;
                    delete rules[s];
                }
            }
            return rules;
        },
        /**
         * get style
         */
        getStyle: function() {
            if (this.style == null) {
                this.style = this.cssStyleToJson(this.attributes.style);
            }
            return this.style;
        },
        /**
         * is valid css border style
         * @param borderstyle
         * @returns {Boolean}
         */
        isValidBorderStyle: function(borderstyle) {
            var borderStyles = ["none", "hidden", "dotted", "dashed", "solid", "double", "groove", "ridge", "inset", "outset", "inherit"];
            for (var i = 0; i < borderStyles.length; i++) {
                if (borderstyle == borderStyles[i])
                    return true;
            }
            return false;
        },
        /**
         * is valid color ?
         * @param color
         * @returns {Boolean}
         */
        toColorValue: function(color) {
            //is Hex number 
            if (color.match(/^#[0-9A-F]{6}$/i))
                return color;
            //Color names
            var enumColorMaps = {
                "aliceblue": "#F0F8FF",
                "antiquewhite": "#FAEBD7",
                "aqua": "#00FFFF",
                "aquamarine": "#7FFFD4",
                "azure": "#F0FFFF",
                "beige": "#F5F5DC",
                "bisque": "#FFE4C4",
                "black": "#000000",
                "blanchedalmond": "#FFEBCD",
                "blue": "#0000FF",
                "blueviolet": "#8A2BE2",
                "brown": "#A52A2A",
                "burlywood": "#DEB887",
                "cadetblue": "#5F9EA0",
                "chartreuse": "#7FFF00",
                "chocolate": "#D2691E",
                "coral": "#FF7F50",
                "cornflowerblue": "#6495ED",
                "cornsilk": "#FFF8DC",
                "crimson": "#DC143C",
                "cyan": "#00FFFF",
                "darkblue": "#00008B",
                "darkcyan": "#008B8B",
                "darkgoldenrod": "#B8860B",
                "darkgray": "#A9A9A9",
                "darkgreen": "#006400",
                "darkkhaki": "#BDB76B",
                "darkmagenta": "#8B008B",
                "darkolivegreen": "#556B2F",
                "darkorange": "#FF8C00",
                "darkorchid": "#9932CC",
                "darkred": "#8B0000",
                "darksalmon": "#E9967A",
                "darkseagreen": "#8FBC8F",
                "darkslateblue": "#483D8B",
                "darkslategray": "#2F4F4F",
                "darkturquoise": "#00CED1",
                "darkviolet": "#9400D3",
                "deeppink": "#FF1493",
                "deepskyblue": "#00BFFF",
                "dimgray": "#696969",
                "dodgerblue": "#1E90FF",
                "feldspar": "#D19275",
                "firebrick": "#B22222",
                "floralwhite": "#FFFAF0",
                "forestgreen": "#228B22",
                "fuchsia": "#FF00FF",
                "gainsboro": "#DCDCDC",
                "ghostwhite": "#F8F8FF",
                "gold": "#FFD700",
                "goldenrod": "#DAA520",
                "gray": "#808080",
                "green": "#008000",
                "greenyellow": "#ADFF2F",
                "honeydew": "#F0FFF0",
                "hotpink": "#FF69B4",
                "indianred ": "#CD5C5C",
                "indigo": "#4B0082",
                "ivory": "#FFFFF0",
                "khaki": "#F0E68C",
                "lavender": "#E6E6FA",
                "lavenderblush": "#FFF0F5",
                "lawngreen": "#7CFC00",
                "lemonchiffon": "#FFFACD",
                "lightblue": "#ADD8E6",
                "lightcoral": "#F08080",
                "lightcyan": "#E0FFFF",
                "lightgoldenrodyellow": "#FAFAD2",
                "lightgrey": "#D3D3D3",
                "lightgreen": "#90EE90",
                "lightpink": "#FFB6C1",
                "lightsalmon": "#FFA07A",
                "lightseagreen": "#20B2AA",
                "lightskyblue": "#87CEFA",
                "lightslateblue": "#8470FF",
                "lightslategray": "#778899",
                "lightsteelblue": "#B0C4DE",
                "lightyellow": "#FFFFE0",
                "lime": "#00FF00",
                "limegreen": "#32CD32",
                "linen": "#FAF0E6",
                "magenta": "#FF00FF",
                "maroon": "#800000",
                "mediumaquamarine": "#66CDAA",
                "mediumblue": "#0000CD",
                "mediumorchid": "#BA55D3",
                "mediumpurple": "#9370D8",
                "mediumseagreen": "#3CB371",
                "mediumslateblue": "#7B68EE",
                "mediumspringgreen": "#00FA9A",
                "mediumturquoise": "#48D1CC",
                "mediumvioletred": "#C71585",
                "midnightblue": "#191970",
                "mintcream": "#F5FFFA",
                "mistyrose": "#FFE4E1",
                "moccasin": "#FFE4B5",
                "navajowhite": "#FFDEAD",
                "navy": "#000080",
                "oldlace": "#FDF5E6",
                "olive": "#808000",
                "olivedrab": "#6B8E23",
                "orange": "#FFA500",
                "orangered": "#FF4500",
                "orchid": "#DA70D6",
                "palegoldenrod": "#EEE8AA",
                "palegreen": "#98FB98",
                "paleturquoise": "#AFEEEE",
                "palevioletred": "#D87093",
                "papayawhip": "#FFEFD5",
                "peachpuff": "#FFDAB9",
                "peru": "#CD853F",
                "pink": "#FFC0CB",
                "plum": "#DDA0DD",
                "powderblue": "#B0E0E6",
                "purple": "#800080",
                "red": "#FF0000",
                "rosybrown": "#BC8F8F",
                "royalblue": "#4169E1",
                "saddlebrown": "#8B4513",
                "salmon": "#FA8072",
                "sandybrown": "#F4A460",
                "seagreen": "#2E8B57",
                "seashell": "#FFF5EE",
                "sienna": "#A0522D",
                "silver": "#C0C0C0",
                "skyblue": "#87CEEB",
                "slateblue": "#6A5ACD",
                "slategray": "#708090",
                "snow": "#FFFAFA",
                "springgreen": "#00FF7F",
                "steelblue": "#4682B4",
                "tan": "#D2B48C",
                "teal": "#008080",
                "thistle": "#D8BFD8",
                "tomato": "#FF6347",
                "turquoise": "#40E0D0",
                "violet": "#EE82EE",
                "violetred": "#D02090",
                "wheat": "#F5DEB3",
                "white": "#FFFFFF",
                "whitesmoke": "#F5F5F5",
                "yellow": "#FFFF00",
                "yellowgreen": "#9ACD32"
            };
            if (enumColorMaps[color])
                return enumColorMaps[color];
            //is rgb color
            var values, values, i;
            values = color.match(/^rgb\((\d*),(\d*),(\d*)\)$/i);
            if (!values && (values = color.match(/^rgb\((\d*%),(\d*%),(\d*%)\)$/i))) {
                var percent;
                for (i = 1; i < values.length; i++) {
                    if (percent = values[i].match(/(\d+)%/)) { //% value
                        values[i] = Math.round(255 * parseInt(percent[1]) * 0.01);
                    }
                }
            }
            if (values) {
                var hexColor = "#",
                    percent, s;
                for (i = 1; i < values.length; i++) {
                    s = Number(values[i]).toString(16);
                    if (s.length == 1) s = "0" + s;
                    hexColor += s;
                }
                return hexColor;
            }
            //todo: other values??
            return null;
        },
        /**
         * is valid border width
         * @param width
         * @returns {Boolean}
         */
        isValidBorderWidth: function(width) {
            var enumWidthValues = ["thin", "medium", "thick", "inherit"];
            for (var i = 0; i < enumWidthValues.length; i++) {
                if (enumWidthValues[i] == width)
                    return true;
            }
            if (width.match(/^\d*(px|pt|um|cm|in|mm|pc)$/i))
                return true;
            return false;

        },
        getBorder: function() {
            var styles = this.getStyle();
            var borders = {},
                value, that = this;

            function getBorderStyle(css) {
                var s = value.split(/\s+/);
                var width = "0px";
                var style = "none";
                var color = "#000000";
                for (var i = 0; i < s.length; i++) {
                    if (s[i] && that.isValidBorderWidth(s[i]))
                        width = s[i];
                    else if (s[i] && that.isValidBorderStyle(s[i]))
                        style = s[i];
                    else if (s[i] && (s[i] = that.toColorValue(s[i])))
                        color = s[i];
                }
                return {
                    "width": width,
                    "style": style,
                    "color": color
                };
            }
            if (value = styles['border']) {
                v = getBorderStyle(value);
                borders.left = v;
                borders.top = v;
                borders.right = v;
                borders.bottom = v;
            }
            if (value = styles['border-left']) {
                borders.left = getBorderStyle(value);
            }
            if (value = styles['border-top']) {
                borders.top = getBorderStyle(value);
            }
            if (value = styles['border-right']) {
                borders.right = getBorderStyle(value);
            }
            if (value = styles['border-bottom']) {
                borders.bottom = getBorderStyle(value);
            }

            return borders;
        },
        /**
         * Get Text
         */
        getText: function() {
            if (this.writer)
                return this.writer.getText();
            else
                return "";
        },
        /**
         * Get Width
         */
        getWidth: function() {
            return this.getStyle().width;
        }

    };

    global.filterEle = ele;
    return ele;
});
