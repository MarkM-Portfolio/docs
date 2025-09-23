/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odp.util;

import java.util.Arrays;

import org.odftoolkit.odfdom.OdfElement;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.symphony.conversion.presentation.ODPConvertConstants;

public final class StyleHashKey // implements Comparable<StyleHashKey>
{
  private int hash;       // Hash of flatten styles
  private int attrHash;   // Sum of hashes of each attribute

  /**
   * 
   * @param styleHash - hash of flattened style
   * @param styleAttrHash - sum of hash of attributes
   */
  StyleHashKey(Integer styleHash, Integer styleAttrHash)
  {
    this.hash = styleHash;
    this.attrHash = styleAttrHash;
  }

  /**
   * 
   * @param s flattened style to build key from
   */
  public StyleHashKey(String s)
  {
    this.hash = StyleHashKey.generateStyleHash(s);
    this.attrHash = StyleHashKey.generateStyleAttrHash(s);
  }
 

  @Override
  public boolean equals(Object other)
  {
    try 
    {
    if (this == other)
      return true;
    StyleHashKey that = (StyleHashKey) other;
    return (this.hash == 0 ? that.hash == 0 : this.hash == that.hash)
        && (this.attrHash == 0 ? that.attrHash == 0 : this.attrHash == that.attrHash);
    } catch (Exception e) 
    {
      return false;
    }
  }

  @Override
  public int hashCode()
  {
    return this.hash + this.attrHash;
  }

  public int getStyleHash()
  {
    return hash;
  }

  public void setStyleHash(Integer styleHash)
  {
    this.hash = styleHash;
  }

  public int getStyleAttrHash()
  {
    return attrHash;
  }

  public void setStyleAttrHash(Integer styleAttrHash)
  {
    this.attrHash = styleAttrHash;
  }

  /**
   * 
   * @param s flattened style
   * @return key of flattened hash and sum of attribute hash
   */
  public static StyleHashKey generateKey(String s)
  {
    Integer styleHash = generateStyleHash(s);
    Integer styleAttrHash = generateStyleAttrHash(s);
    return new StyleHashKey(styleHash, styleAttrHash);
  }

  /**
   * takes flattened style, converts to char array, sorts it, and gets the hash of the sorted String
   * @param s flattened style
   * @return Integer value (hash value) of sorted style string
   */
  private static Integer generateStyleHash(String s)
  {
    char [] ch = s.toCharArray();
    Arrays.sort(ch);
    String sortedS = new String(ch);
    return sortedS.hashCode();
  }
  
  /**
   * takes the flattened style, splits it on the semicolon to get attributes and sums the hash of the attributes
   * @param s flattened style
   * @return Integer value of the sum of the flattened hashes
   */
  private static Integer generateStyleAttrHash(String s)
  {
    String[] attrs = s.split(ODPConvertConstants.SYMBOL_SEMICOLON);
    int attrHash = 0;
    for (int i = 0; i < attrs.length; i++)
    {
      attrHash += attrs[i].hashCode();
    }
    return Integer.valueOf(attrHash);
  }
  
  public int compareTo(StyleHashKey that)
  {
    if (this.equals(that))
      return 0;
    if (this.hash < that.hash)
      return -1;
    else if (this.hash > that.hash)
      return 1;
    else if (this.attrHash < that.attrHash)
      return -1;
    else 
      return 1;      
  }
  
  @SuppressWarnings({ "restriction" })
  public static String flattenAttributes(OdfElement style) 
  {
    NamedNodeMap attrs = style.getAttributes();
    for (int i = 0; i < attrs.getLength(); i++)
    {
      Node attr = attrs.item(i);
      if (attr.getNodeValue().equalsIgnoreCase(ODPConvertConstants.PARAGRAPH) || 
          attr.getNodeValue().equalsIgnoreCase(ODPConvertConstants.TEXT) ||
          attr.getNodeValue().equalsIgnoreCase(ODPConvertConstants.HTML_VALUE_GRAPHIC))
      {
        NodeList children = style.getChildNodes();
        if (children == null || children.getLength() == 0)
          return null;
        return flattenAttributes(style, "");
      }
    }      
    return null;
  }
  
  private static String flattenAttributes(Node odfElement, String elementStr)
  {

    NamedNodeMap attrs = odfElement.getAttributes();
    if (attrs != null)
    {
      for (int i = 0; i < attrs.getLength(); i++)
      {
        Node attr = attrs.item(i);
        // We don't want to include the styleName in the flattened attribute because the styles will always have different names,
        // even if there attributes are identical
        if (! attr.getNodeName().equals(ODPConvertConstants.ODF_ATTR_STYLE_NAME))
          elementStr += attr.getNodeName() + ODPConvertConstants.SYMBOL_COLON + attr.getNodeValue() + ODPConvertConstants.SYMBOL_SEMICOLON;
      }
    }

    NodeList nodes = odfElement.getChildNodes();
    int totalNodes = nodes.getLength();
    for (int i = 0; i < totalNodes; i++)
    {
      Node child = nodes.item(i);
      elementStr = flattenAttributes(child, elementStr);
    }
    return elementStr;
  }

  
}
