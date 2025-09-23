/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.chart;

import java.util.List;

import com.ibm.json.java.JSONArray;

public abstract class DataSequence 
{
	public abstract List<Float> getData();
	
	public abstract String getAddress();
	public abstract String getBacAddress();
	
	public abstract String getNumberFormat();
	
	private String role;
	private JSONArray pts;
	
	public String getRole() 
	{
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public DataSequence()
	{
	}
	
	public void setData(JSONArray data)
	{
		pts = data;
	}
}
