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
    "concord/util/browser",
    "writer/plugins/PluginsListBase"
], function(declare, lang, browser, PluginsList) {

    var PluginsLoader = declare("writer.plugins.PluginsLoader", null, {

        _editor: null,
        _disable4View: ["ContextMenu", "MobileMenu", "TableResizer", "ImageProperty"],
        constructor: function(editor) {
            if (!editor) {
                throw ("create plugins, editor can't be null!");
            }
            this._editor = editor;
            this._pluginBranch = [];  
        },

        /**
         * get plugin
         * @param name
         * @returns
         */
        getPlugin: function(name) {
        	var plugin = null;
        	for(var i=0;i<this._pluginBranch.length;i++) {
        		var branch = this._pluginBranch[i];
        		if(branch._controllers[name]){
        			plugin = branch._controllers[name];
        			break;
        		}
        	}
            return plugin;
        },

        loadAll: function(onlyRead) {
        	var _disable4View = (onlyRead ? this._disable4View : null );
           	var basePlugin = new PluginsList(this._editor);
           	basePlugin.load(_disable4View);
           	this._pluginBranch.push(basePlugin);
            
            if(writer.plugins.PluginsListExt){
            	var extPlugin = new writer.plugins.PluginsListExt(this._editor);
            	extPlugin.load();
            	this._pluginBranch.push(extPlugin);
            }
        },
    });
    return PluginsLoader;
});
