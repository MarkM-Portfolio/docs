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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import com.ibm.json.java.JSONObject;

public class DataSeries 
{
	private Plot parent;
	private JSONObject content;
	private String id;
	private Map<String, DataSequence> data;
	private int changes;
	
	ChartDocument chart;

	public DataSeries(Plot plot, ChartDocument chart)
	{
		this.parent = plot;
		this.chart = chart;
		data = new HashMap<String, DataSequence>();
	}
	
	public String getId() 
	{
		return id;
	}

	public void setId(String id) 
	{
		this.id = id;
	}
		
	public DataSequence getDataSequence(String role)
	{
		DataSequence dataSeq = data.get(role);
		return dataSeq;
	}
	
	public JSONObject toJson()
	{
		Iterator<Map.Entry<String, DataSequence>> itor = data.entrySet().iterator();
		while(itor.hasNext())
		{
			Map.Entry<String, DataSequence> entry = itor.next();
			String key = entry.getKey();
			DataSequence seq = entry.getValue();
			JSONObject vJson = (JSONObject)content.get(key);
			String addr = seq.getAddress();
			String bacAddr = seq.getBacAddress();
			
			if(addr != null && addr.length() > 0)
			{
				if(vJson == null){
					vJson = new JSONObject();
					content.put(key, vJson);
				}
				//chart.pivotSource!=0 means pivot chart, and addr.charAt(0)=='[' means external file reference
				//Don't remove the cache data for these two cases
				if(chart.pivotSource==0 && addr.charAt(0)!='[')
					vJson.remove(ChartConstant.CACHE);
				vJson.put(ChartConstant.REF, addr);
				if(bacAddr != null)
					vJson.put(ChartConstant.BACREF, bacAddr);
				else
					vJson.remove(ChartConstant.BACREF);
			}
			else if(vJson != null){
				vJson.remove(ChartConstant.REF);
				vJson.remove(ChartConstant.BACREF);
			}
		}
		
		content.put(ChartConstant.CHANGES, changes);
		return content;
	}
	
	public void loadFromJson(JSONObject content)
	{
		this.content = content;
		
		Number cha = (Number)content.get(ChartConstant.CHANGES);
	    if(cha != null)
		   changes = cha.intValue();
		
		DataProvider dataProvider = this.chart.getDataProvider();
		this.id = (String)content.get("id");
		for(int i=0;i<ChartDocument.roles.size();i++)
		{
			String role = ChartDocument.roles.get(i);
			JSONObject json = (JSONObject)content.get(role);
			if(json!=null && dataProvider!=null)
			{
				String ref = (String)json.get(ChartConstant.BACREF);
				if(ref==null || ref.length()==0)
					ref = (String)json.get(ChartConstant.REF);
				
                //Don't create sequence for external file reference
				if(ref != null && ref.length() > 0 && ref.charAt(0)!='[')
				{
					DataSequence seq = dataProvider.createDataSequence(ref);
					data.put(role,seq);
				}
			}
		}
	}
	
	public void set(JSONObject settings)
	{
		JSONObject data = (JSONObject)settings.get("data");
		if(data!=null)
		{
			DataProvider dataProvider = this.chart.getDataProvider();
			Iterator<Map.Entry<String, Object>> itor = data.entrySet().iterator();
			while(itor.hasNext())
			{
				Map.Entry<String, Object> entry = itor.next();
				String role = entry.getKey();
				if(ChartConstant.LABEL.equals(role))
					this.changes |= 0x02;
				else
					this.changes |= 0x01;
				Object pro = entry.getValue();
				if(pro==null || pro instanceof String)
				{
					this.data.remove(role);
					content.remove(role);
				}
				else
				{
					JSONObject json = (JSONObject)pro;
					String ref = (String)json.get(ChartConstant.REF);
					if(ref!=null && ref.length()>0)
					{
						if(dataProvider!=null)
						{
							DataSequence seq = dataProvider.createDataSequence(ref);
							this.data.put(role, seq);
						}
					}
					else
					{
						this.data.remove(role);
						JSONObject roleJson = (JSONObject)content.get(role);
						if(roleJson!=null){
							roleJson.remove(ChartConstant.REF);
							roleJson.remove(ChartConstant.BACREF);
						}						
						else
						{
							roleJson = new JSONObject();
							content.put(role, roleJson);
						}
						if(ChartConstant.LABEL.equals(role))
						{
							String v = (String)json.get("v");
							if(v!=null)
								roleJson.put("v", v);
						}
						else
						{
							JSONObject cache = (JSONObject)json.get(ChartConstant.CACHE);
							if(cache!=null)
								roleJson.put(ChartConstant.CACHE, cache);
						}
					}
				}
			}
		}
		if(settings.containsKey(ChartConstant.MARKER))
		{
			Number marker = (Number)settings.get(ChartConstant.MARKER);
			if(marker == null)
				this.content.remove(ChartConstant.MARKER);
			else
				this.content.put(ChartConstant.MARKER, marker);
		}
		
		if(settings.containsKey(ChartConstant.SMOOTH))
		{
			Number smooth = (Number)settings.get(ChartConstant.SMOOTH);
			if(smooth == null)
				this.content.remove(ChartConstant.SMOOTH);
			else
				this.content.put(ChartConstant.SMOOTH, smooth);
		}
		
		if(settings.containsKey(ChartConstant.DPT))
		{
			changes = changes | 4;
			JSONObject dptSet = (JSONObject)settings.get(ChartConstant.DPT);
			if(dptSet == null)
				this.content.remove(ChartConstant.DPT);
			else
			{
				JSONObject dpt = (JSONObject)this.content.get(ChartConstant.DPT);
				if(dpt == null)
					this.content.put(ChartConstant.DPT, dptSet);
				else
				{
					Iterator<Map.Entry<String, JSONObject>> itor = dptSet.entrySet().iterator();
					while(itor.hasNext())
					{
						Map.Entry<String, JSONObject> entry = itor.next();
						String key = entry.getKey();
						JSONObject pro = entry.getValue();
						
						JSONObject dp =(JSONObject) dpt.get(key);
						if(dp == null)
							dpt.put(key, pro);
						else
						{
							JSONObject spPr = (JSONObject)pro.get(ChartConstant.SPPR);
							if(spPr == null)
								dp.remove(ChartConstant.SPPR);//risk?
							else
							{
								if(dp.containsKey(ChartConstant.SPPR))
									ChartUtils.mergeSpPr((JSONObject)dp.get(ChartConstant.SPPR), spPr);
								else
									dp.put(ChartConstant.SPPR, spPr);
							}
						}
					}
				}
			}
		}
		
		if(settings.containsKey(ChartConstant.SPPR))
		{
			changes = changes | 4;
			JSONObject spPr = (JSONObject)settings.get(ChartConstant.SPPR);
			JSONObject dest = (JSONObject)this.content.get(ChartConstant.SPPR);
			if(spPr == null && dest != null)
			{
				this.content.remove(ChartConstant.SPPR);
			}
			else 
			{
				if(dest == null)
				{
					dest = new JSONObject();
					this.content.put(ChartConstant.SPPR, dest);
				}
				ChartUtils.mergeSpPr(dest, spPr);//merge and maintain change flag
			}
		}
	}
}
