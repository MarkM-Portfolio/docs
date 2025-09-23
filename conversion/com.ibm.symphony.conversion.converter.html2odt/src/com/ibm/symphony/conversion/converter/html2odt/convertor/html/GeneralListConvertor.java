/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

package com.ibm.symphony.conversion.converter.html2odt.convertor.html;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.OdfFileDom;
import org.odftoolkit.odfdom.doc.OdfDocument;
import org.odftoolkit.odfdom.doc.text.OdfTextListStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextOutlineLevelStyle;
import org.odftoolkit.odfdom.doc.text.OdfTextOutlineStyle;
import org.odftoolkit.odfdom.dom.element.style.StyleListLevelLabelAlignmentElement;
import org.odftoolkit.odfdom.dom.element.style.StyleListLevelPropertiesElement;
import org.odftoolkit.odfdom.dom.element.text.TextListElement;
import org.odftoolkit.odfdom.dom.element.text.TextListItemElement;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleElementBase;
import org.odftoolkit.odfdom.dom.element.text.TextListLevelStyleNumberElement;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.ibm.json.java.JSONObject;
import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.common.CSSGroupStylesUtil;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.ListStyleUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.HtmlCSSConstants;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.OdfDomUtil;

public abstract class GeneralListConvertor extends GeneralXMLConvertor
{
  private static Logger log = Logger.getLogger(GeneralListConvertor.class.getName());

  static final Pattern numFormatPattern = Pattern.compile("([1IiAa])");
  static final Pattern outlineStyleNamePattern = Pattern.compile("Outline_\\d+");
  static final Pattern listStyleNamePattern = Pattern.compile("lst-([^_]+)_(\\d+)");
  static final Pattern concordListStyleNamePattern = Pattern.compile("lst-([A-Z]{4})(-(\\w+))?");
  static final Pattern concordOutlineNamePattern = Pattern.compile("lst-[Oo]utline.*");

  protected ListStyle.Type[] defaultListType;


  GeneralListConvertor(ListStyle.Type[] defaultListType)
  {
    this.defaultListType = defaultListType;
  }
  
  public static class ListStyle
  {
    String id;
    
    public static class Type 
    {
      public Type(String format, int showLevel)
      {
        this(format);
        this.showLevel = showLevel;
      }
      public Type(String format)
      {
        this.format = format;
      }
      public Type()
      {
        this("lst-n");
      }
      
      String format;
      int showLevel = 1;
      
      boolean isConcordListStyle()
      {
        return ListStyleUtil.isConcordListStyle(format);
      }
      
      boolean isNumbering()
      {
        JSONObject listMap = ListStyleUtil.getListMap();
        
        JSONObject listStyle = (JSONObject) listMap.get(format);
        if( listStyle != null)
        {
          return ((Long) listStyle.get("Type")).equals(1L);
        }
        else
        {
          return ! format.startsWith("\\") && !format.startsWith("url") ;
        }
      }
    }
    
    public ListStyle(Type type)
    {
      this.defaultType = type;
    }
    
    
    String preservedStyleName = null;
    
    boolean isContinue = false;
    
    boolean isConsecutive = false;
    
    boolean isConcordCreatedStyle = false;
    
    boolean isLeftAlignOutline = false;
    
    String concordListStyleName = null;
    
    int[] start = {1,1,1,1,1,1,1,1,1,1};
    
    Type[] type;
    
    private Type defaultType;
   
