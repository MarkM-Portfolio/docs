package com.ibm.concord.spreadsheet.document.model.formula;

import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.lang.reflect.Constructor;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.rulesObject.RulesObj;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.json.java.JSONObject;

public abstract class SharedFormulaRef4RulesObj extends SharedFormulaRefBase
{
	protected RulesObj rulesObj;
	protected JSONObject jsonData;
	
	private static final Logger LOG = Logger.getLogger(SharedFormulaRef4RulesObj.class.getName());
	
	public SharedFormulaRef4RulesObj(RangeInfo info, RangeUsage usage, Document doc)
	{
		super(info, usage, doc, false);
	}

	public void setJsonData(JSONObject data)
	{
		jsonData = data;
	}
	
	public JSONObject getJsonData()
	{
		JSONObject data = new JSONObject();
		if(jsonData != null)
			data.put(ConversionConstant.DATA, jsonData);
		return data;
	}
	
	public RulesObj getRulesObj()
	{
		return rulesObj;
	}
	
	public void setRulesObj(RulesObj data)
	{
		rulesObj = data;
	}
	
	public void removPartialRange(RangeInfo interRange, Document doc)
	{
		 int sheetId = getSheetId();
		 int osr = getStartRow();
		 int osc = getStartCol();
		 int oer = getEndRow();
		 int oec = getEndCol();
		 int srDelta = interRange.getStartRow() - osr;
		 int scDelta = interRange.getStartCol() - osc;
		 int erDelta = oer - interRange.getEndRow();
		 int ecDelta = oec - interRange.getEndCol();
		 if(srDelta > 0){
			 RangeInfo info = new RangeInfo(sheetId, osr, osc ,interRange.getStartRow() - 1, oec, ParsedRefType.RANGE);
			 createNewRulesObj(info, doc);
		 }
		 
		 if(scDelta > 0){
			 int sr = srDelta > 0 ? interRange.getStartRow() : osr;
			 int er = erDelta > 0 ? interRange.getEndRow() : oer;
			 RangeInfo info = new RangeInfo(sheetId, sr, osc ,er, interRange.getStartCol() - 1, ParsedRefType.RANGE);
			 createNewRulesObj(info, doc);
		 }
		 
		 if(erDelta > 0){
			 RangeInfo info = new RangeInfo(sheetId, interRange.getEndRow() + 1, osc ,oer, oec, ParsedRefType.RANGE);
			 createNewRulesObj(info, doc);
		 }
		 		 
		 if(ecDelta > 0){
			 int sr = srDelta > 0 ? interRange.getStartRow() : osr;
			 int er = erDelta > 0 ? interRange.getEndRow() : oer;
			 RangeInfo info = new RangeInfo(sheetId, sr, interRange.getEndCol() + 1 ,er, oec, ParsedRefType.RANGE);
			 createNewRulesObj(info, doc);
		 }
		 clearRefTokens(doc);
		 rulesObj.removeRange(this);
		 AreaManager areaManager = doc.getAreaManager();
		 endListeningSharedArea(areaManager, this, this);
	}
	
