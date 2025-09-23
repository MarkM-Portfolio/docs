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
    "concord/util/browser",
    "writer/plugins/ContextMenu",
    "writer/plugins/Save",
    "writer/plugins/Cursor",
    "writer/plugins/FormatPainter",
    "writer/plugins/ImageProperty",
    "writer/plugins/Font",
    "writer/plugins/DeleteKey",
    "writer/plugins/EnterKey",
    "writer/plugins/EscapeKey",
    "writer/plugins/Clipboard",
    "writer/plugins/InsertImage",
    "writer/plugins/Link",
    "writer/plugins/Indicator",
    "writer/plugins/Image",
    "writer/plugins/PageBreak",
    "writer/plugins/Heading",
    "writer/plugins/ParagraphProperties",
    "writer/plugins/Indent",
    "writer/plugins/FindReplace",
    "writer/plugins/SpecialChar",
    "writer/plugins/TableResizer",
    "writer/plugins/SelectAll",
    "writer/plugins/ShortCutKeyHandler",
    "writer/plugins/Styles",
    "writer/plugins/TabKey",
    "writer/plugins/Table",
    "writer/plugins/Text",
    "writer/plugins/UndoManager",
    "writer/plugins/Zoom",
    "writer/plugins/list",
    "writer/plugins/MobileMenu",
], function(declare, browser, ContextMenu, Save, Cursor, FormatPainter, ImageProperty, Font, DeleteKey, EnterKey, EscapeKey, Clipboard, InsertImage, Link,  Indicator, Image, PageBreak, Heading, ParagraphProperties, Indent, FindReplace, SpecialChar, TableResizer, SelectAll, ShortCutKeyHandler, Styles, TabKey, Table, Text, UndoManager, Zoom, list, MobileMenu) {

    var PluginsListBase = declare("writer.plugins.PluginsListBase", null, {
        _controllernames: ["ContextMenu", "Save", "Cursor", "FormatPainter", "ImageProperty", "Font",
                  "DeleteKey", "EnterKey", "EscapeKey", "Clipboard",
                  "InsertImage", "Link", "Indicator", "Image", "PageBreak",
                  "Heading", "ParagraphProperties",
                  "Indent", "FindReplace",
                  "SpecialChar", "TableResizer",
                  "SelectAll", "ShortCutKeyHandler", "Styles", "TabKey", "Table",
                  "Text",  "UndoManager", "Zoom", "list"
              ],
         _classList:[
                  ContextMenu,  Save, Cursor, FormatPainter, ImageProperty, Font, 
                  DeleteKey, EnterKey, EscapeKey, Clipboard,
                  InsertImage, Link, Indicator, Image, PageBreak,
                  Heading, ParagraphProperties,
                  Indent, FindReplace, SpecialChar, TableResizer, 
                  SelectAll, ShortCutKeyHandler, Styles, TabKey, Table,
                  Text, UndoManager, Zoom, list
            ],
        _controllers: null,
        _editor: null,

        constructor: function(editor) {
            if (!editor) {
                throw ("create plugins, editor can't be null!");
            }
            this._editor = editor;
            this._controllers = {};
        },

        load: function(disableNames) {
            var docEditor = this._editor;
            var createParam = {
                editor: docEditor
            };
            if (browser.isMobileBrowser()) {
                this._controllernames.push("MobileMenu");
                this._classList.push(MobileMenu);
            }    
            for (var i = 0 ; i < this._controllernames.length; i++) {
                var name = this._controllernames[i];
                if (disableNames && disableNames.indexOf(name) >= 0) {
                    continue;
                }
                var controller = null;
                var classObj = this._classList[i];
                if (classObj) {
                    controller = new classObj(createParam);
                    if (controller) {
                        this._controllers[name] = controller;
                    }
                }
                if (!controller) {
                    console.log("WARING: controller " + name + " not loaded!!");
                }
            }
            
            var methods = ['init', 'afterInit'];
            for (var m = 0; m < methods.length; m++) {
                for (var i in this._controllers) {
                    var controller = this._controllers[i];
                    if (controller && controller[methods[m]]) {
                        controller[methods[m]]();
                    }
                }
            }
        }
    });
    return PluginsListBase;
});