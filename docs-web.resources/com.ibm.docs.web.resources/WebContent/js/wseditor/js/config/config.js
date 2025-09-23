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

dojo.provide("websheet.config.config");

websheet.config.config = {
		// A workaround for defect 2183, using | in Regular expressions to add new stop font name, likes: /Wingdings|aaa/
		IE_FONT_STOPLIST:/Wingdings/,
		supportedImages: ['bmp','jpg' , 'jpeg' , 'gif' , 'png'],
		unsupportedImages:['tif'], // the extend type chars should be low case
		supportedTextFileEx: ['txt','csv'],
		SHOW_FONTNAME_IN_TOOLBAR: true
};