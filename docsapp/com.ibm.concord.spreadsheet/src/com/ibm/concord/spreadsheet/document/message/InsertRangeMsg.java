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
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRef;
import com.ibm.concord.spreadsheet.common.utils.CommonUtils;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.json.java.JSONObject;
import com.ibm.json.java.JSONArray;

public class InsertRangeMsg extends Message {
	private static final Logger LOG = Logger.getLogger(RangeMsg.class.getName());
	private static final String []_roles = {"label","xVal","yVal", "val", "bubbleSize"};
	boolean bChartMsg = false;
	boolean bFilterMsg = false;
	boolean bSheet = false;
	List<List<Map<String, List<TokenId>>>> plotsRefs = null;
	List<List<TokenId>> axisRefs = null;
	List<List<Map<String, List<String>>>> plotsRefAddrs = null;
	List<List<String>> axisRefAddrs = null;
	
	JSONObject filterRules = null;
	
	public InsertRangeMsg(JSONObject jsonEvent, IDManager idm) {	
		super(jsonEvent, idm);
		
		JSONObject o = (JSONObject) jsonEvent.get(ConversionConstant.DATA);
		String usage = (String)o.get(ConversionConstant.RANGE_USAGE);
		if(ConversionConstant.USAGE_CHART.equalsIgnoreCase(usage))
		  bChartMsg = true;
		else if(ConversionConstant.USAGE_FILTER.equalsIgnoreCase(usage))
		  bFilterMsg = true;
		
		JSONObject data = (JSONObject) o.get(ConversionConstant.DATA);
		if(data != null && data.containsKey(ConversionConstant.FOR_SHEET)){
			bSheet = (Boolean)data.get(ConversionConstant.FOR_SHEET);
		}
	}
	