	private void createNewRulesObj (RangeInfo info, Document doc)
	{
		AreaManager areaManager = doc.getAreaManager();
		Class<?> c = getClass();
		Constructor<?> cons[] = c.getConstructors();
		try {
			SharedFormulaRef4RulesObj newSharedFormulaRef = (SharedFormulaRef4RulesObj)cons[0].newInstance(info, doc);
			areaManager.startListeningArea(info, null, newSharedFormulaRef);
	//		newSharedFormulaRef.addListener(newSharedFormulaRef);
			int rDelta = info.getStartRow() - getStartRow();
			int cDelta = info.getStartCol() - getStartCol();
			 for(int i = 0; i < tokenList.size(); i++){
				FormulaToken token = tokenList.get(i);
			    Area ref = token.getArea();
		    	if(ref != null && ref instanceof SharedReferenceRef){
		    		SharedReferenceRef sharedRef = (SharedReferenceRef)ref;
		    		ReferenceToken refToken = (ReferenceToken)token;
		    		int refMask = refToken.getRefMask();
		    		int sr = ref.getStartRow();
		    		int sc = ref.getStartCol();
		    		int er = sr + sharedRef.getRowSize() - 1;
		    		int ec = sc + sharedRef.getColSize() - 1;
		    		if((refMask & ReferenceParser.START_ROW) > 0 && (refMask & ReferenceParser.ABSOLUTE_ROW) == 0)
		    		{	    			
		    			sr += rDelta;
		            	er += rDelta;
		            	er += info.getEndRow() - info.getStartRow() + 1;
		    		}
		    		
		    		if((refMask & ReferenceParser.START_COLUMN) > 0 && (refMask & ReferenceParser.ABSOLUTE_COLUMN) == 0)
		    		{	    			
		    			sc += cDelta;
		            	ec += cDelta;
		            	ec += info.getEndCol() - info.getStartCol() + 1;
		    		}
		    		
		    		RangeInfo newInfo = new RangeInfo(ref.getSheetId(), sr, sc, er, ec, ref.rangeInfo.getType());
		    		SharedReferenceRef newSharedReference = new SharedReferenceRef(newInfo, doc, sharedRef.getRowSize(), sharedRef.getColSize(), refMask);
		    		ReferenceToken newSharedRefToken = refToken.copy();
		            newSharedRefToken.setArea(newSharedReference);
		            
		            newSharedFormulaRef.pushRefToken(newSharedRefToken, true);
		            areaManager.startListeningArea(newInfo, newSharedFormulaRef, newSharedReference);
	    		}else{
	    			generateRefTokenByCopyToken(token, null, newSharedFormulaRef, true, doc);
	    		}
    		}
			 newSharedFormulaRef.rulesObj = rulesObj;
			 rulesObj.addRange(newSharedFormulaRef);
		}catch (Exception e) {
			 LOG.log(Level.WARNING, "createNewRulesObj error happens", e);
		}
	}	
	
	protected void _splitSharedReferences(RangeInfo updateRange, int rowDelta, int colDelta, Document doc)
	{
		super._splitSharedReferences(updateRange, rowDelta, colDelta, doc);
		rulesObj.removeRange(this);	
		endListeningSharedArea(doc.getAreaManager(), this, this);
	}
	
	protected void splitFromParent(Document doc, boolean allUpdate)
	{
		if (!rangeInfo.isValid()) {
			rulesObj.removeRange(this);
		} else if (!allUpdate && rulesObj.rangeNum() > 1) {
			rulesObj.removeRange(this);
			createRulesObj(this, doc);
		}
	}
	
	protected void createSharedReferences(int delta, RangeInfo updateRange, int dsr, int dsc, int der, int dec, int rowDelta, int colDelta, ArrayList<Area> newSharedRefTokens, Document doc)
	{
		if ( delta >= 0 ){
         	createSharedReference(updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc);
         }
	}

	protected void _createSharedReference(SharedFormulaRefBase newSharedFormulaRef, int dsr, int dsc, int der, int dec, Document doc)
	{
		SharedFormulaRef4RulesObj sharedFormulaRef4RulesObj = (SharedFormulaRef4RulesObj)newSharedFormulaRef;
		newSharedFormulaRef.addListener(newSharedFormulaRef);
		createRulesObj(sharedFormulaRef4RulesObj, doc);
	}
	