    private void createODFStyle(ConversionContext context, OdfTextListStyle odfListStyle)
    {
      OdfFileDom doc = (OdfFileDom) odfListStyle.getOwnerDocument();
      JSONObject listMap = ListStyleUtil.getListMap();
      for( int i=0;i< type.length && i<10 ;i++ )
      {
        try
        {
          if(! ListStyleUtil.isConcordListStyle( type[i].format ) )
          {
            //something wrong. change list type to make the parser pass.            
            type[i] = defaultType;
          }
          TextListLevelStyleElementBase level = ListStyleUtil.generateConcordListStyleLevel( doc , type[i].format, i+1);
          odfListStyle.appendChild(level);
          StyleListLevelPropertiesElement levelProperties = doc.newOdfElement(StyleListLevelPropertiesElement.class);
          levelProperties.setTextListLevelPositionAndSpaceModeAttribute("label-alignment");
          level.appendChild(levelProperties);
          StyleListLevelLabelAlignmentElement alignment = doc.newOdfElement(StyleListLevelLabelAlignmentElement.class);
          alignment.setFoMarginLeftAttribute(isLeftAlignOutline ? ListStyleUtil.defaultListItemMarginLeftLA[i]: ListStyleUtil.defaultListItemMarginLeft[i]);
          alignment.setFoTextIndentAttribute(isLeftAlignOutline ? ListStyleUtil.defaultListItemTextIndentLA[i]: ListStyleUtil.defaultListItemTextIndent);
          if(!isLeftAlignOutline)
            alignment.setTextListTabStopPositionAttribute(ListStyleUtil.defaultListItemMarginLeft[0]);
          alignment.setTextLabelFollowedByAttribute("listtab");
          levelProperties.appendChild(alignment);
          
          if( type[i].isNumbering() )
          {
            TextListLevelStyleNumberElement number = (TextListLevelStyleNumberElement) level;
            number.setTextDisplayLevelsAttribute( type[i].showLevel );
            number.setTextStartValueAttribute( start[i]);
          }          
        }
        catch (Exception e)
        {
          e.printStackTrace();
        }
        
      }
    }
    
    private void updateODFStyle(ConversionContext context, OdfTextListStyle odfListStyle, boolean backup)
    {
      OdfFileDom doc = (OdfFileDom) odfListStyle.getOwnerDocument();
      JSONObject listMap = ListStyleUtil.getListMap();
      for( int i=0;i< type.length && i<10 ;i++ )
      {
        try
        {
          TextListLevelStyleElementBase level = odfListStyle.getLevel(i + 1);
          if( type[i].isConcordListStyle())
          {
            if( backup )
            {
              backupODFListStyle(context, odfListStyle, preservedStyleName);
            }
            
            TextListLevelStyleElementBase newLevel = ListStyleUtil.generateConcordListStyleLevel( doc , type[i].format, i+1);
            // copy children
            Node child = level.getFirstChild();
            while( child != null)
            {
              newLevel.appendChild( OdfDomUtil.cloneNode(doc, child, true) );
              child = child.getNextSibling();
            }
            odfListStyle.replaceChild(newLevel, level);
            level = newLevel;
          }
          else
          {
            // will preserve.
          }          
          
          if( type[i].isNumbering() )
          {
            TextListLevelStyleNumberElement number = (TextListLevelStyleNumberElement) level;
            number.setTextDisplayLevelsAttribute( type[i].showLevel );
            number.setTextStartValueAttribute( start[i]);
          }          
        }
        catch (Exception e)
        {
        }
        
      }
      //defect 8989, remove consecutive attribute because the ibm docs doesn't support it.
      odfListStyle.removeAttribute(ODFConstants.TEXT_CONSECUTIVE_NUMBERING);
      //8989 end.
    }
    
    //backup the list style before update
    private static void backupODFListStyle(ConversionContext context, OdfTextListStyle style, String name  )
    {
      Map<String, OdfElement> map = getOdfTextListStyleMap(context);
      String keyName = "bakup" + name + "bakup";
      if(! map.containsKey(keyName));
      {
        OdfTextListStyle clone = (OdfTextListStyle) style.cloneNode(true);
        map.put( keyName , clone);
      }      
    }
    
    private static OdfTextListStyle restoreODFListStyle(ConversionContext context, String name  )
    {
      Map<String, OdfElement> map = getOdfTextListStyleMap(context);
      return (OdfTextListStyle) map.get( "bakup" + name + "bakup");
    }
    
