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

dojo.provide("concord.tests.text");

doh.register("tests.text", [

   function loadTextApp()                                
   {
 		  dojo.require("concord.concord_text");
 	} ] );

try{
	dojo.require("concord.tests.text.example");
}catch(e){
	doh.debug(e);
}
