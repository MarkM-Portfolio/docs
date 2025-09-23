package com.ibm.concord.spreadsheet.document.model.style;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.commons.lang.builder.HashCodeBuilder;
import org.apache.commons.lang.math.NumberUtils;
import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.JsonToken;
import org.codehaus.jackson.SerializableString;

import com.ibm.concord.spreadsheet.common.ConversionConstant;
import com.ibm.concord.spreadsheet.document.model.impl.io.Actions;
import com.ibm.concord.spreadsheet.document.model.util.ModelHelper;
import com.ibm.json.java.JSONObject;

public class StyleObject
{
  private static final Logger LOG = Logger.getLogger(StyleObject.class.getName());

  // The style attributes in this array is arranged in decreasing order of the used frequency
  public static String[] attsNameArray = {
      ConversionConstant.FORMATCATEGORY,
      ConversionConstant.FORMATCODE, //
      ConversionConstant.FORMATCURRENCY,

      ConversionConstant.SIZE, ConversionConstant.FONTNAME, ConversionConstant.BOLD, ConversionConstant.TEXT_ALIGN,
      ConversionConstant.VERTICAL_ALIGN,
      ConversionConstant.BACKGROUND_COLOR, ConversionConstant.COLOR, ConversionConstant.ITALIC, ConversionConstant.WRAPTEXT,
      ConversionConstant.UNDERLINE,ConversionConstant.STYLE_PRESERVE,ConversionConstant.DIRECTION,

      ConversionConstant.BORDER_LEFT, ConversionConstant.BORDER_RIGHT, ConversionConstant.BORDER_TOP, ConversionConstant.BORDER_BOTTOM,

      ConversionConstant.BORDER_LEFT_COLOR, ConversionConstant.BORDER_RIGHT_COLOR, ConversionConstant.BORDER_TOP_COLOR,
      ConversionConstant.BORDER_BOTTOM_COLOR,
      ConversionConstant.BORDER_LEFT_STYLE, ConversionConstant.BORDER_RIGHT_STYLE, ConversionConstant.BORDER_TOP_STYLE,
      ConversionConstant.BORDER_BOTTOM_STYLE,
      ConversionConstant.STYLE_UNLOCKED, ConversionConstant.STYLE_HIDDEN,

      ConversionConstant.FORMAT_FONTCOLOR, ConversionConstant.STRIKTHROUGH, ConversionConstant.INDENT,
      ConversionConstant.STYLE_DXFID};

  private static final String PREFIX_COLOR = "#";

  // this works as a place holder for null attribute when computing style hash,
  // so this value should be a unique code that no other attribute can have a equal hash,
  // provided value is the hash code of java string "not-even-a-name", which we believe no other
  // style attribute can happen to be equal
  private static final int PLACE_HOLDER = 1737289872;

  private static final int NONE_COLOR = -1;

  private static final int TRANSPARENT_COLOR = -0xFF;
  
  private static final int STYLE_PRESERVE_INDEX;

  public static HashMap<String, Integer> attrsName2IndexMap;

  // store the index of 8 color attributes in the attsNameArray
  public static Set<Integer> colorAttrsIndexSet;

  static
  {
    // init attrsName2IndexMap
    int preserveIndex = -1;
    
    attrsName2IndexMap = new HashMap<String, Integer>();
    int length = attsNameArray.length;
    for (int i = 0; i < length; i++)
    {
      attrsName2IndexMap.put(attsNameArray[i], i);
      
      if (ConversionConstant.STYLE_PRESERVE.equals(attsNameArray[i]))
      {
        preserveIndex = i;
      }
    }
    STYLE_PRESERVE_INDEX = preserveIndex;
    
    // init colorAttrsIndexSet
    colorAttrsIndexSet = new HashSet<Integer>();
    try
    {
      colorAttrsIndexSet.add(attrsName2IndexMap.get(ConversionConstant.BACKGROUND_COLOR));
      colorAttrsIndexSet.add(attrsName2IndexMap.get(ConversionConstant.COLOR));
      colorAttrsIndexSet.add(attrsName2IndexMap.get(ConversionConstant.BORDER_LEFT_COLOR));
      colorAttrsIndexSet.add(attrsName2IndexMap.get(ConversionConstant.BORDER_RIGHT_COLOR));
      colorAttrsIndexSet.add(attrsName2IndexMap.get(ConversionConstant.BORDER_TOP_COLOR));
      colorAttrsIndexSet.add(attrsName2IndexMap.get(ConversionConstant.BORDER_BOTTOM_COLOR));
    }
    catch (Exception e)
    {
      LOG.log(Level.WARNING, "init styleObject colorAttrsIndexSet error" + e);
    }
  }

