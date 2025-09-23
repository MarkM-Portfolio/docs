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

dojo.provide("pres.editor.model.Selection");

dojo.declare("pres.editor.model.Selection", null, {

	bCollapsed : true,
	
	constructor: function(){
		
		this.start = {
			lineIndex : null,//which line
			//textOffset : null,//spanTextOffset,
			lineTextOffset : null//which position in character in line
		};
		this.end = {
			lineIndex : null,//which line
			//textOffset : null,//spanTextOffset,
			lineTextOffset : null//which position in character in line
		};
	}
	
});
