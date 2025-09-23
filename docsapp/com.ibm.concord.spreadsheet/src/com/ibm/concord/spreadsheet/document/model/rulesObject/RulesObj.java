package com.ibm.concord.spreadsheet.document.model.rulesObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.document.model.formula.Area;
import com.ibm.concord.spreadsheet.document.model.formula.AreaManager;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil;
import com.ibm.concord.spreadsheet.document.model.formula.Reference;
import com.ibm.concord.spreadsheet.document.model.formula.SharedFormulaRef4RulesObj;
import com.ibm.concord.spreadsheet.document.model.formula.SharedReferenceRef;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONObject;
import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;

public abstract class RulesObj
{
	private static final Logger LOG = Logger.getLogger(RulesObj.class.getName());
	protected Document doc;
	protected String id;
	protected List<SharedFormulaRef4RulesObj> ranges = null;
	protected RangeUsage usage;
	protected int topRow;
	protected int leftCol;
	private Map<String, ReferenceParser.ParsedRef> parsedRefCache;
	
	public RulesObj(SharedFormulaRef4RulesObj area, Document doc){
		this.doc = doc;
		
		ranges = new ArrayList<SharedFormulaRef4RulesObj>();
		ranges.add(area);
		
		id = area.getId();
		
	}
	
	public RangeUsage getUsage()
	{
		return usage;
	}
	
	public List<SharedFormulaRef4RulesObj> ranges()
	{
		return ranges;
	}
	
	public void addRange(SharedFormulaRef4RulesObj range)
	{
		ranges.add(range);
	}
	
	public int rangeNum()
	{
		return ranges.size();
	}
	
	public void removeRange(SharedFormulaRef4RulesObj range)
	{
		int len = ranges.size();
		int i = 0;
		for(i = 0; i < len; i++){
			if(ranges.get(i).getId() == range.getId()){
				ranges.remove(i);
				break;
			}
		}
		if(ranges.size() == 0){
			doc.removeRulesObj(id);
			return;
		}
		if(i == 0){
			String newName = ranges.get(0).getId();
			doc.renameRulesObj(this, newName, usage);
			id = newName;
		}
	}
	
	 public abstract RulesObj createNewInstance(SharedFormulaRef4RulesObj range, ArrayList<FormulaToken> refTokens);
	
	 public String getId()
	 {
		 return id;
	 }
	 
	 protected void parseBaseRef()
	 {
		topRow = 0;
		leftCol = 0;
		for(int i = 0; i < this.ranges.size(); i++){
			SharedFormulaRef4RulesObj range = ranges.get(i);
			if(topRow == 0 || topRow > range.getStartRow())
				topRow = range.getStartRow();
			if(leftCol == 0|| leftCol > range.getStartCol())
				leftCol = range.getStartCol();
		}
	 }
	 
	 protected List<FormulaToken> getTokenList(boolean setTokenPos)
	 {
		 return null;
	 }
	 
	 protected List<FormulaToken> getTokenList()
	 {
		 return null;
	 }
	 
	//Only add sharedreftokens to sharedformularef, abslate refs and names only in datavalidaion's tokenarray.
	 public void parse()
	 {	 
		 List<FormulaToken> tokenList = getTokenList(true);
		 if(tokenList.size() == 0)
			 return;
		 
		 parseBaseRef();
		 AreaManager areaMgr = doc.getAreaManager();
		 
		 for(int i = 0; i < ranges.size(); i++)
		 {
			 SharedFormulaRef4RulesObj range = ranges.get(i);
			 parse(range, i == 0, tokenList, areaMgr);
		 }
	 }
	 
	 public void parse4Range(SharedFormulaRef4RulesObj area)
	{
		parse(area, false, null, null);
	}
	 
