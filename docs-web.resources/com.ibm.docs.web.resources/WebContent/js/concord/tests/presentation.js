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

dojo.provide("concord.tests.presentation");

doh.register("tests.presentation", [

   function loadPresentationApp()                                
   {
 		  dojo.require("concord.concord_pres");
 	} ] );

try{
	dojo.require("concord.tests.presentation.example");
}catch(e){
	doh.debug(e);
}
