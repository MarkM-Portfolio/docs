package com.ibm.symphony.conversion.service.common.util;

import org.odftoolkit.odfdom.OdfAttribute;
import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfTextDocument;
import org.odftoolkit.odfdom.doc.office.OdfOfficeAutomaticStyles;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.Text;

import com.ibm.symphony.conversion.service.common.ConvertUtil;

public class OdfElementUtil
{
  static final String ELEMENT_DELIMETER = "|-|";

  static final String ELEMENT_LEVEL_DELIMETER = "|!|";

  static final String ATTRIBUTE_DELIMETER = "|!|";
  
  static final String TEXT_DELIMETER = "|!|";

  static final String ATTRIBUTE_NAME_VALUE_DELIMETER = "::";

  static final String ELEMENT = "ELEMENT::";

  static final String LEVEL = "LEVEL::";
  
  /**
   * Builds a String representing a flattened odfElement Node so it can stored as an HTML attribute
   * 
   * @param odfElement
   *          ODF Element to Flatten
   * @param level
   *          Level of attribute
   * @return String Flattened version of ODF Element Node
   */
  public static String flattenElement(Node node)
  {
    StringBuilder sb = new StringBuilder();
    flattenElement(node, sb, 0);
    return sb.toString();
  }
  
  private static void flattenText(StringBuilder sb, String str)
  {
    int count = str.codePointCount(0, str.length());
    for (int i = 0; i < count; i++)
    {
      sb.append("\\");
      sb.append(String.format("%04x", str.codePointAt(i)));
    }
  }
  
  private static void flattenElement(Node odfElement, StringBuilder builder, int level)
  {
    builder.append(ELEMENT);
    builder.append(odfElement.getNodeName());
    builder.append(ELEMENT_LEVEL_DELIMETER);
    builder.append(LEVEL);
    builder.append(level);
    builder.append(ELEMENT_DELIMETER);
    
    if( odfElement instanceof Text)
    {
      flattenText(builder, odfElement.getNodeValue()) ;     
      builder.append(TEXT_DELIMETER);
    }
    else
    {
      NamedNodeMap attrs = odfElement.getAttributes();
      if (attrs != null)
      {
        int length = attrs.getLength();
        for (int i = 0; i < length; i++)
        {
          Node item = attrs.item(i);
          // Use 2 colons to separate name from value, and the string "|-|" to separate attributes
          // Don't include id as this is not an attribute
          String itemNodeName = item.getNodeName();
          if (!itemNodeName.equals("id"))
          {
            builder.append(itemNodeName);
            builder.append(ATTRIBUTE_NAME_VALUE_DELIMETER);
            builder.append(item.getNodeValue());
            builder.append(ATTRIBUTE_DELIMETER);
          }
        }
      }
  
      Node child = odfElement.getFirstChild();
      if( child != null)
      {  
        level++;
        do
        {
          flattenElement(child, builder, level);
          child = child.getNextSibling();
        }
        while( child != null);
      }
    }
  }
  public static Node unflattenElement(OdfFileDom contentDom, String fe) throws Exception
  {
    return unflattenElement(contentDom, fe, null);
  }
  
  public static Node unflattenElement(OdfFileDom contentDom, String fe, OdfElementListener listener) throws Exception
  {
    try
    {
      Node result =  parseElement( contentDom, new String[]{fe}, listener);
      if ( listener != null)
        listener.onElement(null, result);
      return result;
    }
    catch(Exception e)
    {
      throw e;
    }
  }
  
  
  
  private static Node parseElement(OdfFileDom contentDom, String[] fe, OdfElementListener listener)
  {
    String content = fe[0];
    if( content.startsWith( ELEMENT ))
    {
      int idx = content.indexOf( ELEMENT_LEVEL_DELIMETER );
      if( idx != -1)
      {
        String odfName = content.substring( ELEMENT.length() , idx );
        // parseLevel
        fe[0] = content.substring(idx + ELEMENT_DELIMETER.length() );
        int level = parseLevel(fe);
        
        if( odfName.equals("#text") )
        {          
          // parse text content
          String textValue = parseText( fe );
          return contentDom.createTextNode( textValue );
        }
        else
        {
          OdfElement odfElement = contentDom.createElementNS(ConvertUtil.getOdfName(odfName));
          
          
          // parseAttributes
          parseAttributes( contentDom, odfElement, fe, listener);
          // parseChildren
          
          parseChildren( contentDom, odfElement, level + 1, fe , listener);
          
          return odfElement;

        }
        
      }
      
    }
    throw new RuntimeException("Parse Element error: " + fe[0]);
    
  }
  