    private void updateOutlineStyle(OdfTextOutlineStyle outlineStyle)
    {
      JSONObject listMap = ListStyleUtil.getListMap();
      for( int i=0;i< type.length && i<10 ;i++ )
      {
        try
        {
          OdfTextOutlineLevelStyle level = outlineStyle.getLevel(i + 1);
          if( type[i].isConcordListStyle())
          {
            JSONObject concordStyle = (JSONObject) listMap.get(type[i].format);
            level.setStyleNumFormatAttribute( (String) concordStyle.get("Num-Format")  );    
            
            String prefix = (String) concordStyle.get("Prefix");
            if( prefix != null)
              level.setStyleNumPrefixAttribute(prefix);
            
            
            String suffix = (String) concordStyle.get("Suffix");
            if( suffix != null)
              level.setStyleNumSuffixAttribute(suffix);
          }
          else
          {
            // will preserve.
          }          
          
          if( type[i].isNumbering() )
          {
            level.setTextDisplayLevelsAttribute( type[i].showLevel );
            level.setTextStartValueAttribute( start[i]);
          }          
        }
        catch (Exception e)
        {
        }
        
      }
      //defect 8989, remove consecutive attribute because the ibm docs doesn't support it.
      outlineStyle.removeAttribute(ODFConstants.TEXT_CONSECUTIVE_NUMBERING);
      //8989 end.
    }
    
    
    public OdfElement generateODFStyle(ConversionContext context,OdfFileDom fileDom, String styleType) throws Exception
    {
      Map<String, OdfElement> map = getOdfTextListStyleMap(context);
      
      String styleName;
      if( isConcordCreatedStyle )
      {
        styleName = concordListStyleName;
      }
      else
      {
        styleName = preservedStyleName;
      }
      OdfElement odfListStyle = map.get(styleName);
      if( odfListStyle != null)
        return odfListStyle;
      
      if( "Outline".equals(styleName) )
      {
        //create style with outline Style
        OdfTextOutlineStyle outline = fileDom.getOdfDocument().getStylesDom().getOfficeStyles().getOutlineStyle();
        updateOutlineStyle(outline);
        map.put(styleName,  outline);

        return outline;
        
      }
      
      OdfElement styles;
      if( "autoStyles".equals( styleType ) )
        styles = fileDom.getAutomaticStyles();
      else
        styles = fileDom.getOfficeStyles();
      
      if( isConcordCreatedStyle )
      {
        //generate new style
        if( preservedStyleName != null )
        {
          //copy from an exist style; 
          //find from the backup map, if not found, find it from the odf.
          OdfTextListStyle oldListStyle = restoreODFListStyle(context, preservedStyleName); 
            
          if ( oldListStyle == null)  
            oldListStyle = CSSUtil.getOldListStyle(context, preservedStyleName);
          
          if( oldListStyle != null )
          {
            OdfTextListStyle textListStyle = (OdfTextListStyle) OdfDomUtil.cloneNode(fileDom, oldListStyle, true);
            textListStyle.setStyleNameAttribute( styleName + (int)( Math.random() * 100) );
            styles.appendChild(textListStyle);
            updateODFStyle(context, textListStyle, false);
            odfListStyle = textListStyle;
          }
          
        }

        if( odfListStyle == null )
        {
          OdfTextListStyle textListStyle = fileDom.newOdfElement( OdfTextListStyle.class );          
          styles.appendChild(textListStyle);          
          textListStyle.setStyleNameAttribute( styleName + (int)( Math.random() * 100) );
          createODFStyle(context, textListStyle);
          odfListStyle = textListStyle;

        }
      }
      else
      {
        odfListStyle = CSSUtil.getOldListStyle(context, preservedStyleName);
        if( odfListStyle != null)
        {
          updateODFStyle(context, (OdfTextListStyle) odfListStyle, true);
        }
        else
        {
          //this shouldn't happen, 
          log.info("Waring! " +preservedStyleName + " is not found from the odf. id:" + id);

          OdfTextListStyle textListStyle = fileDom.newOdfElement( OdfTextListStyle.class );
          styles.appendChild(textListStyle);
          textListStyle.setStyleNameAttribute( "ERR" + (int)( Math.random() * 100) );

          createODFStyle(context, textListStyle);
          odfListStyle = textListStyle;

        }
      }
      map.put(styleName,  odfListStyle);

      return odfListStyle;
    }
    

  }
  