	 private void updateTokenArrays(List<FormulaToken> tokenList)
	 {
		SharedFormulaRef4RulesObj range = ranges.get(0);
		int deltaR = range.getStartRow() - topRow;
		int deltaC = range.getStartCol() - leftCol;
		int rowNum = range.getEndRow() - range.getStartRow();
		int colNum = range.getEndCol() - range.getStartCol();
		
		 List<FormulaToken> refTokens = range.getTokenList();
		 for(int i = 0; i < refTokens.size(); i ++){
			 FormulaToken refToken = refTokens.get(i);
			 Area area = refToken.getArea();
			 if(!(area instanceof SharedReferenceRef))
				continue;
			 
			 FormulaToken token = tokenList.get(i);
			 String addr = token.getText();
			 ReferenceParser.ParsedRef parsedRef = parsedRefCache != null ? parsedRefCache.get(addr) : null;
			 if(parsedRef == null)
				 parsedRef = ReferenceParser.parse(addr.trim());
			 
			 int startRow = area.getStartRow();
			 int endRow = area.getEndRow();
			 int startCol = area.getStartCol();
			 int endCol = area.getEndCol();
			 
			 if(ParsedRefType.COLUMN != parsedRef.type && (parsedRef.patternMask & ReferenceParser.ABSOLUTE_ROW) == 0)
		    	  startRow -= deltaR;
			 if(ParsedRefType.ROW != parsedRef.type && (parsedRef.patternMask & ReferenceParser.ABSOLUTE_COLUMN) == 0)
				 startCol -= deltaC;
		     if(ParsedRefType.CELL == parsedRef.type)
		     {
		    	 endRow = startRow;
		    	 endCol = startCol;
		     }else{
		    	 if(ParsedRefType.COLUMN != parsedRef.type && (parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_ROW) == 0)
			    	  endRow -= deltaR;
		    	 if(ParsedRefType.ROW != parsedRef.type && (parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_COLUMN) == 0)
			    	 endCol -= deltaC;
		    	 if(ParsedRefType.COLUMN != parsedRef.type && ((parsedRef.patternMask & ReferenceParser.ABSOLUTE_ROW) == 0 || (parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_ROW) == 0))
		    		 endRow -= rowNum;
		    	 if(ParsedRefType.ROW != parsedRef.type && ((parsedRef.patternMask & ReferenceParser.ABSOLUTE_COLUMN) == 0 || (parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_COLUMN) == 0))
		    		endCol -= colNum;
		     }
		     
		     String newAddr = ModelHelper.getAddress(parsedRef.sheetName, startRow, startCol, 
		    		 parsedRef.sheetName, endRow, endCol, parsedRef.patternMask, false);
		     token.setText(newAddr);
		 }
	}
	 
