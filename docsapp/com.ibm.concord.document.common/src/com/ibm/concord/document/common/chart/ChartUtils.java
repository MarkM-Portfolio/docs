/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.concord.document.common.chart;

import com.ibm.json.java.JSONObject;

public class ChartUtils {
	public static void mergeSpPr(JSONObject dest, JSONObject src)
	{
		if(dest == null || src == null)
			return;
		
		int changes = 0;
		Number cha = (Number)dest.get(ChartConstant.CHANGES);
	    if(cha != null)
	    	changes = cha.intValue();
	    
	    if(src.containsKey(ChartConstant.SOLIDFILL))
	    {
	    	String fill = (String)src.get(ChartConstant.SOLIDFILL);
	    	if(fill == null)
	    		dest.remove(ChartConstant.SOLIDFILL);
	    	else
	    	{
	    		dest.put(ChartConstant.SOLIDFILL, fill);
	    		dest.remove(ChartConstant.NOFILL);
	    		dest.remove(ChartConstant.GRADFILL);
	    	}
	    		
	    	changes = changes | 1;
	    }
	    if(src.containsKey(ChartConstant.GRADFILL))
	    {
	    	String fill = (String)src.get(ChartConstant.GRADFILL);
	    	if(fill == null)
	    		dest.remove(ChartConstant.GRADFILL);
	    	else
	    	{
	    		dest.put(ChartConstant.GRADFILL, fill);
	    		dest.remove(ChartConstant.NOFILL);
	    		dest.remove(ChartConstant.SOLIDFILL);
	    	}
	    		
	    	changes = changes | 1;
	    }
	    if(src.containsKey(ChartConstant.NOFILL))
	    {
	    	 Number oFill = (Number)src.get(ChartConstant.NOFILL);
			 if(oFill!=null && oFill.intValue()==1)
			 {
				 dest.put(ChartConstant.NOFILL, 1);
				 dest.remove(ChartConstant.SOLIDFILL);
				 dest.remove(ChartConstant.GRADFILL);
			 }
			 else
				 dest.remove(ChartConstant.NOFILL);
			 
			 changes = changes | 1;
	    }
	    if(src.containsKey(ChartConstant.LN))
	    {
	    	JSONObject ln = (JSONObject)src.get(ChartConstant.LN);
	    	JSONObject destLn = (JSONObject)dest.get(ChartConstant.LN);
	    	if(ln == null && destLn != null)
	    		dest.remove(ChartConstant.LN);
	    	else
	    	{
	    		if(destLn == null)
	    		{
	    			destLn = new JSONObject();
	    			dest.put(ChartConstant.LN, destLn);
	    		}
	    		if(ln.containsKey(ChartConstant.W))
	    		{
	    			Number w = (Number)ln.get(ChartConstant.W);
	    	    	if(w == null)
	    	    		destLn.remove(ChartConstant.W);
	    	    	else
	    	    	{
	    	    		destLn.put(ChartConstant.W, w);
	    	    		Number noFill = (Number)destLn.get(ChartConstant.NOFILL);
	    	    		if(noFill != null && noFill.intValue() == 1)
	    	    		{
		    	    		destLn.remove(ChartConstant.NOFILL);
		    	    		destLn.remove(ChartConstant.SOLIDFILL);
		    	    		destLn.remove(ChartConstant.GRADFILL);
		    	    		 changes = changes | 2;
	    	    		}
	    	    	}
	    	    	 changes = changes | 4;
	    		}
	    		if(ln.containsKey(ChartConstant.SOLIDFILL))
	    		{
	    			String fill = (String)ln.get(ChartConstant.SOLIDFILL);
	    	    	if(fill == null)
	    	    		destLn.remove(ChartConstant.SOLIDFILL);
	    	    	else
	    	    	{
	    	    		destLn.put(ChartConstant.SOLIDFILL, fill);
	    	    		destLn.remove(ChartConstant.NOFILL);
	    	    		destLn.remove(ChartConstant.GRADFILL);
	    	    	}
	    	    		
	    	    	changes = changes | 2;
	    		}
	    		if(ln.containsKey(ChartConstant.GRADFILL))
	    		{
	    			String fill = (String)ln.get(ChartConstant.GRADFILL);
	    	    	if(fill == null)
	    	    		destLn.remove(ChartConstant.GRADFILL);
	    	    	else
	    	    	{
	    	    		destLn.put(ChartConstant.GRADFILL, fill);
	    	    		destLn.remove(ChartConstant.NOFILL);
	    	    		destLn.remove(ChartConstant.SOLIDFILL);
	    	    	}
	    	    		
	    	    	changes = changes | 2;
	    		}
	    		if(ln.containsKey(ChartConstant.NOFILL))
	    		{
	    			 Number oFill = (Number)ln.get(ChartConstant.NOFILL);
	    			 if(oFill!=null && oFill.intValue()==1)
	    			 {
	    				 destLn.put(ChartConstant.NOFILL, 1);
	    				 destLn.remove(ChartConstant.SOLIDFILL);
	    				 destLn.remove(ChartConstant.GRADFILL);
	    			 }
	    			 else
	    				 destLn.remove(ChartConstant.NOFILL);
	    			 
	    			 changes = changes | 2;
	    		}	    		
	    	}
	    }	    
	    dest.put(ChartConstant.CHANGES, changes);
	}
	
