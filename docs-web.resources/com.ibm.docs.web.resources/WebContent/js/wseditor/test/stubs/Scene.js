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
dojo.provide("websheet.test.stubs.Scene");
dojo.provide("concord.scenes.SheetDocScene");

dojo.declare("concord.scenes.SheetDocScene", null, {
	getLocale: function() {
		if (window.g_locale) {
			return window.g_locale;
		} else {
			return "en-us";
		}
	},
	
	isViewMode: function(){
		return false;
	},
	sidebarResized: function(){
		
	},
	
	getDocBean: function(){
		if(!this.bean){
			this.bean = {
					setUri: function(uri){
						this.uri = uri;
					},
					getUri: function(){
						return this.uri;
					}	
			};
		}
		return this.bean;
	},
	
	getEditorStore: function(){
		var store = {
				registerListener: function(){},
				getEditorById: function(id){
					return {
						toJSObj: function()
						{
							return {userId:id,color:"#FFF"};
						}
					};
				}
		};
		return store;
	}
});

builders.object([
               [ "pe.scene", new concord.scenes.SheetDocScene() ]
              ], window);
