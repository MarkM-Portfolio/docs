/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.util.strings");
dojo.require("dojo.string");
dojo.require("concord.util.BidiUtils");

concord.util.strings.getProdName = function() {
	// This variable can be retrieved by jsp from one configure file
	var prodName = "Docs";
	if (window.g_prodName) 
		prodName = window.g_prodName;
	
	return prodName;
};

concord.util.strings.getDefaultFileFormatStr = function(msStr, odfStr) {
	var lowerExt = DOC_SCENE.extension ? DOC_SCENE.extension.toLowerCase() : null;
	
	if(lowerExt && lowerExt == "doc")
	{// reset doc to docx for document
		lowerExt = "docx";
	}
	
	if(lowerExt == "odp" || lowerExt == "ods" || lowerExt == "odt")
	{
		if(BidiUtils.isGuiRtl())
			lowerExt = BidiUtils.LRE + lowerExt;

		return dojo.string.substitute( odfStr, {'FILEEXTENSION' : lowerExt} );
	}  	
	else if(lowerExt == "docx" || lowerExt == "xlsx" || lowerExt == "pptx" ||
			lowerExt == "doc" || lowerExt == "xls" || lowerExt == "ppt" || lowerExt == "xlsm")
	{
		if(BidiUtils.isGuiRtl())
			lowerExt = BidiUtils.LRE + lowerExt;

		return dojo.string.substitute( msStr, {'FILEEXTENSION' : lowerExt} );		
	}	
	else if(lowerExt == "csv" || lowerExt == "txt")
	{// don't handle bidi here for csv and txt
		return lowerExt;
	}
	else
	{
		return DOC_SCENE.extension;	
	}
};
concord.util.strings.getBidiRtlFormatStr = function(str) {
	if(BidiUtils.isGuiRtl())
		str = BidiUtils.LRE + str;

	return str;
};