	protected void _createFormulaCells(int dsr,int dsc,int der,int dec,RangeInfo updateRange,int rowDelta,int colDelta,Document doc)
	{
		int formulaStartRow = getStartRow();
	    int formulaStartCol = getStartCol();
	    int sheetId = getSheetId();
	 	AreaManager areaManager = doc.getAreaManager();
	 	
	 	int start = 0;
	 	int end = 0;
	 	boolean bRow = true;
	 	if(rowDelta != 0){
	 		  start = formulaStartRow + dsr;
	 		  end = formulaStartRow + der;
	 	 }else if(colDelta != 0){
	 		 start = formulaStartCol + dsc;
	 		 end = formulaStartCol + dec;
	 		 bRow = false;
	 	 }
	 	
	 	Class<?> c = getClass();
		Constructor<?> cons[] = c.getConstructors();	 	
	 	for(int i = start; i <= end; i ++){
	 		 int sr = bRow ? i : formulaStartRow;
	 		 int er = bRow ? i : getEndRow();
	 		 int sc = !bRow ? i : formulaStartCol;
	 		 int ec = !bRow ? i : getEndCol();
	 		 int deltaR = 0;
	 		 int deltaC = 0;
	 		if (rowDelta != 0) {
	 			deltaR = sr - formulaStartRow;
	 			if(getSheetId() == updateRange.getSheetId())
	 			{
		 			sr = updateStart(sr, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
	            	er = updateEnd(er, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
	 			}
            	if(er < sr)
    				continue;
            }else if(colDelta != 0) {
	           	deltaC = sc - formulaStartCol;
	            if(getSheetId() == updateRange.getSheetId())
	            {
		           	sc = updateStart(sc, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
		 	        ec = updateEnd(ec, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
	            }
	 	        if(ec < sc)
	 	        	continue;
            }
	 		RangeInfo info = new RangeInfo(sheetId, sr, sc, er, ec, rangeInfo.getType());
	 		
			try {
				String id = generateId4Split();
				SharedFormulaRef4RulesObj newSharedFormulaRef = (id == null) ? (SharedFormulaRef4RulesObj)cons[0].newInstance(info, doc) : (SharedFormulaRef4RulesObj)cons[1].newInstance(info, doc, id);
	    		areaManager.startListeningArea(info, newSharedFormulaRef, newSharedFormulaRef);
	    		for(int k = 0; k < tokenList.size(); k++){
	    			FormulaToken token = tokenList.get(k);
		    		Area ref = token.getArea();
		    		if(ref != null && ref instanceof SharedReferenceRef){
		    			ReferenceToken refToken = (ReferenceToken)token;
		    			int refMask = refToken.getRefMask();
		    			SharedReferenceRef sharedRef = (SharedReferenceRef)ref;
		    			int rowSize = sharedRef.getRowSize();
		                int colSize = sharedRef.getColSize();
		    			int osr = ref.getStartRow();
		    			int nsr = osr;
		    			int oer = osr + rowSize - 1;
		    			int ner = oer;
		    			int osc = ref.getStartCol();
		    			int nsc = osc;
		    			int oec = osc + colSize - 1;
		    			int nec = oec;
		    			if((refMask & ReferenceParser.START_ROW) > 0 && (refMask & ReferenceParser.ABSOLUTE_ROW) == 0)
		    			{
		    				 nsr = osr += deltaR;
		    				 ner = oer += deltaR;
		    				 if (rowDelta != 0 && ref.getSheetId() == updateRange.getSheetId()) {
				                nsr = updateStart(osr, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
			                	ner = updateEnd(oer, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
			                	if(ner < nsr)
			                		ner = nsr = -1;
			                	rowSize = ner - nsr + 1;
		    				 }else
		 	                	ner += er - sr; 
		    			}
		    			if((refMask & ReferenceParser.START_COLUMN) > 0 && (refMask & ReferenceParser.ABSOLUTE_COLUMN) == 0)
		    			{
		    				nsc = osc += deltaC;
		    				nec = oec += deltaC;
		    				if(colDelta != 0 && ref.getSheetId() == updateRange.getSheetId()) {
			                	nsc = updateStart(osc, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
			 	    	        nec = updateEnd(oec, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
			 	    	        if(nec < nsc)
			 	    	        	nsc = nec = -1;
			 	    	       colSize = nec - nsc + 1;
			                 }else
				                nec += ec - sc;
		    			}
		    			
		    			 RangeInfo newRef = new RangeInfo(ref.getSheetId(), nsr, nsc, ner, nec, ref.rangeInfo.getType());
		                 SharedReferenceRef newSharedReference = new SharedReferenceRef(newRef, doc, rowSize, colSize, refMask);
		                 ReferenceToken newSharedRefToken = refToken.copy();
			            newSharedRefToken.setArea(newSharedReference);
			            
			            newSharedFormulaRef.pushRefToken(newSharedRefToken, true);
			            areaManager.startListeningArea(newRef, newSharedFormulaRef, newSharedReference);
		    		}else{
		    			generateRefTokenByCopyToken(token, null, newSharedFormulaRef, true, doc);
		    		}
	    		}
	    		createRulesObj(newSharedFormulaRef, doc);
			}catch (Exception e) {
				LOG.log(Level.WARNING, "_createFormulaCells of sharedFormulaRef4RulesObj error happens", e);
			}
	 	}
	}	
	
	protected abstract void createRulesObj(SharedFormulaRef4RulesObj newSharedFormulaRef, Document doc);
	

	public void splitSharedReferences(RangeInfo updateRange, int rowDelta, int colDelta, Document doc)
	{
		boolean bRow = rowDelta == 0 ? false : true;
		if (this.rulesObj.isSplitable(bRow)) {
			super.splitSharedReferences(updateRange, rowDelta, colDelta, doc);
		}
		else {
	        this.updateAddress(updateRange, rowDelta, colDelta, doc);
		}
	}
}