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

import java.util.ArrayList;
import java.util.List;

import lotus.org.w3c.tidy.Tidy;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class UpdateListValueOperation extends Operation {
	private List<String> followListIds ;
	private static final String FOLLOWLISTIDS = "lids";
	private static final String FORCE = "force";
	private boolean forceFromHeader;

	@Override
	protected void apply(Tidy tidy, Document dom) throws Exception {
		// TODO Auto-generated method stub
		Node e = dom.getDocumentElement();
		Element node = XHTMLDomUtil.getElementbyId((Element) e, getTarget());
		if (node == null) {
			for(String lid: followListIds){
				node = XHTMLDomUtil.getElementbyId((Element) e, lid);
				if(node != null){
					break;
				}
			}
		}
		if(node == null){
			return;
		}
		ListUtil.updateListValue(node, null, forceFromHeader);

	}

	@Override
	public boolean read(JSONObject update) {
		// TODO Auto-generated method stub
		try {
			setType(update.get(TYPE).toString());
			setTarget(update.get(TARGET).toString());
			setFollowListIds((JSONArray)(update.get(FOLLOWLISTIDS)));
			forceFromHeader = update.get(FORCE).toString().equalsIgnoreCase("true");
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	@Override
	public JSONObject write() {
		// TODO Auto-generated method stub
		JSONObject update = new JSONObject();
		try {
			update.put(TYPE, getType());
			update.put(TARGET, getTarget());
			JSONArray list = new JSONArray();
		    for (int index = 0; index< followListIds.size();index++)
		    {
		      list.add(followListIds.get(index));
		    }
		    update.put(FOLLOWLISTIDS, list);
		    update.put(FORCE, forceFromHeader ? "true" : "false");
			return update;
		} catch (Exception e) {
			// TODO: handle exception
			return null;
		}
	}

	public List<String> getFollowListIds() {
		return followListIds;
	}

	public void setFollowListIds(JSONArray list) {
		this.followListIds = new ArrayList<String>();
	    for (int index = 0; index< list.size();index++)
	      {
	        String eleId = (String) list.get(index);
	        this.followListIds.add(eleId);
	      }
	}



}
