/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.ods2json.sax.attribute;

import java.util.StringTokenizer;

import org.odftoolkit.odfdom.type.PositiveLength;
import org.odftoolkit.odfdom.type.Length.Unit;

import com.ibm.symphony.conversion.converter.ods2json.sax.XMLUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;

public class BorderConvertor extends GeneralAttributeConvertor
{
	
  public BorderConvertor(String attrName)
  {
    super(attrName);
  }

  public void convert(ConversionContext context,Object target, String qName, String border)
  {
    ConversionUtil.CellStyleType cellStyle = (CellStyleType) target;
    StringTokenizer token = new StringTokenizer(border," ");
    String borderWidth;
    String borderStyle;
    String borderColor;
    if(token.countTokens() == 3){
      borderWidth = token.nextToken();
      borderStyle = token.nextToken();
      borderColor = token.nextToken();
      if(!borderStyle.equalsIgnoreCase("none")){
        String borderKind = ConversionConstant.DEFAULT_BORDER_THIN;
        //if border width > 0.02inch, then set to thick
        if(PositiveLength.isValid(borderWidth)){
          borderKind = (PositiveLength.parseDouble(borderWidth, Unit.INCH) > 0.02) ? 
              ConversionConstant.DEFAULT_BORDER_THICK:ConversionConstant.DEFAULT_BORDER_THIN;
        }
        XMLUtil.ATTRNAME type = XMLUtil.getXMLAttrToken(qName);
        switch(type)
        {
	        case FO_BORDER_LEFT:
	        {
	          cellStyle.borderLeft = borderKind;
	          cellStyle.borderLeftColor = borderColor;
	          cellStyle.borderLeftStyle = borderStyle;
	          break;
	        }
	        case FO_BORDER_RIGHT:
	        {
	          cellStyle.borderRight = borderKind;
	          cellStyle.borderRightColor = borderColor;
	          cellStyle.borderRightStyle = borderStyle;
	          break;
	        }
	        case FO_BORDER_TOP:
	        {
	          cellStyle.borderTop= borderKind;
	          cellStyle.borderTopColor = borderColor;
	          cellStyle.borderTopStyle = borderStyle;
	          break;
	        }
	        case FO_BORDER_BOTTOM:
	        {
	          cellStyle.borderBottom= borderKind;
	          cellStyle.borderBottomColor = borderColor;
	          cellStyle.borderBottomStyle = borderStyle;
	          break;
	        }
	        case FO_BORDER:
	        {
	          cellStyle.borderLeft = borderKind;
	          cellStyle.borderLeftColor = borderColor;
	          cellStyle.borderLeftStyle = borderStyle;
	
	          cellStyle.borderRight = borderKind;
	          cellStyle.borderRightColor = borderColor;
	          cellStyle.borderRightStyle = borderStyle;
	
	          cellStyle.borderTop = borderKind;
	          cellStyle.borderTopColor = borderColor;
	          cellStyle.borderTopStyle = borderStyle;
	
	          cellStyle.borderBottom = borderKind;
	          cellStyle.borderBottomColor = borderColor;
	          cellStyle.borderBottomStyle = borderStyle;
	          break;
	        }
        }
      }
    }
  }

}
