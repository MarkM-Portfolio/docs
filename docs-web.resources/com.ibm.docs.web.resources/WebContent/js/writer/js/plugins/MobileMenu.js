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
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/i18n!concord/widgets/nls/CKResource",
    "dojo/i18n!concord/widgets/nls/menubar",
    "dojo/on",
    "writer/ui/toolbar/Toolbar",
    "dijit/registry",
    "writer/global",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/model/comments/CommentService",
], function(declare, domStyle, domConstruct, lang, dom, i18nCKResource , i18nmenubar, on, Toolbar, registry, global, Plugin, ModelTools, CommentService) {
    var MobileMenu = declare("writer.plugins.MobileMenu", Plugin, {
        _menuDivId: "lotus_editor_mobile_menu",
        _menuId: "mobile_menu",       

        init: function() {
            this.editor.MobileMenu = this;
            var contextShowComments = {
                exec: function() {
                    var selection = pe.lotusEditor.getSelection();
                    var cursorContext = selection.getInputPos();
                    if (cursorContext) {
                        var run = cursorContext.run();
                        var runModel = run ? run.model : run;;                       
                        if (ModelTools.hasComments(runModel)) {
                            if (CommentService.getInstance().showSelectComment)
                               CommentService.getInstance().showSelectComment(runModel);
                        }
                    } 
                }
            };
            var contextSelect = {
                exec: function() {
                    var selection = pe.lotusEditor.getSelection();
                    var cursorContext = selection.getInputPos();
                    if (cursorContext) {
                        var cursorInfo = cursorContext.getCursorInfo();
                        var offsetY = cursorInfo.position.y + cursorInfo.length/2; 
                        var point = {x: cursorInfo.position.x, y: offsetY};
                        var ret = pe.lotusEditor.getShell().pickAnything(point);
                        if (ret) {
                            selection.selectOneWord(ret);
                        }
                    }
                }
            };
            this.editor.addCommand("contextShowComments", contextShowComments);
            this.editor.addCommand("contextSelect", contextSelect);
        },
        generateCMD: function() {
            
        },
        createMobileMenu: function(isSelectEmpty, hasComments, x, y) {
            var left = x? x: 100;
            var top = y? y: 100;

            var parent = dom.byId("mainNode");
            
            var style = "left:" + left +"px" + 
                             ";top:" + top + "px" +
                             ";position: absolute" +
                             ";background-color: white" +
                             ";box-shadow:0 0 5PX #AAAAAA;" +
                             ";z-index: 9999" +
                             ";display: block";
            mobileMenuNode = domConstruct.create("div", {
                            "id": this._menuDivId,
                            "style": style,
                            "class": "dijit dijitToolbar docToolbar"
                        });
            parent.insertBefore(mobileMenuNode, dom.byId("ll_sidebar_div"));
            global.createMobileToolbar(mobileMenuNode, this._menuId, isSelectEmpty, hasComments);

        },
        regenerateMobileMenu: function(isSelectEmpty, hasComments, x, y) {
            var menuDiv = dom.byId(this._menuDivId);
            domStyle.set(menuDiv, "left", x+"px");
            domStyle.set(menuDiv, "top", y+"px");            
            global.createMobileToolbar(menuDiv, this._menuId, isSelectEmpty, hasComments);

        },
        show: function(isSelectEmpty, hasComments, x, y) {
            var left = x + dom.byId('editorFrame').offsetLeft;
            var top = y + dom.byId("editorFrame").offsetTop;
            // for iOS browser here get the screenX and screenY no need adjust
            if (concord.util.browser.isIOSBrowser()) {
                left = x;
                top = y;
            }
            var menuDiv = dom.byId(this._menuDivId);
            if (menuDiv) {
                this.regenerateMobileMenu(isSelectEmpty, hasComments, left, top);
            } else {
                this.createMobileMenu(isSelectEmpty, hasComments, left, top);
            }
        },
    });
    return MobileMenu;
});
