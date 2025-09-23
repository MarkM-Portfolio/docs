package com.ibm.concord.spreadsheet.document.model.formula;

import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.rulesObject.ConditionalFormat;
import com.ibm.concord.spreadsheet.document.model.rulesObject.RulesObj;
import com.ibm.json.java.JSONArray;
import com.ibm.json.java.JSONObject;

public class SharedFormulaRef4CF extends SharedFormulaRef4RulesObj
{	
	private static final Logger LOG = Logger.getLogger(SharedFormulaRef4DV.class.getName());
	private static int count = 1;
	private static String idPrefix = "src";
	public SharedFormulaRef4CF(RangeInfo info, Document doc)
	{
		super(info, RangeUsage.CONDITIONAL_FORMAT, doc);
		generateId();
	}
	
	public SharedFormulaRef4CF(RangeInfo info, Document doc, String id)
	{
		super(info, RangeUsage.CONDITIONAL_FORMAT, doc);
		this.setId(id);
		if(id.indexOf(idPrefix) == 0)
		{
			try{
				int n = 0;
				int i = id.indexOf("_");
				if (i == -1) {
					n = Integer.parseInt(id.substring(idPrefix.length()));
				} else {
					n =  Integer.parseInt(id.substring(idPrefix.length(), i));
				}
				if(count <= n)
					count = ++ n;
			}
			catch(NumberFormatException e){
				LOG.log(Level.WARNING, "Conditional Format id is not contains index " + id, e);
			}			
		}
	}
	
	private String generateId() {
	    String id = idPrefix + count++;
	    this.setId(id);
	    return id;
	}
	
	protected String generateId4Split()
	{
		String id = this.getId() + "_" + count++;
		return id;
	}
	
	public static void reset()
	{
		count = 1;
	}
	
	public static String getNextId()
	{
		return idPrefix.concat(String.valueOf(count));
	}
	
	protected void createRulesObj(SharedFormulaRef4RulesObj newSharedFormulaRef, Document doc){
		 ArrayList<FormulaToken> refTokens = newSharedFormulaRef.tokenList;
		 ConditionalFormat cf = (ConditionalFormat)rulesObj;
		 RulesObj newRulesObj = cf.createNewInstance(newSharedFormulaRef, refTokens);
		 newSharedFormulaRef.rulesObj = newRulesObj;
		 doc.addRulesObj(newRulesObj);
	}
	
	public int getRulesCount() {
		JSONArray array = getCriteriasArray();
		if (array != null) {
			return array.size();
		}		
		return 0;
	}
	
	public String getRuleStyleId(int index) {
		String sid = null;
		JSONArray array = getCriteriasArray();
		if (array != null) {
			JSONObject obj = (JSONObject) array.get(index);
			if (obj != null) {
				sid = (String) obj.get(ConversionConstant.STYLEID_A);
			}
		}	
		return sid;
	}
	
	public JSONObject getRuleStyleJSON(int index) {
		JSONObject styleObj = null;
		JSONArray array = getCriteriasArray();
		if (array != null) {
			JSONObject obj = (JSONObject) array.get(index);
			if (obj != null) {
				styleObj = (JSONObject) obj.get(ConversionConstant.STYLE);				
			}
		}
		return styleObj;
	}

	public void setRuleStyleId(int index, String id) {
		JSONArray array = getCriteriasArray();
		if (array != null) {
			JSONObject obj = (JSONObject) array.get(index);
			if (obj != null) {
				obj.put(ConversionConstant.STYLEID_A, id);
				obj.remove(ConversionConstant.STYLE);
			}
		}	
	}
	
	private JSONArray getCriteriasArray() {
		JSONArray jsonArray = null;
		if (jsonData != null) {
			jsonArray = (JSONArray) jsonData.get(ConversionConstant.CRITERIAS);	
		}
		return jsonArray;
	}
}