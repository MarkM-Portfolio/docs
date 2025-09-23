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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.odftoolkit.odfdom.OdfElement;
import org.odftoolkit.odfdom.doc.style.OdfStyle;
import org.odftoolkit.odfdom.dom.element.OdfStylableElement;
import org.odftoolkit.odfdom.dom.style.OdfStyleFamily;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import com.ibm.symphony.conversion.converter.html2odt.Constants;
import com.ibm.symphony.conversion.converter.html2odt.convertor.css.CSSUtil;
import com.ibm.symphony.conversion.service.common.ConversionContext;
import com.ibm.symphony.conversion.service.common.ConvertUtil;
import com.ibm.symphony.conversion.service.common.ODFConstants;
import com.ibm.symphony.conversion.service.common.indextable.HtmlToOdfIndex;
import com.ibm.symphony.conversion.service.common.util.OdfElementListener;
import com.ibm.symphony.conversion.service.common.util.OdfElementUtil;
import com.ibm.symphony.conversion.service.common.util.StringPool;

public class ShapeConvertor extends GeneralXMLConvertor
{

  static Logger log = Logger.getLogger(ShapeConvertor.class.getName());
  
  protected Map<String,String> getShapeIdMap(ConversionContext context)
  {
    Map<String,String> shapeId = (Map<String,String>) context.get("shapeIdMapping");
    if( shapeId == null)
    {
      shapeId = new HashMap<String,String>();
      context.put("shapeIdMapping", shapeId);
    }
    return shapeId;
  }
  
  protected void doConvertXML(final ConversionContext context, Element htmlElement, OdfElement parent)
  {
    
    final String shapeId = htmlElement.getAttribute("_shapeid");
    String id = htmlElement.getAttribute("id");
    final boolean isNewShape = !id.equals(shapeId);
    HtmlToOdfIndex indexTable = context.getHtmlToOdfIndexTable();
    final List<OdfElement> odfElements = indexTable.getOdfNodes(htmlElement);
    String _type = htmlElement.getAttribute("_type");
    
    if(odfElements == null || odfElements.size() == 0 || "group".equals(_type) )
    {
      String key = htmlElement.getAttribute("_preserve0");
      StringPool pool = (StringPool) context.get("stringPool");
      String flatten = pool.getString(key);
      if( flatten == null)
      {
        log.warning("missing flatten key :" + key);
        return;
      }
      try
      {
        OdfElement odfElement = (OdfElement) OdfElementUtil.unflattenElement(XMLConvertorUtil.getCurrentFileDom(context), flatten, new OdfElementListener(){
          @Override
          public void onAttribute(OdfElement element, String name, String value)
          {
            if( ODFConstants.DRAW_TEXT_STYLE_NAME.equals(name ) )
            {
              if( element instanceof OdfStylableElement )
              {
                OdfStyle style = CSSUtil.getOldStyle(context, value, OdfStyleFamily.Paragraph);
                if (style != null)
                  style.addStyleUser((OdfStylableElement) element);
              }
            }
            else if( ODFConstants.DRAW_ID.equals( name ) )
            {
              if( isNewShape )
              {
                //change the id value;
                String newValue = value + "_" +(int)(1000 * Math.random());
                getShapeIdMap(context).put( shapeId + value,  newValue);
                element.getOdfAttribute( ConvertUtil.getOdfName(name) ).setValue(newValue);
              }
            }
            else if( ODFConstants.DRAW_START_SHAPE.equals(name) || ODFConstants.DRAW_END_SHAPE.equals(name))
            {
              if( isNewShape )
              {
                //use the new id value;
                String newValue = getShapeIdMap(context).get(shapeId + value);
                if( newValue != null)
                  element.getOdfAttribute( ConvertUtil.getOdfName(name) ).setValue(newValue);
              }
            }
          }

          @Override
          public void onElement(OdfElement pagent, Node node)
          {
            
          }
          
        });
        indexTable.addEntryByHtmlNode(htmlElement, odfElement);

        log.info("unflatten the shape successfully");

        if( "group".equals(_type) )
        {
          addAllPicNameToMap(context, odfElement);
        }
        else
        {
          addPicNameToMap(context, odfElement);
        }
//        parent.appendChild(odfElement);
        XMLConvertorUtil.appendChild(context, odfElement, parent);
        
        //adjust style, maybe
        if( odfElements == null)
        {
          adjustShape(context, odfElement );
        }
      }
      catch (Exception e)
      {
        log.log(Level.INFO, e.getMessage(),e);
      }
    }
    else
    {
      OdfElement odfElement = null;
      
      for( int i=0;i< odfElements.size();i++)
      {
        odfElement = odfElements.get(i);
        if( odfElement != null)
          break;
      }
      
      if(odfElement == null)
        return;

      if( "group".equals(_type) )
      {
        addAllPicNameToMap(context, odfElement);
      }
      else
      {
        addPicNameToMap(context, odfElement);
      }
      //remove the parent-child relationship first and then append the child to the new parent to work around odftoolkit loss style bug.
      if(odfElement.getParentNode() != null)
        odfElement = (OdfElement)odfElement.getParentNode().removeChild(odfElement);
//      parent.appendChild(odfElement);
      XMLConvertorUtil.appendChild(context, odfElement, parent);
    }
    
  }
  
  private void adjustShape(ConversionContext context, OdfElement odfElement)
  {
    String anchorType = odfElement.getAttribute(ODFConstants.TEXT_ANCHOR_TYPE);
    if( "page".equals(anchorType) )
    {
      // anchor should not be page after paste.
      odfElement.setAttribute(ODFConstants.TEXT_ANCHOR_TYPE, "paragraph");
    }
    
  }

  public static void addAllPicNameToMap(ConversionContext context, OdfElement odfElement)
  {
    addPicNameToMap(context, odfElement);
    
    Node child = odfElement.getFirstChild();
    
    while( child != null)
    {
      if( child instanceof OdfElement)
      {
        addAllPicNameToMap(context, (OdfElement) child);
      }
      child = child.getNextSibling();
    }
    
  }
  
  public static void addPicNameToMap(ConversionContext context, OdfElement odfElement)
  {
    try
    {
      
      
      Element drawImage = null;
      
      if( odfElement.getNodeName().equals( ODFConstants.DRAW_IMAGE ) )
      {
        drawImage = odfElement;
      }
      
      
      if(drawImage != null)
      {
        String href = drawImage.getAttribute(ODFConstants.XLINK_HREF);
        if(href != null)
        {
          int index = href.lastIndexOf("/");
          HashSet<String> imageSrcSet = (HashSet<String>) context.get(Constants.IMAGESRC_SET);
          imageSrcSet.add(href.substring(index+1));
        }
      }
    }
    catch(Exception e)
    {
      log.log(Level.WARNING, e.getMessage(), e);
    }
    
  }
}
