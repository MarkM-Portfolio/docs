/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.platform.bean;

import java.sql.Timestamp;

import com.ibm.json.java.JSONObject;

/**
 * 
 * @author huoqif@cn.ibm.com
 *
 */
public class WebClipboardBean {
	private String id;
	private String userid;
	private String orgid;
	private String tag;	
	private String providers;	
	private String clipdata;	
	private Timestamp lastmodificationdate;
	
	
	
	public static final String ID = "ID";
	public static final String USERID = "USERID";
	public static final String ORGID = "ORGID";
	public static final String TAG = "TAG";	
	public static final String PROVIDERS = "PROVIDERS";
	public static final String CLIPDATA = "CLIPDATA";	
	public static final String LASTMODIFICATIONDATE = "LASTMODIFICATIONDATE";
	
	
	public String getId()
	{
		return id;
	}
	public void setId(String id)
	{
		this.id = id;
	}
	
	public String getUserId()
	{
		return userid;
	}
	public void setUserId(String userid)
	{
		this.userid = userid;
	}
	
	public String getOrgId()
	{
		return orgid;
	}
	public void setOrgId(String orgid)
	{
		this.orgid = orgid;
	}	
	
	public String getTag()
	{
		return tag;
	}
	public void setTag(String tag)
	{
		this.tag = tag;
	}
		
	public String getProviders()
	{
		return providers;
	}
	public void setProviders(String providers)
	{
		this.providers = providers;
	}	
	
	public String getClipData()
	{
		return clipdata;
	}
	public void setClipData(String clipdata)
	{
		this.clipdata = clipdata;
	}
	
	public Timestamp getDate()
	{
		return lastmodificationdate;
	}
	public void setDate(Timestamp date)
	{
		this.lastmodificationdate = date;
	}
	
	public JSONObject toJSON()
	{
	    JSONObject json = new JSONObject();
	    json.put(ID, id);
	    json.put(USERID, userid);
	    //json.put(USEREMAIL, useremail);
	    //json.put(TAG, tag);
	    json.put(CLIPDATA, clipdata);
	    //json.put(PROVIDERS, providers);
	    json.put(LASTMODIFICATIONDATE, lastmodificationdate.toString());	   
	    
	    return json;
	}	
}