	public static void mergeTxPr(JSONObject dest, JSONObject src)
	{
		if(dest == null || src == null)
			return;
		
		int changes = 0;
		Number cha = (Number)dest.get(ChartConstant.CHANGES);
	    if(cha != null)
	    	changes = cha.intValue();
	    
	    if(src.containsKey(ChartConstant.LATIN))
	    {
	    	String val = (String)src.get(ChartConstant.LATIN);
	    	if(val != null)
	    		dest.put(ChartConstant.LATIN, val);
	    	else
	    		dest.remove(ChartConstant.LATIN);
	    	
	    	changes = changes | 1;
	    }
	    if(src.containsKey(ChartConstant.COLOR))
	    {
	    	String val = (String)src.get(ChartConstant.COLOR);
	    	if(val != null)
	    		dest.put(ChartConstant.COLOR, val);
	    	else
	    		dest.remove(ChartConstant.COLOR);
	    	
	    	changes = changes | 2;
	    }
	    if(src.containsKey(ChartConstant.SIZE))
	    {
	    	Number val = (Number)src.get(ChartConstant.SIZE);
	    	if(val != null)
	    		dest.put(ChartConstant.SIZE, val);
	    	else
	    		dest.remove(ChartConstant.SIZE);
	    	
	    	changes = changes | 4;
	    }
	    if(src.containsKey(ChartConstant.B))
	    {
	    	Number val = (Number)src.get(ChartConstant.B);
	    	if(val != null)
	    		dest.put(ChartConstant.B, val);
	    	else
	    		dest.remove(ChartConstant.B);
	    	
	    	changes = changes | 8;
	    }
	    if(src.containsKey(ChartConstant.I))
	    {
	    	Number val = (Number)src.get(ChartConstant.I);
	    	if(val != null)
	    		dest.put(ChartConstant.I, val);
	    	else
	    		dest.remove(ChartConstant.I);
	    	
	    	changes = changes | 16;
	    }
	    
	    dest.put(ChartConstant.CHANGES, changes);
	}
	
	public static void setChanges(JSONObject dest, int change)
	{
		int changes = 0;
		Number cha = (Number)dest.get(ChartConstant.CHANGES);
	    if(cha != null)
	    	changes = cha.intValue();
	    changes = changes | change;
	    
	    dest.put(ChartConstant.CHANGES, changes);
	}
	
//	public static void removeAllAttris(JSONObject dest)
//	{
//		Iterator<Map.Entry<String, JSONObject>> itor = dest.entrySet().iterator();
//		while(itor.hasNext())
//		{
//			Map.Entry<String, JSONObject> entry = itor.next();
//			String key = entry.getKey();
//			JSONObject pro = entry.getValue();
//			if(!ChartConstant.CHANGES.equals(key))
//				dest.remove(key);
//		}
//	}
}