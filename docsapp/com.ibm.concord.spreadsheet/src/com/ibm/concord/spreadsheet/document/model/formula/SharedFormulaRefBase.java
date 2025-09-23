package com.ibm.concord.spreadsheet.document.model.formula;

import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.common.ReferenceParser;
import com.ibm.concord.spreadsheet.common.ReferenceParser.ParsedRefType;
import com.ibm.concord.spreadsheet.conversion.impl.ConversionUtil.RangeUsage;
import com.ibm.concord.spreadsheet.document.model.Broadcaster;
import com.ibm.concord.spreadsheet.document.model.IListener;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.ACTION;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.CATEGORY;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.EventSource;
import com.ibm.concord.spreadsheet.document.model.NotifyEvent.TYPE;
import com.ibm.concord.spreadsheet.document.model.formula.Area;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.impl.Document;
import com.ibm.concord.spreadsheet.document.model.impl.Sheet;
import com.ibm.concord.spreadsheet.document.model.impl.Range.RangeInfo;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONObject;
public class SharedFormulaRefBase extends Reference implements IListener
{
	private static final Logger LOG = Logger.getLogger(SharedFormulaRefBase.class.getName());
	
	protected ArrayList<FormulaToken> tokenList;
	private ArrayList<ReferenceToken> sharedRefTokens;
	private ArrayList<JSONObject> deltaChanges;
	
	public SharedFormulaRefBase(RangeInfo info, Document doc)
	{
		super(info, RangeUsage.SHARED_FORMULAS, doc, false);
		init();
	}
	
	SharedFormulaRefBase(RangeInfo info, RangeUsage usage, Document doc, boolean bGenerateId)
	{
	  super(info, usage, doc, bGenerateId);
	  init();
	}
	
	protected String generateId4Split()
	{
		return null;
	}
	
	private void init()
	{
	  tokenList = new ArrayList<FormulaToken>();
      sharedRefTokens =  new ArrayList<ReferenceToken>();
	}
	public void startListening(Broadcaster caster)
	{
	    caster.addListener(this);
	}
	  
	public void endListening(Broadcaster caster)
	{
	    caster.removeListener(this);
	}
	
	public String getAddress(Document d)
	{
		Sheet sheet = d.getSheetById(getSheetId());
	     if(sheet != null){
	    	  String sheetName = sheet.getSheetName();
	    	  RangeInfo info = this.getRange();
	    	  ReferenceParser.ParsedRefType type = info.getType();
	    	  return ModelHelper.getAddress(sheetName, getStartRow(), getStartCol(), 
	    	          sheetName, getEndRow(), getEndCol(), ModelHelper.getRefMaskByType(type), false);
	     }
		return null;
	}
	
	public boolean update(RangeInfo range, int rowDelta, int colDelta, NotifyEvent event)
	{
		int rowSize = getEndRow() - getStartRow() + 1;
		int colSize = getEndCol() - getStartCol() + 1;
		JSONObject deltaChange = SharedReferenceRef.getChangeDeltas(range, this, rowDelta, colDelta, rowSize, colSize);
		if(deltaChange != null)
			pushInOrder(deltaChange, false, false);
		doc.getAreaManager().appendToSharedFormulaTrack(this);
		return true;
	}
	
	public void splitSharedReferences(RangeInfo updateRange, int rowDelta, int colDelta, Document doc)
	{
	    if(deltaChanges == null || deltaChanges.size() == 0) {
	        //check if the sharedreference address need to udpate
	        updateAddress(updateRange, rowDelta, colDelta, doc);
	    } else {
	    	_splitSharedReferences(updateRange, rowDelta, colDelta, doc);
	    }
	}
	
