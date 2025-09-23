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

dojo.provide("concord.addFilesNewMenu");

dojo.require("concord.global");
dojo.require("concord.actionNewDoc");

(function(){
	lconn.core.uiextensions.add("lconn/files/actions/create/new", 
	   function(actions, s, app, opts) {
		  if(concord.global.showConcordEntry()){
		      actions.unshift(new com.ibm.concord.lcext.NewConcordPres(app, opts));
		      actions.unshift(new com.ibm.concord.lcext.NewConcordSheet(app, opts));
			  actions.unshift(new com.ibm.concord.lcext.NewConcordDoc(app, opts));
		  } 
       });
})();