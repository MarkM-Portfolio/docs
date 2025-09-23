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

dojo.provide("concord.addCommuNewMenu");

dojo.require("concord.global");
dojo.require("concord.actionNewDoc");

(function(){
    lconn.core.uiextensions.add("lconn/files/actions/comm/ref/create/new", 
	function(actions, s, app, opts) {
        if(concord.global.showConcordEntry()) {
        	actions.push(new com.ibm.concord.lcext.NewConcordDoc(app, opts));
	        actions.push(new com.ibm.concord.lcext.NewConcordSheet(app, opts));
	        actions.push(new com.ibm.concord.lcext.NewConcordPres(app, opts));
        }	        
    });
})();