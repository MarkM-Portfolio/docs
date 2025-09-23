package com.ibm.concord.spreadsheet.document.model.rulesObject;

import java.util.ArrayList;
import java.util.List;

import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4DV;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4RulesObj;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.json.java.JSONObject;
import com.ibm.concord.spreadsheet.document.model.rulesObject.RulesObjUtil.VALUETYPE;

public class DataValidation extends RulesObj
{
	private static final Logger LOG = Logger.getLogger(DataValidation.class.getName());
	private JSONObject criteria = null;
	
	private RuleVal value1;
	private RuleVal value2;
	
	public DataValidation(SharedFormulaRef4DV area, Document doc)
	{
		super(area, doc);
		usage = RangeUsage.DATA_VALIDATION;
	}		
	
	public DataValidation(SharedFormulaRef4DV area, Document doc, JSONObject content){
		super(area, doc);
		usage = RangeUsage.DATA_VALIDATION;
		if(content == null)
		{
			LOG.log(Level.WARNING, "content to create data validation is null!!!");
			return;
		}
		criteria = content;
		
		Object value = criteria.get(ConversionConstant.VALUE1);
		value1 = new RuleVal(value);
		
		value =  criteria.get(ConversionConstant.VALUE2);
		if(value != null)
		{
			value2 = new RuleVal(value);
		}
	}
	
	 public DataValidation createNewInstance(SharedFormulaRef4RulesObj range, ArrayList<FormulaToken> refTokens)
	 {
		DataValidation dataValidation =  new DataValidation((SharedFormulaRef4DV)range, doc);
		try {
			dataValidation.criteria = JSONObject.parse(criteria.toString());
		} catch (Exception e) {
			LOG.log(Level.WARNING, "clone Data Validation error!!!", e);
		}
		
		dataValidation.value1 = value1.clone();
		if(value2 != null)
			dataValidation.value2 = value2.clone();
		
		dataValidation.topRow = range.getStartRow();
		dataValidation.leftCol = range.getStartCol();
		
		return dataValidation;
	 }
	 
	 protected List<FormulaToken> getTokenList(boolean setTokenPos)
	 {
		 return getTokenList();
	 }
	 
	 protected List<FormulaToken> getTokenList()
	 {
		 ArrayList<FormulaToken> tokenList = new ArrayList<FormulaToken>();
		 if(value1.isFormula()) {
			 List<FormulaToken> list = value1.getTokenArray();
			 if (list != null) {
				 tokenList.addAll(list);
			 }
		 }
		 if(value2 != null && value2.isFormula()) {
			 List<FormulaToken> list = value2.getTokenArray();
			 if (list != null) {
				 tokenList.addAll(list);
			 }
		 }
		 return tokenList;
	 }
	 
	 public JSONObject toJson()
	 {
		 int rangeNum = ranges.size();
		 SharedFormulaRef4RulesObj range = ranges.get(0);
		 int deltaR = 0;
		 int deltaC = 0;
		 if(rangeNum > 1 && ((value1 != null && value1.type == VALUETYPE.RELFORMULA) || (value2 != null && value2.type == VALUETYPE.RELFORMULA))){
			 parseBaseRef();
			 deltaR = range.getStartRow() - topRow;
			 deltaC = range.getStartCol() - leftCol;
		 }
		 
		 List<FormulaToken> tokenArray = value1.getTokenArray();
		 int len = (tokenArray == null) ? 0 : tokenArray.size();
		 List<FormulaToken> tokenList = range.getTokenList();
		 
		 if(value1.type == VALUETYPE.RELFORMULA || value1.type == VALUETYPE.ABSFORMULA)
		 {
			 String val1 = value1.updateFormula(tokenList.subList(0, len), deltaR, deltaC, doc);
			 criteria.put(ConversionConstant.VALUE1, val1);
		 }
		
		 if(value2 != null && (value2.type == VALUETYPE.RELFORMULA || value2.type == VALUETYPE.ABSFORMULA))
		 {
			 String val2 = value2.updateFormula(tokenList.subList(len, tokenList.size()), deltaR, deltaC, doc);
			 criteria.put(ConversionConstant.VALUE2, val2);
		 }
		 
		 JSONObject data = new JSONObject();
		 data.put(ConversionConstant.CRITERIA, criteria);
		 
		 return data;
	 }
	 
	 public boolean isSplitable(boolean bRow)
	  {
		boolean relativeRow = value1.isRelativeRow() || (value2 != null && value2.isRelativeRow());
		boolean relativeCol = value1.isRelativeColumn() || (value2 != null && value2.isRelativeColumn());
	    return bRow? relativeRow : relativeCol;
	  }
}