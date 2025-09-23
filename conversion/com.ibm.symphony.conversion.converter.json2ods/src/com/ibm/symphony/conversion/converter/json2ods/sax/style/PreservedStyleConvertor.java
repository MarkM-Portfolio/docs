/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.json2ods.sax.style;



import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfTableCellProperties;

import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.CellStyleType;
import com.ibm.symphony.conversion.spreadsheet.index.ODSConvertUtil;

public class PreservedStyleConvertor extends GeneralStyleConvertor
{
  public OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.TableCell;
  }
  
  public OdfStyle convertStyle(ConversionContext context,String oldStyleName)
  {
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");
    OdfStyle oldStyle = null;
    try
    {
      OdfStyle newStyle = new OdfStyle(contentDom);
      oldStyle = ODSConvertUtil.getOldStyle(context, oldStyleName, getStyleFamily());
      String cellStyleName = ODSConvertUtil.getStyleName(OdfStyleFamily.TableCell, ConversionConstant.SID) ;
      newStyle.setStyleNameAttribute(cellStyleName);
      copyPreservedProperties(newStyle,oldStyle);
      removeProperties(newStyle);
      OdfOfficeAutomaticStyles autoStyles = null;
      ConversionUtil.CellStyleType defaultCellStyle = (CellStyleType) context.get("defaultCellStyle");
      try
      {
        autoStyles = contentDom.getAutomaticStyles();
        autoStyles.appendChild(newStyle);
      }
      catch (Exception e)
      {
      }
      return newStyle;
    }
    catch (Exception e)
    {
      e.printStackTrace();
    }
    return null;
  }
  
  /*
  *To remove preserved properties
  */
  private void removeProperties(OdfStyle newStyle)
  {
    newStyle.removeProperty(OdfTableCellProperties.BackgroundColor);
    newStyle.removeProperty(OdfTableCellProperties.Border);
    newStyle.removeProperty(OdfTableCellProperties.BorderLeft);
    newStyle.removeProperty(OdfTableCellProperties.BorderRight);
    newStyle.removeProperty(OdfTableCellProperties.BorderTop);
    newStyle.removeProperty(OdfTableCellProperties.BorderBottom);
  }
}