	protected void _splitSharedReferences(RangeInfo updateRange, int rowDelta, int colDelta, Document doc)
	{
		int lastEnd = 0;
	    ArrayList<Area> newSharedRefTokens = new ArrayList<Area>();
	    int dsr = 0;
	    int der = getEndRow() - getStartRow();
	    int dsc = 0;
	    int dec = getEndCol() - getStartCol();
	    int delta = 0;
    	for(int i = 0; i < deltaChanges.size(); i++){
    		JSONObject change = deltaChanges.get(i);
    		int start = (Integer)change.get("change1");
    		if(start < lastEnd)
    			start = lastEnd;
    		int end = (Integer)change.get("change2");
            if (colDelta != 0) {
                dsc = lastEnd;
                dec = end - 1;
                delta = dec - dsc;
            } else {
                dsr = lastEnd;
                der = end - 1;
                delta = der - dsr;
            }
            
            createSharedReferences(delta, updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc);
            
            lastEnd = lastEnd > end ? lastEnd : end;
            if (updateRange != null) {
                if (colDelta != 0){
                    dsc = lastEnd;
                    dec = end;
                } else {
                    dsr = lastEnd;
                    der = end;
                }
                createFormulaCells(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc);
            }
    	}
    	if (colDelta != 0) {
            dsc = lastEnd + 1;
            dec = getEndCol() - getStartCol();
            delta = dec - dsc;
        } else {
            dsr = lastEnd + 1;
            der = getEndRow() - getStartRow();
            delta = der - dsr;
        }
    	
         createSharedReferences(delta, updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc);
         
    	//remove the original shared reference
        clearRefTokens(doc);
        AreaManager areaManager = doc.getAreaManager();
        //add the new splited shared reference
        for(int i = 0; i < newSharedRefTokens.size(); i++){
        	Area ref = newSharedRefTokens.get(i);
        	areaManager.startListeningArea(ref.getRange(), null, ref);
        }
        
        deltaChanges.clear();
	}
	
	protected void createSharedReferences(int delta, RangeInfo updateRange, int dsr, int dsc, int der, int dec, int rowDelta, int colDelta, ArrayList<Area> newSharedRefTokens, Document doc)
	{
		if ( delta > 1 ){
         	createSharedReference(updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc);
         }else if(delta >= 0){
         	createFormulaCells(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc);
         }
	}
		
