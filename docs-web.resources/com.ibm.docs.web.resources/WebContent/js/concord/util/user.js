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

dojo.provide("concord.util.user");
dojo.require("concord.beans.ProfilePool");

if(typeof ProfilePool == "undefined" || ProfilePool == null){
	ProfilePool = new concord.beans.ProfilePool();
}

concord.util.user.getUserFullName= function(id) {
	if(ProfilePool!=null && ProfilePool.getUserProfile(id)!=null)
		return ProfilePool.getUserProfile(id).getName();
	else
		return null;
},
concord.util.user.getUserId= function(email){
	if(ProfilePool!=null && ProfilePool.getUserProfile(email)!=null)
		return ProfilePool.getUserProfile(email).getId();
	else
		return null;
},
concord.util.user.composeOrgUserName= function(id){
	var user = ProfilePool.getUserProfile(id);
	if (user != null){
		if(user.getEmail()){
		    return user.getName() + ' <' + user.getEmail() +'>';
		}else{
		    return user.getName();
		}
	}else{
		return '';
	}
}