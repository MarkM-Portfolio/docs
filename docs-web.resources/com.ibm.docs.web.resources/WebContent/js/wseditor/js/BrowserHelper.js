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

dojo.provide("websheet.BrowserHelper");
dojo.require("concord.editor.CharEquivalence");
dojo.require("concord.editor.CJKWidthCharMap");
dojo.require("websheet.Constant");
websheet.BrowserHelper = {
	charEQ: new concord.editor.CharEquivalence,
	charCJKWidthMap:new concord.editor.CJKWidthCharMap,
	
	/**
	/**
     * Decompose the combinition of characters according to specific 
     * language settings on browser. Only support GERMANY and JAPANESE 
     * locale now.
     */
	_decomposeByLocale: function(text) {
		var locale = websheet.Helper.getLocale();
        if (locale.indexOf('de') != -1){
			if (this.charEQ) text = this.charEQ.decompose_de(text);
		}
        if (locale.indexOf('ja')!=-1){
        	if (this.charEQ){
        		text = this.charEQ.decompose_ja(text);
        	}
        }
        
		return text;
	},
	
	/**
     * Combine the characters according to specific language settings 
     * on browser. Only support LATIN and JAPANESE locale now.
     */
	_composeByLocale: function(text){
		var locale = websheet.Helper.getLocale();
	    if (locale.indexOf('ja')!=-1){ //ja
	    	if (this.charEQ&&this.charCJKWidthMap){
	        	text=this.charCJKWidthMap.strToHarf(text);
	    		text = this.charEQ.normalize_ja(text);
	        }
	     }
	    else if (this.charEQ){ //latin
	    	text = this.charEQ.normalize_latin(text);
	    }	    	
	        
        return text;
	},
	
	/*boolean*/_hasCombination: function(c,mark){
		var locale = websheet.Helper.getLocale();
		var ret=false;
		if(this.charEQ&&locale.indexOf('ja')!=-1){ //ja
			ret=this.charEQ.hasCombination_ja(c,mark);
		}
		
		return ret;
	},
	
	//[4307] Handle special combination of Ja and De locale
	shortenName4Display: function(title,maxLen){
		var shortenedTitle=this._composeByLocale(title); //1. normalize
		var len = websheet.Utils.getStringDisplayLength(title);
		if (len > maxLen) {
			var endChar=shortenedTitle.charAt(maxLen-1);
			var mark=shortenedTitle.charAt(maxLen);
			if(this._hasCombination(endChar,mark)){ //2. handle special u4 code for ja
				var extendLen=maxLen+1;
				if(shortenedTitle.length ==extendLen){
					shortenedTitle = shortenedTitle.substring(0, extendLen);
				}else{
					shortenedTitle = shortenedTitle.substring(0, extendLen) + '...';
				}	
			}else{
				shortenedTitle = websheet.Utils.getSubString(shortenedTitle, maxLen) + '...';
			}
		}
		return shortenedTitle;
	}
};
