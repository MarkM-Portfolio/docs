package com.ibm.concord.document.common.chart;

import com.ibm.json.java.JSONObject;

public class Axis 
{
	JSONObject content;
	String position;
	String id;
	ChartDocument chart;
	
	DataSequence catSeq;
	int changes = 0;
	
	public Axis(ChartDocument chart)
	{
		this.chart = chart;
	}
	
	public void loadFromJson(JSONObject json)
	{
		content = json;
		Number cha = (Number)content.get(ChartConstant.CHANGES);
	    if(cha != null)
		   changes = cha.intValue();
		this.position = (String)json.get("axPos");
		this.id = (String)json.get("axId");
		JSONObject categoryRef = (JSONObject)json.get(ChartConstant.CATEGORIES);
		DataProvider provider = this.chart.getDataProvider();
		if(categoryRef!=null && provider!=null)
		{
			String ref = (String)categoryRef.get(ChartConstant.BACREF);
			if(ref==null || ref.length()==0)
				ref = (String)categoryRef.get(ChartConstant.REF);
			
			 //Don't create sequence for external file reference
			if(ref != null && ref.length() >0 && ref.charAt(0)!='[')
			{
				catSeq = provider.createDataSequence(ref);
				catSeq.setRole(ChartConstant.CATEGORIES);
			}
		}
	}
	
	public JSONObject toJson()
	{
		if(catSeq!=null)
		{
			String addr = catSeq.getAddress();
			String bacAddr = catSeq.getBacAddress();
			if(addr != null && addr.length() > 0)
			{
				JSONObject category =  new JSONObject();
				category.put(ChartConstant.REF, addr);
				if(bacAddr != null)
					category.put(ChartConstant.BACREF, bacAddr);
				content.put(ChartConstant.CATEGORIES,category);
			}
		}
		content.put(ChartConstant.CHANGES, changes);
		return content;
	}
	
	public void set(JSONObject settings)
	{
		if(settings.containsKey(ChartConstant.CATEGORIES))
		{
			content.remove(ChartConstant.CATEGORIES);
			this.catSeq = null;
			
			Object catPro = settings.get(ChartConstant.CATEGORIES);
			if(catPro!=null && catPro instanceof JSONObject)
			{
				JSONObject catJson = (JSONObject)catPro;
				String ref = (String)catJson.get(ChartConstant.REF);
				if(ref!=null)
				{
					DataProvider provider = chart.getDataProvider();
					if(provider!=null)
					{
						this.catSeq = provider.createDataSequence(ref);
						this.catSeq.setRole(ChartConstant.CATEGORIES);
					}
				}
				else
				{
					JSONObject cache = (JSONObject)catJson.get(ChartConstant.CACHE);
					JSONObject cat =  new JSONObject();
					cat.put(ChartConstant.CACHE, cache);
					content.put(ChartConstant.CATEGORIES,cat);
				}
			}
		}
		
		if(settings.containsKey(ChartConstant.TXPR))
		{
			changes = changes | 1;
			JSONObject txPr = (JSONObject)settings.get(ChartConstant.TXPR);
			JSONObject dest = (JSONObject)this.content.get(ChartConstant.TXPR);
			if(txPr == null && dest != null)
				this.content.remove(ChartConstant.TXPR);
			else
			{
				if(dest == null)
				{
					dest = new JSONObject();
					this.content.put(ChartConstant.TXPR, dest);
				}
				ChartUtils.mergeTxPr(dest, txPr);//merge and maintain change flag
			}
		}
		
		if(settings.containsKey(ChartConstant.SPPR))
		{
			changes = changes | 2;
			JSONObject spPr = (JSONObject)settings.get(ChartConstant.SPPR);
			JSONObject dest = (JSONObject)this.content.get(ChartConstant.SPPR);
			if(spPr == null && dest != null)
				this.content.remove(ChartConstant.SPPR);
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
		
		if(settings.containsKey(ChartConstant.TITLE))
		{
			changes = changes | 4;
			JSONObject titleSet = (JSONObject)settings.get(ChartConstant.TITLE);
			if(titleSet == null)
				this.content.remove(ChartConstant.TITLE);
			else
			{
				JSONObject title = (JSONObject)this.content.get(ChartConstant.TITLE);
				if(title != null)
				{
					int tmpCha = 0;
					if(titleSet.containsKey(ChartConstant.TEXT))
					{
						String text = (String)titleSet.get(ChartConstant.TEXT);
						if(text == null)
							title.remove(ChartConstant.TEXT);
						else		
							title.put(ChartConstant.TEXT, text);
						tmpCha = tmpCha | 1;
					}
					if(titleSet.containsKey(ChartConstant.TXPR))
					{
						JSONObject txPr = (JSONObject)titleSet.get(ChartConstant.TXPR);
						if(txPr == null)
							title.remove(ChartConstant.TXPR);
						else
						{
							JSONObject dest = (JSONObject)title.get(ChartConstant.TXPR);
							if(dest == null)
							{
								dest = new JSONObject();
								title.put(ChartConstant.TXPR, dest);
							}
							ChartUtils.mergeTxPr(dest, txPr);
						}
						tmpCha = tmpCha | 2;
					}
				    ChartUtils.setChanges(title, tmpCha);
				}
				else
					this.content.put(ChartConstant.TITLE, titleSet);
			}
		}		
		if(settings.containsKey(ChartConstant.SCALING))
		{
			changes = changes | 8;
			JSONObject scalingSet = (JSONObject)settings.get(ChartConstant.SCALING);
			if(scalingSet == null)
				this.content.remove(ChartConstant.SCALING);
			else
			{
				JSONObject scaling = (JSONObject)this.content.get(ChartConstant.SCALING);
				if(scaling != null)
				{
					if(scalingSet.containsKey(ChartConstant.MAX))
					{
						Number max = (Number)scalingSet.get(ChartConstant.MAX);
						if(max == null)
							scaling.remove(ChartConstant.MAX);
						else
							scaling.put(ChartConstant.MAX, max);
					}
					if(scalingSet.containsKey(ChartConstant.MIN))
					{
						Number min = (Number)scalingSet.get(ChartConstant.MIN);
						if(min == null)
							scaling.remove(ChartConstant.MIN);
						else
							scaling.put(ChartConstant.MIN, min);
					}
				}
				else
					this.content.put(ChartConstant.SCALING, scalingSet);
			}
		}
		if(settings.containsKey(ChartConstant.MAJORUNIT))
		{
			changes = changes | 8;
			Number maj = (Number)settings.get(ChartConstant.MAJORUNIT);
			if(maj == null)
				this.content.remove(ChartConstant.MAJORUNIT);
			else
				this.content.put(ChartConstant.MAJORUNIT, maj);
		}
		if(settings.containsKey(ChartConstant.MINORUNIT))
		{
			changes = changes | 8;
			Number min = (Number)settings.get(ChartConstant.MINORUNIT);
			if(min == null)
				this.content.remove(ChartConstant.MINORUNIT);
			else
				this.content.put(ChartConstant.MINORUNIT, min);
		}
	}
}
