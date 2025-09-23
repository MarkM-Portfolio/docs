package com.ibm.concord.spreadsheet.document.model.formula;

import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.rulesObject.DataValidation;
import com.ibm.concord.spreadsheet.document.model.rulesObject.RulesObj;

public class SharedFormulaRef4DV extends SharedFormulaRef4RulesObj
{
	private static int count = 1;
	private static String idPrefix = "srd";
	
	private static final Logger LOG = Logger.getLogger(SharedFormulaRef4DV.class.getName());
	
	public SharedFormulaRef4DV(RangeInfo info, Document doc)
	{
		super(info, RangeUsage.DATA_VALIDATION, doc);
		generateId();
	}
	
	public SharedFormulaRef4DV(RangeInfo info, Document doc, String id)
	{
		super(info, RangeUsage.DATA_VALIDATION, doc);
		this.setId(id);
		if(id.indexOf(idPrefix) == 0)
		{
			try{
				int n = Integer.parseInt(id.substring(idPrefix.length()));
				if(count <= n)
					count = ++ n;
			}
			catch(NumberFormatException e){
				LOG.log(Level.WARNING, "Data validaton id is not contains index " + id, e);
			}			
		}
	}
	
	private String generateId() {
	    String id = idPrefix + count++;
	    this.setId(id);
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
		 DataValidation dv = (DataValidation)rulesObj;
		 RulesObj newRulesObj = dv.createNewInstance(newSharedFormulaRef, refTokens);
		 newSharedFormulaRef.rulesObj = newRulesObj;
		 doc.addRulesObj(newRulesObj);
	}
}