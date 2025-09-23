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
    "dojo/string",
    "dojo/has",
    "dojo/i18n!concord/widgets/nls/toolbar",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/i18n!concord/widgets/nls/CKResource",
    "dojo/dom-construct",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom",
    "dojo/aspect",
    "dojo/i18n!writer/ui/dialog/nls/FindReplaceDlg",
    "dojo/on",
    "dojo/query",
    "dojo/topic",
    "dijit/_base/wai",
    "dijit/form/ToggleButton",
    "dijit/Toolbar",
    "dijit/ToolbarSeparator",
    "dijit/registry",
    "dijit/MenuItem",
    "dijit/form/Button",
    "writer/ui/menu/Menu",
    "concord/util/BidiUtils",
    "writer/constants",
    "writer/core/Listener",
    "writer/core/Event",
    "writer/ui/toolbar/DropDownButton",
    "writer/ui/widget/CellBorder",
    "writer/ui/widget/MenuTooltip",
    "writer/ui/widget/ToggleButtonEx",
    "writer/global",
    "writer/ui/widget/ListStyle", "writer/ui/widget/TablePicker", "writer/ui/widget/ColorPalette", "writer/ui/widget/ButtonDropDown"
], function(dojoString, has, i18ntoolbar, i18nmenubar, i18nCKResource, domConstruct, declare, array, domClassModule, lang, domStyle, dom, aspect, i18nFindReplaceDlg, on, query, topic, wai, ToggleButton, djToolbar, ToolbarSeparator, registry, MenuItem, Button, Menu, BidiUtilsModule, constants, Listener, Event, DropDownButton, CellBorder, MenuTooltip, ToggleButtonEx, global, ListStyle, TablePicker, ColorPalette, ButtonDropDown) {

    var ToolbarConstant = {
        ToolbarMode: {
            ALL: 1,
            LIGHT: 2
                //          XXX : 4
        },

        ToolbarType: {
            BUTTON: 1,
            DROPDOWNBUTTON: 2,
            DROPDOWNBUTTON_STRING: 3,
            SEPERATOR: 4,
            TOGGLEBUTTON: 5,
            BUTTONDROPDOWN: 6,
            TOGGLEBUTTONEX: 7
        },

        ToolbarGroup: {
            TOOLS: 1,
            CHAR_FORMATTING: 2,
            PARA_FORMATTING: 3,
            INSERT: 4,
            BORDER_TYPE: 5
        }
    };

    global.ToolbarConstant = ToolbarConstant;

    var getAlignConfig = function() {
        var nls = i18ntoolbar;
        var menuStrs = i18nmenubar;
        var macShortCuts = has("mac") ? "_Mac" : "";
        var alignConfig = [{
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_LeftAlign",
            command: "justifyleft",
            accelKey: menuStrs.accel_formatMenu_Left + macShortCuts,
            title: nls.leftAlignTip,
            label: nls.leftAlignTip,
            iconClass: "docToolbarIcon leftIcon",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_CenterAlign",
            command: "justifycenter",
            accelKey: menuStrs.accel_formatMenu_Center + macShortCuts,
            title: nls.centerTip,
            label: nls.centerTip,
            iconClass: "docToolbarIcon centerIcon",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_RightAlign",
            command: "justifyright",
            accelKey: menuStrs.accel_formatMenu_Right + macShortCuts,
            title: nls.rightAlignTip,
            label: nls.rightAlignTip,
            iconClass: "docToolbarIcon rightIcon",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_JustifyAlign",
            command: "justifyblock",
            accelKey: menuStrs.accel_formatMenu_Justify + macShortCuts,
            title: nls.justifyTip,
            label: nls.justifyTip,
            iconClass: "docToolbarIcon justifyIcon",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }];
        return alignConfig;
    };

    global.getAlignConfig = getAlignConfig;

    var getToolbarConfig = function() {

        //  nls :'Test!',
        //  Group: //the different group should be in seperated by toolbar seperator 
        //  for drop down button: if drop down is a widget, create it by id and set it to dropDown
        //                        if drop down is a string, set the string as dropDown directly
        //                        methodName is used to lazy load drop down widget
        //                        focusMethod is used to set focus on the drop down menu    
        var nls = i18ntoolbar;
        var menuStrs = i18nmenubar;
        var macShortCuts = has("mac") ? "_Mac" : "";
        var arr1 = [
            //   {
            //          type: ToolbarConstant.ToolbarType.BUTTON,
            //          id: "D_t_Save",
            //          title: nls.saveTip, 
            //          command: "saveDraft",
            //          iconClass: "docToolbarIcon saveIcon",
            //          group: ToolbarConstant.ToolbarGroup.TOOLS
            //  },
            {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Undo",
                title: nls.undoTip,
                label: nls.undoTip,
                command: "undo",
                accelKey: menuStrs.accel_editMenu_Undo + macShortCuts,
                //disabled: true,
                iconClass: "docToolbarIcon undoIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Redo",
                title: nls.redoTip,
                label: nls.redoTip,
                command: "redo",
                accelKey: menuStrs.accel_editMenu_Redo + macShortCuts,
                //disabled: true,
                iconClass: "docToolbarIcon redoIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            },

            {
                type: ToolbarConstant.ToolbarType.TOGGLEBUTTONEX,
                id: "D_t_FormatPainter",
                command: "formatPainter",
                //      accelKey: dojo.isMac ?   menuStrs.accel_formatMenu_Textprop_FormatPainter_Mac : menuStrs.accel_formatMenu_Textprop_FormatPainter,
                title: nls.formatPainter,
                iconClass: "docToolbarIcon formatPainterIcon",
                label: nls.formatPainter,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            },
            //  {
            //      type:ToolbarConstant.ToolbarType.BUTTON,
            //      id:"D_t_Comment",
            //      //TODO: enable when implemented
            //      disabled: true,
            //        iconClass: "docToolbarIcon commentIcon",
            //        group: ToolbarConstant.ToolbarGroup.TOOLS
            //}, 
            {
                type: ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
                id: "D_t_Zoom",
                label: nls.zoom,
                showLabel: true,
                title: nls.zoom,
                domClass: 'customizeDropdown',
                //      focusMethod:"this.focusFontName()",
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING

            }, {
                type: ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
                id: "D_t_FontHeading",
                label: nls.selectStyle_Normal,
                showLabel: true,
                title: nls.selectStyleTip,
                domClass: 'customizeDropdown',
                command: "headingFormat",
                //  focusMethod:"this.focusFontName()",
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING

            }, {
                type: ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
                id: "D_t_FontName",
                title: nls.selectFontNameTip,
                showLabel: true,
                label: nls.selectFontNameTip,
                domClass: 'customizeDropdown',
                //  focusMethod:"this.focusFontName()",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING

            }, {
                type: ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
                label: dojoString.substitute(nls.fontSize, [BidiUtils.isArabicLocale() ? BidiUtils.convertArabicToHindi("10") : "10"]),
                showLabel: true,
                id: "D_t_FontSize",
                title: nls.selectFontSizeTip,
                //      focusMethod:"this.focusFontSize()",
                domClass: 'customizeDropdown',
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
            },

            {
                type: ToolbarConstant.ToolbarType.TOGGLEBUTTON,
                id: "D_t_Bold",
                command: "bold",
                accelKey: menuStrs.accel_formatMenu_Textprop_Bold + macShortCuts,
                title: nls.boldTip,
                iconClass: "docToolbarIcon boldIcon",
                label: nls.boldTip,
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.TOGGLEBUTTON,
                id: "D_t_Italic",
                command: "italic",
                accelKey: menuStrs.accel_formatMenu_Textprop_Italic + macShortCuts,
                title: nls.italicTip,
                label: nls.italicTip,
                iconClass: "docToolbarIcon italicIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.TOGGLEBUTTON,
                id: "D_t_Underline",
                command: "underline",
                accelKey: menuStrs.accel_formatMenu_Textprop_Underline + macShortCuts,
                title: nls.underlineTip,
                label: nls.underlineTip,
                iconClass: "docToolbarIcon underlineIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.TOGGLEBUTTON,
                id: "D_t_Strike",
                command: "strike",
                title: nls.strikeThroughTip,
                label: nls.strikeThroughTip,
                iconClass: "docToolbarIcon strikeIcon",
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
                id: "D_t_FontColor",
                title: nls.setFontColorTip,
                label: nls.setFontColorTip,
                iconClass: "docToolbarIcon fontColorIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
                id: "D_t_HighlightColor",
                title: nls.setHighlightColor,
                label: nls.setHighlightColor,
                iconClass: "docToolbarIcon highlightColorIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
            },

            //   {
            //          type:ToolbarConstant.ToolbarType.BUTTON,
            //          id:"D_t_ClearFormat",
            //          command: "clearFormat",
            //          title:nls.clearFormat,
            //          iconClass: "docToolbarIcon clearFormatIcon",
            //          label:nls.clearFormat,
            //          group: ToolbarConstant.ToolbarGroup.CHAR_FORMATTING
            //   },

            {
                type: ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
                id: "D_t_Align",
                title: nls.leftAlignTip,
                label: nls.leftAlignTip,
                //          focusMethod:"focusAlign",
                accelKey: menuStrs.accel_formatMenu_Left + macShortCuts,
                iconClass: "docToolbarIcon leftIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
                id: "D_t_Direction",
                title: nls.ltrDirectionTip,
                label: nls.ltrDirectionTip,
                iconClass: "cke_button_bidiltr",
                group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
                id: "D_t_BulletList",
                command: "bulletList", // Just for update toolbar status
                title: nls.bulletedListTip,
                label: nls.bulletedListTip,
                iconClass: "docToolbarIcon bulletListIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
                id: "D_t_NumberList",
                command: "numberList", // Just for update toolbar status
                title: nls.numberedListTip,
                label: nls.numberedListTip,
                iconClass: "docToolbarIcon numberListIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
            },
            //   {
            //       type:ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
            //       id:"D_t_MultilevelList",
            //       command:"multiLevelList",
            //       title:nls.multilevelListTip,
            //       label:nls.multilevelListTip,
            //       iconClass:"docToolbarIcon multilevelListIcon",
            //       group:ToolbarConstant.ToolbarGroup.PARA_FORMATTING
            //   },

            {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Indent",
                title: nls.indentTip,
                label: nls.indentTip,
                iconClass: "docToolbarIcon indentIcon",
                command: "indent",
                accelKey: menuStrs.accel_formatMenu_Indent + macShortCuts,
                group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Outdent",
                title: nls.decreaseIndentTip,
                label: nls.decreaseIndentTip,
                iconClass: "docToolbarIcon outdentIcon",
                command: "outdent",
                accelKey: menuStrs.accel_formatMenu_DecreaseIndent + macShortCuts,
                group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
            },
            //{
            //    type:ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
            //    id:"D_t_Border",
            //    title:nls.borderTip,
            //    command:"borderStyle",    // Just for update toolbar status
            //    label:nls.borderTip,
            //    iconClass:"docToolbarIcon borderIcon",
            //    group:ToolbarConstant.ToolbarGroup.PARA_FORMATTING
            //},
            {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_InsertImage",
                command: "uploadimage",
                title: nls.insertImage,
                label: nls.insertImage,
                iconClass: "docToolbarIcon imageIcon",
                group: ToolbarConstant.ToolbarGroup.INSERT
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_InsertLink",
                command: "link",
                title: nls.addLink,
                label: nls.addLink,
                iconClass: "docToolbarIcon linkIcon",
                group: ToolbarConstant.ToolbarGroup.INSERT
            },

            {
                type: ToolbarConstant.ToolbarType.DROPDOWNBUTTON,
                id: "D_t_InsertTable",
                command: "createTableState",
                title: nls.addTableTip,
                label: nls.addTableTip,
                iconClass: "docToolbarIcon tabelStyleIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.INSERT
            }, {
                type: ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
                id: "D_t_AddRow",
                command: "row",
                hidden: true,
                title: nls.insertOrDeleteRowTip,
                label: nls.insertOrDeleteRowTip,
                iconClass: "docToolbarIcon addRowIcon",
                group: ToolbarConstant.ToolbarGroup.INSERT
            }, {
                type: ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
                id: "D_t_AddColumn",
                command: "column",
                hidden: true,
                title: nls.insertOrDeleteColTip,
                label: nls.insertOrDeleteColTip,
                iconClass: "docToolbarIcon addColumnIcon",
                group: ToolbarConstant.ToolbarGroup.INSERT
            }, {
                type: ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
                id: "D_t_ColorCell",
                command: "setTableColor",
                hidden: true,
                title: menuStrs.tableMenu_SetTableColor,
                label: menuStrs.tableMenu_SetTableColor,
                iconClass: "docToolbarIcon colorCellIcon",
                group: ToolbarConstant.ToolbarGroup.INSERT
            }, {
                type: ToolbarConstant.ToolbarType.BUTTONDROPDOWN,
                id: "D_t_CellBorder",
                command: "setCellBorder",
                hidden: true,
                title: nls.setBorderTip,
                label: nls.setBorderTip,
                iconClass: "docToolbarIcon cellBorderIcon",
                group: ToolbarConstant.ToolbarGroup.INSERT
            }

            //, {
            //  type:ToolbarConstant.ToolbarType.BUTTON,
            //  id:"D_t_Image",
            //    iconClass: "docToolbarIcon imageIcon",
            //    command:"uploadimage",
            //    title:nls.insertImage,
            //    group: ToolbarConstant.ToolbarGroup.INSERT
            //}
            //, {
            //  type:ToolbarConstant.ToolbarType.BUTTON,
            //  id:"D_t_Link",
            //    iconClass: "docToolbarIcon linkIcon",
            //    command:"link",
            //    title:nls.addLink,
            //    group: ToolbarConstant.ToolbarGroup.INSERT
            //}

        ];
        return arr1;
    };

    global.getToolbarConfig = getToolbarConfig;

    var getFindBarLeftConfig = function() {
        var nls = i18nFindReplaceDlg;
        var arr1 = [{
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Find_Prev",
                title: nls.pre,
                label: nls.pre,
                iconClass: "docToolbarIcon findPrevIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Find_Next",
                title: nls.next,
                label: nls.next,
                iconClass: "docToolbarIcon findNextIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }

        ];
        return arr1;
    };

    var getFindBarCenterConfig = function() {
        var nls = i18nFindReplaceDlg;
        var arr1 = [{
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Replace",
                title: nls.replace,
                label: nls.replace,
                showLabel: true,
                //disabled: true,
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_ReplaceAll",
                title: nls.replaceAll,
                label: nls.replaceAll,
                showLabel: true,
                //disabled: true,
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }

        ];
        return arr1;
    };

    var getFindBarRightConfig = function() {
        var nls = i18nFindReplaceDlg;
        var arr1 = [{
                type: ToolbarConstant.ToolbarType.TOGGLEBUTTON,
                id: "D_t_MatchCase",
                title: nls.matchCase,
                label: nls.matchCase,
                showLabel: true,
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.TOGGLEBUTTON,
                id: "D_t_MatchWord",
                title: nls.matchWord,
                label: nls.matchWord,
                showLabel: true,
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_FindBarClose",
                title: nls.close,
                label: nls.close,
                iconClass: "docToolbarIcon closeFindIcon",
                mode: ToolbarConstant.ToolbarMode.ALL | ToolbarConstant.ToolbarMode.LIGHT,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }

        ];
        return arr1;
    };

    var createDropDown = function(id) {
        //refer to Font.js, children dropdown menu items are created there
        var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
        var nls = i18ntoolbar;
        if ("D_t_FontName" == id) {
            var fontNameMenu = new Menu({
                id: "D_m_FontName",
                dir: dirAttr
            });
            domClassModule.add(fontNameMenu.domNode, "lotusActionMenu toolbarMenu");
            return fontNameMenu;
        } else if ("D_t_Zoom" == id) {
            var zoomMenu = new Menu({
                id: "D_m_Zoom",
                dir: dirAttr
            });
            domClassModule.add(zoomMenu.domNode, "lotusActionMenu toolbarMenu");
            return zoomMenu;
        } else if ("D_t_FontSize" == id) {
            var fontSizeMenu = new Menu({
                id: "D_m_FontSize",
                dir: dirAttr
            });
            domClassModule.add(fontSizeMenu.domNode, "lotusActionMenu toolbarMenu");
            return fontSizeMenu;
        } else if ("D_t_FontHeading" === id) {
            var headerStyleMenu = new Menu({
                id: "D_m_FontHeading",
                dir: dirAttr
            });
            domClassModule.add(headerStyleMenu.domNode, "lotusActionMenu toolbarMenu");
            return headerStyleMenu;
        } else if ("D_t_AddRow" === id) {
            var rowMenu = new Menu({
                id: "D_m_AddRow",
                dir: dirAttr
            });
            domClassModule.add(rowMenu.domNode, "lotusActionMenu toolbarMenu");
            return rowMenu;
        } else if ("D_t_AddColumn" === id) {
            var columnMenu = new Menu({
                id: "D_m_AddColumn",
                dir: dirAttr
            });
            domClassModule.add(columnMenu.domNode, "lotusActionMenu toolbarMenu");
            return columnMenu;
        } else if ("D_t_Align" === id) {
            var alignMenu = new Menu({
                id: "D_m_Align",
                dir: dirAttr
            });
            var alignConfigs = global.getAlignConfig();
            domClassModule.add(alignMenu.domNode, "lotusActionMenu toolbarMenu");
            var commands = [];
            for (var i = 0; i < alignConfigs.length; i++) {

                var config = alignConfigs[i];
                commands[i] = config.command;
                // pass command into menu item, and use it in onclick, because if use config.command directly, the value may not correct when onClick event happens
                alignMenu.addChild(new MenuItem({
                    id: config.id,
                    title: config.title,
                    label: config.label,
                    command: config.command,
                    // if has accelKey, will not show icon
                    //accelKey: config.accelKey,
                    iconClass: config.iconClass,
                    dir: dirAttr,
                    onClick: function() {
                        pe.lotusEditor.execCommand(this.command);
                    }
                }));
            }
            return alignMenu;
        } else if ("D_t_Direction" === id) {
            var directionMenu = new Menu({
                id: "D_m_Direction",
                dir: dirAttr
            });
            domClassModule.add(directionMenu.domNode, "lotusActionMenu toolbarMenu");
            var nls = i18ntoolbar;
            directionMenu.addChild(new MenuItem({
                id: "D_t_BidiLtr",
                title: nls.ltrDirectionTip,
                label: nls.ltrDirectionTip,
                command: "bidiltr",
                iconClass: "cke_button_bidiltr",
                dir: dirAttr,
                onClick: function() {
                    pe.lotusEditor.execCommand(this.command);
                }
            }));
            directionMenu.addChild(new MenuItem({
                id: "D_t_BidiRtl",
                title: nls.rtlDirectionTip,
                label: nls.rtlDirectionTip,
                command: "bidirtl",
                iconClass: "cke_button_bidirtl",
                dir: dirAttr,
                onClick: function() {
                    pe.lotusEditor.execCommand(this.command);
                }
            }));
            return directionMenu;
        }
        //  else if("D_t_Border" === id){
        //      var borderMenu = new writer.ui.menu.Menu({
        //          id:"D_m_Border"
        //      });
        //      dojo.addClass(borderMenu.domNode, "lotusActionMenu");
        //      return borderMenu;
        //  }
        else if ("D_t_FontColor" === id) {
            var colorPalette = ColorPalette({
                id: "D_m_FontColor",
                colorType: "ForeColor",
                palette: "7x10",
                onChange: function(val) {
                    // Set timer to hide the widget first, then editor will grab focus.
                    if (val == 'autoColor') {
                        if (this._selectedCell >= 0) {
                            domClassModule.remove(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
                            this._selectedCell = -1;
                        }
                    } else
                        this._antoColorNode && domStyle.set(this._antoColorNode, 'border', '');
                    setTimeout(function() {
                        pe.lotusEditor.execCommand("ForeColor", val);
                        query(".docToolbarIcon", registry.byId("D_t_FontColor").domNode).forEach(function(node) {
                            var colorDiv = dom.byId("colordiv");
                            if (!colorDiv) {
                                colorDiv = domConstruct.create("div", {
                                    id: "colordiv",
                                    tabIndex: "-1"
                                }, node);
                                domClassModule.add(colorDiv, 'colorDiv');
                            }
                            if (val == "autoColor" || val == "auto") {
                                colorDiv.style["backgroundColor"] = "transparent";
                                pe.lotusEditor.dropdwonState["color"] = "autoColor";
                            } else {
                                colorDiv.style["backgroundColor"] = val;
                                pe.lotusEditor.dropdwonState["color"] = val;
                            }
                        });
                    }, 10);
                }
            });

            return colorPalette;
        } else if ("D_t_ShadingColor" === id) {
            return new ColorPalette({
                id: "D_m_ShadingColor",
                colorType: "ShadingColor",
                palette: "7x10",
                onChange: function(val) {
                    if (val == 'autoColor') {
                        if (this._selectedCell >= 0) {
                            domClassModule.remove(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
                            this._selectedCell = -1;
                        }
                    } else
                        this._antoColorNode && domStyle.set(this._antoColorNode, 'border', '');
                    setTimeout(function() {
                        pe.lotusEditor.execCommand("ForeColor", val);
                    }, 10);
                }
            });
        } else if ("D_t_HighlightColor" === id) {
            return new ColorPalette({
                id: "D_m_HighlightColor",
                colorType: "HighlightColor",
                palette: "7x10",
                onChange: function(val) {
                    if (val == 'autoColor') {
                        if (this._selectedCell >= 0) {
                            domClassModule.remove(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
                            this._selectedCell = -1;
                        }
                    } else
                        this._antoColorNode && domStyle.set(this._antoColorNode, 'border', '');
                    setTimeout(function() {
                        pe.lotusEditor.execCommand("HighlightColor", val);
                        query(".docToolbarIcon", registry.byId("D_t_HighlightColor").domNode).forEach(function(node) {
                            var colorDiv = dom.byId("highlighcolordiv");
                            if (!colorDiv) {
                                colorDiv = domConstruct.create("div", {
                                    id: "highlighcolordiv",
                                    tabIndex: "-1"
                                }, node);
                                domClassModule.add(colorDiv, 'colorDiv');
                            }
                            if (val == "autoColor" || val == "auto") {
                                colorDiv.style["backgroundColor"] = "transparent";
                                pe.lotusEditor.dropdwonState["backgroundColor"] = "autoColor";
                            } else {
                                colorDiv.style["backgroundColor"] = val;
                                pe.lotusEditor.dropdwonState["backgroundColor"] = val;
                            }
                        });
                    }, 10);
                }
            });
        } else if ("D_t_BulletList" === id) {
            return new ListStyle({
                type: "bulletList"
            });
        } else if ("D_t_NumberList" === id) {
            return new ListStyle({
                type: "numberList"
            });
        } else if ("D_t_MultilevelList" === id) {
            return new ListStyle({
                type: "multilevelList"
            });
        } else if ("D_t_InsertTable" === id) {
            return new TablePicker();
        } else if ("D_t_CellBorder" === id) {
            return new CellBorder();
        } else if ("D_t_ColorCell" === id) {
            return new ColorPalette({
                id: "D_m_ColorCell",
                colorType: "CellColor",
                palette: "7x10",
                onChange: function(val) {
                    if (val == 'autoColor') {
                        if (this._selectedCell >= 0) {
                            domClassModule.remove(this._cells[this._selectedCell].node, "dijitPaletteCellSelected");
                            this._selectedCell = -1;
                        }
                    } else
                        this._antoColorNode && domStyle.set(this._antoColorNode, 'border', '');
                    setTimeout(function() {
                        pe.lotusEditor.execCommand("setTableColor", val);
                        query(".docToolbarIcon", registry.byId("D_t_ColorCell").domNode).forEach(function(node) {
                            var colorDiv = dom.byId("colorcelldiv");
                            if (!colorDiv) {
                                colorDiv = domConstruct.create("div", {
                                    id: "colorcelldiv",
                                    tabIndex: "-1"
                                }, node);
                                domClassModule.add(colorDiv, 'colorDiv');
                            }
                            if (val == "autoColor" || val == "auto") {
                                colorDiv.style["backgroundColor"] = "transparent";
                                pe.lotusEditor.dropdwonState["cellColor"] = "autoColor";
                            } else {
                                colorDiv.style["backgroundColor"] = val;
                                pe.lotusEditor.dropdwonState["cellColor"] = val;
                            }
                        });
                    }, 10);
                }
            });
        } else return null;
    };
    var createFindReplaceToolbar = function(node, _toolbar, whichPart) {
        var id, tWidgets;
        if ("left" == whichPart) {
            id = "D_t_FindReplaceLeft";
            tWidgets = getFindBarLeftConfig();
        } else if ("right" == whichPart) {
            id = "D_t_FindReplaceRight";
            tWidgets = getFindBarRightConfig();
        } else if ("center" == whichPart) {
            id = "D_t_FindReplaceCenter";
            tWidgets = getFindBarCenterConfig();
        }
        if (tWidgets)
            createToolbar(node, _toolbar, id, null, tWidgets);
    };

    global.createFindReplaceToolbar = createFindReplaceToolbar;

    var createToolbar = function(node, _toolbar, id, mode, tWidgets) {
        var toolbarId = id ? id : "D_t";
        var oldToolBar = registry.byId(toolbarId);
        if(oldToolBar){
        	oldToolBar.destroyRecursive();
        }
        var toolbar = new djToolbar({
            id: toolbarId
        });
        wai.setWaiState(toolbar.domNode, "label", "writer");
        var preGroup = null;
        var widgets = tWidgets ? tWidgets : getToolbarConfig();
        var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';

     	if (mode == null) {
    		mode = ToolbarConstant.ToolbarMode.ALL;
    	}

        array.forEach(widgets, function(widget) {
        	if (!widget.mode) {
        		widget.mode = ToolbarConstant.ToolbarMode.ALL;
        	}
        	if (widget.mode & mode) {
        		 var curGroup = widget.group;
                 if (!window.BidiUtils.isBidiOn() && widget.id.indexOf('D_t_Direction') != -1)
                     return;

                 if (window.BidiUtils.isGuiRtl()) {
                     switch (widget.id) {
                         case 'D_t_Undo':
                             widget.iconClass = "docToolbarIcon redoIcon";
                             break;
                         case 'D_t_Redo':
                             widget.iconClass = "docToolbarIcon undoIcon";
                     }
                 }

                 if (!preGroup) {
                     preGroup = curGroup;
                 }
                 if (preGroup != curGroup) {
                     toolbar.addChild(new ToolbarSeparator());
                     preGroup = curGroup;
                 }
                 if (widget.type == ToolbarConstant.ToolbarType.BUTTON) {
                     var label = widget.label ? widget.label : "";
                     var showLabel = widget.showLabel ? widget.showLabel : false;
                     var title = widget.title ? widget.title : "";
                     var icon = widget.iconClass ? widget.iconClass : "";
                     toolbar.addChild(new Button({
                         id: widget.id,
                         title: title,
                         iconClass: icon,
                         accelKey: widget.accelKey,
                         label: label,
                         showLabel: showLabel,
                         value: title,
                         disabled: widget.disabled || false
                     }));
                 } else if (widget.type == ToolbarConstant.ToolbarType.TOGGLEBUTTON) {
                     var label = widget.label ? widget.label : "";
                     var showLabel = widget.showLabel ? widget.showLabel : false;
                     var title = widget.title ? widget.title : "";
                     var icon = widget.iconClass ? widget.iconClass : "";
                     toolbar.addChild(new ToggleButton({
                         id: widget.id,
                         title: widget.title,
                         iconClass: icon,
                         accelKey: widget.accelKey,
                         label: label,
                         showLabel: showLabel,
                         value: title,
                         disabled: widget.disabled || false
                     }));
                 } else if (widget.type == ToolbarConstant.ToolbarType.TOGGLEBUTTONEX) {
                     var label = widget.label ? widget.label : "";
                     var showLabel = widget.showLabel ? widget.showLabel : false;
                     var title = widget.title ? widget.title : "";
                     var icon = widget.iconClass ? widget.iconClass : "";
                     toolbar.addChild(new ToggleButtonEx({
                         id: widget.id,
                         title: widget.title,
                         iconClass: icon,
                         accelKey: widget.accelKey,
                         label: label,
                         showLabel: showLabel,
                         value: title,
                         disabled: widget.disabled || false
                     }));
                 } else if (widget.type == ToolbarConstant.ToolbarType.DROPDOWNBUTTON) {
                     var dropDownWidget = widget.dropDown;
                     if (!widget.dropDown) {
                         dropDownWidget = createDropDown(widget.id);
                     }
                     var label = widget.label ? widget.label : "";
                     var showLabel = widget.showLabel ? widget.showLabel : false;
                     var title = widget.title ? widget.title : "";
                     var icon = widget.iconClass ? widget.iconClass : "";
                     //TODO:
                     //with dropDown as string, rather than a menu or other widget
                     var tmp = null;
                     toolbar.addChild(tmp = new DropDownButton({
                         id: widget.id,
                         iconClass: icon,
                         title: title,
                         label: label,
                         showLabel: showLabel,
                         accelKey: widget.accelKey,
                         value: title,
                         dropDown: dropDownWidget,
                         methodName: widget.methodName,
                         disabled: widget.disabled || false,
                         //  focusMethod:widget.focusMethod,
                         toolbar: _toolbar,
                         dir: dirAttr
                     }));
                     if (widget.domClass)
                         domClassModule.add(tmp.domNode, widget.domClass);

                     wai.removeWaiState(tmp.focusNode, "labelledby");
                     wai.setWaiState(tmp.focusNode, "label", title);
                 } else if (widget.type === ToolbarConstant.ToolbarType.BUTTONDROPDOWN) {
                     var dropDownWidget = widget.dropDown;
                     if (!widget.dropDown) {
                         dropDownWidget = createDropDown(widget.id);
                     }
                     var label = widget.label ? widget.label : "";
                     var showLabel = widget.showLabel ? widget.showLabel : false;
                     var title = widget.title ? widget.title : "";
                     var icon = widget.iconClass ? widget.iconClass : "";
                     toolbar.addChild(new ButtonDropDown({
                         id: widget.id,
                         iconClass: icon,
                         title: title,
                         label: label,
                         showLabel: showLabel,
                         accelKey: widget.accelKey,
                         value: title,
                         dropDown: dropDownWidget,
                         methodName: widget.methodName,
                         disabled: widget.disabled || false,
                         // focusMethod:widget.focusMethod,
                         toolbar: _toolbar,
                         dir: dirAttr
                     }));
                 }

                 var commandName = widget.command;
                 var widgetDom = registry.byId(widget.id);
                 if (commandName && (commandName != 'createTableState' && commandName != 'multiLevelList' && commandName != 'headingFormat')) {
                     on(widgetDom, "Click", lang.hitch(_toolbar, _toolbar.dispatchCmd, commandName));
                 }
                 var domClass = "toolbar_off";
                 if (widget.hidden)
                     domClass = "toolbar_hidden";
                 else if (widget.disabled)
                     domClass = "toolbar_disabled";
                 widgetDom.set('class', domClass);
        	}
        });

        _toolbar.widgets = widgets;
        _toolbar.postCreate();
        toolbar.placeAt(node);
        toolbar.startup();

        if (pe.settings && pe.settings.getToolbar() == pe.settings.TOOLBAR_NONE) {
            _toolbar.toggle(true);
        }

        array.forEach(toolbar.getChildren(), function(w) {
            on(w, "focus", function() {
                // #30610
                var tb = registry.getEnclosingWidget(this.domNode.parentNode);
                if (tb)
                    tb._set("focusedChild", this);
            });
            if (w && w.titleNode) {
                var title = w.titleNode.title;
                if (title) {
                    w.tooltip = new MenuTooltip({
                        widget: w
                    });
                    w._setTitleAttr = function( /*Boolean*/ value) {
                            this._set("title", value);
                        },
                        w.tooltip.setTitleAck(title, w.accelKey);
                    w.titleNode.title = "";
                    w.title = "";
                    w.watch("title", function(name, oldValue, value) {
                        if (this.tooltip && value) {
                            this.tooltip.setTitleAck(value, this.accelKey);
                        }
                        setTimeout(lang.hitch(this, function() {
                            this.titleNode.title = "";
                        }), 10);
                    });
                }
            }
        });


    };

    global.createToolbar = createToolbar;

    var createFloatingToolbar = function(node, editorToolbar) {
        var floatingToolbar = new djToolbar({});
        var nls = i18ntoolbar;

        var floatingItems = [{
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_Image1",
            iconClass: "docToolbarIcon imageIcon",
            command: "uploadimage",
            title: nls.insertImage,
            group: ToolbarConstant.ToolbarGroup.INSERT
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_Link1",
            iconClass: "docToolbarIcon linkIcon",
            command: "link",
            title: nls.addLink,
            group: ToolbarConstant.ToolbarGroup.INSERT
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_Indent1",
            title: nls.indentTip,
            iconClass: "docToolbarIcon indentIcon",
            command: "indent",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_Outdent1",
            title: nls.decreaseIndentTip,
            iconClass: "docToolbarIcon outdentIcon",
            command: "outdent",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_Left1",
            command: "AlignLeft",
            title: nls.leftAlignTip,
            iconClass: "docToolbarIcon leftIcon",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_Center1",
            command: "AlignCenter",
            title: nls.centerTip,
            iconClass: "docToolbarIcon centerIcon",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_Right1",
            command: "AlignRight",
            title: nls.rightAlignTip,
            iconClass: "docToolbarIcon rightIcon",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }, {
            type: ToolbarConstant.ToolbarType.BUTTON,
            id: "D_t_Justify1",
            command: "Justify",
            title: nls.justifyTip,
            iconClass: "docToolbarIcon justifyIcon",
            group: ToolbarConstant.ToolbarGroup.PARA_FORMATTING
        }];

        for (var i = 0; i < floatingItems.length; i++) {
            var widget = floatingItems[i];
            floatingToolbar.addChild(new Button({
                id: widget.id,
                title: widget.title || "",
                iconClass: widget.iconClass || "",
                label: widget.label || "",
                disabled: widget.disabled || false
            }));

            if (i != floatingItems.length - 1 && ((i + 1) % 4) != 0)
                floatingToolbar.addChild(new ToolbarSeparator());

            var commandName = widget.command;
            var widgetDom = registry.byId(widget.id);
            if (commandName) {
                on(widgetDom, "Click", lang.hitch(editorToolbar, editorToolbar.dispatchCmd, commandName));
            }
        }

        // TODO Need update status.
        floatingToolbar.placeAt(node);
        floatingToolbar.startup();
    };

    global.createFloatingToolbar = createFloatingToolbar;

    var getMobileMenuItemConfig = function(isSelectEmpty, hasComments) {
        var nls1 = i18nCKResource;
        var nls2 = i18nmenubar;
        var arr1 = [{
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Mobile_Comments",
                title: nls1.comments.hoverText,
                label: nls1.comments.hoverText,
                showLabel: true,
                commandId: "contextShowComments",
                display:  isSelectEmpty && hasComments,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Mobile_Select",
                title: nls2.ctxMenu_select,
                label: nls2.ctxMenu_select,
                showLabel: true,
                commandId: "contextSelect",
                display:  isSelectEmpty,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Mobile_Cut",
                title: nls2.ctxMenu_cut,
                label: nls2.ctxMenu_cut,
                showLabel: true,
                commandId: "cut",
                display:  !isSelectEmpty,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Mobile_Copy",
                title: nls2.ctxMenu_copy,
                label: nls2.ctxMenu_copy,
                showLabel: true,
                commandId: "copy",
                display:  !isSelectEmpty,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }, {
                type: ToolbarConstant.ToolbarType.BUTTON,
                id: "D_t_Mobile_Paste",
                title: nls2.ctxMenu_paste,
                label: nls2.ctxMenu_paste,
                showLabel: true,
                commandId: "paste",
                display:  !isSelectEmpty,
                group: ToolbarConstant.ToolbarGroup.TOOLS
            }
        ];
        return arr1;
    };
    var createMobileToolbar = function(node, menuId, isSelectEmpty, hasComments) {
        var toolbarId = id ? menuId : "mobile_menu";
        var oldToolBar = registry.byId(toolbarId);
        if(oldToolBar){
        	oldToolBar.destroyRecursive();
        }

        var mobileToolbar = new djToolbar({
            id: toolbarId
        });
        var tWidgets = getMobileMenuItemConfig(isSelectEmpty, hasComments);
        for (var i = 0; i < tWidgets.length; i++) {
            var widget = tWidgets[i];
            var label = widget.label ? widget.label : "";
            var showLabel = widget.showLabel ? widget.showLabel : false;
            var title = widget.title ? widget.title : "";
            var icon = widget.iconClass ? widget.iconClass : "";
            if (widget.display) {
                mobileToolbar.addChild(new Button({
                    id: widget.id,
                    title: title,
                    iconClass: icon,
                    accelKey: widget.accelKey,
                    label: label,
                    showLabel: showLabel,
                    value: title,
                    disabled: widget.disabled || false
                }));
                var commandName = widget.commandId;
                var widgetDom = registry.byId(widget.id);
                if (commandName) {
                    var editor = pe.lotusEditor;
                    on(widgetDom, "Click", lang.hitch(editor, editor.execCommand, commandName));
                }
            }
        }

        mobileToolbar.placeAt(node);
        mobileToolbar.startup();  
    };

    global.createMobileToolbar = createMobileToolbar;

    var Toolbar = declare("writer.ui.toolbar.Toolbar", null, {

        widgets: null,
        base: null,
        multiSelCellFlag: true,
        colorPalleteList: null,
        selectFormatItem: "",
        toolbarMenuCheckState: {},
        toolbarMenuDisableState: {},
        _registerCommand: function() {
            if (this.widgets) {
                var _toolbar = this;
                array.forEach(this.widgets, function(widget) {
                    if (widget.command) {
                        var command = pe.lotusEditor.getCommand(widget.command);
                        if (command) {
                            _toolbar.setToolbarStateById(widget.id, command.getState());

                            var listener = new Listener();
                            listener.startListening(command);
                            listener.notify = function() {
                                _toolbar.setToolbarStateById(widget.id, command.getState());
                            };
                        }
                    }
                });
            }
        },

        postCreate: function() {
            //        dojo.addClass(registry.byId('D_t_Save').domNode,"lotusDijitButtonImg");
            domClassModule.add(registry.byId('D_t_Undo').domNode, "lotusDijitButtonImg");
            domClassModule.add(registry.byId('D_t_Redo').domNode, "lotusDijitButtonImg");
            topic.subscribe(constants.EVENT.LOAD_READY, lang.hitch(this, this._registerCommand));
        },

        dispatchCmd: function(method) {
            if (method == "formatPainter") {
                pe.lotusEditor.execCommand(method, {
                    "toggled": arguments[2]
                });
            } else
                pe.lotusEditor.execCommand(method);
            // Fix issue 38414
            if ((has("ie") || has("trident"))) {
                setTimeout(function() {
                    pe.lotusEditor.focus();
                }, 0);
            }
        },
        checkToolbarById: function(toolbarId, bCheck) {
            var widget = registry.byId(toolbarId);
            if (widget) {
                if (true != bCheck) {
                    bCheck = false;
                }
                widget.set("checked", bCheck);
            }
        },

        disableToolbarById: function(toolbarId, bDisabled) {
            var widget = registry.byId(toolbarId);
            if (true != bDisabled)
                bDisabled = false;
            if (widget) {
                widget.set("disabled", bDisabled);
                if (widget.dropDown && widget.closeDropDown)
                    widget.closeDropDown();
            }
        },
        setToolbarStateById: function(toolbarId, state) {
            var widget = registry.byId(toolbarId);
            if (widget) {
                if (widget.baseClass == "dijitToggleButton") {
                    if (state == constants.CMDSTATE.TRISTATE_DISABLED) {
                        this.disableToolbarById(toolbarId, true);
                    } else if (state == constants.CMDSTATE.TRISTATE_ON) {
                        this.disableToolbarById(toolbarId, false);
                        this.checkToolbarById(toolbarId, true);
                    } else if (state == constants.CMDSTATE.TRISTATE_OFF) {
                        this.disableToolbarById(toolbarId, false);
                        this.checkToolbarById(toolbarId, false);
                    }
                }

                var toolbarClass = 'toolbar_off';
                if (state == constants.CMDSTATE.TRISTATE_DISABLED) {
                    toolbarClass = 'toolbar_disabled';
                    widget.set("disabled", true);
                } else if (state == constants.CMDSTATE.TRISTATE_ON) {
                    widget.set("disabled", false);
                    if (toolbarId == "D_t_BulletList" || toolbarId == "D_t_NumberList") {
                        toolbarClass = 'toolbar_on dijitToggleButton dijitToggleButtonChecked dijitChecked';
                    } else {
                        toolbarClass = 'toolbar_on';
                    }

                } else if (state == constants.CMDSTATE.TRISTATE_HIDDEN) {
                    toolbarClass = 'toolbar_hidden';
                    if (widget.dropDown && widget.closeDropDown)
                        widget.closeDropDown()
                } else {
                    widget.set("disabled", false);
                }
                widget.set('class', toolbarClass);
            }
        },

        //connect focus method, and it will be call back when open drop down
        _connectFocusEvent: function(node, dropDown, focusMethod) {
            var me = this;
            // dropdown on open will call focus function, and by default focus function will move to the first item
            // override it with our own focusMethod.
            aspect.after(node, "openDropDown", lang.hitch(this, function() {
                me.dispatchCmd(focusMethod, true);
            }), true);
            dropDown.autoFocus = false;
        },
        /* show/hide toolbar */
        toggle: function(bPreventStatus) {
            var n = dom.byId("lotus_editor_toolbar");
            var display = domStyle.get(n, "display");
            var toolbarSetting;

            if (display == "none") {
                domStyle.set(n, "display", "");
                toolbarSetting = pe.settings.TOOLBAR_BASIC;
            } else {
                domStyle.set(n, "display", "none");
                toolbarSetting = pe.settings.TOOLBAR_NONE;
            }

            if (pe.settings && !bPreventStatus) {
                pe.settings.setToolbar(toolbarSetting);
            }
        }


    });

    return Toolbar;
});
