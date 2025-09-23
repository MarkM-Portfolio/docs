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
    "dojo/dom",
    "dojo/dom-style",
    "dojo/has",
    "concord/util/BidiUtils",
    "concord/util/browser",
    "writer/plugins/Plugin",
    "dijit/registry",
    "dijit/CheckedMenuItem"
], function(declare, dom, domStyle, has, BidiUtils, browser, Plugin, registry, CheckedMenuItem) {

    var Zoom = declare("writer.plugins.Zoom", Plugin, {
        init: function() {
            var zoomCmd = {
                exec: function(zoom) {
                    if (zoom != pe.lotusEditor.getScale()) {
                        pe.lotusEditor.inZoom = true;

                        pe.lotusEditor.setScale(zoom);

                        pe.scene.updateEditor();

                        var doc = browser.getEditAreaDocument();
                        var transform = "transform",
                            zoomVal = "scale(" + zoom + ")";
                        if (has("webkit"))
                            transform = "-webkit-transform";
                        else if ((has("ie") || has("trident")))
                            transform = "-ms-transform";

                        var editorNode = dom.byId("editor", doc); // doc.body
                        domStyle.set(editorNode, transform, zoomVal);
                        pe.lotusEditor.inZoom = false;
                    }
                }
            };

            this.editor.addCommand("Zoom", zoomCmd);
            var isArabic = window.BidiUtils.isArabicLocale();
            var zoomMenu = registry.byId("D_m_Zoom");
            var zoomBtn = registry.byId("D_t_Zoom");
            if (!zoomBtn) {
            	return;
            }
            zoomBtn.setLabel(isArabic ?  window.BidiUtils.convertArabicToHindi("100%") : "100%");
            var checkedMenu = null;

            var zoomVal = [0.5, 0.75, 0.9, 1.0, 1.25, 1.5, 2.0];
            var zoomLabel = ["50%", "75%", "90%", "100%", "125%", "150%", "200%"];
            var dirAttr = window.BidiUtils.isGuiRtl() ? 'rtl' : '';
            for (var i = 0; i < zoomVal.length; i++) {
                if (isArabic)
                	zoomLabel[i] = window.BidiUtils.convertArabicToHindi(zoomLabel[i]);

                var zoom = zoomVal[i];
                var newId = "D_i_" + zoom;
                var checked = false;
                if (zoom == 1.0)
                    checked = true;
                var subMenu = new CheckedMenuItem({
                    id: newId,
                    _data: zoom,
                    checked: checked,
                    label: zoomLabel[i],
                    onClick: function() {
                        zoomBtn.setLabel(this.label);
                        checkedMenu.set("checked", false);
                        checkedMenu = this;
                        checkedMenu.set("checked", true);
                        pe.lotusEditor.execCommand("Zoom", this._data);
                    },
                    dir: dirAttr
                });
                zoomMenu.addChild(subMenu);
                if (checked)
                    checkedMenu = subMenu;
            }
        }
    });
    return Zoom;
});
