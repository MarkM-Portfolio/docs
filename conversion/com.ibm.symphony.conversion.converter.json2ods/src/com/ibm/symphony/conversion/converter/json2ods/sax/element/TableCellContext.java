/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.element;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.xml.transform.sax.TransformerHandler;

import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.XMLReader;
import org.xml.sax.helpers.AttributesImpl;

import com.ibm.symphony.conversion.converter.json2ods.sax.CopyCellFragmentReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.ODSSAXParser;
import com.ibm.symphony.conversion.converter.json2ods.sax.XMLFragmenttReader;
import com.ibm.symphony.conversion.converter.json2ods.sax.XMLPreserveManager;
import com.ibm.symphony.conversion.converter.json2ods.sax.attribute.ValueTypeConvertor;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Cell;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.DrawFrameRange;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.FormulaToken;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Range;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.impl.DocumentVersion;
import com.ibm.symphony.conversion.spreadsheet.impl.ReferenceParser;
import com.ibm.symphony.conversion.spreadsheet.index.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;
import com.ibm.symphony.conversion.spreadsheet.index.ODSOffsetRecorder;
import com.ibm.symphony.conversion.spreadsheet.index.Pair;
import com.ibm.symphony.conversion.spreadsheet.index.Pair.ColumnIDPair;

public class TableCellContext
{
  private static final Logger LOG = Logger.getLogger(TableCellContext.class.getName());
  
  TransformerHandler hdl;
  private AttributesImpl attrs = null;
  private ConversionContext context;
  private Object input;
  private boolean isNew;
  public TableCellContext(ConversionContext context, TransformerHandler hdl,Object input)
  {
    this.hdl = hdl;
    this.input = input;
    this.context = context;
  }

  private String getNodeId(Object input)
  {
    Cell cell = (Cell)input;
    return IndexUtil.generateCellId(cell.rowId, cell.cellId);
  }
  
  public void convert(ConversionContext context,Object input,boolean isNew)
  {
    this.input = (Cell) input;
    this.context = context;
    this.isNew = isNew;
  }