  public static Map<String, OdfElement> getOdfTextListStyleMap(ConversionContext context)
  {
    Map<String, OdfElement> map = (Map<String, OdfElement>) context.get( "OdfTextListStyleMap" );
    if( map == null)
    {
      map = new HashMap<String, OdfElement>();
      context.put( "OdfTextListStyleMap", map );
    }
    return map;
  }

  private static void parseListStyleName(String className, ListStyle listStyle)
  {
    if( className != null )
    {
      String[] names = className.split(" ");
      for(String name: names)
      {
        if( "continue".equals(name) )
        {
          listStyle.isContinue = true;
        }
        else if ( "consecutive".equals(name))
        {
          listStyle.isConsecutive = true;
        }
        else if("lst-outline-number".equals(name))
        {
          listStyle.isConcordCreatedStyle = true;
          listStyle.concordListStyleName = name.substring(4);
          listStyle.preservedStyleName = null;
          listStyle.isLeftAlignOutline = true;
        }
        else 
        {
          Matcher m = concordListStyleNamePattern.matcher(name);
          if( m.matches() ) 
          {
            listStyle.isConcordCreatedStyle = true;
            if(m.groupCount() == 3)
            {
              listStyle.preservedStyleName = m.group(3);
            }
            else
            {
              listStyle.preservedStyleName = null;
            }
            listStyle.concordListStyleName = m.group(1);
          }
          else if( concordOutlineNamePattern.matcher(name).matches() )
          {
            listStyle.isConcordCreatedStyle = true;
            listStyle.concordListStyleName = name.substring(4);
            listStyle.preservedStyleName = null;
          }
          else
          {
            if( listStyle.concordListStyleName != null )
              continue;
            if( name.startsWith("lst-") )
            {            
              listStyle.isConcordCreatedStyle = false;
              listStyle.preservedStyleName = name.substring(4);
              listStyle.concordListStyleName = null;
            }
          }
        }
      }
      
    }
  }
  
  private static void parseListStyleFormat(Element htmlElement, ListStyle listStyle, ListStyle.Type[] defaultListType)
  {
    String type = htmlElement.getAttribute("types");
    String start = htmlElement.getAttribute("starts");
    listStyle.id = htmlElement.getAttribute("id");
    
    if( type != null && type.length() > 0)
    {
      String[] typeArray = type.split(":");
      listStyle.type = new ListStyle.Type[10];

      for( int i=0;i< typeArray.length;i++)
      {
        int pos = typeArray[i].lastIndexOf(',');
        if( pos == -1)
          continue;
        
        listStyle.type[i] = new ListStyle.Type( typeArray[i].substring(0,pos) ); 
        if( pos + 1 < typeArray[i].length() )
        {
          try
          {
            listStyle.type[i].showLevel = Integer.parseInt( typeArray[i].substring(pos + 1) );
          }
          catch(NumberFormatException ne)
          {          
            ne.printStackTrace();
          }
        }
      }
    }
    else
    {
      listStyle.type = defaultListType;
    }
    if( start != null && start.length() > 0)
    {
      String[] startArray = start.split(",", 10);
      for(int i=0;i<startArray.length;i++)
      {
        if( startArray[i].length() > 0 )
        {
          try
          {
            listStyle.start[i] = Integer.parseInt( startArray[i] );
          }
          catch(NumberFormatException ne)
          {            
          }
        }
      }
    }
  }
  
