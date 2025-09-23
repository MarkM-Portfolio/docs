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

dojo.provide("websheet.model.RulesObject.RuleDataCache");
dojo.declare("websheet.model.RulesObject.RuleDataCache", null , {
	value: null,
	isDirty: false,
	_doc: null,	
	_updateRefTokens: null,//updateRefToken map of the formula cell, these tokens are not on the token tree
	//key is reference id, value is the array of token which calculate value is this reference
	constructor : function(value, refTokens, doc, listener){
		this.value = value;
		this.isDirty = false;
		this._updateRefTokens = {};
		dojo.mixin(this._updateRefTokens, refTokens);
		this._doc = doc;
		this._listener = listener;
	},
	
	/**
	 * clear the reference map of the formula cell
	 */
	/*void*/clearRefs:function()
	{
		//remove refCount for each ref, if refCount ==0, delete it
		var areaMgr = this._doc.getAreaManager();
		for(var id in this._updateRefTokens)
		{
			var list = this._updateRefTokens[id];
			var count = list.length;
			for(var i=0;i<count;i++)
			{
				var token = list[i];
				var area = token.getValue();
				var bContain = area.hasListener(this);
				//if ref related cell does not contain this cell, then should not delete ref count
				if(bContain)
					areaMgr.endListeningArea(area, this);
			}
			delete this._updateRefTokens[id];
		}
	},
	
	//if callback return true, then stop iteration
	iterateRefTokens:function(areaId, area, callback) {
		//iterate updateRefTokens
		if (areaId) {
			var tokenList = this._updateRefTokens[areaId];
			if(tokenList){
				for(var i in tokenList) {
					var token = tokenList[i];
					if (!area || (token.getValue() == area)){
						if (callback(token)){
							return;
						}
					}
				}
			}
		} else {
			var stop = false;
			//iterate every token
			for(var id in this._updateRefTokens){
				var tokenList = this._updateRefTokens[id];
				for (var i in tokenList){
					var token = tokenList[i];
					stop = callback(token);
					if(stop)
						return;
				}
			}
		}
	},
	
	notify:function(/*broadcaster*/area, event){
		//set dirty when set cell, and set formula update when delete/insert
		var constant = websheet.Constant;
		if(event._type == constant.EventType.DataChange) {
			var source = event._source;
			var action = source.action;
			var refType = source.refType;
			var refValue = source.refValue;
			var isDirty = false;
			
			if (action == constant.DataChange.SET
				&& (refType == constant.OPType.RANGE || refType == constant.OPType.CELL) ) { // set cell event will be sent by _getImpactCells
					var id = area.getId().toLowerCase();
					this.iterateRefTokens(id, area, function(token){
						var props = token.getProps();
						if( (props & websheet.Constant.RefType.IGNORESET) == 0){
							isDirty = true;
							token.setUpdate(true);
						}
					});
			} else if (refType == constant.OPType.AREA) {
			    isDirty = true;
				bNameArea = true;
				switch(action) {
					case constant.DataChange.INSERT:
					case constant.DataChange.DELETE:{
						var newArea = refValue;
						isDirty = true;
						var oldArea = area;
						var bEnableName = false;
						if(action == constant.DataChange.INSERT)
							bEnableName = true;
						
						var id = newArea.getId().toLowerCase();
						this.iterateRefTokens(id, oldArea, function(token){
							token.setValue(newArea);
							token.setUpdate(true, {enableNameRange:bEnableName});
							if(action == constant.DataChange.INSERT){
								delete token._error;
								if(!newArea.isValid())
									token.setError(websheet.Constant.ERRORCODE["524"]);
							} else {
								//delete
								token.setError(websheet.Constant.ERRORCODE["525"]);
							}
						});
						break;	
					}
					case constant.DataChange.SET: {
						// refValue for set area event is the non-updated parsedRef, area is the updated area
						isDirty = true;
						var id = area.getId().toLowerCase();
						var isValid = area.isValid();
						this.iterateRefTokens(id, area, function(token){
							token.setUpdate(true);
							if(!isValid)
								token.setError(websheet.Constant.ERRORCODE["524"]);
							else
								delete token._error;
							token.setRefMask(refValue.refMask);
						});
						break;
					}
					default:
						break;
				}
			} else if (refType == constant.OPType.SHEET) {
				var sheetName = refValue;
				// for predelete sheet event, set dirty and update formula flag for cells which are not in this delete sheet
				if(action == constant.DataChange.PREDELETE) { // predelete sheet
					if(sheetName != this.getSheetName()) {
						isDirty = true;
						var id = area.getId().toLowerCase();
						this.iterateRefTokens(id, area, function(token){
							token.setRefMask(constant.RefAddressType.INVALID_SHEET, true);
							token.setUpdate(true);
						});
					}
				} else if (action == constant.DataChange.SET) { // rename sheet
						this.iterateRefTokens(null, null, function(token){
							var props = token.getProps();
							if ( (props & websheet.Constant.RefType.CAREPOSITION) > 0 ){
								token.setUpdate(true, {positionChanged:true});//positionchanged for updateRefToken
								isDirty = true;
							}
						});
				}
			} else if ((action == constant.DataChange.PREINSERT || action == constant.DataChange.PREDELETE)) {
				if (refType == constant.OPType.ROW || refType == constant.OPType.COLUMN) {
					var data = source.data;
					var sizeChanged = data && data.sizeChanged;
					var id = area.getId().toLowerCase();
					this.iterateRefTokens(id, area, function(token, bInTokenTree){
						var props = token.getProps();
						if( (sizeChanged && ( (props & websheet.Constant.RefType.IGNORESET) == 0 || (props & websheet.Constant.RefType.ONLY_CARESIZE) == 0 ))
								|| ((props & websheet.Constant.RefType.CAREPOSITION) > 0) ){
							token.setUpdate(true, {positionChanged:true});//positionchanged for updateRefToken
							isDirty = true;
						}
					});
				}
			} else if (action == constant.DataChange.SHOW || action == constant.DataChange.HIDE) {
				var id = area.getId().toLowerCase();
				this.iterateRefTokens(id, area, function(token){
					var props = token.getProps();
					if( (props & websheet.Constant.RefType.CARESHOWHIDE) > 0){
						isDirty = true;
						token.setUpdate(true);
					}
				});
			} else if (action == constant.DataChange.FILTER) {
				var id = area.getId().toLowerCase();
				this.iterateRefTokens(id, area, function(token){
					var props = token.getProps();
					if( (props & websheet.Constant.RefType.CAREFILTER) > 0){
						isDirty = true;
						token.setUpdate(true);
					}
				});
			} else if (action == constant.DataChange.CUT ) {
				var id = area.getId().toLowerCase();
				this.iterateRefTokens(id, area, function(token){
					var props = token.getProps();
					if(!area.cutRef || (props & websheet.Constant.RefType.CAREPOSITION) > 0){
						isDirty = true;
						token.setUpdate(true);
					}
				});
			}
			if (isDirty){
				this.isDirty = true;
				if(this._listener)
					this._listener.dirtyByCacheCell(this);
			}
	    }
	}
});