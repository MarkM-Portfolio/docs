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

dojo.provide("websheet.parse.UpdateRefToken");
dojo.require("websheet.parse.RefToken");
dojo.declare("websheet.parse.UpdateRefToken", websheet.parse.RefToken, {
	
	setUpdate:function(bUpdate, params){
		// different with the tokens on the token tree
		// it does not has parent
		if(bUpdate){
			this._bUpdate = true;
			var updateToken = this.getUpdateToken();
			if(!updateToken) {
				console.warn("UpdateRefToken should not have updateToken");
				return;
			}
			if(updateToken instanceof websheet.parse.UpdateRefToken){
				updateToken.setUpdate(true, params);
			} else {
				// if it cares position and position changed, then set the udpate token to dirty
				// such as indirect
				if(params){
					if( (params.positionChanged && ((this.getProps() & websheet.Constant.RefType.CAREPOSITION) > 0))
							|| (params.enableNameRange != undefined && ((this.getProps() & websheet.Constant.RefType.CARE_NAMEDEFINITION) > 0) ) ){
						updateToken.setUpdate(true, params);
						return;
					}
				}
				var RecalcType = websheet.Constant.RecalcType;
				switch(this._recalcType){
					case RecalcType.IGNORE:
						return;
					case RecalcType.ANCESTOR:
						var ancestor = updateToken._parent;
						if(ancestor){
							ancestor.setUpdate(true, params);
						}
						break;
					default: {
						updateToken.setUpdate(true, params);
						break;
					}
				}
			}
		} else {
			this._bUpdate = false;
		}
	}
});