  public static ListStyle parseListStyle(ConversionContext context, Element htmlElement, String className, ListStyle.Type[] defaultListType)
  {
    ListStyle style = new ListStyle(defaultListType[0]);
    parseListStyleName(className, style);
    parseListStyleFormat(htmlElement, style, defaultListType);
    
    return style;
  }

  public static ListStyle parseListStyle(ConversionContext context, Element htmlElement, ListStyle.Type[] defaultListType)
  {
    String className = htmlElement.getAttribute(HtmlCSSConstants.CLASS);
    return parseListStyle(context, htmlElement, className, defaultListType);
  }
  
  protected void convertAttributes(ConversionContext context, Element htmlElement, OdfElement odfElement)
  {

    distributeFontStyle(htmlElement);

    if (isOdfSubList(odfElement.getParentNode()))
    {
      return;
    }
    OdfDocument odfDoc = (OdfDocument) context.getTarget();
    TextListElement list = (TextListElement) odfElement;
    list.removeAttribute(ODFConstants.TEXT_CONTINUE_LIST);
    list.removeAttribute(ODFConstants.TEXT_CONTINUE_NUMBERING);
    list.removeAttribute(ODFConstants.TEXT_CONSECUTIVE_NUMBERING);

    ListStyle listStyle = parseListStyle(context, htmlElement, this.defaultListType);
    
    if( listStyle.isContinue )
      list.setTextContinueNumberingAttribute(true);
    
    if( listStyle.isConsecutive )
    {
      list.setOdfAttributeValue(ConvertUtil.getOdfName(ODFConstants.TEXT_CONSECUTIVE_NUMBERING), "true");
    }
    
    try
    {
      
      OdfElement style = listStyle.generateODFStyle(context,XMLConvertorUtil.getCurrentFileDom(context), "autoStyles");
      
      
      list.setTextStyleNameAttribute(style.getAttribute(ODFConstants.STYLE_NAME));
    }
    catch (Exception e)
    {
      XMLConvertorUtil.addWarning(context, htmlElement, Constants.WARNING_ATTRIBUTE, e);
      return;
    }
    
  }

  private boolean isOdfSubList(Node parent)
  {
    return TextListItemElement.ELEMENT_NAME.equals(parent.getNamespaceURI(), parent.getLocalName());
  }

  public void distributeFontStyle(Element htmlElement)
  {
    String nodeStyle = htmlElement.getAttribute("style");
    if(nodeStyle == null || nodeStyle.length()<=0)
      return;

    Map<String, String> fontStyles = getFontStylesMap(nodeStyle);
    if(fontStyles == null || fontStyles.size() == 0)
      return;
    
    NodeList childs = htmlElement.getChildNodes();
    for(int i=0;i<childs.getLength();i++)
    {
      Node child = childs.item(i);
      if(child instanceof Element)
      {
        String childStyle = htmlElement.getAttribute("style");
        if(childStyle == null || childStyle.length()<=0)
          childStyle = ConvertUtil.convertMapToStyle(fontStyles);
        else
        {
          Map<String, String> childStyleMap = new HashMap<String, String>();
          childStyleMap.putAll(fontStyles);
          childStyleMap.putAll(ConvertUtil.buildCSSMap(childStyle));
          childStyle = ConvertUtil.convertMapToStyle(childStyleMap);
        }
        ((Element) child).setAttribute(HtmlCSSConstants.STYLE, childStyle);
      }
    }
  }
  public static Map<String, String> getFontStylesMap(String styleString)
  {
    if(styleString == null || styleString.length() ==0)
      return null;
    
    Map<String, String> styleMap = new HashMap<String, String>();
    
    Map<String, String> styles = ConvertUtil.buildCSSMap(styleString);

    for (Map.Entry<String, String> entry : styles.entrySet())
    {
      if (CSSGroupStylesUtil.getFontStylePropNames().contains(entry.getKey()))
      {
        styleMap.put(entry.getKey(), entry.getValue());
      }
    }
    return styleMap;
  }
}
