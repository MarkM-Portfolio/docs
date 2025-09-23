package com.ibm.symphony.conversion.converter.ods2json.sax.context;

import org.odftoolkit.odfdom.type.Length;
import org.odftoolkit.odfdom.type.Length.Unit;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.ods2json.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.converter.ods2json.sax.PreserveManager;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLImport;
import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.JSONModel;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;

public class DrawFrameContext extends GeneralContext
{
	ConversionUtil.DrawFrameRange frameRange;
	boolean needAddId = false;
	String cellId;
	GeneralContext addIdTarget;
  
  public DrawFrameContext(XMLImport importer, String uri, String localName, String qName, Object target)
  {
    super(importer, uri, localName, qName, target);
    mbGenerateXMLIdAtEnd = true;//set it when mbInvalid = false
  }
  
  public ConversionUtil.DrawFrameRange getFrameRange()
  {
	  return this.frameRange;
  }
  
  public void setNeedAddId(boolean need)
  {
    needAddId = need;
  }

  public void startElement(AttributesImpl attrs)
  {
    super.startElement(attrs);
    ConversionUtil.Document document = (ConversionUtil.Document) mContext.get("Target");
    ConversionUtil.Sheet sheet = (Sheet) mContext.get("Sheet");
    
    ConversionUtil.DrawFrameRange objRange = new ConversionUtil.DrawFrameRange();
    objRange.doc = document;
    GeneralContext pContext = this.getParentConvertor();
    JSONModel model = (JSONModel) pContext.getTarget();
    ReferenceParser.ParsedRef ref = null;
    String endCelladdress = null;
    
    GeneralContext ppContext = this;
    while( null != ppContext)
    {   
      String addr = ppContext.getAttrValue("table:end-cell-address");
      if(ConversionUtil.hasValue(addr))
        endCelladdress = addr;
      if(ppContext instanceof DrawAContext)
    	  objRange.link = ((DrawAContext)ppContext).getHerf();
      if(ppContext instanceof TableCellContext || ppContext instanceof DrawAContext || ppContext instanceof TableTableContext)
        break;
      ppContext = ppContext.getParentConvertor();
    }
    
    if(model!=null)
    {
      ref = PreserveManager.getTargetRef(mContext, model);
      if(model instanceof Cell)
      {
          cellId = IndexUtil.generateCellId(ref.startRow,ref.startCol);
          if(ConversionUtil.hasValue(cellId))
          {
            if(ODSConvertUtil.isTableCellElement(ppContext.getNodeName()))
            {
              addIdTarget = ppContext;
            }
            else if(ODSConvertUtil.isTableCellElement(ppContext.getParentConvertor().getNodeName()))
            {
              addIdTarget = ppContext.getParentConvertor();
            }
          }
          
        objRange.pt = "relative";
        objRange.address = ref.toString();
        if(ConversionUtil.hasValue(endCelladdress))
        	objRange.address = ref.toString() + ReferenceParser.SEPARATOR_RANGE + endCelladdress.substring(endCelladdress.lastIndexOf(".")+ 1);
        else
        	objRange.address = ref.toString();
      }
      else
      { 
    	  final String sAddr = sheet.sheetName + ".A1";
          ref = ReferenceParser.parse(sAddr);
          endCelladdress =  sheet.sheetName + ".AZ65536";
          objRange.address = ref.toString() + ReferenceParser.SEPARATOR_RANGE + "AZ65536";
          objRange.pt = "absolute";
      }
    }
    
    if(ConversionUtil.hasValue(endCelladdress))
    {
      ReferenceParser.ParsedRef endRef = ReferenceParser.parse(endCelladdress);
      ref.endRow = endRef.startRow;
      ref.endCol = endRef.startCol;
    }
    
    String w = getAttrValue(ConversionConstant.ODF_ATTRIBUTE_SVG_WIDTH);
    objRange.w = Length.parseDouble(w,Unit.PIXEL);
    
    String h = getAttrValue(ConversionConstant.ODF_ATTRIBUTE_SVG_HEIGHT);
    objRange.h = Length.parseDouble(h,Unit.PIXEL);
    
    String x = getAttrValue(ConversionConstant.ODF_ATTRIBUTE_SVG_X);
    objRange.x = Length.parseDouble(x,Unit.PIXEL);
    
    String y = getAttrValue(ConversionConstant.ODF_ATTRIBUTE_SVG_Y);
    objRange.y = Length.parseDouble(y,Unit.PIXEL);
    
    String z = getAttrValue(ConversionConstant.ODF_ATTRIBUTE_DRAW_ZINDEX);
    if(ConversionUtil.hasValue(z))
    {
      objRange.z = Integer.parseInt(z);
    }   
    
    String tableBackground= getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_BACKGROUND);
    if(ConversionUtil.hasValue(tableBackground))
    {
      objRange.ib = Boolean.parseBoolean(tableBackground);
    }
    