  private static int parseLevel(String[] fe)
  {
    String content = fe[0];
    if( content.startsWith(LEVEL) )
    {
      int idx = content.indexOf( ELEMENT_DELIMETER );
      
      if( idx != -1)
      {
        fe[0] = content.substring( idx + ELEMENT_DELIMETER.length());
        String strLevel = content.substring( LEVEL.length(), idx);
        return Integer.parseInt( strLevel );
      }      
    }
    throw new RuntimeException("Parse LEVEL error: " + fe[0]);
  }
  
  private static String parseText(String[] fe)
  {
    int idx = fe[0].indexOf( TEXT_DELIMETER );
    if( idx != -1)
    {
      String textContent = fe[0].substring(0, idx);
      fe[0] = fe[0].substring(idx + TEXT_DELIMETER.length() );
      StringBuilder sb = new StringBuilder();
      int textIndex = 0;
      while( textIndex + 5 <= textContent.length())
      {
        if( textContent.startsWith("\\", textIndex))
        {
          String strVal = textContent.substring(textIndex +1 , textIndex+5);// 4 digs.
          sb.append( (char) Integer.parseInt(strVal, 16) );
          textIndex += 5;
        }
        else
        {
          //error break;
          break;
        }
      }
      return sb.toString();
      
    }
    throw new RuntimeException("Parse text error: " + fe[0]);
  }
  
  private static void parseAttributes(OdfFileDom dom, OdfElement element, String[] fe, OdfElementListener listener)
  {
    int idx = 0;
    
    while(! fe[0].startsWith(ELEMENT, idx) && idx < fe[0].length() )
    { 
      int nextIdx = idx;
      int pos = fe[0].indexOf(ATTRIBUTE_NAME_VALUE_DELIMETER, idx);
      if( pos != -1)
      {
        String attrName = fe[0].substring(idx, pos);
        int posEnd = fe[0].indexOf( ATTRIBUTE_DELIMETER, pos );
        if( posEnd != -1 )
        {
          String value = fe[0].substring(pos + ATTRIBUTE_NAME_VALUE_DELIMETER.length() , posEnd);
          OdfAttribute attr = dom.createAttributeNS( ConvertUtil.getOdfName(attrName) );
          attr.setNodeValue( value );
          element.setAttributeNode(attr);
          if( listener!=null)
            listener.onAttribute(element, attrName, value);
          
          nextIdx = posEnd + ATTRIBUTE_DELIMETER.length();
        }
      }
      
      if( nextIdx != idx)
        idx = nextIdx;
      else
      {
        //error, because nothing changed after one loop.
        throw new RuntimeException("Parse attributes error:" + fe[0] + " idx:" + idx );
      }      
    }
    fe[0] = fe[0].substring(idx);
  }
  
  private static void parseChildren(OdfFileDom contentDom, OdfElement element,  int level, String[] fe, OdfElementListener listener)
  {
    while( fe[0].startsWith(ELEMENT) )
    {
      String content = fe[0];
      int pos = fe[0].indexOf( ELEMENT_LEVEL_DELIMETER );
      if( pos != -1)
      {
        if( fe[0].startsWith( LEVEL + level, pos + ELEMENT_LEVEL_DELIMETER.length() )  )
        {
          //current element is an children of current element, fe[0] should be changed
          Node child = parseElement(contentDom, fe, listener);
          element.appendChild(child);
          if( listener != null)
            listener.onElement(element, child);
        }
        else
        {
          //current element is not a child of above element.
          break;
        }
      }
      
      if( content.equals(fe[0]))
      {
      //error, because nothing changed after one loop.
        throw new RuntimeException("Parse children error:" + fe[0]);
      }
    }
  }
  
