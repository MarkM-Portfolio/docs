package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import javax.xml.transform.sax.TransformerHandler;

import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.pkg.OdfPackage;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Column;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.RangeType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Row;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;

public class DrawFrameConvertor
{
  TransformerHandler hdl;
  private ConversionContext context;
  private Object input;
  private boolean isNew;
  
  public DrawFrameConvertor(ConversionContext conext,TransformerHandler hdl, Object input)
  {
    this.hdl = hdl;
    this.input = input;
    this.context = context;
  }
  
  
  public void convert(ConversionContext context,Object input,boolean isNew)
  {
    this.input =  input;
    this.context = context;
    this.isNew = isNew;
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    AttributesImpl attrs = new AttributesImpl(attributes);
    if(input instanceof DrawFrameRange)
    {
      DrawFrameRange range = (DrawFrameRange)input;
     
      if (range.usage == RangeType.CHART)
      {
    	  String src = range.href;
    	  int idx = src.lastIndexOf("/");
		  String objName = src.substring(idx+1);
		  src = "ObjectReplacements/" + objName;
    	  OdfDocument doc = (OdfDocument)context.get("Document");
    	  OdfPackage odfPackage = doc.getPackage();
    	  odfPackage.remove(src);
      }
      
      String x = ODSConvertUtil.convertPXToCM(range.x);
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_SVG_X, "", x);

      String y = ODSConvertUtil.convertPXToCM(range.y);
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_SVG_Y, "", y);   
      
      String w = ODSConvertUtil.convertPXToCM(range.w);
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_SVG_WIDTH, "", w);   
      
      String h = ODSConvertUtil.convertPXToCM(range.h);
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_SVG_HEIGHT, "", h);   
      Sheet sheet = (Sheet)context.get("Sheet");
      if( "relative".equals(range.pt) && ConversionUtil.hasValue(range.address))
      {      
        String sheetName =  ReferenceParser.SINGLE_QUOTE + sheet.sheetName + ReferenceParser.SINGLE_QUOTE;
        String endAddr = "";
        int index ;
        if((index = (range.address.indexOf(ReferenceParser.SEPARATOR_RANGE)))>=0)
        {
          String lp = range.address.substring(0,index);
          sheetName = lp.substring(0,lp.lastIndexOf(ReferenceParser.SEPARATOR_SHEET));
          endAddr = sheetName + ReferenceParser.SEPARATOR_SHEET + range.address.substring(range.address.lastIndexOf(ReferenceParser.SEPARATOR_RANGE) + 1);
        }
        attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_END_CELL_ADDRESS, "", endAddr);
      }
      Document doc = (Document) context.get("Source");
      if(range.ex>=-1 && !ConversionConstant.MAX_REF.equals(range.endRowId))
      {
        double threshold = getEndXThreshold(doc,sheet,range);

        if(range.ex == -1)
        {
          range.ex = threshold;
        }
        else if(range.ex > threshold)
        {
          range.ex = threshold;
        }
        String ex = ODSConvertUtil.convertPXToCM(range.ex);
        attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_END_X, "", ex);   
      }
      if(range.ey>=-1)
      {
        double threshold = getEndYThreshold(doc,sheet,range);
        if( range.ey == -1)
        {
          range.ey = threshold;
        }
        else if(range.ey > threshold)
        {
          range.ey = threshold;
        }
        String ey = ODSConvertUtil.convertPXToCM(range.ey);
        attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_END_Y, "", ey);
      }
      
      if(range.z > -1)
      {
        attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_DRAW_ZINDEX, "", String.valueOf(range.z));
      }
//      if(ConversionUtil.hasValue(range.endRowId)&& !ConversionConstant.MAX_REF.equals(range.endRowId) && ConversionUtil.hasValue(range.endColId))
//      {
//        String[] qNames = {ConversionConstant.ODF_ATTRIBUTE_TABLE_END_CELL_ADDRESS,ConversionConstant.ODF_ATTRIBUTE_TABLE_END_X,ConversionConstant.ODF_ATTRIBUTE_TABLE_END_Y};
//        com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil.removeAttribute(attrs, qNames);
//      }
      
      String drawName = attrs.getValue(ConversionConstant.ODF_ATTRIBUTE_DRAW_NAME);
      if(!ConversionUtil.hasValue(drawName))
      {
        attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_DRAW_NAME,"",range.rangeId);
      }
    }
    hdl.startElement(uri, localName, qName, attrs);    
  }
  
  private double getEndXThreshold(Document doc,Sheet sheet,DrawFrameRange range)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    Column preUniqueCol = (Column) index.getJsonDataObject(range.endColId);
    int indicator = -1;
    double threshold = 0.0;
    if(preUniqueCol == null)
    {
      int size = sheet.columnIdArray.size(); 
      for( int i =0 ; i < size; i++ )
      {
        String rId = sheet.columnIdArray.get(i);
        if(rId.equals(range.endColId))
        {
          indicator = i;
          break;
        }
      }
    }
    else
      indicator = preUniqueCol.columnIndex;
    int i = indicator; 
    for(; i >= 0 && !doc.uniqueColumns.uniqueColumnList.contains(preUniqueCol); i--)
    {
      String rId = sheet.columnIdArray.get(i);
      preUniqueCol = (Column) index.getJsonDataObject(rId);
    }
    if(preUniqueCol == null || indicator > preUniqueCol.columnIndex + index.getInitialRepeatNumber(preUniqueCol.columnId))
      threshold = ConversionConstant.DEFAULT_WIDTH_VALUE;
    else
      threshold = preUniqueCol.width;
    return threshold;
  }
  
  private double getEndYThreshold(Document doc,Sheet sheet,DrawFrameRange range)
  {
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    Row preUniqueRow = (Row) index.getJsonDataObject(range.endRowId);
    int indicator = -1;
    double threshold = 0.0;
    if(preUniqueRow == null)
    {
      int size = sheet.rowIdArray.size(); 
      for( int i =0 ; i < size; i++ )
      {
        String rId = sheet.rowIdArray.get(i);
        if(rId.equals(range.endRowId))
        {
          indicator = i;
          break;
        }
      }
    }
    else
      indicator = preUniqueRow.rowIndex;
    int i = indicator; 
    for(; i >= 0 && !doc.uniqueRows.uniqueRowList.contains(preUniqueRow); i--)
    {
      String rId = sheet.rowIdArray.get(i);
      preUniqueRow = (Row) index.getJsonDataObject(rId);
    }
    if(preUniqueRow == null|| indicator > preUniqueRow.rowIndex + index.getInitialRepeatNumber(preUniqueRow.rowId))
    {
      threshold = ConversionConstant.DEFAULT_HEIGHT_VALUE;
    }
    else
    {
      threshold = preUniqueRow.height; 
    }
    return threshold;
  }
  
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    
  }
}