    String ex = getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_END_X);
    if(ConversionUtil.hasValue(ex))
    	objRange.ex = Length.parseDouble(ex,Unit.PIXEL);
    String ey = getAttrValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_END_Y);
    if(ConversionUtil.hasValue(ey))
    	objRange.ey = Length.parseDouble(ey,Unit.PIXEL);
    
    setCellRangeByToken(objRange, ref, document, sheet);
    
    this.frameRange = objRange;
  }
  
  public void endElement()
  {
      super.endElement();
      if(needAddId && addIdTarget!=null)
      {
        addIdTarget.addIdOnOdfElement(cellId);
      }
  }
  
  public GeneralContext createChildContext(String uri, String localName, String qName, AttributesImpl attributes)
  {
    GeneralContext context = null;
    XMLUtil.NODENAME name = XMLUtil.getXMLToken(qName);
    switch(name){
      case DRAW_IMAGE:
        context = new DrawImageContext(mImport, uri, localName, qName, mTarget);
        break; 
      case DRAW_OBJECT:
        context = new DrawObjectContext(mImport, uri, localName, qName, mTarget);
        break;
      case SVG_TITLE:	  
    	context = new SvgTitleDescContext(mImport, uri, localName, qName, mTarget);
    	break;    	    	  
      default:
        context =  new GeneralContext(mImport, uri, localName, qName, mTarget);
    }
    return context;
  }

  public static void setCellRangeByToken(Range objRange, ReferenceParser.ParsedRef ref, Document document, Sheet currentSheet)
  {
      if(ref != null)
      {
          String sheetName = ref.sheetName;
          
          if(ConversionUtil.hasValue(sheetName) && currentSheet == null){
            boolean bFind = false;
            for(int i=0; i<document.sheetList.size();i++){
              if(document.sheetList.get(i).sheetName.equals(sheetName)){
                currentSheet = document.sheetList.get(i);
                bFind = true;
                break;
              }
            }
            if(!bFind)
              return;//the ref.sheetName is not in the document
          }
          if(currentSheet == null)
            currentSheet = document.sheetList.get(0);
          objRange.sheetId = currentSheet.sheetId;
          if(ConversionUtil.hasValue(ref.startCol)){
            int startCol = ReferenceParser.translateCol(ref.startCol);
            if(startCol != -1)
            {
              int nameRangeStartColIndex = startCol - 1;
              objRange.startColId = ConversionUtil.updateIdArray(nameRangeStartColIndex, currentSheet, document, false, true);
            }
          }
          if(ConversionUtil.hasValue(ref.startRow)){
            int startRow = ReferenceParser.translateRow(ref.startRow);
            if(startRow != -1)
            {
              int nameRangeStartRowIndex = startRow - 1;
              objRange.startRowId = ConversionUtil.updateIdArray(nameRangeStartRowIndex, currentSheet, document, true, true);
            }  
          }
          
          if(ConversionUtil.hasValue(ref.endCol)){
            int endCol = ReferenceParser.translateCol(ref.endCol);
            
            if(endCol != -1)
            {
              int nameRangeEndColIndex = endCol - 1;
              objRange.endColId = ConversionUtil.updateIdArray(nameRangeEndColIndex, currentSheet, document, false, true);
            }
          }
          if(ConversionUtil.hasValue(ref.endRow))
          {
            int endRow = ReferenceParser.translateRow(ref.endRow);
            
            if(endRow != -1 )
            {
              int nameRangeEndRowIndex = endRow - 1;
              objRange.endRowId = ConversionUtil.updateIdArray(nameRangeEndRowIndex, currentSheet, document, true, true);
            }  
          }
      }
  }
}