  public static void addStyleUserCount(OdfElement element)
  {
    if( element instanceof OdfStylableElement)
    {
      OdfStylableElement stylable = (OdfStylableElement) element;
      String styleName = stylable.getStyleName();
      if(styleName != null && styleName.length() > 0)
      {
        OdfOfficeAutomaticStyles automatic_styles = stylable.getAutomaticStyles();
        OdfStyle style = automatic_styles.getStyle(styleName, stylable.getStyleFamily());
        if( style != null)
        {
          style.addStyleUser(stylable);
        }
        
        Node child = element.getFirstChild();
        
        while (child != null)
        {
          if( child instanceof OdfStylableElement)
          {
            addStyleUserCount((OdfElement) child);
          }
          
          child = child.getNextSibling();         
        }
      }
    }
  }
  
  public static void main(String[] args) throws Exception
  {
    OdfTextDocument odt = OdfTextDocument.newTextDocument();
    
    OdfFileDom dom = odt.getContentDom();
    
    String txt = "ELEMENT::draw:g|!|LEVEL::0|-|draw:style-name::gr2|!|draw:z-index::1|!|text:anchor-type::paragraph|!|ELEMENT::draw:custom-shape|!|LEVEL::1|-|draw:style-name::gr3|!|draw:text-style-name::P1|!|svg:height::1.438cm|!|svg:width::1.689cm|!|svg:x::5.48cm|!|svg:y::3.872cm|!|ELEMENT::text:p|!|LEVEL::2|-|ELEMENT::#text|!|LEVEL::3|-|\0061\0061\0061|!|ELEMENT::draw:enhanced-geometry|!|LEVEL::2|-|draw:enhanced-path::U 10800 10800 10800 10800 0 360 Z N|!|draw:glue-points::10800 0 3163 3163 0 10800 3163 18437 10800 21600 18437 18437 21600 10800 18437 3163|!|draw:text-areas::3163 3163 18437 18437|!|draw:type::ellipse|!|svg:viewBox::0 0 21600 21600|!|ELEMENT::draw:custom-shape|!|LEVEL::1|-|draw:style-name::gr3|!|draw:text-style-name::P1|!|svg:height::1.655cm|!|svg:width::2.797cm|!|svg:x::6.886cm|!|svg:y::5.177cm|!|ELEMENT::text:p|!|LEVEL::2|-|ELEMENT::#text|!|LEVEL::3|-|\0047\0072\006f\0075\0070|!|ELEMENT::text:p|!|LEVEL::2|-|ELEMENT::draw:enhanced-geometry|!|LEVEL::2|-|draw:enhanced-path::M ?f0 0 L 21600 21600 0 21600 Z N|!|draw:glue-points::10800 0 ?f1 10800 0 21600 10800 21600 21600 21600 ?f7 10800|!|draw:modifiers::10800|!|draw:text-areas::?f1 10800 ?f2 18000 ?f3 7200 ?f4 21600|!|draw:type::isosceles-triangle|!|svg:viewBox::0 0 21600 21600|!|ELEMENT::draw:equation|!|LEVEL::3|-|draw:formula::$0 |!|draw:name::f0|!|ELEMENT::draw:equation|!|LEVEL::3|-|draw:formula::$0 /2|!|draw:name::f1|!|ELEMENT::draw:equation|!|LEVEL::3|-|draw:formula::?f1 +10800|!|draw:name::f2|!|ELEMENT::draw:equation|!|LEVEL::3|-|draw:formula::$0 *2/3|!|draw:name::f3|!|ELEMENT::draw:equation|!|LEVEL::3|-|draw:formula::?f3 +7200|!|draw:name::f4|!|ELEMENT::draw:equation|!|LEVEL::3|-|draw:formula::21600-?f0 |!|draw:name::f5|!|ELEMENT::draw:equation|!|LEVEL::3|-|draw:formula::?f5 /2|!|draw:name::f6|!|ELEMENT::draw:equation|!|LEVEL::3|-|draw:formula::21600-?f6 |!|draw:name::f7|!|ELEMENT::draw:handle|!|LEVEL::3|-|draw:handle-position::$0 top|!|draw:handle-range-x-maximum::21600|!|draw:handle-range-x-minimum::0|!|";
    
    Node element = unflattenElement(dom, txt, new OdfElementListener(){

      public void onAttribute(OdfElement element, String name, String value)
      {
        System.out.println( element.getNodeName() + "#" + name + ":" + value );
      }

      public void onElement(OdfElement pagent, Node node)
      {
        // TODO Auto-generated method stub
        
      }
      
    });
    
    System.out.println(element);
  }
}
