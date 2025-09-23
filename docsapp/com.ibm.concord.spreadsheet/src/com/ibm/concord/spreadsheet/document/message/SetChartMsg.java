/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.spreadsheet.document.message;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.ibm.concord.document.common.chart.ChartConstant;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.json.java.JSONObject;


public class SetChartMsg extends Message {
	Map<String, Map<String, List<TokenId>>> seriesRefIds = null;
	Map<String , Map<String, List<String>>> seriesRefAddrs = null;
	Map<String, List<TokenId>> axisRefIds = null;
	Map<String, List<String>> axisRefAddrs = null;
	
	public SetChartMsg(JSONObject jsonEvent, IDManager idm) {	
		super(jsonEvent, idm);
	}
	
	public boolean transformRefById(IDManager idm) {
		return true;
	}
	
	//transform DataSeqTokens
	public void transformDataByIndex(IDManager idm) {
		JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
		JSONObject settings = (JSONObject) o.get(ConversionConstant.CHART_SETTINGS);
		if(settings != null)
		{
			JSONObject series = (JSONObject)settings.get(ConversionConstant.CHART_SERIES);
			if(series != null)
			{
				seriesRefIds = new HashMap<String, Map<String, List<TokenId>>>();
				seriesRefAddrs = new HashMap<String, Map<String, List<String>>>();
				Iterator<Map.Entry<String, JSONObject>> itor = series.entrySet().iterator();
				while(itor.hasNext())
				{
					Map.Entry<String, JSONObject> entry = itor.next();
					String serId = entry.getKey();
					JSONObject pro = entry.getValue();
					JSONObject proData = (JSONObject)pro.get("data");
					if(proData == null)
						continue;
					Map<String, List<TokenId>> tempSeries = new HashMap<String, List<TokenId>>();
					Map<String, List<String>> tempSerieAddrs = new HashMap<String, List<String>>();
					Iterator<Map.Entry<String, JSONObject>> roleItor = proData.entrySet().iterator();
					while(roleItor.hasNext())
					{
						Map.Entry<String, JSONObject> roleEntry= roleItor.next();
						String role = roleEntry.getKey();						
						JSONObject valJson = roleEntry.getValue();
						if(valJson != null)
						{
							String ref = (String)valJson.get(ConversionConstant.CHART_REF);
							if(ref != null)
							{							
								List<TokenId> refTokenIds = new ArrayList<TokenId>();
								ArrayList<String> addresses = CommonUtils.getRanges(ref);
								for(int k = 0; k < addresses.size(); k++)
								{
									ParsedRef parseRef = ReferenceParser.parse(addresses.get(k));
									if(parseRef !=null && FormulaUtil.isValidFormulaRef(parseRef))
									{
										Token token = new Token(addresses.get(k), null, OPType.UnnameRange);
										TokenId labelRefTokenId = new TokenId(token, idm);
										refTokenIds.add(labelRefTokenId);
									}else
										refTokenIds.add(null);
								}
								if(refTokenIds.size() > 0)
								{
									tempSeries.put(role, refTokenIds);
									tempSerieAddrs.put(role, addresses);
								}
							}
						}
					}
					seriesRefIds.put(serId, tempSeries);
					seriesRefAddrs.put(serId, tempSerieAddrs);
				}
			}
			JSONObject axis = (JSONObject)settings.get(ConversionConstant.CHART_AXIS);
			if(axis != null)
			{
				axisRefIds = new HashMap<String, List<TokenId>>();
				axisRefAddrs = new HashMap<String, List<String>>();
				Iterator<Map.Entry<String, JSONObject>> itor = axis.entrySet().iterator();
				while(itor.hasNext())
				{
					Map.Entry<String, JSONObject> entry = itor.next();
					String axId = entry.getKey();
					JSONObject pro = entry.getValue();
					JSONObject catJson = (JSONObject)pro.get(ChartConstant.CATEGORIES);
					if(catJson != null)
					{
						String ref = (String)catJson.get(ConversionConstant.CHART_REF);
						if(ref != null)
						{						
							List<TokenId> refTokenIds = new ArrayList<TokenId>();
							ArrayList<String> addresses = CommonUtils.getRanges(ref);
							for(int k = 0; k < addresses.size(); k++)
							{
								ParsedRef parseRef = ReferenceParser.parse(addresses.get(k));
								if(parseRef !=null && FormulaUtil.isValidFormulaRef(parseRef))
								{
									Token token = new Token(addresses.get(k), null, OPType.UnnameRange);
									TokenId labelRefTokenId = new TokenId(token, idm);
									refTokenIds.add(labelRefTokenId);
								}else
									refTokenIds.add(null);
							}
							if(refTokenIds.size() > 0)
							{
								axisRefIds.put(axId, refTokenIds);
								axisRefAddrs.put(axId, addresses);
							}
						}						
					}
				}
			}
		}
	}
	
	//transform DataSeqTokens
	public boolean transformDataById(IDManager idm) {
		JSONObject o = (JSONObject) data.get(ConversionConstant.DATA);
		JSONObject settings = (JSONObject) o.get(ConversionConstant.CHART_SETTINGS);
		if(settings != null)
		{
			if(seriesRefIds != null)
			{
				JSONObject series = (JSONObject)settings.get(ConversionConstant.CHART_SERIES);
				Iterator<Map.Entry<String, Map<String, List<TokenId>>>> itor = seriesRefIds.entrySet().iterator();
				while(itor.hasNext())
				{
					Map.Entry<String, Map<String, List<TokenId>>> entry = itor.next();
					String serId = entry.getKey();
					Map<String, List<TokenId>> tempSeries = entry.getValue();
					Map<String, List<String>> tempSerieAddrs = seriesRefAddrs.get(serId);
					JSONObject pro = (JSONObject)series.get(serId);
					JSONObject proData = (JSONObject)pro.get("data");
					Iterator<Map.Entry<String, List<TokenId>>> roleItor = tempSeries.entrySet().iterator();
					while(roleItor.hasNext())
					{
						Map.Entry<String, List<TokenId>> roleEntry = roleItor.next();
						String role = roleEntry.getKey();
						List<TokenId> tokenIds = roleEntry.getValue();
						List<String> addrs = (List<String>)tempSerieAddrs.get(role);
						JSONObject valJson = (JSONObject)proData.get(role);
						if (tokenIds != null) 
						{
							String addr = MessageUtil.getAddr(addrs, tokenIds, idm);
							if(addr.length() > 0)
								valJson.put(ConversionConstant.CHART_REF, addr);
						}
					}
				}
			}
			if(axisRefIds != null)
			{
				JSONObject axis = (JSONObject)settings.get(ConversionConstant.CHART_AXIS);
				Iterator<Map.Entry<String, List<TokenId>>>  itor = axisRefIds.entrySet().iterator();
				while(itor.hasNext())
				{
					Map.Entry<String, List<TokenId>> entry = itor.next();
					String axisId = entry.getKey();
					List<TokenId> tokenIds = entry.getValue();
					List<String> addrs = axisRefAddrs.get(axisId);
					JSONObject pro = (JSONObject) axis.get(axisId);
					JSONObject catJson = (JSONObject)pro.get(ChartConstant.CATEGORIES);
					if (tokenIds != null) 
					{
						String addr = MessageUtil.getAddr(addrs, tokenIds, idm);
						if(addr.length() > 0)
							catJson.put(ConversionConstant.CHART_REF, addr);
					}
				}
			}			
		}
		return true;
	}	
}