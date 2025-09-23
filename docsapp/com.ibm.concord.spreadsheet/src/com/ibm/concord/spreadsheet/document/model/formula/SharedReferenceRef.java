package com.ibm.concord.spreadsheet.document.model.formula;

import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.formula.Area;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.json.java.JSONObject;

public class SharedReferenceRef extends Reference
{
	private static final Logger LOG = Logger.getLogger(SharedFormulaRefBase.class.getName());	
	private int rowSize;
	private int colSize;
	private int refMask;
	
	public SharedReferenceRef(RangeInfo info, Document doc, int rSize, int cSize, int mask)
	{
		super(info, RangeUsage.SHARED_REFS, doc, true);
		rowSize = rSize;
		colSize = cSize;
		refMask = mask;
		
	}
	
	public int getRowSize()
	{
		return rowSize;
	}
	
	public int getColSize()
	{
		return colSize;
	}
	
	public boolean update(RangeInfo range, int rowDelta, int colDelta, NotifyEvent event)
	{
		if(rowDelta != 0){
			if((refMask & ReferenceParser.ABSOLUTE_ROW) > 0 || (refMask & ReferenceParser.ABSOLUTE_END_ROW) > 0)
				return super.update(range, rowDelta, colDelta, event);
		}
		if(colDelta != 0){
			if((refMask & ReferenceParser.ABSOLUTE_COLUMN) > 0 || (refMask & ReferenceParser.ABSOLUTE_END_COLUMN) > 0)
				return super.update(range, rowDelta, colDelta, event);
		}
		
		JSONObject deltaChange = getChangeDeltas(range, this, rowDelta, colDelta, rowSize, colSize, refMask);
		EventSource source = event.getSource();
		JSONObject data = source.getData();
		if(deltaChange != null){
			if(data == null)
			{
				data = new JSONObject();
				source.setData(data);
			}
			data.put(ConversionConstant.SHARED_REF_DELTA, deltaChange);
		}
		else if(data != null)
			data.remove(ConversionConstant.SHARED_REF_DELTA);
		this.broadcast(event);
		return true;
	}
	
	public void updateAddress(int nsr, int nsc, int ner, int nec)
	{
		RangeInfo info = new RangeInfo(this.getSheetId(), nsr, nsc, ner, nec, rangeInfo.getType());
		rangeInfo = info;
	}
	
	public static JSONObject getChangeDeltas(RangeInfo range, Area ref, int rDelta, int cDelta, int rowSize, int colSize, int refMask)
	{
		if(rDelta != 0 && ((refMask & ReferenceParser.START_ROW) == 0 || (refMask & ReferenceParser.ABSOLUTE_ROW) > 0))
			return null;
		
		if(cDelta != 0 && ((refMask & ReferenceParser.START_COLUMN) == 0 || (refMask & ReferenceParser.ABSOLUTE_COLUMN) > 0))
			return null;
		
		return getChangeDeltas(range, ref, rDelta, cDelta, rowSize, colSize);
	}
	
	public static JSONObject getChangeDeltas(RangeInfo range, Area ref, int rDelta, int cDelta, int rowSize, int colSize)
	{
		int startRow = range.getStartRow();
	    int startCol = range.getStartCol();
	    int endRow = range.getEndRow();
	    int endCol = range.getEndCol();
	    int osr = ref.getStartRow();
	    int oer = ref.getEndRow();
	    int osc = ref.getStartCol();
	    int oec = ref.getEndCol();
	    
	    if (rDelta != 0) {
	        //get the original delete/insert part
	        if (rDelta < 0) {
	            endRow = startRow - 1;
	            startRow = startRow + rDelta;
	        } else {
	            endRow = startRow + rDelta - 1;
	        }
	        
	        if(oer < startRow)
	        	return null;
	        
	        int size = oer - osr;
	        int nsr = startRow - osr;
	        int ner = endRow - osr;
	        
	      //also need - rowSize because the formulas refer to such reference will be need update formula
	        if (rDelta > 0)
	            ner = nsr - 1;
	        nsr = nsr - rowSize + 1;
	        if (ner < 0 || nsr > size ) {
	            return null;
	        } else if (rDelta > 0 && ner < nsr) {
	            // insert rows for reference which rowSize == 1
	            // will result in split shared reference and create formula cell at position ner
	            ner = nsr;
	        }
	        if (nsr < 0) {
	            nsr = 0;
	        }
	        if (ner > size) {
	            ner = size;
	        }
	        JSONObject change = new JSONObject();
	        change.put("change1",nsr);
	        change.put("change2",ner);
	        return change;
	    }
	    
	    else if (cDelta != 0) {
	    	//get the original delete/insert part
	        if (cDelta < 0) {
	            endCol = startCol - 1;
	            startCol = startCol + cDelta;
	        } else {
	            endCol = startCol + cDelta - 1;
	        }
	        
	        if(oec < startCol)
	        	return null;
	        
	        int size = oec - osc;
	        int nsc = startCol - osc;
	        int nec = endCol - osc;
	        //also need - colSize because the formulas refer to such reference will be need update formula
	        if (cDelta > 0)
	            nec = nsc - 1;
	        nsc = nsc - colSize + 1; 
	        if (nec < 0 || nsc > size ) {
	            return null;
	        } else if (cDelta > 0 && nec < nsc) {
	            // insert rows for reference which rowSize == 1
	            // will result in split shared reference and create formula cell at position ner
	            nec = nsc;
	        }
	        if (nsc < 0) {
	            nsc = 0;
	        }
	        
	        if (nec > size) {
	            nec = size;
	        }
	        JSONObject change = new JSONObject();
	        change.put("change1",nsc);
	        change.put("change2",nec);
	        return change;
	    }
	    
	    return null;
	}
}