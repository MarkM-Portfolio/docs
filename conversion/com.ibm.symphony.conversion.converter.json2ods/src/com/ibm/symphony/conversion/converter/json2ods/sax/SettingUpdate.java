package com.ibm.symphony.conversion.converter.json2ods.sax;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.dom.element.config.ConfigConfigItemElement;
import org.odftoolkit.odfdom.dom.element.config.ConfigConfigItemMapEntryElement;
import org.odftoolkit.odfdom.dom.element.config.ConfigConfigItemMapIndexedElement;
import org.odftoolkit.odfdom.dom.element.config.ConfigConfigItemMapNamedElement;
import org.odftoolkit.odfdom.dom.element.config.ConfigConfigItemSetElement;
import org.w3c.dom.DOMException;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.spreadsheet.impl.ConversionConstant;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Document;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil.Sheet;

public class SettingUpdate
{
  Document doc;

  OdfFileDom dom;

  Map<String, OdfElement> map;

  public SettingUpdate(OdfFileDom dom, Document doc)
  {
    this.dom = dom;
    this.doc = doc;
    map = new HashMap<String, OdfElement>();
  }

  @SuppressWarnings("restriction")
  public void updateSettings()
  {
    List<Sheet> list = doc.sheetList;
    int length = list.size();
    boolean showGridLines = true;
    for(Sheet st : doc.sheetList) {
      if (st.showGridLines == false)
      {
        showGridLines = false;
        break;
      }
    }        
    NodeList mapNamed = dom.getElementsByTagName(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_ITEM_MAP_NAMED);
    int len = mapNamed.getLength();
    if(len == 0 && appendViewsSettings(dom.getElementsByTagName(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_ITEM_SET), showGridLines))
    {
    	mapNamed = dom.getElementsByTagName(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_ITEM_MAP_NAMED);
    	len = mapNamed.getLength();
    }
    
    NodeList itemSets = dom.getElementsByTagName(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_ITEM_SET);
    appendItemSetsGlobalSettings(itemSets, showGridLines);
    
    for (int i = 0; i < len; i++)
    {
      Node node = mapNamed.item(i);
      String configName = node.getAttributes().getNamedItem(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_NAME).getNodeValue();
      if ("ScriptConfiguration".equals(configName))
      {
        NodeList children = node.getChildNodes();
        int nLen = children.getLength();
        Node starDoc = null;
        for (int j = 0; j < nLen; j++)
        {
          Node child = node.getFirstChild();
          String sheetName = "";
          if (child instanceof ConfigConfigItemMapEntryElement)
          {
            sheetName = ((ConfigConfigItemMapEntryElement) child).getConfigNameAttribute();
          }
          node.removeChild(child);
          if (sheetName.startsWith("*"))
          {
            starDoc = child;
            continue;
          }
          Node idNode = child.getAttributes().getNamedItem("id");

          if (idNode != null)
          {
            String id = idNode.getNodeValue();
            map.put(id, (OdfElement) child);
          }
        }
        if (starDoc != null)
          node.appendChild(starDoc);
        for (int k = 0; k < length; k++)
        {
          Sheet sheet = list.get(k);
          String id = sheet.sheetId;
          ConfigConfigItemMapEntryElement element = (ConfigConfigItemMapEntryElement) map.get(id);
          if (element == null)
          {
            element = new ConfigConfigItemMapEntryElement(dom);
            element.setConfigNameAttribute(sheet.sheetName);
            ConfigConfigItemElement item = new ConfigConfigItemElement(dom);
            item.setConfigNameAttribute("CodeName");
            item.setConfigTypeAttribute("string");
            Text text = dom.createTextNode(sheet.sheetName);
            item.appendChild(text);
            element.appendChild(item);
          }
          element.setConfigNameAttribute(sheet.sheetName);
          node.appendChild(element);
        }
      }
      else if ("Tables".equals(configName))
      {
        ConfigConfigItemMapNamedElement tables = (ConfigConfigItemMapNamedElement) node;
        int sheetEntries = tables.getLength();
        appendSheetSettigns(tables);
        NodeList sheets = tables.getChildNodes();
        int slength = sheets.getLength();
        for (int k = 0; k < slength; k++)
        {
          ConfigConfigItemMapEntryElement set = (ConfigConfigItemMapEntryElement) sheets.item(k);
          Sheet sheetJs = getSheet(set.getConfigNameAttribute());
          if (sheetJs == null)
            continue;
          boolean overwritePosition = (sheetJs.horizontalSplitPosition != -1 || sheetJs.verticalSplitPosition != -1);
          Node each = set.getFirstChild();
          while (null != each)
          {
            ConfigConfigItemElement item = (ConfigConfigItemElement) each;

            if (ConversionConstant.HORIZONTAL_SPLIT_MODE.equals(item.getConfigNameAttribute()))
              if (sheetJs.horizontalSplitPosition > 0)
                item.setTextContent(String.valueOf(ConversionConstant.VIEW_FREEZE_MODE));
              else if (sheetJs.horizontalSplitPosition == 0)
                item.setTextContent(String.valueOf(ConversionConstant.VIEW_DEFAULT_MODE));

            if (ConversionConstant.VERTICAL_SPLIT_MODE.equals(item.getConfigNameAttribute()))
              if (sheetJs.verticalSplitPosition > 0)
                item.setTextContent(String.valueOf(ConversionConstant.VIEW_FREEZE_MODE));
              else if (sheetJs.verticalSplitPosition == 0)
                item.setTextContent(String.valueOf(ConversionConstant.VIEW_DEFAULT_MODE));

            if (ConversionConstant.HORIZONTAL_SPLIT_POSITION.equals(item.getConfigNameAttribute())
                || ConversionConstant.POSITION_RIGHT.equals(item.getConfigNameAttribute())
                || ConversionConstant.CURRENTPOSITIONX.equals(item.getConfigNameAttribute()))
              if (sheetJs.horizontalSplitPosition >= 0)
                item.setTextContent(String.valueOf(sheetJs.horizontalSplitPosition));

            if (ConversionConstant.VERTICAL_SPLIT_POSITION.equals(item.getConfigNameAttribute())
                || ConversionConstant.POSITION_BOTTOM.equals(item.getConfigNameAttribute())
                || ConversionConstant.CURRENTPOSITIONY.equals(item.getConfigNameAttribute()))
              if (sheetJs.verticalSplitPosition >= 0)
                item.setTextContent(String.valueOf(sheetJs.verticalSplitPosition));
            
            if (ConversionConstant.POSITION_TOP.equals(item.getConfigNameAttribute()))
              if (overwritePosition)
                item.setTextContent(Integer.toString(0));
            
            if (ConversionConstant.POSITION_LEFT.equals(item.getConfigNameAttribute()))
              if (overwritePosition)
                item.setTextContent(Integer.toString(0));

            /* Keep the active range as 2 all the time */
            // if(ConversionConstant.ACTIVE_SPLITRANGE.equals(item.getConfigNameAttribute()))
            // item.setTextContent(String.valueOf(calculateActiveRange(sheetJs.verticalSplitPosition, sheetJs.horizontalSplitPosition)));
            each = each.getNextSibling();
          }
        }
        // reset showGrid in views
        ConfigConfigItemMapEntryElement itemMapEntry = (ConfigConfigItemMapEntryElement) tables.getParentNode();
        for (int j=0; j<itemMapEntry.getLength(); j++) {
          Node item = itemMapEntry.item(j);
          if(ConversionConstant.ODF_ELEMENT_CONFIG_SHOWGRID.equalsIgnoreCase(item.getAttributes().getNamedItem(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_NAME).getNodeValue())) {
            item.setTextContent(Boolean.toString(showGridLines));
            break;
          }  
        }
      }
    }
  }
  