  // use Jackson API to benefit serialize performance
  private SerializableString serializedId;

  // store the attributes of this style
  private List<Object> attrsArray;

  private int hashCode;

  // the count of this style been referenced
  private int refCount;

  private int attrCount;

  public StyleObject()
  {
    init();
  }

  public StyleObject(StyleObject style)
  {
    init();
    if (null == style)
      return;
    List<Object> attrs = style.getAttts();
    int size = attrs.size();
    for (int i = 0; i < size; i++)
    {
      Object attr = attrs.get(i);
      if (null != attr)
        this.setAttr(i, attr);
    }
    this.attrCount = style.getAttrCount();
  }

  public StyleObject(JSONObject style)
  {
    init();
    loadFromJson(style);
  }

  /**
   * Construct this StyleObject from JSON, reading from the JsonParser provided.
   * 
   * @param action
   * @param jp
   * @throws IOException
   * @throws JsonParseException
   */
  public void loadFromJSON(Actions action, JsonParser jp) throws JsonParseException, IOException
  {
    ++attrCount;

    switch (action)
      {
    	// protect cell styles
      	case CONTENT_STYLE_HIDDEN :
      		setAttr(ConversionConstant.STYLE_HIDDEN, jp.getBooleanValue());
          break;
        case CONTENT_STYLE_UNLOCKED :
        	setAttr(ConversionConstant.STYLE_UNLOCKED, jp.getBooleanValue());
          break;
        // basic styles
        case CONTENT_STYLE_ALIGN :
          setAttr(ConversionConstant.TEXT_ALIGN, jp.getText());
          break;
        case CONTENT_STYLE_VALIGN :
	      setAttr(ConversionConstant.VERTICAL_ALIGN, jp.getText());
	      break;
        case CONTENT_STYLE_DIRECTION :
          setAttr(ConversionConstant.DIRECTION, jp.getText());
          break;
        case CONTENT_STYLE_INDENT :
          setAttr(ConversionConstant.INDENT, jp.getIntValue());
          break;
        case CONTENT_STYLE_WRAP :
          setAttr(ConversionConstant.WRAPTEXT, jp.getBooleanValue());
          break;
        case CONTENT_STYLE_BGC :
          setAttr(ConversionConstant.BACKGROUND_COLOR, jp.getText());
          break;
        case CONTENT_STYLE_PRESERVE :
          if(jp.getCurrentToken() == JsonToken.VALUE_STRING)
            setAttr(ConversionConstant.STYLE_PRESERVE, jp.getText());
          else
            setAttr(ConversionConstant.STYLE_PRESERVE, String.valueOf(jp.getBooleanValue()));
          break;
        case CONTENT_STYLE_DXFID :
            setAttr(ConversionConstant.STYLE_DXFID, jp.getIntValue());
        	break;
        // border colors
        case CONTENT_STYLE_BTC :
          setAttr(ConversionConstant.BORDER_TOP_COLOR, jp.getText());
          break;
        case CONTENT_STYLE_BRC :
          setAttr(ConversionConstant.BORDER_RIGHT_COLOR, jp.getText());
          break;
        case CONTENT_STYLE_BBC :
          setAttr(ConversionConstant.BORDER_BOTTOM_COLOR, jp.getText());
          break;
        case CONTENT_STYLE_BLC :
          setAttr(ConversionConstant.BORDER_LEFT_COLOR, jp.getText());
          break;
        // border STYLE
        case CONTENT_STYLE_BTS :
          setAttr(ConversionConstant.BORDER_TOP_STYLE, jp.getText());
          break;
        case CONTENT_STYLE_BRS :
          setAttr(ConversionConstant.BORDER_RIGHT_STYLE, jp.getText());
          break;
        case CONTENT_STYLE_BBS :
          setAttr(ConversionConstant.BORDER_BOTTOM_STYLE, jp.getText());
          break;
        case CONTENT_STYLE_BLS :
          setAttr(ConversionConstant.BORDER_LEFT_STYLE, jp.getText());
          break;
        // border width
        case CONTENT_STYLE_BTW :
          setAttr(ConversionConstant.BORDER_TOP, jp.getText());
          break;
        case CONTENT_STYLE_BRW :
          setAttr(ConversionConstant.BORDER_RIGHT, jp.getText());
          break;
        case CONTENT_STYLE_BBW :
          setAttr(ConversionConstant.BORDER_BOTTOM, jp.getText());
          break;
        case CONTENT_STYLE_BLW :
          setAttr(ConversionConstant.BORDER_LEFT, jp.getText());
          break;
        // formats
        case CONTENT_STYLE_FM_CAT :
          setAttr(ConversionConstant.FORMATCATEGORY, jp.getText());
          break;
        case CONTENT_STYLE_FM_CODE :
          setAttr(ConversionConstant.FORMATCODE, jp.getText());
          break;
        case CONTENT_STYLE_FM_COLOR :
          setAttr(ConversionConstant.FORMAT_FONTCOLOR, jp.getText());
          break;
        case CONTENT_STYLE_FM_CUR :
          setAttr(ConversionConstant.FORMATCURRENCY, jp.getText());
          break;
        // font
        case CONTENT_STYLE_FONT_BOLD :
          setAttr(ConversionConstant.BOLD, jp.getBooleanValue());
          break;
        case CONTENT_STYLE_FONT_COLOR :
          setAttr(ConversionConstant.COLOR, jp.getText());
          break;
        case CONTENT_STYLE_FONT_ITALIC :
          setAttr(ConversionConstant.ITALIC, jp.getBooleanValue());
          break;
        case CONTENT_STYLE_FONT_NAME :
          setAttr(ConversionConstant.FONTNAME, jp.getText());
          break;
        case CONTENT_STYLE_FONT_SIZE :
          JsonToken jt = jp.getCurrentToken();
          if (jt == JsonToken.VALUE_NUMBER_INT)
          {
            setAttr(ConversionConstant.SIZE, jp.getIntValue());
          }
          else
          {
            setAttr(ConversionConstant.SIZE, jp.getFloatValue());
          }
          break;
        case CONTENT_STYLE_FONT_ST :
          setAttr(ConversionConstant.STRIKTHROUGH, jp.getBooleanValue());
          break;
        case CONTENT_STYLE_FONT_UL :
          setAttr(ConversionConstant.UNDERLINE, jp.getBooleanValue());
          break;
        case NO_ACTION :
          --attrCount;
          break;
        default:
          // not interested, but should not be here.
          --attrCount;
          LOG.log(Level.WARNING, "Unexpected deserialize action {0} in loadFromJSON.", action);
          return;
      }

  }

