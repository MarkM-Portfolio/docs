/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.spreadsheet.impl;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.ibm.symphony.conversion.spreadsheet.ServiceConstants;

public class CSV2JSONConverterImpl {
	
	private static final Logger LOG = Logger.getLogger(CSV2JSONConverterImpl.class.getName());
	private String conversionFolder;
	private ConversionUtil.Document document;
	private HashMap<String, String> sheetNameIdMap;
	private char seperator = ',';

	public CSV2JSONConverterImpl(String conversionFolder){
		this.conversionFolder = conversionFolder;
		sheetNameIdMap = new HashMap<String, String>();
	}
	public String convert(String source, String sourceType, String targetType)throws Exception {
		
		if (!sourceType.equalsIgnoreCase(ServiceConstants.CSV_MIMETYPE) ||
		        !targetType.equalsIgnoreCase(ServiceConstants.JSON_MIMETYPE)) {
		      LOG.warning("The file can not be converted due to that source is not an csv file or the targetis not an js file.");
		      return null;
		    }
		
		InputStreamReader in = null;
		BufferedReader buffer = null;	
		FileOutputStream jsContentOut = null;
		FileOutputStream jsMetaOut = null;
		FileOutputStream jsReferenceOut = null;
	    try {	    	
	    	in = new InputStreamReader(new FileInputStream(new File(source)),"UTF-8");
	    	buffer = new BufferedReader(in);	    	
	    
	    	document = new ConversionUtil.Document();
		    document.url = source;
		    
		    document.maxColumnId = ConversionConstant.ID_INITAL_VALUE;
		    document.maxRowId = ConversionConstant.ID_INITAL_VALUE;
		    
		    ConversionUtil.Sheet sheet = new ConversionUtil.Sheet();
		    sheet.sheetIndex = 1;
		    sheet.sheetId = ConversionConstant.ST + sheet.sheetIndex;
		    sheet.sheetName = "sheet1";
		    sheetNameIdMap.put(sheet.sheetName, sheet.sheetId);
		      
		    String line = null;
		    int rowIndex = 0;
		    int columnNum = 0;  //total column number
		    while((line = buffer.readLine())!=null){
		    	
		    	if (ConversionUtil.isOutOfRowCapacilty(sheet.rowIdArray.size()))
		    		LOG.log(Level.WARNING, "Can't edit document with 1000+ rows in its sheet(s)");
		    	
		    	if(line.length()==0 || line.matches("[,]*")){
		    		sheet.rowIdArray.add("");
		    		continue;
		    		
		    	}
		    	rowIndex++;
		    	ConversionUtil.Row row = new ConversionUtil.Row();
		        row.rowIndex = rowIndex;
		        row.sheetId = sheet.sheetId;
		        
		        String rowId = ConversionConstant.ROWID + document.maxRowId++;
	            sheet.rowIdArray.add(rowId);
	            row.rowId = rowId;
		        
	            String[] cols = getCols(line);
		        if(cols.length > columnNum){
		        	for(int colIndex=columnNum;colIndex<cols.length;colIndex++){
		        		sheet.columnIdArray.add("");
		        	}
		        	columnNum = cols.length;
		        }
		        
		        for(int i=0;i<cols.length;i++){
		        	String col = cols[i];
		        	
		        	if( ConversionUtil.hasValue(col )){
		        		ConversionUtil.Cell cell = new ConversionUtil.Cell();
		        		cell.value = col;
		        		cell.rowId = rowId;
		        		       		
		        		String colId = sheet.columnIdArray.get(i);
		                if(colId.length()==0){
		                  colId = ConversionConstant.COLUMNID + document.maxColumnId++;
		                  sheet.columnIdArray.set(i, colId);
		                }
		                cell.cellId = colId;
		                row.cellList.add(cell);
		        	}	        	
		        }
		        if( row.cellList.size() > 0)
	                sheet.rowList.add(row);
		    }
		    
		    document.sheetList.add(sheet);
		    
		    Integer code = source.hashCode();
		    String targetDir = conversionFolder + File.separator + code.toString();
		    File targetDirFile = new File(targetDir);
		    targetDirFile.mkdirs();
		    
		    String targetContentFile = targetDir + File.separator + "content.js";
		    String targetMetaFile = targetDir + File.separator + "meta.js";
		    String targetReferenceFile = targetDir + File.separator + "reference.js";
		    jsContentOut = new FileOutputStream(new File(targetContentFile));
		    document.storeContentToJSON().serialize(jsContentOut);
		      
//		    jsReferenceOut = new FileOutputStream(new File(targetReferenceFile));
//		    document.storeRefToJSON().serialize(jsReferenceOut);
		      
		    jsMetaOut = new FileOutputStream(new File(targetMetaFile));
		    document.storeMetaToJSON().serialize(jsMetaOut);
		     
		    return targetContentFile;	   
	      
	    } catch (FileNotFoundException e) {
	      LOG.log(Level.WARNING, "can not find file", e);
	    } catch (IOException e) {
	      LOG.log(Level.WARNING, "", e);
	    } finally{
	    	if(jsContentOut!=null)
	    		jsContentOut.close();
	    	if(jsReferenceOut!=null)
	    		jsReferenceOut.close();
	    	if(jsMetaOut!=null)
	    		jsMetaOut.close();
	    	buffer.close();
	 	    in.close();
	    }	
	    return "";
	}
	
	private String[] getCols(String sline){
		List<String> list=new ArrayList<String>();  
        int len = sline.length();  
        
        int i=0;  
        while(i<len){  
            char key=sline.charAt(i);  
            if(len>0 && '"'==key)
            {  
                i++;
                if(i<len)
                	i = processQuote(list, sline, i);  
            }
            else  
            	i = processNormal(list, sline, i);  
        }  
        if(seperator==sline.charAt(len-1))  
            list.add("");  
        String[] text=list.toArray(new String[0]);  
        return text; 
	}
	
	/** 
     * return next work start index  
     */  
    private int processClose(String param, int i){  
        int len=param.length();  
        if(i>=len)  
            return i;  
        char c=param.charAt(i);  
        while(' '==c){  
            i++;  
            c=param.charAt(i);  
        }  
        return i;  
    }  
      
    /** 
     * example: aa,"bb,cc", dd
     * Need to be parsed: [aa] [bb,cc] [dd]
     */  
    private int processQuote(List<String> list, String param, int i){  
        StringBuffer sb=new StringBuffer("");  
        int len=param.length();  
        if(i+1>=len){  
            list.add(sb.toString());  
            return i;  
        }  
        char c=param.charAt(i);  
        char cc=param.charAt(i+1);  
        char quot='"';  
        while(c!=quot || cc!=seperator){  
            if(c==quot && cc==quot)  
                i++;  
            sb.append(c);  
            c=param.charAt(++i);  
            if(i+1>=len)  
                break;  
            cc=param.charAt(i+1);  
        }  
        list.add(sb.toString());  
        i=processClose(param, i+2);  
        return i;  
    }  
      
    /** 
     * process normal string: aa,bb,cc,dd -> [aa] [bb] [cc] [dd]
     */  
    private int processNormal(List<String> list, String param, int i){  
        StringBuffer sb=new StringBuffer("");  
        int len=param.length();  
        if(i>=len){  
            list.add(sb.toString());  
            return i;  
        }  
        for(;i<len;i++){  
            char c=param.charAt(i);  
            if(c!=seperator)  
                sb.append(c);  
            else  
                break;  
        }  
        list.add(sb.toString());  
        i=processClose(param, ++i);  
        return i;  
    } 	

}
