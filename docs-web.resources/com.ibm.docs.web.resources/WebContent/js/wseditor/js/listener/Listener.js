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

dojo.provide("websheet.listener.Listener");
dojo.declare("websheet.listener.Listener",null,{
	/*boolean*/preCondition:function(event)
	{
		// to be implemented by each listener instance
		return true;
	},
	notify:function(caster, event)
	{
		//implement by each listener instance
	},
	startListening:function(caster)
	{
		caster.addListener(this);
	},
	endListening:function(caster)
	{
		caster.removeListener(this);
	},
	isListening:function(caster)
	{
		return caster.hasListener(this);
	}
});