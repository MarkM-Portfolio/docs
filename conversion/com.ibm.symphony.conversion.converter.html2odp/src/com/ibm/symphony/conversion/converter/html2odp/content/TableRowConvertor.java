/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.content;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;
import com.ibm.symphony.conversion.converter.html2odp.styleattr.PropertyConvertor;
import com.ibm.symphony.conversion.converter.html2odp.styleattr.PropertyConvertorFactory;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.util.TableConvertorUtil;

public class TableRowConvertor extends GeneralODPConvertor
{

  protected void doContentConvert(ConversionContext context, Element htmlElement, OdfElement odfParent)
  {
    @SuppressWarnings("unused")
    OdfElement newParent = odfParent;
    try
    {
      OdfFileDom contentDom = (OdfFileDom) context.get("target");
      newParent = TableConvertorUtil.parseHeaderRow(context, contentDom, htmlElement, odfParent);
    }
    catch (Exception e)
    {
    }
    super.doContentConvert(context, htmlElement, odfParent);
  }

  @SuppressWarnings("restriction")
  protected void parseAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement, OdfElement odfParent)
  {
    // drop table:default-cell-style-name if the editor removed it (by applying a concord table template)
    String odfDefaultCellStyle = odfElement.getAttribute(ODPConvertConstants.ODF_STYLE_DEFAULT_CELL_STYLE_NAME);
    if (odfDefaultCellStyle != null && odfDefaultCellStyle.length() > 0)
    {
      String htmlDefaultCellStyle = htmlElement.getAttribute("table_default-cell-style-name");
      if (htmlDefaultCellStyle == null || htmlDefaultCellStyle.length() == 0)
      {
        odfElement.removeAttribute(ODPConvertConstants.ODF_STYLE_DEFAULT_CELL_STYLE_NAME);
      }
    }    
    
    OdfStyleFamily family = OdfStyleFamily.TableRow;
    this.parseAttributes(context, htmlElement, odfElement, odfParent, family);
    OdfFileDom contentDom = (OdfFileDom) context.get("target");
    OdfOfficeAutomaticStyles autoStyles = contentDom.getAutomaticStyles();
    OdfStyle style = autoStyles.getStyle(odfElement.getAttribute(ODPConvertConstants.ODF_ATTR_TABLE_STYLE_NAME), OdfStyleFamily.TableRow);
    if (style == null)
    {
      style = ODFConvertorUtil.createNewStyle(context, odfElement, family);
      OdfStylableElement stylable = (OdfStylableElement) odfElement;
      stylable.setStyleName(style.getStyleNameAttribute());
    }
    
    // set row height on the ODF element from in-line style value
    String height = null;
    String styleString = htmlElement.getAttribute(ODPConvertConstants.HTML_ATTR_STYLE);
    if (styleString != null && styleString.toLowerCase().contains(ODPConvertConstants.SVG_ATTR_HEIGHT)) 
    {
      String[] styleValues = styleString.split(";");
      for (String styleAttr : styleValues)
      {
        String[] attribute = styleAttr.split(":");
        if (attribute[0].trim().toLowerCase().equals(ODPConvertConstants.SVG_ATTR_HEIGHT))
        {
          height = attribute[1];
          break;
        }
      }
    }
    if (height != null && height.length() > 0)
    {
      PropertyConvertor convertor = PropertyConvertorFactory.getInstance().getConvertor(ODPConvertConstants.CSS_ROW_HEIGHT);
      convertor.convert(context, style, null, ODPConvertConstants.CSS_ROW_HEIGHT, height.trim());
    }
  }

  protected void convertChildren(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {
    TableConvertor.convertTableChildren(context, htmlElement, odfElement);
  }

}
