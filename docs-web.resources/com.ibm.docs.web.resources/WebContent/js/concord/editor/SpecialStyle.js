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

dojo.provide("concord.editor.SpecialStyle");

dojo.declare("concord.editor.SpecialStyle", null, {

});

concord.editor.SpecialStyle.special_stl = function() {
	//applying Japanese font or Korean font to correctly present '\' according to respective locale.
		var style = '';
		var lang = navigator.userLanguage || navigator.language;
		if(lang.indexOf('ja') != -1)
		{
			style = 'JapaneseFont';
		}
		if(lang.indexOf('ko') != -1)
		{
			style = 'KoreanFont';
		}
		return style;
}