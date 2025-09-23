/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.util;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;

import com.ibm.json.java.JSONObject;

public class ChangeListTypeOperation extends UpdateListValueOperation {
	@Override
	protected void apply(Tidy tidy, Document dom) throws Exception {
		// TODO Auto-generated method stub

	}

	@Override
	public boolean read(JSONObject update) {
		// TODO Auto-generated method stub
		try{
			setType(update.get(TYPE).toString());
			setTarget(update.get(TARGET).toString());
			//setListType(update.get(List_Type).toString());
			return true;
		}catch(Exception e){
			return false;
		}
	}

	@Override
	public JSONObject write() {
		// TODO Auto-generated method stub
		JSONObject update = new JSONObject();
		try{
			update.put(TYPE,getType());
		    update.put(TARGET,getTarget());
		    //update.put(List_Type, getListType());
		    return update;
		}catch (Exception e) {
			// TODO: handle exception
			return null;
		}	
	}
	

}
