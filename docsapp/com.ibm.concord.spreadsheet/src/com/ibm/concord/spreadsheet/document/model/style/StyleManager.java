package com.ibm.concord.spreadsheet.document.model.style;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.codehaus.jackson.io.SerializedString;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONObject;

public class StyleManager
{

  private StyleObject defaultCellStyle, defaultStyle;

  private int defaultRowHeight;

  private int defaultColWidth;
  
  // key is hashcode
  private Map<Integer, StyleObject> styleMap;

  private boolean trackRefCount = false;

  public StyleManager()
  {
    styleMap = new HashMap<Integer,StyleObject>();
    defaultCellStyle = new StyleObject();
    defaultCellStyle.setSerializedId(new SerializedString(ConversionConstant.DEFAULT_CELL_STYLE));
    defaultRowHeight = -1;
    defaultColWidth = -1;
  }

  /**
   * Only for test.
   * 
   * @param defaultStyle
   * @param styleList
   */
  @Deprecated
  public StyleManager(JSONObject defaultStyle, List<StyleObject> styleList)
  {
    this.defaultCellStyle = new StyleObject(defaultStyle);
    this.styleMap =  new HashMap<Integer,StyleObject>(); 
    defaultCellStyle.setSerializedId(new SerializedString(ConversionConstant.DEFAULT_CELL_STYLE));
    if(null != styleList)
    {  
      int length = styleList.size();
      for(int i = 0; i < length; i++)
      {  
        StyleObject sObj = styleList.get(i);
        this.styleMap.put(sObj.hashCode(), sObj);
      }
    }
  }



  public void deleteStyle(StyleObject style)
  {
    if(null != style)
      this.styleMap.remove(style.hashCode());
  }

  public StyleObject changeStyle(StyleObject oriStyle, JSONObject delta)
  {
    if (null == delta)
    {
      return null;
    }
    else if (delta.containsKey("id"))
    {
      // style id provided, assume it is dsc
      return defaultCellStyle;
    }
    else if (null == oriStyle)
    {
      return this.addStyle(delta);
    }
    else
    {
      StyleObject style = new StyleObject(oriStyle);
      StyleObject deltaObj = new StyleObject(delta);
      style.changeStyle(deltaObj);
      style.removeDefaultAttrs(this.defaultCellStyle);
      if (style.isEmpty())
      {
        // if all the style attrs are removed, the style equals to dcs,
        // it is safer to return dcs instead of null
        return defaultCellStyle;
      }
      return this.addStyle(style);
    }
  }

  public void changeRefCount(StyleObject style, int count)
  {
    if (!this.trackRefCount || 0 == count)
      return;
    int refCount = style.getRefCount();
    refCount += count;
    if (refCount <= 0)
      this.deleteStyle(style);
    else
      style.setRefCount(refCount);
  }

  public boolean needTrackRefCount()
  {
    return this.trackRefCount;
  }

  public StyleObject getStyle(int hashcode)
  {
    return this.styleMap.get(hashcode);
  }

  public StyleObject getDefaultCellStyle()
  {
    return this.defaultCellStyle;
  }
 
  public boolean getDefaultLockedAttr()
  {
	  Object attr = this.defaultCellStyle.getAttribute(ConversionConstant.STYLE_UNLOCKED);
	  if(attr != null)
		  return !(Boolean)attr;
	  else
		  return true;
  }
  
  public StyleObject getDefaultStyle()
  {
    if (defaultStyle == null)
    {
      defaultStyle = new StyleObject();
      defaultStyle.setSerializedId(new SerializedString(ConversionConstant.DEFAULT_CELL_STYLE_NAME));
    }
    return defaultStyle;
  }

  public List<StyleObject> getStyleList()
  {
    return null;
  }
  
  public Map<Integer,StyleObject> getStyleMap()
  {
    return this.styleMap;
  }
  


  public int getDefaultRowHeight()
  {
    return defaultRowHeight;
  }

  public void setDefaultRowHeight(int defaultRowHeight)
  {
    this.defaultRowHeight = defaultRowHeight;
  }

  public int getDefaultColWidth()
  {
    return defaultColWidth;
  }

  public void setDefaultColWidth(int defaultColWidth)
  {
    this.defaultColWidth = defaultColWidth;
  }

  public StyleObject addStyle(StyleObject style)
  {
    if(null == style) return null;
    int hashcode = style.hashCode();
    StyleObject obj = this.styleMap.get(hashcode);
    if(null == obj)
    {
      this.styleMap.put(hashcode, style);
      obj = style;
    }
    return obj;
  }

 
  public StyleObject addStyle(JSONObject style)
  {
    if (style.containsKey("id"))
    {
      // style id provided, assume it is dsc, 
      return defaultCellStyle;
    }
    else
    {
      StyleObject sObj = new StyleObject(style);
      sObj.removeDefaultAttrs(this.defaultCellStyle);
      if (sObj.isEmpty())
        return null;
      return this.addStyle(sObj);
    }
  }
}
