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

/*
 *@author: gaowwei@cn.ibm.com
 */
dojo.provide("concord.net.RevSession");

dojo.require("concord.net.Session");

/**
 * Session maintains synchronize states between server and client
 */
dojo.declare("concord.net.RevSession", [concord.net.Session], {    
    constructor: function constructor(scene, repository, uri, rev){
        var url = contextPath + "/api/revsvr/" + repository + "/" + uri + "/" + rev;
        this.url = url;
    },
    
    join: function()
    {
    	
    }
});
