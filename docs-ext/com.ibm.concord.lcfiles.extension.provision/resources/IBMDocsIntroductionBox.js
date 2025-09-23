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

dojo.provide("concord.IBMDocsIntroductionBox");

dojo.require("lconn.core.uiextensions");
dojo.require("concord.global");

function overrideIntroductionBox(app) {
	// only override this box for user with IBM Docs entitlements.
	if (concord.global.showConcordEntry()){
		var nls = concord.global.nls;
		
		// Link when you click "Learn More"
		// lconn.share.config.helpUri = "www.ibm.com.cn";
		// topic for default, if you do not want to break other help topics, you
		// just set the topic here - default value is ""
		// <this topic will replace {topic} in helpUri
		// lconn.share.config.helpDefaultTopic = "";
		
		// Link for demo
		// lconn.share.config.demoUri = "http://public.dhe.ibm.com/software/dw/smartcloud/social/files/files.htm";
		var docWelcomeNls = {
			TITLE : nls.INTRODUCTION_BOX_TITLE,
			BLURB : nls.INTRODUCTION_BOX_BLURB,
			BLURB_LOG_IN : nls.INTRODUCTION_BOX_BLURB_LOG_IN,
			BLURB_UPLOAD : nls.INTRODUCTION_BOX_BLURB_UPLOAD_DOCS,
			CLOSE : nls.INTRODUCTION_BOX_CLOSE
		}
		// Test whether welcome link exists, as it is only included in Files 4.6 and the new design only work on Files 4.6, 
		// so we have to do this test before override.
		if(dojo.getObject("lconn.files.config.welcomeLink2")){
			docWelcomeNls.BLURB2 = nls.INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM2;
			docWelcomeNls.BLURB3 = nls.INTRODUCTION_BOX_4_6_BLURB_LIST_ITEM3;
			lconn.files.config.welcomeLink2 = "d_collaborating_on_a_document.html";
			lconn.files.config.welcomeLink3 = "help_welcome_page.html";
			window.openFilesHelpWindow = window.openHelpWindow;
			window.openHelpWindow = function(topic) {
				var docsPath = {
					"d_collaborating_on_a_document.html" : "com.ibm.help.ibmdocs.doc/text/document",
					"help_welcome_page.html" : "com.ibm.help.ibmdocs.doc/text/overview"
				};
				var fileHelpUri = dojo.getObject("lconn.share.config.helpUri");
				if(docsPath[topic] && fileHelpUri){
					// for smart cloud
					lconn.share.config.helpUri = fileHelpUri.replace("com.ibm.cloud.files.doc", docsPath[topic]);
					// for on premise
					lconn.share.config.helpUri = lconn.share.config.helpUri.replace("com.ibm.lotus.connections.files.help", docsPath[topic]);
					window.openFilesHelpWindow(topic);
					lconn.share.config.helpUri = fileHelpUri;
				} else {
					window.openFilesHelpWindow(topic);
				}
			}; 
		}		
		var welcomeNls = app.nls.WELCOMECONTENT;
		if (welcomeNls) {
			dojo.mixin(welcomeNls, docWelcomeNls);
		}
	}
}

lconn.core.uiextensions.when("lconn/files/app/start").addCallback(overrideIntroductionBox);
// lconn.core.uiextensions.when("lconn/files/comm/ref/app/start").addCallback(overrideApplicationMethods);
