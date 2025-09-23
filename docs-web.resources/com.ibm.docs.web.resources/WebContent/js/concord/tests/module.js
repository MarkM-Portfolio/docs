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

dojo.provide("concord.tests.module");
contextPath = "/docs";
g_maxSheetRows = 1000;

try{
	dojo.require("concord.tests.text");
	dojo.require("concord.tests.spreadsheet");
	dojo.require("concord.tests.presentation");
}catch(e){
	doh.debug(e);
}
