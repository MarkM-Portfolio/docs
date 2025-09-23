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
dojo.provide("concord.pres.PresTxtboxUtil");

dojo.declare("concord.pres.PresTxtboxUtil", null, {
    shouldTxtboxBeDeleted: function(dfc, presClass) {
        var isTxtboxEmpty =
            !PresCKUtil.doesNodeContainText(dfc, false, true, true);
        var doesTxtboxHaveBackgroundColor =
            (dfc.style.backgroundColor != '');
        var doesTxtboxHaveBackgroundImage = '';
        if (isTxtboxEmpty && !doesTxtboxHaveBackgroundImage) {
        	try {
        	    // TODO: use presConstants
        		doesTxtboxHaveBackgroundImage =
        			document.defaultView
        			&& document.defaultView.getComputedStyle(dfc)["backgroundImage"] != "none";
        	} catch (e) {
        		console.log("exception from getComputedStyle", e);
        	}
        }
        return isTxtboxEmpty && !doesTxtboxHaveBackgroundColor
                && !doesTxtboxHaveBackgroundImage;
    }
});

(function(){
    PresTxtboxUtil = new concord.pres.PresTxtboxUtil();
})();
