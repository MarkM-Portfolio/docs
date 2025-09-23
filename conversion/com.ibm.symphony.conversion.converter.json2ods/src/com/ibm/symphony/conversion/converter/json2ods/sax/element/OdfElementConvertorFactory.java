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

import java.util.HashMap;

import com.ibm.symphony.conversion.converter.json2ods.sax.IConvertor;
import com.ibm.symphony.conversion.converter.json2ods.sax.IConvertorFactory;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil;
import com.ibm.symphony.conversion.spreadsheet.XMLUtil.NODENAME;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;

public class OdfElementConvertorFactory implements IConvertorFactory
{
  private static OdfElementConvertorFactory instance = new OdfElementConvertorFactory();
 
  public static OdfElementConvertorFactory getInstance()
  {
    return instance;
  }
  
  public IConvertor getConvertor(Object input)
  {
//    Node node  = (Node)input;
    String nodeName = (String)input;
    NODENAME type = XMLUtil.getXMLToken(nodeName);
    if(type == null)
      type = NODENAME.DEFAULTNAME;
    IConvertor convertor = null;
    switch(type)
    {
      case OFFICE_SPREADSHEET:
        convertor = new OfficeSpreadsheetConvertor();
        break;
      case TABLE_SHAPES:
        convertor = new TableShapesConvertor();
        break;
      case DRAW_FRAME:
        convertor = new DrawFrameDomConvertor();
        break;
      case DRAW_IMAGE:
        convertor = new DrawImageDomConvertor();
        break;  
      case SVG_TITLE:
        convertor = new SvgTitleDescDomConvertor();
        break;    
      case TABLE_TABLE:
        convertor = new TableTableConvertor();
        break;
      case TABLE_TABLE_COLUMN:
        convertor = new TableColumnConvertor();
        break;
      case TABLE_TABLE_ROW:
        convertor = new TableRowConvertor();
        break;
//      case TABLE_TABLE_CELL:
//        convertor = new TableCellConvertor();
//        break;
//      case TABLE_COVERED_TABLE_CELL:
//        convertor = new TableCellConvertor();
//        break;
      case TABLE_TABLE_HEADER_ROWS:
      case TABLE_TABLE_ROWS:
      case TABLE_TABLE_ROW_GROUP:
        convertor = new TableRowGroupConvertor();
        break;
      case TABLE_TABLE_HEADER_COLUMNS:
      case TABLE_TABLE_COLUMNS:
      case TABLE_TABLE_COLUMN_GROUP:
        convertor = new TableColumnGroupConvertor();
        break;
      case OFFICE_ANNOTATION: 
        convertor = new OfficeAnnotationConvertor();
        break;
      case TABLE_NAMED_EXPRESSIONS: 
        convertor = new TableNamedExpressionsConvertor();
        break;
      case TABLE_NAMED_RANGE: 
        convertor = new NameRangeConvertor();
        break;  
      case TABLE_TABLE_DATABASE_RANGES: 
          convertor = new TableDataRangesConverter();
          break;  
      case TABLE_TABLE_DATABASE_RANGE: 
          convertor = new TableDataRangeConverter();
          break;    
      case TABLE_TABLE_FILTER: 
          convertor = new TableFilterConverter();
          break; 
      case TABLE_TABLE_FILTER_CONDITION: 
          convertor = new TableFilterConditionConverter();
          break;       
      case TABLE_CONTENT_VALIDATIONS:
    	  convertor = new TableContentValidationsConvertor();
    	  break;
      case TABLE_CONTENT_VALIDATION:
    	  convertor = new ContentValidationConvertor();
    	  break;
      case TABLE_ERROR_MESSAGE:
    	  convertor = new TableErrorMessageConvertor();
    	  break;
      case TABLE_HELP_MESSAGE:
    	  convertor = new TableHelpMessageConvertor();
    	  break;
      case DRAW_A:
        convertor = new DrawADomConvertor();
        break;      
      case DEFAULTNAME:
      default:
        convertor = new GeneralConvertor();
    }
    return convertor;
  }

}
