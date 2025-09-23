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

dojo.provide("concord.tests.spreadsheet");

doh.register("tests.spreadsheet", [

   function loadSpreadsheetApp()                                
   {
 		  dojo.require("concord.concord_sheet");
 	} ] );

try{
	dojo.require("concord.tests.spreadsheet.formula");
}catch(e){
	doh.debug(e);
}
