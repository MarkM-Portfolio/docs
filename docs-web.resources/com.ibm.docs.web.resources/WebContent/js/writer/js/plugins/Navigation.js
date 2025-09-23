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
    "writer/core/Range",
    "writer/plugins/Plugin",
    "writer/util/ModelTools",
    "writer/util/ViewTools",
    "writer/util/RangeTools",
    "writer/ui/sidebar/NavigationPane",
    "writer/constants",
    "dojo/topic"
], function(declare, lang, Range, Plugin, ModelTools,ViewTools, RangeTools, NavigationPane, constants, topic) {

    var Navigation = declare("writer.plugins.Navigation", Plugin, {
        init: function() {
            //Merge paragraph
            var tools = ModelTools;
            //current plugin
            var cplugin = this;

            var naviCmdFn = function() {
                if (!this.naviPanel) {
                	if(pe.scene.isShowNaviPanel()){
                        var editorFrame = dojo.byId("editorFrame");
                        if (editorFrame) {
                            var vNode = dojo.create("div", { id: "navigation_pane_div" });
                            dojo.place(vNode, editorFrame, "before");
                            this.naviPanel = new NavigationPane({}, vNode);
                        }
                	}
                }
                this.naviPanel && this.naviPanel.toggle();
            };

            var naviCmd = {
                exec: function(sChanged) {
                	if(pe.scene && pe.scene.isShowNaviPanel){
                    	if(sChanged)
                    		pe.scene.setShowNaviPanel(!pe.scene.isShowNaviPanel());
                    	naviCmdFn(sChanged);
                	}
                }
            };

            this.editor.addCommand("toggleNavigation", naviCmd);
        }
    });
    

    return Navigation;
});
