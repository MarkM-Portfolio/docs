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

/**
 * There is only an static function concord.util.emailParser.getEmail in class concord.util.emailParser
 */
dojo.provide("concord.util.emailParser");

dojo.declare("concord.util.emailParser", null, {

});

concord.util.emailParser.getEmail = function(field) {
	if(field && field.length)
	{
	  var prefix = "<";
	  var suffix = ">";  
	  var sInx = field.indexOf(prefix);
	  var eInx = field.indexOf(suffix);
	  var p = field.substring(sInx+1,eInx);
	
	  return p;		
	}
    else
    {
  	  return null;
    }
};
