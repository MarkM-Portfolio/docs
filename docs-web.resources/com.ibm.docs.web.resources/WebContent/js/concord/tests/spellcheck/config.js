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

/*
Copyright (c) 2003-2011, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/
	//load external plugin
    (function() {
        var supported_lang = ['ca','da','de','el','en','es','fi','fr','it','ja','ko','no','nl','pl','pt-br','pt','ru','sv','th','tr','zh','zh-cn','zh-tw'];
    	CKEDITOR.cloneLanguageArray = function()
    	{
    		//Each plugin that needs to be localized has a "lang" member, which has its own specific data
    		//besides this global array. So we cannot simply return "CKEDITOR.config.concord_supported_lang"
    		//here but a clone of it.
    		return (new Array()).concat( supported_lang );
    	}

    	var basePath = CKEDITOR.basePath;
        basePath = basePath.substr(0, basePath.indexOf("ckeditor/")); 
        var plugins = ["concordscayt"];
        for( var i in plugins )
        {
        	var plugin = plugins[i];
        	CKEDITOR.plugins.addExternal(plugin, basePath + "ckplugins/" + plugin + "/","plugin.js");
        }
    })();
CKEDITOR.editorConfig = function( config )
{
	// Define changes to default configuration here. For example:
	 config.language = 'en';

 	config.extraPlugins = 'concordscayt';
	//config.extraPlugins='concordscayt';
	//config.toolbar = [['concordscayt']];
	

};
