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

dojo.provide("concord.util.menu");


concord.util.menu.updateContextMenu = function(menuItemToUpdateId,paramObj,isToHide){
	if( menuItemToUpdateId!=null && dojo.trim(menuItemToUpdateId) !=""){
		 if(isToHide == null){
			 isToHide = false;
		 }
			var myMenuItem = dijit.byId(menuItemToUpdateId);
			if(myMenuItem!=null){
				//destroy the old popup
				
				for(keyParam in paramObj){
					if(keyParam == "popup"){
						if (myMenuItem.popup!=null) myMenuItem.popup.destroy();
					}
					myMenuItem[keyParam]= paramObj[keyParam];
					if(keyParam == "disabled"){
						myMenuItem.setDisabled(paramObj[keyParam]);
					}
					if(keyParam == "label"){
						myMenuItem.setLabel(paramObj[keyParam]);
					}
					
				}
				if(isToHide){
					dojo.style(myMenuItem.domNode, "display", "none");
				}else{
					dojo.style(myMenuItem.domNode, "display", "");
				}
			}
		 }		
};