  private void setAttributes(Cell cell,String qName)
  {
    if (ConversionUtil.hasValue(cell.styleId))
    {
      this.setTableStyleNameAttribute(context, input, attrs);
    }
    else
    {
      String oldStyleName = attrs.getValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
      if("Default".equals(oldStyleName))//?
    	ODSConvertUtil.removeAttribute(attrs, ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
      else
      {
        HashMap<Pair.ColumnIDPair, String> colStyleMap = (HashMap<ColumnIDPair, String>) context.get("colStyleMap");
        JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
        boolean bDefaultFormatting = index.isDefaultFormatting(IndexUtil.generateCellId(cell.rowId, cell.cellId));
        if(bDefaultFormatting)
        {
        // the cell has been set default in client and no style for this cell and the column
           ODSConvertUtil.removeAttribute(attrs, ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
        }else if(ConversionUtil.hasValue(cell.cellId) && ConversionUtil.hasValue(oldStyleName) && isTotalUnsupportStyle(oldStyleName))
        {
          //if has odf style and the style is totally unsupport, then set this style again
          Pair.ColumnIDPair key = new Pair.ColumnIDPair(cell.cellId,oldStyleName);
          String newStyleName = colStyleMap.get(key);
          if(newStyleName != null)
            attrs.setAttribute(attrs.getIndex(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME), "", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME, "", newStyleName);
        }else
          //must be the same with the column style which should no set style name for this cell
          ODSConvertUtil.removeAttribute(attrs, ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
      }
    }
    
    if (cell.repeatedNum > 0)
    {
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_REPEATED, "", Integer.toString(cell.repeatedNum + 1));
    }
    else
    {
      ODSConvertUtil.removeAttribute(attrs, ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_REPEATED);
    }
    if (cell.colSpan > 1)
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_SPANNED, "", Integer.toString(cell.colSpan));
    else
      ODSConvertUtil.removeAttribute(attrs, ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_COLUMNS_SPANNED);
    if (cell.rowSpan > 1)
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_ROWS_SPANNED, "", Integer.toString(cell.rowSpan));
    else
      ODSConvertUtil.removeAttribute(attrs, ConversionConstant.ODF_ATTRIBUTE_TABLE_NUMBER_ROWS_SPANNED);
    
   
    if(cell.validationName.length() > 0)
    	attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_CONTENT_VALIDATION_NAME, "", cell.validationName );
    else
    	ODSConvertUtil.removeAttribute(attrs, ConversionConstant.ODF_ATTRIBUTE_TABLE_CONTENT_VALIDATION_NAME);
  }
  
  public void startElement(String uri, String localName, String qName, Attributes attributes) throws SAXException
  {
    attrs = new AttributesImpl(attributes);
    Cell cell = (Cell)input;

    setAttributes(cell,qName);
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    Sheet sheet = (Sheet) context.get("Sheet");
    Document doc = (Document) context.get("Source");
    //cell type might not be initialized due to no "t" in draft
    if(cell.type == 0)
    {
      if(doc.version.compareTo(DocumentVersion.VERSION_1_0_2) < 0 )
        cell.type |= (ConversionConstant.CELL_TYPE_UNKNOWN << 3);
    }
    String id = getNodeId(input);
    boolean bChange = index.isCellChanged(id);
    
    ConversionUtil.CellStyleType cellStyle = getCellStyle(cell, sheet, doc);
    if(!isNew)
    {
      String[] qNames = { ConversionConstant.ODF_ATTRIBUTE_TABLE_TABLE_FORMULA, ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE,
          ConversionConstant.ODF_ATTRIBUTE_OFFICE_VALUE_TYPE, ConversionConstant.ODF_ATTRIBUTE_OFFICE_BOOLEAN_VALUE,
          ConversionConstant.ODF_ATTRIBUTE_OFFICE_CURRENCY, ConversionConstant.ODF_ATTRIBUTE_OFFICE_DATE_VALUE,
          ConversionConstant.ODF_ATTRIBUTE_OFFICE_STRING_VALUE, ConversionConstant.ODF_ATTRIBUTE_OFFICE_TIME_VALUE,
          ConversionConstant.ODF_ATTRIBUTE_TABLE_CONTENT_VALIDATION_NAME};
      ODSConvertUtil.removeAttribute(attrs, qNames);
    }
    Object value = cell.value;
    if(value != null){
      String strValue = cell.value.toString();
      if (ConversionUtil.isFormulaString(strValue))
      {
        //TODO: array formula support, recognized by cell.type
        String formula = strValue;
        if (com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil.isOF 
            || index.isCellContainWholeRowColRef(id))
          formula = this.getODFFormula(formula);
        attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_TABLE_FORMULA, "", formula);
        value = cell.calculateValue;
      }
    }
    
    if (ConversionUtil.hasValue(value))
      new ValueTypeConvertor().convert(context, attrs, value, cellStyle, cell);

    hdl.startElement(uri, localName, qName, attrs);
    if (bChange || isNew)
    {
      this.setCellValue(context, cell, value);
    }
    else if(!bChange)
      doTextPPreserve(context, getNodeId(input));
    convertChildren();
    if (cell.commentUpdated!=null)
      context.put("commentsupdated", cell.commentUpdated);
    doPreserve(context, input);
    if (cell.commentUpdated!=null)
      context.remove("commentsupdated");
  }
  private void convertImage(JsonToODSIndex index, String id)
  {
    List<Range> images = index.getImageByContainerId(id);
    if( images == null)
      return;
    int length = images.size();
    for (int i = 0; i< length; i++)
    {
        DrawFrameRange image = (DrawFrameRange)images.get(i);
      if(ConversionUtil.hasValue(image.link))
      {
        DrawAConvertor convertor = new DrawAConvertor(context, hdl, image);
        convertor.convert(context, image, hdl);
      }
      else
      {
        DrawFrameContext convertor = new DrawFrameContext(context, hdl, image);
        convertor.convert(context, image, hdl);
      }
    }
  }
  private void convertComments(JsonToODSIndex index, String id)
  {
    Range comments = index.getCommentsByContainerId(id);
    if( comments == null)
      return;
    // DrawAConvertor convertor = new DrawAConvertor(context, hdl, image);
    CommentsConvertor convertor = new CommentsConvertor();
    convertor.convert(context, hdl, input, comments);
  }
  public void convertChildren()
  {
    JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
    String id = getNodeId(input);
    this.convertImage(index, id);
    this.convertComments(index, id);
  }
  
  public void setTableStyleNameAttribute(ConversionContext context,Object input, AttributesImpl attrs)
  {
    
    Cell cell = (Cell)input;
    String cellStyleName = cell.styleId;
    String styleName = attrs.getValue(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
    
    HashMap<String, String> preserveColumnCellStyleMap = (HashMap<String, String>) context.get("preserveColumnCellStyleMap");
    String inheriteColumnDefaultCellStyle = preserveColumnCellStyleMap.get(cellStyleName);
    if(inheriteColumnDefaultCellStyle != null)
      styleName = inheriteColumnDefaultCellStyle;
    
    HashMap<String,Map<String,String>> newStyleMap = (HashMap<String,Map<String,String>>) context.get("newStyleMap");
   
    if ( cell.styleId.equals(ODSConvertUtil.DEFAULT_CELL_STYLE_NAME))
      cellStyleName = ODSConvertUtil.DEFAULT_CELL_STYLE_NAME;
    else if (cell.styleId.equals(ConversionConstant.DEFAULT_CELL_STYLE))
    {
      JsonToODSIndex index = (JsonToODSIndex)context.get("ODSIndex");
      String cellId = getNodeId(input);
      //there are many ods cell styles are mapping to the defaultcellstyle in json
      //that is caused by 
      //1) set default formatting, will be record in preserve.js
      //2) by copy/cut & paste, that the source data has defaultcellstyle, so the ods cell style need to be overriden
      //3) the ods cell style is totally unsupport style that Docs have to convert it to deaultcellstyle, when export, the ods cell style need to be preserved
      if(ConversionUtil.hasValue(styleName) && !index.isDefaultFormatting(cellId) && isTotalUnsupportStyle(styleName))//hit 3)
        cellStyleName = styleName;  
      else // hit 1) or 2)
        cellStyleName = ODSConvertUtil.DEFAULT_CELL_STYLE_NAME;
    }
    else
    {
      Map<String,String> map = newStyleMap.get(cellStyleName);  
      String key = styleName;
      if(!ConversionUtil.hasValue(styleName)
          || ( ODSConvertUtil.DEFAULT_CELL_STYLE_NAME.equals(styleName) && ConversionUtil.hasValue(cellStyleName))
        )
        key = ConversionConstant.KEY_NEW_DEFAULT;
      if(map != null)
        cellStyleName = map.get(key);
    }

    if(cellStyleName != null)
      attrs.addAttribute("", "", ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME, "", cellStyleName);
    else
      ODSConvertUtil.removeAttribute(attrs, ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
  }

  private boolean isTotalUnsupportStyle(String odfStyleName)
  {
    //supportStyleNameMap stores all the odf style name which value is boolean, true means that it can be convert to json style, 
    // false means that it is totally unsupport odf style that it should convert to json default style
    HashMap<String, Boolean> supportStyleNameMap = (HashMap<String, Boolean>) context.get("supportStyleNameMap");
    if(supportStyleNameMap == null)
    {
      supportStyleNameMap = new HashMap<String, Boolean>();
      context.put("supportStyleNameMap", supportStyleNameMap);
    }
    if(!supportStyleNameMap.containsKey(odfStyleName))
      supportStyleNameMap.put(odfStyleName, com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil.hasSupportStyle(context, odfStyleName));
    if(supportStyleNameMap.get(odfStyleName) == false)
      return true;
    return false;
  }

  // set the value, calculatedvalue and showvalue to odfCell
  private void setCellValue(ConversionContext context, ConversionUtil.Cell cell, Object value)
  {

    Object showvalue = ConversionUtil.hasValue(cell.showValue) ? cell.showValue : value;
    try
    {
      if (ConversionUtil.hasValue(value))
      {
        if (ConversionUtil.hasValue(showvalue))
        {
          String strValue = showvalue.toString();
          if (strValue.startsWith("'"))
            strValue = strValue.substring(1);
          this.setDisplayText(strValue, cell.link);
        }        
      }
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "Error: Output Cell display value {0}" , cell.storeContentToJSON().toString());
    }
  }

  // get the applied cell style of cell
  private CellStyleType getCellStyle(Cell cell, ConversionUtil.Sheet sheet, Document doc)
  {
    if (cell != null)
    {
      String styleId = null;
      if (ConversionUtil.hasValue(cell.styleId))
      {
        styleId = cell.styleId;
      }
      else
      {
        // get from column
        String columnId = null;
        int cellColumnIndex = cell.cellIndex;
        int startIndex = (cellColumnIndex >= sheet.columnIdArray.size()) ? (sheet.columnIdArray.size() - 1) : cellColumnIndex;
        for (int i = startIndex; i >= 0; i--)
        {
          columnId = sheet.columnIdArray.get(i);
          if (ConversionUtil.hasValue(columnId))
          {
            for (int j = 0; j < doc.uniqueColumns.uniqueColumnList.size(); j++)
            {
              ConversionUtil.Column column = doc.uniqueColumns.uniqueColumnList.get(j);
              if (columnId.equals(column.columnId))
              {
                if ((column.columnIndex + column.repeatedNum) >= cellColumnIndex)
                  styleId = column.styleId;
                break;
              }
            }
          }
        }
      }
      if (ConversionUtil.hasValue(styleId))
        return doc.getCellStyleFromStyleId(styleId);
    }
    return null;
  }

  // start with of: and has bracket around the cell/range address
  // while the tempalte ods does not has namespace for "of
  // xmlns:of="urn:oasis:names:tc:opendocument:xmlns:of:1.2"
  private String getODFFormula(String text)
  {
	return ODSConvertUtil.getODFFormula(text,true);
  }

  /**
   * Set the text displayed in this cell.
   * <p>
   * Please note the displayed text in ODF viewer might be different with the value set by this method, because the displayed text in ODF
   * viewer is calculated and set by editor.
   * 
   * @param content
   *          the displayed text. If content is null, it will display the empty string instead.
   * @throws SAXException 
   */
  public void setDisplayText(String content, String link) throws SAXException
  {
    if (content == null)
    {
      content = "";
    }
    if (ConversionUtil.hasValue(link))
    {
      
      hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);

      String strLink = link;
      if (!ConversionUtil.isSupportedHyperlink(link))
        strLink = "http://" + strLink;
      AttributesImpl attrs = new AttributesImpl();
      attrs.addAttribute("", "", "xlink:href", "", strLink);
      hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_A, attrs);
      content = escapeXML(content);
      char[] text = content.toCharArray();
      hdl.characters(text, 0, text.length);
      hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_A);
      hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
    }
    else
    {
      // each span which is splitted by "\n" should be a paragraph
       String[] paraArray = content.split("\n");
       for(int i=0;i<paraArray.length;i++){
         hdl.startElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P, null);
         String str = escapeXML(paraArray[i]);
         char[] text = str.toCharArray();
         hdl.characters(text, 0, text.length);
         hdl.endElement("", "", ConversionConstant.ODF_ELEMENT_TEXT_P);
       }
      // end Concord
    }
  }

  private String escapeXML(String text)
  {
    if(text != null)
    {
      text = text.replaceAll("[\\x00-\\x08\\x0b-\\x0c\\x0e-\\x1f]", "");
    }
    return text;
  }
  public void endElement(String uri, String localName, String qName) throws SAXException
  {
    hdl.endElement(uri, localName, qName);
  }

  public void doPreserve(ConversionContext context,Object input)
  {
    String parentId = getNodeId(input);
    XMLPreserveManager manager = new XMLPreserveManager(hdl);
    manager.doPreserve(context, parentId);
  }
  
  public void doTextPPreserve(ConversionContext context, String id)
  {
	ODSOffsetRecorder reader = (ODSOffsetRecorder) context.get("Recorder");
	String cellContext = reader.locateById(id);
	
	if(cellContext != null)
	{
      ODSSAXParser parser = new ODSSAXParser();
      XMLReader xmlReader = (XMLReader) context.get("XMLReaderInstance2");
      parser.setXMLReader(xmlReader);
	  XMLFragmenttReader fReader =  new CopyCellFragmentReader();
      parser.setHandler(fReader);
      try
      {
          parser.parseXML(hdl,cellContext);
      }
      catch (Exception e)
      {
      }
	}  
  }
  
}
