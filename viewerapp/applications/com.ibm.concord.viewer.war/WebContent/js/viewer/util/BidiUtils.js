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

dojo.provide("viewer.util.BidiUtils");

dojo.declare("viewer.util.BidiUtils", null, {
	isRtl: null,
	
	init: function(){
		if(this.isRtl == null) {
			!g_locale && (g_locale = dojo.locale || navigator.userLanguage || navigator.language);
			this.isRtl = 	(g_locale.substr(0,2) == 'he') ||
							(g_locale.substr(0,2) == 'iw') ||
							(g_locale.substr(0,2) == 'ar');
		}
	},
	isGuiRtl: function(){
		if (this.isRtl == null)
			this.init();
		return this.isRtl;
	}
});
(function(){
        BidiUtils = new viewer.util.BidiUtils();   
})();