  public List<Object> getAttts()
  {
    return this.attrsArray;
  }

  public int getAttrCount()
  {
    return this.attrCount;
  }

  public Object getAttribute(String name)
  {
    int i = getAttrIndex(name);
    if (i < 0 || i >= attrsArray.size())
    {
      return null;
    }
    else
    {
      Object o = attrsArray.get(i);

      if (isColorAttr(i) && o != null)
      {
        return transInt2HexStr((Integer) o);
      }
      return o;
    }
  }

  public boolean isColorAttr(int index)
  {
    return colorAttrsIndexSet.contains(index);
  }

  public boolean isPreserveAttr(int index)
  {
    return STYLE_PRESERVE_INDEX == index;
  }
  public boolean isEmpty()
  {
    int size = this.attrsArray.size();
    if (0 == size)
      return true;
    for (int i = 0; i < size; i++)
    {
      if (this.attrsArray.get(i) != null)
        return false;
    }
    return true;
  }

  public void removeDefaultAttrs(StyleObject defaultSytle)
  {
    List<Object> defaultAttrs = defaultSytle.getAttts();
    int size = this.attrsArray.size();
    for (int i = 0; i < size; i++)
    {
      Object attr = this.attrsArray.get(i);
      Object defaultAttr = ModelHelper.safeGetList(defaultAttrs, i);
      if (null != attr)
      {
        // defaultAttr gets from JSON so always is int or float
        if (defaultAttr instanceof Number)
        {
          if (defaultAttr instanceof Integer)
          {
            if (((Number) attr).longValue() == ((Number) defaultAttr).longValue())
            {
              this.attrsArray.set(i, null);
              this.attrCount--;
            }
            // else not equal
          }
          else if (attr instanceof Float)
          {
            if (NumberUtils.compare(((Number) attr).doubleValue(), ((Number) defaultAttr).doubleValue()) == 0)
            {
              this.attrsArray.set(i, null);
              this.attrCount--;
            }
            // else not equal
          }
          // else... no other else's if defaultAttr is number
        }
        else if (attr.equals(defaultAttr))
        {
          this.attrsArray.set(i, null);
          this.attrCount--;
        }
      }
    }
    for (int i = size - 1; i >= 0; i--)
    {
      if (this.attrsArray.get(i) == null)
        this.attrsArray.remove(i);
      else
        break;
    }
  }