	public void transformDataByIndex(IDManager idm) {
		if (bChartMsg)
		{
		    JSONObject o = (JSONObject)data.get(ConversionConstant.DATA);
	        JSONObject chartData = (JSONObject)o.get(ConversionConstant.DATA);
	        JSONObject chart = (JSONObject)chartData.get(ConversionConstant.USAGE_CHART);
	        JSONObject plotArea = (JSONObject)chart.get(ConversionConstant.CHART_PLOTAREA);
	        JSONArray plots = (JSONArray)plotArea.get(ConversionConstant.CHART_PLOTS);
	        JSONArray axis = (JSONArray)plotArea.get(ConversionConstant.CHART_AXIS);
	            
	        plotsRefs = new ArrayList<List<Map<String, List<TokenId>>>>();
	        plotsRefAddrs = new ArrayList<List<Map<String, List<String>>>>();
	        for (int i = 0; i < plots.size(); ++i) {
	            JSONArray oSeries = (JSONArray)((JSONObject)plots.get(i)).get(ConversionConstant.CHART_SERIES);
	            List<Map<String, List<TokenId>>> tempPlots = new ArrayList<Map<String, List<TokenId>>>();
	            List<Map<String, List<String>>> tempPlotAddrs = new ArrayList<Map<String, List<String>>>();
	            for (int j = 0; j < oSeries.size(); ++j) {
	                // there has reference in label, xVal or yVal of each series
	                JSONObject series = (JSONObject)oSeries.get(j);
	                Map<String, List<TokenId>> tempSeries = new HashMap<String, List<TokenId>>();
	                Map<String, List<String>> tempSerieAddrs = new HashMap<String, List<String>>();
	                
	                for(int t = 0; t < _roles.length; t++)
	                {
	                    String role = _roles[t];
	                    JSONObject valJson = (JSONObject)series.get(role);
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
	                                tempSerieAddrs.put(role, addresses);
	                                tempSeries.put(role, refTokenIds);
	                            }
	                        }
	                    }
	                }
	                
	                tempPlots.add(tempSeries);
	                tempPlotAddrs.add(tempSerieAddrs);
	            }
	            plotsRefs.add(tempPlots);
	            plotsRefAddrs.add(tempPlotAddrs);
	        }
	        
	        axisRefs = new ArrayList<List<TokenId>>();
	        axisRefAddrs = new ArrayList<List<String>>();
	        for (int i = 0; i < axis.size(); ++i) {
	            JSONObject category = (JSONObject)((JSONObject)axis.get(i)).get(ConversionConstant.CHART_CATEGORY);
	            List<TokenId> refTokenIds = null;
	            List<String> tempAddrs = null;
	            if (category != null)
	            {
	                String ref = (String)category.get(ConversionConstant.CHART_REF);
	                if(ref != null)
	                {
	                    refTokenIds = new ArrayList<TokenId>();
	                    tempAddrs = CommonUtils.getRanges(ref);
	                    for(int j = 0; j < tempAddrs.size(); j++){
	                        ParsedRef parseRef = ReferenceParser.parse(tempAddrs.get(j));
	                        if(parseRef !=null && FormulaUtil.isValidFormulaRef(parseRef))
	                        {
	                            Token token = new Token(tempAddrs.get(j), null, OPType.UnnameRange);
	                            TokenId refTokenId = new TokenId(token, idm);
	                            refTokenIds.add(refTokenId);
	                        }else
	                            refTokenIds.add(null);
	                    }
	                }
	            }
	            axisRefs.add(refTokenIds);
	            axisRefAddrs.add(tempAddrs);
	        }
		}
		else if(bFilterMsg)
        {
		  JSONObject o = (JSONObject)data.get(ConversionConstant.DATA);
          JSONObject rules = (JSONObject)o.get(ConversionConstant.DATA);
          if(rules!=null)
          {
            String sheetId = refTokenId.getSheetId();
            filterRules = new JSONObject();
            Iterator<Map.Entry<String, JSONObject>> itor = rules.entrySet().iterator();
            while(itor.hasNext())
            {
              Map.Entry<String, JSONObject> entry = itor.next();
              int col = Integer.parseInt(entry.getKey());
              JSONObject rule = entry.getValue();
              String colId = idm.getColIdByIndex(sheetId, col-1, true);
              filterRules.put(colId, rule);
            }
          }
        }
	}
	
	public boolean transformDataById(IDManager idm) {
		if (bChartMsg)
		{
		    JSONObject o = (JSONObject)data.get(ConversionConstant.DATA);
	        JSONObject chartData = (JSONObject)o.get(ConversionConstant.DATA);
	        JSONObject chart = (JSONObject)chartData.get(ConversionConstant.USAGE_CHART);
	        JSONObject plotArea = (JSONObject)chart.get(ConversionConstant.CHART_PLOTAREA);
	        JSONArray plots = (JSONArray)plotArea.get(ConversionConstant.CHART_PLOTS);
	        JSONArray axis = (JSONArray)plotArea.get(ConversionConstant.CHART_AXIS);
	        
	        for (int i = 0; i < plots.size(); ++i) {
	            List<Map<String, List<TokenId>>> plotRefs = plotsRefs.get(i);
	            List<Map<String, List<String>>> plotRefAddrs = plotsRefAddrs.get(i);
	            JSONArray oSeries = (JSONArray)((JSONObject)plots.get(i)).get(ConversionConstant.CHART_SERIES);
	            for (int j = 0; j < oSeries.size(); ++j) {
	                JSONObject series = (JSONObject)oSeries.get(j);
	                Map<String, List<TokenId>> seriesRefs = plotRefs.get(j);
	                Map<String, List<String>> seriesRefAddrs = plotRefAddrs.get(j);
	                
	                for(int t = 0; t < _roles.length; t++)
	                {
	                    String role = _roles[t];
	                    JSONObject valJson = (JSONObject)series.get(role);
	                    List<TokenId> tokenIds = (List<TokenId>)seriesRefs.get(role);
	                    List<String> addrs = (List<String>)seriesRefAddrs.get(role);
	                    if (tokenIds != null) {
	                        String addr = MessageUtil.getAddr(addrs, tokenIds, idm);
	                        if(addr.length() > 0)
	                            valJson.put(ConversionConstant.CHART_REF, addr);
	                    }
	                }
	            }
	        }
	        
	        for (int i = 0; i < axis.size(); ++i) {
	            JSONObject category = (JSONObject)((JSONObject)axis.get(i)).get(ConversionConstant.CHART_CATEGORY);
	            if (category != null) {
	                List<TokenId> refTokenIds = (List<TokenId>)axisRefs.get(i);
	                List<String>  addrs = (List<String>)axisRefAddrs.get(i);
	                if (refTokenIds != null) {
	                    String addr = MessageUtil.getAddr(addrs, refTokenIds, idm);
	                    if(addr.length() > 0)
	                        category.put(ConversionConstant.CHART_REF, addr);
	                }
	            }
	        }
		}
		else if(bFilterMsg)
		{
		  if(filterRules!=null)
		  {
		    JSONObject o = (JSONObject)data.get(ConversionConstant.DATA);
	        JSONObject rules = (JSONObject)o.get(ConversionConstant.DATA);
	        rules.clear();
	        
		    String sheetId = refTokenId.getSheetId();
            Iterator<Map.Entry<String, JSONObject>> itor = filterRules.entrySet().iterator();
            while(itor.hasNext())
            {
              Map.Entry<String, JSONObject> entry = itor.next();
              String colId = entry.getKey();
              JSONObject rule = entry.getValue();
              int col = idm.getColIndexById(sheetId, colId);
              if(col<0)
                continue;
              rules.put(String.valueOf(col+1), rule);
            }
		  }
		}
		
		return true;
	}
	
	public String setRefValue(IDManager idm) {
		Token token = refTokenId.getToken();
		return token.toString(bSheet);
	}
}