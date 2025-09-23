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

dojo.provide("concord.widgets.PeopleDataStore");
dojo.require("dojox.data.QueryReadStore");
dojo.declare(
	"concord.widgets.PeopleDataStore",
	[dojox.data.QueryReadStore],
	{
		isExternal: false,		
		constructor: function(args){
			isExternal = args.isExternal;
		},
		
		_filterResponse: function(data){
			if(this.isExternal){				
				if(data && data.items){
					var items = data.items;
					for(var i=0; i<items.length; i++){
						items[i].name = items[i].name + " <"+items[i].email+">";
						items[i].value = items[i].id;
					}
				}
			}
			return data;
		},
			
	    fetch: function(keywordArgs) 
	    {
	    	if (keywordArgs.query.name.length < 3)//char*
	    		return;
			keywordArgs.serverQuery = {name:keywordArgs.query.name};
			return this.inherited('fetch',arguments);
   		}
	}
);