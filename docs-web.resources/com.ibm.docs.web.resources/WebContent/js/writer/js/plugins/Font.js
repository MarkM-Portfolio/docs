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
    "dojo/number",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/i18n!concord/widgets/nls/toolbar",
    "dojo/topic",
    "concord/util/BidiUtils",
    "writer/common/RangeIterator",
    "writer/common/tools",
    "writer/constants",
    "writer/core/Event",
    "writer/plugins/Plugin",
    "writer/plugins/Style",
    "writer/util/HelperTools",
    "writer/util/ModelTools",
    "writer/util/RangeTools",
    "dijit/registry",
    "dijit/CheckedMenuItem"
], function(dojoNumber, lang, declare, array, i18nmenubar, i18ntoolbar, topic, BidiUtils, RangeIterator, tools, constants, Event, Plugin, Style, HelperTools, ModelTools, RangeTools, registry, CheckedMenuItem) {


    var Font = declare("writer.plugins.Font", Plugin, {
        _ctxSubMenuFHCreated: false,
        _ctxSubMenuFSCreated: false,
        _ctxSubMenuFFCreated: false,
        _subMenuFH: null,
        _subMenuFS: null,
        _subMenuFF: null,
        sizes: ["8", "9", "10", "11", "12", "14", "16", "18", "20", "22", "24", "26", "28", "36", "48", "72"],
        fontHeadings: ["Normal", "Title", "Subtitle", "Heading1", "Heading2", "Heading3", "Heading4", "Heading5", "Heading6"],
        fontHeadStyles: {},
        fontSizeStyles: {},
        fontNameStyles: {},
        HeadingStyles: {
            "Heading1": {
                "FontFamily": "Arial",
                "fontWeight": "bold",
                "fontSize": "14.0pt"
            },
            "Heading2": {
                "FontFamily": "Arial",
                "fontStyle": "italic",
                "color": "#696969",
                "fontSize": "14.0pt"
            },
            "Heading3": {
                "fontFamily": "Arial",
                "fontWeight": "bold",
                "color": "#696969",
                "fontSize": "12.0pt"
            },
            "Heading4": {
                "fontFamily": "Arial",
                "fontSize": "11.0pt"
            },
            "Heading5": {
                "fontFamily": "Arial",
                "fontStyle": "italic",
                "fontSize": "11.0pt"
            },
            "Heading6": {
                "fontFamily": "Arial",
                "fontWeight": "bold",
                "color": "#696969",
                "fontSize": "10.0pt"
            },
            "Heading7": {
                "fontFamily": "Arial",
                "fontStyle": "italic",
                "color": "#696969",
                "fontSize": "10.0pt"
            },
            "Heading8": {
                "fontFamily": "Arial",
                "fontWeight": "bold",
                "fontSize": "9.0pt"
            },
            "Heading9": {
                "fontFamily": "Arial",
                "fontStyle": "italic",
                "fontSize": "9.0pt"
            },
            "Title": {
                "fontFamily": "Arial",
                "fontSize": "18.0pt"
            },
            "Subtitle": {
                "fontFamily": "Arial",
                "fontStyle": "italic",
                "color": "#696969",
                "fontSize": "16.0pt"
            },
            "Normal": {
                "fontFamily": "Arial",
                "fontSize": "10.0pt"
            }
        },
        bindFontHeadings: function(menu, headStyles, isCtx) {
            var nls = this.menuNls;
            var HeadingStyles = this.HeadingStyles;
            var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
            array.forEach(this.fontHeadings, function(item) {
                var resourceKey = "formatMenu_" + item;
                var newId = isCtx ? "ctx" : "D";
                newId += "_i_Heading_" + item;
                menu.addChild(new CheckedMenuItem({
                    id: newId,
                    _data: item,
                    label: nls[resourceKey],
                    style: HeadingStyles[item],
                    onClick: function() {
                        pe.lotusEditor.execCommand("headingFormat", this._data);
                    },
                    dir: dirAttr
                }));

                var definedStyles = {},
                    headKey = "styleId";
                definedStyles[headKey] = item;
                headStyles[item] = new Style(definedStyles);
            });
            if (isCtx) {
                this._ctxSubMenuFHCreated = true;
            }
            this._subMenuFH = menu;
            return menu;
        },
        bindFontSizes: function(menu, sizestyles, isCtx) {
	    if (!menu) return;
            var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
            var isArabic = window.BidiUtils.isArabicLocale();
            for (var i = 0; i < this.sizes.length; i++) {
                var size = this.sizes[i];
                var sizeLabel = isArabic ? window.BidiUtils.convertArabicToHindi(size) : size;

                var newId = isCtx ? "ctx" : "D";
                newId += "_i_" + size;
                menu.addChild(new CheckedMenuItem({
                    id: newId,
                    _data: size,
                    label: sizeLabel,
                    onClick: function() {
                        pe.lotusEditor.execCommand("fontsize", this._data);
                    },
                    dir: dirAttr
                }));

                var size_style = new Style({
                    'font-size': size + 'pt'
                });
                sizestyles[size] = size_style;
            }
            if (isCtx) {
                this._ctxSubMenuFSCreated = true;
            }
            this._subMenuFS = menu;
            return menu;
        },
        bindFontFamily: function(menu, namestyles, isCtx) {
	    if (!menu) return;
            var fonts = concord.editor.PopularFonts.getLangSpecFont();
            var names = fonts.split(';');
            var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
            for (var i = 0; i < names.length; i++) {
                var parts = names[i].split('/');
                var name = parts[0];
                var value = parts[1] || name;
                var id = isCtx ? "ctx" : "D";
                id += "_i_FONT_" + name;
                menu.addChild(new CheckedMenuItem({
                    id: id,
                    label: name,
                    style: {
                        fontFamily: name
                    },
                    _data: name,
                    onClick: function() {
                        pe.lotusEditor.execCommand("fontname", this._data);
                    },
                    dir: dirAttr
                }));

                var name_style = new Style({
                    'rFonts': {
                        "ascii": value,
                        "hAnsi": value,
                        "eastAsia": value
                    }
                });
                namestyles[name] = name_style;
            }
            if (isCtx) {
                this._ctxSubMenuFFCreated = true;
            }
            this._subMenuFF = menu;
            return menu;
        },
        nls: null,
        init: function() {
            //create drop down buttons in toolbar
            this.nls = i18ntoolbar;
            this.menuNls = i18nmenubar;
            //TODO: hard code toolbar item id
            var fontNameButton = registry.byId("D_t_FontName");
            var fontNameMenu = registry.byId("D_m_FontName");
            var fontStyleMenu = registry.byId("D_m_FontHeading");
            var fontSizeButton = registry.byId("D_t_FontSize");
            var fontSizeMenu = registry.byId("D_m_FontSize");
            var headingButton = registry.byId("D_t_FontHeading");

            var namestyles = this.fontNameStyles;
            var sizestyles = this.fontSizeStyles;
            var headStyles = this.fontHeadStyles;

            this.bindFontFamily(fontNameMenu, namestyles);
            this.bindFontSizes(fontSizeMenu, sizestyles);
            fontStyleMenu && this.bindFontHeadings(fontStyleMenu, headStyles);

            var fontHeadingCmd = {
                exec: function(data) {
                    console.log(data);
                    var style = headStyles[data];
                    if (style) style.applyStyle();
                    else console.log('heading not defined.');
                }
            };
            var fontNameCommand = {
                exec: function(data) {
                    console.log("font name command: " + data);
                    var style = namestyles[data];
                    if (style) {
                        style.applyStyle();

                        var func = selectionChangeHandler;
                        setTimeout(function() {
                            func();
                        }, 0);
                    } else {
                        console.log("name style not found");
                    }
                }
            };

            var fontSizeCommand = {
                exec: function(data) {
                    console.log("font size command: " + data);
                    var style = sizestyles[data];
                    if (style) {
                        style.applyStyle();

                        var func = selectionChangeHandler;
                        setTimeout(function() {
                            func();
                        }, 0);
                    } else {
                        console.log("style not found");
                    }
                }
            };
            this.editor.addCommand("fontname", fontNameCommand);
            this.editor.addCommand("fontsize", fontSizeCommand);
            this.editor.addCommand("fontheading", fontHeadingCmd);
            //		var nls = dojo.i18n.getLocalization("concord.widgets","toolbar");
            //TODO: find all text and check sizes
            var plugin = this;

            var updateHeadingState = function(label) {
                // udpate dropdown menus from toolbar
                var widget = registry.byId("D_t_FontHeading");
                var item = label && label.replace(/\s/g, '');
                var menu = registry.byId('D_m_FontHeading');
                array.forEach(menu.getChildren(), function(c) {
                    c.set("checked", false);
                });
                var widget = registry.byId("D_i_Heading_" + item);
                if (widget)
                    widget.set("checked", true);

                // udpate submenus from menubar			
                var submenuInfos = {
                    "Normal": "D_i_P",
                    "Subtitle": "D_i_ST",
                    "Title": "D_i_T",
                    "Heading1": "D_i_H1",
                    "Heading2": "D_i_H2",
                    "Heading3": "D_i_H3",
                    "Heading4": "D_i_H4",
                    "Heading5": "D_i_H5",
                    "Heading6": "D_i_H6"
                };
                for (var key in submenuInfos) {
                    var widget = registry.byId(submenuInfos[key]);
                    if (widget) {
                        if (plugin.inToc) {
                            widget.set("disabled", true);
                            widget.set("checked", false);
                        } else {
                            widget.set("disabled", false);
                            if (key == item) {
                                widget.set("checked", true);
                            } else {
                                widget.set("checked", false);
                            }
                        }
                    }
                }
            };

            var updateFontSizeState = function(size) {
                var widget = registry.byId("D_t_FontSize");
                var menu = registry.byId('D_m_FontSize');
                array.forEach(menu.getChildren(), function(c) {
                    c.set("checked", false);
                });
                var widget = registry.byId("D_i_" + size);
                if (widget)
                    widget.set("checked", true);
            };

            var updateFontNameState = function(label) {
                var widget = registry.byId("D_t_FontName");
                var parts = label.split('/');
                var name = parts[0];
                var id = "D_i_FONT_" + name;
                var menu = registry.byId('D_m_FontName');
                array.forEach(menu.getChildren(), function(c) {
                    c.set("checked", false);
                });
                var widget = registry.byId(id);
                if (widget)
                    widget.set("checked", true);
            };
            var getStyleBySelection = this.getStyleBySelection = function(bColorStyle) {
                var selection = pe.lotusEditor.getSelection();
                var ranges = selection.getRanges();
                var helperTools = HelperTools,
                    modelTools = ModelTools;
                var fontStyle = {};
                var recordMethod = bColorStyle ? recordColorsStyle : recordFontStyle;
                for (var i = 0; i < ranges.length; i++) {
                    var range = RangeTools.getStyleOperationRange(ranges[i]);
                    var maxParagraphCount = 100; // For performance improvement.
                    var iterator = new RangeIterator(range, maxParagraphCount);
                    var next = iterator.nextModel();
                    var para = null;

                    var startPos = range.getStartParaPos();
                    var isCollapsed = range.isCollapsed();
                    var endPos = isCollapsed ? null : range.getEndParaPos(); // isCollapsed will ignore it.
                    while (next) {
                        if (next.modelType === constants.MODELTYPE.PARAGRAPH) {
                            para = next;
                            var run = next.container.getFirst();
                            while (run) {
                                if (run.isTrackDeleted()){}
                                else if (modelTools.isLinkOrField(run)) {
                                    var runInLink = run.container.getFirst();
                                    while (runInLink) {
                                        if (runInLink.isTrackDeleted()){}
                                        else if (helperTools.isInSelection(runInLink, isCollapsed, startPos, endPos))
                                            fontStyle = recordMethod(para, runInLink, plugin, fontStyle);
                                        runInLink = runInLink.next();
                                    }

                                } else if (modelTools.isImage(run) || modelTools.isBookMark(run)) {
                                    if (isCollapsed) {
                                        if (ret && ret.follow)
                                            fontStyle = recordMethod(para, ret.follow, plugin, fontStyle);
                                    }
                                } else if (!modelTools.isImage(run) && !modelTools.isBookMark(run) && helperTools.isInSelection(run, isCollapsed, startPos, endPos))
                                    fontStyle = recordMethod(para, run, plugin, fontStyle);
                                run = run.next();
                            }
                        } else {
                            if (next.isTrackDeleted()){}
                            else if (modelTools.isLinkOrField(next)) {
                                var runInLink = next.container.getFirst();
                                para = modelTools.getAncestor(next, constants.MODELTYPE.PARAGRAPH);
                                while (runInLink) {
                                    if (runInLink.isTrackDeleted()){}
                                    else if (helperTools.isInSelection(runInLink, isCollapsed, startPos, endPos))
                                        fontStyle = recordMethod(para, runInLink, plugin, fontStyle);
                                    runInLink = runInLink.next();
                                }

                            } else if (modelTools.isImage(next) || modelTools.isBookMark(next)) {
                                if (isCollapsed) {
                                    para = modelTools.getAncestor(next, constants.MODELTYPE.PARAGRAPH);
                                    var ret = next.paragraph.getInsertionTarget(startPos.index);
                                    if (ret && ret.follow)
                                        fontStyle = recordMethod(para, ret.follow, plugin, fontStyle);
                                }
                            } else {
                                if (helperTools.isInSelection(next, isCollapsed, startPos, endPos)) {
                                    para = modelTools.getAncestor(next, constants.MODELTYPE.PARAGRAPH);
                                    fontStyle = recordMethod(para, next, plugin, fontStyle);
                                }
                            }

                        }

                        next = iterator.nextModel();
                    }
                }
                return fontStyle;
            };

            var selectionChangeHandler = function(bColorStyle) {
                var fontStyle = getStyleBySelection(bColorStyle);
                var needUpdate = false;
                var toc_plugin = plugin.editor.getPlugin("Toc");
                var toc_disable = toc_plugin && toc_plugin.getSelectedToc();
                if (this.inToc !== toc_disable) {
                    plugin.inToc = toc_disable;
                    needUpdate = true;
                }
                if (headingButton) {
                	 if (fontStyle.headingValue != null && fontStyle.headingValue != headingButton.get('label')) {
                         headingButton.setLabel(fontStyle.headingValue);
                         needUpdate = true;
                     }
                     if (needUpdate) {
                         updateHeadingState(headingButton.label);
                     }
                }
                if (fontStyle.title != null && fontStyle.title != fontSizeButton.get('label')) {
                    var sizeLabel = window.BidiUtils.isArabicLocale() ? window.BidiUtils.convertArabicToHindi(fontStyle.title) : fontStyle.title;
                    fontSizeButton.setLabel(sizeLabel);
                    updateFontSizeState(fontStyle.title);
                }


                if (fontStyle.fontname != null && fontStyle.fontname != fontNameButton.get('label')) {
                    var ff = fontStyle.fontname;
                    ff = ff.replace(/'|\"/g, "");
                    fontNameButton.setLabel(ff);
                    updateFontNameState(ff);
                }
            };

            var recordColorsStyle = function(para, run, plugin, recordFontStyle) {
                var fontStyle = getPopupButtonsStyle(para, run, plugin);
                recordFontStyle["color"] = recordFontStyle["color"] == null ? fontStyle.foreColor : (recordFontStyle["color"] == fontStyle.foreColor ? recordFontStyle["color"] : '');
                recordFontStyle["backgroundColor"] = recordFontStyle["backgroundColor"] == null ? fontStyle.backgroundColor : (recordFontStyle["backgroundColor"] == fontStyle.backgroundColor ? recordFontStyle["backgroundColor"] : '');
                return recordFontStyle;

            };
            var recordFontStyle = function(para, run, plugin, recordFontStyle) {
                var fontStyle = getFontStyle(para, run, plugin);
                recordFontStyle.headingValue = recordFontStyle.headingValue == null ? fontStyle.headingValue : (recordFontStyle.headingValue == fontStyle.headingValue ? recordFontStyle.headingValue : '');
                recordFontStyle.title = recordFontStyle.title == null ? fontStyle.title : (recordFontStyle.title == fontStyle.title ? recordFontStyle.title : '');
                recordFontStyle.fontname = recordFontStyle.fontname == null ? fontStyle.fontname : (recordFontStyle.fontname == fontStyle.fontname ? recordFontStyle.fontname : '');
                return recordFontStyle;
            };
            var getPopupButtonsStyle = function(para, run, plugin) {
                var headingValue = getHeadingValue(para, plugin);

                var style = run && run.getComputedStyle();

                var fColor = style && style["color"];
                var bColor = style && style["background-color"];
                if (!fColor)
                    fColor = "#000000";
                if (!bColor)
                    bColor = "#FFFFFF";

                return {
                    "foreColor": fColor,
                    "backgroundColor": bColor
                };
            };
            var getFontStyle = function(para, run, plugin) {
                var headingValue = getHeadingValue(para, plugin);

                var style = run && run.getComputedStyle();
                var fontsize = style && style["font-size"];
                if (fontsize) {
                    var ptsize = tools.toPtValue(fontsize);
                    ptsize = dojoNumber.round(ptsize, 1);
                    var title = ptsize + ""; //dojo.string.substitute(plugin.nls.fontSize, [ptsize]);
                }

                //TODO: font-family is not the one to be shown
                var fontname = style && style["font-family"];
                if (fontname)
                    fontname = fontname.split(',')[0];

                return {
                    'headingValue': headingValue,
                    'title': title,
                    'fontname': fontname
                };
            };
            var getHeadingValue = function(para, plugin) {
                var styleId = para.getStyleId();
                var style = pe.lotusEditor.getRefStyle(styleId);
                var headingValue = style && style.getName();
                if (!headingValue || headingValue == "")
                    headingValue = "Normal";
                else {
                    var headingLowCase = headingValue.toLowerCase();
                    if (headingLowCase.indexOf("heading ") == 0) {
                        // Convert heading 1 to Heading1
                        headingValue = "Heading" + headingLowCase.substring("heading ".length, headingLowCase.length);
                    }
                }

                var displayName = plugin.menuNls["formatMenu_" + headingValue] || headingValue;
                return displayName;
            };
            //register selection change event
            topic.subscribe(constants.EVENT.SELECTION_CHANGE, lang.hitch(this, selectionChangeHandler));
        }
    });



    return Font;
});