  private boolean appendItemSetsGlobalSettings(NodeList nodeList, Boolean showGridLines) {
    try {
      for (int i=0; i<nodeList.getLength(); i++){
        ConfigConfigItemSetElement itemSet = (ConfigConfigItemSetElement)nodeList.item(i);
        if (ConversionConstant.ODF_ELEMENT_OOO_DOCUMENT_SETTINGS.equalsIgnoreCase(itemSet.getConfigNameAttribute())) {

          for (int j=0; j<itemSet.getLength(); j++) {
            Node item = (ConfigConfigItemElement) itemSet.item(j);
            if(ConversionConstant.ODF_ELEMENT_CONFIG_SHOWGRID.equalsIgnoreCase(item.getAttributes().getNamedItem(ConversionConstant.ODF_ELEMENT_CONFIG_CONFIG_NAME).getNodeValue())) {
              item.setTextContent(Boolean.toString(showGridLines));
              break;
            }            
          }
          break;
        }
      }      
    }
    catch (Exception e) {
      return false;
    }
    return false;
  }

  private boolean appendViewsSettings(NodeList nodeList, boolean showGrid) 
  {
	  try {
		int len = nodeList.getLength();
	    ConfigConfigItemSetElement root = null;
		for(int i = 0; i < len; i++) 
		{
			  ConfigConfigItemSetElement itemSet = (ConfigConfigItemSetElement) nodeList.item(i);
			  if(itemSet.getConfigNameAttribute().equals("ooo:view-settings")) 
			  {
				  root = itemSet;
				  break;  
			  }
		}
		if(root == null) return false;
		for(Sheet st : doc.sheetList) 
		{
			if(st.horizontalSplitPosition != -1 || st.verticalSplitPosition != -1) 
			{
				//create the ConfigConfigItemMapIndexed "Views",
				//and it's child ConfigConfigItemMapEntry => ConfigConfigItemMapEntry ("Tables")
				ConfigConfigItemMapIndexedElement views = new ConfigConfigItemMapIndexedElement(dom);
				views.setConfigNameAttribute("Views");
				ConfigConfigItemMapEntryElement mapEntry = views.newConfigConfigItemMapEntryElement();
				ConfigConfigItemMapNamedElement tables = new ConfigConfigItemMapNamedElement(dom);
				tables.setConfigNameAttribute("Tables");
				mapEntry.appendChild(tables);
				ConfigConfigItemElement gridItem = new ConfigConfigItemElement(dom);
				gridItem.setConfigNameAttribute(ConversionConstant.ODF_ELEMENT_CONFIG_SHOWGRID);
				gridItem.setTextContent(Boolean.toString(showGrid));
				root.appendChild(views);
				return true;
			}
		 }
	} catch (DOMException e) {
		return false;
	}
	  return false;
  }

private void appendSheetSettigns(ConfigConfigItemMapNamedElement root)
  {
    HashMap<String, Sheet> sheetMap = new HashMap<String, Sheet>();
    for (Sheet sht : doc.sheetList)
      sheetMap.put(sht.sheetName, sht);
    NodeList sheets = root.getChildNodes();
    int length = sheets.getLength();
    for (int i = 0; i < length; i++)
    {
      ConfigConfigItemMapEntryElement node = (ConfigConfigItemMapEntryElement) sheets.item(i);
      sheetMap.remove(node.getConfigNameAttribute());
    }
    for (Sheet sheet : doc.sheetList)
    {
      Sheet appendSheet = sheetMap.get(sheet.sheetName);
      if (appendSheet != null)
      {
        ConfigConfigItemMapEntryElement newSetting = new ConfigConfigItemMapEntryElement(dom);
        newSetting.setConfigNameAttribute(sheet.sheetName);
        addConfigItem(newSetting, ConversionConstant.CURRENTPOSITIONX, "int", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.CURRENTPOSITIONY, "int", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.HORIZONTAL_SPLIT_MODE, "short", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.VERTICAL_SPLIT_MODE, "short", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.HORIZONTAL_SPLIT_POSITION, "int", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.VERTICAL_SPLIT_POSITION, "int", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.ACTIVE_SPLITRANGE, "short", Integer.toString(2));
        addConfigItem(newSetting, ConversionConstant.POSITION_LEFT, "int", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.POSITION_RIGHT, "int", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.POSITION_TOP, "int", Integer.toString(0));
        addConfigItem(newSetting, ConversionConstant.POSITION_BOTTOM, "int", Integer.toString(0));
        root.appendChild(newSetting);
      }
    }
  }

  private void addConfigItem(Node root, String attribute, String type, String value)
  {
    ConfigConfigItemElement configItem = new ConfigConfigItemElement(dom);
    configItem.setConfigNameAttribute(attribute);
    configItem.setConfigTypeAttribute(type);
    configItem.setTextContent(value);
    root.appendChild(configItem);
  }

  /**
   * Gets the active Panel 0 - Bottom Right, 1 - Top Right 2 - Bottom Left, 3 - Top Lef
   * 
   * @param v
   * @param h
   * @return
   */
  private int calculateActiveRange(int v, int h)
  {
    if (v > 0)
    {
      if (h > 0)
        return 3;
      else
        return 1;
    }
    else
    {
      if (h > 0)
        return 2;
      else
        return 0;
    }
  }

  private Sheet getSheet(String sheetName)
  {
    for (Sheet sheet : doc.sheetList)
    {
      if (sheet.sheetName.equals(sheetName))
        return sheet;
    }
    return null;
  }

}
