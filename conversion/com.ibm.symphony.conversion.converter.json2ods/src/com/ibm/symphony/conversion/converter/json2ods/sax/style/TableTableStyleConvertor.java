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

import java.util.HashMap;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.dom.attribute.style.StyleFamilyAttribute;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.odftoolkit.odfdom.dom.style.props.OdfTableProperties;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.doc.style.OdfStyleTableProperties;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.NodeList;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.json2ods.sax.ODSConvertUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.indextable.IndexUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;
import com.ibm.symphony.conversion.spreadsheet.index.JsonToODSIndex;

public class TableTableStyleConvertor extends GeneralStyleConvertor
{
  public TableTableStyleConvertor()
  {    
  }
  
  public OdfStyleFamily getStyleFamily()
  {
    return OdfStyleFamily.Table;
  }
  
  public void convertStyle(ConversionContext context, Sheet sheet)
  {
    String sheetId = sheet.sheetId;
    JsonToODSIndex index = (JsonToODSIndex) context.get("ODSIndex");
    OdfElement odfNode = index.getOdfNodes(sheetId);
    String odf_sheet_StyleName = null;
    if(odfNode != null)
      odf_sheet_StyleName = odfNode.getAttribute(ConversionConstant.ODF_ATTRIBUTE_TABLE_STYLE_NAME);
   
    OdfFileDom content = (OdfFileDom)context.get("Target");    
    OdfOfficeAutomaticStyles autoStyles = null;
    try
    {
      autoStyles = content.getAutomaticStyles();
    }
    catch (Exception e)
    {
    }
    
    if(ConversionUtil.hasValue(odf_sheet_StyleName) && autoStyles != null)
    {
      OdfStyle oldStyle = autoStyles.getStyle(odf_sheet_StyleName, getStyleFamily());
      if (!hasSameVisibilityAttr(oldStyle, sheet)){
        createStyle(context, oldStyle, sheet, autoStyles);
      }
      return;
    }
    String sheet_vis = sheet.visibility;
    boolean is_sheet_hide = ((ConversionConstant.SHEETHIDE).equalsIgnoreCase(sheet_vis)
    		|| (ConversionConstant.SHEETVERYHIDE).equalsIgnoreCase(sheet_vis));
    if (odfNode == null//new sheet
    	|| (!ConversionUtil.hasValue(odf_sheet_StyleName)&&is_sheet_hide))//the sheet created in Docs before does not have sheet style name
    {
    	createStyle(context, null, sheet, autoStyles);
    }
    
  } 
  
  private void createStyle(ConversionContext context, OdfStyle oldStyle, Sheet sheet, OdfOfficeAutomaticStyles autoStyles)
  {
    String tableStyleName = ODSConvertUtil.getStyleName(OdfStyleFamily.Table, ConversionConstant.ST) ;
    OdfFileDom contentDom = (OdfFileDom) context.get("Target");
    OdfStyle newStyle = new OdfStyle(contentDom);
    if (oldStyle != null)
    	copyPreservedProperties(newStyle, oldStyle);
    else
    	newStyle.setStyleMasterPageNameAttribute("Default");
    String display = "true";
    if (sheet.visibility.equalsIgnoreCase(ConversionConstant.SHEETHIDE) ||
        sheet.visibility.equalsIgnoreCase(ConversionConstant.SHEETVERYHIDE))
      display = "false";
    newStyle.setStyleNameAttribute(tableStyleName);
    newStyle.setStyleFamilyAttribute(StyleFamilyAttribute.Value.TABLE.toString());
    newStyle.setProperty(OdfTableProperties.Display, display );
    autoStyles.appendChild(newStyle);  
    
    HashMap<String, String> tableStyleMap = (HashMap<String, String>)context.get("tableStyleMap");
    tableStyleMap.put(sheet.sheetId, tableStyleName);
  }
 
  private boolean hasSameVisibilityAttr(OdfStyle oldStyle, Sheet outputSheet){
	boolean be_same = true;
	String display = oldStyle.getProperty(OdfStyleTableProperties.Display);
	String sheet_vis = outputSheet.visibility;
	if (display.equalsIgnoreCase("false")&& sheet_vis.length()==0 ||
        display.equalsIgnoreCase("true")&& 
        (sheet_vis.equalsIgnoreCase(ConversionConstant.SHEETHIDE)|| sheet_vis.equalsIgnoreCase(ConversionConstant.SHEETVERYHIDE))){
      be_same = false;
    }    
    return be_same;
  }
  

}