  public void changeStyle(StyleObject delta)
  {
    List<Object> deltaAttrs = delta.getAttts();
    int deltaSize = deltaAttrs.size();
    int curSize = this.attrsArray.size();
    for (int i = 0; i < deltaSize; i++)
    {
      Object attr = deltaAttrs.get(i);
      if (null != attr)
      {
        if (i >= curSize || null == this.attrsArray.get(i))
          this.attrCount++;
        this.setAttr(i, attr);
      }
    }
    this.hashCode = 0;
  }

  public int hashCode()
  {
    if (this.hashCode != 0)
      return this.hashCode;
    HashCodeBuilder hcBuilder = new HashCodeBuilder();
    int size = this.attrsArray.size();
    for (int i = 0; i < size; i++)
    {
      Object attr = this.attrsArray.get(i);
      if (null == attr)
        attr = PLACE_HOLDER;
      hcBuilder.append(attr);
    }
    this.hashCode = hcBuilder.toHashCode();
    return this.hashCode;
  }

  public boolean equals(StyleObject style)
  {
    if (null == style)
      return false;
    return this.hashCode() == style.hashCode();
  }

  public int getRefCount()
  {
    return this.refCount;
  }

  public void setRefCount(int num)
  {
    this.refCount = num;
  }

  /**
   * Get serialized id for this StyleObject.
   * 
   * @param convertor
   *          if provided, generate new ID and return, if set to null, return serializedId directly
   * @return
   */
  public SerializableString getSerializedId(ModelHelper.SerializableStringIdConvertor convertor)
  {
    if (serializedId != null)
    {
      return serializedId;
    }
    else
    {
      if (convertor != null)
      {
        serializedId = convertor.generateNextStyleId();
        return serializedId;
      }
      else
      {
        return null;
      }
    }
  }

  public void setSerializedId(SerializableString serializedId)
  {
    this.serializedId = serializedId;
  }
  
  /**
   * @return true if "preserved" flag is exist
   */
  public boolean isPreserved()
  {
    return null != ModelHelper.safeGetList(attrsArray, STYLE_PRESERVE_INDEX);
  }