	protected void createSharedReference(RangeInfo updateRange, int dsr, int dsc, int der, int dec, int rowDelta, int colDelta, ArrayList<Area> newSharedRefTokens, Document doc)
	{
	    //for shared formula reference
	    int osr = getStartRow() + dsr;
	    int oer = getStartRow() + der;
	    int osc = getStartCol() + dsc;
	    int oec = getStartCol() + dec;
	    int nsr = osr;
	    int ner = oer;
	    int nsc = osc;
	    int nec = oec;
	    
	    if(getSheetId() == updateRange.getSheetId()){
		    if(rowDelta != 0){
		    	nsr = updateStart(osr, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
		    	ner = updateEnd(oer, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
		    	if(ner < nsr)
	        		ner = nsr = -1;
		    	
		    }else if(colDelta != 0){
		    	nsc = updateStart(osc, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
		        nec = updateEnd(oec, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
		        if(nec < nsc)
	 	        	nsc = nec = -1;
		    }
	    }
	    RangeInfo info = new RangeInfo(getSheetId(), nsr, nsc, ner, nec, ParsedRefType.RANGE);
	    if (!info.isValid()){
	    	return;
	    }
	    SharedFormulaRefBase newSharedFormulaRef = null;
	    try{
	    	Class<?> c = getClass();
	    	Constructor<?> cons[] = c.getConstructors();
	    	String id = generateId4Split();	    	
		    newSharedFormulaRef = (id == null) ? (SharedFormulaRefBase)cons[0].newInstance(info, doc) : (SharedFormulaRefBase)cons[1].newInstance(info, doc, id);
		    newSharedRefTokens.add(newSharedFormulaRef);
	    } catch (Exception e){
	    	LOG.log(Level.WARNING, "createSharedReference of sharedFormulaRefBase error happens", e);
	    }
	    
	    for(int i = 0; i < tokenList.size(); i++){
	    	FormulaToken token = tokenList.get(i);
	    	Area ref = token.getArea();
	    	if(ref != null && ref instanceof SharedReferenceRef){
	    		SharedReferenceRef sharedReference= (SharedReferenceRef)ref;
	    		ReferenceToken refToken = (ReferenceToken)token;
    			int refMask = refToken.getRefMask();
    			nsr = osr = ref.getStartRow();
    			ner = oer = nsr + sharedReference.getRowSize() - 1;
    			nsc = osc = ref.getStartCol();
    			nec = oec = nsc + sharedReference.getColSize() - 1;
    			
    			if((refMask & ReferenceParser.START_ROW) > 0 && (refMask & ReferenceParser.ABSOLUTE_ROW) == 0)
    			{
    				nsr = osr += dsr;
    				ner = oer += der;
    				if(rowDelta != 0 && ref.getSheetId() == updateRange.getSheetId()){
	    				nsr = updateStart(osr, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
		    	    	ner = updateEnd(oer, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
    				}
    			}
    			if((refMask & ReferenceParser.START_COLUMN) > 0 && (refMask & ReferenceParser.ABSOLUTE_COLUMN) == 0)
    			{
    				nsc = osc += dsc;
    				nec = oec += dec;
    				if(colDelta != 0 && ref.getSheetId() == updateRange.getSheetId()){
	    				nsc = updateStart(osc, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
		    	        nec = updateEnd(oec, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
    				}
    			}
	           
	            info = new RangeInfo(ref.getSheetId(), nsr, nsc, ner, nec, ParsedRefType.RANGE);
	            SharedReferenceRef newSharedReference = new SharedReferenceRef(info, doc, sharedReference.getRowSize(), sharedReference.getColSize(), refMask);
	            newSharedRefTokens.add(newSharedReference);
	            
	            ReferenceToken newSharedRefToken = refToken.copy();
	            newSharedRefToken.setArea(newSharedReference);
	            
	            newSharedFormulaRef.pushRefToken(newSharedRefToken, true);
	            newSharedReference.addListener(newSharedFormulaRef);
	    	}else{
	    		generateRefTokenByCopyToken(token, null, newSharedFormulaRef, true, doc);
	    	}
	    }
//		newSharedFormulaRef.addListener(newSharedFormulaRef);//add its self as listeners to listen for the set range event
    	_createSharedReference(newSharedFormulaRef, dsr, dsc, der, dec, doc);
	}
	
	protected void _createSharedReference(SharedFormulaRefBase newSharedFormulaRef, int dsr, int dsc, int der, int dec, Document doc)
	{
		
	}
	
	protected void createFormulaCells(int dsr, int dsc, int der, int dec, RangeInfo updateRange, int rowDelta, int colDelta, Document doc){
		boolean edgeChanged = false;
	    //for shared formula reference
	    int osr = getStartRow() + dsr;
	    int oer = getStartRow() + der;
	    int osc = getStartCol() + dsc;
	    int oec = getStartCol() + dec;
	    
	    int nsr = osr;
	    int ner = oer;
	    int nsc = osc;
	    int nec = oec;
	    if(getSheetId() == updateRange.getSheetId())
	    {
		    if(rowDelta != 0){
		    	edgeChanged = isEdgeChanged(osr, updateRange.getStartRow(), rowDelta) || isEdgeChanged(oer, updateRange.getStartRow(), rowDelta);
		    	nsr = updateStart(osr, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);	    	
		    	ner = updateEnd(oer, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
		    	//if(ner < nsr)
	        	//	ner = nsr = -1;
		    }else if(colDelta != 0){
		    	edgeChanged = isEdgeChanged(osc, updateRange.getStartCol(), colDelta) || isEdgeChanged(oec, updateRange.getStartCol(), colDelta);
		    	nsc = updateStart(osc, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
		        nec = updateEnd(oec, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
		        //if(nec < nsc)
	 	        	//nsc = nec = -1;
		    }
	    }
//	    if (edgeChanged) {
//	    	return;
//	    }
	    
	    _createFormulaCells(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc);
	}
	
	protected void _createFormulaCells(int dsr,int dsc,int der,int dec,RangeInfo updateRange,int rowDelta,int colDelta,Document doc)
	{
		int formulaStartRow = getStartRow();
	    int formulaStartCol = getStartCol();
	    AreaManager areaManager = doc.getAreaManager();
	    //TODO:implement it for autofill patten
	}
	
	private boolean isEdgeChanged(int o, int n, int delta)
	{
		if(o >= n)
			return false;
		if (delta < 0 && (n + delta) <= o)
			return true;
		return false;
	}
	
	public void updateAddress(RangeInfo updateRange, int rowDelta, int colDelta, Document doc)
	{
		if(updateRange == null)
			return;
		
		boolean bUpdate = false;
	    int osr, oer, osc, oec;
	    int nsr, ner, nsc, nec;
	    AreaManager areaManager = doc.getAreaManager();
	    
	    boolean allUpdate = true;
	    boolean update = false;
	    
	    for(int i = 0; i < sharedRefTokens.size(); i++){
	    	ReferenceToken refToken = sharedRefTokens.get(i);
	    	Area ref = refToken.getArea();
	    	bUpdate = false;
	    	if(ref.getSheetId() == updateRange.getSheetId()){
		    	int refMask = refToken.getRefMask();
		         osr = ref.getStartRow();
		         oer = ref.getEndRow();
		         osc = ref.getStartCol();
		         oec = ref.getEndCol();
		         nsr = osr;
		         ner = oer;
		         nsc = osc;
		         nec = oec;
		         
		         if (rowDelta != 0 && (refMask & ReferenceParser.START_ROW) > 0 && (refMask & ReferenceParser.ABSOLUTE_ROW) == 0) {
		        	nsr = updateStart(osr, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);	    	
		 	    	ner = updateEnd(oer, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
		 	    	if(ner < nsr)
		 	    	{
	            		ner = nsr = -1;
	            		bUpdate = true;
		 	    	}
		 	    	else if(nsr != osr || ner != oer)
		 	    		bUpdate = true;
		 		 } else if (colDelta != 0 && (refMask & ReferenceParser.START_COLUMN) > 0 && (refMask & ReferenceParser.ABSOLUTE_COLUMN) == 0) {
		 			nsc = updateStart(osc, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
			        nec = updateEnd(oec, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_COL_NUM);
			        if(nec < nsc)
			        {
		    	        nsc = nec = -1;
		    	        bUpdate = true;
			        }
			        else if(nsc != osc || nec != oec)
		 	    		bUpdate = true;
				}
		         if(bUpdate){
			        	update = true;
			        	endListeningSharedArea(areaManager, ref, this);
			        	SharedReferenceRef newRef = (SharedReferenceRef)ref;
			        	newRef.updateAddress(nsr,nsc,ner,nec);
			        	newRef.updateStatus = AreaUpdateInfo.NONE.getValue();
			        	areaManager.startListeningArea(newRef.getRange(), this, newRef);
		         }
	    	}
	        if(!bUpdate)
	        	allUpdate = false;
	    }
	    
	    bUpdate = false;
	    if(getSheetId() == updateRange.getSheetId()){
		    osr = getStartRow();
		    oer = getEndRow();
		    osc = getStartCol();
		    oec = getEndCol();
		    nsr = osr;
		    ner = oer;
		    nsc = osc;
		    nec = oec;
		    
		    if (rowDelta != 0) {
		    	nsr = updateStart(osr, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);	    	
	 	    	ner = updateEnd(oer, updateRange.getStartRow(), rowDelta, ConversionConstant.MAX_ROW_NUM);
	 	    	if(nsr != osr || ner != oer)
	 	    		bUpdate = true;
	 	        if(ner < nsr)
            		ner = nsr = -1;
	 		} else if (colDelta != 0) {
	 			nsc = updateStart(osc, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_ROW_NUM);	    	
	 	    	nec = updateEnd(oec, updateRange.getStartCol(), colDelta, ConversionConstant.MAX_ROW_NUM);
	 	    	if(nsc != osc || nec != oec)
	 	    		bUpdate = true;
	 	        if(nec < nsc)
            		nec = nsc = -1;
			}
		    if(bUpdate){
		    	update = true;
		    	endListeningSharedArea(areaManager, this, this);
		    	RangeInfo info = new RangeInfo(getSheetId(), nsr, nsc, ner, nec, ParsedRefType.RANGE);
				rangeInfo = info;
				this.updateStatus = AreaUpdateInfo.NONE.getValue();
				areaManager.startListeningArea(info, this, this);
		    }
	    }
	    if(!bUpdate)
	    	allUpdate = false;
	    
	    if(update)
	    	splitFromParent(doc, allUpdate);
	}
	
	public void updateAddress(RangeInfo updateRange, int rowDelta, int colDelta, Document doc, boolean append)
	{
		if (append != true) {
			updateAddress(updateRange, rowDelta,  colDelta, doc);
		} else {
			if(updateRange == null)
				return;
			boolean bUpdate = false;
		    int osr, oer, osc, oec;
		    int nsr, ner, nsc, nec;
		    AreaManager areaManager = doc.getAreaManager();
		    boolean allUpdate = true;
		    int size = sharedRefTokens.size();
		    if (size == 0)
		    	allUpdate = false;
		    for(int i = 0; i < size; i++){
		    	ReferenceToken refToken = sharedRefTokens.get(i);
		    	Area ref = refToken.getArea();
		    	bUpdate = false;
		    	if(ref.getSheetId() == updateRange.getSheetId()){
			    	int refMask = refToken.getRefMask();
			         osr = ref.getStartRow();
			         oer = ref.getEndRow();
			         osc = ref.getStartCol();
			         oec = ref.getEndCol();
			         nsr = osr;
			         ner = oer + rowDelta;
			         nsc = osc;
			         nec = oec + colDelta;

			         endListeningSharedArea(areaManager, ref, this);
				     SharedReferenceRef newRef = (SharedReferenceRef)ref;
				     newRef.updateAddress(nsr,nsc,ner,nec);
				     newRef.updateStatus = AreaUpdateInfo.NONE.getValue();
				     areaManager.startListeningArea(newRef.getRange(), this, newRef);
		    	}
		    }
		    
		    if(getSheetId() == updateRange.getSheetId()){
			    osr = getStartRow();
			    oer = getEndRow();
			    osc = getStartCol();
			    oec = getEndCol();
			    nsr = osr;
			    ner = oer + rowDelta;
			    nsc = osc;
			    nec = oec + colDelta;
			    endListeningSharedArea(areaManager, this, this);
			    RangeInfo info = new RangeInfo(getSheetId(), nsr, nsc, ner, nec, ParsedRefType.RANGE);
				rangeInfo = info;
				this.updateStatus = AreaUpdateInfo.NONE.getValue();
				areaManager.startListeningArea(info, this, this);
		    }
		    splitFromParent(doc, allUpdate);
		}
	}

	protected void splitFromParent(Document doc, boolean allUpdate)
	{
		
	}
	
	private void pushInOrder(JSONObject deltas, boolean needUpdate, boolean bRow)
	{
		if(deltas != null){
			if(needUpdate){
				int size = 0;
				if(bRow)
					size = this.getEndRow() - this.getStartRow() + 1;
				else
					size = this.getEndCol() - this.getStartCol() + 1;
				if((Integer)deltas.get("change2") >= size)
					deltas.put("change2", size - 1);
			}
			if(deltaChanges == null)
				deltaChanges = new ArrayList<JSONObject>();
			if(deltaChanges.size() == 0){
				deltaChanges.add(deltas);
				return;
			}
			int deltaStart = (Integer)deltas.get("change1");
			int deltaEnd = (Integer)deltas.get("change2");
			int count = deltaChanges.size();
			int i = 0;
			for(; i < count; i++){
				JSONObject array = deltaChanges.get(i);
				int start = (Integer)array.get("change1");
				int end = (Integer)array.get("change2");
				if ((deltaStart < start) || (deltaStart == start && deltaEnd <= end) ){
					deltaChanges.set(i, deltas);
					break;
				}
			}
			if(i == count)
				deltaChanges.add(deltas);
		}
	}
	
	protected FormulaToken generateRefTokenByCopyToken(FormulaToken token, RangeInfo newRef, SharedFormulaRefBase listener,  boolean fromTokenTree, Document doc){
		Area ref = token.getArea();
		if(ref == null){
			listener.pushRefToken(token, fromTokenTree);
			return token;
		}
		if(newRef == null){
			ref.addListener(listener);
		}else{
			AreaManager areaMgr = doc.getAreaManager();
			ref = areaMgr.startListeningArea(newRef, listener, null);
		}
		
		ReferenceToken newToken = ((ReferenceToken) token).copy();
		newToken.setArea(ref);
		listener.pushRefToken(newToken, fromTokenTree);
		return newToken;
	}
	
	public void endListeningSharedArea(AreaManager areaManager, Area sharedRef, IListener listener)
	{
		if(!areaManager.endListeningSharedArea(sharedRef, listener))
			areaManager.endListeningArea(sharedRef, listener);
	}
	
	public List<FormulaToken> getTokenList()
	{
		return tokenList;
	}
	
	public void pushRefToken(FormulaToken refToken, boolean bInTokenTree){
		if (bInTokenTree) {
	       tokenList.add(refToken);
	        
	        Area ref = refToken.getArea();
	        if(ref instanceof SharedReferenceRef){
	        	sharedRefTokens.add((ReferenceToken)refToken);
	        }
	    }
	}
	
	public void clearRefTokens(Document doc)
	{
		AreaManager areaManager = doc.getAreaManager();
		for(int i=0;i< tokenList.size(); i++)
		{
			FormulaToken token = tokenList.get(i);
			Area ref = token.getArea();
			if(ref != null)
				endListeningSharedArea(areaManager, ref, this);
		}
		tokenList.clear();
		sharedRefTokens.clear();
	}
	
	public void notify(Broadcaster caster, NotifyEvent e)
	{
		 EventSource source = e.getSource();
		 JSONObject data = source.getData();
		 AreaManager manager = doc.getAreaManager();
		 if(data != null)
		 {
			 Object deltas = data.get(ConversionConstant.SHARED_REF_DELTA);
			 if(deltas != null)
			 {
				 pushInOrder((JSONObject)deltas, true, source.getRefType() == TYPE.ROW);
				 manager.appendToSharedFormulaTrack(this);
				 data.remove(ConversionConstant.SHARED_REF_DELTA);
				 return;
			 }
		 }
		 if(e.getCategory() == CATEGORY.DATACHANGE)
	    {
			 if (source.getRefType() == TYPE.ROW || source.getRefType() == TYPE.COLUMN)
			 {
				 if ((source.getAction() == ACTION.PREINSERT || source.getAction() == ACTION.PREDELETE))
				 {
					 if(caster instanceof SharedReferenceRef)
					 {
						 // for row/col event, always push it to track list, because even it does not need to split
		                 // but the address might need to update
						 manager.appendToSharedFormulaTrack(this);
						 return;
					 }
				 }
			 }
	    }
		 
	}
}