	 private void parse(SharedFormulaRef4RulesObj range, boolean bFirst, List<FormulaToken> tokenList, AreaManager areaMgr)
	{
		if(tokenList == null)
		{
			tokenList = this.getTokenList();
			if(tokenList.size() == 0)
				 return;
			 updateTokenArrays(tokenList);
		}
		if(areaMgr == null)
			areaMgr = doc.getAreaManager();
		
		if(parsedRefCache == null)
			parsedRefCache = new HashMap<String, ReferenceParser.ParsedRef>();
		
		 int deltaR = range.getStartRow() - topRow;
		 int deltaC = range.getStartCol() - leftCol;
		 int rowNum = range.getEndRow() - range.getStartRow();
		 int colNum = range.getEndCol() - range.getStartCol();
		 for(int j = 0; j < tokenList.size(); j++){
			 FormulaToken token = tokenList.get(j);
			 String addr = token.getText();
			 if(token.getType() == FormulaUtil.TokenType.RANGE){
				 ReferenceParser.ParsedRef parsedRef = parsedRefCache.get(addr);
				 if(parsedRef == null)
				 {
					 parsedRef = ReferenceParser.parse(addr.trim());
					 parsedRefCache.put(addr, parsedRef);
					 if(parsedRef.sheetName == null)
			         {
						 int sheetId = range.getSheetId();
						 Sheet s = doc.getSheetById(sheetId);
						 parsedRef.sheetName = s.getSheetName();
			         }
					 if (ParsedRefType.CELL == parsedRef.type){
						 parsedRef.endRow = parsedRef.startRow;
						 parsedRef.endCol = parsedRef.startCol;
					 }
				 }
				 ReferenceToken refToken = (ReferenceToken)token;
				
				 if(parsedRef.isValid() && RulesObjUtil.isRelativeRef(parsedRef.patternMask))
				 {
					 Sheet s = doc.getSheetByName(parsedRef.getSheetName());
					 if(s != null)
					 {
						 int startRow = ParsedRefType.COLUMN == parsedRef.type ? 1 : parsedRef.getIntStartRow();
						 int endRow = ParsedRefType.COLUMN == parsedRef.type ? ConversionConstant.MAX_ROW_NUM : parsedRef.getIntEndRow();
						 int startCol = ParsedRefType.ROW == parsedRef.type ? 1 : parsedRef.getIntStartCol();
						 int endCol = ParsedRefType.ROW == parsedRef.type ? ConversionConstant.MAX_COL_NUM : parsedRef.getIntEndCol();

						 int rowSize = endRow - startRow + 1;
						 int colSize = endCol - startCol + 1;
						 
						 if(ParsedRefType.COLUMN != parsedRef.type && (parsedRef.patternMask & ReferenceParser.ABSOLUTE_ROW) == 0)
					    	  startRow += deltaR;
						 if(ParsedRefType.ROW != parsedRef.type && (parsedRef.patternMask & ReferenceParser.ABSOLUTE_COLUMN) == 0)
							 startCol += deltaC;
					     if(ParsedRefType.CELL == parsedRef.type)
					     {
					    	 endRow = startRow;
					    	 endCol = startCol;
					     }
					     else
					     {
					    	 if(ParsedRefType.COLUMN != parsedRef.type && (parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_ROW) == 0)
						    	  endRow += deltaR;
					    	 if(ParsedRefType.ROW != parsedRef.type && (parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_COLUMN) == 0)
						    	 endCol += deltaC;
					     }
					    
					     if(ParsedRefType.COLUMN != parsedRef.type && ((parsedRef.patternMask & ReferenceParser.ABSOLUTE_ROW) == 0 || (parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_ROW) == 0)){
					    	 if(endRow < startRow){
								int tmp = startRow;
								startRow = endRow;
								endRow = tmp;
							}
					    	 endRow += rowNum;
					     }
						 
					     if(ParsedRefType.ROW != parsedRef.type && ((parsedRef.patternMask & ReferenceParser.ABSOLUTE_COLUMN) == 0 || (parsedRef.patternMask & ReferenceParser.ABSOLUTE_END_COLUMN) == 0)){
					    	 if(endCol < startCol){
								int tmp = startCol;
								startCol = endCol;
								endCol = tmp;
							}
							endCol += colNum;
					     }
					     
					     int mask = parsedRef.patternMask;
					     if(ParsedRefType.CELL == parsedRef.type && (startRow != endRow || startCol != endCol)){
					    	if((mask & ReferenceParser.ABSOLUTE_ROW) > 0)
					    		mask |= ReferenceParser.ABSOLUTE_END_ROW;
					    	mask |= ReferenceParser.END_ROW;
					    	
					    	if((mask & ReferenceParser.ABSOLUTE_COLUMN) > 0)
					    		mask |= ReferenceParser.ABSOLUTE_END_COLUMN;
					    	mask |= ReferenceParser.END_COLUMN;
					     }
					     
					     int sheetId = s.getId();
					     RangeInfo info = new RangeInfo(sheetId, startRow, startCol, endRow, endCol, parsedRef.type);
					     SharedReferenceRef sharedReferenceRef = new SharedReferenceRef(info, doc, rowSize, colSize, parsedRef.patternMask);
					     ReferenceToken sharedRefToken = refToken.copy();
					     sharedRefToken.setArea(sharedReferenceRef);
					     sharedRefToken.setRefMask(mask);
					     areaMgr.startListeningArea(info, range, sharedReferenceRef);
					     range.pushRefToken(sharedRefToken, true);
				     }else
				    	 range.pushRefToken(token, true);
				 }
				 else
				 {
					 Area area = refToken.getArea();
					 if(bFirst || area == null)
					 {
						 Sheet s = doc.getSheetByName(parsedRef.sheetName);
						 if(s != null)
						 {
				        	 int sheetId = s.getId();
							 RangeInfo info = new RangeInfo(sheetId, parsedRef.getIntStartRow(), parsedRef.getIntStartCol(), parsedRef.getIntEndRow(), parsedRef.getIntEndCol(), parsedRef.type);							 
							 area = new Reference(info, doc);
							 refToken.setArea(area);
							 refToken.setRefMask(parsedRef.patternMask);
							 areaMgr.startListeningArea(info, null, area);
						 }
					 }
				 	range.pushRefToken(refToken, true);
				 	if(area != null)
				 		area.addListener(range);
				 }
			 }
			 else
				 range.pushRefToken(token, true);
		 }
	}
	 
	 public List<SharedFormulaRef4RulesObj> getRanges()
	 {
		 ArrayList<SharedFormulaRef4RulesObj> list = new ArrayList<SharedFormulaRef4RulesObj>();
		 SharedFormulaRef4RulesObj range = ranges.get(0);
		 JSONObject data = toJson();		
		 range.setJsonData(data);
		 
		 list.add(range);
		 
		 int len = ranges.size();
		 if(len > 1)
		 {
			 JSONObject d = new JSONObject();
			 d.put(ConversionConstant.PARENTID, id);
			 for(int i = 1; i < len; i++)
			 {
				 SharedFormulaRef4RulesObj r = ranges.get(i);
				 r.setJsonData(d);
				 list.add(r);
			 }
		 }
		 
		 return list;
	 }
	 
	 public JSONObject toJson()
	 {
		 return null;
	 }
	 
	 public boolean isSplitable(boolean bRow)
	 {
		 return true;
	 }
}