  private void init()
  {
    this.attrsArray = new ArrayList<Object>();
    this.hashCode = 0;
    this.refCount = 0;
    this.attrCount = 0;
  }

  /**
   * set value for name, transform name to index, if value is color{#ffffff} preprocessing it to integer
   * 
   * @param name
   * @param value
   */
  private void setAttr(String name, Object value)
  {
    int index = this.getAttrIndex(name);
    if (index >= 0)
    {
      if (this.isColorAttr(index) && null != value)
      {
        value = transHexStr2Int(value.toString());
      } else if(this.isPreserveAttr(index) && null != value)
      {
        value = String.valueOf(value);
      }
      this.setAttr(index, value);
    }
  }

  /**
   * set the value at index in attrsArray
   * 
   * @param index
   *          :
   * @param value
   *          : the actual value need to set
   */
  private void setAttr(int index, Object value)
  {
    int curLength = this.attrsArray.size();
    if (index >= curLength)
    {
      for (int i = curLength; i <= index; i++)
        this.attrsArray.add(null);
    }
    this.attrsArray.set(index, value);
  }

  private int getAttrIndex(String name)
  {
    Integer i = attrsName2IndexMap.get(name);
    if (i == null)
    {
      LOG.log(Level.WARNING, "no such style attribute {0}.", name);
      return -1;
    }

    return i;
  }

  /**
   * transform hex string into integer
   * 
   * @param value
   *          : the value of the color set
   * @return: if the string is empty, return -1, if the string is "transparent", return -0xff.
   */
  public static int transHexStr2Int(String value)
  {
    if (value.equals("transparent"))
    {
      return TRANSPARENT_COLOR;
    }
    if (value.startsWith(PREFIX_COLOR))
      value = value.substring(1);
    if (value.length() == 0)
      return NONE_COLOR;
    return Integer.parseInt(value, 16);
  }

  /**
   * transform integer into hex with
   * 
   * @param value
   * @return
   */
  public static String transInt2HexStr(int value)
  {
    if (value == NONE_COLOR)
      return "";
    if (value == TRANSPARENT_COLOR)
    {
      return "transparent";
    }
    // if(value == 0) return PREFIX_COLOR + "000000";
    String hexStr = Integer.toHexString(value);
    int length = hexStr.length();
    // the standard length of RGB color string is 6
    int padding = 6 - length;
    String paddingStr = null;
    switch (padding)
      {
        case 1 :
          paddingStr = "0";
          break;
        case 2 :
          paddingStr = "00";
          break;
        case 3 :
          paddingStr = "000";
          break;
        case 4 :
          paddingStr = "0000";
          break;
        case 5 :
          paddingStr = "00000";
          break;
        case 6 :
          paddingStr = "000000";
          break;
      }
    if (null != paddingStr)
      hexStr = paddingStr + hexStr;
    return PREFIX_COLOR + hexStr;
  }

  /**
   * clone all the attributes in the given style json to this styleObject
   * 
   * @param style
   */
  public void loadFromJson(JSONObject style)
  {
    if (null == style)
      return;
    Iterator<?> iter = style.entrySet().iterator();
    while (iter.hasNext())
    {
      Map.Entry<String, ?> entry = (Map.Entry<String, ?>) iter.next();
      String key = entry.getKey();
      Object value = entry.getValue();
      if (value instanceof JSONObject)
      {
        JSONObject subset = (JSONObject) entry.getValue();
        Iterator<?> subIter = subset.entrySet().iterator();
        while (subIter.hasNext())
        {
          Map.Entry<String, ?> subEntry = (Map.Entry<String, ?>) subIter.next();
          this.setAttr(subEntry.getKey(), subEntry.getValue());
          this.attrCount++;
        }
      }
      else
      {
        this.setAttr(key, value);
        this.attrCount++;
      }
    }
  }
}
