package com.ibm.symphony.conversion.converter.ods2json.sax;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.config.ConfigConfigItemMapEntryElement;
import org.odftoolkit.odfdom.dom.element.config.ConfigConfigItemMapNamedElement;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class SettingUpdate
{
  Document doc;
  OdfFileDom dom;
  Map<Integer,OdfElement> map ; 
  
  public SettingUpdate(OdfFileDom dom,Document doc)
  {
    this.dom = dom;
    this.doc = doc;
    map = new HashMap<Integer,OdfElement>();
  }
  public void updateSettings()
  {
    List<Sheet> list = doc.sheetList;
    int length = list.size();
    NodeList mapNamed = dom.getElementsByTagName(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_ITEM_MAP_NAMED);
    int sheetIndex = 0;
    int len =  mapNamed.getLength();
    for( int i = 0 ;i < len ;i ++)
    {
      Node node = mapNamed.item(i);
      String configName = node.getAttributes().getNamedItem(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_NAME).getNodeValue();
      if(!"ScriptConfiguration".equals(configName))
        continue;
      NodeList children  = node.getChildNodes();
      int nLen =  children.getLength();
      for( int j = 0 ;j < nLen ;j++)
      {
        Node child = children.item(j);
        String sheetName = "";
        if(child instanceof ConfigConfigItemMapEntryElement)
        {
          sheetName = ((ConfigConfigItemMapEntryElement) child).getConfigNameAttribute();
        }
        if(sheetName.startsWith("*"))
          continue;
        map.put(sheetIndex, (OdfElement) child);
        sheetIndex ++;
      }
    }
    for(int i = 0; i< length; i++)
    {
      Sheet sheet = list.get(i);
      String sName = sheet.sheetName;
      OdfElement element = map.get(i);
      if(element == null)
        continue;
      element.setAttribute("id", sheet.sheetId);
    }
  }
}
