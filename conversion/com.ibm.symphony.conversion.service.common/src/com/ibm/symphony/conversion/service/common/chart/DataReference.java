package com.ibm.symphony.conversion.service.common.chart;

import java.util.ArrayList;
import java.util.List;

import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.service.common.chart.ReferenceParser.ParsedRef;

public class DataReference
{
	public String refValue;
	public String formatCode;
	public List<Object> pts;
	
	public JSONObject toJson()
	{
		JSONObject json = new JSONObject();
		
		if(Utils.hasValue(refValue))
		{
			List<String> addresses = Utils.getRanges(refValue, " ");
			if(addresses.size() > 1)
			{
				StringBuffer refStr = new StringBuffer("(");
				int i = 0;
				for( ; i < addresses.size() - 1; i++)
				{
					refStr.append(addresses.get(i));
					refStr.append(",");
				}
				refStr.append(addresses.get(i));
				refStr.append(")");
				json.put("ref", refStr.toString());
			}
			else
				json.put("ref", addresses.get(0));
		}
		if(formatCode!=null)
			json.put("formatCode", formatCode);
		
		if(pts != null)
		{
			JSONObject cache = new JSONObject();
			JSONArray ptsJson = new JSONArray();
			int len = pts.size();
			for(int i = 0; i < len; i++)
			{
				Object pt = pts.get(i);
				if(pt != null && pt instanceof ArrayList)//For multi-column category, need to switch row-column
				{
					List<Object> ptList = (List<Object>)pt;
					for(int j = 0; j < ptList.size(); j++)
					{
						JSONArray ptJson = null;
						if(ptsJson.size() > j)
							ptJson = (JSONArray)ptsJson.get(j);
						if(ptJson == null){
							ptJson = new JSONArray();
							ptsJson.add(ptJson);
						}
						ptJson.add(ptList.get(j));
					}
				}
				else
					ptsJson.add(pt);
			}
			cache.put("pts", ptsJson);
			json.put("cache", cache);
		}
		return json;
	}
	
	public void setPts(String pts)//pts is string likes {1;2;3} or {"x";"y";"z"}
	{
		this.pts = new ArrayList<Object>();
		pts = pts.substring(1, pts.length() - 1);
		String[] ptVs = pts.split(";");
		if(pts.contains("\""))//for category
		{
			StringBuffer tmp = new StringBuffer();
			for(int i = 0; i< ptVs.length; i++)
			{
				String pt = ptVs[i];
				tmp.append(pt);
				if(pt.endsWith("\""))//category can have semicolons or commas
				{	
					this.pts.add(tmp.substring(1, tmp.length() - 1));
					tmp.setLength(0);
				}
				else
				{
					tmp.append(";");
				}
			}
		}
		else
		{
			for(int i = 0; i< ptVs.length; i++)
			{
				String pt = ptVs[i];
				this.pts.add(Float.valueOf(pt));
			}
		}
				
	}
	
	public void setPts(List<Object> pts)
	{
		this.pts = pts;
	}
	
	public int getPtCount()
	{
		int cnt = 0;
		
		if(Utils.hasValue(refValue))
		{
			List<String> addresses = Utils.getRanges(refValue, ",");
			for(int i=0;i<addresses.size();i++)
			{
				//Calc data point count for export dPt
				ParsedRef parseRef = ReferenceParser.parse(addresses.get(i));
				if(parseRef != null)
				{
					int sc = parseRef.getIntStartCol();
					int ec = parseRef.getIntEndCol();
					if(ec==-1)
						ec = sc;
					int sr = parseRef.getIntStartRow();
					int er = parseRef.getIntEndRow();
					if(er==-1)
						er = sr;
					
					if(sr==er) //single row
						cnt += ec - sc + 1;
					else
						cnt += er - sr + 1;
				}
			}
		}
		else if(pts!=null)
			cnt = pts.size();
		
		return cnt;
	}
	
	public void loadFromJson(JSONObject content)
	{
	  refValue = (String)content.get("ref");
	  JSONObject cache = (JSONObject)content.get("cache");
	  if(cache!=null)
	  {
		JSONArray ptsJson = (JSONArray)cache.get("pts");
		if(ptsJson != null && ptsJson.size() > 0)
		{
			pts =  new ArrayList<Object>();
			for(int i = 0; i< ptsJson.size(); i++)
			{
				Object pt = (Object)ptsJson.get(i);
				pts.add(pt);
			}
		}
	  }
	}
}
